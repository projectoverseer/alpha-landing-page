/**
 * Finds each hub image's attention centre — the point a crop must keep.
 *
 * The feed shows pictures Facebook's way: natural aspect ratio inside the
 * 1.91:1 … 4:5 window, cropped to the nearest bound outside it. A crop needs
 * to know WHERE to cut, and "center" or "top" guesses wrong as often as right.
 * Facebook solves this with saliency prediction (a model trained on eye-gaze
 * data) plus face detection; the static-site analog is sharp's `attention`
 * strategy — highest concentration of luminance frequency, colour saturation
 * and skin tone. Same idea, computed once at authoring time instead of on a
 * server.
 *
 * For every `<slug>-<w>.jpg` in img/chia-se-kinh-nghiem/ (largest width per
 * slug) this prints `fx` / `fy`: the attention centre as percentages of the
 * image's width and height. Paste them into the image's entry in
 * _data/chia_se_kinh_nghiem.yml; the templates hand them to CSS as
 * `object-position: fx% fy%`, so the browser re-derives the right crop at
 * every box ratio (feed clamp, split cell, read-next row) from one pair of
 * numbers — exactly how Facebook applies one saliency result to many
 * placements.
 *
 * The centre is measured by attention-cropping a narrow strip along each axis
 * (a 20% strip forces the strategy to commit to one region; the strip's
 * offset, read back from cropOffsetLeft/Top, is the axis's focus).
 *
 * Authoring-time helper, not part of `npm run build` — needs
 * `npm i --no-save sharp`. Run:  node image-focus.mjs [--previews <dir>]
 * (--previews also writes each clamped crop as a JPEG so the cut can be
 * eyeballed before the values are committed.)
 */

import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const DIR = 'img/chia-se-kinh-nghiem';
const WIDE = 1.91; // feed clamp bounds — Facebook's display window
const TALL = 4 / 5;

const previewsAt = process.argv.indexOf('--previews');
const previewDir = previewsAt > -1 ? process.argv[previewsAt + 1] : null;
if (previewDir) mkdirSync(previewDir, { recursive: true });

// Largest JPEG per slug — the -672 siblings are the same picture smaller.
const bySlug = new Map();
for (const f of readdirSync(DIR)) {
  const m = f.match(/^(.+)-(\d+)\.jpg$/);
  if (!m) continue;
  const [, slug, w] = m;
  if (!bySlug.has(slug) || +w > bySlug.get(slug).w) bySlug.set(slug, { f, w: +w });
}

// Attention-crop a strip along one axis; where the strip landed is the focus.
async function axisFocus(file, full, strip, horizontal) {
  const target = Math.max(16, Math.round(strip * 0.2));
  const { info } = await sharp(file)
    .resize({
      width: horizontal ? target : full.w,
      height: horizontal ? full.h : target,
      fit: 'cover',
      position: sharp.strategy.attention,
    })
    .toBuffer({ resolveWithObject: true });
  const offset = Math.abs(horizontal ? info.cropOffsetLeft : info.cropOffsetTop);
  return Math.round(((offset + target / 2) / strip) * 100);
}

// The crop CSS will make: object-position aligns the fx%/fy% point of the
// image with the same point of the box, so offset = (overflow) * f%.
async function preview(file, slug, W, H, ratio, fx, fy) {
  const box = W / H > ratio
    ? { width: Math.round(H * ratio), height: H, top: 0, left: Math.round((W - Math.round(H * ratio)) * fx / 100) }
    : { width: W, height: Math.round(W / ratio), left: 0, top: Math.round((H - Math.round(W / ratio)) * fy / 100) };
  await sharp(file).extract(box).jpeg({ quality: 85 }).toFile(join(previewDir, `${slug}-clamp.jpg`));
}

for (const [slug, { f }] of [...bySlug.entries()].sort()) {
  const file = join(DIR, f);
  const { width: W, height: H } = await sharp(file).metadata();
  const fx = await axisFocus(file, { w: W, h: H }, W, true);
  const fy = await axisFocus(file, { w: W, h: H }, H, false);
  const r = W / H;
  const clamp = r > WIDE ? 'wide→1.91:1' : r < TALL ? 'tall→4:5' : 'natural';
  console.log(`${slug}  ${W}x${H}  fx: ${fx}  fy: ${fy}  (${clamp})`);
  if (previewDir && clamp !== 'natural') await preview(file, slug, W, H, r > WIDE ? WIDE : TALL, fx, fy);
}
