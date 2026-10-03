#!/usr/bin/env node
// Ponte Figma → DTCG: compara as variáveis de um snapshot do Figma com os tokens do projeto
// e devolve a mudança como diff de tokens — a classe `token` da volta do ciclo.
//
//   node tools/figma/figma-to-tokens.mjs --snapshot <snapshot.json> --tokens <pasta> [--write] [--json]
//
// <snapshot.json>: saída de tools/figma/snapshot.js em MODE 'full' (campo `variables`:
//   { "color/text/primary": { "Semântico/Claro": "→color/neutral/950", ... }, "space/4": { "Primitivos/Valor": 16 } }).
// Sem --write: só relata. Com --write: aplica as mudanças em tokens EXISTENTES e roda o gate de contraste
// (tokens/contrast-pairs.json) — sai com código 1 se algum par ficar abaixo do mínimo.
// Variáveis novas no Figma NUNCA são criadas automaticamente: token novo é decisão (skill `tokens`).
// Saída --json: { changes, added, suggestions, missing_in_figma }.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { flatten, build, checkContrast, useTokensDir } from '../build-tokens.mjs';
import { hexToRgba, toDtcgPath, toFigmaName } from './tokens-to-figma.mjs';
import { parseArgs } from '../lib/cli.mjs';

// Chave "coleção/modo" do Figma (texto do arquivo, em pt-BR) → arquivo DTCG.
const FILE_FOR = {
  'Primitivos/Valor': 'primitives.tokens.json',
  'Semântico/Claro': 'semantic.light.tokens.json',
  'Semântico/Escuro': 'semantic.dark.tokens.json',
  'Componente/Valor': 'component.tokens.json',
};

/** Valor do snapshot → valor DTCG, usando o tipo do token existente quando houver. */
export function toDtcg(figmaValue, type) {
  if (typeof figmaValue === 'string' && figmaValue.startsWith('→')) return `{${toDtcgPath(figmaValue.slice(1))}}`;
  if (typeof figmaValue === 'string' && figmaValue.startsWith('#')) {
    const [hex, op] = figmaValue.split('/');
    if (op == null || Number(op) === 1) return hex.toLowerCase();
    return hex.toLowerCase() + Math.round(Number(op) * 255).toString(16).padStart(2, '0');
  }
  if (typeof figmaValue === 'number') {
    if (type === 'dimension') return `${figmaValue}px`;
    if (type === 'duration') return `${figmaValue}ms`;
    return figmaValue;
  }
  return figmaValue;
}

const sameColor = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || !a.startsWith('#') || !b.startsWith('#')) return false;
  const x = hexToRgba(a), y = hexToRgba(b);
  return ['r', 'g', 'b', 'a'].every((k) => Math.abs(x[k] - y[k]) < 0.006);
};
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b) || sameColor(a, b) ||
  (Array.isArray(a) && a[0] === b); // fontFamily: o Figma só guarda a primeira família

export function compare(snapshot, dir) {
  const read = (f) => (existsSync(join(dir, f)) ? flatten(JSON.parse(readFileSync(join(dir, f), 'utf8'))) : {});
  const dtcg = Object.fromEntries(Object.entries(FILE_FOR).map(([k, f]) => [k, read(f)]));
  const light = dtcg['Semântico/Claro'];
  const vars = snapshot.variables;
  if (!vars || typeof vars !== 'object') throw new Error('Snapshot sem `variables` detalhadas — rode o snapshot com MODE = \'full\'.');

  const changes = [], added = [], suggestions = [];
  const seen = new Set();
  for (const [name, perMode] of Object.entries(vars)) {
    const path = toDtcgPath(name);
    for (const [key, figmaValue] of Object.entries(perMode)) {
      const file = FILE_FOR[key];
      if (!file) { added.push({ name, collection: key, value: figmaValue, reason: 'coleção/modo fora do esquema DSX' }); continue; }
      seen.add(`${key}|${path}`);
      // Tema escuro herda do claro quando a chave não está no arquivo escuro.
      const current = dtcg[key][path] ?? (key === 'Semântico/Escuro' ? light[path] : undefined);
      if (!current) { added.push({ name, collection: key, value: figmaValue }); continue; }
      const after = toDtcg(figmaValue, current.type);
      if (!equal(current.value, after)) {
        changes.push({ token: path, file, mode: key, before: current.value, after, inherited: !dtcg[key][path] });
      }
      // Semântico com cor crua: se um primitivo tem o mesmo valor, sugira o alias.
      if (key.startsWith('Semântico') && typeof after === 'string' && after.startsWith('#')) {
        const prim = Object.entries(dtcg['Primitivos/Valor']).find(([, t]) => sameColor(t.value, after));
        if (prim) suggestions.push({ token: path, mode: key, suggestion: `use {${prim[0]}} em vez de ${after}` });
        else suggestions.push({ token: path, mode: key, suggestion: `valor cru ${after} sem primitivo correspondente — crie um passo na rampa (skill tokens)` });
      }
    }
  }
  const missingInFigma = [];
  for (const [key, toks] of Object.entries(dtcg)) {
    for (const path of Object.keys(toks)) if (!seen.has(`${key}|${path}`)) missingInFigma.push(`${key} ${toFigmaName(path)}`);
  }
  return { changes, added, suggestions, missing_in_figma: missingInFigma };
}

