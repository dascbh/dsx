#!/usr/bin/env node
// ux-lint, prévias das opções: para cada caso aberto da página de decisão, recorta da CAPTURA REAL (file://, sem
// servidor) a região do elemento do achado — "antes" — e aplica cada opção ao DOM da captura para o "depois",
// com o mesmo recorte. Fluxo vira mini diagrama SVG (sem navegador). Contrato: knowledge/fundamentos/achados-de-ux.md.
//
// Uso: node tools/ux-lint/preview.mjs --module <m> --root <projeto> [--screens <capturas>] [--map <flows.json>]
//        [--min-severity <n>] [--out <dir>] [--width 1440] [--dir <findings>] [--json]
// Padrões: --screens <root>/.stitch/<m>/code · --map <root>/.dsx/maps/flows-<m>.json ·
//          --out <root>/.dsx/findings/<m>/previews (manifesto previews.json + imagens WebP, ou JPEG se WebP falhar).
// O Playwright NÃO é dependência do DSX: é resolvido a partir do diretório atual (como measure.mjs). Sem ele, sai
// com 3 e a página fica sem prévia de captura (os diagramas de fluxo saem mesmo assim).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import * as findings from './findings.mjs';
import { resolvePlaywright, PLAYWRIGHT_MISSING } from './measure.mjs';
import {
  PREVIEW_VERSION, locatorFor, optionOps, implicitPreview, pickExample, screenOrder, describeOps, flowDiagram, sha1,
} from './lib/preview-spec.mjs';

const MANIFEST = 'previews.json';
const BEFORE_COLOR = '#E5484D';
const AFTER_COLOR = '#12A150';
const SKIP_STATUS = new Set(['fixed', 'ignored', 'accepted-deviation']);
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

/** Caminhos padrão. */
export function previewPaths({ root, module, dir = null, out = null, screens = null, map = null }) {
  const findingsDir = dir ? resolve(dir) : join(root, '.dsx', 'findings');
  return {
    findingsDir,
    out: out ? resolve(out) : join(findingsDir, module, 'previews'),
    screens: screens ? resolve(screens) : join(root, '.stitch', module, 'code'),
    map: map ? resolve(map) : join(root, '.dsx', 'maps', `flows-${module}.json`),
  };
}

export const readManifest = (outDir) => {
  const f = join(outDir, MANIFEST);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
};

/**
 * Plano de prévia de cada caso, sem navegador: tela representativa, localizador, operações por opção, correção
 * indicada pela regra (caso sem opções) e hash para o cache. Casos corrigidos, ignorados e de desvio aceito ficam
 * fora; `minSeverity` (opcional) filtra pela severidade do caso.
 */
