# 09 — Compatibility Register (living doc)

**Why this file exists.** The site is built to be ahead of its time, and the way
you do that without punishing anyone is to use tomorrow's platform as an
*enhancement* over today's. That only works if two things are written down: what
each enhancement costs when it is missing, and what we would do the day the
platform grows the thing we actually wanted. Otherwise "it degrades gracefully"
is a claim nobody can check, and "we'll revisit when it ships" is a promise
nobody remembers.

So this is the register. Every forward-looking decision on the site appears in
exactly one of three tables:

| | | |
|---|---|---|
| **A** | **In force** | We use it. Some engines don't have it. Here is precisely what those readers get instead. |
| **B** | **Wanted, blocked** | We would use it. The platform, a dependency, or an owner decision says not yet. Here is the trigger to look again. |
| **C** | **Accepted limits** | Known, will not be fixed, and here is why — so it is not re-litigated blind every year. |

**The rule that makes this doc worth keeping:** nothing lands on the site that
degrades into something *broken*. It may degrade into something plainer, older,
or less exact. It may never degrade into something wrong. Every row in table A
is written to be checkable against that rule.

**How to check a row.** Support tables age badly and this file will age with
them. Two habits keep it honest:

1. **Measure, don't infer.** The site's typographic and geometric claims were
   settled by driving a real browser over the shipped bytes (Chrome DevTools
   Protocol from Node — see the pattern the optical-spacing work used). A claim
   in this file with a number in it was measured; a claim without one is a
   reading of the spec and is weaker.
2. **Reproduce the fallback, don't imagine it.** For a CSS feature, the cheapest
   honest test is to inject a rule turning the property off on the built page
   and re-measure. That is how "0.75px worst case" in A1 was established, and it
   is how any future row should be.

**Review cadence.** Read this file whenever (a) a browser you support ships a
new stable major, (b) `npm run build`'s `check` gate changes, or (c) anything in
table B's "trigger" column plausibly happened. A pass takes about an hour. Date
each pass at the bottom.

---

## A. Progressive enhancement in force

Ordered by what it would cost a reader if it silently stopped working.

### A1 · `text-box-trim` / `text-box-edge` — optical heading spacing

- **Where:** `css/main.scss` §4 (constants, the derivation, the Vietnamese
  constraint) · `_sass/_base.scss` (the `@supports` block and the `--tb-comp`
  arithmetic). Main site only.
- **Without it:** identical layout, reached by arithmetic instead. `--tb-comp`
  carries the half-leading and the margin is pre-shortened by it. **Measured
  worst disagreement between the two paths: 0.75px**, across four breakpoints
  and every heading on the page.
- **Why the residue is not tuned away:** it is Blink's internal font-metric
  rounding (LayoutUnit, 1/64px), which matches neither the exact model nor a
  round-to-integer one. The fallback path only ever executes on engines that are
  *not* the one that produced the residue, so tuning the constant to close it
  would be fitting to the wrong browser.
- **The constant is font-specific.** `$tb-k` is a fact about Inter 4.1 exactly as
  shipped in `/fonts/inter/`, and it collapses to one number only because that
  font's `ascent − capHeight` (494/2048) equals its `descent` *exactly*, and
  because `hhea`, `OS/2 typo`, `OS/2 win` and `USE_TYPO_METRICS` all agree so
  every engine computes the same content area. **Re-measure before reusing it
  anywhere, including on a future Inter release.** A font update is a trigger to
  re-run the measurement, not a routine bump.
- **Not applied to the reading hub**, which sets body copy in Literata with
  different metrics and a `margin-bottom`-based rhythm. Separate decision,
  separate constant if it is ever taken.
- **Gated by:** `verify.mjs` — the `@supports` block must survive PurgeCSS into
  `docs/`, `text-box-edge: cap alphabetic` must be present, ≥6 distinct `--tb`
  values must exist, and **no heading selector anywhere may set a non-zero top
  margin without going through `var(--tb-comp)`.** That last invariant is the
  one that matters; `.prose` broke it once and forked the two paths by ~5px.
