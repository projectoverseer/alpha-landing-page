# 04 — Design System

The visual system is a **fusion**: **Calibration** (engineered, exact,
evidence‑led) is the structural backbone; **Atelier** (material, elevated,
crafted) is the premium layer. They map onto the two altitudes from doc 01 §1a:

- **Big Leap → Calibration.** Most of the page. Cool ink, hairline rules, tick
  marks, tabular metrics, tight grid. *Looks measured.*
- **Final Mile → Atelier.** The summit moments (Proof peak, the Standard, CTA).
  Deep material surfaces, generous whitespace, large refined headings, real dyed
  material/color. *Feels crafted.*

Color is **balanced**: a calm cool **ink** base, with the **dye‑orange reserved
for the moments that matter** — metrics and calls to action.

> Implementation note: tokens below are written to drop into `css/main.scss`
> (Sass variables + CSS custom properties) and are designed to coexist with the
> existing Bootstrap variable layer. Where a token replaces an existing one, the
> old name is shown so the swap is mechanical. See doc 05 for the build mapping.

---

## 1. Color

### 1.1 Roles (how color is allowed to behave)

| Role | Used for | Token family |
|------|----------|--------------|
| **Base / surface** | Page & section backgrounds, most UI | `ink` (cool) + `paper`/`white` |
| **Structure** | Hairlines, ticks, borders, grid, muted labels | `slate` / `mist` |
| **Body text** | Paragraphs, headings on light | `ink-900` / `slate-600` |
| **Accent — DYE** | Metrics, CTAs, key marks, the "moment that matters" | `dye` |
| **Accent — secondary** | Links, secondary marks, the cool counterpoint | `blue` (existing #004c97) |

**Discipline rule (from principle 2 & 3):** dye‑orange is a *spotlight*, not a
*wash*. If everything is orange, nothing is. Aim for ≤10% of any view in dye.

### 1.2 Tokens (cool ink base + refined dye accent)

```scss
// — Ink (cool structural neutrals; replaces the warm-neutral grays for surfaces)
$ink-950: #07151f;  // deepest Atelier surface (hero, premium dark sections)
$ink-900: #0b1b2b;  // primary dark surface / near-black text on light
$ink-800: #102a3c;  // dark section background
$ink-700: #1d3b4f;  // raised dark surface, dark borders
$ink-600: #2f5167;  // muted on dark
$slate-600: #46586a; // secondary text on light  (replaces $text-secondary)
$slate-500: #647889; // tertiary text / captions  (replaces $text-tertiary)
$slate-400: #8a9cab;
$mist-300: #b9c6d0;  // hairlines on light, ticks
$mist-200: #d6e0e7;  // borders, dividers
$mist-100: #e9eff3;  // subtle fills, alt section background
$paper-50: #f6f9fb;  // page background (a hair cooler than pure white)
$white:    #ffffff;

// — Dye accent (the signature; reserved for metrics + CTAs + key marks)
$dye:       #e35205; // signature — large numerals, fills, decorative marks
$dye-bright:#ff6a1a; // hover / highlight
$dye-deep:  #b8390a; // AA-safe: small orange text on light; CTA bg w/ white text
$dye-tint:  #fdece2; // faint dye wash for callout backgrounds on light

// — Secondary cool accent (kept from current brand)
$blue:      #004c97; // links, secondary marks
$blue-bright:#009cde;
$blue-pale: #c3e5f1; // pale tint (existing $light)
```

**Contrast contract (WCAG 2.2 AA):**
- Body text `ink-900` on `paper-50`/`white` → ~16:1. ✅
- `slate-600` on `paper-50` → ≥ 4.5:1 for secondary text. ✅
- **Never** set small body text in `$dye` (#e35205 ≈ 3.6:1 on white — fails).
  Use `$dye-deep` for small accent text; reserve `$dye` for ≥24px/bold display.
- CTA = white text on `$dye-deep` (≈ 5:1). ✅ Hover lightens fill, not below AA.
- On dark (`ink-900`/`ink-950`): text in `white`/`mist-100`; dye stays vivid.

### 1.3 The two-altitude color map

- **Calibration (Big Leap):** `paper-50`/`white` surfaces, `ink-900` text,
  `mist` hairlines & ticks, `slate` labels, `dye` only on metrics & CTAs.
- **Atelier (Final Mile):** `ink-950`/`ink-900` deep surfaces, `white`/`mist-100`
  text, real dyed‑material imagery supplying the color, `dye` as a single
  precise highlight. Richer, quieter, more premium.

---

## 2. Typography

**Keep Public Sans** as the single typeface (it is already loaded, is a clean,
slightly technical grotesque — perfect for Calibration — and has the weights we
need). The Atelier "premium" feeling comes from **treatment**, not a second font:
larger display sizes, tighter tracking, generous leading, a narrow measure, and
real material imagery. This protects the performance budget (principle 7).

> Future enhancement (optional): introduce **one** high‑contrast display serif for
> h1/h2 only to push the Atelier craft further. Deferred for v1 — revisit if the
> owner wants more overt editorial premiumness. Would be preloaded, single weight,
> `font-display: swap`.

### 2.1 Scale — standard, restrained, fluid (principle 5)

**Naturalness is the goal.** The scale follows conventional web practice — the
sizes people meet every day on the sites they trust — because *adhering to
standards is itself the message* (respect for standards/ISO → authority,
professionalism, expertise). Restraint reads as confidence; oversized type does not.

- **Body = 14px** (`$font-size-base: 0.875rem`; line‑height ≈ 1.57). A standard,
  professional reading size (cf. Google's product UI). Lead/intro text is larger.
- **Headings stay moderate** and fluid (`clamp()`), mobile → desktop, so the page
  never feels oversized. Hierarchy comes from a clear, conventional step — not a
  dramatic ratio.
- **Chrome stays responsive** (navbar logo 170×48→132×37 / bar 64→56 below `md`;
  `.btn-xl`, icons smaller on mobile) so the logo/buttons never dominate small
  screens — the fix for "logo/buttons look huge on mobile."

```scss
// Restrained fluid scale (px shown are mobile→desktop, root 16px).
--fs-display: clamp(2.25rem,   calc(1.6rem + 2.6vw),  3.25rem);   // 36 → 52  parked hero
--fs-h1:      clamp(2rem,      calc(1.5rem + 2vw),    3rem);      // 32 → 48  hero
--fs-h2:      clamp(1.625rem,  calc(1.4rem + 0.9vw),  2rem);      // 26 → 32  sections
--fs-h3:      clamp(1.25rem,   calc(1.13rem + 0.5vw), 1.5rem);    // 20 → 24
--fs-h4:      clamp(1.0625rem, calc(1.02rem + 0.18vw),1.125rem);  // 17 → 18
--fs-lead:    clamp(1rem,      calc(0.95rem + 0.2vw), 1.125rem);  // 16 → 18
--size-icon:  clamp(2.75rem,   calc(2.3rem + 1.8vw),  4rem);      // 44 → 64
--btn-h:      clamp(2.625rem,  calc(2.4rem + 0.9vw),  3rem);      // 42 → 48
--btn-px:     clamp(1.25rem,   calc(1.1rem + 0.6vw),  1.5rem);    // 20 → 24
```

- Headings: weight **700**, slight negative tracking. Keep `max-width` ch limits +
  `overflow-wrap: break-word` safety net.
- **Layout:** content column ≈ **1140px** (`$container-max-widths` lg ≈ `69rem +
  padding`) — the conventional max — for calm, generous left/right margins on large
  screens.
- **φ is a splash, not the backbone** (per owner). It stays where it's a quiet
  finishing touch — the squircle's superellipse `φ³` frame — and may return as a
  single accent detail, but the structural scale is standard.

> ⚠️ Build note: never put an inline `//` comment after a CSS custom‑property value
> — it breaks the compressed/production Sass build (see design/05). Comments above.

### 2.2 Metrics — the signature typographic move

Every number that proves something uses **tabular figures**, large and tight.
This is the visual fingerprint of measurement.

```scss
.metric {
  font-feature-settings: "tnum" 1, "ss01" 1;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: $dye;            // the moment that matters
  line-height: 0.95;
}
.metric__unit  { color: $slate-600; font-weight: 600; } // % , pts, yrs
.metric__label { /* see kicker */ }
```

### 2.3 Kicker / technical label (Calibration motif)

Small, uppercase, letter‑spaced, slate, optionally preceded by a tick — used as
section eyebrows and metric labels.

```scss
.kicker {
  font-size: .75rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: .14em; color: $slate-500;
}
```

---

## 3. Space, grid & layout

- **Keep** the existing mathematical `$spacers` scale and the `$grid-breakpoints`
  (xs/sm/md/lg/xl/2xl). They are good and consistent.
- **Container:** keep max ~76rem; generous gutters. Whitespace is a confidence
  signal (principle 2) — do not crowd.
- **Intrinsic layouts (principle 5):** card grids use CSS Grid
  `repeat(auto-fit, minmax(min(100%, 18rem), 1fr))` so they reflow without
  breakpoint babysitting. Use `gap`, logical properties (`margin-inline`,
  `padding-block`), and `min()/max()/clamp()`.
- **Baseline rhythm:** vertical spacing in multiples of the base unit; align
  metric baselines across cards (things lining up = precision).

---

## 4. Components

| Component | Notes |
|-----------|-------|
| **Buttons** | Keep `.btn-xl` pattern. Primary = white on `$dye-deep` (squircle radius, existing JS). Secondary = ink outline / ghost. One primary action site‑wide. |
| **Calibration section marker** | Evolve the existing `.heading-number` (01–05) into a refined marker: tick mark + monospaced/tabular index + hairline rule running across. Keeps the "numbered, measured" feel, lighter and more precise. |
| **Metric block** | `.metric` numeral + `.metric__unit` + `.kicker` label; optional delta arrow (▲) in dye. Used in hero strip, Proof, cards. |
| **RFT ladder / gauge** | New signature device: a horizontal scale 45→96% with two marked milestones (Big Leap ~90–92, Final Mile ~94–96). Appears in Proof & Method; reduced‑motion shows static final state. |
| **Error→Eliminated card** | The Mechanisms grid: error source · how Alpha kills it · standard met. Hairline‑framed (Calibration). |
| **Cards** | Keep squircle radius. `mist-200` hairline borders, `white`/`paper` fills; raised only when meaningful. |
| **Accordion (Products)** | Keep Bootstrap accordion + nav deep‑link JS; restyle to the new tokens. |
| **Testimonial** | Keep photo + blockquote + schema microdata + translated‑review disclaimer; promote the metric in the quote. |
| **Partner‑logo card** | Keep; ensure logos sit on appropriate fills (e.g. Spica green) with consistent treatment. |
| **Nav** | Keep transparent‑over‑hero → solid‑on‑scroll behavior; re‑label to new IA; keep language switcher + skip link. |

---

## 5. Motion (principle 7 — minimal, meaningful, gated)

- **Tokens:** `--ease-precise: cubic-bezier(.28,.11,.32,1)` (already in use);
  durations 160/240/400ms. Nothing slower without reason.
- **Metric reveal:** numbers count up to final value on scroll‑in (e.g. 45→92).
  `prefers-reduced-motion: reduce` → render final value immediately, no count.
- **Section reveal:** subtle fade/translate (≤12px), respecting reading order;
  disabled under reduced‑motion.
- **Hover:** quick (≤160ms) color/fill only; no large transforms.
- Always honor `prefers-reduced-motion` and `forced-colors` (keep existing
  `@media (forced-colors: active)` handling).

---

## 6. Imagery & iconography

- **Photography:** real dyeing floor, dyed yarn/fabric macro, lab/spectrophotometer,
  the weighing station. Consistent grade: cool shadows, controlled saturation so
  the *dyed material* carries the color. Uniform squircle radius. AVIF +
  `image-set()` + LCP preload (keep current pattern).
- **Atelier moments** lean on color‑rich material macro (swatches, dyed yarn) —
  this is where the palette gets its richness, honestly, from the product itself.
- **Icons:** keep the Material Symbols set; render in `slate`/`ink`, never busy.
- **Calibration details:** hairline rules, tick marks, tabular numerals, gauge —
  used as *meaning* (measurement), never as decoration.

---

## 7. Accessibility & robustness (principle 6 — non‑negotiable)

- WCAG 2.2 AA contrast per §1.2 contract; verify every dye usage.
- Full keyboard operability; visible focus rings (keep `$focus-ring` system).
- Semantic landmarks, headings in order, real alt text, `aria` on interactive bits.
- `prefers-reduced-motion`, `forced-colors`, `prefers-color-scheme` respected.
- Touch targets ≥44px; tap‑to‑call, one‑tap email copy preserved.

---

## 8. Mapping to the existing codebase (so this is buildable)

| This system | Lives in |
|-------------|----------|
| Color + type + motion tokens | `css/main.scss` (Sass vars + `:root` custom props) |
| Component & layout styles | `_sass/_base.scss` (rebuild per components above) |
| Section markup / new sections | `_includes/*.html` (+ new: stakes, method, standard) |
| All copy (EN + VI) | `_data/i18n/en.yml`, `vi.yml` — **bilingual parity required** |
| Build/perf posture | unchanged pipeline (see doc 05) |

> Next: doc 05 records build notes as implementation proceeds. Implementation order:
> **tokens → base components → hero → section-by-section (with bilingual copy) →
> verify build & perf → review.**
