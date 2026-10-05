import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { lintUxMd, ARCHETYPES } from '../lint-ux-md.mjs';

const example = readFileSync('examples/UX.md', 'utf8');
const NO_DIR = { archetypesDir: join(tmpdir(), 'dsx-no-archetypes-dir') };
const has = (r, snippet) => r.errors.some((e) => e.includes(snippet));

test('UX.md lint: example passes (with and without the archetypes folder)', () => {
  const r = lintUxMd(example);
  assert.equal(r.ok, true, r.errors.join('\n'));
  assert.equal(r.info.sections.length, 13);
  assert.equal(lintUxMd(example, NO_DIR).ok, true);
});

test('UX.md lint: template fails on placeholders', () => {
  const r = lintUxMd(readFileSync('templates/UX.md', 'utf8'), NO_DIR);
  assert.equal(r.ok, false);
  assert.ok(has(r, 'placeholder'));
});

test('UX.md lint: missing persona fails', () => {
  const md = example.replace(/^  persona: .*\n/m, '');
  assert.ok(has(lintUxMd(md, NO_DIR), 'product.persona'));
});

test('UX.md lint: missing and out-of-order sections fail', () => {
  const withoutFlows = example.replace(/^## Flows$/m, '## Journeys');
  assert.ok(has(lintUxMd(withoutFlows, NO_DIR), 'Missing required section: "## Flows"'));
  const swapped = example.replace('## Overview', '## TMP').replace('## Personas & Tasks', '## Overview').replace('## TMP', '## Personas & Tasks');
  assert.ok(has(lintUxMd(swapped, NO_DIR), 'out of order'));
});

test('UX.md lint: English and pt-BR section titles are both accepted', () => {
  const pt = example.replace('## Overview', '## Visão geral').replace("## Do's and Don'ts", '## Faça e não faça').replace('### Do\n', '### Faça\n').replace("### Don't\n", '### Não faça\n');
  assert.equal(lintUxMd(pt, NO_DIR).ok, true);
  // An all-pt-BR set of 13 headings (DSX ≤ 0.8) is still in the right order.
  const allPt = [['## Overview', '## Visão geral'], ['## Personas & Tasks', '## Personas e tarefas'], ['## Information Architecture', '## Arquitetura da informação'],
    ['## Navigation', '## Navegação'], ['## Screen Archetypes', '## Arquétipos de tela'], ['## Layout & Regions', '## Layout e regiões'], ['## Actions', '## Ações'],
    ['## Feedback & States', '## Feedback e estados'], ['## Forms', '## Formulários'], ['## Content & Microcopy', '## Conteúdo e microcopy'], ['## Flows', '## Fluxos'],
    ["## Do's and Don'ts", '## Faça e não faça'], ['## Agent Instructions', '## Instruções para agentes']]
    .reduce((md, [en, ptName]) => md.replace(new RegExp(`^${en.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&')}$`, 'm'), ptName), example);
  const r = lintUxMd(allPt, NO_DIR);
  assert.equal(r.ok, true, r.errors.join('\n'));
  assert.equal(r.info.sections.length, 13);
});

test('UX.md lint: content.language accepts pt-BR and en, rejects anything else', () => {
  const withLang = (v) => example.replace(/^  language: .*$/m, `  language: ${v}`);
  assert.match(example, /^  language: /m, 'the example declares content.language');
  assert.equal(lintUxMd(withLang('pt-BR'), NO_DIR).ok, true);
  assert.equal(lintUxMd(withLang('en'), NO_DIR).ok, true);
  const r = lintUxMd(withLang('fr'), NO_DIR);
  assert.ok(has(r, 'content.language: invalid value "fr"'), r.errors.join('\n'));
  assert.equal(lintUxMd(example, NO_DIR).warnings.some((w) => w.includes('content.language')), false, 'not an unknown key');
});

test('UX.md lint: invalid enum and wrong type fail; unknown key warns', () => {
  const md = example
    .replace('register: operational', 'register: corporativo')
    .replace('primary-per-region: 1', 'primary-per-region: muitas')
    .replace('  density: high\n', '  density: high\n  mood: sereno\n');
  const r = lintUxMd(md, NO_DIR);
  assert.ok(has(r, 'product.register: invalid value "corporativo"'));
  assert.ok(has(r, 'actions.primary-per-region'));
  assert.ok(r.warnings.some((w) => w.includes('product.mood')));
});

test('UX.md lint: unknown archetype fails (fixed list and folder)', () => {
  const md = example.replace('library: ["/catalog"]', 'magic-gallery: ["/catalog"]');
  assert.ok(has(lintUxMd(md, NO_DIR), 'archetypes.magic-gallery'));
  const dir = mkdtempSync(join(tmpdir(), 'dsx-arq-'));
  for (const id of ARCHETYPES) writeFileSync(join(dir, `${id}.md`), `# ${id}\n`);
  assert.ok(has(lintUxMd(md, { archetypesDir: dir }), 'archetypes.magic-gallery'));
  assert.equal(lintUxMd(example, { archetypesDir: dir }).warnings.some((w) => w.includes('without a card')), false);
});

test('UX.md lint: Do/Do not with fewer than 3 items fails; vague text warns', () => {
  const md = example
    .replace(/- Use the order number as the detail title[^\n]*\n/, '')
    .replace(/- Restore the list with filters[^\n]*\n/, '')
    .replace('Direct tone,', 'Intuitive and direct tone,');
  const r = lintUxMd(md, NO_DIR);
  assert.ok(has(r, '"Do" block with 2'));
  assert.ok(r.warnings.some((w) => w.includes('Intuitive')));
});

test('UX.md lint: legacy Portuguese front matter passes with "old name" warnings', () => {
  const legacy = example
    .replace('product:\n', 'produto:\n').replace('  register: operational', '  registro: operacional').replace('  density: high', '  densidade: alta')
    .replace('actions:\n', 'acoes:\n').replace('  primary-position: top-right', '  posicao-primaria: topo-direita')
    .replace('  monitoring-dashboard: [', '  painel-de-acompanhamento: [').replace('archetypes:\n', 'arquetipos:\n')
    .replace('states: [loading, empty,', 'estados: [carregando, vazio,');
  const r = lintUxMd(legacy, NO_DIR);
  assert.equal(r.ok, true, r.errors.join('\n'));
  for (const w of ['old name "produto", rename to "product"', 'old value "operacional" in product.register', 'archetype with old id "painel-de-acompanhamento"', 'state with old name "carregando"']) {
    assert.ok(r.warnings.some((x) => x.toLowerCase().includes(w.toLowerCase())), w);
  }
  assert.equal(lintUxMd(example, NO_DIR).warnings.some((w) => /\bold (name|value|id)\b/.test(w)), false);
});
