# Chia sẻ kinh nghiệm — Authoring Guide

How to turn a Facebook post (or any new piece) into a published article.
Design rationale lives in `01-philosophy.md`; this file is the mechanics.

## 1. Archive the raw text

Save the unedited post text to
`content-archive/facebook-posts/YYYY-MM-DD-<slug>.txt`
(date = original publication date, slug = ASCII Vietnamese, hyphenated).
This folder is the source of truth for what the author originally wrote.

## 2. Create the post

`_posts/YYYY-MM-DD-<slug>.md` — same date + slug as the archive file.
Layout and permalink (`/chia-se-kinh-nghiem/<slug>/`) come from `_config.yml` defaults.

```yaml
---
title: "Sentence-case title — never the Facebook ALL CAPS"
description: "1–2 sentences. Shown as the hub list entry, the article standfirst, and the meta description. Write it as a hook, not a summary of headings."
topic: van-hanh          # key from _data/chia_se_kinh_nghiem.yml → topics; labels the article
series: so-hoa-oee       # optional — key from _data/chia_se_kinh_nghiem.yml → series
series_part: 3           # required if series is set; orders prev/next only
image: rft-nhuom-dat-tu-lan-dau   # optional — key from _data/chia_se_kinh_nghiem.yml → images
---
```

New series: add the key to `_data/chia_se_kinh_nghiem.yml` first.

**New topic — two steps.** Add the key (with `label` and `desc`) to
`_data/chia_se_kinh_nghiem.yml` → `topics`, then create its page:
`chia-se-kinh-nghiem/chu-de/<key>.html`, which is nothing but front matter —

```yaml
---
layout: chia-se-kinh-nghiem-topic
permalink: /chia-se-kinh-nghiem/chu-de/<key>/
topic: <key>
---
```

The heading, the description, the post list, the topic strip, the sitemap entry
and the structured data all come from the data file and the posts. (Two steps
rather than one because GitHub Pages forces Jekyll into `safe` mode, so no
generator plugin may create the page for us.)

`series_part` is ordering metadata, never shown to the reader — the hub is a
chronological feed and articles carry no "bài n/N" tag (philosophy §5). The
newest post always leads the hub, so write each post to stand alone.

## 2b. Add the pictures

Every picture is declared once, in `_data/chia_se_kinh_nghiem.yml` → `images`,
and referenced everywhere by its slug. Nothing about an image (size, alt,
caption) is ever repeated in a post.

1. **Make the derivatives.** Each slug ships as `<slug>-<width>.avif` and
   `<slug>-<width>.jpg` in `img/chia-se-kinh-nghiem/`: one at the source width
   (capped at 1344 = 2× the 672px reading column) and, when the source is over
   800px, one at 672. AVIF is what readers get; the JPEG is the fallback **and**
   the `og:image` — Facebook and Zalo cannot decode AVIF.
2. **Name it for search.** The filename is a ranking signal: hyphenated, no
   diacritics, describing the picture (`cua-do-aperture-may-quang-pho`), not
   `IMG_2027`.
3. **Register it** in the data file with `w`/`h` (the largest derivative), `sm`
   (is there a 672 variant?), `alt` and `caption`. Alt = what the picture *says*
   to someone who cannot see it. Never keyword stuffing — Google demotes it and
   it fails the reader anyway.

Then use it:

- **Thumbnail** — `image: <slug>` in front matter. It becomes the feed card
  image (16:9 crop, above the description), the article hero (uncropped, between
  the standfirst and the byline), the `og:image`, the schema `image`, the
  preloaded LCP element, and an entry in the image sitemap. A post with no
  `image:` degrades cleanly: no card image, and `og:image` falls back to the
  company card.
- **In the body** — `{% include chia-se-kinh-nghiem/figure.html name="<slug>" %}`
  at the paragraph the picture teaches, never as decoration.

A picture used as the thumbnail is **not** repeated in the body — the hero
already showed it.

## 3. Convert the body

- ALL-CAPS section headers → `##` sentence case; sub-points (`THỨ NHẤT…`) →
  `###` or a bold run-in (`**Thứ nhất — …**`), whichever the rhythm needs.
- Rules of thumb written in Vietnamese words (`OEE = Sẵn sàng × Hiệu suất ×
  Chất lượng`) → blockquotes (`>`), with `×`, `÷`, `√`, `Δ` typed as characters.
  Those are sentences. Real equations are §3b.
