/**
 * Bundles bootstrap.bundle.min.js + custom.js + squircle.js into bundle.js.
 *
 * Bootstrap is already minified; custom.js and squircle.js are minified here
 * with esbuild. All three are concatenated in load order so that:
 *   1. bootstrap runs first (defines window.bootstrap)
 *   2. custom.js runs second (uses bootstrap APIs)
 *   3. squircle.js runs last (uses bootstrap dropdown events)
 *
 * The output bundle.js is a plain IIFE-compatible concatenation, not an ES
 * module, matching the original defer-loaded browser scripts.
 */

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { transformSync } from 'esbuild';

const SRC = {
  bootstrap: '_site/js/bootstrap.bundle.min.js',
  custom:    '_site/js/custom.js',
  squircle:  '_site/js/squircle.js',
};
const DEST = '_site/js/bundle.js';

const bootstrap = readFileSync(SRC.bootstrap, 'utf8');
const { code: custom }   = transformSync(readFileSync(SRC.custom,   'utf8'), { minify: true });
const { code: squircle } = transformSync(readFileSync(SRC.squircle, 'utf8'), { minify: true });

// Separate blocks with a newline so minified bootstrap's last token doesn't
// collide with the first token of the next file.
writeFileSync(DEST, bootstrap + '\n' + custom + '\n' + squircle);

for (const src of Object.values(SRC)) unlinkSync(src);

const kb = (readFileSync(DEST).length / 1024).toFixed(1);
console.log(`  optimize:js  → _site/js/bundle.js  (${kb} KB)`);
