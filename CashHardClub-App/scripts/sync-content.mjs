/*
 * Refreshes the bundled content snapshots from the live website, so the app always ships
 * with the current catalog and events even if a phone is offline on first launch.
 * Run before every store build:  npm run sync:content
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'data', 'snapshots');
const SOURCES = {
  'products.json': 'https://cashhardclub.com/products.json',
  'events.json': 'https://cashhardclub.com/events.json',
};

// The bundled copy ships inside the store binary and can't be corrected without a new build, so it
// leaves out compare-at ("was") prices and one-of-one pieces (docs/06-PRE-SUBMISSION-CHECKLIST.md,
// snapshot check). Online, the app still shows whatever the live products.json lists.
const ONE_OF_ONE = /\b1\s*(?:\/|of)\s*1\b|\bone[-\s]of[-\s]one\b/i;
const FOR_BUNDLE = {
  'products.json': (json) => {
    if (!Array.isArray(json?.products)) throw new Error('no products list');
    const kept = json.products.filter((p) => !ONE_OF_ONE.test([p?.name, p?.bay, p?.desc].join(' ')));
    for (const p of json.products) if (!kept.includes(p)) console.log(`left out of the bundle (one-of-one): ${p?.name}`);
    return { ...json, products: kept.map((p) => ({ ...p, was: null })) };
  },
};

let failed = false;

for (const [file, url] of Object.entries(SOURCES)) {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const bundled = FOR_BUNDLE[file] ? FOR_BUNDLE[file](json) : json;
    fs.writeFileSync(path.join(OUT, file), JSON.stringify(bundled, null, 2) + '\n');
    console.log(`updated src/data/snapshots/${file} from ${url}`);
  } catch (err) {
    // Transport failures (offline, DNS) land here too, not just HTTP errors.
    failed = true;
    console.error(`${url} → ${err instanceof Error ? err.message : err}; keeping the existing snapshot.`);
  }
}

if (failed) {
  console.error('One or more snapshots were NOT refreshed — check them before a production build.');
}
