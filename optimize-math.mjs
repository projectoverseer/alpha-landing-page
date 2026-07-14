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
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';

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

// Variables are set UPRIGHT here — no italic L, C, S. Two reasons, and the
// second is the one that matters.
//
// It is the owner's call: in a Vietnamese dyehouse, ΔE* and S_L are written
// upright on the spec sheet and on the machine, and the article should look like
// the trade it is written for, not like a physics paper.
//
// And it is the only way to keep the letters in Literata. A bare <mi> has no
// font-style — the browser instead applies `text-transform: math-auto`, which
// SWAPS THE CHARACTER: L (U+004C) becomes 𝐿 (U+1D43F, Mathematical Italic
// Capital L). No reading face has glyphs in that block, so every variable fell
// out of Literata and into whatever maths font the OS shipped — which is exactly
// what made the equations look foreign. `mathvariant="normal"` (the one
// mathvariant value MathML Core kept) turns the substitution off, and the plain
// ASCII letter renders in the body face like the rest of the sentence.
//
// KaTeX already writes it on multi-letter identifiers (\mathrm{CMC}) and on Δ;
// the regex only matches an <mi> that carries no attribute at all.
const upright = (html) => html.replaceAll('<mi>', '<mi mathvariant="normal">');

const render = (tex, displayMode, file) => {
  try {
    return upright(unwrap(katex.renderToString(decode(tex), { output: 'mathml', displayMode })));
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
