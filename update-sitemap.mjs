/**
 * Keeps sitemap <lastmod> dates honest, automatically.
 *
 * Search engines only trust lastmod while it stays historically accurate —
 * Google documents that a sitemap which claims "changed today" on every deploy
 * gets its lastmod ignored. So instead of stamping the build date blindly,
 * this compares each page's freshly built HTML against the previously
 * published copy in docs/ and bumps that page's lastmod ONLY when the content
 * actually changed.
 *
 * Fingerprinted asset names (main.<hash>.css, bundle.<hash>.js) are
 * normalized out before comparing, so a CSS/JS-only rebuild does not count as
 * a page-content change — exactly the distinction lastmod is meant to signal.
 *
 * Runs after optimize:html (so _site HTML is in its final shipped form) and
 * before publish:docs (which replaces the previous copy this diff needs).
 * When a page has no previous copy or no previous lastmod, it gets today.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = '_site';
const DOCS = 'docs';
const ORIGIN = 'https://www.alphasoftwaregroup.com';

// Strip the 10-hex content hash so only real markup/content differences count.
const normalize = (html) =>
  html.replace(/(main|chiasekinhnghiem|bundle)\.[0-9a-f]{10}\.(css|js)/g, '$1.$2');

// URL path from a <loc> → the HTML file that serves it ("/" → "index.html").
const fileFor = (urlPath) =>
  urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath;

const sitemapPath = join(SITE, 'sitemap.xml');
let sitemap = readFileSync(sitemapPath, 'utf8');
const prevSitemap = existsSync(join(DOCS, 'sitemap.xml'))
  ? readFileSync(join(DOCS, 'sitemap.xml'), 'utf8')
  : '';

const today = new Date().toISOString().slice(0, 10);
const summary = [];

// Rewrite each <url> block's <lastmod> according to the content diff.
sitemap = sitemap.replace(
  /<url>[\s\S]*?<\/url>/g,
  (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) return block;
    const rel = fileFor(loc.replace(ORIGIN, '')).replace(/^\//, '');

    const built = join(SITE, rel);
    const prev = join(DOCS, rel);

    let changed = true;
    if (existsSync(built) && existsSync(prev)) {
      changed =
        normalize(readFileSync(built, 'utf8')) !==
        normalize(readFileSync(prev, 'utf8'));
    }

    // The page's previous lastmod, recovered from the published sitemap.
    const prevBlock = prevSitemap.match(
      new RegExp(`<url>(?:(?!</url>)[\\s\\S])*?<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>`),
    )?.[0];
    const prevDate = prevBlock?.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];

    const date = changed || !prevDate ? today : prevDate;
    summary.push(`${loc.replace(ORIGIN, '') || '/'} ${changed ? '→ ' + date : 'unchanged (' + date + ')'}`);
    return block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${date}</lastmod>`);
  },
);

writeFileSync(sitemapPath, sitemap);
console.log(`  sitemap      → ${summary.join(', ')}`);
