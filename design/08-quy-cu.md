# 08 — Quy củ · The rules both products obey

> *Vẻ đẹp thẩm mỹ là thứ chủ quan, nhưng consistency là vẻ đẹp mà không ai có
> thể từ chối được.*
> — the second Alpha principle (design/00)

Written 2026-07-28, when the base layers were rebuilt from the ground up.

---

## 0. What this document is, and what it is not

The website is **two products**:

| | Main site | Chia sẻ kinh nghiệm |
|---|---|---|
| Purpose | Be trusted, then be **contacted** | Be trusted, be **read**, be **shared**, and send the reader to the main site |
| Design language | «Đúng» (design/07) — cool ink, Inter, dye accent | The reading room (design/chia-se-kinh-nghiem/01) — warm paper, Literata, indigo |
| Stylesheet | `css/main.scss` → `_sass/_base.scss` | `css/chiasekinhnghiem.scss` → `_sass/chia-se-kinh-nghiem/_theme.scss` |

They are meant to look different. A marketing page and a reading room are not
the same room, and the reading room must not "assert brand presence".

**Quy củ is the layer underneath both.** It holds what does not vary: how far
apart things sit, how a corner is cut, how big a target is, how long a
transition lasts, what a focus ring looks like, what contrast is owed. Those
are not taste. They are physics, and a reader who follows a link from an
article to the company page should never feel the ground change under them.

It lives in **`_sass/_quy-cu.scss`**, which both stylesheets import. If a rule
is in that file, both products obey it. If a product needs to break one, the
exception is **written down with its reason**, in the stylesheet, next to the
code — an exception with a reason is the rule working, an exception without one
is drift.

> The test: *could a careful person, given only this document, rebuild a
> component and land on the same numbers we did?* If not, the rule is not
> written yet.

---

## 1. Space — one ladder, eleven rungs

Every margin, padding and gap on either product is a rung of one 4px ladder.
Rungs are named by **what they separate**, because a bare number invites "well,
30 is between 24 and 32":

| rung | px | separates |
|---|---|---|
| 1 | 4 | an icon from its label |
| 2 | 8 | things inside one control |
| 3 | 12 | two lines of one object (title → meta) |
| 4 | 16 | two objects in a group (card → card) |
| 5 | 24 | two groups · **the page gutter, on both products** |
| 6 | 32 | a component's own padding |
| 7 | 40 | · |
| 8 | 48 | two blocks in a page · section rhythm, compact |
| 9 | 64 | two page regions · section rhythm, medium |
| 10 | 96 | section rhythm, generous |
| 11 | 128 | the widest air on the page |

1–4 are the fine steps, 5–8 the component steps, 9–11 the page steps.

**Nothing sits between rungs.** If a value wants to, the layout is wrong, not
the ladder.

*What this replaced:* a map that carried two rungs holding the same 4px, no 8px
at all, and keys of 28 / 44 / 60 / 80 / 120px inherited from an abandoned 11px
point scale. Keys 5, 8 and 11 were not steps of anything. Thirty-three spacing
utilities in the markup were remapped onto the ladder; where the old scale had
a real value it was preserved exactly, and the two that had none (44 and 80px)
snapped to 48 and 64.

---

## 2. Shape — one corner, and it is CSS

Corners are **superellipses, not circular arcs**. A circular `border-radius`
joins the straight edge with a curvature jump — 0 to 1/r at the tangent point —
and the eye reads that point as *here the corner starts*. A superellipse with
n > 2 meets the edge at zero curvature, so the bend fades in and nothing marks
where it begins.

That is Absolute Neutrality in one shape: 98% of readers will never see it, and
they would feel the page get harder if it went.

**Depth is the invariant.** What registers as "how rounded" is the 45° depth of
the cut, `depth(r, n) = r·√2·(1 − 2^(−1/n))`, so a superellipse needs its radius
grown by `s(n) = (1 − 2^(−½)) / (1 − 2^(−1/n))` to sit at the same depth as the
circle. At n = 4 — the squircle proper, and what `corner-shape: superellipse(2)`
means, since the argument is log₂(n) — that is **×1.8409**.

One mixin, five radii, and each radius is bound to a **kind of object** so that
"which radius?" is answered by "what is it?":

