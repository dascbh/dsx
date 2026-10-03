import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { analisarTexto, inventariar, agrupar, indexarFonte, indexarCodigo, origemDe, semComentarios, trechos, lerArgs } from '../ux-lint/texto.mjs';

const CLI = fileURLToPath(new URL('../ux-lint/texto.mjs', import.meta.url));
const pagina = (corpo) => `<!doctype html><html><head><title>t</title></head><body><main>${corpo}</main></body></html>`;
const btn = (t, v = 'contained', extra = '') => `<button class="MuiButton-root MuiButton-${v}"${extra}>${t}</button>`;
const achadosDe = (html, cfg) => analisarTexto(pagina(html), cfg).achados;
const regras = (html, cfg) => achadosDe(html, cfg).map((a) => a.regra).sort();
const tem = (html, regra, cfg) => regras(html, cfg).includes(regra);

test('inventário: tipos, variantes e diálogo aberto', () => {
  const html = pagina(`<h1>Contratos</h1><p>Lista dos contratos enviados pelo time.</p>
    ${btn('Enviar contrato')}${btn('', 'text', ' aria-label="Fechar painel"').replace('MuiButton-root MuiButton-text', 'MuiIconButton-root')}
    <div class="MuiTabs-root"><button role="tab" class="MuiTab-root">Minutas</button></div>
    <label for="c">Busca</label><input id="c" placeholder="Nome ou CNPJ">
    <p class="MuiFormHelperText-root">Busca por nome ou CNPJ.</p>
    <div class="MuiAlert-message">Envio concluído.</div>
    <span title="Data do upload">12/09</span><nav aria-label="Navegação principal"></nav>
    <table><tr><td>—</td></tr></table>`);
  const inv = inventariar(html);
  const por = (t) => inv.filter((i) => i.tipo === t).map((i) => i.texto);
  assert.deepEqual(por('título'), ['Contratos']);
  assert.deepEqual(por('aba'), ['Minutas']);
  assert.deepEqual(por('botão').sort(), ['Enviar contrato', 'Fechar painel']);
  assert.equal(inv.find((i) => i.texto === 'Fechar painel').variante, 'ícone');
  assert.equal(inv.find((i) => i.texto === 'Enviar contrato').variante, 'contained');
  assert.deepEqual(por('rótulo'), ['Busca']);
  assert.deepEqual(por('placeholder'), ['Nome ou CNPJ']);
  assert.equal(inv.find((i) => i.tipo === 'placeholder').rotulo, 'Busca');
  assert.ok(por('texto de apoio').includes('Lista dos contratos enviados pelo time.'));
  assert.equal(inv.find((i) => i.texto === 'Lista dos contratos enviados pelo time.').titulo, 'Contratos');
  assert.deepEqual(por('alerta'), ['Envio concluído.']);
  assert.deepEqual(por('tooltip'), ['Data do upload']);
  assert.deepEqual(por('nome acessível'), ['Navegação principal']);
  assert.deepEqual(por('valor vazio'), ['—']);

  // Com diálogo aberto, só o diálogo.
  const comDialogo = inventariar(pagina(`<h1>Contratos</h1>${btn('Enviar contrato')}<div role="dialog"><h2 class="MuiDialogTitle-root">Excluir minuta?</h2>${btn('Excluir minuta')}</div>`));
  assert.deepEqual(comDialogo.map((i) => i.texto).sort(), ['Excluir minuta', 'Excluir minuta?']);
});

test('inventário: acordeão que também é botão conta uma vez, como título; cartão clicável usa o 1º bloco', () => {
  const inv = inventariar(pagina(`<div class="MuiAccordionSummary-root" role="button"><h3>Partes do contrato</h3></div>
    <button class="MuiButton-root MuiButton-text"><span class="MuiTypography-root">Cláusula de foro</span><span class="MuiChip-root">Preenchida</span></button>`));
  assert.deepEqual(inv.filter((i) => i.texto === 'Partes do contrato').map((i) => i.tipo), ['título']);
  const cartao = inv.find((i) => i.tipo === 'botão');
  assert.equal(cartao.texto, 'Cláusula de foro');
  assert.equal(cartao.variante, 'composto');
});

test('X1: travessão no texto; meia-risca entre números não conta', () => {
  assert.ok(tem('<p class="MuiTypography-caption">Assinado fora — sem certificado</p>', 'X1'));
  assert.ok(!tem('<p class="MuiTypography-caption">Páginas 1–8 do contrato</p>', 'X1'));
  assert.ok(!tem('<p class="MuiTypography-caption">Vigência 2024–2026</p>', 'X1'));
  assert.ok(tem('<p class="MuiTypography-caption">Vigência 2024–2026 – renovável</p>', 'X1'));
  const a = achadosDe('<p class="MuiTypography-caption">Assinado fora — sem certificado</p>').find((x) => x.regra === 'X1');
  assert.equal(a.severidade, 2);
  assert.equal(a.sugestao, 'Assinado fora, sem certificado');
});

