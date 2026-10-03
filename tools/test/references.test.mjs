import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classify, evaluate } from '../references.mjs';
import { parseCli } from '../lib/legacy-cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'references', 'design-md');
const REGISTERS = ['operational', 'consumer', 'editorial', 'brand', 'experimental'];

test('classify: generic use case does not make a style operational', () => {
  const r = classify({ title: 'Art Nouveau Florido', use_case: 'Landing pages, SaaS', type: 'Arte & Ilustracao', style_type: 'Ornamental', keywords: 'floral' });
  assert.notEqual(r.register, 'operational');
  assert.equal(r.experimental, true);
});

test('classify: financial dashboard is operational', () => {
  const r = classify({ title: 'Financial Dashboard', description: 'Painel financeiro denso', use_case: 'Fintechs, dashboards', type: 'Dados & Infografico', style_type: 'Data-dense', keywords: 'charts' });
  assert.equal(r.register, 'operational');
  assert.ok(['light', 'dark', 'light-and-dark'].includes(r.theme));
});

test('evaluate: a component contrast failure lowers the score', () => {
  // parte de um curado aprovado e força o texto do 1º componente a ficar igual ao fundo
  const good = readFileSync(join(DIR, 'designmd-app', 'polaris.md'), 'utf8');
  const bg = good.match(/backgroundColor:\s*("?\{colors\.[\w-]+\}"?)/)[1];
  const bad = good.replace(/(textColor:\s*)("?\{colors\.[\w-]+\}"?)/, `$1${bg}`);
  const a = evaluate(good);
  const b = evaluate(bad);
  assert.equal(a.contrast_failures.length, 0);
  assert.ok(b.contrast_failures.length >= 1);
  assert.ok(b.score < a.score);
});

test('curated: each copy exists, carries CC BY 4.0 credit and matches curated.json', () => {
  const curated = JSON.parse(readFileSync(join(DIR, 'curated.json'), 'utf8')).items;
  const files = readdirSync(join(DIR, 'designmd-app')).filter((f) => f.endsWith('.md'));
  assert.equal(files.length, curated.length);
  for (const c of curated) {
    const md = readFileSync(join(DIR, c.file), 'utf8');
    assert.match(md, /CC BY 4\.0/, `${c.slug} sem crédito`);
    assert.match(md, /designmd\.app\/library\//, `${c.slug} sem origem`);
    assert.ok(md.startsWith('---'), `${c.slug} sem front matter`);
    assert.ok(REGISTERS.includes(c.register), `${c.slug}: register "${c.register}"`);
  }
});

test('index: complete metadata and DSX classification present', () => {
  const { items, total } = JSON.parse(readFileSync(join(DIR, 'index.json'), 'utf8'));
  assert.equal(items.length, total);
  for (const x of items) {
    assert.ok(x.slug && x.title && x.url, `item incompleto: ${JSON.stringify(x).slice(0, 80)}`);
    assert.ok(REGISTERS.includes(x.dsx.register));
    assert.ok(['light', 'dark', 'light-and-dark'].includes(x.dsx.theme));
  }
});

test('cli: legacy subcommand, flags and values are mapped with a warning', () => {
  const warnings = [];
  const a = parseCli('references.mjs', ['buscar', '--registro', 'operacional', '--uso', 'dashboard', '--tema', 'escuro', '--curados'], (m) => warnings.push(m));
  assert.deepEqual(a, { _: ['search'], register: 'operational', use: 'dashboard', theme: 'dark', curated: true });
  assert.ok(warnings.every((w) => /nome antigo, use/.test(w)));
  assert.equal(warnings.length, 7);
});
