# 05 — Build Notes (living doc)

How the redesign maps onto the existing Jekyll/Bootstrap stack, updated as
implementation proceeds.

## Stack facts (verified)

- Ruby 3.3 · Jekyll 3.10 · Bundler · Node 24. `bundle exec jekyll build` → exit 0.
- Tokens compile from `css/main.scss` (Sass vars + Bootstrap import) → `css/main.css`.
- Component styles in `_sass/_base.scss` (imported last in `main.scss`).
- Sections are `_includes/*.html`, assembled by `_includes/page.html`.
- Copy is bilingual in `_data/i18n/en.yml` + `vi.yml` — **every key in both**.
- Prod ship: `npm run ship` (PurgeCSS → cleancss → esbuild → fingerprint → minify → `docs/`).

## Implementation order

1. **Tokens** — add the cool‑ink + dye palette, motion + fluid type to `main.scss`. *(additive; old vars stay valid so nothing breaks mid‑build)*
2. **Base components** — kicker, `.metric`, section marker, RFT ladder, buttons, cards.
3. **Hero** — vertical slice first (proves the language). ← *in progress*
4. **Section‑by‑section** — Stakes (new) · Proof · Method (new) · Mechanisms (merge Overview+Benefits) · Products · Track record · Voices · Authority · Standard (new) · Call. Bilingual copy with each.
5. **JS** — metric count‑up + RFT gauge (reduced‑motion safe); keep nav/dropdown/email JS.
6. **Verify** — `bundle exec jekyll build`; check contrast, keyboard, reduced‑motion; perf (LCP preload, AVIF, lean CSS); then `npm run ship`.

## Decisions / conventions

- **Additive tokens:** new Sass vars added alongside existing ones; existing
  variable *names* keep working, only values evolve where safe. Avoids a big‑bang
  break while sections migrate one at a time.
- **Single font** (Public Sans) retained for v1 — Atelier feel via treatment +
  imagery, not a second webfont (perf budget).
- **Slogan change:** `slogan` now carries the new brand line and flows into
  `<title>`, OG/Twitter titles and `itemprop="slogan"` — intentional and coherent.
- New i18n keys are namespaced by section (`hero_*`, `stakes_*`, `method_*`, …).

## Status log

- 2026‑06‑27 — Design foundation (docs 01–04) written. Baseline build verified.
- 2026‑06‑27 — **Hero vertical slice shipped** (build green):
  - Tokens added to `css/main.scss` (ink/slate/mist/dye + motion/fluid type).
  - `_sass/_base.scss`: `.kicker`, `.metric`, `.btn-ghost`, full hero rebuild
    (deep ink gradient, fluid display `h1`, dual CTA, RFT metric strip).
  - `_includes/hero.html` restructured; bilingual copy in `en.yml`/`vi.yml`;
    `slogan` → "Precision is the business" / "Chính xác là cốt lõi".
  - Ruby Sass 3.7 gotcha: wrap `+` inside `clamp()` in `calc()` (see tokens).