- **Live risk to watch — the Vietnamese one.** Trimming to `cap` deliberately
  leaves stacked capital diacritics (Ế Ổ Ằ Ẫ, up to 1.105em, i.e. 0.3775em above
  the cap line) overhanging into the gap above. Correct typography, and the
  1.25em gap absorbs it with ~0.87em to spare. **It stops being free on a `.mt-0`
  heading**, which states a zero gap and now gets one. Today every `.mt-0`
  heading follows a *container*, not a line of text, and the tightest measured
  clearance on the built page is 18.8px. Put one directly after a paragraph and
  the mark reaches into that paragraph's last line. Note the asymmetry: this can
  only ever happen on the *supported* path, because the fallback path leaves the
  half-leading in place and therefore has more room, not less.
  **Escape hatch:** `text-box-edge: text alphabetic` — measured in Chrome 151 on
  2026-08-09, this trims to the ascender instead of the cap line and clears the
  stack. (An older comment in `main.scss` read "if that ever ships"; it has
  shipped. Corrected 2026-08-09.)

### A2 · `corner-shape: superellipse()` — the n = 3.0224 corner

- **Where:** `_sass/_quy-cu.scss` §2 · `_sass/_base.scss` (accordion). Both
  products.
- **Without it:** an ordinary `border-radius` at the un-scaled radius. Plainer,
  never wrong.
- **The trap, already sprung once:** the depth match (`r × 1.4292`) must live
  *inside* the same `@supports` as the shape it compensates for. A superellipse
  at a given radius reads about a third less round than a circular arc at that
  radius, so the radius is scaled up to match — and if that scaling escapes the
  `@supports`, every non-supporting browser gets an over-round corner. Keep the
  radius and the shape in one block.
- **Gated by:** `verify.mjs`, three separate assertions — the shape survived
  minification, the depth match is present, and the superseded ×1.8409 geometry
  has not come back from an old commit or a copied snippet.
- **Re-check trigger:** any engine shipping `corner-shape`. As of 2026-08-09 this
  is Chromium-only, so most of the world is seeing the `border-radius` path and
  that is the intended baseline, not a degradation to fix.

### A3 · `:has()` — used unguarded, on purpose

- **Where:** `_sass/_base.scss` lines ~685, ~730, ~736, ~772, ~1172, ~2410 ·
  and since 2026-08-09, four rules in `_sass/chia-se-kinh-nghiem/_theme.scss`
  that carry the hub's quiz.
- **Without it:** the accordion's title/subtitle block degrades to an inline
  subtitle; the partner-logo hover pairing and one row-level layout hook go
  inert. All three are *quieter*, not broken.
- **The hub's quiz is the first use where `:has()` carries meaning, so it is
  written backwards.** `.kt-opt:has(input) .kt-fb{display:none}` is the feature
  test *and* the hide: true wherever `:has()` resolves, false everywhere else.
  So an engine without it shows every answer beside its option — a plain
  question-and-answer block, which is plainer but not broken. Written the
  obvious way round (hidden by default, revealed on `:checked`) those readers
  would get four dead options and no answers, which would have been the first
  row in this table to break its own rule. Same shape for the opening block's
  promise line. Reasoning: `design/chia-se-kinh-nghiem/06` §6.2.
- **Gated, because of the PurgeCSS hazard below.** `verify.mjs` asserts all four
  selectors survive into the built hub CSS. Losing the hide makes the quiz
  pointless and losing the reveal makes it unanswerable; neither looks broken.
- **Deliberately not `@supports`-guarded.** Wrapping them would double the rule
  count for a degradation nobody would report. Exposure as of 2026-08-09 is
  Firefox < 121 (pre-Dec 2023) and Safari < 15.4.
- **The build-tool hazard is the real one here, not the browser.** PurgeCSS
  silently drops a rule whose selector *ends in* `:not(:has(...))` while keeping
  `.mt-*` variants of the identical selector. That failure is invisible: the page
  still renders correctly, the feature is simply gone. It cost one full debugging
  pass on A1. **Do not write `:not(:has(...))` at the end of a selector.**
  Restructure so the exclusion is expressed positively.

