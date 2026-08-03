#!/usr/bin/env node
// Refreshes the third-party skills in .claude/skills from their upstream repos.
// Wired to SessionStart as an async hook (see settings.json), so it never blocks
// the session. Throttled to once a day because `skills update` re-clones three
// GitHub repos and takes ~25s.
//
// The stamp lives in ~/.claude, not in this repo, so daily runs never show up
// as a diff in the site's git history.

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DAY_MS = 24 * 60 * 60 * 1000;
const RETRY_MS = 60 * 60 * 1000; // back off an hour after a failed run, not a full day

// Resolve the project from this file's own location: .claude/skills-autoupdate.mjs
const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stampFile = join(homedir(), '.claude', 'skills-update-stamps.json');

let stamps = {};
try {
  stamps = JSON.parse(readFileSync(stampFile, 'utf8'));
} catch {
  // No stamp file yet, or it got corrupted — treat as "never updated".
}

const due = Date.now() - (stamps[projectDir] ?? 0) >= DAY_MS;
if (!due) process.exit(0);

// One command string rather than an argv array: npx is a .cmd shim on Windows and
// can only be spawned through a shell, and shell + argv trips a Node deprecation.
// Every token here is a literal, so there is nothing to escape.
const { status } = spawnSync('npx --yes skills update -p -y', {
  cwd: projectDir,
  stdio: 'ignore',
  timeout: 5 * 60 * 1000,
  shell: true,
});

const ok = status === 0;
stamps[projectDir] = ok ? Date.now() : Date.now() - DAY_MS + RETRY_MS;

try {
  mkdirSync(dirname(stampFile), { recursive: true });
  writeFileSync(stampFile, JSON.stringify(stamps, null, 2));
} catch {
  // Can't record the run — worst case we retry next session. Never fail the hook.
}
