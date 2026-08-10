# Performance audits

Lighthouse / performance reports for **www.alphasoftwaregroup.com**, kept for
reference and trend tracking. This folder is excluded from the Jekyll build
(see `_config.yml`), so nothing here is published to the live site.

## Naming convention

```text
YYYY-MM-DD-<formFactor>-<tool>.json
```

e.g. `2026-06-30-mobile-lighthouse.json`.

## Reports

| Date       | Tool       | Form factor | Perf | A11y | Best-Pr | SEO  | Notes |
|------------|------------|-------------|------|------|---------|------|-------|
| 2026-06-30 | Lighthouse | mobile      | 0.82 | 1.00 | 0.81    | 1.00 | early localhost run |
| 2026-06-30 | Lighthouse | desktop     | 0.91 | 1.00 | 0.81    | 1.00 | **production**, pre-Cloudflare-fix |
| 2026-06-30 | Lighthouse | mobile      | 0.70 | 1.00 | 0.81    | 1.00 | **production**, pre-Cloudflare-fix (laptop in Battery Saver; benchmarkIndex ~310) |
| 2026-06-30 | Lighthouse | mobile      | 0.87 | 1.00 | 0.96    | 1.00 | **production**, post-deploy (slim bundle + self-hosted fonts live; TBT 320 ms, mostly gtag) |
| 2026-06-30 | Lighthouse | desktop     | 0.96 | 1.00 | 0.96    | 1.00 | **production**, post-deploy (TBT 0, CLS 0) |

SEO and Accessibility are already 1.00 in production. The 0.81 Best-Practices and
a large share of mobile TBT (2117 ms) were **Cloudflare-injected**, not repo bugs
— addressed below.

---

## 2026-06-30 — Cloudflare zone changes APPLIED via API

Done directly against the zone (`5283fd5d397bbf659f925027d6fdc981`) with the
owner's authorization. Re-verified against the live site afterwards.

| Change | From → To | Why |
|---|---|---|
| **Bot Fight Mode / JS Detections** (owner did this in `/bot_management`) | on → **off** | Removes `cdn-cgi/challenge-platform/.../main.js`. That script's 3 "deprecated API" warnings were the **only** thing holding Best-Practices at 0.81 → expect **1.00**. Also ~450–1000 ms of mobile TBT gone. |
| **Web Analytics beacon** (`rum/site_info` `auto_install`) | true → **false** | Drops `static.cloudflareinsights.com/beacon.min.js` (GA4 already covers analytics). |
| **Email Address Obfuscation** (`email_obfuscation`) | on → **off** | Drops the extra `email-decode.min.js` request. |
| **Static-asset cache rule** (cache ruleset, by extension) | browser 16h / edge 31d → **browser 1yr / edge 1yr** | css/js are content-hashed (`bundle.460d79283a.js`) → immutable. Fixes the "efficient cache lifetimes" finding. Verified live: `Cache-Control: max-age=31536000`. |
| **HTML cache rule** ("Cache Everything") | browser 4h / edge **31d** → **browser 1h / edge 4h** | 31-day edge TTL froze deploys unless purged. Now bounded to 4h even if a purge is missed. Verified live: `max-age=3600`. |
| **Security Level** (`security_level`) | high → **medium** | "high" challenges legit global visitors (shared-NAT mobile carriers, VPNs). Inconsistent with bot-fight being off. Medium is the balanced default. DDoS + free managed WAF + custom firewall rules all remain. |
| **Hotlink Protection** (`hotlink_protection`) | on → **off** | Can block the OG image in social/chat link unfurls — bad for a share-focused marketing page. |
| **Purge Everything** | — | Applied so all of the above took effect immediately. |

### 2026-06-30 (later) — killed the RUM beacon for Best-Practices 1.00

`auto_install:false` stopped the *external* `beacon.min.js`, but the Web Analytics
**ruleset was still `enabled:true`** and edge-injected a *same-origin* RUM snippet
that POSTed to `/cdn-cgi/rum`. The custom firewall (blocks non-GET/HEAD) rejected
that POST with **403** — the lone `errors-in-console` audit holding Best-Practices
at 0.96. Fix: **paused the ruleset's catch-all injection rule** (ruleset
`e17475a7-82b9-415b-9cee-2e798df88f78`, rule `4b6ea90e…`, `is_paused:true`) via
API, then Purge Everything. Verified live: `cdn-cgi/rum`, `cloudflareinsights`,
`beacon` all **0** in HTML; HTTP 200. Reversible (un-pause) — site_info + history
kept. **Expect Best-Practices 1.00** next audit. *Note: this means there is no
cookieless RUM running; analytics is GA4 + Cloudflare server-side traffic only.*

Verified live after purge: `challenge-platform`, `cloudflareinsights`,
`email-decode` all return **0** occurrences in the HTML; assets serve
`max-age=31536000`; security headers (HSTS, X-Frame-Options, nosniff,
Referrer-Policy, Permissions-Policy) intact; HTTP 200, page content intact.

### Already optimal (left as-is)

