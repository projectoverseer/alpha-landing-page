# Chia sẻ kinh nghiệm — Element specification

**Written for the 2026-07-15 overhaul.** For every element on the hub this
document answers, in order: which face it is set in (and why, when the answer
is not obvious), its full style (size, weight, color, casing, tracking,
interaction), where it sits and why, and what its words are. The philosophy
(`01-philosophy.md`) says why the hub is shaped the way it is; this file says
what every piece of it *is*. When the two disagree, fix the disagreement in
the same commit.

Purpose being served on every line: **make knowledge attractive; make learning
and sharing the easy next step.** Audience: anyone who aspires to build a
highly-efficient textile factory — the seasoned Vietnamese dyehouse director
first, but nothing on the page assumes you already run one.

---

## 0. The style vocabulary

The styles teach the reader a small language. Each pattern means one thing,
everywhere, so that by the second page the reader no longer thinks about the
interface at all (Absolute Neutrality, philosophy §2).

| Pattern | Recipe | Meaning it teaches |
|---|---|---|
| **Indigo text** | `--indigo`, hover `--indigo-deep` | "You can act on this." The only action color. Never decorative. |
| **Quiet link** | inherits its line's grey; hover: `--ink` + underline (`text-underline-offset: 0.2em`) | "This labels the thing it sits under first, and offers a route second." Topic tags, series lines, the kicker, byline/signature author, the brand name. |
| **Card** | 1px `--line` border, 0.5rem radius (re-cut by squircle.js), flat, no shadow; hover: border warms to `--indigo`, title underlines | "This whole surface is one destination." Series prev/next, series rail cards. |
| **Button** | `.kt-button`: indigo fill, paper text, Inter 600 15px; `:active` scale 0.98. `.kt-button-quiet`: transparent, hairline inset, indigo text | Filled = the primary action of its row; quiet = a peer action. |
| **Metadata line** | Inter 400, 13–14px, `--ink-3`, +0.01em residual tracking | "Facts about the thing above, not the thing itself." |
| **Kicker / tag caps** | Inter 650, 13–13.5px, uppercase, +0.08em | "A label naming a category." |
| **Seam** | 1px `--line` top border + 2rem top padding | "The piece has ended; what follows is offered, not part of it." Signature, Đọc tiếp, series rail. |
| **Editorial aside** | Literata italic, `--ink-2` | "The author speaking to you directly, outside the lesson." Inline CTA, share lead. |
| **Answering motion** | 0.2–0.3s `--ease-glide`, only ever on hover/press/gesture | "The page felt your hand." Nothing moves on its own; reduced-motion switches gestures off entirely, not just their easing. |

**Face assignment rule (the first question, answered once):** everything a
reader *reads* — titles, descriptions, body, standfirsts, asides, card titles
and descs — is **Literata**, always through `read()`/`opsz()` so every size
gets the drawing it was cut for (§4 of the philosophy). Everything that is
*apparatus* — metadata, labels, buttons, captions, tables, footer — is
**Inter**, pinned at opsz 14. **Inter Display is not used**: it is the cut for
large sizes and the hub has no large chrome; every large piece of type is
reading matter and therefore Literata (philosophy §2.3, decision documented
2026-07-15). Two documented exceptions, both deliberate:

1. **The lockup word "Chia sẻ kinh nghiệm"** — Literata 700 though it is
   chrome, because it is *artwork*, half of a sub-brand mark, not a piece of
   UI text (philosophy §5).
2. **Alpha Math** — not a voice at all; it draws only the radicals, stretched
   brackets and operators no reading face can (philosophy §4).

---

## 1. Every page: the frame

### Title bar (`.kt-topbar`)

- **What**: sticky, paper ground, hairline bottom border, one object inside:
  the lockup — Alpha logo (link → main site, same tab) · hairline separator ·
  "Chia sẻ kinh nghiệm" (link → hub root).
- **Faces/styles**: full geometry, fixed-point opsz solution, weight and
  color rationale in philosophy §5 and `_theme.scss`. Logo: no hover state
  ever (a mark is identity, not affordance). Word: ink, underline on hover
  (quiet link — it is also a destination).
- **Scroll title**: collection pages only (chủ đề / series / tác giả). The
  word crossfades (0.12s fade, 0.35em rise, plain `ease`) into the page's h1
  once the real h1 has scrolled under the bar; the title is a link back to
  the top of its collection. Articles and the hub never get one.
- **Position**: the only chrome above the content, on every page. Nothing
  else may enter this bar.

### Skip link, focus, selection

- Skip link first in DOM, off-screen until focused. Focus ring: 2px
  `--indigo`, offset 2px, everywhere (paper-colored on the lightbox's dark
  ground). Selection: indigo at 18%.

