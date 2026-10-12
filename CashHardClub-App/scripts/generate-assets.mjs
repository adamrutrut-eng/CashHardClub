/*
 * Builds every icon/splash/store image from these source files:
 *   assets/source/app-icon.png   the app icon artwork: square, opaque, mark on pure black (≥1024×1024).
 *                                When present, it drives icon.png, both adaptive-icon files, the
 *                                notification icon and the Play icon. Remove it to fall back to the monogram.
 *   assets/source/monogram.png   the CHC monogram, transparent background, ≥1024×1024 (gold version);
 *                                drives the splash image and feature graphic (and the icons when there is no app-icon.png)
 *   assets/source/wordmark.png   "CASH HARD CLUB · EST. MMXXIV" wordmark, transparent (optional)
 *
 * Outputs (all PNG):
 *   assets/icon.png                 1024×1024, opaque black — iOS App Store icon (Apple: no transparency)
 *   assets/adaptive-icon.png        1024×1024, transparent — Android adaptive icon foreground (safe zone respected)
 *   assets/adaptive-icon-mono.png   1024×1024, white silhouette — Android 13+ themed icon
 *   assets/splash-icon.png          1024×1024, transparent — splash image (expo-splash-screen scales it)
 *   assets/notification-icon.png    96×96, white silhouette — Android status-bar notification icon (OneSignal)
 *   store/play-icon-512.png         512×512 — Google Play listing icon
 *   store/feature-graphic.png       1024×500 — Google Play feature graphic
 *
 * Run:  npm run assets      (after replacing a source file)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets', 'source', 'monogram.png');
const APP_ICON = path.join(ROOT, 'assets', 'source', 'app-icon.png');
const WORDMARK = path.join(ROOT, 'assets', 'source', 'wordmark.png');
const GRAIN = path.join(ROOT, 'assets', 'grain.png');
const BLACK = { r: 0, g: 0, b: 0, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

if (!fs.existsSync(SRC)) {
  console.error(`Missing ${SRC}. Export the monogram as a transparent PNG (1024×1024 or larger) to that path.`);
  process.exit(1);
}
fs.mkdirSync(path.join(ROOT, 'store'), { recursive: true });

/** Trim transparent padding, then fit inside a box (keeps aspect ratio). */
async function fitted(input, box) {
  return sharp(input).trim().resize(box, box, { fit: 'inside', background: CLEAR }).png().toBuffer();
}

