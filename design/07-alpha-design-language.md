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

**The one sentence that decides every surface — the page is cool, the dye is a
spark** (08 §6.3). Every neutral surface is white or a blue-leaning cool: the
bar is white; menus, the footer strip and the quote grounds are the cool grey
(a quote sits on neutral grey by owner decision — a witness's ground should be
colourless so the words read as theirs); and the one place the page asks for
trust in Alpha's own name — the Lợi ích band — takes the logo's palest blue,
dilute. Warmth appears only as the dye, in sparks: markers, CTAs, selection
and marks, quotation marks. (A full warm
shell was transplanted from the product's *"greige ấm = trung tính của VỎ"*
rule and rejected by the owner on sight the same day — the history, and why the
rule could not transfer to a white page, are 08 §6.3.)

- **Ink** `#07151f → #f6f9fb` — ONE cool neutral ramp covering dark surfaces,
  every text tier, hairlines and fills. Alpha's neutrals are *cool* (a breath of
  blue in every gray): the color of measurement, water, and machine steel — and
  the key rungs are the product's own greys (`$fg` = its ink `#0E1B27`,
  `$fg-muted` = its `#46586A`, exactly). It replaced four overlapping ramps
  (`$gray-*`, `$ink-*`, `$slate-*`, `$mist-*/$paper-*`), two of which held the
  same colour under different names.
- **The two tints are derived, not picked**: `$blue-25/50` is `$blue-100` — the
  palest blue Alpha prints — composited on the page at 12 / 24%, the same
  compositing rule that generates `$selection-bg`. They cannot drift off-brand
  because they **are** the logo's blue, dilute. 24% is the deepest strength
  that holds AA for every text tier: a floor, not a preference.
- Separation still comes from hairlines and air, not boxes and tints (owner
  rule: the white baseline stays uniform — the one surviving band is 08 §6.2).
- **Dye** `#e35205` (the mark itself), bright `#ff8f1c`, deep `#b8390a` — the
  industry's own color, earned honestly, and every rung is either a stop taken
  out of the logo file or a measured interaction state derived from one.
  Contrast contract: small text never uses raw `$dye` (fails AA on white); small
  accent text and CTA fills use `$dye-700` (white on it ≈ 5:1 ✓). Buttons ride
  the ramp: rest `#b8390a` → hover `#c9420c` → pressed `#a33208`.
- **Blue** — one hue. Measured in CIELCh every blue in the logo sits at h
  275–284°, and so does every rung: `#8dc8e8` / `#009cde` / `#0066cc` /
  `#004c97` / `#003865`. Blue says "you can act on this"; dye says "this is the
  point." `$link` stays `#0066cc` and *cannot* be the wordmark's `#004c97`,
  because links here are not underlined and WCAG G183 needs 3:1 against body
  text — `#0066cc` gives 3.13, `#004c97` gives 2.06 (08 §6.4). Icons take the
  deepest rung, one step off links, so a feature glyph never reads as clickable.
- **Selection and marking are a recipe, not two swatches**: a selection is
  `$dye-500` at **24%**, a mark is `$dye-300` at **58%**, composited on whatever
  paper the product uses. Both opaque (background *and* ink) because a
  translucent wash cannot be guaranteed on four grounds — the AA failure that
  forced it is 08 §5.1, along with the rule for what may and may not be
  selected. The hub runs the identical two percentages on its own paper, which
  is how two products that share no colour, typeface or voice still share a
  reflex.
- **Icons are Material Symbols, Outlined, fill 0, weight 400, grade 0**, at the
  optical size they actually render at — the full argument, the axis table, the
  per-icon audit and the "a glyph rides an action, never a label" rule are 08
  §9. Feature icons are inlined SVG at `--size-icon` (48/56/64px). Two downward
  marks, both `mask` in `currentColor` so neither needs a colour of its own:
  the **chevron** for *expands in place*, the **caret** for *a menu opens*.

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
- **Corners are plain** — an ordinary circular `border-radius` from the shared
  `corner()` mixin (08 §2). Five radii, each bound to a kind of object. The
  superellipse was switched off 2026-07-28 (owner: *"hơi unconventional"*) and
  `js/squircle.js` was deleted before it; the reasoning, and the two bugs the
  superellipse was causing, are 08 §2.1. Corner geometry does **not** follow φ —
  φ stays a *finishing splash*, never the structural backbone (owner rule).
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
reachable on a phone) · `.actions` (a CTA row that stacks
full-width under sm) · `.kicker` · `.metric` (+ `__unit`, `__from/__to`) ·
`.heading-number` (calibration marker: Inter Display index + hairline run-out;
dye on white, and the wordmark blue on the blue band — the band is monochrome
cool on purpose, 08 §6.2) ·
`.btn-primary` / `.btn-ghost` on `.btn-xl` · `.service-box` ·
`.partner-logo-card` · `.review-card` (the testimonial device: portrait, words
and name enclosed on the neutral grey quote ground — a review is testimony, not
a styled paragraph, and a witness's ground is colourless; 08 §9.5) ·
`.prose blockquote` (an aside inside an article:
same quote ground, a 3px dye rule down the speaker's side, muted italic type) ·
`.footer-strip` · the parked `header.hero-precision` (kicker → headline →
lead → dual CTA → metric strip), ready for the day the precision positioning
is approved for the Vietnamese page.
