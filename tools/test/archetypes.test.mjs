import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCard, lintCard, lintArchetypes, loadArchetypes, loadPatternIds, buildIndex, section } from '../lint-archetypes.mjs';
import { readFileSync } from 'node:fs';

const IDS = [
  'operational-list', 'master-detail', 'document-viewer', 'editor-with-panel', 'step-wizard',
  'monitoring-dashboard', 'library', 'settings', 'public-decision-page', 'form-dialog',
  'confirmation-dialog', 'detail-side-panel',
];
const PATTERNS = new Set(['empty-state', 'close-modal']);

const FM = {
  id: 'example',
  title: 'Exemplo',
  summary: 'Uma tela de exemplo.',
  register: '[operational]',
  'when-to-use': 'SE a tarefa é de exemplo ENTÃO use este arquétipo',
  'avoid-when': 'não for exemplo',
  regions: '[page-header, content]',
  'primary-action': '{ region: page-header, position: top-right, max: 1 }',
  states: '[loading, error]',
  patterns: '[empty-state, close-modal]',
  variations: '[layout-a, layout-b]',
  rules: '[T1, F5]',
};

const BODY = `# Exemplo

## Quando usar

- **SE** a tarefa é de exemplo **ENTÃO** use.

## Mapa de regiões

\`\`\`
┌────────┐
│ content │
└────────┘
\`\`\`

## O que vai em cada região

- **page-header** — título.
- **content** — o resto.

## Ações

- Uma primária.

## Estados

- **loading** — esqueleto.
- **error** — alerta.

## Variações

### layout-a
**Favorece:** algo.
**Piora:** outra coisa.

### layout-b
**Favorece:** algo.
**Piora:** outra coisa.

## Anti-padrões

- Nada.

## Checklist

- [ ] Ok.
`;

function card({ fm = {}, drop = [], body = BODY, slug = 'example' } = {}) {
  const merged = { ...FM, ...fm };
  for (const k of drop) delete merged[k];
  const yaml = Object.entries(merged).map(([k, v]) => `${k}: ${v}`).join('\n');
  return parseCard(`---\n${yaml}\n---\n${body}`, slug);
}
const errs = (c) => lintCard(c, PATTERNS);
const has = (list, re) => list.some((m) => re.test(m));

test('archetypes: minimal valid card passes', () => {
  assert.deepEqual(errs(card()), []);
});

test('archetypes: missing required key fails', () => {
  assert.ok(has(errs(card({ drop: ['summary'] })), /chave obrigatória ausente: summary/));
  assert.ok(has(errs(card({ drop: ['primary-action'] })), /primary-action/));
});

test('archetypes: unknown pattern fails', () => {
  assert.ok(has(errs(card({ fm: { patterns: '[empty-state, does-not-exist]' } })), /padrão inexistente.*does-not-exist/));
});

test('archetypes: rule outside T1–T7/F1–F5 fails', () => {
  assert.ok(has(errs(card({ fm: { rules: '[T1, T8]' } })), /regra "T8"/));
  assert.ok(has(errs(card({ fm: { rules: '[F6]' } })), /regra "F6"/));
});

test('archetypes: fewer than 2 variations fails', () => {
  assert.ok(has(errs(card({ fm: { variations: '[layout-a]' } })), /ao menos 2/));
});

test('archetypes: variation without Favorece/Piora or without block fails', () => {
  const withoutPiora = BODY.replace(/(### layout-b\n\*\*Favorece:\*\* algo\.\n)\*\*Piora:\*\* outra coisa\./, '$1');
  assert.ok(has(errs(card({ body: withoutPiora })), /layout-b.*Piora/));
  assert.ok(has(errs(card({ fm: { variations: '[layout-a, layout-c]' } })), /layout-c.*sem bloco/));
});

test('archetypes: missing and out-of-order sections fail', () => {
  assert.ok(has(errs(card({ body: BODY.replace('## Anti-padrões', '## Outra coisa') })), /seção ausente: ## Anti-padrões/));
  const swapped = BODY.replace('## Ações\n\n- Uma primária.\n', '').replace('## Checklist', '## Ações\n\n- Uma primária.\n\n## Checklist');
  assert.ok(has(errs(card({ body: swapped })), /fora da ordem/));
});

test('archetypes: URL fails', () => {
  assert.ok(has(errs(card({ body: BODY.replace('- Nada.', '- Veja https://exemplo.com.') })), /URL/));
});

test('archetypes: primary-action with unknown region or invalid position fails', () => {
  assert.ok(has(errs(card({ fm: { 'primary-action': '{ region: footer, position: top-right, max: 1 }' } })), /não está em regions/));
  assert.ok(has(errs(card({ fm: { 'primary-action': '{ region: content, position: middle, max: 1 }' } })), /position "middle"/));
});

test('archetypes: region or state not described in body fails', () => {
  assert.ok(has(errs(card({ fm: { regions: '[page-header, content, footer]' } })), /região "footer"/));
  assert.ok(has(errs(card({ fm: { states: '[loading, error, empty]' } })), /estado "empty"/));
});

test('archetypes: id differing from file, register outside enum and when-to-use without SE/ENTÃO fail', () => {
  assert.ok(has(errs(card({ slug: 'outro' })), /difere do nome do arquivo/));
  assert.ok(has(errs(card({ fm: { register: '[industrial]' } })), /register "industrial"/));
  assert.ok(has(errs(card({ fm: { 'when-to-use': 'sempre que quiser' } })), /SE … ENTÃO/));
});

test('archetypes: missing front matter fails', () => {
  assert.ok(has(lintCard(parseCard(BODY, 'example'), PATTERNS), /sem front matter/));
});

test('archetypes: section() isolates a section body', () => {
  assert.match(section(BODY, 'Ações'), /Uma primária/);
  assert.equal(section(BODY, 'Inexistente'), null);
});

test('catalog: the 12 archetypes exist and pass the linter', () => {
  const cards = loadArchetypes();
  assert.deepEqual(cards.map((c) => c.slug).sort(), [...IDS].sort());
  assert.deepEqual(lintArchetypes(cards, loadPatternIds()), []);
});

test('catalog: archetypes/index.json matches the cards', () => {
  const current = JSON.parse(readFileSync('archetypes/index.json', 'utf8'));
  assert.deepEqual(current, buildIndex(loadArchetypes()));
});
