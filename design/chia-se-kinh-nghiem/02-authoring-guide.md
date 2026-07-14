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

New topics/series: add the key to `_data/chia_se_kinh_nghiem.yml` first.

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
  image (16:9 crop, below the description), the article hero (uncropped, between
  the title and the standfirst), the `og:image`, the schema `image`, the
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
- Formulas and key rules → blockquotes (`>`); use `×`, `÷`, `√`, `Δ` characters.
- Enumerations → Markdown lists; Excel column specs → header-only tables.
- Fix only unambiguous typos; never rewrite the author's voice. When unsure,
  check the archive file.
- **Remove** Facebook-only lines: the company/website footer, "comment chia
  sẻ kinh nghiệm nhé", attachment references.
- **Keep** the authorial series teasers ("Bài tới mình sẽ chia sẻ…").
- Images arrive later: leave a placeholder comment where the original post
  had an attachment, with enough description to find the right image:
  `<!-- [Hình] Sơ đồ nguyên lý máy quang phổ -->` (or `[Video]`).

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
