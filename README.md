# Alpha Software — Landing Page

Bilingual (VI/EN) marketing site for **Alpha Software** — factory-management
and automation systems for Vietnamese textile dyehouses.

- **Live:** https://www.alphasoftwaregroup.com (VI at `/`, EN at `/en/`)
- **Hosting:** GitHub Pages, serving the `docs/` folder on `main`
- **CDN / security:** Cloudflare in front (edge-caches everything, injects
  security headers, strips query strings, rate-limits) — see
  [Infrastructure](#infrastructure)

## Quick start

```bash
bundle install   # Ruby 3.3 · Jekyll 3.10
npm install      # Node 24

npm run ship     # humans: build (auto-retries) + open the local preview
npm run build    # AIs/CI: deterministic production build → docs/
npm run preview  # serve the already-built docs/ locally
bundle exec jekyll serve   # dev server with live rebuild (unoptimized)
```

## The pipeline (`npm run build`)

| Step | Script | What it does |
|---|---|---|
| `clean` | shx | wipe `_site/` |
| `build:jekyll` | Jekyll (production env) | render pages from `_includes/` + `_data/i18n/` |
| `optimize:math` | `optimize-math.mjs` | render the LaTeX in the Chia sẻ kinh nghiệm articles to static MathML (KaTeX) — no maths library ships, and the equations stay real, indexable text |
| `optimize:css` | `optimize-css.mjs` | PurgeCSS (API, greedy popper safelist) → clean-css `-O2` |
| `optimize:js` | `optimize-js.mjs` | esbuild: slim Bootstrap (Collapse/Dropdown/ScrollSpy only) + site JS → one minified `bundle.js`; `squircle.js` also survives on its own, for the hub |
| `optimize:hash` | `fingerprint.mjs` | content-hash the CSS/JS assets, rewrite references |
| `optimize:html` | html-minifier-terser | minify markup, inline JS/CSS; sorted attributes/classes for better compression |
| `sitemap:lastmod` | `update-sitemap.mjs` | bump `<lastmod>` **only when a page's content really changed** (hash-normalized diff vs the published copy — keeps the signal trustworthy for search engines) |
| `check` | `verify.mjs` | fail the build on missing files, broken local references, leaked template syntax, or unrendered maths |
| `publish:docs` | `publish.mjs` | move `_site/` → `docs/`, carrying prior hashed assets forward (14-day retention) so stale cached HTML never 404s its CSS/JS |

`npm run ship` wraps `build` with automatic retries (the toolchain can fail
transiently on Windows) and then starts `npm run preview` so a human lands
directly in the final output.

## Editing rules

- **All copy lives in `_data/i18n/en.yml` and `vi.yml`** — never hard-code
  text in the includes. Every key must exist in both files (bilingual parity).
- **Vietnamese content requires the owner's/boss's approval before changing.**
  The Vietnamese page is the original; the English page is the translation and
  may be edited freely. Never alter the Vietnamese customer reviews.
- The anchor ids (`toc_*_id` keys) are shared deep-link targets — change
  labels freely, never the ids.
- Design decisions are governed by the docs in [`design/`](design/) —
  start with [`design/README.md`](design/README.md) and the design language in
  [`design/07-alpha-design-language.md`](design/07-alpha-design-language.md).
- Sass gotcha: never put an inline `//` comment after a CSS custom-property
  value — it breaks the compressed production build (details in
  `design/05-build-notes.md`).

## Deploying

1. `npm run ship`, review the preview (VI + EN).
2. Commit **source and `docs/` together**, push to `main`.
3. GitHub Pages deploys `docs/`; the
   [`cloudflare-cache-purge`](.github/workflows/cloudflare-cache-purge.yml)
   workflow purges the Cloudflare edge cache the moment the deployment
   succeeds (requires the `CF_CACHE_PURGE_TOKEN` repo secret — a token scoped
   to *Zone → Cache Purge only*, never the global API key).

## Infrastructure

Cloudflare (free plan) fronts GitHub Pages and carries most of the load:

- **Cache:** "cache everything" — HTML 4 h edge / 1 h browser; hashed static
  assets 1 year. Deploys stay instant thanks to the purge workflow.
- **Capacity:** query strings are 301-stripped at the edge (the site uses
  none), so `?fbclid=`/`?utm_=` variants from social shares can never bypass
  the cache and hammer the GitHub Pages origin.
- **Security:** HSTS (1 y, preload), CSP, nosniff, frame-ancestors none,
  Permissions-Policy; managed WAF + custom rules (bad bots / non-GET/HEAD /
  probe paths); rate limit (50 req/10 s per IP, **pages only** — static assets
  are excluded so a normal page load can't trip it).
- Zone-level history and reasoning: `performance-audits/README.md`.

## Repository map

```
_data/i18n/       en.yml + vi.yml — every piece of copy, both languages
_includes/        page skeleton + one file per section + SVG icons
_sass/_base.scss  all component styles (imported last from css/main.scss)
css/main.scss     design tokens (color/type/space) + Bootstrap variable layer
js/               custom.js (nav/reviews/email) · squircle.js (φ³ corners)
design/           strategy, principles, design system, build notes (00–07)
performance-audits/  Lighthouse history + Cloudflare change log
docs/             BUILT OUTPUT — never edit by hand, always via npm run build
```
