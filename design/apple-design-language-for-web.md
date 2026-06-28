# Apple Design Language for the Web

*A condensed, build-ready translation of Apple's Human Interface Guidelines (HIG) into web design rules.*

**Purpose:** Give this file to an AI (or a designer/developer) and it should be able to produce websites that look and feel like they belong in Apple's design language — current as of the **Liquid Glass** era (iOS/iPadOS/macOS "26", introduced WWDC 2025).

**Source of truth:** Apple Human Interface Guidelines — https://developer.apple.com/design/human-interface-guidelines/. Apple's official tokens are *semantic and adaptive* (they change with light/dark/contrast/vibrancy and across OS versions). Hex values here are community‑measured approximations; **design to the semantic role, not the raw hex.**

> **What transfers and what doesn't.** Apple's HIG is written for native apps on Apple hardware. This file keeps everything that is a portable *design* idea (layout, type, color, materials, motion, components, voice) and drops platform mechanics that don't apply on the web (App Store rules, gesture systems, native APIs, widgets, Live Activities, hardware features). Where Apple relies on system magic (Dynamic Type, vibrancy, real‑time lensing), the web equivalent is given explicitly.

---

## 0. The one-paragraph summary

Apple design is **content-first**. The interface defers to the content: chrome is quiet, translucent, and recedes; the user's content is the brightest, most saturated thing on screen. Hierarchy is built primarily with **type weight and size on one neutral typeface (SF Pro / system font)**, generous **whitespace on an 8‑pt rhythm**, and **one accent color reserved for interactivity**. Color is **semantic** and adapts to light/dark automatically. Shapes use **continuous (squircle) corners** that are **concentric** with their container. Surfaces float as **translucent "Liquid Glass"** layers above content. Motion is **swift, soft, and meaningful** — it explains where things came from, never decorates. Everything is **legible, high‑contrast, and accessible** by default. If a screen feels calm, obvious, and a little bit "premium," you're close.

---

## 1. Core principles

Apple's three long-standing pillars, plus the 2025 additions:

1. **Clarity.** Text is legible at every size; icons are precise; ornament never competes with function. Remove ambiguity — a button says *Send Payment*, not *Submit*. Negative space and a tight color palette do the work.
2. **Deference.** The UI serves the content. Chrome is minimal, translucent, and gets out of the way. Content fills the screen; controls float above it and yield focus.
3. **Depth.** Distinct visual layers and realistic motion convey hierarchy and a sense of place. Things move in and out of layers; transitions tell you where you are.

Reinforced in the Liquid Glass system:

4. **Hierarchy.** Bolder, **left-aligned** typography; the single most important element on a view is unmistakable. Secondary controls recede.
5. **Harmony / Concentricity.** Shapes align with their container and with the rounded rectangle of the hardware — nested corners share a common center, so radii are *concentric*, not arbitrary.
6. **Consistency / Familiarity.** Use established patterns and the same symbols everywhere so users don't have to relearn. Familiar = trustworthy.

