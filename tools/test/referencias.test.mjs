import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classificar, avaliar } from '../referencias.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PASTA = join(RAIZ, 'referencias', 'design-md');

test('classificar: caso de uso genérico não torna um estilo operacional', () => {
  const r = classificar({ title: 'Art Nouveau Florido', use_case: 'Landing pages, SaaS', type: 'Arte & Ilustracao', style_type: 'Ornamental', keywords: 'floral' });
  assert.notEqual(r.registro, 'operacional');
  assert.equal(r.experimental, true);
});

test('classificar: dashboard financeiro é operacional', () => {
  const r = classificar({ title: 'Financial Dashboard', description: 'Painel financeiro denso', use_case: 'Fintechs, dashboards', type: 'Dados & Infografico', style_type: 'Data-dense', keywords: 'charts' });
  assert.equal(r.registro, 'operacional');
});

test('avaliar: contraste reprovado num componente derruba a nota', () => {
  // parte de um curado aprovado e força o texto do 1º componente a ficar igual ao fundo
  const bom = readFileSync(join(PASTA, 'designmd-app', 'polaris.md'), 'utf8');
  const fundo = bom.match(/backgroundColor:\s*("?\{colors\.[\w-]+\}"?)/)[1];
  const ruim = bom.replace(/(textColor:\s*)("?\{colors\.[\w-]+\}"?)/, `$1${fundo}`);
  const a = avaliar(bom);
  const b = avaliar(ruim);
  assert.equal(a.contrasteReprovado.length, 0);
  assert.ok(b.contrasteReprovado.length >= 1);
  assert.ok(b.nota < a.nota);
});

test('curados: cada cópia existe, tem crédito CC BY 4.0 e bate com curados.json', () => {
  const curados = JSON.parse(readFileSync(join(PASTA, 'curados.json'), 'utf8')).itens;
  const arquivos = readdirSync(join(PASTA, 'designmd-app')).filter((f) => f.endsWith('.md'));
  assert.equal(arquivos.length, curados.length);
  for (const c of curados) {
    const md = readFileSync(join(PASTA, c.arquivo), 'utf8');
    assert.match(md, /CC BY 4\.0/, `${c.slug} sem crédito`);
    assert.match(md, /designmd\.app\/library\//, `${c.slug} sem origem`);
    assert.ok(md.startsWith('---'), `${c.slug} sem front matter`);
  }
});

test('índice: metadados completos e classificação presente', () => {
  const { itens, total } = JSON.parse(readFileSync(join(PASTA, 'indice.json'), 'utf8'));
  assert.equal(itens.length, total);
  for (const x of itens) {
    assert.ok(x.slug && x.titulo && x.url, `item incompleto: ${JSON.stringify(x).slice(0, 80)}`);
    assert.ok(['operacional', 'consumo', 'editorial', 'marca', 'experimental'].includes(x.dsx.registro));
  }
});
