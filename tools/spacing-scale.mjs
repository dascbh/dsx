#!/usr/bin/env node
// Generates a spacing scale on a 4 or 8 px grid.
// Usage: node tools/spacing-scale.mjs --base 4 [--format json|css|dtcg]
import { parseArgs } from './lib/cli.mjs';

// Multipliers of the base unit. Dense at the start (fine component adjustments),
// sparse at the end (breathing room between sections).
const MULTIPLIERS = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

export function spacingScale(base = 4) {
  return MULTIPLIERS.map((m) => {
    const px = m * base;
    return { token: String(m).replace('.', '_'), px, rem: px / 16 };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const base = Number(a.base ?? 4);
  const scale = spacingScale(base);
  if (a.format === 'css') {
    console.log(':root {');
    for (const s of scale) console.log(`  --space-${s.token}: ${s.rem}rem; /* ${s.px}px */`);
    console.log('}');
  } else if (a.format === 'dtcg') {
    const g = {};
    for (const s of scale) g[s.token] = { $type: 'dimension', $value: `${s.px}px` };
    console.log(JSON.stringify({ space: g }, null, 2));
  } else console.log(JSON.stringify({ base, scale }, null, 2));
}
