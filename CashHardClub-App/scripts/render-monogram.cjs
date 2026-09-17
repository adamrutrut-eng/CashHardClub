const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('playwright');
// Recreates the CHC monogram (two interlocking high-contrast C's forming an H) as vector art.
// Usage: node scripts/render-monogram.cjs assets/source/monogram.png "url(#foil)"   (gold)
//        node scripts/render-monogram.cjs assets/source/monogram-white.png "#ffffff"
// Writes a .svg next to the .png. Requires Playwright's Chromium only for the PNG rasterisation.
const out = path.resolve(process.argv[2]); const fill = process.argv[3] || '#ffffff';
// geometry (1024 canvas)
const cy = 512, cxL = 384;
const RX = 222, RY = 312;
const rx = 150, ry = 266, inOff = 40;
const cut = 165, serifW = 46, serifTop = 118, serifBot = 312;
const barH = 62;
function cShape(cx, mirror) {
  const ring = `M ${cx-RX} ${cy} a ${RX} ${RY} 0 1 0 ${2*RX} 0 a ${RX} ${RY} 0 1 0 ${-2*RX} 0 Z ` +
               `M ${cx+inOff-rx} ${cy} a ${rx} ${ry} 0 1 0 ${2*rx} 0 a ${rx} ${ry} 0 1 0 ${-2*rx} 0 Z`;
  const id = mirror ? 'r' : 'l';
  const foot = 16, footH = 22;
  const serifs = `<rect x="${cx+cut}" y="${cy-serifBot}" width="${serifW}" height="${serifBot-serifTop}"/>` +
                 `<rect x="${cx+cut}" y="${cy+serifTop}" width="${serifW}" height="${serifBot-serifTop}"/>` +
                 `<rect x="${cx+cut-foot}" y="${cy-serifBot}" width="${serifW+2*foot}" height="${footH}"/>` +
                 `<rect x="${cx+cut-foot}" y="${cy-serifTop-footH}" width="${serifW+2*foot}" height="${footH}"/>` +
                 `<rect x="${cx+cut-foot}" y="${cy+serifTop}" width="${serifW+2*foot}" height="${footH}"/>` +
                 `<rect x="${cx+cut-foot}" y="${cy+serifBot-footH}" width="${serifW+2*foot}" height="${footH}"/>`;
  const g = `<clipPath id="clip${id}"><rect x="0" y="0" width="${cx+cut+1}" height="1024"/></clipPath>` +
            `<g fill="${fill}"><path d="${ring}" fill-rule="evenodd" clip-path="url(#clip${id})"/>${serifs}</g>`;
  return mirror ? `<g transform="translate(1024,0) scale(-1,1)">${g}</g>` : g;
}

const leftSerifStart = cxL + cut, leftSerifEnd = cxL + cut + serifW;
const rightSerifStart = 1024 - leftSerifEnd, rightSerifEnd = 1024 - leftSerifStart;
const barX = Math.min(leftSerifStart, rightSerifStart), barX2 = Math.max(leftSerifEnd, rightSerifEnd);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs><linearGradient id="foil" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#f4d992"/><stop offset="0.28" stop-color="#e3be6b"/><stop offset="0.55" stop-color="#c8a04a"/><stop offset="0.8" stop-color="#a8842f"/><stop offset="1" stop-color="#dcb75f"/></linearGradient></defs>
${cShape(cxL,false)}${cShape(cxL,true)}
<rect x="${barX}" y="${cy-barH/2}" width="${barX2-barX}" height="${barH}" fill="${fill}"/>
</svg>`;
fs.writeFileSync(out + '.svg', svg);
const html = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style></head><body>${svg}</body></html>`;
fs.writeFileSync(out + '.html', html);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  await p.goto('file://' + out + '.html'); await p.screenshot({ path: out, omitBackground: true }); await b.close(); console.log('ok'); })();
