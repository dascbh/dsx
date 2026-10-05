import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHtml, querySelectorAll, querySelector, closest, textOf } from '../ux-lint/lib/html.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { analyzeScreen, summarize } from '../ux-lint/screen.mjs';
import { normalizeDetectorJson } from '../ux-lint/lib/legacy.mjs';
import { analyzeFlow } from '../ux-lint/flow.mjs';
import { parseYaml } from '../lib/yaml-lite.mjs';

const rules = (r) => r.findings.map((a) => a.rule).sort();
const page = (body, h1 = '<h1>Pedidos</h1>') =>
  `<!doctype html><html><head><title>t</title><style>.x{}</style></head><body><header>Topo</header><main>${h1}${body}</main></body></html>`;
const primaryBtn = (t) => `<button class="MuiButton-root MuiButton-contained">${t}</button>`;
const secondaryBtn = (t) => `<button class="MuiButton-root MuiButton-text">${t}</button>`;
const dialogHtml = (title, content, footer) =>
  `<div role="presentation"><div class="MuiDialog-paper" role="dialog" aria-labelledby="t1"><h2 id="t1">${title}</h2><div>${content}</div><div class="MuiDialogActions-root">${footer}</div></div></div>`;

test('html: tree, void elements, ignored script/style, entities', () => {
  const root = parseHtml('<div id="a" class="x y"><img src=1><br/><script>if (a<b) {}</script><p>A &amp; B&nbsp;C</p></div><style>p{}</style>');
  const div = querySelector(root, '#a');
  assert.equal(div.children.length, 4); // img, br, script, p
  assert.equal(textOf(div), 'A & B C');
  assert.equal(querySelectorAll(root, 'p').length, 1);
});

test('html: contract selectors', () => {
  const root = parseHtml(`<main><form><input type="hidden"><input type="text" id="n"><input type="checkbox"><textarea></textarea></form>
    <button class="MuiButton-contained MuiButton-colorError" data-x="1">Excluir</button><span role="button">Ícone</span></main><nav><button>Menu</button></nav>`);
  const field = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select';
  assert.deepEqual(querySelectorAll(root, field).map((n) => n.tag), ['input', 'textarea']);
  assert.equal(querySelectorAll(root, 'button.MuiButton-contained').length, 1);
  assert.equal(querySelectorAll(root, '[data-x=1]').length, 1);
  assert.equal(querySelectorAll(root, '[data-x="1"]').length, 1);
  assert.equal(querySelectorAll(root, 'button, [role=button]').length, 3);
  assert.equal(querySelectorAll(root, 'main button').length, 1);
  assert.equal(querySelectorAll(root, 'main > button').length, 1);
  assert.equal(querySelectorAll(root, 'button:not(.MuiButton-contained)').length, 1);
  const input = querySelector(root, '#n');
  assert.equal(closest(input, 'main, nav').tag, 'main');
  assert.equal(closest(input, 'nav'), null);
  assert.throws(() => querySelectorAll(root, 'a:hover'), /Unsupported selector/);
});

test('yaml-lite: 3 levels, inline lists with quotes, "#" and "," protected', () => {
  const y = parseYaml([
    'verification:',
    '  selectors:',
    '    regions: ["header", "#main", "a, b"]   # comentário',
    '    field: "input:not([type=hidden]), textarea"',
    'action: { region: top, max: 1 }',
    "text: it's ok # comentário",
  ].join('\n'));
  assert.deepEqual(y.verification.selectors.regions, ['header', '#main', 'a, b']);
  assert.equal(y.verification.selectors.field, 'input:not([type=hidden]), textarea');
  assert.deepEqual(y.action, { region: 'top', max: 1 });
  assert.equal(y.text, "it's ok");
});

test('config: contract defaults and partial override', () => {
  const c = configFrom({ actions: { 'primary-per-region': 2 }, content: { forbidden: ['tenant'] } });
  assert.equal(c.actions['primary-per-region'], 2);
  assert.equal(c.actions['dialog-order'], 'cancel-action');
  assert.equal(c.verification.selectors.dialog, '[role=dialog]');
  assert.equal(c.flows['max-journey-steps'], 12);
  assert.deepEqual(c.content.forbidden, ['tenant']);
});

test('T1: two primaries in main; open dialog ignores the page behind', () => {
  assert.deepEqual(rules(analyzeScreen(page(primaryBtn('Criar pedido') + primaryBtn('Exportar PDF')))), ['T1']);
  const withDialog = page(primaryBtn('Criar pedido') + primaryBtn('Exportar PDF') + dialogHtml('Novo', '<p>x</p>', secondaryBtn('Cancelar') + primaryBtn('Criar')));
  assert.deepEqual(rules(analyzeScreen(withDialog)), []);
});