test('X1b: travessão como valor vazio de célula', () => {
  const a = achadosDe('<table><tr><td>—</td><td>Ativo</td></tr></table>');
  assert.deepEqual(a.map((x) => x.regra), ['X1b']);
  assert.equal(a[0].severidade, 1);
  assert.match(a[0].sugestao, /Não informado/);
});

test('X2: título composto e botão "Rótulo — Nome"', () => {
  assert.ok(tem('<h2>Revisar antes de gravar · cláusulas.docx</h2>', 'X2'));
  assert.ok(tem('<h2>Etapa 2: escolher modelo</h2>', 'X2'));
  const b = achadosDe(btn('Remover da lista — Ana Souza', 'text')).find((x) => x.regra === 'X2');
  assert.match(b.mensagem, /nome acessível/);
  assert.match(b.sugestao, /texto "Remover da lista"/);
  const icone = '<button class="MuiIconButton-root" aria-label="Remover da lista — Ana Souza"><svg></svg></button>';
  assert.deepEqual(regras(icone), ['X1'], 'botão só com ícone: o nome no aria-label está certo; só o travessão é achado');
  assert.ok(!tem('<h2>Aditivos de 2024 – 2026</h2>', 'X2'));
  assert.ok(!tem('<p class="MuiTypography-caption">Prazo · 3 dias</p>', 'X2'), 'texto de apoio não entra no X2');
});

test('X3: texto de apoio que só repete o título, ou abre repetindo', () => {
  assert.ok(tem('<h2>Timbre do cliente</h2><p>Timbre deste cliente.</p>', 'X3'));
  const a = achadosDe('<h2>Timbre do cliente</h2><p>Timbre deste cliente. Só o curador altera.</p>').find((x) => x.regra === 'X3');
  assert.equal(a.sugestao, 'Só o curador altera.');
  assert.ok(!tem('<h2>Campos comuns</h2><p>Preenchidos uma vez e valem para todos os aditivos do lote.</p>', 'X3'));
  assert.ok(!tem('<h2>Preenchimento</h2><p>2 campos por preencher</p>', 'X3'), 'contagem é informação');
});

test('X4: abertura vazia', () => {
  for (const t of ['Aqui você pode ver os contratos.', 'Nesta tela ficam as minutas.', 'Use esta aba para revisar.', 'Veja abaixo os resultados.', 'Clique aqui para enviar.', 'Esta página mostra o acervo.']) {
    assert.ok(tem(`<p class="MuiTypography-caption">${t}</p>`, 'X4'), t);
  }
  assert.ok(!tem('<p class="MuiTypography-caption">Os contratos enviados ficam na empresa.</p>', 'X4'));
});

test('X5: rótulo com dois-pontos/ponto; botão, título e aba com ponto final', () => {
  assert.ok(tem('<label>Nome:</label>', 'X5'));
  assert.ok(tem('<label>Nome.</label>', 'X5'));
  assert.ok(!tem('<label>Nome *</label>', 'X5'));
  assert.ok(tem(btn('Salvar minuta.'), 'X5'));
  assert.ok(tem('<h2>Resposta registrada.</h2>', 'X5'));
  assert.ok(!tem(btn('Carregando…'), 'X5'));
  assert.ok(!tem('<h2>Excluir minuta?</h2>', 'X5'));
});

test('X6: botão longo, sem objeto ou sem verbo', () => {
  assert.ok(tem(btn('Baixar PDF para assinar fora'), 'X6'));
  assert.ok(tem(btn('OK'), 'X6'));
  assert.ok(tem(btn('Confirmar'), 'X6'));
  assert.ok(tem(btn('Nova cláusula'), 'X6'));
  assert.ok(!tem(btn('Salvar minuta'), 'X6'));
  assert.ok(!tem(btn('Metalúrgica Serra Azul Ltda.', 'text'), 'X6'), 'nome de empresa é valor, não ação');
  assert.ok(!tem(btn('Nova cláusula'), 'X6', configFrom({ conteudo: { botoes: 'livre' } })), 'sem a política verbo-objeto, só a lista');
  assert.ok(tem(btn('OK'), 'X6', configFrom({ conteudo: { botoes: 'livre' } })));
});

