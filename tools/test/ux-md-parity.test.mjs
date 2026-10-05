// UX.md × DESIGN.md parity (DSX 0.7): 100-point score and gates, UX.md × product drift, declared deviation that
// becomes accepted-deviation in the register, and per-module glossary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseYaml } from '../lib/yaml-lite.mjs';
import { lintUxMd, scoreUxMd, SCORE_CRITERIA } from '../lint-ux-md.mjs';
import { analyzeDrift, driftHeadline } from '../ux-lint/ux-md-drift.mjs';
import { parseDeviations, coveringDeviation } from '../ux-lint/lib/deviations.mjs';
import { loadGlossary, glossarySource, isModuleGlossary } from '../ux-lint/lib/glossary.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { glossaryProperNouns, analyzeText } from '../ux-lint/text.mjs';
import * as findings from '../ux-lint/findings.mjs';
import { DETECTOR_REGISTRY, runAudit, formatReport } from '../ux-lint/audit.mjs';

const NOW = new Date('2026-10-03T12:00:00Z');
const example = readFileSync('examples/UX.md', 'utf8');
const NO_DIR = { archetypesDir: join(tmpdir(), 'dsx-no-archetypes-dir') };

// ---------- synthetic project ----------

const MAP = {
  screens: [
    { id: 'lista', name: 'Pedidos', type: 'page', route: '/pedidos', parent: null },
    { id: 'detalhe', name: 'Pedido', type: 'page', route: '/pedidos/:id', parent: 'lista' },
    { id: 'dlg-a', name: 'Excluir A', type: 'dialog', parent: 'lista' },
    { id: 'dlg-b', name: 'Excluir B', type: 'dialog', parent: 'lista' },
    { id: 'orfa', name: 'Tela nova', type: 'page', parent: 'lista' },
  ],
  transitions: [], journeys: [],
};
const dialog = (title, actionFirst) => `<!doctype html><html><body><main><h1>Pedidos</h1></main>
<div role="dialog" aria-label="${title}"><h2>${title}</h2><div class="MuiDialogActions-root">${actionFirst
  ? '<button class="MuiButton-contained MuiButton-containedError">Excluir pedido</button><button class="MuiButton-text">Cancelar</button>'
  : '<button class="MuiButton-text">Cancelar</button><button class="MuiButton-contained MuiButton-containedError">Excluir pedido</button>'}</div></div></body></html>`;
const PAGE = '<!doctype html><html><body><main><h1>Pedidos</h1><button class="MuiButton-contained">Novo pedido</button></main></body></html>';

function uxMd({ deviations = '', updated = '2026-10-01', version = '1.2.0', states = '[loading, empty, error, no-access, success]', glossary = 'inline', extraArch = '' } = {}) {
  return `---
version: ${version}
format: alpha
name: Teste
owner: time
updated: ${updated}
product:
  persona: analista
  register: operational
archetypes:
  operational-list: ["/pedidos"]
  document-viewer: [detalhe]
  confirmation-dialog: [dlg-a, dlg-b${extraArch}]
actions:
  dialog-order: cancel-action
states: ${states}
content:
  glossary: ${glossary}
${deviations}---

# Teste

## Arquétipos de tela

| Tela | Arquétipo |
|---|---|
| lista | operational-list |

## Conteúdo e microcopy

| Termo | Nunca chamar de |
|---|---|
| Pedido | "ordem" |
`;
}

function project(ux) {
  const root = mkdtempSync(join(tmpdir(), 'dsx-parity-'));
  mkdirSync(join(root, '.dsx', 'maps'), { recursive: true });
  writeFileSync(join(root, '.dsx', 'maps', 'flows-m.json'), JSON.stringify(MAP));
  const code = join(root, '.stitch', 'm', 'code');
  mkdirSync(code, { recursive: true });
  writeFileSync(join(code, '01-lista.html'), PAGE);
  writeFileSync(join(code, '01-lista.empty.html'), PAGE);
  writeFileSync(join(code, '01-lista.error.html'), PAGE);
  writeFileSync(join(code, '01-lista.loading.html'), PAGE);
  writeFileSync(join(code, '02-detalhe.html'), PAGE);
  writeFileSync(join(code, '03-dlg-a.html'), dialog('Excluir A', true));
  writeFileSync(join(code, '04-dlg-b.html'), dialog('Excluir B', true));
  writeFileSync(join(root, 'UX.md'), ux);
  return { root, map: join(root, '.dsx', 'maps', 'flows-m.json'), screens: code, ux: join(root, 'UX.md') };
}