SSL **Full (strict)** + active cert, **HSTS** (180d, includeSubDomains, preload,
nosniff), **Rocket Loader off** (correct — would break the ordered script bundle),
Brotli on, HTTP/3 on, Early Hints on, 0-RTT on, TLS 1.3 on, min TLS 1.2,
post-quantum keyex on, Always Use HTTPS on, Tiered Cache on, apex→www 301,
custom firewall (bad bots/paths/non-GET-HEAD blocked), response security headers.

### Plan limits (Free zone — cannot enable)

Polish, Mirage, Image Resizing, and Speed prefetch/preload are `editable:false`.

---

## 2026-07-02 — Cloudflare zone changes APPLIED via API (capacity + security pass)

Applied against the zone with the owner's authorization; all verified live.

| Change | Detail | Why |
|---|---|---|
| **Query-string strip redirect** (dynamic redirect ruleset, new rule) | `www` + non-empty query → 301 to the bare path | The site uses zero query params (its own JS strips them), but every `?fbclid=`/`?utm_=` from a social share is a distinct cache key that misses the edge and hits GitHub Pages. Under a viral share that meant one origin hit per click; now such traffic is 100% edge-served. Trade-off: URL-based ad/campaign attribution params are dropped at the edge (they were already dropped client-side by `cleanUrl()`). |
| **Rate limit scoped to pages** (`http_ratelimit` rule) | Expression now excludes static-asset extensions; still 50 req/10 s per IP+colo, 10 s block | Previously *every* request counted — one page load ≈ 20+ requests, so two quick loads (or an office/carrier NAT, common in VN) could block real visitors. Now only page/HTML requests count. |
| **Content-Security-Policy added** (response-header transform rule) | `default-src 'self'`; script `self + unsafe-inline + googletagmanager`; connect/img cover GA4 endpoints; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'` | The one materially missing security header. `unsafe-inline` is required by the inline consent-mode bootstrap + `onclick` copy handlers. `squircle.js` verified worklet/blob-free before writing the policy. |
| **X-XSS-Protection → `0`** (same transform rule) | was `1; mode=block` | Header is deprecated; the legacy filter it enables can *introduce* XSS in old browsers. `0` is the OWASP-recommended value. |
| **HSTS max-age 15552000 → 31536000** | keeps includeSubDomains + preload + nosniff | 180 d is below the hstspreload.org minimum (1 y) even though the `preload` flag was already being sent. Now eligible for actual preload-list submission. |

Left deliberately as-is: HTML edge TTL 4 h (raising it adds staleness risk if a
purge is missed, while a traffic spike inside any window is edge-served either
way); Bot Fight Mode off (would risk challenging Zalo/messenger link-preview
fetchers — critical for VN social sharing); min TLS 1.2 (older Android still
common locally); `security_level` medium.

⚠️ The owner's **global API key** was used in-session for these changes — it
should be **rotated**, and future automation should use scoped tokens (like the
existing cache-purge token).

---

## Repo-side fixes already applied (earlier on 2026-06-30)

1. **Render-blocking Google Fonts CSS** → loaded off the critical path via
   `media="print" onload="this.media='all'"` + `<noscript>`. — `_includes/meta-assets.html`
2. **gtag.js inflating TBT** → library loads after `load` on an idle slot; the
   Consent Mode + `config` commands stay inline and queue in `dataLayer`. — `_includes/page.html`

---

## 2026-06-30 — second pass: levers APPLIED in the repo build

All four low-risk levers below are done and verified through `npm run ship`.
They need a **deploy (commit + push `docs/`)** to go live, then a re-audit.

1. **Slim Bootstrap bundle** — `optimize-js.mjs` now esbuild-bundles only the
   three plugins actually used (Collapse, Dropdown +Popper, ScrollSpy) straight
   from the npm package instead of shipping the full 88 KB UMD bundle. Result:
   `bundle.js` **~95 KB → 56.6 KB**. `bootstrap@5.3.8` + `@popperjs/core` added as
   devDeps (matches the vendored SCSS version). Dev path still uses the full
   vendored bundle. Each `dist/*` import keeps its data-API, so the markup-driven
   accordion / dropdown / scrollspy still self-init — **retest those four after deploy**.
2. **Self-hosted Public Sans** — `_sass/_fonts.scss` ships the exact Google subset
   files (latin / latin-ext / **vietnamese**, roman + italic; 6 variable-weight
   woff2 in `fonts/public-sans/`) as `@font-face` in `main.css`. Removed both
   `fonts.googleapis`/`fonts.gstatic` preconnects + the font stylesheet from
   `meta-assets.html`; added per-locale `<link rel=preload>` (latin everywhere,
   vietnamese on vi pages). Kills two third-party connections + the GDPR IP-leak
   (consistent with the regional Consent Mode posture). woff2 is in the 1-yr
   immutable cache rule; the deploy purge keeps it fresh.
3. **Narrowed squircle sweep** — `js/squircle.js` now skips `<head>` and
   never-rounded tags (`script`/`style`/`noscript`/`template`/`br`/`wbr`) before
   the `getComputedStyle` read. **Every rendered element is still measured, so the
   φ (`phi^3`) corner shape is applied exactly as before** — this only removes
   pointless reads, it does not curate which elements get squircled.
