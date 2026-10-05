// Product-pipeline principles in the DSX (Forward spec/product-pipeline.md): quality matrix, criteria declared before
// construction and evaluated per criterion, UX blueprint coverage, falsifiable hypotheses in variation manifests and
// provenance blocks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadQuality, validateCriteria, parseTarget, evaluateForAudit, groupVerdict, formatQuality } from '../ux-lint/criteria.mjs';
import { runAudit, formatReport, DETECTOR_REGISTRY, loadMatrix } from '../ux-lint/audit.mjs';
import { loadBlueprint, checkBlueprint, mermaidEdges, specRequirements, PROBES } from '../ux-lint/blueprint.mjs';
import { loadInventory } from '../ux-lint/lib/ux-inventory.mjs';
import { validateManifest, loadCatalogs, loadRegistry, manifestPath, toAlternativesMarkdown, writeDecision, makeDecision, LENSES, HYPOTHESIS_FIELDS, CRITIQUE_KEYS } from '../ux-lint/variations.mjs';
import { renderVariationsPages } from '../ux-lint/lib/variations-page.mjs';
import { buildProvenance, checkProvenance, OWNER_ROLES } from '../lib/provenance.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DSX = join(HERE, '..', '..');
const ROOT = join(HERE, 'fixtures', 'pipeline');
const PLAN = join(ROOT, 'cycles', 'C-1', 'plan.md');
const DESIGN = join(ROOT, 'specs', 'DEM-1', 'design');
const quality = loadQuality();
const NOW = new Date('2026-10-05T12:00:00Z');

test('quality matrix: five UI metrics, five UX dimensions, separate DS adherence, every one of the 14 dimensions mapped', () => {
  assert.deepEqual(quality.ui_metrics.map((m) => m.id), ['information-density', 'semantic-economy', 'action-topology', 'visual-hierarchy-alignment', 'interaction-friction']);
  assert.deepEqual(quality.ux_dimensions.map((m) => m.id), ['task-effectiveness', 'cognitive-economy', 'journey-topology', 'expectation-feedback-alignment', 'effort-and-recovery']);
  assert.equal(quality.ds_adherence.separate, true);
  assert.match(quality.aggregation, /no score/);
  const matrix = loadMatrix();
  assert.deepEqual(Object.keys(quality.dimension_map).sort(), matrix.dimensions.map((d) => d.id).sort());
  const known = new Set([...Object.keys(matrix.rules_index), ...Object.keys(matrix.review_rules ?? {})]);
  const ui = new Set(quality.ui_metrics.map((m) => m.id)), ux = new Set(quality.ux_dimensions.map((m) => m.id));
  for (const m of [...quality.ui_metrics, ...quality.ux_dimensions]) {
    for (const k of ['gate_question', 'evidence', 'principles', 'dsx_rules', 'verification', 'dimensions']) assert.ok(m[k] !== undefined, `${m.id}.${k}`);
    for (const r of m.dsx_rules) assert.ok(known.has(r), `${m.id}: rule ${r} not in the matrix`);
    for (const p of m.principles) assert.match(p, /^(USE|DOM|MNT)-\d+$/, `${m.id}: ${p} is not a Forward principle id`);
    assert.ok(quality.verification_modes[m.verification], `${m.id}: verification ${m.verification}`);
  }
  for (const [dim, v] of Object.entries(quality.dimension_map)) {
    for (const x of v.ui) assert.ok(ui.has(x), `${dim}: ui ${x}`);
    for (const x of v.ux) assert.ok(ux.has(x), `${dim}: ux ${x}`);
  }
  for (const c of quality.ds_adherence.checks) for (const r of c.dsx_rules) assert.ok(known.has(r), `ds ${c.id}: ${r}`);
});