// ---------- yaml and lint ----------

test('yaml-lite: block lists of maps and scalars, nested in maps', () => {
  const y = parseYaml('deviations:\n  - id: D1\n    screens: [a, b]\n    rules:\n      - T1\n      - L9\n    reason: "x, y"\n  - id: D2\n    reason: z\nother:\n- 1\n- dois\nlast: 3');
  assert.deepEqual(y.deviations, [{ id: 'D1', screens: ['a', 'b'], rules: ['T1', 'L9'], reason: 'x, y' }, { id: 'D2', reason: 'z' }]);
  assert.deepEqual(y.other, [1, 'dois']);
  assert.equal(y.last, 3);
  assert.throws(() => parseYaml('a: 1\n- solto'), /sem chave dona|without an owning key|list/);
});

test('UX.md lint: version is semver; "alpha" warns; anything else fails', () => {
  assert.equal(lintUxMd(example, NO_DIR).warnings.some((w) => /version/.test(w)), false);
  const alpha = lintUxMd(example.replace('version: 1.4.0', 'version: alpha'), NO_DIR);
  assert.equal(alpha.ok, true);
  assert.ok(alpha.warnings.some((w) => /format version/.test(w)));
  const bad = lintUxMd(example.replace('version: 1.4.0', 'version: v2'), NO_DIR);
  assert.ok(bad.errors.some((e) => /semver/.test(e)));
});

test('UX.md lint: deviations are validated and matched against the body table', () => {
  const r = lintUxMd(example.replace('    rules: [L9]\n', '    rules: [L99]\n').replace('    decided-by: "finance"\n', ''), NO_DIR);
  assert.ok(r.errors.some((e) => /rule "L99"/.test(e)));
  assert.ok(r.errors.some((e) => /D3: no decided-by/.test(e)));
  const onlyBody = lintUxMd(example.replace(/^deviations:[\s\S]*?(?=^---)/m, ''), NO_DIR);
  assert.ok(onlyBody.warnings.some((w) => /D1, D2, D3 only in the body/.test(w)));
  const { deviations, errors } = parseDeviations({ D9: { screens: ['x'], rules: ['T3'], reason: 'r', 'decided-by': 'd' } });
  assert.deepEqual(errors, []);
  assert.equal(deviations[0].id, 'D9', 'an id → fields map is also accepted');
});

test('UX.md lint: content.glossary accepts a per-module map', () => {
  const md = example.replace('  glossary: inline ', '  glossary: { default: docs/g.md, compras: inline } ');
  assert.equal(lintUxMd(md, NO_DIR).ok, true);
  const bad = lintUxMd(example.replace('  glossary: inline ', '  glossary: 42 '), NO_DIR);
  assert.ok(bad.errors.some((e) => /content\.glossary/.test(e)));
  const list = lintUxMd(example.replace('  glossary: inline ', '  glossary: [a, b] '), NO_DIR);
  assert.ok(list.errors.some((e) => /content\.glossary/.test(e)));
});

// ---------- score ----------

test('score: rubric yaml and SCORE_CRITERIA are the same list and sum 100', () => {
  const rubric = parseYaml(readFileSync('evals/rubrics/ux-md.yaml', 'utf8'));
  assert.deepEqual(rubric.criteria.map((c) => [c.id, c.weight]), SCORE_CRITERIA.map((c) => [c.id, c.weight]));
  assert.equal(SCORE_CRITERIA.reduce((s, c) => s + c.weight, 0), 100);
  assert.deepEqual(rubric.gates.map((g) => g.id), ['lint', 'essential-coverage', 'policy-fidelity', 'connected-to-agent', 'no-conflict']);
});

