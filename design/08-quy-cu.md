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

## 2. Shape — one plain corner, five radii

Corners are **ordinary circular `border-radius`, and nothing else**.

One mixin, five radii, each bound to a **kind of object** so that "which
radius?" is answered by "what is it?":

| | px | for |
|---|---|---|
| `$r-1` | 4 | flags, code, tiny chips, the focus ring's own floor |
| `$r-2` | 8 | inputs, menus, small controls, the hub's cards and buttons |
| `$r-3` | 12 | buttons |
| `$r-4` | 16 | cards, images, accordion |
| `$r-5` | 24 | portraits, large panels |

```scss
@include corner($r-3);   // 12px. That is the whole of it.
```

### 2.1 The squircle is off (2026-07-28)

It was a superellipse — `corner-shape: superellipse(2)`, radius grown ×1.8409
to sit at the same 45° depth as the circle it replaced. The argument was that a
circular radius meets the straight edge with a curvature jump, so the eye reads
the tangent point as *here the corner starts*, while an n > 2 superellipse meets
it at zero curvature and the bend fades in.

The owner switched it off: *"hơi unconventional."* That is the decision, and
three things say it was the right one.

**A corner that has to be explained is no longer neutral.** Absolute Neutrality
asks whether a detail disappears. This one had started asking to be discussed —
in the stylesheet, in this document, and finally in a message. The version that
survives only because it is argued for has already failed its own test.

**It was two silhouettes, not one.** `corner-shape` is a 2025 property with one
engine behind it. Chromium 139+ drew the superellipse; every iPhone in the
country drew the circle. And because the depth match grows the radius, the
fallback rounded by a visibly different amount — a 12px button was a 22.09px
circle on iOS. "Consistency is beauty" cannot mean two shapes depending on the
reader's phone.

**It broke two things that were reported as bugs.** The accordion's outer border
curved where its inner one ran straight (16 × 1.8409 = 29.45 against 15 × 1.8409
= 27.61 — a 1.84px gap held apart by a 1px line, so the two curves were no
longer parallel), and the focus ring drew a shape that did not match the button
and left fragments behind after focus moved. That second one is a young
implementation rather than a wrong property — per MDN, `outline` and `box-shadow`
are both supposed to follow `corner-shape` — but it is what shipped and what a
reader saw.

Kept for anyone who revisits this: the depth of a 45° corner cut is
`depth(r, n) = r·√2·(1 − 2^(−1/n))`, so an n = 4 superellipse needs
`s(4) = 1.8409`. Recorded, used nowhere.

`verify.mjs` now fails the build if `corner-shape` reappears, or if a
depth-matched radius (14.7272 / 22.0908 / 29.4544px) survives anywhere. The
gate used to assert the opposite; it guards the same failure either way, which
is a corner geometry changing without anyone noticing.

### 2.2 Why the script is gone (and stays gone)

`js/squircle.js` (deleted 2026-07-28) did the corner at runtime: it swept the
whole document with `getComputedStyle`, held a `MutationObserver` on
`documentElement`, a `ResizeObserver` on constrained elements, and wrote inline
`!important` styles over the stylesheet. 16 KB, on every page, on phones, to
produce values that were knowable at authoring time.

**Four out of five of our readers are on a phone.** A design detail that costs
them scroll frames is not neutral, whatever it looks like. Measured: **−1.4 KB
gz** from the main bundle and **−1.7 KB gz** from every hub page.

With the superellipse itself now gone there is nothing left for a script to do.
Do not bring either back together.

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
   `box-shadow` — so it was a young implementation rather than a property-level
   gap. The squircle has since been switched off (§2), which removes the cause;
   the ring stays a box-shadow because reason 1 is untouched by that and is on
   its own decisive. A box-shadow is painted with the element's own border-box
   decoration instead of in a separate outline pass, so it composites and
   repaints with the element and leaves nothing behind.

Reason 1 alone would justify the change. Reason 2 is why it looked *broken*
rather than merely inconsistent.

### The ring has a shape of its own

```scss
:where(:focus-visible) { border-radius: $r-1; }
```

