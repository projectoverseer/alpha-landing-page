# Chia sẻ kinh nghiệm — Chọn ảnh bìa (the cover-selection algorithm)

Which picture fronts a post, how many, in what layout, at what ratio – decided
the same way for post 15 and post 1000. The crop *mechanics* (Facebook's
display window, saliency-centred crops, tiled layouts) live in `03-element-spec.md`
and `_includes/chia-se-kinh-nghiem/thumb.html`; this file is the layer above:
**selection**. The goal, in the owner's words (2026-07-29): a reader should
know what a post is about at a glance – before the title, before the
description, before the click. Every rule below serves that sentence.

The system is modelled on the strongest public pipelines, adapted to a static
site where the author is the model:

- **Netflix AVA** – frames scored on visual metadata (brightness, contrast,
  blur), contextual metadata (faces, motion, objects) and composition (rule of
  thirds, symmetry, depth of field), then ranked for beauty **and diversity**
  (never two similar picks side by side).
- **YouTube CTR practice** – faces with real emotion lift click-through
  30–45%; high colour contrast ~30%; text on the image only under 4 words; one
  focal point; judge at phone size. Thumbnail and title are one unit: the
  picture *shows*, the title *tells* – never the same words twice.
- **Instagram (2026)** – portrait 4:5 wins the feed because it owns more
  screen; keep the subject inside the centre of the frame (their grid crops
  edges off).
- **TikTok / YouTube Shorts** – the cover is *chosen*, never defaulted to
  frame 1: plan the poster moment while shooting.
- **Academic CTR studies** – a single salient object separates thumbnails
  that work from frames that don't; colourfulness and brightness should agree
  (vivid + bright, or muted + dark); more than ~3 element types stops
  communicating; sharpness and texture are the visual-quality metrics that
  correlate with selection.
- **Zalo + Facebook link cards** – both read `og:image`; both need ≥600px
  width for the large card and prefer landscape near 1.91:1. Zalo is where
  this audience actually shares links; §6 exists because of it.

## 0. The quick path (most posts)

1. The post has **one** on-subject picture → it is the cover. Single, natural
   ratio. Register it (02 §2b), run `node image-focus.mjs`, done.
2. The post has **several** pictures → score them (§2), the winner is the
   cover; tile only if the promise is plural (§4).
3. The post has **no** picture → make one (§8). Publishing an imageless card
   is not an option (owner, 2026-07-29): a photo on every post.

Only steps §1–§6 below exist for the contested cases. Do not ceremony a post
that has one obvious picture.

## 1. Candidates and gates

A candidate is any registered image the post could honestly front – its own
figures first, and (for series) a sibling part's registered image when it is
subject-true for *this* post too. Three hard gates, any failure disqualifies:

- **G1 Truth.** The cover must show something the post actually delivers.
  Borrowing for drama is lying with a picture; borrowing a series instrument
  the post genuinely teaches is fine.
- **G2 Glance-legibility.** It must communicate at card width (~624px) or
  cell width (~311px). Pure tables, dialog screenshots and dense text panels
  never pass – they are body figures (`bang-nguon-sang-chuan-cie`,
  `man-hinh-hieu-chuan-may-do-mau` are the canonical examples).
- **G3 Quality.** Sharp, exposed, unstretched. A single cover renders up to
  624px; an image under ~500px intrinsic width upscales past its pixels –
  either accept it knowingly (photo beats pixel purity – owner, 2026-07-29,
  `may-pha-gay` 400px) or put it in a tile, where a 311px cell is native
  resolution again.

## 2. Scoring – the AVA layer

Score each surviving candidate 0–10 per axis; weights multiply; highest total
fronts the card. Two minutes with a table beats an hour of taste debate.

| Axis | × | What 10 looks like |
|---|---|---|
| **R** Relevance | 3 | The picture shows exactly what the title promises. |
| **A** Attention | 3 | The research hierarchy: human face with emotion > people acting > real machine/object photo > colourful diagram/infographic > text poster > table/screenshot. |
| **S** Story-at-a-glance | 2 | A stranger could say the topic from the picture alone, no title. |
| **C** Craft | 1 | One focal point; ≤3 element types; colour–brightness agree; sharp and clean. |

`node image-focus.mjs --audit` prints the measured half – sharpness, entropy,
colourfulness, luma, contrast per image. They are signals, not verdicts: high
entropy + low colourfulness flags a text poster (weak A); low contrast flags a
flat candidate (weak C); the eye still decides R and S. Ties break on the
numbers.

