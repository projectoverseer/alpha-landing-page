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
