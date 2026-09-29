/*
 * Unit tests for the in-app link allowlist (src/lib/links.ts). No test framework needed:
 *   npm run test:links
 * Transpiles links.ts with the project's TypeScript and runs plain assertions.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'links.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { isTrustedWebUrl, parseIncoming } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const rejected = [
  'https://evil.com/@cashhardclub.com/x',
  'https://cashhardclub.com@evil.com/',
  'https://evil.com?x=@cashhardclub.com',
  'https://cashhardclub.com.evil.com/',
  'https://www.google.com/url?q=https://evil.com',
  'https://cashhardclub.com\\@evil.com/',
  'http://cashhardclub.com/store-MFHja',
  'javascript:alert(1)',
  '',
];
const accepted = [
  'https://cashhardclub.com/store-MFHja/p/x',
  'https://www.cashhardclub.com/',
  'https://shopcashhardclub.squarespace.com/store-MFHja/merch',
  'HTTPS://CashHardClub.com/store-MFHja',
];

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    failures++;
    console.error(`FAIL ${name}: ${err.message}`);
  }
};

for (const url of rejected) check(`rejects ${JSON.stringify(url)}`, () => assert.equal(isTrustedWebUrl(url), false));
for (const url of accepted) check(`accepts ${JSON.stringify(url)}`, () => assert.equal(isTrustedWebUrl(url), true));
check('parseIncoming ignores untrusted https', () => assert.deepEqual(parseIncoming('https://evil.com/x'), { kind: 'ignore' }));
check('parseIncoming opens trusted https', () => assert.equal(parseIncoming('https://cashhardclub.com/support').kind, 'web'));
check('parseIncoming maps store product links', () =>
  assert.deepEqual(parseIncoming('https://cashhardclub.com/store-MFHja/p/x'), { kind: 'product', slug: 'x' }),
);

if (failures) {
  console.error(`${failures} test(s) failed`);
  process.exit(1);
}
console.log('all link tests passed');
