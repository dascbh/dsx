#!/usr/bin/env node
// ux-lint, nível texto: higiene do texto de interface nas capturas HTML. Procura as marcas que fazem
// um texto parecer gerado por IA ou burocrático (travessão, título composto, descrição que repete o
// título, abertura vazia, caixa de título, termo técnico...) e textos desnecessários. Não julga
// arquitetura de tela (isso é o tela.mjs). Catálogo: knowledge/fundamentos/marcas-de-texto-gerado.md.
// Sem dependências.
//
// Uso: node tools/ux-lint/texto.mjs --telas <pasta-ou-html...> [--codigo <pastas...>] [--ux UX.md]
//                                    [--ignorar <nomes...>] [--json]
// --codigo procura cada texto apontado nas fontes (.ts/.tsx/.js/.jsx/.mjs/.py/.json) e devolve
// arquivo:linha, para corrigir onde o texto nasce.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, configFrom } from './lib/config.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, getById, walk, contains, decodeEntities } from './lib/html.mjs';

export const SEVERIDADE = { X1: 2, X1b: 1, X2: 2, X3: 1, X4: 2, X5: 1, X6: 1, X7: 1, X8: 1, X9: 1, X10: 1, X11: 2 };
export const TIPOS = ['título', 'botão', 'aba', 'rótulo', 'placeholder', 'texto de apoio', 'alerta', 'nome acessível', 'tooltip', 'valor vazio'];
export const ROTULOS_SEM_VERBO = ['ok', 'sim', 'não', 'nao', 'confirmar', 'enviar'];
export const TERMOS_TECNICOS = ['sha256', 'sha-256', 'hash', 'id', 'token', 'payload', 'SES', 'API', 'JSON', 'endpoint', 'webhook', 'UUID'];
const ABERTURAS = [
  /^aqui (você|voce) (pode|encontra|vê|ve)\b/i,
  /^nest[ae] (tela|seção|secao|página|pagina|área|area|aba)\b/i,
  /^est[ae] (página|pagina|tela|seção|secao|área|area)\b/i,
  /^use (este|esta|estes|estas|o|a)\b.*\bpara\b/i,
  /^veja abaixo\b/i,
  /^clique aqui\b/i,
  /^abaixo (você|voce|estão|estao|está|esta)\b/i,
];
const PALAVRAS_VAZIAS = new Set('de da do das dos e a o as os em no na nos nas para pra por com sem ao aos à às um uma uns umas ou que se seu sua seus suas este esta esse essa isso aqui já mais deste desta neste nesta desse dessa nesse nessa'.split(' '));
const NOME_EMPRESA = /\b(ltda|s\.?\s?a\.?|s\/a|eireli|me|epp)\b\.?/i;

const ZW = /[​-‍﻿]/g;
const limpar = (s) => (s || '').replace(ZW, '').replace(/\s+/g, ' ').trim();
const norm = (s) => limpar(s).toLowerCase().replace(/[.!?:…]+$/, '').trim();
const palavras = (s) => limpar(s).split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const raiz = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 5);
const conteudo = (s) => palavras(s).map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')).filter((w) => w.length > 2 && !PALAVRAS_VAZIAS.has(w));

const SEL_BLOCO = 'p, .MuiTypography-body1, .MuiTypography-body2, .MuiTypography-caption, .MuiTypography-subtitle1, .MuiTypography-subtitle2, .MuiDialogContentText-root';

function varianteBotao(n) {
  const c = ` ${n.attrs.class || ''} `;
  if (/ MuiButton-contained/.test(c)) return 'contained';
  if (/ MuiButton-outlined/.test(c)) return 'outlined';
  if (/ MuiButton-text/.test(c)) return 'text';
  if (/ MuiIconButton-root /.test(c)) return 'ícone';
  if (/ MuiListItemButton-root /.test(c)) return 'item de lista';
  if (/ MuiTableSortLabel-root /.test(c)) return 'ordenação';
  if (/ MuiChip-root /.test(c)) return 'chip';
  if (/ MuiToggleButton-root /.test(c)) return 'alternância';
  if (/ MuiMenuItem-root /.test(c) || n.attrs.role === 'menuitem') return 'item de menu';
  return 'outro';
}

function rotuloDoCampo(root, f) {
  if (f.attrs.id) for (const l of querySelectorAll(root, 'label')) if (l.attrs.for === f.attrs.id && textoDe(l)) return textoDe(l);
  const anc = closest(f.parent, 'label');
  if (anc && textoDe(anc)) return textoDe(anc);
  const fc = closest(f, '.MuiFormControl-root, .MuiTextField-root');
  if (fc) { const l = querySelectorAll(fc, 'label')[0]; if (l && textoDe(l)) return textoDe(l); }
  if (f.attrs['aria-labelledby']) {
    const t = f.attrs['aria-labelledby'].split(/\s+/).map((id) => getById(root, id)).filter(Boolean).map(textoDe).join(' ').trim();
    if (t) return t;
  }
  return limpar(f.attrs['aria-label'] || '');
}

const semAsterisco = (s) => limpar(s).replace(/\s*\*$/, '').trim();

