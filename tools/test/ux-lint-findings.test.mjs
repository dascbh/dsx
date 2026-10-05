import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  stableId, templateOf, maskData, fromText, fromScreen, fromFlow, assignIds, merge, statusOf, check,
  importOptions, importDecisions, makeDecision, renderPage, renderPages, pageCases, fromLayout,
} from '../ux-lint/findings.mjs';

const CLI = fileURLToPath(new URL('../ux-lint/findings.mjs', import.meta.url));
const ROOT = '/proj';

// Saídas mínimas no formato `--json` de cada verificador.
const textJson = (findings) => ({ summary: {}, findings });
const textFinding = ({ rule = 'X1', sev = 2, text = 'Remover da lista — Ana', line = 80, file = '/proj/src/Dlg.tsx', variants, probable_data = false } = {}) => ({
  rule, severity: probable_data ? 0 : sev, text, message: 'travessão', types: ['button'], screens: ['07-dlg.html'],
  source: { snippet: 'Remover da lista', total: 1, location: probable_data ? 'data' : 'code', occurrences: [{ file, line }] },
  ...(variants ? { variants } : {}), ...(probable_data ? { probable_data: true } : {}),
});
const screenJson = { summary: {}, screens: [{ file: '/proj/caps/03-doc.html', findings: [{ rule: 'T7', severity: 1, region: 'main', message: 'botão "Confirmar" sem verbo + objeto (3×)', evidence: '/proj/caps/03-doc.html:508:8210, /proj/caps/03-doc.html:508:10713' }] }] };
const flowJson = { findings: [{ rule: 'F1', severity: 3, screen: 'respondido', message: '"Resposta" não tem saída; chega-se por 3 transição(ões)', evidence: ['t-a (src/pages/A.tsx:208)'] }] };

const run = (findings, reg = []) => ({ items: assignIds(fromText(textJson(findings), { root: ROOT }), reg), families: ['text'] });
const newRegistry = () => ({ module: 'm', updated: null, runs: [], items: [] });
const day = (d) => new Date(`2026-10-${d}T12:00:00Z`);

test('stable id: line changes → same id; text or file changes → new id', () => {
  const [a] = fromText(textJson([textFinding({ line: 80 })]), { root: ROOT });
  const [b] = fromText(textJson([textFinding({ line: 95 })]), { root: ROOT });
  const [c] = fromText(textJson([textFinding({ text: 'Tirar da lista — Ana' })]), { root: ROOT });
  const [d] = fromText(textJson([textFinding({ file: '/proj/src/Outro.tsx' })]), { root: ROOT });
  assert.match(stableId(a), /^t-[0-9a-f]{8}$/);
  assert.equal(stableId(a), stableId(b));
  assert.notEqual(stableId(a), stableId(c));
  assert.notEqual(stableId(a), stableId(d));
  assert.equal(a.source[0], 'src/Dlg.tsx:80', 'origem relativa à raiz do projeto');
});

test('stable id: variable data and variants become {}', () => {
  assert.equal(maskData('Resposta registrada em 02/10/2026 14:37.'), 'Resposta registrada em {} {}.');
  assert.equal(templateOf('Remover da lista — Ana Souza', ['Remover da lista — Ana Souza', 'Remover da lista — Ricardo Almeida']), 'Remover da lista — {}');
  assert.equal(templateOf('Item 1 — Frete', ['Item 1 — Frete', 'Item 2 — Desconto por volume']), 'Item {} — {}');
  const one = fromText(textJson([textFinding({ variants: ['Remover da lista — Ana', 'Remover da lista — Bia'] })]), { root: ROOT })[0];
  const other = fromText(textJson([textFinding({ text: 'Remover da lista — Caio', variants: ['Remover da lista — Caio', 'Remover da lista — Duda'] })]), { root: ROOT })[0];
  assert.equal(one.text, 'Remover da lista — {}');
  assert.equal(stableId(one), stableId(other));
});