4. **Auto-purge on deploy** — `.github/workflows/cloudflare-cache-purge.yml` purges
   the zone when a `github-pages` deployment succeeds (and on manual dispatch). A
   **scoped** `Zone.Cache Purge`-only token was minted via API (id
   `7e008b91911611b309aec3f6511f8edf`) and verified end-to-end. **External step:**
   add it as repo secret `CF_CACHE_PURGE_TOKEN`. *Never the global key.*

### Still open — one item, deliberately NOT done blind

- **Move GA4 to Cloudflare Zaraz** — still the biggest single mobile-TBT lever in
  theory, but **not shipped**. Zaraz currently has `tools: []` and consent
  management disabled, while `page.html` runs an advanced, **legally-reviewed**
  regional Consent Mode v2 (denied in EU/UK/CH/CA/KR + 8 US states). Migrating GA4
  to Zaraz without faithfully replicating that regional gating risks sending
  analytics/ads data from gated regions — a privacy/legal regression that cannot
  be verified without a live deploy + network inspection. gtag is also already
  idle-deferred, which shrinks the upside. **Do this only in a controlled,
  verifiable pass**, not blind.

Realistic ceiling after deploy: Best-Practices **1.00**, desktop Perf **~0.98–1.0**,
mobile Perf **~0.90–0.94**. Re-run audits **plugged in** (not Battery Saver).

---

## 2026-08-10 — full performance + SEO audit of all 27 indexable pages

Measured in real Chrome over CDP under Lighthouse-like mobile throttling
(412×915 @2.625dppx, 1.6 Mbps / 150 ms RTT, 4× CPU), against the **live** site.
Not inferred from source.

### What the measurement actually said

| | homepage `/` | hub `/chia-se-kinh-nghiem/` |
|---|---|---|
| Transferred | 434 KB, 19 req | 532 KB, 15 req |
| CLS | **0.000** | **0.000** |
| LCP element | `P.big` — **text** | the card AVIF |
| gtag.js | 168 KB (**39%** of the page) | 168 KB (32%) |
| Fonts | 123 KB | **227 KB** |
| Everything else first-party | 80 KB | ~53 KB |

Two things fell out of the waterfall that source reading had not shown.

**1. The homepage's LCP is the hero PARAGRAPH, not the hero photograph.** FCP and
LCP land on the same millisecond, which is the signature of a text LCP. The photo
is a CSS `background-image` on a viewport-filling header and Chrome does not
report it as the candidate. `meta-assets.html` had asserted the opposite in a
comment since the preload was added, so the reasoning downstream of it — that
this image is what to protect — was aimed at the wrong element. The comment is
corrected in place. The preload itself is **kept at `fetchpriority="high"`
deliberately**: demoting it puts a 31 KB photograph behind 123 KB of font on a
~200 KB/s pipe, which improves the metric and makes the first screen worse.

**2. On the hub, 227 KB of font was tied with the 31 KB LCP image.** All four
`rel=preload as=font` tags default to High priority and were issued within 5 ms
of the image, at +233 ms. The image cannot win a race it is tied in.

**Fixed:** the four hub font preloads now carry `fetchpriority="low"`. Verified
in the browser — the image is now alone in the High band at +242 ms and all four
fonts are Low at +247–256 ms. `fetchpriority` rather than deleting the tags,
because a preload buys early discovery *and* high priority and only the second
was the problem; deleting them would delay the swap and risk a byline reflow on
pages that measure CLS 0.000 today.

### The two remaining levers, both owner decisions

- **The `opsz` axis costs 42.8 KB of the homepage's critical path.** Measured with
  fontTools by pinning `opsz` at its Text default and re-compressing: `inter-latin`
  105,872 → 68,740 bytes and `inter-vietnamese` 17,332 → 11,680 — **35% of the
  preloaded Inter payload is the optical-size axis**. `inter-latin.woff2` alone
  (105 KB) outweighs the homepage's HTML + CSS + JS + hero combined (80 KB). The
  axis is a deliberate choice with a written rationale (`_sass/_fonts.scss`) and
  is **not** changed here; this is the price tag for that choice, now known.
- **gtag.js is 39% of the homepage.** Already idle-deferred and cannot be shrunk
  without dropping GA4. See the standing Zaraz note above — same conclusion.

Beyond those, there is very little headroom left: CLS is 0 on every page, the
hub ships zero first-party JS, assets are content-hashed and immutably cached,
images are AVIF with JPEG fallback and correct `srcset`/`sizes`, and HTML is
8–13 KB over the wire.

### SEO — what was wrong, and what changed

| | before | after |
|---|---|---|
| Titles over the ~60-char SERP budget | 12 of 27 | **5** (all long headlines — editorial) |
| Descriptions over ~160 chars | 15 of 27 | **0** |
| Distinct hub URLs linked from the homepage | **1** | **7** |
| JSON-LD types on the homepage | 3 | 5 |

