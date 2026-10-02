#!/usr/bin/env node
// Detecta "drift" do design system: valores crus (hex, rgb, px arbitrários, z-index mágico)
// em código de UI, onde deveria haver token.
// Uso: node tools/lint-raw-values.mjs <dir|arquivo>... [--ext .tsx,.jsx,.css,.scss,.vue,.svelte,.html] [--json]
// Saída: lista de ocorrências e métrica de drift (ocorrências por 1000 linhas). Exit 1 se houver ocorrências.
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { parseArgs } from './lib/cli.mjs';

const RULES = [
  { id: 'cor-hex',   re: /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g, msg: 'Cor hex crua — use token semântico (ex.: var(--color-text-primary))' },
  { id: 'cor-func',  re: /\b(?:rgba?|hsla?|oklch|oklab)\([^)]*\)/g, msg: 'Cor funcional crua — use token' },
  { id: 'px-solto',  re: /(?<![\w-])(?:[2-9]|[1-9]\d{1,2})px\b/g, msg: 'Medida em px fora da escala — use token de espaço/tamanho' },
  { id: 'z-magico',  re: /z-index:\s*(?:\d{3,})/g, msg: 'z-index mágico — use token de camada' },
  { id: 'tw-arbitr', re: /\b[a-z-]+-\[(?:#|\d)[^\]]*\]/g, msg: 'Valor arbitrário Tailwind — use a escala do tema' },
];

// Arquivos de definição de tokens são a única fonte legítima de valores crus.
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
    if (/dsx-ignore/.test(line)) return; // escape explícito e auditável
    for (const r of RULES) for (const m of line.matchAll(r.re)) hits.push({ file, line: i + 1, rule: r.id, match: m[0], msg: r.msg });
  });
  return hits;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const exts = (a.ext ?? '.tsx,.jsx,.ts,.js,.css,.scss,.vue,.svelte,.html').split(',');
  if (!a._.length) { console.error('Uso: node tools/lint-raw-values.mjs <dir|arquivo>...'); process.exit(2); }
  let lines = 0; const hits = [];
  for (const target of a._) for (const f of walk(target, exts)) {
    const t = readFileSync(f, 'utf8'); lines += t.split('\n').length; hits.push(...lintText(t, f));
  }
  const drift = lines ? +((hits.length / lines) * 1000).toFixed(2) : 0;
  if (a.json) console.log(JSON.stringify({ lines, ocorrencias: hits.length, driftPorMilLinhas: drift, hits }, null, 2));
  else {
    for (const h of hits) console.log(`${h.file}:${h.line}  [${h.rule}] ${h.match} — ${h.msg}`);
    console.log(`\n${hits.length} ocorrência(s) em ${lines} linhas — drift: ${drift}/1000 linhas`);
  }
  process.exit(hits.length ? 1 : 0);
}