const INLINE = /^(b|strong|em|i|u|mark|small|sub|sup|code|abbr|s)$/;
/** Texto visível com espaço em toda fronteira de elemento (o textOf cola "Título" + "Chip" em "TítuloChip"). */
export function textoDe(node, ignorar = null) {
  if (!node || (node.type === 'element' && isHidden(node))) return '';
  const parts = [];
  const rec = (n) => {
    if (n.type === 'text') { parts.push(n.text); return; }
    if (n.type !== 'element') return;
    if ('hidden' in n.attrs || /display:none|visibility:hidden/.test((n.attrs.style || '').replace(/\s+/g, '').toLowerCase())) return;
    if (ignorar && n !== node && matches(n, ignorar)) return;
    const sep = INLINE.test(n.tag) ? '' : ' ';
    parts.push(sep);
    for (const ch of n.children || []) rec(ch);
    parts.push(sep);
  };
  rec(node);
  return limpar(parts.join(''));
}

const SEL_PECA = 'p, div, li, h1, h2, h3, h4, h5, h6, .MuiTypography-root, .MuiChip-root, .MuiListItemText-primary, .MuiListItemText-secondary';
/** Blocos de texto distintos dentro de um controle (cartão clicável = título + resumo + chip). */
function pecasDe(b) {
  const pecas = [];
  for (const n of walk(b)) {
    if (n.type !== 'text' || !limpar(n.text) || isHidden(n.parent)) continue;
    let c = n.parent;
    for (let x = n.parent; x && x !== b; x = x.parent) if (matches(x, SEL_PECA)) { c = x; break; }
    if (!pecas.includes(c)) pecas.push(c);
  }
  return pecas;
}

/**
 * Inventário de textos de uma tela. Com diálogo aberto, só o diálogo.
 * Devolve [{ tipo, texto, variante?, titulo?, rotulo?, visivel?, linha, col, no }].
 */
