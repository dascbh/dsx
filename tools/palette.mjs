#!/usr/bin/env node
// Gera uma rampa tonal 50–950 em OKLCH a partir de uma cor-base, com contraste de cada passo.
// Uso: node tools/palette.mjs "#3d5afe" --name brand [--format json|css|dtcg]
import { hexToOklch, oklchToHex, contrast } from './lib/color.mjs';
import { parseArgs } from './lib/cli.mjs';

// Luminosidade-alvo (OKLCH L) por passo. Escala perceptual: passos visualmente equidistantes.
const STEPS = {
  50: 0.975, 100: 0.94, 200: 0.885, 300: 0.81, 400: 0.72, 500: 0.63,
  600: 0.545, 700: 0.465, 800: 0.39, 900: 0.32, 950: 0.25,
};

export function palette(baseHex) {
  const base = hexToOklch(baseHex);
  const out = {};
  for (const [step, l] of Object.entries(STEPS)) {
    // Croma máximo no meio da escala, reduzido nas pontas para evitar tons "sujos" ou saturados demais.
    const t = 1 - Math.abs(l - 0.6) / 0.45;
    const c = base.c * Math.max(0.18, Math.min(1, t * 1.1));
    const hex = oklchToHex({ l, c, h: base.h });
    out[step] = {
      hex,
      contrast_white: +contrast(hex, '#ffffff').toFixed(2),
      contrast_black: +contrast(hex, '#000000').toFixed(2),
    };
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs();
  const base = args._[0];
  if (!base) { console.error('Uso: node tools/palette.mjs <hex> [--name brand] [--format json|css|dtcg]'); process.exit(2); }
  const name = args.name ?? 'brand';
  const p = palette(base);
  const fmt = args.format ?? 'json';
  if (fmt === 'css') {
    console.log(':root {');
    for (const [s, v] of Object.entries(p)) console.log(`  --color-${name}-${s}: ${v.hex}; /* ${v.contrast_white}:1 vs branco */`);
    console.log('}');
  } else if (fmt === 'dtcg') {
    const group = {};
    for (const [s, v] of Object.entries(p)) group[s] = { $type: 'color', $value: v.hex };
    console.log(JSON.stringify({ color: { [name]: group } }, null, 2));
  } else {
    console.log(JSON.stringify(p, null, 2));
  }
}
