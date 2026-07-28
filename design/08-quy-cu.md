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

## 5. Focus — one ring, and it adapts to its surface

```scss
:focus-visible { @include focus-ring; }   // 3px solid var(--focus), offset 2px
```

The colour is a custom property. **Light surfaces get the product's interactive
colour; dark surfaces redeclare it to white.** One token, inherited, nothing to
remember at the call site.

This was a real failure, not a tidy-up. The old ring was `#0071e3` at every
scroll position, and against the hero scrim it measures **2.89:1** — under the
3:1 WCAG 2.2 SC 1.4.11 asks of a focus indicator. The control it was failing on
is the hero's primary call to action: the most important button on a site whose
entire job is to be contacted. A keyboard user could not see where they were.

No single colour clears 3:1 on both grounds — the brand blue is 5.57:1 on white
and 2.43:1 on the scrim; white is 13.55:1 on the scrim and invisible on the
page. Hence the token.

| ring | on | ratio |
|---|---|---|
| `#0066cc` | white / tint / menu | 5.57 / 4.80 / 5.26 |
| `#fff` | ink panel / hero scrim / ink-950 | 17.41 / 13.55 / 18.48 |
| `--indigo` | hub paper | 7.87 |
| `--paper` | hub picture viewer | 17.44 |

The ring used to be declared separately on four components with three different
offsets. It is now declared once. The single documented exception is the
dropdown menu row, which turns its ring **inward** (`outline-offset: -3px`)
because it is flush with the menu's own rounded edge and an outward ring would
be clipped.

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

## 9. Before you add anything

1. Is the value a rung of the ladder? (§1)
2. Does the corner use `squircle()` with one of the five radii? (§2)
3. Is every control ≥ 44px? (§3)
4. Is the transition one of `--t-1/2/3` on `--ease`? (§4)
5. Does the focus ring come from `:focus-visible` and `--focus`? (§5)
6. Did you name a **role**, or did you write a hex? (§6)
7. Did you measure the contrast, or assume it? (§6.1)
8. Is anything a reader must read or tap below 14px? (§7)
9. Does it serve this page's purpose, or only look like it does? (§8)
10. If you broke a rule, is the reason written next to the code?

Rule 11: **a green build is not evidence.** The `@font-feature-values` bug and
the `corner-shape` gate both exist because a stylesheet can lose its whole point
and still compile, minify, verify and render. If a thing matters and can fail
silently, it gets a gate in `verify.mjs`.
