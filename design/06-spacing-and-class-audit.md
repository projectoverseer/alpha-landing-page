# 06 — Spacing & Class Audit (measured)

A scrutiny of every spacing/layout/colour decision against the standards &
naturalness directive (design/01 §6a). Values are **measured from the live render**
(headless Chrome, `getComputedStyle` / `getBoundingClientRect`), not read off source.

> Notes live here in `design/` (the working‑docs folder, excluded from the build);
> the built site is in `docs/`. Measurements were taken from the running dev render
> of the current source, which is what `docs/` becomes on `npm run ship`.

## A. Rendered measurements — Overview section

| Property | 1440px (4 col) | 1000px (2 col) | 390px (1 col) |
|---|---|---|---|
| body font / line | 14 / 22px | 14 / 22 | 14 / 22 |
| section padding (t/b) | 132 | 88 | 55 |
| container width / side margin | 1148 / 146 | 1000 / 0 | 390 / 0 |
| container padding‑x | 22 | 22 | 22 |
| row `.mt-12` (heading→grid) | 66 | 66 | 66 |
| `.service-box` padding‑bottom | 44 | 44 | 44 |
| **inter‑item gap** | 22 (horizontal) | 22 (horizontal) | **44 (vertical, stacked)** |
| icon (`.bi`) | 62.7 | 54.8 | 44 |
| h2 | 32 | 31.4 | 26 |
| h4 (`.h4`) | 18 | 18 | 17 |
| icon → title (`.mt-4`) | 22 | 22 | 22 |
| **title → bullet list** (`ul`) | **0** | 0 | 0 |
| list item → item | 14 | 14 | 14 |
| marker → h2 (`.mb-4`) | 22 | 22 | 22 |

## B. Class inventory (every Bootstrap / utility class in the includes)

- **Layout:** `container`, `container-fluid`, `row`, `row-cols-{1,md-2,xl-2/3/4}`,
  `col`, `col-{md-5,md-7,12}`, `align-items-start`, `ms-auto`, `mx-auto`, `me-md-0`, `w-100`.
- **Spacing utilities in markup:** `mt-0`, `mb-0`, `mt-3`, `mt-4`, `mt-8`, `mt-12`,
  `mt-16`, `mb-16`, `my-0`, `px-0`, `pt-2`, `pb-2`, `pb-0`.
- **Colour / surface:** `bg-light` (benefits, pale blue), `bg-dark` (about, navy),
  `bg-primary` (support — overridden to deep‑ink CTA), `bg-gray-100` (footer bar),
  `text-center`, `text-secondary`, `text-tertiary`.
- **Components:** `heading-number`, `service-box`, `bi`, `spaced-items`, `card`,
  `partner-logo-card`, `stretched-link`, `accordion*`, `blockquote*`, `prose`,
  `client-portrait`, `hr`, `btn-primary`, `btn-xl`, `nav-link`, `navbar*`, `dropdown*`.

## C. Findings vs the directive

| # | Finding | Verdict |
|---|---|---|
| 1 | Inter‑item vertical gap **44px** (`.service-box` pad‑bottom = `$spacers-8`) | **Too large** — the reported issue. → **32px**. |
| 2 | Overview **title → list = 0px** while Benefits title → paragraph = 14px | **Inconsistent / too tight.** → lists in `.service-box` get `margin-top: 1em`. |
| 3 | Heading → grid **66px** (`.mt-12`) | Large for a section title→content step. → **48px** (`.mt-9`). |
| 4 | Horizontal gutter 22px (`$grid-gutter-width = $spacers-4`) | Acceptable; leave. |
| 5 | Section padding 132/88/55 | Generous but owner likes the section‑level airiness → **leave**. |
| 6 | Spacers map is an 11px‑based point scale (11/22/33/44/55/66/88…), not the 8px web standard | Visually negligible (22 vs 24); high‑risk to rewrite wholesale → **document, leave** (pragmatic). |
| 7 | Colour system: cool ink/slate neutrals + dye‑orange (markers/CTAs/buttons) + brand blue (links, benefits marker, icons) + navy (about) | Consistent two‑accent system → **leave**. |

## D. Other sections — measured (1440px)

| Section | Notable values | Verdict |
|---|---|---|
| Section padding (all) | 132 / 88 / 55 (lg/md/mob); products & projects `pb-0` | generous, intentional flow → leave |
| Hero | h1 48px (lh 1.14), **h1 margin‑bottom 8px** (every other heading = 0), lead `mt 16`, button `mt 22` h48 px24 16px | fix h1 mb for consistency |
| About | h2 32px centered, hr `mt 16`, prose 16/24, bio `p.mt-md-0` aligns to portrait top | ✓ ok |
| Support (CTA) | h2 32px white, p 16px `mt 16`, button `mt 22` | ✓ ok |
| Footer | block `mt/mb 88`, `.h5` 17px, dd indent 6.5px | generous; leave |