| | px | for |
|---|---|---|
| `$r-1` | 4 | flags, code, tiny chips |
| `$r-2` | 8 | inputs, menus, small controls, the hub's cards and buttons |
| `$r-3` | 12 | buttons |
| `$r-4` | 16 | cards, images, accordion |
| `$r-5` | 24 | portraits, large panels |

```scss
@include squircle($r-3);   // authored 12px, drawn as a 22.09px superellipse
```

Browsers without `corner-shape` — everything before Chromium 139, all of iOS
today — get the plain authored radius. Nothing else changes.

### 2.1 Why the script is gone

`js/squircle.js` (deleted 2026-07-28) did this at runtime: it swept the whole
document with `getComputedStyle`, held a `MutationObserver` on
`documentElement`, a `ResizeObserver` on constrained elements, and wrote inline
`!important` styles over the stylesheet. 16 KB, on every page, on phones, to
produce values that were knowable at authoring time.

**Four out of five of our readers are on a phone.** A design detail that costs
them scroll frames is not neutral, whatever it looks like.

The one thing the script did that CSS cannot is fit the exponent to elements
with no room for the full curve — a 44px-tall button cannot hold a 22px corner.
That is handled by knowing the sizes: every call site was checked, and where the
depth-matched radius would pass half the shorter side the browser's own
proportional shrink (CSS Backgrounds §5.5) lands within a fraction of a pixel of
what the script computed. It was solving at runtime a problem with eleven known
answers.

Measured: **−1.4 KB gz** from the main bundle, **−1.7 KB gz** from every hub
page, **+0.3 / +0.1 KB gz** of CSS. And the shape became a decision written in
the stylesheet instead of a side effect of a script running over elements nobody
chose.

`verify.mjs` now fails the build if the `@supports (corner-shape: …)` block or
its depth-matched radius does not survive minification — the failure would
otherwise be invisible, the same way the `@font-feature-values` one was.

---

## 3. Touch — 44px, and it is a measurement

Every control on both products, at every viewport: **44px minimum**. Not
"roughly 44", not "44 unless it looks big".

Where the visible shape must be smaller than that — a quiet text link acting as
a button — the target is grown with padding and pulled back with equal negative
margin, so the rhythm is untouched and the thumb still wins:

```scss
@include tap-target(1.25rem);   // shape stays 20px; target becomes 44px
```

This is accessibility-first read literally. The user *"có thể là một người công
nhân"* — someone whose hands are not clean, not steady, and not free.

Fixed by this rule: dropdown menu rows (were 32px), the hub's brand-name link
(was 36px), and the hub's buttons (were ~39px).

---

## 4. Motion — one curve, three durations

```css
--ease: cubic-bezier(0.2, 0.8, 0.2, 1);
--t-1: 120ms   /* the answer to a finger: press, tap, colour flip */
--t-2: 200ms   /* a state changing: hover, fade, a mark swapping   */
--t-3: 320ms   /* a surface arriving: menu, collapse, sheet        */
```

The curve is a plain decelerate — fast to leave, slow to arrive, the way an
object with mass behaves — and deliberately **not a signature**. The duration is
chosen by what the motion is *for*, never by how it looks.

**Nothing moves that a reader did not ask for.** Nothing loops. Nothing plays on
load. Every transition on this site is a *reply*.

*What this replaced:* ten easing curves across the two stylesheets —
`(.2,.8,.2,1)`, `(.2,.6,.2,1)`, `(.4,0,.6,1)`, `(.28,.11,.32,1)`,
`(.12,0,.38,0)`, `ease`, `ease-in-out`, `linear` — and durations of
100/120/160/180/200/240/280/300/320/400/1100 ms. No reader could name one of
them, and every one of them was somebody's afternoon.

**The one named exception**, because it is a different *kind* of motion:
`--t-settle: 1100ms`, the deep-link arrival glow on a review card, which has to
outlast a smooth scroll across the page. It is named so it cannot be mistaken
for someone's afternoon.

Under `prefers-reduced-motion`, travel and scale go; colour and opacity stay. A
reader asking for less motion is asking about **movement**, not about feedback,
and a control that answers nothing reads as broken.