/** The mark from app-icon.png as a transparent layer `width` px wide, filled with `rgb`. */
async function appIconMark(width, rgb) {
  const grey = await sharp(APP_ICON).removeAlpha().extractChannel(1).trim({ background: '#000000', threshold: 12 }).png().toBuffer();
  const meta = await sharp(grey).metadata();
  const height = Math.round((width * meta.height) / meta.width);
  // Pixels at or above 235 become fully opaque; anti-aliased edges keep partial alpha.
  const { data: alpha, info } = await sharp(grey).resize(width, height, { kernel: 'lanczos3' }).extractChannel(0).linear(255 / 235, 0).raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error(`Expected a 1-channel mask, got ${info.channels}`);
  const px = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    px[i * 4] = rgb[0]; px[i * 4 + 1] = rgb[1]; px[i * 4 + 2] = rgb[2]; px[i * 4 + 3] = alpha[i];
  }
  return sharp(px, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/** White silhouette of the monogram (uses only the alpha channel). */
async function whiteVersion(input) {
  const meta = await sharp(input).metadata();
  const alpha = await sharp(input).ensureAlpha().extractChannel('alpha').png().toBuffer();
  return sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: '#ffffff' } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

function canvas(w, h, background) {
  return sharp({ create: { width: w, height: h, channels: 4, background } });
}

/** Soft gold glow used behind the icon (mirrors the site's radial gradient). */
function glowSvg(w, h) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><radialGradient id="g" cx="50%" cy="58%" r="60%">
        <stop offset="0" stop-color="#c8a04a" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>`,
  );
}

async function centered(base, layerBuf, w, h, extra = []) {
  const meta = await sharp(layerBuf).metadata();
  const left = Math.round((w - meta.width) / 2);
  const top = Math.round((h - meta.height) / 2);
  return base.composite([...extra, { input: layerBuf, left, top }]);
}

async function main() {
  const gold = await sharp(SRC).png().toBuffer();
  const white = await whiteVersion(gold);

  if (fs.existsSync(APP_ICON)) {
    // iOS icon — the supplied artwork as-is, opaque (App Store rejects transparency).
    await sharp(APP_ICON).removeAlpha().resize(1024, 1024, { kernel: 'lanczos3' }).flatten({ background: '#000000' }).removeAlpha().png().toFile(path.join(ROOT, 'assets', 'icon.png'));
    // Android adaptive foreground and themed-icon layer — mark kept inside the 66% safe-zone circle.
    await (await centered(canvas(1024, 1024, CLEAR), await appIconMark(500, [245, 245, 245]), 1024, 1024)).png().toFile(path.join(ROOT, 'assets', 'adaptive-icon.png'));
    await (await centered(canvas(1024, 1024, CLEAR), await appIconMark(500, [255, 255, 255]), 1024, 1024)).png().toFile(path.join(ROOT, 'assets', 'adaptive-icon-mono.png'));
    // Android notification small icon — white silhouette on transparent.
    await (await centered(canvas(96, 96, CLEAR), await appIconMark(84, [255, 255, 255]), 96, 96)).png().toFile(path.join(ROOT, 'assets', 'notification-icon.png'));
  } else {
    // iOS icon — opaque, no alpha channel (App Store rejects transparency).
    const iconGlyph = await fitted(gold, 640);
    await (await centered(canvas(1024, 1024, BLACK), iconGlyph, 1024, 1024, [{ input: glowSvg(1024, 1024), left: 0, top: 0 }]))
      .flatten({ background: '#000000' })
      .removeAlpha()
      .png()
      .toFile(path.join(ROOT, 'assets', 'icon.png'));

    // Android adaptive foreground — glyph kept inside the 66% safe zone.
    const adaptiveGlyph = await fitted(gold, 520);
    await (await centered(canvas(1024, 1024, CLEAR), adaptiveGlyph, 1024, 1024)).png().toFile(path.join(ROOT, 'assets', 'adaptive-icon.png'));
    const monoGlyph = await fitted(white, 520);
    await (await centered(canvas(1024, 1024, CLEAR), monoGlyph, 1024, 1024)).png().toFile(path.join(ROOT, 'assets', 'adaptive-icon-mono.png'));

    // Android notification small icon — must be a white silhouette on transparent.
    const notifGlyph = await fitted(white, 76);
    await (await centered(canvas(96, 96, CLEAR), notifGlyph, 96, 96)).png().toFile(path.join(ROOT, 'assets', 'notification-icon.png'));
  }

  // Splash image — transparent; the black background comes from app.json.
  const splashGlyph = await fitted(gold, 720);
  await (await centered(canvas(1024, 1024, CLEAR), splashGlyph, 1024, 1024)).png().toFile(path.join(ROOT, 'assets', 'splash-icon.png'));

  // Google Play listing icon.
  await sharp(path.join(ROOT, 'assets', 'icon.png')).resize(512, 512).png().toFile(path.join(ROOT, 'store', 'play-icon-512.png'));

  // Google Play feature graphic 1024×500.
  const layers = [{ input: glowSvg(1024, 500), left: 0, top: 0 }];
  const fgGlyph = await fitted(gold, 280);
  const fgMeta = await sharp(fgGlyph).metadata();
  layers.push({ input: fgGlyph, left: 88, top: Math.round((500 - fgMeta.height) / 2) });
  if (fs.existsSync(WORDMARK)) {
    const wm = await sharp(WORDMARK).trim().resize(500, 180, { fit: 'inside', background: CLEAR }).png().toBuffer();
    const wmMeta = await sharp(wm).metadata();
    layers.push({ input: wm, left: 88 + 280 + 60, top: Math.round((500 - wmMeta.height) / 2) });
  }
  if (fs.existsSync(GRAIN)) {
    // Film grain at ~6% strength (the alpha channel is scaled down so black stays black).
    const grain = await sharp(GRAIN).ensureAlpha().linear([1, 1, 1, 0.06], [0, 0, 0, 0]).png().toBuffer();
    layers.push({ input: grain, tile: true, blend: 'over' });
  }
  await canvas(1024, 500, BLACK).composite(layers).flatten({ background: '#000000' }).removeAlpha().png().toFile(path.join(ROOT, 'store', 'feature-graphic.png'));

  for (const f of ['assets/icon.png', 'assets/adaptive-icon.png', 'assets/adaptive-icon-mono.png', 'assets/splash-icon.png', 'assets/notification-icon.png', 'store/play-icon-512.png', 'store/feature-graphic.png']) {
    const m = await sharp(path.join(ROOT, f)).metadata();
    console.log(`${f.padEnd(34)} ${m.width}×${m.height} ${m.hasAlpha ? 'alpha' : 'opaque'}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