A box-shadow copies the silhouette of whatever it surrounds. That is right for a
control — a button's ring *is* that button, 5px bigger — and wrong for a run of
inline text, which has no silhouette to copy. So a plain link's ring came out a
hard rectangle while every button on the page wore a rounded one, and the site
had **two kinds of focus ring depending on what happened to be focused**
(owner, 2026-07-28: *"bị mix giữa rounded corner ở bên trong và sharp square
corner ở ngoài"*).

The rule: **where there is a silhouette the ring copies it; where there is none
it brings the smallest rung.**

It is written with `:where()`, which scores 0,0,0, so anything that states a
radius in a class rule beats it automatically — `.btn-xl`, `.navbar-call`,
`.skip-link`, `.locale-flag`, `.kt-button`, `.kt-series-card`, the viewer's
round close button, and any component nobody has written yet. **There is no
exception list to keep up to date.** `verify.mjs` gates the rule, because
`:where()` is exactly the kind of selector a minifier mangles and losing it
fails silently — the ring is still there, just two shapes again.

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

Two controls turn the same ring **inward** (`focus-ring-inset`), and they are
the same object seen twice: a full-width strip sitting flush against the inside
of a bordered box — the **dropdown menu row** and the **accordion header**. An
outward ring on either spills past its container's own edge, over the menu's
corner or over the accordion items above and below. Order reverses: ring
outermost against the container's edge, halo inside it against the row's hover
fill. Both keep a square corner, because a flush strip has none of its own —
which also means the accordion's ring is rounded at the top of the stack, square
in the middle and rounded at the bottom, exactly like the item it sits in.

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

## 5.1 Selection — an opaque pair, and a policy about what can be selected

**Both products name a background AND a colour.** Neither uses a translucent
wash any more, and that is a correctness fix rather than a taste one.

Measured, the wash the main site shipped — `rgba($accent, .24)` — landed these
on the white page:

| tier | on the wash |
|---|---|
| `$fg` #0e1b27 | 12.75:1 ✓ |
| `$fg-muted` #46586a | 5.36:1 ✓ |
| `$fg-subtle` #5b6e7f | **3.86:1 ✗** |
| `$link` #0066cc | **4.07:1 ✗** |

So selecting a paragraph made its links and its metadata *harder* to read than
they were unselected, and both fell under the 4.5:1 SC 1.4.3 asks. The muted
tiers start at 5.3 and 5.6; any wash strong enough to see spends the whole
margin. The hub had the same problem one ground down — on `--paper-deep` (cards,
blockquotes, table heads, the footer) its caption tier landed at 4.40:1.

Naming the ink as well removes the arithmetic entirely: **one pairing, measured
once, correct on every ground including ones nobody has invented yet.** It is
also what every browser's own selection does, and standard behaviour is the
house rule. The cost is that the text tiers flatten while selected, which is
what a native selection has always done and lasts as long as the drag.

| | background | text | measured |
|---|---|---|---|
| main site | `#f8d5c3` | `$fg` | 12.70:1 |
| hub, selection | `#f0e5bb` | `--ink` | 12.33:1 |
| hub, `<mark>` | `#fcf691` | `--ink` | 13.89:1 |
| hub, selection over a mark | `#e9d98a` | `--ink` | 11.0:1 |
| forced-colors | `Highlight` | `HighlightText` | the system's |

`#f8d5c3` is *exactly* what the old wash composited to on white, so the main
page looks unchanged and only the guarantee is new.

**Selecting is not highlighting** (owner, 2026-07-28). The hub briefly gave
selection the literal ink of a Stabilo Boss, `#fff200`. That spends the page's
loudest yellow on its shortest-lived state and leaves nothing for a real
highlight to be. The pair is designed as a pair now: selection is low-chroma
(C\* 22) and quiet, the mark is high-chroma (C\* 50) and loud, ΔC\* 28 between
them, and `mark::selection` deepens rather than replaces so a marked run stays
visible while it is being dragged over.

### What may be selected

One rule, and it is about what ends up in the reader's clipboard:

> If a reader could reasonably want to **quote** it, it stays selectable. If
> dragging across it would put something in the clipboard they did not ask for
> and cannot use, it does not.

Everything that carries meaning stays: every paragraph, heading, list, caption,
review, the phone number, the email address, the metadata. **That is not a
courtesy.** These pages exist to be quoted into a message to a colleague, and a
site that fights `Ctrl+C` is a site that fights being recommended. Nothing is
ever excluded to stop copying.

Three kinds of thing are excluded, each for its own reason:

| | why |
|---|---|
| **artwork** — logos, partner marks | a picture, not text; a drag across the header should not leave half a mark highlighted. Also `pointer-events: none` so it cannot be dragged out as a file |
| **chrome** — nav links, menu rows | furniture. A reader dragging from the top of the page would otherwise start their selection with "Các sản phẩm". Every OS treats its own chrome this way. It stops at the labels: the call button's **number** stays selectable |
| **generated marks** — `.heading-number` | `content: attr(data-number)`. Firefox copies generated content and Chromium sometimes does, so quoting a section could arrive as "01 Giới thiệu". The element holds nothing else, so the element is excluded rather than the pseudo-element, which is the part browsers disagree about |

The blockquote's `open-quote`/`close-quote` marks are deliberately **not**
excluded: those are content (design/07 §7.5 — the reviews are set in real curly
quotation marks because they are a direct record of what someone said), so a
reader copying a review should get them.

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

So the expanded bar keeps **Các sản phẩm ▾** (a real menu that opens a named
product panel) and the route to the other product, plus the call button and the
language switcher. The four section anchors are gone from the bar; on a wide bar
they needed ~648px against ~565px free.

**Correction, and it matters.** The first attempt hid them with a
`nav-item--toc` class above `lg`, on the reasoning that below `lg` they lived in
a drawer. *There is no drawer.* This navbar has no toggler, so
`.navbar-collapse` is a plain `.collapse` and is `display: none` under `lg` —
the class hid them from the only width that ever showed them. They are
`visually-hidden` + `tabindex="-1"` now, which is exactly what three anchors in
the same list already were: in the DOM and the accessibility tree, **out of the
tab order** (a `visually-hidden` element stays focusable, and tabbing into a
link you cannot see is SC 2.4.7 failed with the ring drawn on nothing), and
still there for scrollspy, which needs a link per observed section.

**Known and not fixed here:** because there is no drawer, the products menu and
the hub link are invisible below 1024px — that is, to four out of five readers.
That is a larger change than a styling pass and it is flagged, not patched.

#### The label has to be a noun

`toc_knowledge` became **"Blog Chia sẻ kinh nghiệm"** (owner asked for something
easier to picture, 2026-07-28). On its own, *Chia sẻ kinh nghiệm* is a **verb
phrase**, and in a row of nav items a verb phrase reads as something you *do*
here — closer to a feedback form than to a place. Every other item in the bar is
a noun. "Blog" makes it a place in one word every Vietnamese reader already
pictures, and the rest of the label still matches what the destination calls
itself in its own lockup — which is the whole wayfinding contract: you clicked
X, you arrived at X.

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
| **style** | Outlined | Inter has flat terminals and a rational grotesque skeleton. Rounded's ball terminals fight it; Sharp's square cuts are harder than any corner on the page. Outlined is the neutral middle and the family's own default. |
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

### 9.1 Which glyph — the audit (2026-07-28)

The pass above fixed the *setting*. This one fixed the *choices*, which the
owner had made by feel: *"khi tôi làm, tôi đã chọn bừa và chọn theo cảm tính."*

**The test an icon has to pass: does it name the thing beside it, or does it
name a mood?** A glyph that could sit above three different headings is not
labelling any of them.

| where | was | is | why |
|---|---|---|---|
| Quản lý công nghệ | `psychology` | `menu_book` | a brain is the AI cliché. The feature stores a chief technician's recipes and looks them up per batch — that is a **recipe book**, and books are what knowledge looks like before it looks like a brain |
| Lập kế hoạch | `view_timeline` | *kept* | a Gantt row is literally the feature |
| Tích hợp thiết bị | `precision_manufacturing` | `cable` | the work described is *wiring your machines into the system*. The robot arm belonged to the other card |
| Tuỳ chỉnh từng nhà máy | `warehouse` | `tune` | nothing in that section is about a warehouse. Three sliders set differently = the same system, set for your mill |
| Rất dễ sử dụng | `diversity` | `touch_app` | the claim in the heading is *fewest actions*, not *everyone*. A hand is the claim |
| Chất lượng | `editor_choice` | `verified` | a ribbon claims an award we did not win. A seal with a check claims what the copy claims: right, and checked |
| Giảm nhân sự | `savings` | *kept* | the copy is about cost, and a piggy bank is cost |
| Giảm sai sót | `security` | `rule` | a shield means *data security* — the wrong department entirely. ✓ over ✗ is error prevention |
| Tích hợp thiết bị có sẵn | `precision_manufacturing` | *kept, now unique* | the robot arm now appears once |

Two glyphs were used twice across two sections; one now appears once and the
other was replaced. **An icon used twice on one page is a claim that two things
are the same thing.**

### 9.2 A glyph rides an action, never a label

An icon earns its place only when it says something the words do not.

- **On buttons: yes.** A filled pill with a handset in it is recognised before
  it is read, which on a phone held one-handed in a mill is the difference
  between finding the call button and looking for it. The three buttons that
  dial carry `call`; the one that writes carries `mail` — the owner asked
  whether email should get an icon, and *on the button* the answer is yes,
  because otherwise a two-button row has one glyph and one bare label.
- **Beside a labelled value: no.** The footer's `<dt>` already says "Số điện
  thoại" and "Email". A handset and an envelope there repeat the label in a
  second alphabet, so the handset was removed from the footer list and from the
  support sentence that already opens with "Hãy gọi".
- **The exception is the external-link mark**, which stays: *"opens somewhere
  else"* is the one thing no word on those rows says. It moved **inside** the
  anchor at the same time — it had been an adjacent sibling, so the one mark
  saying "this leaves the site" was outside the link's hit area, outside its
  focus ring, unmoved by its hover, and announced as a stray object after the
  sentence. Moving it in also deleted fourteen lines of CSS, because everything
  those rules restated — the colour on light surfaces, on the two dark panels,
  on hover for each, and the whole `forced-colors` block repeating all four —
  is what `currentColor` means.

### 9.3 Two downward marks, both masks

The pass before this merged the chevron and the caret into one glyph on the
grounds that they say the same sentence. **They do not**, and it is reversed:

| | glyph | means |
|---|---|---|
| chevron | `keyboard_arrow_down` | *this expands in place* — accordion header, `<details>`. Content appears below and pushes the page |
| caret | `arrow_drop_down` | *a menu opens over the page* — the products dropdown, the language switcher. A floating list you choose from |

Every system that ships both distinguishes them this way: Material's own
semantics, Bootstrap's native `.dropdown-toggle::after` triangle, GitHub Primer.
Apple and Fluent use a chevron for both, so it is not universal — but we are
built on Bootstrap and drawing with Material, and agreeing with both of those
beats a tidier rule that agrees with neither.

**Both are masks, not pictures**, and that part of the earlier pass was right.
Neither file carries a `fill`; both are consumed through `mask` + `currentColor`
(`@mixin mask-icon`). A fill baked into an SVG cannot follow the control it
belongs to, which is why there used to be a second copy of the caret in a paler
grey and a media query to choose between them — and why, in `forced-colors`,
both were thrown away and the mark simply vanished. Neither baked grey
(`#676767`, `#ececec`) was a rung of the ink ramp.

**`currentColor` only works if `currentColor` is stated.** Deleting the pale
copy exposed a bug: the language switcher sits in `.navbar-actions`, not in
`.navbar-nav`, so nothing ever gave it `--bs-nav-link-color` — its `color` was
invalid at computed-value time and fell back to inherited body ink, i.e. dark
ink on a dark photograph at the top of the page. The bar's two states now name
their own colour (`_base.scss`), which is also what gave the white bar a hover
state at last.

The caret **shows in both bar states, including the transparent one**, and that
was asked about directly. It is not decoration: it is the only thing on the
language switcher saying the flag is a control rather than a picture of a flag,
and the moment it is most needed is the first screen, before anyone has
scrolled. A control that only announces itself after you scroll is a control you
have to discover twice.

### 9.4 Rules

Regenerate the whole set — never hand-download one icon — so the setting cannot
drift again. **Icons live in three places and the sweep must reach all three:**
`_includes/icon-*.html`, `img/svg/ui_icons/*.svg`, and inline in JavaScript —
the picture viewer's close button was missed in the first sweep because it is
built in `kt-lightbox.js`, and stayed a hand-drawn stroked X for a pass.

The reading hub has **no icons in its content**: it is a reading room, and its
chrome is words. Its one icon is that close button, which belongs to a viewer,
not to a page.

---

## 10. Before you add anything

1. Is the value a rung of the ladder? (§1)
2. Does the corner use `corner()` with one of the five radii, and is it plain?
   (§2)
3. Is every control ≥ 44px? (§3)
4. Is the transition one of `--t-1/2/3` on `--ease`? (§4)
5. Does focus come from the shared ring, with **both** tones — and does the ring
   have exactly one shape? (§5)
6. Can everything a reader might quote still be selected? (§5.1)
7. Did you name a **role**, or did you write a hex? (§6)
8. Did you measure the contrast, or assume it — including *while selected*?
   (§6.1, §5.1)
9. Is anything a reader must read or tap below 14px? (§7)
10. Does it serve this page's purpose, or only look like it does? (§8)
11. Is the icon Material Symbols at the one setting, regenerated not
    hand-picked — and does it name the thing beside it, or a mood? (§9, §9.1)
12. Does the glyph ride an **action**? A label already labels itself. (§9.2)
13. If you broke a rule, is the reason written next to the code?

Rule 14: **a green build is not evidence.** The `@font-feature-values` bug, the
`corner-shape` gate and the purged `:focus-visible` all exist because a
stylesheet can lose its whole point and still compile, minify, verify and
render. The focus one is the sharpest: it failed *only in production*, and the
thing it removed was the accessibility feature. If a thing matters and can fail
silently, it gets a gate in `verify.mjs` — and the gate gets proved by breaking
the build on purpose.

Rule 15: **a decision written down is not the same as a decision that is right.**
Three things in this document were argued for at length and then reversed one
pass later: the superellipse corner (§2.1), merging the chevron and the caret
(§9.3), and hiding the section anchors from the wrong breakpoint (§8.1). Each
had a tidy rule behind it. Prose is not evidence either — go and look at what
ships.