test('score: example without inventory caps coverage at half; template scores high-risk', () => {
  const r = scoreUxMd(example, { now: NOW, projectRoot: process.cwd() });
  const by = Object.fromEntries(r.criteria.map((c) => [c.id, c]));
  assert.equal(by['screen-coverage'].points, 10);
  assert.equal(by.freshness.points, 10);
  assert.equal(by['declared-deviations'].points, 5);
  assert.equal(by.glossary.points, 10);
  assert.ok(r.score >= 80, `nota do exemplo ${r.score}`);
  assert.equal(r.gates.find((g) => g.id === 'lint').ok, true);
  assert.equal(r.gates.find((g) => g.id === 'essential-coverage').ok, null, 'without an inventory, not checked');
  assert.equal(r.gates.find((g) => g.id === 'connected-to-agent').ok, true, 'the DSX AGENTS.md cites UX.md');
  const t = scoreUxMd(readFileSync('templates/UX.md', 'utf8'), { now: NOW });
  assert.equal(t.band, 'high-risk');
  assert.equal(t.gates.find((g) => g.id === 'lint').ok, false);
  assert.equal(t.ok, false);
});

test('score: inventory drives coverage, coverage gate, policy gate and freshness', () => {
  const p = project(uxMd());
  try {
    const r = scoreUxMd(readFileSync(p.ux, 'utf8'), { uxPath: p.ux, map: p.map, screens: p.screens, now: NOW, lastChange: { date: '2026-10-02', source: 'git', paths: [p.map] } });
    const by = Object.fromEntries(r.criteria.map((c) => [c.id, c]));
    assert.equal(by['screen-coverage'].points, 16, '4 of 5 screens (orfa without an archetype)');
    assert.match(by['screen-coverage'].evidence, /4\/5/);
    assert.equal(by.freshness.points, 5, 'semver + updated, mas telas mais novas que o updated');
    const gate = Object.fromEntries(r.gates.map((g) => [g.id, g]));
    assert.equal(gate['essential-coverage'].ok, false);
    assert.match(gate['essential-coverage'].detail, /orfa/);
    assert.equal(gate['policy-fidelity'].ok, false, 'both dialogs have the reversed order');
    assert.equal(gate['connected-to-agent'].ok, false);
    assert.equal(r.ok, false);
  } finally { rmSync(p.root, { recursive: true, force: true }); }
});

// ---------- drift ----------

test('drift: U1–U6 on a synthetic project', () => {
  const dev = 'deviations:\n  - id: D1\n    screens: [sumiu]\n    rules: [T3]\n    reason: "antigo"\n    decided-by: dono\n    until: 2026-01-31\n';
  const p = project(uxMd({ deviations: dev, extraArch: ', removida' }));
  try {
    const r = analyzeDrift(readFileSync(p.ux, 'utf8'), { map: p.map, screens: p.screens, now: NOW, lastChange: { date: '2026-10-02', source: 'git', paths: [p.map] } });
    const rules = (id) => r.findings.filter((f) => f.rule === id);
    assert.deepEqual(rules('U1').map((f) => f.screen), ['orfa']);
    assert.deepEqual(rules('U2').map((f) => f.screen), ['removida']);
    assert.equal(rules('U3').length, 1);
    assert.equal(rules('U3')[0].policy, 'actions.dialog-order');
    assert.match(rules('U3')[0].message, /2 of 2 confirmation-dialog screens/);
    assert.deepEqual(r.summary.missing_states, ['no-access']);
    assert.equal(rules('U5').length, 1);
    assert.equal(rules('U6').length, 2, 'expired, and citing a screen missing from the map');
    assert.match(driftHeadline(r), /without an archetype \(orfa\)/);
  } finally { rmSync(p.root, { recursive: true, force: true }); }
});

test('drift: a deviation covering the screens silences U1 and the U3 majority; up-to-date file is clean', () => {
  const dev = 'deviations:\n  - id: D1\n    screens: [orfa]\n    rules: []\n    reason: "em construção"\n    decided-by: dono\n  - id: D2\n    screens: [dlg-a, dlg-b]\n    rules: [T2]\n    reason: "ação antes de cancelar por decisão do time de compras"\n    decided-by: dono\n';
  const p = project(uxMd({ deviations: dev, states: '[loading, empty, error, success]', updated: '2026-10-03' }));
  try {
    const r = analyzeDrift(readFileSync(p.ux, 'utf8'), { map: p.map, screens: p.screens, now: NOW, lastChange: { date: '2026-10-02', source: 'git', paths: [p.map] } });
    assert.deepEqual(r.findings, []);
    assert.equal(r.summary.covered, 5);
  } finally { rmSync(p.root, { recursive: true, force: true }); }
});

// ---------- accepted deviation in the register ----------

