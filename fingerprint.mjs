/**
 * Content-hashes the optimized main.css and bundle.js, renames each file to
 * embed a short hash (e.g. bundle.a1b2c3d4e5.js), and rewrites every reference
 * to them across the built HTML in _site.
 *
 * Stable filenames mean returning visitors can be served a cached old asset
 * against new HTML after a deploy; a content hash makes each shipped build a
 * fresh URL, so caches invalidate automatically.
 *
 * Runs after optimize:css and optimize:js have produced their final bytes, so
 * the hash reflects exactly what ships. Throws if an asset is missing or ends
 * up referenced by zero pages — which doubles as a post-build sanity check
 * that the optimize steps actually ran.
 */

import { readFileSync, writeFileSync, renameSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const SITE = '_site';

// Each asset: its path inside _site, and the reference substring used in HTML.
// The reference is host-agnostic (site.url prefixes it) so a plain substring
// swap covers every page regardless of the absolute URL it was built into.
const ASSETS = [
  { file: 'css/main.css', ref: '/css/main.css' },
  { file: 'css/chiasekinhnghiem.css', ref: '/css/chiasekinhnghiem.css' },
  { file: 'js/bundle.js', ref: '/js/bundle.js' },
  // The hub loads the corner engine on its own — it shares no bundle with the
  // main site, whose copy is inlined in bundle.js above.
  { file: 'js/squircle.js', ref: '/js/squircle.js' },
  // The hub's picture viewer, referenced by article pages only.
  { file: 'js/kt-lightbox.js', ref: '/js/kt-lightbox.js' },
  // The hub's scroll title, referenced by every hub page but the hub root.
  { file: 'js/kt-topbar.js', ref: '/js/kt-topbar.js' },
];

// Insert the hash before the final extension: foo.css -> foo.<hash>.css
const withHash = (path, hash) => {
  const dot = path.lastIndexOf('.');
  return path.slice(0, dot) + '.' + hash + path.slice(dot);
};

const rewrites = ASSETS.map((asset) => {
  const abs = join(SITE, asset.file);
  const bytes = readFileSync(abs); // throws if optimize step didn't produce it
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
  renameSync(abs, join(SITE, withHash(asset.file, hash)));
  return { from: asset.ref, to: withHash(asset.ref, hash), hits: 0 };
});

// Rewrite references in every built HTML file.
let files = 0;
for (const name of readdirSync(SITE, { recursive: true })) {
  if (!String(name).endsWith('.html')) continue;
  const abs = join(SITE, name);
  let html = readFileSync(abs, 'utf8');
  let changed = false;
  for (const r of rewrites) {
    if (html.includes(r.from)) {
      html = html.split(r.from).join(r.to);
      r.hits++;
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(abs, html);
    files++;
  }
}

const orphan = rewrites.find((r) => r.hits === 0);
if (orphan) {
  throw new Error(`fingerprint: "${orphan.from}" was not referenced by any HTML — optimize step may not have run`);
}

console.log(`  fingerprint  → ${rewrites.map((r) => r.to).join(', ')}  (${files} HTML files)`);