test('criteria: parsed from the Acceptance criteria of the cycle plan, dated, with Forward-readable ids', () => {
  const text = readFileSync(PLAN, 'utf8');
  const v = validateCriteria(text, quality);
  assert.deepEqual(v.errors, []);
  assert.deepEqual(v.criteria.map((c) => c.id), ['A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'], 'A1 has no kind: it is an ordinary criterion');
  const a2 = v.criteria[0];
  assert.equal(a2.metric, 'information-density');
  assert.equal(a2['counter-metric'], 'approvers still see requester and total without opening the order');
  // Forward's plan gate reads `- **A<n> — …**` bullets under "## Acceptance criteria": the fields are sub-bullets
  const section = text.split('## Acceptance criteria')[1].split('\n## ')[0];
  assert.equal(section.split('\n').filter((l) => /^[-*+]\s+[`*]*([A-Z]+\d+)\b/.test(l)).length, 8);
});

test('criteria: missing fields, unknown metric, undated plan and unmeasured unknown baseline are reported', () => {
  const bad = ['cycle: C-9', 'state: planned', '', '## Acceptance criteria', '',
    '- **A1 — x.** y', '  - kind: ui', '  - metric: prettiness', '  - surface: s',
    '- **A2 — x.** y', '  - kind: ux', '  - metric: task-effectiveness', '  - baseline: unknown', '  - target: >= 9'].join('\n');
  const v = validateCriteria(bad, quality);
  for (const re of [/date: YYYY-MM-DD/, /A1.*metric "prettiness"/, /A2.*missing "scenario"/, /A2.*missing "population"/, /A2.*missing "counter-metric"/]) assert.ok(v.errors.some((e) => re.test(e)), `${re}: ${v.errors.join(' | ')}`);
  assert.ok(v.warnings.some((w) => /A2.*requires measurement work/.test(w)));
});

test('targets: absolute, relative to a numeric baseline, and unknown when the baseline is unknown', () => {
  assert.deepEqual(parseTarget('words <= 60', null), { op: '<=', value: 60 });
  assert.deepEqual(parseTarget('<= baseline - 20%', '10 steps'), { op: '<=', value: 8 });
  assert.ok(parseTarget('<= baseline - 20%', 'unknown — count').unknown);
  assert.ok(parseTarget('reads naturally', '3').unknown);
});

test('evaluation: value, revision and verdict per criterion; unknown is never pass; synthetic never decides; DS separate', () => {
  const q = evaluateForAudit({ criteria: PLAN, evidence: join(ROOT, 'evidence.json'), screens: join(ROOT, '.dsx', 'captures', 'orders'), map: join(ROOT, '.dsx', 'maps', 'flows-orders.json'), root: ROOT, quality });
  const by = Object.fromEntries(q.results.map((r) => [r.id, r]));
  assert.equal(by.A2.verdict, 'pass');
  assert.equal(by.A2.evidence.class, 'observed');
  assert.ok(by.A2.evidence.revision, 'a revision (git SHA or content hash) is recorded');
  assert.equal(by.A3.verdict, 'fail');
  assert.equal(by.A3.value, 2);
  assert.equal(by.A4.verdict, 'unknown', 'relative target with an unknown baseline');
  assert.equal(by.A4.value, 2, 'the value is still measured and shown');
  assert.equal(by.A5.verdict, 'unknown', 'human method with no recorded session');
  assert.equal(by.A6.verdict, 'pass');
  assert.equal(by.A7.verdict, 'not-applicable');
  assert.equal(by.A8.verdict, 'unknown');
  assert.equal(by.A8.evidence.class, 'synthetic');
  assert.match(by.A8.reason, /synthetic/);
  const ui = Object.fromEntries(q.report.ui.map((m) => [m.id, m]));
  assert.equal(ui['information-density'].verdict, 'pass');
  assert.equal(ui['action-topology'].verdict, 'fail');
  assert.equal(ui['semantic-economy'].verdict, 'unknown');
  assert.match(ui['semantic-economy'].reason, /no criterion declared/);
  assert.equal(ui['visual-hierarchy-alignment'].verdict, 'not-applicable');
  assert.equal(q.report.ds.verdict, 'unknown', 'one passing DS check does not make the whole adherence pass');
  assert.equal(q.report.ds.checks.find((c) => c.id === 'tokens-and-kit').verdict, 'pass');
  assert.equal(groupVerdict([]), 'unknown');
  assert.equal(groupVerdict([{ verdict: 'pass' }, { verdict: 'unknown' }]), 'unknown');
  const text = formatQuality(q.report, { criteriaFile: 'plan.md' });
  for (const re of [/UI quality \(5 metrics\)/, /UX quality \(5 dimensions\)/, /Design-system adherence \(separate verdict\)/, /No score/]) assert.match(text, re);
});

test('audit --criteria: report has UI quality, UX quality, DS adherence and the 14-dimension diagnostic; results carry provenance', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-pipeline-'));
  try {
    const out = join(tmp, 'criteria-results.json');
    const registry = DETECTOR_REGISTRY.filter((d) => ['text', 'screen', 'flow'].includes(d.family));
    const r = runAudit({ module: 'orders', root: ROOT, criteria: PLAN, evidence: join(ROOT, 'evidence.json'), 'criteria-out': out, dir: join(tmp, 'findings') }, { registry, now: NOW });
    assert.equal(r.quality.ui.length, 5);
    assert.equal(r.quality.ux.length, 5);
    assert.ok(r.quality.ds.checks.length >= 5);
    assert.deepEqual(checkProvenance(r.provenance), []);
    assert.ok(r.provenance.criteria.includes('A2'));
    const text = formatReport(r);
    const order = ['UI quality (5 metrics)', 'UX quality (5 dimensions)', 'Design-system adherence', 'Diagnostic — 14 dimensions'].map((s) => text.indexOf(s));
    assert.ok(order.every((i) => i >= 0) && order.every((i, k) => !k || i > order[k - 1]), 'sections in order');
    const saved = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(saved.criteria.length, 7);
    assert.deepEqual(checkProvenance(saved.provenance), []);
    // without --criteria every metric is unknown, never pass
    const bare = runAudit({ module: 'orders', root: ROOT, dir: join(tmp, 'findings') }, { registry, now: NOW });
    assert.ok([...bare.quality.ui, ...bare.quality.ux].every((m) => m.verdict === 'unknown'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('blueprint: sections, requirements and scenarios before UI; captures and map both ways after UI (DOM-5)', () => {
  const bp = loadBlueprint(DESIGN);
  assert.deepEqual(bp.screens.map((s) => s.id), ['queue', 'order']);
  assert.deepEqual(specRequirements(join(ROOT, 'specs', 'DEM-1', 'spec.md')), ['R1', 'R2', 'R3']);
  const pre = checkBlueprint(bp, { requirements: ['R1', 'R2', 'R3', 'R4'] });
  const rules = (r) => r.findings.map((f) => f.rule);
  assert.ok(rules(pre).includes('BP10'), 'S2 has no verification');
  assert.ok(pre.findings.some((f) => f.rule === 'BP5' && f.subject === 'R4'), 'requirement without screen');
  assert.ok(!rules(pre).includes('BP0'), 'every section present for size L');
  const map = JSON.parse(readFileSync(join(ROOT, '.dsx', 'maps', 'flows-orders.json'), 'utf8'));
  const inv = loadInventory({ map: join(ROOT, '.dsx', 'maps', 'flows-orders.json'), screens: join(ROOT, '.dsx', 'captures', 'orders') });
  const all = checkBlueprint(bp, { requirements: ['R1', 'R2', 'R3'], inv, map });
  assert.ok(all.findings.some((f) => f.rule === 'BP3' && f.subject === 'settings'), 'captured screen without requirement');
  assert.ok(all.findings.some((f) => f.rule === 'BP6' && f.subject === 'queue.loading'), 'state without representation');
  const j = checkBlueprint(bp, { requirements: ['R1', 'R2', 'R3'], inv, map, journey: 'j-approve' });
  assert.ok(!j.findings.some((f) => f.rule === 'BP3'), 'journey scope leaves settings out');
  const extra = { ...bp, edges: [...bp.edges, { from: 'order', to: 'order', label: 'self' }, { from: 'queue', to: 'order', label: 'x' }] };
  const noBack = { ...map, transitions: map.transitions.filter((t) => t.id !== 't-back') };
  const e = checkBlueprint(extra, { requirements: [], inv, map: noBack, journey: 'j-approve' });
  assert.ok(e.findings.some((f) => f.rule === 'BP8' && f.subject === 'order>queue'), 'blueprint edge with no map transition');
  for (const f of all.findings) assert.ok(PROBES[f.rule].principle.startsWith('DOM-'), 'every probe cites a Forward principle');
});

test('blueprint template: the neutral example parses and covers every section', () => {
  const text = readFileSync(join(DSX, 'templates', 'ux-blueprint.md'), 'utf8');
  for (const p of ['specs/<demand-id>/design/intended-model.md', 'specs/<demand-id>/design/flow.md', 'specs/<demand-id>/design/ia.md', 'UX.md']) assert.ok(text.includes(p), p);
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-bp-'));
  try {
    writeFileSync(join(tmp, 'intended-model.md'), text);
    const bp = loadBlueprint(tmp);
    assert.deepEqual(bp.screens.map((s) => s.id), ['queue', 'order']);
    assert.equal(bp.scenarios.length, 3);
    const r = checkBlueprint(bp, { size: 'L' });
    assert.deepEqual(r.findings.filter((f) => f.rule === 'BP0'), []);
    assert.deepEqual(mermaidEdges(text).edges.slice(0, 2).map((x) => `${x.from}>${x.to}`), ['queue>order', 'order>done']);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

const VROOT = join(HERE, 'fixtures', 'variations');
const vload = () => JSON.parse(readFileSync(manifestPath({ root: VROOT, module: 'demo', flow: 'assistente' }), 'utf8'));
const withHypotheses = (m) => {
  m.format = 2;
  Object.assign(m.variants[0], { audience: 'people who generate documents weekly', causal_bet: 'one screen removes the back-and-forth that causes abandonment', counter_hypothesis: 'people need the steps to check each choice', falsification_test: 'if 2 of 5 participants go back to check a choice, the bet is wrong', expected_metric: 'clicks_to_done falls from 7 to 4', guardrail: 'no rise in documents generated with the wrong template', lens: 'subtract' });
  Object.assign(m.variants[1], { audience: 'people who already keep a spreadsheet', causal_bet: 'starting from the spreadsheet skips retyping', counter_hypothesis: 'most people do not have a spreadsheet ready', falsification_test: 'if fewer than half of sessions start with a file, the bet is wrong', expected_metric: 'decisions fall from 4 to 2', guardrail: 'import errors stay under 5%', lens: 'invert' });
  m.choice = { variant: 'a', why: 'the wait is the problem, not the order of steps' };
  m.rejected_tradeoffs = { b: 'gives up people without a spreadsheet' };
  m.critique = Object.fromEntries(CRITIQUE_KEYS.map((k) => [k, { status: k === 'unsupported_claims' ? 'measurement' : 'resolved', note: `checked ${k}` }]));
  return m;
};

test('variations: format 1 keeps validating with warnings; format 2 requires falsifiable hypotheses, distinct Forward lenses and the convergence', () => {
  const catalogs = loadCatalogs();
  const registry = loadRegistry(VROOT, 'demo').items;
  const old = validateManifest(vload(), { root: VROOT, catalogs, registry });
  assert.deepEqual(old.errors, []);
  assert.ok(old.warnings.some((w) => /missing "causal_bet".*format 1/.test(w)));
  const strict = vload(); strict.format = 2;
  const s = validateManifest(strict, { root: VROOT, catalogs, registry });
  for (const k of HYPOTHESIS_FIELDS) assert.ok(s.errors.some((e) => e.includes(`missing "${k}"`)), k);
  assert.ok(s.errors.some((e) => /missing "choice"/.test(e)));
  const good = validateManifest(withHypotheses(vload()), { root: VROOT, catalogs, registry });
  assert.deepEqual(good.errors, []);
  const same = withHypotheses(vload()); same.variants[1].lens = 'subtract';
  assert.ok(validateManifest(same, { root: VROOT, catalogs, registry }).errors.some((e) => /share the lens "subtract".*USE-10/.test(e)));
  const wrong = withHypotheses(vload()); wrong.variants[1].lens = 'remix';
  assert.ok(validateManifest(wrong, { root: VROOT, catalogs, registry }).errors.some((e) => /lens "remix"/.test(e)));
  assert.deepEqual(LENSES, ['subtract', 'invert', 'analogous', 'constraint-first', 'object-first']);
  const crit = withHypotheses(vload()); crit.critique.accessibility = { status: 'ignored', note: '' };
  const ce = validateManifest(crit, { root: VROOT, catalogs, registry }).errors;
  assert.ok(ce.some((e) => /critique\.accessibility: status "ignored"/.test(e)) && ce.some((e) => /critique\.accessibility: missing "note"/.test(e)));
  const noCrit = withHypotheses(vload()); delete noCrit.critique;
  assert.ok(validateManifest(noCrit, { root: VROOT, catalogs, registry }).warnings.some((w) => /missing "critique"/.test(w)));
  const noTrade = withHypotheses(vload()); noTrade.rejected_tradeoffs = {};
  assert.ok(validateManifest(noTrade, { root: VROOT, catalogs, registry }).errors.some((e) => /variant "b" traded/.test(e)));
});

test('variations: Forward alternatives.md export and plain-language hypothesis on the page', () => {
  const m = withHypotheses(vload());
  const md = toAlternativesMarkdown(m);
  for (const re of [/^## How might we…/m, /^## Alternatives/m, /^### A\. /m, /^Lens: subtract$/m, /^Lens: invert$/m, /^Hypothesis: for people who generate/m, /^Traded: gives up people without a spreadsheet$/m, /^## Convergence/m, /^Chose: A — the wait is the problem/m]) assert.match(md, re);
  assert.ok(!/^Traded:.*\n(?:.*\n)*?### B/m.test(md.split('### B')[0].split('### A')[1] ?? ''), 'the chosen variant records no discard');
  const [p] = renderVariationsPages(m, { registry: loadRegistry(VROOT, 'demo').items, catalogs: loadCatalogs(), file: 'v.html', lang: 'pt-BR' });
  assert.match(p.html, /Como saber se funciona/);
  assert.match(p.html, /Como testar se está errada/);
  assert.match(p.html, /Recomendada por quem desenhou/);
  assert.match(p.html, /Por que não é a recomendada: gives up people without a spreadsheet/);
  assert.match(p.html, /Tirar: um passo, campo ou decisão some/);
});

test('provenance: decision.json carries date, owner role, sources with revision, evidence class, assumptions and gaps', () => {
  const m = withHypotheses(vload());
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-prov-'));
  try {
    const f = writeDecision(tmp, m, makeDecision(m, { variant: 'a', now: NOW }).decision, { now: NOW });
    const d = JSON.parse(readFileSync(f, 'utf8'));
    assert.equal(d.variant, 'a');
    assert.deepEqual(checkProvenance(d.provenance), []);
    assert.equal(d.provenance.evidence_class, 'human');
    assert.equal(d.provenance.date, '2026-10-05');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  assert.throws(() => buildProvenance({ ownerRole: 'designer' }), /owner role/);
  assert.throws(() => buildProvenance({ evidenceClass: 'vibes' }), /evidence class/);
  assert.ok(OWNER_ROLES.includes('fde-spec'));
  const p = buildProvenance({ root: ROOT, sources: ['cycles/C-1/plan.md', 'nope.md'], criteria: ['A2', 'A2'], now: NOW });
  assert.deepEqual(p.criteria, ['A2']);
  assert.equal(p.sources.find((s) => s.path === 'nope.md').state, 'missing');
  assert.ok(p.sources.find((s) => s.path === 'cycles/C-1/plan.md').sha);
  assert.ok(existsSync(PLAN));
});

test('alternatives export invents nothing: no HMW from the title, no "Chose:" without a real choice', () => {
  const md = toAlternativesMarkdown({ title: 'Approve orders', module: 'm', flow: 'f', variants: [{ id: 'a', name: 'A', lens: 'subtract' }, { id: 'b', name: 'B', lens: 'invert' }] });
  assert.ok(!/HMW approve orders/i.test(md));
  assert.ok(!/^Chose:/m.test(md));
  assert.ok(LENSES.includes('constraint-first'));
});
