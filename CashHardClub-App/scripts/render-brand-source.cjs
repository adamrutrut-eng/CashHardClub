/*
 * Renders the placeholder brand source art with a headless Chromium (Playwright):
 *   assets/source/monogram.png        gold ₵-style monogram, transparent, 1024×1024
 *   assets/source/monogram-white.png  same shape in white (Android monochrome / notification icon)
 *   assets/source/wordmark.png        "CASH HARD CLUB · EST. MMXXIV", transparent, 2000×420
 *   assets/grain.png                  film-grain tile, transparent alpha noise, 256×256
 *
 * You normally do NOT need to run this: replace assets/source/monogram.png with the real
 * vectorised CHC monogram (exported as a 1024×1024 transparent PNG) and run `npm run assets`.
 * Requires: `npx playwright install chromium` (only for regenerating the wordmark/grain).
 */
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const cinzel = path.join(ROOT, 'node_modules/@expo-google-fonts/cinzel/700Bold/Cinzel_700Bold.ttf');
const inter = path.join(ROOT, 'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf');
const outSource = path.join(ROOT, 'assets/source');
const tmp = path.join(ROOT, '.expo', 'brand-tmp');
fs.mkdirSync(outSource, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

const fileUrl = (p) => 'file://' + p.replace(/\\/g, '/');
const fontCss = `
  @font-face { font-family: 'Cinzel'; src: url('${fileUrl(cinzel)}') format('truetype'); font-weight: 700; }
  @font-face { font-family: 'Inter'; src: url('${fileUrl(inter)}') format('truetype'); font-weight: 500; }
  html, body { margin: 0; padding: 0; background: transparent; }
  svg { display: block; }
`;
const foil = `<linearGradient id="foil" x1="0" y1="0" x2="0.35" y2="1">
  <stop offset="0" stop-color="#f4d992"/><stop offset="0.28" stop-color="#e3be6b"/>
  <stop offset="0.55" stop-color="#c8a04a"/><stop offset="0.8" stop-color="#a8842f"/>
  <stop offset="1" stop-color="#dcb75f"/></linearGradient>`;

const pages = {
  'assets/source/monogram.png': {
    w: 1024, h: 1024,
    svg: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <defs>${foil}</defs>
      <text x="500" y="800" font-family="Cinzel" font-weight="700" font-size="820" text-anchor="middle" fill="${fill}">C</text>
      <rect x="486" y="150" width="52" height="740" rx="10" fill="${fill}"/>
    </svg>`,
    fill: 'url(#foil)',
  },
  'assets/source/monogram-white.png': {
    w: 1024, h: 1024,
    svg: (fill) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <text x="500" y="800" font-family="Cinzel" font-weight="700" font-size="820" text-anchor="middle" fill="${fill}">C</text>
      <rect x="486" y="150" width="52" height="740" rx="10" fill="${fill}"/>
    </svg>`,
    fill: '#ffffff',
  },
  'assets/source/wordmark.png': {
    w: 2000, h: 420,
    svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="420" viewBox="0 0 2000 420">
      <defs>${foil}</defs>
      <text x="1000" y="215" font-family="Cinzel" font-weight="700" font-size="172" letter-spacing="26" text-anchor="middle" fill="url(#foil)">CASH HARD CLUB</text>
      <text x="1000" y="345" font-family="Inter" font-weight="500" font-size="54" letter-spacing="30" text-anchor="middle" fill="#c8a04a">EST. MMXXIV</text>
    </svg>`,
    fill: '',
  },
  'assets/grain.png': {
    w: 256, h: 256,
    svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <filter id="n" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" stitchTiles="stitch" seed="7"/>
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0.9 0.9 0 -0.55"/>
      </filter>
      <rect width="256" height="256" filter="url(#n)"/>
    </svg>`,
    fill: '',
  },
};

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [rel, spec] of Object.entries(pages)) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}</style></head><body>${spec.svg(spec.fill)}</body></html>`;
      const htmlPath = path.join(tmp, path.basename(rel, '.png') + '.html');
      fs.writeFileSync(htmlPath, html);
      const page = await browser.newPage({ viewport: { width: spec.w, height: spec.h }, deviceScaleFactor: 1 });
      await page.goto(fileUrl(htmlPath));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const out = path.join(ROOT, rel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: spec.w, height: spec.h } });
      await page.close();
      console.log('rendered', rel);
    }
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
