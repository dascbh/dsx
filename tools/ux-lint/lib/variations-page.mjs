// Página de comparação de variações de UX (variations.mjs page), feita para decidir em 2 minutos: primeiro a
// resposta, depois o detalhe. Topo = a pergunta e um resumo Hoje | A | B | C (ideia, a tela no mesmo momento do
// fluxo, 4 números contra hoje, o que ganha e o que custa). Depois uma versão por vez, em abas, com os passos do
// fluxo separados dos estados e comportamentos (tela recortada no conteúdo, legenda, antes/depois lado a lado com o
// que mudou marcado e "Comparar com hoje" com recorte ampliável). Detalhes recolhidos em linguagem de negócio; o
// técnico (ids, regras, padrões, comando) só em "Para quem constrói". Decisão no fim, sem terminal para o dono.
// Mesmos tokens da página de achados (text-page.mjs). Sem dependências e sem navegador: as imagens e a diferença
// entre antes e depois já vêm prontas (variations.mjs shootCaptures e diffShots).
import { THEME_TOKENS, pageFileName } from '../text-page.mjs';
import { embedded, embeddedSize } from './preview-page.mjs';

export const PAGE_MAX_BYTES = 10 * 1024 * 1024;
const AXES = ['screen', 'flow', 'behavior', 'text'];
const AXIS_PT = { screen: 'Tela', flow: 'Fluxo', behavior: 'Comportamento', text: 'Texto' };
/** Indicador dos slides que não são passos do fluxo. */
const PART_PT = { state: 'Estado', dialog: 'Diálogo', behavior: 'Comportamento' };
/** Nome de cada métrica em português (a página nunca mostra a chave). */
export const METRIC_PT = { steps: 'telas', clicks_to_done: 'cliques', dialogs: 'diálogos', primary_actions: 'ações principais', words_on_screen: 'palavras por tela', decisions: 'decisões' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, '-');
const lowerFirst = (s) => String(s ?? '').replace(/^\p{Lu}(?!\p{Lu})/u, (c) => c.toLowerCase());
const upperFirst = (s) => String(s ?? '').replace(/^\p{Ll}/u, (c) => c.toUpperCase());
const r2 = (n) => Math.round(n * 100) / 100;
/**
 * Legenda limpa: sem "Antes:"/"Depois:" (a página já diz qual é qual) e sem "Passo 1 de 3:" ou "Etapa 1 de 2:" (a
 * página tem uma contagem só, a do indicador).
 */
export const bare = (s) => upperFirst(String(s ?? '').replace(/^\s*(antes|depois)\s*[:,-]\s*/i, '').replace(/^\s*(passo|etapa)\s+\d+\s+de\s+\d+\s*[:,.-]?\s*/i, ''));

/** Letra de exibição: o id quando é uma letra, senão A, B, C pela ordem. */
export const letterOf = (row, i) => (row.is_current ? 'Hoje' : /^[a-z]$/i.test(row.id) ? row.id.toUpperCase() : String.fromCharCode(65 + i));

/**
 * Passos de uma linha: frames consecutivos do mesmo `step` formam um grupo. Frame de comportamento vira par
 * antes → ação → depois; os frames citados como antes/depois no mesmo passo não aparecem de novo sozinhos.
 */
/** Forward lenses in plain language for the decision page (ids stay in "Para quem constrói"). */
export const LENS_PT = {
  subtract: 'Tirar: um passo, campo ou decisão some',
  invert: 'Inverter: muda quem age ou quando',
  analogous: 'Emprestar: copia o que funciona em outro lugar',
  'constraint-first': 'Pior caso primeiro: desenha para o caso difícil',
  'object-first': 'Pelo objeto: organiza em volta da coisa, não da sequência',
};

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

/**
 * Slides da apresentação, em dois grupos: **passos do fluxo** (frames `screen`, numerados: "Passo 2 de 3", a mesma
 * contagem das telas; frame com diálogo aberto não é tela) e **estados e comportamentos** (frames `state`, diálogos e
 * pares antes/depois, sem número). `frames`: medida por frame ({ id: { dialog_open } }). Cada slide:
 * { step, cell, part: 'path' | 'state' | 'dialog' | 'behavior', n (só nos passos) }.
 */
export function slidesOf(row, frames = {}) {
  const all = groupsOf(row).flatMap((g) => g.cells.map((cell) => ({ step: g.step, cell })));
  const dialog = (s) => !!frames[s.cell.frame?.id]?.dialog_open;
  const isPath = (s) => s.cell.type === 'frame' && s.cell.frame.kind === 'screen' && !dialog(s);
  const path = all.filter(isPath).map((s, i) => ({ ...s, part: 'path', n: i + 1 }));
  const other = all.filter((s) => !isPath(s)).map((s) => ({ ...s, part: s.cell.type === 'behavior' ? 'behavior' : dialog(s) ? 'dialog' : 'state' }));
  return [...path, ...other];
}

/**
 * Tela principal da linha (imagem do resumo): `hero` do manifesto; senão o frame que compara com a tela principal de
 * hoje (`compare_to`), para as quatro mostrarem o mesmo momento; senão o frame `screen` sem diálogo aberto com mais
 * palavras (medidas); senão o primeiro.
 */
