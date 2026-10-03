#!/usr/bin/env node
// Compila os tokens DTCG (tokens/*.tokens.json) em CSS custom properties e JSON resolvido,
// e valida os pares de contraste declarados em tokens/contrast-pairs.json para cada tema.
// Uso: node tools/build-tokens.mjs [--tokens <pasta>] [--check]
//   --tokens: pasta com primitives/semantic.light/semantic.dark[/component].tokens.json e contrast-pairs.json
//             (padrão: tokens/ do DSX). Use para compilar os tokens de um projeto.
//   --check:  só valida, não escreve arquivos. Saída em <pasta>/build/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast } from './lib/color.mjs';
import { parseArgs } from './lib/cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let DIR = join(ROOT, 'tokens');
/** Aponta o build para outra pasta de tokens (ex.: a do projeto do usuário). */
export const useTokensDir = (dir) => { DIR = dir; };
const T = (f) => join(DIR, f);
const read = (f) => JSON.parse(readFileSync(T(f), 'utf8'));

/** Achata a árvore DTCG em { "a.b.c": { value, type, description } }. */
export function flatten(tree, prefix = '', out = {}, inheritedType) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    const type = v.$type ?? inheritedType;
    if (v && typeof v === 'object' && '$value' in v) out[path] = { value: v.$value, type, description: v.$description };
    else if (v && typeof v === 'object') flatten(v, path, out, type);
  }
  return out;
}

/** Resolve aliases {a.b.c} recursivamente, detectando ciclos. */
export function resolve(flat) {
  const done = {};
  const visit = (path, stack = []) => {
    if (path in done) return done[path];
    if (stack.includes(path)) throw new Error(`Alias circular: ${[...stack, path].join(' -> ')}`);
    const tok = flat[path];
    if (!tok) throw new Error(`Token inexistente referenciado: ${path} (via ${stack.at(-1)})`);
    let v = tok.value;
    if (typeof v === 'string') {
      const whole = v.match(/^\{([^}]+)\}$/);
      if (whole) v = visit(whole[1], [...stack, path]);
      else v = v.replace(/\{([^}]+)\}/g, (_, p) => visit(p, [...stack, path]));
    }
    return (done[path] = v);
  };
  for (const p of Object.keys(flat)) visit(p);
  return done;
}

const cssName = (path) => '--' + path.replace(/\./g, '-');

function cssValue(v, type) {
  if (type === 'fontFamily' && Array.isArray(v)) return v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
  if (type === 'cubicBezier' && Array.isArray(v)) return `cubic-bezier(${v.join(', ')})`;
  if (type === 'shadow' && typeof v === 'object') return `${v.offsetX} ${v.offsetY} ${v.blur} ${v.spread} ${v.color}`;
  return String(v);
}

function block(selector, resolved, flat, keys) {
  const lines = keys.map((k) => `  ${cssName(k)}: ${cssValue(resolved[k], flat[k].type)};`);
  return `${selector} {\n${lines.join('\n')}\n}\n`;
}

export function build() {
  const prim = flatten(read('primitives.tokens.json'));
  const light = flatten(read('semantic.light.tokens.json'));
  const dark = flatten(read('semantic.dark.tokens.json'));
  const comp = existsSync(T('component.tokens.json')) ? flatten(read('component.tokens.json')) : {};
  const all = { light: { ...prim, ...light, ...comp }, dark: { ...prim, ...light, ...dark, ...comp } };
  const resolved = { light: resolve(all.light), dark: resolve(all.dark) };

  const missingInDark = Object.keys(dark).filter((k) => !(k in light));
  if (missingInDark.length) throw new Error(`Tema escuro define chaves que não existem no claro: ${missingInDark.join(', ')}`);

  const semanticKeys = [...Object.keys(light), ...Object.keys(comp)];
  // Tokens de componente apontam para semânticos; no tema escuro são reemitidos para resolver os novos valores.
  const darkKeys = [...Object.keys(dark), ...Object.keys(comp)];
  const css =
    `/* Gerado por tools/build-tokens.mjs — não edite à mão. */\n` +
    block(':root', resolved.light, all.light, [...Object.keys(prim), ...semanticKeys]) +
    `\n@media (prefers-color-scheme: dark) {\n` +
    block(':root:not([data-theme="light"])', resolved.dark, all.dark, darkKeys).replace(/^/gm, '  ') +
    `}\n\n` +
    block(':root[data-theme="dark"]', resolved.dark, all.dark, darkKeys);

  return { css, resolved };
}

export function checkContrast(resolved) {
  const pairs = JSON.parse(readFileSync(T('contrast-pairs.json'), 'utf8'));
  // Leitura compatível (transição de 2026-10): chave antiga "uso" → "use".
  if (pairs.some((p) => p.uso !== undefined && p.use === undefined)) {
    console.warn('AVISO  contrast-pairs.json: chave "uso" é nome antigo, renomeie para "use" (docs/renames-2026-10.md).');
    for (const p of pairs) if (p.use === undefined && p.uso !== undefined) { p.use = p.uso; delete p.uso; }
  }
  const results = [];
  for (const theme of Object.keys(resolved)) {
    for (const p of pairs) {
      const fg = resolved[theme][p.fg], bg = resolved[theme][p.bg];
      if (!fg || !bg) throw new Error(`Par de contraste referencia token inexistente: ${p.fg} / ${p.bg}`);
      // Ignora cores com alfa (8 dígitos): contraste depende do que está atrás.
      if (fg.length > 7 || bg.length > 7) continue;
      const ratio = contrast(fg, bg);
      results.push({ theme, ...p, ratio: +ratio.toFixed(2), ok: ratio >= (p.min ?? 4.5) });
    }
  }
  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs();
  if (args.tokens) useTokensDir(args.tokens);
  const { css, resolved } = build();
  const results = checkContrast(resolved);
  for (const r of results) {
    console.log(`${r.ok ? 'OK   ' : 'FALHA'} [${r.theme}] ${r.ratio}:1 (mín ${r.min}) ${r.fg} / ${r.bg} — ${r.use}`);
  }
  const fails = results.filter((r) => !r.ok);
  if (!args.check) {
    mkdirSync(T('build'), { recursive: true });
    writeFileSync(T('build/tokens.css'), css);
    writeFileSync(T('build/tokens.light.json'), JSON.stringify(resolved.light, null, 2) + '\n');
    writeFileSync(T('build/tokens.dark.json'), JSON.stringify(resolved.dark, null, 2) + '\n');
    console.log(`\nGerado: ${T('build')}/tokens.css, tokens.light.json, tokens.dark.json`);
  }
  if (fails.length) {
    console.error(`\n${fails.length} par(es) de contraste abaixo do mínimo.`);
    process.exit(1);
  }
}
