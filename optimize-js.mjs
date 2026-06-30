/**
 * Builds the production bundle.js from a slim, tree-shaken Bootstrap plus the
 * site's own scripts.
 *
 * Instead of shipping the full 88 KB `bootstrap.bundle.min.js` (~73% of it
 * unused), esbuild bundles ONLY the three Bootstrap plugins this site actually
 * uses, straight from the npm package:
 *   - Collapse  → the products accordion (data-bs-toggle="collapse" + custom.js)
 *   - Dropdown  → the navbar "Products" menu (+ Popper, pulled in automatically)
 *   - ScrollSpy → nav link highlighting (data-bs-spy="scroll")
 * Importing each `bootstrap/js/dist/*` module also registers its data-API, so
 * the markup-driven widgets keep working with no manual init. The result is
 * exposed as `window.bootstrap` for custom.js to use.
 *
 * Everything is concatenated in load order so that:
 *   1. bootstrap runs first  (defines window.bootstrap)
 *   2. custom.js runs second (uses bootstrap APIs)
 *   3. squircle.js runs last (independent; kept last as before)
 *
 * The output is a plain IIFE-compatible concatenation, not an ES module,
 * matching the original defer-loaded browser scripts. The dev build (non-prod)
 * still loads the full vendored bootstrap.bundle.min.js directly — see page.html.
 *
 * Pinned to the same Bootstrap version as the vendored CSS/JS (5.3.x) via
 * package.json, so the bundled JS behaviour matches the compiled _sass styles.
 */

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { transformSync, buildSync } from 'esbuild';

const SITE_JS = '_site/js/';
const DEST = '_site/js/bundle.js';

// 1. Slim Bootstrap — only the plugins in use, bundled + minified from node_modules.
const { outputFiles } = buildSync({
  stdin: {
    contents: [
      "import Collapse from 'bootstrap/js/dist/collapse';",
      "import Dropdown from 'bootstrap/js/dist/dropdown';",
      "import ScrollSpy from 'bootstrap/js/dist/scrollspy';",
      'window.bootstrap = { Collapse, Dropdown, ScrollSpy };',
    ].join('\n'),
    resolveDir: process.cwd(),
    loader: 'js',
  },
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  target: ['es2020'],
});
const bootstrap = outputFiles[0].text;

// 2. The site's own scripts (already in _site after the Jekyll build), minified.
const { code: custom }   = transformSync(readFileSync(SITE_JS + 'custom.js',   'utf8'), { minify: true });
const { code: squircle } = transformSync(readFileSync(SITE_JS + 'squircle.js', 'utf8'), { minify: true });

// Separate blocks with a newline so one block's last token can't collide with
// the next block's first token.
writeFileSync(DEST, bootstrap + '\n' + custom + '\n' + squircle);

// Drop the raw sources from the output so they aren't shipped alongside the
// bundle (the full vendored bootstrap is dev-only and must not reach _site).
for (const f of ['bootstrap.bundle.min.js', 'custom.js', 'squircle.js']) {
  try { unlinkSync(SITE_JS + f); } catch { /* not present in this build */ }
}

const kb = (readFileSync(DEST).length / 1024).toFixed(1);
console.log(`  optimize:js  → _site/js/bundle.js  (${kb} KB, slim Bootstrap)`);
