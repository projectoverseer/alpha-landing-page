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
 * WHY THE MATHML IS REWRITTEN BEFORE IT SHIPS (2026-08-04)
 * KaTeX does not emit MathML so much as a MathML transcription of TeX's own box
 * model, and mhchem leans on that hard. Every chemical subscript came out as a
 * script hung on an EMPTY box, with the digit itself smashed to zero height:
 *
 *     <mrow><mi>C</mi><mi>H</mi></mrow>
 *     <msub>
 *       <mpadded width="0px"><mphantom><mi>X</mi></mphantom></mpadded>
 *       <mpadded height="0px"><mn>2</mn></mpadded>
 *     </msub>
 *
 * — a zero-width phantom base so the script sits beside the preceding atom, and
 * a zero-height subscript so every subscript in a formula lands at one depth
 * whatever it hangs off. That is exactly how TeX does it, and Blink plays along.
 * WebKit does not: it drops the contents of an `<mpadded height="0px">` on the
 * floor. The digit gets a layout box (it measures non-zero, so nothing warns)
 * and then never paints. On iPadOS the Nylon 6.6 chain read
 *
 *     −[NH−(CH )₆−NH−CO−(CH ) −CO]ₙ−
 *
 * with a hole where each CH₂ should be — a formula that is not merely ugly but
 * WRONG, on the one device class this hub is most often read on, while Windows
 * and Android showed it perfectly. Verified against real WebKit (Playwright,
 * WebKit 26.5) on 2026-08-04, and against Blink for the no-regression half.
 *
 * The fix is not a workaround, it is the markup that should always have shipped:
 * a subscript belongs to the thing it subscripts. `attachScripts` below throws
 * the phantom away and hangs the script on its real base, so `CH2` becomes
 *
 *     <msub><mrow><mi>C</mi><mi>H</mi></mrow><mn>2</mn></msub>
 *
 * which is canonical MathML built from msub/msup/msubsup/mrow/mi/mn/mo alone —
 * the oldest and most universally implemented corner of the language, with no
 * <mpadded> and no <mphantom> anywhere on the page. It renders identically in
 * Blink and WebKit, and it is what a screen reader needs in order to say "C H
 * sub 2" instead of announcing an empty base. The equations, which never went
 * near mhchem, were already plain msup/msqrt/mfrac and are untouched by this.
 *
 * verify.mjs gates <mpadded>/<mphantom> out of the built pages, so the day a new
 * mhchem construct smuggles one back in, the build says so instead of an iPad.
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
import { pathToFileURL } from 'node:url';
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

// ---------------------------------------------------------------------------
// A very small reader for KaTeX's MathML, so the rewrites below are tree
// surgery rather than regex-on-markup. It only has to cope with what KaTeX
// emits: well-formed elements, double-quoted attributes, no comments, no CDATA,
// no namespaces beyond the one xmlns on <math>. Text is kept exactly as it
// arrives (still entity-escaped) and handed back untouched, so anything this
// file does not deliberately change round-trips byte for byte.
// ---------------------------------------------------------------------------

