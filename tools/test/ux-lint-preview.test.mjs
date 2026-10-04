import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  optionOps, implicitPreview, locatorFor, toPattern, validateOp, pickExample, pickSegment, flowDiagram, variantPlan,
  stateRecipe, previewKind, describeOps, screenOrder, PROPOSAL_LABEL,
} from '../ux-lint/lib/preview-spec.mjs';
import { textLines, addedLines, typographyScale } from '../ux-lint/lib/preview-kit.mjs';
import { planPreviews, runPreviews, summarizeManifest } from '../ux-lint/preview.mjs';
import { resolvePlaywright } from '../ux-lint/measure.mjs';
import { fromLayout, assignIds, merge, renderPages, writePages, pageCases } from '../ux-lint/findings.mjs';
import { paginate } from '../ux-lint/text-page.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'dsx-preview-'));
const textCase = (over = {}) => ({ id: 'case-c1', ids: ['t-1'], statuses: ['open'], family: 'text', rule: 'X1', element: 'button', severity: 2, text: 'Remover da lista — {}', variants: ['Remover da lista — Ana'], screens: ['07-dlg'], message: '', region: '', selectors: [], options: [], ...over });

test('text options: ready text → text; "(remover)" → remove; "Manter…" → badge; accessible name and tooltip → annotation', () => {
  const c = textCase();
  assert.deepEqual(optionOps(c, { text: 'Remover Ana da lista' }).ops, [{ op: 'text', text: 'Remover Ana da lista' }]);
  assert.deepEqual(optionOps(textCase({ element: 'helper' }), { text: '(remover)' }).ops, [{ op: 'remove' }]);
  assert.deepEqual(optionOps(c, { text: 'Manter como está' }).ops, [{ op: 'badge', text: 'Sem mudança' }]);
  assert.deepEqual(optionOps(textCase({ element: 'accessible-name' }), { text: 'Menu do Tributário' }).ops, [{ op: 'annotate', kind: 'screen-reader', text: 'Menu do Tributário' }]);
  assert.deepEqual(optionOps(textCase({ element: 'tooltip' }), { text: 'Lê de novo' }).ops, [{ op: 'annotate', kind: 'tooltip', text: 'Lê de novo' }]);
  // nome acessível citado numa instrução: a anotação traz o nome, não a instrução
  assert.equal(optionOps(textCase({ element: 'accessible-name' }), { text: 'Dica "Critério: x"; nome acessível "Mostrar x no texto"' }).ops[0].text, 'Mostrar x no texto');
  // instrução com o texto entre aspas depois do nome do elemento: troca só o texto principal
  const instr = optionOps(textCase({ element: 'helper' }), { text: 'Rodapé "Código do documento: 9f3c". É o mesmo.' });
  assert.deepEqual(instr.ops, [{ op: 'text', text: 'Código do documento: 9f3c' }]);
  assert.ok(instr.note);
  assert.match(optionOps(textCase({ element: 'helper' }), { text: 'Mover o aviso para o rodapé' }).none, /estrutura/);
  // num botão, verbo no começo é o próprio texto do botão
  assert.equal(optionOps(c, { text: 'Remover Ana' }).ops[0].op, 'text');
});

test('text options listing several elements pick the segment that matches this one', () => {
  assert.equal(pickSegment('Estou de acordo · Solicitar ajustes · Não concordo', ['De acordo']), 'Estou de acordo');
  const r = optionOps(textCase({ text: 'DRE Projetada', variants: [] }), { text: 'Créditos presumidos · DRE projetada · Regimes' });
  assert.equal(r.ops[0].text, 'DRE projetada');
  assert.deepEqual(r.ops[0].choices, ['Créditos presumidos', 'DRE projetada', 'Regimes']);
});

test('declared preview wins and is validated (style limited to the listed properties)', () => {
  const c = textCase();
  assert.deepEqual(optionOps(c, { text: 'x', preview: { op: 'variant', variant: 'outlined' } }).ops, [{ op: 'variant', variant: 'outlined' }]);
  assert.deepEqual(optionOps(c, { text: 'x', preview: [{ op: 'move', to: 'end' }, { op: 'style', css: { 'max-width': '72ch' } }] }).ops.map((o) => o.op), ['move', 'style']);
  assert.match(optionOps(c, { text: 'x', preview: { op: 'style', css: { color: 'red' } } }).none, /fora da lista/);
  assert.match(optionOps(c, { text: 'x', preview: { op: 'none', reason: 'decisão de produto' } }).none, /decisão de produto/);
  assert.ok(validateOp({ op: 'grow' }).error);
  assert.ok(validateOp({ op: 'example' }).error);
  assert.equal(validateOp({ op: 'example', screen: '02-acervo.error.html' }).op.screen, '02-acervo.error');
});