## E. Fixes applied (this pass)

1. `.service-box` padding‑bottom `44px → 32px` (and the row's compensating negative
   margin) — tightens the inter‑item gap to a standard feature‑grid value.
2. Lists inside `.service-box` get `margin-top: 1em` — title→list now 14px, matching
   the title→paragraph rhythm in Benefits.
3. `.mt-12 → .mt-9` on the section grids/accordion (overview, benefits, products,
   projects, reviews) — heading→content step `66px → 48px`.
4. `h1`/`.h1` added to the `margin-bottom: 0` heading rule — removes the stray 8px
   under the hero headline so all headings behave identically.

Re‑measured after the change (confirmed: inter‑item 32px, title→list 14px,
heading→grid 48px). Content unchanged.

## F. Standardisation applied (owner: "pull section padding & spacer scale to standard")

1. **Section padding 132 / 88 / 55 → 96 / 72 / 48px** (lg/md/mob). Set as explicit
   `6rem / 4.5rem / 3rem` in the `section` rule, decoupled from the spacer keys so it
   doesn't shrink the `.hr` (key 24) or hero margin. Denser, conventional rhythm.
2. **Spacer scale snapped to the 4px base grid.** Was an 11px point scale
   (5.5/11/22/27/33/37/44/55/59/66/88/121/132); now clean grid steps
   (4/12/16/24/28/32/40/44/48/56/60/64/80/120/128). Each key kept ~its prior value so
   the tuned layout holds; landmark keys now match Bootstrap (`3`=16, `4`=24px). Knock‑on
   (all standard): grid gutter 22→24, container padding 44→48, `mt-4` 22→24, footer 88→80.
   Verified: section 96/72/48, gutter 24, grid fixes (32 / 48 / 14) intact, prod build clean.

The `$scales` *type* map is left (it feeds line‑height math and is already superseded by
the standard `--fs-*` tokens). φ remains a splash only (squircle).

## G. Section‑as‑slide pass (owner: "each section should feel like a new PowerPoint slide")

**Diagnosis (measured).** Of the five numbered sections, four rendered on the *same*
surface — overview / products / projects / reviews were all transparent (white) — so after
the one blue section (benefits) you scrolled **three white sections in a row** with an
identical, quiet opener (32px h2 sitting 24px under a small number, 48px to content).
Nothing changed *state* at a boundary, so there was no "new slide" hook. Whitespace alone
can't fix it: more air between two identical white surfaces still reads as one document.

**First attempt — REJECTED by owner.** Tried surface alternation (a cool off‑white
`section.bg-tint` = `$mist-100` on the plain sections) + a bigger header (h2 32→38,
number 40→48). Owner: *"I don't like it. The heading font size might be too big. I'm not
a fan of the tinted gray background."* → reverted both the gray fill and the size bump.

**Shipped fix — separation without a fill or oversized type.** A slide reads as new from a
*break at its top*, not a background. So:

1. **Section‑opening hairline.** `.heading-number` reshaped from `[number ——trailing rule]`
   into a block whose `border-top` is a thin rule across the content column
   (`1px $mist-200`; on `bg-light`, `rgba($blue,.18)`), with the dye numeral stacked beneath.
   Each section now opens with a quiet "new chapter" rule → bold dye number → title. No fill.
2. **Header sits apart.** Section content `.mt-9 → .mt-12` (h2 → content **48 → 64px**) ×5,
   so the title floats above its body like a slide title. (Kept — owner didn't object.)
3. **Restrained type.** `--fs-h2` 32 → **34px** (a hair more presence than the original, far
   short of the rejected 38); numeral back to its original **40px**. The contrast anchor is
   the dye number + the rule, not a big heading.

**Un‑merged the products/projects pair.** Both were `pb-0`, butting together into one white
zone (defeating the slide feel). Dropped `pb-0` from both so each is a self‑contained block
(both white now, separated by their top hairline).

Verified live (headless Chrome, EN, 1280 + 390): all sections white except the established
blue/navy/ink; each numbered section opens with a hairline + 40px dye number + 34px h2,
64px to content; production (compressed) build clean (exit 0).

**OUTCOME — reverted to baseline (owner's call).** Owner asked to roll everything back to the
original and keep the original palette (white content · blue benefits · navy about · ink
support). All of the above (hairline, 34px h2, 64px gap, un‑merged pair) was undone; the page
sits at the post‑Pass‑6 standardized baseline (h2 32, `[number ——rule]` marker, `mt-9`,
`pb-0`). Takeaway for next time: the owner prefers the calm standard baseline over any added
section‑separation device — pursue "distinct sections" only with explicit buy‑in, and keep
proposals minimal.
