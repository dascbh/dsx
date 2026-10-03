import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { lintUxMd, ARQUETIPOS } from '../lint-ux-md.mjs';

const exemplo = readFileSync('examples/UX.md', 'utf8');
const SEM_PASTA = { arquetiposDir: join(tmpdir(), 'dsx-sem-arquetipos-inexistente') };
const tem = (r, trecho) => r.errors.some((e) => e.includes(trecho));

test('lint UX.md: exemplo aprovado (com e sem a pasta de arquétipos)', () => {
  const r = lintUxMd(exemplo);
  assert.equal(r.ok, true, r.errors.join('\n'));
  assert.equal(r.info.secoes.length, 13);
  assert.equal(lintUxMd(exemplo, SEM_PASTA).ok, true);
});

test('lint UX.md: template reprovado por placeholders', () => {
  const r = lintUxMd(readFileSync('templates/UX.md', 'utf8'), SEM_PASTA);
  assert.equal(r.ok, false);
  assert.ok(tem(r, 'placeholder'));
});

test('lint UX.md: sem persona reprova', () => {
  const md = exemplo.replace(/^  persona: .*\n/m, '');
  assert.ok(tem(lintUxMd(md, SEM_PASTA), 'produto.persona'));
});

test('lint UX.md: seção faltando e seção fora de ordem reprovam', () => {
  const semFluxos = exemplo.replace(/^## Fluxos$/m, '## Jornadas');
  assert.ok(tem(lintUxMd(semFluxos, SEM_PASTA), 'Seção obrigatória ausente: "## Fluxos"'));
  const trocada = exemplo.replace('## Visão geral', '## TMP').replace('## Personas e tarefas', '## Visão geral').replace('## TMP', '## Personas e tarefas');
  assert.ok(tem(lintUxMd(trocada, SEM_PASTA), 'fora de ordem'));
});

test('lint UX.md: títulos em inglês são aceitos', () => {
  const en = exemplo.replace('## Visão geral', '## Overview').replace('## Faça e não faça', "## Do's and Don'ts");
  assert.equal(lintUxMd(en, SEM_PASTA).ok, true);
});

test('lint UX.md: enum inválido e tipo errado reprovam; chave desconhecida avisa', () => {
  const md = exemplo
    .replace('registro: operacional', 'registro: corporativo')
    .replace('primarias-por-regiao: 1', 'primarias-por-regiao: muitas')
    .replace('  densidade: alta\n', '  densidade: alta\n  humor: sereno\n');
  const r = lintUxMd(md, SEM_PASTA);
  assert.ok(tem(r, 'produto.registro: valor "corporativo"'));
  assert.ok(tem(r, 'acoes.primarias-por-regiao'));
  assert.ok(r.warnings.some((w) => w.includes('produto.humor')));
});

test('lint UX.md: arquétipo inexistente reprova (lista fixa e pasta)', () => {
  const md = exemplo.replace('biblioteca: ["/modelos"]', 'galeria-magica: ["/modelos"]');
  assert.ok(tem(lintUxMd(md, SEM_PASTA), 'arquetipos.galeria-magica'));
  const pasta = mkdtempSync(join(tmpdir(), 'dsx-arq-'));
  for (const id of ARQUETIPOS) writeFileSync(join(pasta, `${id}.md`), `# ${id}\n`);
  assert.ok(tem(lintUxMd(md, { arquetiposDir: pasta }), 'arquetipos.galeria-magica'));
  assert.equal(lintUxMd(exemplo, { arquetiposDir: pasta }).warnings.some((w) => w.includes('sem cartão')), false);
});

test('lint UX.md: Faça/Não faça com menos de 3 itens reprova; texto vago avisa', () => {
  const md = exemplo
    .replace(/- Use o número do contrato como título[^\n]*\n/, '')
    .replace(/- Devolva a lista com filtros[^\n]*\n/, '')
    .replace('Tom direto,', 'Tom intuitivo e direto,');
  const r = lintUxMd(md, SEM_PASTA);
  assert.ok(tem(r, 'Bloco "Faça" com 2'));
  assert.ok(r.warnings.some((w) => w.includes('intuitivo')));
});