const TAG = /<(\/)?([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/)?>/g;

const parse = (xml) => {
  const root = { tag: '#root', attrs: '', children: [] };
  const stack = [root];
  let at = 0;
  for (const m of xml.matchAll(TAG)) {
    const [raw, closing, tag, attrs, selfClosing] = m;
    const top = () => stack[stack.length - 1];
    if (m.index > at) top().children.push({ tag: '#text', text: xml.slice(at, m.index) });
    at = m.index + raw.length;
    if (closing) {
      stack.pop();
      continue;
    }
    const node = { tag, attrs: attrs || '', children: [], selfClosing: Boolean(selfClosing) };
    top().children.push(node);
    if (!selfClosing) stack.push(node);
  }
  if (at < xml.length) root.children.push({ tag: '#text', text: xml.slice(at) });
  return root;
};

const serialize = (n) => {
  if (n.tag === '#text') return n.text;
  const inner = n.children.map(serialize).join('');
  if (n.tag === '#root') return inner;
  if (n.selfClosing && !n.children.length) return `<${n.tag}${n.attrs}/>`;
  return `<${n.tag}${n.attrs}>${inner}</${n.tag}>`;
};

const el = (tag, children = [], attrs = '', selfClosing = false) => ({ tag, attrs, children, selfClosing });

// mhchem's zero-width phantom: the empty box a script is hung on so it sits
// beside the preceding atom instead of on top of it.
const isPhantomBase = (n) =>
  n?.tag === 'mpadded' &&
  /\bwidth="0px"/.test(n.attrs) &&
  n.children.length === 1 &&
  n.children[0].tag === 'mphantom';

// mhchem's \smash: the zero-height box that levels every subscript in a formula
// to one depth. This is the box WebKit refuses to paint the contents of. It comes
// as `height="0px"` on a subscript and `height="0px" depth="0px"` on a charge, so
// the test is "every attribute it has is a zero height or depth".
const isSmashed = (n) =>
  n?.tag === 'mpadded' &&
  n.attrs.trim() !== '' &&
  [...n.attrs.matchAll(/([\w:-]+)="([^"]*)"/g)].every(
    ([, k, v]) => (k === 'height' || k === 'depth') && v === '0px',
  );

const unsmash = (n) => {
  if (!isSmashed(n)) return n;
  return n.children.length === 1 ? n.children[0] : el('mrow', n.children);
};

// Nothing a reader can see. An mhchem script slot can be pure phantom — the
// EMPTY subscript of a leading charge, `\ce{^+H3N}` — and MathML spells an empty
// script <none/>, never a box full of invisible boxes.
const isBlank = (n) => {
  if (!n) return true;
  if (n.tag === 'mphantom') return true;
  if (n.tag === '#text') return n.text.trim() === '';
  return n.children.every(isBlank);
};

// A script needs something to hang on. Everything mhchem puts in front of one is
// fair game except its own spacing atoms — an empty <mrow> or an <mspace/> would
// give a base that is invisible, which is the bug we are leaving behind.
const canCarryScript = (n) =>
  n &&
  n.tag !== '#text' &&
  n.tag !== 'mspace' &&
  !(n.tag === 'mrow' && n.children.length === 0);

// What goes in a script slot has to be the charge itself, not the scaffolding
// mhchem built to place it. A leading charge (`\ce{^+H3N}`) arrives as a
// zero-width phantom of the charge, then the charge again inside
// `<mpadded lspace="-1width" width="0px">` — a negative kern expressed in the
// pseudo-unit MathML Core REMOVED, so Blink drew the + on top of the H and
// WebKit dropped it altogether. Strip the zero-width boxes and the phantoms and
// what is left is `<mo>+</mo>`, which every engine can place on its own.
//
// Deliberately narrow: it only unwraps a box declared ZERO wide, so the
// `<mpadded width="+0.6em" lspace="0.3em">` that carries the conditions over a
// reaction arrow — real spacing, correct in both engines — is left alone.
const tidyScript = (n) => {
  if (!n || n.tag === '#text') return n;
  const kids = n.children.flatMap((c) => {
    if (isBlank(c)) return [];
    const tidy = tidyScript(c);
    return tidy.tag === 'mpadded' && /\bwidth="0px"/.test(tidy.attrs) ? tidy.children : [tidy];
  });
  if (n.tag === 'mrow' && kids.length === 1) return kids[0];
  return { ...n, children: kids };
};

const SCRIPTS = { msub: ['sub'], msup: ['sup'], msubsup: ['sub', 'sup'] };

// Build the tightest script element that says what is meant: an empty slot
// collapses the element rather than shipping an invisible one.
const script = (base, sub, sup) => {
  const node =
    sub && sup
      ? el('msubsup', [base, sub, sup])
      : sub
        ? el('msub', [base, sub])
        : el('msup', [base, sup]);
  node.attached = true;
  return node;
};