- **Titles.** The `· Chia sẻ kinh nghiệm Alpha` suffix was 28 characters of a
  pixel budget that gets cut from the END — so on a long piece the reader lost
  the headline to keep a brand tag that was never at risk. Articles now carry
  the bare title; Google supplies the site name from the homepage `WebSite`
  schema. Collection pages keep a short ` · Chia sẻ kinh nghiệm`.
- **Descriptions.** `description` doubles as the on-page standfirst, so trimming
  it would have shortened visible prose. Instead an optional `meta_desc` was
  added (post front matter + taxonomy sibling key) used **only** for the meta
  and og/twitter tags. **No visible copy changed on any page.**
- **The reading hub had one entrance from the homepage on a phone.** The navbar
  link lives in `.navbar-collapse`, `display: none` under lg with no toggler, so
  for four readers in five it does not exist; the footer link was the whole
  route. `_includes/knowledge.html` now closes the page with the three topic
  pages and the three newest articles by name. The footer's duplicate block was
  removed with it.
- **`meta name="keywords"` removed** (ignored since 2009; published our targeting
  to competitors). `robots` now carries `max-image-preview:large, max-snippet:-1`
  — the hub already had these; the pages that have to sell did not.
- **Products declared as products.** `SoftwareApplication` (Smart Dyehouse) and
  `Product` (Dyes Weighing), plus `contactPoint` on the Organization. No `offers`
  and no ratings attached — see below.

### Known and deliberately not fixed

- **The customer reviews earn no rich result and cannot.** `AggregateRating` and
  `Review` hang off the `Organization`, and Google's policy excludes reviews
  about the publishing entity. The workaround — reattaching them to the
  `SoftwareApplication` — was **refused**: the reviewers are describing working
  with Alpha, not rating a SKU. The honest route to stars is third-party.
- **`Organization` has no `address`.** No postal address exists anywhere in the
  repo and one must not be invented. Real gap; owner has the data.
- **The hub's `h1` is "Bài viết mới nhất"** on the page best placed to rank for
  "chia sẻ kinh nghiệm … dệt nhuộm". Left alone — it is a recorded owner call
  (2026-07-15). Worth revisiting knowingly.
- **Three article titles still exceed the budget** (82, 69, 64 chars). Editorial.
- **No FAQ content or `FAQPage` anywhere**, and no `llms.txt`. Both are options,
  neither is shipped unasked.

---

## 2026-08-10 (same day, second pass) — owner corrections and a heading rewrite

Six things the owner supplied or asked for after reading the audit above. Two
of them reverse conclusions it reached, which is recorded here rather than
quietly edited out.

### 1. The reviews DO belong to a product — reversed

The audit concluded the customer reviews were about the company, and therefore
permanently ineligible for a review rich result under Google's self-serving
policy. **They are about Alpha Smart Dyehouse** (owner), and the text bears it
out: Spectro machines, dispensers, dye-machine controllers, the QR flow, RFT
80% → 90%. Those are one product's features and one product's outcome.

So `AggregateRating` and both `Review`s moved off the `Organization` and onto
the `SoftwareApplication`, as JSON-LD, where first-party reviews are eligible.
The microdata came out of `reviews.html` entirely rather than being left to
name a second owner for the same reviews — including `reviewBody`, `author`,
`jobTitle`, `worksFor` and the portraits' `image`, which with the `Review`
scope gone would have attached to the `<html>` element's `Organization` and
asserted `Organization.image` = a photograph of a customer.

The bodies are quoted from the same `t.review_*_body` strings the page prints,
through `strip_html`, so the structured data cannot drift from the visible
words. **Google requires reviewed content to be visible: if the reviews section
is ever removed from the page, the `review` array in `meta.html` goes too.**

### 2. Address — supplied, and in the schema only

`67/15 Đường số 3, Phường Thông Tây Hội, TPHCM`. The owner does not want it
displayed: Alpha has no premises a customer would visit, and a footer address
would advertise an office that does not exist in that sense. It is a mailing
address.

It is therefore in the `Organization` JSON-LD and on no rendered page. That is
not a leak — the same address is published against tax code 0316685078 in the
national business registry. **But JSON-LD is public and Google may surface it
in a knowledge panel**, which was flagged to the owner; it comes out in one
edit if that is unwanted.

The registry page is now also a `sameAs`, which is the strongest entity
disambiguation available to a site this size: it ties this domain to a record
naming the same founder, tax code and founding date, against a much larger
unrelated `alphasoftware.com`. `legalName` and the registry's international
name were added at the same time.

### 3. The hub's h1 — split into two jobs

Was "Bài viết mới nhất". A good label for a list and a poor h1 for the
library's highest-authority page: it names neither the subject nor the place,
and it left the hub with no prose at all — an h1, a grid of cards, a rail, and
nothing telling a cold visitor from a search result what they had found.

Both jobs are now served, which costs nothing:

- **h1** — Chia sẻ kinh nghiệm vận hành xưởng nhuộm
- **lead** — who writes it and on what authority, one line
- **h2** — Bài viết mới nhất, still directly on the list it labels
- **h2** — Đọc theo loạt bài

