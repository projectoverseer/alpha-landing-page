# Chia sẻ kinh nghiệm — Design Philosophy

**Product**: the Alpha knowledge hub at `/chia-se-kinh-nghiem/` — an educational library for
factory owners and managers who want to raise their dyehouse's performance and
revenue. Seeded from the founder's weekly Facebook posts; grows into the
reference library for Vietnamese dyehouse operations knowledge.

**Status**: living document. Refine it, don't route around it. Every future
change to the hub should either follow this document or amend it first.

---

## 1. What this is (and is not)

Chia sẻ kinh nghiệm is **a reading room, not a landing page**. It is designed as a
separate product from the marketing site: different purpose, different pace,
different design system. Nothing here is inherited from the main page's design.

| | Main site (`/`) | Chia sẻ kinh nghiệm (`/chia-se-kinh-nghiem/`) |
|---|---|---|
| Job | Convince in one visit | Be worth returning to weekly |
| Pace | Scanned in minutes | Read for an hour |
| Success | Contact/call | Scroll depth, return visits, series completion |
| Voice | Company | One person — Phan Đức Tuấn Anh, 28 years in the industry |

The marketing value of the hub comes from **being genuinely useful**. A factory
director who learns something real about OEE or ΔEcmc here will remember who
taught it. That is the entire conversion strategy — which is why the design
must never feel like marketing.

### The reader

A Vietnamese dyehouse owner, director, or technical manager, typically 35–60.
Arrives from Facebook on a phone, or studies at an office desktop. Reads in
Vietnamese. Not a designer, not impressed by novelty — impressed by substance
presented with care. May binge an entire series in one sitting: the design is
optimized for the *third consecutive article*, not the first impression.

---

## 2. Principles

1. **The text is the interface.** Everything on an article page exists to
   serve the act of reading. If an element doesn't help the reader understand
   or continue, it goes. No sidebars, no popups, no floating share buttons,
   no reading-progress gimmicks.

2. **Paper, ink, indigo.** The palette is a warm paper ground, warm ink text,
   and a single indigo accent — indigo (chàm) being the oldest dye of the
   craft this library serves. One accent color, used only for things the
   reader can act on (links, buttons). If a second accent ever feels
   necessary, the design has gone wrong somewhere else.

3. **Typography does the design.** Two families, strict roles:
   - **Literata** — all reading matter (article body, article headings,
     descriptions). A serif commissioned for long-form screen reading,
     with true Vietnamese diacritics, a true italic, and a true **optical
     size axis** (below).
   - **Inter** — all chrome (nav, metadata, labels, buttons, captions).
     Inter Variable (opsz 14–32), self-hosted — see the optical-size note below.
   No decorative type, no Inter Display for now — fewer voices, calmer page.
   Body text is 19px; Vietnamese stacked diacritics get line-height ≥ 1.7 so
   tone marks never collide between lines.
   *(**Alpha Math** is not a third voice — it draws the radicals and stretched
   brackets no reading face can, and nothing else. See §4, Maths.)*

4. **Calm, uniform baseline.** One background across the whole page. No
   alternating section tints, no dividers where whitespace can do the job.
   Hierarchy comes from type scale and spacing, not boxes. (This carries over
   the owner's standing preference from the main site — it applies doubly in
   a reading product.)

5. **Editorial CTAs, never ads.** Calls to action are written and styled as
   part of the editorial flow — an author's aside, a cross-reference, a
   signature — using the same type and palette as the text around them.
   Hard limits: **at most one mid-article CTA** per post, plus the end-of-post
   signature and the site-level contact strip. See §6.

