#!/usr/bin/env node
// Detects design-system "drift": raw values (hex, rgb, arbitrary px, magic z-index)
// in UI code, where a token belongs.
// Usage: node tools/lint-raw-values.mjs <dir|file>... [--ext .tsx,.jsx,.css,.scss,.vue,.svelte,.html] [--json]
// Output: list of occurrences and drift metric (occurrences per 1000 lines). Exit 1 when there are occurrences.
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { parseArgs } from './lib/cli.mjs';

const RULES = [
  { id: 'color-hex', re: /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g, msg: 'Raw hex color: use a semantic token (e.g. var(--color-text-primary))' },
  { id: 'color-func', re: /\b(?:rgba?|hsla?|oklch|oklab)\([^)]*\)/g, msg: 'Raw color function: use a token' },
  { id: 'loose-px',  re: /(?<![\w-])(?:[2-9]|[1-9]\d{1,2})px\b/g, msg: 'px value outside the scale: use a spacing/size token' },
  { id: 'magic-z',   re: /z-index:\s*(?:\d{3,})/g, msg: 'Magic z-index: use a layer token' },
  { id: 'tw-arbitrary', re: /\b[a-z-]+-\[(?:#|\d)[^\]]*\]/g, msg: 'Tailwind arbitrary value: use the theme scale' },
];

// Token definition files are the only legitimate source of raw values.
const IGNORE_FILE = /(tokens?\.(css|json|scss|ts|js)$|\.tokens\.json$|tailwind\.config|theme\.(ts|js)$)/;
const IGNORE_DIR = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'vendor']);

function* walk(p, exts) {
  const st = statSync(p);
  if (st.isFile()) { if (exts.includes(extname(p)) && !IGNORE_FILE.test(p)) yield p; return; }
  for (const e of readdirSync(p)) if (!IGNORE_DIR.has(e)) yield* walk(join(p, e), exts);
}

export function lintText(text, file = '<stdin>') {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    if (/dsx-ignore/.test(line)) return; // explicit, auditable escape
    for (const r of RULES) for (const m of line.matchAll(r.re)) hits.push({ file, line: i + 1, rule: r.id, match: m[0], msg: r.msg });
  });
  return hits;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const exts = (a.ext ?? '.tsx,.jsx,.ts,.js,.css,.scss,.vue,.svelte,.html').split(',');
  if (!a._.length) { console.error('Usage: node tools/lint-raw-values.mjs <dir|file>...'); process.exit(2); }
  let lines = 0; const hits = [];
  for (const target of a._) for (const f of walk(target, exts)) {
    const t = readFileSync(f, 'utf8'); lines += t.split('\n').length; hits.push(...lintText(t, f));
  }
  const drift = lines ? +((hits.length / lines) * 1000).toFixed(2) : 0;
  if (a.json) console.log(JSON.stringify({ lines, occurrences: hits.length, drift_per_1000_lines: drift, hits }, null, 2));
  else {
    for (const h of hits) console.log(`${h.file}:${h.line}  [${h.rule}] ${h.match} — ${h.msg}`);
    console.log(`\n${hits.length} occurrence(s) in ${lines} lines, drift: ${drift}/1000 lines`);
  }
  process.exit(hits.length ? 1 : 0);
}