The 2026-07-15 instinct is kept; only its placement changed.

### 4. Thumbnails on the homepage section — yes, and the first attempt was wrong

Square, 96px, was built first and looked bad in the browser for a reason worth
recording: **the hub's illustrations are wide technical diagrams drawn on
white**, so a square crop of one is a box of whitespace with a band of content
across the middle. It announces that a picture exists without saying anything
about it.

Landscape 4:3 at 96px/128px fixed it — enough of the diagram survives to be
recognisable at that size. They also carry a 1px `$ink-100` hairline, which is
load-bearing rather than decorative: white-ground illustrations on a white page
have no edge without one and read as floating debris.

Cost is nil on the critical path. The section renders ~10,000px down a phone
page, so every thumbnail is `loading="lazy"` and outside any viewport the
browser fetches; they are the same 672px derivatives the hub's feed already
uses, so a reader continuing to the hub finds them cached.

*Harness note, because it cost time twice:* `Page.captureScreenshot` with
`captureBeyondViewport: true` lays the whole page out but never puts the lower
part IN a viewport, so lazy images below the fold are unfetched at capture time
and shoot as blank boxes — indistinguishable from a broken image. Scroll the
element through a real viewport, await `img.decode()`, then capture.

### 5. The footer is furniture and now looks like it

The grey stopped at `.footer-strip`; everything above it sat on page white, so
the contact block read as one more section of the argument. Worse once the page
gained a content section — two white blocks in a row, one content, one
furniture, nothing saying which.

The ground now covers the whole `footer` at `$ink-50`, and the copyright bar
keeps its edge with a hairline instead of a second tint. Cool, not warm.

**`verify.mjs` caught this**, correctly: the cool-surface gate was anchored on
`.footer-strip{background:…}` and the rule had moved, so the build failed with
"cannot find the footer strip". The gate was re-pointed at `footer{background:}`
— anchored on a rule boundary so `.blockquote-footer` and the hub's
`.kt-footer` cannot satisfy it by accident — and **re-proved by injecting a
warm `#f3f0e9` into the built CSS and confirming the build fails on it.**

### 6. Vietnamese headings — rewritten for register, not for keywords

The owner flagged "Áp dụng tại xưởng của bạn" as reading wrong. It does: "của
bạn" is a calque of English "your", and the possessive turns the heading into
an instruction to the reader about his own factory — the exact tone
`design/chia-se-kinh-nghiem/06` §1 says to keep out of that block.

It was rewritten to **"Mang về xưởng"**, the takeaway idiom, on the argument
that "Áp dụng" is administrative besides. **The owner overruled the second
half of that and kept "Áp dụng tại xưởng"** (working tree, same day), which
settles what was actually wrong with the line: the calque, not the verb. Only
"của bạn" had to go. Recorded here because the same instinct — treating a
plain administrative verb as a fault to be fixed — is what produced "Xem Alpha
làm được gì" below, and that one was a real mistake.

| where | was | now | why |
|---|---|---|---|
| hero CTA | Tìm hiểu thêm | Xem Alpha làm được gì | "Learn more" is the weakest CTA in existence |
| overview h2 | Giới thiệu phần mềm quản lý nhà máy thông minh của Alpha Software | Phần mềm quản lý nhà máy thông minh cho xưởng dệt nhuộm | "Giới thiệu" is a dead word; aims at the industry, not at ourselves |
| projects h2 | Các dự án của Alpha Software | Những nhà máy đã triển khai Alpha Software | it is the proof section, labelled as admin |
| our-story h2 | Về Alpha Software | Người đứng sau Alpha Software | the section is a portrait and 28 years on the floor |
| support h2 | Chúng tôi rất hân hạnh được hỗ trợ bạn! | Gọi trực tiếp cho người sáng lập | the closing ask said nothing; this is the actual differentiator |
| support body | …để cho phép chúng tôi tư vấn bạn miễn phí… | …để được tư vấn miễn phí… | "to allow us to consult you" is not how anyone speaks |
| hub rail h2 | Đọc theo chuyên đề | Đọc theo loạt bài | see below |

Kept as-is: `slogan`, `benefits_title`, `products_title`, `reviews_title` —
already natural and already carrying their keyword.

**A vocabulary collision was fixed on the way.** The hub had "chuyên đề"
labelling the SERIES rail while the topic pages call themselves "Chủ đề" — two
near-synonyms for two different taxonomies on the same surface. Now "chủ đề" =
topic and "loạt bài" = series, consistently, including on the homepage section.

### Where the numbers stand after both passes

| | before the audit | now |
|---|---|---|
| Titles over the ~60-char budget | 12 of 27 | 5 (long headlines, editorial) |
| Descriptions over ~160 | 15 of 27 | 0 |
| Distinct hub URLs linked from the homepage | 1 | 7 |
| JSON-LD types on the homepage | 3 | 5, with the reviews on the product |
| Structural defects (h1 count, canonical, heading jumps) | not measured | 0 across 28 pages |
| CLS | 0.000 | 0.000 |