test('id inherited when the variant set changes the template', () => {
  const reg = newRegistry();
  merge(reg, run([textFinding({ text: 'Item 1 — Frete', variants: ['Item 1 — Frete', 'Item 2 — Preço'] })]), { now: day('01') });
  const id = reg.items[0].id;
  const r2 = run([textFinding({ text: 'Item 2 — Preço', line: 99 })], reg.items);
  assert.equal(r2.items[0].id, id);
});

test('severity 0 (probable data) is excluded by default', () => {
  const j = textJson([textFinding(), textFinding({ text: 'Ana — Souza', probable_data: true })]);
  assert.equal(fromText(j).length, 1);
  assert.equal(fromText(j, { includeSev0: true }).length, 2);
});

test('screen and flow normalized with family, prefix and source', () => {
  const [s] = assignIds(fromScreen(screenJson, { root: ROOT }));
  assert.equal(s.family, 'screen');
  assert.match(s.id, /^s-/);
  assert.deepEqual(s.screens, ['03-doc']);
  assert.deepEqual(s.source, ['caps/03-doc.html:508']);
  assert.equal(s.element, 'button');
  const [f] = assignIds(fromFlow(flowJson, { root: ROOT }));
  assert.match(f.id, /^f-/);
  assert.deepEqual(f.source, ['src/pages/A.tsx:208']);
  // Âncora do fluxo é a tela do mapa: mudar a evidência não muda o id.
  const [f2] = assignIds(fromFlow({ findings: [{ ...flowJson.findings[0], evidence: ['t-b (src/pages/B.tsx:10)'] }] }));
  assert.equal(f.id, f2.id);
});

test('merge keeps first_seen and decisions; absence only for the family of the run', () => {
  const reg = newRegistry();
  const decisions = { items: {} };
  merge(reg, { items: [...run([textFinding()]).items, ...assignIds(fromScreen(screenJson))], families: ['text', 'screen'] }, { now: day('01'), commit: 'abc1234' });
  const id = reg.items.find((i) => i.family === 'text').id;
  decisions.items[id] = makeDecision(0, { now: day('02') });
  merge(reg, run([textFinding({ line: 81 })]), { now: day('03'), decisions: decisions });
  const t = reg.items.find((i) => i.id === id);
  assert.equal(t.first_seen, '2026-10-01');
  assert.equal(t.last_seen, '2026-10-03');
  assert.deepEqual(t.source, ['src/Dlg.tsx:81']);
  assert.equal(t.status, 'decided');
  assert.equal(reg.items.find((i) => i.family === 'screen').present, true, 'família que não veio não fica ausente');
  assert.equal(reg.runs.length, 2);
  assert.equal(reg.runs[0].commit, 'abc1234');
  assert.deepEqual(reg.runs[1].sources, ['text']);
  assert.equal(decisions.items[id].choice, 0);
});

test('status: open → decided → fixed → regression; ignored', () => {
  const reg = newRegistry();
  const dec = { items: {} };
  merge(reg, run([textFinding()]), { now: day('01'), decisions: dec });
  const it = reg.items[0];
  assert.equal(it.status, 'open');
  dec.items[it.id] = makeDecision('1', { now: day('01') });
  assert.equal(statusOf(it, dec), 'decided');
  merge(reg, run([]), { now: day('02'), decisions: dec });
  assert.equal(it.status, 'fixed');
  assert.equal(it.present, false);
  merge(reg, run([textFinding()]), { now: day('03'), decisions: dec });
  assert.equal(it.status, 'regression');
  dec.items[it.id] = makeDecision('ignore', { reason: 'nome próprio', now: day('03') });
  assert.equal(statusOf(it, dec), 'ignored');
  assert.throws(() => makeDecision('ignore', {}), /reason/);
  assert.throws(() => makeDecision('free', {}), /text/);
  assert.equal(makeDecision('free', { text: 'Tirar' }).text, 'Tirar');
});

