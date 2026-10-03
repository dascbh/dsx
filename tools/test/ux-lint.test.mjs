import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHtml, querySelectorAll, querySelector, closest, textOf } from '../ux-lint/lib/html.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { analisarTela } from '../ux-lint/tela.mjs';
import { analisarFluxo } from '../ux-lint/fluxo.mjs';
import { parseYaml } from '../lib/yaml-lite.mjs';

const regras = (r) => r.achados.map((a) => a.regra).sort();
const pagina = (corpo, h1 = '<h1>Contratos</h1>') =>
  `<!doctype html><html><head><title>t</title><style>.x{}</style></head><body><header>Topo</header><main>${h1}${corpo}</main></body></html>`;
const prim = (t) => `<button class="MuiButton-root MuiButton-contained">${t}</button>`;
const sec = (t) => `<button class="MuiButton-root MuiButton-text">${t}</button>`;
const dlg = (titulo, conteudo, rodape) =>
  `<div role="presentation"><div class="MuiDialog-paper" role="dialog" aria-labelledby="t1"><h2 id="t1">${titulo}</h2><div>${conteudo}</div><div class="MuiDialogActions-root">${rodape}</div></div></div>`;

test('html: árvore, void, script/style ignorados, entidades', () => {
  const root = parseHtml('<div id="a" class="x y"><img src=1><br/><script>if (a<b) {}</script><p>A &amp; B&nbsp;C</p></div><style>p{}</style>');
  const div = querySelector(root, '#a');
  assert.equal(div.children.length, 4); // img, br, script, p
  assert.equal(textOf(div), 'A & B C');
  assert.equal(querySelectorAll(root, 'p').length, 1);
});

test('html: seletores do contrato', () => {
  const root = parseHtml(`<main><form><input type="hidden"><input type="text" id="n"><input type="checkbox"><textarea></textarea></form>
    <button class="MuiButton-contained MuiButton-colorError" data-x="1">Excluir</button><span role="button">Ícone</span></main><nav><button>Menu</button></nav>`);
  const campo = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select';
  assert.deepEqual(querySelectorAll(root, campo).map((n) => n.tag), ['input', 'textarea']);
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
  assert.throws(() => querySelectorAll(root, 'a:hover'), /não suportado/);
});

test('yaml-lite: 3 níveis, listas inline com aspas, "#" e "," protegidos', () => {
  const y = parseYaml([
    'verificacao:',
    '  seletores:',
    '    regioes: ["header", "#main", "a, b"]   # comentário',
    '    campo: "input:not([type=hidden]), textarea"',
    'acao: { regiao: topo, max: 1 }',
    "texto: it's ok # comentário",
  ].join('\n'));
  assert.deepEqual(y.verificacao.seletores.regioes, ['header', '#main', 'a, b']);
  assert.equal(y.verificacao.seletores.campo, 'input:not([type=hidden]), textarea');
  assert.deepEqual(y.acao, { regiao: 'topo', max: 1 });
  assert.equal(y.texto, "it's ok");
});

test('config: padrões do contrato e sobrescrita parcial', () => {
  const c = configFrom({ acoes: { 'primarias-por-regiao': 2 }, conteudo: { proibidos: ['tenant'] } });
  assert.equal(c.acoes['primarias-por-regiao'], 2);
  assert.equal(c.acoes['ordem-dialogo'], 'cancelar-acao');
  assert.equal(c.verificacao.seletores.dialogo, '[role=dialog]');
  assert.equal(c.fluxos['max-passos-jornada'], 12);
  assert.deepEqual(c.conteudo.proibidos, ['tenant']);
});

test('T1: duas primárias em main; diálogo aberto ignora a página atrás', () => {
  assert.deepEqual(regras(analisarTela(pagina(prim('Criar aditivo') + prim('Exportar PDF')))), ['T1']);
  const comDialogo = pagina(prim('Criar aditivo') + prim('Exportar PDF') + dlg('Novo', '<p>x</p>', sec('Cancelar') + prim('Criar')));
  assert.deepEqual(regras(analisarTela(comDialogo)), []);
});

test('T2: rodapé do diálogo com a ação antes de cancelar', () => {
  const r = analisarTela(pagina(dlg('Excluir minuta?', '<p>x</p>', prim('Excluir minuta') + sec('Cancelar'))));
  assert.deepEqual(regras(r), ['T2']);
  assert.match(r.achados[0].regiao, /diálogo "Excluir minuta\?"/);
  // Botão de conteúdo antes do Fechar do rodapé não é rodapé: não compara.
  assert.deepEqual(regras(analisarTela(pagina(dlg('Categorias', prim('Adicionar'), sec('Fechar'))))), []);
  // Ordem inversa declarada no UX.md.
  const cfg = configFrom({ acoes: { 'ordem-dialogo': 'acao-cancelar' } });
  assert.deepEqual(regras(analisarTela(pagina(dlg('X', '', sec('Cancelar') + prim('Salvar'))), cfg)), ['T2']);
});