test('T2: dialog footer with the action before cancel', () => {
  const r = analyzeScreen(page(dialogHtml('Excluir proposta?', '<p>x</p>', primaryBtn('Excluir proposta') + secondaryBtn('Cancelar'))));
  assert.deepEqual(rules(r), ['T2']);
  assert.match(r.findings[0].region, /dialog "Excluir proposta\?"/);
  // A content button before the footer's Fechar is not in the footer: not compared.
  assert.deepEqual(rules(analyzeScreen(page(dialogHtml('Categorias', primaryBtn('Adicionar'), secondaryBtn('Fechar'))))), []);
  // Ordem inversa declarada no UX.md.
  const cfg = configFrom({ actions: { 'dialog-order': 'action-cancel' } });
  assert.deepEqual(rules(analyzeScreen(page(dialogHtml('X', '', secondaryBtn('Cancelar') + primaryBtn('Salvar'))), cfg)), ['T2']);
});

test('T3: no h1 and two h1', () => {
  assert.deepEqual(rules(analyzeScreen(page('<p>x</p>', ''))), ['T3']);
  assert.deepEqual(rules(analyzeScreen(page('<h1>Outro</h1>'))), ['T3']);
});

test('T4: placeholder-only field fails; label or aria-label passes', () => {
  const r = analyzeScreen(page('<input type="text" placeholder="Buscar">'));
  assert.deepEqual(rules(r), ['T4']);
  assert.match(r.findings[0].message, /placeholder/);
  assert.deepEqual(rules(analyzeScreen(page('<label for="b">Busca</label><input id="b" placeholder="Buscar">'))), []);
  assert.deepEqual(rules(analyzeScreen(page('<label>Nome <input></label><input aria-label="CNPJ"><input aria-hidden="true">'))), []);
});

test('T5: destructive with generic label (no duplicate T7)', () => {
  const r = analyzeScreen(page(dialogHtml('Excluir?', '', secondaryBtn('Cancelar') + '<button class="MuiButton-contained MuiButton-colorError">Confirmar</button>')));
  assert.deepEqual(rules(r), ['T5']);
  const off = configFrom({ actions: { 'destructive-specific-label': false } });
  assert.deepEqual(rules(analyzeScreen(page('<button class="MuiButton-colorError">Confirmar</button>'), off)), ['T7']);
});

