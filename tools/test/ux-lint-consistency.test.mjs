import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { inventory, analyzeConsistency, parseAction, glossaryFromMarkdown, loadGlossary, screenOf } from '../ux-lint/consistency.mjs';
import { fromConsistency, collect } from '../ux-lint/findings.mjs';

const cfg = configFrom({});
const page = (body, h1 = 'Pedidos') => `<!doctype html><html><body><main><h1>${h1}</h1>${body}</main></body></html>`;
const dialog = (title, footer, body = '') => `<!doctype html><html><body><main><h1>Base</h1></main><div role="dialog"><h2 class="MuiDialogTitle-root">${title}</h2>${body}<div class="MuiDialogActions-root">${footer}</div></div></body></html>`;
const b = (t, v = 'text', extra = '') => `<button class="MuiButtonBase-root MuiButton-root MuiButton-${v}${v === 'contained' ? ' MuiButton-containedPrimary' : ''}"${extra}>${t}</button>`;
const tabs = (...names) => `<div class="MuiTabs-root">${names.map((n) => `<button role="tab" class="MuiTab-root">${n}</button>`).join('')}</div>`;

function run(files, opts = {}) {
  const entries = Object.entries(files).flatMap(([f, html]) => inventory(html, cfg, f));
  return analyzeConsistency(entries, opts);
}
const ids = (fs) => fs.map((f) => `${f.rule}:${f.key}`).sort();

test('consistency: action parsing (verb group, object without plural, destination)', () => {
  assert.deepEqual(parseAction('Excluir proposta'), { verb: 'excluir', group: 'delete', object: 'proposta' });
  assert.deepEqual(parseAction('Novo item'), { verb: 'novo', group: 'create', object: 'item' });
  assert.deepEqual(parseAction('Remover as propostas'), { verb: 'remover', group: 'delete', object: 'proposta' });
  assert.equal(parseAction('Adicionar à proposta').object, null);
  assert.equal(parseAction('Confirmar vínculo'), null);
  assert.equal(screenOf('/x/02-catalogo.empty.html'), '02-catalogo');
});

test('consistency: C1 same function with different verbs across screens', () => {
  const f = run({
    '01-lista.html': page(b('Excluir proposta', 'text')),
    '02-editor.html': page(b('Remover proposta', 'text')),
    '03-outra.html': page(b('Remover item', 'text')),
  });
  assert.deepEqual(ids(f), ['C1:delete|proposta']);
  assert.match(f[0].message, /"Excluir proposta" \(01-lista\) × "Remover proposta" \(02-editor\)/);
});

test('consistency: C1 verb-only label takes the object from aria-label or dialog title', () => {
  const f = run({
    '01-lista.html': page(b('Excluir', 'text', ' aria-label="Excluir proposta Pedido 3"')),
    '02-dlg.html': dialog('Remover proposta?', `${b('Cancelar')}${b('Remover', 'contained')}`),
  });
  assert.deepEqual(ids(f), ['C1:delete|proposta']);
});

test('consistency: C1 dismiss compares only dialog buttons with the same role', () => {
  const f = run({
    '01-dlg.html': dialog('Excluir proposta?', `${b('Cancelar')}${b('Excluir proposta', 'contained')}`),
    '02-dlg.html': dialog('Revogar link?', `${b('Voltar')}${b('Revogar link', 'contained')}`),
    '03-dlg.html': dialog('Critérios', `${b('Fechar')}`),
    '04-dlg.html': dialog('Ajuda', `${b('Fechar')}`, '<button class="MuiIconButton-root" aria-label="Cancelar"></button>'),
    '05-pagina.html': page(b('Voltar')),
  });
  assert.deepEqual(ids(f), ['C1:dismiss|cancel']);
  assert.equal(f[0].text, 'dispensar diálogo com ação');
  assert.match(f[0].message, /"Cancelar" \(01-dlg\) × "Voltar" \(02-dlg\)/);
});

test('consistency: C2 same label, different visual variant, same context only', () => {
  const f = run({
    '01-a.html': page(b('Salvar', 'contained')),
    '02-b.html': page(b('Salvar', 'outlined')),
    // gatilho (texto na página) × confirmação (cheio no diálogo): papéis diferentes, não acusa
    '03-c.html': page(b('Remover', 'text')),
    '04-d.html': dialog('Remover do catálogo?', `${b('Cancelar')}${b('Remover', 'contained')}`),
  });
  assert.deepEqual(ids(f), ['C2:page|salvar']);
  assert.equal(f[0].severity, 1);
});

