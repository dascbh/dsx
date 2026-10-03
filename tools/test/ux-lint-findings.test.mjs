import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  stableId, templateOf, maskData, fromText, fromScreen, fromFlow, assignIds, merge, statusOf, check,
  importOptions, importDecisions, makeDecision, renderPage, pageCases,
} from '../ux-lint/findings.mjs';

const CLI = fileURLToPath(new URL('../ux-lint/findings.mjs', import.meta.url));
const ROOT = '/proj';

// Saídas mínimas no formato `--json` de cada verificador.
const textJson = (achados) => ({ resumo: {}, achados });
const achadoTexto = ({ regra = 'X1', sev = 2, texto = 'Remover da lista — Ana', linha = 80, arquivo = '/proj/src/Dlg.tsx', variantes, dado = false } = {}) => ({
  regra, severidade: dado ? 0 : sev, texto, mensagem: 'travessão', tipos: ['botão'], telas: ['07-dlg.html'],
  origem: { trecho: 'Remover da lista', total: 1, local: dado ? 'dado' : 'codigo', ocorrencias: [{ arquivo, linha }] },
  ...(variantes ? { variantes } : {}), ...(dado ? { dado: true } : {}),
});
const screenJson = { resumo: {}, telas: [{ arquivo: '/proj/caps/03-doc.html', achados: [{ regra: 'T7', severidade: 1, regiao: 'main', mensagem: 'botão "Confirmar" sem verbo + objeto (3×)', evidencia: '/proj/caps/03-doc.html:508:8210, /proj/caps/03-doc.html:508:10713' }] }] };
const flowJson = { achados: [{ regra: 'F1', severidade: 3, tela: 'respondido', mensagem: '"Resposta" não tem saída; chega-se por 3 transição(ões)', evidencia: ['t-a (src/pages/A.tsx:208)'] }] };

const run = (achados, reg = []) => ({ items: assignIds(fromText(textJson(achados), { root: ROOT }), reg), families: ['text'] });
const novoRegistro = () => ({ module: 'm', updated: null, runs: [], items: [] });
const dia = (d) => new Date(`2026-10-${d}T12:00:00Z`);

test('id estável: linha muda → mesmo id; texto ou arquivo muda → id novo', () => {
  const [a] = fromText(textJson([achadoTexto({ linha: 80 })]), { root: ROOT });
  const [b] = fromText(textJson([achadoTexto({ linha: 95 })]), { root: ROOT });
  const [c] = fromText(textJson([achadoTexto({ texto: 'Tirar da lista — Ana' })]), { root: ROOT });
  const [d] = fromText(textJson([achadoTexto({ arquivo: '/proj/src/Outro.tsx' })]), { root: ROOT });
  assert.match(stableId(a), /^t-[0-9a-f]{8}$/);
  assert.equal(stableId(a), stableId(b));
  assert.notEqual(stableId(a), stableId(c));
  assert.notEqual(stableId(a), stableId(d));
  assert.equal(a.source[0], 'src/Dlg.tsx:80', 'origem relativa à raiz do projeto');
});

test('id estável: dado variável e variantes viram {}', () => {
  assert.equal(maskData('Resposta registrada em 02/10/2026 14:37.'), 'Resposta registrada em {} {}.');
  assert.equal(templateOf('Remover da lista — Ana Souza', ['Remover da lista — Ana Souza', 'Remover da lista — Ricardo Almeida']), 'Remover da lista — {}');
  assert.equal(templateOf('Cláusula 1 — Foro', ['Cláusula 1 — Foro', 'Cláusula 2 — Reajuste de preços']), 'Cláusula {} — {}');
  const um = fromText(textJson([achadoTexto({ variantes: ['Remover da lista — Ana', 'Remover da lista — Bia'] })]), { root: ROOT })[0];
  const outro = fromText(textJson([achadoTexto({ texto: 'Remover da lista — Caio', variantes: ['Remover da lista — Caio', 'Remover da lista — Duda'] })]), { root: ROOT })[0];
  assert.equal(um.text, 'Remover da lista — {}');
  assert.equal(stableId(um), stableId(outro));
});

test('id herdado quando o conjunto de variantes muda o modelo', () => {
  const reg = novoRegistro();
  merge(reg, run([achadoTexto({ texto: 'Cláusula 1 — Foro', variantes: ['Cláusula 1 — Foro', 'Cláusula 2 — Preço'] })]), { now: dia('01') });
  const id = reg.items[0].id;
  const r2 = run([achadoTexto({ texto: 'Cláusula 2 — Preço', linha: 99 })], reg.items);
  assert.equal(r2.items[0].id, id);
});