export function inventariar(html, cfg = configFrom({})) {
  const root = parseHtml(html);
  const sel = cfg.verificacao.seletores;
  const dialogos = querySelectorAll(root, sel.dialogo).filter((d) => !isHidden(d) && !closest(d.parent, sel.dialogo));
  const escopo = dialogos.length ? dialogos : [root];
  const emEscopo = (n) => escopo.some((e) => e === root || contains(e, n));
  const itens = [];
  const porNo = new Map();
  const add = (no, tipo, texto, extra = {}) => {
    texto = limpar(texto);
    if (!texto || isHidden(no) || !emEscopo(no)) return null;
    const it = { tipo, texto, ...extra, linha: no.line, col: no.col, no };
    itens.push(it);
    if (!porNo.has(no)) porNo.set(no, []);
    porNo.get(no).push(it);
    return it;
  };
  const eh = (n, s) => n.type === 'element' && matches(n, s);

  // Títulos (inclui título de diálogo e resumo de acordeão, que também é botão: conta como título).
  const titulos = querySelectorAll(root, 'h1, h2, h3, h4, h5, h6, [role=heading], .MuiDialogTitle-root, .MuiAccordionSummary-root');
  for (const h of titulos) {
    const variante = eh(h, '.MuiAccordionSummary-root') ? 'acordeão' : eh(h, '.MuiDialogTitle-root') || closest(h, sel.dialogo) ? 'diálogo' : h.tag;
    // Chip de status dentro do título (ex.: "Preenchidos") é selo, não título.
    const pecas = variante === 'acordeão' ? pecasDe(h) : [];
    add(h, 'título', pecas.length >= 2 ? textoDe(pecas[0], '.MuiChip-root') : textoDe(h, '.MuiChip-root'), { variante });
  }
  // Abas.
  for (const t of querySelectorAll(root, '.MuiTab-root, [role=tab]')) add(t, 'aba', textoDe(t) || t.attrs['aria-label']);
  // Botões (texto visível ou aria-label), fora abas e resumo de acordeão.
  for (const b of querySelectorAll(root, 'button, [role=button], a.MuiButton-root, [role=menuitem]')) {
    if (eh(b, '.MuiTab-root, [role=tab], .MuiAccordionSummary-root') || b.attrs.role === 'combobox') continue;
    const visivel = textoDe(b);
    const pecas = visivel ? pecasDe(b) : [];
    if (pecas.length >= 2) add(b, 'botão', textoDe(pecas[0]) || visivel, { variante: 'composto', completo: visivel });
    else add(b, 'botão', visivel || b.attrs['aria-label'] || b.attrs.title, { variante: varianteBotao(b), doAriaLabel: !visivel });
  }
  // Rótulos.
  for (const l of querySelectorAll(root, 'label, legend')) add(l, 'rótulo', semAsterisco(textoDe(l)));
  // Placeholders.
  for (const f of querySelectorAll(root, 'input[placeholder], textarea[placeholder]')) {
    add(f, 'placeholder', f.attrs.placeholder, { rotulo: semAsterisco(rotuloDoCampo(root, f)) });
  }
  // Texto de apoio: ajuda de campo, legendas e o parágrafo curto logo depois de um título.
  for (const n of querySelectorAll(root, '.MuiFormHelperText-root, .MuiTypography-caption')) add(n, 'texto de apoio', textoDe(n));
  const textos = [];
  for (const n of walk(root)) if (n.type === 'text' && limpar(n.text)) textos.push(n);
  const idx = new Map(textos.map((t, i) => [t, i]));
  for (const h of titulos) {
    const dentro = textos.filter((t) => contains(h, t));
    if (!dentro.length) continue;
    const prox = textos[idx.get(dentro.at(-1)) + 1];
    if (!prox) continue;
    const bloco = closest(prox.parent, SEL_BLOCO);
    if (!bloco || contains(bloco, h) || closest(bloco, 'button, [role=button], label, a, th, td, [role=tab], h1, h2, h3, h4, h5, h6')) continue;
    const t = textoDe(bloco);
    if (!t || palavras(t).length > 40) continue;
    const ja = (porNo.get(bloco) || []).find((i) => i.tipo === 'texto de apoio');
    if (ja) ja.titulo = textoDe(h);
    else add(bloco, 'texto de apoio', t, { titulo: textoDe(h) });
  }
  // Alertas.
  for (const a of querySelectorAll(root, '.MuiAlert-message')) add(a, 'alerta', textoDe(a));
  // Nome acessível (aria-label). Botão sem texto visível já entrou como botão pelo próprio aria-label.
  for (const n of querySelectorAll(root, '[aria-label]')) {
    const visivel = textoDe(n);
    const jaBotao = (porNo.get(n) || []).some((i) => i.tipo === 'botão' && i.doAriaLabel);
    if (jaBotao) continue;
    const controle = eh(n, 'button, [role=button], a, [role=tab], [role=menuitem]');
    add(n, 'nome acessível', n.attrs['aria-label'], { visivel, controle });
  }
  // Tooltip (atributo title).
  for (const n of querySelectorAll(root, '[title]')) {
    if (/^(html|head|link|style|meta|iframe|abbr)$/.test(n.tag)) continue;
    const controle = eh(n, 'button, [role=button], a, [role=tab], input, select, textarea') || !!closest(n, 'button, [role=button]');
    const truncavel = /MuiTypography-noWrap|ellipsis/.test(`${n.attrs.class || ''} ${n.attrs.style || ''}`) || querySelectorAll(n, '.MuiTypography-noWrap').length > 0;
    add(n, 'tooltip', n.attrs.title, { visivel: textoDe(n), controle, truncavel });
  }
  // Valor vazio: travessão sozinho em célula ou em texto de valor.
  for (const n of walk(root)) {
    if (n.type !== 'element' || !n.children.length || !n.children.every((c) => c.type === 'text')) continue;
    const t = limpar(n.children.map((c) => c.text).join(''));
    if (/^[—–-]$/.test(t)) add(closest(n, 'td, th') || n, 'valor vazio', t);
  }

  // Composto × específico: o mesmo texto contado em dois elementos aninhados conta uma vez — como título
  // quando um deles é título (acordeão, disclosure); senão, no descendente, que é o mais específico.
  const fora = new Set();
  const lateral = (i) => i.tipo === 'nome acessível' || i.tipo === 'tooltip' || i.tipo === 'placeholder';
  for (const a of itens) {
    if (lateral(a) || fora.has(a)) continue;
    const k = norm(a.texto);
    for (const b of itens) {
      if (a === b || fora.has(b) || lateral(b) || b.tipo === 'texto de apoio') continue;
      if (a.no === b.no || !contains(a.no, b.no) || norm(b.texto) !== k) continue;
      if (a.tipo === 'título' && b.tipo !== 'título') fora.add(b);
      else { fora.add(a); break; }
    }
  }
  // Mesmo nó, mesmo tipo, mesmo texto (ex.: diálogo h2 + .MuiDialogTitle-root): uma vez.
  const vistos = new Set();
  return itens.filter((i) => {
    if (fora.has(i)) return false;
    const k = `${i.tipo}|${i.linha}:${i.col}|${i.texto}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

// ---------- regras ----------

const ehSigla = (w) => /^[A-ZÀ-Ý0-9]{2,}[A-ZÀ-Ý0-9-]*s?$/.test(w.replace(/[^\p{L}\p{N}-]/gu, ''));
const pareceVerbo = (w) => {
  const x = w.toLowerCase().replace(/[^\p{L}-]/gu, '');
  return /(ar|er|ir|or|ôr)(-se)?$/.test(x);
};

function caixaDeTitulo(texto, nomesProprios) {
  if (NOME_EMPRESA.test(texto)) return null;
  let t = texto;
  for (const n of nomesProprios) t = t.replace(new RegExp(escRe(n), 'gi'), ' ');
  const ws = t.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')).filter(Boolean);
  const resto = ws.slice(1).filter((w) => /^\p{L}/u.test(w) && w.length >= 3 && !PALAVRAS_VAZIAS.has(w.toLowerCase()) && !ehSigla(w));
  return resto.length > 0 && resto.every((w) => /^\p{Lu}/u.test(w) && /\p{Ll}/u.test(w)) ? resto : null;
}

const paraFrase = (texto, nomesProprios) => {
  const ws = texto.split(' ');
  return ws.map((w, i) => (i === 0 || ehSigla(w) || nomesProprios.some((n) => n.toLowerCase() === w.toLowerCase()) ? w : w.toLowerCase())).join(' ');
};

function travessoes(texto) {
  // Meia-risca entre números/datas (1–8, 2024–2026, 10/09–12/09) não conta.
  return texto.replace(/(\d)\s?–\s?(?=\d)/g, '$1~').match(/[—–]/g) || [];
}

const SEPARADOR = /\s[—–|·]\s|\s-\s|:\s/;

/** Aplica X1–X11 a um item do inventário. Devolve [{ regra, severidade, mensagem, sugestao? }]. */
export function regrasDoItem(it, cfg = configFrom({}), extras = {}) {
  const out = [];
  // `peca`: o pedaço que a regra acusa; com --codigo, se ele não está na linha de origem, veio do dado.
  const add = (regra, mensagem, sugestao, peca) => out.push({ regra, severidade: SEVERIDADE[regra], mensagem, ...(sugestao ? { sugestao } : {}), ...(peca ? { peca } : {}) });
  const t = it.texto;
  const nomesProprios = (cfg.conteudo['nomes-proprios'] || []).map(String);
  const estrutural = ['título', 'botão', 'aba'].includes(it.tipo);

  // X1 / X1b
  if (it.tipo === 'valor vazio') add('X1b', 'travessão no lugar de valor vazio', 'Não informado (ou deixe a célula vazia)');
  else if (travessoes(t).length) {
    add('X1', 'travessão ou meia-risca no texto', t.replace(/\s*[—–]\s*(?!\d)/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*$/, ''), travessoes(t)[0]);
  }

  // X2 — título/aba/botão composto.
  // Botão só com ícone: o aria-label é o lugar certo do nome do objeto; não é X2.
  if (estrutural && !it.doAriaLabel && SEPARADOR.test(t)) {
    const partes = t.split(SEPARADOR).map((s) => s.trim()).filter(Boolean);
    const sep = t.match(SEPARADOR)[0].trim();
    const numerico = /^\d/.test(partes[1] || '') && /\d$/.test(partes[0] || '');
    if (partes.length >= 2 && !numerico) {
      if (it.tipo === 'botão') add('X2', 'botão composto: o nome do objeto vai no nome acessível, não no texto', `texto "${partes[0]}"; aria-label "${partes[0]} ${partes.slice(1).join(' ')}"`, sep);
      else add('X2', `${it.tipo} composto por dois blocos unidos por separador`, partes[0], sep);
    }
  }

  // X3 — descrição que repete o título: quase nada além das palavras dele, ou a 1ª frase só o reformula.
  if (it.tipo === 'texto de apoio' && it.titulo && palavras(t).length >= 3 && !/\d/.test(t)) {
    const tw = [...new Set(conteudo(it.titulo).map(raiz))];
    const sobra = (txt) => [...new Set(conteudo(txt).map(raiz))].filter((w) => !tw.includes(w)).length;
    const cobre = (txt) => { const aw = new Set(conteudo(txt).map(raiz)); return tw.length ? tw.filter((w) => aw.has(w)).length / tw.length : 0; };
    const frase1 = t.split(/(?<=[.!?])\s+/)[0];
    const resto = t.slice(frase1.length).trim();
    if (tw.length && resto && cobre(frase1) >= 0.6 && sobra(frase1) <= 2) {
      add('X3', `a primeira frase repete o título "${it.titulo}"`, resto);
    } else if (tw.length && cobre(t) >= 0.6 && sobra(t) <= (tw.length >= 2 ? 3 : 1)) {
      add('X3', `texto de apoio só repete o título "${it.titulo}"`, 'remova, ou diga o que o título não diz (consequência, prazo, quem vê)');
    }
  }

  // X4 — abertura vazia.
  if (['texto de apoio', 'alerta', 'tooltip', 'placeholder', 'título'].includes(it.tipo)) {
    const m = ABERTURAS.find((re) => re.test(t));
    if (m) add('X4', `abertura vazia ("${t.match(m)[0]}")`, 'comece pelo que a pessoa faz ou ganha; corte a abertura');
  }

  // X5 — pontuação final.
  if (it.tipo === 'rótulo' && /[:.]$/.test(t) && !/\.\.\.$|…$/.test(t)) add('X5', `rótulo termina com "${t.at(-1)}"`, t.replace(/[:.]+$/, ''));
  if (estrutural && /[^.]\.$/.test(t) && !NOME_EMPRESA.test(t)) add('X5', `${it.tipo} termina com ponto final`, t.replace(/\.$/, ''));

  // X6 — botão longo ou sem verbo.
  if (it.tipo === 'botão' && !it.doAriaLabel && !NOME_EMPRESA.test(t) && !['item de lista', 'ordenação', 'chip', 'item de menu', 'alternância', 'composto'].includes(it.variante)) {
    const ws = palavras(t);
    if (ws.length > 4) add('X6', `botão com ${ws.length} palavras (máx. 4)`);
    else if (ROTULOS_SEM_VERBO.includes(norm(t))) add('X6', `botão "${t}" sem objeto`, `${t} <objeto> (ex.: "Enviar minuta")`);
    else if (cfg.conteudo.botoes === 'verbo-objeto' && ['contained', 'outlined', 'text'].includes(it.variante) && ws.length && !pareceVerbo(ws[0])) {
      add('X6', 'botão não começa por verbo', 'verbo no infinitivo + objeto (ex.: "Criar minuta")');
    }
  }

  // X7 — tooltip/aria-label redundante ou longo.
  // Tooltip igual ao texto num elemento que trunca (noWrap/ellipsis, ou texto ≥ 30 caracteres) é o texto inteiro: não conta.
  const truncado = it.tipo === 'tooltip' && (it.truncavel || limpar(it.visivel || '').length >= 30);
  if ((it.tipo === 'tooltip' || it.tipo === 'nome acessível') && it.visivel && !truncado && norm(it.visivel) === norm(t)) {
    add('X7', `${it.tipo === 'tooltip' ? 'tooltip' : 'aria-label'} repete o texto visível`, `remova o atributo ${it.tipo === 'tooltip' ? 'title' : 'aria-label'}`);
  }
  if ((it.tipo === 'tooltip' || (it.tipo === 'nome acessível' && it.controle && !it.visivel)) && it.controle && palavras(t).length > 12) {
    add('X7', `dica com ${palavras(t).length} palavras num controle (máx. 12)`, 'leve a explicação para texto de apoio visível; deixe na dica só o nome da ação');
  }

  // X8 — placeholder que repete o rótulo.
  if (it.tipo === 'placeholder' && it.rotulo) {
    const p = norm(t), r = norm(it.rotulo);
    const rep = p === r || (r.length >= 3 && p.includes(r) && palavras(p).length <= palavras(r).length + 2);
    if (rep) add('X8', `placeholder repete o rótulo "${it.rotulo}"`, 'remova, ou mostre um exemplo do formato esperado');
  }

  // X9 — parêntese explicativo.
  if ((estrutural || it.tipo === 'rótulo')) {
    const m = t.match(/\(([^)]*)\)/);
    if (m && /\p{Ll}{3,}/u.test(m[1]) && !/^(opcional|obrigatório|obrigatorio)$/i.test(m[1].trim())) {
      add('X9', `parêntese explicativo em ${it.tipo} ("(${m[1]})")`, t.replace(/\s*\([^)]*\)/, '').trim(), m[1].trim());
    }
  }

  // X10 — Caixa De Título.
  const maiusculas = estrutural ? caixaDeTitulo(t, nomesProprios) : null;
  if (maiusculas) add('X10', `caixa de título em ${it.tipo}`, paraFrase(t, nomesProprios), maiusculas[0]);

  // X11 — termo de implementação.
  const termos = extras.termos || termosDe(cfg);
  for (const [termo, re] of termos) {
    if (!re.test(t)) continue;
    if (/^ocr$/i.test(termo) && /reconhec/i.test(t)) continue;
    add('X11', `termo de implementação "${termo}"`, 'troque pela palavra do domínio da pessoa', t.match(re)[0]);
    break;
  }
  return out;
}

export function termosDe(cfg) {
  const lista = [...(cfg.conteudo.proibidos || []).map(String), ...TERMOS_TECNICOS, 'OCR'];
  const vistos = new Set();
  const out = [];
  for (const termo of lista) {
    const k = termo.toLowerCase();
    if (!termo || vistos.has(k)) continue;
    vistos.add(k);
    // Siglas de 2–4 letras em maiúsculas casam só em maiúsculas (evita "api" dentro de palavra comum).
    const sensivel = /^[A-Z]{2,4}$/.test(termo);
    out.push([termo, new RegExp(`(?<![\\p{L}\\p{N}_])${escRe(termo)}(?![\\p{L}\\p{N}_])`, sensivel ? 'u' : 'iu')]);
  }
  out.push(['2xx', /(?<![\p{L}\p{N}])[1-5]xx(?![\p{L}\p{N}])|\bHTTP\s?\d{3}\b/iu]);
  return out;
}

/** Inventário + achados de uma tela. */
export function analisarTexto(html, cfg = configFrom({}), arquivo = 'tela.html') {
  const termos = termosDe(cfg);
  const inventario = inventariar(html, cfg);
  const achados = [];
  for (const it of inventario) {
    for (const a of regrasDoItem(it, cfg, { termos })) {
      achados.push({ ...a, tipo: it.tipo, texto: it.texto, evidencia: `${arquivo}:${it.linha}:${it.col}` });
    }
  }
  return { arquivo, inventario: inventario.map(({ no, ...r }) => r), achados };
}

// ---------- origem no código ----------

const EXTS = /\.(tsx?|jsx?|mjs|cjs|py|json)$/;
const PULAR = /^(node_modules|dist|build|coverage|\.git|__pycache__|\.venv|venv|\.next|\.turbo)$/;
const DE_TESTE = /(^|[/\\])(tests?|__tests__|__mocks__|fixtures?|mocks?)([/\\]|$)|\.(test|spec)\.[a-z]+$/;

/** Lê as fontes e normaliza (escapes decodificados, espaços colapsados, minúsculas) guardando o mapa de linhas. */
export function indexarCodigo(pastas) {
  const arquivos = [];
  const rec = (p) => {
    let st;
    try { st = statSync(p); } catch { return; }
    if (st.isDirectory()) {
      if (PULAR.test(basename(p))) return;
      for (const f of readdirSync(p).sort()) rec(join(p, f));
    } else if (EXTS.test(p) && st.size < 2_000_000) arquivos.push(indexarFonte(p, readFileSync(p, 'utf8')));
  };
  for (const p of pastas) rec(p);
  return arquivos;
}

/**
 * Apaga comentários (e docstrings, em Python) trocando por espaços, sem mexer nas quebras de linha:
 * texto em comentário não é texto da interface e confundiria a origem.
 */
export function semComentarios(fonte, py = false) {
  const out = fonte.split('');
  const n = fonte.length;
  const apagar = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '; };
  const TRIPLAS = ['"'.repeat(3), "'".repeat(3)];
  let i = 0;
  while (i < n) {
    const c = fonte[i];
    const tripla = py ? TRIPLAS.find((q) => fonte.startsWith(q, i)) : null;
    if (tripla) {
      const fim = fonte.indexOf(tripla, i + 3);
      const e = fim === -1 ? n : fim + 3;
      const ini = fonte.lastIndexOf('\n', i - 1) + 1;
      if (/^\s*$/.test(fonte.slice(ini, i))) apagar(i, e); // docstring: abre a linha
      i = e;
      continue;
    }
    if (c === '"' || c === "'" || (c === '`' && !py)) {
      let k = i + 1;
      while (k < n && fonte[k] !== c) {
        if (fonte[k] === '\\') k++;
        else if (fonte[k] === '\n' && c !== '`') break;
        k++;
      }
      i = k + 1;
      continue;
    }
    if (py ? c === '#' : c === '/' && fonte[i + 1] === '/') {
      const e = fonte.indexOf('\n', i);
      apagar(i, e === -1 ? n : e);
      i = e === -1 ? n : e;
      continue;
    }
    if (!py && c === '/' && fonte[i + 1] === '*') {
      const fim = fonte.indexOf('*/', i + 2);
      const e = fim === -1 ? n : fim + 2;
      apagar(i, e);
      i = e;
      continue;
    }
    i++;
  }
  return out.join('');
}

