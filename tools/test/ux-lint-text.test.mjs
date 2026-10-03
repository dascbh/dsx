import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { analyzeText, takeInventory, group, indexSource, indexCode, sourceOf, stripComments, snippets, parseTextArgs } from '../ux-lint/text.mjs';

const CLI = fileURLToPath(new URL('../ux-lint/text.mjs', import.meta.url));
const page = (body) => `<!doctype html><html><head><title>t</title></head><body><main>${body}</main></body></html>`;
const btn = (t, v = 'contained', extra = '') => `<button class="MuiButton-root MuiButton-${v}"${extra}>${t}</button>`;
const findingsOf = (html, cfg) => analyzeText(page(html), cfg).findings;
const rules = (html, cfg) => findingsOf(html, cfg).map((a) => a.rule).sort();
const has = (html, rule, cfg) => rules(html, cfg).includes(rule);

test('inventory: types, variants and open dialog', () => {
  const html = page(`<h1>Contratos</h1><p>Lista dos contratos enviados pelo time.</p>
    ${btn('Enviar contrato')}${btn('', 'text', ' aria-label="Fechar painel"').replace('MuiButton-root MuiButton-text', 'MuiIconButton-root')}
    <div class="MuiTabs-root"><button role="tab" class="MuiTab-root">Minutas</button></div>
    <label for="c">Busca</label><input id="c" placeholder="Nome ou CNPJ">
    <p class="MuiFormHelperText-root">Busca por nome ou CNPJ.</p>
    <div class="MuiAlert-message">Envio concluído.</div>
    <span title="Data do upload">12/09</span><nav aria-label="Navegação principal"></nav>
    <table><tr><td>—</td></tr></table>`);
  const inv = takeInventory(html);
  const byType = (t) => inv.filter((i) => i.type === t).map((i) => i.text);
  assert.deepEqual(byType('title'), ['Contratos']);
  assert.deepEqual(byType('tab'), ['Minutas']);
  assert.deepEqual(byType('button').sort(), ['Enviar contrato', 'Fechar painel']);
  assert.equal(inv.find((i) => i.text === 'Fechar painel').variant, 'icon');
  assert.equal(inv.find((i) => i.text === 'Enviar contrato').variant, 'contained');
  assert.deepEqual(byType('label'), ['Busca']);
  assert.deepEqual(byType('placeholder'), ['Nome ou CNPJ']);
  assert.equal(inv.find((i) => i.type === 'placeholder').label, 'Busca');
  assert.ok(byType('helper').includes('Lista dos contratos enviados pelo time.'));
  assert.equal(inv.find((i) => i.text === 'Lista dos contratos enviados pelo time.').title, 'Contratos');
  assert.deepEqual(byType('alert'), ['Envio concluído.']);
  assert.deepEqual(byType('tooltip'), ['Data do upload']);
  assert.deepEqual(byType('accessible-name'), ['Navegação principal']);
  assert.deepEqual(byType('empty-value'), ['—']);

  // Com diálogo aberto, só o diálogo.
  const withDialog = takeInventory(page(`<h1>Contratos</h1>${btn('Enviar contrato')}<div role="dialog"><h2 class="MuiDialogTitle-root">Excluir minuta?</h2>${btn('Excluir minuta')}</div>`));
  assert.deepEqual(withDialog.map((i) => i.text).sort(), ['Excluir minuta', 'Excluir minuta?']);
});

test('inventory: accordion that is also a button counts once, as title; clickable card uses the first block', () => {
  const inv = takeInventory(page(`<div class="MuiAccordionSummary-root" role="button"><h3>Partes do contrato</h3></div>
    <button class="MuiButton-root MuiButton-text"><span class="MuiTypography-root">Cláusula de foro</span><span class="MuiChip-root">Preenchida</span></button>`));
  assert.deepEqual(inv.filter((i) => i.text === 'Partes do contrato').map((i) => i.type), ['title']);
  const card = inv.find((i) => i.type === 'button');
  assert.equal(card.text, 'Cláusula de foro');
  assert.equal(card.variant, 'composite');
});

test('X1: dash in text; en dash between numbers does not count', () => {
  assert.ok(has('<p class="MuiTypography-caption">Assinado fora — sem certificado</p>', 'X1'));
  assert.ok(!has('<p class="MuiTypography-caption">Páginas 1–8 do contrato</p>', 'X1'));
  assert.ok(!has('<p class="MuiTypography-caption">Vigência 2024–2026</p>', 'X1'));
  assert.ok(has('<p class="MuiTypography-caption">Vigência 2024–2026 – renovável</p>', 'X1'));
  const a = findingsOf('<p class="MuiTypography-caption">Assinado fora — sem certificado</p>').find((x) => x.rule === 'X1');
  assert.equal(a.severity, 2);
  assert.equal(a.suggestion, 'Assinado fora, sem certificado');
});

