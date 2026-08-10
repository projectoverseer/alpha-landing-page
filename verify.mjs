/**
 * Pre-publish sanity check on the built _site — the last gate before
 * publish.mjs replaces docs/. Fails the build loudly instead of letting a
 * broken page reach GitHub Pages.
 *
 * Checks:
 *   1. Every must-ship file exists (pages, 404, sitemap, robots, favicons,
 *      manifest, fonts, hero image) and the fingerprinted css/js are present.
 *   2. Every local URL referenced by the built HTML (href/src/srcset, both
 *      absolute-origin and root-relative) resolves to a real file in _site.
 *   3. No page leaked template syntax ({{ … }} / {% … %}) or localhost URLs.
 *   4. No hub page still carries raw LaTeX delimiters — i.e. optimize:math ran
 *      and every equation became MathML. Unrendered math is invisible-ish rather
 *      than loud, so it needs a gate of its own. Nor any hand-typed Unicode
 *      subscript, which is a chemical formula that skipped `\ce{…}` (design 05).
 *
 * Zero dependencies — Node built-ins only.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = '_site';
const ORIGIN = 'https://www.alphasoftwaregroup.com';

const errors = [];

// ── 1. must-ship files ──────────────────────────────────────────────────────
const MUST_SHIP = [
  'index.html', 'en/index.html', '404.html',
  'chia-se-kinh-nghiem/index.html',
  'chia-se-kinh-nghiem/chu-de/van-hanh/index.html',
  'chia-se-kinh-nghiem/chu-de/ky-thuat-nhuom/index.html',
  'chia-se-kinh-nghiem/chu-de/do-mau/index.html',
  'sitemap.xml', 'robots.txt', 'site.webmanifest',
  '3ae395cbc31836c28cb9d7e68ff15aec.txt', // IndexNow key — indexnow.mjs must find it live

  'favicon.svg', 'favicon.ico', 'apple-touch-icon.png',
  'img/hero/hero-1920.avif',
  'fonts/literata/literata-latin.woff2',
  'fonts/literata/literata-vietnamese.woff2',
  'fonts/literata/literata-greek.woff2',
  'fonts/inter/inter-latin.woff2',
  'fonts/inter/inter-vietnamese.woff2',
  'fonts/math/alpha-math-2.woff2',
];
for (const f of MUST_SHIP) {
  if (!existsSync(join(SITE, f))) errors.push(`missing required file: ${f}`);
}
const hashed = (dir, stem, ext) =>
  existsSync(join(SITE, dir)) &&
  readdirSync(join(SITE, dir)).some((n) => new RegExp(`^${stem}\\.[0-9a-f]{10}\\.${ext}$`).test(n));
if (!hashed('css', 'main', 'css')) errors.push('missing fingerprinted css/main.<hash>.css');
if (!hashed('css', 'chiasekinhnghiem', 'css')) errors.push('missing fingerprinted css/chiasekinhnghiem.<hash>.css');
if (!hashed('js', 'bundle', 'js')) errors.push('missing fingerprinted js/bundle.<hash>.js');
if (!hashed('js', 'kt-lightbox', 'js')) errors.push('missing fingerprinted js/kt-lightbox.<hash>.js');
if (!hashed('js', 'kt-topbar', 'js')) errors.push('missing fingerprinted js/kt-topbar.<hash>.js');

// ── 2 + 3. scan every built HTML page ───────────────────────────────────────
const htmlFiles = readdirSync(SITE, { recursive: true })
  .map(String)
  .filter((n) => n.endsWith('.html'));

// Local references: href/src/srcset values that point at this site.
const refPattern = /(?:href|src)="([^"]+)"|(?:srcset)="([^"]+)"/g;

for (const name of htmlFiles) {
  const html = readFileSync(join(SITE, name), 'utf8');

  if (html.includes('localhost')) errors.push(`${name}: contains a localhost URL`);
  if (/{{\s|{%\s/.test(html)) errors.push(`${name}: contains unrendered template syntax`);

  // Speculation rules survived, and still say what they were written to say.
  //
  // This one fails SILENTLY in every direction, which is why it is gated rather
  // than eyeballed. Malformed JSON is ignored by the browser with no console
  // error; a dropped exclusion is invisible until the analytics look wrong; and
  // html-minifier-terser runs with `--minify-js true`, so if it ever decides a
  // `type="speculationrules"` block is JavaScript it will rewrite the JSON into
  // something that parses as neither. Nothing downstream would notice — the
  // only symptom is that the site quietly stops being fast.
  // 404.html is deliberately out: it is a standalone page whose one link is
  // "go home", and it is a page nobody should be on long enough to hover.
  const spec = /<script type="speculationrules">([\s\S]*?)<\/script>/.exec(html);
  if (!spec) {
    if (name !== '404.html') errors.push(`${name}: the speculation rules block is gone`);
  } else {
    let rules = null;
    try {
      rules = JSON.parse(spec[1]);
    } catch (e) {
      errors.push(`${name}: speculation rules are not valid JSON (${e.message})`);
    }
    if (rules) {
      const rule = rules.prerender && rules.prerender[0];
      const clauses = (rule && rule.where && rule.where.and) || [];
      const sel = clauses.map((c) => c.not && c.not.selector_matches).find(Boolean) || '';
      if (!rule || rule.eagerness !== 'moderate') {
        // `eager` would prerender every link on load — ten pages of other
        // people's work on a reader's mobile data, most of it never opened.
        errors.push(`${name}: speculation eagerness is not "moderate" (see the include)`);
      }
      if (!clauses.some((c) => c.href_matches === '/*')) {
        // Without it, a credentialed prerender can leave this origin.
        errors.push(`${name}: speculation rules lost the same-origin constraint`);
      }
      // The main page is one long anchored document; `#lien-he` has a pathname
      // of `/` and matches `/*`, so losing this speculates the current page.
      for (const needle of ["[href^='#']", "[href*='?']", '[download]', '[target]']) {
        if (!sel.includes(needle)) {
          errors.push(`${name}: speculation rules no longer exclude ${needle}`);
        }
      }
    }
  }

  // Hub only: kramdown hands LaTeX through as \[…\] / \(…\) for optimize:math to
  // turn into MathML. If a delimiter survives, the equation never rendered.
  if (name.startsWith('chia-se-kinh-nghiem') && /\\\[|\\\(/.test(html)) {
    errors.push(`${name}: unrendered LaTeX left in the page — did optimize:math run?`);
  }

  // Hub only: a dangling bond written as a bare `-`. mhchem reads a trailing
  // `+`/`-` as an IONIC CHARGE and raises it into a superscript, so `\ce{-CO-NH-}`
  // renders as an amide ANION — chemically false, and near-invisible: the dash is
  // there, just 6px too high. It shipped that way on 2026-08-02 and only the
  // owner's eye caught it. design 05 §2 makes both halves explicit — a dangling
  // bond is `\bond{-}`, a real charge is `^-` — which is what makes the mistake
  // mechanically detectable: after those rules, a bare sign before a closing
  // `}`/`]`/`)` is always wrong. The `[^{^]` guard exempts `\bond{-}` itself
  // (preceded by `{`) and a properly written charge (preceded by `^`).
  //
  // A MULTIPLE charge carries its number between the `^` and the sign — mhchem
  // writes Cr³⁺ as `\ce{Cr^3+}` — so the `^` guard cannot see it and the digit
  // reads as a bare sign. That is still a properly written charge (design 05
  // §2), so charges are removed before the test rather than special-cased in
  // it: `^-` `^+` `^3+` `^{2-}` all go, and every dangling bond stays.
  if (name.startsWith('chia-se-kinh-nghiem')) {
    for (const m of html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)) {
      const tex = m[1];
      if (!tex.includes('\\ce{')) continue;
      const bad = tex.replace(/\^\{?\d*[-+]\}?/g, '').match(/[^{^][-+][}\])]/);
      if (bad) {
        errors.push(
          `${name}: bare "${bad[0]}" in ${tex.trim()} — mhchem reads a trailing sign as an ionic charge. ` +
            `A dangling bond is \\bond{-}; a real charge is ^- or ^+ (design 05 §2).`,
        );
      }
    }
  }

  // Hub only: ISO 80000-1 §7.2 — a space separates a value from its unit symbol,
  // and it is a NO-BREAK space so the two never land on different lines. Two
  // exceptions, both deliberate and both recorded in design 05 §3: `%` (owner's
  // call, 2026-08-02 — "4,5 %" reads foreign in Vietnamese trade prose) and the
  // plane-angle ° ′ ″, which is SI's own exception (0°, 90°, 10° observer).
  //
  // Text only: image slugs legitimately contain "380-700nm", so tags, scripts
  // and styles come out before the test or every page would fail on its own
  // filenames.
  if (name.startsWith('chia-se-kinh-nghiem')) {
    const text = html
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
      .replace(/<[^>]*>/g, ' ');
    const tight = text.match(/\d(?:°C|nm|mm|cm|kg|K)(?![A-Za-zÀ-ỹ])/);
    if (tight) {
      errors.push(
        `${name}: "${tight[0]}" — ISO 80000-1 puts a no-break space between a value ` +
          `and its unit (design 05 §3). The exceptions are % and plane-angle °.`,
      );
    }
  }

  // Hub only: a hand-typed formula. Unicode subscripts (CH₂, SO₄) are how a
  // chemical formula gets pasted in from a Facebook post, and they are wrong on
  // every count the MathML pipeline exists for — they break line-height, most of
  // the block has no glyph in Literata so it falls back to a stranger font, a
  // screen reader spells them as decoration, and the formula is unsearchable.
  // The notation standard (design 05) says every one of these is `\ce{…}`.
  // Superscripts are deliberately NOT gated: `g/m²` in prose is a unit.
  if (name.startsWith('chia-se-kinh-nghiem') && /[₀-ₜ]/.test(html)) {
    const hit = html.match(/.{0,24}[₀-ₜ].{0,24}/)[0].replace(/\s+/g, ' ');
    errors.push(`${name}: hand-typed Unicode subscript in "…${hit}…" — write it as $$\\ce{…}$$ (design 05 §2)`);
  }

  // <math> is not on html-minifier's list of inline elements, so a <strong> (or
  // <em>) holding nothing but an equation is treated as a block and the word
  // space after it is collapsed away: "chọn ΔEcmc(2:1)khi đo màu". Emphasis
  // around a formula is bad typography anyway — the maths already stands apart —
  // so the rule is simply never to write `**$$…$$**`, and this is the tripwire.
  if (/<(strong|em)><math[\s\S]*?<\/math><\/\1>/.test(html)) {
    errors.push(`${name}: an equation is wrapped in <strong>/<em> — the minifier eats the space beside it; drop the ** ** around the $$…$$`);
  }

  // A bare <mi> is an italic variable, and an italic variable is not the letter
  // it looks like: the browser substitutes its Mathematical Italic codepoint,
  // which Literata has no glyph for, so it drops out of the body face and into
  // the OS maths font. optimize:math writes mathvariant="normal" on every one —
  // if a bare <mi> reaches the page, that step regressed.
  if (/<mi>/.test(html)) {
    errors.push(`${name}: an <mi> lost its mathvariant="normal" — the variable will render italic, in the wrong font`);
  }

  // KaTeX writes MathML the way TeX writes boxes, and mhchem leans on that: a
  // chemical subscript came out as a script hung on a zero-width PHANTOM, with
  // the digit itself smashed to zero height. Blink plays along. WebKit does not
  // — it gives an `<mpadded height="0px">` a layout box and then never paints
  // its contents — so on 2026-08-04 every CH₂ on the Nylon post was a HOLE on
  // iPadOS and iOS while Windows and Android looked perfect:
  //
  //     −[NH−(CH )₆−NH−CO−(CH ) −CO]ₙ−
  //
  // optimize:math now hangs each script on its real base and drops the smash,
  // so nothing on the page depends on either construct. These two tripwires say
  // so out loud: a formula that renders on the machine doing the build is not
  // evidence, because that machine is not the one the owner reads on.
  if (/<mpadded[^>]*\bheight="0px"/.test(html)) {
    errors.push(
      `${name}: a zero-height <mpadded> reached the page — WebKit (Safari, every iPhone and iPad) ` +
        `lays it out and then paints nothing, so the character inside it vanishes. optimize:math should have unwrapped it.`,
    );
  }
  if (/<(?:msub|msup|msubsup)><mpadded[^>]*\bwidth="0px"[^>]*><mphantom>/.test(html)) {
    errors.push(
      `${name}: a subscript or charge is hung on an <mphantom> base — mhchem's TeX layout hack, not MathML. ` +
        `optimize:math should have attached it to the atom it belongs to.`,
    );
  }

  const refs = new Set();
  for (const m of html.matchAll(refPattern)) {
    // srcset holds comma-separated "url descriptor" pairs; href/src hold one URL.
    const urls = m[2] ? m[2].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]];
    for (const u of urls) refs.add(u);
  }

  for (const ref of refs) {
    let path = null;
    if (ref.startsWith(ORIGIN)) path = ref.slice(ORIGIN.length);
    else if (ref.startsWith('/') && !ref.startsWith('//')) path = ref;
    if (!path) continue; // external, mailto:, tel:, #fragment, data:

    path = path.split('#')[0].split('?')[0];
    if (path === '' || path === '/') continue;
    const candidates = [path, path.replace(/\/$/, '') + '/index.html', path + '.html'];
    if (!candidates.some((c) => existsSync(join(SITE, c.replace(/^\//, ''))))) {
      errors.push(`${name}: broken local reference ${ref}`);
    }
  }
}

// ---- @font-feature-values survived minification ----
//
// This block binds the names `font-variant-alternates` uses (open-digits,
// round-punctuation, curved-one) to the Inter family. clean-css cannot parse it
// and mangles it into something that still LOOKS present but binds nothing —
// see the long note in optimize-css.mjs. The failure is invisible: no console
// error, no layout shift, no broken page, just Inter's default wedge commas and
// closed digits quietly back. So assert the shape, not the substring.
for (const stem of ['main', 'chiasekinhnghiem']) {
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith(`${stem}.`) && f.endsWith('.css'),
  );
  if (!file) continue; // MUST_SHIP already covers a missing stylesheet
  const css = readFileSync(join(SITE, 'css', file), 'utf8');

  const at = css.indexOf('@font-feature-values');
  if (at === -1) {
    errors.push(`css/${file}: @font-feature-values block is missing`);
    continue;
  }
  // Brace-match the block, then require both nested at-rules INSIDE it. The
  // mangled form hoists @character-variant out to the top level, so a plain
  // "does the file contain @character-variant" test would pass on broken CSS.
  let depth = 0;
  let end = -1;
  for (let p = css.indexOf('{', at); p < css.length && p !== -1; p++) {
    if (css[p] === '{') depth++;
    else if (css[p] === '}' && --depth === 0) {
      end = p;
      break;
    }
  }
  const block = end === -1 ? '' : css.slice(at, end + 1);
  for (const nested of ['@styleset', '@character-variant']) {
    if (!block.includes(nested)) {
      errors.push(`css/${file}: ${nested} not inside @font-feature-values (minifier mangled it)`);
    }
  }
  for (const value of ['open-digits', 'round-punctuation', 'curved-one']) {
    if (!block.includes(value)) {
      errors.push(`css/${file}: feature value "${value}" lost from @font-feature-values`);
    }
  }
  if (!css.includes('font-variant-alternates')) {
    errors.push(`css/${file}: @font-feature-values present but nothing uses it`);
  }
}

// ── optical heading spacing ─────────────────────────────────────────────────
//
// The gap above a heading is stated optically and reached two different ways:
// `text-box-trim` where the browser has it, arithmetic through --tb-comp where
// it does not. Two things can silently break that, and both already have once.
//
// 1. PurgeCSS drops a rule whose selector ends in `:not(:has(...))`. When the
//    @supports half went that way, nothing broke visibly — every browser simply
//    took the fallback, which is a correct-looking page. The property was just
//    gone.
// 2. Any rule that sets a heading's top margin at a specificity above the base
//    one, and states the value raw instead of through --tb-comp, forks the two
//    paths. `.prose` did exactly this and the two disagreed by ~5px.
//
// Neither shows up as a broken page, so assert the invariant instead.
{
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith('main.') && f.endsWith('.css'),
  );
  const css = file ? readFileSync(join(SITE, 'css', file), 'utf8') : '';
  if (css) {
    if (!/@supports\s*\(text-box-trim:\s*trim-start\)/.test(css)) {
      errors.push(`css/${file}: the @supports text-box-trim block is gone (PurgeCSS?)`);
    }
    if (!/text-box-edge:\s*cap alphabetic/.test(css)) {
      errors.push(`css/${file}: text-box-edge lost — the trim would fall back to the ascender`);
    }
    // one --tb per rung; without it var(--tb, 0px) silently pays nothing
    const rungs = new Set((css.match(/--tb:\s*[0-9.]+em/g) || []));
    if (rungs.size < 6) {
      errors.push(`css/${file}: only ${rungs.size} distinct --tb values, expected one per heading rung`);
    }

    // every heading top margin must go through the switch
    const RULE = /([^{}]+)\{([^{}]*)\}/g;
    const HEAD = /(^|[\s,>+~])(h[1-6]|\.h[1-6])(?![\w-])/;
    let m;
    while ((m = RULE.exec(css))) {
      const sel = m[1].trim();
      if (sel.startsWith('@')) continue;
      if (!sel.split(',').some((s) => HEAD.test(s.trim()))) continue;
      for (const decl of m[2].match(/(?:^|;)\s*margin(?:-top|-block-start)?\s*:\s*[^;]+/g) || []) {
        const value = decl.slice(decl.indexOf(':') + 1).trim();
        // `margin: a b c d` — only the first component is the top edge
        const top = /^margin\s*:/.test(decl.replace(/^;/, '').trim())
          ? value.split(/\s+/)[0]
          : value;
        if (/^0(px|em|rem)?$/.test(top) || top.includes('--tb-comp')) continue;
        errors.push(
          `css/${file}: heading top margin "${top}" bypasses var(--tb-comp) — ` +
            `the trimmed and untrimmed paths will disagree (selector: ${sel.slice(0, 70)})`,
        );
      }
    }
  }
}

// ---- found text keeps ALPHA's colour, on both surfaces ----
//
// `::target-text` (a reader arriving from a Google snippet or a shared
// #:~:text= link) and `::search-text` (find-in-page) are the fourth instance of
// this project's favourite failure: a rule that vanishes without leaving a mark.
// Here it is worse than usual, because the browser does not render *nothing* in
// its place — it renders its OWN highlighter yellow, which looks deliberate. The
// first screen a reader from search ever sees would carry someone else's colour
// and nobody would file a bug.
//
// Three ways to lose it, all silent: PurgeCSS eats the bare pseudo-element
// (see optimize-css.mjs); a refactor groups these into one selector list with
// `::selection`, at which point one unsupported pseudo invalidates the whole
// rule and takes the working ones down with it; or the hub's tokens go missing
// so `var(--find-bg)` resolves to nothing and the declaration is dropped.
//
// Checked on BOTH stylesheets, because the hub skips PurgeCSS and the main site
// does not — different pipelines, same requirement.
{
  const sheets = [
    ['main.', ['::target-text', '::search-text', '::search-text:current']],
    ['chiasekinhnghiem.', ['.kt ::target-text', '.kt ::search-text', '.kt ::search-text:current']],
  ];
  for (const [prefix, selectors] of sheets) {
    const file = readdirSync(join(SITE, 'css')).find(
      (f) => f.startsWith(prefix) && f.endsWith('.css'),
    );
    const css = file ? readFileSync(join(SITE, 'css', file), 'utf8') : '';
    if (!css) continue;

    // Presence is not enough, and the first draft of this gate learned that the
    // hard way: every one of these selectors appears TWICE, once with Alpha's
    // colour and once with a system keyword inside @media (forced-colors). Delete
    // the branded rule and a bare substring check still finds the forced-colors
    // twin and passes — while every ordinary reader gets the browser's yellow.
    // So what is asserted is the BRANDED rule specifically: a background that is
    // a hex or a custom property, not a system colour.
    for (const sel of selectors) {
      // escape first, then let any run of whitespace match any amount — the
      // minifier keeps descendant combinators but may squeeze them
      const pattern = sel
        .split(/\s+/)
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('\\s+');
      // `::search-text` is a prefix of `::search-text:current`, so without this
      // the plain rule could go missing and the gate would still find it inside
      // the current-match rule
      const strict = sel.endsWith('::search-text') ? pattern + '(?!:current)' : pattern;
      const branded = new RegExp(
        `(^|[},])[^{}]*${strict}[^{}]*\\{[^{}]*background:\\s*(#[0-9a-f]{3,8}|var\\()`,
        'i',
      );
      if (!branded.test(css)) {
        errors.push(
          `css/${file}: ${sel} has no rule carrying Alpha's own colour — ` +
            `found text would paint in the browser's highlight yellow ` +
            `(a forced-colors rule alone does not count)`,
        );
      }
    }

    // The grouping hazard: these must never share a selector list with
    // ::selection, or an engine without ::search-text throws the whole rule out
    // and loses its selection colour too.
    for (const m of css.match(/[^{}]*\{[^{}]*\}/g) || []) {
      const sel = m.slice(0, m.indexOf('{'));
      if (/::selection/.test(sel) && /::(search|target)-text/.test(sel)) {
        errors.push(
          `css/${file}: ::selection is grouped with a found-text pseudo (${sel.trim().slice(0, 60)}) — ` +
            `one unsupported selector invalidates the entire rule`,
        );
      }
    }

    // Opaque pairs only. A background with no colour beside it re-opens the
    // contrast question on every ground a found word can land on, which is the
    // exact reasoning ::selection was rewritten for.
    for (const m of css.match(/[^{}]*::(?:search|target)-text[^{}]*\{[^{}]*\}/g) || []) {
      const body = m.slice(m.indexOf('{') + 1, -1);
      if (/background/.test(body) && !/(^|;)\s*color\s*:/.test(body)) {
        errors.push(
          `css/${file}: a found-text rule sets a background with no colour (${m.slice(0, 60)}) — ` +
            `the pair must be opaque so it is measured once, not per surface`,
        );
      }
    }
  }
}

// ---- the superellipse, and the exact geometry of it ----
//
// This gate has now asserted three different things, and the failure it guards
// has been the same every time: a corner geometry that changes without anyone
// noticing. It required the n = 4 squircle, then (2026-07-28, owner: "hơi
// unconventional") required its absence, and now requires the n = 3.0224 corner
// that replaced it on 2026-08-04 — ported from the Squircle extension, quy-cu
// §2. What each version really checks is that what shipped is what was decided.
//
// Three separate assertions, because there are three separate ways to lose it:
// the shape can be minified away, the depth match can be dropped (leaving the
// corner reading a third less round than the design), and the OLD ×1.8409
// geometry can come back from a copied snippet or an old commit.
for (const stem of ['main', 'chiasekinhnghiem']) {
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith(`${stem}.`) && f.endsWith('.css'),
  );
  if (!file) continue;
  const css = readFileSync(join(SITE, 'css', file), 'utf8');

  // 1. The shape survived clean-css. `corner-shape` is a 2025 property; a
  //    minifier that does not know it could drop it as invalid, and the page
  //    would then draw plain circles at a radius grown 43% for a superellipse
  //    that is not there — visibly over-rounded, and silent.
  if (!/corner-shape:\s*superellipse\(1\.5957\)/.test(css)) {
    errors.push(
      `css/${file}: corner-shape: superellipse(1.5957) is gone — the corner lost its shape (quy-cu §2)`,
    );
  }

  // 2. It is still gated. The growth compensates for the superellipse, so it
  //    must never reach an engine that ignores the shape — that is the exact
  //    bug that made a 12px button a 22.09px circle on iOS in the first
  //    version. Both must live inside `@supports`.
  if (!/@supports\s*\(corner-shape:/.test(css)) {
    errors.push(
      `css/${file}: the corner is no longer behind @supports — Safari/Firefox would get the grown radius on a circle`,
    );
  }

  // 3. The depth match is intact. depth-match() = r × 1.4291572676, rounded to
  //    4dp: 4 → 5.7166, 8 → 11.4333, 12 → 17.1499, 16 → 22.8665, 24 → 34.2998.
  //    At least one has to be in the file or the growth was silently dropped.
  if (!/border-radius:\s*(?:5\.7166|11\.4333|17\.1499|22\.8665|34\.2998)px/.test(css)) {
    errors.push(
      `css/${file}: no depth-matched radius survived — the superellipse is drawing shallower than the design`,
    );
  }

  // 4. The OLD n = 4 geometry stays dead: superellipse(2) with radii × 1.8409
  //    (8 → 14.7272, 12 → 22.0908, 16 → 29.4544). Nothing should reintroduce it,
  //    and a half-migrated file carrying both would round two objects on the
  //    same page by different amounts.
  if (/superellipse\(2\)/.test(css) || /border-radius:\s*(?:14\.7|22\.09|29\.45)/.test(css)) {
    errors.push(
      `css/${file}: the old n = 4 corner is back (× 1.8409) — the shipped one is n = 3.0224, × 1.4292`,
    );
  }

  // ---- the focus ring has ONE shape ----
  // The ring is a box-shadow, so it copies the silhouette of whatever it
  // surrounds — and a run of inline text has none, which is how the site ended
  // up with rounded rings on the buttons and hard rectangles on the links. One
  // zero-specificity rule supplies the floor (quy-cu §5). It is written with
  // `:where()`, which is precisely the kind of selector a minifier or PurgeCSS
  // is most likely to mangle, and losing it fails silently: the ring is still
  // there, just two different shapes again.
  if (!/:where\([^)]*:focus-visible[^)]*\)\s*\{[^}]*border-radius/.test(css)) {
    errors.push(
      `css/${file}: the :where(:focus-visible) radius is gone — the ring is two shapes again`,
    );
  }
}

// ---- a menu's END ROWS keep the menu's own corner ----
//
// The row's ring turns INWARD (quy-cu §5) so it cannot spill past the menu's
// edge, and an inward ring is an outline drawn 3px inside the border box —
// inside `.dropdown-menu { overflow: hidden }`, which is what rounds everything
// else about that row. So the clip cannot help it: if the first and last row
// carry `border-radius: 0`, the ring draws a SQUARE corner inside a squircle
// menu, and it does it only while focused, which is why it survived a full
// browser pass and was reported by eye instead (owner, 2026-08-09).
//
// Both halves are asserted because either alone is the 2026-08-04 hazard in
// reverse: a radius with no shape draws a circle inside a superellipse, and a
// shape with no radius draws nothing at all.
{
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith('main.') && f.endsWith('.css'),
  );
  const css = file ? readFileSync(join(SITE, 'css', file), 'utf8') : '';

  // 11.4333 (the menu, depth-matched $r-2) − 1px border, per corner-inner().
  if (file && !/--bs-dropdown-inner-border-radius:\s*10\.4333px/.test(css)) {
    errors.push(
      `css/${file}: the dropdown's end rows lost the menu's inner corner — ` +
        `their focus ring draws square inside a squircle menu (quy-cu §5)`,
    );
  }
  // Selector-list-tolerant: clean-css merges blocks with identical bodies, so
  // ask "is .dropdown-item in a block that states the shape?", not "is it alone".
  const shaped = [...css.matchAll(/(?:^|[{}])([^{}]*)\{([^}]*corner-shape[^}]*)\}/g)].some(
    ([, sel]) => /(?:^|,)\s*\.dropdown-item\s*(?:,|$)/.test(sel),
  );
  if (file && !shaped) {
    errors.push(
      `css/${file}: .dropdown-item has no corner-shape — the end rows would round ` +
        `as circles inside the menu's superellipse (quy-cu §2)`,
    );
  }
}

// ---- the focus ring survived PurgeCSS ----
// Third instance of the same failure shape, and the one that matters most: the
// ring is declared once, and its FIRST selector is a bare `:focus-visible` so
// that every ordinary link inherits it without being listed. PurgeCSS has no
// class or element to match a bare pseudo-class against and removes it — only
// in production, silently, leaving a build that looks correct in `jekyll serve`
// and ships with no focus indicator on most of the page. That is a WCAG 2.2
// SC 2.4.7 failure introduced by a minifier, which is not a thing anyone will
// think to look for. The safelist in optimize-css.mjs holds it; this makes sure.
for (const stem of ['main', 'chiasekinhnghiem']) {
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith(`${stem}.`) && f.endsWith('.css'),
  );
  if (!file) continue;
  const css = readFileSync(join(SITE, 'css', file), 'utf8');

  // `:focus-visible` standing alone in its own compound selector — nothing
  // joined to it. It may still have an ancestor: the hub scopes its ring as
  // `.kt :focus-visible` because `.kt` is on <body>, which reaches everything
  // just the same. What must NOT be the only form present is the attached kind
  // (`.btn:focus-visible`), because that is an enumeration and whatever is not
  // on the list ships with no indicator.
  //
  // So: allow start-of-file, `}`, `,` or whitespace before the colon; reject a
  // class, element or id character.
  if (!/(?:^|[},]|\s):focus-visible\s*[,{]/.test(css)) {
    errors.push(
      `css/${file}: the bare :focus-visible selector was purged — ordinary links ship with no focus ring`,
    );
  }
  // Both tones, or the ring is one flat colour against one of its two grounds.
  for (const token of ['--focus', '--focus-halo']) {
    if (!css.includes(`var(${token})`)) {
      errors.push(`css/${file}: nothing reads var(${token}) — the two-tone focus ring is broken`);
    }
  }
  // Windows High Contrast throws box-shadow away; this branch is the only thing
  // drawing focus there.
  if (!/forced-colors/.test(css) || !/[Hh]ighlight/.test(css)) {
    errors.push(`css/${file}: no forced-colors focus fallback — the ring vanishes in High Contrast`);
  }
  // The UA's own ring is taken, not merely ignored (quy-cu §5). Declining to
  // write `outline` does not leave the property empty — Chrome's UA sheet fills
  // it with `outline: auto 1px`, in near-black, at its own radius, painted on
  // top of ours. That shipped: measured 2026-08-04, every control the framework
  // had not zeroed wore two rings, and on the menu row Chrome's outline spilled
  // past the very edge the inset ring exists to stay inside.
  //
  // THE HALO IS PAINTED AND THE RING IS AN OUTLINE, and the two must travel
  // together in one block (quy-cu §5). Keying off the halo — the only thing
  // that reads var(--focus-halo) — is what makes this minifier-proof: clean-css
  // rewrites and reorders the selector list, but a declaration block stays a
  // declaration block.
  //
  // This gate covers two separate regressions at once:
  //
  //  1. The ring going back to a box-shadow. Both bands as outer shadows are
  //     clipped by the same antialiased border-box curve, and the ring bleeds
  //     ~1px through the halo's seam — a 13% tint of the ring colour sitting
  //     inside the halo, worst at the corners. The owner reported it by eye
  //     before it was ever measured.
  //  2. `outline` going unwritten again, which hands the property straight back
  //     to Chrome's UA sheet and draws its near-black ring on top of ours.
  //
  // Both are invisible in source review and obvious in a browser, which is
  // exactly the class of failure the gates in this file exist for.
  const haloBlocks = [...css.matchAll(/\{([^}]*var\(--focus-halo\)[^}]*)\}/g)];
  if (!haloBlocks.length) {
    errors.push(`css/${file}: no block paints the halo — the focus-ring gate is blind`);
  }
  for (const [, body] of haloBlocks) {
    if (!/outline:[^;}]*var\(--focus\)/.test(body)) {
      errors.push(
        `css/${file}: a focus block paints the halo but does not draw the ring as ` +
          `\`outline: … var(--focus)\` — either the ring regressed to a box-shadow (it ` +
          `then bleeds through the halo seam) or \`outline\` was left to Chrome (quy-cu §5)`,
      );
    }
    if (!/outline-offset:/.test(body)) {
      errors.push(
        `css/${file}: a focus block has no \`outline-offset\` — the ring would sit on the ` +
          `control's edge instead of outside the halo (quy-cu §5)`,
      );
    }
  }
}

// ---- no map key may start with a digit unless it is quoted ----
//
// The one gate here that reads SOURCE rather than output, because the failure
// it guards destroys the build before there is any output to inspect.
//
// `2xl:` in a Sass map is a Number (2, unit "xl"), not an identifier. Mixing a
// Number key with String keys makes Ruby Sass 3.7 raise `String can't be
// coerced into Integer` from its duplicate-key check — but only when the two
// keys collide in the same hash bucket, which Ruby re-randomises on every
// process. Measured at roughly 1 build in 60. It cost this project months of
// "the toolchain is flaky on Windows" and one confidently wrong diagnosis.
//
// It cannot be caught downstream and it cannot be caught by reading the file,
// so it is caught here. Quote the key.
{
  const scssFiles = [
    ...readdirSync('css').filter((f) => f.endsWith('.scss')).map((f) => join('css', f)),
    ...readdirSync('_sass').filter((f) => f.endsWith('.scss')).map((f) => join('_sass', f)),
  ];
  for (const f of scssFiles) {
    const src = readFileSync(f, 'utf8');
    // A map entry is `key: value,` on its own line. What is flagged is a key
    // that starts with a digit AND contains a letter — `2xl`, `3d`, `2x` — i.e.
    // something written as a name that Sass reads as a number-with-a-unit.
    //
    // A key of pure digits (`0:`, `1:`, `11:` — the space ladder in
    // _quy-cu.scss) is NOT flagged and must not be: it is a deliberate numeric
    // key, and a map whose keys are ALL numbers is perfectly safe. The bug
    // needs a MIX, and a mix only happens by accident, which is exactly when
    // the key looks like a word and is not one.
    for (const m of src.matchAll(/^\s{2,}(\d[\w-]*[a-zA-Z][\w-]*)\s*:\s*[^;]+,\s*$/gm)) {
      errors.push(
        `${f}: map key \`${m[1]}\` starts with a digit and is unquoted — ` +
          `Sass reads it as a NUMBER, which makes the build fail at random (~1 in 60)`,
      );
    }
  }
}

// ---- the bar's ink follows its SURFACE, not its state class ----
//
// The navigation bar has THREE surfaces and one state class. `.nav-active` says
// "the reader has scrolled", which happens to imply "I am opaque" at ≥md and
// says nothing at all below md, where the bar is opaque at every scroll
// position. Twice now that gap has shipped a real bug: once with dark ink on
// the dark hero photograph, once with white ink — and a white focus ring — on
// the opaque light bar of a phone at the top of the page.
//
// Neither is catchable by reading the Sass, because both halves look right on
// their own; the fault is the one that is missing. So it is checked here, on
// the built CSS, against the value the OTHER opaque state uses. No hex is
// written into this file: if the tokens move, the gate moves with them.
{
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith('main.') && f.endsWith('.css'),
  );
  if (file) {
    const css = readFileSync(join(SITE, 'css', file), 'utf8');

    // The ink the bar uses when it is opaque and scrolled — our reference.
    const lit = css.match(/\.navbar\.nav-active\s+\.nav-link\{color:([^;}]+)/);
    // The phone breakpoint, where the bar is opaque WITHOUT .nav-active.
    const phone = css.match(/@media\s*\(max-width:47\.98rem\)\{(.*?)\}\}/s);

    if (!lit) {
      errors.push(`css/${file}: no .navbar.nav-active .nav-link colour — the bar's light ink is gone`);
    } else if (!phone) {
      errors.push(`css/${file}: the phone-breakpoint navbar block is missing`);
    } else {
      const block = phone[1];
      const opaque = /\.navbar:not\(\.nav-active\)\{background:(?!transparent)/.test(block);
      const ink = block.match(/\.navbar:not\(\.nav-active\)\s+\.nav-link\{color:([^;}]+)/);
      if (opaque && (!ink || ink[1].trim() !== lit[1].trim())) {
        errors.push(
          `css/${file}: the bar is opaque under md but its links are not using the light ink ` +
            `(${ink ? ink[1].trim() : 'no rule'} vs ${lit[1].trim()}) — the caret goes invisible`,
        );
      }
      if (opaque && !/\.navbar:not\(\.nav-active\)\{[^}]*--focus-halo/.test(block)) {
        errors.push(
          `css/${file}: the opaque phone bar never redeclares --focus-halo — ` +
            `a keyboard user gets a white ring on a white bar (SC 1.4.11)`,
        );
      }
    }
  }
}

// ---- no warm surface, and the bar is white ----
//
// The owner's 2026-07-28 verdict, given twice in one day: warm greige surfaces
// (a warm bar, a warm band, warm menus) are rejected on this page outright —
// "the navbar must have a white background", the tints must lean blue. The
// band's history is four colours long (main.scss §3); the failure this guards
// is the quiet drift back in either direction — someone re-imports the
// product's warm shell because the product looks good, or greys the band down
// because grey is what a tint usually is.
//
// Tested as RELATIONS, not values, so it survives any future retune: on every
// tinted surface blue must lead red (a warm plane cannot pass), and the bar's
// opaque state must be white exactly (an owner decision, stated as one).
{
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith('main.') && f.endsWith('.css'),
  );
  if (file) {
    const css = readFileSync(join(SITE, 'css', file), 'utf8');
    const surfaces = [
      ['the one tinted band', /--bs-light:\s*(#[0-9a-f]{6})/i],
      // The footer's ground moved from `.footer-strip` to the whole `<footer>`
      // on 2026-08-10 (the contact block was reading as a page section, not as
      // furniture). Anchored on a rule boundary so `.blockquote-footer` and the
      // hub's `.kt-footer` cannot satisfy it by accident.
      ['the footer ground', /(?:^|[},])footer\{background:(#[0-9a-f]{6})/i],
      ['the review card', /\.review-card\{[^}]*background:(#[0-9a-f]{6})/i],
    ];
    for (const [name, re] of surfaces) {
      const m = css.match(re);
      if (!m) {
        errors.push(`css/${file}: cannot find ${name} — the cool-surface gate cannot run`);
        continue;
      }
      const [r, , b] = [1, 3, 5].map((i) => parseInt(m[1].slice(i, i + 2), 16));
      if (b <= r) {
        errors.push(
          `css/${file}: ${name} is ${m[1]} — red at or above blue, i.e. a warm surface ` +
            `(rejected by the owner 2026-07-28; main.scss §1)`,
        );
      }
    }
    const bar = css.match(/\.navbar\.nav-active\{[^}]*background:(#[0-9a-f]{3,6}|white)\b/i);
    if (!bar) {
      errors.push(`css/${file}: cannot find the opaque bar's background — the white-bar gate cannot run`);
    } else if (!/^#fff(fff)?$|^white$/i.test(bar[1])) {
      errors.push(
        `css/${file}: the opaque bar is ${bar[1]}, not white — owner decision 2026-07-28`,
      );
    }
  }
}

// ---- the hub's dark mode ships, whole ----
//
// Dark mode on Chia sẻ kinh nghiệm (owner asked, 2026-07-28) is a token layer:
// one @media (prefers-color-scheme: dark) block that re-declares --paper and
// its family. The failure this guards is the quiet one: a CSS optimizer or a
// refactor drops the media block (or the token re-declarations inside it), the
// light theme still renders perfectly, and nobody notices until a night-time
// phone reader gets a searing white page. Tested as a relation plus presence:
// the dark block must exist, must re-set --paper and --ink, and the dark
// paper must actually be dark (its red channel below 0x80 — the light paper's
// is 0xfa, so the two cannot be confused).
{
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith('chiasekinhnghiem.') && f.endsWith('.css'),
  );
  if (file) {
    const css = readFileSync(join(SITE, 'css', file), 'utf8');
    const dark = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\{(.*?)\}\}/s);
    if (!dark) {
      errors.push(
        `css/${file}: no prefers-color-scheme:dark block — the hub's dark mode is gone ` +
          `(owner asked for it 2026-07-28; _theme.scss token layer)`,
      );
    } else {
      const paper = dark[1].match(/--paper:\s*(#[0-9a-f]{6})/i);
      const ink = dark[1].match(/--ink:\s*(#[0-9a-f]{6})/i);
      if (!paper || !ink) {
        errors.push(
          `css/${file}: the dark block no longer re-declares --paper and --ink — ` +
            `the token layer is broken, dark readers get a half-themed page`,
        );
      } else if (parseInt(paper[1].slice(1, 3), 16) >= 0x80) {
        errors.push(
          `css/${file}: dark-mode --paper is ${paper[1]} — not a dark paper; ` +
            `the scheme swap would flash a light page at a dark-mode reader`,
        );
      }
    }
  }
}

// ---- no em dash reaches a reader, including through CSS ----
//
// Em dashes are out of reader-facing text on this site. That rule was being
// enforced by reading the copy, which is why one survived for the life of the
// project: Bootstrap draws `content: "\2014\00A0"` in front of every
// `.blockquote-footer`, so an em dash was printed before each customer's name
// in both languages while never appearing in a single .yml file. A sweep of the
// HTML finds nothing, because it is not in the HTML.
//
// So both halves are checked: generated content in the CSS, and the rendered
// text itself.
for (const stem of ['main', 'chiasekinhnghiem']) {
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith(`${stem}.`) && f.endsWith('.css'),
  );
  if (!file) continue;
  const css = readFileSync(join(SITE, 'css', file), 'utf8');
  // Last one wins in the cascade, so only the last declaration matters.
  const decls = [...css.matchAll(/\.blockquote-footer::before\{content:"([^"]*)"/g)];
  const last = decls.at(-1);
  if (last && /\\2014|—/.test(last[1])) {
    errors.push(
      `css/${file}: .blockquote-footer::before still prints an em dash ("${last[1]}") ` +
        `— it is set on every reviewer's name`,
    );
  }
}

for (const name of htmlFiles) {
  const html = readFileSync(join(SITE, name), 'utf8');
  if (html.includes('—')) {
    errors.push(`${name}: an em dash reached the rendered page (use a spaced en dash)`);
  }
}

// ---- Active-learning blocks (design/chia-se-kinh-nghiem/06) ----------------
//
// Three things here fail silently, which is the whole reason they are gated.
const articlePages = htmlFiles.filter(
  (n) => n.startsWith('chia-se-kinh-nghiem') &&
    !/^chia-se-kinh-nghiem[\\/](index|chu-de|series|tac-gia)/.test(n),
);
for (const name of articlePages) {
  const html = readFileSync(join(SITE, name), 'utf8');

  // 1. Coverage. A post whose front matter lost its `learn:` block renders a
  //    perfectly good article, so nothing downstream would ever complain.
  if (!html.includes('kt-hoc-open')) errors.push(`${name}: no opening block — the post's learn.open is missing`);
  if (!html.includes('kt-hoc-end')) errors.push(`${name}: no closing block — add the hoc.html variant="end" include above the signature`);

  // 2. Exactly one correct answer per question. Zero means the reader can never
  //    be told they were right; two means the piece contradicts itself. Both
  //    render without a murmur, so count them.
  const quizzes = html.match(/<fieldset class="kt-q">[\s\S]*?<\/fieldset>/g) || [];
  for (const [i, fs] of quizzes.entries()) {
    // The opener is deliberately answer-free: every option replies the same.
    const isOpener = /name="kt-open"/.test(fs);
    const right = (fs.match(/\bis-right\b/g) || []).length;
    if (isOpener) {
      if (right) errors.push(`${name}: the opening question marks a correct answer — it must not give one away`);
      if (/kt-fb/.test(fs)) errors.push(`${name}: the opening question carries per-option feedback — that leaks the answer`);
    } else if (right !== 1) {
      errors.push(`${name}: question ${i + 1} has ${right} correct answers, expected exactly 1`);
    }
  }

  // 2b. A HOOK opener must tell the reader that no verdict is coming: without
  //     that line, tapping an option and getting nothing back reads as a broken
  //     control rather than as the point (owner, 2026-08-09). A RECALL opener
  //     must not carry it — that one does answer, on the spot, in a <details>.
  const isHookOpener = html.includes('name="kt-open"');
  if (isHookOpener && !html.includes('kt-hoc-guess')) {
    errors.push(`${name}: the opening question lost its "bạn thử đoán" line — a silent option row reads as broken`);
  }
  if (!isHookOpener && html.includes('kt-hoc-guess')) {
    errors.push(`${name}: a recall block carries the "no answer here" line, but it does answer on the spot`);
  }

  // 2c. Đọc tiếp is a rail now, and the peek is what says "swipe". A card list
  //     that renders without the rail container is a plain stack again.
  if (html.includes('kt-readnext') && !html.includes('kt-readnext-rail')) {
    errors.push(`${name}: Đọc tiếp rendered without its rail container`);
  }

  // 3. The structured data must parse and must not out-run the page. Answers
  //    described to a crawler that a reader cannot see is the one way this
  //    markup becomes a liability.
  const quizLd = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [])
    .map((b) => b.replace(/^<script type="application\/ld\+json">|<\/script>$/g, ''))
    .map((raw) => {
      try {
        return JSON.parse(raw);
      } catch (e) {
        errors.push(`${name}: JSON-LD does not parse (${e.message})`);
        return null;
      }
    })
    .find((o) => o && o['@type'] === 'Quiz');

  if (quizzes.some((fs) => !/name="kt-open"/.test(fs)) && !quizLd) {
    errors.push(`${name}: the page has quiz questions but no Quiz JSON-LD`);
  }
  if (quizLd) {
    const onPage = quizzes.filter((fs) => !/name="kt-open"/.test(fs)).length;
    if (quizLd.hasPart.length !== onPage) {
      errors.push(`${name}: Quiz JSON-LD declares ${quizLd.hasPart.length} questions, page renders ${onPage}`);
    }
    for (const q of quizLd.hasPart) {
      if (!html.includes(q.acceptedAnswer.text)) {
        errors.push(`${name}: Quiz JSON-LD names an answer that is not on the page ("${q.acceptedAnswer.text}")`);
      }
    }
  }
}

// ---- The `:has()` pair that makes the quiz degrade instead of break ---------
//
// `.kt-opt:has(input) .kt-fb{display:none}` is the feature test AND the hide;
// its partner reveals the chosen one. Lose the first and every answer is
// visible from the start (the quiz stops being a quiz). Lose the second and no
// answer can ever be reached. Neither shows up as a broken page, and PurgeCSS
// has already been caught silently dropping a `:has()` rule on this site once
// (design/09 §A3) — so assert both survived the pipeline.
for (const file of readdirSync(join(SITE, 'css')).filter((n) => /^chiasekinhnghiem\./.test(n))) {
  const css = readFileSync(join(SITE, 'css', file), 'utf8');
  for (const needed of [
    '.kt-opt:has(input) .kt-fb',
    '.kt-opt:has(input:checked) .kt-fb',
    '.kt-hoc-open:has(input) .kt-hoc-promise',
    '.kt-hoc-open:has(input:checked) .kt-hoc-promise',
  ]) {
    if (!css.includes(needed)) {
      errors.push(`css/${file}: lost the rule "${needed}" — the quiz cannot work without it (design/09 §A3, PurgeCSS)`);
    }
  }

  // The verdict pair must exist in BOTH themes. A missing dark value would
  // leave the lit green and red on the near-black paper, where the red drops
  // to roughly 3:1 — readable enough to ship unnoticed, under the floor.
  for (const token of ['--ok:', '--no:']) {
    if ((css.match(new RegExp(token.replace('-', '\\-'), 'g')) || []).length < 2) {
      errors.push(`css/${file}: ${token} is declared for only one theme — right/wrong must be re-derived on the dark paper`);
    }
  }
}

if (errors.length) {
  console.error('  check        ✗ build verification FAILED:');
  for (const e of errors) console.error(`      - ${e}`);
  process.exit(1);
}
console.log(`  check        ✓ ${htmlFiles.length} pages verified (files, references, no template leaks)`);
