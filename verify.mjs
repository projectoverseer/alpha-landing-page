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
 *      than loud, so it needs a gate of its own.
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
  'favicon.svg', 'favicon.ico', 'apple-touch-icon.png',
  'img/hero/hero-1920.avif',
  'fonts/literata/literata-latin.woff2',
  'fonts/literata/literata-vietnamese.woff2',
  'fonts/literata/literata-greek.woff2',
  'fonts/inter/inter-latin.woff2',
  'fonts/inter/inter-vietnamese.woff2',
  'fonts/math/alpha-math.woff2',
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

  // Hub only: kramdown hands LaTeX through as \[…\] / \(…\) for optimize:math to
  // turn into MathML. If a delimiter survives, the equation never rendered.
  if (name.startsWith('chia-se-kinh-nghiem') && /\\\[|\\\(/.test(html)) {
    errors.push(`${name}: unrendered LaTeX left in the page — did optimize:math run?`);
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

// ---- the squircle stays off ----
//
// This gate used to assert the OPPOSITE: that `@supports (corner-shape:
// superellipse(2))` had survived minification. The squircle was switched off
// 2026-07-28 (owner: "hơi unconventional" — quy-cu §2), so the check flips.
// It is kept rather than deleted because the failure it guards is the same
// either way: a corner geometry that changes without anyone noticing. A stray
// `corner-shape` reintroduced by a copied snippet would give one browser a
// different silhouette from every other, which is exactly the split the
// deactivation was for.
for (const stem of ['main', 'chiasekinhnghiem']) {
  const file = readdirSync(join(SITE, 'css')).find(
    (f) => f.startsWith(`${stem}.`) && f.endsWith('.css'),
  );
  if (!file) continue;
  const css = readFileSync(join(SITE, 'css', file), 'utf8');

  if (/corner-shape/.test(css)) {
    errors.push(
      `css/${file}: corner-shape is back — the squircle is meant to be off (quy-cu §2)`,
    );
  }
  // The depth-matched radii the squircle needed: 8 × 1.8409 = 14.7272,
  // 12 × = 22.0908, 16 × = 29.4544. Any of those surviving means a call site is
  // still scaling by hand.
  if (/border-radius:\s*(?:14\.7|22\.09|29\.45)/.test(css)) {
    errors.push(`css/${file}: a depth-matched radius survived — a call site is still × 1.8409`);
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
}

if (errors.length) {
  console.error('  check        ✗ build verification FAILED:');
  for (const e of errors) console.error(`      - ${e}`);
  process.exit(1);
}
console.log(`  check        ✓ ${htmlFiles.length} pages verified (files, references, no template leaks)`);
