// Página de comparação de variações de UX (variations.mjs page), feita para decidir em 2 minutos: primeiro a
// resposta, depois o detalhe. Topo = a pergunta e um resumo Hoje | A | B | C (ideia, tela principal, 4 números
// contra hoje, o que ganha e o que custa). Depois uma versão por vez, em abas, com passo a passo tipo apresentação
// (tela recortada no conteúdo, legenda, antes/depois do comportamento e "Comparar com hoje"). Detalhes recolhidos em
// linguagem simples; ids e nomes de regra só como âncora. Decisão no fim, com "Misturar" recolhido. Mesmos tokens
// da página de achados (text-page.mjs). Sem dependências e sem navegador: as imagens já vêm prontas
// (variations.mjs shootCaptures).
import { THEME_TOKENS, pageFileName } from '../text-page.mjs';
import { embedded, embeddedSize } from './preview-page.mjs';

export const PAGE_MAX_BYTES = 10 * 1024 * 1024;
const AXES = ['screen', 'flow', 'behavior', 'text'];
const AXIS_PT = { screen: 'Tela', flow: 'Fluxo', behavior: 'Comportamento', text: 'Texto' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, '-');
const lowerFirst = (s) => String(s ?? '').replace(/^\p{Lu}(?!\p{Lu})/u, (c) => c.toLowerCase());
/** Tira o "Antes:"/"Depois:" do começo da legenda (a página já diz qual é qual). */
const bare = (s) => String(s ?? '').replace(/^\s*(antes|depois)\s*[:,-]\s*/i, '').replace(/^\p{Ll}/u, (c) => c.toUpperCase());

/** Letra de exibição: o id quando é uma letra, senão A, B, C pela ordem. */
export const letterOf = (row, i) => (row.is_current ? 'Hoje' : /^[a-z]$/i.test(row.id) ? row.id.toUpperCase() : String.fromCharCode(65 + i));

/**
 * Passos de uma linha: frames consecutivos do mesmo `step` formam um grupo. Frame de comportamento vira par
 * antes → ação → depois; os frames citados como antes/depois no mesmo passo não aparecem de novo sozinhos.
 */
export function groupsOf(row) {
  const frames = row.frames ?? [];
  const byId = new Map(frames.map((f) => [f.id, f]));
  const folded = new Set();
  for (const f of frames) {
    if (f.kind !== 'behavior') continue;
    for (const k of ['before', 'after']) { const t = byId.get(f.behavior?.[k]); if (t && t !== f && t.step === f.step && t.kind !== 'behavior') folded.add(t.id); }
  }
  const groups = [];
  for (const f of frames) {
    if (folded.has(f.id)) continue;
    let g = groups.at(-1);
    if (!g || g.step !== f.step) { g = { step: f.step, cells: [] }; groups.push(g); }
    g.cells.push(f.kind === 'behavior'
      ? { type: 'behavior', frame: f, before: byId.get(f.behavior?.before) ?? null, after: byId.get(f.behavior?.after) ?? f, action: f.behavior?.action ?? '' }
      : { type: 'frame', frame: f });
  }
  return groups;
}

/** Slides do passo a passo: uma por célula (frame ou par antes/depois), com o nome do passo. */
export const slidesOf = (row) => groupsOf(row).flatMap((g) => g.cells.map((cell) => ({ step: g.step, cell })));

/**
 * Tela principal da linha (imagem do resumo): `hero` do manifesto; senão o frame `screen` sem diálogo aberto com
 * mais palavras (medidas); senão o primeiro.
 */
export function heroOf(row, frames = {}) {
  const fs = row.frames ?? [];
  const pick = fs.find((f) => f.id === row.hero);
  if (pick) return pick;
  const screens = fs.filter((f) => f.kind === 'screen' && !frames[f.id]?.dialog_open);
  const pool = screens.length ? screens : fs;
  return pool.reduce((best, f) => (!best || (frames[f.id]?.words ?? 0) > (frames[best.id]?.words ?? 0) ? f : best), null);
}

/**
 * Slide de hoje equivalente ao slide `i` de `n` de uma variante: `compare_to` do frame (id de um frame de hoje);
 * senão o mesmo nome de passo; senão a posição proporcional.
 */
export function todaySlideFor(slide, i, n, todaySlides) {
  if (!todaySlides.length) return -1;
  const ids = (s) => [s.cell.frame?.id, s.cell.before?.id, s.cell.after?.id].filter(Boolean);
  const want = slide.cell.frame?.compare_to ?? slide.cell.after?.compare_to ?? slide.cell.before?.compare_to;
  if (want) { const k = todaySlides.findIndex((t) => ids(t).includes(want)); if (k >= 0) return k; }
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const k = todaySlides.findIndex((t) => norm(t.step) === norm(slide.step));
  if (k >= 0) return k;
  return n <= 1 ? 0 : Math.round((i * (todaySlides.length - 1)) / (n - 1));
}

/** Diferença contra hoje. `higher`: mais é melhor (problemas resolvidos); senão menos é melhor. */
export function delta(cur, val, higher = false) {
  const c = Number(cur), v = Number(val);
  if (!Number.isFinite(c) || !Number.isFinite(v)) return { kind: 'na', text: '—' };
  const d = Math.round((v - c) * 10) / 10;
  if (d === 0) return { kind: 'same', text: '=', sr: 'igual a hoje' };
  const better = higher ? d > 0 : d < 0;
  if (higher) return better ? { kind: 'better', text: `▲ ${d}`, sr: `${d} a mais que hoje, melhor` } : { kind: 'worse', text: `▼ ${Math.abs(d)}`, sr: `${Math.abs(d)} a menos que hoje, pior` };
  return better ? { kind: 'better', text: `▼ ${Math.abs(d)}`, sr: `${Math.abs(d)} a menos que hoje, melhor` } : { kind: 'worse', text: `▲ ${d}`, sr: `${d} a mais que hoje, pior` };
}

/** Os quatro números do resumo. */
export const kpisOf = (m) => [
  { key: 'steps', label: 'Telas', noun: 'telas' },
  { key: 'clicks_to_done', label: m.done_label ? `Cliques até ${m.done_label}` : 'Cliques até concluir', noun: m.done_label ? `cliques até ${m.done_label}` : 'cliques até concluir' },
  { key: 'words_on_screen', label: 'Palavras por tela', noun: 'palavras por tela' },
  { key: 'resolved', label: 'Problemas resolvidos', noun: 'problemas resolvidos', higher: true },
];

/**
 * Quem lidera cada número entre as variantes (só conta quem é melhor que hoje). values: rowId → { kpi: número }.
 * Devolve { best: { kpi: Set(rowId) }, sentence }.
 */