export function planPreviews(cases, { screensDir, map = null, minSeverity = null, width = 1440 } = {}) {
  const files = existsSync(screensDir) ? readdirSync(screensDir).filter((f) => f.endsWith('.html')) : [];
  const fileSet = new Set(files);
  const exampleFor = (state, screen) => pickExample(files, state, screen);
  const contentHash = new Map();
  const capHash = (name) => {
    if (!contentHash.has(name)) contentHash.set(name, fileSet.has(`${name}.html`) ? sha1(readFileSync(join(screensDir, `${name}.html`))) : null);
    return contentHash.get(name);
  };
  const plans = [];
  for (const c of cases) {
    if (c.statuses.every((s) => SKIP_STATUS.has(s))) continue;
    if (minSeverity !== null && (c.severity ?? 0) < minSeverity) continue;
    const plan = { id: c.id, ids: c.ids, family: c.family, rule: c.rule, severity: c.severity, options: [], implicit: null };
    if (c.family === 'flow') {
      const screen = (c.screens ?? [])[0];
      plan.kind = 'flow';
      plan.screen = screen;
      const imp = implicitPreview(c);
      plan.implicit = imp.flow ? { label: imp.label, flow: true } : { label: null, none: imp.none };
      plan.options = (c.options ?? []).map((o, i) => ({ index: i, none: 'opção de fluxo: o diagrama mostra a correção indicada pela regra' }));
      plan.hash = sha1(PREVIEW_VERSION, 'flow', screen, c.rule, map ? sha1(JSON.stringify(map)) : null);
      plans.push(plan);
      continue;
    }
    const loc = locatorFor(c);
    const order = screenOrder(c);
    // depois das telas citadas, as capturas de estado delas (o elemento pode estar só no vazio ou no erro)
    const states = order.flatMap((s) => files.filter((f) => f.startsWith(`${s}.`) && f !== `${s}.html`).map((f) => f.replace(/\.html$/, '')));
    const screens = [...new Set([...order, ...states])].filter((s) => fileSet.has(`${s}.html`));
    plan.kind = loc.screen_level ? 'screen' : 'element';
    plan.locator = loc;
    plan.screens = screens;
    plan.options = (c.options ?? []).map((o, i) => {
      const r = optionOps(c, o);
      if (r.ops?.some((op) => op.op === 'example') && plan.kind === 'element') plan.kind = 'screen';
      return { index: i, text: o.text, ...(r.ops ? { ops: r.ops, derived: r.derived, ...(r.note ? { note: r.note } : {}) } : { none: r.none }) };
    });
    if (!plan.options.length) {
      const imp = implicitPreview(c, { exampleFor });
      plan.implicit = imp.ops ? { label: imp.label, ops: imp.ops } : { label: null, none: imp.none };
    }
    const examples = [...plan.options.flatMap((o) => o.ops ?? []), ...(plan.implicit?.ops ?? [])].filter((o) => o.op === 'example').map((o) => o.screen);
    plan.hash = sha1(PREVIEW_VERSION, width, screens.map((s) => [s, capHash(s)]), loc, plan.options, plan.implicit, examples.map((e) => [e, capHash(e)]));
    plan.capture_hashes = Object.fromEntries(screens.map((s) => [s, capHash(s)]));
    plans.push(plan);
  }
  return plans;
}

