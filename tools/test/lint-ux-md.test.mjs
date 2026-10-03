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
  const withoutFlows = example.replace(/^## Fluxos$/m, '## Jornadas');
  assert.ok(has(lintUxMd(withoutFlows, NO_DIR), 'Seção obrigatória ausente: "## Fluxos"'));
  const swapped = example.replace('## Visão geral', '## TMP').replace('## Personas e tarefas', '## Visão geral').replace('## TMP', '## Personas e tarefas');
  assert.ok(has(lintUxMd(swapped, NO_DIR), 'fora de ordem'));
});

test('UX.md lint: English section titles are accepted', () => {
  const en = example.replace('## Visão geral', '## Overview').replace('## Faça e não faça', "## Do's and Don'ts");
  assert.equal(lintUxMd(en, NO_DIR).ok, true);
});

test('UX.md lint: invalid enum and wrong type fail; unknown key warns', () => {
  const md = example
    .replace('register: operational', 'register: corporativo')
    .replace('primary-per-region: 1', 'primary-per-region: muitas')
    .replace('  density: high\n', '  density: high\n  mood: sereno\n');
  const r = lintUxMd(md, NO_DIR);
  assert.ok(has(r, 'product.register: valor "corporativo"'));
  assert.ok(has(r, 'actions.primary-per-region'));
  assert.ok(r.warnings.some((w) => w.includes('product.mood')));
});

test('UX.md lint: unknown archetype fails (fixed list and folder)', () => {
  const md = example.replace('library: ["/modelos"]', 'magic-gallery: ["/modelos"]');
  assert.ok(has(lintUxMd(md, NO_DIR), 'archetypes.magic-gallery'));
  const dir = mkdtempSync(join(tmpdir(), 'dsx-arq-'));
  for (const id of ARCHETYPES) writeFileSync(join(dir, `${id}.md`), `# ${id}\n`);
  assert.ok(has(lintUxMd(md, { archetypesDir: dir }), 'archetypes.magic-gallery'));
  assert.equal(lintUxMd(example, { archetypesDir: dir }).warnings.some((w) => w.includes('sem cartão')), false);
});

test('UX.md lint: Do/Do not with fewer than 3 items fails; vague text warns', () => {
  const md = example
    .replace(/- Use o número do contrato como título[^\n]*\n/, '')
    .replace(/- Devolva a lista com filtros[^\n]*\n/, '')
    .replace('Tom direto,', 'Tom intuitivo e direto,');
  const r = lintUxMd(md, NO_DIR);
  assert.ok(has(r, 'Bloco "Faça" com 2'));
  assert.ok(r.warnings.some((w) => w.includes('intuitivo')));
});

test('UX.md lint: legacy Portuguese front matter passes with "nome antigo" warnings', () => {
  const legacy = example
    .replace('product:\n', 'produto:\n').replace('  register: operational', '  registro: operacional').replace('  density: high', '  densidade: alta')
    .replace('actions:\n', 'acoes:\n').replace('  primary-position: top-right', '  posicao-primaria: topo-direita')
    .replace('  monitoring-dashboard: [', '  painel-de-acompanhamento: [').replace('archetypes:\n', 'arquetipos:\n')
    .replace('states: [loading, empty,', 'estados: [carregando, vazio,');
  const r = lintUxMd(legacy, NO_DIR);
  assert.equal(r.ok, true, r.errors.join('\n'));
  for (const w of ['nome antigo "produto", renomeie para "product"', 'valor antigo "operacional" em product.register', 'arquétipo com id antigo "painel-de-acompanhamento"', 'estado com nome antigo "carregando"']) {
    assert.ok(r.warnings.some((x) => x.toLowerCase().includes(w.toLowerCase())), w);
  }
  assert.equal(lintUxMd(example, NO_DIR).warnings.some((w) => /antig/.test(w)), false);
});