---

## 5. Focus — our own ring, drawn by us, on every control

```scss
@include focus-ring;   // box-shadow: 0 0 0 2px var(--focus-halo),
                       //             0 0 0 5px var(--focus)
```

**It is a `box-shadow`, not an `outline`, and that is the whole design.** Two
reasons, in order of how certain we are of them:

1. **It wins the cascade.** This one is certain and it is decisive. Bootstrap
   ships `.btn:focus-visible{outline:0}`, `.accordion-button:focus{outline:0}`
   and `.nav-link:focus-visible{outline:0}` — all specificity 0,2,0 against a
   bare `:focus-visible` at 0,1,0, read straight out of the shipped CSS. The
   site was drawing **three different focus treatments**: ours on plain links,
   Bootstrap's own ring on buttons, and *nothing at all* on the accordion
   header, where their `outline:0` and our `box-shadow:none` cancelled each
   other out. Moving to box-shadow means we stop contesting the `outline`
   property entirely. The framework's rings are now switched off at the
   variable (`main.scss` §8) and our rule names every component that would
   otherwise take itself back.
2. **It rendered wrong.** Observed: the ring drew as a shape that did not match
   the button it surrounded, and fragments survived after focus moved on.
   **Per spec this should not happen** — MDN lists `outline` among the
   properties that follow `corner-shape`, alongside `background`, `border` and
   `box-shadow` — so this is a young implementation rather than a property-level
   gap, and it may be fixed upstream later. It is still what shipped and what a
   reader saw. A box-shadow is painted with the element's own border-box
   decoration instead of in a separate outline pass, so it composites and
   repaints with the element and leaves nothing behind.

Reason 1 alone would justify the change. Reason 2 is why it looked *broken*
rather than merely inconsistent.

### Two tones, because one colour cannot do this job

The ring must be visible against **both** the control it surrounds and the
ground that control sits on, and those are different colours. So:

```text
  control  │ halo 2px │ ring 3px │  page
```

The halo separates the ring from the control's fill; the ring is the indicator.
**Both tokens flip together** on dark surfaces — flipping only the ring leaves a
white halo under a white ring and the two smear into one 5px band.

| surface | ring | halo | measured |
|---|---|---|---|
| light page | `#0066cc` | `#ffffff` | ring on white **5.57:1**, halo on the dye button **4.63:1** |
| ink surface | `#ffffff` | `#07151f` | ring on the hero scrim **13.55:1**, halo against the ring **17.42:1** |
| hub paper | `--indigo` | `--paper` | **7.87:1** |
| hub viewer | `--paper` | `#15110b` | **17.44:1** |

This began as a real failure. The old ring was `#0071e3` at every scroll
position and measures **2.89:1** on the hero scrim — under the 3:1 WCAG 2.2
SC 1.4.11 asks of a focus indicator, on the hero's own call to action, which is
the most important button on a site whose entire job is to be contacted.

The one documented exception is the dropdown menu row, which turns the same ring
**inward** (`focus-ring-inset`) because it is flush with the menu's own rounded
edge. Order reverses there: ring outermost against the menu edge, halo inside it
against the row's hover fill.

### Two things that will bite

- **`forced-colors` throws box-shadow away.** The mixin carries a
  `@media (forced-colors: active)` branch that redraws the ring as
  `outline: 3px solid Highlight`. Without it the ring vanishes for exactly the
  readers least able to lose it.
- **PurgeCSS eats the bare `:focus-visible`.** It has no class or element to
  match a bare pseudo-class against, so it removed it — in production only,
  silently — and shipped a build with a ring on buttons and *nothing* on the
  ordinary links that make up most of the page. It is safelisted in
  `optimize-css.mjs` and `verify.mjs` fails the build if it goes missing again,
  along with either tone and the forced-colors branch. All three gates were
  proved to fire by deliberately corrupting the built CSS.

---

## 6. Colour — ramps, then roles, then never a hex again

Both products keep their own palette. The **structure** is shared:

1. **Ramps** — raw material, ordered by lightness, each rung carrying its
   measured contrast. Referenced only by section 2.