### A4 · `@font-feature-values` + `font-variant-alternates: styleset()`

- **Where:** `_sass/_fonts.scss` (Inter, main site) · `_sass/chia-se-kinh-nghiem/_fonts.scss`
  (Inter, hub chrome).
- **Without it:** Inter's default glyphs — wedge commas, closed digits. Invisible
  to almost everyone, which is exactly the problem.
- **The hazard is the minifier, not the browser.** clean-css cannot parse
  `@font-feature-values` and mangles it into something that still *looks* present
  in the output but binds nothing. No console error, no layout shift.
- **Gated by:** `verify.mjs` asserts the *shape* of the block, not a substring.
- **Per-family, never shared.** `@font-feature-values` is keyed by family name.
  The hub sets body copy in Literata and chrome in Inter, so a single inherited
  `font-variant-alternates` would name features that only one of them has. OpenType
  feature tags are a per-font fact; do not copy a tag list between families.

### A5 · `font-optical-sizing: auto`

- **Where:** `body`, both products.
- **Without it:** one static cut of Inter at every size instead of the live
  `opsz` 14–32 axis. ~8% of total advance from the Text cut to the Display cut.
  Nobody will notice; it is still worth having.
- **Known platform limitation, recorded because it looks like a bug:** on
  Windows, selecting Inter *by family name* resolves to a pinned named instance
  with `opsz` dead. Only `@font-face { src: local(...) }` keeps the axis live.
  Not this site's problem — it self-hosts the woff2 — but it is why a reader's
  own `chrome://settings/fonts` can never give them optical sizing.
- **`font-variation-settings` outranks `font-optical-sizing`.** If a rule ever
  sets the former, the latter stops working silently. The hub's theme carries
  this note for the same reason.

### A6 · AVIF, `image-set()`, `<picture>`

- **Where:** hero background (`_sass/_base.scss`, explicit two-declaration
  fallback) · `_includes/meta-assets.html` (the preload, which **must** mirror
  the `image-set()` candidates exactly) · hub figures/thumbs via
  `<picture><source type="image/avif">`.
- **Without AVIF or `image-set()`:** the JPEG. The fallback is written as a
  preceding declaration of the same property, which is the mechanism that has
  worked since CSS 1 and will keep working.
- **The preload trap, already sprung once:** a bare `href` to the 1x file made
  a 2x display preload one image and then paint another — one wasted download,
  and the LCP image arriving late. `imagesrcset` must carry the same candidate
  list as the CSS. If you change one, change both.

### A7 · Viewport units, safe-area insets

- **Where:** `_sass/_base.scss` — `min-height: 100vh` followed by
  `min-height: 100svh`; `env(safe-area-inset-*)` on the navbar and hero;
  `@supports (padding: max(0px))` around the horizontal insets.
- **Without `svh`:** `100vh`, i.e. the old behaviour where mobile toolbars
  overlap. **`svh` is deliberate and `dvh` would be wrong here** — `svh` is the
  height with toolbars fully shown, which reserves their space; `dvh` changes as
  they hide and would resize the hero mid-scroll.
- **Without `env()`:** the insets resolve to 0, which is correct on any device
  that has no notch.

### A8 · Speculation Rules (prerender)

- **Where:** `_includes/speculation-rules.html`, `eagerness: moderate`,
  exclusion-first (skips `#` anchors, query strings, downloads, `target`,
  `nofollow`, `external`).
- **Without it:** ordinary navigation. Zero cost.
- **Watch:** it is exclusion-first by design, so *any new link pattern that must
  not be prerendered* (anything with a side effect, anything metered) has to be
  added to the exclusion selector. There is nothing on the site today that
  qualifies. Re-read this rule the day a form, a cart, or a tracked outbound link
  ships.

### A9 · `mask` for icon chevrons

