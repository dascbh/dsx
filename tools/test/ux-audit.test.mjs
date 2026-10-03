import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  runAudit, parseAuditArgs, resolveOptions, checkPrerequisites, extractRuleHits, formatReport, DETECTOR_REGISTRY, loadMatrix,
} from '../ux-lint/audit.mjs';

const CLI = fileURLToPath(new URL('../ux-lint/audit.mjs', import.meta.url));
const SCREEN = `<!doctype html><html><body><main><h1>Contratos</h1>
<button class="MuiButton-contained">Criar contrato</button><button class="MuiButton-contained">Importar</button>
<label for="n">Nome</label><input id="n"><input placeholder="Buscar"></main></body></html>`;
const MAP = { screens: [{ id: 'lista', name: 'Contratos', type: 'page', route: '/c', parent: null }, { id: 'det', name: 'Detalhe', type: 'page', parent: 'lista' }],
  transitions: [{ id: 't1', from: 'lista', to: 'det', trigger: { type: 'button', label: 'Abrir' }, evidence: 'src/L.tsx:3' }], journeys: [] };
const NOW = new Date('2026-10-03T12:00:00Z');

function project({ map = false, ux = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'dsx-audit-test-'));
  mkdirSync(join(root, '.stitch', 'm', 'code'), { recursive: true });
  writeFileSync(join(root, '.stitch', 'm', 'code', '01-lista.html'), SCREEN);
  if (map) { mkdirSync(join(root, '.dsx', 'maps'), { recursive: true }); writeFileSync(join(root, '.dsx', 'maps', 'flows-m.json'), JSON.stringify(MAP)); }
  if (ux) writeFileSync(join(root, 'UX.md'), '---\nversion: alpha\nname: P\nproduct:\n  persona: analista\n---\n\n# P\n');
  return root;
}
const coreOnly = DETECTOR_REGISTRY.filter((d) => ['text', 'screen', 'flow'].includes(d.family));

test('parseAuditArgs: --code takes several folders; flags and inline values', () => {
  const a = parseAuditArgs(['--module', 'm', '--code', 'a', 'b', '--register', '--ux=UX.md', '--json']);
  assert.deepEqual(a.code, ['a', 'b']);
  assert.equal(a.module, 'm');
  assert.equal(a.register, true);
  assert.equal(a.ux, 'UX.md');
  assert.equal(a.json, true);
});

