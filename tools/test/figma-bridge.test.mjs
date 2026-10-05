import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { plan, generateScript } from '../figma/tokens-to-figma.mjs';
import { compare, apply, toDtcg } from '../figma/figma-to-tokens.mjs';

/** Fake Figma, with only the variables API the generated script uses. */
function fakeFigma() {
  const cols = [], vars = [];
  let n = 0;
  const api = {
    variables: {
      getLocalVariableCollectionsAsync: async () => cols,
      getLocalVariablesAsync: async () => vars,
      createVariableCollection(name) {
        const c = { id: `c${n++}`, name, modes: [{ modeId: `m${n++}`, name: 'Mode 1' }],
          renameMode(id, nm) { this.modes.find((m) => m.modeId === id).name = nm; },
          addMode(nm) { const id = `m${n++}`; this.modes.push({ modeId: id, name: nm }); return id; } };
        cols.push(c); return c;
      },
      createVariable(name, col, type) {
        const v = { id: `v${n++}`, name, variableCollectionId: col.id, resolvedType: type, valuesByMode: {}, scopes: [],
          setValueForMode(m, val) { this.valuesByMode[m] = val; } };
        vars.push(v); return v;
      },
      createVariableAlias: (v) => ({ type: 'VARIABLE_ALIAS', id: v.id }),
    },
  };
  return { api, cols, vars };
}
const run = (script, figma) => new Function('figma', `return (async () => {${script}})()`)(figma);

/** Snapshot equivalent to what tools/figma/snapshot.js would return for the fake's variables. */
function snapshotOf({ cols, vars }) {
  const varName = Object.fromEntries(vars.map((v) => [v.id, v.name]));
  const modes = {};
  cols.forEach((c) => c.modes.forEach((m) => (modes[m.modeId] = `${c.name}/${m.name}`)));
  const hx = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  const variables = {};
  for (const v of vars) {
    variables[v.name] = {};
    for (const [m, raw] of Object.entries(v.valuesByMode)) {
      variables[v.name][modes[m]] = raw?.type === 'VARIABLE_ALIAS' ? '→' + varName[raw.id]
        : raw?.r != null ? (raw.a === 1 ? hx(raw) : `${hx(raw)}/${raw.a}`) : raw;
    }
  }
  return { mode: 'full', variables };
}

test('tokens → Figma: 3 collections, modes and aliases', () => {
  const p = plan('tokens');
  assert.deepEqual(p.collections.map((c) => c.name), ['Primitivos', 'Semântico', 'Componente']);
  const text = p.variables.find((v) => v.name === 'color/text/primary');
  assert.equal(text.values.Claro.alias, 'color/neutral/950');
  assert.equal(text.values.Escuro.alias, 'color/neutral/50');
  assert.deepEqual(text.scopes, ['TEXT_FILL']);
  assert.deepEqual(p.variables.find((v) => v.name === 'color/brand/600').scopes, []);
});

test('generated script runs, is idempotent and resolves aliases', async () => {
  const f = fakeFigma();
  const script = generateScript(plan('tokens'));
  const r1 = await run(script, f.api);
  assert.equal(r1.pending.length, 0);
  assert.ok(r1.created > 150);
  const r2 = await run(script, f.api);
  assert.equal(r2.created, 0);
  assert.equal(f.cols.length, 3);
  assert.deepEqual(f.cols.find((c) => c.name === 'Semântico').modes.map((m) => m.name), ['Claro', 'Escuro']);
});

test('round trip without change: no token diff', async () => {
  const f = fakeFigma();
  await run(generateScript(plan('tokens')), f.api);
  const r = compare(snapshotOf(f), 'tokens');
  assert.deepEqual(r.changes, []);
  assert.deepEqual(r.added, []);
});

test('Figma change becomes a DTCG diff and the contrast gate rejects a bad value', async () => {
  const f = fakeFigma();
  await run(generateScript(plan('tokens')), f.api);
  const snap = snapshotOf(f);
  snap.variables['color/action/primary']['Semântico/Claro'] = '→color/brand/400'; // clarear o botão primário
  snap.variables['space/stack-md']['Semântico/Claro'] = '→space/3';
  const r = compare(snap, 'tokens');
  assert.deepEqual(r.changes.map((m) => [m.token, m.after]).sort(), [
    ['color.action.primary', '{color.brand.400}'], ['space.stack-md', '{space.3}'],
  ]);
  const dir = mkdtempSync(join(tmpdir(), 'dsx-tk-'));
  try {
    cpSync('tokens', dir, { recursive: true });
    apply(r.changes, dir);
    const light = JSON.parse(readFileSync(join(dir, 'semantic.light.tokens.json'), 'utf8'));
    assert.equal(light.color.action.primary.$value, '{color.brand.400}');
    const { useTokensDir, build, checkContrast } = await import('../build-tokens.mjs');
    useTokensDir(dir);
    const failures = checkContrast(build().resolved).filter((x) => !x.ok);
    useTokensDir(join(process.cwd(), 'tokens'));
    assert.ok(failures.some((x) => x.bg === 'color.action.primary'), 'brand.400 with white text must fail');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('snapshot value conversion', () => {
  assert.equal(toDtcg('#0F172A/0.6', 'color'), '#0f172a99');
  assert.equal(toDtcg(16, 'dimension'), '16px');
  assert.equal(toDtcg('→color/brand/600', 'color'), '{color.brand.600}');
});
