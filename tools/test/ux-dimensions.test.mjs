import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMatrix, renderDimensionsTable, renderRulesTable } from '../ux-lint/audit.mjs';
import { SEVERITY as TEXT_SEVERITY } from '../ux-lint/text.mjs';
import { SEVERITY as SCREEN_SEVERITY } from '../ux-lint/screen.mjs';
import { SEVERITY as FLOW_SEVERITY } from '../ux-lint/flow.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const m = loadMatrix();
const DOC = readFileSync(join(ROOT, 'knowledge', 'fundamentos', 'dimensoes-de-ux.md'), 'utf8');
const DIMENSION_IDS = ['text', 'actions', 'layout', 'hierarchy', 'information-architecture', 'navigation', 'flows', 'forms', 'states', 'consistency', 'accessibility', 'heuristics', 'cognitive-laws', 'dark-patterns'];
const expected = [
  ...Array.from({ length: 11 }, (_, i) => `X${i + 1}`), ...Array.from({ length: 7 }, (_, i) => `T${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `F${i + 1}`), ...Array.from({ length: 9 }, (_, i) => `L${i + 1}`),
  'S1', 'S2', 'S3', 'C1', 'C2', 'C3',
];

test('matrix has exactly the 14 fixed dimensions, with unique ids', () => {
  assert.deepEqual(m.dimensions.map((d) => d.id), DIMENSION_IDS);
});

test('every family rule from the brief is in rules_index', () => {
  for (const r of expected) assert.ok(m.rules_index[r], `${r} fora de rules_index`);
});

test('detector severities and rule ids agree with the matrix', () => {
  for (const [table, family] of [[TEXT_SEVERITY, 'text'], [SCREEN_SEVERITY, 'screen'], [FLOW_SEVERITY, 'flow']]) {
    for (const [rule, sev] of Object.entries(table)) {
      assert.ok(m.rules_index[rule], `${rule} do detector ${family} fora da matriz`);
      assert.equal(m.rules_index[rule].severity, sev, `${rule}: severidade do detector ${sev} ≠ matriz`);
      assert.equal(m.rules_index[rule].family, family);
    }
  }
});

test('every rule belongs to exactly one dimension, the one rules_index names', () => {
  const owner = new Map();
  for (const d of m.dimensions) for (const r of d.rules) {
    assert.ok(!owner.has(r), `${r} em duas dimensões (${owner.get(r)}, ${d.id})`);
    owner.set(r, d.id);
    assert.equal(m.rules_index[r]?.dimension, d.id, `${r}: dimensão divergente`);
  }
  for (const [r, x] of Object.entries(m.rules_index)) assert.equal(owner.get(r), x.dimension, `${r} não está na lista da dimensão ${x.dimension}`);
});

test('heuristics are 1–10, every heuristic is served, laws exist in laws_index', () => {
  const served = new Set();
  const lawOk = (l) => assert.ok(m.laws_index[l], `lei desconhecida ${l}`);
  for (const d of m.dimensions) {
    for (const h of d.heuristics) { assert.ok(Number.isInteger(h) && h >= 1 && h <= 10, `${d.id}: heurística ${h}`); served.add(h); }
    d.laws.forEach(lawOk);
    assert.ok(['automated', 'partial', 'judgment', 'reference'].includes(d.coverage), `${d.id}: cobertura ${d.coverage}`);
    assert.ok(d.question_pt && d.gaps_pt && d.name_pt, `${d.id}: campos de texto`);
  }
  for (let h = 1; h <= 10; h++) assert.ok(served.has(h), `H${h} sem dimensão`);
  for (const [r, x] of Object.entries(m.rules_index)) {
    for (const h of x.heuristics) assert.ok(h >= 1 && h <= 10, `${r}: heurística ${h}`);
    x.laws.forEach(lawOk);
    assert.ok([0, 1, 2, 3, 4].includes(x.severity) && x.summary_pt, `${r}: severidade ou resumo`);
  }
});

test('knowledge files, patterns and related rules referenced by the matrix exist', () => {
  const raw = JSON.parse(readFileSync(join(ROOT, 'patterns', 'index.json'), 'utf8'));
  const patterns = new Set((Array.isArray(raw) ? raw : raw.patterns).map((p) => `${p.category}/${p.id}`));
  for (const d of m.dimensions) {
    for (const k of d.knowledge) assert.ok(existsSync(join(ROOT, k)), `${d.id}: ${k} não existe`);
    for (const p of d.patterns) assert.ok(patterns.has(p), `${d.id}: padrão ${p} não existe`);
    for (const r of d.related_rules ?? []) assert.ok(m.rules_index[r], `${d.id}: regra relacionada ${r}`);
  }
  for (const [, l] of Object.entries(m.laws_index)) assert.ok(existsSync(join(ROOT, l.cited_in)));
  for (const [r, x] of Object.entries(m.review_rules)) assert.ok(DIMENSION_IDS.includes(x.dimension), `review ${r}`);
});

test('document cites every dimension and every rule, and contains the generated tables', () => {
  for (const d of m.dimensions) assert.ok(DOC.includes(`\`${d.id}\``), `documento não cita a dimensão ${d.id}`);
  for (const r of Object.keys(m.rules_index)) assert.ok(new RegExp(`\\| ${r} \\|`).test(DOC), `documento não cita a regra ${r}`);
  assert.ok(DOC.includes(renderDimensionsTable(m)), 'tabela de dimensões desatualizada: regenere com renderDimensionsTable');
  assert.ok(DOC.includes(renderRulesTable(m)), 'tabela de regras desatualizada: regenere com renderRulesTable');
  assert.match(DOC, /^> \*\*Quando consultar\*\*/m);
  assert.match(DOC, /## Lacunas vindas de outras fontes/);
});