export function leaders(rows, values, kpis, letters) {
  const [cur, ...vars] = rows;
  const best = {};
  const wins = new Map();
  for (const k of kpis) {
    const nums = vars.map((r) => Number(values[r.id]?.[k.key])).filter(Number.isFinite);
    if (!nums.length) continue;
    const top = k.higher ? Math.max(...nums) : Math.min(...nums);
    const c = Number(values[cur.id]?.[k.key]);
    if (Number.isFinite(c) && (k.higher ? top <= c : top >= c)) continue;
    best[k.key] = new Set(vars.filter((r) => Number(values[r.id]?.[k.key]) === top).map((r) => r.id));
    for (const id of best[k.key]) { if (!wins.has(id)) wins.set(id, []); wins.get(id).push(k.noun); }
  }
  const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs.at(-1)}`);
  const parts = [...wins.entries()].sort((a, b) => b[1].length - a[1].length).map(([id, ks]) => `${letters.get(id)} em ${list(ks)}`);
  const sentence = parts.length ? `Quem lidera cada número: ${parts.join('; ')}.` : 'Nenhuma versão melhora os números de hoje.';
  return { best, sentence };
}

// Problemas em português: regra → frase simples (sem nome de regra nem termo de ferramenta). Regra fora daqui usa o
// resumo da regra no catálogo (data/ux-dimensions.json, rules_index).
const PLAIN = {
  X1: 'Travessão usado como pausa no texto', X1b: 'Travessão no lugar de um valor vazio', X2: 'Dois textos colados por um separador',
  X3: 'Texto de apoio que só repete o título', X4: 'Abertura vazia, que não diz nada', X5: 'Ponto final em rótulo, botão ou título',
  X6: 'Botão com texto longo ou sem verbo', X7: 'Dica que repete o texto visível', X8: 'Campo com exemplo que só repete o rótulo',
  X9: 'Explicação entre parênteses em título ou botão', X10: 'Maiúsculas Em Todas As Palavras', X11: 'Termo técnico na tela',
  T1: 'Mais de um botão principal na mesma área', T2: 'Botões do diálogo na ordem trocada', T3: 'Tela sem um título principal',
  T4: 'Campo sem rótulo', T5: 'Ação que apaga com rótulo vago (OK, Sim)', T6: 'Palavra que o produto proíbe na tela', T7: 'Botão que não diz o que faz',
  F1: 'Tela sem saída', F2: 'Tela fora dos caminhos conhecidos', F3: 'Passos demais até concluir', F4: 'Diálogo aberto sobre outro diálogo', F5: 'Tela sem caminho de volta',
  L1: 'O botão principal fica fora do lugar esperado', L2: 'Muitos elementos disputando atenção no topo', L3: 'Títulos em tamanhos fora de ordem',
  L4: 'Campos e colunas desalinhados', L5: 'Rótulo longe do campo ou grupo espalhado', L6: 'O botão principal só aparece rolando a página',
  L7: 'Linha de texto longa demais para ler', L8: 'Área de clique pequena demais', L9: 'Falta uma área esperada para este tipo de tela',
  S1: 'Falta a tela de um estado (vazio, erro, carregando)', S2: 'Tela vazia ou de erro sem saída', S3: 'Erro que não diz o que fazer',
  C1: 'A mesma ação com nomes diferentes entre telas', C2: 'O mesmo botão com aparências diferentes', C3: 'O mesmo conceito com nomes diferentes',
};
const quoted = (s) => /"([^"]+)"/.exec(String(s ?? ''))?.[1] ?? null;
const fill = (s) => String(s ?? '').replace(/\{\}/g, '…').trim();

/** Frase em português de um achado do registro (ou de um achado novo do lint). `rules`: rules_index do catálogo. */
export function plainFinding(it, { rules = {}, where = '' } = {}) {
  if (!it) return 'Problema fora do registro';
  let s;
  if (it.origin === 'review' || it.rule === 'desc' || /^H\d/.test(String(it.rule))) s = it.message || fill(it.text);
  else {
    const base = PLAIN[it.rule] ?? rules[it.rule]?.summary_pt ?? it.message ?? fill(it.text);
    const q = it.family === 'text' ? fill(it.anchor ?? it.text) : quoted(it.anchor ?? it.text) ?? quoted(it.message);
    const cut = q && it.rule === 'L7' ? `${q.trim()}…` : q;
    s = cut ? `${base}: "${fill(cut)}"` : base;
  }
  s = String(s).trim().replace(/\.$/, '');
  return where ? `${s} (${where})` : s;
}

/** Selo de um achado que a variante diz resolver: resolvido, continua ou precisa conferir (com o que conferir). */
export function badgeOf(st, { similar = [] } = {}) {
  if (!st) return { kind: 'check', label: 'precisa conferir', why: 'Sem medição automática: confira na tela.' };
  if (st.status === 'resolved' && !st.suspect) return { kind: 'ok', label: 'resolvido', why: '' };
  if (st.status === 'resolved') {
    const q = [...new Set(similar.map((x) => quoted(x.anchor) ?? fill(x.anchor)).filter(Boolean))].slice(0, 2);
    return { kind: 'check', label: 'precisa conferir', why: q.length ? `Saiu daqui, mas o mesmo tipo de problema aparece nesta versão em "${q.join('", "')}": confira se é aceitável.` : 'O mesmo tipo de problema aparece em outro ponto desta versão: confira na tela.' };
  }
  if (st.status === 'persists') return { kind: 'bad', label: 'continua', why: 'Ainda aparece nesta versão.' };
  const fam = st.family;
  const why = /fora do registro/.test(st.reason ?? '') ? 'Este problema não está no registro do módulo.'
    : fam === 'flow' ? 'Depende do caminho entre as telas: confira no passo a passo.'
    : fam === 'consistency' ? 'Depende de comparar telas entre si: confira no passo a passo.'
    : fam === 'layout' ? 'A posição na tela não foi medida: confira na imagem.'
    : 'Apontado em revisão: confira lendo a tela.';
  return { kind: 'check', label: 'precisa conferir', why };
}

const firstSentence = (s) => {
  const t = String(s ?? '').trim();
  const m = /^(.+?[.;!?])\s+(?=[\p{Lu}0-9])/u.exec(t);
  return m ? [m[1], t.slice(m[0].length)] : [t, ''];
};
const clip = (s, n = 110) => { const t = String(s ?? '').trim(); if (t.length <= n) return t; const c = t.slice(0, n); return `${c.slice(0, c.lastIndexOf(' ') > 40 ? c.lastIndexOf(' ') : n).replace(/[,;:]$/, '')}…`; };

function imagesOf(row, shots) {
  const keys = [];
  for (const f of row.frames ?? []) { const s = shots.get(f.capture); if (s?.content) keys.push(s.content); }
  return [...new Set(keys)];
}

/** Páginas: todas as linhas numa só; se passar de `maxBytes`, Hoje em todas e as variantes distribuídas. */
export function paginateRows(rows, { shots = new Map(), sizeOf = () => 0, maxBytes = PAGE_MAX_BYTES, baseBytes = 160 * 1024 } = {}) {
  const size = (r, seen) => imagesOf(r, shots).reduce((n, k) => (seen.has(k) ? n : (seen.add(k), n + sizeOf(k))), 0);
  const [cur, ...vars] = rows;
  const all = new Set();
  if (baseBytes + rows.reduce((n, r) => n + size(r, all), 0) <= maxBytes) return [rows];
  const pages = [];
  let page = null;
  for (const v of vars) {
    const add = page ? size(v, new Set(page.seen)) : 0;
    if (!page || (page.rows.length > 1 && page.bytes + add > maxBytes)) {
      const seen = new Set();
      page = { rows: [cur], seen, bytes: baseBytes + size(cur, seen) };
      pages.push(page);
    }
    page.bytes += size(v, page.seen);
    page.rows.push(v);
  }
  return pages.length ? pages.map((p) => p.rows) : [rows];
}

/**
 * Gera as páginas. Devolve [{ file, html, bytes }].
 * opts: { lint, measured: { rowId: { metrics, divergences, frames } }, registry (Map), shots (Map captura →
 *         { content, width, height }), shotsDir, file, product, findings_page, warnings, maxBytes, dsx_rel,
 *         catalogs ({ archetype_cards, pattern_cards, law_cards, rules }), rows (opcional, para testes) }.
 */
export function renderVariationsPages(m, opts = {}) {
  const rows = opts.rows ?? [{ ...(m.current ?? {}), id: m.current?.id ?? 'current', is_current: true }, ...(m.variants ?? []).map((v) => ({ ...v, is_current: false }))];
  const shots = opts.shots ?? new Map();
  const dir = opts.shotsDir ?? '.';
  const file = opts.file ?? 'variations.html';
  const registry = opts.registry ?? new Map();
  const lint = opts.lint ?? null;
  const cat = opts.catalogs ?? {};
  const rules = cat.rules ?? {};
  const letters = new Map(rows.map((r, i) => [r.id, letterOf(r, i - 1)]));
  const cur = rows[0];
  const chunks = paginateRows(rows, { shots, sizeOf: (k) => embeddedSize(dir, k), maxBytes: opts.maxBytes ?? PAGE_MAX_BYTES });
  const storeKey = `dsx-variations:${m.module}:${m.flow}`;
  const cited = [...new Set(rows.flatMap((r) => r.resolves ?? []))];
  const kpis = kpisOf(m);
  const question = m.question || `Como ${lowerFirst(m.title)} com menos trabalho?`;
  // passo de hoje onde cada tela capturada aparece (para dizer "hoje em Destinatários")
  const stepOfScreen = new Map((cur.frames ?? []).map((f) => [String(f.capture ?? '').split('/').pop().replace(/\..*$/, ''), f.step]));
  const whereToday = (it) => { const s = [...new Set((it?.screens ?? []).map((x) => stepOfScreen.get(x)).filter(Boolean))]; return s.length ? `hoje em ${s.join(', ')}` : ''; };
  const resolvedCount = (r) => (r.is_current ? 0 : (r.resolves ?? []).length - (lint?.variants?.[r.id]?.resolves ?? []).filter((x) => x.status === 'persists').length);
  const values = Object.fromEntries(rows.map((r) => [r.id, { ...(r.metrics ?? {}), resolved: resolvedCount(r) }]));
  const lead = leaders(rows, values, kpis, letters);
  const heroes = new Map(rows.map((r) => [r.id, heroOf(r, opts.measured?.[r.id]?.frames ?? {})]));
  const todaySlides = slidesOf(cur);

  return chunks.map((pageRows, idx) => {
    const n = idx + 1;
    const onPage = new Set(pageRows.map((r) => r.id));
    const used = new Map();
    const use = (k) => { if (!used.has(k)) { const e = embedded(dir, k); if (e?.uri) used.set(k, e.uri); } return k; };
    const shotOf = (f) => (f ? shots.get(f.capture) : null);
    /** Imagem ampliável de um frame. `cap`: legenda da tela cheia. */
    const img = (f, cap, cls = 'shot') => {
      const s = shotOf(f);
      if (!s) return `<span class="${cls} sem" role="img" aria-label="${esc(cap)}"><span>${esc(f?.caption ?? f?.id ?? '')}</span><small>sem imagem</small></span>`;
      return `<button type="button" class="z ${cls}" data-full="${esc(use(s.content))}" data-cap="${esc(cap)}" aria-label="Ampliar: ${esc(cap)}"><img data-k="${esc(s.content)}" alt="${esc(cap)}" width="${esc(s.width ?? 1220)}" height="${esc(s.height ?? 800)}" loading="lazy" decoding="async"></button>`;
    };
    const nameOf = (r) => (r.is_current ? 'Como é hoje' : r.name);
    const labelOf = (r) => (r.is_current ? 'Hoje' : `${letters.get(r.id)} · ${r.name}`);

    // ---------- resumo ----------
    const kpiHtml = (r) => kpis.map((k) => {
      const v = values[r.id]?.[k.key];
      const d = r.is_current ? null : delta(values[cur.id]?.[k.key], v, k.higher);
      const of = k.key === 'resolved' && cited.length ? `<small> de ${cited.length}</small>` : '';
      const isBest = lead.best[k.key]?.has(r.id);
      return `<div class="kpi"><dt>${esc(k.label)}</dt><dd><b>${esc(v ?? '—')}</b>${of}${d ? ` <span class="d d-${d.kind}" aria-hidden="true">${esc(d.text)}</span><span class="sr">${esc(d.sr ?? '')}</span>` : ''}${isBest ? ' <span class="best">melhor</span>' : ''}</dd></div>`;
    }).join('');
    const gainOf = (r) => r.gain || (r.is_current ? 'Já existe: nada a construir.' : clip(firstSentence(r.hypothesis)[0]));
    const costOf = (r) => r.cost || (r.is_current ? `${cited.length} problema${cited.length === 1 ? '' : 's'} de hoje continua${cited.length === 1 ? '' : 'm'}.` : clip((r.tradeoffs ?? [])[0] ?? ''));
    const summaryCard = (r) => {
      const h = heroes.get(r.id);
      const hero = h ? img(h, `${labelOf(r)} · ${h.step}`, 'hero') : '';
      const link = onPage.has(r.id) ? `#v-${slug(r.id)}` : `${pageFileName(file, chunks.findIndex((c) => c.some((x) => x.id === r.id)) + 1)}#v-${slug(r.id)}`;
      return `<article class="rc${r.is_current ? ' hoje' : ''}" aria-labelledby="rc-${esc(slug(r.id))}">
  <header><span class="letra">${esc(letters.get(r.id))}</span><div><h2 id="rc-${esc(slug(r.id))}">${esc(nameOf(r))}</h2><p class="ideia">${esc(r.is_current ? (r.concept || `${groupsOf(r).length} passos, do jeito que funciona hoje.`) : r.concept)}</p></div></header>
  ${hero || '<span class="hero sem"></span>'}
  <dl class="kpis">${kpiHtml(r)}</dl>
  <p class="gc ganha"><strong>Ganha</strong> ${esc(gainOf(r))}</p>
  <p class="gc custa"><strong>Custa</strong> ${esc(costOf(r))}</p>
  <a class="ver" href="${esc(link)}" data-goto="${esc(r.id)}">Ver passo a passo</a>
</article>`;
    };

    // ---------- passo a passo ----------
    const slideHtml = (r, s, i, total) => {
      const c = s.cell;
      const L = labelOf(r);
      const main = c.type === 'behavior'
        ? `<div class="par">${c.before ? `<figure><figcaption class="tag">Antes</figcaption>${img(c.before, `${L} · ${s.step} · antes`)}${c.before.caption ? `<p class="sub">${esc(bare(c.before.caption))}</p>` : ''}</figure>` : ''}
           <p class="acao"><span aria-hidden="true">↓</span> ${esc(c.action || 'ação')}</p>
           <figure><figcaption class="tag tag-depois">Depois</figcaption>${img(c.after, `${L} · ${s.step} · depois`)}</figure></div>`
        : `<figure>${img(c.frame, `${L} · ${s.step}`)}</figure>`;
      let cmp = '';
      if (!r.is_current) {
        const k = todaySlideFor(s, i, total, todaySlides);
        const t = todaySlides[k];
        const tf = t ? (t.cell.type === 'behavior' ? t.cell.after : t.cell.frame) : null;
        const vf = c.type === 'behavior' ? c.after : c.frame;
        cmp = `<div class="cmp" hidden><figure><figcaption class="tag tag-hoje">Hoje${t ? ` · ${esc(t.step)}` : ''}</figcaption>${tf ? img(tf, `Hoje · ${t.step}`) : '<p class="nota">Hoje não tem passo equivalente.</p>'}${tf?.caption ? `<p class="sub">${esc(bare(tf.caption))}</p>` : ''}</figure>
          <figure><figcaption class="tag">${esc(letters.get(r.id))} · ${esc(s.step)}</figcaption>${img(vf, `${L} · ${s.step}`)}${vf?.caption ? `<p class="sub">${esc(bare(vf.caption))}</p>` : ''}</figure></div>`;
      }
      const legend = c.type === 'behavior' ? bare(c.frame.caption ?? c.after?.caption) : c.frame.caption;
      return `<li class="slide" data-i="${i}" data-step="${esc(s.step)}"${i ? ' hidden' : ''}><div class="palco">${main}</div>${cmp}${legend ? `<p class="legenda">${esc(legend)}</p>` : ''}</li>`;
    };
    const deck = (r) => {
      const slides = slidesOf(r);
      const total = slides.length;
      return `<div class="deck" data-row="${esc(r.id)}" data-n="${total}">
  <div class="barra">
    <p class="ind" aria-live="polite"><span class="ind-n">Passo 1 de ${total}</span> · <b class="ind-s">${esc(slides[0]?.step ?? '')}</b></p>
    <div class="bts"><button type="button" data-mv="-1" aria-label="Passo anterior">← Anterior</button><button type="button" data-mv="1" aria-label="Próximo passo">Próximo →</button>${r.is_current ? '' : '<button type="button" class="bt-cmp" aria-pressed="false">Comparar com hoje</button>'}</div>
  </div>
  <ol class="trilha" aria-label="Passos">${slides.map((s, i) => `<li><button type="button" data-go="${i}"${i ? '' : ' aria-current="step"'}><span>${i + 1}</span> ${esc(s.step)}</button></li>`).join('')}</ol>
  <ol class="slides">${slides.map((s, i) => slideHtml(r, s, i, total)).join('')}</ol>
</div>`;
    };

    const problemItem = (id, st, fresh = []) => {
      const it = registry.get(id);
      const b = badgeOf(st, { similar: st?.suspect ? fresh.filter((x) => x.family === st.family && x.rule === st.rule) : [] });
      const more = opts.findings_page && it ? ` <a class="nota" href="${esc(opts.findings_page)}#case-${esc(id)}">ver na página de achados</a>` : '';
      return `<li id="p-${esc(slug(id))}" title="${esc(id)}"><span class="selo selo-${b.kind}">${esc(b.label)}</span> ${esc(plainFinding(it, { rules, where: whereToday(it) }))}${b.why ? `<br><span class="nota">${esc(b.why)}</span>` : ''}${more}</li>`;
    };
    const baseLine = (r) => {
      const arch = r.archetype ? cat.archetype_cards?.[r.archetype]?.title ?? null : null;
      const pats = (r.patterns ?? []).map((p) => cat.pattern_cards?.[String(p).split('/').pop()]?.title).filter(Boolean);
      const laws = (r.laws ?? []).map((l) => cat.law_cards?.[l]).filter(Boolean);
      const parts = [arch ? `Base: ${arch}.` : '', pats.length ? `Padrões do catálogo: ${pats.join(' · ')}` : '', laws.length ? `Princípios: ${laws.join(', ')}.` : ''].filter(Boolean);
      return parts.length ? `<p class="base nota">${esc(parts.join(' '))}</p>` : '';
    };
    const details = (r) => {
      if (r.is_current) {
        return cited.length ? `<div class="dets"><details class="det"><summary>Problemas de hoje (${cited.length})</summary><ul class="probs">${cited.map((id) => { const it = registry.get(id); return `<li title="${esc(id)}">${esc(plainFinding(it, { rules, where: whereToday(it) }))}</li>`; }).join('')}</ul></details></div>` : '';
      }
      const x = lint?.variants?.[r.id];
      const st = new Map((x?.resolves ?? []).map((y) => [y.id, y]));
      const fresh = x?.new ?? [];
      const baseKeys = new Set((lint?.current?.findings ?? []).map((y) => y.key));
      const allFresh = (x?.findings ?? []).filter((y) => !baseKeys.has(y.key));
      const stepOfFrame = new Map((r.frames ?? []).map((f) => [f.id, f.step]));
      const changes = AXES.filter((a) => String(r.changes?.[a] ?? '').trim()).map((a) => { const [h, rest] = firstSentence(r.changes[a]); return `<div><dt>${AXIS_PT[a]}</dt><dd>${esc(h)}${rest ? ` <span class="nota">${esc(rest)}</span>` : ''}</dd></div>`; }).join('');
      const resolves = r.resolves ?? [];
      const nOk = resolves.filter((id) => badgeOf(st.get(id)).kind === 'ok').length;
      return `<div class="dets">
  <details class="det"><summary>O que muda</summary><dl class="muda">${changes}</dl></details>
  <details class="det"><summary>Por que pode funcionar</summary><p>${esc(r.hypothesis)}</p></details>
  <details class="det"><summary>Riscos (${(r.tradeoffs ?? []).length})</summary><ul>${(r.tradeoffs ?? []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>
  <details class="det"><summary>Problemas que resolve (${resolves.length}${resolves.length ? `, ${nOk} confirmado${nOk === 1 ? '' : 's'}` : ''})</summary>${resolves.length ? `<ul class="probs">${resolves.map((id) => problemItem(id, st.get(id), allFresh)).join('')}</ul>` : '<p class="nota">Esta versão não diz quais problemas resolve.</p>'}</details>
  ${fresh.length ? `<details class="det"><summary>Novos pontos de atenção (${fresh.length})</summary><ul class="probs">${fresh.map((f) => { const steps = [...new Set((f.frames ?? []).map((id) => stepOfFrame.get(id)).filter(Boolean))]; return `<li title="${esc(f.rule)}"><span class="selo selo-${f.severity >= 3 ? 'bad' : 'check'}">${f.severity >= 3 ? 'grave' : 'atenção'}</span> ${esc(plainFinding(f, { rules, where: steps.length ? `em ${steps.join(', ')}` : '' }))}</li>`; }).join('')}</ul></details>` : ''}
  ${baseLine(r)}
</div>`;
    };
    const panel = (r) => `<section role="tabpanel" class="painel" id="v-${esc(slug(r.id))}" aria-labelledby="tab-${esc(slug(r.id))}" tabindex="-1"${r.id === pageRows[0].id ? '' : ' hidden'}>
  <h3 class="sr">${esc(labelOf(r))}</h3>${r.is_current ? '' : `<p class="p-ideia">${esc(r.concept)}</p>`}
  ${deck(r)}
  ${details(r)}
</section>`;
    const tabs = `<div class="abas" role="tablist" aria-label="Versões">${pageRows.map((r, i) => `<button type="button" role="tab" id="tab-${esc(slug(r.id))}" aria-controls="v-${esc(slug(r.id))}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${esc(r.id)}"><span class="letra">${esc(letters.get(r.id))}</span> ${esc(r.is_current ? 'Como é hoje' : r.name)}</button>`).join('')}</div>
  <label class="sel-aba">Versão <select id="aba-sel">${pageRows.map((r) => `<option value="${esc(r.id)}">${esc(labelOf(r))}</option>`).join('')}</select></label>`;

    // ---------- decisão ----------
    const opt = (id) => `<option value="${esc(id)}">${esc(id === cur.id ? 'Hoje' : `${letters.get(id)} · ${rows.find((r) => r.id === id)?.name ?? ''}`)}</option>`;
    const decision = `<section class="dec" id="decisao" aria-labelledby="dec-t">
  <h2 id="dec-t">Qual seguir?</h2>
  <fieldset class="escolha"><legend class="sr">Versão escolhida</legend>${rows.filter((r) => !r.is_current).map((r) => `<label class="op"><input type="radio" name="variante" value="${esc(r.id)}"><span class="letra">${esc(letters.get(r.id))}</span><span>${esc(r.name)}</span></label>`).join('')}<label class="op"><input type="radio" name="variante" value="${esc(cur.id)}"><span class="letra letra-hoje">Hoje</span><span>Nenhuma: manter como está</span></label></fieldset>
  <label class="campo">Comentário <textarea name="comentario" rows="3" placeholder="Por que esta escolha; o que ajustar ao construir"></textarea></label>
  <label class="campo">Quem decide <input name="por" autocomplete="name"></label>
  <details class="mistura" id="mistura"><summary>Misturar partes de versões diferentes</summary>
    <label class="chk"><input type="checkbox" name="misturar"> Usar a mistura abaixo em vez de uma versão inteira</label>
    <div class="eixos">${AXES.map((a) => `<label class="eixo">${AXIS_PT[a]} <select name="eixo-${a}">${rows.map((r) => opt(r.id)).join('')}</select><span class="nota" data-eixo-nota="${a}"></span></label>`).join('')}</div>
    <p class="nota">Misturar pode dar uma combinação incoerente (o texto de uma versão falando de um passo que outra tirou): descreva a mistura no comentário.</p>
  </details>
  <div class="acoes"><button type="button" id="copiar">Copiar decisão</button><span id="dec-resumo" class="nota"></span><span role="status" id="copiado"></span></div>
  <details class="json"><summary>Ver a decisão como arquivo</summary><pre id="dec-json" aria-label="Decisão em JSON"></pre>
  <p class="nota">Grave no projeto: cole num arquivo e rode <code>node ${esc(opts.dsx_rel ?? '<DSX>')}/tools/ux-lint/variations.mjs import --root . decision.json</code>.</p></details>
</section>`;

    // ---------- como contamos ----------
    const div = rows.flatMap((r) => (opts.measured?.[r.id]?.divergences ?? []).map((x) => `${letters.get(r.id)}: ${x.metric} medido ${x.measured}, declarado ${x.declared}`));
    const about = `<details class="sobre"><summary>Como os números foram contados</summary>
  <p>Telas: telas distintas do começo ao fim. Cliques: cliques no caminho feliz até concluir. Palavras por tela: média das palavras visíveis no conteúdo (sem o menu e o cabeçalho do produto). Problemas resolvidos: dos ${cited.length} problemas de hoje citados pelas versões, quantos a versão resolve (os que a verificação acusa como "continua" não contam). Menos é melhor, exceto em problemas resolvidos.</p>
  ${m.persona ? `<p><b>Para quem:</b> ${esc(m.persona)}</p>` : ''}
  ${m.task ? `<p><b>Tarefa:</b> ${esc(m.task)}</p>` : ''}
  ${m.metrics_method ? `<p class="nota">${esc(m.metrics_method)}</p>` : ''}
  ${div.length ? `<p class="nota">Medido nas capturas e diferente do declarado: ${esc(div.join(' · '))}.</p>` : ''}
  ${lint && !lint.layout ? '<p class="nota">A posição dos elementos na tela não foi medida nesta geração: problemas de posição aparecem como "precisa conferir".</p>' : ''}
  ${(opts.warnings ?? []).length ? `<p class="nota">Avisos da preparação: ${esc(opts.warnings.join(' · '))}</p>` : ''}
</details>`;

    const nav = chunks.length < 2 ? '' : `<nav class="paginas" aria-label="Páginas">${chunks.map((c, i) => `<a href="${esc(pageFileName(file, i + 1))}"${i + 1 === n ? ' aria-current="page"' : ''}>${i + 1} · ${esc(c.slice(1).map((r) => letters.get(r.id)).join(', '))}</a>`).join('')}</nav>`;
    const head = n === 1 ? '' : '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';
    const summary = rows.map(summaryCard).join('');
    const panels = pageRows.map(panel).join('');
    const data = `<script type="application/json" id="vx-data">${JSON.stringify(Object.fromEntries(used)).replace(/</g, '\\u003c')}</script>`;
    const model = { key: storeKey, module: m.module, flow: m.flow, ids: rows.map((r) => r.id), current: cur.id, names: Object.fromEntries(rows.map((r) => [r.id, labelOf(r)])), changes: Object.fromEntries(rows.map((r) => [r.id, r.changes ?? {}])) };
    const html = `${head}<title>Variações · ${esc(m.title)}${n > 1 ? ` · página ${n} de ${chunks.length}` : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">
<style>
/* Primeiro a resposta, depois o detalhe: pergunta + resumo Hoje | A | B | C na primeira dobra; uma versão por vez
   (abas) com passo a passo; detalhes recolhidos; decisão no fim. */
${THEME_TOKENS}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{background:var(--bg);color:var(--fg);font:14px/1.5 var(--sans);margin:0;overflow-x:hidden}
[hidden]{display:none!important}
.pg{max-width:1400px;margin:0 auto;padding:20px 20px 72px;display:grid;gap:28px;min-width:0}
.topo{display:grid;gap:4px}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
h1{margin:0;font:600 28px/1.2 var(--serif);text-wrap:balance}.lede{margin:0;font-size:15px;max-width:110ch}
h2,h3{text-wrap:balance}
button:focus-visible,a:focus-visible,select:focus-visible,textarea:focus-visible,input:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.letra{display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 7px;border-radius:7px;background:var(--accent);color:#fff;font-weight:700;font-size:13px;flex:none}
.hoje .letra,.letra-hoje{background:var(--fg);color:var(--surface)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.nota{color:var(--muted);font-size:12.5px}
/* resumo */
.resumo{display:grid;grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));gap:14px;align-items:stretch}
.rc{display:grid;grid-template-rows:subgrid;grid-row:span 6;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px;min-width:0}
.rc.hoje{background:color-mix(in srgb,var(--bg) 60%,var(--surface))}
.rc header{display:flex;gap:10px;align-items:flex-start}.rc h2{margin:0;font:600 17px/1.25 var(--serif)}
.ideia{margin:2px 0 0;font-size:12.5px;color:var(--muted);line-height:1.4}
.z{all:unset;cursor:zoom-in;display:block;border-radius:8px;min-width:0}.z img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff}
.hero img{aspect-ratio:16/10;object-fit:cover;object-position:top left}
.sem{display:grid;place-items:center;aspect-ratio:16/10;border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-size:12px;text-align:center;padding:8px}
.kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin:0;font-variant-numeric:tabular-nums}
.kpi{min-width:0}.kpi dt{font-size:11.5px;color:var(--muted);line-height:1.25}.kpi dd{margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 6px}
.kpi b{font-size:24px;line-height:1.15;font-weight:700}.kpi small{color:var(--muted);font-size:12px}
.d{font-size:12px;font-weight:700}.d-better{color:var(--ok)}.d-worse{color:var(--bad)}.d-same{color:var(--muted)}
.best{font-size:11px;font-weight:700;color:var(--ok);background:var(--ok-soft);border-radius:999px;padding:0 7px}
.gc{margin:0;font-size:13px;line-height:1.4}.gc strong{display:inline-block;min-width:44px;font-weight:700}.ganha strong{color:var(--ok)}.custa strong{color:var(--bad)}
.ver{color:var(--accent);font-weight:600;text-decoration:none;align-self:end}.ver:hover{text-decoration:underline}
/* versões */
.versoes{display:grid;gap:14px;min-width:0}.versoes>h2,.dec h2{margin:0;font:600 22px var(--serif)}
.abas{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line)}
.abas button{font:600 14px var(--sans);display:inline-flex;gap:8px;align-items:center;border:1px solid transparent;border-bottom:0;background:none;color:var(--muted);padding:8px 14px;min-height:44px;border-radius:10px 10px 0 0;cursor:pointer;margin-bottom:-1px}
.abas button[aria-selected="true"]{background:var(--surface);color:var(--fg);border-color:var(--line)}
.abas button:not([aria-selected="true"]) .letra{background:var(--line);color:var(--fg)}
.sel-aba{display:none;gap:6px;font-weight:600}.sel-aba select{font:600 15px var(--sans);padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg);width:100%;min-height:44px}
.painel{display:grid;gap:14px;min-width:0}.painel:focus{outline:none}
.p-ideia{margin:0;font:600 17px/1.4 var(--serif);max-width:90ch}
.deck{display:grid;gap:10px;min-width:0}
.barra{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:3;background:var(--bg);padding:8px 0}
.ind{margin:0;font-size:15px}.ind-n{color:var(--muted)}
.bts{display:flex;flex-wrap:wrap;gap:8px}
.bts button{font:600 13px var(--sans);border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:8px;padding:8px 14px;min-height:40px;cursor:pointer}
.bts button:disabled{opacity:.45;cursor:default}
.bt-cmp[aria-pressed="true"]{background:var(--accent);color:#fff;border-color:var(--accent)}
.trilha{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.trilha button{font:500 12.5px var(--sans);border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:999px;padding:4px 10px;min-height:32px;cursor:pointer}
.trilha button span{color:var(--muted);font-weight:700;margin-right:2px}
.trilha button[aria-current="step"]{background:var(--accent-soft);border-color:var(--accent);color:var(--fg)}
.slides{list-style:none;margin:0;padding:0}
.slide{display:grid;gap:10px;justify-items:center}
.palco,.palco figure{width:100%;max-width:1100px;margin:0}
.palco{display:grid;gap:10px}
.par{display:grid;gap:8px}
.tag{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:4px}
.tag-depois{color:var(--accent)}.tag-hoje{color:var(--fg)}
.sub{margin:4px 0 0;font-size:12.5px;color:var(--muted)}
.acao{margin:4px 0;justify-self:center;display:flex;gap:8px;align-items:center;background:var(--accent);color:#fff;font-weight:600;border-radius:999px;padding:8px 16px;max-width:100%;text-align:center}
.acao span{font-size:18px;line-height:1}
.legenda{margin:0;max-width:1100px;width:100%;font-size:15px;line-height:1.5}
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;min-width:0}
.slide:has(.cmp:not([hidden])) .legenda{display:none}.cmp figure{margin:0;min-width:0}
.dets{display:grid;gap:8px;max-width:1100px;width:100%;justify-self:center}
.det{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px}
.det summary{cursor:pointer;font-weight:600;min-height:28px}
.det ul{margin:8px 0 2px;padding-left:18px;display:grid;gap:6px}.det p{margin:8px 0 2px}
.muda{margin:8px 0 2px;display:grid;gap:8px}.muda div{display:grid;grid-template-columns:130px 1fr;gap:8px}.muda dt{font-weight:600}.muda dd{margin:0}
.probs{list-style:none;padding-left:0!important}
.selo{display:inline-block;border-radius:999px;padding:0 8px;font-size:12px;font-weight:700;margin-right:4px}
.selo-ok{background:var(--ok-soft);color:var(--ok)}.selo-bad{background:var(--bad-soft);color:var(--bad)}.selo-check{background:var(--warn-soft);color:var(--warn)}
.base{margin:2px 2px 0}
/* decisão */
.dec{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;display:grid;gap:14px;max-width:1100px;width:100%;justify-self:center}
.escolha{border:0;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:8px}
.op{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:10px 12px;min-height:52px;cursor:pointer}
.op:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}
.op input{width:18px;height:18px;margin:0;accent-color:var(--accent)}
.campo{display:grid;gap:4px;font-weight:600}.campo textarea,.campo input,.dec select{font:14px var(--sans);color:var(--fg);background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:8px;min-height:40px}
.mistura,.json,.sobre{border:1px solid var(--line);border-radius:10px;padding:10px 14px;background:var(--surface)}.mistura summary,.json summary,.sobre summary{cursor:pointer;font-weight:600}
.chk{display:flex;gap:8px;align-items:center;margin:10px 0}
.eixos{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:10px}.eixo{display:grid;gap:4px;font-weight:600}.eixo .nota{font-weight:400}
.acoes{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
#copiar{font:600 14px var(--sans);background:var(--accent);color:#fff;border:0;border-radius:8px;padding:10px 18px;min-height:44px;cursor:pointer}
#dec-json{margin:8px 0;font:12px var(--mono);background:var(--bg);border-radius:8px;padding:10px;white-space:pre-wrap;overflow-wrap:anywhere}
.sobre{max-width:1100px;width:100%;justify-self:center}.sobre p{margin:8px 0 0}
.paginas{display:flex;flex-wrap:wrap;gap:6px}.paginas a{color:var(--accent);text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:4px 10px;background:var(--surface)}.paginas a[aria-current="page"]{background:var(--accent);color:#fff}
#zoom{border:0;padding:0;margin:0;width:100vw;height:100vh;max-width:none;max-height:none;background:var(--surface);color:var(--fg)}#zoom::backdrop{background:rgba(8,12,20,.8)}
#zoom[open]{display:grid;grid-template-rows:auto 1fr}
.z-cab{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--line);font-size:14px}
.z-cab div{display:flex;gap:6px}
#zoom button{font:600 13px var(--sans);border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:8px;padding:6px 12px;min-height:40px;cursor:pointer}
.z-corpo{overflow:auto;padding:12px;background:var(--bg)}#z-img{display:block;max-width:100%;height:auto;margin:0 auto;background:#fff}
@media (max-width:1100px){.resumo{--cols:2!important}}
@media (max-width:640px){
  .pg{padding:16px 16px 56px;gap:22px}h1{font-size:23px}
  .resumo{--cols:1!important}.rc{grid-row:auto;grid-template-rows:none}
  .abas{display:none}.sel-aba{display:grid}
  .cmp{grid-template-columns:1fr;width:100%}
  .muda div{grid-template-columns:1fr;gap:2px}
  .barra{position:static}.bts button{flex:1 1 auto}
}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
<div class="pg">
  <header class="topo">
    <div class="eyebrow">${opts.product ? `${esc(opts.product)} · ` : ''}${esc(m.title)} · ${rows.length - 1} versões</div>
    <h1>${esc(question)}</h1>
    <p class="lede">${esc(lead.sentence)}</p>
    ${nav}
  </header>
  <section class="resumo" aria-label="Resumo das versões" style="--cols:${rows.length}">${summary}</section>
  <section class="versoes" aria-labelledby="ver-t">
    <h2 id="ver-t">Passo a passo</h2>
    ${tabs}
    ${panels}
  </section>
  ${decision}
  ${about}
  ${nav}
</div>
<dialog id="zoom" aria-label="Tela ampliada"><div class="z-cab"><span id="z-cap"></span><div><button type="button" data-z="-1" aria-label="Imagem anterior">←</button><button type="button" data-z="1" aria-label="Próxima imagem">→</button><button type="button" data-z="0">Fechar</button></div></div><div class="z-corpo"><img id="z-img" alt=""></div></dialog>
${data}
<script type="application/json" id="vx-model">${JSON.stringify(model).replace(/</g, '\\u003c')}</script>
<script>
(function(){
let D={},M={};try{D=JSON.parse(document.getElementById('vx-data').textContent);M=JSON.parse(document.getElementById('vx-model').textContent);}catch(e){}
document.querySelectorAll('img[data-k]').forEach(i=>{if(D[i.dataset.k])i.src=D[i.dataset.k];});
const load=()=>{try{return JSON.parse(localStorage.getItem(M.key)||'{}')||{};}catch(e){return {};}};
const save=(s)=>{try{localStorage.setItem(M.key,JSON.stringify(s));}catch(e){}};
let S=load();S.slide=S.slide||{};
const tabs=[...document.querySelectorAll('[role=tab]')],sel=document.getElementById('aba-sel');
const setTab=(id,focus)=>{const t=tabs.find(x=>x.dataset.tab===id);if(!t)return false;tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});if(sel)sel.value=id;if(focus)t.focus();S.tab=id;save(S);return true;};
tabs.forEach((t,i)=>{t.addEventListener('click',()=>setTab(t.dataset.tab));t.addEventListener('keydown',e=>{let j=null;if(e.key==='ArrowRight')j=(i+1)%tabs.length;if(e.key==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==null){e.preventDefault();e.stopPropagation();setTab(tabs[j].dataset.tab,true);}});});
if(sel)sel.addEventListener('change',()=>setTab(sel.value));
const decks=[...document.querySelectorAll('.deck')];
const go=(dk,i)=>{const n=Number(dk.dataset.n);i=Math.max(0,Math.min(n-1,i));dk.dataset.at=i;const sl=[...dk.querySelectorAll('.slide')];sl.forEach((s,k)=>s.hidden=k!==i);
dk.querySelector('.ind-n').textContent='Passo '+(i+1)+' de '+n;dk.querySelector('.ind-s').textContent=sl[i].dataset.step;
dk.querySelectorAll('[data-go]').forEach((b,k)=>{if(k===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
dk.querySelector('[data-mv="-1"]').disabled=i===0;dk.querySelector('[data-mv="1"]').disabled=i===n-1;S.slide[dk.dataset.row]=i;save(S);};
const setCmp=(dk,on)=>{const b=dk.querySelector('.bt-cmp');if(!b)return;b.setAttribute('aria-pressed',String(on));dk.querySelectorAll('.slide').forEach(s=>{const c=s.querySelector('.cmp');if(c){c.hidden=!on;s.querySelector('.palco').hidden=on;}});S.cmp=on;save(S);};
decks.forEach(dk=>{dk.querySelectorAll('[data-mv]').forEach(b=>b.addEventListener('click',()=>go(dk,Number(dk.dataset.at||0)+Number(b.dataset.mv))));
dk.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(dk,Number(b.dataset.go))));
const c=dk.querySelector('.bt-cmp');if(c)c.addEventListener('click',()=>{const on=c.getAttribute('aria-pressed')!=='true';decks.forEach(d=>setCmp(d,on));});
go(dk,Number(S.slide[dk.dataset.row]||0));if(S.cmp)setCmp(dk,true);});
const hashTab=()=>{const h=decodeURIComponent(location.hash.slice(1));const p=h.startsWith('v-')&&document.getElementById(h);if(p&&p.getAttribute('role')==='tabpanel'){const t=tabs.find(x=>x.getAttribute('aria-controls')===h);if(t){setTab(t.dataset.tab);return true;}}return false;};
if(!hashTab()&&S.tab)setTab(S.tab);
window.addEventListener('hashchange',hashTab);
document.querySelectorAll('[data-goto]').forEach(a=>a.addEventListener('click',e=>{if(!a.getAttribute('href').startsWith('#'))return;e.preventDefault();if(setTab(a.dataset.goto)){const p=document.getElementById('v-'+a.dataset.goto.replace(/[^a-zA-Z0-9_-]/g,'-'));p.scrollIntoView({block:'start'});p.focus({preventScroll:true});history.replaceState(null,'','#'+p.id);}}));
const z=document.getElementById('zoom'),zi=document.getElementById('z-img'),zc=document.getElementById('z-cap');let list=[],at=0;
const show=(i)=>{at=(i+list.length)%list.length;const b=list[at];zi.src=D[b.dataset.full]||'';zi.alt=b.dataset.cap||'';zc.textContent=(b.dataset.cap||'')+(list.length>1?' ('+(at+1)+' de '+list.length+')':'');z.querySelector('.z-corpo').scrollTop=0;};
document.querySelectorAll('.z[data-full]').forEach(b=>b.addEventListener('click',()=>{const scope=b.closest('.slide')||b.closest('.resumo')||document;list=[...scope.querySelectorAll('.z[data-full]')].filter(x=>x.offsetParent!==null);if(!list.includes(b))list=[b];show(list.indexOf(b));if(z.showModal)z.showModal();else z.setAttribute('open','');}));
z.querySelectorAll('[data-z]').forEach(b=>b.addEventListener('click',()=>{const d=Number(b.dataset.z);if(d)show(at+d);else z.close();}));
z.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){show(at+1);e.preventDefault();}if(e.key==='ArrowLeft'){show(at-1);e.preventDefault();}});
z.addEventListener('click',e=>{if(e.target===z)z.close();});
document.addEventListener('keydown',e=>{if(z.open||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;if(e.target.closest&&e.target.closest('input,textarea,select,[role=tablist]'))return;
const p=document.querySelector('.painel:not([hidden])');const dk=p&&p.querySelector('.deck');if(!dk)return;const r=p.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;e.preventDefault();go(dk,Number(dk.dataset.at||0)+(e.key==='ArrowRight'?1:-1));});
const f=document.getElementById('decisao'),out=document.getElementById('dec-json'),mx=document.getElementById('mistura');
const val=(n)=>{const x=f.querySelector('[name="'+n+'"]:checked');return x?x.value:null;};
const AX=${JSON.stringify(AXES)};
const read=()=>{const mode=f.querySelector('[name=misturar]').checked?'compose':'variant';const d={format:1,module:M.module,flow:M.flow,mode};
if(mode==='variant')d.variant=val('variante');else{d.compose={};AX.forEach(a=>{d.compose[a]=f.querySelector('[name="eixo-'+a+'"]').value;});}
d.comment=f.querySelector('[name=comentario]').value.trim();d.by=f.querySelector('[name=por]').value.trim()||'dono';d.at=new Date().toISOString().slice(0,10);return d;};
const notes=()=>{AX.forEach(a=>{const v=f.querySelector('[name="eixo-'+a+'"]').value;const t=(M.changes[v]||{})[a]||(v===M.current?'como hoje':'');f.querySelector('[data-eixo-nota="'+a+'"]').textContent=t;});};
const AXN={screen:'tela',flow:'fluxo',behavior:'comportamento',text:'texto'};
const summ=(d)=>d.mode==='compose'?'Sua escolha: mistura ('+AX.map(a=>AXN[a]+' '+(d.compose[a]===M.current?'de hoje':'de '+String(M.names[d.compose[a]]||'').split(' · ')[0])).join(', ')+').':d.variant?'Sua escolha: '+(d.variant===M.current?'nenhuma, manter como está':M.names[d.variant])+'.':'Nenhuma escolha ainda.';
const sync=()=>{notes();const d=read();out.textContent=JSON.stringify(d,null,2);document.getElementById('dec-resumo').textContent=summ(d);S.decision=d;save(S);};
if(S.decision){const d=S.decision;if(d.variant){const v=f.querySelector('[name=variante][value="'+d.variant+'"]');if(v)v.checked=true;}
if(d.mode==='compose'){f.querySelector('[name=misturar]').checked=true;mx.open=true;}
if(d.compose)Object.entries(d.compose).forEach(([a,v])=>{const s=f.querySelector('[name="eixo-'+a+'"]');if(s&&[...s.options].some(o=>o.value===v))s.value=v;});f.querySelector('[name=comentario]').value=d.comment||'';f.querySelector('[name=por]').value=d.by&&d.by!=='dono'?d.by:'';}
f.addEventListener('input',sync);f.addEventListener('change',sync);sync();
document.getElementById('copiar').addEventListener('click',async()=>{const d=read();const st=document.getElementById('copiado');
if(d.mode==='variant'&&!d.variant){st.textContent='Escolha uma versão antes de copiar.';return;}
const t=JSON.stringify(d,null,2);try{await navigator.clipboard.writeText(t);st.textContent='Decisão copiada.';}catch(e){f.querySelector('details.json').open=true;const r=document.createRange();r.selectNodeContents(out);const s=getSelection();s.removeAllRanges();s.addRange(r);st.textContent='Copie o texto selecionado abaixo.';}});
})();
</script>`;
    return { file: pageFileName(file, n), html, bytes: Buffer.byteLength(html) };
  });
}