test('check: fails new finding ≥ min and regression; tolerates known open', () => {
  const reg = newRegistry();
  const dec = { items: {} };
  merge(reg, run([textFinding()]), { now: day('01') });
  let r = check(reg, run([textFinding({ line: 90 })], reg.items), { decisions: dec });
  assert.equal(r.pass, true);
  assert.equal(r.known.length, 1);
  r = check(reg, run([textFinding(), textFinding({ rule: 'X11', text: 'Hash do documento' })], reg.items), { decisions: dec });
  assert.equal(r.pass, false);
  assert.equal(r.added.length, 1);
  r = check(reg, run([textFinding({ rule: 'X5', sev: 1, text: 'Pronto.' })], reg.items), { decisions: dec });
  assert.equal(r.pass, true, 'novo abaixo do mínimo passa');
  merge(reg, run([]), { now: day('02') });
  r = check(reg, run([textFinding()], reg.items), { decisions: dec });
  assert.equal(r.pass, false);
  assert.equal(r.regressions.length, 1);
  assert.equal(reg.items[0].status, 'fixed', 'check não grava');
});

test('options: grouped case covers several ids; case without finding becomes a review item', () => {
  const reg = newRegistry();
  merge(reg, run([
    textFinding({ rule: 'X10', sev: 1, text: 'Resumo Executivo', file: '/proj/src/nav.tsx', line: 34 }),
    textFinding({ rule: 'X10', sev: 1, text: 'Relatório Mensal', file: '/proj/src/nav.tsx', line: 40 }),
  ]), { now: day('01') });
  const options = { items: {} };
  const cases = [
    { id: 'c02', element: 'menu', rule: 'X10', text: 'Resumo Executivo', variants: ['Relatório Mensal', 'Resumo Executivo'], source: ['src/nav.tsx:34'], problem: 'Caixa de título', options: [{ text: 'Sumário executivo', convention: 'DSX', note: '' }, { text: 'Resumo', convention: 'Polaris', note: '' }], recommended: { index: 0, why: 'pt-BR' } },
    { id: 'c50', element: 'helper', rule: 'desc', severity: 1, text: 'Aqui ficam as propostas.', source: ['src/Lista.tsx:12'], screens: ['14-propostas'], problem: 'Descrição desnecessária', options: [{ text: '(remover)', convention: 'DSX' }], recommended: { index: 0, why: '' } },
  ];
  const r = importOptions(reg, options, cases, { now: day('01') });
  assert.equal(r.matched, 1);
  assert.equal(r.manual, 1);
  assert.equal(r.links[0].ids.length, 2);
  const manual = reg.items.find((i) => i.rule === 'desc');
  assert.equal(manual.origin, 'review');
  assert.equal(manual.element, 'helper');
  assert.deepEqual(options.items[r.links[0].ids[0]].recommended, { index: 0, why: 'pt-BR' });
  assert.equal(options.items[r.links[0].ids[0]].options[1].text, 'Resumo');
  // Reimportar não duplica; detector que não vê o item de revisão não o marca como corrigido.
  importOptions(reg, options, cases, { now: day('02') });
  assert.equal(reg.items.filter((i) => i.rule === 'desc').length, 1);
  merge(reg, run([]), { now: day('03') });
  assert.equal(manual.present, true);
  assert.equal(manual.status, 'open');
});

test('import decisions in the page format', () => {
  const reg = newRegistry();
  merge(reg, run([textFinding()]), { now: day('01') });
  const dec = { items: {} };
  const id = reg.items[0].id;
  const r = importDecisions(reg, dec, { items: { [id]: { choice: 2, by: 'Ana', at: '2026-10-04', reason: null }, 't-00000000': { choice: 0 } } });
  assert.equal(r.ok, 1);
  assert.deepEqual(r.unknown, ['t-00000000']);
  assert.deepEqual(dec.items[id], { choice: 2, by: 'Ana', at: '2026-10-04', reason: null });
  const bad = importDecisions(reg, dec, { items: { [id]: { choice: 'ignore' } } });
  assert.equal(bad.invalid.length, 1, 'ignore sem reason é recusado');
});

