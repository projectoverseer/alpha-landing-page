# 05 — Build Notes (living doc)

How the redesign maps onto the existing Jekyll/Bootstrap stack, updated as
implementation proceeds.

## Stack facts (verified)

- Ruby 3.3 · Jekyll 3.10 · Bundler · Node 24. `bundle exec jekyll build` → exit 0.
- Tokens compile from `css/main.scss` (Sass vars + Bootstrap import) → `css/main.css`.
- Component styles in `_sass/_base.scss` (imported last in `main.scss`).
- Sections are `_includes/*.html`, assembled by `_includes/page.html`.
- Copy is bilingual in `_data/i18n/en.yml` + `vi.yml` — **every key in both**.
- Prod build: `npm run build` (PurgeCSS → cleancss → esbuild → fingerprint →
  minify → sitemap lastmod → verify → `docs/`). `npm run ship` = the human
  wrapper: build with auto-retry, then the local preview server. (Renamed from
  the old `npm run ship` on 2026-07-02; see the root `README.md` for the map.)

## Implementation order

1. **Tokens** — add the cool‑ink + dye palette, motion + fluid type to `main.scss`. *(additive; old vars stay valid so nothing breaks mid‑build)*
2. **Base components** — kicker, `.metric`, section marker, RFT ladder, buttons, cards.
3. **Hero** — vertical slice first (proves the language). ← *in progress*
4. **Section‑by‑section** — Stakes (new) · Proof · Method (new) · Mechanisms (merge Overview+Benefits) · Products · Track record · Voices · Authority · Standard (new) · Call. Bilingual copy with each.
5. **JS** — metric count‑up + RFT gauge (reduced‑motion safe); keep nav/dropdown/email JS.
6. **Verify** — `bundle exec jekyll build`; check contrast, keyboard, reduced‑motion; perf (LCP preload, AVIF, lean CSS); then `npm run ship`.

## The intermittent build failure, solved (2026-07-28)

For months this build died at random with:

```text
Conversion error: Jekyll::Converters::Scss encountered an error while
converting 'css/main.scss': String can't be coerced into Integer
sass-3.7.4/lib/sass/script/value/number.rb:409:in `-'
```

It was written off as the Windows toolchain being flaky, then diagnosed as a
stale `.sass-cache/` — **that diagnosis was wrong**, and it was disproved the
next time the failure appeared on a run where `npm run clean` had just deleted
the cache.

**The actual cause is one unquoted map key.**

`$grid-breakpoints` in `css/main.scss` held `2xl: 96rem`. In Sass, `2xl` is not
an identifier — it is a **number**: the value `2` with the unit `xl`. Proved:

```scss
$m: (xs: 0, sm: 30rem, 2xl: 96rem);
@each $k, $v in $m { .k-#{$k} { content: "#{type-of($k)}"; } }
// .k-xs  → "string"
// .k-sm  → "string"
// .k-2xl → "number"      ← the whole bug
```

So the map had five String keys and one Number key. Ruby Sass 3.7 checks a map
literal for duplicate keys by putting them in a `Set` (`map_literal.rb:54`),
which is backed by a Hash — and on a hash **bucket collision** Ruby falls back
to `eql?`. `Sass::Script::Value::Number#eql?` ends in `(num1 - num2).abs`, and
subtracting a String from an Integer raises `TypeError`.

Ruby randomises its string hash seed per process, so whether the String key
lands in the Number key's bucket is decided fresh on **every single build**.
That is the entire source of the randomness.

Measured, 60 compiles each:

| map | failures |
|---|---|
| `(xs: 0, … 2xl: 96rem)` | **1 / 60** |
| `(xs: 0, … "2xl": 96rem)` | 0 / 60 |

**Fix:** quote the key. Safe here because nothing references that breakpoint by
name, and Bootstrap's generated class names interpolate identically either way.

**Gated:** `verify.mjs` now scans `css/*.scss` and `_sass/*.scss` and fails the
build on any map key that starts with a digit *and* contains a letter (`2xl`,
`3d`, `2x`). A key of pure digits is **not** flagged and must not be — the space
ladder in `_quy-cu.scss` is `(0: 0, 1: 4px, …)` and a map whose keys are all
numbers is perfectly safe. The bug needs a *mix*, and a mix only ever happens by
accident, which is exactly when the key looks like a word and is not one.

`npm run clean` still removes `.sass-cache/`. That is harmless hygiene, not a
fix, and should not be mistaken for one again.

## Decisions / conventions

- **Additive tokens:** new Sass vars added alongside existing ones; existing
  variable *names* keep working, only values evolve where safe. Avoids a big‑bang
  break while sections migrate one at a time.
- **Single font** — Inter Variable (superseded Public Sans 2026-07-14, owner
  direction); Atelier feel via treatment + imagery, not a second webfont (perf
  budget). One variable file carries `opsz` 14–32: body and chrome sit at the 14
  floor, every heading and section marker is pinned to 32 (the "Inter Display"
  cut), and the big metric figures stay size-tuned (0.75 × px). No extra family —
  32 is the axis's top end.
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
- ⚠️ Working‑tree note (superseded — see 2026‑08‑04 below): a prior `squircle.js`
  standards‑rewrite was reverted out of the tree. `js/squircle.js` has since been deleted
  outright and the corner lives in CSS.

### 2026‑08‑04 — ported from the owner's browser extensions

The owner asked what could be brought over from their four personal Chrome extensions
(`backups/System Settings/Extensions`, tuned for a Dell XPS 15 7590) and re‑implemented for
everyone. Audited all four; **two** had anything left to give.

- **Squircle → CSS.** The superellipse is back, at the extension's derived exponent
  **n = 3.0224** (`superellipse(1.5957)`, radius ×1.4292) instead of the n = 4 that was
  switched off on 2026‑07‑28. Full reasoning and the three answered objections in
  **design/08 §2.1**. The two implementation bugs that got it killed are fixed: the growth
  now lives *inside* the `@supports` (so Safari keeps the authored radius and both engines
  land on the same 45° depth), and the accordion's inner radius subtracts the border *after*
  the growth. New `corner-inner()` mixin; `.dropdown-menu` gained `overflow: hidden` so its
  flush rows are clipped to its corner instead of poking a square through it. **19 shaped
  selectors, zero JavaScript.** `verify.mjs` gates four separate failure modes.
- **Speculate → Speculation Rules.** `_includes/speculation-rules.html`, on both products.
  250 bytes of declarative JSON, no script execution, `eagerness: moderate` — which on a
  touchscreen means *pointerdown*, so it wastes no mobile data. Checked before shipping:
  the CSP's `'unsafe-inline'` covers it, and gtag.js (direct, not GTM) already defers
  `page_view` to `prerenderingchange`, so there is no phantom‑visit problem. Gated in
  `verify.mjs` — malformed rules are ignored by the browser *silently*, so nothing else
  would ever notice.
- **XPS15 Tuned → nothing to do.** Its `typography.css` and `reading.css` groups
  (`font-synthesis: none`, `font-optical-sizing: auto`, `text-wrap: pretty`,
  `overflow-wrap: break-word`) are already shipped on both products. Deliberately **not**
  taken: `scrollbar-width: thin` (a smaller pointer target, and the site's reader "có thể là
  một người công nhân" — accessibility‑first says no) and `interpolate-size: allow-keywords`
  (no `<details>` on the site and Bootstrap Collapse sets pixel heights, so it would do
  nothing today while arming a transition that could switch on later). `@view-transition` was
  offered and declined for now — it delays the readable paint, which is the one thing this
  site does not spend.
- **Neutral Fonts → not applicable.** It aliases the web's neutral sans families to a live
  variable Inter; this site self‑hosts Inter with the `opsz` axis already live, and the
  extension explicitly blacklists `alphasoftwaregroup.com` so our own typography wins.

- Next (pending owner steer): push layout further; resume the content rebuild
  (Stakes → Proof → Method …); or re‑enable the precision hero.
