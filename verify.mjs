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
      ['the footer strip', /\.footer-strip\{background:(#[0-9a-f]{6})/i],
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

if (errors.length) {
  console.error('  check        ✗ build verification FAILED:');
  for (const e of errors) console.error(`      - ${e}`);
  process.exit(1);
}
console.log(`  check        ✓ ${htmlFiles.length} pages verified (files, references, no template leaks)`);
