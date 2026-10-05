#!/usr/bin/env node
// Figma → DTCG bridge: compares the variables of a Figma snapshot with the project tokens
// and returns the change as a token diff, the `token` class of the cycle's way back.
//
//   node tools/figma/figma-to-tokens.mjs --snapshot <snapshot.json> --tokens <folder> [--write] [--json]
//
// <snapshot.json>: output of tools/figma/snapshot.js in MODE 'full' (field `variables`:
//   { "color/text/primary": { "Semântico/Claro": "→color/neutral/950", ... }, "space/4": { "Primitivos/Valor": 16 } }).
// Without --write: report only. With --write: applies the changes to EXISTING tokens and runs the contrast gate
// (tokens/contrast-pairs.json); exits with code 1 when a pair falls below the minimum.
// New variables in Figma are NEVER created automatically: a new token is a decision (skill `tokens`).
// --json output: { changes, added, suggestions, missing_in_figma }.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { flatten, build, checkContrast, useTokensDir } from '../build-tokens.mjs';
import { hexToRgba, toDtcgPath, toFigmaName } from './tokens-to-figma.mjs';
import { parseArgs } from '../lib/cli.mjs';

// Figma "collection/mode" key → DTCG file. The collection and mode names are data that already live in
// users' Figma files (created by tokens-to-figma.mjs), so they stay as they are (pt-BR).
const FILE_FOR = {
  'Primitivos/Valor': 'primitives.tokens.json',
  'Semântico/Claro': 'semantic.light.tokens.json',
  'Semântico/Escuro': 'semantic.dark.tokens.json',
  'Componente/Valor': 'component.tokens.json',
};

/** Snapshot value → DTCG value, using the type of the existing token when there is one. */
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
  (Array.isArray(a) && a[0] === b); // fontFamily: Figma keeps only the first family

export function compare(snapshot, dir) {
  const read = (f) => (existsSync(join(dir, f)) ? flatten(JSON.parse(readFileSync(join(dir, f), 'utf8'))) : {});
  const dtcg = Object.fromEntries(Object.entries(FILE_FOR).map(([k, f]) => [k, read(f)]));
  const light = dtcg['Semântico/Claro'];
  const vars = snapshot.variables;
  if (!vars || typeof vars !== 'object') throw new Error('Snapshot without detailed `variables`: run the snapshot with MODE = \'full\'.');

  const changes = [], added = [], suggestions = [];
  const seen = new Set();
  for (const [name, perMode] of Object.entries(vars)) {
    const path = toDtcgPath(name);
    for (const [key, figmaValue] of Object.entries(perMode)) {
      const file = FILE_FOR[key];
      if (!file) { added.push({ name, collection: key, value: figmaValue, reason: 'collection/mode outside the DSX schema' }); continue; }
      seen.add(`${key}|${path}`);
      // The dark theme inherits from light when the key is not in the dark file.
      const current = dtcg[key][path] ?? (key === 'Semântico/Escuro' ? light[path] : undefined);
      if (!current) { added.push({ name, collection: key, value: figmaValue }); continue; }
      const after = toDtcg(figmaValue, current.type);
      if (!equal(current.value, after)) {
        changes.push({ token: path, file, mode: key, before: current.value, after, inherited: !dtcg[key][path] });
      }
      // Semantic token with a raw color: if a primitive has the same value, suggest the alias.
      if (key.startsWith('Semântico') && typeof after === 'string' && after.startsWith('#')) {
        const prim = Object.entries(dtcg['Primitivos/Valor']).find(([, t]) => sameColor(t.value, after));
        if (prim) suggestions.push({ token: path, mode: key, suggestion: `use {${prim[0]}} instead of ${after}` });
        else suggestions.push({ token: path, mode: key, suggestion: `raw value ${after} with no matching primitive: create a ramp step (skill tokens)` });
      }
    }
  }
  const missingInFigma = [];
  for (const [key, toks] of Object.entries(dtcg)) {
    for (const path of Object.keys(toks)) if (!seen.has(`${key}|${path}`)) missingInFigma.push(`${key} ${toFigmaName(path)}`);
  }
  return { changes, added, suggestions, missing_in_figma: missingInFigma };
}

/** Writes the changes to the DTCG files (existing tokens only; an inherited dark value becomes an explicit key). */
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
  if (!a.snapshot) { console.error('Usage: node tools/figma/figma-to-tokens.mjs --snapshot <file> --tokens <folder> [--write] [--json]'); process.exit(2); }
  const dir = a.tokens ?? 'tokens';
  const r = compare(JSON.parse(readFileSync(a.snapshot, 'utf8')), dir);
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else {
    console.log(`## Token changes (${r.changes.length})`);
    for (const m of r.changes) console.log(`- ${m.token} [${m.mode}] ${JSON.stringify(m.before)} → ${JSON.stringify(m.after)}${m.inherited ? ' (was inherited from light)' : ''}`);
    console.log(`\n## New variables in Figma: a decision, not an automatic apply (${r.added.length})`);
    for (const n of r.added) console.log(`- ${n.name} [${n.collection}] = ${JSON.stringify(n.value)}${n.reason ? `: ${n.reason}` : ''}`);
    console.log(`\n## Suggestions (${r.suggestions.length})`);
    for (const s of r.suggestions) console.log(`- ${s.token} [${s.mode}]: ${s.suggestion}`);
    console.log(`\n## Tokens without a Figma variable (${r.missing_in_figma.length})${r.missing_in_figma.length ? ': normal for shadow/easing; investigate the rest' : ''}`);
    for (const x of r.missing_in_figma.slice(0, 20)) console.log(`- ${x}`);
  }
  if (a.write && r.changes.length) {
    const written = apply(r.changes, dir);
    console.log(`\nWritten: ${written.join(', ')}`);
    useTokensDir(dir);
    const failures = checkContrast(build().resolved).filter((x) => !x.ok);
    if (failures.length) {
      for (const f of failures) console.log(`FAIL [${f.theme}] ${f.ratio}:1 (min ${f.min}) ${f.fg} / ${f.bg} — ${f.use ?? f.uso}`);
      console.log('\nContrast gate FAILED: send the proposal back to design (do not apply). Revert with git checkout on the token files.');
      process.exit(1);
    }
    console.log('Contrast gate: OK for every pair and theme.');
  }
}