- **Where:** the `mask-icon()` mixin, `_sass/_base.scss`.
- **Without it:** this one **does** fail visibly — the mixin sets
  `background-color: currentColor` and `background-image: none`, so an engine
  with neither `mask` nor `-webkit-mask` paints a solid filled box where a
  chevron should be.
- **Why it is still fine:** both the unprefixed and the `-webkit-` forms are
  written, and between them the coverage goes back roughly a decade. Recorded
  here anyway because it is the only enhancement on the site whose failure mode
  is *ugly* rather than *plain*, and that fact should not have to be rediscovered.
- **Why masks and not coloured SVGs:** a mask has no colour of its own, so it is
  correct on the white bar, over the hero photograph, in a state nobody has
  invented yet, and — the case the old baked-fill icons actually failed —
  in `forced-colors`, where a baked fill is discarded and the mark vanished.

### A10 · Accessibility media queries

- **Where:** `forced-colors`, `prefers-contrast`, `prefers-reduced-transparency`
  blocks at the **end** of `_sass/_base.scss`; `prefers-reduced-motion` in both
  stylesheets and honoured in JS (`js/custom.js`, `js/kt-topbar.js`).
- **Structural rule, and it is load-bearing:** media queries add no specificity,
  so those three blocks **must stay last in the file**. They were being clobbered
  by later component rules once already. Anything appended after them silently
  disables high-contrast support. Button rules inside them must keep their
  `:is(a, button)` specificity for the same reason.
- **Untested in real AT.** The blocks are correct by construction and have not
  been through Windows Contrast Themes or macOS Increase Contrast on real
  hardware. That is an open verification task, not a known defect.

### A11 · MathML Core, and where the engines disagree

- **Where:** `optimize-math.mjs` rewrites KaTeX's MathML at build time.
- **Two real divergences found and fixed (2026-08-08):** WebKit refuses to paint
  the contents of the zero-height box mhchem's `\smash` produces (which levels
  every subscript in a formula to one depth); and a leading charge arrives inside
  `<mpadded lspace="-1width">`, a pseudo-unit **MathML Core removed** — Blink drew
  the `+` on top of the `H`, WebKit dropped it entirely. The build now strips the
  zero-width boxes and phantoms and emits the tightest script element that says
  what is meant.
- **The standing risk:** these are two instances of one class. mhchem emits
  scaffolding aimed at a MathML that no longer exists, and a new construct in a
  new article can hit a third. **Any new chemistry notation should be looked at
  in both Blink and WebKit before it ships.** The rewrites are deliberately
  narrow — they only touch boxes declared *zero* wide or high — so they will not
  silently eat real spacing.

### A12 · `::target-text` / `::search-text` — found text in Alpha's colour

- **Shipped 2026-08-09, both surfaces.** `css/main.scss` §2 + `_sass/_base.scss`
  (main site) · `_sass/chia-se-kinh-nghiem/_theme.scss` (hub, tokenised for both
  themes).
- **What it fixes:** a reader arriving from a Google featured snippet lands on a
  passage Chrome paints in **its own highlighter yellow** — a stranger's colour on
  the first screen a new reader ever sees. `::search-text` is the same problem
  for find-in-page, which readers of long technical articles use constantly.
- **Without it:** the browser's default highlight. Nothing breaks, nothing shifts;
  the page simply borrows someone else's colour for one run of words.
- **The design rule this encodes.** Selection and `mark` are voices *inside* the
  document (the reader's hand, the author's pen) and both are dye. These two are
  a machine *outside* the page pointing in, so they are blue — the site's own
  warm/cool semantic doing semantic work rather than decoration. One accent,
  three depths, loudest last: an ordinary match, an arrival, THE match.
- **Measured, not chosen.** Opaque pairs (background *and* colour) for the same
  reason `::selection` is one: a translucent wash has to be re-measured on every
  ground it can land on. Ink contrast — main site 11.09 / 7.45 / 5.65:1; hub
  light 11.79 / 9.40 / 6.87:1; hub dark 10.45 / 7.01 / 6.87:1. ΔE2000 between
  adjacent rungs 8.4–11.5, so three depths read as three.
