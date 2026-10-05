import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { analyzeStates, analyzeStateCapture, requiredStates, discoverCaptures, loadArchetypeStates, summarize } from '../ux-lint/states.mjs';
import { fromStates, collect } from '../ux-lint/findings.mjs';

const page = (body) => `<!doctype html><html><body><header><button>Sair</button></header><nav><a href="/">Início</a></nav><main><h1>Pedidos</h1>${body}</main></body></html>`;
const dialog = (body, footer) => `<!doctype html><html><body><main><h1>Base</h1></main><div role="dialog"><h2>Excluir proposta?</h2>${body}<div class="MuiDialogActions-root">${footer}</div></div></body></html>`;
const btn = (t, cls = 'MuiButton-root MuiButton-outlined') => `<button class="${cls}">${t}</button>`;
const errorBox = (msg, action = '') => `<div role="alert"><p>Não foi possível carregar.</p><p>${msg}</p>${action}</div>`;
const ARCH = { 'operational-list': { states: ['loading', 'empty', 'empty-filtered', 'error', 'no-access', 'success'] },
  'editor-with-panel': { states: ['loading', 'saving', 'saved', 'error', 'no-access', 'success'] },
  'confirmation-dialog': { states: ['open', 'running', 'error', 'success'] },
  'form-dialog': { states: ['open', 'field-error', 'submitting', 'error', 'success'] } };
const cfg = configFrom({
  states: ['loading', 'empty', 'error', 'no-access', 'success'],
  archetypes: { 'operational-list': ['lista'], 'editor-with-panel': ['editor', 'painel-filho'], 'confirmation-dialog': ['dlg-excluir'], 'form-dialog': ['dlg-form'] },
});

function folder(files) {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-states-'));
  for (const [name, html] of Object.entries(files)) writeFileSync(join(dir, name), html);
  return dir;
}
const rules = (fs) => fs.map((f) => `${f.rule}:${f.state}`).sort();

test('states: discovers screens and states from file names', () => {
  const dir = folder({ '02-lista.html': page(''), '02-lista.empty.html': page(''), '02-lista.empty-filtered.html': page(''), 'notes.html': '', '10-dlg-excluir.html': '' });
  const c = discoverCaptures(dir);
  assert.deepEqual([...c.keys()], ['lista', 'dlg-excluir']);
  assert.deepEqual([...c.get('lista').states.keys()].sort(), ['empty', 'empty-filtered']);
  assert.equal(c.get('lista').nn, '02');
});

test('states: required states per kind (page, child, dialog, panel)', () => {
  const ux = ['loading', 'empty', 'error', 'no-access', 'success'];
  // page with a list: UX.md ∪ archetype, minus the main state
  assert.deepEqual(requiredStates({ kind: 'page', archetype: 'operational-list', uxStates: ux, archetypeStates: ARCH['operational-list'].states }),
    ['loading', 'empty', 'error', 'no-access', 'empty-filtered']);
  // editor: no empty list (the archetype has no empty state) and no transient state (saving)
  assert.deepEqual(requiredStates({ kind: 'page', archetype: 'editor-with-panel', uxStates: ux, archetypeStates: ARCH['editor-with-panel'].states }),
    ['loading', 'error', 'no-access', 'saved']);
  // child: subtracts what the parent requires and the page loading
  assert.deepEqual(requiredStates({ kind: 'child', archetype: 'editor-with-panel', uxStates: ux, archetypeStates: ARCH['editor-with-panel'].states, parentRequired: ['saved'] }), []);
  // dialog: only error when it calls the server; field-error only with a required field and when the archetype declares it
  assert.deepEqual(requiredStates({ kind: 'dialog', archetype: 'confirmation-dialog', archetypeStates: ARCH['confirmation-dialog'].states, traits: { serverAction: true } }), ['error']);
  assert.deepEqual(requiredStates({ kind: 'dialog', archetype: 'confirmation-dialog', archetypeStates: ARCH['confirmation-dialog'].states, traits: { serverAction: false } }), []);
  assert.deepEqual(requiredStates({ kind: 'dialog', archetype: 'form-dialog', archetypeStates: ARCH['form-dialog'].states, traits: { serverAction: true, requiredField: true } }), ['error', 'field-error']);
  // panel without an archetype: nothing
  assert.deepEqual(requiredStates({ kind: 'panel', uxStates: ux }), []);
  // no archetype: the whole UX.md minimum
  assert.deepEqual(requiredStates({ kind: 'page', uxStates: ux }), ['loading', 'empty', 'error', 'no-access']);
});

