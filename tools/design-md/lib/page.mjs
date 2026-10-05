// Comparison page of design options (lab.mjs compare): screens × options grid, zoom with arrow keys, per option the
// quality score, readable-text check and what changes from the current DESIGN.md, and a terminal-free decision with
// "Copy decision". Same visual language and light/dark tokens as the other DSX pages (THEME_TOKENS).
import { THEME_TOKENS } from '../../ux-lint/text-page.mjs';
import { changeGroup, stringsFor } from './strings.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

/** Plain-language change groups of a token diff, in a stable order, with the paths behind each. */
export function changeGroups(diff) {
  if (!diff) return [];
  const by = new Map();
  for (const x of [...diff.changed, ...diff.added, ...diff.removed]) {
    const g = changeGroup(x.path);
    if (!by.has(g)) by.set(g, []);
    by.get(g).push(x);
  }
  const order = ['primary', 'background', 'surface', 'text', 'text-secondary', 'border', 'danger', 'status', 'table', 'other-colors', 'dark', 'font', 'size', 'weight', 'line-height', 'letter-spacing', 'spacing', 'rounded', 'components'];
  return order.filter((g) => by.has(g)).map((g) => ({ group: g, items: by.get(g) }));
}

function summaryCard(col, S) {
  const i = col.info;
  const pairs = i.pairs ?? [];
  const ok = pairs.filter((p) => p.ok).length;
  const fails = pairs.filter((p) => !p.ok);
  const schemes = i.schemes?.length > 1 ? S.dark_too : i.schemes?.[0] === 'dark' ? S.dark_only : S.light_only;
  const groups = changeGroups(i.diff);
  const shown = groups.slice(0, 6);
  const swatches = (i.swatches ?? []).map((s) => `<span class="sw" style="background:${esc(s.color)}" title="${esc(s.color)}"></span>`).join('');
  const changeList = col.official ? `<p class="nota">${esc(S.official_hint)}</p>`
    : groups.length ? `<ul class="chips">${shown.map((g) => `<li>${esc(S.change[g.group])}</li>`).join('')}${groups.length > shown.length ? `<li class="mais">${esc(S.changes_more(groups.length - shown.length))}</li>` : ''}</ul>`
    : `<p class="nota">${esc(S.no_changes)}</p>`;
  const tech = [
    i.errors?.length ? `<li>${esc(S.problems(i.errors.length))}: ${i.errors.slice(0, 3).map(esc).join(' · ')}</li>` : '',
    i.official_lint?.available ? `<li>${esc(S.official_check(i.official_lint.errors, i.official_lint.warnings))}</li>` : '',
    ...groups.flatMap((g) => g.items.slice(0, 4).map((x) => `<li><code>${esc(x.path)}</code> ${esc(x.from ?? '∅')} → ${esc(x.to ?? '∅')}</li>`)),
  ].filter(Boolean);
  return `<article class="rc${col.official ? ' hoje' : ''}">
  <header>${col.letter ? `<span class="letra">${esc(col.letter)}</span>` : ''}<div><h3>${esc(col.official ? S.official : col.id)}</h3><p class="ideia">${esc(i.name)}</p></div></header>
  <div class="sws" aria-hidden="true">${swatches}${i.font ? `<span class="fonte">${esc(i.font)}</span>` : ''}</div>
  <dl class="kpis">
    <div class="kpi"><dt>${esc(S.score)}</dt><dd><b>${esc(i.score)}</b><small>/100</small></dd></div>
    <div class="kpi"><dt>${esc(S.readability)}</dt><dd>${pairs.length ? esc(S.readability_value(ok, pairs.length)) : esc(S.readability_none)}</dd></div>
  </dl>
  ${fails.length ? `<p class="aviso">${esc(S.fails)} ${fails.map((p) => `${esc(S.pair[p.id])}${i.schemes?.length > 1 ? ` (${esc(S.scheme[p.scheme])})` : ''} ${String(p.ratio).replace('.', S.html_lang === 'en' ? '.' : ',')}:1`).join(' · ')}</p>` : ''}
  <p class="nota">${esc(schemes)}${i.credit ? ` · ${esc(S.credit(i.credit))}` : ''}</p>
  <div class="muda"><h4>${esc(S.changes)}</h4>${changeList}</div>
  ${tech.length ? `<details class="det"><summary>${esc(S.maintainer)}</summary><ul>${tech.join('')}</ul></details>` : ''}
</article>`;
}

