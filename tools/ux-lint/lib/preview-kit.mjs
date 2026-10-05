// Donor kit of the previews: walks the module's captures and keeps, with the CSS each one uses, the real pieces the
// operations build on the screen (synthesize-state, synthesize-region, insert, wrap, variant, style with theme:,
// hint annotate): state blocks from *.error/*.empty/*.loading.html, alerts by color, buttons by variant, panel,
// heading, caption, chip, helper text, search field, tooltip classes, error color and the heading scale (h1–h6) as
// the product uses it. Never a mockup: everything comes from some capture. No dependencies.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

export const KIT_VERSION = 6;
const KIT_FILE = 'kit.json';
const STATE_BLOCKS = ['error', 'empty', 'loading'];

/** Visible text lines of a capture (no styles or scripts), to find what a state adds. */
export function textLines(html) {
  const body = String(html).slice(Math.max(0, String(html).indexOf('<body')));
  return body.replace(/<(style|script)[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, '\n').split('\n')
    .map((l) => l.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}
/** Texts the state capture has and the base screen does not (the state block). */
export function addedLines(baseHtml, stateHtml) {
  const base = new Set(textLines(baseHtml));
  return [...new Set(textLines(stateHtml).filter((l) => !base.has(l)))];
}
/** Heading scale: mode of each level's size in the captures, no lower level larger than the one above. */
export function typographyScale(samples) {
  const out = {};
  let prev = Infinity;
  for (let l = 1; l <= 6; l++) {
    const list = samples[`h${l}`] ?? [];
    if (!list.length) continue;
    const count = new Map();
    for (const s of list) { const k = `${s.size}|${s.line}|${s.weight}`; count.set(k, (count.get(k) ?? 0) + 1); }
    const [size, line, weight] = [...count.entries()].sort((a, b) => b[1] - a[1])[0][0].split('|');
    const sz = Math.min(Number(size), prev);
    out[`h${l}`] = { size: sz, line, weight: Number(weight) || weight };
    prev = sz;
  }
  return out;
}

/* c8 ignore start */
/** Runs inside a capture: exposes `window.__dsxkitc` with the collectors. */
export function kitCollector() {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    }
    return true;
  };
  const STRIP = /::?(before|after|placeholder|selection|backdrop|-webkit-[a-z-]+|-moz-[a-z-]+|hover|focus-visible|focus-within|focus|active|visited|first-letter|first-line|checked|disabled|not\([^)]*\))/g;
  function rulesFor(root) {
    const els = [root, ...root.querySelectorAll('*')];
    const classes = new Set(els.flatMap((e) => [...e.classList]));
    const test = (sel) => /\./.test(sel) && sel.split(',').some((part) => {
      const s = part.replace(STRIP, '').trim();
      if (!s) return false;
      try { return els.some((e) => e.matches(s)); } catch { return (part.match(/\.([\w-]+)/g) || []).some((c) => classes.has(c.slice(1))); }
    });
    const out = [];
    const walk = (rules, media) => {
      for (const r of rules) {
        if (r.type === 1) { if (test(r.selectorText)) out.push(media ? `@media ${media}{${r.cssText}}` : r.cssText); }
        else if (r.type === 4) walk(r.cssRules, r.media.mediaText);
      }
    };
    for (const ss of document.styleSheets) { let rs; try { rs = ss.cssRules; } catch { continue; } walk(rs, null); }
    return out.join('\n');
  }
  const serialize = (el, deep = true) => {
    if (deep) return { html: el.outerHTML, css: rulesFor(el) };
    const c = el.cloneNode(false);
    el.parentElement.appendChild(c);
    const css = rulesFor(c);
    c.remove();
    return { html: c.outerHTML, css };
  };
  const first = (sel, ok = () => true) => [...document.querySelectorAll(sel)].find((e) => visible(e) && ok(e));
  // neutral (gray) helper text and caption: low saturation, no success or error helper
  const sat = (x) => { const [r, g, b] = (getComputedStyle(x).color.match(/\d+/g) || [0, 0, 0]).map(Number); return Math.max(r, g, b) - Math.min(r, g, b); };
  const neutral = (sel) => [...document.querySelectorAll(sel)].find((e) => visible(e) && !e.classList.contains('Mui-error') && [e, ...e.querySelectorAll('*')].every((x) => sat(x) < 40));
  window.__dsxkitc = {
    typography() {
      const out = {};
      for (let l = 1; l <= 6; l++) out[`h${l}`] = [...document.querySelectorAll(`h${l}`)].filter(visible).map((e) => { const cs = getComputedStyle(e); return { size: Math.round(parseFloat(cs.fontSize) * 10) / 10, line: cs.lineHeight, weight: cs.fontWeight }; });
      return out;
    },
    block(added) {
      const set = new Set(added);
      let els = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.nodeValue.replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim(); if (t && set.has(t) && n.parentElement && visible(n.parentElement)) els.push(n.parentElement); }
      if (!els.length) els = [...document.querySelectorAll('.MuiSkeleton-root')].filter(visible);
      if (!els.length) return null;
      let lca = els[0];
      while (lca && !els.every((e) => lca.contains(e))) lca = lca.parentElement;
      if (!lca || lca === document.body || lca.matches('main') || lca.querySelector('[role=tablist], nav, h1')) return null;
      const r = lca.getBoundingClientRect();
      // block context: alignment and spacing of the container around it (table cell, card…)
      const host = lca.parentElement;
      const hs = host ? getComputedStyle(host) : null;
      const ctx = hs ? Object.fromEntries([['text-align', hs.textAlign], ['padding', hs.padding], ['display', /flex|grid/.test(hs.display) ? hs.display : 'block'], ['justify-content', hs.justifyContent], ['align-items', hs.alignItems], ['flex-direction', hs.flexDirection]].filter(([, v]) => v && v !== 'normal' && v !== '0px')) : null;
      return { ...serialize(lca), button: !!lca.querySelector('button'), area: Math.round(r.width * r.height), ctx };
    },
    roles(need) {
      const out = {};
      const pick = {
        chip: () => first('.MuiChip-root'),
        helper: () => neutral('.MuiFormHelperText-root'),
        caption: () => neutral('.MuiTypography-caption'),
        'search-field': () => { const i = first('input[placeholder]', (e) => /^(buscar|pesquisar|procurar|filtrar|search)/i.test(e.placeholder)); return i ? i.closest('.MuiTextField-root, .MuiFormControl-root, .MuiInputBase-root') : null; },
        panel: () => first('.MuiPaper-outlined:not(.MuiAlert-root), .MuiCard-root', (e) => e.getBoundingClientRect().width >= 240 && !e.closest('[role=dialog]')),
        heading: () => first('main h2, main h3'),
        spinner: () => first('.MuiCircularProgress-root'),
      };
      for (const k of need) {
        const el = pick[k] && pick[k]();
        if (el) out[k] = ['panel', 'heading', 'caption'].includes(k) ? serialize(el, false) : serialize(el);
      }
      return out;
    },
    alerts(need) {
      const out = {};
      for (const c of need) { const el = first(`.MuiAlert-color${c.charAt(0).toUpperCase()}${c.slice(1)}`); if (el) out[c] = serialize(el); }
      return out;
    },
    buttons(need) {
      const out = {};
      const live = (e) => !e.disabled && !e.classList.contains('Mui-disabled');
      for (const v of need) { const el = first(`.MuiButton-root.MuiButton-${v}.MuiButton-sizeMedium`, live) || first(`.MuiButton-root.MuiButton-${v}`, live); if (el) out[v] = { className: el.className, css: rulesFor(el) }; }
      return out;
    },
    /** Kit tooltip class (element on screen or CSS rule) and the theme error color (`.Mui-error` rule). */
    sheet() {
      let tooltip = null, error = null;
      const tip = first('.MuiTooltip-tooltip');
      if (tip) tooltip = { className: tip.className, css: rulesFor(tip) };
      const walk = (rules) => {
        for (const r of rules) {
          if (r.type === 4) { walk(r.cssRules); continue; }
          if (r.type !== 1) continue;
          if (!tooltip) { const m = r.selectorText.match(/^\.(css-[\w-]+-MuiTooltip-tooltip)$/); if (m) tooltip = { className: `MuiTooltip-tooltip ${m[1]}`, css: r.cssText }; }
          if (!error && /\.Mui-error$/.test(r.selectorText) && r.style.color) error = r.style.color;
        }
      };
      for (const ss of document.styleSheets) { let rs; try { rs = ss.cssRules; } catch { continue; } walk(rs); }
      return { tooltip, error };
    },
    extra(sel) { const e = document.querySelector(sel); return e ? serialize(e) : null; },
  };
}
/* c8 ignore stop */

