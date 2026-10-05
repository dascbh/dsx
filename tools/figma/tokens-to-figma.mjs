#!/usr/bin/env node
// DTCG → Figma bridge: turns the project tokens (3 layers) into Figma variables.
//
//   node tools/figma/tokens-to-figma.mjs --tokens <folder> [--json | --script]
//
// --json   (default) prints the plan: collections, modes, variables, aliases, scopes and what is unsupported.
// --script prints a script to paste into `use_figma` (load the `figma-use` skill first). Idempotent:
//          reuses collection, mode and variable by name; only creates what is missing and updates values.
//
// Schema in Figma (same architecture as DSX):
//   Primitivos  — mode "Valor"; empty scopes (hidden from the picker: forces the use of semantic tokens)
//   Semântico   — modes "Claro" and "Escuro"; values = alias to Primitivos (or a raw value, when the token is raw)
//   Componente  — mode "Valor"; alias to Semântico (resolves with the mode applied to the frame)
// Collection and mode names are text of the Figma file (what the person sees in the panel) and stay in pt-BR:
// existing files already carry them, and figma-to-tokens.mjs reads them back.
// Variable names: DTCG path with "/" instead of "." (color.text.primary → color/text/primary).
// --json output: { collections, variables: [{ collection, name, dtcg_type, type, scopes, description, values }], unsupported, summary }.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { flatten } from '../build-tokens.mjs';
import { parseCli } from '../lib/legacy-cli.mjs';

export const COLLECTIONS = {
  primitives: { name: 'Primitivos', modes: ['Valor'] },
  semantic: { name: 'Semântico', modes: ['Claro', 'Escuro'] },
  component: { name: 'Componente', modes: ['Valor'] },
};

export const toFigmaName = (path) => path.replace(/\./g, '/');
export const toDtcgPath = (name) => name.replace(/\//g, '.');

/** Converts "#rrggbb[aa]" into {r,g,b,a} 0–1. */
export function hexToRgba(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const n = (i) => parseInt(full.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? Math.round(n(6) * 1000) / 1000 : 1 };
}

/** DTCG type → Figma variable type + converted value. null = not supported as a variable. */
export function convertValue(type, value) {
  if (type === 'color' && typeof value === 'string' && value.startsWith('#')) return { type: 'COLOR', value: hexToRgba(value) };
  if (type === 'dimension' && typeof value === 'string') {
    const m = value.match(/^(-?\d+(?:\.\d+)?)px$/);
    return m ? { type: 'FLOAT', value: Number(m[1]) } : null; // ch, rem, % have no direct equivalent
  }
  if (type === 'duration' && typeof value === 'string') {
    const m = value.match(/^(\d+(?:\.\d+)?)ms$/);
    return m ? { type: 'FLOAT', value: Number(m[1]) } : null;
  }
  if ((type === 'number' || type === 'fontWeight') && typeof value === 'number') return { type: 'FLOAT', value };
  if (type === 'fontFamily') return { type: 'STRING', value: Array.isArray(value) ? value[0] : String(value) };
  return null; // shadow, cubicBezier, composite typography: become styles (effect/text), not variables
}

/** Scopes by intent: this is what makes Figma suggest the right variable in the right place. */
export function scopesFor(path, layer) {
  if (layer === 'primitives') return [];
  const p = path;
  if (/^color\.text\.|-text$|^color\.feedback\..*-text$/.test(p) || /\.text$/.test(p)) return ['TEXT_FILL'];
  if (/^color\.border\.|\.border$/.test(p)) return ['STROKE_COLOR'];
  if (/-icon$/.test(p)) return ['SHAPE_FILL', 'STROKE_COLOR'];
  if (/^color\.(bg|action|ai)\.|-bg$|\.bg(-hover)?$/.test(p)) return ['FRAME_FILL', 'SHAPE_FILL'];
  if (/^color\./.test(p)) return ['ALL_FILLS'];
  if (/^space\.|padding/.test(p)) return ['GAP'];
  if (/^radius\.|\.radius$/.test(p)) return ['CORNER_RADIUS'];
  if (/^size\.|\.height$/.test(p)) return ['WIDTH_HEIGHT'];
  if (/^font\.size\./.test(p)) return ['FONT_SIZE'];
  if (/^font\.weight\./.test(p)) return ['FONT_WEIGHT'];
  if (/^font\.family\./.test(p)) return ['FONT_FAMILY'];
  return [];
}

const ALIAS = /^\{([^}]+)\}$/;
const readJson = (dir, f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : null);

