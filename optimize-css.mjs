/**
 * Purges unused CSS from the production build, then minifies it.
 *
 * Uses the PurgeCSS API directly (not the CLI) because the CLI's config-file
 * loader does a raw `import(path)` that breaks on Windows absolute paths, and
 * because a plain --safelist only matches literal class names. Bootstrap's
 * Dropdown sets `data-bs-popper` at runtime by building the attribute name
 * dynamically (`data-bs-${key}`), so the literal string never appears in the
 * built HTML/JS for PurgeCSS's extractor to find — a plain safelist can't save
 * it, only a greedy regex safelist (API-only) can. Without it, PurgeCSS strips
 * `.dropdown-menu-end[data-bs-popper]` and other popper-attribute rules,
 * silently breaking dropdown alignment only in the shipped/purged build.
 */
import { PurgeCSS } from 'purgecss';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CSS = '_site/css/main.css';

const [{ css }] = await new PurgeCSS().purge({
  css: [CSS],
  content: ['_site/**/*.html', '_site/**/*.js'],
  safelist: {
    standard: ['active', 'show', 'collapsing'],
    greedy: [/data-bs-popper/],
  },
});
writeFileSync(CSS, css);

execSync(`cleancss -O2 -o ${CSS} ${CSS}`, { stdio: 'inherit' });
