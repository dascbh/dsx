import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  optionOps, implicitPreview, locatorFor, toPattern, validateOp, pickExample, pickSegment, flowDiagram, variantPlan,
} from '../ux-lint/lib/preview-spec.mjs';
import { planPreviews, runPreviews, summarizeManifest } from '../ux-lint/preview.mjs';
import { resolvePlaywright } from '../ux-lint/measure.mjs';
import { fromLayout, assignIds, merge, renderPages, writePages } from '../ux-lint/findings.mjs';
import { paginate } from '../ux-lint/text-page.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'dsx-preview-'));
const textCase = (over = {}) => ({ id: 'case-c1', ids: ['t-1'], statuses: ['open'], family: 'text', rule: 'X1', element: 'button', severity: 2, text: 'Remover da lista — {}', variants: ['Remover da lista — Ana'], screens: ['07-dlg'], message: '', region: '', selectors: [], options: [], ...over });

test('text options: ready text → text; "(remover)" → remove; "Manter…" and accessible name → no preview', () => {
  const c = textCase();
  assert.deepEqual(optionOps(c, { text: 'Remover Ana da lista' }).ops, [{ op: 'text', text: 'Remover Ana da lista' }]);
  assert.deepEqual(optionOps(textCase({ element: 'helper' }), { text: '(remover)' }).ops, [{ op: 'remove' }]);
  assert.match(optionOps(c, { text: 'Manter como está' }).none, /mantém/);
  assert.match(optionOps(textCase({ element: 'accessible-name' }), { text: 'Menu do Tributário' }).none, /não aparece em pixels/);
  assert.match(optionOps(textCase({ element: 'tooltip' }), { text: 'Lê de novo' }).none, /passar o mouse/);
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

test('family defaults: L1 → move, L7 → style, C2 → variant of the majority, S1 → example, F → diagram', () => {
  assert.deepEqual(implicitPreview({ family: 'layout', rule: 'L1' }).ops, [{ op: 'move', to: 'end', justify: 'flex-end' }]);
  assert.deepEqual(implicitPreview({ family: 'layout', rule: 'L7' }).ops, [{ op: 'style', css: { 'max-width': '72ch' } }]);
  const msg = 'botão "Confirmar" com variantes visuais diferentes (text em 03-doc, 26-max; contained em 24-acervo) — a mesma ação…';
  assert.deepEqual(variantPlan(msg), { major: 'text', minor: 'contained', screen: '24-acervo' });
  assert.deepEqual(implicitPreview({ family: 'consistency', rule: 'C2', message: msg }).ops, [{ op: 'variant', variant: 'text' }]);
  const files = ['02-acervo.error.html', '13-dlg-x.html', '14-dlg-y.error.html', '13-dlg-x.error.html'];
  assert.equal(pickExample(files, 'error', '13-dlg-x'), '14-dlg-y.error', 'outra tela, do mesmo tipo (diálogo)');
  assert.equal(pickExample(files, 'error', '05-lista'), '02-acervo.error');
  assert.equal(pickExample(files, 'no-access', '05-lista'), null);
  const s1 = { family: 'states', rule: 'S1', region: 'error · (tela)', screens: ['05-lista'] };
  assert.deepEqual(implicitPreview(s1, { exampleFor: (st, sc) => pickExample(files, st, sc) }).ops, [{ op: 'example', screen: '02-acervo.error' }]);
  assert.match(implicitPreview({ ...s1, region: 'no-access · (tela)' }, { exampleFor: (st, sc) => pickExample(files, st, sc) }).none, /no-access/);
  assert.ok(implicitPreview({ family: 'flow', rule: 'F5' }).flow);
  assert.match(implicitPreview({ family: 'screen', rule: 'T3' }).none, /T3/);
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
  writeFileSync(join(screens, '02-outra.error.html'), '<!doctype html><body><p>Não foi possível carregar.</p></body>');
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
    assert.equal(m['case-t'].after.filter((a) => a.file).length, 2);
    assert.match(m['case-t'].after[2].failed, /mantém/);
    assert.equal(m['case-t'].crop.width >= 480, true);
    assert.equal(m['case-d'].after[0].op[0].op, 'remove');
    assert.equal(m['case-s'].after[0].op[0].screen, '02-outra.error');
    const sizes = m['case-t'].after.filter((a) => a.file).map((a) => readFileSync(join(out, a.file)).length);
    assert.ok(sizes.every((n) => n > 500));
    assert.notDeepEqual(readFileSync(join(out, m['case-t'].before.file)), readFileSync(join(out, m['case-t'].after[0].file)));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