test('states: S1 flags each missing required state; order file makes a child screen', () => {
  const dir = folder({
    '02-lista.html': page('<table><tr><td>Pedido A</td></tr></table>'),
    '02-lista.loading.html': page('<div role="status" aria-label="Carregando"></div>'),
    '02-lista.empty.html': page(`<p>Nenhum pedido ainda.</p>${btn('Carregar pedidos')}`),
    '03-editor.html': page('<p>Texto</p>'),
    '04-painel-filho.html': page('<p>Painel</p>'),
    '05-dlg-excluir.html': dialog('<p>Some.</p>', `${btn('Cancelar', 'MuiButton-text')}${btn('Excluir proposta', 'MuiButton-contained MuiButton-colorError')}`),
    'capture-order.json': JSON.stringify([{ nn: '04', id: 'painel-filho', type: 'panel', parent: 'editor' }]),
  });
  const order = new Map([['painel-filho', { type: 'panel', parent: 'editor' }]]);
  const r = analyzeStates(dir, cfg, { archetypes: ARCH, order });
  const by = Object.fromEntries(r.map((x) => [x.screen, x]));
  assert.deepEqual(rules(by.lista.findings), ['S1:empty-filtered', 'S1:error', 'S1:no-access']);
  assert.deepEqual(rules(by.editor.findings), ['S1:error', 'S1:loading', 'S1:no-access', 'S1:saved']);
  assert.equal(by['painel-filho'].kind, 'child');
  assert.deepEqual(by['painel-filho'].findings, []);
  assert.equal(by['dlg-excluir'].kind, 'dialog');
  assert.deepEqual(rules(by['dlg-excluir'].findings), ['S1:error']);
  assert.match(by['dlg-excluir'].findings[0].message, /dialog with an action that calls the server/);
  assert.match(by.lista.findings.find((f) => f.state === 'empty-filtered').message, /archetype operational-list.*02-lista\.empty-filtered\.html/);
  const s = summarize(r);
  assert.equal(s.state_captures, 2);
  assert.equal(s.by_rule.S1, 8);
});

test('states: S2 empty or error state without an exit in its region', () => {
  const noExit = analyzeStateCapture(page('<div class="MuiTabs-root"><button role="tab">Lista</button></div><p>Nenhuma proposta salva ainda.</p><button disabled>Exportar</button>'), 'empty', cfg, 'x.empty.html');
  assert.deepEqual(rules(noExit), ['S2:empty']);
  assert.equal(noExit[0].region, 'main');
  assert.match(noExit[0].evidence, /^x\.empty\.html:\d+:\d+$/);
  const withExit = analyzeStateCapture(page(`<p>Nenhuma proposta salva ainda.</p>${btn('Nova proposta')}`), 'empty', cfg, 'x.empty.html');
  assert.deepEqual(withExit, []);
  // the exit in the header (outside the state's region) does not count
  const errorNoExit = analyzeStateCapture(page(errorBox('Tente de novo em instantes.')), 'error', cfg, 'x.error.html');
  assert.deepEqual(rules(errorNoExit), ['S2:error']);
  // state in a dialog: the region is the dialog
  const inDialog = analyzeStateCapture(dialog(errorBox('Tente de novo.'), btn('Fechar', 'MuiButton-text')), 'error', cfg, 'd.error.html');
  assert.deepEqual(inDialog, []);
});

