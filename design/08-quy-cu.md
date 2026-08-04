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

### 2.1 The corner is a superellipse again — n = 3.0224 (2026-08-04)

**History first, because the same section has now said three things.** From the
start the corner was `corner-shape: superellipse(2)` — exponent n = 4 — with the
radius grown ×1.8409 to hold the 45° depth. On 2026-07-28 the owner switched it
off: *"hơi unconventional."* On 2026-08-04 the owner asked for it back, ported
from the **Squircle browser extension** they had tuned in the meantime. The
corner that came back is not the corner that left.

**What the argument always was.** A circular `border-radius` joins the straight
edge with a curvature *jump* — 0 on the edge, 1/r the instant the arc starts —
and the eye reads that discontinuity as *here the corner begins*. A superellipse
with n > 2 meets the edge with zero curvature, so the bend fades in and nothing
marks where it started. That is Absolute Neutrality applied to a corner.

**Which superellipse: n = 3.0223665663, and it is derived.** Not n = 4 ("the
squircle", what shipped before), not Piet Hein's 5/2, not a fit to Apple. It is
the exponent minimising the *variation* of curvature around the corner —
Moreton & Séquin's fairness functional `E = ∫(dκ/ds)² ds`, the standard measure
of a fair curve in geometric design, evaluated at equal 45° depth so every
candidate is the same roundness. Expanding the corner near the join sorts every
exponent into a continuity class:

| | at the join with the straight edge |
| --- | --- |
| n = 2 | curvature **jumps** 0 → 1/S — the corner visibly "starts" |
| 2 < n < 3 | κ continuous, but **dκ/ds → ∞** |
| n = 3 | dκ/ds finite — the threshold |
| **n > 3** | **dκ/ds → 0** — G3, nothing marks the join |

So n = 4 was never wrong in kind. It was simply further past the threshold than
the fairest corner is, and cost 29% more room to draw. *The decimals are not
load-bearing:* n ± 0.1 costs 0.55% of E, and three independent criteria —
minimum bending energy 2.8747, minimum peak |dκ/ds| exactly 3, closest fit to
Apple's measured corner 2.9139 — land in the same neighbourhood. The honest
claim is "a little over 3"; the digits exist so the constant is reproducible.

**The three objections that switched it off, and what answers each one now.**

*"It was two silhouettes, not one."* This was correct, and it was **our bug, not
the property's**. The grown radius was written unconditionally and only
`corner-shape` sat inside the `@supports` — so a 12px button was a 22.09px
**circle** on iOS and a 22.09px superellipse in Chrome. The fallback rounded by
84% more than the design asked for. Now the growth lives *inside* the `@supports`
with the shape it exists to compensate for:

| | Chromium 139+ | Safari / Firefox |
| --- | --- | --- |
| declaration | `superellipse(1.5957)` | dropped whole |
| radius | r × 1.4292 | r |
| **45° depth** | **r·√2·(1 − 2^(−1/n))** | **the same number** |

Both engines now agree on *how round* the corner is and differ only in how the
bend is distributed across it. That is sub-perceptual, and nobody can compare it
anyway — nobody holds two phones up to look at a button.

*"It broke the accordion."* Also correct, and also an ordering bug. Two curves
separated by a border are parallel only when the inner radius is the outer minus
that border. Scaling **both** numbers gave 29.45 outside against 27.61 inside —
a 1.84px gap held apart by a 1px line. The subtraction has to happen *after* the
growth: `inner = (outer × s) − border`, never `(outer − border) × s`. That is
what `corner-inner()` does, and what the two `--bs-accordion-*` tokens in
`_base.scss` do for Bootstrap's own rules.

*"A corner that has to be explained is no longer neutral."* This one is not
answered, and should not be pretended away. It is the reason the section is
written as geometry a reader can check rather than taste a reader must accept,
and the reason nothing here is adjustable. The owner reversed the call; the
argument stands on the record.

**The headroom rule — the one thing a call site must respect.** The corner box
grows to 1.4292 × the authored radius, so an element rounded on all four corners
needs `min box side ≥ 2 × 1.4292 × r` on **both** axes, or the browser clamps
every radius proportionally and the corner comes out shallow and pill-ish:

| rung | px | depth-matched | needs a box of |
| --- | --- | --- | --- |
| `$r-1` | 4 | 5.7166 | 11.44px |
| `$r-2` | 8 | 11.4333 | 22.87px |
| `$r-3` | 12 | 17.1499 | 34.30px |
| `$r-4` | 16 | 22.8665 | 45.74px |
| `$r-5` | 24 | 34.2998 | 68.60px |

(An element rounded on only *two* corners — the accordion's first and last items
— is constrained by one radius per side, not two, so the vertical requirement
halves. That is why a 48px accordion header clears a 22.87px corner.)

The extension solves this by fitting a gentler exponent per element from a
`ResizeObserver`. **We do not need to, because at authoring time we know every
box.** All 19 shaped selectors were audited on 2026-08-04 and every one clears
its rung. Audit yours before adding one.

`verify.mjs` gates four things, because there are four ways to lose this
silently: the shape being minified away, the `@supports` gate disappearing (the
iOS bug), the depth match being dropped, and the old ×1.8409 geometry coming
back from a copied snippet.

### 2.2 Why the script is gone (and stays gone)

`js/squircle.js` (deleted 2026-07-28) did the corner at runtime: it swept the
whole document with `getComputedStyle`, held a `MutationObserver` on
`documentElement`, a `ResizeObserver` on constrained elements, and wrote inline
`!important` styles over the stylesheet. 16 KB, on every page, on phones, to
produce values that were knowable at authoring time.

**Four out of five of our readers are on a phone.** A design detail that costs
them scroll frames is not neutral, whatever it looks like. Measured: **−1.4 KB
gz** from the main bundle and **−1.7 KB gz** from every hub page.

**The superellipse coming back on 2026-08-04 does not bring the script with it,
and this is the distinction that matters.** A runtime engine exists to answer a
question the author cannot: *what size is this element right now.* The extension
it was ported from genuinely needs that — it runs on the open web, against pages
it has never seen. A stylesheet we wrote does not have that problem. Every box
on this site is known at build time, so the entire cost of the corner here is
one extra `@supports` rule per call site and **zero bytes of JavaScript**.

If a future corner ever seems to need measuring at runtime, that is the signal
the corner is wrong for the element, not that the page needs an observer.

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
@include focus-ring;   // box-shadow: 0 0 0 2px var(--focus-halo)   ← the halo
                       // outline: 3px solid var(--focus)           ← the ring
                       // outline-offset: 2px
```

**The halo is painted and the ring is an outline, and the split is the point.**
Both were box-shadows until 2026-08-04, when the owner caught what that costs:
*"khoảng 1px viền `--focus` bị loang vào bên trong của `--focus-halo`, đặc biệt
là ở phần corner."* Reproduced in isolation — a 4px-radius control with a
transparent background, focused, sampled along the 45° ray through its corner:

```text
page #ffffff ×90 │ ring #0066cc ×34 │ halo #ffffff ×22 │ #deebf8 ×1 │ page
                                                        ^^^^^^^^^^
```

That stray pixel is a **13% tint of the ring colour, inside the halo**, sitting
on the element's own border-box curve. An outer `box-shadow` is clipped to the
border box, so *both* shadows are clipped by the same antialiased curve: the
ring's clipped edge paints first, the halo's clipped edge composites over it,
neither reaches full coverage, and the ring shows through the seam. Drawing the
halo two or three times cleans up the circular case and **does not** fix the
superellipse one.

An `outline` is not clipped to the border box. `outline-offset` starts it where
the halo ends, so the only boundary left at the border box is halo-against-
control, which is a boundary that is supposed to be there:

```text
page #ffffff ×90 │ #0b6dce ×1 │ ring #0066cc ×33 │ #ffffff ×228
```

One antialiasing pixel, on the outside, where any two adjacent shapes must have
one. **This does not reopen reason 1 below.** That argument was never "box-shadow
is magic" — it was "whoever writes the property last at equal specificity wins",
and we now write `outline` ourselves, from a selector list that names every
framework component, placed after the framework. It is the same reason
`outline: none` worked when it replaced Chrome's UA ring.

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

   **"Stop contesting `outline`" was then read as "never write `outline`", and
   that was a bug that shipped.** A property you decline does not sit empty —
   the UA stylesheet fills it. Chrome ships
   `:focus-visible { outline: auto 1px -webkit-focus-ring-color }`, so every
   control the framework did not happen to zero drew **Chrome's near-black ring
   on top of ours**. Measured in the browser on 2026-08-04, by focusing every
   focusable element and reading the computed style back:

   | control | what actually rendered |
   |---|---|
   | `.nav-link`, `.accordion-button` | our ring alone (Bootstrap had zeroed it) |
   | everything else | **ours + Chrome's** — two rings, two colours, two radii |

   "Everything else" was the skip link, the brand lockup, the call pill, both
   CTA buttons, every menu row, every footer link, and every card, tag and title
   on the hub. On the **menu row** it was more than cosmetic: that row's ring
   turns inward precisely so nothing spills past the menu's corner, and Chrome's
   outline spilled past it anyway, because it was never ours to begin with.

   The mixin now states `outline: none` itself. That is not a return to
   contesting the property — it is taken **once**, in the same declaration as
   the ring, at the same specificity, and handed straight back inside
   `forced-colors`. One ring is drawn and we are the ones drawing it.
2. **It rendered wrong.** Observed, back when the ring was an `outline` and the
   corner was a superellipse: the ring drew as a shape that did not match the
   button it surrounded, and fragments survived after focus moved on. **Per spec
   this should not happen** — MDN lists `outline` among the properties that
   follow `corner-shape`, alongside `background`, `border` and `box-shadow` — so
   it was a young implementation rather than a property-level gap.

   This entry used to end "the squircle has since been switched off, which
   removes the cause." **As of 2026-08-04 that is no longer true** — the
   superellipse is back (§2). What changed instead is the other half: a
   box-shadow is painted with the element's own border-box decoration rather
   than in a separate outline pass, so it composites and repaints with the
   element and cannot strand a fragment. The shape mismatch cannot recur either,
   because a box-shadow copies the silhouette it surrounds and that silhouette
   now *is* the superellipse. That is fixed-by-construction rather than
   fixed-by-avoidance — but it is worth a keyboard pass on Chromium 139+ after
   any change here, and reason 1 is decisive on its own regardless.

Reason 1 alone would justify the change. Reason 2 is why it looked *broken*
rather than merely inconsistent.

### The ring has a shape of its own

```scss
:where(:focus-visible) { @include corner($r-1); }   // radius AND shape
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

**It brings the rung whole — the radius *and* the corner** (owner, 2026-08-04:
*"tất cả focus ring đều là squircle hết rồi phải không? mọi thứ phải khít với
nhau hoàn hảo"*). So a text link's ring is cut by the same superellipse as the
button beside it, and the site has one corner geometry rather than two.

That carries a hazard worth naming, because it is subtle: **the cascade resolves
per declaration, not per rule.** An element that states `border-radius` in a
class rule but takes its `corner-shape` from nowhere keeps its own radius and
picks up *our* superellipse — and at equal radius a superellipse sits ~30%
shallower than a circle (§2), so such a corner would visibly change shape on
focus and change back on blur. A corner that moves when you tab to it is worse
than the inconsistency it was meant to fix.

It is safe here because it was **checked, not assumed**: every focusable element
on both products was focused in Chrome and its computed corner read back before
and after — 440 elements, 9 pages, both colour schemes, **zero** elements with a
shape of their own changed. Every radius on this site is written with `corner()`,
which states both properties together, so a class rule always brings its own
shape and always wins. The one exception was the **menu row**, carrying a bare
7px from `.dropdown-menu > li:first-child .dropdown-item` (0,3,1) that
`overflow: hidden` had been clipping away invisibly for months; it is now zeroed
at `$dropdown-inner-border-radius` in `main.scss` §8, where the framework
listens.

> Add a component that sets `border-radius` without `corner()` and it *will*
> change shape on focus. Re-run the corner check before shipping it.

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

### Focus draws the ring. Press changes the fill. Hover is for pointers

**One signal per state**, and the ring is the only one focus gets.

A **hover** state answers *"your pointer is on this"*. A **focus** state answers
*"the keyboard is here"* — and the ring already says that, identically, on every
control, which is the whole reason the ring exists. Firing hover styling on
`:focus-visible` as well hands a keyboard reader a second signal that is
different on every component, and the site had it in five places:

| what fired on focus | why it was wrong |
|---|---|
| `.btn-primary`, `.btn-secondary`, `.btn-ghost` — the pressed fill | arriving by keyboard made the button look *held down*, in three different colours |
| `.kt-feed-link` / `.kt-readnext-link` — the 2% thumbnail lean-in | the picture scaled inside a ring that did not move, so the ring visibly detached from what it was marking — motion nobody asked for, at the moment the reader is working out where they are |
| `.kt-series-card` — `border-color: var(--indigo)` | the ring is *also* indigo, so a focused card wore indigo border + paper halo + indigo ring: three concentric bands reading as one smeared edge |

All five now belong to `:hover` (and `:active`) alone. The platform works this
way too — no browser applies hover styling on keyboard focus, which is precisely
why `:focus-visible` was specified in the first place.

The exception to keep in mind: if hover reveals **information** a keyboard reader
would otherwise miss, that is not decoration and it should fire on focus as well.
Nothing on this site currently does — the feed title's underline is already
hover-only and the ring carries the rest.

### Three things that will bite

- **`forced-colors` throws box-shadow away.** The mixin carries a
  `@media (forced-colors: active)` branch that redraws the ring as
  `outline: 3px solid Highlight`. Without it the ring vanishes for exactly the
  readers least able to lose it. It sits *after* the `outline: none` above and
  at the same specificity, so it wins on source order.
- **A control that draws its own edge with `box-shadow` will erase the ring.**
  This is the whole cost of choosing the property, and it is the one thing a new
  component has to remember. `.kt .kt-button-quiet` scores 0,2,0 — the same as
  `.kt :focus-visible` — and is written 1150 lines later, so its own
  `inset 0 0 0 1px var(--line)` border won on source order and the button
  shipped with **no focus indicator at all** (found 2026-08-04; it was the
  author page's "Xem tất cả bài viết" and the share block's copy button, both
  invisible to a keyboard — a WCAG 2.2 SC 2.4.7 failure). `focus-ring($under:)`
  is built for exactly this: the border stays underneath, so the control keeps
  its edge while focused instead of the ring replacing it. One line per control.
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

**Selecting is not highlighting** (owner, 2026-07-28). The hub briefly gave
selection the literal ink of a Stabilo Boss, `#fff200`. That spends the page's
loudest yellow on its shortest-lived state and leaves nothing for a real
highlight to be. They are designed as a pair now: selection quiet, the mark
loud, and `mark::selection` deepens rather than replaces so a marked run stays
visible while it is being dragged over.

### One dye, two concentrations (2026-07-28)

The second pass of that pair replaced the picked values with a **recipe**, after
the owner asked for the hub's highlight to lean toward Alpha's orange. The rule
is two percentages:

> **A selection is `$dye-500` at 24%. A mark is `$dye-300` at 58%.**
> Composited on whatever paper the product uses.

| | background | text | measured |
|---|---|---|---|
| main site, selection | `#f8d5c3` = dye @ 24% on white | `$fg` | 12.70:1 |
| main site, `<mark>` | `#ffbe7b` = dye-300 @ 58% on white | `$fg` | 10.71:1 |
| hub, selection | `#f4d0b9` = dye @ 24% on paper | `--ink` | 10.80:1 |
| hub, `<mark>` | `#fdbb76` = dye-300 @ 58% on paper | `--ink` | 9.30:1 |
| hub, selection over a mark | `#f8a862` | `--ink` | 7.98:1 |
| forced-colors | `Highlight` | `HighlightText` | the system's |

`#f8d5c3` was *already* exactly dye @ 24% on white — it is what the original
translucent wash composited to — so the main page has never looked different;
the recipe was there before it was written down.

**Why this is the brand answer and a swatch is not.** These two products share
no colour, no typeface and no voice, and they must not. What they can share is a
*reflex*: drag across text on either one and the paper warms with the same dye
at the same strength. A value copied between them would be a coincidence
maintained by hand. A recipe is a rule, and it extends to any surface either
product grows later.

It is also the trade's own metaphor, which is not decoration: one dye at two
concentrations is what a lab-dip *is*.

**On the hue.** The hub's yellow pair sat at h 97–103°, which is the paper's own
hue — the highlight was the page becoming more of what it already was. Alpha's
dye is h 50°. The new pair lands at h 60° and h 70°: leaning, which is what was
asked, and not arriving, because a mark at the dye's own hue and that lightness
is a peach rather than a pen.

**On measuring "can you tell these apart".** ΔE between the new pair is 29.3;
the yellow pair it replaces measured 29.1. Nothing was given up to move the hue.
Note that a **WCAG contrast ratio is the wrong instrument for this question** —
these differ mostly in chroma, which luminance cannot see. Scored as a ratio,
the accepted yellow pair was 1.13:1. Use ΔE for "different colour", contrast for
"legible on".

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
`_includes/benefits.html`. Its colour has now moved four times:

| | | |
|---|---|---|
| `#c3e5f1` | 1.33:1 | a saturated pale cyan belonging to no ramp |
| `$ink-50` `#e9eff3` | 1.16:1 | the page's own cool neutral — quieter, and the version the owner read as *"hơi xám xám, giống như bầu trời u ám chuẩn bị mưa"* |
| the warm shell `#fceae1` | 1.17:1 | Alpha's orange at 12% — rejected the same day it shipped, along with the whole warm-surface direction (§6.3) |
| `$blue-50` `#e4f2f9` | 1.15:1 | **the logo's palest blue (`#8dc8e8`) at 24%** — L\* 94.6, C\* 6.2, h 239° |

Every move held the band's weight steady (all four sit at L\* 89–95, the last
three within one L\* of each other); what moved was hue. The final value answers
the overcast complaint by the numbers: the grey the owner read as rain had
chroma 2.9, and `$blue-50` has 6.2 at the same lightness — twice the colour,
unambiguously sky, still nowhere near a "coloured box".

**Why blue.** The owner's own brand sentence: orange is innovation, blue is
*"neutrality, professionalism, precision, và trust"* — and a benefits band is
the page asking to be trusted. The owner chose this direction explicitly
(keep the blue number, make the band blue) after testing the alternative — the
dye number on a tinted band — and finding it overstimulating. The band is
therefore **monochrome cool on purpose**: blue number (`$blue-700`, 7.39:1),
blue icons, no dye anywhere on it. One calm hue.

**Why derived.** `$blue-50` is `$blue-100` composited on the page at 24% —
the same compositing rule that generates `$selection-bg` and the hub's
highlights. The tint cannot drift off-brand: it is the logo's own blue, dilute.
(A 12% rung, `$blue-25`, briefly carried the review cards; the owner moved
those to neutral grey the same day — see §9.5 — leaving this band as the one
blue surface on the site.)

**Why not deeper.** 24% is the strength where `$fg-subtle` still clears AA
(4.61:1) and `$link` sits at 4.86:1; at 28% the caption tier drops under 4.5.
A floor, not a preference.

### 6.3 The warm-shell experiment, run and rejected — the page is cool, the dye is a spark (2026-07-28)

This section used to argue the opposite of what it now records, and the history
is worth more than the tidiness of deleting it.

**The experiment.** The product's brand guide splits Alpha's neutrals by role —
*"greige ấm = trung tính của VỎ · xám lạnh = trung tính của LÕI dữ liệu"* — and
after the owner asked for the brand in *"từng viên gạch"*, that rule was
transplanted here whole: a four-rung warm ramp (`$dye-500` dilute at 4–20%)
carried the bar, the menus, the footer strip, the tinted band and the quote
grounds.

**The verdict, hours later:** *"Thật sự tệ. Tại sao bạn có thể nhìn vào cái
abomination này và nói nó 'neutral' hay 'thân thiện'."* The bar must be white.
The greys must lean blue, like the product's own cool neutrals. The band must
go blue. Warm surfaces are out.

**Why the rule did not transfer.** In the app the greige is honest to its own
sentence: the shell is a thin frame around a dense, cool data core, so warm
stays a whisper at the edges. This page is 90% white paper — tint its chrome
and bands warm and the warmth stops being a frame and becomes the page. Same
rule, different geometry, opposite result. The measured warning was already
there: the "whisper" covered the single most-seen surface on the site.

**The standing rule now:**

> The page is white and cool. Blue — the owner's stated colour of neutrality,
> professionalism, precision and trust — is the temperature of every neutral
> surface. **Warmth is the dye and only the dye**: section markers, CTAs,
> selection and marks, the quotation marks. The brand's "tỉ lệ nhất định" is a
> calm blue field with orange sparks, exactly like the logo.

| surface | temperature |
|---|---|
| the page, and the bar over it | white |
| menus, wells, the footer strip, code, the quote grounds | cool grey (the ink ramp) |
| the Lợi ích band — the page asking for trust in Alpha's name | pale logo blue (`$blue-50`) |
| selection, `<mark>`, markers, CTAs, quote marks | dye — sparks, never a plane |

(The review cards spent a few hours on pale blue before the owner moved them
to the grey row: *"nền và viền tông màu neutral như gray- thì trông nó sẽ
trustworthy và khách quan hơn"* — a witness's ground should be colourless. §9.5.)

What survives from the transplant: the *derivation* habit (every tint is a logo
colour composited on the page — §5.1's recipe, `$blue-50`), the three-surface
bar fix, the focus-ring repair, the em-dash gate, and the ink ramp being the
product's own greys (`$fg` = the product ink `#0E1B27`, `$fg-muted` = its
`#46586A` exactly). What does not survive is any warm neutral. The build now
gates this in **both directions**: every tinted surface must lean blue, and the
opaque bar must be white (verify.mjs).

### 6.4 Which blues, and the one that could not change

Measured in CIELCh, every blue in the logo file sits at hue **275–284°**. So
does every rung of the site's blue ramp. Alpha's blue is one hue; what changes
down the ramp is lightness.

Two rungs were not from the mark and have been replaced with stops that are:

| was | now | where |
|---|---|---|
| `#c3e5f1` | `#8dc8e8` | `$blue-100` — the pale globe edge |
| `#004080` | `#003865` | `$blue-800` — the deepest globe stop, and the product's own `AlphaIconBrush` |

**`$link` stays `#0066cc`, and this is the interesting one.** The obvious move
was to make the site's most-repeated colour the wordmark's own `#004c97`. It
fails. Links here are not underlined at rest, so WCAG technique **G183** asks
for 3:1 between the link and the body text around it:

| | on white | vs `$fg` (G183) |
|---|---|---|
| `#0066cc` | 5.57 ✓ | **3.13 ✓** |
| `#004c97` | 8.47 ✓ | 2.06 ✗ |
| `#003865` | 11.98 ✓ | 1.46 ✗ |

The window for an un-underlined link on this page is 4.5:1 minimum on white and
5.81:1 maximum, and only `#0066cc` is inside it. It is also h 284° against the
wordmark's 283° — the same colour, one lightness up. It was never invented; it
was undocumented.

`$icon` moved the other way, to `$blue-800`: a 48px glyph carries weight a line
of text cannot, and keeping icons a step off `$link` stops a feature icon
reading as something clickable.

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

#### The label is the destination's bare name

`toc_knowledge` is **"Chia sẻ kinh nghiệm"** (owner decision, 2026-07-28,
reversing a same-day "Blog " prefix). The prefix was argued from grammar — the
bare phrase is a verb phrase, and a verb phrase in a nav row can read as an
action — but the owner cut it: it made the bar's longest item longer still,
and the hub's own lockup is just *Chia sẻ kinh nghiệm*, so the bare name is
what satisfies the wayfinding contract (you clicked X, you arrived at X). The
lesson: when grammar and the destination's own name disagree, the name wins.

Also: `.navbar .nav-link` is `white-space: nowrap`. It replaced a
`text-overflow: ellipsis` that had never done anything (it needs
`overflow: hidden` and a non-wrapping line, and had neither) and would have been
the wrong answer anyway — "Các sản ph…" is exactly the partial information loss
design/00 §2.1 forbids.

#### The bar has THREE surfaces and one state class

This is the single most productive bug in the project so far: it has shipped
three separate visible faults, in three passes, and every one of them was the
same mistake.

| | surface | ink |
|---|---|---|
| ≥md, at the top of the hero | transparent over a photograph | white |
| ≥md, scrolled | the chrome surface | dark |
| **<md, always** | **the chrome surface** | **dark** |

There is one state class, `.nav-active`, and it answers *"has the reader
scrolled?"* — which happens to imply *"am I opaque?"* at ≥md and says nothing at
all below md, where the bar is opaque at every scroll position. Written as
`&:not(.nav-active) { .nav-link { color: white } }`, the third row silently
inherits the first row's ink while the media query underneath has already
swapped in the second row's background.

What it shipped:

1. The language switcher's caret came out **dark ink on the dark hero**, because
   the caret is `currentColor` and sits in `.navbar-actions`, outside
   `.navbar-nav`, so nothing ever gave it `--bs-nav-link-color`.
2. Fixed — and then the same caret came out **white on the white phone bar**,
   invisible at the top of the page. Reported by the owner twice.
3. And, found while fixing (2), `--focus`/`--focus-halo` had the identical
   shape: `.navbar:not(.nav-active)` handed its links a **white focus ring on a
   `#fdf1eb` bar** at 1.11:1, against the 3:1 SC 1.4.11 asks. A keyboard or
   switch user on a phone had **no visible focus at all** until they scrolled.
   Nobody reported that one, because the readers it fails are not the ones
   sending screenshots.

**The rule:** the bar's ink and its focus pair are properties of its **SURFACE**,
never of its state class. Both live in one of two mixins — `navbar-ink-on-dark`
and `navbar-ink-on-light` — and each surface includes exactly one. A fourth
surface can only be added by saying which of the two it is.

`verify.mjs` gates it against the built CSS: wherever the bar is opaque, its
link colour must equal the colour the *other* opaque state uses, and it must
redeclare `--focus-halo`. No hex is written into the gate, so it follows the
tokens.

**One accent, no exceptions.** `nav-link-active-blue` — a per-item override
giving the *Lợi ích* link a blue active colour — is deleted, and stays deleted
even though the band it pointed at is blue again (§6.2): the bar carries ONE
accent, and a per-item exception is how the last three navbar bugs got in.

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

(The bar's colour handling was still wrong after this — the caret then went
invisible on the opaque phone bar. The full account, and the rule that finally
settled it, is §8.1 *"The bar has THREE surfaces and one state class"*.)

---

## 9.5 Quotation — a quote has to look like one

The owner's report on the customer reviews: *"nó giống hệt như những paragraph
text khác mà Alpha viết."* Measured, it was. `--fs-quote` is `1rem`, the body
size: same family, same weight, same leading, same ink, same white ground as
every sentence Alpha writes. Two small orange quotation marks were the entire
difference between Alpha's voice and a customer's.

Typography has a settled order of strength for marking a quotation:

| | device | had it |
|---|---|---|
| 1 | an enclosing ground | ✗ |
| 2 | indentation from the measure | ✗ |
| 3 | a rule down the speaker's side | ✗ |
| 4 | quotation marks | ✓ |
| 5 | a size or style change | — |
| 6 | an attribution | ✓ |

The first fix gave the blockquote 1–4 and 6 (a warm ground and a dye rule on
the words alone) and the owner was still not satisfied — *"Tôi vẫn chưa hài
lòng với style của phần quote đâu."* The diagnosis worth recording: it styled
the WORDS while the thing that proves a review is real sat outside the styling.
Each review already ships with a photograph of the speaker, and that photograph
was floating above an unrelated tinted box. A portrait above a paragraph is a
picture and some text; a portrait **enclosed with** the words and the name is
testimony.

**So the device is now the card** — `.review-card`, the standard testimonial
pattern, one presentational wrapper in `reviews.html`: portrait, quotation,
attribution, original-language link, one bordered ground (`$surface-quote`),
`corner($r-4)`, `height: 100%` so the two cards in the row hold the same
depth. The deep-link glow rides the card now, ring-only — the old background
wash existed because a ring alone was too little on a bare white column.

**The ground is neutral grey, not blue** (owner, 2026-07-28, same day the blue
version shipped): *"nền và viền tông màu neutral như gray- thì trông nó sẽ
trustworthy và khách quan hơn."* The reasoning holds up: a review is somebody
else's words, and a brand-coloured ground reads as Alpha framing the witness.
Grey ground + grey hairline says "presented without decoration", which is what
objectivity looks like. `$surface-quote` = `$ink-25`; the Lợi ích band is now
the site's only blue surface.

`.prose blockquote` (an aside inside an article — no portrait, no attribution
to enclose) keeps the classic form instead: the same quote ground with a 3px
`$accent` rule down the speaker's side (3.63:1, over SC 1.4.11's 3:1).

**5 deliberately does not change.** design/07 §7.5 sets a review at reading size
with paragraph leading because it is a paragraph somebody wrote, not a pulled
quote to be admired. Enlarging it would turn a customer into a billboard. The
words are enclosed, not amplified. The quotation marks stay the card's one dye
spark, at `$accent-strong` (5.48:1 on the card, over SC 1.4.3's 4.5:1).

### The em dash nobody could find

Bootstrap draws `content: "\2014\00A0"` in front of every `.blockquote-footer`.
So an **em dash was printed before each customer's name, in both languages**, on
a site whose standing rule is that em dashes never reach a reader.

It survived the whole life of the project because the rule was enforced by
reading the copy, and this em dash is not in the copy — it is not in the `.yml`
files, not in the includes, not in the rendered HTML. A search of the built
pages for `—` returns zero. It is generated by the stylesheet.

Now a spaced en dash, and gated both ways in `verify.mjs`: the *last*
`.blockquote-footer::before` declaration must not carry `\2014`, and no built
page may contain a literal `—`. **The general lesson is the one worth keeping: a
content rule that is only enforced against content files cannot see generated
content.**

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
13. Is the surface white, cool grey, or the one pale-blue band? **A warm
    surface is not an option** — the owner rejected the whole warm-shell
    direction on sight, and the build gates it. Warmth is the dye, spent in
    sparks. (§6.3; the quote grounds are the grey row — owner decision.)
14. If it changes appearance with a state class, does that class actually know
    what the element is sitting **on**? (§8.1)
15. On the hub: does the change hold in BOTH colour schemes? A new colour goes
    into the token layer (both blocks), gets measured on both papers, and
    never ships as a per-component dark override
    (design/chia-se-kinh-nghiem/01 §3; the build gates the dark block).
16. If you broke a rule, is the reason written next to the code?

Rule 17: **a green build is not evidence.** The `@font-feature-values` bug, the
`corner-shape` gate and the purged `:focus-visible` all exist because a
stylesheet can lose its whole point and still compile, minify, verify and
render. The focus one is the sharpest: it failed *only in production*, and the
thing it removed was the accessibility feature. If a thing matters and can fail
silently, it gets a gate in `verify.mjs` — and the gate gets proved by breaking
the build on purpose.

Rule 17: **a decision written down is not the same as a decision that is right.**
Three things in this document were argued for at length and then reversed one
pass later: the superellipse corner (§2.1), merging the chevron and the caret
(§9.3), and hiding the section anchors from the wrong breakpoint (§8.1). Each
had a tidy rule behind it. Prose is not evidence either — go and look at what
ships.

Rule 18: **"transient" is a diagnosis you have not made yet.** The build failed
with `String can't be coerced into Integer` at random for months. It was written
off as the toolchain being flaky on Windows, then confidently — and wrongly —
blamed on a stale `.sass-cache/`. It was one unquoted map key, reproducible on
demand at 1 run in 60 (design/05). Anything that fails intermittently fails for
a reason, and a reason that only shows up 1 time in 60 is found by running it 60
times, not by reasoning about it.

Rule 19: **check the other half.** Every one of the bar's three shipped colour
bugs (§8.1) was a rule that named one surface correctly and left a second
surface reading a value meant for the first. When you fix a state-dependent
value, enumerate the states first and count them.