// ---------- código que roda dentro da captura ----------
/* c8 ignore start */
function runtime() {
  const clean = (s) => String(s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    }
    return true;
  };
  const KIND = { button: 'button, [role=button], a, [role=tab], [role=menuitem], [role=option]', heading: 'h1, h2, h3, h4, h5, h6, [role=heading]' };
  const R = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  const union = (rs) => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };
  const dialogOf = (el) => el.closest('[role=dialog], .MuiDialog-paper');
  const st = { targets: [] };
  function find(loc) {
    const out = [];
    st.via = 'text';
    for (const s of loc.selectors || []) { try { const el = document.querySelector(s); if (el && visible(el) && !out.includes(el)) out.push(el); } catch { /* seletor inválido */ } }
    if (out.length) return out.slice(0, loc.max || 1);
    const openDialog = [...document.querySelectorAll('[role=dialog]')].find(visible);
    const order = (l) => (openDialog ? [...l.filter((e) => openDialog.contains(e)), ...l.filter((e) => !openDialog.contains(e))] : l);
    if (loc.kind === 'placeholder') {
      const pats = (loc.patterns || []).map((p) => new RegExp(p, 'i'));
      return order([...document.querySelectorAll('input[placeholder], textarea[placeholder]')].filter((e) => visible(e) && pats.some((p) => p.test(clean(e.placeholder))))).slice(0, loc.max || 1);
    }
    const all = [...document.body.querySelectorAll('*')].filter((e) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(e.tagName) && !e.closest('svg') && !e.hasAttribute('data-dsx-mark'));
    const pass = (test) => {
      let hits = all.filter((e) => { const t = clean(e.innerText); return t && test(t) && visible(e); });
      hits = hits.filter((e) => !hits.some((o) => o !== e && e.contains(o)));
      if (KIND[loc.kind]) hits = hits.map((e) => e.closest(KIND[loc.kind]) || e);
      if (loc.require_class) hits = hits.filter((e) => e.classList.contains(loc.require_class));
      return order([...new Set(hits)]);
    };
    const pats = (loc.patterns || []).map((p) => new RegExp(p, 'i'));
    // T1 e L3 citam vários elementos: um por padrão, na ordem do achado.
    if ((loc.max || 1) > 1 && pats.length > 1) {
      const res = [];
      for (const p of pats) { const h = pass((t) => p.test(t)).find((e) => !res.includes(e)); if (h) res.push(h); }
      if (res.length) return res.slice(0, loc.max);
    }
    let hits = pats.length ? pass((t) => pats.some((p) => p.test(t))) : [];
    if (!hits.length && (loc.prefixes || []).length) hits = pass((t) => loc.prefixes.some((p) => t.startsWith(p)));
    if (!hits.length && (loc.contains || []).length) hits = pass((t) => loc.contains.some((p) => t.includes(p)));
    if (!hits.length && (loc.loose || []).length) { const lp = loc.loose.map((p) => new RegExp(p, 'i')); hits = pass((t) => lp.some((p) => p.test(t))); }
    // Nome acessível, dica (title) ou placeholder: o texto está num atributo, não em pixels.
    if (!hits.length && pats.length) {
      // controles transparentes (checkbox do MUI: input com opacidade 0) contam pelo contorno visível ao redor
      const shown = (e) => (visible(e) ? e : e.parentElement && visible(e.parentElement) && e.getBoundingClientRect().width > 0 ? e.parentElement : null);
      const attrHits = all.filter((e) => ['aria-label', 'title', 'placeholder'].some((a) => { const v = e.getAttribute(a); return v && pats.some((p) => p.test(clean(v))); })).map(shown).filter(Boolean);
      hits = order([...new Set(attrHits.filter((e) => !attrHits.some((o) => o !== e && e.contains(o))))]);
      if (hits.length) st.via = 'attr';
    }
    return hits.slice(0, loc.max || 1);
  }
  const CONTAINER = 'section, form, fieldset, article, aside, header, footer, nav, table, ul, ol, [role=toolbar], [role=group], [role=region], [role=tabpanel], [role=list], .MuiCard-root, .MuiPaper-root, .MuiDialogActions-root, .MuiDialogContent-root, .MuiStack-root, .MuiAccordion-root';
  function contextRect(targets) {
    const T = union(targets.map(R));
    const vw = innerWidth, vh = innerHeight;
    const dlg = dialogOf(targets[0]);
    let C;
    if (dlg) C = R(dlg);
    else {
      C = null;
      for (let p = targets[0].parentElement; p && p !== document.body; p = p.parentElement) {
        if (!targets.every((t) => p.contains(t))) continue;
        const r = R(p);
        if (p.matches(CONTAINER) && r.w >= 320 && r.h >= T.h + 24) { C = r; break; }
      }
      if (!C) { const m = document.querySelector('main') || document.body; C = R(m); }
    }
    const maxW = dlg ? Math.min(Math.max(C.w, T.w + 32), vw) : Math.min(Math.max(720, T.w + 32), vw);
    const maxH = dlg ? vh : Math.min(Math.max(420, T.h + 48), vh);
    const fit = (cs, cl, ts, tl, max) => { if (cl <= max) return [cs, cl]; const s = Math.min(Math.max(ts + tl / 2 - max / 2, cs), cs + cl - max); return [s, max]; };
    let [x, w] = fit(C.x, C.w, T.x, T.w, maxW);
    let [y, h] = fit(C.y, C.h, T.y, T.h, maxH);
    const grow = (s, l, min, lim) => (l >= min ? [s, l] : [Math.max(0, Math.min(s - (min - l) / 2, lim - min)), min]);
    [x, w] = grow(x, w, Math.min(480, vw), vw);
    [y, h] = grow(y, h, 160, vh);
    // o elemento inteiro sempre dentro do recorte
    const x2 = Math.max(x + w, T.x + T.w + 6), y2 = Math.max(y + h, T.y + T.h + 6);
    x = Math.min(x, T.x - 6); y = Math.min(y, T.y - 6);
    x = Math.max(0, x - 8); y = Math.max(0, y - 8);
    return { x, y, w: Math.min(vw, x2 + 8) - x, h: Math.min(vh, y2 + 8) - y };
  }
  function textNodes(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && n.parentElement.closest('svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const out = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim()) out.push(n);
    return out;
  }
  function applyOp(op) {
    const el = op.selector ? document.querySelector(op.selector) : st.targets[0];
    if (!el) return { error: 'alvo da operação não encontrado' };
    if (op.op === 'text') {
      let text = op.text;
      if (Array.isArray(op.choices) && op.choices.length) {
        // lista "A · B · C": aplica o trecho com mais palavras em comum com o texto atual deste elemento
        const words = (s) => new Set(clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 2));
        const cur = words(el.innerText || el.placeholder || '');
        let best = 0;
        for (const c of op.choices) { const n = [...words(c)].filter((w) => cur.has(w)).length; if (n > best) { best = n; text = c; } }
      }
      if (el.matches('input, textarea')) { el.placeholder = text; return { el, text }; }
      if (st.via === 'attr') return { error: 'o texto está só no nome acessível (botão de ícone): a troca não aparece em pixels' };
      const ns = textNodes(el);
      if (!ns.length) el.textContent = text;
      else { ns[0].nodeValue = text; for (const n of ns.slice(1)) n.nodeValue = ''; }
      return { el, text };
    }
    if (op.op === 'remove') { const r = R(el); el.style.setProperty('display', 'none', 'important'); return { removed: r }; }
    if (op.op === 'variant') {
      if (!el.classList.contains('MuiButton-root')) return { error: 'o elemento não é um botão do MUI; variant não se aplica' };
      const size = [...el.classList].find((c) => /^MuiButton-size/.test(c));
      const donors = [...document.querySelectorAll(`.MuiButton-root.MuiButton-${op.variant}`)].filter((d) => d !== el && visible(d));
      const donor = donors.find((d) => size && d.classList.contains(size)) || donors[0];
      if (!donor) return { error: `nenhum botão "${op.variant}" nesta captura para copiar o estilo` };
      el.className = donor.className;
      return { el };
    }
    if (op.op === 'move') {
      const g = el.parentElement;
      if (op.to === 'end') g.appendChild(el);
      if (op.to === 'start') g.prepend(el);
      if (op.justify) { if (!/flex/.test(getComputedStyle(g).display)) g.style.display = 'flex'; g.style.justifyContent = op.justify; g.style.alignItems = g.style.alignItems || 'center'; }
      return { el };
    }
    if (op.op === 'style') { for (const [k, v] of Object.entries(op.css)) el.style.setProperty(k, v); return { el }; }
    return { error: `operação ${op.op} não se aplica ao DOM` };
  }
  function mark(rects, color, dashed) {
    for (const r of rects) {
      const d = document.createElement('div');
      d.setAttribute('data-dsx-mark', '');
      const line = r.h === 0;
      d.style.cssText = `position:fixed;left:${r.x - 4}px;top:${r.y - (line ? 2 : 4)}px;width:${r.w + 8}px;height:${line ? 0 : r.h + 8}px;border:${line ? '0' : `3px ${dashed ? 'dashed' : 'solid'} ${color}`};${line ? `border-top:3px dashed ${color};` : ''}border-radius:6px;box-shadow:0 0 0 1px rgba(255,255,255,.9);z-index:2147483647;pointer-events:none;box-sizing:border-box`;
      document.body.appendChild(d);
    }
  }
  const still = document.createElement('style');
  still.textContent = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';
  document.head.appendChild(still);
  window.__dsxp = {
    locate(loc) {
      st.targets = find(loc);
      if (!st.targets.length) return { found: 0 };
      st.targets[0].scrollIntoView({ block: 'center', inline: 'nearest' });
      return { found: st.targets.length, crop: contextRect(st.targets), rects: st.targets.map(R) };
    },
    apply(ops) {
      let removed = null;
      const texts = [];
      const before = st.targets.map(R);
      for (const op of ops) { const r = applyOp(op); if (r.error) return { error: r.error }; if (r.removed) removed = r.removed; if (r.text) texts.push(r.text); }
      const live = st.targets.filter((t) => t.isConnected && visible(t));
      const rects = live.map(R);
      const crop = live.length ? contextRect(live) : null;
      const same = (a, b) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5;
      const geometric = ops.every((o) => o.op === 'move' || o.op === 'style');
      const unchanged = geometric && rects.length === before.length && rects.every((r, i) => same(r, before[i]));
      return { rects, removed, crop, texts, unchanged };
    },
    mark(rects, after) { mark(rects, after ? '#12A150' : '#E5484D', false); },
    markRemoved(r) { mark([{ x: r.x, y: r.y, w: r.w, h: 0 }], '#12A150', true); },
  };
}
/* c8 ignore stop */

