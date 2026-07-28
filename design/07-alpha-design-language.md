# 07 — «Đúng» · The Alpha Design Language

**Đúng** (Vietnamese: *right, correct, exact*) is Alpha's own design language.
It is the visual form of the company's one promise – **right the first time** –
and it replaces borrowed philosophies: we consulted Apple's HIG and USWDS the
way an engineer consults a standard, but what ships is *ours*. This document is
the single self-contained reference for how the MAIN SITE looks; nothing in it
requires reading Apple's docs to apply. How both products *behave* — space,
corners, targets, motion, focus, contrast — is `08-quy-cu.md`.

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

Structure: **ramps → roles → Bootstrap bridge** (see 08 §6). A component names a
*role*; only the role layer names a hex. Every pairing that ships is measured.

- **Ink** `#07151f → #f6f9fb` — ONE cool neutral ramp, twelve rungs, covering
  dark surfaces, every text tier, hairlines and fills. Alpha's neutrals are
  *cool* (a breath of blue in every gray): the color of measurement, water, and
  machine steel — never warm beige, never pure black. It replaced four
  overlapping ramps (`$gray-*`, `$ink-*`, `$slate-*`, `$mist-*/$paper-*`), two
  of which held the same colour under different names.
- Separation comes from hairlines and air, not boxes and tints (owner rule: the
  white baseline stays uniform — the one surviving band is 08 §6.2).
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
  14–32 axis does the optical work, driven by `font-optical-sizing: auto`
  (2026-07-28, the maker's own recommended usage): every rung gets the drawing
  cut for the px it actually renders at, including for a reader on a larger
  default text size. No second file is loaded; 32 is the axis top of the one
  variable font. Platform-native fallback stack.
- **Body 16px/1.6**, lead 17px, metadata 14px — and 14 is the FLOOR for
  anything a reader must read or can tap (08 §7). Headings step at breakpoints
  (`--fs-*` custom properties), no fluid `clamp()` (owner direction). The
  leading is 1.6 because Vietnamese stacks a tone mark above a vowel mark.
- **Letter-spacing: none** (2026-07-28). With the axis following the rendered
  size, Inter's own tracking curve applies correctly at every rung and a fixed
  value would fight it at all of them. The one survivor is classical rather
  than metric: a run of CAPITALS is letterspaced +0.08em, because capitals are
  drawn to lead a lowercase word, not to stand in a row of their own.
- **Chosen OpenType alternates**: `ss03` round quotes and commas, `ss01` open
  digits, `cv01` curved one, plus `case` on uppercase labels — bound by name
  through `@font-feature-values`, never as raw tags (a feature tag is a
  coordinate in ONE font's table). Reasoning in `_sass/_fonts.scss`.
- **The signature move: tabular numerals for the numbers that prove something**
  (`.metric`). Figures that line up are the typography of measurement — this is
  the most "Đúng" thing on the page. The section markers, by contrast, are
  proportional: a marker never sits in a column with another, so it reads as a
  display number, not a data field.
- `.kicker` — 14px, semibold, uppercase, slate — is the technical eyebrow that
  marks calibrated content.

## 4. Space & shape

- The **quy củ space ladder** (08 §1) — one 4px ladder, eleven rungs, shared
  with the reading hub. Section rhythm 48/64/96px; content column ≈ 1140px with
  generous margins. Whitespace is the confidence signal.
- **Corners are continuous** — the n = 4 squircle, `corner-shape:
  superellipse(2)` with the radius depth-matched ×1.8409, from the shared
  `squircle()` mixin (08 §2). Five radii, each bound to a kind of object. It is
  pure CSS as of 2026-07-28; `js/squircle.js` was deleted. Corner geometry
  follows the squircle convention, **not** φ — φ stays a *finishing splash*,
  never the structural backbone (owner rule).
- Hairlines are translucent (`rgba` separators) so they adapt to any surface.

## 5. Imagery & scrims

Real factory, real people, real dyed material — never stock abstraction.
Dark overlays are **ink gradients, not black**: top-to-bottom
`rgba(7,21,31,…)` densities (≈ .74 → .66 → .84) that keep white type over AA
while making the photo read as dyed material. Portraits and cards share the
squircle radius; partner logos sit on their brands' own fills.

## 6. Motion

One curve, three durations, shared with the reading hub (08 §4):
`--ease: cubic-bezier(.2,.8,.2,1)`, `--t-1` 120 / `--t-2` 200 / `--t-3` 320ms.
Motion only ever *confirms* (press scale 0.97, menu fade, the review deep-link
glow that holds through the glide and settles on arrival — the one named
exception, `--t-settle`). Everything honors `prefers-reduced-motion`; nothing
moves to decorate.

## 7. Non-negotiables

1. **WCAG 2.2 AA** on every pairing, measured not assumed — including
   `forced-colors`, `prefers-contrast: more`, and
   `prefers-reduced-transparency` blocks (end of `_sass/_base.scss`). The
   contrast contract is 08 §6.1.
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

`.navbar-call` (the chrome's one-tap dialler — the main page's purpose, made
reachable on a phone) · `.actions` (a CTA row that stacks full-width under sm) ·
`.kicker` · `.metric` (+ `__unit`, `__from/__to` for deltas) ·
`.heading-number` (calibration marker: Inter Display index + hairline run-out) ·
`.btn-primary` / `.btn-ghost` on `.btn-xl` · `.service-box` ·
`.partner-logo-card` · the parked `header.hero-precision` (kicker → headline →
lead → dual CTA → metric strip), ready for the day the precision positioning
is approved for the Vietnamese page.