- **The dark-theme exception, and it is the `mark`'s own argument:** after dark
  "louder" means lighter, and a light-enough blue stops holding light ink — the
  55% rung measured **4.33:1 and fails SC 1.4.3**. So the current match is pinned
  lit, ink and all, exactly like `mark`: the one lit object on a dark page.
- **Verified by paint, in Chrome 151** (2026-08-09), not by reading the source:
  navigate with a real `#:~:text=` fragment, screenshot, decode, and count pixels
  against a control at the *same scroll position with no fragment*. Our colour
  appears **+3244 / +4973 / +4872 pixels** (main / hub light / hub dark) and
  essentially zero without. Two traps cost a false ✓ on the first attempt and are
  worth knowing: **a text fragment only matches on word boundaries** (a phrase
  sliced mid-word silently never activates — check `scrollY`), and **headless
  Chrome reports `prefers-color-scheme: dark`**, so the hub must have its scheme
  emulated explicitly or the dark tokens get measured against light expectations.
- **THE HAZARD, demonstrated live rather than argued:** an unknown pseudo-element
  makes a selector invalid, and one invalid selector discards the **whole rule**.
  Injecting `.a::selection, .a::totally-not-a-pseudo {…}` alongside
  `.b::selection {…}` in Chrome 151, only `.b::selection` survived into CSSOM.
  So each pseudo gets its own rule; grouping these with `::selection` would let an
  engine without `::search-text` lose its selection colour too — a working feature
  deleted by an unsupported one. **`verify.mjs` fails the build if they are ever
  grouped.**
- **Support, measured the same day:** Chrome 151 parses `::target-text`,
  `::search-text` and `::search-text:current` into CSSOM (a bogus pseudo in the
  same sheet was dropped, so this is real recognition, not tolerance).
  `::target-text` was confirmed by paint. **`::search-text` was NOT confirmed by
  paint** — there is no CDP command for the find bar, so only its parsing is
  established. Re-check by opening find-in-page by hand.
- **Gated by:** `verify.mjs`, four assertions on both stylesheets — each pseudo
  must carry a rule with Alpha's *own* colour (a forced-colors twin does not
  count, and an earlier draft of the gate was fooled by exactly that), none may be
  grouped with `::selection`, and none may set a background without a colour.
  `optimize-css.mjs` safelists them against PurgeCSS.
- **`forced-colors`:** all three revert to system pairs (`Highlight`/`Mark`), on
  both surfaces. In that mode the system keyword *is* the distinction.

### A13 · Smaller enhancements, no drama

| Feature | Without it | Note |
|---|---|---|
| `text-wrap: pretty` | ordinary last-line rag | Blink only re-scores a limited number of lines |
| `font-synthesis: none` | engine may fake a bold/oblique | prevents a synthetic weight that is not Inter |
| `scroll-margin-top` | anchors land under the fixed bar | stated once in CSS so JS and CSS agree |
| `aspect-ratio` | boxes size from content | used for logo and card slots |
| `color-scheme` / `theme-color` | UA default widgets and chrome | already set on **both** surfaces; do not re-propose |
| `prefers-color-scheme` (hub dark) | the light theme | gated in `verify.mjs`: the dark block must exist, must re-set `--paper` and `--ink`, and the dark paper must actually be dark |
| `text-size-adjust: 100%` | iOS/Android may inflate body text | prefixed and unprefixed both written |
| `print-color-adjust: exact` | printed backgrounds dropped | prefixed and unprefixed both written |
| `touch-action` / `user-select` (hub zoom stage) | browser gesture handling | the stage owns drag and pinch |

---

## B. Wanted, blocked, or not yet decided

Each row carries the **trigger** — the observable event that means "look at this
again". Without a trigger a row here is just a wish.

### B1 · `::target-text` — **SHIPPED 2026-08-09, see §A12**

Owner said do it. Moved to table A. Numbering kept so older references still land.

### B2 · `::search-text` / `::search-text:current` — **SHIPPED 2026-08-09, see §A12**