test('family defaults: L1 → move, L7 → style, C2 → variant of the majority, S1 → synthesize-state, F → diagram', () => {
  assert.deepEqual(implicitPreview({ family: 'layout', rule: 'L1' }).ops, [{ op: 'move', to: 'end', justify: 'flex-end' }]);
  assert.deepEqual(implicitPreview({ family: 'layout', rule: 'L7' }).ops, [{ op: 'style', css: { 'max-width': '60ch' } }]);
  const msg = 'botão "Confirmar" com variantes visuais diferentes (text em 03-doc, 26-max; contained em 24-acervo) — a mesma ação…';
  assert.deepEqual(variantPlan(msg), { major: 'text', minor: 'contained', screen: '24-acervo' });
  assert.deepEqual(implicitPreview({ family: 'consistency', rule: 'C2', message: msg }).ops, [{ op: 'variant', variant: 'text' }]);
  const files = ['02-acervo.error.html', '13-dlg-x.html', '14-dlg-y.error.html', '13-dlg-x.error.html'];
  assert.equal(pickExample(files, 'error', '13-dlg-x'), '14-dlg-y.error', 'outra tela, do mesmo tipo (diálogo)');
  assert.equal(pickExample(files, 'error', '05-lista'), '02-acervo.error');
  assert.equal(pickExample(files, 'no-access', '05-lista'), null);
  const s1 = { family: 'states', rule: 'S1', region: 'error · (tela)', screens: ['05-lista'] };
  assert.deepEqual(implicitPreview(s1).ops, [{ op: 'synthesize-state', state: 'error' }]);
  assert.deepEqual(implicitPreview({ ...s1, region: 'no-access · (tela)' }).ops, [{ op: 'synthesize-state', state: 'no-access' }]);
  assert.ok(implicitPreview({ family: 'flow', rule: 'F5' }).flow);
  assert.match(implicitPreview({ family: 'screen', rule: 'F9' }).none, /F9/);
  // opção sem preview em família não textual usa a mesma prévia padrão
  assert.equal(optionOps({ family: 'layout', rule: 'L7' }, { text: 'Limitar a linha' }).ops[0].op, 'style');
});

test('locator: layout keeps the measured selector; text turns the template into a pattern', () => {
  assert.deepEqual(locatorFor({ family: 'layout', rule: 'L1', text: 'primária "Avançar"', selectors: ['main > div > button'] }).selectors, ['main > div > button']);
  assert.deepEqual(locatorFor({ family: 'layout', rule: 'L7', text: 'linha longa em "Cada arquivo traz"', selectors: [] }).prefixes, ['Cada arquivo traz']);
  assert.ok(locatorFor({ family: 'states', rule: 'S1' }).screen_level);
  const p = new RegExp(toPattern('Documento {}f{}c{}'), 'i');
  assert.ok(p.test('Documento 9f3c21'));
  assert.ok(!p.test('Documento'));
  assert.equal(toPattern('{status} — {motivo de conclusão}'), null, 'modelo só de marcadores casaria qualquer texto');
  assert.equal(toPattern('—'), '^—$', 'texto literal curto (célula vazia) continua valendo');
  const loc = locatorFor(textCase());
  assert.ok(loc.patterns.some((x) => new RegExp(x).test('Remover da lista — Ricardo Almeida')));
  const t1 = locatorFor({ family: 'screen', rule: 'T1', message: '2 ações primárias (máx. 1): "De acordo", "Enviar"' });
  assert.equal(t1.patterns.length, 2);
  assert.equal(t1.kind, 'button');
});

const MAP = {
  screens: [{ id: 'lista', name: 'Lista', type: 'page' }, { id: 'det', name: 'Detalhe', type: 'page', parent: 'lista' }, { id: 'dlg', name: 'Diálogo', type: 'dialog', parent: 'det' }],
  transitions: [{ id: 't1', from: 'lista', to: 'det' }, { id: 't2', from: 'det', to: 'dlg' }],
  journeys: [],
};

test('flow diagram: before/after SVG for F1, F2 and F5 without a browser', () => {
  const f5 = flowDiagram(MAP, 'dlg', 'F5');
  assert.match(f5.before, /^<svg/);
  assert.ok(!f5.before.includes('voltar para'));
  assert.match(f5.after, /voltar para Detalhe/);
  const f1 = flowDiagram(MAP, 'det', 'F1');
  assert.match(f1.after, /class="n new"/);
  const f2 = flowDiagram(MAP, 'lista', 'F2');
  assert.match(f2.before, /fora de todas as jornadas/);
  assert.match(f2.after, /jornada declarada/);
  assert.equal(flowDiagram(MAP, 'nada', 'F2'), null);
});

function fixture() {
  const root = tmp();
  const screens = join(root, 'caps');
  mkdirSync(screens);
  writeFileSync(join(screens, '01-lista.html'), '<!doctype html><body style="margin:0;font:16px sans-serif"><main><section style="padding:20px;width:600px"><h1>Contratos</h1><p>Texto de apoio que ninguém lê.</p><div class="acoes"><button class="MuiButton-root MuiButton-contained" style="background:#0E71B8;color:#fff;padding:8px 16px;border:0">Remover da lista — Ana</button><button class="MuiButton-root MuiButton-outlined" style="background:#fff;color:#0E71B8;padding:8px 16px;border:1px solid #0E71B8">Cancelar</button></div></section></main></body>');
  writeFileSync(join(screens, '02-outra.html'), '<!doctype html><body style="margin:0;font:16px sans-serif"><main style="padding:20px"><h1>Outra</h1><table><tr><td>linha</td></tr></table></main></body>');
  writeFileSync(join(screens, '02-outra.error.html'), '<!doctype html><body style="margin:0;font:16px sans-serif"><main style="padding:20px"><h1>Outra</h1><div class="estado" style="padding:24px;border:1px solid #ccc"><p style="font-weight:700">Não foi possível carregar.</p><p>Tente de novo em instantes.</p><button>Tentar novamente</button></div></main></body>');
  return { root, screens };
}
const flowCase = { id: 'case-f1', ids: ['f-1'], statuses: ['open'], family: 'flow', rule: 'F5', severity: 3, text: '', variants: [], screens: ['dlg'], message: '', options: [] };