// ---------- execução ----------

const unionCrop = (a, b) => (!a ? b : !b ? a : (() => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; })());
const roundCrop = (c, vw, vh) => { const x = Math.max(0, Math.floor(c.x)), y = Math.max(0, Math.floor(c.y)); return { x, y, width: Math.min(vw - x, Math.ceil(c.w)), height: Math.min(vh - y, Math.ceil(c.h)) }; };

async function encoder(browser) {
  const page = await browser.newPage();
  await page.setContent('<body></body>');
  return async (png) => page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    let url = c.toDataURL('image/webp', 0.7);
    let ext = 'webp';
    if (!url.startsWith('data:image/webp')) { url = c.toDataURL('image/jpeg', 0.7); ext = 'jpg'; }
    return { ext, b64: url.slice(url.indexOf(',') + 1), width: c.width, height: c.height };
  }, png.toString('base64'));
}

/** Gera as imagens de um caso de elemento. Devolve a entrada do manifesto. */
async function elementCase(page, plan, { screensDir, outDir, width, height, encode }) {
  const load = async (screen) => {
    await page.goto(pathToFileURL(join(screensDir, `${screen}.html`)).href, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.addScriptTag({ content: `(${runtime.toString()})()` });
  };
  let screen = null, loc0 = null;
  for (const s of plan.screens) {
    await load(s);
    const r = await page.evaluate((l) => window.__dsxp.locate(l), plan.locator);
    if (r.found) { screen = s; loc0 = r; break; }
  }
  if (!screen) return { failed: plan.screens.length ? `elemento não encontrado nas capturas (${plan.screens.slice(0, 3).join(', ')})` : 'nenhuma captura das telas do caso' };
  const variants = [...plan.options.map((o) => ({ key: `o${o.index}`, option: o.index, ops: o.ops, none: o.none, note: o.note }))];
  if (plan.implicit) variants.push({ key: 'rule', option: null, ops: plan.implicit.ops, none: plan.implicit.none, label: plan.implicit.label });
  // 1ª passada: mede o recorte de cada variante e une, para todas usarem a mesma janela.
  let crop = loc0.crop;
  for (const v of variants) {
    if (!v.ops) continue;
    await load(screen);
    await page.evaluate((l) => window.__dsxp.locate(l), plan.locator);
    const r = await page.evaluate((ops) => window.__dsxp.apply(ops), v.ops);
    if (r.error) { v.none = r.error; v.ops = null; continue; }
    if (r.unchanged) { v.none = `nesta captura a operação não muda nada (${describeOps(v.ops)}); o elemento já está assim`; v.ops = null; continue; }
    crop = unionCrop(crop, r.crop);
    if (r.removed) crop = unionCrop(crop, { ...r.removed, h: Math.max(r.removed.h, 1) });
  }
  const clip = roundCrop(crop, width, height);
  const save = async (png, name) => {
    const e = await encode(png);
    const file = `${plan.hash.slice(0, 12)}.${name}.${e.ext}`;
    writeFileSync(join(outDir, file), Buffer.from(e.b64, 'base64'));
    return { file, width: e.width, height: e.height };
  };
  await load(screen);
  const l = await page.evaluate((x) => window.__dsxp.locate(x), plan.locator);
  await page.evaluate((rs) => window.__dsxp.mark(rs, false), l.rects);
  const before = await save(await page.screenshot({ clip }), 'before');
  const after = [];
  for (const v of variants) {
    if (!v.ops) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: v.none }); continue; }
    await load(screen);
    await page.evaluate((x) => window.__dsxp.locate(x), plan.locator);
    const r = await page.evaluate((ops) => window.__dsxp.apply(ops), v.ops);
    if (r.rects.length) await page.evaluate((rs) => window.__dsxp.mark(rs, true), r.rects);
    if (r.removed) await page.evaluate((rm) => window.__dsxp.markRemoved(rm), r.removed);
    const img = await save(await page.screenshot({ clip }), `after-${v.key}`);
    const applied = v.ops.map((o, i) => (o.op === 'text' && r.texts?.[i] ? { ...o, text: r.texts[i] } : o)).map(({ choices, ...o }) => o);
    after.push({ key: v.key, option: v.option, label: v.label ?? null, op: applied, description: describeOps(applied), ...(v.note ? { note: v.note } : {}), ...img });
  }
  return { screen, crop: clip, before, after };
}