const run = (items) => ({ items: findings.assignIds(items), families: ['screen'] });
const T2 = (screen) => ({ family: 'screen', rule: 'T2', severity: 2, element: 'button', text: 'ordem invertida', variants: [], screens: [screen], region: 'diálogo', source: [`${screen}.html:3`], message: 'ordem invertida' });

test('findings: covered item is accepted-deviation, does not count as open nor in check, and reopens when the deviation goes', () => {
  const devs = parseDeviations([{ id: 'D2', screens: ['dlg-a'], rules: ['T2'], reason: 'decisão do time de compras', 'decided-by': 'dono' }]).deviations;
  const reg = { module: 'm', updated: null, runs: [], items: [] };
  findings.merge(reg, run([T2('03-dlg-a'), T2('04-dlg-b')]), { now: NOW, deviations: devs });
  const a = reg.items.find((i) => i.screens[0] === '03-dlg-a');
  const b = reg.items.find((i) => i.screens[0] === '04-dlg-b');
  assert.equal(a.status, 'accepted-deviation');
  assert.deepEqual(a.deviation, { id: 'D2', reason: 'decisão do time de compras', decided_by: 'dono', until: null });
  assert.equal(b.status, 'open');
  assert.deepEqual(reg.deviations, devs, 'the active copy is kept in the register');
  assert.ok(!findings.OPEN_STATUSES.includes('accepted-deviation'));
  const s = findings.summary(reg);
  assert.equal(s.by_status['accepted-deviation'], 1);
  assert.equal(s.accepted_deviation[0].deviation, 'D2');
  // gate: a new covered item does not fail
  const fresh = { ...T2('05-dlg-c'), screens: ['05-dlg-c'] };
  const wide = parseDeviations([{ id: 'D3', screens: ['*'], rules: ['T2'], reason: 'todas', 'decided-by': 'dono' }]).deviations;
  const c = findings.check(reg, run([fresh]), { min: 2, deviations: wide, now: NOW });
  assert.equal(c.pass, true);
  assert.equal(c.accepted.length, 1);
  assert.equal(findings.check(reg, run([fresh]), { min: 2, deviations: [], now: NOW }).pass, false);
  // the page shows the reason
  const html = findings.renderPage(reg, { items: {} }, { items: {} }, {});
  assert.match(html, /Desvio aceito D2|Accepted deviation D2/i);
  assert.match(html, /decisão do time de compras/);
  // deviation removed from the UX.md → it opens again
  findings.merge(reg, run([T2('03-dlg-a'), T2('04-dlg-b')]), { now: NOW, deviations: [] });
  assert.equal(reg.items.find((i) => i.screens[0] === '03-dlg-a').status, 'open');
  assert.equal(reg.items.find((i) => i.screens[0] === '03-dlg-a').deviation, undefined);
});

test('findings: expired deviation does not cover; ignore still wins; review items with "*" only', () => {
  const expired = parseDeviations([{ id: 'D1', screens: ['dlg-a'], rules: ['T2'], reason: 'r', 'decided-by': 'd', until: '2026-09-30' }]).deviations;
  assert.equal(coveringDeviation({ rule: 'T2', screens: ['03-dlg-a'] }, expired, NOW), null);
  const live = parseDeviations([{ id: 'D1', screens: ['dlg-a'], rules: ['T2'], reason: 'r', 'decided-by': 'd' }]).deviations;
  const item = { id: 's-1', rule: 'T2', screens: ['03-dlg-a'], present: true };
  assert.equal(findings.statusOf(item, { items: { 's-1': { choice: 'ignore' } } }, live, NOW), 'ignored');
  assert.equal(findings.statusOf(item, { items: {} }, live, NOW), 'accepted-deviation');
  assert.equal(coveringDeviation({ rule: 'C1', screens: [] }, live, NOW), null);
  assert.ok(coveringDeviation({ rule: 'C1', screens: [] }, parseDeviations([{ id: 'D2', screens: ['*'], rules: ['C1'], reason: 'r', 'decided-by': 'd' }]).deviations, NOW));
});