test('manifest and cache: flow diagrams without Playwright; element cases say why; second run reuses the cache', async () => {
  const { root, screens } = fixture();
  try {
    const out = join(root, 'previews');
    const cases = [textCase({ screens: ['01-lista'], options: [{ text: 'Remover Ana' }] }), flowCase];
    const plans = planPreviews(cases, { screensDir: screens, map: MAP });
    assert.equal(plans.length, 2);
    const r1 = await runPreviews(plans, { screensDir: screens, outDir: out, map: MAP, playwright: null });
    const m = JSON.parse(readFileSync(join(out, 'previews.json'), 'utf8'));
    assert.equal(m.cases['case-f1'].before.file.endsWith('.svg'), true);
    assert.ok(existsSync(join(out, m.cases['case-f1'].after.find((a) => a.file).file)));
    assert.match(m.cases['case-c1'].failed, /Playwright indisponível/);
    assert.equal(r1.stats.generated, 1);
    const r2 = await runPreviews(planPreviews(cases, { screensDir: screens, map: MAP }), { screensDir: screens, outDir: out, map: MAP, playwright: null });
    assert.equal(r2.stats.cached, 1, 'diagrama refeito só quando o hash muda');
    // filtro de severidade e casos resolvidos ficam fora
    assert.equal(planPreviews(cases, { screensDir: screens, map: MAP, minSeverity: 3 }).length, 1);
    assert.equal(planPreviews([{ ...flowCase, statuses: ['accepted-deviation'] }], { screensDir: screens, map: MAP }).length, 0);
    // mudar a captura muda o hash do caso
    const h1 = planPreviews(cases, { screensDir: screens })[0].hash;
    writeFileSync(join(screens, '01-lista.html'), readFileSync(join(screens, '01-lista.html'), 'utf8').replace('Contratos', 'Contratos!'));
    assert.notEqual(planPreviews(cases, { screensDir: screens })[0].hash, h1);
    assert.equal(summarizeManifest(m).by_op.flow, 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('register keeps the measured selector of layout findings without changing the id', () => {
  const geom = (elements) => ({ screens: [{ file: '17-passo.geometry.json', screen: '17-passo', findings: [{ rule: 'L1', severity: 2, region: 'main', message: 'ação primária "Avançar" fora…', anchor: 'primária "Avançar"', elements }] }] });
  const [a] = assignIds(fromLayout(geom(['main > div > button'])));
  const [b] = assignIds(fromLayout(geom([])));
  assert.equal(a.id, b.id);
  assert.deepEqual(a.selectors, ['main > div > button']);
  const reg = { module: 'm', updated: null, runs: [], items: [] };
  merge(reg, { items: [a], families: ['layout'] }, { now: new Date('2026-10-04T12:00:00Z') });
  assert.deepEqual(reg.items[0].selectors, ['main > div > button']);
});

// ---------- página ----------

function registryWithPreview(n = 3) {
  const reg = { module: 'm', updated: '2026-10-04', runs: [{}], items: [] };
  for (let i = 0; i < n; i++) reg.items.push({ id: `t-${i}`, family: 'text', rule: 'X1', severity: 2, element: 'button', text: `Botão ${i}`, variants: [], screens: ['01-lista'], source: [], message: 'm', origin: 'detector', present: true, status: 'open' });
  const options = { items: Object.fromEntries(reg.items.map((it) => [it.id, { problem: `P ${it.id}`, options: [{ text: 'Novo' }], recommended: { index: 0, why: '' } }])) };
  return { reg, options };
}
function manifestDir(reg, { bytes = 2000 } = {}) {
  const dir = tmp();
  const cases = {};
  for (const it of reg.items) {
    writeFileSync(join(dir, `${it.id}.before.webp`), Buffer.alloc(bytes, 1));
    writeFileSync(join(dir, `${it.id}.after-o0.webp`), Buffer.alloc(bytes, 2));
    cases[`case-${it.id}`] = { kind: 'element', screen: '01-lista', before: { file: `${it.id}.before.webp` }, after: [{ key: 'o0', option: 0, file: `${it.id}.after-o0.webp`, op: [{ op: 'text', text: 'Novo' }], description: 'texto trocado por "Novo"' }] };
  }
  writeFileSync(join(dir, 'previews.json'), JSON.stringify({ format: 'dsx-previews', cases }));
  return dir;
}

test('page with previews: before and after side by side, Antes | Depois toggle, alt text, lightbox; without: none of it', () => {
  const { reg, options } = registryWithPreview(1);
  const dir = manifestDir(reg);
  try {
    const outDir = tmp();
    const r = writePages(reg, options, { items: {} }, join(outDir, 'page.html'), { previewsDir: dir });
    const html = readFileSync(r.pages[0].file, 'utf8');
    assert.match(html, /data:image\/webp;base64,/);
    assert.match(html, /alt="Hoje: botão &quot;Botão 0&quot; na tela 01-lista, contornado em vermelho"/);
    assert.match(html, /alt="Opção A aplicada: texto trocado por &quot;Novo&quot;/);
    assert.match(html, /data-show="b"[^>]*>Antes<\/button><button type="button" data-show="a" aria-pressed="true">Depois/);
    assert.match(html, /<dialog id="pv-dlg"/);
    assert.match(html, /prefers-color-scheme:dark/);
    assert.match(html, /:root\[data-theme="dark"\]/);
    assert.match(html, /body\{background:var\(--bg\)/);
    // referência por arquivo em vez de embutir
    const rf = writePages(reg, options, { items: {} }, join(outDir, 'files.html'), { previewsDir: dir, previewFiles: true });
    const hf = readFileSync(rf.pages[0].file, 'utf8');
    assert.ok(!hf.includes('data:image/webp'));
    assert.match(hf, /<img src="[^"]*t-0\.before\.webp"/);
    // sem prévia
    const plain = renderPages(reg, options, { items: {} })[0].html;
    assert.ok(!plain.includes('pv-dlg') && !plain.includes('pv-alt'));
    rmSync(outDir, { recursive: true, force: true });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('page size limit: pages split by bytes, each self-contained with its own images, nav on top and bottom', () => {
  const { reg, options } = registryWithPreview(6);
  const dir = manifestDir(reg, { bytes: 300 * 1024 });
  try {
    const outDir = tmp();
    const r = writePages(reg, options, { items: {} }, join(outDir, 'page.html'), { previewsDir: dir, maxBytes: 1.6 * 1024 * 1024 });
    assert.ok(r.pages.length >= 3, `${r.pages.length} páginas`);
    assert.deepEqual(r.pages.map((p) => p.file.replace(/^.*\//, '')).slice(0, 2), ['page.html', 'page-2.html']);
    for (const p of r.pages) {
      assert.ok(p.bytes <= 1.6 * 1024 * 1024 * 1.05, `${p.file} ${p.bytes}`);
      const html = readFileSync(p.file, 'utf8');
      const data = JSON.parse(html.match(/<script type="application\/json" id="pv-data">([\s\S]*?)<\/script>/)[1]);
      for (const k of html.matchAll(/data-k="([^"]+)"/g)) assert.ok(data[k[1]], `imagem ${k[1]} embutida na própria página`);
      assert.equal((html.match(/<nav class="paginas"/g) ?? []).length, 2, 'navegação no topo e no rodapé');
    }
    // nova execução com menos páginas apaga as órfãs
    writePages(reg, options, { items: {} }, join(outDir, 'page.html'), { previewsDir: dir });
    assert.deepEqual(readdirSync(outDir).filter((f) => f.endsWith('.html')), ['page.html']);
    rmSync(outDir, { recursive: true, force: true });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('paginate keeps group order and cuts by case count', () => {
  const cases = [...Array(5)].map((_, i) => ({ id: `c${i}`, element: i < 3 ? 'button' : 'title' }));
  const pages = paginate(cases, { maxCases: 2 });
  assert.deepEqual(pages.map((p) => p.map((c) => c.id)), [['c3', 'c4'], ['c0', 'c1'], ['c2']]);
});

// ---------- Playwright (pulado sem ele) ----------

const pwDir = process.env.DSX_PLAYWRIGHT_CWD ?? process.cwd();
const playwright = resolvePlaywright(pwDir);
test('Playwright: before/after crops from the real capture, element outlined, mutation applied', { skip: !playwright && 'Playwright indisponível (defina DSX_PLAYWRIGHT_CWD para uma pasta que o tenha)' }, async () => {
  const { root, screens } = fixture();
  try {
    const out = join(root, 'previews');
    const cases = [
      textCase({ id: 'case-t', screens: ['01-lista'], options: [{ text: 'Remover Ana' }, { text: 'x', preview: { op: 'variant', variant: 'outlined' } }, { text: 'Manter' }] }),
      { id: 'case-d', ids: ['t-2'], statuses: ['open'], family: 'text', rule: 'desc', element: 'helper', severity: 1, text: 'Texto de apoio que ninguém lê.', variants: [], screens: ['01-lista'], message: '', options: [{ text: '(remover)' }] },
      { id: 'case-s', ids: ['st-1'], statuses: ['open'], family: 'states', rule: 'S1', element: null, severity: 2, text: '', variants: [], screens: ['01-lista'], region: 'error · (tela)', message: '', options: [] },
    ];
    let r;
    try {
      r = await runPreviews(planPreviews(cases, { screensDir: screens }), { screensDir: screens, outDir: out, playwright });
    } catch (e) {
      if (/Executable doesn't exist/.test(e.message)) return; // navegador não instalado
      throw e;
    }
    const m = r.manifest.cases;
    assert.ok(!m['case-t'].failed, m['case-t'].failed);
    assert.match(m['case-t'].before.file, /\.(webp|jpg)$/);
    assert.equal(m['case-t'].after.filter((a) => a.file).length, 3);
    assert.equal(m['case-t'].after[2].kind_label, 'Sem mudança', '"Manter" mostra a imagem de hoje com o selo');
    assert.equal(m['case-t'].crop.width >= 480, true);
    assert.equal(m['case-d'].after[0].op[0].op, 'remove');
    assert.equal(m['case-s'].after[0].op[0].op, 'synthesize-state');
    assert.equal(m['case-s'].after[0].kind_label, 'Proposta montada com componentes da própria tela');
    assert.ok(m['case-s'].after[0].file, m['case-s'].after[0].failed);
    const sizes = m['case-t'].after.filter((a) => a.file).map((a) => readFileSync(join(out, a.file)).length);
    assert.ok(sizes.every((n) => n > 500));
    assert.notDeepEqual(readFileSync(join(out, m['case-t'].before.file)), readFileSync(join(out, m['case-t'].after[0].file)));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---------- operações novas (sem navegador) ----------

test('validateOp: new operations and their required fields', () => {
  assert.deepEqual(validateOp({ op: 'insert', like: 'chip', text: '1' }).op, { op: 'insert', position: 'after', like: 'chip', text: '1' });
  assert.equal(validateOp({ op: 'insert', from: '02-acervo', source: '.MuiChip-root', position: 'before' }).op.from, '02-acervo');
  assert.match(validateOp({ op: 'insert', like: 'foguete' }).error, /like/);
  assert.match(validateOp({ op: 'insert', from: '02-acervo' }).error, /source/);
  assert.match(validateOp({ op: 'insert', like: 'chip', position: 'acima' }).error, /position/);
  assert.deepEqual(validateOp({ op: 'wrap', title: 'Partes' }).op, { op: 'wrap', like: 'panel', title: 'Partes' });
  assert.deepEqual(validateOp({ op: 'replace-text-many', pairs: [{ from: 'SES', to: 'e-mail' }, { from: '—', to: '' }] }).op.pairs, [{ from: 'SES', to: 'e-mail' }, { from: '—', to: '' }]);
  assert.match(validateOp({ op: 'replace-text-many', pairs: [] }).error, /pairs/);
  assert.equal(validateOp({ op: 'annotate', text: 'Menu' }).op.kind, 'screen-reader');
  assert.match(validateOp({ op: 'annotate', kind: 'tooltip' }).error, /text/);
  assert.match(validateOp({ op: 'annotate', kind: 'som', text: 'x' }).error, /kind/);
  assert.equal(validateOp({ op: 'badge' }).op.text, 'Sem mudança');
  assert.deepEqual(validateOp({ op: 'synthesize-state', state: 'no-access', text: 'Peça ao curador.' }).op, { op: 'synthesize-state', state: 'no-access', text: 'Peça ao curador.' });
  assert.match(validateOp({ op: 'synthesize-state' }).error, /state/);
  assert.equal(validateOp({ op: 'synthesize-region', region: 'side-panel' }).op.region, 'side-panel');
  assert.equal(validateOp({ op: 'align' }).op.targets, 'all');
  assert.equal(validateOp({ op: 'variant', variant: 'outlined', targets: 'all-but-last' }).op.targets, 'all-but-last');
  assert.match(validateOp({ op: 'variant', variant: 'outlined', targets: 'quase todos' }).error, /targets/);
  assert.equal(validateOp({ op: 'move', to: 'region-top' }).op.fold, 900);
  assert.ok(validateOp({ op: 'style', css: { 'font-size': 'theme:h2' } }).op);
  assert.match(validateOp({ op: 'style', css: { 'font-size': 'theme:h9' } }).error, /tema/);
});

test('text options: quoted sentence, arrow, "Label: text" and "X, com apoio/selo/nome acessível" are extracted', () => {
  const h = textCase({ element: 'helper' });
  assert.deepEqual(optionOps(h, { text: 'Para criar uma minuta, abra o contrato e use “Criar aditivo”.' }).ops, [{ op: 'text', text: 'Para criar uma minuta, abra o contrato e use “Criar aditivo”.' }]);
  assert.deepEqual(optionOps(textCase(), { text: '"Cancelar" → "Voltar"' }).ops, [{ op: 'text', text: 'Voltar' }]);
  assert.deepEqual(optionOps(h, { text: 'Título: Revisar cláusulas' }).ops, [{ op: 'text', text: 'Revisar cláusulas' }]);
  assert.deepEqual(optionOps(textCase(), { text: 'Ver histórico, com selo "1" ao lado' }).ops, [{ op: 'text', text: 'Ver histórico' }, { op: 'insert', like: 'chip', position: 'after', text: '1' }]);
  assert.deepEqual(optionOps(textCase(), { text: 'Marcar todos, com apoio "3 ainda não marcados"' }).ops[1], { op: 'insert', like: 'helper', position: 'after', text: '3 ainda não marcados' });
  assert.deepEqual(optionOps(textCase(), { text: 'Abrir PDF, com nome acessível "Abrir PDF em nova aba"' }).ops[1], { op: 'annotate', kind: 'screen-reader', text: 'Abrir PDF em nova aba' });
  assert.deepEqual(optionOps(textCase(), { text: '"Confirmar" visível, com nome acessível "Confirmar número"' }).ops, [{ op: 'annotate', kind: 'screen-reader', text: 'Confirmar número' }]);
  assert.deepEqual(optionOps(h, { text: 'Data numa coluna própria; texto "Não enviado."' }).ops, [{ op: 'text', text: 'Não enviado.' }]);
});

test('list options: stem and number matching; no match falls back to the first segment with a note', () => {
  assert.equal(pickSegment('Destinatários: 5 · Minutas criadas: 4', ['{} destinatário(s): {} do acervo']), 'Destinatários: 5');
  assert.equal(pickSegment('Ver 1 mudança · Ver 3 mudanças', ['Histórico (1)']), 'Ver 1 mudança');
  const r = optionOps(textCase({ element: 'cell', text: '—', variants: [] }), { text: 'Sem finalidade · Nenhum' });
  assert.equal(r.ops[0].text, 'Sem finalidade');
  assert.match(r.note, /nenhum repete/);
});

test('rule defaults for the rules that had none', () => {
  const ops = (c) => implicitPreview(c).ops;
  assert.deepEqual(ops({ family: 'screen', rule: 'T1' }), [{ op: 'variant', variant: 'outlined', targets: 'all-but-last' }]);
  assert.equal(ops({ family: 'screen', rule: 'T3' })[0].css['font-size'], 'theme:h1');
  assert.equal(ops({ family: 'screen', rule: 'T3' })[1].op, 'annotate');
  assert.deepEqual(ops({ family: 'screen', rule: 'T6', message: 'termo proibido "SES" no texto visível (1×)' }), [{ op: 'replace-text-many', pairs: [{ from: 'SES', to: 'e-mail' }], scope: 'element' }]);
  assert.deepEqual(ops({ family: 'screen', rule: 'T6', message: 'termo proibido "sha256" no texto' })[0].pairs, [{ from: 'sha256', to: '' }]);
  assert.deepEqual(ops({ family: 'screen', rule: 'T7', message: 'botão "Confirmar" sem verbo + objeto' }), [{ op: 'text', text: 'Confirmar {context}' }]);
  assert.deepEqual(ops({ family: 'layout', rule: 'L3' })[0].css['font-size'], 'theme:self');
  assert.deepEqual(ops({ family: 'layout', rule: 'L4' }), [{ op: 'align', mode: 'auto', targets: 'all' }]);
  assert.deepEqual(ops({ family: 'layout', rule: 'L6', message: 'fora da primeira dobra (termina a 937 px; dobra em 800 px)' }), [{ op: 'move', to: 'region-top', fold: 800 }]);
  assert.deepEqual(ops({ family: 'layout', rule: 'L8', message: 'alvo 20×20 px (mín. 24×24)' })[0].css, { 'min-width': '24px', 'min-height': '24px' });
  assert.deepEqual(ops({ family: 'layout', rule: 'L9', text: 'região kpi-strip ausente' }), [{ op: 'synthesize-region', region: 'kpi-strip', title: 'Indicadores' }]);
  const c1 = { family: 'consistency', rule: 'C1', message: 'mesma ação: "Cancelar" (07-dlg, 11-dlg, …) × "Voltar" (42-dlg, 43-dlg) — escolha um verbo' };
  assert.deepEqual(ops(c1), [{ op: 'text', text: 'Cancelar' }]);
  assert.deepEqual(locatorFor({ ...c1, variants: ['Cancelar', 'Voltar'] }).patterns, ['^Voltar$']);
  assert.deepEqual(screenOrder({ ...c1, screens: ['07-dlg', '11-dlg', '42-dlg'] })[0], '42-dlg');
  assert.deepEqual(ops({ family: 'text', rule: 'X9', message: 'parêntese' }), [{ op: 'text', text: '{no-parens}' }]);
  assert.equal(ops({ family: 'text', rule: 'X2', message: 'composto' })[1].op, 'insert');
  assert.deepEqual(ops({ family: 'text', rule: 'X6', message: 'botão com 9 palavras (máx. 4)' }), [{ op: 'text', text: '{part:0}' }]);
  assert.deepEqual(locatorFor({ family: 'screen', rule: 'T3' }), { kind: 'main-title', max: 1 });
  assert.equal(locatorFor({ family: 'layout', rule: 'L6', selectors: ['main > button'], message: 'dobra em 900 px' }).viewport, true);
});

test('state recipes: page and dialog, option text over the default, field-error everywhere', () => {
  const na = stateRecipe('no-access');
  assert.equal(na.page.mode, 'replace');
  assert.match(na.page.text, /Quem concede o acesso/);
  assert.equal(na.dialog.mode, 'banner');
  assert.equal(stateRecipe('error').dialog.color, 'error');
  assert.equal(stateRecipe('no-access', { text: 'Peça ao curador.' }).page.text, 'Peça ao curador.');
  assert.equal(stateRecipe('field-error').dialog.mode, 'field-error');
  assert.equal(stateRecipe('conflict').dialog.mode, 'banner');
  assert.equal(stateRecipe('estado-novo').page.mode, 'banner');
  assert.equal(stateRecipe('unavailable').dialog.color, 'error');
});

test('previewKind: short label of each preview type for the page legend', () => {
  assert.equal(previewKind([{ op: 'text', text: 'x' }]), 'Texto trocado');
  assert.equal(previewKind([{ op: 'remove' }]), 'Elemento removido');
  assert.equal(previewKind([{ op: 'synthesize-state', state: 'error' }]), PROPOSAL_LABEL);
  assert.equal(previewKind([{ op: 'text', text: 'x' }, { op: 'insert', like: 'chip' }]), PROPOSAL_LABEL);
  assert.equal(previewKind([{ op: 'annotate', kind: 'screen-reader', text: 'x' }]), 'Anotação: leitor de tela');
  assert.equal(previewKind([{ op: 'badge', text: 'Sem mudança' }]), 'Sem mudança');
  assert.equal(previewKind([{ op: 'style', css: { 'font-size': 'theme:h1' } }]), 'Tamanho na escala do tema');
  assert.equal(previewKind([{ op: 'example', screen: 'x' }]), 'Exemplo de outra tela');
  assert.match(describeOps([{ op: 'replace-text-many', pairs: [{ from: 'SES', to: 'e-mail' }] }]), /"SES" → "e-mail"/);
});

test('kit helpers: text lines of a capture, lines a state adds, monotone heading scale', () => {
  assert.deepEqual(textLines('<head><style>.a{}</style></head><body><h1>Lista</h1><p>A &amp; B</p><script>x</script></body>'), ['Lista', 'A & B']);
  assert.deepEqual(addedLines('<body><h1>Lista</h1></body>', '<body><h1>Lista</h1><p>Não foi possível carregar.</p></body>'), ['Não foi possível carregar.']);
  const scale = typographyScale({ h1: [{ size: 24, line: '32px', weight: '700' }, { size: 24, line: '32px', weight: '700' }, { size: 30, line: '36px', weight: '700' }], h3: [{ size: 26, line: '30px', weight: '600' }] });
  assert.equal(scale.h1.size, 24, 'moda');
  assert.equal(scale.h3.size, 24, 'nível de baixo nunca maior que o de cima');
});

test('page cases keep the declared preview of the option', () => {
  const reg = { module: 'm', items: [{ id: 't-1', family: 'text', rule: 'X1', severity: 2, element: 'button', text: 'A', variants: [], screens: ['01'], source: [], message: '', status: 'open' }] };
  const options = { items: { 't-1': { problem: 'p', options: [{ text: 'B', preview: { op: 'badge' } }, { text: 'C' }] } } };
  const [c] = pageCases(reg, options, { items: {} });
  assert.deepEqual(c.options[0].preview, { op: 'badge' });
  assert.equal('preview' in c.options[1], false);
});

test('page shows the preview type under each "after"', () => {
  const { reg, options } = registryWithPreview(1);
  const dir = manifestDir(reg);
  try {
    const m = JSON.parse(readFileSync(join(dir, 'previews.json'), 'utf8'));
    m.cases['case-t-0'].after[0].kind_label = 'Texto trocado';
    writeFileSync(join(dir, 'previews.json'), JSON.stringify(m));
    const outDir = tmp();
    const r = writePages(reg, options, { items: {} }, join(outDir, 'page.html'), { previewsDir: dir });
    assert.match(readFileSync(r.pages[0].file, 'utf8'), /<p class="pv-tipo">Texto trocado<\/p>/);
    rmSync(outDir, { recursive: true, force: true });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

function fixtureNew() {
  const { root, screens } = fixture();
  const css = '<style>.MuiButton-root{padding:6px 14px;border-radius:8px;font:600 14px sans-serif}.MuiButton-contained{background:#0E71B8;color:#fff;border:0}.MuiButton-outlined{background:#fff;color:#0E71B8;border:1px solid #0E71B8}.MuiChip-root{display:inline-flex;border:1px solid #999;border-radius:12px;padding:2px 8px;font-size:12px}.MuiAlert-root{display:flex;padding:8px 12px;border-radius:8px;background:rgb(255,244,229);color:rgb(102,60,0)}.MuiFormHelperText-root{font-size:12px;color:#555;margin:4px 0 0}.MuiPaper-outlined{border:1px solid #ccc;border-radius:8px}.Mui-error{color:#d32f2f}</style>';
  const page = `<!doctype html><head>${css}</head><body style="margin:0;font:16px sans-serif"><main style="padding:20px;width:900px">`
    + '<h1>Lista</h1><h2 style="font-size:20px">Seção</h2><h3 style="font-size:16px">Sub</h3><h4 style="font-size:22px">Grande demais</h4>'
    + '<div class="MuiPaper-outlined" style="padding:12px;width:600px"><p>Arquivo: contrato.pdf — 1,2 MB</p><p>Enviado: SES não configurado</p>'
    + '<div><span>NOME DO CAMPO</span> <button class="MuiButton-root MuiButton-text">Confirmar</button></div>'
    + '<button class="MuiButton-root MuiButton-outlined">Cancelar</button> <button class="MuiButton-root MuiButton-contained">Baixar</button> <button class="MuiButton-root MuiButton-contained">Próximo</button>'
    + ' <span class="MuiChip-root"><span class="MuiChip-label">3</span></span><p class="MuiFormHelperText-root">apoio</p>'
    + '<div class="MuiAlert-root MuiAlert-colorWarning"><div class="MuiAlert-message">aviso</div></div>'
    + '<button class="MuiButton-root MuiButton-outlined" aria-label="Remover Ana"><svg width="16" height="16"><rect width="16" height="16"/></svg></button></div>'
    + '<div style="height:1200px"></div><div><button class="MuiButton-root MuiButton-contained">Salvar no fim</button></div></main></body>';
  writeFileSync(join(screens, '03-tela.html'), page);
  writeFileSync(join(screens, '04-dlg-form.html'), `<!doctype html><head>${css}</head><body style="margin:0;font:16px sans-serif"><main><h1>Fundo</h1></main><div role="dialog" style="position:absolute;left:400px;top:100px;width:500px;background:#fff;border:1px solid #999;padding:16px"><h2>Editar</h2><div class="MuiDialogContent-root"><div class="MuiFormControl-root MuiTextField-root"><label class="MuiFormLabel-root">Nome *</label><div class="MuiInputBase-root"><input required value="Ana"></div></div></div><div class="MuiDialogActions-root"><button class="MuiButton-root MuiButton-outlined">Cancelar</button><button class="MuiButton-root MuiButton-contained">Salvar</button></div></div></body>`);
  return { root, screens };
}
const sc = (over) => ({ ids: ['x'], statuses: ['open'], variants: [], message: '', region: '', selectors: [], options: [], severity: 2, ...over });

test('Playwright: new operations change the real capture (state, region, insert, annotate, badge, variant, style, align, move, replace)', { skip: !playwright && 'Playwright indisponível (defina DSX_PLAYWRIGHT_CWD para uma pasta que o tenha)' }, async () => {
  const { root, screens } = fixtureNew();
  try {
    const out = join(root, 'previews');
    const cases = [
      sc({ id: 'c-err-dlg', family: 'states', rule: 'S1', screens: ['04-dlg-form'], region: 'error · (tela)' }),
      sc({ id: 'c-field', family: 'states', rule: 'S1', screens: ['04-dlg-form'], region: 'field-error · (tela)' }),
      sc({ id: 'c-noacc', family: 'states', rule: 'S1', screens: ['03-tela'], region: 'no-access · (tela)' }),
      sc({ id: 'c-conf', family: 'states', rule: 'S1', screens: ['03-tela'], region: 'conflict · (tela)' }),
      sc({ id: 'c-l9', family: 'layout', rule: 'L9', screens: ['03-tela'], text: 'região side-panel ausente' }),
      sc({ id: 'c-t1', family: 'screen', rule: 'T1', screens: ['03-tela'], message: '2 ações primárias (máx. 1): "Baixar", "Próximo"' }),
      sc({ id: 'c-l3', family: 'layout', rule: 'L3', screens: ['03-tela'], message: 'h4 "Grande demais" (22 px) maior que h3 "Sub" (16 px)' }),
      sc({ id: 'c-t6', family: 'screen', rule: 'T6', screens: ['03-tela'], message: 'termo proibido "SES" no texto visível (1×), ex.: "Enviado: SES não configurado"' }),
      sc({ id: 'c-t7', family: 'screen', rule: 'T7', screens: ['03-tela'], message: 'botão "Confirmar" sem verbo + objeto' }),
      sc({ id: 'c-l6', family: 'layout', rule: 'L6', screens: ['03-tela'], text: 'primária "Salvar no fim" abaixo da dobra', message: 'ação primária "Salvar no fim" fora da primeira dobra (dobra em 900 px)' }),
      { ...textCase({ id: 'c-ops', screens: ['03-tela'], element: 'helper', text: 'Arquivo: contrato.pdf — 1,2 MB', variants: [] }), options: [
        { text: 'x', preview: [{ op: 'text', text: '{part:0}' }, { op: 'insert', like: 'chip', position: 'after', text: '{part:1}' }] },
        { text: 'Manter' },
        { text: 'x', preview: { op: 'annotate', kind: 'tooltip', text: 'Dica nova' } },
        { text: 'x', preview: { op: 'wrap', title: 'Arquivo' } },
      ] },
      { ...textCase({ id: 'c-icon', screens: ['03-tela'], text: 'Remover Ana', variants: [] }), options: [{ text: 'Remover Ana da lista' }] },
    ];
    let r;
    try {
      r = await runPreviews(planPreviews(cases, { screensDir: screens }), { screensDir: screens, outDir: out, playwright });
    } catch (e) {
      if (/Executable doesn't exist/.test(e.message)) return;
      throw e;
    }
    const m = r.manifest.cases;
    const made = (id, i = 0) => { const a = (m[id].after ?? [])[i]; assert.ok(a && a.file, `${id}: ${m[id].failed ?? a?.failed}`); return a; };
    for (const id of ['c-err-dlg', 'c-field', 'c-noacc', 'c-conf', 'c-l9']) assert.equal(made(id).kind_label, 'Proposta montada com componentes da própria tela', id);
    assert.equal(m['c-err-dlg'].kind, 'synth');
    assert.equal(made('c-t1').kind_label, 'Peso do botão trocado');
    assert.equal(made('c-l3').kind_label, 'Tamanho na escala do tema');
    assert.match(made('c-t6').description, /"SES" → "e-mail"/);
    assert.equal(made('c-t7').op[0].text, 'Confirmar nome do campo', 'o objeto vem do rótulo mais próximo');
    assert.equal(made('c-l6').kind_label, 'Elemento movido');
    assert.equal(made('c-ops', 0).op[1].text, '1,2 MB');
    assert.equal(made('c-ops', 1).kind_label, 'Sem mudança');
    assert.equal(made('c-ops', 2).kind_label, 'Anotação: dica');
    assert.equal(made('c-ops', 3).kind_label, PROPOSAL_LABEL);
    assert.equal(made('c-icon').kind_label, 'Anotação: leitor de tela', 'botão só de ícone: a troca vira anotação');
    assert.ok(existsSync(join(out, 'kit.json')));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
