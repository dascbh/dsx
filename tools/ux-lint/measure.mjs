#!/usr/bin/env node
// ux-lint, geometry measurement: opens STATIC HTML captures (file://, no server) in a headless browser and writes,
// per screen, `<name>.geometry.json` in the format described in lib/geometry.mjs. It is the input of layout.mjs
// (rules L1–L9), which needs no browser.
//
// Usage: node tools/ux-lint/measure.mjs <folder|file.html...> --out <geometry-folder> [--ux UX.md] [--width 1440] [--height 900]
//
// Playwright is NOT a DSX dependency: it is resolved from the project (current directory), as `playwright` or
// `@playwright/test`. Without it, the command exits with 3 and explains how to install it; the L analysis is unavailable.
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename, resolve, relative } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig } from './lib/config.mjs';
import { GEOMETRY_FORMAT, GEOMETRY_VERSION } from './lib/geometry.mjs';
import { kitProfile } from './lib/kits.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';

/**
 * Archetype regions recognized by default (besides `data-region`): those of the `auto` kit profile
 * (lib/kits.mjs). With `verification.kit` in the UX.md, those of the chosen kit apply; the UX.md can add or
 * replace them in `verification.selectors.archetype-regions`.
 */
export const DEFAULT_ARCHETYPE_REGION_SELECTORS = kitProfile('auto').regions;

/** Resolves the project's Playwright (cwd). Returns the module or null. */
export function resolvePlaywright(cwd = process.cwd()) {
  const req = createRequire(join(resolve(cwd), 'package.json'));
  for (const name of ['playwright', '@playwright/test']) {
    try { const m = req(name); if (m?.chromium) return { module: m, name }; } catch { /* try the next one */ }
  }
  return null;
}

export function listHtml(inputs) {
  const out = [];
  for (const e of inputs) {
    if (statSync(e).isDirectory()) {
      for (const f of readdirSync(e).sort()) if (/\.html?$/.test(f)) out.push(join(e, f));
    } else out.push(e);
  }
  return out;
}

