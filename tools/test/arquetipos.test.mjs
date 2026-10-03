import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCard, lintCard, lintArquetipos, loadArquetipos, loadPatternIds, buildIndex, section } from '../lint-arquetipos.mjs';
import { readFileSync } from 'node:fs';

const IDS = [
  'lista-operacional', 'mestre-detalhe', 'documento-com-visor', 'editor-com-painel', 'assistente-em-etapas',
  'painel-de-acompanhamento', 'biblioteca', 'configuracoes', 'pagina-publica-de-decisao', 'dialogo-de-formulario',
  'dialogo-de-confirmacao', 'painel-lateral-de-detalhe',
];
const PATTERNS = new Set(['estado-vazio', 'fechar-modal']);

const FM = {
  id: 'exemplo',
  titulo: 'Exemplo',
  resumo: 'Uma tela de exemplo.',
  registro: '[operacional]',
  'quando-usar': 'SE a tarefa é de exemplo ENTÃO use este arquétipo',
  'evitar-quando': 'não for exemplo',
  regioes: '[cabecalho-da-pagina, conteudo]',
  'acao-primaria': '{ regiao: cabecalho-da-pagina, posicao: topo-direita, max: 1 }',
  estados: '[carregando, erro]',
  padroes: '[estado-vazio, fechar-modal]',
  variacoes: '[arranjo-a, arranjo-b]',
  regras: '[T1, F5]',
};

const BODY = `# Exemplo

## Quando usar

- **SE** a tarefa é de exemplo **ENTÃO** use.

## Mapa de regiões

\`\`\`
┌────────┐
│ conteudo│
└────────┘
\`\`\`

## O que vai em cada região

- **cabecalho-da-pagina** — título.
- **conteudo** — o resto.

## Ações

- Uma primária.

## Estados

- **carregando** — esqueleto.
- **erro** — alerta.

## Variações

### arranjo-a
**Favorece:** algo.
**Piora:** outra coisa.

### arranjo-b
**Favorece:** algo.
**Piora:** outra coisa.

## Anti-padrões

- Nada.

## Checklist

- [ ] Ok.
`;

function card({ fm = {}, drop = [], body = BODY, slug = 'exemplo' } = {}) {
  const merged = { ...FM, ...fm };
  for (const k of drop) delete merged[k];
  const yaml = Object.entries(merged).map(([k, v]) => `${k}: ${v}`).join('\n');
  return parseCard(`---\n${yaml}\n---\n${body}`, slug);
}
const errs = (c) => lintCard(c, PATTERNS);
const has = (list, re) => list.some((m) => re.test(m));

test('arquétipos: cartão mínimo válido passa', () => {
  assert.deepEqual(errs(card()), []);
});

test('arquétipos: campo obrigatório ausente reprova', () => {
  assert.ok(has(errs(card({ drop: ['resumo'] })), /chave obrigatória ausente: resumo/));
  assert.ok(has(errs(card({ drop: ['acao-primaria'] })), /acao-primaria/));
});

test('arquétipos: padrão inexistente reprova', () => {
  assert.ok(has(errs(card({ fm: { padroes: '[estado-vazio, nao-existe]' } })), /padrão inexistente.*nao-existe/));
});

test('arquétipos: regra fora de T1–T7/F1–F5 reprova', () => {
  assert.ok(has(errs(card({ fm: { regras: '[T1, T8]' } })), /regra "T8"/));
  assert.ok(has(errs(card({ fm: { regras: '[F6]' } })), /regra "F6"/));
});

test('arquétipos: menos de 2 variações reprova', () => {
  assert.ok(has(errs(card({ fm: { variacoes: '[arranjo-a]' } })), /ao menos 2/));
});

test('arquétipos: variação sem Favorece/Piora ou sem bloco reprova', () => {
  const semPiora = BODY.replace(/(### arranjo-b\n\*\*Favorece:\*\* algo\.\n)\*\*Piora:\*\* outra coisa\./, '$1');
  assert.ok(has(errs(card({ body: semPiora })), /arranjo-b.*Piora/));
  assert.ok(has(errs(card({ fm: { variacoes: '[arranjo-a, arranjo-c]' } })), /arranjo-c.*sem bloco/));
});

test('arquétipos: seção ausente e fora de ordem reprovam', () => {
  assert.ok(has(errs(card({ body: BODY.replace('## Anti-padrões', '## Outra coisa') })), /seção ausente: ## Anti-padrões/));
  const trocado = BODY.replace('## Ações\n\n- Uma primária.\n', '').replace('## Checklist', '## Ações\n\n- Uma primária.\n\n## Checklist');
  assert.ok(has(errs(card({ body: trocado })), /fora da ordem/));
});

test('arquétipos: URL reprova', () => {
  assert.ok(has(errs(card({ body: BODY.replace('- Nada.', '- Veja https://exemplo.com.') })), /URL/));
});

test('arquétipos: acao-primaria com região desconhecida ou posição inválida reprova', () => {
  assert.ok(has(errs(card({ fm: { 'acao-primaria': '{ regiao: rodape, posicao: topo-direita, max: 1 }' } })), /não está em regioes/));
  assert.ok(has(errs(card({ fm: { 'acao-primaria': '{ regiao: conteudo, posicao: meio, max: 1 }' } })), /posicao "meio"/));
});

test('arquétipos: região ou estado sem descrição no corpo reprova', () => {
  assert.ok(has(errs(card({ fm: { regioes: '[cabecalho-da-pagina, conteudo, rodape]' } })), /região "rodape"/));
  assert.ok(has(errs(card({ fm: { estados: '[carregando, erro, vazio]' } })), /estado "vazio"/));
});

test('arquétipos: id diferente do arquivo, registro fora do enum e quando-usar sem SE/ENTÃO reprovam', () => {
  assert.ok(has(errs(card({ slug: 'outro' })), /difere do nome do arquivo/));
  assert.ok(has(errs(card({ fm: { registro: '[industrial]' } })), /registro "industrial"/));
  assert.ok(has(errs(card({ fm: { 'quando-usar': 'sempre que quiser' } })), /SE … ENTÃO/));
});

test('arquétipos: front matter ausente reprova', () => {
  assert.ok(has(lintCard(parseCard(BODY, 'exemplo'), PATTERNS), /sem front matter/));
});

test('arquétipos: section() isola o corpo de uma seção', () => {
  assert.match(section(BODY, 'Ações'), /Uma primária/);
  assert.equal(section(BODY, 'Inexistente'), null);
});

test('catálogo: os 12 arquétipos existem e passam no linter', () => {
  const cards = loadArquetipos();
  assert.deepEqual(cards.map((c) => c.slug).sort(), [...IDS].sort());
  assert.deepEqual(lintArquetipos(cards, loadPatternIds()), []);
});

test('catálogo: arquetipos/index.json está em dia com os cartões', () => {
  const atual = JSON.parse(readFileSync('arquetipos/index.json', 'utf8'));
  assert.deepEqual(atual, buildIndex(loadArquetipos()));
});
