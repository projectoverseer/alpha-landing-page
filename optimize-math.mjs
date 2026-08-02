/**
 * Renders the LaTeX in Chia sẻ kinh nghiệm articles to static MathML, at build time.
 *
 * WHY MathML AND NOT A MATH LIBRARY IN THE PAGE
 * Equations used to be typed as Unicode soup with <sub> tags — unreadable in the
 * source, wrong on screen, meaningless to a screen reader or a crawler. The
 * obvious fix is MathJax/KaTeX in the browser, but that means shipping a
 * library, its fonts, and a render pass on a page whose whole promise is that it
 * is fast and still. MathML is the standard answer instead: it is part of HTML,
 * every current browser lays it out natively, it is real selectable text (so
 * Google indexes it and a screen reader speaks it as maths), and it costs zero
 * bytes of JavaScript. So we render the LaTeX here, once, and ship the result.
 *
 * HOW THE LATEX GETS HERE
 * The author writes ordinary LaTeX between `$$…$$` in the Markdown (block or
 * inline — kramdown uses the same delimiter for both). GitHub Pages forces
 * kramdown's `math_engine: mathjax`, which does not resolve anything: it just
 * hands the TeX through to the HTML, HTML-escaped, as
 *
 *     \[ … \]   for a display equation (a bare top-level node, no <p>)
 *     \( … \)   for an inline one (inside the paragraph)
 *
 * — the delimiters a browser-side MathJax would have picked up. Nothing does
 * pick them up here: this step finds them and swaps in KaTeX's MathML instead.
 * A `\left[`/`\right]` inside an equation cannot be mistaken for a delimiter,
 * because the bracket there is preceded by a letter, never by a backslash.
 *
 * The MathML carries the original TeX with it, in the <annotation> element KaTeX
 * emits — the equation stays machine-readable, and copy-paste into any other
 * tool still yields the source.
 *
 * A malformed formula throws and fails the build, which is the point: a silently
 * broken equation on a page about measuring colour deviation is worse than no
 * page at all.
 *
 * CHEMISTRY RIDES THE SAME RAIL
 * `\ce{…}` (mhchem) is loaded below, so a formula, a functional group, a polymer
 * repeat unit or a whole reaction equation is written in the same `$$…$$` an
 * equation uses, and comes out as the same MathML — indexable text, spoken
 * correctly, no extra bytes. The notation standard is
 * design/chia-se-kinh-nghiem/05-ky-hieu-khoa-hoc.md; this file only has to load the
 * extension. mhchem is what Wikipedia and every chemistry journal template use,
 * which is the point: bonds, arrows, charges and states get ONE spelling that
 * post 1000 still resolves the same way as post 15.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';
// Registers \ce and \pu on the KaTeX macro table. Import for side effect only,
// and BEFORE the first render call.
import 'katex/dist/contrib/mhchem.mjs';

const HUB = '_site/chia-se-kinh-nghiem';

// kramdown escapes the TeX on its way into the HTML; undo that before parsing it.
const decode = (s) =>
  s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&'); // last: an escaped "&amp;lt;" must not become "<"

// KaTeX wraps its MathML in a <span class="katex">; we lay the equation out
// ourselves, so unwrap it and keep the markup to the <math> element alone.
const unwrap = (html) => html.replace(/^<span class="katex">/, '').replace(/<\/span>$/, '');

// ISO 80000-2 typography: a QUANTITY symbol is italic, everything else upright.
// (Owner's standing decision, 2026-08-02: the site follows the international
// standards — ISO 80000-2 for maths and physics, IUPAC for chemistry — in place
// of the earlier blanket "everything upright" house rule.)
//
// So: E, L, a, b, S, l, c, and the polymer index n are italic; Δ (a difference
// OPERATOR), CMC (an abbreviation), sin/log/exp (function names), element
// symbols, unit symbols and state labels are upright.
//
// KaTeX has already drawn most of that line for us. It writes
// mathvariant="normal" on everything it knows is not a variable — \mathrm{},
// mhchem's element symbols, uppercase Greek — and leaves a BARE <mi> for an
// identifier. One correction is needed on top: a bare <mi> holding more than one
// character is a function name (sin, log, exp, lim), which ISO sets upright. So
// the rule is "bare AND single character ⇒ variable".
//
// Both branches still get mathvariant="normal", and that is the subtle part.
// The attribute is not about slant here — it is the only thing stopping the
// browser's `text-transform: math-auto` from SWAPPING THE CHARACTER: L (U+004C)
// would become 𝐿 (U+1D43F, Mathematical Italic Capital L), a codepoint no
// reading face has a glyph for, so the letter drops out of Literata into
// whatever maths font the OS ships. Keeping the plain ASCII letter and slanting
// it with CSS (`.kt-var { font-style: italic }`, against the real Literata
// italic face) gives a true italic that is still the body face — which is what
// the standard actually asks for, and what a swapped codepoint never was.
const SINGLE = (s) => [...s].length === 1;
const iso = (html) =>
  html.replace(
    /<mi>([^<]*)<\/mi>/g,
    (_, sym) =>
      `<mi mathvariant="normal"${SINGLE(sym) ? ' class="kt-var"' : ''}>${sym}</mi>`,
  );

const render = (tex, displayMode, file) => {
  try {
    return iso(unwrap(katex.renderToString(decode(tex), { output: 'mathml', displayMode })));
  } catch (err) {
    throw new Error(`optimize:math  ✗ ${file}\n      ${tex.trim()}\n      ${err.message}`);
  }
};

if (!existsSync(HUB)) throw new Error('optimize:math: _site/chia-se-kinh-nghiem is missing — did the Jekyll build run?');

let equations = 0;
let files = 0;

for (const name of readdirSync(HUB, { recursive: true })) {
  if (!String(name).endsWith('.html')) continue;
  const abs = join(HUB, name);
  const before = readFileSync(abs, 'utf8');

  const after = before
    // Display first: its \[…\] can contain no \(…\), so the order is safe either
    // way, but reading it in document order keeps the error messages meaningful.
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
      equations++;
      return `<div class="kt-equation">${render(tex, true, name)}</div>`;
    })
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
      equations++;
      return render(tex, false, name);
    });

  if (after !== before) {
    writeFileSync(abs, after);
    files++;
  }
}

console.log(`  optimize:math → ${equations} equation${equations === 1 ? '' : 's'} rendered to MathML (${files} pages)`);