Same. One caveat carried forward into A12: the *paint* is confirmed for
`::target-text` only — find-in-page cannot be triggered from CDP, so
`::search-text` is verified as far as parsing and no further.

### B3 · `interpolate-size: allow-keywords` — declined 2026-08-04, **trigger fired 2026-08-09, still declined**

Would animate to `height: auto`. Declined because there was no `<details>` on the
site and **Bootstrap Collapse sets pixel heights in JS**, so it did nothing
today while arming a transition that could switch on later without anyone asking.

**The trigger fired.** `<details>` shipped on 2026-08-09 with the hub's
active-learning blocks (`design/chia-se-kinh-nghiem/06`): the recall question at
the top of an article, and the answer reveals inside it. Re-examined the same
day and **declined again, on the hub's own grounds rather than the original
ones**. Opening a disclosure is the reader asking to see an answer they have
just tried to produce from memory; the useful moment is the answer *being there*,
and an animation puts a curve between the question and the payoff. Philosophy §2
is explicit that a detail which draws attention to itself has failed, and this
one would draw attention at exactly the wrong instant. The native snap is also
what a reader who has met `<details>` anywhere else already expects.

**Trigger:** the accordion stops being Bootstrap Collapse (see B6) — the main
site's case is unaffected by any of the above and remains open. Do not re-propose
it for the hub's disclosures without an owner decision that they should animate.

### B4 · `@view-transition` — declined

It holds the old frame while the new document prepares, i.e. **it delays the
readable paint**. On a site whose whole argument is precision and speed, that is
the wrong trade.
**Trigger:** a cross-document view transition that can paint the new frame
without holding the old one, or a same-document use where the delay is provably
zero.

### B5 · `scrollbar-width: thin` — declined on accessibility grounds

A thinner scrollbar is a smaller pointer target. The reader this site is written
for is *một người công nhân* with unsteady hands.
**Trigger:** none. This is a values decision, not a technical one. Do not
re-propose it as a visual refinement.

### B6 · Native `<details name>` accordion — blocked by accumulated styling

The correct fix for the no-JS residual in C1. Blocked because the current
accordion carries five pieces of hard-won styling that would all need
re-deriving: the focus-ring specificity work, the `.accordion-item` corner-radius
bug, the chevron `mask`, the `forced-colors` block, and the `:has(.mini-h3)`
title layout.
**Trigger:** a rebuild of the accordion for another reason. Do not do it *for*
this.

### B7 · Inline `currentColor` monochrome logo for `forced-colors`

The navbar logos are content `<img>` SVGs (white over the hero, coloured when
scrolled). In Windows High Contrast neither reliably contrasts with Canvas across
both light and dark HC themes. Every other icon on the site is already handled —
feature icons inlined, chevrons repainted via `mask`, phone and external-link
icons forced to `LinkText`. The logo is the last one.
**Trigger:** none needed; this is work, not a platform limit.

### B8 · Optical heading spacing on the reading hub

A1 is main-site only. The hub would need its own constant measured from Literata,
and its rhythm is `margin-bottom`-based rather than `margin-top`-based, so the
mechanism does not port unchanged either.
**Trigger:** an owner decision that the hub's heading rhythm is worth the same
treatment.

### B9 · `::selection` sets a foreground colour

Not a bug — a deliberate brand choice. Recorded because it has one real cost:
setting `color` as well as `background` **flattens multi-coloured text under a
drag**, which on the hub means KaTeX equations lose their colour when selected.
A translucent wash with no `color` would preserve it.
**Trigger:** owner decision, if equation selection ever matters more than the
brand selection colour.

---

## C. Accepted limits

Known, deliberate, and not to be re-litigated without new information.

**C1 · No-JS: the accordion's ARIA.** A `<noscript><style>` in
`_includes/page.html` forces panels open, drops the chevron and the pointer
cursor, and restores the divider hairline. What no stylesheet can fix: the
buttons keep `aria-expanded="false"` over visibly-open panels. A screen reader
with scripting off would hear "collapsed" about content that is right there.
Wrong, but strictly better than the content being absent. The real trigger for
this path is a blocked or failed `bundle.js`, not a reader who turned JS off.
`mailto`/`tel`/email-copy all degrade cleanly. Proper fix is B6.