export function heroOf(row, frames = {}, todayHero = null) {
  const fs = row.frames ?? [];
  const pick = fs.find((f) => f.id === row.hero);
  if (pick) return pick;
  if (todayHero && !row.is_current) { const same = fs.find((f) => f.compare_to === todayHero && f.kind !== 'state'); if (same) return same; }
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

/**
 * Diferença contra hoje, com a palavra visível ("melhor"/"pior": cor e seta nunca são o único sinal).
 * `higher`: mais é melhor (problemas resolvidos); senão menos é melhor.
 */
export function delta(cur, val, higher = false, { tolerance = 0 } = {}) {
  const c = Number(cur), v = Number(val);
  if (!Number.isFinite(c) || !Number.isFinite(v)) return { kind: 'na', text: '—' };
  const d = Math.round((v - c) * 10) / 10;
  if (d === 0) return { kind: 'same', text: '=', word: 'igual a hoje', sr: '' };
  if (tolerance && Math.abs(d) <= Math.abs(c) * tolerance) return { kind: 'same', text: '≈', word: 'praticamente igual a hoje', sr: '' };
  const better = higher ? d > 0 : d < 0;
  const n = Math.abs(d);
  const more = d > 0;
  return { kind: better ? 'better' : 'worse', text: `${more ? '▲' : '▼'} ${n}`, word: better ? 'melhor' : 'pior', sr: `${n} a ${more ? 'mais' : 'menos'} que hoje,` };
}

/** Os quatro números do resumo. */
export const kpisOf = (m) => [
  { key: 'steps', label: 'Telas', noun: 'telas' },
  { key: 'clicks_to_done', label: m.done_label ? `Cliques até ${m.done_label}` : 'Cliques até concluir', noun: m.done_label ? `cliques até ${m.done_label}` : 'cliques até concluir' },
  { key: 'words_on_screen', label: 'Palavras por tela', noun: 'palavras por tela', tolerance: 0.05 },
  { key: 'resolved', label: 'Problemas resolvidos', noun: 'problemas resolvidos', higher: true },
];

/**
 * Valores que a página mostra e compara, um critério só para o número, o líder, o selo e a frase do topo:
 * - palavras por tela: a **medida** nas capturas quando há medição (a declarada só aparece como aviso);
 * - problemas resolvidos: só os **confirmados** (`to_check` = os que precisam de conferência, mostrados ao lado);
 * - `nc`: métrica não comparável (`metrics_detail.not_comparable`), fora do líder e do selo.
 */
export function valuesOf(rows, { measured = {}, lint = null } = {}) {
  return Object.fromEntries(rows.map((r) => {
    const ms = measured[r.id];
    const hasWords = !!ms && Object.keys(ms.frames ?? {}).length > 0 && Number.isFinite(ms.metrics?.words_on_screen);
    const st = new Map((lint?.variants?.[r.id]?.resolves ?? []).map((y) => [y.id, y]));
    const kinds = r.is_current ? [] : (r.resolves ?? []).map((id) => badgeOf(st.get(id)).kind);
    const wordsOff = (ms?.divergences ?? []).find((x) => x.metric === 'words_on_screen');
    return [r.id, {
      steps: r.metrics?.steps,
      clicks_to_done: r.metrics?.clicks_to_done,
      words_on_screen: hasWords ? ms.metrics.words_on_screen : r.metrics?.words_on_screen,
      words_declared_off: hasWords && wordsOff ? wordsOff.declared : null,
      resolved: kinds.filter((k) => k === 'ok').length,
      to_check: kinds.filter((k) => k === 'check').length,
      nc: { ...(r.metrics_detail?.not_comparable ?? {}) },
    }];
  }));
}

/**
 * Quem lidera cada número entre as variantes (só conta quem é melhor que hoje; métrica não comparável fica de fora;
 * diferença dentro da tolerância não lidera; em "mais é melhor", não há líder se outra versão alcança o topo somando o
 * que ainda está "a conferir").
 * values: rowId → { kpi: número, nc: { kpi: motivo } }. Devolve { best: { kpi: Set(rowId) }, sentence }.
 */
export function leaders(rows, values, kpis, letters) {
  const [cur, ...vars] = rows;
  const best = {};
  const wins = new Map();
  for (const k of kpis) {
    const pool = vars.filter((r) => !values[r.id]?.nc?.[k.key] && Number.isFinite(Number(values[r.id]?.[k.key])));
    const nums = pool.map((r) => Number(values[r.id][k.key]));
    if (!nums.length) continue;
    const top = k.higher ? Math.max(...nums) : Math.min(...nums);
    const c = Number(values[cur.id]?.[k.key]);
    if (Number.isFinite(c) && (k.higher ? top <= c : top >= c)) continue;
    if (k.tolerance && Number.isFinite(c) && Math.abs(top - c) <= Math.abs(c) * k.tolerance) continue;
    const winners = pool.filter((r) => Number(values[r.id][k.key]) === top);
    // líder incerto: outra versão alcança o topo com o que ainda falta conferir
    if (k.higher && pool.some((r) => !winners.includes(r) && Number(values[r.id][k.key]) + Number(values[r.id].to_check ?? 0) >= top)) continue;
    best[k.key] = new Set(winners.map((r) => r.id));
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
    const q = it.rule === 'L9' ? null : it.family === 'text' ? fill(it.anchor ?? it.text) : quoted(it.anchor ?? it.text) ?? quoted(it.message);
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

// ---------- recortes ----------

const clamp01 = (v) => Math.min(1, Math.max(0, Number(v) || 0));
/**
 * Recorte de uma imagem, em frações (0–1): `compare_focus` do frame; senão o canto superior esquerdo com 62% da
 * largura. A altura sai da proporção (`ratio` = altura ÷ largura, 3:4 por padrão), para os recortes lado a lado
 * terem o mesmo formato.
 */
export function focusOf(f, shot, { width = 0.62, ratio = 0.75 } = {}) {
  const W = shot?.width || 1220, H = shot?.height || 800;
  const c = f?.compare_focus;
  const x = c ? clamp01(c.x) : 0, y = c ? clamp01(c.y) : 0;
  const w = Math.min(1 - x, c ? clamp01(c.w) || width : width);
  const h = Math.max(0.05, Math.min(1 - y, (w * W * ratio) / H));
  return { x, y, w, h };
}

/**
 * Retângulo (px) que mostra o que mudou entre antes e depois: a caixa da diferença com margem, no mínimo metade da
 * largura e proporção de no máximo 2:1. Sem diferença, ou com mais de 60% da tela mudada, null (mostra a tela inteira).
 */
export function changeRect(box, before, after, { margin = 48, minWidth = 0.5 } = {}) {
  if (!box || !before || !after) return null;
  const W = Math.max(before.width || 0, after.width || 0) || box.width || 1220;
  const H = Math.max(before.height || 0, after.height || 0) || box.height || 800;
  if (box.w * box.h > 0.6 * W * H) return null;
  let x0 = Math.max(0, box.x - margin), x1 = Math.min(W, box.x + box.w + margin);
  const minW = W * minWidth;
  if (x1 - x0 < minW) { const cx = (x0 + x1) / 2; x0 = Math.max(0, Math.min(W - minW, cx - minW / 2)); x1 = x0 + minW; }
  let y0 = Math.max(0, box.y - margin), y1 = Math.min(H, box.y + box.h + margin);
  const minH = (x1 - x0) / 2;
  if (y1 - y0 < minH) { const cy = (y0 + y1) / 2; y0 = Math.max(0, Math.min(H - minH, cy - minH / 2)); y1 = Math.min(H, y0 + minH); }
  return { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
}

/** Frações de um retângulo px numa imagem (a mais baixa das duas pode não alcançar o retângulo inteiro). */
const rectFocus = (rect, shot) => {
  const W = shot.width || 1220, H = shot.height || 800;
  if (rect.y >= H - 20) return null;
  return { x: rect.x / W, y: rect.y / H, w: rect.w / W, h: Math.min(rect.h, H - rect.y) / H };
};

// ---------- páginas ----------

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
 *         { content, width, height }), diffs (Map "<antes>|<depois>" → caixa px da diferença), shotsDir, file,
 *         product, findings_page, warnings, maxBytes, dsx_rel, fragment (página 1 sem esqueleto, para artefato),
 *         catalogs ({ archetype_cards, pattern_cards, law_cards, rules }), rows (opcional, para testes) }.
 */
export function renderVariationsPages(m, opts = {}) {
  const rows = opts.rows ?? [{ ...(m.current ?? {}), id: m.current?.id ?? 'current', is_current: true }, ...(m.variants ?? []).map((v) => ({ ...v, is_current: false }))];
  const shots = opts.shots ?? new Map();
  const diffs = opts.diffs ?? new Map();
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
  const values = valuesOf(rows, { measured: opts.measured ?? {}, lint });
  const lead = leaders(rows, values, kpis, letters);
  const curHero = heroOf(cur, opts.measured?.[cur.id]?.frames ?? {});
  const heroes = new Map(rows.map((r) => [r.id, r.is_current ? curHero : heroOf(r, opts.measured?.[r.id]?.frames ?? {}, curHero?.id)]));
  const sameMoment = curHero && rows.slice(1).every((r) => heroes.get(r.id)?.compare_to === curHero.id);
  const todaySlides = slidesOf(cur, opts.measured?.[cur.id]?.frames ?? {});
  const doneNoun = m.done_label ? `até ${m.done_label}` : 'até concluir';

  return chunks.map((pageRows, idx) => {
    const n = idx + 1;
    const full = !opts.fragment || n > 1;
    const onPage = new Set(pageRows.map((r) => r.id));
    const used = new Map();
    const crops = new Map();
    const use = (k) => { if (!used.has(k)) { const e = embedded(dir, k); if (e?.uri) used.set(k, e.uri); } return k; };
    const shotOf = (f) => (f ? shots.get(f.capture) : null);
    const whoOf = (r) => (r.is_current ? 'de hoje' : `da versão ${letters.get(r.id)}`);
    const nameOf = (r) => (r.is_current ? 'Como é hoje' : r.name);
    const labelOf = (r) => (r.is_current ? 'Hoje' : `${letters.get(r.id)} · ${r.name}`);
    /** Nome acessível do botão de ampliar, em frase (sem caixa de título nem separador). */
    const zoomName = (r, step, phase = '') => `Ampliar a tela ${whoOf(r)} no passo ${step}${phase ? `, ${phase}` : ''}`;
    const altOf = (z) => z.aria.replace(/^Ampliar a tela/, 'Tela');
    const zoomAttrs = (s, { name, cap = '', unit = 'Imagem', aria }) => `data-full="${esc(use(s.content))}" data-name="${esc(name)}" data-cap="${esc(cap)}" data-unit="${esc(unit)}" aria-label="${esc(aria)}"`;
    const missing = (f, aria, cls) => `<span class="${cls} sem" role="img" aria-label="${esc(aria)}"><span>${esc(bare(f?.caption ?? f?.id ?? ''))}</span><small>sem imagem</small></span>`;
    /** Imagem inteira, ampliável. */
    const fullImg = (f, z, cls = 'shot') => {
      const s = shotOf(f);
      if (!s) return missing(f, z.aria, cls);
      return `<button type="button" class="z ${cls}" ${zoomAttrs(s, z)}><img data-k="${esc(s.content)}" alt="${esc(altOf(z))}" width="${esc(s.width ?? 1220)}" height="${esc(s.height ?? 800)}" loading="lazy" decoding="async"></button>`;
    };
    /** Recorte ampliável (`focus` em frações), com o contorno do que mudou (`marks`, frações do recorte). */
    const cropImg = (f, z, focus, { marks = [], cls = '', tag = false } = {}) => {
      const s = shotOf(f);
      if (!s) return missing(f, z.aria, `crop ${cls}`);
      if (!focus) return fullImg(f, z, cls || 'shot');
      const W = s.width || 1220, H = s.height || 800;
      const css = `aspect-ratio:${Math.round(focus.w * W)}/${Math.round(focus.h * H)}}.KEY img{width:${r2(100 / focus.w)}%;left:${r2((-100 * focus.x) / focus.w)}%;top:${r2((-100 * focus.y) / focus.h)}%`;
      if (!crops.has(css)) crops.set(css, `k${crops.size + 1}`);
      const k = crops.get(css);
      const mk = marks.map((mark) => {
        const mcss = `left:${r2(mark.x * 100)}%;top:${r2(mark.y * 100)}%;width:${r2(mark.w * 100)}%;height:${r2(mark.h * 100)}%`;
        if (!crops.has(mcss)) crops.set(mcss, `m${crops.size + 1}`);
        return `<span class="mk ${crops.get(mcss)}" aria-hidden="true"></span>`;
      }).join('');
      return `<button type="button" class="z crop ${cls}" ${zoomAttrs(s, z)}><span class="kb ${k}"><img data-k="${esc(s.content)}" alt="${esc(altOf(z))}" loading="lazy" decoding="async">${mk}</span>${tag ? '<span class="z-tag" aria-hidden="true">Ampliar</span>' : ''}</button>`;
    };
    const heroFocus = (f) => { const s = shotOf(f); return s ? focusOf(f, s, { ratio: 0.62 }) : null; };

    // ---------- resumo ----------
    const deltaHtml = (d) => (d.kind === 'na' ? '' : d.kind === 'same' ? ` <span class="d d-same">${esc(d.word)}</span>`
      : ` <span class="d d-${d.kind}"><span aria-hidden="true">${esc(d.text)} · </span><span class="sr">${esc(d.sr)} </span>${esc(d.word)}</span>`);
    const kpiHtml = (r) => kpis.map((k) => {
      const x = values[r.id] ?? {};
      const v = x[k.key];
      const nc = x.nc?.[k.key];
      const lid = !nc && lead.best[k.key]?.has(r.id);
      const d = r.is_current || nc ? null : delta(values[cur.id]?.[k.key], v, k.higher, { tolerance: k.tolerance ?? 0 });
      const of = k.key === 'resolved' && cited.length ? `<small> de ${cited.length}</small>` : '';
      const check = k.key === 'resolved' && x.to_check ? `<span class="mais">+ ${x.to_check} a conferir</span>` : '';
      const off = k.key === 'words_on_screen' && x.words_declared_off !== null && x.words_declared_off !== undefined ? `<span class="mais">medido nas telas (estimativa inicial: ${esc(x.words_declared_off)})</span>` : '';
      const ncHtml = nc ? `<span class="nc">não comparável</span><span class="nc-why">${esc(nc)}</span>` : '';
      return `<div class="kpi${lid ? ' lidera' : ''}${nc ? ' is-nc' : ''}"><dt>${esc(k.label)}</dt><dd><b>${esc(v ?? '—')}</b>${of}${d ? deltaHtml(d) : ''}${lid ? ' <span class="best">lidera</span>' : ''}${check}${off}${ncHtml}</dd></div>`;
    }).join('');
    const gainOf = (r) => r.gain || (r.is_current ? 'Já existe: nada a construir.' : clip(firstSentence(r.hypothesis)[0]));
    const costOf = (r) => r.cost || (r.is_current ? `${cited.length} problema${cited.length === 1 ? '' : 's'} de hoje continua${cited.length === 1 ? '' : 'm'}.` : clip((r.tradeoffs ?? [])[0] ?? ''));
    const summaryCard = (r) => {
      const h = heroes.get(r.id);
      const hero = h ? cropImg(h, { name: labelOf(r), cap: h.step, unit: 'Versão', aria: zoomName(r, h.step) }, heroFocus(h), { cls: 'hero', tag: true }) : '';
      const link = onPage.has(r.id) ? `#v-${slug(r.id)}` : `${pageFileName(file, chunks.findIndex((c) => c.some((x) => x.id === r.id)) + 1)}#v-${slug(r.id)}`;
      return `<article class="rc${r.is_current ? ' hoje' : ''}" aria-labelledby="rc-${esc(slug(r.id))}">
  <header><span class="letra">${esc(letters.get(r.id))}</span><div><h2 id="rc-${esc(slug(r.id))}">${esc(nameOf(r))}</h2><p class="ideia">${esc(r.is_current ? (r.concept || `${slidesOf(r, opts.measured?.[r.id]?.frames ?? {}).filter((s) => s.part === 'path').length} telas, do jeito que funciona hoje.`) : r.concept)}</p></div></header>
  ${hero || '<span class="hero sem"></span>'}
  <dl class="kpis">${kpiHtml(r)}</dl>
  <p class="gc ganha"><strong>Ganha</strong> ${esc(gainOf(r))}</p>
  <p class="gc custa"><strong>Custa</strong> ${esc(costOf(r))}</p>
  <a class="ver" href="${esc(link)}" data-goto="${esc(r.id)}">Ver passo a passo</a>
</article>`;
    };

    // ---------- passo a passo ----------
    const behaviorHtml = (r, s, c) => {
      const sb = shotOf(c.before), sa = shotOf(c.after);
      const d = sb && sa ? diffs.get(`${sb.content}|${sa.content}`) ?? null : null;
      const boxes = !d ? [] : Array.isArray(d.boxes) ? d.boxes : Number.isFinite(d.x) ? [d] : [];
      const union = boxes.length ? boxes.reduce((u, b) => { const x = Math.min(u.x, b.x), y = Math.min(u.y, b.y); return { x, y, w: Math.max(u.x + u.w, b.x + b.w) - x, h: Math.max(u.y + u.h, b.y + b.h) - y }; }) : null;
      const rect = changeRect(union, sb, sa);
      const fig = (f, shot, phase) => {
        const z = { name: `${labelOf(r)} · ${s.step}`, cap: phase, aria: zoomName(r, s.step, phase) };
        if (!shot || !boxes.length) return fullImg(f, z);
        // mudança concentrada: recorte em volta dela; espalhada: a tela inteira com cada região contornada
        const fo = (rect && rectFocus(rect, shot)) || { x: 0, y: 0, w: 1, h: 1 };
        const W = shot.width || 1220, H = shot.height || 800;
        const fx = fo.x * W, fy = fo.y * H, fw = fo.w * W, fh = fo.h * H;
        const marks = boxes.map((b) => {
          const x = clamp01((b.x - fx) / fw), y = clamp01((b.y - fy) / fh);
          return { x, y, w: Math.min(1 - x, Math.max(0, (b.x + b.w - Math.max(b.x, fx)) / fw)), h: Math.min(1 - y, Math.max(0, (b.y + b.h - Math.max(b.y, fy)) / fh)) };
        }).filter((k) => k.w > 0.005 && k.h > 0.005);
        return cropImg(f, z, fo, { marks });
      };
      const before = c.before ? `<figure><figcaption class="tag">Antes</figcaption>${fig(c.before, sb, 'antes')}${c.before.caption ? `<p class="sub">${esc(bare(c.before.caption))}</p>` : ''}</figure>` : '';
      const after = `<figure><figcaption class="tag tag-depois">Depois</figcaption>${fig(c.after, sa, 'depois')}</figure>`;
      return `<div class="par${c.before ? '' : ' so'}">${before}<p class="acao"><span class="seta" aria-hidden="true"></span><span>${esc(c.action || 'ação')}</span></p>${after}</div>${boxes.length ? `<p class="par-nota">${rect ? 'O recorte mostra a parte que mudou, contornada.' : 'Os contornos marcam o que mudou entre antes e depois.'} Clique numa imagem para ver a tela inteira, no tamanho real.</p>` : ''}`;
    };
    const slideHtml = (r, s, i, total, nPath) => {
      const c = s.cell;
      const main = c.type === 'behavior'
        ? behaviorHtml(r, s, c)
        : `<figure>${fullImg(c.frame, { name: `${labelOf(r)} · ${s.step}`, aria: zoomName(r, s.step) })}</figure>`;
      let cmp = '';
      if (!r.is_current) {
        const k = todaySlideFor(s, i, total, todaySlides);
        const t = todaySlides[k];
        const tf = t ? (t.cell.type === 'behavior' ? t.cell.after : t.cell.frame) : null;
        const vf = c.type === 'behavior' ? c.after : c.frame;
        const ts = shotOf(tf), vs = shotOf(vf);
        const tName = t ? `Hoje · ${t.step}` : 'Hoje';
        const vName = `${letters.get(r.id)} · ${s.step}`;
        const pair = ts && vs ? `<p class="cmp-acoes"><button type="button" class="z par-z" data-pair="${esc(use(ts.content))}|${esc(use(vs.content))}" data-names="${esc(tName)}|${esc(vName)}" data-name="${esc(`Hoje e ${letters.get(r.id)} lado a lado`)}" data-cap="${esc(s.step)}" data-unit="Imagem">Ampliar as duas lado a lado</button><span class="nota">Os recortes mostram a parte principal de cada tela; ampliadas, aparecem inteiras.</span></p>` : '';
        cmp = `<div class="cmp" hidden><figure><figcaption class="tag tag-hoje">${esc(tName)}</figcaption>${tf ? cropImg(tf, { name: tName, aria: zoomName(cur, t.step) }, ts ? focusOf(tf, ts) : null) : '<p class="nota">Hoje não tem passo equivalente.</p>'}${tf?.caption ? `<p class="sub">${esc(bare(tf.caption))}</p>` : ''}</figure>
          <figure><figcaption class="tag">${esc(vName)}</figcaption>${cropImg(vf, { name: vName, aria: zoomName(r, s.step) }, vs ? focusOf(vf, vs) : null)}${vf?.caption ? `<p class="sub">${esc(bare(vf.caption))}</p>` : ''}</figure>${pair}</div>`;
      }
      const legend = bare(c.type === 'behavior' ? (c.frame.caption ?? c.after?.caption) : c.frame.caption);
      const ind = PART_PT[s.part] ? PART_PT[s.part] : `Passo ${s.n} de ${nPath}`;
      return `<li class="slide" data-i="${i}" data-step="${esc(s.step)}" data-ind="${esc(ind)}"${i ? ' hidden' : ''}><div class="palco">${main}</div>${cmp}${legend ? `<p class="legenda">${esc(legend)}</p>` : ''}</li>`;
    };
    const deck = (r) => {
      const id = slug(r.id);
      const slides = slidesOf(r, opts.measured?.[r.id]?.frames ?? {});
      const total = slides.length;
      const nPath = slides.filter((s) => s.part === 'path').length;
      const first = slides[0];
      const ind0 = first ? (PART_PT[first.part] ?? `Passo 1 de ${nPath}`) : '';
      const btn = (s, i) => `<li><button type="button" data-go="${i}"${i ? '' : ' aria-current="step"'}>${s.part === 'path' ? `<span>${s.n}</span> ` : ''}${esc(s.step)}</button></li>`;
      const indexed = slides.map((s, i) => [s, i]);
      const path = indexed.filter(([s]) => s.part === 'path');
      const other = indexed.filter(([s]) => s.part !== 'path');
      const group = (list, t, k) => (list.length ? `<div class="tg"><p class="tg-t" id="tg-${k}-${esc(id)}">${t}</p><ol aria-labelledby="tg-${k}-${esc(id)}">${list.map(([s, i]) => btn(s, i)).join('')}</ol></div>` : '');
      return `<div class="deck" data-row="${esc(r.id)}" data-n="${total}">
  <div class="barra">
    <p class="ind" aria-live="polite"><span class="ind-n">${esc(ind0)}</span> · <b class="ind-s">${esc(first?.step ?? '')}</b></p>
    <div class="bts"><button type="button" data-mv="-1" aria-label="Passo anterior">← Anterior</button><button type="button" data-mv="1" aria-label="Próximo passo">Próximo →</button>${r.is_current ? '' : `<button type="button" class="bt-cmp" aria-pressed="false" aria-describedby="cmp-nota-${esc(id)}">Comparar com hoje</button>`}</div>
    ${r.is_current ? '' : `<p class="nota cmp-nota" id="cmp-nota-${esc(id)}">"Comparar com hoje" vale para todas as versões ao mesmo tempo.</p>`}
  </div>
  <div class="trilha">${group(path, 'Passos do fluxo', 'p')}${group(other, 'Estados e comportamentos', 'e')}</div>
  <ol class="slides">${slides.map((s, i) => slideHtml(r, s, i, total, nPath)).join('')}</ol>
</div>`;
    };

    const problemItem = (id, st, fresh = []) => {
      const it = registry.get(id);
      const b = badgeOf(st, { similar: st?.suspect ? fresh.filter((x) => x.family === st.family && x.rule === st.rule) : [] });
      const more = opts.findings_page && it ? ` <a href="${esc(opts.findings_page)}#case-${esc(id)}">ver na página de achados</a>` : '';
      return `<li id="p-${esc(slug(id))}"><span class="selo selo-${b.kind}">${esc(b.label)}</span> ${esc(plainFinding(it, { rules, where: whereToday(it) }))}${b.why ? `<span class="why">${esc(b.why)}</span>` : ''}${more}</li>`;
    };
    const clicksBlock = (r) => {
      const list = r.metrics_detail?.clicks_to_done;
      if (!Array.isArray(list) || !list.length) return '';
      const nc = r.metrics_detail?.not_comparable?.clicks_to_done;
      const declared = Number(r.metrics?.clicks_to_done);
      const diff = Number.isFinite(declared) && declared !== list.length ? `<p class="aviso">A lista tem ${list.length} e o número do resumo diz ${declared}.</p>` : '';
      return `<details class="det"><summary>Os ${list.length} cliques ${esc(doneNoun)}</summary><ol class="cliques">${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>${nc ? `<p class="aviso">Não comparável: ${esc(nc)}</p>` : ''}${diff}</details>`;
    };
    const techBlock = (r) => {
      const arch = r.archetype ? cat.archetype_cards?.[r.archetype]?.title ?? null : null;
      const pats = (r.patterns ?? []).map((p) => { const t = cat.pattern_cards?.[String(p).split('/').pop()]?.title; return t ? `${t} (${p})` : p; });
      const laws = (r.laws ?? []).map((l) => (cat.law_cards?.[l] ? `${cat.law_cards[l]} (${l})` : l));
      const tech = AXES.filter((a) => String(r.changes_tech?.[a] ?? '').trim()).map((a) => `<div><dt>${AXIS_PT[a]}</dt><dd>${esc(r.changes_tech[a])}</dd></div>`).join('');
      const ids = (r.resolves ?? []).map((id) => { const it = registry.get(id); return `${id}${it?.rule ? ` (${it.rule})` : ''}`; });
      const parts = [
        tech ? `<dl class="muda">${tech}</dl>` : '',
        arch ? `<p>Arquétipo: ${esc(arch)} (${esc(r.archetype)}).</p>` : '',
        pats.length ? `<p>Padrões do catálogo: ${esc(pats.join(' · '))}.</p>` : '',
        laws.length ? `<p>Princípios: ${esc(laws.join(', '))}.</p>` : '',
        r.lens ? `<p>Lente (Forward, USE-10): ${esc(r.lens)}.</p>` : '',
        ids.length ? `<p>Achados citados: ${esc(ids.join(', '))}.</p>` : '',
        (r.code ?? []).length ? `<p>Código da versão: ${(r.code ?? []).map((c) => `<code>${esc(c)}</code>`).join(' ')}</p>` : '',
      ].filter(Boolean);
      return parts.length ? `<details class="det tec"><summary>Para quem constrói</summary>${parts.join('')}</details>` : '';
    };
    // Falsifiable hypothesis (manifest format 2), in plain language; the lens id only appears for builders.
    const chosenId = typeof m.choice === 'string' ? m.choice : m.choice?.variant ?? null;
    const betBlock = (r) => {
      const rows = [
        ['Para quem', r.audience], ['A aposta', r.causal_bet], ['O que provaria o contrário', r.counter_hypothesis],
        ['Como testar se está errada', r.falsification_test], ['Número que deve melhorar', r.expected_metric], ['O que não pode piorar', r.guardrail],
        ['Ângulo da ideia', LENS_PT[r.lens] ?? null],
      ].filter(([, v]) => String(v ?? '').trim());
      const rec = chosenId === r.id ? `<p>Recomendada por quem desenhou${m.choice?.why ? `: ${esc(m.choice.why)}` : '.'}</p>` : '';
      const traded = m.rejected_tradeoffs?.[r.id] ? `<p>Por que não é a recomendada: ${esc(m.rejected_tradeoffs[r.id])}</p>` : '';
      if (!rows.length && !rec && !traded) return '';
      return `<details class="det"><summary>Como saber se funciona</summary>${rec}${traded}${rows.length ? `<dl class="muda">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}</details>`;
    };
    const details = (r) => {
      if (r.is_current) {
        const probs = cited.length ? `<details class="det"><summary>Problemas de hoje (${cited.length})</summary><ul class="probs">${cited.map((id) => { const it = registry.get(id); return `<li>${esc(plainFinding(it, { rules, where: whereToday(it) }))}</li>`; }).join('')}</ul></details>` : '';
        const tech = cited.length ? `<details class="det tec"><summary>Para quem constrói</summary><p>Achados citados pelas versões: ${esc(cited.map((id) => `${id}${registry.get(id)?.rule ? ` (${registry.get(id).rule})` : ''}`).join(', '))}.</p></details>` : '';
        const blocks = [probs, clicksBlock(r), tech].filter(Boolean).join('');
        return blocks ? `<div class="dets">${blocks}</div>` : '';
      }
      const x = lint?.variants?.[r.id];
      const st = new Map((x?.resolves ?? []).map((y) => [y.id, y]));
      const fresh = x?.new ?? [];
      const baseKeys = new Set((lint?.current?.findings ?? []).map((y) => y.key));
      const allFresh = (x?.findings ?? []).filter((y) => !baseKeys.has(y.key));
      const stepOfFrame = new Map((r.frames ?? []).map((f) => [f.id, f.step]));
      const changes = AXES.filter((a) => String(r.changes?.[a] ?? '').trim()).map((a) => `<div><dt>${AXIS_PT[a]}</dt><dd>${esc(r.changes[a])}</dd></div>`).join('');
      const resolves = r.resolves ?? [];
      const v = values[r.id];
      return `<div class="dets">
  <details class="det"><summary>O que muda</summary><dl class="muda">${changes}</dl></details>
  <details class="det"><summary>Por que pode funcionar</summary><p>${esc(r.hypothesis)}</p></details>
  ${betBlock(r)}
  <details class="det"><summary>Riscos (${(r.tradeoffs ?? []).length})</summary><ul>${(r.tradeoffs ?? []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>
  <details class="det"><summary>Problemas que resolve (${v.resolved} confirmado${v.resolved === 1 ? '' : 's'}${v.to_check ? `, ${v.to_check} a conferir` : ''})</summary>${resolves.length ? `<ul class="probs">${resolves.map((id) => problemItem(id, st.get(id), allFresh)).join('')}</ul>` : '<p>Esta versão não diz quais problemas resolve.</p>'}</details>
  ${fresh.length ? `<details class="det"><summary>Novos pontos de atenção (${fresh.length})</summary><ul class="probs">${fresh.map((f) => { const steps = [...new Set((f.frames ?? []).map((id) => stepOfFrame.get(id)).filter(Boolean))]; return `<li><span class="selo selo-${f.severity >= 3 ? 'bad' : 'check'}">${f.severity >= 3 ? 'grave' : 'atenção'}</span> ${esc(plainFinding(f, { rules, where: steps.length ? `em ${steps.join(', ')}` : '' }))}</li>`; }).join('')}</ul></details>` : ''}
  ${clicksBlock(r)}
  ${techBlock(r)}
</div>`;
    };
    const panel = (r) => `<section role="tabpanel" class="painel" id="v-${esc(slug(r.id))}" aria-labelledby="tab-${esc(slug(r.id))}" tabindex="-1"${r.id === pageRows[0].id ? '' : ' hidden'}>
  <h3 class="sr">${esc(labelOf(r))}</h3>${r.is_current ? '' : `<p class="p-ideia">${esc(r.concept)}</p>`}
  ${deck(r)}
  ${details(r)}
</section>`;
    const tabs = `<div class="abas" role="tablist" aria-label="Versões">${pageRows.map((r, i) => `<button type="button" role="tab" id="tab-${esc(slug(r.id))}" aria-controls="v-${esc(slug(r.id))}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${esc(r.id)}"><span class="letra">${esc(letters.get(r.id))}</span> ${esc(r.is_current ? 'Como é hoje' : r.name)}</button>`).join('')}</div>
  <label class="sel-aba">Versão <select id="aba-sel">${pageRows.map((r) => `<option value="${esc(r.id)}">${esc(labelOf(r))}</option>`).join('')}</select></label>
`;

    // ---------- decisão ----------
    const opt = (id) => `<option value="${esc(id)}">${esc(id === cur.id ? 'Hoje' : `${letters.get(id)} · ${rows.find((r) => r.id === id)?.name ?? ''}`)}</option>`;
    const choice = (r) => `<label class="op"><input type="radio" name="variante" value="${esc(r.id)}"><span class="letra${r.is_current ? ' letra-hoje' : ''}">${esc(letters.get(r.id))}</span><span>${esc(r.is_current ? 'Nenhuma, manter como está' : r.name)}</span></label>`;
    const importCmd = `node ${opts.dsx_rel ?? '<DSX>'}/tools/ux-lint/variations.mjs import --root . decision.json`;
    const decision = `<section class="dec" id="decisao" aria-labelledby="dec-t">
  <h2 id="dec-t">Qual seguir?</h2>
  <p class="retomada" id="retomada" role="status" hidden><span>Retomamos sua escolha anterior, salva neste navegador.</span> <button type="button" id="limpar">Limpar</button></p>
  <fieldset class="escolha" id="escolha" aria-describedby="escolha-erro"><legend class="sr">Versão escolhida</legend>${rows.map(choice).join('')}</fieldset>
  <p class="erro erro-grupo" id="escolha-erro" hidden>Escolha uma versão antes de copiar.</p>
  <p class="nota" id="escolha-nota" hidden>Com a mistura ligada, a escolha vem das partes escolhidas abaixo. Desligue a mistura para escolher uma versão inteira.</p>
  <label class="campo">Comentário <textarea name="comentario" rows="3" placeholder="Por que esta escolha; o que ajustar ao construir"></textarea></label>
  <label class="campo">Quem decide (obrigatório) <input name="por" autocomplete="name" required aria-required="true" aria-describedby="por-erro"></label>
  <p class="erro" id="por-erro" hidden>Diga quem decide antes de copiar.</p>
  <details class="mistura" id="mistura"><summary>Misturar partes de versões diferentes</summary>
    <label class="chk"><input type="checkbox" name="misturar"> Usar a mistura abaixo em vez de uma versão inteira</label>
    <div class="eixos">${AXES.map((a) => `<label class="eixo">${AXIS_PT[a]} <select name="eixo-${a}">${rows.map((r) => opt(r.id)).join('')}</select><span class="nota" data-eixo-nota="${a}"></span></label>`).join('')}</div>
    <p class="nota">Misturar pode dar uma combinação incoerente (o texto de uma versão falando de um passo que outra tirou): descreva a mistura no comentário.</p>
  </details>
  <div class="acoes"><button type="button" id="copiar">Copiar decisão</button><span id="dec-resumo"></span></div>
  <p role="status" id="copiado"></p>
  <p class="nota">Depois de copiar, cole na conversa com quem conduz o projeto (ou envie por e-mail). Sua escolha fica salva só neste navegador.</p>
  <details class="json tec" id="tec-dec"><summary>Para quem constrói</summary>
    <p>Arquivo da decisão (o mesmo texto que "Copiar decisão" copia):</p><pre id="dec-json" aria-label="Arquivo da decisão"></pre>
    <p>Para gravar no projeto, salve como <code>decision.json</code> e rode <code>${esc(importCmd)}</code>.</p></details>
</section>`;

    // ---------- como contamos ----------
    const div = rows.flatMap((r) => (opts.measured?.[r.id]?.divergences ?? []).map((x) => `${letters.get(r.id)}: ${METRIC_PT[x.metric] ?? x.metric} medido ${x.measured}, declarado ${x.declared}`));
    const ncs = rows.flatMap((r) => Object.entries(r.metrics_detail?.not_comparable ?? {}).map(([k, why]) => `${letters.get(r.id)}, ${METRIC_PT[k] ?? k}: ${why}`));
    const techAbout = m.metrics_method_tech || (opts.warnings ?? []).length
      ? `<details class="det tec"><summary>Para quem constrói</summary>${m.metrics_method_tech ? `<p>${esc(m.metrics_method_tech)}</p>` : ''}${(opts.warnings ?? []).length ? `<p>Avisos da preparação: ${esc(opts.warnings.join(' · '))}</p>` : ''}</details>` : '';
    const about = `<details class="sobre"><summary>Como os números foram contados</summary>
  <p><b>Telas:</b> telas diferentes do começo ao fim do caminho principal; diálogo não conta como tela.</p>
  <p><b>Cliques ${esc(doneNoun)}:</b> cliques no caminho principal até o fim da tarefa. A lista de cada versão está nos detalhes dela.</p>
  <p><b>Palavras por tela:</b> média das palavras visíveis no conteúdo, medida nas telas (sem o menu e o cabeçalho do produto).</p>
  <p><b>Problemas resolvidos:</b> dos ${cited.length} problemas de hoje citados pelas versões, quantos a verificação confirma como resolvidos. São achados de texto, de tela e de posição, contados um a um e sem peso (um problema que se repete em várias telas conta várias vezes). Os que ainda precisam de conferência aparecem ao lado e os que continuam não contam; quando o que falta conferir pode mudar quem lidera, nenhuma versão leva o selo.</p>
  <p>Menos é melhor, exceto em problemas resolvidos.</p>
  ${m.persona ? `<p><b>Para quem:</b> ${esc(m.persona)}</p>` : ''}
  ${m.task ? `<p><b>Tarefa:</b> ${esc(m.task)}</p>` : ''}
  ${m.metrics_method ? `<p><b>Como esta comparação contou:</b> ${esc(m.metrics_method)}</p>` : ''}
  ${div.length ? `<p><b>Medido diferente do declarado:</b> ${esc(div.join(' · '))}.</p>` : ''}
  ${ncs.length ? `<p><b>Números não comparáveis:</b> ${esc(ncs.join(' · '))}.</p>` : ''}
  ${lint && !lint.layout ? '<p>A posição dos elementos na tela não foi medida nesta geração: problemas de posição aparecem como "precisa conferir".</p>' : ''}
  ${techAbout}
</details>`;

    const nav = chunks.length < 2 ? '' : `<nav class="paginas" aria-label="Páginas">${chunks.map((c, i) => `<a href="${esc(pageFileName(file, i + 1))}"${i + 1 === n ? ' aria-current="page"' : ''}>${i + 1} · ${esc(c.slice(1).map((r) => letters.get(r.id)).join(', '))}</a>`).join('')}</nav>`;
    const summary = rows.map(summaryCard).join('');
    const moment = sameMoment ? `<p class="momento">As telas dos cartões mostram o mesmo momento do fluxo: o passo ${esc(curHero.step)} de hoje e o equivalente em cada versão.</p>` : '';
    const panels = pageRows.map(panel).join('');
    const data = `<script type="application/json" id="vx-data">${JSON.stringify(Object.fromEntries(used)).replace(/</g, '\\u003c')}</script>`;
    const model = { key: storeKey, module: m.module, flow: m.flow, ids: rows.map((r) => r.id), current: cur.id, names: Object.fromEntries(rows.map((r) => [r.id, labelOf(r)])), changes: Object.fromEntries(rows.map((r) => [r.id, r.changes ?? {}])) };
    const cropCss = [...crops].map(([css, k]) => (k.startsWith('k') ? `.${k}{${css.replace(/\.KEY/g, `.${k}`)}}` : `.${k}{${css}}`)).join('\n');
    const head = full ? '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' : '';
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
h1{margin:0;font:600 28px/1.2 var(--serif);text-wrap:balance}.lede{margin:0;font-size:15px;max-width:72ch}
h2,h3{text-wrap:balance}
button:focus-visible,a:focus-visible,select:focus-visible,textarea:focus-visible,input:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.letra{display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 7px;border-radius:7px;background:var(--accent);color:var(--on-accent);font-weight:700;font-size:13px;flex:none}
.hoje .letra,.letra-hoje{background:var(--fg);color:var(--surface)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.nota{color:var(--muted);font-size:13px;margin:0}
/* resumo */
.momento{margin:0 0 -14px;color:var(--muted);font-size:13px;max-width:72ch}
.resumo{display:grid;grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));gap:14px;align-items:stretch}
.rc{display:grid;grid-template-rows:subgrid;grid-row:span 6;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px;min-width:0}
.rc.hoje{background:color-mix(in srgb,var(--bg) 60%,var(--surface))}
.rc header{display:flex;gap:10px;align-items:flex-start}.rc h2{margin:0;font:600 17px/1.25 var(--serif)}
.ideia{margin:2px 0 0;font-size:13px;color:var(--muted);line-height:1.4}
.z{all:unset;cursor:zoom-in;display:block;width:100%;box-sizing:border-box;border-radius:8px;min-width:0;position:relative}.z img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff}
.kb{position:relative;display:block;overflow:hidden;border:1px solid var(--line);border-radius:8px;background:#fff}
.z .kb img{position:absolute;max-width:none;height:auto;border:0;border-radius:0}
.mk{position:absolute;outline:2px solid #B45309;outline-offset:5px;box-shadow:0 0 0 7px rgba(255,255,255,.6);border-radius:4px;pointer-events:none}
.z-tag{display:block;text-align:right;margin-top:4px;color:var(--accent);font-size:13px;font-weight:600}.z-tag::before{content:'⤢ '}
.sem{display:grid;place-items:center;aspect-ratio:16/10;border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-size:12px;text-align:center;padding:8px}
.kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin:0;font-variant-numeric:tabular-nums}
.kpi{min-width:0}.kpi dt{font-size:12px;color:var(--muted);line-height:1.25}.kpi dd{margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 6px}
.kpi b{font-size:22px;line-height:1.15;font-weight:400;color:var(--muted)}.kpi.lidera b{font-weight:500;color:var(--fg)}.kpi small{color:var(--muted);font-size:12px}
.d{font-size:12px;font-weight:600}.d-better{color:var(--ok)}.d-worse{color:var(--bad)}.d-same{color:var(--muted)}
.best{font-size:12px;font-weight:700;color:var(--ok);background:var(--ok-soft);border-radius:999px;padding:0 8px}
.mais,.aviso,.nc-why{flex-basis:100%;font-size:12px;color:var(--warn);margin:0}.mais{color:var(--muted)}
.nc{font-size:12px;font-weight:700;color:var(--warn);background:var(--warn-soft);border-radius:999px;padding:0 8px}
.gc{margin:0;font-size:13px;line-height:1.4}.gc strong{display:inline-block;min-width:44px;font-weight:700}.ganha strong{color:var(--ok)}.custa strong{color:var(--bad)}
.ver{color:var(--accent);font-weight:600;text-decoration:none;align-self:end;padding:10px 0;min-height:44px}.ver:hover{text-decoration:underline}
/* versões */
.versoes{display:grid;gap:14px;min-width:0}.versoes>h2,.dec h2{margin:0;font:600 22px var(--serif)}
.abas{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line)}
.abas button{font:600 14px var(--sans);display:inline-flex;gap:8px;align-items:center;border:1px solid transparent;border-bottom:0;background:none;color:var(--muted);padding:8px 14px;min-height:44px;border-radius:10px 10px 0 0;cursor:pointer;margin-bottom:-1px}
.abas button[aria-selected="true"]{background:var(--surface);color:var(--fg);border-color:var(--line)}
.abas button:not([aria-selected="true"]) .letra{background:var(--line);color:var(--fg)}
.sel-aba{display:none;gap:6px;font-weight:600}.sel-aba select{font:600 15px var(--sans);padding:10px;border:1px solid var(--control-line);border-radius:8px;background:var(--surface);color:var(--fg);width:100%;min-height:44px}
.painel{display:grid;gap:14px;min-width:0}.painel:focus{outline:none}
.p-ideia{margin:0;font:600 17px/1.4 var(--serif);max-width:72ch}
.deck{display:grid;gap:10px;min-width:0}
.barra{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:3;background:var(--bg);padding:8px 0}
.ind{margin:0;font-size:15px}.ind-n{color:var(--muted)}
.bts{display:flex;flex-wrap:wrap;gap:8px}.cmp-nota{flex-basis:100%;text-align:right}
.par-z{width:auto!important}
.bts button,.cmp-acoes button,#limpar{font:600 13px var(--sans);border:1px solid var(--control-line);background:var(--surface);color:var(--fg);border-radius:8px;padding:8px 14px;min-height:44px;cursor:pointer}
.bts button:disabled{opacity:.45;cursor:default}
.bt-cmp[aria-pressed="true"]{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.trilha{display:flex;flex-wrap:wrap;gap:8px 24px}
.tg{display:grid;gap:4px;min-width:0}.tg-t{margin:0;font-size:12px;font-weight:600;color:var(--muted)}
.tg ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.tg button{font:500 13px var(--sans);border:1px solid var(--control-line);background:var(--surface);color:var(--fg);border-radius:999px;padding:4px 12px;min-height:36px;cursor:pointer}
.tg button span{color:var(--muted);font-weight:700;margin-right:2px}
.tg button[aria-current="step"]{background:var(--accent-soft);border-color:var(--accent);color:var(--fg)}
.slides{list-style:none;margin:0;padding:0}
.slide{display:grid;gap:10px;justify-items:center}
.palco,.palco>figure{width:100%;max-width:1100px;margin:0}
.palco{display:grid;gap:10px}
.par{display:grid;gap:8px;width:100%}.par figure{margin:0;min-width:0}
.tag{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:4px}
.tag-depois{color:var(--accent)}.tag-hoje{color:var(--fg)}
.sub{margin:4px 0 0;font-size:13px;color:var(--muted);max-width:72ch}
.acao{margin:4px 0;justify-self:center;align-self:center;display:flex;gap:8px;align-items:center;background:var(--accent);color:var(--on-accent);font-weight:600;border-radius:999px;padding:8px 16px;max-width:100%;text-align:center}
.seta::before{content:'↓';font-size:18px;line-height:1}
.par-nota{margin:0;font-size:13px;color:var(--muted)}
.legenda{margin:0;max-width:min(72ch,1100px);width:100%;font-size:15px;line-height:1.5}
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;max-width:1100px;min-width:0}
.cmp-acoes{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin:0}
.slide:has(.cmp:not([hidden])) .legenda{display:none}.cmp figure{margin:0;min-width:0}
.dets{display:grid;gap:8px;max-width:1100px;width:100%;justify-self:center}
.det{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:0 14px}
.det summary,.mistura summary,.json summary,.sobre summary{cursor:pointer;font-weight:600;padding:11px 0;min-height:44px}
.det ul,.det ol{margin:2px 0 12px;padding-left:20px;display:grid;gap:6px;max-width:72ch}.det p{margin:2px 0 12px;max-width:72ch}
.muda{margin:2px 0 12px;display:grid;gap:10px}.muda div{display:grid;grid-template-columns:130px minmax(0,72ch);gap:8px}.muda dt{font-weight:600}.muda dd{margin:0}
.probs{list-style:none;padding-left:0!important}.why{display:block;margin-top:2px}
.selo{display:inline-block;border-radius:999px;padding:0 8px;font-size:12px;font-weight:700;margin-right:4px}
.selo-ok{background:var(--ok-soft);color:var(--ok)}.selo-bad{background:var(--bad-soft);color:var(--bad)}.selo-check{background:var(--warn-soft);color:var(--warn)}
.tec code,.tec pre{font:12px var(--mono);overflow-wrap:anywhere}
/* decisão */
.dec{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;display:grid;gap:14px;max-width:1100px;width:100%;justify-self:center}
.dec>p{max-width:72ch}
.retomada{margin:0;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;background:var(--accent-soft);border-radius:10px;padding:8px 12px}
.escolha{border:0;margin:0;padding:0;display:grid;gap:8px;max-width:640px}
.escolha:disabled .op{opacity:.55;cursor:not-allowed}
.op{display:flex;gap:10px;align-items:center;border:1px solid var(--control-line);border-radius:10px;padding:10px 12px;min-height:52px;cursor:pointer}
.op:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}
.op input,.chk input{width:24px;height:24px;margin:0;accent-color:var(--accent);flex:none}
.campo{display:grid;gap:4px;font-weight:600;max-width:640px}.campo textarea,.campo input,.dec select{font:14px var(--sans);color:var(--fg);background:var(--surface);border:1px solid var(--control-line);border-radius:8px;padding:8px;min-height:44px}
.campo input[aria-invalid="true"]{border-color:var(--bad)}
.erro{margin:-8px 0 0;color:var(--bad);font-size:13px;font-weight:600}
.mistura,.json,.sobre{border:1px solid var(--line);border-radius:10px;padding:0 14px;background:var(--surface)}
.chk{display:flex;gap:10px;align-items:center;margin:4px 0 12px;min-height:44px}
.eixos{display:grid;gap:10px;max-width:640px}.eixo{display:grid;gap:4px;font-weight:600}.eixo .nota{font-weight:400}
.mistura>.nota{margin:12px 0;max-width:72ch}.json>p{max-width:72ch}
.acoes{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
#copiado{margin:0;font-weight:600;color:var(--ok)}#copiado:empty{display:none}
#copiar{font:600 14px var(--sans);background:var(--accent);color:var(--on-accent);border:0;border-radius:8px;padding:10px 18px;min-height:44px;cursor:pointer}
#dec-json{margin:4px 0 12px;background:var(--bg);border-radius:8px;padding:10px;white-space:pre-wrap}
.sobre{max-width:1100px;width:100%;justify-self:center}.sobre>p{margin:0 0 10px;max-width:72ch}.sobre>.det{margin-bottom:12px}
.paginas{display:flex;flex-wrap:wrap;gap:6px}.paginas a{color:var(--accent);text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:4px 10px;background:var(--surface)}.paginas a[aria-current="page"]{background:var(--accent);color:var(--on-accent)}
#zoom{border:0;padding:0;margin:0;width:100vw;height:100vh;max-width:none;max-height:none;background:var(--surface);color:var(--fg)}#zoom::backdrop{background:rgba(8,12,20,.8)}
#zoom[open]{display:grid;grid-template-rows:auto 1fr}
.z-cab{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--line);font-size:14px}
.z-cab div{display:flex;gap:6px}
#zoom button{font:600 13px var(--sans);border:1px solid var(--control-line);background:var(--surface);color:var(--fg);border-radius:8px;padding:6px 12px;min-height:44px;min-width:44px;cursor:pointer}
.z-corpo{overflow:auto;padding:12px;background:var(--bg);touch-action:pan-x pan-y pinch-zoom}
#z-body{display:flex;gap:16px;align-items:flex-start;width:max-content;min-width:100%;justify-content:center}
#z-body figure{margin:0;display:grid;gap:6px}#z-body figcaption{font-weight:600}
#z-body img{display:block;max-width:calc(100vw - 40px);height:auto;background:#fff}
#z-body.z-par img{max-width:calc(50vw - 36px)}
#z-body.real img{max-width:none}
#z-real[aria-pressed="true"]{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
@media (min-width:1200px){
  .palco:has(.par){max-width:1400px}
  .par{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:start}
  .par.so{grid-template-columns:auto minmax(0,1fr)}
  .acao{flex-direction:column;max-width:150px;border-radius:14px;margin-top:40px}
  .seta::before{content:'→'}
}
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
${cropCss}
.resumo{--cols:${rows.length}}
</style>
${full ? '</head>\n<body>\n' : ''}<div class="pg" lang="pt-BR">
  <header class="topo">
    <div class="eyebrow">${opts.product ? `${esc(opts.product)} · ` : ''}${esc(m.title)} · ${rows.length - 1} versões</div>
    <h1>${esc(question)}</h1>
    <p class="lede">${esc(lead.sentence)}</p>
    ${nav}
  </header>
  ${moment}
  <section class="resumo" aria-label="Resumo das versões">${summary}</section>
  <section class="versoes" aria-labelledby="ver-t">
    <h2 id="ver-t">Passo a passo</h2>
    ${tabs}
    ${panels}
  </section>
  ${decision}
  ${about}
  ${nav}
</div>
<dialog id="zoom" aria-label="Tela ampliada"><div class="z-cab"><span id="z-cap"></span><div><button type="button" data-z="-1" aria-label="Imagem anterior">←</button><button type="button" data-z="1" aria-label="Próxima imagem">→</button><button type="button" id="z-real" aria-pressed="false">Tamanho real</button><button type="button" data-z="0">Fechar</button></div></div><div class="z-corpo"><div id="z-body"></div></div></dialog>
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
dk.querySelector('.ind-n').textContent=sl[i].dataset.ind;dk.querySelector('.ind-s').textContent=sl[i].dataset.step;
dk.querySelectorAll('[data-go]').forEach(b=>{if(Number(b.dataset.go)===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
const pb=dk.querySelector('[data-mv="-1"]'),nb=dk.querySelector('[data-mv="1"]');if(i===0&&document.activeElement===pb)nb.focus();if(i===n-1&&document.activeElement===nb)pb.focus();pb.disabled=i===0;nb.disabled=i===n-1;S.slide[dk.dataset.row]=i;save(S);};
const setCmp=(dk,on)=>{const b=dk.querySelector('.bt-cmp');if(!b)return;b.setAttribute('aria-pressed',String(on));dk.querySelectorAll('.slide').forEach(s=>{const c=s.querySelector('.cmp');if(c){c.hidden=!on;s.querySelector('.palco').hidden=on;}});S.cmp=on;save(S);};
decks.forEach(dk=>{dk.querySelectorAll('[data-mv]').forEach(b=>b.addEventListener('click',()=>go(dk,Number(dk.dataset.at||0)+Number(b.dataset.mv))));
dk.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(dk,Number(b.dataset.go))));
const c=dk.querySelector('.bt-cmp');if(c)c.addEventListener('click',()=>{const on=c.getAttribute('aria-pressed')!=='true';decks.forEach(d=>setCmp(d,on));});
go(dk,Number(S.slide[dk.dataset.row]||0));if(S.cmp)setCmp(dk,true);});
const hashTab=()=>{const h=decodeURIComponent(location.hash.slice(1));const p=h.startsWith('v-')&&document.getElementById(h);if(p&&p.getAttribute('role')==='tabpanel'){const t=tabs.find(x=>x.getAttribute('aria-controls')===h);if(t){setTab(t.dataset.tab);return true;}}return false;};
if(!hashTab()&&S.tab)setTab(S.tab);
window.addEventListener('hashchange',hashTab);
document.querySelectorAll('[data-goto]').forEach(a=>a.addEventListener('click',e=>{if(!a.getAttribute('href').startsWith('#'))return;e.preventDefault();if(setTab(a.dataset.goto)){const p=document.getElementById('v-'+a.dataset.goto.replace(/[^a-zA-Z0-9_-]/g,'-'));p.scrollIntoView({block:'start'});p.focus({preventScroll:true});history.replaceState(null,'','#'+p.id);}}));
const z=document.getElementById('zoom'),zb=document.getElementById('z-body'),zc=document.getElementById('z-cap');let list=[],at=0;
const fig=(k,name,cap)=>{const f=document.createElement('figure');if(cap){const c=document.createElement('figcaption');c.textContent=cap;f.append(c);}const im=new Image();im.src=D[k]||'';im.alt=name||'';f.append(im);return f;};
const show=(i)=>{at=(i+list.length)%list.length;const b=list[at];
zb.classList.toggle('z-par',!!b.dataset.pair);if(b.dataset.pair){const ks=b.dataset.pair.split('|'),ns=(b.dataset.names||'').split('|');zb.replaceChildren(...ks.map((k,j)=>fig(k,ns[j],ns[j])));}else zb.replaceChildren(fig(b.dataset.full,[b.dataset.name,b.dataset.cap].filter(Boolean).join(' · '),''));
const s=document.createElement('b');s.textContent=b.dataset.name||'';const rest=[b.dataset.cap,list.length>1?(b.dataset.unit||'Imagem')+' '+(at+1)+' de '+list.length:''].filter(Boolean).join(' · ');zc.replaceChildren(s,rest?' · '+rest:'');
z.querySelectorAll('[data-z="-1"],[data-z="1"]').forEach(x=>x.hidden=list.length<2);z.querySelector('.z-corpo').scrollTo(0,0);};
document.querySelectorAll('.z[data-full],.z[data-pair]').forEach(b=>b.addEventListener('click',()=>{const scope=b.dataset.pair?null:(b.closest('.slide')||b.closest('.resumo'));list=scope?[...scope.querySelectorAll('.z[data-full]')].filter(x=>x.offsetParent!==null):[b];if(!list.includes(b))list=[b];show(list.indexOf(b));if(z.showModal)z.showModal();else z.setAttribute('open','');}));
const zr=document.getElementById('z-real');zr.addEventListener('click',()=>{const on=zr.getAttribute('aria-pressed')!=='true';zr.setAttribute('aria-pressed',String(on));zb.classList.toggle('real',on);});
z.querySelectorAll('[data-z]').forEach(b=>b.addEventListener('click',()=>{const d=Number(b.dataset.z);if(d)show(at+d);else z.close();}));
z.addEventListener('keydown',e=>{if(list.length<2)return;if(e.key==='ArrowRight'){show(at+1);e.preventDefault();}if(e.key==='ArrowLeft'){show(at-1);e.preventDefault();}});
z.addEventListener('click',e=>{if(e.target===z)z.close();});
document.addEventListener('keydown',e=>{if(z.open||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;if(e.target.closest&&e.target.closest('input,textarea,select,[role=tablist]'))return;
const p=document.querySelector('.painel:not([hidden])');const dk=p&&p.querySelector('.deck');if(!dk)return;const r=p.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;e.preventDefault();go(dk,Number(dk.dataset.at||0)+(e.key==='ArrowRight'?1:-1));});
const f=document.getElementById('decisao'),out=document.getElementById('dec-json'),mx=document.getElementById('mistura'),fs=document.getElementById('escolha'),por=f.querySelector('[name=por]'),perr=document.getElementById('por-erro'),ret=document.getElementById('retomada');
const val=(n)=>{const x=f.querySelector('[name="'+n+'"]:checked');return x?x.value:null;};
const AX=${JSON.stringify(AXES)};
const mixing=()=>f.querySelector('[name=misturar]').checked;
const read=()=>{const mode=mixing()?'compose':'variant';const d={format:1,module:M.module,flow:M.flow,mode};
if(mode==='variant')d.variant=val('variante');else{d.compose={};AX.forEach(a=>{d.compose[a]=f.querySelector('[name="eixo-'+a+'"]').value;});}
d.comment=f.querySelector('[name=comentario]').value.trim();d.by=por.value.trim();d.at=new Date().toISOString().slice(0,10);return d;};
const notes=()=>{AX.forEach(a=>{const v=f.querySelector('[name="eixo-'+a+'"]').value;const t=(M.changes[v]||{})[a]||(v===M.current?'como hoje':'');f.querySelector('[data-eixo-nota="'+a+'"]').textContent=t;});};
const AXN={screen:'tela',flow:'fluxo',behavior:'comportamento',text:'texto'};
const summ=(d)=>d.mode==='compose'?'Sua escolha: mistura ('+AX.map(a=>AXN[a]+' '+(d.compose[a]===M.current?'de hoje':'de '+String(M.names[d.compose[a]]||'').split(' · ')[0])).join(', ')+').':d.variant?'Sua escolha: '+(d.variant===M.current?'nenhuma, manter como está':M.names[d.variant])+'.':'Nenhuma escolha ainda.';
const lockChoice=()=>{const on=mixing();fs.disabled=on;document.getElementById('escolha-nota').hidden=!on;};
const sync=()=>{notes();lockChoice();const d=read();if(d.variant||d.mode==='compose')document.getElementById('escolha-erro').hidden=true;out.textContent=JSON.stringify(d,null,2);document.getElementById('dec-resumo').textContent=summ(d);if(d.by){perr.hidden=true;por.removeAttribute('aria-invalid');}S.decision=d;save(S);};
const fill=(d)=>{f.querySelectorAll('[name=variante]').forEach(x=>x.checked=!!d&&x.value===d.variant);f.querySelector('[name=misturar]').checked=!!d&&d.mode==='compose';mx.open=!!d&&d.mode==='compose';
AX.forEach(a=>{const s=f.querySelector('[name="eixo-'+a+'"]');const v=d&&d.compose&&d.compose[a];s.value=v&&[...s.options].some(o=>o.value===v)?v:M.current;});f.querySelector('[name=comentario]').value=(d&&d.comment)||'';por.value=(d&&d.by&&d.by!=='dono')?d.by:'';};
const had=S.decision&&(S.decision.variant||S.decision.mode==='compose'||S.decision.comment||S.decision.by);
if(had){fill(S.decision);ret.hidden=false;}
document.getElementById('limpar').addEventListener('click',()=>{fill(null);S.decision=null;save(S);ret.hidden=true;document.getElementById('copiado').textContent='';sync();});
f.addEventListener('input',sync);f.addEventListener('change',sync);sync();
document.getElementById('copiar').addEventListener('click',async()=>{const d=read();const st=document.getElementById('copiado');
const ge=document.getElementById('escolha-erro');if(d.mode==='variant'&&!d.variant){ge.hidden=false;st.textContent='';f.querySelector('[name=variante]').focus();return;}ge.hidden=true;
if(!d.by){perr.hidden=false;por.setAttribute('aria-invalid','true');por.focus();st.textContent='';return;}
const t=JSON.stringify(d,null,2);try{await navigator.clipboard.writeText(t);st.textContent='Decisão copiada. Cole na conversa com quem conduz o projeto (ou envie por e-mail).';}catch(e){document.getElementById('tec-dec').open=true;const r=document.createRange();r.selectNodeContents(out);const s=getSelection();s.removeAllRanges();s.addRange(r);st.textContent='Não deu para copiar sozinho: o texto da decisão está selecionado abaixo; copie e cole na conversa com quem conduz o projeto.';}});
})();
</script>${full ? '\n</body>\n</html>\n' : ''}`;
    return { file: pageFileName(file, n), html, bytes: Buffer.byteLength(html) };
  });
}