/** Caso de tela inteira (estado, título ausente, região ausente): tela em meia escala; `example` mostra outra captura. */
async function screenCase(pageHalf, plan, { screensDir, outDir, encode }) {
  const shot = async (screen) => {
    const name = `screen-${sha1(PREVIEW_VERSION, plan.capture_hashes?.[screen] ?? readFileSync(join(screensDir, `${screen}.html`))).slice(0, 12)}`;
    const existing = readdirSync(outDir).find((f) => f.startsWith(`${name}.`));
    if (existing) return { file: existing };
    await pageHalf.goto(pathToFileURL(join(screensDir, `${screen}.html`)).href, { waitUntil: 'load', timeout: 30000 });
    await pageHalf.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    const e = await encode(await pageHalf.screenshot());
    const file = `${name}.${e.ext}`;
    writeFileSync(join(outDir, file), Buffer.from(e.b64, 'base64'));
    return { file, width: e.width, height: e.height };
  };
  const screen = plan.screens[0];
  if (!screen) return { failed: 'nenhuma captura das telas do caso' };
  const before = await shot(screen);
  const variants = [...plan.options.map((o) => ({ key: `o${o.index}`, option: o.index, ops: o.ops, none: o.none })), ...(plan.implicit ? [{ key: 'rule', option: null, ops: plan.implicit.ops, none: plan.implicit.none, label: plan.implicit.label }] : [])];
  const after = [];
  for (const v of variants) {
    const ex = (v.ops ?? []).find((o) => o.op === 'example');
    if (!ex) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: v.none ?? 'tela inteira: só a operação "example" tem prévia' }); continue; }
    if (!existsSync(join(screensDir, `${ex.screen}.html`))) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: `captura de exemplo ${ex.screen}.html não existe` }); continue; }
    after.push({ key: v.key, option: v.option, label: v.label ?? null, op: [ex], description: describeOps([ex]), ...(await shot(ex.screen)) });
  }
  return { screen, before, after };
}

