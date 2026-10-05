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
  title: 'Example',
  summary: 'An example screen.',
  register: '[operational]',
  'when-to-use': 'IF the task is an example THEN use this archetype',
  'avoid-when': 'it is not an example',
  regions: '[page-header, content]',
  'primary-action': '{ region: page-header, position: top-right, max: 1 }',
  states: '[loading, error]',
  patterns: '[empty-state, close-modal]',
  variations: '[layout-a, layout-b]',
  rules: '[T1, F5]',
};

const BODY = `# Example

## When to use

- **IF** the task is an example **THEN** use it.

## Region map

\`\`\`
┌────────┐
│ content │
└────────┘
\`\`\`

## What goes in each region

- **page-header**: title.
- **content**: the rest.

## Actions

- One primary.

## States

- **loading**: skeleton.
- **error**: alert.

## Variations

### layout-a
**Favors:** something.
**Worsens:** something else.

### layout-b
**Favors:** something.
**Worsens:** something else.

## Anti-patterns

- Nothing.

## Checklist

- [ ] Ok.
`;

// The same card with the pt-BR section names, decision words and variation labels of DSX ≤ 0.8 (still accepted).
const BODY_PT = BODY
  .replace('## When to use', '## Quando usar').replace('**IF** the task is an example **THEN** use it.', '**SE** a tarefa é de exemplo **ENTÃO** use.')
  .replace('## Region map', '## Mapa de regiões').replace('## What goes in each region', '## O que vai em cada região')
  .replace('## Actions', '## Ações').replace('## States', '## Estados').replace('## Variations', '## Variações')
  .replace('## Anti-patterns', '## Anti-padrões').replaceAll('**Favors:**', '**Favorece:**').replaceAll('**Worsens:**', '**Piora:**');

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
  assert.ok(has(errs(card({ drop: ['summary'] })), /missing required key: summary/));
  assert.ok(has(errs(card({ drop: ['primary-action'] })), /primary-action/));
});

test('archetypes: unknown pattern fails', () => {
  assert.ok(has(errs(card({ fm: { patterns: '[empty-state, does-not-exist]' } })), /pattern not found.*does-not-exist/));
});

test('archetypes: rule outside T1–T7/F1–F5 fails', () => {
  assert.ok(has(errs(card({ fm: { rules: '[T1, T8]' } })), /rule "T8"/));
  assert.ok(has(errs(card({ fm: { rules: '[F6]' } })), /rule "F6"/));
});

test('archetypes: fewer than 2 variations fails', () => {
  assert.ok(has(errs(card({ fm: { variations: '[layout-a]' } })), /at least 2/));
});

test('archetypes: variation without Favors/Worsens or without block fails', () => {
  const withoutWorsens = BODY.replace(/(### layout-b\n\*\*Favors:\*\* something\.\n)\*\*Worsens:\*\* something else\./, '$1');
  assert.ok(has(errs(card({ body: withoutWorsens })), /layout-b.*Worsens/));
  assert.ok(has(errs(card({ fm: { variations: '[layout-a, layout-c]' } })), /layout-c.*without a/));
});

test('archetypes: missing and out-of-order sections fail', () => {
  assert.ok(has(errs(card({ body: BODY.replace('## Anti-patterns', '## Something else') })), /missing section: ## Anti-patterns/));
  const swapped = BODY.replace('## Actions\n\n- One primary.\n', '').replace('## Checklist', '## Actions\n\n- One primary.\n\n## Checklist');
  assert.ok(has(errs(card({ body: swapped })), /out of order/));
});

test('archetypes: URL fails', () => {
  assert.ok(has(errs(card({ body: BODY.replace('- Nothing.', '- See https://example.com.') })), /URL/));
});

test('archetypes: primary-action with unknown region or invalid position fails', () => {
  assert.ok(has(errs(card({ fm: { 'primary-action': '{ region: footer, position: top-right, max: 1 }' } })), /is not in regions/));
  assert.ok(has(errs(card({ fm: { 'primary-action': '{ region: content, position: middle, max: 1 }' } })), /position "middle"/));
});

test('archetypes: region or state not described in body fails', () => {
  assert.ok(has(errs(card({ fm: { regions: '[page-header, content, footer]' } })), /region "footer"/));
  assert.ok(has(errs(card({ fm: { states: '[loading, error, empty]' } })), /state "empty"/));
});

test('archetypes: id differing from file, register outside enum and when-to-use without IF/THEN fail', () => {
  assert.ok(has(errs(card({ slug: 'other' })), /differs from the file name/));
  assert.ok(has(errs(card({ fm: { register: '[industrial]' } })), /register "industrial"/));
  assert.ok(has(errs(card({ fm: { 'when-to-use': 'whenever you like' } })), /IF … THEN/));
  assert.ok(has(errs(card({ body: BODY.replace('**IF** the task is an example **THEN** use it.', 'Always.') })), /IF → THEN/));
});

test('archetypes: missing front matter fails', () => {
  assert.ok(has(lintCard(parseCard(BODY, 'example'), PATTERNS), /no front matter/));
});

test('archetypes: section() isolates a section body, by English or pt-BR title', () => {
  assert.match(section(BODY, 'Actions'), /One primary/);
  assert.match(section(BODY, 'Ações'), /One primary/, 'pt-BR alias finds the English section');
  assert.match(section(BODY_PT, 'Actions'), /One primary/, 'English title finds the pt-BR section');
  assert.equal(section(BODY, 'Missing'), null);
});

test('archetypes: legacy pt-BR card (sections, SE/ENTÃO, Favorece/Piora) still passes', () => {
  assert.deepEqual(errs(card({ body: BODY_PT, fm: { 'when-to-use': 'SE a tarefa é de exemplo ENTÃO use este arquétipo' } })), []);
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

// ---------- pattern cards (lint-patterns): English sections, legacy pt-BR accepted ----------

test('patterns: English card passes; legacy pt-BR card passes; a missing section fails', async () => {
  const { lintPatterns } = await import('../lint-patterns.mjs');
  const fm = { id: 'demo', title: 'Demo?', category: 'actions', type: 'recommendation', impact: 'low', status: 'recommended', evidence: 'weak', related: [] };
  const en = `# Demo?\n\n> **Rule:** Do it.\n\n## Context\n\nx\n\n## Decision\n\n- **IF** a **THEN** b.\n\n## When to use\n\nx\n\n## When to avoid\n\nx\n\n## Do\n\nx\n\n## Avoid\n\nx\n\n## Accessibility\n\nx\n\n## Verification checklist\n\n- [ ] x\n\n## Rationale\n\nx\n`;
  const pt = en.replace('**Rule:**', '**Regra:**').replace('## Context', '## Contexto').replace('## Decision', '## Decisão')
    .replace('## When to use', '## Quando usar').replace('## When to avoid', '## Quando evitar').replace('## Do\n', '## Faça\n')
    .replace('## Avoid', '## Evite').replace('## Accessibility', '## Acessibilidade').replace('## Verification checklist', '## Checklist de verificação')
    .replace('## Rationale', '## Fundamentação');
  const lint = (body) => lintPatterns([{ file: 'patterns/actions/demo.md', dir: 'actions', slug: 'demo', fm, body }]);
  assert.deepEqual(lint(en), []);
  assert.deepEqual(lint(pt), []);
  assert.ok(has(lint(en.replace('## Rationale', '## Sources')), /missing section: ## Rationale/));
  assert.ok(has(lint(en.replace('> **Rule:** Do it.', '')), /"> \*\*Rule:\*\*"/));
});