test('severidade 0 (provável dado) fica fora por padrão', () => {
  const j = textJson([achadoTexto(), achadoTexto({ texto: 'Ana — Souza', dado: true })]);
  assert.equal(fromText(j).length, 1);
  assert.equal(fromText(j, { includeSev0: true }).length, 2);
});

test('tela e fluxo normalizados com família, prefixo e origem', () => {
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
  const [f2] = assignIds(fromFlow({ achados: [{ ...flowJson.achados[0], evidencia: ['t-b (src/pages/B.tsx:10)'] }] }));
  assert.equal(f.id, f2.id);
});

test('fusão preserva visto_primeiro e decisões; ausência só para a família da execução', () => {
  const reg = novoRegistro();
  const decisoes = { items: {} };
  merge(reg, { items: [...run([achadoTexto()]).items, ...assignIds(fromScreen(screenJson))], families: ['text', 'screen'] }, { now: dia('01'), commit: 'abc1234' });
  const id = reg.items.find((i) => i.family === 'text').id;
  decisoes.items[id] = makeDecision(0, { now: dia('02') });
  merge(reg, run([achadoTexto({ linha: 81 })]), { now: dia('03'), decisions: decisoes });
  const t = reg.items.find((i) => i.id === id);
  assert.equal(t.first_seen, '2026-10-01');
  assert.equal(t.last_seen, '2026-10-03');
  assert.deepEqual(t.source, ['src/Dlg.tsx:81']);
  assert.equal(t.status, 'decided');
  assert.equal(reg.items.find((i) => i.family === 'screen').present, true, 'família que não veio não fica ausente');
  assert.equal(reg.runs.length, 2);
  assert.equal(reg.runs[0].commit, 'abc1234');
  assert.deepEqual(reg.runs[1].sources, ['text']);
  assert.equal(decisoes.items[id].choice, 0);
});

test('status: aberto → decidido → corrigido → regressão; ignorado', () => {
  const reg = novoRegistro();
  const dec = { items: {} };
  merge(reg, run([achadoTexto()]), { now: dia('01'), decisions: dec });
  const it = reg.items[0];
  assert.equal(it.status, 'open');
  dec.items[it.id] = makeDecision('1', { now: dia('01') });
  assert.equal(statusOf(it, dec), 'decided');
  merge(reg, run([]), { now: dia('02'), decisions: dec });
  assert.equal(it.status, 'fixed');
  assert.equal(it.present, false);
  merge(reg, run([achadoTexto()]), { now: dia('03'), decisions: dec });
  assert.equal(it.status, 'regression');
  dec.items[it.id] = makeDecision('ignore', { reason: 'nome próprio', now: dia('03') });
  assert.equal(statusOf(it, dec), 'ignored');
  assert.throws(() => makeDecision('ignore', {}), /reason/);
  assert.throws(() => makeDecision('free', {}), /text/);
  assert.equal(makeDecision('free', { text: 'Tirar' }).text, 'Tirar');
});

test('check: reprova achado novo ≥ mínimo e regressão; tolera aberto conhecido', () => {
  const reg = novoRegistro();
  const dec = { items: {} };
  merge(reg, run([achadoTexto()]), { now: dia('01') });
  let r = check(reg, run([achadoTexto({ linha: 90 })], reg.items), { decisions: dec });
  assert.equal(r.pass, true);
  assert.equal(r.conhecidos.length, 1);
  r = check(reg, run([achadoTexto(), achadoTexto({ regra: 'X11', texto: 'Hash do documento' })], reg.items), { decisions: dec });
  assert.equal(r.pass, false);
  assert.equal(r.novos.length, 1);
  r = check(reg, run([achadoTexto({ regra: 'X5', sev: 1, texto: 'Pronto.' })], reg.items), { decisions: dec });
  assert.equal(r.pass, true, 'novo abaixo do mínimo passa');
  merge(reg, run([]), { now: dia('02') });
  r = check(reg, run([achadoTexto()], reg.items), { decisions: dec });
  assert.equal(r.pass, false);
  assert.equal(r.regressoes.length, 1);
  assert.equal(reg.items[0].status, 'fixed', 'check não grava');
});