function flowCase(plan, { map, outDir }) {
  if (!map) return { failed: 'sem mapa de fluxo' };
  const d = flowDiagram(map, plan.screen, plan.rule);
  if (!d) return { failed: `tela "${plan.screen}" não está no mapa de fluxo` };
  const name = plan.hash.slice(0, 12);
  writeFileSync(join(outDir, `${name}.before.svg`), d.before);
  const after = [];
  for (const o of plan.options) after.push({ key: `o${o.index}`, option: o.index, failed: o.none });
  if (plan.implicit?.flow) { writeFileSync(join(outDir, `${name}.after-rule.svg`), d.after); after.push({ key: 'rule', option: null, label: plan.implicit.label, op: [{ op: 'flow' }], description: plan.implicit.label, file: `${name}.after-rule.svg` }); }
  else if (plan.implicit) after.push({ key: 'rule', option: null, failed: plan.implicit.none });
  return { screen: plan.screen, before: { file: `${name}.before.svg` }, after };
}

const filesOf = (entry) => [entry.before?.file, ...(entry.after ?? []).map((a) => a.file)].filter(Boolean);

/**
 * Gera as prévias. `playwright` null → só os diagramas de fluxo; os demais casos ficam com `failed` explicando.
 * Cache: caso cujo hash não mudou e cujos arquivos existem não é refeito.
 */