// Runs inside the page: collects the relevant elements. Receives the UX.md selectors.
/* c8 ignore start */
function collect(sel) {
  const regionSel = [...sel.regions, sel.dialog].join(', ');
  const INTERACTIVE = `${sel.button}, a[href], input:not([type=hidden]), select, textarea, summary, [role=link], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=menuitem], [role=option], [role=combobox]`;
  const CONTAINERS = `aside, section, form, fieldset, table, ul, ol, footer, article, [role=toolbar], [role=tablist], [role=list], [role=grid], [role=group], [role=tabpanel], [role=region], [role=complementary], [role=article]${sel.kit_containers ? `, ${sel.kit_containers}` : ''}`;
  const CARDS = sel.kit_cards || 'article, [role=article]';
  const FORM_GROUP = 'form, fieldset, [role=form], [role=group], [role=dialog], [role=tabpanel], aside, section, [role=region]';
  const unstableId = (id) => !id || /^_r_|^:r|^mui-|\d{3,}/.test(id) || /[^\w-]/.test(id);
  const paths = new WeakMap();
  const pathOf = (el) => {
    if (!el || el === document.body || el === document.documentElement) return el === document.body ? 'body' : 'html';
    if (paths.has(el)) return paths.get(el);
    let p;
    if (el.id && !unstableId(el.id)) p = `#${el.id}`;
    else {
      const parent = el.parentElement;
      const same = parent ? [...parent.children].filter((c) => c.tagName === el.tagName) : [el];
      const tag = el.tagName.toLowerCase();
      const part = same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(el) + 1})` : tag;
      const base = pathOf(parent);
      p = base === 'body' && ['main', 'header', 'nav', 'aside', 'footer'].includes(tag) && same.length === 1 ? tag : `${base} > ${part}`;
    }
    paths.set(el, p);
    return p;
  };
  const visible = (el, cs) => {
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true' && !n.matches(sel.dialog)) return false;
      const s = getComputedStyle(n);
      if (parseFloat(s.opacity) === 0 && !(n === el && el.matches('input, select, textarea'))) return false;
    }
    return true;
  };
  const clean = (s) => String(s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const byIds = (ids) => clean(String(ids || '').split(/\s+/).map((i) => document.getElementById(i)?.textContent || '').join(' '));
  const accName = (el) => clean(el.getAttribute('aria-label')) || byIds(el.getAttribute('aria-labelledby')) || clean(el.innerText || el.textContent) || clean(el.getAttribute('title')) || clean(el.getAttribute('placeholder')) || (el.matches('input[type=checkbox], input[type=radio]') ? '' : clean(el.value));
  const regionLabels = new Map();
  const counts = {};
  const regionLabel = (r) => {
    if (!r) return '(outside any region)';
    if (regionLabels.has(r)) return regionLabels.get(r);
    const tag = r.tagName.toLowerCase();
    let base = tag + (r.id && !unstableId(r.id) ? `#${r.id}` : '');
    if (r.matches(sel.dialog)) {
      const first = (r.getAttribute('aria-labelledby') || '').split(/\s+/)[0];
      const title = (first ? clean(document.getElementById(first)?.textContent) : '') || clean(r.getAttribute('aria-label'));
      base = `dialog${title ? ` "${title.slice(0, 60)}"` : ''}`;
    } else if (r.getAttribute('role')) base += `[role=${r.getAttribute('role')}]`;
    counts[base] = (counts[base] || 0) + 1;
    const l = counts[base] > 1 ? `${base} (#${counts[base]})` : base;
    regionLabels.set(r, l);
    return l;
  };
  const archRegion = (el) => {
    if (el.dataset && el.dataset.region) return el.dataset.region;
    for (const [id, s] of Object.entries(sel.archetype_regions || {})) { try { if (el.matches(s)) return id; } catch { /* invalid selector */ } }
    return null;
  };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim().length > 0;
  const blockText = (el) => clean(el.innerText || el.textContent);
  const r1 = (n) => Math.round(n * 10) / 10;
  const out = [];
  const all = document.body.querySelectorAll('*');
  for (const el of all) {
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'template', 'br', 'path', 'g', 'defs', 'use', 'title', 'head', 'meta', 'link'].includes(tag)) continue;
    if (el.closest('svg') && tag !== 'svg') continue;
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) continue;
    const role = el.getAttribute('role');
    const isRegion = el.matches(regionSel);
    const insideInteractive = el.parentElement?.closest(INTERACTIVE);
    const disabled = !!el.disabled || el.getAttribute('aria-disabled') === 'true' || (!!sel.kit_disabled && el.matches(sel.kit_disabled));
    const isInteractive = !insideInteractive && el.matches(INTERACTIVE) && (cs.pointerEvents !== 'none' || disabled)
      && !el.classList.contains('MuiSelect-nativeInput');
    const isField = el.matches(sel.field) || role === 'combobox';
    const hl = /^h[1-6]$/.test(tag) ? Number(tag[1]) : role === 'heading' ? Number(el.getAttribute('aria-level') || 2) : null;
    const isLabel = tag === 'label' || tag === 'legend';
    // Field: the visual box is the control outline, not the inner <input> (which is inset by padding).
    const fieldBox = (() => {
      if (!isField) return null;
      const marked = el.closest('[data-field-box], .MuiInputBase-root');
      if (marked) return marked;
      const own = el.getBoundingClientRect();
      let p = el.parentElement;
      for (let i = 0; i < 3 && p; i++, p = p.parentElement) {
        const pr = p.getBoundingClientRect(), ps = getComputedStyle(p);
        if (pr.height > own.height + 24) break;
        if (parseFloat(ps.borderLeftWidth) > 0 || parseFloat(ps.borderBottomWidth) > 0) return p;
      }
      return null;
    })();
    const r = (fieldBox || el).getBoundingClientRect();
    const bg = cs.backgroundColor;
    const saturatedBlock = (() => {
      const m = bg.match(/rgba?\(([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?/);
      if (!m || (m[4] !== undefined && parseFloat(m[4]) < 0.5)) return false;
      const [R, G, B] = [m[1] / 255, m[2] / 255, m[3] / 255];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, d = mx - mn;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      return s >= 0.45 && l >= 0.2 && l <= 0.7 && r.width * r.height >= 400;
    })();
    let kind = null;
    if (isRegion) kind = 'region';
    else if (isInteractive) kind = isField ? 'field' : 'interactive';
    else if (insideInteractive) continue;
    else if (hl) kind = 'heading';
    else if (isLabel) kind = 'label';
    else if (isField) kind = 'field';
    else if (['svg', 'canvas', 'img', 'video'].includes(tag) && r.width >= 48 && r.height >= 32) kind = 'graphic';
    else if (el.matches(CARDS)) kind = 'card';
    else if (el.matches(CONTAINERS) || saturatedBlock || archRegion(el)) kind = 'block';
    else if (ownText(el) && cs.display !== 'inline' && blockText(el).length) kind = 'text';
    else if (ownText(el) && blockText(el).length >= 40) kind = 'text';
    if (!kind) continue;
    const text = kind === 'interactive' || kind === 'field' ? accName(el) : kind === 'region' || kind === 'block' || kind === 'card' || kind === 'graphic' ? clean(el.getAttribute('aria-label')) : blockText(el);
    let labelFor = null;
    if (isLabel) {
      const target = el.htmlFor ? document.getElementById(el.htmlFor) : el.querySelector(sel.field);
      if (target) labelFor = pathOf(target);
      else if (el.id) { const t = document.querySelector(`[aria-labelledby~="${CSS.escape(el.id)}"]`); if (t) labelFor = pathOf(t); }
    }
    const blockParent = (() => { for (let p = el.parentElement; p; p = p.parentElement) { const d = getComputedStyle(p).display; if (d !== 'inline' && d !== 'contents') return p; } return null; })();
    const isInline = isInteractive && tag === 'a' && cs.display === 'inline' && !!blockParent && clean(blockParent.innerText).length > clean(el.innerText).length + 10;
    const fg = isField || isLabel ? el.parentElement?.closest(`${FORM_GROUP}, ${CONTAINERS}`) || el.closest(regionSel) : null;
    out.push({
      id: pathOf(el), tag, role, classes: [...el.classList].slice(0, 12), kind,
      text: text.slice(0, 80), text_length: text.length,
      box: { x: r1(r.x + scrollX), y: r1(r.y + scrollY), width: r1(r.width), height: r1(r.height) },
      style: {
        font_size: parseFloat(cs.fontSize) || null, font_weight: Number(cs.fontWeight) || 400,
        line_height: parseFloat(cs.lineHeight) || null, color: cs.color, background_color: bg,
        display: cs.display, visibility: cs.visibility,
      },
      is_interactive: !!isInteractive, is_primary: !!isInteractive && el.matches(sel.primary), disabled: !!isInteractive && disabled,
      is_destructive: !!isInteractive && !!sel.destructive && el.matches(sel.destructive), is_inline: isInline,
      label_for: labelFor, region: regionLabel(el.closest(regionSel)), heading_level: hl,
      parent: el.parentElement ? pathOf(el.parentElement) : null, form_group: fg ? pathOf(fg) : null,
      archetype_region: archRegion(el),
      selected: el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-pressed') === 'true' || !!el.getAttribute('aria-current') && el.getAttribute('aria-current') !== 'false',
    });
  }
  const dialogs = [...document.querySelectorAll(sel.dialog)].filter((d) => visible(d, getComputedStyle(d)));
  return {
    title: document.title || '',
    page_height: document.documentElement.scrollHeight,
    body_font_size: parseFloat(getComputedStyle(document.body).fontSize) || 16,
    dialog_open: dialogs.length > 0,
    elements: out,
  };
}
/* c8 ignore stop */

/** Measures a list of captures and writes the geometry. Returns [{ file, out, elements }]. */
export async function measure(files, { outDir, cfg, width = 1440, height = 900, playwright }) {
  const sel = { ...cfg.verification.selectors };
  const kit = cfg.kitProfile ?? kitProfile(cfg.verification?.kit);
  sel.archetype_regions = { ...kit.regions, ...(sel['archetype-regions'] || {}) };
  sel.kit_containers = kit.containers;
  sel.kit_cards = kit.cards;
  sel.kit_disabled = kit.disabled;
  delete sel['archetype-regions'];
  mkdirSync(outDir, { recursive: true });
  const browser = await playwright.module.chromium.launch();
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    for (const f of files) {
      await page.goto(pathToFileURL(resolve(f)).href, { waitUntil: 'load', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
      await page.waitForTimeout(150);
      const data = await page.evaluate(collect, sel);
      const screen = basename(f).replace(/\.html?$/, '');
      const geom = { format: GEOMETRY_FORMAT, version: GEOMETRY_VERSION, screen, file: basename(f), title: data.title, viewport: { width, height }, ...data };
      const out = join(outDir, `${screen}.geometry.json`);
      writeFileSync(out, `${JSON.stringify(geom)}\n`);
      results.push({ file: f, out, elements: data.elements.length, dialog_open: data.dialog_open });
    }
  } finally {
    await browser.close();
  }
  return results;
}

export const PLAYWRIGHT_MISSING = [
  'Playwright not found in the project (looked for "playwright" and "@playwright/test" from the current directory).',
  'Geometry measurement needs a headless browser; DSX does not ship one as a dependency.',
  'To install it in the project:  npm i -D playwright && npx playwright install chromium',
  '(or run this command from a project folder that already has @playwright/test, e.g. frontend/).',
  'Without the geometry, the layout and hierarchy analysis (L1–L9, tools/ux-lint/layout.mjs) is unavailable.',
].join('\n');

async function main() {
  const args = parseCli('ux-lint/measure.mjs');
  // With --module (and --root), input and output come from the project paths (lib/project-paths.mjs).
  if (typeof args.module === 'string') {
    const pp = resolveProjectPaths({ root: typeof args.root === 'string' ? args.root : process.cwd(), module: args.module, config: typeof args.config === 'string' ? args.config : null });
    for (const w of pp.warnings) console.error(`AVISO ${w}`);
    if (!args._.length) args._.push(pp.captures);
    if (typeof args.out !== 'string') args.out = pp.geometry;
    if (typeof args.ux !== 'string' && statSync(pp.ux, { throwIfNoEntry: false })?.isFile()) args.ux = pp.ux;
  }
  if (!args._.length || typeof args.out !== 'string') {
    console.error('Usage: node tools/ux-lint/measure.mjs <folder|file.html...> --out <geometry-folder> [--ux UX.md] [--width 1440] [--height 900]\n    or: node tools/ux-lint/measure.mjs --module <m> [--root <project>] [--config <file>]');
    process.exit(2);
  }
  const playwright = resolvePlaywright();
  if (!playwright) { console.error(PLAYWRIGHT_MISSING); process.exit(3); }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const files = listHtml(args._);
  let results;
  try {
    results = await measure(files, { outDir: resolve(args.out), cfg, width: Number(args.width ?? 1440), height: Number(args.height ?? 900), playwright });
  } catch (e) {
    if (/Executable doesn't exist|browserType\.launch/i.test(String(e.message))) {
      console.error(`The Playwright browser (${playwright.name}) is not installed: run  npx playwright install chromium\n${e.message.split('\n')[0]}`);
      process.exit(3);
    }
    throw e;
  }
  for (const r of results) console.log(`${basename(r.file)} → ${relative(process.cwd(), r.out).startsWith('..') ? r.out : relative(process.cwd(), r.out)} (${r.elements} elements${r.dialog_open ? ', dialog open' : ''})`);
  console.log(`\n${results.length} screen(s) measured with ${playwright.name}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
