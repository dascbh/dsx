import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'figma', 'diff-baseline.cjs');

/** Synthetic snapshot in the tools/figma/snapshot.js format, MODE 'full'. */
function snapshot({ pad, title, cardName = () => 'SectionCard · X', legacy = false }) {
  const frame = (id, page, name, txt) => {
    const nodes = {
      [`${id}:0`]: { n: name, t: 'FRAME', l: 'VERTICAL|0|0|0|0|0|MIN|MIN|NO_WRAP|', s: 'FIXED/HUG', w: 1440, p: `${page}/${name}[1]`, c: [`${id}:1`, `${id}:2`] },
      [`${id}:1`]: { n: cardName(id), t: 'FRAME', l: `VERTICAL|${pad}|16|${pad}|16|8|MIN|MIN|NO_WRAP|`, s: 'FILL/HUG', p: `${page}/${name}[1]/card[1]` },
      [`${id}:2`]: { n: 'Título', t: 'TEXT', txt, fs: 20, fw: 'Bold', ff: 'Inter', lh: 'AUTO', ls: '0P', ta: 'LEFT', p: `${page}/${name}[1]/Título[1]` },
    };
    return legacy
      ? { hash: `${name}|${pad}|${txt}`, n: 3, nos: nodes }
      : { hash: `${name}|${pad}|${txt}`, n: 3, nodes };
  };
  const vars = { 'space/stack-md': { 'Primitivos/Valor': 16 } };
  const frames = {
    '02 · Demandas › Lista': frame('1', '02 · Demandas', 'Lista', 'Demandas'),
    '02 · Demandas › Detalhe': frame('2', '02 · Demandas', 'Detalhe', title),
  };
  return legacy
    ? { fileKey: 'abc', modo: 'completo', variaveis: vars, estilos: {}, frames }
    : { fileKey: 'abc', mode: 'full', variables: vars, styles: {}, frames };
}

function runDiff(before, after) {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-figma-diff-'));
  const a = join(dir, 'base.json'), b = join(dir, 'atual.json');
  writeFileSync(a, JSON.stringify(before));
  writeFileSync(b, JSON.stringify(after));
  return execFileSync(process.execPath, [SCRIPT, a, b], { encoding: 'utf8' });
}

/** Cuts a `## …` section of the report up to the next one. */
const section = (report, heading) => {
  const i = report.indexOf(heading);
  if (i < 0) return null;
  const rest = report.slice(i + heading.length);
  const j = rest.search(/\n## /);
  return j < 0 ? rest : rest.slice(0, j);
};

test('Figma diff: same change in 2 frames is a primitive; single change is a composition', () => {
  const report = runDiff(snapshot({ pad: 16, title: 'Demandas' }), snapshot({ pad: 12, title: 'Demanda em risco' }));

  const prim = section(report, '## Grouped (≥ 2 frames): class `primitive`');
  assert.ok(prim, 'primitive section missing:\n' + report);
  assert.match(prim, /`SectionCard` · auto-layout · padTop 16 → 12, padBottom 16 → 12 · \*\*2 frames\*\*/);

  const comp = section(report, '## Per frame: class `composition`');
  assert.ok(comp, 'composition section missing:\n' + report);
  assert.match(comp, /### 02 · Demandas › Detalhe\n- `Título` · text: Demandas → Demanda em risco/);
  assert.doesNotMatch(comp, /SectionCard/, 'a grouped change must not reappear as a composition');
  assert.doesNotMatch(comp, /Lista/, 'a frame with only grouped changes is not a composition');

  assert.match(report, /## Tokens and styles\n\nNo change\./);
});

test('Figma diff: same change under names without a common family flags a naming problem', () => {
  const cardName = (id) => (id === '1' ? 'CardA' : 'CardB');
  const report = runDiff(snapshot({ pad: 16, title: 'x', cardName }), snapshot({ pad: 12, title: 'x', cardName }));
  assert.equal(section(report, '## Grouped (≥ 2 frames): class `primitive`'), null);
  const naming = section(report, '## Possible naming problem');
  assert.ok(naming, 'naming section missing:\n' + report);
  assert.match(naming, /\*\*2 frames in total\*\*, spread over: /);
  assert.match(naming, /`CardA`/);
  assert.match(naming, /`CardB`/);
});

test('Figma diff: accepts legacy baseline with pt-BR keys', () => {
  const report = runDiff(snapshot({ pad: 16, title: 'Demandas', legacy: true }), snapshot({ pad: 12, title: 'Demandas' }));
  assert.match(report, /`SectionCard` · auto-layout · padTop 16 → 12, padBottom 16 → 12 · \*\*2 frames\*\*/);
  assert.doesNotMatch(report, /Changed, but the baseline has no detail/);
});