- Enumerations → Markdown lists; Excel column specs → header-only tables.
- Fix only unambiguous typos; never rewrite the author's voice. When unsure,
  check the archive file.
- **Remove** Facebook-only lines: the company/website footer, "comment chia
  sẻ kinh nghiệm nhé", attachment references.
- **Keep** the authorial series teasers ("Bài tới mình sẽ chia sẻ…").
- Images arrive later: leave a placeholder comment where the original post
  had an attachment, with enough description to find the right image:
  `<!-- [Hình] Sơ đồ nguyên lý máy quang phổ -->` (or `[Video]`).

## 3b. Write the equations in LaTeX

Anything with Greek, a superscript, a subscript, a radical or a fraction is an
equation, and it is written as **LaTeX between `$$…$$`** — the same delimiter for
a display formula on its own line and for a symbol inside a sentence:

```markdown
Máy tính ra $$\Delta E^*$$ (Delta E), độ lệch màu giữa hai mẫu.

$$\Delta E^* = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}$$

Trong đó $$S_L$$, $$S_C$$, $$S_H$$ là các hàm trọng số.
```

The build renders it to **MathML** (`optimize-math.mjs` → KaTeX). Nothing is
computed in the browser: the reader gets real text, correctly typeset, that a
screen reader speaks and Google indexes, and the page still ships no maths
library. A malformed formula fails the build, loudly.

So: **never type an equation by hand as Unicode with `<sub>` tags again.** That
is what `ΔEcmc = √[(ΔL*/lS<sub>L</sub>)²…]` was, and it was wrong on every count.

The letters come out **upright and in Literata**, matching the prose around them
— that is deliberate and automatic; you do not write `\mathrm{}` around your
variables to get it. Write `S_L`, not `\mathrm{S}_\mathrm{L}`.

Four rules:

1. **Never bold or italicise an equation** — no `**$$…$$**`. The HTML minifier
   treats `<math>` as a block element and swallows the word space next to it
   (`chọn ΔEcmc(2:1)khi đo màu`). `verify.mjs` fails the build if you do. The
   maths already stands apart from the prose; it needs no help.
2. **Headings stay plain text.** Write `## Độ lệch màu ΔE*`, not `$$…$$` — a
   heading is a label to scan, and maths set inside bold serif reads worse, not
   better. Same for `title:` and `description:` in the front matter, which are
   plain text by nature (they become the `<title>`, the og: tags, the feed card).
3. **A single `*` is safe in a heading; `L*a*b*` is not** — Markdown reads the
   inner pair as emphasis, so that one still needs `L\*a\*b\*`.
4. **A subscript in a heading is `<sub>`, not maths**: `## ΔE<sub>CMC</sub>: …`.
   Google reads it as ordinary text; it costs nothing. In `title:` and
   `description:`, where not even HTML is allowed, spell it out — `ΔE CMC (2:1)`,
   the way the trade writes it on a spec sheet.

An acronym in a subscript is set in **capitals** (`\Delta E_{\mathrm{CMC}}`,
`ΔE<sub>CMC</sub>`) — CMC is a committee, not a word.

## 4. Insert CTAs

All CTAs are one include: `{% raw %}{% include chia-se-kinh-nghiem/cta.html variant="…" %}{% endraw %}`
(variants: `inline`, `note`, `card`, `banner`, `signature` — full parameter
list in the comment at the top of `_includes/chia-se-kinh-nghiem/cta.html`).

- **Every post ends with** `variant="signature"` — it is the copyright line
  and the copy-trap watermark (canonical URL travels with scraped copies).
- **At most one** mid-article CTA (`inline`, `note` or `card`). Zero is fine.
  Never inside a numbered sequence of steps or a worked example.
- Prefer `card` only where the article genuinely intersects the product;
  override the default copy to match the article's context:

```liquid
{% raw %}{% include chia-se-kinh-nghiem/cta.html variant="card" heading="…" text="…" button="…" href="…" %}{% endraw %}
```

- Facts in CTA copy must be true and already public (e.g. the Spica RFT
  numbers come from the customer review on the main page).
- `banner` is used by the layouts (contact strip); don't put it in articles.

## 5. Ship

Nothing else to update: the hub index, series navigation, and sitemap entries
are all generated from the post's front matter. Build and ship as usual
(`npm run build` / `npm run ship`).