/** Grava as mudanças nos arquivos DTCG (só tokens existentes; herdado no escuro vira chave explícita). */
export function apply(changes, dir) {
  const files = {};
  const open = (f) => (files[f] ??= JSON.parse(readFileSync(join(dir, f), 'utf8')));
  const lightTree = open('semantic.light.tokens.json');
  for (const m of changes) {
    const tree = open(m.file);
    const parts = m.token.split('.');
    let node = tree, lightNode = lightTree;
    for (const p of parts.slice(0, -1)) { node = node[p] ??= {}; lightNode = lightNode?.[p]; }
    const leaf = parts.at(-1);
    if (!node[leaf]) node[leaf] = { $type: lightNode?.[leaf]?.$type ?? 'color' };
    node[leaf].$value = m.after;
  }
  for (const [f, tree] of Object.entries(files)) writeFileSync(join(dir, f), JSON.stringify(tree, null, 2) + '\n');
  return Object.keys(files);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  if (!a.snapshot) { console.error('Uso: node tools/figma/figma-to-tokens.mjs --snapshot <arquivo> --tokens <pasta> [--write] [--json]'); process.exit(2); }
  const dir = a.tokens ?? 'tokens';
  const r = compare(JSON.parse(readFileSync(a.snapshot, 'utf8')), dir);
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else {
    console.log(`## Mudanças de token (${r.changes.length})`);
    for (const m of r.changes) console.log(`- ${m.token} [${m.mode}] ${JSON.stringify(m.before)} → ${JSON.stringify(m.after)}${m.inherited ? ' (antes herdado do Claro)' : ''}`);
    console.log(`\n## Variáveis novas no Figma — decisão, não aplicação automática (${r.added.length})`);
    for (const n of r.added) console.log(`- ${n.name} [${n.collection}] = ${JSON.stringify(n.value)}${n.reason ? ` — ${n.reason}` : ''}`);
    console.log(`\n## Sugestões (${r.suggestions.length})`);
    for (const s of r.suggestions) console.log(`- ${s.token} [${s.mode}]: ${s.suggestion}`);
    console.log(`\n## Tokens sem variável no Figma (${r.missing_in_figma.length})${r.missing_in_figma.length ? ' — normal para sombra/easing; investigue o resto' : ''}`);
    for (const x of r.missing_in_figma.slice(0, 20)) console.log(`- ${x}`);
  }
  if (a.write && r.changes.length) {
    const written = apply(r.changes, dir);
    console.log(`\nGravado: ${written.join(', ')}`);
    useTokensDir(dir);
    const failures = checkContrast(build().resolved).filter((x) => !x.ok);
    if (failures.length) {
      for (const f of failures) console.log(`FALHA [${f.theme}] ${f.ratio}:1 (mín ${f.min}) ${f.fg} / ${f.bg} — ${f.use ?? f.uso}`);
      console.log('\nGate de contraste REPROVADO: devolva a proposta ao design (não aplique). Reverta com git checkout nos arquivos de tokens.');
      process.exit(1);
    }
    console.log('Gate de contraste: OK em todos os pares e temas.');
  }
}