/**
 * @param {{ module?: string, product?: string, storeKey?: string,
 *   columns: { id: string, letter: string, official: boolean, info: object }[],
 *   screens: { id: string, label: string, cells: Record<string, string|null> }[] }} model
 * @param {{ lang?: string }} options
 */
export function buildComparePage(model, { lang = 'en' } = {}) {
  const S = stringsFor(lang);
  const cols = model.columns;
  const colName = (c) => (c.official ? S.official : c.id);
  const data = {};
  const rows = model.screens.map((s, si) => {
    const cells = cols.map((c, ci) => {
      const src = s.cells[c.id];
      const k = `${si}-${ci}`;
      if (!src) return `<div class="cel vazio" role="cell"><span>${esc(S.no_image)}</span></div>`;
      data[k] = src;
      return `<div class="cel" role="cell"><button type="button" class="z" data-k="${k}" data-s="${si}" data-c="${ci}" aria-label="${esc(S.open_screen(s.label.toLowerCase(), colName(c).toLowerCase()))}"><img data-k="${k}" alt="${esc(`${s.label} · ${colName(c)}`)}" loading="lazy"></button></div>`;
    }).join('');
    return `<div class="linha" role="row"><div class="rot" role="rowheader"><span>${esc(s.label)}</span></div>${cells}</div>`;
  }).join('\n');
  const head = `<div class="linha cab" role="row"><div class="rot" role="columnheader"><span class="sr">${esc(S.grid_title)}</span></div>${cols.map((c) => `<div class="cel" role="columnheader">${c.letter ? `<span class="letra">${esc(c.letter)}</span> ` : ''}${esc(colName(c))}</div>`).join('')}</div>`;
  const choices = cols.map((c) => `<label class="op"><input type="radio" name="escolha" value="${esc(c.id)}"><span>${c.letter ? `<b>${esc(c.letter)}</b> ` : ''}${esc(c.official ? S.keep_current : S.follow(c.id))}${c.official ? '' : ` <span class="nota">${esc(c.info.name)}</span>`}</span></label>`).join('');
  const model2 = { key: model.storeKey ?? `dsx-design-compare:${model.module ?? ''}:${cols.map((c) => c.id).join(',')}`, module: model.module ?? null, ids: cols.map((c) => c.id), names: cols.map(colName), screens: model.screens.map((s) => s.label), official: cols.find((c) => c.official)?.id ?? null };
  const T = { copied: S.copied, copy_failed: S.copy_failed, of: S.of, summary: { none: S.decision_summary(null) }, choice_prefix: S.decision_summary('X') };
  return `<!doctype html>
<html lang="${S.html_lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(S.title(model.product ?? model.module))}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">
<style>
${THEME_TOKENS}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{background:var(--bg);color:var(--fg);font:14px/1.5 var(--sans);margin:0;overflow-x:hidden}
[hidden]{display:none!important}
.pg{max-width:1600px;margin:0 auto;padding:20px 20px 72px;display:grid;gap:28px;min-width:0}
.topo{display:grid;gap:4px}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
h1{margin:0;font:600 28px/1.2 var(--serif);text-wrap:balance}.lede{margin:0;font-size:15px;max-width:72ch}
h2{margin:0;font:600 22px var(--serif)}h3{margin:0;font:600 17px/1.25 var(--serif)}h4{margin:0 0 6px;font-size:13px;color:var(--muted);font-weight:600}
button:focus-visible,a:focus-visible,select:focus-visible,textarea:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.nota{color:var(--muted);font-size:13px;margin:0;max-width:90ch}
.letra{display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 7px;border-radius:7px;background:var(--accent);color:var(--on-accent);font-weight:700;font-size:13px;flex:none}
.letra-hoje,.hoje .letra{background:var(--fg);color:var(--surface)}
.resumo{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;align-items:stretch}
.rc{display:grid;align-content:start;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px;min-width:0}
.rc.hoje{background:color-mix(in srgb,var(--bg) 60%,var(--surface))}
.rc header{display:flex;gap:10px;align-items:flex-start}.ideia{margin:2px 0 0;font-size:13px;color:var(--muted);line-height:1.4}
.sws{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.sw{width:24px;height:24px;border-radius:6px;border:1px solid var(--control-line)}.fonte{font-size:13px;color:var(--muted);margin-left:4px}
.kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin:0;font-variant-numeric:tabular-nums}
.kpi dt{font-size:12px;color:var(--muted);line-height:1.25}.kpi dd{margin:0}.kpi b{font-size:22px;font-weight:500}.kpi small{color:var(--muted);font-size:12px;margin-left:2px}
.aviso{margin:0;font-size:13px;color:var(--warn);background:var(--warn-soft);border-radius:8px;padding:6px 10px}
.chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}.chips li{font-size:12px;font-weight:600;background:var(--accent-soft);border-radius:999px;padding:2px 10px}.chips .mais{background:none;color:var(--muted)}
.det{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:0 12px}.det summary{cursor:pointer;font-weight:600;padding:10px 0;min-height:44px}
.det ul{margin:0 0 10px;padding-left:18px;display:grid;gap:4px;font-size:13px}.det code{font:12px var(--mono);overflow-wrap:anywhere}
.telas{display:grid;gap:10px;min-width:0}
.grade-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
.grade{display:grid;width:100%;min-width:calc(140px + ${cols.length} * 240px)}
.linha{display:grid;grid-template-columns:140px repeat(${cols.length},minmax(240px,1fr));border-top:1px solid var(--line)}
.linha.cab{border-top:0;position:sticky;top:0;z-index:2;background:var(--surface)}
.linha.cab .cel{font-weight:600;display:flex;gap:8px;align-items:center;padding:10px}
.rot{padding:10px;font-weight:600;position:sticky;left:0;background:var(--surface);z-index:1;border-right:1px solid var(--line)}
.cel{padding:10px;min-width:0}
.z{all:unset;cursor:zoom-in;display:block;width:100%;box-sizing:border-box;border-radius:8px}
.z img{display:block;width:100%;min-width:0;aspect-ratio:16/10;object-fit:cover;object-position:top left;border:1px solid var(--line);border-radius:8px;background:#fff}
.vazio span{display:grid;place-items:center;aspect-ratio:16/10;border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-size:12px;text-align:center;padding:8px}
.dec{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;display:grid;gap:14px;max-width:1100px}
.dec>p{max-width:72ch;margin:0}
.escolha{border:0;margin:0;padding:0;display:grid;gap:8px;max-width:640px}
.op{display:flex;gap:10px;align-items:center;border:1px solid var(--control-line);border-radius:10px;padding:10px 12px;min-height:52px;cursor:pointer}
.op:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}
.op input{width:24px;height:24px;margin:0;accent-color:var(--accent);flex:none}
.campo{display:grid;gap:4px;font-weight:600;max-width:640px}.campo textarea,.campo input{font:14px var(--sans);color:var(--fg);background:var(--surface);border:1px solid var(--control-line);border-radius:8px;padding:8px;min-height:44px}
.campo input[aria-invalid="true"]{border-color:var(--bad)}.campo .nota{font-weight:400}
.erro{margin:0;color:var(--bad);font-size:13px;font-weight:600}
.acoes{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
#copiar{font:600 14px var(--sans);background:var(--accent);color:var(--on-accent);border:0;border-radius:8px;padding:10px 18px;min-height:44px;cursor:pointer}
#limpar{font:600 13px var(--sans);border:1px solid var(--control-line);background:var(--surface);color:var(--fg);border-radius:8px;padding:8px 14px;min-height:44px;cursor:pointer}
#copiado{margin:0;font-weight:600;color:var(--ok)}#copiado:empty{display:none}
.retomada{margin:0;background:var(--accent-soft);border-radius:10px;padding:8px 12px}
#dec-json{margin:4px 0 12px;background:var(--bg);border-radius:8px;padding:10px;white-space:pre-wrap;font:12px var(--mono)}
.sobre{border:1px solid var(--line);border-radius:10px;padding:0 14px;background:var(--surface);max-width:1100px}.sobre summary{cursor:pointer;font-weight:600;padding:11px 0;min-height:44px}.sobre p{margin:0 0 10px;max-width:72ch}
#zoom{border:0;padding:0;margin:0;width:100vw;height:100vh;max-width:none;max-height:none;background:var(--surface);color:var(--fg)}#zoom::backdrop{background:rgba(8,12,20,.8)}
#zoom[open]{display:grid;grid-template-rows:auto 1fr}
.z-cab{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--line);font-size:14px}
.z-cab div{display:flex;gap:6px;flex-wrap:wrap}
#zoom button{font:600 13px var(--sans);border:1px solid var(--control-line);background:var(--surface);color:var(--fg);border-radius:8px;padding:6px 12px;min-height:44px;min-width:44px;cursor:pointer}
#z-real[aria-pressed="true"]{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.z-corpo{overflow:auto;padding:12px;background:var(--bg)}
#z-img{display:block;margin:0 auto;max-width:100%;height:auto;background:#fff}
#z-img.real{max-width:none}
@media (max-width:640px){.pg{padding:16px 16px 56px;gap:22px}h1{font-size:23px}.linha{grid-template-columns:96px repeat(${cols.length},minmax(200px,1fr))}.grade{min-width:calc(96px + ${cols.length} * 200px)}}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
</head>
<body>
<div class="pg">
  <header class="topo">
    <div class="eyebrow">${esc(S.eyebrow(cols.length, model.product ?? model.module))}</div>
    <h1>${esc(S.question)}</h1>
    <p class="lede">${esc(S.lede)}</p>
  </header>
  <section class="resumo" aria-label="${esc(S.summary_label)}">
${cols.map((c) => summaryCard(c, S)).join('\n')}
  </section>
  <section class="telas" aria-labelledby="telas-t">
    <h2 id="telas-t">${esc(S.grid_title)}</h2>
    <p class="nota">${esc(S.grid_hint)}</p>
    <div class="grade-wrap"><div class="grade" role="table" aria-labelledby="telas-t">
${head}
${rows}
    </div></div>
  </section>
  <form class="dec" id="decisao" aria-labelledby="dec-t" novalidate>
    <h2 id="dec-t">${esc(S.decision_title)}</h2>
    <p>${esc(S.decision_lede)}</p>
    <p class="retomada" id="retomada" hidden>${esc(S.resumed)}</p>
    <fieldset class="escolha"><legend class="sr">${esc(S.decision_title)}</legend>${choices}</fieldset>
    <p class="erro" id="escolha-erro" hidden>${esc(S.choice_error)}</p>
    <label class="campo">${esc(S.comment)} <span class="nota">${esc(S.comment_hint)}</span><textarea name="comentario" rows="3"></textarea></label>
    <label class="campo">${esc(S.by)}<input name="por" autocomplete="name" aria-describedby="por-erro"></label>
    <p class="erro" id="por-erro" hidden>${esc(S.by_error)}</p>
    <p class="nota" id="dec-resumo" aria-live="polite"></p>
    <div class="acoes"><button type="button" id="copiar">${esc(S.copy)}</button><button type="button" id="limpar">${esc(S.clear)}</button><p id="copiado" role="status"></p></div>
    <details class="det" id="tec-dec"><summary>${esc(S.decision_text)}</summary><p class="nota">${esc(S.maintainer_text)}</p><pre id="dec-json"></pre></details>
  </form>
  <details class="sobre"><summary>${esc(S.about)}</summary><p>${esc(S.about_score)}</p><p>${esc(S.about_contrast)}</p><p>${esc(S.about_same)}</p></details>
</div>
<dialog id="zoom" aria-label="${esc(S.zoomed)}"><div class="z-cab"><span id="z-cap"></span><div><button type="button" data-mv="c-1" aria-label="${esc(S.prev_option)}">←</button><button type="button" data-mv="c1" aria-label="${esc(S.next_option)}">→</button><button type="button" data-mv="s-1" aria-label="${esc(S.prev_screen)}">↑</button><button type="button" data-mv="s1" aria-label="${esc(S.next_screen)}">↓</button><button type="button" id="z-real" aria-pressed="false">${esc(S.actual_size)}</button><button type="button" data-mv="x">${esc(S.close)}</button></div></div><div class="z-corpo"><img id="z-img" alt=""></div></dialog>
<script type="application/json" id="dl-data">${json(data)}</script>
<script type="application/json" id="dl-model">${json(model2)}</script>
<script>
(function(){
var T=${json(T)};var D={},M={};try{D=JSON.parse(document.getElementById('dl-data').textContent);M=JSON.parse(document.getElementById('dl-model').textContent);}catch(e){}
document.querySelectorAll('img[data-k]').forEach(function(i){if(D[i.dataset.k])i.src=D[i.dataset.k];});
var z=document.getElementById('zoom'),zi=document.getElementById('z-img'),zc=document.getElementById('z-cap'),at={s:0,c:0};
var has=function(s,c){return !!D[s+'-'+c];};
var show=function(s,c){var ns=M.screens.length,nc=M.ids.length;s=(s+ns)%ns;c=(c+nc)%nc;at={s:s,c:c};zi.src=D[s+'-'+c]||'';zi.alt=M.screens[s]+' · '+M.names[c];
var b=document.createElement('b');b.textContent=M.screens[s];zc.replaceChildren(b,' · '+M.names[c]+' ('+(c+1)+T.of+nc+')');z.querySelector('.z-corpo').scrollTo(0,0);};
var move=function(ds,dc){var s=at.s,c=at.c;for(var i=0;i<M.ids.length*M.screens.length;i++){s=(s+ds+M.screens.length)%M.screens.length;c=(c+dc+M.ids.length)%M.ids.length;if(has(s,c))break;}show(s,c);};
document.querySelectorAll('.z[data-k]').forEach(function(b){b.addEventListener('click',function(){show(Number(b.dataset.s),Number(b.dataset.c));if(z.showModal)z.showModal();else z.setAttribute('open','');});});
z.querySelectorAll('[data-mv]').forEach(function(b){b.addEventListener('click',function(){var v=b.dataset.mv;if(v==='x')return z.close();if(v[0]==='c')move(0,Number(v.slice(1)));else move(Number(v.slice(1)),0);});});
var zr=document.getElementById('z-real');zr.addEventListener('click',function(){var on=zr.getAttribute('aria-pressed')!=='true';zr.setAttribute('aria-pressed',String(on));zi.classList.toggle('real',on);});
z.addEventListener('keydown',function(e){var k={ArrowRight:[0,1],ArrowLeft:[0,-1],ArrowDown:[1,0],ArrowUp:[-1,0]}[e.key];if(k){e.preventDefault();move(k[0],k[1]);}});
z.addEventListener('click',function(e){if(e.target===z)z.close();});
var f=document.getElementById('decisao'),out=document.getElementById('dec-json'),por=f.querySelector('[name=por]'),perr=document.getElementById('por-erro'),gerr=document.getElementById('escolha-erro'),st=document.getElementById('copiado');
var load=function(){try{return JSON.parse(localStorage.getItem(M.key)||'null');}catch(e){return null;}};
var save=function(d){try{localStorage.setItem(M.key,JSON.stringify(d));}catch(e){}};
var read=function(){var x=f.querySelector('[name=escolha]:checked');var d={format:1,kind:'design-option',module:M.module,choice:x?x.value:null,keep_current:!!x&&x.value===M.official,comment:f.querySelector('[name=comentario]').value.trim(),by:por.value.trim(),at:new Date().toISOString().slice(0,10)};return d;};
var name=function(id){var i=M.ids.indexOf(id);return i>=0?M.names[i]:id;};
var sync=function(){var d=read();out.textContent=JSON.stringify(d,null,2);document.getElementById('dec-resumo').textContent=d.choice?T.choice_prefix.replace('X',name(d.choice)):T.summary.none;if(d.choice)gerr.hidden=true;if(d.by){perr.hidden=true;por.removeAttribute('aria-invalid');}save(d);};
var fill=function(d){f.querySelectorAll('[name=escolha]').forEach(function(x){x.checked=!!d&&x.value===d.choice;});f.querySelector('[name=comentario]').value=(d&&d.comment)||'';por.value=(d&&d.by)||'';};
var prev=load();if(prev&&(prev.choice||prev.comment||prev.by)){fill(prev);document.getElementById('retomada').hidden=false;}
f.addEventListener('input',sync);f.addEventListener('change',sync);sync();
document.getElementById('limpar').addEventListener('click',function(){fill(null);document.getElementById('retomada').hidden=true;st.textContent='';sync();});
document.getElementById('copiar').addEventListener('click',function(){var d=read();if(!d.choice){gerr.hidden=false;st.textContent='';f.querySelector('[name=escolha]').focus();return;}
if(!d.by){perr.hidden=false;por.setAttribute('aria-invalid','true');por.focus();st.textContent='';return;}
var t=JSON.stringify(d,null,2);var fail=function(){document.getElementById('tec-dec').open=true;var r=document.createRange();r.selectNodeContents(out);var s=getSelection();s.removeAllRanges();s.addRange(r);st.textContent=T.copy_failed;};
try{navigator.clipboard.writeText(t).then(function(){st.textContent=T.copied;},fail);}catch(e){fail();}});
})();
</script>
</body>
</html>
`;
}