// Replace mhchem's phantom-based scripts with the real thing: the script hung on
// its actual base. A sub and a sup on the SAME atom (SO4^2- → an msub then an
// msup, both phantom-based) merge into one <msubsup>, which is both correct
// MathML and the only way the two land in one column.
const attachScripts = (node) => {
  for (const child of node.children) if (child.children) attachScripts(child);
  if (!node.children.length) return;

  const out = [];
  // A charge that OPENS a formula — the ammonium in `\ce{^+H3N-F}` — has nothing
  // to its left, so it is held here until the atom it belongs to arrives and then
  // hung in FRONT of it. That is what <mmultiscripts>/<mprescripts> is for; the
  // phantom base it replaces drew the charge on top of the following letter in
  // Blink and dropped it entirely in WebKit.
  let pending = null;

  const push = (n) => {
    if (pending && canCarryScript(n)) {
      const { sub, sup } = pending;
      pending = null;
      out.push(
        el('mmultiscripts', [n, el('mprescripts', [], '', true), sub ?? el('none', [], '', true), sup ?? el('none', [], '', true)]),
      );
      return;
    }
    out.push(n);
  };

  for (const child of node.children) {
    const slots = SCRIPTS[child.tag];
    if (!slots || !isPhantomBase(child.children[0])) {
      push(child);
      continue;
    }

    const parts = {};
    slots.forEach((slot, i) => {
      const raw = unsmash(child.children[i + 1]);
      if (!isBlank(raw)) parts[slot] = tidyScript(raw);
    });
    if (!parts.sub && !parts.sup) continue; // a script with nothing in it

    const prev = out[out.length - 1];
    if (!canCarryScript(prev)) {
      pending = parts;
      continue;
    }

    out.pop();
    // Only fold into the neighbour when it is one WE just attached — a genuine
    // S_L from an equation must never swallow whatever follows it.
    if (prev.attached && prev.tag === 'msub' && parts.sup && !parts.sub) {
      out.push(script(prev.children[0], prev.children[1], parts.sup));
      continue;
    }
    out.push(script(prev, parts.sub, parts.sup));
  }

  // A charge with nothing after it either: keep it visible on an empty base.
  if (pending) out.push(script(el('mrow'), pending.sub, pending.sup));

  node.children = out;
};

// Any \smash box that was not consumed above (a lone \smash in an equation, a
// future mhchem construct) still must not reach WebKit. Unwrap it: the levelling
// it asks for is cosmetic, and losing the glyph is not.
const unsmashAll = (node) => {
  node.children = node.children.map((c) => {
    if (c.children) unsmashAll(c);
    return unsmash(c);
  });
};

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
const iso = (node) => {
  // A BARE <mi> is the one KaTeX left as an identifier; anything it had an
  // opinion about already carries mathvariant.
  if (node.tag === 'mi' && node.attrs === '') {
    const sym = node.children.map((c) => c.text ?? '').join('');
    node.attrs = ` mathvariant="normal"${SINGLE(sym) ? ' class="kt-var"' : ''}`;
  }
  for (const child of node.children ?? []) iso(child);
};

// Exported so the notation standard can be exercised without a Jekyll build:
// feeding design 05's whole construct list through the REAL renderer, and
// screenshotting the result in WebKit and Blink, is how a formula that only
// breaks on one engine gets caught here instead of on a reader's iPad.
export const render = (tex, displayMode, file) => {
  try {
    const tree = parse(unwrap(katex.renderToString(decode(tex), { output: 'mathml', displayMode })));
    attachScripts(tree);
    unsmashAll(tree);
    iso(tree);
    return serialize(tree);
  } catch (err) {
    throw new Error(`optimize:math  ✗ ${file}\n      ${tex.trim()}\n      ${err.message}`);
  }
};

// Importing this file must not touch _site — see the note on `render`. Only the
// build run, `node optimize-math.mjs`, walks the pages.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
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
}