test('X7: tooltip/aria-label que repete o texto; dica longa num controle', () => {
  assert.ok(tem(btn('Salvar minuta', 'contained', ' aria-label="Salvar minuta"'), 'X7'));
  assert.ok(tem(btn('Salvar minuta', 'contained', ' title="Salvar minuta"'), 'X7'));
  assert.ok(!tem('<span class="MuiTypography-noWrap" title="contrato-fornecimento.pdf">contrato-fornecimento.pdf</span>', 'X7'), 'texto truncado: a dica é o texto inteiro');
  const longa = 'Refaz a leitura dos dados das páginas que ainda faltam e mantém o que você já confirmou antes';
  assert.ok(tem(btn('Reprocessar', 'text', ` title="${longa}"`), 'X7'));
  assert.ok(!tem(`<span title="${longa}">i</span>`, 'X7'), 'fora de controle não conta');
});

test('X8: placeholder que repete o rótulo', () => {
  assert.ok(tem('<label for="a">Nome da parte</label><input id="a" placeholder="Nome da parte">', 'X8'));
  assert.ok(tem('<label for="a">Nome da parte</label><input id="a" placeholder="Digite o nome da parte">', 'X8'));
  assert.ok(!tem('<label for="a">CNPJ</label><input id="a" placeholder="00.000.000/0000-00">', 'X8'));
});

test('X9: parêntese explicativo em rótulo, botão ou título', () => {
  const a = achadosDe(btn('Configurar timbres (nome e logo)')).find((x) => x.regra === 'X9');
  assert.equal(a.sugestao, 'Configurar timbres');
  assert.ok(tem('<label>Texto da cláusula (só nesta minuta)</label>', 'X9'));
  assert.ok(!tem('<label>Telefone (opcional)</label>', 'X9'));
  assert.ok(!tem(btn('Histórico (3)'), 'X9'));
  assert.ok(!tem('<label>Documento (CNPJ)</label>', 'X9'));
});

test('X10: Caixa De Título, com siglas e nomes próprios fora', () => {
  const a = achadosDe('<h1>Contratos e Aditivos</h1>').find((x) => x.regra === 'X10');
  assert.equal(a.sugestao, 'Contratos e aditivos');
  assert.ok(tem(btn('Sumário Executivo', 'text'), 'X10'));
  assert.ok(!tem('<h1>Cenários TO BE</h1>', 'X10'));
  assert.ok(!tem(btn('Selecionar PDFs'), 'X10'));
  assert.ok(!tem('<h1>Contratos e aditivos</h1>', 'X10'));
  assert.ok(!tem(btn('Baixar Word'), 'X10', configFrom({ conteudo: { 'nomes-proprios': ['Word'] } })));
});

test('X11: termos de implementação do padrão e do UX.md', () => {
  assert.ok(tem('<p class="MuiTypography-caption">Documento (sha256 do original)</p>', 'X11'));
  assert.ok(tem('<p class="MuiTypography-caption">Erro 5xx no envio</p>', 'X11'));
  assert.ok(tem('<p class="MuiTypography-caption">Falha na API</p>', 'X11'));
  assert.ok(!tem('<p class="MuiTypography-caption">Rapidez na entrega</p>', 'X11'));
  assert.ok(tem('<p class="MuiTypography-caption">Ative a flag do módulo</p>', 'X11', configFrom({ conteudo: { proibidos: ['flag'] } })));
  assert.ok(!tem('<p class="MuiTypography-caption">OCR (reconhecimento de texto) das páginas</p>', 'X11'));
  assert.ok(tem('<p class="MuiTypography-caption">Refaz o OCR das páginas</p>', 'X11'));
});

