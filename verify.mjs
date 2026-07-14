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
if (!hashed('js', 'squircle', 'js')) errors.push('missing fingerprinted js/squircle.<hash>.js');
if (!hashed('js', 'kt-lightbox', 'js')) errors.push('missing fingerprinted js/kt-lightbox.<hash>.js');

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

if (errors.length) {
  console.error('  check        ✗ build verification FAILED:');
  for (const e of errors) console.error(`      - ${e}`);
  process.exit(1);
}
console.log(`  check        ✓ ${htmlFiles.length} pages verified (files, references, no template leaks)`);