**C2 · Active nav state is colour-only.** Scrollspy changes link colour and
nothing else, so there is no non-colour "you are here" cue. Accepted as minor.

**C3 · No mobile section nav.** The toggler was removed by design; phones
navigate by scroll and the skip link. Intentional.

**C4 · `alt` text cannot carry `lang`.** Vietnamese names inside `alt`
attributes are read in the page language by screen readers. Only visible text was
wrappable in `<span lang>`. Platform limitation, no workaround.

**C5 · Build-toolchain limitations, all three gated in `verify.mjs`.** These are
the failures that produce a *correct-looking* page, which is why they are
machine-checked rather than trusted to review:
- PurgeCSS removes a bare `:focus-visible` selector (no class or element to match
  against) — that is a WCAG 2.2 SC 2.4.7 failure introduced by a minifier, in
  production only. The safelist in `optimize-css.mjs` holds it; the gate proves it.
- PurgeCSS drops selectors ending in `:not(:has(...))` — see A3.
- clean-css mangles `@font-feature-values` — see A4.

**C6 · Ruby Sass and the `2xl` map key.** An unquoted `2xl:` in a Sass map is a
Number, not an identifier, and mixing it with String keys makes Ruby Sass 3.7
raise `String can't be coerced into Integer` — but only when the two keys collide
in the same hash bucket, which Ruby re-randomises per process. Measured at
roughly **1 build in 60**. It cost this project months of "the toolchain is flaky
on Windows" and one confidently wrong diagnosis. Quote the key. Gated in
`verify.mjs`, which is the one gate that reads *source* rather than output,
because the failure destroys the build before there is any output to read.

**C7 · Cloudflare-injected items in Lighthouse.** Some Best-Practices and cache
findings come from Cloudflare's edge, not from this repo, and cannot be fixed
here. See `performance-audits/`.

**C8 · No consent banner.** There is no CMP, so EEA/UK/CH visitors stay `denied`
and only Consent Mode *modelling* applies — not real collection. To lawfully
collect EEA data a banner is required. The denied-region list (US-CA/CO/CT/UT/
VA/TX/OR/MT among them) needs periodic legal review as US state privacy laws
expand. This is a legal item, not a technical one.

---

## Review log

| Date | What was checked | Result |
|---|---|---|
| 2026-08-09 | File created. Inventory taken from source, not from memory: every `@supports`, every unguarded modern selector, every prefixed property, and both stylesheets' media queries. | A1 measured at 0.75px worst case and 18.8px tightest diacritic clearance; `main.scss` comment on `text-box-edge: text alphabetic` corrected (it has shipped). |
| 2026-08-09 | B1 + B2 built and shipped → A12. Colours derived by measurement (contrast + ΔE2000 against everything that can share the page), verified by paint in Chrome 151 against a same-scroll control, and gated four ways in `verify.mjs` — each assertion proven to fire by breaking the built CSS on purpose. | The one-pseudo-per-rule decision was confirmed live: a grouped rule containing an unknown pseudo was discarded whole. Two measurement traps recorded in A12 (word-boundary text fragments; headless Chrome defaults to dark). |
| 2026-08-09 | B3's trigger fired: `<details>` shipped with the hub's active-learning blocks. Re-examined and declined again for the hub, on new grounds (an animation between a recalled question and its answer draws the eye at the worst instant); the main site's accordion case stays open. A3 extended with four load-bearing `:has()` rules and gated in `verify.mjs`, each assertion proven to fire by deleting the rule from the built CSS. | The quiz's `:has()` pair is written backwards so a missing `:has()` degrades to a plain Q&A block rather than to four dead options. Verified in Chrome 151 in both schemes and at 390px, including a real Shift+Tab to confirm the focus ring — the first version of that check used a scripted `.focus()`, which does not match `:focus-visible` on a radio and passed while showing nothing. |