test('T3: sem h1 e com dois h1', () => {
  assert.deepEqual(regras(analisarTela(pagina('<p>x</p>', ''))), ['T3']);
  assert.deepEqual(regras(analisarTela(pagina('<h1>Outro</h1>'))), ['T3']);
});

test('T4: campo só com placeholder reprova; rótulo ou aria-label passa', () => {
  const r = analisarTela(pagina('<input type="text" placeholder="Buscar">'));
  assert.deepEqual(regras(r), ['T4']);
  assert.match(r.achados[0].mensagem, /placeholder/);
  assert.deepEqual(regras(analisarTela(pagina('<label for="b">Busca</label><input id="b" placeholder="Buscar">'))), []);
  assert.deepEqual(regras(analisarTela(pagina('<label>Nome <input></label><input aria-label="CNPJ"><input aria-hidden="true">'))), []);
});

test('T5: destrutiva com rótulo genérico (sem T7 duplicado)', () => {
  const r = analisarTela(pagina(dlg('Excluir?', '', sec('Cancelar') + '<button class="MuiButton-contained MuiButton-colorError">Confirmar</button>')));
  assert.deepEqual(regras(r), ['T5']);
  const off = configFrom({ acoes: { 'destrutiva-rotulo-especifico': false } });
  assert.deepEqual(regras(analisarTela(pagina('<button class="MuiButton-colorError">Confirmar</button>'), off)), ['T7']);
});

test('T6: termo proibido, palavra inteira e sem caixa', () => {
  const cfg = configFrom({ conteudo: { proibidos: ['snapshot', 'RLS'] } });
  const r = analisarTela(pagina('<p>Novo Snapshot criado</p><p>snapshots antigos</p><p>rls</p>'), cfg);
  assert.deepEqual(r.achados.map((a) => a.mensagem.match(/"([^"]+)"/)[1]).sort(), ['RLS', 'snapshot']);
  assert.match(r.achados.find((a) => a.mensagem.includes('snapshot')).mensagem, /\(1×\)/);
});

test('T7: rótulo sem verbo é aviso (severidade 1)', () => {
  const r = analisarTela(pagina(sec('OK') + sec('Enviar minuta')));
  assert.deepEqual(regras(r), ['T7']);
  assert.equal(r.achados[0].severidade, 1);
});

test('fluxo: F1–F5 em mapa sintético', () => {
  const tr = (id, de, para, linha) => ({ id, de, para, gatilho: { tipo: 'botao', rotulo: id }, evidencia: `src/App.tsx:${linha}` });
  const mapa = {
    telas: [
      { id: 'lista', nome: 'Lista', tipo: 'pagina', pai: null },
      { id: 'detalhe', nome: 'Detalhe', tipo: 'pagina', pai: 'lista' },
      { id: 'fim', nome: 'Fim', tipo: 'pagina', pai: null },
      { id: 'solta', nome: 'Solta', tipo: 'pagina', pai: null },
      { id: 'dlg-a', nome: 'Diálogo A', tipo: 'dialogo', pai: 'detalhe' },
      { id: 'dlg-b', nome: 'Diálogo B', tipo: 'dialogo', pai: 'dlg-a' },
    ],
    transicoes: [
      tr('t1', 'lista', 'detalhe', 10),
      tr('t2', 'detalhe', 'fim', 20),
      tr('t3', 'detalhe', 'dlg-a', 30),
      tr('t4', 'dlg-a', 'dlg-b', 40),
      tr('t5', 'dlg-b', 'dlg-a', 50),
      tr('t6', 'dlg-a', 'detalhe', 60),
      tr('t7', 'solta', 'lista', 70),
      tr('t8', 'fim', 'fim', 80),
    ],
    jornadas: [{ id: 'j1', nome: 'Longa', passos: ['t1', 't3', 't4', 't5', 't6', 't2'], trocas_persona: [] }],
  };
  const cfg = configFrom({ fluxos: { 'max-passos-jornada': 5 } });
  const { achados } = analisarFluxo(mapa, cfg);
  const por = (r) => achados.filter((a) => a.regra === r);
  assert.deepEqual(por('F1').map((a) => a.tela), ['fim']); // laço para si mesma não é saída
  assert.match(por('F1')[0].evidencia[0], /src\/App\.tsx:20/);
  assert.deepEqual(por('F2').map((a) => a.tela), ['solta']);
  assert.deepEqual(por('F3').map((a) => a.tela), ['j1']);
  assert.deepEqual(por('F4').map((a) => a.tela), ['dlg-b']);
  assert.match(por('F4')[0].evidencia[0], /t4 \(src\/App\.tsx:40\)/);
  assert.deepEqual(por('F5').map((a) => a.tela), ['detalhe']); // dlg-a volta a detalhe; dlg-b volta a dlg-a
  assert.ok(achados.every((a) => typeof a.severidade === 'number'));
});