export async function runPreviews(plans, { screensDir, outDir, map = null, width = 1440, height = 900, playwright = null, log = () => {} } = {}) {
  mkdirSync(outDir, { recursive: true });
  const old = readManifest(outDir);
  const manifest = { format: 'dsx-previews', version: PREVIEW_VERSION, generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), width, screens_dir: screensDir, cases: { ...(old?.cases ?? {}) } };
  const stats = { cached: 0, generated: 0, failed: 0 };
  let browser = null, page = null, pageHalf = null, encode = null;
  const ensure = async () => {
    if (browser) return true;
    if (!playwright) return false;
    browser = await playwright.module.chromium.launch();
    page = await browser.newPage({ viewport: { width, height } });
    pageHalf = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 0.5 });
    encode = await encoder(browser);
    return true;
  };
  try {
    for (const plan of plans) {
      const prev = old?.cases?.[plan.id];
      if (prev && prev.hash === plan.hash && !prev.failed && filesOf(prev).every((f) => existsSync(join(outDir, f)))) { stats.cached++; continue; }
      let entry;
      try {
        if (plan.kind === 'flow') entry = flowCase(plan, { map, outDir });
        else if (!(await ensure())) entry = { failed: 'Playwright indisponível no projeto: prévia de captura não gerada' };
        else if (plan.kind === 'screen') entry = await screenCase(pageHalf, plan, { screensDir, outDir, encode });
        else entry = await elementCase(page, plan, { screensDir, outDir, width, height, encode });
      } catch (e) {
        entry = { failed: `erro ao gerar: ${String(e.message).split('\n')[0]}` };
      }
      manifest.cases[plan.id] = { ids: plan.ids, family: plan.family, rule: plan.rule, kind: plan.kind, hash: plan.hash, ...(plan.capture_hashes ? { capture_hashes: plan.capture_hashes } : {}), ...entry };
      if (entry.failed) stats.failed++; else stats.generated++;
      log(`${plan.id} ${entry.failed ? `sem prévia: ${entry.failed}` : `${entry.after?.filter((a) => a.file).length ?? 0} depois`}`);
    }
  } finally {
    if (browser) await browser.close();
  }
  // poda: arquivos que nenhuma entrada do manifesto usa
  const used = new Set(Object.values(manifest.cases).flatMap(filesOf));
  for (const f of readdirSync(outDir)) if (/\.(webp|jpg|svg)$/.test(f) && !used.has(f)) rmSync(join(outDir, f));
  writeFileSync(join(outDir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return { manifest, stats };
}

/** Resumo do manifesto por tipo de operação aplicada e motivos de ausência. */
export function summarizeManifest(manifest, ids = null) {
  const out = { cases: 0, with_preview: 0, by_op: {}, without: {}, failed_options: {} };
  for (const [id, e] of Object.entries(manifest?.cases ?? {})) {
    if (ids && !ids.has(id)) continue;
    out.cases++;
    if (e.failed) { out.without[e.failed.replace(/\(.*\)$/, '').trim()] = (out.without[e.failed.replace(/\(.*\)$/, '').trim()] ?? 0) + 1; continue; }
    const made = (e.after ?? []).filter((a) => a.file);
    if (e.before?.file) out.with_preview++;
    const ops = new Set(made.flatMap((a) => (a.op ?? []).map((o) => o.op)));
    if (!ops.size) ops.add(e.kind === 'screen' ? 'só antes (tela)' : 'só antes');
    for (const o of ops) out.by_op[o] = (out.by_op[o] ?? 0) + 1;
    for (const a of (e.after ?? []).filter((x) => !x.file)) out.failed_options[a.failed] = (out.failed_options[a.failed] ?? 0) + 1;
  }
  return out;
}

/** Monta os casos da página e roda tudo (usado pela CLI e por audit.mjs --preview). */
export async function previewModule({ root, module, dir = null, out = null, screens = null, map = null, minSeverity = null, width = 1440, playwright, registry = null, log }) {
  const p = previewPaths({ root, module, dir, out, screens, map });
  const st = findings.load(findings.paths(p.findingsDir, module), module);
  const reg = registry ?? st.findings;
  findings.restatus(reg, st.decisions);
  const cases = findings.pageCases(reg, st.options, st.decisions);
  const flowMap = isFile(p.map) ? JSON.parse(readFileSync(p.map, 'utf8')) : null;
  const plans = planPreviews(cases, { screensDir: p.screens, map: flowMap, minSeverity, width });
  const r = await runPreviews(plans, { screensDir: p.screens, outDir: p.out, map: flowMap, width, playwright, log });
  return { ...r, plans, out: p.out, summary: summarizeManifest(r.manifest, new Set(plans.map((x) => x.id))) };
}

async function main() {
  const a = parseArgs();
  if (!a.module || a.module === true) {
    console.error('Uso: node tools/ux-lint/preview.mjs --module <m> --root <projeto> [--screens <capturas>] [--map <flows.json>] [--min-severity <n>] [--out <dir>] [--width 1440] [--json]');
    process.exit(2);
  }
  const root = resolve(typeof a.root === 'string' ? a.root : process.cwd());
  const playwright = resolvePlaywright();
  if (!playwright) console.error(`${PLAYWRIGHT_MISSING}\nSem ele, só os diagramas de fluxo saem; a página fica sem prévia das capturas.`);
  const str = (v) => (typeof v === 'string' ? v : null);
  let r;
  try {
    r = await previewModule({
      root, module: a.module, dir: str(a.dir), out: str(a.out), screens: str(a.screens), map: str(a.map),
      minSeverity: a['min-severity'] !== undefined ? Number(a['min-severity']) : null, width: Number(a.width ?? 1440), playwright,
      log: a.verbose ? (m) => console.log(m) : () => {},
    });
  } catch (e) {
    if (/Executable doesn't exist|browserType\.launch/i.test(String(e.message))) { console.error(`O navegador do Playwright não está instalado: rode  npx playwright install chromium\n${e.message.split('\n')[0]}`); process.exit(3); }
    throw e;
  }
  if (a.json) { console.log(JSON.stringify({ out: r.out, stats: r.stats, summary: r.summary }, null, 2)); return; }
  const s = r.summary;
  console.log(`${r.out} · ${s.cases} caso(s): ${r.stats.generated} gerado(s), ${r.stats.cached} do cache, ${r.stats.failed} sem prévia`);
  console.log(`  por operação: ${Object.entries(s.by_op).map(([k, v]) => `${k} ${v}`).join(' · ') || 'nenhuma'}`);
  for (const [k, v] of Object.entries(s.without)) console.log(`  sem prévia (${v}): ${k}`);
  process.exit(playwright ? 0 : 3);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
