// Página de comparação de variações de UX (variations.mjs page). Uma linha por variante (Hoje + A/B/C) com os
// frames do fluxo em colunas, na ordem dos passos; cartão com conceito, mudanças por eixo, hipótese, trade-offs,
// achados que resolve e métricas comparadas com hoje; vista "lado a lado por passo"; decisão por variante inteira
// ou por eixo, copiada como JSON. Mesma linguagem visual e tokens da página de achados (text-page.mjs).
// Sem dependências e sem navegador: as imagens já vêm prontas (variations.mjs shootCaptures).
import { THEME_TOKENS, pageFileName } from '../text-page.mjs';
import { embedded, embeddedSize } from './preview-page.mjs';

export const PAGE_MAX_BYTES = 10 * 1024 * 1024;
const AXES = ['screen', 'flow', 'behavior', 'text'];
const AXIS_PT = { screen: 'Tela', flow: 'Fluxo', behavior: 'Comportamento', text: 'Texto' };
const METRICS = ['steps', 'clicks_to_done', 'dialogs', 'primary_actions', 'words_on_screen', 'decisions'];
const METRIC_PT = { steps: 'Passos', clicks_to_done: 'Cliques até concluir', dialogs: 'Diálogos', primary_actions: 'Ações primárias', words_on_screen: 'Palavras por tela', decisions: 'Decisões' };
const KIND_PT = { screen: 'tela', state: 'estado', behavior: 'comportamento' };
const STATUS_PT = { resolved: 'resolvido', persists: 'persiste', unverified: 'sem verificação' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const prefixed = (p, s) => (new RegExp(`^${p}\\b`, 'i').test(String(s ?? '').trim()) ? String(s).trim() : `${p}: ${s ?? ''}`);
const slug = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, '-');

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

/** Diferença contra hoje: todas as métricas são "menos é melhor". */
export function delta(cur, val) {
  const c = Number(cur), v = Number(val);
  if (!Number.isFinite(c) || !Number.isFinite(v)) return { kind: 'na', text: '—' };
  const d = Math.round((v - c) * 10) / 10;
  if (d === 0) return { kind: 'same', text: '=', sr: 'igual a hoje' };
  return d < 0 ? { kind: 'better', text: `▼ ${Math.abs(d)}`, sr: `${Math.abs(d)} a menos que hoje, melhor` } : { kind: 'worse', text: `▲ ${d}`, sr: `${d} a mais que hoje, pior` };
}

