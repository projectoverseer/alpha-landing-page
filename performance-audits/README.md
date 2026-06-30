# Performance audits

Lighthouse / performance reports for **www.alphasoftwaregroup.com**, kept for
reference and trend tracking. This folder is excluded from the Jekyll build
(see `_config.yml`), so nothing here is published to the live site.

## Naming convention

```
YYYY-MM-DD-<formFactor>-<tool>.json
```

e.g. `2026-06-30-mobile-lighthouse.json`.

## Reports

| Date       | Tool       | Form factor | Perf | A11y | Best-Pr | SEO  |
|------------|------------|-------------|------|------|---------|------|
| 2026-06-30 | Lighthouse | mobile      | 0.82 | 1.00 | 0.81    | 1.00 |

---

## 2026-06-30 — findings & actions

### Fixed in this repo

1. **Render-blocking Google Fonts CSS** (was the longest critical-request chain;
   ~838 ms of the request was render-blocking). Now loaded off the critical path
   via `media="print" onload="this.media='all'"`, with a `<noscript>` fallback
   for no-JS visitors. — `_includes/meta-assets.html`
2. **gtag.js inflating Total Blocking Time** (the GA library is ~118 KB / ~300 ms
   of main-thread work, and ~45 KB of it went unused during load — TBT was the
   single biggest score drag at 630 ms). The library now loads after `load` on an
   idle slot; the Consent Mode + `config` commands stay inline and queue in
   `dataLayer`, so no hit is lost. — `_includes/page.html`

### NOT fixable in this repo — Cloudflare dashboard actions

The site is served through Cloudflare, which **injects its own scripts** into
every response. These account for the entire Best-Practices failure and a large
share of the remaining Total Blocking Time. They cannot be changed by editing
this repo — they are toggled in the Cloudflare dashboard for the zone.

| Audit item | Source | Where to fix |
|---|---|---|
| 3 "deprecated API" warnings (Shared Storage, `StorageType.persistent`, Protected Audience) → the **only** thing holding Best-Practices at 0.81 | `cdn-cgi/challenge-platform/scripts/jsd/main.js` (Cloudflare bot management) | Cloudflare → **Security → Bots**: turn off *Bot Fight Mode* / *JavaScript Detections* (or accept the warnings — they come from Cloudflare's own code, not ours) |
| ~316 ms script evaluation (a top TBT contributor) | same `challenge-platform` script | same as above |
| ~54 ms script (Cloudflare Insights beacon) | `static.cloudflareinsights.com/beacon.min.js` | Cloudflare → **Analytics → Web Analytics**: disable if not needed |
| Extra `email-decode.min.js` request | Cloudflare Email Obfuscation | Cloudflare → **Scrape Shield → Email Address Obfuscation**: off |
| "Use efficient cache lifetimes" — est. 61 KiB (our static assets get only a ~16 h browser cache TTL; GitHub Pages can't set cache headers, Cloudflare in front controls it) | Cloudflare edge | Cloudflare → **Caching → Configuration → Browser Cache TTL** (e.g. 1 year), or a **Cache Rule** for `/css/*`, `/js/*`, `/img/*` (safe — assets are content-hashed) |

### Notes / deferred

- **Bootstrap ScrollSpy forced reflow** (~50 ms, from `data-bs-spy="scroll"`
  reading section geometry on scroll). It's a navbar feature; left as-is.
- **Self-hosting Public Sans** would remove the third-party font chain entirely
  (and the Google Fonts GDPR exposure, relevant given the EU consent list in
  `page.html`). Deferred — the async-load fix above already clears the Lighthouse
  render-blocking finding.