test('X1b: dash as empty cell value', () => {
  const a = findingsOf('<table><tr><td>—</td><td>Ativo</td></tr></table>');
  assert.deepEqual(a.map((x) => x.rule), ['X1b']);
  assert.equal(a[0].severity, 1);
  assert.match(a[0].suggestion, /Não informado/);
});

test('X2: compound title and button "Label — Name"', () => {
  assert.ok(has('<h2>Revisar antes de gravar · cláusulas.docx</h2>', 'X2'));
  assert.ok(has('<h2>Etapa 2: escolher modelo</h2>', 'X2'));
  const b = findingsOf(btn('Remover da lista — Ana Souza', 'text')).find((x) => x.rule === 'X2');
  assert.match(b.message, /nome acessível/);
  assert.match(b.suggestion, /texto "Remover da lista"/);
  const iconBtn = '<button class="MuiIconButton-root" aria-label="Remover da lista — Ana Souza"><svg></svg></button>';
  assert.deepEqual(rules(iconBtn), ['X1'], 'botão só com ícone: o nome no aria-label está certo; só o travessão é achado');
  assert.ok(!has('<h2>Aditivos de 2024 – 2026</h2>', 'X2'));
  assert.ok(!has('<p class="MuiTypography-caption">Prazo · 3 dias</p>', 'X2'), 'texto de apoio não entra no X2');
});

test('X3: helper text that only repeats the title, or opens repeating it', () => {
  assert.ok(has('<h2>Timbre do cliente</h2><p>Timbre deste cliente.</p>', 'X3'));
  const a = findingsOf('<h2>Timbre do cliente</h2><p>Timbre deste cliente. Só o curador altera.</p>').find((x) => x.rule === 'X3');
  assert.equal(a.suggestion, 'Só o curador altera.');
  assert.ok(!has('<h2>Campos comuns</h2><p>Preenchidos uma vez e valem para todos os aditivos do lote.</p>', 'X3'));
  assert.ok(!has('<h2>Preenchimento</h2><p>2 campos por preencher</p>', 'X3'), 'contagem é informação');
});

test('X4: empty opening', () => {
  for (const t of ['Aqui você pode ver os contratos.', 'Nesta tela ficam as minutas.', 'Use esta aba para revisar.', 'Veja abaixo os resultados.', 'Clique aqui para enviar.', 'Esta página mostra o acervo.']) {
    assert.ok(has(`<p class="MuiTypography-caption">${t}</p>`, 'X4'), t);
  }
  assert.ok(!has('<p class="MuiTypography-caption">Os contratos enviados ficam na empresa.</p>', 'X4'));
});

test('X5: label with colon/period; button, title and tab with final period', () => {
  assert.ok(has('<label>Nome:</label>', 'X5'));
  assert.ok(has('<label>Nome.</label>', 'X5'));
  assert.ok(!has('<label>Nome *</label>', 'X5'));
  assert.ok(has(btn('Salvar minuta.'), 'X5'));
  assert.ok(has('<h2>Resposta registrada.</h2>', 'X5'));
  assert.ok(!has(btn('Carregando…'), 'X5'));
  assert.ok(!has('<h2>Excluir minuta?</h2>', 'X5'));
});

test('X6: long button, without object or without verb', () => {
  assert.ok(has(btn('Baixar PDF para assinar fora'), 'X6'));
  assert.ok(has(btn('OK'), 'X6'));
  assert.ok(has(btn('Confirmar'), 'X6'));
  assert.ok(has(btn('Nova cláusula'), 'X6'));
  assert.ok(!has(btn('Salvar minuta'), 'X6'));
  assert.ok(!has(btn('Metalúrgica Serra Azul Ltda.', 'text'), 'X6'), 'nome de empresa é valor, não ação');
  assert.ok(!has(btn('Nova cláusula'), 'X6', configFrom({ content: { buttons: 'free' } })), 'sem a política verbo-objeto, só a lista');
  assert.ok(has(btn('OK'), 'X6', configFrom({ content: { buttons: 'free' } })));
});

