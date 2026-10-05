#!/usr/bin/env node
// Checks WCAG 2.x contrast between color pairs.
// Usage:
//   node tools/contrast.mjs "#1a1a1a" "#ffffff"
//   node tools/contrast.mjs --pairs tokens/contrast-pairs.json --tokens tokens/build/tokens.light.json
import { readFileSync } from 'node:fs';
import { contrast, wcagLevels } from './lib/color.mjs';
import { parseArgs } from './lib/cli.mjs';

const args = parseArgs();

if (args.pairs) {
  const pairs = JSON.parse(readFileSync(args.pairs, 'utf8'));
  const tokens = args.tokens ? JSON.parse(readFileSync(args.tokens, 'utf8')) : {};
  const lookup = (v) => (v.startsWith('#') ? v : tokens[v] ?? (() => { throw new Error(`Token not found: ${v}`); })());
  let failures = 0;
  for (const p of pairs) {
    const ratio = contrast(lookup(p.fg), lookup(p.bg));
    const min = p.min ?? 4.5;
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${ratio.toFixed(2)}:1 (min ${min}) ${p.fg} on ${p.bg}${(p.use ?? p.uso) ? ` — ${p.use ?? p.uso}` : ''}`);
  }
  process.exit(failures ? 1 : 0);
} else {
  const [fg, bg] = args._;
  if (!fg || !bg) {
    console.error('Usage: node tools/contrast.mjs <text-color> <background-color>');
    process.exit(2);
  }
  console.log(JSON.stringify({ fg, bg, ...wcagLevels(contrast(fg, bg)) }, null, 2));
}