6. **Fast and still.** Self-hosted subset fonts, no images that aren't part of
   the lesson, nothing on the page moves on its own — motion only ever *answers*
   the reader (owner's engagement pass, July 2026): a card's picture leans in
   under the pointer, a button press registers, the picture viewer follows the
   hand. `prefers-reduced-motion` is honored, and for those readers the
   answering gestures don't just lose their easing — they switch off entirely.

   **The script budget is three files, and all of them are optional to the
   page.** `squircle.js` (~4 KB, shared with the main site) re-cuts authored
   corners as superellipses — the one piece of the main site's design language
   the hub borrows, added on the owner's call in July 2026. `kt-lightbox.js`
   (~3 KB min, article pages only, July 2026) is the picture viewer: tapping a
   figure opens it full-screen at its largest shipped size — these are
   infographics and lab reports, and the reading column is not where a 1344px
   table is read — with pinch / wheel / tap zoom and drag pan, closed by ×,
   Esc, the backdrop, or the phone's Back button (one `pushState` per open, so
   the Facebook-arriving Android reader's back-press closes the picture, not
   the article). The hub additionally carries a small inline script for feed
   paging (§5). None may ever be load-bearing: with JS off the corners are
   simply round, a figure is simply a picture, and every post is still in the
   list. Nothing else earns a script, and **maths in particular does not** —
   equations are rendered to MathML at build time (§4).

7. **Vietnamese first.** `lang="vi"`, Vietnamese URLs (`/chia-se-kinh-nghiem/…`),
   Vietnamese microcopy. Every type decision is checked against diacritics,
   not just ASCII.

---

## 3. Color tokens

Warm paper reduces glare in long sessions; warm ink keeps contrast without the
clinical feel of pure black on white. All pairs must clear WCAG AA at their
used size; body text clears AAA.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FAF8F2` | Page ground — the only page background |
| `--paper-deep` | `#F1EDE2` | Asides, CTA cards, table stripes |
| `--line` | `#E2DCCB` | Hairline borders |
| `--ink` | `#292319` | Reading text (≈13.6:1 on paper) |
| `--ink-2` | `#5A5342` | Secondary: descriptions, standfirst (≥6:1) |
| `--ink-3` | `#6E6753` | Metadata, captions (≥4.5:1) |
| `--indigo` | `#2F4E7E` | Links, accents — the only action color (≥6:1) |
| `--indigo-deep` | `#243C61` | Hover/active, button fill |