test('page: id, status, checked decision and form that copies decisions.json', () => {
  const reg = newRegistry();
  merge(reg, run([textFinding()]), { now: day('01') });
  const id = reg.items[0].id;
  const options = { items: { [id]: { problem: 'Travessão', options: [{ text: 'Remover Ana', convention: 'DSX', note: '' }, { text: 'Tirar Ana', convention: 'Polaris', note: '' }], recommended: { index: 0, why: '' } } } };
  const dec = { items: { [id]: makeDecision(1, { by: 'Ana', now: day('02') }) } };
  merge(reg, run([textFinding()]), { now: day('02'), decisions: dec });
  const html = renderPage(reg, options, dec, { product: 'X' });
  assert.ok(html.includes(id));
  assert.ok(html.includes('decidido'));
  assert.match(html, /<fieldset class="decisao" data-ids="[^"]*"/);
  assert.match(html, /value="1" checked/);
  assert.match(html, /value="ignore"/);
  assert.ok(html.includes('Copiar decisões'));
  assert.ok(html.includes('navigator.clipboard.writeText'));
  assert.ok(html.includes('<textarea id="saida"'));
  assert.ok(!/fetch\(|download=/.test(html), 'sem fetch, sem download');
  assert.match(html, /try\{localStorage\.setItem/, 'localStorage só dentro de try/catch');
  assert.equal(pageCases(reg, options, dec).length, 1);

  // O script do formulário gera o JSON no formato de decisions.json, com ou sem localStorage.
  const runs = [null, throwingStorage()].map((storage) => runPageScript(html, { storage, checked: '1' }).click().then((copied) => {
    const out = JSON.parse(copied);
    assert.equal(out.items[id].choice, 1);
    assert.equal(out.items[id].by, 'Ana');
    assert.match(out.items[id].at, /^\d{4}-\d{2}-\d{2}$/);
  }));
  return Promise.all(runs);
});

/** Armazenamento que falha (navegação privada, site bloqueado): a página tem de funcionar igual. */
function throwingStorage() { return { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } }; }
function memoryStorage(init = {}) { const m = { ...init }; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; }, dump: m }; }

/** Roda o script da página num DOM mínimo: um fieldset por caso da página, com a opção `checked` marcada. */
function runPageScript(html, { storage = null, checked = null, por = 'Ana' } = {}) {
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  const meta = html.match(/<script type="application\/json" id="dsx-decisions">([\s\S]*?)<\/script>/)[1];
  const listeners = [];
  const sets = [...html.matchAll(/<fieldset class="decisao" data-ids="([^"]*)" data-case="([^"]*)"/g)].map(([, ids, c]) => {
    let cur = checked;
    const reason = { value: '', removeAttribute() {}, setAttribute() {}, addEventListener() {} };
    return {
      dataset: { ids, case: c }, addEventListener: (_, f) => listeners.push(f),
      querySelector: (s) => {
        if (s === 'input[type=text]') return reason;
        if (s === 'input[type=radio]:checked') return cur === null ? null : { value: cur };
        const m = s.match(/value="([^"]*)"/);
        if (m) return { set checked(v) { if (v) cur = m[1]; } };
        return null;
      },
    };
  });
  let click, copied;
  const els = { 'dsx-decisions': { textContent: meta }, por: { value: por, addEventListener() {} }, aviso: { textContent: '' }, saida: { value: '', hidden: true }, copiar: { addEventListener: (_, f) => { click = f; } } };
  const counters = [{ textContent: '' }];
  const document = { getElementById: (k) => els[k], querySelectorAll: (s) => (s === 'fieldset.decisao' ? sets : s === '.contador' ? counters : []), querySelector: () => null };
  const navigator = { clipboard: { writeText: async (t) => { copied = t; } } };
  new Function('document', 'navigator', 'localStorage', script)(document, navigator, storage ?? memoryStorage());
  for (const f of listeners) f();
  return { click: () => click().then(() => copied), counter: () => counters[0].textContent, aviso: () => els.aviso.textContent };
}

