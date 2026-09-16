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

for (const [file, url] of Object.entries(SOURCES)) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    console.error(`${url} → HTTP ${res.status}; keeping the existing snapshot.`);
    continue;
  }
  const json = await res.json();
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(json, null, 2) + '\n');
  console.log(`updated src/data/snapshots/${file} from ${url}`);
}
