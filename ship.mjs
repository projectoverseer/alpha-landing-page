/**
 * `npm run ship` — the one-command path for a human shipping the site:
 *
 *   1. Runs the full production build (`npm run build`). The Jekyll/Sass
 *      toolchain occasionally fails transiently on Windows (file locks,
 *      sass-cache races), so a failed build is retried automatically up to
 *      MAX_ATTEMPTS with a short pause, instead of making the human re-type it.
 *   2. When the build succeeds, launches the local preview server
 *      (`npm run preview`) so the reviewer lands straight in the final,
 *      minified docs/ output — no second command, no waiting twice.
 *
 * AIs and CI should use `npm run build` directly (deterministic, no server);
 * `npm run ship` is the human convenience wrapper around it.
 */

import { spawnSync, spawn } from 'node:child_process';

const MAX_ATTEMPTS = 3;
const RETRY_PAUSE_MS = 3000;

const run = (cmd) =>
  spawnSync(cmd, { shell: true, stdio: 'inherit' }).status === 0;

let built = false;
for (let attempt = 1; attempt <= MAX_ATTEMPTS && !built; attempt++) {
  if (attempt > 1) {
    console.warn(`\n  ship: build failed — retrying (${attempt}/${MAX_ATTEMPTS}) in ${RETRY_PAUSE_MS / 1000}s…\n`);
    await new Promise((r) => setTimeout(r, RETRY_PAUSE_MS));
  }
  built = run('npm run build');
}

if (!built) {
  console.error(`\n  ship: build failed ${MAX_ATTEMPTS} times — this is a real error, not flakiness. See output above.\n`);
  process.exit(1);
}

console.log('\n  ship: build verified — starting preview of the final docs/ output…\n');

// Hand the terminal to the preview server (Ctrl+C stops it as usual).
const preview = spawn('npm run preview', { shell: true, stdio: 'inherit' });
preview.on('exit', (code) => process.exit(code ?? 0));