test('opções: caso agrupado cobre vários ids; caso sem achado vira item de revisão', () => {
  const reg = novoRegistro();
  merge(reg, run([
    achadoTexto({ regra: 'X10', sev: 1, texto: 'Sumário Executivo', arquivo: '/proj/src/nav.tsx', linha: 34 }),
    achadoTexto({ regra: 'X10', sev: 1, texto: 'DRE Projetada', arquivo: '/proj/src/nav.tsx', linha: 40 }),
  ]), { now: dia('01') });
  const opcoes = { items: {} };
  const casos = [
    { id: 'c02', elemento: 'menu', regra: 'X10', texto: 'Sumário Executivo', variantes: ['DRE Projetada', 'Sumário Executivo'], origem: ['src/nav.tsx:34'], problema: 'Caixa de título', opcoes: [{ texto: 'Sumário executivo', convencao: 'DSX', nota: '' }, { texto: 'Resumo', convencao: 'Polaris', nota: '' }], recomendada: { indice: 0, porque: 'pt-BR' } },
    { id: 'c50', elemento: 'apoio', regra: 'desc', severidade: 1, texto: 'Aqui ficam as minutas.', origem: ['src/Lista.tsx:12'], telas: ['14-minutas'], problema: 'Descrição desnecessária', opcoes: [{ texto: '(remover)', convencao: 'DSX' }], recomendada: { indice: 0, porque: '' } },
  ];
  const r = importOptions(reg, opcoes, casos, { now: dia('01') });
  assert.equal(r.matched, 1);
  assert.equal(r.manual, 1);
  assert.equal(r.links[0].ids.length, 2);
  const manual = reg.items.find((i) => i.rule === 'desc');
  assert.equal(manual.origin, 'review');
  assert.equal(manual.element, 'helper');
  assert.deepEqual(opcoes.items[r.links[0].ids[0]].recommended, { index: 0, why: 'pt-BR' });
  assert.equal(opcoes.items[r.links[0].ids[0]].options[1].text, 'Resumo');
  // Reimportar não duplica; detector que não vê o item de revisão não o marca como corrigido.
  importOptions(reg, opcoes, casos, { now: dia('02') });
  assert.equal(reg.items.filter((i) => i.rule === 'desc').length, 1);
  merge(reg, run([]), { now: dia('03') });
  assert.equal(manual.present, true);
  assert.equal(manual.status, 'open');
});

test('importar decisões no formato da página', () => {
  const reg = novoRegistro();
  merge(reg, run([achadoTexto()]), { now: dia('01') });
  const dec = { items: {} };
  const id = reg.items[0].id;
  const r = importDecisions(reg, dec, { items: { [id]: { choice: 2, by: 'Ana', at: '2026-10-04', reason: null }, 't-00000000': { choice: 0 } } });
  assert.equal(r.ok, 1);
  assert.deepEqual(r.unknown, ['t-00000000']);
  assert.deepEqual(dec.items[id], { choice: 2, by: 'Ana', at: '2026-10-04', reason: null });
  const ruim = importDecisions(reg, dec, { items: { [id]: { choice: 'ignore' } } });
  assert.equal(ruim.invalid.length, 1, 'ignore sem motivo é recusado');
});