test('X7: tooltip/aria-label repeating the text; long hint on a control', () => {
  assert.ok(has(btn('Salvar minuta', 'contained', ' aria-label="Salvar minuta"'), 'X7'));
  assert.ok(has(btn('Salvar minuta', 'contained', ' title="Salvar minuta"'), 'X7'));
  assert.ok(!has('<span class="MuiTypography-noWrap" title="contrato-fornecimento.pdf">contrato-fornecimento.pdf</span>', 'X7'), 'texto truncado: a dica é o texto inteiro');
  const longText = 'Refaz a leitura dos dados das páginas que ainda faltam e mantém o que você já confirmou antes';
  assert.ok(has(btn('Reprocessar', 'text', ` title="${longText}"`), 'X7'));
  assert.ok(!has(`<span title="${longText}">i</span>`, 'X7'), 'fora de controle não conta');
});

test('X8: placeholder repeating the label', () => {
  assert.ok(has('<label for="a">Nome da parte</label><input id="a" placeholder="Nome da parte">', 'X8'));
  assert.ok(has('<label for="a">Nome da parte</label><input id="a" placeholder="Digite o nome da parte">', 'X8'));
  assert.ok(!has('<label for="a">CNPJ</label><input id="a" placeholder="00.000.000/0000-00">', 'X8'));
});

test('X9: explanatory parenthesis in label, button or title', () => {
  const a = findingsOf(btn('Configurar timbres (nome e logo)')).find((x) => x.rule === 'X9');
  assert.equal(a.suggestion, 'Configurar timbres');
  assert.ok(has('<label>Texto da cláusula (só nesta minuta)</label>', 'X9'));
  assert.ok(!has('<label>Telefone (opcional)</label>', 'X9'));
  assert.ok(!has(btn('Histórico (3)'), 'X9'));
  assert.ok(!has('<label>Documento (CNPJ)</label>', 'X9'));
});

test('X10: Title Case, excluding acronyms and proper nouns', () => {
  const a = findingsOf('<h1>Contratos e Aditivos</h1>').find((x) => x.rule === 'X10');
  assert.equal(a.suggestion, 'Contratos e aditivos');
  assert.ok(has(btn('Sumário Executivo', 'text'), 'X10'));
  assert.ok(!has('<h1>Cenários TO BE</h1>', 'X10'));
  assert.ok(!has(btn('Selecionar PDFs'), 'X10'));
  assert.ok(!has('<h1>Contratos e aditivos</h1>', 'X10'));
  assert.ok(!has(btn('Baixar Word'), 'X10', configFrom({ content: { 'proper-nouns': ['Word'] } })));
});

test('X11: implementation terms from defaults and UX.md', () => {
  assert.ok(has('<p class="MuiTypography-caption">Documento (sha256 do original)</p>', 'X11'));
  assert.ok(has('<p class="MuiTypography-caption">Erro 5xx no envio</p>', 'X11'));
  assert.ok(has('<p class="MuiTypography-caption">Falha na API</p>', 'X11'));
  assert.ok(!has('<p class="MuiTypography-caption">Rapidez na entrega</p>', 'X11'));
  assert.ok(has('<p class="MuiTypography-caption">Ative a flag do módulo</p>', 'X11', configFrom({ content: { forbidden: ['flag'] } })));
  assert.ok(!has('<p class="MuiTypography-caption">OCR (reconhecimento de texto) das páginas</p>', 'X11'));
  assert.ok(has('<p class="MuiTypography-caption">Refaz o OCR das páginas</p>', 'X11'));
});

test('source: comments ignored, exact literal, template and interpolated data', () => {
  assert.equal(stripComments('a // x\nb /* y */ c "// z"').replace(/\s+/g, ' '), 'a b c "// z"');
  assert.equal(stripComments('"""Doc."""\nX = "a" # c\nY = """Texto"""', true).replace(/\s+/g, ' ').trim(), 'X = "a" Y = """Texto"""');
  assert.deepEqual(snippets('Remover da lista — Ana Souza').slice(0, 3), ['Remover da lista — Ana Souza', 'Remover da lista', 'Ana Souza']);

  const index = [
    indexSource('src/Lista.tsx', [
      '// Remover da lista — comentário não conta',
      'export const X = () => (',
      '  <Button aria-label={`Remover ${nome}`}>{`Remover da lista — ${nome}`}</Button>',
      ');',
      'const titulo = `Abrir ${minuta.nome} no editor`;',
      'const t = "Contratos e Aditivos";',
    ].join('\n')),
    indexSource('src/vocab.py', 'ROTULO = "Assinado fora da plataforma \\u2014 sem certificado"\n'),
    indexSource('tests/fixtures.ts', 'export const minuta = { nome: "1º Termo Aditivo — Frete" };\n'),
  ];
  const r1 = sourceOf(index, 'Remover da lista — Ana Souza', '—');
  assert.equal(r1.location, 'code');
  assert.deepEqual(r1.occurrences[0], { file: 'src/Lista.tsx', line: 3 });
  const r2 = sourceOf(index, 'Assinado fora da plataforma — sem certificado', '—');
  assert.deepEqual([r2.location, r2.occurrences[0].file, r2.occurrences[0].line], ['code', 'src/vocab.py', 1]);
  const r3 = sourceOf(index, 'Abrir 1º Termo Aditivo — Frete no editor', '—');
  assert.equal(r3.location, 'data', 'o travessão veio do nome interpolado');
  assert.equal(r3.occurrences[0].line, 5);
  const r4 = sourceOf(index, 'Contratos e Aditivos', 'Aditivos');
  assert.deepEqual([r4.location, r4.occurrences[0].line], ['code', 6]);
  const r5 = sourceOf(index, '1º Termo Aditivo — Frete', '—');
  assert.equal(r5.location, 'data', 'só em fixture de teste');
  assert.equal(sourceOf(index, 'Texto que não existe em lugar nenhum', null), null);
});