- 2026‑06‑27 — **Hero parked, polish pass on the existing site** (per owner: keep
  the new hero in-repo but show the old one while perfecting the current design):
  - New hero preserved as `_includes/hero-precision.html` (`<header class="hero-precision">`),
    styles parked under `header.hero-precision`; `hero_headline` key holds the new line;
    live `hero.html`, `slogan`, `<title>` fully reverted to the original.
  - **Cool‑ink neutrals:** gray ramp + `$text*` shifted subtly cool (brand alignment).
  - **Heading robustness:** `overflow-wrap: break-word` on h1–h6 — fixes a real EN
    mobile horizontal‑scroll bug (the word "Transformation" overflowed at 390px).
  - **CTA section** (`section.bg-primary`, support): flat orange flood → deep‑ink panel
    with a dye top hairline + dye button ("spotlight, not a wash"). Button → `btn-primary`.
  - **Visual QA tooling:** puppeteer‑core (scratchpad only, project untouched) driving
    system Chrome → full‑page + dpr2 detail screenshots at 390/834/1440, EN+VI.
    Run `bundle exec jekyll serve` (it rewrites `site.url`→localhost; don't hand‑build over it).
- 2026‑06‑27 — **Polish pass 2** (owner: tighten mobile heading scale; "polish boldly"):
  - **Fluid headings:** `--fs-h1…--fs-h4` clamp tokens; h1–h4 + product accordion
    header now scale from smaller mobile sizes up to the existing desktop sizes.
    Tightens the heading↔body contrast on phones and removes overflow by design.
  - **Section markers redesigned:** the heavy solid 01–05 blocks → a measured
    "calibration" marker (large tabular figure + a hairline rule across the column),
    dye on light sections / blue on `.bg-light`. Removed now‑moot `data-squircle-radius`
    from the five marker divs.
  - **Fluid feature icons** (`--size-icon`, 48→80px): the 8 feature icons were fixed
    at 80px and looked oversized once headings shrank on mobile — now they scale with
    the viewport like the headings, staying proportionate. Reviewed all sections at
    390/1440 (EN+VI); production build clean (exit 0).
- 2026‑06‑27 — **Polish pass 3 — golden‑ratio (φ) rebuild** (owner: headings could be
  bigger / more contrast; logo + buttons look huge on mobile; "use φ as much as possible"):
  - **φ type scale** (`--fs-*`): per‑step ratio √φ (1.272); headings span φ→φ³ of body;
    each clamp **min = max ÷ √φ**, so mobile is one φ‑step below desktop (proportions
    preserved, not flattened). Mobile headings got bigger (h1 32→42px, h2 26→33px);
    desktop ≈ unchanged.
  - **φ‑scaled chrome:** navbar logo 170×48→132×37 + bar 64→56 below `md`; `.btn-xl`
    height/padding → `desktop ÷ √φ` on mobile (`--btn-h`, `--btn-px`); `--size-icon`
    likewise. Fixes "logo/buttons dominate on mobile."
  - Type/icon/button/logo proportions documented in design/04 §2.1.
- ⚠️ **Ruby Sass gotcha (compressed/production only):** do NOT put an inline `//`
  comment on the same line as a CSS custom‑property declaration (`--x: …; // note`).
  Sass parses custom‑prop values as raw token streams; in `JEKYLL_ENV=production`
  (compressed style) the trailing comment is absorbed into the value and the build
  dies with `String can't be coerced into Integer`. Put comments **above** the
  declarations. (Dev/expanded build tolerates it, so it only shows up at ship time.)
  Also: a stale `.sass-cache` can mask/echo a prior error — `rm -rf .sass-cache`
  before trusting a prod build result.
- 2026‑06‑27 — **Polish pass 4 — standards / naturalness** (owner: drop φ as backbone;
  apply standard web practice; body 14px; more generous side margins; identity =
  precise, authoritative, human/personal). Content unchanged.
  - `$font-size-base` → **0.875rem (14px)**; line‑height‑base derives ~1.57.
  - **φ type scale reverted → standard restrained `--fs-*`** (h1 48 / h2 32 / h3 24 /
    h4 18 / body 14, mobile a notch down); section marker number reduced to match.
  - **Content column ≈ 1140px** (`$container-max-widths` lg `69rem + padding`) for calm,
    generous left/right margins on large screens.
  - Chrome stays responsive (logo/buttons smaller on mobile). Prod build clean (exit 0).
  - φ now a splash only (squircle φ³); identity notes added to design/01 §6a, scale to
    design/04 §2.1.
  - Tooling note: the watch server got into bad partial states when separate prod builds
    and `.sass-cache` deletes ran alongside it — now running `jekyll serve --no-watch`
    and restarting it after edits instead.
- 2026‑06‑27 — **Pass 5 — measured spacing audit** (owner: scrutinise every spacing /
  class / colour; sub‑item gap too large). Full audit in **design/06** (measured live via
  headless Chrome `getComputedStyle`). Fixes (content unchanged):
  - `.service-box` inter‑item gap **44 → 32px** (+ row negative margin).
  - `.service-box` lists get `margin-top: 1em` — title→list **0 → 14px** (matches Benefits).
  - section grids/accordion `.mt-12 → .mt-9` — heading→grid **66 → 48px** (×5 includes).
  - `h1` added to the `margin-bottom:0` heading rule — drops stray 8px under hero h1.
  - Left as‑is (documented): 132px section padding (owner likes airiness; main density
    lever), 11px‑based spacer map, dual orange/blue accent system.
- 2026‑06‑27 — **Pass 6 — standardise spacing** (owner: pull section padding & spacer
  scale to standard). Content unchanged. Prod build clean.
  - **Section padding 132/88/55 → 96/72/48px** (explicit `6/4.5/3rem` in `section`).
  - **`$spacers` map → 4px base grid** (was 11px point scale): 4/12/16/24/28/32/40/44/48/
    56/60/64/80/120/128. Keys kept ~prior values; `3`=16, `4`=24 match Bootstrap. Knock‑on:
    gutter 22→24, container pad 44→48, `mt-4` 22→24, footer 88→80 — all standard.
  - Verified live: section paddings 96/72/48; grid fixes (32/48/14) intact; reviews OK.
- 2026‑06‑27 — **Pass 7 — section‑as‑slide** (owner: each section should feel like a new
  PowerPoint slide; not enough hook on scroll that you're on a new topic). Full write‑up in
  **design/06 §G**. Content unchanged; prod build clean (compressed, exit 0).
  - First try (**reverted** — owner disliked the gray fill + big heading): `section.bg-tint`
    alternation + h2 32→38 + number 40→48.
  - **Shipped:** separation via a **section‑opening hairline**, not a fill. `.heading-number`
    reshaped from `[number ——rule]` into a block with a `border-top` thin rule across the
    column (`$mist-200`; `rgba($blue,.18)` on `bg-light`) and the dye numeral stacked under it.
  - **Restrained type:** `--fs-h2` 32 → **34px** (not 38); numeral back to original **40px**.
    Contrast anchor = the dye number + rule, not heading size.
  - **Air under title kept:** `.mt-9 → .mt-12` (h2 → content 48 → 64px) ×5.
  - **Un‑merged products/projects** (both were `pb-0`, fusing into one white zone) → each is a
    self‑contained block (both white, separated by their top hairline). Reverses `pb-0` pairing.
  - All sections white except the established blue (benefits) / navy (about) / ink (support).
  - **FINAL — fully reverted at owner request.** After the hairline + 34px iteration, owner:
    *"roll everything back to the original… keep them white… as comfortable as possible…
    standards."* On the scope question (which backgrounds → white) owner chose **keep the
    original palette**. So everything returned to the post‑Pass‑6 baseline: h2 32, original
    `[number ——rule]` marker, `mt-9` (h2→content 48), `pb-0` restored on products/projects,
    no `bg-tint`, original section colours (white content · blue benefits · navy about · ink
    support). Net change from this whole pass: **none** — the standardized baseline stands as
    the comfortable, standard reading experience. Section‑distinction work parked.
- 2026‑06‑27 — **Pass 8 — drop the `pt()` point‑unit crutch** (owner: "you shouldn't use
  `pt()` at all anymore… everything should be in scales, no standalone values"). Pure
  representation cleanup — **every value is byte‑identical** to before (each `pt()` result
  equals an exact `px()` rung), so nothing rendered changes. Prod build clean (exit 0).
  - **`pt()` length function deleted** from `css/main.scss`. (The `line-height-for-pt`
    *ratio* helper stays — it returns a unitless leading ratio, not a length; commented as such.)
  - **`$scales` map rebuilt with `px()`** instead of `pt(6*n)` arithmetic — self‑documenting
    rem rungs (13/15/16/**17**/24/32/40/48/56/64/72/80/88/96/104/112/120/128/240px).
  - **h5 (17px) → new in‑between key `2.5`** in `$scales` (sits between the 16px `2` and 24px
    `3` rungs) per the owner's "be inventive with a fractional key" steer; `$h5-font-size:
    map-get($scales, 2.5)`.
  - **`$focus-ring-width: pt(2)` → `px(3)`**; **`.kicker font-size: pt(10)` → `$font-size-sm`**
    (the 13px type‑scale token); **`$font-size-base: 0.875rem` → `px(14)`** (kill the last
    stray literal). No `pt(` left except the named line‑height‑ratio helper.
  - Deprecated‑class sweep: the section‑as‑slide experiment's `bg-tint` / hairline
    `.heading-number` were already fully reverted (only design‑doc references remain) — **no
    orphaned rules to remove**.
- ⚠️ Working‑tree note: a prior `squircle.js` standards‑rewrite (drop φ³ → standard
  `corner-shape: squircle`) was reverted out of the tree; `js/squircle.js` is currently the
  φ³ `superellipse(log₂ φ³)` + depth‑match‑SCALE version again. Re‑apply only on owner steer.
- Next (pending owner steer): re‑apply the squircle standards rewrite; push layout further;
  resume the content rebuild (Stakes → Proof → Method …); or re‑enable the precision hero.