test('página: id, status, decisão marcada e formulário que copia decisions.json', () => {
  const reg = novoRegistro();
  merge(reg, run([achadoTexto()]), { now: dia('01') });
  const id = reg.items[0].id;
  const opcoes = { items: { [id]: { problem: 'Travessão', options: [{ text: 'Remover Ana', convention: 'DSX', note: '' }, { text: 'Tirar Ana', convention: 'Polaris', note: '' }], recommended: { index: 0, why: '' } } } };
  const dec = { items: { [id]: makeDecision(1, { by: 'Ana', now: dia('02') }) } };
  merge(reg, run([achadoTexto()]), { now: dia('02'), decisions: dec });
  const html = renderPage(reg, opcoes, dec, { product: 'X' });
  assert.ok(html.includes(id));
  assert.ok(html.includes('decidido'));
  assert.match(html, /<fieldset class="decisao" data-ids="[^"]*"/);
  assert.match(html, /value="1" checked/);
  assert.match(html, /value="ignore"/);
  assert.ok(html.includes('Copiar decisões'));
  assert.ok(html.includes('navigator.clipboard.writeText'));
  assert.ok(html.includes('<textarea id="saida"'));
  assert.ok(!/fetch\(|localStorage|download=/.test(html), 'sem fetch, sem armazenamento obrigatório, sem download');
  assert.equal(pageCases(reg, opcoes, dec).length, 1);

  // O script do formulário gera o JSON no formato de decisions.json.
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  const radio = { value: '1' };
  const motivo = { value: '', removeAttribute() {}, setAttribute() {} };
  const fieldset = { dataset: { ids: id, caso: 'c' }, querySelector: (s) => (s.includes('radio') ? radio : motivo) };
  let clique, copiado;
  const els = { por: { value: 'Ana' }, aviso: { textContent: '' }, saida: { value: '', hidden: true }, copiar: { addEventListener: (_, f) => { clique = f; } } };
  const document = { getElementById: (k) => els[k], querySelectorAll: (s) => (s === 'fieldset.decisao' ? [fieldset] : []) };
  const navigator = { clipboard: { writeText: async (t) => { copiado = t; } } };
  new Function('document', 'navigator', script)(document, navigator);
  return clique().then(() => {
    const out = JSON.parse(copiado);
    assert.equal(out.items[id].choice, 1);
    assert.equal(out.items[id].by, 'Ana');
    assert.match(out.items[id].at, /^\d{4}-\d{2}-\d{2}$/);
  });
});

test('CLI: register, options, decide, status, check e page num diretório temporário', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-findings-'));
  try {
    const t = join(tmp, 't.json');
    writeFileSync(t, JSON.stringify(textJson([achadoTexto({ arquivo: join(tmp, 'src/Dlg.tsx') })])));
    const s = join(tmp, 's.json');
    writeFileSync(s, JSON.stringify(screenJson));
    const dir = join(tmp, '.dsx/findings');
    const cli = (...a) => spawnSync('node', [CLI, ...a, '--module', 'm', '--dir', dir], { encoding: 'utf8' });
    assert.equal(cli('register', '--text', t, '--screen', s, '--root', tmp).status, 0);
    const reg = JSON.parse(readFileSync(join(dir, 'm/findings.json'), 'utf8'));
    assert.equal(reg.items.length, 2);
    assert.equal(reg.items[0].source[0], 'src/Dlg.tsx:80');
    const id = reg.items.find((i) => i.family === 'text').id;
    assert.equal(cli('decide', id, 'ignore').status, 2, 'ignore sem motivo');
    assert.equal(cli('decide', id, 'free', '--text', 'Remover Ana', '--by', 'Ana').status, 0);
    const dec = JSON.parse(readFileSync(join(dir, 'm/decisions.json'), 'utf8'));
    assert.equal(dec.items[id].choice, 'free');
    const st = JSON.parse(cli('status', '--json').stdout);
    assert.equal(st.byStatus.decided, 1);
    assert.equal(st.decided[0].id, id);
    assert.equal(cli('check', '--text', t, '--screen', s, '--root', tmp).status, 0);
    const t2 = join(tmp, 't2.json');
    writeFileSync(t2, JSON.stringify(textJson([achadoTexto({ arquivo: join(tmp, 'src/Dlg.tsx') }), achadoTexto({ regra: 'X11', texto: 'Hash', arquivo: join(tmp, 'src/Dlg.tsx') })])));
    const ruim = cli('check', '--text', t2, '--root', tmp);
    assert.equal(ruim.status, 1);
    assert.match(ruim.stdout, /NOVO .* src\/Dlg\.tsx:80/);
    const html = join(tmp, 'p.html');
    assert.equal(cli('page', html).status, 0);
    assert.ok(readFileSync(html, 'utf8').includes('Copiar decisões'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('text-page: CLI continua gerando a página a partir de casos.json', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-tp-'));
  try {
    const casos = join(tmp, 'c.json');
    writeFileSync(casos, JSON.stringify({ casos: [{ id: 'c1', elemento: 'botao', regra: 'X6', severidade: 1, texto: 'OK', problema: 'Sem verbo', opcoes: [{ texto: 'Salvar', convencao: 'DSX' }], recomendada: { indice: 0, porque: '' } }] }));
    const out = join(tmp, 'o.html');
    execFileSync('node', [fileURLToPath(new URL('../ux-lint/text-page.mjs', import.meta.url)), casos, out, '--produto', 'P']);
    const html = readFileSync(out, 'utf8');
    assert.ok(html.includes('<span class="btn">Salvar</span>'));
    assert.ok(html.includes('Botões'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