### Still open

- **The hub section sits ~10,000px down the phone homepage.** Everything above
  it is unchanged and the owner's "do not interrupt the flow" condition is
  honoured, but almost nobody scrolls that far. If engagement with it is low in
  GA4, the question is placement, not the section.
- The `opsz` axis (42.8 KB) and gtag.js (39% of homepage bytes), both unchanged
  and both owner decisions — see the first pass above.
- No `address` on any rendered page, by decision. No FAQ content or `FAQPage`.

---

## 2026-08-10 (third pass) — the owner reads it back, and three of the day's own answers turn out to be wrong

Everything below started as the owner's reaction to the pass above. Three of
the changes made that morning are reversed here, which is the point of writing
these down: the register mistakes were not visible to the person who made them.

### 1. Three headings that read as boasting

| where | was | now |
|---|---|---|
| hero CTA | Xem Alpha làm được gì | **Xem Alpha giúp được gì** |
| our-story h2 | Người đứng sau Alpha Software | **Alpha Software bắt đầu từ đâu** |
| support h2 | Gọi trực tiếp cho người sáng lập | **Gọi cho chúng tôi để được tư vấn miễn phí** |
| hub CTA banner | Gọi **thẳng** cho tác giả | **Gọi cho tác giả** |

**"làm được gì" is a boast.** It is the phrasing of "watch what I can do".
"giúp được gì" is one word away and lands in the opposite register: "Tôi giúp
được gì cho anh?" is the ordinary courteous offer of service in Vietnamese. The
button offers help instead of announcing capability, and points at the same
place it always did.