test('page: decisions cross pages through localStorage; counter shows decided of total', async () => {
  const reg = newRegistry();
  merge(reg, run([textFinding({ text: 'Remover da lista — Ana', file: '/proj/src/A.tsx' }), textFinding({ rule: 'X11', text: 'Hash do documento', file: '/proj/src/B.tsx' })]), { now: day('01') });
  const [a, b] = reg.items.map((i) => i.id);
  const options = { items: { [a]: { problem: 'P1', options: [{ text: 'Remover Ana' }], recommended: null }, [b]: { problem: 'P2', options: [{ text: 'Código' }, { text: 'Código do documento' }], recommended: null } } };
  const pages = renderPages(reg, options, { items: {} }, { maxCases: 1 });
  assert.equal(pages.length, 2, 'um caso por página');
  assert.equal(pages[1].file, 'page-2.html');
  assert.match(pages[0].html, /<nav class="paginas"[\s\S]*page-2\.html/);
  assert.match(pages[1].html, /rel="prev"/);
  const storage = memoryStorage();
  // decide na página 1…
  const p1 = runPageScript(pages[0].html, { storage, checked: '0' });
  assert.equal(p1.counter(), '1 decididos de 2');
  // …e na página 2, cujo "Copiar" leva as duas.
  const p2 = runPageScript(pages[1].html, { storage, checked: '1' });
  assert.equal(p2.counter(), '2 decididos de 2');
  const out = JSON.parse(await p2.click());
  const caseOfB = pages.findIndex((p) => p.html.includes(`data-ids="${b}"`));
  assert.equal(Object.keys(out.items).length, 2);
  assert.equal(out.items[b].choice, caseOfB === 1 ? 1 : 0);
  assert.ok(out.items[a]);
});