### Contact strip (`.kt-cta-banner`)

- **What/where**: site-level, after the content of every page, before the
  footer — always after the page has given value, never before.
- **Style**: `--paper-deep` band (the one permitted separated surface),
  lead sentence Literata `read(18)`/1.65, then one filled button (call) and
  two quiet ones (email, Facebook).
- **Wording**: "Bạn muốn trao đổi về vận hành hay chuyển đổi số xưởng nhuộm
  của mình? Gọi thẳng cho tác giả – tư vấn miễn phí." Personal ("gọi thẳng
  cho tác giả"), free, zero pressure — the brand is a person, not a funnel.

### Footer (`.kt-footer`)

- Inter 13.5px `--ink-3` on `--paper-deep`: legal name, main-site link,
  copyright. Apparatus, smallest voice on the page.

---

## 2. The hub (`/chia-se-kinh-nghiem/`)

Document order: title bar → h1 → feed → drip status → **series rail** →
contact strip → footer. No masthead, no mission paragraph — the newest post
is the first thing on the page (protected, philosophy §8).

| Element | Face & style | Why / wording |
|---|---|---|
| h1 "Bài viết mới nhất" | Literata `read(34)` (28 mobile) 620 | A plain honest label for the list; the lockup already names the place. |
| Feed item title | Literata `read(21)` (19) 600, **indigo**, underline on hover | The title is the invitation; indigo says "readable now". Wording: the article's own title, sentence case always. |
| Feed thumbnail | 16:9 crop, top-anchored, hairline frame, `--paper-deep` while decoding; hover: 2% lean-in, 0.3s glide | Crop keeps the feed scannable; top anchor keeps the infographic's headline. 2% is the owner-tuned answer to the pointer. |
| Feed description | Literata `read(16)` /1.65 `--ink-2` | Reading matter — it is the article's first sentence in spirit. |
| Feed meta line | Inter 13.5px `--ink-3`; topic tag in caps 650/+0.08em as quiet link; date `<time>`; "n phút đọc"; "Series <tên>" quiet link when applicable | Outside the card link (links don't nest — and the split is right: card = "read this", tag = "more like this"). Reading time on every entry: an honest price tag lowers the cost of starting. |
| Drip status | Inter 14px `--ink-3`, JS-only | "Đang tải thêm bài cũ hơn…" — visible only while the drip runs; with JS off every post is simply present. |
| **Series rail** (new) | Seam; h2 "Đọc theo chuyên đề" Literata `read(21)` 620; lead Literata `read(16)` `--ink-2`; cards per §0 (title `read(18)`/17 620 indigo, desc `read(16)` `--ink-2`, meta Inter 13px `--ink-3`) | At the **end** of the feed: the hub still opens on content, and the reader who ran out of archive is handed a syllabus instead of a dead end. Lead wording: "Các loạt bài viết theo trình tự, từ khái niệm đến cách làm – đọc lần lượt từ bài đầu tiên." Meta wording: "n bài · khoảng m phút đọc". |

## 3. Topic page (`/chu-de/<key>/`)

Title bar (with scroll title) → h1 "Chủ đề: <label>" → **standfirst** (the
topic's `desc` from the data file — single source of truth with the meta
description; rendered since 2026-07-15) → feed (no drip, no part numbers) →
strip → footer. The head prefix "Chủ đề:" stays inside the h1: the label is
what the page is, the prefix is what kind of page it is.

## 4. Series page (`/series/<key>/`)

The learning path's sales page (overhaul, 2026-07-15):

1. h1 "Series: <label>".
2. **Standfirst** — the series `desc`: what you will be able to do.
3. **Commitment line** (`.kt-collection-meta`, Inter 14px `--ink-3`):
   "n bài · khoảng m phút đọc · đọc theo thứ tự từ bài 1". A finishable
   course is an attractive one; this is its price tag, and a price tag is
   quiet. Total = sum of per-post ceil-ed minutes, matching every other
   reading time on the hub.
4. Feed in **reading order**, each meta line led by "Phần n" (plain text,
   Inter, same grey). The "bài n/N" ban holds on articles and the hub feed;
   the series page *is* the syllabus, so here the order is the point.

## 5. Author page (`/tac-gia/<slug>/`)

h1 "Tác giả: <name>" → intro card (96px circular portrait — 72px mobile —
beside bio, Literata `read(17)`/1.6 `--ink-2`) → feed of their posts. The bio
wording leads with the years on the floor ("13 năm làm kỹ thuật viên nhuộm và
15 năm làm giám đốc nhà máy"), because lived experience is the hub's whole
authority.

## 6. Article (`/<slug>/`)

Order and rationale (philosophy §5): kicker → h1 → byline → series line →
standfirst → lead figure → body → signature → **share block** → series
prev/next → Đọc tiếp → contact strip → footer.

| Element | Face & style | Why / wording |
|---|---|---|
| Kicker | Inter 13px 650 caps +0.08em `--ink-3`, quiet link → topic page | Names the shelf before the book. |
| h1 | Literata `read(34)`/(28) 620 /1.25, sentence case | Facebook ALL-CAPS is always converted. |
| Byline | 40px avatar + name (quiet link → author page, name-only underline) · date · "n phút đọc"; Inter 14px `--ink-3` | The line that says "you are reading an article"; met before the prose. |
| **Series line** (new) | `.kt-series-line`, Inter 14px `--ink-3`, series name quiet link | "Bài viết trong series <tên>" — the path reveals itself at the top, not in the footer. No part number. |
| Standfirst | Literata `read(20)`/(18) /1.6 `--ink-2` | The description, promising the piece. |
| Lead figure | Full measure, hairline frame, caption Inter 14px `--ink-3`; tappable → lightbox (cursor zoom-in, frame warms, press registers 0.995) | Closes the title block. Figures are lessons, never decoration. |
| Body | Literata `read(19)`/(17), 1.75/1.7; h2 `read(21)` 620, h3 `read(19)` 700; links underlined, indigo | The interface (§2.1). |
| Blockquote / display equation | `--paper-deep` slab, 3px `--line` left edge | Vietnamese rules of thumb stay prose; real equations are build-time MathML — letters Literata, machinery Alpha Math, variables upright (§4). One kind of object to the scanning eye. |
| Tables | Inter 15px, hairline grid, `--paper-deep` header, scrolls inside the column | Data is apparatus. |
| Mid-article CTA | ≤ 1 per post, editorial register only (§6) | Never inside a numbered sequence. |
| Signature | Seam; 48px avatar + name Literata `read(17)` 620 + role Inter 14px, all one quiet link; canonical line Inter 13.5px | Mandatory — it is the watermark for scraped copies. Copyright is Alpha's, never the author's. |
| **Share block** (new) | Lead: Literata `read(17)`/(16) *italic* `--ink-2` — the editorial-aside register. Actions: two `.kt-button-quiet` — "Chia sẻ lên Facebook" (sharer URL, no SDK) and "Sao chép liên kết" (`<button>`, ships `hidden`, revealed by inline script only where the Clipboard API works; label swaps to "Đã sao chép liên kết" for 2s as the whole confirmation) | Lead wording: "Nếu bài viết hữu ích, hãy chia sẻ cho đồng nghiệp của bạn." — a small favor asked by the author, conditional on the article having earned it. Copy-link is the Zalo path: links here travel pasted into Zalo chats, and a real Zalo button demands an SDK the script budget does not owe it. No icon row, no counts, nothing floats. Placed straight after the signature: the reader who finished knows whether it was worth a colleague's time, and passing it on outranks the next click — so it precedes series nav and Đọc tiếp. |
| Series prev/next | Cards per §0; direction label Inter 13px, title Literata `read(16)` 600 indigo, "Series <tên>" quiet link | Continuity offered, never a syllabus imposed. |
| Đọc tiếp | Seam; h2 Literata `read(21)` 620; rows: 8.5rem (6.5) 16:10 thumb + title Literata `read(17)`/(16) 600 indigo + meta Inter 13px | Same topic first, own series excluded; reading time on every row. Plain HTML. |

---

## 7. Decisions of the 2026-07-15 overhaul (with their reasons)

1. **URL structure stays.** `/chia-se-kinh-nghiem/<slug>/`, `/chu-de/`,
   `/series/`, `/tac-gia/` are live, indexed, canonical, and embedded in
   every signature's copy-trap line. Reshuffling them buys nothing a reader
   can feel and burns everything a crawler has learned. Considered, rejected.
2. **The hub stays a feed.** Feed-first is protected (§8) and right: the
   returning reader — the hub's success metric — lands on what is new.
   Structure (topics, series, author) hangs off the feed's own metadata lines
   plus the new end-of-feed rail, never off a masthead.
3. **Inter Display: no.** Documented in §0 and philosophy §2.3.
4. **Sharing = Facebook + copy link, article-end only.** Documented in §6's
   table. The one new interactive element of the overhaul.
5. **Series are the learning product.** Everything new points at them:
   the article-head series line, the series page's standfirst + commitment
   line + "Phần n", the hub rail. A topic is a shelf; a series is a course;
   the course is what "encourage learning" cashes out to.
6. **No gamification.** No streaks, no progress bars, no badges: the
   incentive to learn is that the next piece is genuinely useful, easy to
   start (reading time everywhere), and ordered (series). Anything louder
   fails Absolute Neutrality and the audience's tolerance for being played.