test('states: S3 error message without guidance', () => {
  const bare = analyzeStateCapture(page(`<div role="alert"><p>Erro 500</p>${btn('Voltar')}</div>`), 'error', cfg, 'e.html');
  assert.deepEqual(rules(bare), ['S3:error']);
  const code = analyzeStateCapture(page(`<div role="alert">PURCHASING_INTERNAL_ERROR</div>${btn('Voltar')}`), 'error', cfg, 'e.html');
  assert.deepEqual(rules(code), ['S3:error']);
  const explainedOnly = analyzeStateCapture(page(`<div role="alert">O pedido foi removido do catálogo.</div>${btn('Voltar')}`), 'error', cfg, 'e.html');
  assert.deepEqual(rules(explainedOnly), ['S3:error']);
  const guided = analyzeStateCapture(page(errorBox('Não foi possível falar com o servidor agora. Tente de novo em instantes.', btn('Tentar novamente'))), 'error', cfg, 'e.html');
  assert.deepEqual(guided, []);
  const withRetry = analyzeStateCapture(page(errorBox('O servidor não respondeu.', btn('Tentar novamente'))), 'error', cfg, 'e.html');
  assert.deepEqual(withRetry, []);
  const noMessage = analyzeStateCapture(page(btn('Voltar')), 'error', cfg, 'e.html');
  assert.deepEqual(rules(noMessage), ['S3:error']);
  // in the main capture only the MUI error alert counts (a warning with role=alert is not an error)
  const main = analyzeStateCapture(page('<div class="MuiAlert-root MuiAlert-standardWarning" role="alert">Prazo perto do fim.</div><div class="MuiAlert-root MuiAlert-standardError" role="alert"><div class="MuiAlert-message">Falhou.</div></div>'), null, cfg, 'p.html');
  assert.deepEqual(rules(main), ['S3:principal']);
});

test('states: archetype catalog of the repository has states for every card', () => {
  const a = loadArchetypeStates(join(import.meta.dirname, '..', '..', 'archetypes'));
  assert.ok(a['operational-list'].states.includes('empty'));
  assert.ok(a['confirmation-dialog'].states.includes('open'));
});

test('states: JSON goes into findings.mjs with stable st- ids', () => {
  const dir = folder({ '02-lista.html': page(''), '02-lista.empty.html': page('<p>Nenhum pedido.</p>') });
  const out = execFileSync(process.execPath, [join(import.meta.dirname, '..', 'ux-lint', 'states.mjs'), dir, '--json'], { encoding: 'utf8' });
  const json = JSON.parse(out);
  assert.ok(json.screens[0].findings.length > 0);
  const items = fromStates(json);
  assert.ok(items.every((i) => i.family === 'states' && i.screens[0] === '02-lista'));
  assert.ok(items.some((i) => i.rule === 'S2' && /^empty · /.test(i.region)));
  const f = join(dir, 'st.json');
  writeFileSync(f, out);
  const a = collect({ states: f });
  const b = collect({ states: f });
  assert.deepEqual(a.families, ['states']);
  assert.ok(a.items.every((i) => /^st-[0-9a-f]{8}$/.test(i.id)));
  assert.deepEqual(a.items.map((i) => i.id), b.items.map((i) => i.id));
});

test('public page without login does not require no-access', async () => {
  const { requiredStates } = await import('../ux-lint/states.mjs');
  const r = requiredStates({ kind: 'page', archetype: 'public-decision-page', archetypeStates: ['loading', 'invalid-link', 'error'], traits: { public: true } });
  if (r.includes('no-access')) throw new Error(r.join(','));
});

test('states: English product text is recognized through the language packs', () => {
  // empty wording + exit action in English: no S2
  assert.deepEqual(analyzeStateCapture(page(`<p>No proposals yet.</p>${btn('New proposal')}`), 'empty', cfg, 'x.empty.html'), []);
  // failure-only English message: S3; with guidance: none
  const bare = analyzeStateCapture(page(`<div role="alert"><p>Something went wrong.</p></div>${btn('Back')}`), 'error', cfg, 'e.html');
  assert.deepEqual(rules(bare), ['S3:error']);
  const guided = analyzeStateCapture(page(`<div role="alert"><p>We could not load the orders. Try again in a moment.</p>${btn('Try again')}</div>`), 'error', cfg, 'e.html');
  assert.deepEqual(guided, []);
});