export function indexarFonte(arquivo, fonte) {
  const limpo = /\.json$/.test(arquivo) ? fonte : semComentarios(fonte, /\.py$/.test(arquivo));
  const pre = decodeEntities(
    limpo
      .replace(/\\u\{?([0-9a-fA-F]{4,5})\}?/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/\\(['"`])/g, '$1')
      .replace(/\{\s*(['"])\s\1\s*\}/g, ' '),
  );
  let out = '';
  const inicioLinha = [0];
  let ultimo = 0;
  const re = /\s+/g;
  let m;
  while ((m = re.exec(pre))) {
    out += pre.slice(ultimo, m.index) + ' ';
    const nl = (m[0].match(/\n/g) || []).length;
    for (let i = 0; i < nl; i++) inicioLinha.push(out.length);
    ultimo = re.lastIndex;
  }
  out += pre.slice(ultimo);
  const baixo = out.toLowerCase();
  return { arquivo, texto: baixo.length === out.length ? baixo : out, original: out, inicioLinha, teste: DE_TESTE.test(arquivo) };
}

function linhaDe(inicioLinha, pos) {
  let lo = 0, hi = inicioLinha.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (inicioLinha[mid] <= pos) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

const LETRA = /[\p{L}\p{N}]/u;
const DELIM = /["'`<>]/;
/**
 * O literal (string, template ou texto JSX) em volta do trecho, até o delimitador mais próximo (no máximo
 * 80 caracteres), com folga de 12 além dele: pega `${t("x", "Rótulo")} — ${nome}` sem alcançar a linha vizinha.
 */
function mesmoLiteral(txt, pos, fim) {
  let a = pos, b = fim;
  while (a > 0 && pos - a < 80 && !DELIM.test(txt[a - 1])) a--;
  while (b < txt.length && b - fim < 80 && !DELIM.test(txt[b])) b++;
  return txt.slice(Math.max(0, a - 12), b + 12);
}
function buscar(indice, agulha, minimo = 4) {
  const hits = [];
  if (agulha.length < minimo) return hits;
  for (const f of indice) {
    let i = f.texto.indexOf(agulha);
    while (i !== -1) {
      const antes = f.texto[i - 1] || ' ', depois = f.texto[i + agulha.length] || ' ';
      if ((!LETRA.test(antes) || !LETRA.test(agulha[0])) && (!LETRA.test(depois) || !LETRA.test(agulha.at(-1)))) {
        const literal = (/['"`>]/.test(antes) ? 0.5 : 0) + (/['"`<$]/.test(depois) ? 0.5 : 0);
        hits.push({ f, pos: i, fim: i + agulha.length, linha: linhaDe(f.inicioLinha, i), literal });
      }
      i = f.texto.indexOf(agulha, i + agulha.length);
    }
  }
  return hits;
}

/**
 * Trechos candidatos (na caixa original): o texto inteiro, depois os pedaços entre partes dinâmicas
 * (números, datas, e-mails, aspas, separadores), na ordem em que aparecem.
 */
export function trechos(texto) {
  const t = limpar(texto);
  if (/^[—–-]$/.test(t)) return [`'${t}'`, `"${t}"`, `\`${t}\``, `>${t}<`];
  const out = [t];
  const dinamico = /\S+@\S+|R\$\s?[\d.,]+|\d+[\d.,/:hº°ª%-]*|["“”«»'‘’][^"“”«»'‘’]*["“”«»'‘’]|\s[—–|·×]\s|\s-\s|[:;()?!]/g;
  const partes = t.split(dinamico).map((s) => s.trim().replace(/^[,.\s—–-]+|[,.\s—–-]+$/g, '')).filter((s) => s.length >= 5 || palavras(s).length >= 2);
  for (const p of partes) if (!out.includes(p)) out.push(p);
  // Por último, janelas do começo e do fim (o texto fixo de um template costuma abrir a frase).
  const ws = t.split(' ');
  const janelas = ws.length > 6 ? [ws.slice(0, 5), ws.slice(-5)] : ws.length >= 3 ? [ws.slice(0, 3), ws.slice(0, 2)] : [];
  for (const j of janelas.map((x) => x.join(' ').replace(/[,.;:]+$/, ''))) if (j.length >= 5 && !out.includes(j)) out.push(j);
  return out;
}

/**
 * Onde o texto nasce. Primeiro o texto inteiro como está; se não houver, cada trecho, e vence a
 * ocorrência com mais indícios: outros trechos do texto por perto, a `peca` acusada colada nele,
 * mesma caixa, cara de literal, ser o primeiro trecho (a parte fixa de um template) e não ser teste.
 * Devolve { trecho, total, local: 'codigo' | 'dado', ocorrencias: [{ arquivo, linha, teste? }] } ou null.
 * `local: 'dado'` = só aparece em teste/fixture, ou a peça acusada não está junto do trecho (veio interpolada).
 */
export function origemDe(indice, texto, peca = null, max = 5) {
  const cands = trechos(texto);
  const baixos = cands.map((c) => c.toLowerCase());
  const minimo = cands[0].length <= 4 && /^['"`>]/.test(cands[0]) ? 3 : 4;
  const pontuar = (h, ci) => {
    const perto = mesmoLiteral(h.f.original, h.pos, h.fim);
    const longe = h.f.texto.slice(Math.max(0, h.pos - 200), h.fim + 200);
    const temPeca = !peca || ci === 0 || perto.includes(peca);
    const caixa = h.f.original.slice(h.pos, h.fim) === cands[ci] ? 1 : 0;
    const vizinhos = baixos.filter((c, k) => k > 0 && k !== ci && longe.includes(c)).length;
    const pontos = (ci === 0 ? 10 : 0) + vizinhos + (temPeca ? 2 : 0) + caixa + h.literal + (ci === 1 ? 0.75 : 0) + Math.min(cands[ci].length, 40) / 40 - (h.f.teste ? 20 : 0);
    return { ...h, ci, temPeca, pontos };
  };
  let todos = buscar(indice, baixos[0], minimo).map((h) => pontuar(h, 0));
  if (!todos.length) {
    for (let ci = 1; ci < cands.length; ci++) todos.push(...buscar(indice, baixos[ci], minimo).slice(0, 400).map((h) => pontuar(h, ci)));
  }
  if (!todos.length) return null;
  todos.sort((a, b) => b.pontos - a.pontos || a.f.arquivo.localeCompare(b.f.arquivo) || a.linha - b.linha);
  const topo = todos[0];
  const local = topo.f.teste || !topo.temPeca ? 'dado' : 'codigo';
  const vistos = new Set();
  const ocorrencias = [];
  for (const h of todos.filter((x) => x.ci === topo.ci)) {
    const k = `${h.f.arquivo}:${h.linha}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    ocorrencias.push({ arquivo: h.f.arquivo, linha: h.linha, ...(h.f.teste ? { teste: true } : {}) });
  }
  return { trecho: cands[topo.ci], total: ocorrencias.length, local, ocorrencias: ocorrencias.slice(0, max) };
}

// ---------- agregação ----------

export function agrupar(resultados, indice = null) {
  const grupos = new Map();
  for (const r of resultados) for (const a of r.achados) {
    const k = `${a.regra}|${a.texto}`;
    if (!grupos.has(k)) grupos.set(k, { regra: a.regra, severidade: a.severidade, texto: a.texto, mensagem: a.mensagem, sugestao: a.sugestao, peca: a.peca, tipos: new Set(), telas: new Set(), evidencias: [] });
    const g = grupos.get(k);
    g.tipos.add(a.tipo);
    g.telas.add(basename(r.arquivo));
    g.evidencias.push(a.evidencia);
  }
  const cache = new Map();
  let lista = [...grupos.values()].map(({ peca, ...g }) => {
    const out = { ...g, tipos: [...g.tipos], telas: [...g.telas], ocorrencias: g.evidencias.length };
    if (indice) {
      const k = `${g.texto}|${peca || ''}`;
      if (!cache.has(k)) cache.set(k, origemDe(indice, g.texto, peca));
      out.origem = cache.get(k);
      // Sem origem no código, ou com a peça acusada vinda de fora da linha de origem: é dado, não texto da interface.
      if (!out.origem || out.origem.local === 'dado') {
        out.dado = true;
        out.severidadeOriginal = out.severidade;
        out.severidade = 0;
      }
    }
    return out;
  });
  if (indice) lista = fundirPorOrigem(lista);
  return lista.sort((a, b) => b.severidade - a.severidade || b.telas.length - a.telas.length || a.regra.localeCompare(b.regra, 'pt', { numeric: true }) || a.texto.localeCompare(b.texto));
}

/** Mesma regra nascida na mesma linha (template com dado interpolado) = um achado, com as variantes. */
function fundirPorOrigem(lista) {
  const out = [];
  const porLinha = new Map();
  for (const g of lista) {
    const o = g.origem?.ocorrencias?.[0];
    const template = o && g.origem.trecho !== limpar(g.texto);
    if (!template) { out.push(g); continue; }
    const k = `${g.regra}|${o.arquivo}:${o.linha}|${g.origem.trecho}|${!!g.dado}`;
    const ja = porLinha.get(k);
    if (!ja) { porLinha.set(k, g); out.push(g); continue; }
    ja.variantes = [...(ja.variantes || [ja.texto]), g.texto];
    ja.telas = [...new Set([...ja.telas, ...g.telas])];
    ja.tipos = [...new Set([...ja.tipos, ...g.tipos])];
    ja.evidencias.push(...g.evidencias);
    ja.ocorrencias += g.ocorrencias;
  }
  return out;
}

/** Textos mais problemáticos: soma de severidade × telas em todas as regras. */
export function ranking(grupos, n = 10) {
  const porTexto = new Map();
  for (const g of grupos) {
    if (!porTexto.has(g.texto)) porTexto.set(g.texto, { texto: g.texto, pontos: 0, regras: [], telas: new Set(), tipos: new Set(), origem: g.origem });
    const t = porTexto.get(g.texto);
    t.pontos += g.severidade * g.telas.length;
    t.regras.push(g.regra);
    g.telas.forEach((x) => t.telas.add(x));
    g.tipos.forEach((x) => t.tipos.add(x));
  }
  return [...porTexto.values()].map((t) => ({ ...t, telas: [...t.telas], tipos: [...t.tipos] }))
    .sort((a, b) => b.pontos - a.pontos || a.texto.localeCompare(b.texto)).slice(0, n);
}

export function resumir(resultados, grupos) {
  const inventarioPorTipo = {}, porTipo = {}, porRegra = {};
  for (const r of resultados) {
    for (const i of r.inventario) inventarioPorTipo[i.tipo] = (inventarioPorTipo[i.tipo] || 0) + 1;
    for (const a of r.achados) porTipo[a.tipo] = (porTipo[a.tipo] || 0) + 1;
  }
  for (const g of grupos) {
    const r = (porRegra[g.regra] ||= { achados: 0, ocorrencias: 0, dado: 0 });
    if (g.dado) r.dado++;
    else { r.achados++; r.ocorrencias += g.ocorrencias; }
  }
  const interface_ = grupos.filter((g) => !g.dado);
  return {
    telas: resultados.length,
    textos: Object.values(inventarioPorTipo).reduce((s, n) => s + n, 0),
    inventarioPorTipo, porTipo, porRegra,
    achados: interface_.length,
    ocorrencias: interface_.reduce((s, g) => s + g.ocorrencias, 0),
    provavelDado: grupos.length - interface_.length,
  };
}

// ---------- CLI ----------

export function lerArgs(argv) {
  const out = { telas: [], codigo: [], ignorar: [], ux: null, json: false };
  let atual = 'telas';
  for (const a of argv) {
    if (a === '--json') { out.json = true; continue; }
    if (a.startsWith('--')) { atual = a.slice(2); if (!(atual in out)) throw new Error(`opção desconhecida: ${a}`); continue; }
    if (atual === 'ux') { out.ux = a; atual = 'telas'; continue; }
    out[atual].push(a);
  }
  return out;
}

function listarHtml(entradas, ignorar) {
  const out = [];
  for (const e of entradas) {
    if (statSync(e).isDirectory()) { for (const f of readdirSync(e).sort()) if (f.endsWith('.html')) out.push(join(e, f)); }
    else out.push(e);
  }
  return out.filter((f) => !ignorar.includes(basename(f)));
}

const curto = (p) => { const r = relative(process.cwd(), p); return r && !r.startsWith('..') && !isAbsolute(r) ? r : p; };

function main() {
  let args;
  try { args = lerArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  if (!args.telas.length) {
    console.error('Uso: node tools/ux-lint/texto.mjs --telas <pasta-ou-html...> [--codigo <pastas...>] [--ux UX.md] [--ignorar <nomes...>] [--json]');
    process.exit(2);
  }
  const cfg = loadConfig(args.ux);
  const resultados = listarHtml(args.telas, args.ignorar).map((f) => analisarTexto(readFileSync(f, 'utf8'), cfg, f));
  const indice = args.codigo.length ? indexarCodigo(args.codigo) : null;
  const grupos = agrupar(resultados, indice);
  const resumo = resumir(resultados, grupos);
  const top = ranking(grupos);
  if (args.json) {
    console.log(JSON.stringify({ resumo, ranking: top, achados: grupos, telas: resultados }, null, 2));
    return;
  }
  console.log(`Higiene de texto: ${resumo.telas} telas, ${resumo.textos} textos, ${resumo.achados} achados (${resumo.ocorrencias} ocorrências)${indice ? `; ${resumo.provavelDado} descartados como provável dado` : ''}\n`);
  console.log(`Por regra (achados / ocorrências${indice ? ' / provável dado' : ''}):`);
  for (const r of Object.keys(SEVERIDADE)) {
    const x = resumo.porRegra[r];
    if (x) console.log(`  ${r.padEnd(4)} sev ${SEVERIDADE[r]}  ${String(x.achados).padStart(4)} / ${String(x.ocorrencias).padStart(4)}${indice ? ` / ${x.dado}` : ''}`);
  }
  console.log('\nPor tipo de elemento (textos inventariados / ocorrências com achado, antes do filtro de dado):');
  for (const t of TIPOS) if (resumo.inventarioPorTipo[t]) console.log(`  ${t.padEnd(16)} ${String(resumo.inventarioPorTipo[t]).padStart(5)} / ${resumo.porTipo[t] || 0}`);
  const origem = (o) => (o ? `${o.ocorrencias.map((x) => `${curto(x.arquivo)}:${x.linha}${x.teste ? ' (teste)' : ''}`).join(', ')}${o.total > o.ocorrencias.length ? ` (+${o.total - o.ocorrencias.length})` : ''}` : 'não encontrado no código');
  console.log('\nTextos mais problemáticos:');
  for (const t of top) console.log(`  ${String(t.pontos).padStart(3)}  "${t.texto.slice(0, 90)}" [${[...new Set(t.regras)].join(' ')}] ${t.telas.length} tela(s)${indice ? `\n       ${origem(t.origem)}` : ''}`);
  console.log('\nAchados:');
  for (const g of grupos.filter((x) => !x.dado)) {
    console.log(`\n${g.regra} sev ${g.severidade} | ${g.tipos.join(', ')} | "${g.texto.slice(0, 120)}"${g.variantes ? ` (+${g.variantes.length - 1} variantes do mesmo template)` : ''}`);
    console.log(`   ${g.mensagem}${g.sugestao ? `\n   sugestão: ${g.sugestao}` : ''}`);
    console.log(`   telas (${g.telas.length}): ${g.telas.slice(0, 8).join(', ')}${g.telas.length > 8 ? ', …' : ''}`);
    if (indice) console.log(`   origem${g.origem && g.origem.trecho !== limpar(g.texto) ? ` (trecho "${g.origem.trecho}")` : ''}: ${origem(g.origem)}`);
  }
  const dados = grupos.filter((x) => x.dado);
  if (dados.length) {
    console.log(`\nProvável dado (a peça acusada não está no código; não é texto da interface): ${dados.length}`);
    for (const g of dados) console.log(`   ${g.regra} "${g.texto.slice(0, 90)}"${g.variantes ? ` (+${g.variantes.length - 1})` : ''}${g.origem ? ` · template em ${curto(g.origem.ocorrencias[0].arquivo)}:${g.origem.ocorrencias[0].linha}` : ''}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
