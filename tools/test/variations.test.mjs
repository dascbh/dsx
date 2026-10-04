import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  manifestPath, rootFromManifest, validateManifest, loadRegistry, loadCatalogs, measureRow, measureCapture, divergences,
  lintManifest, makeDecision, parseCompose, writeDecision, rowsOf, countWords,
} from '../ux-lint/variations.mjs';
import { renderVariationsPages, groupsOf, delta, paginateRows } from '../ux-lint/lib/variations-page.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'variations');
const FILE = manifestPath({ root: ROOT, module: 'demo', flow: 'assistente' });
const load = () => JSON.parse(readFileSync(FILE, 'utf8'));
const cfg = configFrom({});
const registry = loadRegistry(ROOT, 'demo').items;
const catalogs = loadCatalogs();

test('manifest path and root round-trip', () => {
  assert.equal(rootFromManifest(FILE), ROOT);
  assert.ok(existsSync(FILE));
});

test('validate: fixture passes, with a warning for the variant that does not change text', () => {
  const r = validateManifest(load(), { root: ROOT, catalogs, registry });
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some((w) => /"b".*texto/.test(w)));
});

test('validate: missing capture, unknown pattern/law/archetype, unknown finding, copied frames and fake variation are errors', () => {
  const m = load();
  m.variants[0].frames[0].capture = 'nao/existe.html';
  m.variants[0].patterns.push('nao-existe');
  m.variants[0].laws = ['lei-inventada'];
  m.variants[0].archetype = 'arquetipo-inventado';
  m.variants[0].resolves.push('t-ffffffff');
  m.variants[1].frames[0].capture = m.current.frames[0].capture;
  m.variants[1].changes = { screen: '', flow: '', behavior: '', text: 'troca o rótulo' };
  delete m.variants[1].metrics.decisions;
  const { errors } = validateManifest(m, { root: ROOT, catalogs, registry });
  for (const re of [/captura não existe/, /padrão "nao-existe"/, /lei "lei-inventada"/, /arquétipo "arquetipo-inventado"/, /"t-ffffffff" não existe/, /mesma captura de "current"/, /muda só Texto/, /"decisions" ausente/]) {
    assert.ok(errors.some((e) => re.test(e)), `faltou erro ${re}: ${errors.join(' | ')}`);
  }
});

test('measure: words exclude the header and nav shell; primaries and dialogs come from the UX.md selectors', () => {
  assert.equal(countWords('Gerar 4 documentos — já'), 4);
  const html = '<body><header>Produto Demo Grande</header><main><h1>Um dois</h1><button class="MuiButton-contained">Três</button></main><div role="dialog" hidden>x</div></body>';
  assert.deepEqual(measureCapture(html, cfg), { words: 3, primary_actions: 1, dialog_open: false });
  assert.equal(measureCapture('<body><main><p aria-live="polite">anúncio</p><input value="Ana Souza"><p>um</p></main></body>', cfg).words, 3);
  const dlg = '<body><main><p>muitas palavras aqui fora</p></main><div role="dialog"><h2>Excluir</h2><button class="MuiButton-contained">Excluir</button></div></body>';
  assert.deepEqual(measureCapture(dlg, cfg), { words: 2, primary_actions: 1, dialog_open: true });
  const m = load();
  const cur = measureRow(rowsOf(m)[0], { root: ROOT, cfg });
  assert.deepEqual(cur.metrics, { words_on_screen: 26, primary_actions: 2, dialogs: 0 });
  assert.deepEqual(divergences(m.current.metrics, cur.metrics), []);
  assert.deepEqual(divergences({ primary_actions: 2, words_on_screen: 100 }, { primary_actions: 1, words_on_screen: 103 }), [{ metric: 'primary_actions', declared: 2, measured: 1 }]);
});