test('CLI: register, options, decide, status, check and page in a temp directory', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-findings-'));
  try {
    const t = join(tmp, 't.json');
    writeFileSync(t, JSON.stringify(textJson([textFinding({ file: join(tmp, 'src/Dlg.tsx') })])));
    const s = join(tmp, 's.json');
    writeFileSync(s, JSON.stringify(screenJson));
    const dir = join(tmp, '.dsx/findings');
    const cli = (...a) => spawnSync('node', [CLI, ...a, '--module', 'm', '--dir', dir], { encoding: 'utf8' });
    assert.equal(cli('register', '--text', t, '--screen', s, '--root', tmp).status, 0);
    const reg = JSON.parse(readFileSync(join(dir, 'm/findings.json'), 'utf8'));
    assert.equal(reg.items.length, 2);
    assert.equal(reg.items[0].source[0], 'src/Dlg.tsx:80');
    const id = reg.items.find((i) => i.family === 'text').id;
    assert.equal(cli('decide', id, 'ignore').status, 2, 'ignore sem reason');
    assert.equal(cli('decide', id, 'free', '--text', 'Remover Ana', '--by', 'Ana').status, 0);
    const dec = JSON.parse(readFileSync(join(dir, 'm/decisions.json'), 'utf8'));
    assert.equal(dec.items[id].choice, 'free');
    const st = JSON.parse(cli('status', '--json').stdout);
    assert.equal(st.by_status.decided, 1);
    assert.equal(st.decided[0].id, id);
    assert.equal(cli('check', '--text', t, '--screen', s, '--root', tmp).status, 0);
    const t2 = join(tmp, 't2.json');
    writeFileSync(t2, JSON.stringify(textJson([textFinding({ file: join(tmp, 'src/Dlg.tsx') }), textFinding({ rule: 'X11', text: 'Hash', file: join(tmp, 'src/Dlg.tsx') })])));
    const bad = cli('check', '--text', t2, '--root', tmp);
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /NOVO .* src\/Dlg\.tsx:80/);
    const html = join(tmp, 'p.html');
    assert.equal(cli('page', html).status, 0);
    assert.ok(readFileSync(html, 'utf8').includes('Copiar decisões'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('text-page: CLI still renders the page from cases.json', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-tp-'));
  try {
    const cases = join(tmp, 'c.json');
    writeFileSync(cases, JSON.stringify({ cases: [{ id: 'c1', element: 'button', rule: 'X6', severity: 1, text: 'OK', problem: 'Sem verbo', options: [{ text: 'Salvar', convention: 'DSX' }], recommended: { index: 0, why: '' } }] }));
    const out = join(tmp, 'o.html');
    execFileSync('node', [fileURLToPath(new URL('../ux-lint/text-page.mjs', import.meta.url)), cases, out, '--product', 'P']);
    const html = readFileSync(out, 'utf8');
    assert.ok(html.includes('<span class="btn">Salvar</span>'));
    assert.ok(html.includes('Botões'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('legacy: old Portuguese detector output and casos.json are still read', () => {
  const oldScreen = { resumo: {}, telas: [{ arquivo: '/proj/caps/03-doc.html', achados: [{ regra: 'T7', severidade: 1, regiao: 'main', mensagem: 'botão "Confirmar" sem verbo + objeto (3×)', evidencia: '/proj/caps/03-doc.html:508:8210, /proj/caps/03-doc.html:508:10713' }] }] };
  assert.deepEqual(fromScreen(oldScreen, { root: ROOT }), fromScreen(screenJson, { root: ROOT }));
  const oldText = { resumo: {}, achados: [{ regra: 'X1', severidade: 2, texto: 'Remover da lista — Ana', mensagem: 'travessão', tipos: ['botão'], telas: ['07-dlg.html'], origem: { trecho: 'Remover da lista', total: 1, local: 'codigo', ocorrencias: [{ arquivo: '/proj/src/Dlg.tsx', linha: 80 }] } }] };
  assert.deepEqual(fromText(oldText, { root: ROOT }), fromText(textJson([textFinding()]), { root: ROOT }));
  const oldFlow = { achados: [{ regra: 'F1', severidade: 3, tela: 'respondido', mensagem: '"Resposta" não tem saída; chega-se por 3 transição(ões)', evidencia: ['t-a (src/pages/A.tsx:208)'] }] };
  assert.deepEqual(fromFlow(oldFlow), fromFlow(flowJson));

  const tmp = mkdtempSync(join(tmpdir(), 'dsx-tp-old-'));
  try {
    const legacyCases = join(tmp, 'c.json');
    writeFileSync(legacyCases, JSON.stringify({ casos: [{ id: 'c1', elemento: 'botao', regra: 'X6', severidade: 1, texto: 'OK', problema: 'Sem verbo', opcoes: [{ texto: 'Salvar', convencao: 'DSX' }], recomendada: { indice: 0, porque: '' } }] }));
    const out = join(tmp, 'o.html');
    const r = spawnSync('node', [fileURLToPath(new URL('../ux-lint/text-page.mjs', import.meta.url)), legacyCases, out], { encoding: 'utf8' });
    assert.equal(r.status, 0);
    assert.match(r.stderr, /nome antigo "casos", renomeie para "cases"/);
    assert.ok(readFileSync(out, 'utf8').includes('<span class="btn">Salvar</span>'));
    const old = spawnSync('node', [fileURLToPath(new URL('../ux-lint/text-page.mjs', import.meta.url)), legacyCases, out, '--produto', 'P'], { encoding: 'utf8' });
    assert.equal(old.status, 0);
    assert.match(old.stderr, /--produto é nome antigo, use --product/);
    assert.ok(readFileSync(out, 'utf8').includes('P'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
