/**
 * `npm run submit:indexnow` — tells IndexNow-participating search engines
 * (Bing, Yandex, Seznam, Naver) that the site's pages exist or changed.
 * Google does NOT use IndexNow — for Google, submit the sitemap once in
 * Search Console and use URL Inspection → Request Indexing for new posts.
 *
 * Run AFTER the site is deployed (docs/ pushed and live):
 *   1. Verifies the key file is reachable on the live origin — IndexNow
 *      rejects submissions it cannot verify, so failing early here beats a
 *      silent 403.
 *   2. Fetches the LIVE sitemap (what search engines can actually crawl,
 *      which may be ahead of or behind the local tree) and submits every
 *      <loc> in one batch to api.indexnow.org.
 *
 * Re-running is safe and idempotent: engines treat repeat submissions of
 * unchanged URLs as a no-op. Zero dependencies — Node built-ins only.
 */

const ORIGIN = 'https://www.alphasoftwaregroup.com';
const KEY = '3ae395cbc31836c28cb9d7e68ff15aec';
const KEY_URL = `${ORIGIN}/${KEY}.txt`;

async function main() {
  // 1. The key file must be live before engines will accept the batch.
  const keyRes = await fetch(KEY_URL);
  if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
    console.error(
      `\n  indexnow: key file not live yet (${KEY_URL} → ${keyRes.status}).\n` +
      `  Deploy the site first (the key file ships with the build), then re-run.\n`,
    );
    return 1;
  }

  // 2. Submit every URL the live sitemap declares.
  const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith(ORIGIN)); // never submit image <loc>s from other hosts

  if (urls.length === 0) {
    console.error('  indexnow: live sitemap yielded no URLs — aborting.');
    return 1;
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(ORIGIN).host,
      key: KEY,
      keyLocation: KEY_URL,
      urlList: urls,
    }),
  });

  // 200 = accepted; 202 = accepted, key verification pending. Anything else is a real error.
  if (res.status === 200 || res.status === 202) {
    console.log(`  indexnow: submitted ${urls.length} URLs (HTTP ${res.status}).`);
    return 0;
  }
  console.error(`  indexnow: submission failed — HTTP ${res.status}: ${await res.text()}`);
  return 1;
}

process.exitCode = await main();
