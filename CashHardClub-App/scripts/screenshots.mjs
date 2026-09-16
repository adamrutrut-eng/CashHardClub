/*
 * Turns raw phone screenshots into every store size, on a black canvas (never stretched):
 *   store/screenshots/raw/*.png|jpg     → drop your iPhone / emulator screenshots here (any size)
 *   store/screenshots/apple-6.9/         1290×2796  App Store (iPhone 6.9" — the required set)
 *   store/screenshots/apple-6.5/         1284×2778  App Store (iPhone 6.5" — optional, scaled otherwise)
 *   store/screenshots/play-phone/        1080×1920  Google Play phone screenshots (9:16)
 *
 * Run:  npm run screenshots
 * File order = display order, so name them 01-shop.png, 02-product.png, 03-events.png, 04-alerts.png …
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'store', 'screenshots', 'raw');
const TARGETS = {
  'apple-6.9': [1290, 2796],
  'apple-6.5': [1284, 2778],
  'play-phone': [1080, 1920],
};

const files = fs.existsSync(RAW) ? fs.readdirSync(RAW).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort() : [];
if (files.length === 0) {
  console.error(`No screenshots found in ${RAW}. Add PNG/JPG files there first.`);
  process.exit(1);
}
for (const [name, [w, h]] of Object.entries(TARGETS)) {
  const out = path.join(ROOT, 'store', 'screenshots', name);
  fs.mkdirSync(out, { recursive: true });
  for (const f of files) {
    const target = path.join(out, f.replace(/\.(jpe?g|png)$/i, '.png'));
    await sharp(path.join(RAW, f))
      .resize(w, h, { fit: 'contain', background: '#000000' })
      .flatten({ background: '#000000' })
      .removeAlpha()
      .png()
      .toFile(target);
    console.log(`${name}/${path.basename(target)}  ${w}×${h}`);
  }
}
