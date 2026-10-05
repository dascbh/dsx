#!/usr/bin/env node
// Generates a modular type scale (static, or fluid with clamp()).
// Usage:
//   node tools/type-scale.mjs --base 16 --ratio major-third
//   node tools/type-scale.mjs --base 16 --ratio 1.2 --fluid --max-ratio 1.333 --min-vw 360 --max-vw 1440 --format css
import { parseArgs } from './lib/cli.mjs';

export const RATIOS = {
  'minor-second': 1.067, 'major-second': 1.125, 'minor-third': 1.2, 'major-third': 1.25,
  'perfect-fourth': 1.333, 'augmented-fourth': 1.414, 'perfect-fifth': 1.5, golden: 1.618,
};

// Semantic names per scale step (0 = body).
const NAMES = { '-2': 'caption', '-1': 'small', 0: 'body', 1: 'h6', 2: 'h5', 3: 'h4', 4: 'h3', 5: 'h2', 6: 'h1', 7: 'display' };

const resolveRatio = (r) => (RATIOS[r] ?? Number(r)) || 1.25;
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Line height: larger text needs tighter leading. Body ~1.5; display ~1.1. */
export function lineHeight(px) {
  if (px <= 14) return 1.5;
  if (px <= 18) return 1.5;
  if (px <= 24) return 1.35;
  if (px <= 32) return 1.25;
  if (px <= 48) return 1.15;
  return 1.1;
}

export function typeScale({ base = 16, ratio = 'major-third', min = -1, max = 6, rounding = 1 } = {}) {
  const r = resolveRatio(ratio);
  const out = [];
  for (let i = min; i <= max; i++) {
    const raw = base * r ** i;
    const px = Math.round(raw / rounding) * rounding;
    out.push({ step: i, name: NAMES[i] ?? `step-${i}`, px, rem: round(px / 16, 4), line_height: lineHeight(px) });
  }
  return { base, ratio: r, steps: out };
}

/** Fluid scale: interpolates between the minimum (mobile) and maximum (desktop) ratio. */
export function fluidScale({ base = 16, maxBase = base, ratio = 1.2, maxRatio = 1.333, minVw = 360, maxVw = 1440, min = -2, max = 6 }) {
  const r1 = resolveRatio(ratio), r2 = resolveRatio(maxRatio);
  const steps = [];
  for (let i = min; i <= max; i++) {
    const a = base * r1 ** i, b = maxBase * r2 ** i;
    const slope = (b - a) / (maxVw - minVw);
    const intercept = a - slope * minVw;
    const value = `clamp(${round(a / 16, 4)}rem, ${round(intercept / 16, 4)}rem + ${round(slope * 100, 4)}vw, ${round(b / 16, 4)}rem)`;
    steps.push({ step: i, name: NAMES[i] ?? `step-${i}`, min_px: round(a), max_px: round(b), value, line_height: lineHeight(b) });
  }
  return { steps };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const opts = { base: Number(a.base ?? 16), ratio: a.ratio ?? 'major-third', min: Number(a.min ?? -1), max: Number(a.max ?? 6) };
  const result = a.fluid
    ? fluidScale({ ...opts, maxBase: Number(a['max-base'] ?? opts.base), maxRatio: a['max-ratio'] ?? 'perfect-fourth', minVw: Number(a['min-vw'] ?? 360), maxVw: Number(a['max-vw'] ?? 1440) })
    : typeScale(opts);
  if (a.format === 'css') {
    console.log(':root {');
    for (const s of result.steps) {
      console.log(`  --font-size-${s.name}: ${s.value ?? s.rem + 'rem'};`);
      console.log(`  --line-height-${s.name}: ${s.line_height};`);
    }
    console.log('}');
  } else console.log(JSON.stringify(result, null, 2));
}