test('group: same text on several screens = one finding; template with data becomes variants; data leaves the count', () => {
  const index = [indexSource('src/Lista.tsx', 'const a = `Remover da lista — ${nome}`;\nconst b = `Editar ${nome}`;\n')];
  const html = page(`${btn('Remover da lista — Ana Souza', 'text')}${btn('Remover da lista — Rui Lima', 'text')}${btn('Editar Ana Souza', 'text')}`);
  const res = [analyzeText(html, configFrom({}), 't1.html'), analyzeText(html, configFrom({}), 't2.html')];
  const groups = group(res, index);
  const x1 = groups.filter((g) => g.rule === 'X1');
  assert.equal(x1.length, 1);
  assert.equal(x1[0].variants.length, 2);
  assert.deepEqual(x1[0].screens, ['t1.html', 't2.html']);
  const x10 = groups.find((g) => g.rule === 'X10');
  assert.ok(x10.probable_data, '"Ana Souza" veio do dado');
  assert.equal(x10.severity, 0);
  const plain = group(res);
  assert.ok(plain.every((g) => !g.probable_data && !g.source));
});

test('CLI: args with several folders, --ignore, --json with inventory and source', () => {
  assert.deepEqual(parseTextArgs(['--screens', 'a', 'b', '--code', 'c', 'd', '--ux', 'U.md', '--json']), { screens: ['a', 'b'], code: ['c', 'd'], ignore: [], ux: 'U.md', json: true });
  const warned = [];
  assert.deepEqual(parseTextArgs(['--telas', 'a', '--codigo', 'c'], (m) => warned.push(m)), { screens: ['a'], code: ['c'], ignore: [], ux: null, json: false });
  assert.ok(warned.some((w) => /--telas é nome antigo, use --screens/.test(w)) && warned.length === 2);
  const dir = mkdtempSync(join(tmpdir(), 'texto-'));
  try {
    mkdirSync(join(dir, 'screens'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'screens', '01-menu.html'), page('<h1>Menu Principal</h1>'));
    writeFileSync(join(dir, 'screens', '02-lista.html'), page(`<h1>Contratos</h1>${btn('Salvar minuta.')}`));
    writeFileSync(join(dir, 'src', 'Lista.tsx'), 'export const L = () => <Button>Salvar minuta.</Button>;\n');
    const out = JSON.parse(execFileSync(process.execPath, [CLI, '--screens', join(dir, 'screens'), '--ignore', '01-menu.html', '--code', join(dir, 'src'), '--json'], { encoding: 'utf8' }));
    assert.equal(out.summary.screens, 1);
    assert.ok(out.screens[0].inventory.some((i) => i.type === 'button' && i.text === 'Salvar minuta.'));
    const x5 = out.findings.find((a) => a.rule === 'X5');
    assert.equal(x5.source.occurrences[0].line, 1);
    assert.match(x5.source.occurrences[0].file, /Lista\.tsx$/);
    assert.equal(indexCode([join(dir, 'src')]).length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('inventory: title wrapping a button (disclosure) counts once, as title, without the status chip', () => {
  const inv = takeInventory(page('<h3 class="MuiTypography-root"><button class="MuiButtonBase-root"><svg></svg><span class="MuiBox-root">Cláusula de foro</span><span class="MuiChip-root"><span class="MuiChip-label">Preenchidos</span></span></button></h3>'));
  assert.deepEqual(inv.map((i) => [i.type, i.text]), [['title', 'Cláusula de foro']]);
});
