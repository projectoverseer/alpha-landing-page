# Kiến Thức — Design Philosophy

**Product**: the Alpha knowledge hub at `/kien-thuc/` — an educational library for
factory owners and managers who want to raise their dyehouse's performance and
revenue. Seeded from the founder's weekly Facebook posts; grows into the
reference library for Vietnamese dyehouse operations knowledge.

**Status**: living document. Refine it, don't route around it. Every future
change to the hub should either follow this document or amend it first.

---

## 1. What this is (and is not)

Kiến Thức is **a reading room, not a landing page**. It is designed as a
separate product from the marketing site: different purpose, different pace,
different design system. Nothing here is inherited from the main page's design.

| | Main site (`/`) | Kiến Thức (`/kien-thuc/`) |
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
     with true Vietnamese diacritics and a true italic.
   - **Inter** — all chrome (nav, metadata, labels, buttons, captions).
   No decorative type, no third family, no Inter Display for now — fewer
   voices, calmer page. Body text is 19px; Vietnamese stacked diacritics
   get line-height ≥ 1.7 so tone marks never collide between lines.

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

6. **Fast and still.** Reading pages (articles) ship **zero JavaScript**
   (analytics excepted), self-hosted subset fonts, and no images that aren't
   part of the lesson. Nothing on the page moves unless the reader moves it.
   Transitions are hover/focus affordances only; `prefers-reduced-motion` is
   honored. The hub is the one exception: it carries a small inline script for
   feed paging (§5), and that script must always degrade to the full list.

7. **Vietnamese first.** `lang="vi"`, Vietnamese URLs (`/kien-thuc/…`),
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
- Formulas stay inline text (no math renderer); use `×`, `÷`, `√` characters.

## 5. Page anatomy

**Title bar (every page)** — the sub-brand lockup: the Alpha Software logo
followed by the word "Kiến thức". **Alpha Kiến Thức is one logo, not a logo
beside a word.** "Kiến thức" is set in Literata for now, but it is treated as
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
line and orphans the rest). **"Kiến thức" is perceptually centered on the
logo**: its ink box (it has no descenders) is centered on the artwork's
vertical center, then dropped a further 0.025 em because the diacritics carry
almost no visual weight. **Size: the word's cap height equals the "alpha"
wordmark's x-height** — Literata caps are 0.7 em and alpha's x-height is
20.03/48 of the artwork, so the em is 0.596 × logo height (≈20px at the
2.125rem logo), and the mobile size re-derives from the same ratio. Its caps
sit in alpha's lowercase band and its diacritics rise like alpha's ascenders:
same voice, clearly secondary to the mark it belongs to. Weight 700 (the H3
weight) holds against the wordmark's heavy rounded strokes. The word stays
warm ink — borrowing the logo's blue would put a third blue next to indigo,
and indigo means "actionable" (§3). The gap is one word space at the word's
own size: the mark reads as a single phrase. Kiến thức is a branch of
Alpha, not a second brand. The lockup always links to `/kien-thuc/`, so it is
also the way back from any article. Sticky, hairline bottom border, nothing else
in the bar — no second link competing with it.

**Hub (`/kien-thuc/`)** — one reverse-chronological feed:
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
  Thumbnails are a planned addition; when they arrive they belong to the
  entry, not to a card or a grid.
- **Endless scroll**: the page renders every post; a small script keeps the
  older ones hidden and reveals the next batch as the reader nears the bottom.
  Non-negotiable: with JS off, or if the script fails, **every post is still
  in the HTML and visible**. Paging is a comfort, never a gate — on the content
  or on the crawler.
- Topics are metadata, not structure: they label an entry and an article, and
  may power future filtering, but they never chop the feed into sections.

**Article (`/kien-thuc/<slug>/`)**:
1. Title bar (above).
2. Title block: topic label (Inter, small caps feel), H1, standfirst
   (description), byline — author · date · reading time. **No "bài n/N"** —
   an article is a piece of writing, not a lesson in a course.
3. Body (converted post, with editorial CTAs per §6).
4. Series footer: "Bài trước / Bài sau" within the same series — continuity
   offered, never a syllabus imposed.
5. Contact strip (site-level, uniform): one sentence + phone / email actions.
6. Minimal footer: legal name, © , link to main site.

## 6. CTA policy — editorial elements with a second job

CTAs are Jekyll includes (`_includes/kien-thuc/cta.html`), inserted in the
article Markdown as e.g. `{% raw %}{% include kien-thuc/cta.html variant="note" %}{% endraw %}`.
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

- **Budget** (article page, cold cache): HTML < 30 KB, CSS < 25 KB min,
  fonts ≤ ~160 KB (subset woff2, self-hosted), JS 0 KB (+ GA4 deferred).
- Semantic HTML (`article`, `time`, `nav`, `figure`); skip link; visible
  focus styles; AA contrast minimum everywhere.
- Each article: canonical URL, `og:type=article`, `article:published_time`,
  JSON-LD `Article` with the author as a person. Site name stays
  "Alpha Software Group" (deliberate — see project memory).
- Sitemap entries are generated from posts automatically; `lastmod` stays
  honest via the existing pipeline.

## 8. Evolution rules

May change freely (amend this doc in the same commit):
- Type scale tuning, spacing tuning, new CTA variants, image/figure
  treatment when photos arrive, dark mode (as a token layer), RSS feed,
  print stylesheet, topic taxonomy growth.

Must survive any redesign (change only with an explicit owner decision):
- Single reading column and its measure; calm uniform background;
- One accent color meaning "actionable";
- Zero-JS **article** pages, and a hub whose every post is in the HTML
  regardless of JS;
- The Alpha + Kiến thức lockup as the one mark in the title bar, and the hub
  as a feed that opens on content (no masthead);
- CTA restraint rules, the mandatory signature, and Alpha as the copyright
  holder of every article;
- Literata-for-reading / Inter-for-chrome role split (families may be
  swapped, roles may not);
- Vietnamese-first.
