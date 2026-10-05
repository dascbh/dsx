import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  analyzeLayout, normalizeGeometry, clusterValues, boxDistance, isSaturated, parseColor, screenIdOf, positionOk, inlinePrimary,
} from '../ux-lint/lib/geometry.mjs';
import { resolveArchetype, stateOf, analyzeGeometry, archetypeCatalog, limitsFrom } from '../ux-lint/layout.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { fromLayout, stableId } from '../ux-lint/findings.mjs';
import { resolvePlaywright, measure } from '../ux-lint/measure.mjs';

// ---------- geometry fixtures (hand-written, no browser) ----------

let seq = 0;
const el = (o = {}) => ({
  id: o.id ?? `main > el:nth-of-type(${++seq})`, tag: 'div', kind: 'block', text: '', region: 'main',
  style: { font_size: 15, font_weight: 400, ...(o.style || {}) }, ...o, box: { x: 0, y: 0, width: 10, height: 10, ...(o.box || {}) },
});
const main = (h = 900) => el({ id: 'main', tag: 'main', kind: 'region', box: { x: 220, y: 64, width: 1220, height: h } });
const geom = (elements, extra = {}) => ({ screen: '02-tela', file: '02-tela.html', viewport: { width: 1440, height: 900 }, body_font_size: 15, elements, ...extra });
const h1 = (o = {}) => el({ tag: 'h1', kind: 'heading', heading_level: 1, text: 'Pedidos', style: { font_size: 24, font_weight: 600 }, box: { x: 244, y: 90, width: 300, height: 32 }, ...o });
const btn = (text, box, o = {}) => el({ tag: 'button', kind: 'interactive', is_interactive: true, text, box: { width: 120, height: 36, ...box }, parent: 'main > div.acoes', ...o });
const primary = (text, box, o = {}) => btn(text, box, { is_primary: true, style: { background_color: 'rgb(43, 89, 195)', font_size: 14, font_weight: 600 }, ...o });
const rules = (r, rule) => r.findings.filter((f) => f.rule === rule);
const arch = (id, position, regions = [], region = 'page-header') => ({ id, regions, primary_action: { region, position } });