test('findings: deviationsFromUx reads the front matter; missing file keeps the stored copy', () => {
  const p = project(uxMd({ deviations: 'deviations:\n  - id: D7\n    screens: [lista]\n    rules: [T1]\n    reason: "r"\n    decided-by: d\n' }));
  try {
    assert.deepEqual(findings.deviationsFromUx(p.ux).map((d) => d.id), ['D7']);
    assert.equal(findings.deviationsFromUx(join(p.root, 'nao-existe.md')), null);
  } finally { rmSync(p.root, { recursive: true, force: true }); }
});

// ---------- per-module glossary ----------

test('glossary: per-module map is chosen by --module, falls back to default, single path stays compatible', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-gloss-'));
  try {
    writeFileSync(join(dir, 'financeiro.md'), '| Termo | Nunca chamar de |\n|---|---|\n| Centro de custo | "departamento" |\n');
    writeFileSync(join(dir, 'compras.md'), '| Termo | Nunca chamar de |\n|---|---|\n| Proposta | "rascunho" |\n| Nota Fiscal | "cupom" |\n');
    const ux = join(dir, 'UX.md');
    writeFileSync(ux, '---\nname: x\n---\n\n| Termo | Evitar |\n|---|---|\n| Aprovação | "aceite" |\n');
    const cfg = configFrom({ content: { glossary: { default: 'financeiro.md', compras: 'compras.md', publico: 'inline' } } });
    assert.ok(isModuleGlossary(cfg.content.glossary));
    assert.deepEqual(loadGlossary(cfg, ux, 'compras').map((g) => g.term), ['Proposta', 'Nota Fiscal']);
    assert.deepEqual(loadGlossary(cfg, ux, 'publico').map((g) => g.term), ['Aprovação']);
    assert.deepEqual(loadGlossary(cfg, ux, 'outro').map((g) => g.term), ['Centro de custo']);
    assert.deepEqual(loadGlossary(cfg, ux).map((g) => g.term), ['Centro de custo']);
    assert.equal(glossarySource(cfg.content.glossary, 'compras').module, 'compras');
    assert.deepEqual(loadGlossary(configFrom({ content: { glossary: 'compras.md' } }), ux, 'compras').map((g) => g.term), ['Proposta', 'Nota Fiscal']);
    // a term → synonyms map is still a single glossary
    assert.equal(isModuleGlossary({ Proposta: ['rascunho'] }), false);
    // no default and missing module: nothing
    assert.deepEqual(loadGlossary(configFrom({ content: { glossary: { compras: 'compras.md' } } }), ux, 'financeiro'), []);
    // text.mjs: a canonical term with a capital in the middle becomes an X10 proper noun
    const nouns = glossaryProperNouns(loadGlossary(cfg, ux, 'compras'));
    assert.deepEqual(nouns, ['Nota Fiscal']);
    const html = '<!doctype html><html><body><main><h1>Gerar Nota Fiscal</h1><h2>Lista De Propostas</h2></main></body></html>';
    const x10 = (r) => r.findings.filter((f) => f.rule === 'X10').map((f) => f.text);
    assert.deepEqual(x10(analyzeText(html, configFrom({}), 't.html', { properNouns: nouns })), ['Lista De Propostas']);
    assert.ok(x10(analyzeText(html, configFrom({}), 't.html')).includes('Gerar Nota Fiscal'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('audit: passes --module to text and consistency; drift is a prerequisite warning and goes to the report', () => {
  const ctx = { screens: 's', code: [], ux: 'U.md', module: 'compras', map: 'f.json' };
  for (const fam of ['text', 'consistency']) {
    const args = DETECTOR_REGISTRY.find((d) => d.family === fam).args(ctx);
    assert.deepEqual(args.slice(args.indexOf('--module'), args.indexOf('--module') + 2), ['--module', 'compras']);
  }
  const p = project(uxMd());
  try {
    const r = runAudit({ module: 'm', root: p.root }, { registry: [], now: NOW });
    const fresh = r.prerequisites.find((x) => x.id === 'ux-fresh');
    assert.equal(fresh.ok, false);
    assert.equal(fresh.warning, true);
    assert.match(fresh.detail, /^UX\.md (desatualizado|out of date): .*orfa/);
    assert.ok(r.ux_drift.findings.some((f) => f.rule === 'U1'));
    const text = formatReport(r);
    assert.match(text, /! ux-fresh: UX\.md (desatualizado|out of date)/);
    assert.match(text, /UX\.md × (produto|product)/);
  } finally { rmSync(p.root, { recursive: true, force: true }); }
});