function imagesOf(row, shots) {
  const keys = [];
  for (const f of row.frames ?? []) { const s = shots.get(f.capture); if (s) keys.push(s.thumb, s.full); }
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
 * opts: { lint, measured: { rowId: { metrics, divergences } }, registry (Map), shots (Map captura → {thumb, full}),
 *         shotsDir, file, product, findings_page, warnings, maxBytes, dsx_rel, rows (opcional, para testes) }.
 */
export function renderVariationsPages(m, opts = {}) {
  const rows = opts.rows ?? [{ ...(m.current ?? {}), id: m.current?.id ?? 'current', is_current: true }, ...(m.variants ?? []).map((v) => ({ ...v, is_current: false }))];
  const shots = opts.shots ?? new Map();
  const dir = opts.shotsDir ?? '.';
  const file = opts.file ?? 'variations.html';
  const registry = opts.registry ?? new Map();
  const lint = opts.lint ?? null;
  const letters = new Map(rows.map((r, i) => [r.id, letterOf(r, i - 1)]));
  const cur = rows[0];
  const chunks = paginateRows(rows, { shots, sizeOf: (k) => embeddedSize(dir, k), maxBytes: opts.maxBytes ?? PAGE_MAX_BYTES });
  const storeKey = `dsx-variations:${m.module}:${m.flow}`;
  const cited = [...new Set(rows.flatMap((r) => r.resolves ?? []))];

  return chunks.map((pageRows, idx) => {
    const n = idx + 1;
    const used = new Map();
    const use = (k) => { if (!used.has(k)) { const e = embedded(dir, k); if (e?.uri) used.set(k, e.uri); } return k; };
    const thumb = (f, rowKey, label) => {
      const s = shots.get(f.capture);
      const alt = `${label} · ${f.step}: ${f.caption ?? f.id}`;
      if (!s) return `<span class="th th-none" role="img" aria-label="${esc(alt)}"><span>${esc(f.caption ?? f.id)}</span><small>sem miniatura</small></span>`;
      return `<button type="button" class="th" data-row="${esc(rowKey)}" data-full="${esc(use(s.full))}" aria-label="Ampliar: ${esc(alt)}"><img data-k="${esc(use(s.thumb))}" alt="${esc(alt)}" width="720" height="450"></button>`;
    };
    const frameFig = (f, rowKey, label) => `<figure class="fr"><div class="fr-k">${esc(KIND_PT[f.kind] ?? f.kind)}</div>${thumb(f, rowKey, label)}<figcaption>${esc(f.caption ?? '')}</figcaption></figure>`;
    const cell = (c, rowKey, label) => (c.type === 'behavior'
      ? `<div class="par" role="group" aria-label="Comportamento: ${esc(c.action)}">${c.before ? frameFig({ ...c.before, caption: prefixed('Antes', c.before.caption) }, rowKey, label) : ''}<div class="acao"><span aria-hidden="true">→</span><strong>${esc(c.action)}</strong></div>${frameFig({ ...c.after, kind: 'behavior', caption: prefixed('Depois', c.after.caption ?? c.frame.caption) }, rowKey, label)}</div>`
      : frameFig(c.frame, rowKey, label));

    const metricsTable = (r) => {
      const meas = opts.measured?.[r.id];
      const div = meas?.divergences ?? [];
      const rowsHtml = METRICS.map((k) => {
        const d = delta(cur.metrics?.[k], r.metrics?.[k]);
        return `<tr><th scope="row">${METRIC_PT[k]}</th><td>${esc(cur.metrics?.[k] ?? '—')}</td><td>${esc(r.metrics?.[k] ?? '—')}</td><td class="d d-${d.kind}">${esc(d.text)}${d.sr ? `<span class="sr">${esc(d.sr)}</span>` : ''}</td></tr>`;
      }).join('');
      const note = div.length ? `<p class="nota">Medido nas capturas: ${div.map((x) => `${METRIC_PT[x.metric].toLowerCase()} ${x.measured} (declarada ${x.declared})`).join(' · ')}.</p>` : '';
      return `<table class="met"><caption>Métricas comparadas com hoje (menos é melhor)</caption><thead><tr><th scope="col">Métrica</th><th scope="col">Hoje</th><th scope="col">${esc(letters.get(r.id))}</th><th scope="col">Diferença</th></tr></thead><tbody>${rowsHtml}</tbody></table>${note}`;
    };
    const lintChips = (r) => {
      const x = lint?.variants?.[r.id];
      if (!x) return '';
      const c = (s) => x.resolves.filter((y) => y.status === s).length;
      return `<div class="chips">${x.resolves.length ? `<span class="chip ok">resolve ${c('resolved')} de ${x.resolves.length}</span>` : ''}${c('persists') ? `<span class="chip bad">persiste ${c('persists')}</span>` : ''}${c('unverified') ? `<span class="chip">sem verificação ${c('unverified')}</span>` : ''}<span class="chip ${x.new.length ? 'warn' : 'ok'}">${x.new.length} achado(s) novo(s) ≥ 2</span>${x.blocking.length ? '<span class="chip bad">bloqueia: achado novo ≥ 3</span>' : ''}</div>`;
    };
    const resolvesList = (r) => {
      const st = new Map((lint?.variants?.[r.id]?.resolves ?? []).map((x) => [x.id, x]));
      if (!(r.resolves ?? []).length) return '<p class="nota">Não declara achados que resolve.</p>';
      return `<ul class="res">${r.resolves.map((id) => { const it = registry.get(id); const s = st.get(id); return `<li><a href="#achado-${esc(slug(id))}">${esc(id)}</a> <span class="regra">${esc(it?.rule ?? '?')}</span> ${esc(String(it?.text ?? '').slice(0, 90))}${s ? ` <span class="st st-${s.status}">${STATUS_PT[s.status]}</span><span class="nota"> ${esc(s.reason)}</span>` : ''}</li>`; }).join('')}</ul>`;
    };
    const newList = (r) => {
      const x = lint?.variants?.[r.id];
      if (!x?.new?.length) return '';
      return `<details class="novos"><summary>Achados novos (${x.new.length})</summary><ul>${x.new.map((f) => `<li><span class="sev s${f.severity}">${f.severity}</span> ${esc(f.rule)} · ${esc(String(f.message).slice(0, 140))} <span class="nota">(${esc(f.frames.join(', '))})</span></li>`).join('')}</ul></details>`;
    };
    const card = (r) => {
      if (r.is_current) {
        return `<div class="cartao"><p class="conceito">Como o fluxo é hoje.</p>${r.metrics ? `<dl class="nums">${METRICS.map((k) => `<div><dt>${METRIC_PT[k]}</dt><dd>${esc(r.metrics[k] ?? '—')}</dd></div>`).join('')}</dl>` : ''}</div>`;
      }
      const anchors = [r.archetype ? `<span class="chip">arquétipo ${esc(r.archetype)}</span>` : '', ...(r.patterns ?? []).map((p) => `<span class="chip">padrão ${esc(p)}</span>`), ...(r.laws ?? []).map((l) => `<span class="chip">lei ${esc(l)}</span>`)].join('');
      return `<div class="cartao">
        <div class="col"><p class="conceito">${esc(r.concept)}</p>
        <dl class="eixos">${AXES.map((a) => `<div><dt>${AXIS_PT[a]}</dt><dd>${esc(r.changes?.[a] || '—')}</dd></div>`).join('')}</dl></div>
        <div class="col"><p><strong>Hipótese:</strong> ${esc(r.hypothesis)}</p>
        <div><strong>Trade-offs</strong><ul class="trade">${(r.tradeoffs ?? []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
        ${anchors ? `<div class="chips">${anchors}</div>` : ''}</div>
        <div class="col">${lintChips(r)}
        <div><strong>Achados que diz resolver</strong>${resolvesList(r)}</div>
        ${newList(r)}</div>
        <div class="col">${metricsTable(r)}</div>
      </div>`;
    };
    const rowHtml = (r) => {
      const label = r.is_current ? 'Hoje' : `${letters.get(r.id)} · ${r.name}`;
      const groups = groupsOf(r);
      return `<article class="var${r.is_current ? ' hoje' : ''}" id="v-${esc(slug(r.id))}">
      <header><span class="letra">${esc(letters.get(r.id))}</span><h2>${esc(r.is_current ? (r.name && r.name !== 'Hoje' ? `Hoje · ${r.name}` : 'Hoje') : r.name)}</h2></header>
      <div class="corpo">
        <div class="tira" role="list" aria-label="Frames de ${esc(label)}">${groups.map((g, gi) => `<section class="passo" role="listitem"><h3><span>Passo ${gi + 1}</span> ${esc(g.step)}</h3><div class="cel">${g.cells.map((c) => cell(c, `v-${r.id}`, label)).join('')}</div></section>`).join('')}</div>
        ${card(r)}
      </div>
    </article>`;
    };
    const maxSteps = Math.max(...pageRows.map((r) => groupsOf(r).length));
    const side = `<div class="lado"><table class="grade-lado"><thead><tr><th scope="col">Passo</th>${pageRows.map((r) => `<th scope="col">${esc(letters.get(r.id))}${r.is_current ? '' : ` · ${esc(r.name)}`}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: maxSteps }, (_, i) => `<tr><th scope="row">${i + 1}</th>${pageRows.map((r) => { const g = groupsOf(r)[i]; const label = r.is_current ? 'Hoje' : `${letters.get(r.id)} · ${r.name}`; return `<td>${g ? `<p class="passo-nome">${esc(g.step)}</p>${g.cells.map((c) => cell(c, `p${i + 1}`, label)).join('')}` : '<p class="nota">—</p>'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;

    const opt = (id) => `<option value="${esc(id)}">${esc(letters.get(id))}${id === cur.id ? '' : ` · ${esc(rows.find((r) => r.id === id)?.name ?? '')}`}</option>`;
    const decision = `<section class="dec" id="decisao" aria-labelledby="dec-t">
      <h2 id="dec-t">Decisão</h2>
      <fieldset class="modo"><legend>Como decidir</legend>
        <label><input type="radio" name="modo" value="variant" checked> Uma variante inteira</label>
        <label><input type="radio" name="modo" value="compose"> Compor por eixo</label>
      </fieldset>
      <fieldset data-modo="variant"><legend>Variante</legend>${rows.map((r) => `<label class="esc"><input type="radio" name="variante" value="${esc(r.id)}"> <strong>${esc(letters.get(r.id))}</strong> ${esc(r.is_current ? 'manter como está' : r.name)}</label>`).join('')}</fieldset>
      <fieldset data-modo="compose" hidden><legend>De qual versão vem cada eixo</legend>${AXES.map((a) => `<label class="eixo">${AXIS_PT[a]} <select name="eixo-${a}">${rows.map((r) => opt(r.id)).join('')}</select><span class="nota" data-eixo-nota="${a}"></span></label>`).join('')}</fieldset>
      <label class="campo">Comentário <textarea name="comentario" rows="3" placeholder="Por que esta escolha; o que ajustar ao construir"></textarea></label>
      <label class="campo">Quem decide <input name="por" autocomplete="name"></label>
      <div class="acoes"><button type="button" id="copiar">Copiar decisão</button><span role="status" id="copiado"></span></div>
      <pre id="dec-json" aria-label="Decisão em JSON"></pre>
      <p class="nota">Grave no projeto: <code>node ${esc(opts.dsx_rel ?? '<DSX>')}/tools/ux-lint/variations.mjs import --root . decision.json</code> (cole o JSON num arquivo), ou <code>decide --module ${esc(m.module)} --flow ${esc(m.flow)} --variant &lt;id&gt;</code>.</p>
    </section>`;

    const appendix = cited.length ? `<section class="achados" aria-labelledby="ach-t"><h2 id="ach-t">Achados citados</h2><ul>${cited.map((id) => { const it = registry.get(id); return `<li id="achado-${esc(slug(id))}"><code>${esc(id)}</code> <span class="regra">${esc(it?.rule ?? 'fora do registro')}</span>${it ? ` <span class="sev s${it.severity}">${it.severity}</span> <strong>${esc(it.text)}</strong><br><span class="nota">${esc(it.message ?? '')}${(it.screens ?? []).length ? ` · telas: ${esc(it.screens.join(', '))}` : ''}${(it.source ?? []).length ? ` · ${esc(it.source[0])}` : ''}</span>${opts.findings_page ? ` <a href="${esc(opts.findings_page)}#case-${esc(id)}">abrir na página de achados</a>` : ''}` : ''}</li>`; }).join('')}</ul></section>` : '';

    const nav = chunks.length < 2 ? '' : `<nav class="paginas" aria-label="Páginas">${chunks.map((c, i) => `<a href="${esc(pageFileName(file, i + 1))}"${i + 1 === n ? ' aria-current="page"' : ''}>${i + 1} · ${esc(c.slice(1).map((r) => letters.get(r.id)).join(', '))}</a>`).join('')}</nav>`;
    const head = n === 1 ? '' : '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';
    const data = `<script type="application/json" id="vx-data">${JSON.stringify(Object.fromEntries(used)).replace(/</g, '\\u003c')}</script>`;
    const model = { key: storeKey, module: m.module, flow: m.flow, ids: rows.map((r) => r.id), changes: Object.fromEntries(rows.map((r) => [r.id, r.changes ?? {}])) };
    const html = `${head}<title>Variações · ${esc(m.title)}${n > 1 ? ` · página ${n} de ${chunks.length}` : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">
<style>
/* Layout: topo com a tarefa e as métricas de hoje; uma linha por variante (frames em colunas, na ordem dos passos, e
   o cartão da variante); vista alternativa por passo (colunas = variantes); decisão e achados citados no fim. */
${THEME_TOKENS}
*{box-sizing:border-box}body{background:var(--bg);color:var(--fg);font:14px/1.5 var(--sans);margin:0}
[hidden]{display:none!important}
.pg{max-width:1440px;margin:0 auto;padding:28px 20px 72px;display:grid;gap:24px;min-width:0}
.topo{display:grid;gap:8px}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
h1{margin:0;font:600 30px/1.15 var(--serif);text-wrap:balance}.lede{margin:0;max-width:80ch}.lede b{font-weight:600}
.nums{display:flex;flex-wrap:wrap;gap:8px 20px;margin:0;font-variant-numeric:tabular-nums}.nums div{display:flex;gap:6px}.nums dt{color:var(--muted)}.nums dd{margin:0;font-weight:700}
.aviso{margin:0;font-size:13px;color:var(--warn);background:var(--warn-soft);border-radius:8px;padding:8px 10px}
.vista{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;justify-self:start;position:sticky;top:8px;z-index:3;background:var(--surface)}
.vista button{font:600 13px var(--sans);border:0;background:var(--surface);color:var(--fg);padding:8px 14px;min-height:40px;cursor:pointer}
.vista button[aria-pressed="true"]{background:var(--accent);color:#fff}
button:focus-visible,a:focus-visible,select:focus-visible,textarea:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.var{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;display:grid;gap:12px;min-width:0}
.var.hoje{background:color-mix(in srgb,var(--bad-soft) 35%,var(--surface))}
.var header{display:flex;gap:10px;align-items:center}.var h2{margin:0;font:600 20px var(--serif)}
.letra{display:inline-grid;place-items:center;min-width:32px;height:32px;padding:0 8px;border-radius:8px;background:var(--accent);color:#fff;font-weight:700}
.hoje .letra{background:var(--fg);color:var(--surface)}
.corpo{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
.tira{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;min-width:0;scroll-snap-type:x proximity}
.passo{flex:none;display:grid;gap:6px;align-content:start;scroll-snap-align:start}
.passo h3{margin:0;font-size:13px;font-weight:600}.passo h3 span{color:var(--muted);font-weight:500;margin-right:4px}
.cel{display:flex;gap:10px}
.fr{margin:0;display:grid;gap:4px;width:260px}.fr figcaption{font-size:12px;color:var(--muted)}
.fr-k{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600}
.th{all:unset;cursor:zoom-in;display:block;border-radius:8px}.th img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff}
.th-none{display:grid;place-items:center;aspect-ratio:16/10;border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-size:12px;text-align:center;padding:8px;cursor:default}
.par{display:flex;gap:8px;align-items:center;border:1px dashed var(--accent);border-radius:10px;padding:8px}
.acao{display:grid;gap:2px;justify-items:center;text-align:center;font-size:12px;max-width:120px}.acao span{font-size:22px;color:var(--accent)}
.cartao{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px 24px;font-size:13.5px;min-width:0;border-top:1px solid var(--line);padding-top:12px;align-items:start}.col{display:grid;gap:10px;min-width:0}.cartao p{margin:0}.conceito{font:600 16px/1.35 var(--serif)}
.eixos{margin:0;display:grid;gap:6px}.eixos div{display:grid;grid-template-columns:110px 1fr;gap:8px}.eixos dt{font-weight:600}.eixos dd{margin:0}
.trade,.res,.novos ul,.achados ul{margin:4px 0 0;padding-left:18px;display:grid;gap:4px}
.chips{display:flex;flex-wrap:wrap;gap:6px}.chip{border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:12px}
.chip.ok{background:var(--ok-soft);color:var(--ok);border-color:transparent}.chip.bad{background:var(--bad-soft);color:var(--bad);border-color:transparent}.chip.warn{background:var(--warn-soft);color:var(--warn);border-color:transparent}
.regra{font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:0 6px}
.st{border-radius:999px;padding:0 8px;font-weight:600;font-size:12px}.st-resolved{background:var(--ok-soft);color:var(--ok)}.st-persists{background:var(--bad-soft);color:var(--bad)}.st-unverified{background:var(--line);color:var(--fg)}
.sev{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;font-size:11px;font-weight:700}
.s0,.s1{background:var(--accent-soft);color:var(--accent)}.s2{background:var(--warn-soft);color:var(--warn)}.s3,.s4{background:var(--bad-soft);color:var(--bad)}
.nota{color:var(--muted);font-size:12.5px}
.met{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}.met caption{text-align:left;font-weight:600;padding-bottom:4px}
.met th,.met td{border-bottom:1px solid var(--line);padding:4px 6px;text-align:right}.met th[scope=row],.met thead th:first-child{text-align:left;font-weight:500}
.d-better{color:var(--ok);font-weight:700}.d-worse{color:var(--bad);font-weight:700}.d-same{color:var(--muted)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.lado{overflow-x:auto}.grade-lado{border-collapse:separate;border-spacing:10px;min-width:100%}.grade-lado th{text-align:left;font-size:13px;vertical-align:top}
.grade-lado td{vertical-align:top;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px}.grade-lado td .fr{width:240px}.grade-lado td>*+*{margin-top:8px}
.passo-nome{margin:0;font-weight:600;font-size:13px}
.dec{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;display:grid;gap:12px}.dec h2,.achados h2{margin:0;font:600 20px var(--serif)}
.dec fieldset{border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px 18px}.dec legend{font-size:12px;font-weight:600;padding:0 4px}
.dec label{display:flex;gap:6px;align-items:center;min-height:32px}.dec .eixo{display:grid;gap:4px;min-width:200px;align-items:start}
.campo{display:grid!important;gap:4px}.campo textarea,.campo input,.dec select{font:14px var(--sans);color:var(--fg);background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:8px}
.acoes{display:flex;gap:12px;align-items:center}#copiar{font:600 14px var(--sans);background:var(--accent);color:#fff;border:0;border-radius:8px;padding:10px 16px;min-height:44px;cursor:pointer}
#dec-json{margin:0;font:12px var(--mono);background:var(--bg);border-radius:8px;padding:10px;white-space:pre-wrap;overflow-wrap:anywhere}
.achados{display:grid;gap:8px}.achados li{scroll-margin-top:60px}.achados li:target{background:var(--accent-soft);border-radius:6px}
.paginas{display:flex;flex-wrap:wrap;gap:6px}.paginas a{color:var(--accent);text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:4px 10px;background:var(--surface)}.paginas a[aria-current="page"]{background:var(--accent);color:#fff}
#zoom{border:0;border-radius:12px;padding:12px;max-width:min(96vw,1500px);max-height:94vh;background:var(--surface);color:var(--fg)}#zoom::backdrop{background:rgba(8,12,20,.72)}
#zoom img{display:block;max-width:100%;max-height:78vh;height:auto;margin:0 auto;overflow:auto}
.z-cab{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:13px}.z-cab div{display:flex;gap:6px}
#zoom button{font:600 13px var(--sans);border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:8px;padding:6px 12px;min-height:40px;cursor:pointer}
@media (max-width:640px){.pg{padding:20px 16px 56px}h1{font-size:24px}.fr{width:200px}.eixos div{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
<div class="pg">
  <div class="topo">
    <div class="eyebrow">Variações de UX${opts.product ? ` · ${esc(opts.product)}` : ''} · ${esc(m.module)}</div>
    <h1>${esc(m.title)}</h1>
    ${m.task ? `<p class="lede"><b>Tarefa:</b> ${esc(m.task)}</p>` : ''}
    ${m.persona ? `<p class="lede"><b>Persona:</b> ${esc(m.persona)}${m.journey_ref ? ` · jornada <code>${esc(m.journey_ref)}</code>` : ''}</p>` : ''}
    ${cur.metrics ? `<dl class="nums" aria-label="Métricas de hoje">${METRICS.map((k) => `<div><dt>${METRIC_PT[k]}</dt><dd>${esc(cur.metrics[k] ?? '—')}</dd></div>`).join('')}</dl>` : ''}
    ${m.metrics_method ? `<details class="nota"><summary>Como as métricas foram contadas</summary><p>${esc(m.metrics_method)}</p></details>` : ''}
    ${lint && !lint.layout ? '<p class="nota">O lint destas variantes rodou sem as regras de layout (sem geometria): achados de layout aparecem como sem verificação.</p>' : ''}
    ${(opts.warnings ?? []).length ? `<p class="aviso">Avisos do manifesto: ${opts.warnings.map(esc).join(' · ')}</p>` : ''}
    ${nav}
  </div>
  <div class="vista" role="group" aria-label="Vista"><button type="button" data-vista="linhas" aria-pressed="true">Por variante</button><button type="button" data-vista="lado" aria-pressed="false">Lado a lado por passo</button></div>
  <div data-v="linhas">${pageRows.map(rowHtml).join('')}</div>
  <div data-v="lado" hidden>${side}</div>
  ${decision}
  ${appendix}
  ${nav}
</div>
<dialog id="zoom" aria-label="Frame ampliado"><div class="z-cab"><span id="z-cap"></span><div><button type="button" data-z="-1" aria-label="Frame anterior">← Anterior</button><button type="button" data-z="1" aria-label="Próximo frame">Próximo →</button><button type="button" data-z="0">Fechar</button></div></div><img id="z-img" alt=""></dialog>
${data}
<script type="application/json" id="vx-model">${JSON.stringify(model).replace(/</g, '\\u003c')}</script>
<script>
(function(){
let D={},M={};try{D=JSON.parse(document.getElementById('vx-data').textContent);M=JSON.parse(document.getElementById('vx-model').textContent);}catch(e){}
document.querySelectorAll('img[data-k]').forEach(i=>{if(D[i.dataset.k])i.src=D[i.dataset.k];});
const load=()=>{try{return JSON.parse(localStorage.getItem(M.key)||'{}')||{};}catch(e){return {};}};
const save=(s)=>{try{localStorage.setItem(M.key,JSON.stringify(s));}catch(e){}};
let S=load();
const vb=[...document.querySelectorAll('[data-vista]')];
const setView=(v)=>{vb.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vista===v)));document.querySelectorAll('[data-v]').forEach(x=>x.hidden=x.dataset.v!==v);S.view=v;save(S);};
vb.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.vista)));if(S.view)setView(S.view);
const z=document.getElementById('zoom'),zi=document.getElementById('z-img'),zc=document.getElementById('z-cap');let list=[],at=0;
const show=(i)=>{at=(i+list.length)%list.length;const b=list[at];zi.src=D[b.dataset.full]||'';zi.alt=b.getAttribute('aria-label').replace(/^Ampliar: /,'');zc.textContent=zi.alt+' ('+(at+1)+' de '+list.length+')';};
document.querySelectorAll('.th[data-full]').forEach(b=>b.addEventListener('click',()=>{const scope=b.closest('[data-v]')||document;list=[...scope.querySelectorAll('.th[data-full][data-row="'+b.dataset.row+'"]')];show(list.indexOf(b));if(z.showModal)z.showModal();else z.setAttribute('open','');}));
z.querySelectorAll('[data-z]').forEach(b=>b.addEventListener('click',()=>{const d=Number(b.dataset.z);if(d)show(at+d);else z.close();}));
z.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){show(at+1);e.preventDefault();}if(e.key==='ArrowLeft'){show(at-1);e.preventDefault();}});
z.addEventListener('click',e=>{if(e.target===z)z.close();});
const f=document.getElementById('decisao'),out=document.getElementById('dec-json');
const val=(n)=>{const x=f.querySelector('[name="'+n+'"]:checked');return x?x.value:null;};
const read=()=>{const mode=val('modo')||'variant';const d={format:1,module:M.module,flow:M.flow,mode};
if(mode==='variant')d.variant=val('variante');else{d.compose={};${JSON.stringify(AXES)}.forEach(a=>{d.compose[a]=f.querySelector('[name="eixo-'+a+'"]').value;});}
d.comment=f.querySelector('[name=comentario]').value.trim();d.by=f.querySelector('[name=por]').value.trim()||'dono';d.at=new Date().toISOString().slice(0,10);return d;};
const notes=()=>{${JSON.stringify(AXES)}.forEach(a=>{const v=f.querySelector('[name="eixo-'+a+'"]').value;const t=(M.changes[v]||{})[a]||(v===M.ids[0]?'como hoje':'');f.querySelector('[data-eixo-nota="'+a+'"]').textContent=t;});};
const sync=()=>{const mode=val('modo')||'variant';f.querySelectorAll('[data-modo]').forEach(x=>x.hidden=x.dataset.modo!==mode);notes();const d=read();out.textContent=JSON.stringify(d,null,2);S.decision=d;save(S);};
if(S.decision){const d=S.decision;const m=f.querySelector('[name=modo][value="'+d.mode+'"]');if(m)m.checked=true;if(d.variant){const v=f.querySelector('[name=variante][value="'+d.variant+'"]');if(v)v.checked=true;}
if(d.compose)Object.entries(d.compose).forEach(([a,v])=>{const s=f.querySelector('[name="eixo-'+a+'"]');if(s&&[...s.options].some(o=>o.value===v))s.value=v;});f.querySelector('[name=comentario]').value=d.comment||'';f.querySelector('[name=por]').value=d.by&&d.by!=='dono'?d.by:'';}
f.addEventListener('input',sync);f.addEventListener('change',sync);sync();
document.getElementById('copiar').addEventListener('click',async()=>{const d=read();const st=document.getElementById('copiado');
if(d.mode==='variant'&&!d.variant){st.textContent='Escolha uma variante antes de copiar.';return;}
const t=JSON.stringify(d,null,2);try{await navigator.clipboard.writeText(t);st.textContent='Decisão copiada.';}catch(e){const r=document.createRange();r.selectNodeContents(out);const s=getSelection();s.removeAllRanges();s.addRange(r);st.textContent='Copie o JSON selecionado abaixo.';}});
})();
</script>`;
    return { file: pageFileName(file, n), html, bytes: Buffer.byteLength(html) };
  });
}