Rules:
- Indigo means "you can act on this." Never use it decoratively.
- **The one bend in that rule (owner's call, July 2026): the topic tags in
  metadata** — the article kicker, the tag under a feed card — are links, but
  they stay `--ink-3` grey and reveal themselves with an underline on hover.
  A tag there labels the thing it sits under first and offers a route second.
  The place where topics are *meant* to be clicked is the strip at the top of
  the hub and of every topic page, and that strip is indigo (§5).
- No shadows for hierarchy. If a surface must separate (CTA card, aside),
  use `--paper-deep` plus a `--line` border, flat.
- Light theme only for now. Dark mode is a legitimate future amendment
  (§8) — add it as a token layer, never as per-component overrides.

## 4. Typography & layout

- **Measure**: one column, `max-width: 42rem` (~66ch at 19px). Never wider.
  Nothing sits beside the text column.
- **Article body**: Literata 400, 19px / 1.75 (17.5px on small screens).
- **Article H1**: Literata 600, 34px / 1.25 (28px mobile). Sentence case —
  the Facebook ALL-CAPS style is converted, never reproduced.
- **In-article H2**: Literata 600, 24px, generous top space (2.5em) — section
  breathing is spacing-first, per §2.4.
- **In-article H3**: Literata 700, 19px (same size as body, bolded).
- **Chrome / meta**: Inter 400–600, 13–15px, `--ink-3` / `--ink-2`.
- **No `clamp()`**: step sizes with media queries (one breakpoint ~640px).
- Lists, tables, blockquotes inherit body type; tables get an
  `overflow-x: auto` wrapper.

### Optical size — every size gets the drawing it was cut for

There is no "Literata Display" family, and we do not want one. Literata is a
single variable font with an **optical size axis** (`opsz` 7–72), and along it
the face is *redrawn*, not scaled: toward the small end it thickens, opens up and
sets wider so it survives being tiny; toward the large end it thins its hairlines,
tightens its fit and stands its caps taller (0.700 em → 0.730 em at the extreme,
with ~23% less ink). This is what a punchcutter did for four centuries — cut a
separate drawing for each size. The axis is that practice, restored.

**The axis is a POINT scale.** OpenType defines the `opsz` value as the size the
type is actually set at, *in points*. A screen has no physical size, so browsers
hand the axis the raw CSS px number instead ([csswg-drafts#4430]): the default
`font-optical-sizing: auto` therefore asks every element for the drawing of type
**one third larger than it really is**. Our 19px body was being drawn for 19pt — a
size it is never set at.

So the hub does not use `auto`. **1px = 0.75pt**, and every Literata rule states
its own optical size through a Sass mixin that cannot be used without one:

```scss
@mixin read($px) {
  font-size: $px * 0.0625rem;
  font-variation-settings: "opsz" #{$px * 0.75};
}
```

`read(34)` for the H1 → `opsz` 25.5. `read(19)` for the body → 14.25.
`read(16)` for a feed description → 12. Sizes that are em- or calc-derived (the
letters inside an equation, a subscript, the wordmark) use `opsz()` alone, with
the pixel size worked out by hand and written in the comment. Every size steps
down at the mobile breakpoint, so **every optical size steps down with it** — that
is what the mixin is really for: the two can never drift apart.

This is the whole policy. There is no display cut, no per-heading dial, no type
that is "pushed up the axis" for effect. A heading is drawn for the size a heading
is; so is a caption.

**Chrome is Inter, and its axis obeys the same rule.** Inter Variable carries an
`opsz 14–32` axis too, so it is held off `auto` exactly like Literata. But every
piece of chrome is small — the largest is the 16px body base, and 0.75 × 16 = 12,
below Inter's opsz floor of 14 — so the whole UI resolves to a single `opsz` 14,
Inter's text cut. It is pinned once on the body rather than per rule; anything set
large enough to leave the floor would take its own. In practice, then, Inter reads
exactly as it always has — the point of vendoring the variable font is that the
axis is now *present and correctly pinned*, not left to drive itself from pixels.

One consequence worth stating: **`@font-face` declares `font-weight: 400 900`**,
the real range in the files. A browser clamps the used weight to the declared
range, so the `400 700` this once said would have silently rounded any heavier
weight down without a word.

[csswg-drafts#4430]: https://github.com/w3c/csswg-drafts/issues/4430

### Maths

Two different things get called "a formula" in these articles, and they are set
differently on purpose.

**A rule of thumb written in Vietnamese** — `OEE = Sẵn sàng × Hiệu suất × Chất
lượng`, `Availability = Thời gian chạy thực tế ÷ Thời gian lên lịch chạy` — is a
sentence, not an equation. It stays prose in a blockquote, with `×`, `÷`, `√`
typed as characters. Wrapping Vietnamese words in maths markup would say
something false about them.

**An actual equation** — Greek, superscripts, subscripts, radicals, fractions —
is written as **LaTeX between `$$…$$`** and rendered to **MathML at build time**
(`optimize-math.mjs`, using KaTeX). Ordinary LaTeX in, static MathML out: the
page ships no maths library, the equation is real selectable text that a screen
reader speaks and a crawler indexes, and the original TeX travels inside the
MathML as an `<annotation>`. This replaced (July 2026) a bad first attempt at
typing equations as Unicode soup with `<sub>` tags.

An equation is set in the reading face and belongs to the sentence around it.
Three decisions get it there, and the third is the one that makes the other two
work:

1. **Letters, digits and words are Literata** (`mi`, `mn`, `mtext`), so the ΔE\*
   inside a formula is the same shape as the ΔE\* in the paragraph beside it.
   Greek is part of that: Literata's **greek subset** is self-hosted for one
   letter, Δ, which carries the whole colour-deviation post.
2. **Everything else is Alpha Math** — the radical, brackets stretched around a
   fraction, the operators. It is a subset of TeX Gyre Schola Math (New Century
   Schoolbook), chosen because it is the maths face built on Literata's virtues:
   sturdy serifs, low contrast, large x-height. It exists because *only a font
   with an OpenType `MATH` table can draw a √ sized to its contents*, and no
   reading face has one. Left to itself, the browser reaches for whatever its OS
   ships — Cambria Math, Latin Modern, STIX — and the equations look like a
   different website on every machine. Provenance and licence:
   `fonts/math/README.md`.
3. **Variables are upright, never italic.** An italic variable is not the letter
   it looks like: the browser applies `text-transform: math-auto` and *substitutes
   the character* — `L` becomes `𝐿` (U+1D43F, Mathematical Italic Capital L), a
   codepoint no reading face on earth has a glyph for. So an italic variable
   cannot be Literata; it always falls back to the OS maths font. Upright is the
   owner's call *and* the only way to keep the letters in the body face.
   `optimize-math.mjs` writes `mathvariant="normal"` on every `<mi>`.

Hard rules, all three enforced by `verify.mjs`: an unrendered `\[`/`\(` fails the
build; a bare `<mi>` fails the build; and **an equation is never wrapped in
`**…**`** — the HTML minifier treats `<math>` as a block element and swallows the
word space beside it.

Where a subscript is wanted but maths markup is not — a heading, which stays
plain text — use `<sub>`: `## ΔE<sub>CMC</sub>: …`. Search engines read it as
ordinary text. In `title:` / `description:` front matter, where even that is
impossible, write it out: `ΔE CMC (2:1)`.

## 5. Page anatomy

**Title bar (every page)** — the sub-brand lockup: the Alpha Software logo
followed by the word "Chia sẻ kinh nghiệm". **Alpha Chia sẻ kinh nghiệm is one logo, not a logo
beside a word.** "Chia sẻ kinh nghiệm" is set in Literata for now, but it is treated as
artwork, not as text: it never wraps, never underlines, never takes link color,
and nothing (no hairline, no dot, no pipe) is drawn between the two halves. The
mark has **no hover and no active state at all** — a logo is identity, not an
affordance; only the keyboard focus ring applies. The logo is sized to the
article H1 (2.125rem, 1.75rem on small screens): the largest type on the page,
never larger.

The lockup is composed like a professional sub-brand mark (Google Cloud, FedEx
Express), harmonized with the **whole** logo — emblem, "alpha", and the
"Software" tagline — never baseline-locked to any single line of it (both
approaches were rendered and compared; baseline-locking always privileges one
line and orphans the rest). **"Chia sẻ kinh nghiệm" is perceptually centered on the
logo**: its ink box (it has no descenders) is centered on the artwork's
vertical center, then dropped a further 0.025 em because the diacritics carry
almost no visual weight.

**Size: the word's cap height equals the "alpha" wordmark's x-height.** alpha's
x-height is 20.03/48 of the artwork, so the em is (20.03/48) ÷ cap-height × logo
height = **0.595** × logo height (≈20.2px at the 2.125rem logo), and the mobile
size re-derives from the same ratio. Its caps sit in alpha's lowercase band and
its diacritics rise like alpha's ascenders: same voice, clearly secondary to the
mark it belongs to. Weight 700 (the H3 weight) holds against the wordmark's heavy
rounded strokes; 600-and-below reads thin beside it.

The lockup is the one place the optical size cannot come from the `read()` mixin
(§4), and it is **circular**: the word's size is a fraction of the logo, the
fraction depends on Literata's cap height, and cap height *moves with the optical
size*. Solved as a fixed point — the word lands at 20.22px, so it is cut for
`opsz` **15.2** (and 12.5 at the mobile logo). Change the logo height and this has
to be re-solved, not guessed.

The word stays
warm ink — borrowing the logo's blue would put a third blue next to indigo,
and indigo means "actionable" (§3). The gap is one word space at the word's
own size: the mark reads as a single phrase. Chia sẻ kinh nghiệm is a branch of
Alpha, not a second brand. The lockup always links to `/chia-se-kinh-nghiem/`, so it is
also the way back from any article. Sticky, hairline bottom border, nothing else
in the bar — no second link competing with it.

**Hub (`/chia-se-kinh-nghiem/`)** — one reverse-chronological feed:
- **No masthead, no mission paragraph. The feed starts right under the title
  bar.** The hub is a home feed — YouTube, Facebook — where the content is the
  page. Chrome and prose about the library steal the first screen from the
  articles. (The `<h1>` stays in the markup for structure and search, hidden
  visually; the lockup already says where the reader is.)
- **A single stream, newest first. No topic buckets, no numbered lessons.**
  The reader lands on the latest thinking and scrolls back through the
  archive, the way they already read Facebook. An entry carries title,
  one-line description, topic tag, date, reading time — the tag because the
  hub is otherwise the one place the reader can't see what a post is about.
  The thumbnail belongs to the entry, not to a card or a grid — and under the
  pointer it leans in a touch (scale 1.04, cropped inside its frame), the
  standard feed invitation to click. Reader-initiated, so it keeps §2.6.
- **Endless scroll**: the page renders every post; a small script keeps the
  older ones hidden and reveals the next batch as the reader nears the bottom.
  Non-negotiable: with JS off, or if the script fails, **every post is still
  in the HTML and visible**. Paging is a comfort, never a gate — on the content
  or on the crawler.
- **The topic strip** (added July 2026, **removed two weeks later** at the
  owner's call) briefly sat above the first post, linking out to every topic
  page. It is gone: the hub now opens straight on the feed, with nothing between
  the title bar and the newest post. The topic pages under `/chu-de/` remain, and
  a post still links to its own topic from the article byline — that byline is
  the one route to them now.

**Topic page (`/chia-se-kinh-nghiem/chu-de/<key>/`)** — every post carrying one
topic, newest first. Unlike the hub it introduces itself (heading + the topic's
one-line description from the data file, so the taxonomy stays the single source
of truth and no SEO copy is invented per page) — and then it gets out of the way.
No kicker, no strip of the other topics, no drip: **the page is its list**, and
the way back up is the lockup in the title bar (owner's call). Every tag anywhere
on the hub — the card's, the article's kicker, the strip — points here.

- Topics remain metadata, not structure: they label an entry and an article and
  now collect them, but they never chop the *hub* feed into sections.

**Article (`/chia-se-kinh-nghiem/<slug>/`)**:
1. Title bar (above).
2. Title block: topic label (Inter, small caps feel), H1, **byline** — author ·
   date · reading time — then the standfirst (description), then the picture.
   The byline sits directly under the title because it is the line that says
   *you are reading an article*, and the reader should meet it before the prose,
   not after the picture. **No "bài n/N"** — an article is a piece of writing,
   not a lesson in a course.
3. Body (converted post, with editorial CTAs per §6).
4. Series footer: "Bài trước / Bài sau" within the same series — continuity
   offered, never a syllabus imposed.
5. **Đọc tiếp** (owner's engagement pass, July 2026): up to three more
   articles in compact thumb-and-title rows — same topic first, then the
   newest of the rest of the hub; posts from the article's own series are
   excluded because the series footer above already offers them. Reading time
   shown on every row. The reader who reached the end of a post just proved
   they read to the end — they are offered the next piece *before* the contact
   strip asks anything of them. Plain HTML, crawler-visible, no script.
6. Contact strip (site-level, uniform): one sentence + phone / email actions.
7. Minimal footer: legal name, © , link to main site.

## 6. CTA policy — editorial elements with a second job

CTAs are Jekyll includes (`_includes/chia-se-kinh-nghiem/cta.html`), inserted in the
article Markdown as e.g. `{% raw %}{% include chia-se-kinh-nghiem/cta.html variant="note" %}{% endraw %}`.
They render in article type and palette so they read as part of the piece
— Liquid keeps the Markdown source clean and lets every CTA evolve centrally.

Variants (see `02-authoring-guide.md` for exact usage):
- `inline` — one editorial sentence with a link; the lightest touch.
- `note` — an author's aside in a `--paper-deep` box ("Ghi chú từ Alpha").
- `card` — product cross-reference with a button, only where the article
  genuinely intersects the product (e.g. OEE tracking → Smart Dyehouse).
- `banner` — contact strip with tel/mail actions (used by the layout, not
  usually inside articles).
- `signature` — author signature + copyright line + first-published canonical
  URL. **Every article ends with this.**

**Copyright**: the articles are **the company's**, not the author's. Phan Đức
Tuấn Anh is credited as the author (byline, signature, JSON-LD `author`), but
the copyright holder in every signature, footer and structured-data field is
Công ty TNHH Phát triển Phần mềm Alpha (Alpha Software). Never write "bản quyền
của <tác giả>".

**The second job (copy resilience)**: every variant embeds absolute
`https://www.alphasoftwaregroup.com/…` URLs and the brand/author name in
plain text and links. When scrapers lift the article body wholesale, the
attribution, the canonical URL, and working backlinks travel with the copy.
This only works if CTAs stay *inside* the article content flow — which the
editorial styling already requires for reader-experience reasons. The
signature variant is mandatory precisely because it is the watermark.

Restraint rules (hard):
- ≤ 1 mid-article CTA per post. Zero is fine.
- A CTA may never interrupt a numbered sequence of steps or a worked example.
- CTA copy must be true to the article's context — no generic "buy now".

## 7. Performance, accessibility, SEO

- **Budget** (article page, cold cache): HTML < 30 KB — the colour-deviation post,
  with 50 equations in it, sits right on the line at 30.1 KB; MathML is verbose,
  and that verbosity *is* the equation being real text — CSS < 25 KB min,
  fonts ≤ ~200 KB (subset woff2, self-hosted), JS ≤ 8 KB — squircle everywhere
  plus the picture viewer on articles (+ GA4 deferred). Equations ship as MathML, so they cost **no JavaScript at
  all**; they do cost the 67 KB Alpha Math face, and only on the pages that have
  one — the `@font-face` has no `unicode-range`, so the file is fetched when a
  `<math>` element is on the page and never otherwise (§4).
- Semantic HTML (`article`, `time`, `nav`, `figure`, `math`); skip link; visible
  focus styles; AA contrast minimum everywhere.
- Each article: canonical URL, `og:type=article`, `article:published_time`,
  JSON-LD `Article` with the author as a person. Site name stays
  "Alpha Software Group" (deliberate — see project memory).
- Each topic page: `CollectionPage` + an `ItemList` naming every post on it, so
  it reads to a crawler as the index of a subject and not as a thin doorway.
  Breadcrumbs run Alpha → hub → topic → article.
- Sitemap entries are generated from posts automatically; `lastmod` stays
  honest via the existing pipeline.

## 8. Evolution rules

May change freely (amend this doc in the same commit):
- Type scale tuning, spacing tuning, new CTA variants, image/figure
  treatment when photos arrive, dark mode (as a token layer), RSS feed,
  print stylesheet, topic taxonomy growth.

Must survive any redesign (change only with an explicit owner decision):
- Single reading column and its measure; calm uniform background;
- One accent color meaning "actionable" (with the one documented bend, §3);
- **No script the page depends on**: everything must read, and every post must
  be in the HTML, with JS off. (This replaced the old "zero-JS article pages"
  rule when the owner added squircle in July 2026 — the bar moved from *no
  script* to *no script that matters*. Maths is explicitly on the wrong side of
  that line: it is rendered at build time, never in the browser.)
- The Alpha + Chia sẻ kinh nghiệm lockup as the one mark in the title bar, and the hub
  as a feed that opens on content (no masthead);
- CTA restraint rules, the mandatory signature, and Alpha as the copyright
  holder of every article;
- Literata-for-reading / Inter-for-chrome role split (families may be
  swapped, roles may not);
- Vietnamese-first.