test('gap analyses: valid statuses, paraphrase present, refs exist', () => {
  const check = (items, label) => {
    for (const it of items) {
      assert.ok(['covered', 'partial', 'not_covered'].includes(it.status), `${label} ${it.id}: status ${it.status}`);
      assert.ok(it.source_rule_pt && it.source_rule_pt.length <= 140, `${label} ${it.id}: paráfrase curta`);
      for (const ref of it.dsx_refs) {
        if (ref.startsWith('rule:')) assert.ok(m.rules_index[ref.slice(5)], `${label} ${it.id}: ${ref}`);
        else assert.ok(existsSync(join(ROOT, ref)), `${label} ${it.id}: ${ref} não existe`);
      }
      if (it.status === 'not_covered' && it.applies_to_product !== false) assert.ok(it.proposal_pt, `${label} ${it.id}: lacuna sem proposta`);
    }
  };
  const w = JSON.parse(readFileSync(join(ROOT, 'data', 'gap-analysis', 'web-design-rules.json'), 'utf8'));
  check(w.items, 'wdr');
  const n = JSON.parse(readFileSync(join(ROOT, 'data', 'gap-analysis', 'nielsen-and-laws.json'), 'utf8'));
  assert.equal(n.heuristics.length, 10);
  check(n.heuristics, 'nielsen');
  const laws = ['hick', 'fitts', 'miller', 'jakob', 'tesler', 'doherty', 'gestalt-proximity', 'gestalt-common-region', 'gestalt-similarity', 'peak-end', 'von-restorff', 'zeigarnik', 'aesthetic-usability'];
  assert.deepEqual(n.laws.map((l) => l.id).sort(), [...laws].sort());
  check(n.laws, 'law');
});

test('new-family detectors, when present, agree with the matrix', async () => {
  for (const family of ['layout', 'states', 'consistency']) {
    const file = join(ROOT, m.families[family].detector);
    if (!existsSync(file)) continue;
    const mod = await import(file);
    for (const [rule, sev] of Object.entries(mod.SEVERITY ?? {})) {
      assert.ok(m.rules_index[rule], `${rule} do detector ${family} fora da matriz`);
      assert.equal(m.rules_index[rule].severity, sev, `${rule}: severidade ${sev} ≠ matriz`);
    }
  }
});
