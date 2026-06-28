/**
 * Publishes the freshly built _site to docs/ (the GitHub Pages root) without
 * ever leaving a visitor stranded with a missing asset.
 *
 * The setup already content-hashes assets (main.<hash>.css, bundle.<hash>.js),
 * so new HTML always points at new asset URLs — a returning visitor can never
 * apply a stale CSS to fresh HTML. But GitHub Pages serves HTML with only a
 * ~10-minute cache lifetime (not customizable), so right after a deploy a
 * browser may still render the PREVIOUS HTML straight from its own cache. That
 * old HTML references the previous build's hashed assets. If we simply
 * `rm -rf docs`, those files are gone and the cached page 404s its CSS/JS —
 * the exact broken-layout symptom we want to avoid, just from the other side.
 *
 * Fix: carry the previous deploy's css/ and js/ files forward into the new
 * build (content hashes never collide, so this is a safe union), then prune
 * anything older than RETAIN_DAYS so docs/ doesn't grow without bound. Old
 * HTML keeps finding its assets for the whole window any browser could still
 * be holding it.
 */

import {
  existsSync, mkdirSync, readdirSync, statSync,
  copyFileSync, rmSync, renameSync, utimesSync, writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const SITE = '_site';
const DOCS = 'docs';
const CARRY_DIRS = ['css', 'js'];

// How long to keep superseded hashed assets. GitHub Pages caps HTML caching at
// ~10 minutes, so any stale page a browser still holds is far younger than this;
// 14 days is a wide safety margin that also covers CDN edges and odd clients.
const RETAIN_DAYS = 14;
const cutoff = Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000;

let carried = 0;
let pruned = 0;

for (const dir of CARRY_DIRS) {
  const oldDir = join(DOCS, dir);
  const newDir = join(SITE, dir);
  if (!existsSync(oldDir)) continue;
  if (!existsSync(newDir)) mkdirSync(newDir, { recursive: true });

  const present = new Set(readdirSync(newDir)); // what this build already ships
  for (const name of readdirSync(oldDir)) {
    if (present.has(name)) continue; // current build supersedes this file
    const src = join(oldDir, name);
    const st = statSync(src);
    if (!st.isFile()) continue;
    if (st.mtimeMs < cutoff) { pruned++; continue; } // too old to still be referenced
    const dest = join(newDir, name);
    copyFileSync(src, dest);
    utimesSync(dest, st.atime, st.mtime); // preserve age so future prunes still work
    carried++;
  }
}

// Serve docs/ verbatim — skip GitHub's server-side Jekyll pass on the output.
writeFileSync(join(SITE, '.nojekyll'), '');

rmSync(DOCS, { recursive: true, force: true });
renameSync(SITE, DOCS);

console.log(`  publish      → docs/  (carried ${carried} prior asset${carried === 1 ? '' : 's'} forward, pruned ${pruned})`);
