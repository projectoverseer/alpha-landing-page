# 02 — Design Principles

Seven principles translate the business idea — *precision* — into rules every
screen must obey. When a design decision is unclear, the answer is whichever
option is more **precise, more evidenced, and calmer.**

---

### 1. Precision by demonstration
The website is the first proof. A vendor who promises Right‑First‑Time cannot ship
a site with misaligned grids, loose spacing, or visual "defects." Every edge
aligns to the grid, every optical relationship is tuned, nothing is approximate.
**The craft of the site is the first sample batch we hand the customer.** If it
isn't right the first time, the pitch is dead on arrival.

### 2. Measured, not loud
Confidence shows through restraint. Generous whitespace, a strict grid, and
deliberate typographic rhythm read as *engineering elegance* — the opposite of
the busy, badge‑covered look of low‑trust industrial sites. Precision instruments
are quiet. So is this site. One strong idea per view; resist decoration that
doesn't carry meaning.

### 3. Evidence over adjectives
Numbers beat claims. "RFT 80% → 90%" outperforms "dramatically improves quality."
Real names, real photos, real dates, real factory logos. Wherever a sentence makes
a claim, ask: *can we replace it — or back it — with a measured fact?* Metrics get
visual weight (large, tabular figures); adjectives get cut.

### 4. Calm clarity, low cognitive load
The product's own promise is "very easy to use — even without computer
knowledge." The site must embody the same ease. Obvious hierarchy, predictable
flow, one decision at a time, a single primary action repeated (free
consultation). The reader should never have to work to understand what to do next.

### 5. Built for every screen, intrinsically
"Natural and intuitive across all modern devices and dimensions" is a hard
requirement. Design fluidly, not at three fixed breakpoints: fluid type
(`clamp()`), intrinsic layouts (CSS grid `auto-fit`/`minmax`, flexbox wrap,
container queries where useful), logical properties, and touch‑first targets
(≥44px). The layout should *reflow*, never *break*. Test the seams between
breakpoints, not just the breakpoints.

### 6. Accessible and honest = reliable
Reliability is the sales argument, so the site must be reliable for everyone.
WCAG 2.2 AA contrast, full keyboard operability, visible focus rings, semantic
landmarks, `prefers-reduced-motion`, `forced-colors`, and real alt text. Keep the
honesty signals already present (e.g. "show original review" disclaimers). An
inaccessible or misleading site contradicts the entire pitch.

### 7. Performance is a quality signal
Speed *is* precision the visitor can feel. Protect what the current build already
does well: preload the LCP hero, AVIF with `image-set()`, fingerprinted assets,
PurgeCSS, deferred JS, system‑safe font loading. Budget: fast LCP, ~zero layout
shift, no jank, lean CSS/JS. A heavy, janky redesign would itself be a defect.

---

## Translating the principles into a visual vocabulary

These are the *aesthetic levers* the design system (doc 04) will set precisely.
The specific values wait on the chosen art direction, but the vocabulary is fixed:

- **Grid & alignment** — a strict, visible‑in‑spirit grid. Precision reads as
  *things lining up*. Consider a baseline rhythm and tabular metric alignment.
- **Type** — a confident, legible sans for voice; **tabular/monospaced figures**
  for every metric (numbers that line up are the signature of measurement).
- **Color** — disciplined roles, not decoration. A refined version of the
  signature warm "dye" accent (it *is* the color of the industry) used sparingly
  to mark what matters; a calm, trustworthy neutral/structural base.
- **Space** — generous, mathematical spacing scale (already present); whitespace
  as a confidence signal.
- **Motion** — minimal and meaningful: metrics that resolve, reveals that respect
  reading order, nothing gratuitous. Always gated by `prefers-reduced-motion`.
- **Imagery** — real factory/material/color over stock abstraction; treated
  consistently (uniform crop, grade, corner radius).
- **Detail motifs** — measurement cues (tick marks, fine rules, calibration‑style
  framing, the existing squircle precision corners) used as *meaning*, not
  ornament.

> The north star: a visitor should sense, before reading a word, that this company
> is **exact**.