const hex = (rgbStr) => { const m = String(rgbStr).match(/\d+/g); return m && m.length >= 3 ? `#${m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}` : rgbStr; };

/**
 * Builds (or reads from the `kit.json` cache in `outDir`) the module kit. `files`: .html captures; `extras`: keys
 * "<capture>|<selector>" requested by `insert` with `from`. Returns the kit.
 */
export async function buildKit(page, { screensDir, files, outDir, extras = [], log = () => {} }) {
  const hashes = files.map((f) => [f, createHash('sha1').update(readFileSync(join(screensDir, f))).digest('hex')]);
  const key = createHash('sha1').update(JSON.stringify([KIT_VERSION, hashes, [...extras].sort()])).digest('hex');
  const cacheFile = outDir ? join(outDir, KIT_FILE) : null;
  if (cacheFile && existsSync(cacheFile)) {
    try { const k = JSON.parse(readFileSync(cacheFile, 'utf8')); if (k.key === key) return k.kit; } catch { /* rebuild */ }
  }
  const kit = { typography: {}, blocks: { error: [], empty: [], loading: [] }, alerts: {}, buttons: {}, roles: {}, extras: {}, error_color: null };
  const samples = {};
  const ROLES = ['chip', 'helper', 'caption', 'search-field', 'panel', 'heading', 'spinner'];
  const COLORS = ['info', 'warning', 'success', 'error'];
  const VARIANTS = ['outlined', 'contained', 'text'];
  const fileSet = new Set(files);
  const load = async (f) => {
    await page.goto(pathToFileURL(join(screensDir, f)).href, { waitUntil: 'load', timeout: 30000 });
    await page.addScriptTag({ content: `(${kitCollector.toString()})()` });
  };
  const ordered = [...files].sort((a, b) => (a.split('.').length - b.split('.').length) || a.localeCompare(b));
  for (const f of ordered) {
    try {
      await load(f);
      const typo = await page.evaluate(() => window.__dsxkitc.typography());
      for (const [k, v] of Object.entries(typo)) (samples[k] ??= []).push(...v);
      const needRoles = ROLES.filter((r) => !kit.roles[r]);
      if (needRoles.length) Object.assign(kit.roles, await page.evaluate((n) => window.__dsxkitc.roles(n), needRoles));
      const needColors = COLORS.filter((c) => !kit.alerts[c]);
      if (needColors.length) Object.assign(kit.alerts, await page.evaluate((n) => window.__dsxkitc.alerts(n), needColors));
      const needVar = VARIANTS.filter((v) => !kit.buttons[v]);
      if (needVar.length) Object.assign(kit.buttons, await page.evaluate((n) => window.__dsxkitc.buttons(n), needVar));
      if (!kit.roles.tooltip || !kit.error_color) {
        const s = await page.evaluate(() => window.__dsxkitc.sheet());
        if (!kit.roles.tooltip && s.tooltip) kit.roles.tooltip = s.tooltip;
        if (!kit.error_color && s.error) kit.error_color = hex(s.error);
      }
      const m = f.match(/^(.+)\.(error|empty|loading)\.html$/);
      if (m && fileSet.has(`${m[1]}.html`)) {
        const added = m[2] === 'loading' ? [] : addedLines(readFileSync(join(screensDir, `${m[1]}.html`), 'utf8'), readFileSync(join(screensDir, f), 'utf8'));
        const b = await page.evaluate((a) => window.__dsxkitc.block(a), added);
        if (b) kit.blocks[m[2]].push({ screen: f.replace(/\.html$/, ''), ...b });
      }
      for (const x of extras.filter((e) => e.startsWith(`${f.replace(/\.html$/, '')}|`) && !kit.extras[e])) {
        const d = await page.evaluate((s) => window.__dsxkitc.extra(s), x.slice(x.indexOf('|') + 1));
        if (d) kit.extras[x] = d;
      }
    } catch (e) {
      log(`kit: ${f} skipped (${String(e.message).split('\n')[0]})`);
    }
  }
  kit.typography = typographyScale(samples);
  // smaller block first: the one with only the state, without taking the screen along
  for (const k of STATE_BLOCKS) kit.blocks[k].sort((a, b) => a.area - b.area || a.html.length - b.html.length);
  if (cacheFile) writeFileSync(cacheFile, JSON.stringify({ key, kit }));
  return kit;
}