**Design tests to apply constantly**
- Is the *content* the brightest, most colorful thing on screen? (It should be.)
- Could I remove this border, box, shadow, or label and lose nothing? (Then remove it.)
- Is hierarchy readable in grayscale? (Don't lean on color for hierarchy.)
- Does every interactive thing share the one accent color, and do non-interactive things avoid it?

---

## 2. Layout & spacing

**Spacing system — the 8-pt grid (with 4-pt subdivisions).**
All spacing, sizing, and positioning snap to multiples of 8 (use 4 for fine adjustments). This is a convention, not an Apple mandate, but it produces the Apple rhythm.

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 …`

- **Screen/content margins:** 16px on phones (small viewports); 20–24px on larger. Keep a consistent gutter.
- **Spacing between related items:** 8–12px. **Between groups/sections:** 24–32px+. Use space, not lines, to group.
- **1pt = 1px** at base density. Apple's "points" map directly to CSS px for layout purposes.

**Touch / hit targets.** Minimum **44×44px** for anything tappable (Apple's hard rule). On the web, give small visual controls invisible padding to reach 44px. Space adjacent targets so they don't collide.

**Safe areas / edges.** Respect device insets on mobile web: use `padding: env(safe-area-inset-*)` and `viewport-fit=cover` so content clears notches, the Dynamic Island, the home indicator, and rounded screen corners. Near a screen/window edge, add extra margin so floating controls don't kiss the edge.

**Reading measure.** Body text line length **45–75 characters** (≈66 ideal). On wide viewports, cap content width (e.g. `max-width: 60–70ch` or ~680–760px for article columns) and center it; let immersive/media content go full-bleed.

**Alignment.** Default to **left-aligned** text (LTR). Center only short, prominent strings (a hero title, an empty-state line, a dialog). Never center long body copy. Maintain a consistent left edge so the eye can track.

**Adaptivity.** Design layouts that reflow, not fixed pixel canvases. Think in **size classes**: compact (phone) vs. regular (tablet/desktop). Single-column on compact; multi-column, sidebars, and split views on regular. Group content that belongs together so it stays together as the layout adapts.

```css
/* Layout tokens */
:root{
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px; --space-12:48px;
  --margin-edge:16px;            /* compact */
  --content-max:700px;           /* reading column */
  --tap-min:44px;
}
@media (min-width:768px){ :root{ --margin-edge:24px; } }
body{ padding:
  max(var(--margin-edge), env(safe-area-inset-left))
  ; }
.tap{ min-width:var(--tap-min); min-height:var(--tap-min); }
```

---

## 3. Typography

Typography is the primary tool for hierarchy. One family, many weights and sizes — almost never a second typeface.

### 3.1 The typeface

Apple's system font is **San Francisco (SF Pro)** — a neutral, highly legible sans-serif — with **New York (NY)** as the optional serif companion for editorial/reading, **SF Mono** for code, and **SF Pro Rounded** for a softer, friendlier feel. SF Pro has optical variants: **SF Pro Text** for ≤19pt and **SF Pro Display** for ≥20pt (modern variable SF transitions continuously between ~17–28pt).

**On the web**, use the system font stack so Apple devices render the real SF and others get a close fallback:

```css
:root{
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
               "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
  --font-serif: "New York", ui-serif, Georgia, "Times New Roman", serif;
  --font-mono:  ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace;
  --font-rounded: "SF Pro Rounded", system-ui, var(--font-sans);
}
body{ font-family:var(--font-sans); -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
```

> SF is licensed for Apple platforms; don't self-host SF for non-Apple delivery unless you have rights. `-apple-system`/`system-ui` is the correct, license-clean way to get SF on Apple devices and a sane fallback elsewhere. If you need the exact look cross-platform, **Inter** is the closest freely-licensed substitute.

### 3.2 The type scale (iOS Dynamic Type, default size)

Sizes in px, line-heights in px, at the default (Large) content size. Build hierarchy by **picking a style per role**, not by inventing sizes.

| Style | Size | Line height | Default weight | Typical web role |
|---|---:|---:|---|---|
| Large Title | 34 | 41 | Regular/Bold | Page hero / screen title |
| Title 1 | 28 | 34 | Regular | Major section title |
| Title 2 | 22 | 28 | Regular | Section title |
| Title 3 | 20 | 25 | Regular/Semibold | Subsection / card title |
| Headline | 17 | 22 | **Semibold** | Emphasized body / list item title |
| Body | 17 | 22 | Regular | **Default body text** |
| Callout | 16 | 21 | Regular | Secondary body |
| Subheadline | 15 | 20 | Regular | Supporting text, list subtitles |
| Footnote | 13 | 18 | Regular | Metadata, captions |
| Caption 1 | 12 | 16 | Regular | Small captions |
| Caption 2 | 11 | 13 | Regular | Smallest text (absolute floor) |

**Rules**
- **Body floor is 17px**; **never** render text below **11px**. For comfortable web reading, 17px body is the baseline.
- **Weight does the work.** A title is often the *same size as body* but **Semibold/Bold** — Apple frequently distinguishes a title by weight + placement, not size. Reserve heavy weights for the few most important elements.
- **Avoid light weights** for anything that must be read; prefer **Regular, Medium, Semibold, Bold**. Use Regular sparingly for large display.
- **Minimize typefaces.** One family + a few styles/sizes. A second family only for a deliberate editorial/brand reason (e.g., New York for long-form).
- **Line height:** roughly **1.2–1.3× for headings**, **1.3–1.5× for body** (the table's leading already encodes this).

### 3.3 Tracking (letter-spacing)

SF adjusts letter-spacing by size: **larger/display text is tightened** (negative tracking), **small text sits near zero**. Anchor values: **17px body ≈ −0.43px**; **28px title ≈ −0.8px**; large titles tighter still; 11–13px text ≈ 0. As an approximation use `letter-spacing` that trends from `0` at caption sizes to about `-0.02em` at display sizes. Don't add positive tracking to body text.

```css
.text-largetitle{ font-size:34px; line-height:41px; font-weight:700; letter-spacing:-0.4px; }
.text-title1   { font-size:28px; line-height:34px; font-weight:400; letter-spacing:-0.4px; }
.text-title2   { font-size:22px; line-height:28px; font-weight:400; letter-spacing:-0.3px; }
.text-title3   { font-size:20px; line-height:25px; font-weight:600; letter-spacing:-0.2px; }
.text-headline { font-size:17px; line-height:22px; font-weight:600; letter-spacing:-0.43px; }
.text-body     { font-size:17px; line-height:22px; font-weight:400; letter-spacing:-0.43px; }
.text-callout  { font-size:16px; line-height:21px; font-weight:400; letter-spacing:-0.3px; }
.text-subhead  { font-size:15px; line-height:20px; font-weight:400; letter-spacing:-0.2px; }
.text-footnote { font-size:13px; line-height:18px; font-weight:400; letter-spacing:-0.05px; }
.text-caption1 { font-size:12px; line-height:16px; font-weight:400; letter-spacing:0; }
.text-caption2 { font-size:11px; line-height:13px; font-weight:400; letter-spacing:0.05px; }
```

### 3.4 Respect user text size

Apple text scales with the user's Dynamic Type setting. The web equivalent: **size in `rem`, never disable zoom, never cap font scaling**, and ensure layouts **reflow** (don't clip/truncate essential text) when text grows. Use `clamp()` for fluid display type. Test at 200% text size.

---

## 4. Color

Color is **purposeful**, not decorative. The system is **semantic** and **adaptive** (auto light/dark/contrast). Use a limited palette; let one accent mean "interactive."

### 4.1 The model

- **Reserve your accent (system blue by default) for interactivity** — links, buttons, switches, selected states. If it's the accent color, it should be tappable; if it's tappable, it's usually the accent color. Don't paint non-interactive things with the accent.
- **Never use the same color for two different meanings.** Primary action = blue; destructive = red. Keep semantic colors consistent.
- **Don't rely on color alone** to convey state/meaning — pair with text, icon, shape, or weight (color-blind + accessibility requirement).
- **Semantic roles over raw hex.** Use tokens like `label`, `secondaryLabel`, `systemBackground`, `systemFill`, `separator` so light/dark/contrast come "for free."

### 4.2 Label (foreground/text) hierarchy

Four levels of neutral text, defined as black/white with decreasing alpha so they sit correctly on any background:

| Role | Light | Dark | Use |
|---|---|---|---|
| `label` | `#000000` | `#FFFFFF` | Primary text |
| `secondaryLabel` | `rgba(60,60,67,0.60)` | `rgba(235,235,245,0.60)` | Subtitles, supporting |
| `tertiaryLabel` | `rgba(60,60,67,0.30)` | `rgba(235,235,245,0.30)` | Disabled, hints |
| `quaternaryLabel` | `rgba(60,60,67,0.18)` | `rgba(235,235,245,0.16)` | Watermark-level |
| `placeholderText` | `rgba(60,60,67,0.30)` | `rgba(235,235,245,0.30)` | Field placeholders |
| `separator` | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.60)` | Hairlines (translucent) |
| `opaqueSeparator` | `#C6C6C8` | `#38383A` | Opaque hairlines |
| `link` | `#007AFF` | `#0A84FF` | Hyperlinks |

### 4.3 Backgrounds (two families)

**System backgrounds** (for standard content) and **grouped backgrounds** (for grouped lists/cards). Each has primary/secondary/tertiary for layering.

| Role | Light | Dark |
|---|---|---|
| `systemBackground` | `#FFFFFF` | `#000000` |
| `secondarySystemBackground` | `#F2F2F7` | `#1C1C1E` |
| `tertiarySystemBackground` | `#FFFFFF` | `#2C2C2E` |
| `systemGroupedBackground` | `#F2F2F7` | `#000000` |
| `secondarySystemGroupedBackground` | `#FFFFFF` | `#1C1C1E` |
| `tertiarySystemGroupedBackground` | `#F2F2F7` | `#2C2C2E` |

Pattern: on a **grouped** screen the page is `systemGroupedBackground` (light gray) and the **cards/rows** are `secondarySystemGroupedBackground` (white). In dark mode it inverts (near-black page, dark-gray cards). This gray-page/white-card relationship is a signature Apple look for settings-style and form screens.

### 4.4 Fills (for UI shapes on top of content)

Translucent grays for filling small shapes (toggLe tracks, search fields, chips). They're alpha-based so they adapt to whatever's behind them.

| Role | Light | Dark |
|---|---|---|
| `systemFill` | `rgba(120,120,128,0.20)` | `rgba(120,120,128,0.36)` |
| `secondarySystemFill` | `rgba(120,120,128,0.16)` | `rgba(120,120,128,0.32)` |
| `tertiarySystemFill` | `rgba(118,118,128,0.12)` | `rgba(118,118,128,0.24)` |
| `quaternarySystemFill` | `rgba(116,116,128,0.08)` | `rgba(118,118,128,0.18)` |

### 4.5 System color palette (accent + status)

Adaptive, measured approximations (light → dark). Blue is the default tint.

| Name | Light | Dark | Meaning |
|---|---|---|---|
| systemRed | `#FF3B30` | `#FF453A` | Destructive / error |
| systemOrange | `#FF9500` | `#FF9F0A` | Warning |
| systemYellow | `#FFCC00` | `#FFD60A` | Caution |
| systemGreen | `#34C759` | `#30D158` | Success / go |
| systemMint | `#00C7BE` | `#66D4CF` | — |
| systemTeal | `#30B0C7` | `#40C8E0` | — |
| systemCyan | `#32ADE6` | `#64D2FF` | — |
| **systemBlue** | `#007AFF` | `#0A84FF` | **Default accent / links** |
| systemIndigo | `#5856D6` | `#5E5CE6` | — |
| systemPurple | `#AF52DE` | `#BF5AF2` | — |
| systemPink | `#FF2D55` | `#FF375F` | — |
| systemBrown | `#A2845E` | `#AC8E68` | — |

**Gray ramp** (systemGray → systemGray6; 6 is the most subtle, trending toward the background):

| Name | Light | Dark |
|---|---|---|
| systemGray | `#8E8E93` | `#8E8E93` |
| systemGray2 | `#AEAEB2` | `#636366` |
| systemGray3 | `#C7C7CC` | `#48484A` |
| systemGray4 | `#D1D1D6` | `#3A3A3C` |
| systemGray5 | `#E5E5EA` | `#2C2C2E` |
| systemGray6 | `#F2F2F7` | `#1C1C1E` |

> The Liquid Glass system slightly retuned hues across light/dark/increased-contrast for better hue differentiation. Treat these as accurate-enough anchors; prefer the semantic token names in your code.

---

## 5. Dark mode

Dark mode is **first-class, not an afterthought**. Design for both from the start.

- Use **semantic tokens** (above) and define a single source of truth that flips via `prefers-color-scheme` and/or a manual toggle.
- **Don't use pure `#000` text on `#FFF` blindly** in both modes — use `label` tokens that invert. Pure black backgrounds are correct for OLED-style dark mode in Apple's system (`systemBackground` dark = `#000`), with cards lifted to dark grays.
- In dark mode, **elevated surfaces get lighter**, not darker (the opposite of paper shadows): a modal/sheet uses a slightly lighter gray than the base.
- Keep accent colors vibrant — the dark variants above are intentionally a touch brighter.
- Re-check contrast in **both** modes.

```css
:root{
  --bg: #FFFFFF; --bg-secondary:#F2F2F7; --bg-grouped:#F2F2F7; --card:#FFFFFF;
  --label:#000; --label-2:rgba(60,60,67,.6); --label-3:rgba(60,60,67,.3);
  --separator:rgba(60,60,67,.29); --fill:rgba(120,120,128,.2);
  --tint:#007AFF; --red:#FF3B30; --green:#34C759; --orange:#FF9500;
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#000000; --bg-secondary:#1C1C1E; --bg-grouped:#000000; --card:#1C1C1E;
    --label:#FFF; --label-2:rgba(235,235,245,.6); --label-3:rgba(235,235,245,.3);
    --separator:rgba(84,84,88,.6); --fill:rgba(120,120,128,.36);
    --tint:#0A84FF; --red:#FF453A; --green:#30D158; --orange:#FF9F0A;
  }
}
[data-theme="dark"]{ /* mirror the dark block for a manual toggle */ }
```

---

## 6. Materials & Liquid Glass

Surfaces that sit above content are **translucent**, blurring and sampling what's behind them so the UI feels layered and the user keeps a sense of context. This is the single most "Apple" visual after typography.

### 6.1 Classic materials (frosted glass / vibrancy)

Apple defines material thicknesses — `ultraThin`, `thin`, `regular`, `thick`, and `chrome` (for bars). Thinner = more of the background shows through. Text/icons on materials use **vibrancy** (they pick up and blend with the underlying color while staying legible). Web translation = `backdrop-filter`:

```css
.material{
  background: rgba(255,255,255,0.72);          /* tint over content */
  backdrop-filter: blur(20px) saturate(180%);   /* the frosted look */
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255,255,255,0.18);   /* faint top edge */
}
@media (prefers-color-scheme: dark){
  .material{ background: rgba(30,30,30,0.72); border-color: rgba(255,255,255,0.08); }
}
/* thicknesses: ultraThin ~ rgba .55 / blur 30 ; thick ~ rgba .85 / blur 12 */
```

### 6.2 Liquid Glass (2025+)

The current material. Distinct from plain frosted blur: it **refracts** (lenses/bends light at its curved edges) and **reflects** (specular highlights along edges), adapting in real time to the content and environment. It defines a **functional layer that floats above content**, bringing structure without stealing focus.

**Design rules for Liquid Glass**
- **It's a layer for controls, not content.** Put toolbars, tab bars, floating action buttons, sidebars, and sheets on glass. Keep the underlying content as the star.
- **Layer economy: one primary glass sheet per view.** Don't stack translucent panes on translucent panes. If you need a control *inside* glass, put it on a **solid fill**, not more glass.
- **Concentric, capsule-ish shapes.** Glass elements are pills/rounded-rects with continuous corners that align to their container (see §7).
- **Legibility first.** Don't float glass over busy imagery if it drops text contrast below WCAG AA. Add a subtle scrim or increase tint opacity when the backdrop is noisy.
- **Honor system settings (critical):** when the user enables **Reduce Transparency**, replace glass with a **solid** color; when **Reduce Motion** is on, disable parallax/specular animation. Keep specular motion subtle (a few px).
- **Treat it as enhancement.** It must degrade gracefully — if `backdrop-filter`/refraction isn't supported, fall back to a solid or simply-blurred surface. The element must still be a real, labeled control.

**Web recipe — approachable Liquid Glass (CSS only):**
```css
.liquid-glass{
  position:relative;
  background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
  backdrop-filter: blur(8px) saturate(180%) brightness(1.08);
  -webkit-backdrop-filter: blur(8px) saturate(180%) brightness(1.08);
  border-radius: 24px;                  /* capsule-ish, continuous feel */
  border: 1px solid rgba(255,255,255,.25);     /* specular-ish top edge */
  box-shadow: 0 8px 32px rgba(0,0,0,.18),
              inset 0 1px 1px rgba(255,255,255,.45);  /* inner highlight */
}
/* true refraction (edges bending the background) needs an SVG displacement
   filter (feImage + feDisplacementMap) applied to the element; use only for
   fixed-size hero controls, and always provide the CSS-only fallback above. */

@media (prefers-reduced-transparency: reduce){
  .liquid-glass, .material{ background:var(--card); backdrop-filter:none; -webkit-backdrop-filter:none; }
}
@media (prefers-reduced-motion: reduce){
  .liquid-glass *{ animation:none !important; transition:none !important; }
}
```

> **Honesty:** real Liquid Glass is GPU-driven real-time lensing. On the web you can get 90% of the *feeling* with `backdrop-filter` + a highlight border + soft shadow. The remaining refraction (background warping at edges) requires SVG displacement maps and is fragile across browsers (best in Chromium, partial in Safari/Firefox) — reserve it for a few showcase elements, never core UI.

---

## 7. Shape: corners & concentricity

- **Continuous (squircle) corners.** Apple rounds with a *continuous* curvature (the superellipse "squircle"), not a plain circular arc. CSS `border-radius` is circular, so it's an approximation; for hero shapes you can use Apple's new CSS `corner-shape: superellipse()` where supported, with `border-radius` as fallback.
- **Concentricity.** A nested element's corner radius should make it **concentric** with its container: `inner_radius = outer_radius − padding`. Nested rounded rectangles then share a center and feel harmonious. Avoid mixing unrelated radii.
- **Typical radii** (continuous): buttons/controls 8–14px; cards/tiles 12–20px; sheets/large panels 16–28px (often only top corners on bottom sheets); alerts ~14px; pills/capsules = `height/2`. Bars and floating glass tend toward full **capsule** shapes.
- Near a window/screen edge, prefer a radius that aligns with the device's corner; standalone components can fall back to a fixed radius.

```css
:root{ --r-control:12px; --r-card:16px; --r-sheet:24px; }
.card{ border-radius:var(--r-card); }
.card .inner{ /* concentric */ border-radius: calc(var(--r-card) - 12px); margin:12px; }
@supports (corner-shape: superellipse(2)){
  .squircle{ corner-shape: superellipse(2.2); } /* ~Apple smoothing */
}
```

---

## 8. Iconography (SF Symbols → web)

- Apple ships **SF Symbols** — thousands of glyphs that **match SF font weights and optical sizes** so icons align with text. Icons are simple, consistent, and used the same way everywhere.
- **Match icon weight to adjacent text weight**, and size icons relative to the text (roughly cap-height to a bit larger). Align icons to the text baseline/centerline.
- **Use a symbol once to introduce a group**; don't repeat or tweak the same glyph for closely related actions — let text differentiate.
- **Label ambiguous icons.** A pencil/checkmark can be misread (annotate? confirm?); when there's no obvious shorthand, **add a text label**. Bars increasingly favor symbols, but clarity wins.
- **On the web:** SF Symbols isn't licensed for web font embedding. Use a clean, geometric, consistent open icon set as a stand‑in — **Lucide**, **Phosphor**, **Feather**, or **Material Symbols (Rounded)** — sized/weighted to match your type. Keep stroke widths consistent and corners rounded to feel SF-like. Provide filled variants for "selected" states (e.g., tab bars: outline = unselected, filled = selected).

---

## 9. Depth, elevation & shadows

- Convey layers with **translucency and soft, diffuse shadows**, not heavy drop shadows or hard borders. Apple shadows are large, low-opacity, and close to neutral.
- Prefer **separation by background tone + hairline + blur** over boxes. A row separator is a 0.5px translucent `separator`, inset to align with content (not full-bleed unless intentional).
- Elevation cues: floating glass/sheets cast a soft shadow; in **dark mode raise by lightening** the surface rather than darkening.

```css
--shadow-1: 0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.10);   /* resting card */
--shadow-2: 0 8px 24px rgba(0,0,0,.12);                              /* popover */
--shadow-3: 0 20px 60px rgba(0,0,0,.22);                             /* modal/sheet */
.hairline{ height:0.5px; background:var(--separator); }
```

---

## 10. Motion & animation

Motion **focuses attention and maintains continuity** — it shows where things come from and go, and makes actions feel direct. It is never gratuitous.

- **Swift and soft.** Durations are short: **~0.2–0.35s** for most UI transitions; micro-feedback ~0.1–0.2s; larger surface transitions up to ~0.5s. Avoid slow, lingering animation.
- **Easing.** Use ease-out/spring-like curves (decelerate into place). A good default `cubic-bezier(0.2, 0.8, 0.2, 1)`; for playful springs, slight overshoot. Avoid linear easing for UI.
- **Continuity.** Animate from the source: a sheet **slides up** from the bottom; a detail view **pushes in** from the trailing edge and back button reverses it; a tapped item can **expand** into the next view. Reverse the entry on exit.
- **Feedback.** Buttons/cells **dim or scale slightly** on press (e.g., opacity 0.6 or scale 0.97). Toggles slide. Selection highlights fade.
- **Respect `prefers-reduced-motion`** — replace movement with simple cross-fades or no animation; disable parallax/specular.

```css
:root{ --ease: cubic-bezier(.2,.8,.2,1); --dur: .28s; }
.btn{ transition: transform var(--dur) var(--ease), opacity var(--dur) var(--ease); }
.btn:active{ transform: scale(.97); opacity:.7; }
.sheet-enter{ transform: translateY(100%); } .sheet-enter-active{ transform:translateY(0); transition: transform var(--dur) var(--ease); }
@media (prefers-reduced-motion: reduce){ *{ animation-duration:.01ms!important; transition-duration:.01ms!important; } }
```

---

## 11. Components

General rule: prefer **standard, familiar components**; keep them quiet; reserve the accent for action. Specs below are the web translation of Apple's controls.

### Buttons
- **Hierarchy of emphasis:** *Filled* (primary, accent background, white text, capsule/rounded) → *Tinted* (accent text on a light accent fill) → *Gray/Plain* (text-only, accent or label color). One primary action per view.
- **Destructive = red.** Disabled = reduced opacity (~0.3) + non-interactive.
- **Sizes:** min height 44px; comfortable padding (e.g., 12–16px vertical context-dependent, 16–20px horizontal). Capsule (`border-radius:height/2`) is the modern default; rounded-rect (10–14px) also valid.
- Label with a **verb that states the outcome** ("Save Changes", "Send"). Sentence case or Title Case, consistent.

```css
.btn-filled{ background:var(--tint); color:#fff; font-weight:600; border-radius:999px;
  padding:12px 20px; min-height:44px; border:0; }
.btn-tinted{ background:color-mix(in srgb, var(--tint) 15%, transparent); color:var(--tint); }
.btn-plain{ background:none; color:var(--tint); font-weight:600; }
.btn[disabled]{ opacity:.35; pointer-events:none; }
```

### Navigation bar (top)
- Holds the **title** and a few controls. Two title modes: **large title** (left-aligned, ~34px, shown at top of scroll) that **collapses to an inline 17px Semibold title** as you scroll. Background is a **chrome material** (translucent, blurs content under it) with a hairline when content scrolls beneath.
- Keep it sparse: title + 1–2 actions per side. Back navigation on the leading side (chevron + optional label).

### Tab bar (primary navigation)
- 2–5 destinations, icon + short label, **always visible** within a section (never hide it when drilling in). Selected tab uses the **accent color + filled icon**; others are gray + outline icon.
- iOS 26: tab bars **float** as a translucent Liquid Glass capsule near the bottom. On the web, a bottom bar on mobile / a top or side nav on desktop is the adaptive equivalent.

### Toolbar
- A row of actions (often icon buttons) at top or bottom, on a material background. Group related actions; use symbols with labels where ambiguous.

### Lists / tables (the workhorse)
- Apple UIs are largely **lists**. Two styles: **plain** (full-width rows, leading-aligned, section headers) and **inset grouped** (rounded white cards on a gray page — the Settings look).
- **Row min height 44px.** Structure: optional leading icon/image → title (Body/Headline) + optional subtitle (Subheadline, `secondaryLabel`) → trailing value/accessory. Accessories: chevron (`›`) for navigation, switch, checkmark, info.
- **Separators are inset** to start at the text, not the screen edge, and are hairline `separator`. Group with section headers (Footnote, uppercase or sentence case) + whitespace.
- Support row actions (swipe-to-reveal on touch; hover/menu on desktop). Tapping a navigational row pushes a detail view.

```css
.list-inset{ background:var(--bg-grouped); padding:var(--space-4); }
.list-inset .group{ background:var(--card); border-radius:var(--r-card); overflow:hidden; }
.row{ min-height:44px; display:flex; align-items:center; gap:12px; padding:11px 16px; }
.row + .row{ box-shadow: inset 0 .5px 0 var(--separator); margin-left:16px; } /* inset hairline */
.row .subtitle{ color:var(--label-2); font-size:15px; }
.row .chevron{ margin-left:auto; color:var(--label-3); }
```

### Forms & text inputs
- Inputs are usually **rows in a grouped list** with a label and a filled/underlined field, or a `systemFill` rounded field. Min height 44px; clear placeholder using `placeholderText`; clear focus state (accent ring).
- Group related fields into sections with a header and a **footer note** explaining the section (Footnote, `secondaryLabel`). Validate inline; errors in red **with text**, not color alone.

### Segmented control
- A pill containing 2–5 mutually exclusive options; the selected segment gets a raised "thumb" (white/elevated) on a `tertiarySystemFill` track. Equal-width segments, Subheadline/Body text.

### Switches, sliders, steppers
- **Switch:** capsule track, knob slides; ON = systemGreen (or accent) fill. Binary, instant effect, no confirm.
- **Slider:** thin track, accent-filled leading portion, round thumb; optional min/max icons.
- Use platform-feeling controls; keep them small and precise but tap-safe (44px hit area even if visual is smaller).

### Sheets & modals
- **Bottom sheet** is the default modal on touch: slides up, rounded top corners (~24px), can be **detented** (medium/large heights) and dismissed by swipe-down or a Cancel/Done bar. Content behind dims/scales back slightly (depth).
- Put **Cancel (leading) / Done or primary (trailing)** in a small top bar. Every modal must have an obvious dismiss path — never trap the user.
- Use modals for focused, self-contained tasks; don't over-modal. On desktop, center a card dialog with the same shape language.

### Alerts
- Small **centered** dialog: short title, optional one-line message, **1–3 buttons** stacked or side-by-side. Default/primary action emphasized (bold); destructive in **red**; Cancel present. ~14px radius, on a material. **Reserve alerts for important, interrupting decisions** — use inline banners/toasts for non-critical info.

### Action sheet / menus
- A list of contextual actions (from a button or long-press). Destructive actions red and usually last; Cancel separated. Populate menus with **symbols** where they aid recognition.

### Popovers & tooltips
- Lightweight floating panel anchored to its trigger, on a material with a soft shadow, with an arrow pointing to the source. Good for secondary info/controls on larger screens.

### Search
- Rounded `systemFill` field with a leading magnifier glyph and clear (✕) button; placeholder in `placeholderText`. Often pinned under the nav title; reveals suggestions/recents on focus.

### Status & feedback
- **Progress:** thin determinate bar (accent) or a spinner for indeterminate. Prefer determinate when you know the length.
- **Badges:** small red capsule with a count for notifications.
- **Empty states:** centered icon + short title + one supporting line + (optional) one action. Calm, not apologetic.
- **Toasts/banners:** transient, non-blocking confirmations; slide in, auto-dismiss.

---

## 12. Common patterns

- **Navigation model.** Flat where possible: **tab bar** for top-level sections; **drill-down** (push/pop) within a section via lists → detail views; **modals/sheets** for focused tasks that interrupt the flow. Keep the user oriented with clear titles and a reliable back path.
- **Onboarding.** Minimal and skippable. Teach by doing, not long tours. Defer permission prompts until the moment they're needed, with context. Get users to value fast.
- **Data entry.** Ask for the least possible; pre-fill and use sensible defaults; pick the right input type (don't make people type what they can tap/select); validate inline and forgive errors.
- **Feedback & status.** Acknowledge every action immediately (state change, motion, haptic on native). Show system status without nagging. Use the lightest sufficient surface (inline > toast > banner > alert).
- **Loading.** Show structure immediately — **skeletons/placeholders** over spinners where possible; keep perceived performance high; never block the whole screen for a small fetch.
- **Permissions & destructive actions.** Explain *why* before requesting; confirm destructive actions and color them red; make undo available when you can.

---

## 13. Accessibility (non-negotiable, designed in from the start)

- **Contrast (WCAG AA):** body/normal text **≥ 4.5:1**; large text (≥18px, or ≥14px bold) **≥ 3:1**; meaningful UI/icons **≥ 3:1**. Check in **both** light and dark. Re-check any text on glass/translucent surfaces.
- **Text scaling (Dynamic Type analog):** size in `rem`, support browser zoom and OS large-text up to **200%** without clipping; layouts must reflow (consider switching rows from horizontal to vertical at large sizes).
- **Tap targets ≥ 44×44px** with spacing between them.
- **Never convey meaning by color alone** — add text/icon/shape. Provide non-color cues for states (error, selected, success).
- **Semantics first:** a heavily styled control is still a real `<button>`/`<a>`/`<input>` with proper labels, roles, and focus order. Visual decoration (glass, custom shapes) must not strip semantics from assistive tech.
- **Visible focus** states for keyboard users (accent ring). Full keyboard operability.
- **Respect user settings:** `prefers-reduced-motion` (kill parallax/specular/large transitions), `prefers-reduced-transparency` (swap glass for solid), `prefers-contrast` (boost separators/text), `prefers-color-scheme`.
- **Provide text alternatives** for images/icons; caption media.

---

## 14. Voice & writing (UX copy)

Apple's tone: **clear, warm, plain-spoken, human.** Short sentences, active voice, no jargon. Speak to people, not "users."

- **Lead with the verb / outcome.** "Share File", "Delete Photo", "Turn On Notifications" — not "Submit", "OK to proceed?".
- **Be specific and honest.** Say exactly what will happen, especially for destructive or paid actions.
- **Drop filler.** Skip "Please" and helper words unless politeness genuinely helps. Don't over-explain; add a short context hint only when needed.
- **Consistent terminology.** Use the same word for the same thing everywhere. Sentence case for most UI text; Title Case for prominent buttons/titles if you choose — be consistent.
- **Errors:** explain what happened and how to fix it, kindly; never blame the user.

---

## 15. Responsive / adaptive strategy

- **Mobile-first, then expand.** Compact = single column, bottom navigation, full-width rows, sheets. Regular/desktop = multi-column, sidebars, split view (list + detail), popovers, hover states.
- **Reflow over rescale.** Change layout structure at breakpoints; don't just shrink. Keep reading measure capped on wide screens.
- **Consistent elements across sizes.** Same symbols, same color roles, same type scale — only the arrangement changes. Group content stays grouped as it adapts.
- Suggested breakpoints (convention): compact `< 768px`, regular `≥ 768px`, large `≥ 1024px`, with content max-width on the largest.

---

## 16. Copy-paste starter tokens (CSS)

A minimal but complete token layer implementing the above. Drop into a stylesheet and build with the classes/vars.

```css
:root{
  /* Type */
  --font-sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Helvetica Neue",system-ui,sans-serif;
  --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  /* Spacing (8pt) */
  --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:20px;--s6:24px;--s8:32px;--s10:40px;--s12:48px;
  --margin-edge:16px; --content-max:700px; --tap:44px;
  /* Radius */
  --r-control:12px; --r-card:16px; --r-sheet:24px;
  /* Color — light */
  --bg:#FFF; --bg-2:#F2F2F7; --bg-grouped:#F2F2F7; --card:#FFF;
  --label:#000; --label-2:rgba(60,60,67,.6); --label-3:rgba(60,60,67,.3); --label-4:rgba(60,60,67,.18);
  --placeholder:rgba(60,60,67,.3); --separator:rgba(60,60,67,.29); --fill:rgba(120,120,128,.2);
  --tint:#007AFF; --link:#007AFF; --red:#FF3B30; --orange:#FF9500; --yellow:#FFCC00;
  --green:#34C759; --teal:#30B0C7; --indigo:#5856D6; --purple:#AF52DE; --pink:#FF2D55;
  --gray:#8E8E93; --gray2:#AEAEB2; --gray3:#C7C7CC; --gray4:#D1D1D6; --gray5:#E5E5EA; --gray6:#F2F2F7;
  /* Motion / elevation */
  --ease:cubic-bezier(.2,.8,.2,1); --dur:.28s;
  --shadow-1:0 1px 3px rgba(0,0,0,.1); --shadow-2:0 8px 24px rgba(0,0,0,.12); --shadow-3:0 20px 60px rgba(0,0,0,.22);
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#000; --bg-2:#1C1C1E; --bg-grouped:#000; --card:#1C1C1E;
    --label:#FFF; --label-2:rgba(235,235,245,.6); --label-3:rgba(235,235,245,.3); --label-4:rgba(235,235,245,.16);
    --placeholder:rgba(235,235,245,.3); --separator:rgba(84,84,88,.6); --fill:rgba(120,120,128,.36);
    --tint:#0A84FF; --link:#0A84FF; --red:#FF453A; --orange:#FF9F0A; --yellow:#FFD60A;
    --green:#30D158; --teal:#40C8E0; --indigo:#5E5CE6; --purple:#BF5AF2; --pink:#FF375F;
    --gray2:#636366; --gray3:#48484A; --gray4:#3A3A3C; --gray5:#2C2C2E; --gray6:#1C1C1E;
  }
}
html{ font-family:var(--font-sans); color:var(--label); background:var(--bg);
  font-size:17px; line-height:22px; letter-spacing:-0.43px; -webkit-font-smoothing:antialiased; }
a{ color:var(--link); text-decoration:none; }
*:focus-visible{ outline:2px solid var(--tint); outline-offset:2px; border-radius:4px; }
@media (prefers-reduced-motion:reduce){ *{ animation-duration:.01ms!important; transition-duration:.01ms!important; } }
```

**One-line build prompt** (hand to an AI alongside this file):
> *Build this UI in Apple's design language using the tokens and rules in this file: content-first and calm; SF/system font with weight-driven hierarchy; 8-pt spacing; 17px body; semantic colors with the systemBlue accent reserved for interactivity; inset-grouped lists with 44px rows and inset hairlines; continuous/concentric rounded corners; translucent Liquid-Glass bars and sheets (with solid fallbacks); swift soft motion; full light/dark + accessibility support.*

---

## 17. Do / Don't quick reference

**Do**
- Make content the brightest thing; keep chrome quiet and translucent.
- Build hierarchy with type weight/size + whitespace on the 8-pt grid.
- Reserve one accent color for interactive elements.
- Use semantic color tokens; support light/dark from day one.
- Use continuous, concentric corners; inset list separators.
- Keep motion short, eased, and meaningful; honor reduce-motion/transparency.
- Hit 44px targets and WCAG AA contrast in both modes.
- Write verb-first, plain, specific labels.

**Don't**
- Don't use color as the only signal of meaning/state.
- Don't stack glass on glass, or float glass over busy images without a scrim.
- Don't go below 11px text, or below 17px for body.
- Don't center long body copy; don't rely on light font weights.
- Don't box everything with borders/shadows when space + a hairline will do.
- Don't hide primary navigation when drilling in; don't trap users in modals.
- Don't hard-code colors that ignore dark mode; don't disable zoom/text scaling.
- Don't add motion that doesn't explain something.

---

*Compiled from Apple's Human Interface Guidelines (Foundations: Layout, Typography, Color, Materials, Icons, Motion, Dark Mode, Accessibility, Writing; Components; Patterns) and the 2025 Liquid Glass design system, translated to web-buildable rules. Apple's official tokens are adaptive — prefer semantic roles over the measured hex values, and verify current specifics at developer.apple.com/design/human-interface-guidelines.*
