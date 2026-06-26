/**
 * Local preview server for the final, minified docs/ output — i.e. exactly what
 * `npm run ship` produces and GitHub Pages serves. Use it to eyeball the shipped
 * product one last time before committing/pushing.
 *
 * The built HTML hardcodes the production origin (https://www.alphasoftware
 * group.com) on every asset and link, so serving docs/ as-is would pull CSS/JS/
 * images from the LIVE site instead of your freshly-built bytes — defeating the
 * point of a pre-ship check. For HTML responses this server rewrites that origin
 * to root-relative paths on the fly, so the page is assembled entirely from the
 * local docs/ folder. External origins (fonts, analytics, partner sites) are
 * left untouched.
 *
 * Usage:  npm run preview        then open the printed URL
 *         PORT=3000 npm run preview   to force a specific port
 *
 * Defaults to port 4001 (next to Jekyll's 4000) and auto-bumps to the next free
 * port if it's taken, so `jekyll serve` and this can run side by side.
 *
 * Zero dependencies — Node built-ins only.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';

const ROOT = resolve('docs');
const PORT = Number(process.env.PORT) || 4001;
const ORIGIN = 'https://www.alphasoftwaregroup.com';
const MAX_PORT_TRIES = 20; // bump past in-use ports unless PORT was set explicitly

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Map a request path to a file inside docs/, mirroring GitHub Pages: a directory
// resolves to its index.html, and an extensionless path falls back to <path>.html.
async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const target = resolve(ROOT, '.' + (clean.startsWith('/') ? clean : '/' + clean));
  // Path-traversal guard: must stay within docs/.
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;

  const candidates = [target, join(target, 'index.html'), target + '.html'];
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch { /* try next */ }
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const file = await resolveFile(req.url);
    if (!file) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + req.url);
      return;
    }
    const ext = extname(file).toLowerCase();
    const type = TYPES[ext] || 'application/octet-stream';

    let body = await readFile(file);
    if (ext === '.html') {
      // Rewrite the production origin to root-relative so assets load locally.
      body = Buffer.from(body.toString('utf8').split(ORIGIN).join(''), 'utf8');
    }
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error: ' + err.message);
  }
});

// If PORT was set explicitly, respect it and fail loudly when taken; otherwise
// auto-bump to the next free port so this can run alongside `jekyll serve`.
const portFixed = Boolean(process.env.PORT);
let port = PORT;
let attempt = 0;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && !portFixed && ++attempt < MAX_PORT_TRIES) {
    server.listen(++port);
    return;
  }
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${port} is in use. Try:  PORT=3000 npm run preview\n`);
    process.exit(1);
  }
  throw err;
});

server.on('listening', () => {
  const p = server.address().port;
  console.log(`\n  Previewing shipped docs/ at:\n` +
    `    Vietnamese  http://localhost:${p}/\n` +
    `    English     http://localhost:${p}/en/\n\n` +
    `  Serving the minified output with assets rewritten to local.\n` +
    `  Press Ctrl+C to stop.\n`);
});

server.listen(port);