/** Builds the full plan from the tokens folder. */
export function plan(dir) {
  const prim = flatten(readJson(dir, 'primitives.tokens.json') ?? {});
  const light = flatten(readJson(dir, 'semantic.light.tokens.json') ?? {});
  const dark = flatten(readJson(dir, 'semantic.dark.tokens.json') ?? {});
  const comp = flatten(readJson(dir, 'component.tokens.json') ?? {});
  if (!Object.keys(prim).length || !Object.keys(light).length) {
    throw new Error(`Folder ${dir} has no primitives.tokens.json or semantic.light.tokens.json.`);
  }
  const layerOf = (path) => (path in comp ? 'component' : path in light ? 'semantic' : path in prim ? 'primitives' : null);
  const variables = [];
  const unsupported = [];

  const entry = (layer, path, perMode) => {
    const baseType = perMode[0].tok.type;
    const values = {};
    let figmaType = null;
    for (const { mode, tok } of perMode) {
      const a = typeof tok.value === 'string' && tok.value.match(ALIAS);
      if (a) {
        const target = a[1];
        const targetLayer = layerOf(target);
        if (!targetLayer) throw new Error(`${path}: alias to a missing token {${target}}`);
        values[mode] = { alias: toFigmaName(target), collection: COLLECTIONS[targetLayer].name };
        continue;
      }
      const conv = convertValue(tok.type ?? baseType, tok.value);
      if (!conv) { unsupported.push({ token: path, type: tok.type, value: tok.value }); return; }
      figmaType = conv.type;
      values[mode] = { value: conv.value };
    }
    variables.push({
      collection: COLLECTIONS[layer].name, name: toFigmaName(path), dtcg_type: baseType, type: figmaType,
      scopes: scopesFor(path, layer), description: perMode[0].tok.description ?? '', values,
    });
  };

  for (const [p, tok] of Object.entries(prim)) entry('primitives', p, [{ mode: 'Valor', tok }]);
  for (const [p, tok] of Object.entries(light)) entry('semantic', p, [{ mode: 'Claro', tok }, { mode: 'Escuro', tok: dark[p] ?? tok }]);
  for (const [p, tok] of Object.entries(comp)) entry('component', p, [{ mode: 'Valor', tok }]);

  // Variable type of a pure alias: inherited from the target.
  const byName = Object.fromEntries(variables.map((v) => [v.name, v]));
  const typeOf = (v, seen = new Set()) => {
    if (v.type) return v.type;
    if (seen.has(v.name)) return null;
    seen.add(v.name);
    const target = Object.values(v.values).find((x) => x.alias);
    return target && byName[target.alias] ? typeOf(byName[target.alias], seen) : null;
  };
  for (const v of variables) v.type = typeOf(v);
  // Alias to an unsupported token (e.g. a dimension in ch) → also unsupported.
  const valid = variables.filter((v) => {
    if (v.type) return true;
    unsupported.push({ token: toDtcgPath(v.name), type: v.dtcg_type, value: 'alias to an unsupported token' });
    return false;
  });

  const order = ['Primitivos', 'Semântico', 'Componente'];
  valid.sort((a, b) => order.indexOf(a.collection) - order.indexOf(b.collection));
  return {
    collections: Object.values(COLLECTIONS).filter((c) => valid.some((v) => v.collection === c.name)),
    variables: valid,
    unsupported,
    summary: Object.fromEntries(order.map((c) => [c, valid.filter((v) => v.collection === c).length])),
  };
}

/** Idempotent script for `use_figma`. */
export function generateScript(plan) {
  return `// Generated by tools/figma/tokens-to-figma.mjs. Paste into use_figma (load the figma-use skill first).
// Idempotent: reuses collection/mode/variable by name. It writes to the file: respect the turn guard (turn-guard).
const PLAN = ${JSON.stringify({ collections: plan.collections, variables: plan.variables })};

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const collection = {}, mode = {}, variable = {};
for (const c of PLAN.collections) {
  let col = cols.find(x => x.name === c.name) || figma.variables.createVariableCollection(c.name);
  // The first mode of a new collection is called "Mode 1": rename it instead of creating another.
  c.modes.forEach((m, i) => {
    let found = col.modes.find(x => x.name === m);
    if (!found && i === 0 && col.modes.length === 1 && !c.modes.includes(col.modes[0].name)) {
      col.renameMode(col.modes[0].modeId, m); found = col.modes[0];
    }
    const id = found ? found.modeId : col.addMode(m);
    mode[c.name + '/' + m] = id;
  });
  collection[c.name] = col;
}
let created = 0, updated = 0;
for (const v of PLAN.variables) {
  const col = collection[v.collection];
  let x = vars.find(y => y.name === v.name && y.variableCollectionId === col.id);
  if (!x) { x = figma.variables.createVariable(v.name, col, v.type); created++; } else updated++;
  variable[v.collection + '/' + v.name] = x;
  if (v.description) x.description = v.description;
  x.scopes = v.scopes;
}
const pending = [];
for (const v of PLAN.variables) {
  const x = variable[v.collection + '/' + v.name];
  for (const [m, val] of Object.entries(v.values)) {
    const modeId = mode[v.collection + '/' + m];
    if (val.alias) {
      const target = variable[val.collection + '/' + val.alias];
      if (!target) { pending.push(v.name + ' → ' + val.alias); continue; }
      x.setValueForMode(modeId, figma.variables.createVariableAlias(target));
    } else x.setValueForMode(modeId, val.value);
  }
}
return { created, updated, pending, collections: PLAN.collections.map(c => c.name) };
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseCli('figma/tokens-to-figma.mjs'); // aliases with a warning for old names
  const result = plan(a.tokens ?? 'tokens');
  if (a.script) console.log(generateScript(result));
  else console.log(JSON.stringify(result, null, 2));
  if (result.unsupported.length) {
    console.error(`\n${result.unsupported.length} token(s) with no equivalent variable (they become styles or stay in code only): ` +
      result.unsupported.map((n) => n.token).join(', '));
  }
}
