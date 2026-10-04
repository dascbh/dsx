#!/usr/bin/env node
// Página de escolha para o levantamento de texto de interface (skill ux-writing).
// Lê os casos com opções (JSON abaixo) e gera um HTML que mostra cada elemento renderizado no estado atual
// e em cada opção, com a convenção de origem, a recomendação, as telas e a origem no código.
// `renderTextPage` é reaproveitada por `findings.mjs page` (que acrescenta id, status e o formulário de decisão).
//
//   node tools/ux-lint/text-page.mjs <cases.json> <saida.html> [--title "Texto das telas"] [--product "AURIS"] [--color "#0E71B8"]
//
// cases.json: {"cases":[{"id","element","rule","severity","text","variants":[],"source":[],"screens":[],
//   "problem","options":[{"text","convention","note"}],"recommended":{"index","why"}}]}
// O formato antigo em pt-BR ({"casos":[{"elemento","regra","severidade","texto","variantes","origem","telas","problema",
//   "opcoes":[{"texto","convencao","nota"}],"recomendada":{"indice","porque"}}]}) é lido com aviso (lib/legacy.mjs).
// element: button | title | label | tooltip | helper | alert | tab | accessible-name | cell | menu | placeholder
// (os nomes antigos em pt-BR — botao, titulo, rotulo, dica, apoio, alerta, aba, nome-acessivel, celula — também valem).
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { normalizeCases } from './lib/legacy.mjs';