test('T6: forbidden term, whole word, case-insensitive', () => {
  const cfg = configFrom({ content: { forbidden: ['snapshot', 'RLS'] } });
  const r = analyzeScreen(page('<p>Novo Snapshot criado</p><p>snapshots antigos</p><p>rls</p>'), cfg);
  assert.deepEqual(r.findings.map((a) => a.message.match(/"([^"]+)"/)[1]).sort(), ['RLS', 'snapshot']);
  assert.match(r.findings.find((a) => a.message.includes('snapshot')).message, /\(1×\)/);
});

test('T7: label without verb is a warning (severity 1)', () => {
  const r = analyzeScreen(page(secondaryBtn('OK') + secondaryBtn('Enviar proposta')));
  assert.deepEqual(rules(r), ['T7']);
  assert.equal(r.findings[0].severity, 1);
});

test('flow: F1–F5 on a synthetic map', () => {
  const tr = (id, from, to, line) => ({ id, from, to, trigger: { type: 'button', label: id }, evidence: `src/App.tsx:${line}` });
  const map = {
    screens: [
      { id: 'lista', name: 'Lista', type: 'page', parent: null },
      { id: 'detalhe', name: 'Detalhe', type: 'page', parent: 'lista' },
      { id: 'fim', name: 'Fim', type: 'page', parent: null },
      { id: 'solta', name: 'Solta', type: 'page', parent: null },
      { id: 'dlg-a', name: 'Diálogo A', type: 'dialog', parent: 'detalhe' },
      { id: 'dlg-b', name: 'Diálogo B', type: 'dialog', parent: 'dlg-a' },
    ],
    transitions: [
      tr('t1', 'lista', 'detalhe', 10),
      tr('t2', 'detalhe', 'fim', 20),
      tr('t3', 'detalhe', 'dlg-a', 30),
      tr('t4', 'dlg-a', 'dlg-b', 40),
      tr('t5', 'dlg-b', 'dlg-a', 50),
      tr('t6', 'dlg-a', 'detalhe', 60),
      tr('t7', 'solta', 'lista', 70),
      tr('t8', 'fim', 'fim', 80),
    ],
    journeys: [{ id: 'j1', name: 'Longa', steps: ['t1', 't3', 't4', 't5', 't6', 't2'], persona_switches: [] }],
  };
  const cfg = configFrom({ flows: { 'max-journey-steps': 5 } });
  const { findings } = analyzeFlow(map, cfg);
  const byRule = (r) => findings.filter((a) => a.rule === r);
  assert.deepEqual(byRule('F1').map((a) => a.screen), ['fim']); // a loop to itself is not a way out
  assert.match(byRule('F1')[0].evidence[0], /src\/App\.tsx:20/);
  assert.deepEqual(byRule('F2').map((a) => a.screen), ['solta']);
  assert.deepEqual(byRule('F3').map((a) => a.screen), ['j1']);
  assert.deepEqual(byRule('F4').map((a) => a.screen), ['dlg-b']);
  assert.match(byRule('F4')[0].evidence[0], /t4 \(src\/App\.tsx:40\)/);
  assert.deepEqual(byRule('F5').map((a) => a.screen), ['detalhe']); // dlg-a volta a detalhe; dlg-b volta a dlg-a
  assert.ok(findings.every((a) => typeof a.severity === 'number'));
});

test('config: legacy Portuguese front matter gives the same config, with warnings', () => {
  const current = {
    navigation: { 'max-depth': 2, back: 'mandatory' },
    actions: { 'primary-per-region': 2, 'primary-position': 'bottom-right', 'dialog-order': 'action-cancel', 'destructive-specific-label': false },
    forms: { label: 'always-visible', validation: 'on-submit', required: 'mark-optional' },
    content: { buttons: 'verb-object', forbidden: ['tenant'], 'proper-nouns': ['Word'] },
    flows: { 'max-journey-steps': 8, 'max-stacked-dialogs': 2, 'dead-ends': 1 },
    verification: { selectors: { dialog: '.dlg', 'dialog-footer': '.foot', primary: '.p' } },
  };
  const legacy = {
    navegacao: { 'profundidade-maxima': 2, retorno: 'obrigatorio' },
    acoes: { 'primarias-por-regiao': 2, 'posicao-primaria': 'rodape-direita', 'ordem-dialogo': 'acao-cancelar', 'destrutiva-rotulo-especifico': false },
    formularios: { rotulo: 'sempre-visivel', validacao: 'ao-enviar', obrigatorios: 'marcar-opcionais' },
    conteudo: { botoes: 'verbo-objeto', proibidos: ['tenant'], 'nomes-proprios': ['Word'] },
    fluxos: { 'max-passos-jornada': 8, 'max-dialogos-empilhados': 2, 'becos-sem-saida': 1 },
    verificacao: { seletores: { dialogo: '.dlg', 'rodape-dialogo': '.foot', primaria: '.p' } },
  };
  const a = configFrom(current), b = configFrom(legacy);
  assert.deepEqual(b, a);
  assert.equal(a.legacyWarnings.length, 0);
  assert.ok(b.legacyWarnings.some((w) => /old name "acoes", rename to "actions"/.test(w)));
  assert.ok(b.legacyWarnings.some((w) => /old value "rodape-direita" in actions.primary-position, rename to "bottom-right"/.test(w)));
});

test('flow: legacy Portuguese map gives the same findings, with warnings', () => {
  const current = {
    screens: [{ id: 'a', name: 'A', type: 'page', parent: null }, { id: 'b', name: 'B', type: 'dialog', parent: 'a' }],
    transitions: [{ id: 't1', from: 'a', to: 'b', trigger: { type: 'button', label: 'Abrir' }, evidence: 'x.tsx:1' }],
    journeys: [{ id: 'j', name: 'J', steps: ['t1'], persona_switches: [] }],
  };
  const legacy = {
    telas: [{ id: 'a', nome: 'A', tipo: 'pagina', pai: null }, { id: 'b', nome: 'B', tipo: 'dialogo', pai: 'a' }],
    transicoes: [{ id: 't1', de: 'a', para: 'b', gatilho: { tipo: 'botao', rotulo: 'Abrir' }, evidencia: 'x.tsx:1' }],
    jornadas: [{ id: 'j', nome: 'J', passos: ['t1'], trocas_persona: [] }],
  };
  const a = analyzeFlow(current), b = analyzeFlow(legacy);
  assert.deepEqual(b.findings, a.findings);
  assert.equal(a.warnings, undefined);
  assert.ok(b.warnings.some((w) => /"telas", rename to "screens"/.test(w)));
  assert.ok(b.warnings.some((w) => /old screen type "dialogo", rename to "dialog"/.test(w)));
});

test('JSON convention: outputs use snake_case keys; camelCase and Portuguese outputs are normalized on read', () => {
  const r = analyzeScreen('<main><button class="MuiButton-contained">Salvar</button></main>');
  assert.ok('dialog_open' in r && !('dialogOpen' in r));
  const s = summarize([r]);
  for (const k of ['screens_with_findings', 'by_rule', 'by_severity']) assert.ok(k in s, k);
  const snakeOrIds = (o) => Object.keys(o).every((k) => !/[A-Z]/.test(k));
  assert.ok(snakeOrIds(s));
  const n = normalizeDetectorJson({ summary: { byRule: { X1: 1 }, porSeveridade: { 2: 1 } }, findings: [{ rule: 'X1', probableData: true, originalSeverity: 2 }], screens: [{ dialogOpen: true }] });
  assert.deepEqual(n.summary, { by_rule: { X1: 1 }, by_severity: { 2: 1 } });
  assert.deepEqual(n.findings[0], { rule: 'X1', probable_data: true, original_severity: 2 });
  assert.deepEqual(n.screens[0], { dialog_open: true });
});