test('geometry: utilities (cluster, distance, color, screen id, normalize)', () => {
  assert.deepEqual(clusterValues([10, 12, 13, 40, 44, 90], 4), [10, 40, 90]);
  assert.equal(boxDistance({ x: 0, y: 0, width: 10, height: 10 }, { x: 13, y: 0, width: 5, height: 5 }), 3);
  assert.equal(boxDistance({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 }), 0);
  assert.deepEqual(parseColor('rgba(1, 2, 3, 0.5)'), { r: 1, g: 2, b: 3, a: 0.5 });
  assert.deepEqual(parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
  assert.equal(isSaturated('rgb(43, 89, 195)'), true); // brand blue
  assert.equal(isSaturated('rgb(227, 242, 253)'), false); // azul pastel
  assert.equal(isSaturated('rgb(128, 128, 128)'), false); // cinza
  assert.equal(isSaturated('rgba(43, 89, 195, 0.1)'), false);
  assert.equal(screenIdOf('04-pedido-editor.geometry.json'), 'pedido-editor');
  assert.equal(screenIdOf('02-catalogo.empty.html'), 'catalogo');
  const g = normalizeGeometry({ elements: [{ box: { x: 1 } }] });
  assert.equal(g.elements[0].box.width, 0);
  assert.equal(g.elements[0].is_interactive, false);
  assert.throws(() => normalizeGeometry({}), /elements/);
});

test('L1: primary at top-right passes; at the bottom-left fails (archetype wins over UX.md)', () => {
  const ok = analyzeLayout(geom([main(), h1(), primary('Novo item', { x: 1290, y: 90 })]), { archetype: arch('library', 'top-right') });
  assert.equal(rules(ok, 'L1').length, 0);
  const bad = analyzeLayout(geom([main(), h1(), primary('Salvar', { x: 244, y: 700 })]), { archetype: arch('library', 'top-right'), primary_position: 'bottom-right' });
  const [f] = rules(bad, 'L1');
  assert.equal(f.severity, 2);
  assert.match(f.message, /top-right, archetype library/);
  assert.equal(f.anchor, 'primary "Salvar"');
  assert.ok(f.evidence.includes('02-tela.html › '));
  // without an archetype, actions.primary-position from the UX.md applies
  const ux = analyzeLayout(geom([main(), h1(), primary('Salvar', { x: 244, y: 700 })]), { primary_position: 'top-right' });
  assert.equal(rules(ux, 'L1').length, 1);
  assert.match(rules(ux, 'L1')[0].message, /UX\.md/);
  // inline has no position to enforce
  assert.equal(rules(analyzeLayout(geom([main(), primary('X', { x: 244, y: 700 })]), { archetype: arch('public-decision-page', 'inline') }), 'L1').length, 0);
});

test('L1: a primary on the same row as a field of its form, or beside its section title, is a row action (not flagged)', () => {
  const dlg = { dialog_open: true };
  // Legacy region label (`diálogo`, geometry measured before the round-4 rename) is still a dialog.
  const box = el({ id: 'dlg', tag: 'div', kind: 'region', role: 'dialog', region: 'diálogo "Categorias"', box: { x: 420, y: 100, width: 600, height: 700 } });
  const form = 'dlg > div > form';
  const add = primary('Adicionar', { x: 910, y: 160 }, { region: 'diálogo "Categorias"', parent: form, id: `${form} > button` });
  const field = el({ id: `${form} > div > input`, kind: 'field', tag: 'input', region: 'diálogo "Categorias"', form_group: form, box: { x: 440, y: 160, width: 460, height: 38 } });
  assert.equal(inlinePrimary(add, [box, add, field]), true);
  assert.equal(rules(analyzeLayout(geom([box, field, add], dlg), { archetype: arch('form-dialog', 'bottom-right', [], 'dialog-footer') }), 'L1').length, 0);
  // without the field on the row, the same primary is measured again
  assert.equal(rules(analyzeLayout(geom([box, add], dlg), { archetype: arch('form-dialog', 'bottom-right', [], 'dialog-footer') }), 'L1').length, 1);
  const sec = 'main > section:nth-of-type(2) > div';
  const novo = primary('Novo signatário', { x: 1250, y: 440 }, { parent: sec });
  const title = el({ tag: 'h2', kind: 'heading', heading_level: 2, text: 'Signatários', parent: sec, box: { x: 244, y: 444, width: 200, height: 28 } });
  assert.equal(inlinePrimary(novo, [title, novo]), true);
  assert.equal(rules(analyzeLayout(geom([main(), h1(), title, novo]), { archetype: arch('settings', 'bottom-right') }), 'L1').length, 0);
});

test('L1: in a dialog, bottom-right is relative to the dialog box; side-panel primary does not count for page-header', () => {
  const dlg = el({ id: 'dlg', kind: 'region', region: 'dialog "Nova"', box: { x: 420, y: 200, width: 600, height: 400 } });
  const inDlg = (o) => ({ ...o, region: 'dialog "Nova"' });
  const ok = analyzeLayout(geom([dlg, inDlg(primary('Criar', { x: 880, y: 540 }))], { dialog_open: true }), { archetype: arch('form-dialog', 'bottom-right', [], 'dialog-footer') });
  assert.equal(rules(ok, 'L1').length, 0);
  const bad = analyzeLayout(geom([dlg, inDlg(primary('Adicionar', { x: 880, y: 240 }))], { dialog_open: true }), { archetype: arch('form-dialog', 'bottom-right', [], 'dialog-footer') });
  assert.equal(rules(bad, 'L1').length, 1);
  assert.match(rules(bad, 'L1')[0].message, /of the dialog height/);
  const panel = el({ kind: 'card', box: { x: 1036, y: 240, width: 380, height: 700 } });
  const r = analyzeLayout(geom([main(), h1(), panel, primary('Pedir aprovação', { x: 1050, y: 600 })]), { archetype: arch('editor-with-panel', 'top-right') });
  assert.equal(rules(r, 'L1').length, 0);
  assert.equal(positionOk({ x: 0, y: 0, width: 10, height: 10 }, 'top-left', { x: 0, y: 0, width: 1000, height: 800 }), true);
});

test('L2: more than N heavy elements in the first fold fails; nested and adjacent saturated blocks count once', () => {
  const heavy = [
    h1(), primary('A', { x: 900, y: 90 }), primary('B', { x: 1040, y: 90 }),
    el({ text: 'Total', style: { font_size: 22, font_weight: 700 }, box: { x: 244, y: 300, width: 200, height: 30 } }),
    el({ style: { background_color: 'rgb(230, 81, 0)' }, box: { x: 244, y: 400, width: 400, height: 60 } }),
  ];
  const [f] = rules(analyzeLayout(geom([main(), ...heavy])), 'L2');
  assert.equal(f.measure.count, 5);
  assert.match(f.message, /filled button/);
  assert.match(f.message, /saturated color block/);
  // below the fold does not count
  const below = heavy.map((e, i) => (i >= 3 ? { ...e, box: { ...e.box, y: 1200 } } : e));
  assert.equal(rules(analyzeLayout(geom([main(), ...below])), 'L2').length, 0);
  // cells of a table header (adjacent saturated blocks) count once; so does text inside the block
  const cells = [0, 1, 2, 3, 4, 5].map((i) => el({ tag: 'th', style: { background_color: 'rgb(43, 89, 195)' }, box: { x: 244 + i * 150, y: 300, width: 150, height: 36 } }));
  const inside = el({ text: 'Documento', style: { font_size: 20, font_weight: 700 }, box: { x: 250, y: 304, width: 100, height: 24 } });
  assert.equal(rules(analyzeLayout(geom([main(), h1(), ...cells, inside])), 'L2').length, 0);
  // the limit comes from the UX.md (layout.max-emphasis)
  assert.equal(rules(analyzeLayout(geom([main(), h1(), primary('A', { x: 900, y: 90 })]), { limits: { 'max-emphasis': 1 } }), 'L2').length, 1);
});

test('L3: h1 not the largest text, or lower level larger than upper, fails; numbers do not count', () => {
  const ok = analyzeLayout(geom([main(), h1(), el({ tag: 'h2', kind: 'heading', heading_level: 2, text: 'Seção', style: { font_size: 18 } }), el({ text: 'R$ 1.200,00', style: { font_size: 32 } })]));
  assert.equal(rules(ok, 'L3').length, 0);
  const big = analyzeLayout(geom([main(), h1(), el({ kind: 'text', text: 'Destaque enorme', style: { font_size: 30 } })]));
  assert.match(rules(big, 'L3')[0].message, /is not the largest text/);
  const inv = analyzeLayout(geom([main(), h1(),
    el({ tag: 'h3', kind: 'heading', heading_level: 3, text: 'OBJETO', style: { font_size: 12 } }),
    el({ tag: 'h4', kind: 'heading', heading_level: 4, text: 'Item', style: { font_size: 14 } })]));
  const [f] = rules(inv, 'L3');
  assert.match(f.message, /h4 "Item" \(14 px\) larger than h3 "OBJETO" \(12 px\)/);
  assert.equal(f.anchor, 'h4 larger than h3');
});

test('L4: form fields in more than 2 left positions fail; aligned columns and floating labels pass', () => {
  const field = (x, y, g = 'main > form') => el({ kind: 'field', tag: 'input', form_group: g, box: { x, y, width: 300, height: 40 } });
  const ok = analyzeLayout(geom([main(), field(244, 200), field(244, 260), field(600, 260), field(244, 320), field(600, 320)]));
  assert.equal(rules(ok, 'L4').length, 0);
  const bad = analyzeLayout(geom([main(), field(244, 200), field(252, 260), field(262, 320), field(244, 380)]));
  const [f] = rules(bad, 'L4');
  assert.equal(f.severity, 1);
  assert.deepEqual(f.measure.edges, [244, 252, 262]);
  // a floating label inside the field box is not an edge of its own
  const floating = el({ kind: 'label', label_for: 'f1', box: { x: 258, y: 210, width: 80, height: 16 } });
  const f1 = { ...field(244, 200), id: 'f1' };
  assert.equal(rules(analyzeLayout(geom([main(), f1, floating, field(244, 260), field(244, 320)])), 'L4').length, 0);
  // sibling cards in an aligned 3-column grid pass; one off the axis fails
  const card = (x, y) => el({ kind: 'card', parent: 'main > grid', box: { x, y, width: 300, height: 120 } });
  assert.equal(rules(analyzeLayout(geom([main(), card(244, 200), card(560, 200), card(876, 200), card(244, 340), card(560, 340), card(876, 340)])), 'L4').length, 0);
  assert.equal(rules(analyzeLayout(geom([main(), card(244, 200), card(260, 340), card(280, 480)])), 'L4').length, 1);
});

test('L5: label far from field, actions too far apart, action closer to neighbour group', () => {
  const f = el({ id: 'campo', kind: 'field', tag: 'input', box: { x: 244, y: 230, width: 300, height: 40 } });
  const near = el({ kind: 'label', label_for: 'campo', text: 'Nome', box: { x: 244, y: 206, width: 60, height: 18 } });
  assert.equal(rules(analyzeLayout(geom([main(), f, near])), 'L5').length, 0);
  const far = { ...near, box: { x: 244, y: 180, width: 60, height: 18 } };
  const [r1] = rules(analyzeLayout(geom([main(), f, far])), 'L5');
  assert.match(r1.message, /32 px from its field/);
  // actions of the same group
  const a = btn('Salvar', { x: 900, y: 600 }), b = btn('Cancelar', { x: 1100, y: 600 });
  assert.match(rules(analyzeLayout(geom([main(), a, b])), 'L5')[0].message, /80 px apart/);
  // content between them (pagination) and a destructive action kept apart do not fail
  const mid = el({ kind: 'text', text: 'pág. 1 de 3', box: { x: 1030, y: 610, width: 60, height: 16 } });
  assert.equal(rules(analyzeLayout(geom([main(), a, b, mid])), 'L5').length, 0);
  assert.equal(rules(analyzeLayout(geom([main(), a, { ...b, is_destructive: true }])), 'L5').length, 0);
  // links do not form an action group
  assert.equal(rules(analyzeLayout(geom([main(), { ...a, tag: 'a' }, { ...b, tag: 'a' }])), 'L5').length, 0);
  // button touching a neighboring group and far from its own
  const g1a = btn('Editar', { x: 600, y: 600, width: 30, height: 30 }, { parent: 'g1' });
  const g1b = btn('Excluir', { x: 670, y: 600, width: 30, height: 30 }, { parent: 'g1' });
  const g2 = btn('Subir', { x: 560, y: 600, width: 30, height: 30 }, { parent: 'g2' });
  const res = rules(analyzeLayout(geom([main(), g1a, g1b, g2])), 'L5');
  assert.equal(res.length, 1);
  assert.match(res[0].message, /closer to "Subir"/);
  // a touching wrapper (different parent) merges into the same group: no finding
  const t1 = btn('Subir', { x: 632, y: 600, width: 30, height: 30 }, { parent: 'span1' });
  assert.equal(rules(analyzeLayout(geom([main(), g1a, t1, { ...g1b, box: { ...g1b.box, x: 664 } }])), 'L5').length, 0);
});

test('L6: title and primary below the fold fail; dialog counts from its top and pinned footer passes', () => {
  assert.equal(rules(analyzeLayout(geom([main(), h1(), primary('Avançar', { x: 244, y: 700 })])), 'L6').length, 0);
  const r = analyzeLayout(geom([main(2000), h1({ box: { x: 244, y: 950, width: 300, height: 32 } }), primary('Avançar', { x: 244, y: 1180 })]));
  assert.equal(rules(r, 'L6').length, 2);
  const dlg = el({ id: 'dlg', kind: 'region', region: 'dialog "Excluir"', box: { x: 420, y: 1000, width: 600, height: 300 } });
  const d = (o) => ({ ...o, region: 'dialog "Excluir"' });
  const title = d(el({ kind: 'heading', heading_level: 2, text: 'Excluir', box: { x: 440, y: 1010, width: 200, height: 30 } }));
  // dialog shifted by the capture, but everything within 900 px of its top: passes
  assert.equal(rules(analyzeLayout(geom([dlg, title, d(primary('Excluir', { x: 880, y: 1250 }))], { dialog_open: true })), 'L6').length, 0);
  // dialog taller than the window: primary in the body, below the fold, fails; in the fixed footer, passes
  const tall = { ...dlg, box: { ...dlg.box, height: 1400 } };
  const p = d(primary('Salvar', { x: 880, y: 2300 }));
  assert.equal(rules(analyzeLayout(geom([tall, title, p], { dialog_open: true })), 'L6').length, 1);
  const footer = d(el({ archetype_region: 'dialog-footer', box: { x: 420, y: 2280, width: 600, height: 80 } }));
  assert.equal(rules(analyzeLayout(geom([tall, title, footer, p], { dialog_open: true })), 'L6').length, 0);
});

test('L7: running text over 90 characters per line fails; short or narrow text passes', () => {
  const t = (len, width, height, fs = 14) => el({ kind: 'text', text: 'x'.repeat(Math.min(80, len)), text_length: len, style: { font_size: fs, line_height: fs * 1.5 }, box: { x: 244, y: 300, width, height } });
  const [f] = rules(analyzeLayout(geom([main(), t(400, 1100, 63)])), 'L7'); // 3 linhas → ~133 por linha
  assert.equal(f.measure.chars_per_line, 133);
  assert.equal(rules(analyzeLayout(geom([main(), t(400, 560, 126)])), 'L7').length, 0); // 6 linhas → ~67
  assert.equal(rules(analyzeLayout(geom([main(), t(100, 1100, 21)])), 'L7').length, 0); // one line of 100: a sentence, not running text
  assert.equal(rules(analyzeLayout(geom([main(), t(140, 1100, 21)])), 'L7').length, 1); // one line of 140
});

test('L8: target under 24×24 fails only without free space; inline links are exempt; repeated targets collapse', () => {
  const icon = (x, o = {}) => btn('Excluir', { x, y: 300, width: 18, height: 18 }, o);
  assert.equal(rules(analyzeLayout(geom([main(), icon(600)])), 'L8').length, 0); // isolated: spacing exception
  const crowded = analyzeLayout(geom([main(), icon(600), icon(620, { text: 'Editar' })]));
  assert.equal(rules(crowded, 'L8').length, 2);
  assert.equal(rules(crowded, 'L8')[0].severity, 2);
  const rowsOf = [0, 1, 2].flatMap((i) => [icon(600, { box: { x: 600, y: 300 + i * 20, width: 18, height: 18 } }), icon(620, { text: 'Editar', box: { x: 620, y: 300 + i * 20, width: 18, height: 18 } })]);
  const col = rules(analyzeLayout(geom([main(), ...rowsOf])), 'L8');
  assert.equal(col.length, 2);
  assert.equal(col[0].measure.count, 3);
  const link = el({ tag: 'a', kind: 'interactive', is_interactive: true, is_inline: true, text: 'art. 5º', box: { x: 600, y: 300, width: 40, height: 16 } });
  assert.equal(rules(analyzeLayout(geom([main(), link, icon(640)])), 'L8').filter((f) => f.anchor.includes('art')).length, 0);
  assert.equal(rules(analyzeLayout(geom([main(), icon(600, { disabled: true }), icon(620, { text: 'Editar' })])), 'L8').length, 0);
});

test('L9: missing archetype region fails; declared region, heuristics and conditional regions pass', () => {
  const regions = ['page-header', 'editing-area', 'side-panel', 'bulk-actions-bar'];
  const a = arch('editor-with-panel', 'top-right', regions);
  const editor = el({ kind: 'card', box: { x: 244, y: 240, width: 776, height: 1200 } });
  const panel = el({ kind: 'card', box: { x: 1036, y: 240, width: 380, height: 700 } });
  assert.equal(rules(analyzeLayout(geom([main(), h1(), editor, panel]), { archetype: a }), 'L9').length, 0);
  const [f] = rules(analyzeLayout(geom([main(), h1(), editor]), { archetype: a }), 'L9');
  assert.match(f.message, /"side-panel"/);
  assert.equal(f.anchor, 'region side-panel missing');
  // declared markup (data-region / archetype-regions) counts even without the typical geometry
  const declared = el({ archetype_region: 'side-panel', box: { x: 244, y: 900, width: 100, height: 40 } });
  assert.equal(rules(analyzeLayout(geom([main(), h1(), editor, declared]), { archetype: a }), 'L9').length, 0);
  // dialog: header, body and footer by position
  const dlg = el({ id: 'dlg', kind: 'region', region: 'dialog "X"', box: { x: 420, y: 200, width: 600, height: 400 } });
  const d = (o) => ({ ...o, region: 'dialog "X"' });
  const parts = [d(el({ kind: 'heading', heading_level: 2, text: 'X', box: { x: 440, y: 220, width: 100, height: 30 } })),
    d(el({ kind: 'text', text: 'Corpo', box: { x: 440, y: 280, width: 560, height: 80 } })), d(btn('Cancelar', { x: 760, y: 540 })), d(primary('Criar', { x: 880, y: 540 }))];
  const fa = arch('form-dialog', 'bottom-right', ['dialog-header', 'dialog-body', 'dialog-footer'], 'dialog-footer');
  assert.equal(rules(analyzeLayout(geom([dlg, ...parts], { dialog_open: true }), { archetype: fa }), 'L9').length, 0);
  assert.equal(rules(analyzeLayout(geom([dlg, ...parts.slice(0, 2)], { dialog_open: true }), { archetype: fa }), 'L9').length, 1);
});

test('layout.mjs: archetype by screen id or route, state suffix skips L9, limits from UX.md, real catalog', () => {
  const map = { 'operational-list': ['catalogo', 'propostas'], 'editor-with-panel': ['/pedidos/propostas/:id'] };
  assert.equal(resolveArchetype('02-catalogo', '', map), 'operational-list');
  assert.equal(resolveArchetype('02-catalogo.empty.geometry.json', '', map), 'operational-list');
  assert.equal(resolveArchetype('04-x', '/pedidos/propostas/:id', map), 'editor-with-panel');
  assert.equal(resolveArchetype('99-outra', '/nada', map), null);
  assert.equal(stateOf('02-catalogo.empty'), 'empty');
  assert.equal(stateOf('02-catalogo'), null);
  const cat = archetypeCatalog();
  assert.deepEqual(cat['editor-with-panel'].regions, ['page-header', 'toolbar', 'editing-area', 'side-panel', 'status-bar']);
  assert.equal(cat['form-dialog'].primary_action.position, 'bottom-right');
  const cfg = configFrom({ archetypes: { 'editor-with-panel': ['pedido-editor'] }, layout: { fold: 700, 'max-emphasis': '2', foo: 1 } });
  assert.equal(limitsFrom(cfg).fold, 700);
  assert.equal(limitsFrom(cfg)['max-emphasis'], 2);
  assert.ok(!('foo' in limitsFrom(cfg)));
  const g = geom([main(), h1()], { screen: '04-pedido-editor' });
  const r = analyzeGeometry(g, cfg, cat);
  assert.equal(r.archetype, 'editor-with-panel');
  assert.ok(rules(r, 'L9').length >= 1);
  assert.equal(rules(analyzeGeometry({ ...g, screen: '04-pedido-editor.loading' }, cfg, cat), 'L9').length, 0);
});

test('findings: layout family, stable id without coordinates', () => {
  const run = (y) => ({ screens: [{ file: '02-tela.html', screen: '02-tela', findings: [
    { rule: 'L6', severity: 2, region: 'main', message: `primary action "Avançar" outside the first fold (ends ${y} px)`, anchor: 'primary "Avançar" below the fold' },
  ] }] });
  const [a] = fromLayout(run(1208)), [b] = fromLayout(run(1300));
  assert.equal(a.family, 'layout');
  assert.deepEqual(a.screens, ['02-tela']);
  assert.deepEqual(a.source, ['02-tela.html']);
  const ida = stableId(a), idb = stableId(b);
  assert.match(ida, /^l-[0-9a-f]{8}$/);
  assert.equal(ida, idb);
  const [c] = fromLayout({ screens: [{ ...run(1)['screens'][0], screen: '03-outra', file: '03-outra.html' }] });
  assert.notEqual(stableId(c), ida);
});

// ---------- measurement (only with Playwright available) ----------

const pw = resolvePlaywright(process.env.DSX_PLAYWRIGHT_CWD ?? process.cwd());
test('measure: real geometry from a static HTML (skipped without Playwright)', { skip: pw ? false : 'Playwright not found (set DSX_PLAYWRIGHT_CWD to a folder that has it)' }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-geom-'));
  try {
    const html = `<!doctype html><html><head><title>/pedidos</title><style>body{margin:0;font:15px sans-serif}
      .MuiButton-contained{background:#2B59C3;color:#fff;border:0;padding:8px 16px}</style></head>
      <body><header style="height:64px">Topo</header><main style="padding:24px">
      <h1 style="font-size:24px">Pedidos</h1>
      <form><label for="n">Nome</label><input id="n" style="display:block"></form>
      <button class="MuiButton-contained" style="position:absolute;right:24px;top:80px">Novo item</button>
      <button style="width:16px;height:16px;padding:0">x</button><button style="width:16px;height:16px;padding:0">y</button>
      </main></body></html>`;
    writeFileSync(join(dir, '02-tela.html'), html);
    const cfg = configFrom({});
    const [res] = await measure([join(dir, '02-tela.html')], { outDir: join(dir, 'g'), cfg, playwright: pw });
    const g = JSON.parse(readFileSync(res.out, 'utf8'));
    assert.equal(g.format, 'dsx-geometry');
    assert.equal(g.title, '/pedidos');
    assert.equal(g.dialog_open, false);
    const p = g.elements.find((e) => e.is_primary);
    assert.equal(p.text, 'Novo item');
    assert.equal(p.region, 'main');
    assert.ok(p.box.x > 1200);
    const label = g.elements.find((e) => e.kind === 'label');
    assert.equal(label.label_for, g.elements.find((e) => e.kind === 'field').id);
    assert.equal(g.elements.find((e) => e.kind === 'heading').heading_level, 1);
    const r = analyzeLayout(g, { primary_position: 'top-right' });
    assert.equal(rules(r, 'L1').length, 0);
    assert.ok(rules(r, 'L8').length >= 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
