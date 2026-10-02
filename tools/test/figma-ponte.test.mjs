import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planejar, gerarScript } from '../figma/tokens-para-figma.mjs';
import { comparar, aplicar, paraDtcg } from '../figma/figma-para-tokens.mjs';

/** Figma falso, só com a API de variáveis usada pelo script gerado. */
function figmaFalso() {
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
const rodar = (script, figma) => new Function('figma', `return (async () => {${script}})()`)(figma);

/** Snapshot equivalente ao que tools/figma/snapshot.js devolveria para as variáveis do falso. */
function snapshotDe({ cols, vars }) {
  const nomeVar = Object.fromEntries(vars.map((v) => [v.id, v.name]));
  const modos = {};
  cols.forEach((c) => c.modes.forEach((m) => (modos[m.modeId] = `${c.name}/${m.name}`)));
  const hx = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  const variables = {};
  for (const v of vars) {
    variables[v.name] = {};
    for (const [m, raw] of Object.entries(v.valuesByMode)) {
      variables[v.name][modos[m]] = raw?.type === 'VARIABLE_ALIAS' ? '→' + nomeVar[raw.id]
        : raw?.r != null ? (raw.a === 1 ? hx(raw) : `${hx(raw)}/${raw.a}`) : raw;
    }
  }
  return { mode: 'full', variables };
}

test('tokens → Figma: 3 coleções, modos e aliases', () => {
  const p = planejar('tokens');
  assert.deepEqual(p.colecoes.map((c) => c.nome), ['Primitivos', 'Semântico', 'Componente']);
  const texto = p.variaveis.find((v) => v.nome === 'color/text/primary');
  assert.equal(texto.valores.Claro.alias, 'color/neutral/950');
  assert.equal(texto.valores.Escuro.alias, 'color/neutral/50');
  assert.deepEqual(texto.scopes, ['TEXT_FILL']);
  assert.deepEqual(p.variaveis.find((v) => v.nome === 'color/brand/600').scopes, []);
});

test('script gerado roda, é idempotente e resolve aliases', async () => {
  const f = figmaFalso();
  const script = gerarScript(planejar('tokens'));
  const r1 = await rodar(script, f.api);
  assert.equal(r1.pendentes.length, 0);
  assert.ok(r1.criadas > 150);
  const r2 = await rodar(script, f.api);
  assert.equal(r2.criadas, 0);
  assert.equal(f.cols.length, 3);
  assert.deepEqual(f.cols.find((c) => c.name === 'Semântico').modes.map((m) => m.name), ['Claro', 'Escuro']);
});

test('ida e volta sem mudança: nenhum diff de token', async () => {
  const f = figmaFalso();
  await rodar(gerarScript(planejar('tokens')), f.api);
  const r = comparar(snapshotDe(f), 'tokens');
  assert.deepEqual(r.mudancas, []);
  assert.deepEqual(r.novos, []);
});

test('mudança no Figma vira diff DTCG e o gate de contraste reprova valor ruim', async () => {
  const f = figmaFalso();
  await rodar(gerarScript(planejar('tokens')), f.api);
  const snap = snapshotDe(f);
  snap.variables['color/action/primary']['Semântico/Claro'] = '→color/brand/400'; // clarear o botão primário
  snap.variables['space/stack-md']['Semântico/Claro'] = '→space/3';
  const r = comparar(snap, 'tokens');
  assert.deepEqual(r.mudancas.map((m) => [m.token, m.depois]).sort(), [
    ['color.action.primary', '{color.brand.400}'], ['space.stack-md', '{space.3}'],
  ]);
  const dir = mkdtempSync(join(tmpdir(), 'dsx-tk-'));
  try {
    cpSync('tokens', dir, { recursive: true });
    aplicar(r.mudancas, dir);
    const claro = JSON.parse(readFileSync(join(dir, 'semantic.light.tokens.json'), 'utf8'));
    assert.equal(claro.color.action.primary.$value, '{color.brand.400}');
    const { useTokensDir, build, checkContrast } = await import('../build-tokens.mjs');
    useTokensDir(dir);
    const falhas = checkContrast(build().resolved).filter((x) => !x.ok);
    useTokensDir(join(process.cwd(), 'tokens'));
    assert.ok(falhas.some((x) => x.bg === 'color.action.primary'), 'brand.400 com texto branco deve reprovar');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('conversão de valores do snapshot', () => {
  assert.equal(paraDtcg('#0F172A/0.6', 'color'), '#0f172a99');
  assert.equal(paraDtcg(16, 'dimension'), '16px');
  assert.equal(paraDtcg('→color/brand/600', 'color'), '{color.brand.600}');
});