test('consistency: C3 glossary deny-list and known synonym pairs in titles and tabs', () => {
  const md = `# Produto\n\n| Termo | Significado | Nunca chamar de |\n|---|---|---|\n| Proposta | texto do pedido | "rascunho", "draft" |\n| Orçamento | limites | "catálogo" (é outra coisa) |\n| Catálogo | o oficial | "lista" |\n`;
  const glossary = glossaryFromMarkdown(md);
  assert.deepEqual(glossary.map((g) => g.term), ['Proposta', 'Orçamento', 'Catálogo']);
  const f = run({
    '01-a.html': page(tabs('Rascunhos salvos', 'Modelos'), 'Pedidos'),
    '02-b.html': page('<h2>Templates da empresa</h2>'),
    '03-c.html': page('<h2>Catálogo oficial</h2>'),
  }, { glossary });
  // "catálogo" é termo canônico de outra linha: não acusa
  assert.deepEqual(ids(f), ['C3:glossary|rascunho', 'C3:synonyms|modelo|template']);
  assert.match(f[0].message, /"Rascunhos salvos" usa "rascunho"; o glossário chama de "Proposta"/);
});

test('consistency: glossary from UX.md (path, map, inline)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-cons-'));
  writeFileSync(join(dir, 'glossario.md'), '| Termo | Evitar |\n|---|---|\n| Pedido | ordem |\n');
  writeFileSync(join(dir, 'UX.md'), '---\nversion: alpha\n---\n\n| Term | Avoid |\n|---|---|\n| Draft | sketch |\n');
  const ux = join(dir, 'UX.md');
  assert.deepEqual(loadGlossary(configFrom({ content: { glossary: 'glossario.md' } }), ux), [{ term: 'Pedido', avoid: ['ordem'] }]);
  assert.deepEqual(loadGlossary(configFrom({ content: { glossary: 'inline' } }), ux), [{ term: 'Draft', avoid: ['sketch'] }]);
  assert.deepEqual(loadGlossary(configFrom({ content: { glossary: { Proposta: ['rascunho'] } } }), ux), [{ term: 'Proposta', avoid: ['rascunho'] }]);
  assert.deepEqual(loadGlossary(configFrom({}), ux), []);
});

test('consistency: CLI JSON goes into findings.mjs with stable c- ids anchored on the key', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-cons-'));
  writeFileSync(join(dir, '01-lista.html'), page(b('Excluir proposta')));
  writeFileSync(join(dir, '02-editor.html'), page(b('Apagar proposta')));
  const out = execFileSync(process.execPath, [join(import.meta.dirname, '..', 'ux-lint', 'consistency.mjs'), dir, '--json'], { encoding: 'utf8' });
  const json = JSON.parse(out);
  assert.equal(json.summary.by_rule.C1, 1);
  const items = fromConsistency(json);
  assert.deepEqual(items[0].screens, ['01-lista', '02-editor']);
  assert.deepEqual(items[0].variants.sort(), ['Apagar proposta', 'Excluir proposta']);
  const f = join(dir, 'c.json');
  writeFileSync(f, out);
  const a = collect({ consistency: f });
  assert.match(a.items[0].id, /^c-[0-9a-f]{8}$/);
  // mais uma tela com o mesmo problema não muda o id
  writeFileSync(join(dir, '03-outra.html'), page(b('Remover proposta')));
  const out2 = execFileSync(process.execPath, [join(import.meta.dirname, '..', 'ux-lint', 'consistency.mjs'), dir, '--json'], { encoding: 'utf8' });
  writeFileSync(f, out2);
  assert.equal(collect({ consistency: f }).items[0].id, a.items[0].id);
});

test('adicionar (algo existente) e criar (objeto novo) são grupos diferentes', async () => {
  const { VERB_GROUPS } = await import('../ux-lint/consistency.mjs');
  if (VERB_GROUPS.create.includes('adicionar') || !VERB_GROUPS.add.includes('adicionar')) throw new Error('grupos');
});
