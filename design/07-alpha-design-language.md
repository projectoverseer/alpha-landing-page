# 07 — «Đúng» · The Alpha Design Language

**Đúng** (Vietnamese: *right, correct, exact*) is Alpha's own design language.
It is the visual form of the company's one promise — **right the first time** —
and it replaces borrowed philosophies: we consulted Apple's HIG and USWDS the
way an engineer consults a standard, but what ships is *ours*. This document is
the single self-contained reference; nothing in it requires reading Apple's
docs to apply.

> The test for every decision:
> *Does it read as standard, professional, human, and precise — and would a
> careful factory director trust it?*
> When two options pass, pick the calmer one.

---

## 1. The three voices

Đúng speaks in three registers, mapped to the business story (design/01):

| Voice | Where | What it looks like |
|---|---|---|
| **Calibration** — *we measure* | Most of the page: white sections, grids, cards | Cool-ink text on white, hairline rules, tabular numerals, numbered section markers |
| **Atelier** — *we craft* | The summit moments: hero, About, the CTA panel | Deep ink surfaces, ink-gradient scrims over real imagery, generous space, white type |
| **Dye** — *the moment that matters* | Metrics, CTAs, key marks — never more than ~10% of a view | The signature warm orange, always as a spotlight, never a wash |

If a view has no obvious "moment that matters," it gets **no** dye.

## 2. Color (tokens live in `css/main.scss`)

- **Ink** `#07151f → #2f5167` — dark surfaces and near-black text. Alpha's
  neutrals are *cool* (a breath of blue in every gray): the color of
  measurement, water, and machine steel — never warm beige, never pure black.
- **Slate / Mist / Paper** `#46586a → #f6f9fb` — secondary text, hairlines,
  fills. Separation comes from hairlines and air, not boxes and tints
  (owner rule: the white baseline stays uniform).
- **Dye** `#e35205`, deep `#b8390a`, bright `#ff6a1a`, tint `#fdece2` — the
  industry's own color, earned honestly. Contrast contract: small text never
  uses raw `$dye` (fails AA on white); small accent text and CTA fills use
  `$dye-deep` (white on it ≈ 5:1 ✓). Buttons ride the ramp:
  rest `$dye-deep` → hover `#c9420c` → pressed `#a33208`.
- **Blue** `#004c97` / `#009cde` — links and the cool counterpoint. Blue says
  "you can act on this"; dye says "this is the point."
- Even `::selection` carries a quiet dye wash — the brand shows up in the act
  of reading closely, without adding a single element.

## 3. Type

- **One face: Inter Variable** (superseded Public Sans 2026-07-14), all roles —
  voice comes from size, weight, and space, never a second family. Its `opsz`
  14–32 axis does the optical work: body and chrome sit at the 14 floor, and
  every heading and section marker is pinned to 32 — the "Inter Display" cut the
  maker drew for large type — so all headings share one refined drawing while
  only their size ramps across breakpoints. The big metric figures keep a
  size-tuned optical size. No second file is loaded; 32 is the axis top of the
  one variable font. Platform-native fallback stack.
- **Body 16px**, lead 17px, footnote 13px. Headings step at breakpoints
  (`--fs-*` custom properties), no fluid `clamp()` (owner direction).
- **Letter-spacing, from the font out**: 0 wherever an element renders near the
  size its opsz cut was drawn for (body, nav, buttons, h1/h2, metrics). Where
  size and cut diverge, the element gets back the residual of Inter's own
  dynamic-metrics curve: +0.01em on 13px small text (stuck at the opsz-14
  floor), +0.005em on h3 (20–24px on the opsz-32 display cut). Uppercase labels
  are letterspaced classically (+0.08em).
- **The signature move: tabular numerals for the numbers that prove something**
  (`.metric`). Figures that line up are the typography of measurement — this is
  the most "Đúng" thing on the page. The section markers, by contrast, are
  proportional: a marker never sits in a column with another, so it reads as a
  display number, not a data field.
- `.kicker` — 13px, semibold, uppercase, slate — is the technical eyebrow that
  marks calibrated content.

## 4. Space & shape

- 4px base grid throughout (`$spacers`); section rhythm 48/72/96px; content
  column ≈ 1140px with generous margins. Whitespace is the confidence signal.
- **Corners are continuous** — the n = 4 squircle (`squircle.js`,
  `corner-shape: superellipse(2)`, radius depth-matched ×1.8409) applied
  progressively where supported; the exponent eases back toward the authored
  circle on elements too small to fit the full curve, so depth is never lost.
  Corner geometry follows the squircle convention, **not** φ — φ stays a
  *finishing splash*, never the structural backbone (owner rule).
- Hairlines are translucent (`rgba` separators) so they adapt to any surface.

## 5. Imagery & scrims

Real factory, real people, real dyed material — never stock abstraction.
Dark overlays are **ink gradients, not black**: top-to-bottom
`rgba(7,21,31,…)` densities (≈ .74 → .66 → .84) that keep white type over AA
while making the photo read as dyed material. Portraits and cards share the
squircle radius; partner logos sit on their brands' own fills.

## 6. Motion

Swift, soft, decelerating: `--ease-precise: cubic-bezier(.2,.8,.2,1)`,
durations 160/280/400ms. Motion only ever *confirms* (press scale 0.97, menu
fade, the review deep-link glow that holds through the glide and settles on
arrival). Everything honors `prefers-reduced-motion`; nothing moves to
decorate.

## 7. Non-negotiables

1. **WCAG 2.2 AA** on every pairing — including `forced-colors`,
   `prefers-contrast: more`, and `prefers-reduced-transparency` blocks
   (see the end of `_sass/_base.scss`).
2. **Performance is a design feature**: LCP hero preloaded, AVIF +
   `image-set()`, self-hosted subset fonts, purged CSS, slim JS bundle,
   fingerprinted assets. A janky page contradicts the brand.
3. **Evidence over adjectives** in copy and in pixels: if a claim can carry a
   number, set the number large and tabular; if it can't, question the claim.
4. **The calm white baseline is sacred** — no section tints, no divider
   theatrics, no per-section personality (owner-settled, see design/05 Pass 7).
5. **Honesty devices stay**: "read the original in Vietnamese" links, real
   names, real dates, aspiration brands framed as *standards to meet*, never
   as clients.

## 8. Vocabulary of parts (all implemented in `_sass/_base.scss`)

`.kicker` · `.metric` (+ `__unit`, `__from/__to` for deltas) ·
`.heading-number` (calibration marker: Inter Display index + hairline run-out) ·
`.btn-primary` / `.btn-ghost` on `.btn-xl` · `.service-box` ·
`.partner-logo-card` · the parked `header.hero-precision` (kicker → headline →
lead → dual CTA → metric strip), ready for the day the precision positioning
is approved for the Vietnamese page.