The complementary rule from YouTube applies to the whole card: cover shows,
title tells. If the cover already contains the title's words as text, one of
the two is wasted – pick the other candidate or rewrite neither (titles are
the author's voice; the cover moves, not the title).

## 3. Ratio

Mechanics per 03: natural ratio inside the 1.91:1 … 4:5 window, clamp to the
nearest bound outside it, every crop centred on `fx`/`fy`. Selection
preferences on top of that, for candidates that otherwise tie:

- **Portrait-leaning beats landscape** on the feed – a 4:5 card owns more
  phone screen (Instagram's finding, and why the two tall infographics are
  the feed's strongest real estate).
- **Extreme panoramas lose the most** in the clamp (a 3:1 strip keeps only
  64% of itself at 1.91:1) – prefer a squarer sibling when one passes G1.
- **`fx`/`fy` override.** Saliency puts the attention centre where colour and
  texture peak – correct for photos, wrong twice over. Wrong for symmetric
  continua (spectra, gradients, timelines) where the *whole run* is the story
  (`pho-anh-sang-nhin-thay-380-700nm`, fx 90 → 50, 2026-07-29). And wrong for a
  **stacked pair or set** – two formulas, two samples, before/after in one
  frame – where saliency commits to whichever member has the most texture and
  the crop then shows one of two, which is the opposite of the post's promise
  (`cau-truc-phan-tu-nylon-6-va-nylon-66`, fy 81 → 50, 2026-08-02). In both
  cases set the axis to 50 by hand and say so in a comment in the data file.

## 4. Layout grammar – when to tile

The count is a statement about the post's promise, never decoration:

- **1 (default).** The promise is one thing. One picture, own ratio.
- **2 tiles** (two squares). The promise is inherently a *pair*: two lab
  tests, lab vs production, before/after, the tool and what it replaces.
  Primary in the **left** cell – scanning reads left first. Live example:
  `chat-deu-mau` (leveling + retarding reports), `nguyen-ly-may-do-mau`
  (machine + the eye-test kit it replaces).
- **3 tiles** (one wide over two squares). The post is the umbrella over a
  system of ≥3 parts: the wide tile is the summary, the squares are two of
  its instruments. Live example: `lam-sao-de-do-oee` (the OEE=60% poster over
  the two measuring infographics). First slug in the list = the wide tile.
- **Never more than 3.** Below ~300px a cell stops communicating; Facebook
  caps the attention set the same way.
- Each tile must add a distinct noun to the glance-story; if two tiles say
  the same noun, drop one.
- Tiles rescue low-res (§1 G3) and may borrow sibling images (§1 G1).

## 5. Feed diversity – the Netflix rule

AVA never ships near-duplicate artwork side by side; neither does this feed.
Before shipping a post, open `/chia-se-kinh-nghiem/` and look at the new
card's neighbourhood – O(1) per post, no tooling:

- Two cards must never lead with the **identical image**. (The bug this rule
  killed: OEE parts 2 and 3 both fronted the `cho-may` cartoon until
  2026-07-29 – in a feed, a repeated face reads as a reposted article.)
- **Adjacent** cards should differ in dominant colour or shape; on a
  collision the *lower-scoring* post moves to its runner-up or re-crops into
  tiles – never the stronger one.
- Mixed shapes (wide / natural / tall / tiled) are a feature of the feed, not
  a defect. Do not force uniformity back in.

Read-next rows inherit the card face, and same-series posts are excluded
there, so a feed that passes this check keeps read-next clean for free.

## 6. Share surfaces – the Zalo gate

`og:image` (and the article schema image) is the **card face** – `thumb`
first, then `image` – because a link shared on Zalo or Facebook does the
card's job in someone else's feed. One gate, automatic in `head.html`: the
large link card needs ≥600px width, so when the card face is smaller and the
post has a hero that clears the bar, the share uses the hero instead. A small
face with no alternative ships anyway and renders as the small side-thumb
card – accepted (owner, 2026-07-29).

The hub's LCP preload and the Blog schema follow the card face too; the
article page's own LCP preload follows the hero only (a thumb-only post
renders no image up top).

## 7. Video – rules ready before the first video ships

Future posts will mix illustrative images with short demonstration clips
(owner's heads-up, 2026-07-29). The system stays photo-shaped:

- **A video never fronts a card as a video.** Its chosen **poster** does – a
  real JPEG in the image library with slug, `w`/`h`, `fx`/`fy`, `alt`,
  registered like any photo. Cards, tiles, og, sitemap and read-next then
  treat it identically; nothing downstream knows videos exist.
- **Choose the poster like TikTok chooses covers**: planned while shooting,
  never frame 1. Score it with §2 plus the video-specific losers from the
  Yahoo thumbnail research – motion blur, transition frames, dark frames are
  out; sharp, textured frames win. Hands on the machine beat the machine
  idle. Text on a poster: under 4 words or none.
- **A vertical demo clip** (9:16 phone footage) posters as a 4:5 crop of its
  key moment, never a letterboxed strip.
- **In the article**: a future `figure-video.html` include –
  `<video controls preload="none" poster="…">`, sized like a figure. Never
  autoplay: this is a reading page (philosophy §2.6, Absolute Neutrality),
  and readers are on factory Wi-Fi or mobile data.
- A card whose post is *primarily* a video may carry a small play badge on
  the face (planned with the include, not before).

## 8. Asset standards – so post 1000 is as easy as post 15

- Master ≥1200px wide whenever the source allows – it clears the og large
  card, the 2× reading column, and every crop this file can ask for.
  Derivatives per 02 §2b (cap 1344, `sm` 672 sibling when over 800).
- Filename = the picture described in ASCII Vietnamese
  (`cua-do-aperture-may-quang-pho`), never `IMG_2027`.
- Register once in `_data/chia_se_kinh_nghiem.yml`; posts and tiles only ever
  name slugs. `fx`/`fy` from `image-focus.mjs`; `--previews` before
  committing a clamp you have not seen.
- When shooting for a post, shoot the *cover* deliberately (the Shorts
  lesson): one frame with a single salient subject, made for 624px.

## 9. Worked verdicts – the 14 live posts (2026-07-29 pass)

The stress-test record; also the example bank. "Keep" means the previous
choice already won the scoring.

| Post | Cover | Verdict and why |
|---|---|---|
| OEE của nhà máy nhuộm (p1) | `oee-…-60-phan-tram` | Keep single. The equation poster is the promise; headline legible at 624px. |
| Làm sao để đo OEE (p2) | **3 tiles**: poster + 2 infographics | Was the `cho-may` cartoon = part 3's face, identical card twice in feed (§5 violation) and off-promise (R low). The umbrella post over A×P×Q gets the §4 3-tile: summary wide, two instruments below. Hero unchanged (article page keeps the cartoon at top). |
| Kẻ trộm thời gian (p3) | `cho-may-…` | Keep single. Face + emotion + speech bubble = the library's highest A score, and the cartoon *is* this post's story (waiting for warm-up). |
| Số hóa thất thoát (p4) | `so-hoa-thoi-gian-…` | Keep single tall. 4:5 clamp keeps the headline (fy 13); portrait owns the phone screen. |
| Số hóa hiệu suất (p5) | `so-hoa-hieu-suat-…` | Keep single tall. Same reasoning as p4. |
| RFT | `rft-nhuom-dat-tu-lan-dau` | Keep single. Two faces, applause, a scoreboard with numbers – the model YouTube thumbnail. |
| Ánh sáng và nguồn sáng chuẩn | `pho-anh-sang-…` | Keep single wide-clamp, **fx 90 → 50** (§3 override): the spectrum is a symmetric continuum; saliency chased the red end and cut violet off. The CIE table stays body-only (G2). |
| Nguyên lý máy đo màu | **2 tiles**: `so-do-nguyen-ly-…` + `bo-kit-munsell-…` | Was the Munsell kit alone – colourful (A high) but off-promise (R low: it shows what the machine *replaces*). The machine-with-light-path picture wins R and S; the kit stays as the right cell because the pair *is* the post's argument: subjective eye test vs objective machine. Owner's instinct, confirmed by scoring. Hero unchanged (the prose says "bộ kit Munsell ở đầu bài"). |
| Các giá trị L\*a\*b\* | `cong-thuc-delta-e-…` | Keep single, natural 1.83:1. Text-forward but the post promises formulas; headline + colour accents carry it (R 10 outweighs A mid). |
| Hiệu chuẩn máy đo màu | `cua-do-aperture-…` | Keep single wide-clamp. Real metal aperture plates – tactile, on-promise. The XP calibration dialog fails G2 forever. |
| Lỗi bạc màu màu đen | `nhuom-phan-tan-…` | Keep single, natural. Question headline + lab-vs-machine two-panel: a §4 pair already composed *inside* one image – never re-tile what the artist tiled. |
| Chất đều màu | **2 tiles**: leveling + retarding | Keep (2026-07-29 build). The promise is two lab tests; two report cards say so before the title. |
| Sợi spandex (s1) | `cau-truc-phan-tu-…` | Keep single wide-clamp; fx 38 keeps the three labelled states. |
| Quy trình spandex (s2) | `may-pha-gay-…` (400px) | Keep single natural. Under §1 G3 the 400px face upscales ~1.5× as a single – accepted by owner call; the day a second on-promise photo exists, this becomes a 2-up and both cells go native-res. |

Titles and descriptions were audited against the complementary rule (§2) in
the same pass and left unchanged: they already carry the numbers, questions
and stakes the research asks for, and they never caption the cover's own
words.