2. **Roles** — what a colour is *for*: `$fg`, `$fg-muted`, `$fg-subtle`,
   `$surface`, `$line`, `$link`, `$accent`, `$focus`. **This is the only layer
   a component stylesheet reads.**
3. **Framework bridge** — Bootstrap's own names (`$primary`, `$gray-500`, …)
   pointed at the roles. It introduces no colour; it only translates.

You pick a colour by naming its job. Two people cannot pick differently.

*What this replaced (main site):* sixty-four colour variables, of which
**thirty-two were dead**, including an entire unused dark-theme palette. Several
were the same colour under two names — `$slate-600` and `$text-secondary` were
both `#46586a`; `$blue-pale` and `$light` were both `#c3e5f1`. Four ramps of
neutrals coexisted (`$gray-*`, `$ink-*`, `$slate-*`, `$mist-*`/`$paper-*`); now
there is one, cool, twelve rungs. Ten oranges and seven blues became one dye
ramp and one blue ramp.

### 6.1 The contrast contract

Every pairing that ships is measured, and the ramp comment states where each
rung may be used. Non-negotiable:

- **Text: 4.5:1.** No exceptions, including "muted" tiers — a muted tier that
  fails is not muted, it is missing.
- **Large text and marks: 3:1.** `$accent` (#e35205, 3.84 on white) is large
  text and marks *only*; small accent text uses `$accent-strong` (#b8390a, 5.79).
- **Controls, their edges, and the focus ring: 3:1** against everything adjacent.
- A rung that fails as text is **named as non-text** in the ramp (`$ink-300`,
  2.83) and never used for words.

Fixed by this pass:
- `$text-dark-tertiary` was `rgba(255,255,255,.42)` → **4.03:1** on the ink
  panel, failing AA as normal text. Now `.56` → 6.17. The muted tier moved
  `.66` → `.72` to keep three visibly distinct steps.
- The hub's `--line` was `#e2dccb`, **1.29:1** off the paper — close to
  invisible on a phone in daylight, on a hub where the hairline is the only edge
  a series card has and the only thing separating one post from the next. Now
  `#d5cbaf`, 1.52:1: still unmistakably a hair, 18% more of it reaching a reader
  who *"bị tật khúc xạ, cận thị, viễn thị, loạn"*.
- The new call button's dye fill is 5.79:1 on the white bar but ~2.3:1 against
  the scrimmed hero photo. It carries a permanent white hairline: 4.6:1 over the
  hero, invisible on white, so the control is correctly bounded on both grounds
  **without changing appearance under the reader**.

### 6.2 The one tinted band

`<section class="bg-light">` (Lợi ích) is the only section on the main page that
is not white, and it is the single thing that breaks the owner's *"the calm
white baseline is sacred"* rule (design/07 §7.4). It predates that rule.

It has not been deleted — that is the owner's call, and it is one attribute in
`_includes/benefits.html`. It has been made quieter and brought into the family:
the tint moved from `#c3e5f1`, a saturated pale cyan belonging to no ramp and
sitting 1.33:1 off white, onto `$ink-50` — the page's own neutral one step down,
1.16:1. The band still marks the section and no longer announces it.

---

## 7. Type — the number of sizes is part of the design

Both products hold their own faces and their own ramps (main site: Inter,
16px body, `--fs-*` stepped at breakpoints, no `clamp()` — owner direction. Hub:
Literata for reading, Inter for chrome, one breakpoint at its own measure). What
quy củ governs is **how many sizes there may be**, and one floor.

**The floor: 14px.** Nothing that a reader has to read, and nothing they can
click, is smaller. The old footnote rung was 13px and it was carrying the
director's name in the footer, the copyright line, and the *"read the original
in Vietnamese"* **link** — a control, at 13px, on a phone. The philosophy names
the readers: *"một người bị tật khúc xạ, mù màu, cận thị, viễn thị, loạn"*, and
*"tuổi tác từ trẻ mới ra trường đến già sắp về hưu"*. One step up costs the
layout nothing.

The one thing allowed below the floor is a run of **capitals**, which read
larger than lowercase at the same size, so a 13px letterspaced label is
correct — and it is the only 13px on either product.

The hub's chrome went from five sizes (0.75 / 0.8125 / 0.84375 / 0.875 /
0.9375rem — twelve to fifteen pixels, five values inside three pixels) to three
named ones: `--fs-label` 13 (uppercase only), `--fs-meta` 14, `--fs-ui` 15.

**Vietnamese sets the leading.** A tone mark stacks above a vowel mark, so "ế",
"ộ", "ữ" are two storeys tall above the x-height. The reading room had always
set 1.6–1.75 for exactly this reason; the main site was still on 1.5, the Latin
default, with no reason to be. One language, one leading: body is now **1.6**
everywhere.

---

## 8. Purpose — what each product is trying to do

Consistency is what does not vary. **Purpose is what decides everything else.**

### 8.1 Main site: be trusted, then be contacted

The page had a real gap against its own purpose. On a phone — four out of five
readers — the bar held a logo and a language flag, and the phone number first
appeared in section 8 of 8, roughly six screens down. There was nothing to act
on.

What changed:

- **A call button in the chrome**, at every scroll position, on every width. One
  tap opens the dialler. Dye-filled, because dye is "the moment that matters"
  (design/07 §1) and this is the moment. Under md the label is the verb; from md
  the number itself shows, because a number a reader can *read* is one they can
  also write down. It does not appear and disappear with scroll: a control that
  changes under you is a control you have to re-read.
- **Two actions in the hero**, in the order a cold visitor needs them: read on
  first, reach a human second. The call is the quiet button here — the page has
  not earned a phone call yet — but it is on the first screen, and a legible
  number on its own says a real person answers.
- **The closing ask flips the order**: in the CTA panel the call is the filled
  button and email is the quiet one.
- **`.actions`**: a row of calls to action that stacks full-width under sm. A
  button only as wide as its own label is a desktop object; a thumb is aiming.

#### The bar carries what the page cannot do for itself

Adding the call button used up the last of the bar's width, and the six nav
labels started wrapping to a second line inside a fixed-height bar. The rule
that settled it is not "what fits" but **what belongs in chrome**:

> This is one long page. It can scroll to its own sections — a reader does that
> with a thumb, and does it without being told. What it *cannot* do on its own
> is open a specific product panel, cross to the reading hub, dial us, or change
> language.

So the expanded bar keeps **Sản phẩm ▾** (a real menu that opens a named product
panel) and **Chia sẻ kinh nghiệm** (the route to the other product), plus the
call button and the language switcher. The four section anchors carry
`nav-item--toc` and appear **only in the drawer**, under `lg` — which is the
navbar's own collapse breakpoint, so the rule cannot drift from it. On a phone a
table of contents for an eight-section page is genuinely useful and there is a
column of room for it; on a wide bar it needed ~648px against ~565px free.

`display: none`, deliberately, and not `visually-hidden` — which was tempting,
because three entries in that same list already use it. `visually-hidden` keeps
an element **focusable**, so a keyboard user on a wide screen would tab into
four links they cannot see: SC 2.4.7 Focus Visible, failed, with the ring drawn
on nothing. The existing three get away with it only because they carry
`tabindex="-1"`, and a media query cannot add an attribute.

Also: `.navbar .nav-link` is `white-space: nowrap`. It replaced a
`text-overflow: ellipsis` that had never done anything (it needs
`overflow: hidden` and a non-wrapping line, and had neither) and would have been
the wrong answer anyway — "Các sản ph…" is exactly the partial information loss
design/00 §2.1 forbids.

### 8.2 Chia sẻ kinh nghiệm: be read, be shared, send them onward

- **The device's own share sheet** (`navigator.share`), first in the row. On a
  phone this one button is Zalo, Messenger, SMS and every contact the reader
  already has, in the UI they already know. Zalo is how a link actually travels
  between Vietnamese factory people, and this reaches it without the page
  carrying Zalo's SDK. Shown only where the API exists; Facebook and copy-link
  remain for everywhere else.
- The route onward — the contact banner before the footer, the logo half of the
  lockup, the in-article CTAs — was already right and is unchanged.

---

## 9. Icons — one family, one setting, no exceptions

Every icon on the site is **Material Symbols**, and every one of them is drawn
at the same point in that family's four-axis space. The axes are not options to
pick per icon; they are set once, here, and the set is regenerated from them.

| axis | value | why |
|---|---|---|
| **style** | Outlined | Inter has flat terminals and a rational grotesque skeleton. Rounded's ball terminals fight it; Sharp's square cuts contradict the squircle corner. Outlined is the neutral middle and the family's own default. |
| **fill** | 0 | Fill is a *state* axis — it means selected / active / on. Nothing here has an icon with a selected state, and spending the axis now leaves nothing to say "active" with later. |
| **weight** | 400 | Our UI text is 400–600, and Material at 400 carries roughly the same stem-to-size ratio as Inter Regular (~1/12 vs ~1/11), so icon and label read at one weight. |
| **grade** | 0 | See below — this one was considered and rejected. |
| **optical size** | matched to the rendered size | 48 for the feature icons (they render 48/56/64px), 24 for the chevron, 20 for the inline 1em glyphs. |

**Optical size is the axis that was actually doing damage.** It is a real design
axis, not a file size: at small sizes a glyph needs more internal air and
simpler detail, at large sizes it can be finer. Downloading one size and scaling
it is how you get a hairline mush at 16px or a blunt slab at 64px.

**Grade was rejected on purpose.** `GRAD` changes stroke thickness *without*
changing the icon's width, and it exists for exactly our case: light strokes on
a dark ground bloom optically, so Material's own guidance is −25 for icons on
dark. Our dark-surface icons render at 1em ≈ 15–16px, where that correction is
well under a pixel, and taking it would mean shipping a second near-identical
copy of the phone glyph plus a rule for remembering which is which. Invisible
complexity is the thing this document exists to prevent.

### What was wrong

The old set was downloaded piecemeal over a long period at settings nobody
recorded. Evidence, not impression: **every canonical Material export uses
`viewBox="0 -960 960 960"`, and five of the eleven did not** (offsets of 80,
119, 120, 133 and 160), while path complexity ran 1.5–3× the canonical set at
the same nominal size — `psychology` was 1575 B against 873 B. Those are the
fingerprints of mixed `wght` and `opsz`.

Two glyphs also said the same sentence differently: the accordion used
`keyboard_arrow_down` (a chevron) and the products dropdown used
`arrow_drop_down` (a filled triangle). One page, two objects, one meaning.

### The chevron is a mask, not a picture

There is now **one** `chevron-down.svg` with no `fill` attribute at all,
consumed through `mask` + `currentColor` (`@mixin chevron-down`). It replaced
three files. A fill baked into an SVG cannot follow the control it belongs to,
which is why there used to be a second copy in a paler grey and a media query to
choose between them — and why, in `forced-colors`, both were thrown away and the
chevron simply vanished. A masked shape has no colour of its own, so it is
correct on the white bar, over the hero photograph, in High Contrast, and in
states nobody has enumerated. Neither of the two baked greys (`#676767`,
`#ececec`) was a rung of the ink ramp.

Regenerate the whole set — never hand-download one icon — so the setting cannot
drift again. The reading hub deliberately has **no icons**: it is a reading
room, and its chrome is words.

---

## 10. Before you add anything

1. Is the value a rung of the ladder? (§1)
2. Does the corner use `squircle()` with one of the five radii? (§2)
3. Is every control ≥ 44px? (§3)
4. Is the transition one of `--t-1/2/3` on `--ease`? (§4)
5. Does focus come from the shared ring, with **both** tones? (§5)
6. Did you name a **role**, or did you write a hex? (§6)
7. Did you measure the contrast, or assume it? (§6.1)
8. Is anything a reader must read or tap below 14px? (§7)
9. Does it serve this page's purpose, or only look like it does? (§8)
10. Is the icon Material Symbols at the one setting, regenerated not hand-picked? (§9)
11. If you broke a rule, is the reason written next to the code?

Rule 12: **a green build is not evidence.** The `@font-feature-values` bug, the
`corner-shape` gate and the purged `:focus-visible` all exist because a
stylesheet can lose its whole point and still compile, minify, verify and
render. The focus one is the sharpest: it failed *only in production*, and the
thing it removed was the accessibility feature. If a thing matters and can fail
silently, it gets a gate in `verify.mjs` — and the gate gets proved by breaking
the build on purpose.