**"Người đứng sau Alpha Software" is not a matter of taste, it is false.**
Alpha is a two-member company and intends to grow (owner). The plural fix
would be wrong the other way — the section carries one portrait and tells one
founding story, and inventing a second bio for a person nobody has described
to me is not an option. So the heading counts nobody: it asks where the
company came from, which is the question the body already answers ("thành lập
vào năm 2021 bởi…"), and it stays true on the day a third name is added.

> Still owner-side: the section is one portrait and one founder's biography.
> If the second member should appear, that needs their name, role and a
> portrait — it cannot be written from here.

**"Gọi trực tiếp cho người sáng lập" was meant as an offer and worked as a
barrier.** It asks the reader to disturb an important person; the owner's read
was that a reader would hesitate rather than dial. The heading now says what
the call costs, which is nothing, and the reassurance moved into the sentence
below with its polarity flipped: not "you get someone important" but "you do
not get a script" — *"Hãy gọi 0983 505 002 – người nghe máy đã 28 năm trong
nghề nhuộm, không phải nhân viên tổng đài."* Same fact, no pressure. ("câu hỏi
**của bạn**" lost its possessive in the same edit, for the reason above.)

The hub's CTA banner kept its author framing and lost only the intensifier.
The two contexts are genuinely different: on the landing page a reader has no
idea who the founder is, so naming him is a claim about rank; at the foot of an
article the reader has just spent six minutes with this person's writing, and
"the author" is simply who he would be calling.

### 2. The footer's spacing was broken by the ground it was given

The contact block carried `mt-9 mb-9`. A top margin on the first child of a box
with no padding, no border and no formatting context **collapses through that
box** — so once `footer { background }` shipped that morning, the 64px came out
as white space *above* the grey and the band began flush against the company
name. The bottom 64px did not collapse, because `.footer-strip` follows it.

Measured in Chrome rather than reasoned about, because the numbers are the
whole diagnosis:

| | before | after |
|---|---|---|
| ground above the first line (phone) | **0px** | 48px |
| ground below the last line (phone) | 64px | 48px |
| ground above / below (desktop) | 0 / 64px | 64 / 64px |

`.footer-contact` carries padding instead. Padding cannot collapse; the ground
opens and closes on the same number; and the footer's air is now stated in the
same place that owns its colour. One rung quieter than the section rhythm
around it, because furniture should breathe a little less than content.

### 3. Names do not break in half

"Ông Phan / Đức Tuấn Anh" (owner) — and the hub's byline had drawn the same
complaint on 2026-07-29, which should have generalised the rule then. A
personal name is one object: it may move to the next line whole, it may not be
cut. `.name` (main site) and `.kt-nobr` (hub) are `white-space: nowrap`, on
every rendered name: both reviewers, the founder's figcaption, the footer's
director line, the author page's h1.

It has to be a class. **`&nbsp;` cannot do this job anywhere on this site** —
`optimize:html` runs html-minifier-terser with `--decode-entities` *and*
`--collapse-whitespace`, so every non-breaking space written into the markup is
decoded to U+00A0 and then collapsed to an ordinary space by a regex that
counts U+00A0 as whitespace.

Verified at 320 / 412 / 1440px on the homepage, an article and the author page:
no guarded run occupies two line boxes, and none is wider than its own column
(the one risk `nowrap` carries).

*Measurement note:* `getClientRects().length > 1` is **not** the test for "this
broke across a line". An inline box returns one rect per fragment, and a nested
`<span lang="vi">` makes a fragment without any line break — that check called
every name broken at 1440px. The test is the number of **distinct tops**.

### 4. The hub's subheading was intimidating, and the fix was to say less

It read: *"Thư viện kiến thức miễn phí cho chủ và quản lý nhà máy dệt nhuộm –
đo và cải thiện OEE, RFT, kỹ thuật nhuộm và đo màu. Viết bởi Ông Phan Đức Tuấn
Anh, 13 năm kỹ thuật viên nhuộm và 15 năm giám đốc nhà máy."* The owner called
it overwhelming. It was, in three separate ways: it opened with four pieces of
jargon before the reader knew what kind of place he had landed in — a reader
who does not already know what OEE stands for has just been told the library is
not for him, which is the exact opposite of true; it then stacked three
credentials, which reads as rank rather than as welcome; and it broke the
author's name across a line.

Now: **"28 năm trong xưởng nhuộm, viết lại cho dễ hiểu và dùng được ngay. Miễn
phí, bài mới mỗi Chủ nhật."** One number instead of three, comprehension
instead of coverage, and the two facts that actually bring somebody back.

Deleting it outright was the other option the owner offered and it would have
cost real things: the page's only prose, and the E-E-A-T answer to "who is
telling me this?". So the credentials did not disappear, they changed form —
**the byline every article carries is now repeated at the top of the library it
belongs to**: portrait, name, role, one link to the author page. It says more
than the clause did, in one line instead of two, and it cannot break a name in
half because `.kt-author-link` is an inline-flex box.

### 5. "Bài mới mỗi Chủ nhật" — the only subscription mechanism this library has

The owner mentioned the cadence in passing. It is the most under-used asset on
the site: **sixteen posts across sixteen consecutive weeks from 2026-04-26,
every one on a Sunday except a single Tuesday in May.** A reader who knows when
the next one lands has a reason to come back without being asked; with no
mailing list and no RSS button, a known publishing day is the whole mechanism.

It is printed in three places, each chosen for the moment it is read:

* the hub lead — the library's front door;
* `knowledge_lead` on the homepage — the moment a buyer discovers the library
  exists;
* the head of **Đọc tiếp** at the foot of every article — the moment a reader
  has just proved he will finish one.

**If the cadence ever breaks, all three come out together.** A broken promise
on the page a returning reader checks is worse than never having made one.

### 6. The homepage section moved UP, and the page closes on the ask again

The morning's placement — last block of `<main>`, after the contact section —
honoured "không làm interrupt flow" literally and put the section ~10,000px
down a phone page. The owner lifted that condition and replaced it with a
sharper one: **the gap between the moment a reader starts to trust us and the
moment he can act on it must be as small as possible.**

Moving it up serves both. The argument now runs proof (đánh giá) → the people
(về chúng tôi) → the proof that those people know the trade, given away free →
the ask. And the page **ends on the phone number again**, which was the worse of
the two errors: the last thing on the page was an invitation to leave it.

On the structural half of that gap, the honest finding is that it was already
solved and did not need anything: **the fixed bar carries a call button at
every scroll position** — measured on screen at 60% scroll depth at 320, 412 and
1440px, 44px tall. A reader convinced at the reviews section is one tap from a
phone call without scrolling anywhere.

### 7. The feed, rebuilt for the click

The owner asked for the articles to be as attractive as possible and for the
feed to be built the way feeds that get clicked are built. Four things do that
work, and each is ordinary practice on every surface that lives by CTR:

1. **The picture is big.** It was 96px beside two lines of text — a link with a
   stamp on it. On this hub the picture usually *is* the substance (how acid dye
   bonds to nylon, the OEE breakdown, a four-step chart), and 96px says "a
   picture exists" without saying what it is a picture of.
2. **The cost is on the label** — *"Kỹ thuật nhuộm · 6 phút đọc"*. Yes to the
   owner's question: reading time belongs here. A reader weighs interest against
   cost and assumes an unseen cost is high; ours are mostly five to seven
   minutes, which is an argument *for* clicking. Same reason every video
   platform stamps a duration on the thumbnail. The number comes from the same
   words-÷-200 as the hub, deliberately — one article must never show two
   different times on two pages.
3. **It peeks.** The second card is cut off at the container edge on a phone,
   which is the only thing that tells a thumb there is more to the right.
4. **It costs almost nothing vertically** — one row (~340px) instead of three
   stacked ones. That is what made it affordable to put the section *above* the
   contact block. Net: the phone page got **310px shorter** while gaining the
   bigger cards.

Rail under lg, plain three-column grid at lg and up. No JS: a scroll container
with `scroll-snap-type: x mandatory`, and `overscroll-behavior-x: contain` so a
swipe running off the end never becomes the browser's back gesture.

Three things the browser caught that source-reading would not have:

* **`scroll-padding-inline` is not optional on a bled rail.** A snap area
  aligns to the snapport, which is the scroll box's *padding* box only if you
  say so — so mandatory snapping scrolled the rail 24px on arrival to put card
  one against the border edge, and the first card sat hard against the glass
  while the heading above it sat at the gutter. Measured at rest: `scrollLeft
  24` on a rail nobody had touched.
* **Card titles had to come off link blue.** Three blue headlines in a row read
  as a list of references, not as three articles. Blue is this site's mark for a
  link *inside a sentence*, where the reader needs telling which words are the
  link; here the whole card is the target, so nothing needs marking and the
  title is free to be a headline. It earns the underline back on hover.
* **`a { font-weight: 600 }` is global in this stylesheet**, so the reading time
  inherited the headline's semibold and the two lines argued. Metadata takes the
  smaller size, the grey *and* the lighter weight, or it is not metadata.

The three topic pages kept their links, demoted to one line under the rail.
(Shipped once as "Đọc theo chủ đề:Vận hành & hiệu suất" — Liquid's stripping
delimiters remove the space the markup carried and html-minifier collapses what
survives, so a space between two inline elements has to be written as content.)

### Where the numbers stand

| | before today | now |
|---|---|---|
| Phone page height | 11,636px | 11,326px |
| Depth of the hub section on a phone | ~10,200px | ~6,700px |
| Vertical space it occupies (phone) | 979px | ~570px |
| Ground above the footer's first line | 0px | 48 / 64px |
| Structural defects across 27 built pages | 0 | 0 |
| Descriptions over ~160 chars | 0 | 0 |
| Personal names broken across a line (320/412/1440) | 4 | 0 |

### Still open

* **The second member of the company is nowhere on the site.** The our-story
  heading no longer contradicts that, but the section is still one portrait and
  one biography.
* Whether ink card titles on the homepage should match the hub's blue ones. The
  two surfaces are deliberately different design systems (Inter/white against
  Literata/cream) and the card architectures differ too — title-over-picture on
  the hub, picture-over-title here — so this is a considered divergence rather
  than drift. Worth a second opinion from the owner all the same.
* No table of contents on the two long articles (22 and 30 minutes). It is the
  one remaining lever on read-through that this pass did not pull, and it would
  also make the pages eligible for "jump to" sitelinks.
* The `opsz` axis (42.8 KB) and gtag.js, both unchanged and both owner
  decisions — see the first pass.


---

## 2026-08-10 (fourth pass) — the same day's own fixes, re-examined

The owner was still not satisfied with three of the lines from the pass above,
and a second read found the same fault in all three: each swapped the *wrong*
word for the right reason, or fixed a false claim but landed in the wrong
register. Presented as options; the owner chose one per line.

| where | pass 3 | pass 4 |
|---|---|---|
| hero CTA | Xem Alpha giúp được gì | **Tìm hiểu giải pháp Alpha** |
| our-story h2 | Alpha Software bắt đầu từ đâu | **Alpha Software ra đời như thế nào** |
| support body | …không phải nhân viên tổng đài | **…người trực tiếp trả lời có 28 năm kinh nghiệm nhuộm, hiểu ngay vấn đề của bạn** |

**Hero CTA.** "Giúp được gì" fixed the boast but kept the shape of a question
with no object — it wants a "cho ai" to land on, and a bare button label never
supplies one, so it read unfinished. Worth recording precisely because of a
mistake it nearly repeated: the earlier rule (from "tại xưởng của bạn") was
mis-generalised as "delete của bạn everywhere", when the actual fault was a
postposed possessive doing English "your"'s job. "Giúp được gì cho bạn" is not
that construction — it is the textbook idiom ("Tôi giúp được gì cho bạn?") —
so stripping "cho bạn" from this button was collateral damage from a
correctly-diagnosed problem applied one line too broadly. The owner picked the
plainest option instead: state what the destination *is* rather than ask what
Alpha does.

**Our-story h2.** "…bắt đầu từ đâu" (where did it begin) fixed the false
plural/singular claim but reads like an interview question rather than a story
opener — and the section's own nav label is "Về chúng tôi" (About us), a
narrative frame. "…ra đời như thế nào" (how it came to be) keeps counting
nobody and reads as the start of the story the body then tells.

**Support body.** "…không phải nhân viên tổng đài" defines the person by what
they are *not*, which reads as arguing down an expectation the reader hadn't
voiced — a shape that is itself faintly defensive, the same family of problem
as the line it replaced. The new sentence states what the person *is* and does
for the reader instead, and gets to the reader's actual problem one clause
sooner.

**The "của bạn" rule, corrected for the record**, since it was misapplied once
already: the fault was never the words "của bạn". It was "của bạn" doing
double duty as a postposed *location* modifier ("tại xưởng của bạn", "câu hỏi
của bạn" as a generic aside) — a calque of how English trails "your" onto
anything. "của bạn" as the direct object of an action the reader benefits from
("hiểu vấn đề của bạn" — understand your problem) is the ordinary, idiomatic
construction and was never the problem. Both English twins carry the matching
revision; `learn_more` in English was left alone because "See how Alpha can
help" never had either fault to begin with.

Verified in Chrome at 412×915: no overflow, no broken lines, both new
Vietnamese strings and both new English strings present in the built pages,
the three old strings absent.