test('lint: A resolves what it claims (flow and layout without geometry stay unverified); B keeps X1 and the review text and adds a sev-3 T4', () => {
  const r = lintManifest(load(), { root: ROOT, cfg, registry, geometry: null });
  const a = r.variants.a, b = r.variants.b;
  const st = (x) => Object.fromEntries(x.resolves.map((y) => [y.id, y.status]));
  assert.deepEqual(st(a), { 't-0000x1aa': 'resolved', 's-0000t1bb': 'resolved', 'st-000s1cc': 'resolved', 'l-000l6dd': 'unverified', 't-000descee': 'resolved', 'f-000f3ff': 'unverified' });
  assert.equal(a.ok, true);
  assert.deepEqual(st(b), { 't-0000x1aa': 'persists', 't-000descee': 'persists' });
  assert.deepEqual(b.blocking.map((x) => x.rule), ['T4']);
  assert.equal(b.ok, false);
});

test('decision: whole variant or composition per axis, validated against the manifest, written next to it', () => {
  const m = load();
  assert.deepEqual(parseCompose('screen=a, flow=b,behavior=a,text=current'), { screen: 'a', flow: 'b', behavior: 'a', text: 'current' });
  assert.deepEqual(makeDecision(m, { variant: 'a', now: new Date('2026-10-04') }).decision, { format: 1, module: 'demo', flow: 'assistente', mode: 'variant', variant: 'a', comment: '', by: 'dono', at: '2026-10-04' });
  assert.ok(makeDecision(m, { variant: 'z' }).errors.length);
  assert.ok(makeDecision(m, { compose: { screen: 'a', flow: 'b' } }).errors.some((e) => /behavior/.test(e)));
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-var-'));
  try {
    const f = writeDecision(tmp, m, makeDecision(m, { compose: parseCompose('screen=a,flow=b,behavior=a,text=a'), comment: 'fluxo de B' }).decision);
    assert.equal(f, join(tmp, '.dsx', 'variations', 'demo', 'assistente', 'decision.json'));
    assert.equal(JSON.parse(readFileSync(f, 'utf8')).compose.flow, 'b');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('page: steps grouped, behavior as before → action → after, metrics vs today, side-by-side and decision form', () => {
  const m = load();
  const g = groupsOf({ frames: m.variants[0].frames });
  assert.deepEqual(g.map((x) => x.step), ['Montar o lote', 'Gerar']);
  assert.equal(g[1].cells.length, 1);
  assert.equal(g[1].cells[0].type, 'behavior');
  assert.equal(g[1].cells[0].before.id, 'a2');
  assert.deepEqual(delta(4, 1), { kind: 'better', text: '▼ 3', sr: '3 a menos que hoje, melhor' });
  assert.equal(delta(2, 5).kind, 'worse');
  assert.equal(delta(0, 0).kind, 'same');
  const lint = lintManifest(m, { root: ROOT, cfg, registry, geometry: null });
  const [p] = renderVariationsPages(m, { lint, registry, file: 'v.html' });
  assert.match(p.html, /<title>Variações · Gerar documentos em lote<\/title>/);
  for (const id of ['v-current', 'v-a', 'v-b']) assert.ok(p.html.includes(`id="${id}"`), id);
  assert.match(p.html, /class="par" role="group" aria-label="Comportamento: clica em Gerar 4 documentos"/);
  assert.match(p.html, /data-v="lado" hidden/);
  assert.match(p.html, /href="#achado-t-0000x1aa"/);
  assert.match(p.html, /id="achado-t-0000x1aa"/);
  assert.match(p.html, /class="d d-better">▼ 1/);
  assert.match(p.html, /bloqueia: achado novo ≥ 3/);
  assert.match(p.html, /name="eixo-text"/);
  assert.match(p.html, /localStorage/);
  assert.match(p.html, /prefers-color-scheme:dark/);
  assert.match(p.html, /sem miniatura/);
});

test('page pagination: today on every page, variants split when images pass the limit', () => {
  const rows = rowsOf(load());
  const shots = new Map(rows.flatMap((r) => r.frames.map((f) => [f.capture, { thumb: `${f.id}.t`, full: `${f.id}.f` }])));
  assert.equal(paginateRows(rows, { shots, sizeOf: () => 1000, maxBytes: 10 * 1024 * 1024 }).length, 1);
  const pages = paginateRows(rows, { shots, sizeOf: () => 2 * 1024 * 1024, maxBytes: 10 * 1024 * 1024 });
  assert.equal(pages.length, 2);
  assert.ok(pages.every((p) => p[0].is_current));
  assert.deepEqual(pages.map((p) => p.slice(1).map((r) => r.id)), [['a'], ['b']]);
});
