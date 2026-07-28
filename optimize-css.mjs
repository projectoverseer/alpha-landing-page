/**
 * Purges unused CSS from the production build, then minifies it.
 *
 * Uses the PurgeCSS API directly (not the CLI) because the CLI's config-file
 * loader does a raw `import(path)` that breaks on Windows absolute paths, and
 * because a plain --safelist only matches literal class names. Bootstrap's
 * Dropdown sets `data-bs-popper` at runtime by building the attribute name
 * dynamically (`data-bs-${key}`), so the literal string never appears in the
 * built HTML/JS for PurgeCSS's extractor to find — a plain safelist can't save
 * it, only a greedy regex safelist (API-only) can. Without it, PurgeCSS strips
 * `.dropdown-menu-end[data-bs-popper]` and other popper-attribute rules,
 * silently breaking dropdown alignment only in the shipped/purged build.
 */
import { PurgeCSS } from 'purgecss';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * clean-css 5.6.3 cannot parse `@font-feature-values`. Its parser does not know
 * the nested at-rules inside it (`@styleset`, `@character-variant`), so it reads
 * `@styleset { open-digits` as a property name, discards it as invalid, and
 * hoists what is left — the result being a block that still says
 * `@font-feature-values` and is silently inert:
 *
 *     @font-feature-values "Inter"{round-punctuation:3}@character-variant{curved-one:1}
 *
 * `open-digits` gone, `round-punctuation` no longer inside a @styleset, and
 * `@character-variant` promoted to the top level. It warns while doing this, but
 * warnings do not fail the build, and every `font-variant-alternates` in the
 * stylesheet still parses fine — so the page keeps rendering, just with the
 * chosen alternates quietly switched off. Nothing downstream would have caught
 * it; `check` now asserts the block survives (verify.mjs).
 *
 * Not fixable by option: -O0, -O1 and -O2 all fail identically, because this is
 * the parser and not an optimisation. So the block is lifted out before
 * minification and put back after. It is a handful of lines of static text with
 * no selectors, nothing for a minifier to earn anything on.
 */
function liftFeatureValues(css) {
  const blocks = [];
  const AT = '@font-feature-values';
  let out = '';
  let i = 0;

  for (;;) {
    const start = css.indexOf(AT, i);
    if (start === -1) break;

    const open = css.indexOf('{', start);
    if (open === -1) break;

    // Brace-match to the block's own close. The nested @styleset /
    // @character-variant blocks mean a naive search for the next '}' lands
    // inside, which is the same mistake clean-css makes.
    let depth = 0;
    let end = -1;
    for (let p = open; p < css.length; p++) {
      if (css[p] === '{') depth++;
      else if (css[p] === '}' && --depth === 0) {
        end = p;
        break;
      }
    }
    if (end === -1) break;

    out += css.slice(i, start);
    blocks.push(css.slice(start, end + 1));
    i = end + 1;
  }

  out += css.slice(i);
  return { css: out, blocks };
}

// Whitespace-only squeeze: no reordering, no property rewriting. The content is
// author-controlled and tiny, so this is all the minification it warrants.
const squeeze = (block) =>
  block
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

function minifyPreservingFeatureValues(path) {
  const { css, blocks } = liftFeatureValues(readFileSync(path, 'utf8'));
  writeFileSync(path, css);
  execSync(`cleancss -O2 -o ${path} ${path}`, { stdio: 'inherit' });
  if (blocks.length) {
    const minified = readFileSync(path, 'utf8');
    const text = blocks.map(squeeze).join('');
    // `@charset` is only honoured as the literal first bytes of the file, so the
    // block goes AFTER it, not simply at the front. clean-css emits one on
    // main.css; putting anything before it would silently void the declaration
    // and leave the encoding to be guessed from the referencing document.
    const charset = /^@charset\s+"[^"]*";/.exec(minified);
    writeFileSync(
      path,
      charset
        ? charset[0] + text + minified.slice(charset[0].length)
        : text + minified,
    );
  }
  return blocks.length;
}

const CSS = '_site/css/main.css';

// The Chia sẻ kinh nghiệm hub stylesheet is hand-written for exactly the pages that load
// it (no framework, no dead code), so it skips PurgeCSS — purging it risks
// dropping bare pseudo-element rules (::selection) for zero real savings.
// It still gets minified below.
const KT_CSS = '_site/css/chiasekinhnghiem.css';

// Hub pages load chiasekinhnghiem.css, not main.css — keep them out of the purge
// content so their markup (tables, asides, kt-* hooks) can't retain dead
// main.css rules.
const [{ css }] = await new PurgeCSS().purge({
  css: [CSS],
  content: ['_site/**/*.html', '!_site/chia-se-kinh-nghiem/**', '_site/**/*.js'],
  safelist: {
    standard: ['active', 'show', 'collapsing'],
    // `:focus-visible` — the site's focus ring is declared once, and the first
    // selector in that rule is a BARE `:focus-visible` so that every plain link
    // gets it without being enumerated. PurgeCSS has no class or element to
    // match a bare pseudo-class against, so it removes it — silently, and only
    // in the production build, which is the worst place for it to happen. The
    // shipped CSS then had a ring on buttons and menu rows and NOTHING on the
    // ordinary links that make up most of the page.
    //
    // This is the same hazard the `KT_CSS` note below describes for ::selection,
    // and it costs 621 bytes minified to close.
    greedy: [/data-bs-popper/, /:focus-visible/],
  },
});
writeFileSync(CSS, css);

const kept = minifyPreservingFeatureValues(CSS) + minifyPreservingFeatureValues(KT_CSS);
console.log(`  css          → minified, ${kept} @font-feature-values block(s) carried through`);