test('missing prerequisites are reported with how to generate them', () => {
  const root = project();
  try {
    const pre = checkPrerequisites(resolveOptions({ module: 'm', root }));
    const by = Object.fromEntries(pre.items.map((p) => [p.id, p]));
    assert.equal(by.screens.ok, true);
    assert.equal(by.map.ok, false);
    assert.match(by.map.fix, /mapear/);
    assert.equal(by.ux.ok, false);
    assert.match(by.ux.fix, /lint-ux-md/);
    assert.equal(by.code.ok, false);
    assert.equal(by.geometry.ok, false);
    assert.match(by.geometry.fix, /measure\.mjs/);
    assert.equal(pre.available.map, null);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('flow detector is skipped without a map; report has every dimension', () => {
  const root = project();
  try {
    const r = runAudit({ module: 'm', root }, { registry: coreOnly, now: NOW });
    const flow = r.detectors.find((d) => d.family === 'flow');
    assert.equal(flow.status, 'skipped');
    assert.equal(r.dimensions.filter((d) => d.id !== '(none)').length, loadMatrix().dimensions.length);
    const actions = r.dimensions.find((d) => d.id === 'actions');
    assert.equal(actions.open, 1, 'T1: duas primárias no main');
    assert.equal(actions.by_severity[3], 1);
    assert.equal(actions.added, 1);
    const nav = r.dimensions.find((d) => d.id === 'navigation');
    assert.equal(nav.effective_coverage, 'judgment', 'sem fluxo, navegação vira julgamento');
    assert.equal(r.registered, false);
    assert.ok(!existsSync(join(root, '.dsx', 'findings', 'm', 'findings.json')), 'sem --register não grava');
    const text = formatReport(r);
    assert.match(text, /Relatório por dimensão/);
    assert.match(text, /✗ map/);
    assert.match(text, /como gerar/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('missing detector is tolerated and lowers coverage', () => {
  const root = project({ map: true, ux: true });
  try {
    const registry = [...coreOnly, { family: 'layout', path: 'tools/ux-lint/does-not-exist.mjs', needs: ['screens'], args: () => [] }];
    const r = runAudit({ module: 'm', root }, { registry, now: NOW });
    assert.equal(r.detectors.find((d) => d.family === 'layout').status, 'missing');
    const layout = r.dimensions.find((d) => d.id === 'layout');
    assert.equal(layout.effective_coverage, 'judgment');
    assert.deepEqual(layout.missing_families.map((x) => x.family), ['layout']);
    assert.match(formatReport(r), /detector ausente/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('--register writes the registry; second run marks fixed items', () => {
  const root = project({ map: true });
  try {
    const first = runAudit({ module: 'm', root, register: true }, { registry: coreOnly, now: NOW });
    assert.equal(first.registered, true);
    const file = join(root, '.dsx', 'findings', 'm', 'findings.json');
    const reg = JSON.parse(readFileSync(file, 'utf8'));
    assert.ok(reg.items.some((i) => i.rule === 'T1'));
    writeFileSync(join(root, '.stitch', 'm', 'code', '01-lista.html'), SCREEN.replace('<button class="MuiButton-contained">Importar</button>', '<button class="MuiButton-outlined">Importar</button>'));
    const second = runAudit({ module: 'm', root, register: true }, { registry: coreOnly, now: new Date('2026-10-04T12:00:00Z') });
    assert.equal(second.dimensions.find((d) => d.id === 'actions').fixed, 1);
    assert.equal(second.dimensions.find((d) => d.id === 'actions').open, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('family unknown to findings.mjs is counted outside the registry', () => {
  const root = project();
  try {
    const fake = join(root, 'fake-detector.mjs');
    writeFileSync(fake, `console.log(JSON.stringify({ summary: {}, screens: [{ file: 'a.html', findings: [{ rule: 'C1', severity: 2, message: 'x' }] }] }));`);
    const registry = [{ family: 'experimental-family', path: fake, needs: ['screens'], args: () => [] }];
    const r = runAudit({ module: 'm', root }, { registry, now: NOW });
    const c = r.dimensions.find((d) => d.id === 'consistency');
    assert.equal(c.unregistered, 1);
    assert.equal(c.unregistered_by_severity[2], 1);
    assert.equal(c.open, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('extractRuleHits counts text groups, not per-screen occurrences', () => {
  const json = { summary: {}, findings: [{ rule: 'X1', severity: 2 }, { rule: 'X3', severity: 0, probable_data: true }], screens: [{ file: 'a.html', findings: [{ rule: 'X1', severity: 2 }, { rule: 'X1', severity: 2 }] }] };
  assert.deepEqual(extractRuleHits(json).map((h) => h.rule), ['X1']);
});

test('CLI: usage error without --module; --json and --page work', () => {
  assert.equal(spawnSync(process.execPath, [CLI], { encoding: 'utf8' }).status, 2);
  const root = project({ map: true });
  try {
    const page = join(root, 'page.html');
    const r = spawnSync(process.execPath, [CLI, '--module', 'm', '--root', root, '--json', '--page', page], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.ok(Array.isArray(out.dimensions) && out.dimensions.length >= 14);
    assert.ok(out.dimensions.every((d) => 'open' in d && 'added' in d && 'fixed' in d && 'regressions' in d && 'gaps_pt' in d));
    assert.match(readFileSync(page, 'utf8'), /Copiar decisões/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