const ELEMENT_LABEL = {
  button: 'Botões', title: 'Títulos', label: 'Rótulos de campo', tooltip: 'Dicas (tooltip)', helper: 'Descrições e textos de apoio',
  alert: 'Alertas e mensagens', placeholder: 'Textos dentro do campo', tab: 'Abas', 'accessible-name': 'Nomes acessíveis', cell: 'Células de tabela', menu: 'Itens de menu',
  screen: 'Tela (estrutura)', flow: 'Fluxo', states: 'Estados', layout: 'Layout e hierarquia', consistency: 'Consistência entre telas',
};
const ELEMENT_ORDER = ['title', 'helper', 'button', 'label', 'placeholder', 'tooltip', 'alert', 'tab', 'menu', 'cell', 'accessible-name', 'screen', 'layout', 'states', 'consistency', 'flow'];
/** Nomes antigos (pt-BR) de elemento → nome atual. */
export const ELEMENT_ALIAS = {
  botao: 'button', title: 'title', rotulo: 'label', dica: 'tooltip', apoio: 'helper', alerta: 'alert', aba: 'tab',
  'nome-acessivel': 'accessible-name', celula: 'cell',
};
export const normalizeElement = (e) => ELEMENT_ALIAS[e] ?? e ?? 'accessible-name';
const RULE_LABEL = {
  X1: 'travessão', X1b: 'travessão como vazio', X2: 'título composto', X3: 'descrição redundante', X4: 'abertura vazia',
  X5: 'pontuação final', X6: 'botão longo ou sem verbo', X7: 'dica redundante ou longa', X8: 'placeholder repete rótulo',
  X9: 'parêntese explicativo', X10: 'Caixa De Título', X11: 'termo técnico', desc: 'descrição desnecessária',
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Renderiza o texto como o elemento aparece na tela, para comparar atual × opções com a mesma aparência. */
function sample(element, text) {
  if (text === '(remover)') return '<span class="removido">removido</span>';
  // Opção que descreve uma mudança (não é texto pronto) aparece como instrução, não como o elemento.
  if (/^(manter|mover|trocar|usar|selo|remover|substituir|mostrar|esconder|tirar|levar|deixar|separar|juntar|declarar|registrar|recolher|colocar|passar)\b/i.test(String(text)) || /["“].+["”]/.test(String(text))) {
    return `<span class="instr">${esc(text)}</span>`;
  }
  const t = esc(text);
  switch (normalizeElement(element)) {
    case 'button': return `<span class="btn">${t}</span>`;
    case 'title': return `<span class="tit">${t}</span>`;
    case 'label': return `<span class="campo"><span class="lbl">${t}</span><span class="inp"></span></span>`;
    case 'tooltip': return `<span class="dica-wrap"><span class="ico" aria-hidden="true">?</span><span class="dica">${t}</span></span>`;
    case 'helper': return `<span class="apoio">${t}</span>`;
    case 'alert': return `<span class="alerta">${t}</span>`;
    case 'tab': return `<span class="aba">${t}</span>`;
    case 'menu': return `<span class="menu">${t}</span>`;
    case 'placeholder': return `<span class="campo"><span class="inp ph">${t}</span></span>`;
    case 'cell': return `<span class="cel">${t || '&nbsp;'}</span>`;
    case 'screen': case 'flow': return `<span class="apoio">${t}</span>`;
    default: return `<code class="aria">${t}</code>`;
  }
}

const LETTER = (i) => String.fromCharCode(65 + i);

/** Figura de prévia: imagem (ou SVG) com alternância Antes | Depois e clique para ampliar. */
function figure(media, after, before, { label, note } = {}) {
  if (!after) return '';
  const toggle = before ? `<div class="pv-alt" role="group" aria-label="Comparar com hoje"><button type="button" data-show="b" aria-pressed="false">Antes</button><button type="button" data-show="a" aria-pressed="true">Depois</button></div>` : '';
  return `<figure class="pv">
          <button type="button" class="pv-zoom" aria-label="Ampliar: ${esc(after.alt)}"><span class="pv-a">${media(after.key, after.alt)}</span>${before ? `<span class="pv-b" hidden>${media(before.key, before.alt)}</span>` : ''}</button>
          ${after.type ? `<p class="pv-tipo">${esc(after.type)}</p>` : ''}${toggle}${label ? `<figcaption>${esc(label)}</figcaption>` : ''}${note ? `<p class="nota">${esc(note)}</p>` : ''}
        </figure>`;
}

function card(c, extra = {}, media = null) {
  const rec = c.recommended?.index;
  const pv = media ? c.preview : null;
  const before = pv?.before ?? null;
  const afterOf = (i) => (pv?.after ?? []).find((a) => a.option === i);
  const pvOption = (i) => {
    if (!pv) return '';
    if (pv.failed) return '';
    const a = afterOf(i);
    if (!a) return '';
    if (a.failed) return `<p class="pv-none">Sem prévia: ${esc(a.failed)}</p>`;
    if (a.omitted) return `<p class="pv-none">${esc(a.omitted)}</p>`;
    return figure(media, a, before, { note: a.note });
  };
  const ops = (c.options ?? []).map((o, i) => `
      <div class="op${i === rec ? ' rec' : ''}">
        <div class="op-cab"><span class="letra">${LETTER(i)}</span>${i === rec ? '<span class="selo">recomendada</span>' : ''}<span class="conv">${esc(o.convention)}</span></div>
        <div class="vis">${sample(c.element, o.text)}</div>
        ${pvOption(i)}
        ${o.note ? `<p class="nota">${esc(o.note)}</p>` : ''}
      </div>`).join('');
  const rule = pv && !pv.failed ? afterOf(null) : null;
  const ruleCol = rule ? `
      <div class="op regra-col">
        <div class="op-cab"><span class="letra">Correção indicada pela regra</span></div>
        ${rule.failed ? `<p class="pv-none">Sem prévia: ${esc(rule.failed)}</p>` : rule.omitted ? `<p class="pv-none">${esc(rule.omitted)}</p>` : figure(media, rule, before, { label: rule.label })}
      </div>` : '';
  const variants = (c.variants ?? []).filter((v) => v && v !== c.text);
  const hoje = pv
    ? (pv.failed ? `<p class="pv-none">Sem prévia: ${esc(pv.failed)}</p>`
      : before?.omitted ? `<p class="pv-none">${esc(before.omitted)}</p>`
        : before ? `<figure class="pv"><button type="button" class="pv-zoom" aria-label="Ampliar: ${esc(before.alt)}"><span class="pv-a">${media(before.key, before.alt)}</span></button></figure>` : '')
    : '';
  return `
  <article class="caso${pv && !pv.failed ? ' com-pv' : ''}" data-el="${esc(normalizeElement(c.element))}" data-sev="${c.severity ?? 0}" id="${esc(c.id)}">
    <header>
      <span class="sev s${c.severity ?? 0}" title="severidade ${c.severity ?? 0} de 4">${c.severity ?? 0}</span>
      <h3>${esc(c.problem)}</h3>
      <span class="regra">${esc(RULE_LABEL[c.rule] ?? c.rule)}</span>
      ${extra.header ? extra.header(c) : ''}
    </header>
    <div class="grade">
      <div class="op atual">
        <div class="op-cab"><span class="letra">Hoje</span></div>
        <div class="vis">${sample(c.element, c.text)}</div>
        ${hoje}
        ${variants.length ? `<p class="nota">Também: ${variants.slice(0, 4).map(esc).join(' · ')}${variants.length > 4 ? ' …' : ''}</p>` : ''}
      </div>
      ${ops}${ruleCol}
    </div>
    ${c.recommended?.why ? `<p class="porque"><strong>Por que a recomendada:</strong> ${esc(c.recommended.why)}</p>` : ''}
    <footer>
      <span>${(c.screens ?? []).length} tela(s): ${(c.screens ?? []).slice(0, 6).map((t) => `<span class="chip">${esc(String(t).replace(/^\d\d-|\.html$/g, ''))}</span>`).join('')}${(c.screens ?? []).length > 6 ? ' …' : ''}</span>
      <span class="origem">${(c.source ?? []).slice(0, 3).map((o) => `<code>${esc(String(o).replace(/^.*?(frontend|backend)\//, '$1/'))}</code>`).join(' ')}</span>
    </footer>
    ${extra.footer ? extra.footer(c) : ''}
  </article>`;
}

/** Tokens de cor e fonte (claro e escuro) das páginas geradas pelo ux-lint; a página de variações usa os mesmos. */
export const THEME_TOKENS = `:root{--bg:#F4F6F9;--surface:#FFFFFF;--fg:#1E2130;--muted:#5B6578;--line:#D5DCE6;--accent:#0E71B8;--accent-soft:#E8F1FA;--ok:#15803D;--ok-soft:#EAF7EF;--warn:#B45309;--warn-soft:#FFF6E5;--bad:#B91C1C;--bad-soft:#FDEEEE;
--sans:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;--serif:'Source Serif 4',Georgia,serif;--mono:ui-monospace,'SF Mono',Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0D1724;--surface:#142235;--fg:#E7EDF5;--muted:#9AA7B8;--line:#28405A;--accent:#5AA9E6;--accent-soft:#16324B;--ok:#4ADE80;--ok-soft:#13301F;--warn:#F0B45A;--warn-soft:#3A2A12;--bad:#F87171;--bad-soft:#3A1717;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0D1724;--surface:#142235;--fg:#E7EDF5;--muted:#9AA7B8;--line:#28405A;--accent:#5AA9E6;--accent-soft:#16324B;--ok:#4ADE80;--ok-soft:#13301F;--warn:#F0B45A;--warn-soft:#3A2A12;--bad:#F87171;--bad-soft:#3A1717;color-scheme:dark}`;

export const PAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PAGE_MAX_CASES = 60;
export const MAX_OUTPUT_FILES = 255;

/** Nome do arquivo da página n (1 = o próprio nome; depois `<nome>-2.html`…). */
export const pageFileName = (base, n) => (n === 1 ? base : base.replace(/(\.html?)?$/, (ext) => `-${n}${ext || '.html'}`));

const PREVIEW_STYLE = `
.caso.com-pv .grade{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.pv{margin:0;display:grid;gap:6px}
.pv-zoom{all:unset;cursor:zoom-in;display:block;border-radius:8px}
.pv-zoom:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pv img,.pv svg{display:block;max-width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff}
.pv svg{background:var(--surface)}
.pv figcaption{font-size:12px;color:var(--muted)}
.pv-tipo{margin:0;font-size:12px;font-weight:600;color:var(--fg);display:flex;gap:6px;align-items:center}.pv-tipo::before{content:'';width:8px;height:8px;border-radius:2px;background:var(--ok)}
.pv-alt{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;justify-self:start}
.pv-alt button{font:600 12px var(--sans);border:0;background:var(--surface);color:var(--fg);padding:5px 12px;min-height:32px;cursor:pointer}
.pv-alt button[aria-pressed="true"]{background:var(--accent);color:#fff}
.pv-alt button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.pv-none{margin:0;font-size:12.5px;color:var(--muted);border-left:3px solid var(--line);padding-left:8px}
.op.regra-col{border-style:dashed}
#pv-dlg{border:0;border-radius:12px;padding:12px;max-width:min(96vw,1500px);max-height:94vh;background:var(--surface);color:var(--fg)}
#pv-dlg::backdrop{background:rgba(8,12,20,.72)}
#pv-dlg .pv-dlg-body img,#pv-dlg .pv-dlg-body svg{display:block;max-width:100%;max-height:80vh;height:auto;margin:0 auto}
#pv-dlg .pv-dlg-cab{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:13px}
#pv-dlg button{font:600 13px var(--sans);border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:8px;padding:6px 12px;min-height:36px;cursor:pointer}
`;

const PREVIEW_SCRIPT = `
(function(){const d=document.getElementById('pv-data');let PV={};try{PV=d?JSON.parse(d.textContent):{};}catch(e){}
document.querySelectorAll('img[data-k]').forEach(i=>{if(PV[i.dataset.k])i.src=PV[i.dataset.k];});
document.querySelectorAll('.pv-alt').forEach(g=>{const f=g.closest('.pv');g.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const show=b.dataset.show;
g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));f.querySelector('.pv-a').hidden=show!=='a';f.querySelector('.pv-b').hidden=show!=='b';}));});
const dlg=document.getElementById('pv-dlg');if(!dlg)return;const body=dlg.querySelector('.pv-dlg-body'),cap=dlg.querySelector('.pv-dlg-cap');
document.querySelectorAll('.pv-zoom').forEach(z=>z.addEventListener('click',()=>{const vis=[...z.children].find(c=>!c.hidden);if(!vis)return;body.replaceChildren(vis.cloneNode(true));
const img=vis.querySelector('img');cap.textContent=img?img.alt:(z.getAttribute('aria-label')||'').replace(/^Ampliar: /,'');if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');}));
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});dlg.querySelector('.pv-fechar').addEventListener('click',()=>dlg.close());})();`;

/** Grupos de casos por tipo de elemento, na ordem da página. */
function groupCases(cases) {
  const el = (c) => normalizeElement(c.element);
  const byElement = Object.fromEntries(ELEMENT_ORDER.map((e) => [e, cases.filter((c) => el(c) === e)]));
  for (const c of cases) if (!ELEMENT_ORDER.includes(el(c))) (byElement[el(c)] ??= []).push(c);
  return Object.entries(byElement).filter(([, l]) => l.length);
}

/**
 * Divide os casos em páginas: por número de casos (`maxCases`) ou pelos bytes embutidos (`maxBytes`), o que
 * vier antes, mantendo a ordem dos grupos (um grupo grande atravessa páginas). `sizeOf(c, seen)` devolve os
 * bytes que o caso acrescenta à página (imagens ainda não usadas nela).
 */
export function paginate(cases, { maxCases = PAGE_MAX_CASES, maxBytes = PAGE_MAX_BYTES, sizeOf = () => 0, baseBytes = 120 * 1024 } = {}) {
  const ordered = groupCases(cases).flatMap(([, l]) => l);
  const pages = [];
  let cur = null;
  for (const c of ordered) {
    const add = cur ? sizeOf(c, cur.seen) + 6000 : 0;
    if (!cur || cur.cases.length >= maxCases || (cur.cases.length && cur.bytes + add > maxBytes)) {
      cur = { cases: [], bytes: baseBytes, seen: new Set() };
      pages.push(cur);
    }
    cur.bytes += sizeOf(c, cur.seen) + 6000;
    cur.cases.push(c);
  }
  if (!pages.length) pages.push({ cases: [], bytes: baseBytes, seen: new Set() });
  // última página com poucos casos volta para a anterior quando cabe (sem página de um caso só)
  if (pages.length > 1) {
    const last = pages.at(-1), prev = pages.at(-2);
    const extra = last.cases.reduce((n, c) => n + sizeOf(c, new Set(prev.seen)) + 6000, 0);
    if (last.cases.length <= Math.floor(maxCases * 0.15) && prev.bytes + extra <= maxBytes) { prev.cases.push(...last.cases); pages.pop(); }
  }
  return pages.map((p) => p.cases);
}

/**
 * Gera as páginas de escolha. Devolve [{ file, html, cases, bytes }].
 * opts: { title, product, color, eyebrow, lede, top, card: { header(c), footer(c) }, style, script, bottom,
 *         file (nome da 1ª página), previews: { dir, mode: 'embed'|'files', href(key) }, maxBytes, maxCases,
 *         paginate (false = uma página só), all_cases (contagem total quando `cases` é um recorte) }.
 */
export function renderTextPages(cases, opts = {}) {
  const title = opts.title ?? 'Texto das telas';
  const product = opts.product ?? '';
  const color = opts.color ?? '#0E71B8';
  const file = opts.file ?? 'page.html';
  const pv = opts.previews ?? null;
  const sizeOf = (c, seen) => {
    if (!pv || pv.mode !== 'embed' || !c.preview) return 0;
    let n = 0;
    for (const k of [c.preview.before?.key, ...(c.preview.after ?? []).map((a) => a.key)].filter(Boolean)) {
      if (seen.has(k)) continue;
      seen.add(k);
      n += pv.sizeOf(k);
    }
    return n;
  };
  const chunks = opts.paginate === false ? [cases] : paginate(cases, { maxCases: opts.maxCases ?? PAGE_MAX_CASES, maxBytes: opts.maxBytes ?? PAGE_MAX_BYTES, sizeOf });
  const nOps = cases.reduce((n, c) => n + (c.options?.length ?? 0), 0);
  const groupsOf = (l) => groupCases(l).map(([e]) => ELEMENT_LABEL[e] ?? e);
  const pageGroups = chunks.map(groupsOf);
  const nav = (n) => {
    if (chunks.length < 2) return '';
    const link = (i, text, rel) => `<a href="${esc(pageFileName(file, i))}"${i === n ? ' aria-current="page"' : ''}${rel ? ` rel="${rel}"` : ''}>${text}</a>`;
    return `<nav class="paginas" aria-label="Páginas">${n > 1 ? link(n - 1, '← Anterior', 'prev') : ''}<span class="lista">${chunks.map((_, i) => link(i + 1, `${i + 1} · ${esc(pageGroups[i][0] ?? '')}${pageGroups[i].length > 1 ? ` → ${esc(pageGroups[i].at(-1))}` : ''}`)).join('')}</span>${n < chunks.length ? link(n + 1, 'Próxima →', 'next') : ''}</nav>`;
  };
  const indexBlock = chunks.length > 1
    ? `<ol class="indice">${chunks.map((l, i) => `<li><a href="${esc(pageFileName(file, i + 1))}">Página ${i + 1}</a>: ${l.length} caso(s) · ${esc(pageGroups[i].join(', '))}</li>`).join('')}</ol>`
    : '';
  return chunks.map((pageCases, idx) => {
    const n = idx + 1;
    const used = new Map();
    const media = pv ? (key, alt) => {
      if (pv.mode === 'files') return `<img src="${esc(pv.href(key))}" alt="${esc(alt)}" loading="lazy">`;
      const e = pv.embedded(key);
      if (!e) return `<span class="pv-none">imagem ausente (${esc(key)})</span>`;
      if (e.svg) { const uid = `${n}-${used.size}-${Math.random().toString(36).slice(2, 7)}`; used.set(`svg:${uid}`, 0); return e.svg.replace(/\ba-(new|n)\b/g, `a-$1-${uid}`).replace('<svg ', `<svg aria-label="${esc(alt)}" `); }
      if (!used.has(key)) used.set(key, e.uri);
      return `<img data-k="${esc(key)}" alt="${esc(alt)}">`;
    } : null;
    const groups = groupCases(pageCases);
    const sections = groups.map(([e, l]) => `
  <section data-sec="${esc(e)}"><h2>${esc(ELEMENT_LABEL[e] ?? e)} <small>${l.length}</small></h2>${l.map((c) => card(c, opts.card, media)).join('')}</section>`).join('');
    const filters = groups.map(([e, l]) => `<button type="button" class="f" data-f="${esc(e)}" aria-pressed="false">${esc(ELEMENT_LABEL[e] ?? e)} <small>${l.length}</small></button>`).join('');
    const data = [...used].filter(([k, v]) => !k.startsWith('svg:') && v);
    const dataScript = data.length ? `<script type="application/json" id="pv-data">${JSON.stringify(Object.fromEntries(data)).replace(/</g, '\\u003c')}</script>` : '';
    // página principal: só o nome (é o título do artefato); demais páginas são documentos completos servidos
    // sem esqueleto, com doctype, charset e viewport próprios
    const head = n === 1 ? '' : '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';
    const html = `${head}<title>${esc(title)}${n > 1 ? ` · página ${n} de ${chunks.length}` : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">
<style>
/* Layout: lista de casos por tipo de elemento; cada caso compara "hoje" e as opções lado a lado, renderizadas como na tela. */
${THEME_TOKENS}
*{box-sizing:border-box}body{background:var(--bg);color:var(--fg);font:14px/1.5 var(--sans);margin:0}
.pg{max-width:1280px;margin:0 auto;padding:28px 20px 72px;display:grid;gap:24px}
.topo{display:grid;gap:8px}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
h1{margin:0;font:600 30px/1.15 var(--serif);text-wrap:balance}.lede{margin:0;color:var(--muted);max-width:75ch}
.nums{display:flex;flex-wrap:wrap;gap:8px 20px;color:var(--muted);font-variant-numeric:tabular-nums}.nums b{color:var(--fg)}
.filtros{display:flex;flex-wrap:wrap;gap:8px;position:sticky;top:env(safe-area-inset-top,0px);background:var(--bg);padding:8px 0;z-index:2}
.f{font:500 13px var(--sans);border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:999px;padding:6px 12px;cursor:pointer}
.f[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}.f small{opacity:.7}
.f:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
section{display:grid;gap:14px}section h2{margin:12px 0 0;font:600 20px var(--serif)}section h2 small{font:500 13px var(--sans);color:var(--muted)}
.caso{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;display:grid;gap:12px}
.caso header{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.caso h3{margin:0;font-size:15px;font-weight:600;flex:1;min-width:240px}
.regra{font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:1px 8px}
.sev{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;flex:none}
.s0,.s1{background:var(--accent-soft);color:var(--accent)}.s2{background:var(--warn-soft);color:var(--warn)}.s3,.s4{background:var(--bad-soft);color:var(--bad)}
.grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.op{border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:grid;gap:8px;align-content:start;min-width:0}
.op.atual{background:color-mix(in srgb,var(--bad-soft) 55%,var(--surface))}.op.rec{border-color:var(--ok);box-shadow:inset 0 0 0 1px var(--ok)}
.op-cab{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12px}.letra{font-weight:700}.selo{background:var(--ok-soft);color:var(--ok);border-radius:999px;padding:0 8px;font-weight:600}
.conv{color:var(--muted)}.nota{margin:0;font-size:12.5px;color:var(--muted)}.porque{margin:0;font-size:13px}
.vis{min-height:44px;display:flex;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}
.caso footer{display:flex;flex-wrap:wrap;gap:6px 16px;justify-content:space-between;font-size:12px;color:var(--muted)}
.chip{display:inline-block;border:1px solid var(--line);border-radius:6px;padding:0 6px;margin:2px 4px 0 0}.origem code{font:11.5px var(--mono);overflow-wrap:anywhere}
/* amostras no estilo do produto (cor primária do produto via --cor) */
.btn{display:inline-block;background:${color};color:#fff;font-weight:600;font-size:14px;border-radius:10px;padding:7px 16px}
.tit{font-size:20px;font-weight:700;letter-spacing:-.01em}
.campo{display:grid;gap:4px;width:100%}.lbl{font-size:12px;font-weight:600;color:${color}}.inp{height:34px;border:1.5px solid ${color}66;border-radius:10px;background:var(--surface)}
.inp.ph{display:flex;align-items:center;padding:0 10px;color:var(--muted);font-size:13px}
.instr{font-size:13px;line-height:1.45;border-left:3px solid var(--line);padding-left:8px}
.dica-wrap{display:inline-flex;gap:8px;align-items:center}.ico{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--muted);display:grid;place-items:center;font-size:12px;color:var(--muted);flex:none}
.dica{background:#333A47;color:#fff;font-size:12px;border-radius:6px;padding:5px 8px;max-width:260px}
.apoio{font-size:12.5px;color:var(--muted)}.alerta{background:#FFFBEB;color:#B45309;border:1px solid #FEF3C7;border-radius:10px;padding:8px 10px;font-size:13px}
.aba{font-weight:600;color:${color};border-bottom:2px solid ${color};padding:6px 4px}.menu{font-size:14px;padding:6px 10px;border-left:3px solid ${color};background:${color}14}
.cel{display:inline-block;min-width:120px;border:1px solid var(--line);padding:6px 10px;font-size:14px}.aria{font:12px var(--mono);background:var(--accent-soft);padding:2px 6px;border-radius:4px}
.removido{font-size:12.5px;color:var(--ok);font-weight:600;text-decoration:line-through;text-decoration-color:transparent}
.removido::before{content:"✕ ";}
@media (max-width:640px){.pg{padding:20px 16px 56px}h1{font-size:24px}}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
${pv ? PREVIEW_STYLE : ''}
.paginas{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:13px}
.paginas a{color:var(--accent);text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:4px 10px;background:var(--surface)}
.paginas a[aria-current="page"]{background:var(--accent);color:#fff;border-color:var(--accent)}
.paginas a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.paginas .lista{display:flex;flex-wrap:wrap;gap:6px}
.indice{margin:0;padding-left:20px;display:grid;gap:4px;font-size:13px}
${opts.style ?? ''}
</style>
<div class="pg">
  <div class="topo">
    <div class="eyebrow">${esc(opts.eyebrow ?? 'Levantamento de texto de interface')} · ${esc(product)}</div>
    <h1>${esc(title)}</h1>
    ${n === 1 ? `<p class="lede">${esc(opts.lede ?? 'Cada caso mostra o elemento como aparece hoje e as opções de texto, renderizadas no mesmo estilo. A etiqueta de cada opção diz de que convenção ela vem. A origem no código indica onde corrigir.')}</p>` : ''}
    <div class="nums"><span><b>${cases.length}</b> casos</span><span><b>${nOps}</b> opções</span><span><b>${cases.filter((c) => (c.severity ?? 0) >= 2).length}</b> de severidade 2 ou mais</span><span><b>${new Set(cases.flatMap((c) => c.screens ?? [])).size}</b> telas afetadas</span>${chunks.length > 1 ? `<span>página <b>${n}</b> de ${chunks.length} (${pageCases.length} casos)</span>` : ''}</div>
    ${opts.top ?? ''}
    ${n === 1 ? indexBlock : ''}
    ${nav(n)}
  </div>
  <div class="filtros" role="group" aria-label="Filtrar por elemento">${filters}</div>
  ${sections}
  ${nav(n)}
  ${opts.bottom ?? ''}
</div>
${pv ? '<dialog id="pv-dlg" aria-label="Imagem ampliada"><div class="pv-dlg-cab"><span class="pv-dlg-cap"></span><button type="button" class="pv-fechar">Fechar</button></div><div class="pv-dlg-body"></div></dialog>' : ''}
${dataScript}
<script>
const fs=[...document.querySelectorAll('.f')];
fs.forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';fs.forEach(x=>x.setAttribute('aria-pressed','false'));if(on)b.setAttribute('aria-pressed','true');
document.querySelectorAll('section[data-sec]').forEach(s=>{s.hidden=on&&s.dataset.sec!==b.dataset.f;});}));
${pv ? PREVIEW_SCRIPT : ''}
${opts.script ?? ''}
</script>`;
    return { file: pageFileName(file, n), html, cases: pageCases, bytes: Buffer.byteLength(html) };
  });
}

/** Uma página só (compatível com a versão anterior). */
export function renderTextPage(cases, opts = {}) {
  return renderTextPages(cases, { ...opts, paginate: false })[0].html;
}

/** Ordena por severidade × telas (maior primeiro), como a CLI faz. */
export const sortCases = (cases) => cases.sort((p, q) => (q.severity ?? 0) * (q.screens?.length ?? 1) - (p.severity ?? 0) * (p.screens?.length ?? 1));

function main() {
  const a = parseCli('ux-lint/text-page.mjs');
  const [input, output] = a._;
  if (!input || !output) {
    console.error('Uso: node tools/ux-lint/text-page.mjs <cases.json> <saida.html> [--title "…"] [--product "…"] [--color "#hex"]');
    process.exit(2);
  }
  const { data, warnings } = normalizeCases(JSON.parse(readFileSync(input, 'utf8')));
  for (const w of warnings) console.error(`AVISO ${input}: ${w}`);
  const cases = Array.isArray(data) ? data : data.cases ?? [];
  sortCases(cases);
  writeFileSync(output, renderTextPage(cases, { title: a.title ?? 'Texto das telas', product: a.product ?? '', color: a.color ?? '#0E71B8' }));
  console.log(`${output} · ${cases.length} casos`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