test('origem: comentários fora, literal exato, template e dado interpolado', () => {
  assert.equal(semComentarios('a // x\nb /* y */ c "// z"').replace(/\s+/g, ' '), 'a b c "// z"');
  assert.equal(semComentarios('"""Doc."""\nX = "a" # c\nY = """Texto"""', true).replace(/\s+/g, ' ').trim(), 'X = "a" Y = """Texto"""');
  assert.deepEqual(trechos('Remover da lista — Ana Souza').slice(0, 3), ['Remover da lista — Ana Souza', 'Remover da lista', 'Ana Souza']);

  const indice = [
    indexarFonte('src/Lista.tsx', [
      '// Remover da lista — comentário não conta',
      'export const X = () => (',
      '  <Button aria-label={`Remover ${nome}`}>{`Remover da lista — ${nome}`}</Button>',
      ');',
      'const titulo = `Abrir ${minuta.nome} no editor`;',
      'const t = "Contratos e Aditivos";',
    ].join('\n')),
    indexarFonte('src/vocab.py', 'ROTULO = "Assinado fora da plataforma \\u2014 sem certificado"\n'),
    indexarFonte('tests/fixtures.ts', 'export const minuta = { nome: "1º Termo Aditivo — Frete" };\n'),
  ];
  const r1 = origemDe(indice, 'Remover da lista — Ana Souza', '—');
  assert.equal(r1.local, 'codigo');
  assert.deepEqual(r1.ocorrencias[0], { arquivo: 'src/Lista.tsx', linha: 3 });
  const r2 = origemDe(indice, 'Assinado fora da plataforma — sem certificado', '—');
  assert.deepEqual([r2.local, r2.ocorrencias[0].arquivo, r2.ocorrencias[0].linha], ['codigo', 'src/vocab.py', 1]);
  const r3 = origemDe(indice, 'Abrir 1º Termo Aditivo — Frete no editor', '—');
  assert.equal(r3.local, 'dado', 'o travessão veio do nome interpolado');
  assert.equal(r3.ocorrencias[0].linha, 5);
  const r4 = origemDe(indice, 'Contratos e Aditivos', 'Aditivos');
  assert.deepEqual([r4.local, r4.ocorrencias[0].linha], ['codigo', 6]);
  const r5 = origemDe(indice, '1º Termo Aditivo — Frete', '—');
  assert.equal(r5.local, 'dado', 'só em fixture de teste');
  assert.equal(origemDe(indice, 'Texto que não existe em lugar nenhum', null), null);
});

test('agrupar: mesmo texto em várias telas = um achado; template com dado vira variantes; dado sai da contagem', () => {
  const indice = [indexarFonte('src/Lista.tsx', 'const a = `Remover da lista — ${nome}`;\nconst b = `Editar ${nome}`;\n')];
  const html = pagina(`${btn('Remover da lista — Ana Souza', 'text')}${btn('Remover da lista — Rui Lima', 'text')}${btn('Editar Ana Souza', 'text')}`);
  const res = [analisarTexto(html, configFrom({}), 't1.html'), analisarTexto(html, configFrom({}), 't2.html')];
  const grupos = agrupar(res, indice);
  const x1 = grupos.filter((g) => g.regra === 'X1');
  assert.equal(x1.length, 1);
  assert.equal(x1[0].variantes.length, 2);
  assert.deepEqual(x1[0].telas, ['t1.html', 't2.html']);
  const x10 = grupos.find((g) => g.regra === 'X10');
  assert.ok(x10.dado, '"Ana Souza" veio do dado');
  assert.equal(x10.severidade, 0);
  const sem = agrupar(res);
  assert.ok(sem.every((g) => !g.dado && !g.origem));
});

test('CLI: args com várias pastas, --ignorar, --json com inventário e origem', () => {
  assert.deepEqual(lerArgs(['--telas', 'a', 'b', '--codigo', 'c', 'd', '--ux', 'U.md', '--json']), { telas: ['a', 'b'], codigo: ['c', 'd'], ignorar: [], ux: 'U.md', json: true });
  const dir = mkdtempSync(join(tmpdir(), 'texto-'));
  try {
    mkdirSync(join(dir, 'telas'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'telas', '01-menu.html'), pagina('<h1>Menu Principal</h1>'));
    writeFileSync(join(dir, 'telas', '02-lista.html'), pagina(`<h1>Contratos</h1>${btn('Salvar minuta.')}`));
    writeFileSync(join(dir, 'src', 'Lista.tsx'), 'export const L = () => <Button>Salvar minuta.</Button>;\n');
    const out = JSON.parse(execFileSync(process.execPath, [CLI, '--telas', join(dir, 'telas'), '--ignorar', '01-menu.html', '--codigo', join(dir, 'src'), '--json'], { encoding: 'utf8' }));
    assert.equal(out.resumo.telas, 1);
    assert.ok(out.telas[0].inventario.some((i) => i.tipo === 'botão' && i.texto === 'Salvar minuta.'));
    const x5 = out.achados.find((a) => a.regra === 'X5');
    assert.equal(x5.origem.ocorrencias[0].linha, 1);
    assert.match(x5.origem.ocorrencias[0].arquivo, /Lista\.tsx$/);
    assert.equal(indexarCodigo([join(dir, 'src')]).length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('inventário: título que envolve botão (disclosure) conta uma vez, como título, sem o chip de status', () => {
  const inv = inventariar(pagina('<h3 class="MuiTypography-root"><button class="MuiButtonBase-root"><svg></svg><span class="MuiBox-root">Cláusula de foro</span><span class="MuiChip-root"><span class="MuiChip-label">Preenchidos</span></span></button></h3>'));
  assert.deepEqual(inv.map((i) => [i.tipo, i.texto]), [['título', 'Cláusula de foro']]);
});
