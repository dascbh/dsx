#!/usr/bin/env node
// ux-lint, option previews: for each open case of the decision page, crops from the REAL CAPTURE (file://, no
// server) the region of the finding's element ("before") and applies each option to the capture's DOM for the
// "after", with the same crop. Flow becomes a mini SVG diagram (no browser). Contract: knowledge/foundations/ux-findings.md.
//
// Usage: node tools/ux-lint/preview.mjs --module <m> --root <project> [--screens <captures>] [--map <flows.json>]
//        [--min-severity <n>] [--out <dir>] [--width 1440] [--dir <findings>] [--lang en|pt-BR] [--json]
// Defaults (lib/project-paths.mjs): --screens <root>/.dsx/captures/<m> (legacy .stitch/<m>/code with a warning) · --map <root>/.dsx/maps/flows-<m>.json ·
//          --out <root>/.dsx/findings/<m>/previews (previews.json manifest + WebP images, or JPEG if WebP fails).
// --lang: language of the labels, badges and annotations drawn on the images (default en); text built inside the
// product (state blocks, region titles) follows UX.md `content.language` (default pt-BR).
// Playwright is NOT a DSX dependency: it is resolved from the current directory (like measure.mjs). Without it, exits
// with 3 and the page has no capture previews (flow diagrams are still produced).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import * as findings from './findings.mjs';
import { resolvePlaywright, PLAYWRIGHT_MISSING } from './measure.mjs';
import {
  PREVIEW_VERSION, locatorFor, optionOps, implicitPreview, pickExample, screenOrder, describeOps, flowDiagram, sha1,
  stateRecipe, domOps, needsKit, previewKind,
} from './lib/preview-spec.mjs';
import { runtime } from './lib/preview-runtime.mjs';
import { buildKit, KIT_VERSION } from './lib/preview-kit.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';
import { pageLang, pageStrings, runtimeStrings, productText } from './lib/page-strings.mjs';
import { loadConfig } from './lib/config.mjs';

const MANIFEST = 'previews.json';
// the code that runs in the capture is part of the hash: changing the runtime redoes the previews without a version bump
const RUNTIME_HASH = sha1(runtime.toString()).slice(0, 12);
const BEFORE_COLOR = '#E5484D';
const AFTER_COLOR = '#12A150';
const SKIP_STATUS = new Set(['fixed', 'ignored', 'accepted-deviation']);
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

/** Default paths. */
export function previewPaths({ root, module, dir = null, out = null, screens = null, map = null, config = null }) {
  // flags relative to the current directory; project defaults in lib/project-paths.mjs (docs/project-paths.md)
  const p = resolveProjectPaths({ root, module, config, flags: { dir: dir && resolve(dir), screens: screens && resolve(screens), map: map && resolve(map) } });
  for (const w of p.warnings) console.error(`WARNING ${w}`);
  return {
    findingsDir: p.findings,
    out: out ? resolve(out) : join(p.findings, module, 'previews'),
    screens: p.captures,
    map: p.map,
    ux: p.ux,
  };
}

export const readManifest = (outDir) => {
  const f = join(outDir, MANIFEST);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
};

/**
 * Preview plan of each case, without a browser: representative screen, locator, operations per option, fix
 * indicated by the rule (case without options) and the cache hash. Fixed, ignored and accepted-deviation cases are
 * left out; `minSeverity` (optional) filters by case severity. `lang`: page language of the labels; `productLang`:
 * product language of the built text (both enter the hash).
 */
export function planPreviews(cases, { screensDir, map = null, minSeverity = null, width = 1440, lang = 'en', productLang } = {}) {
  const L = pageLang(lang);
  const tx = { lang: L, productLang };
  const files = existsSync(screensDir) ? readdirSync(screensDir).filter((f) => f.endsWith('.html')) : [];
  const fileSet = new Set(files);
  const exampleFor = (state, screen) => pickExample(files, state, screen);
  const contentHash = new Map();
  const capHash = (name) => {
    if (!contentHash.has(name)) contentHash.set(name, fileSet.has(`${name}.html`) ? sha1(readFileSync(join(screensDir, `${name}.html`))) : null);
    return contentHash.get(name);
  };
  const plans = [];
  // synthesize-state carries the recipe (page and dialog) already resolved, with the option's text over the default
  const enrich = (ops) => ops.map((o) => (o.op === 'synthesize-state' ? { ...o, recipe: stateRecipe(o.state, { title: o.title, text: o.text, action: o.action }, productLang) } : o));
  for (const c of cases) {
    if (c.statuses.every((s) => SKIP_STATUS.has(s))) continue;
    if (minSeverity !== null && (c.severity ?? 0) < minSeverity) continue;
    const plan = { id: c.id, ids: c.ids, family: c.family, rule: c.rule, severity: c.severity, options: [], implicit: null };
    if (c.family === 'flow') {
      const screen = (c.screens ?? [])[0];
      plan.kind = 'flow';
      plan.screen = screen;
      const imp = implicitPreview(c, tx);
      plan.implicit = imp.flow ? { label: imp.label, flow: true } : { label: null, none: imp.none };
      plan.options = (c.options ?? []).map((o, i) => ({ index: i, none: 'flow option: the diagram shows the fix indicated by the rule' }));
      plan.lang = L;
      plan.hash = sha1(PREVIEW_VERSION, 'flow', screen, c.rule, map ? sha1(JSON.stringify(map)) : null, L);
      plans.push(plan);
      continue;
    }
    const loc = locatorFor(c);
    const order = screenOrder(c);
    // after the cited screens, their state captures (the element may be only in the empty or error state)
    const states = order.flatMap((s) => files.filter((f) => f.startsWith(`${s}.`) && f !== `${s}.html`).map((f) => f.replace(/\.html$/, '')));
    const screens = [...new Set([...order, ...states])].filter((s) => fileSet.has(`${s}.html`));
    plan.kind = loc.screen_level ? 'screen' : 'element';
    plan.locator = loc;
    plan.screens = screens;
    plan.before_text = String((c.variants ?? [])[0] ?? c.text ?? '').replace(/\{[^{}]*\}/g, '…');
    plan.options = (c.options ?? []).map((o, i) => {
      const r = optionOps(c, o, tx);
      if (r.ops?.some((op) => op.op === 'example') && plan.kind === 'element') plan.kind = 'screen';
      return { index: i, text: o.text, ...(r.ops ? { ops: enrich(r.ops), derived: r.derived, ...(r.note ? { note: r.note } : {}) } : { none: r.none }) };
    });
    if (!plan.options.length) {
      const imp = implicitPreview(c, { exampleFor, ...tx });
      plan.implicit = imp.ops ? { label: imp.label, ops: enrich(imp.ops) } : { label: null, none: imp.none };
    }
    const allOps = [...plan.options.flatMap((o) => o.ops ?? []), ...(plan.implicit?.ops ?? [])];
    // whole screen with a DOM operation (state or region built on the screen): crop of the screen or dialog
    if (plan.kind === 'screen' && allOps.some((o) => o.op !== 'example')) plan.kind = 'synth';
    const examples = allOps.filter((o) => o.op === 'example').map((o) => o.screen);
    for (const o of allOps) if (o.op === 'insert' && o.from) plan.extras = [...new Set([...(plan.extras ?? []), `${o.from}|${o.source}`])];
    const kitKey = needsKit(allOps) ? sha1(KIT_VERSION, files.map((f) => [f, capHash(f.replace(/\.html$/, ''))])) : null;
    plan.lang = L;
    plan.hash = sha1(PREVIEW_VERSION, RUNTIME_HASH, width, screens.map((s) => [s, capHash(s)]), loc, plan.options, plan.implicit, examples.map((e) => [e, capHash(e)]), kitKey, L);
    plan.capture_hashes = Object.fromEntries(screens.map((s) => [s, capHash(s)]));
    plans.push(plan);
  }
  return plans;
}


// ---------- execution ----------

const unionCrop = (a, b) => (!a ? b : !b ? a : (() => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; })());
const roundCrop = (c, vw, vh) => { const x = Math.max(0, Math.floor(c.x)), y = Math.max(0, Math.floor(c.y)); return { x, y, width: Math.min(vw - x, Math.ceil(c.w)), height: Math.min(vh - y, Math.ceil(c.h)) }; };

/** WebP encoder (JPEG if the browser cannot encode WebP), quality ~0.7. Reused by the variations page. */
export async function encoder(browser, quality = 0.7) {
  const page = await browser.newPage();
  await page.setContent('<body></body>');
  return async (png) => page.evaluate(async ([b64, q]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    let url = c.toDataURL('image/webp', q);
    let ext = 'webp';
    if (!url.startsWith('data:image/webp')) { url = c.toDataURL('image/jpeg', q); ext = 'jpg'; }
    return { ext, b64: url.slice(url.indexOf(',') + 1), width: c.width, height: c.height };
  }, [png.toString('base64'), quality]);
}

const clip = (ops) => (ops ?? []).map(({ choices, recipe, ...o }) => o);
const loader = (page, screensDir) => async (screen) => {
  await page.goto(pathToFileURL(join(screensDir, `${screen}.html`)).href, { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.addScriptTag({ content: `(${runtime.toString()})()` });
};
const unionAll = (crop, rects) => rects.reduce((a, r) => unionCrop(a, r), crop);
const saver = (plan, outDir, encode) => async (png, name) => {
  const e = await encode(png);
  const file = `${plan.hash.slice(0, 12)}.${name}.${e.ext}`;
  writeFileSync(join(outDir, file), Buffer.from(e.b64, 'base64'));
  return { file, width: e.width, height: e.height };
};
/** "After" manifest entry, with the label of the preview type (page language `lang`). */
const afterEntry = (v, applied, img, extra = {}, lang = 'en') => ({
  key: v.key, option: v.option, label: v.label ?? null, op: applied, description: describeOps(applied, lang), kind_label: previewKind(applied, lang),
  ...(v.note ? { note: v.note } : {}), ...extra, ...img,
});

/** Generates the images of an element case. Returns the manifest entry. */
async function elementCase(page, plan, { screensDir, outDir, width, height, encode }) {
  const load = loader(page, screensDir);
  const loc = plan.locator;
  const beforeOpts = { annotate: loc.annotate_before ?? null, text: plan.before_text ?? '', fold: loc.fold ?? null };
  let screen = null, loc0 = null;
  for (const s of plan.screens) {
    await load(s);
    const r = await page.evaluate((l) => window.__dsxp.locate(l), loc);
    if (r.found) { screen = s; loc0 = r; break; }
  }
  if (!screen && loc.kind === 'main-title') return { failed: `the capture has no title text to promote to h1 (${plan.screens.slice(0, 3).join(', ')}: only a skeleton or no highlighted text at the top)` };
  if (!screen) return { failed: plan.screens.length ? `element not found in the captures (${plan.screens.slice(0, 3).join(', ')})` : 'no capture of the case screens' };
  const variants = [...plan.options.map((o) => ({ key: `o${o.index}`, option: o.index, ops: o.ops, none: o.none, note: o.note }))];
  if (plan.implicit) variants.push({ key: 'rule', option: null, ops: plan.implicit.ops, none: plan.implicit.none, label: plan.implicit.label });
  // L6: the whole window (the fold is the subject), from the content column to the right
  const viewportCrop = loc.viewport ? await page.evaluate(() => { const m = document.querySelector('main'); const x = m ? Math.max(0, m.getBoundingClientRect().left) : 0; return { x, y: 0, w: innerWidth - x, h: innerHeight }; }) : null;
  const pass = async (v) => {
    await load(screen);
    await page.evaluate((l) => window.__dsxp.locate(l), loc);
    return page.evaluate(([ops, o]) => window.__dsxp.apply(ops, o), [v.ops, { fold: loc.fold ?? null }]);
  };
  // 1st pass: measures each variant's crop and unites them, so all use the same window.
  let crop = viewportCrop ?? loc0.crop;
  {
    const b = await page.evaluate((o) => window.__dsxp.before(o), beforeOpts);
    if (!viewportCrop) crop = unionAll(crop, b.overlays);
  }
  for (const v of variants) {
    if (!v.ops) continue;
    const r = await pass(v);
    if (r.error) { v.none = r.error; v.ops = null; continue; }
    if (r.unchanged) { const done = describeOps(clip(v.ops), plan.lang); v.ops = [{ op: 'badge', text: pageStrings(plan.lang ?? 'en').badgeAlready }]; v.already = true; v.note = v.note ?? `on this capture the operation changes nothing (${done})`; }
    if (viewportCrop) continue;
    crop = unionAll(unionCrop(crop, r.crop), r.overlays ?? []);
    if (r.removed) crop = unionCrop(crop, { ...r.removed, h: Math.max(r.removed.h, 1) });
  }
  const box = roundCrop(crop, width, height);
  const save = saver(plan, outDir, encode);
  await load(screen);
  const l = await page.evaluate((x) => window.__dsxp.locate(x), loc);
  await page.evaluate((rs) => window.__dsxp.mark(rs, false), l.rects);
  await page.evaluate((o) => window.__dsxp.before(o), beforeOpts);
  const before = await save(await page.screenshot({ clip: box }), 'before');
  const after = [];
  for (const v of variants) {
    if (!v.ops) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: v.none }); continue; }
    const r = await pass(v);
    if (r.error) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: r.error }); continue; }
    if (r.rects.length) await page.evaluate((rs) => window.__dsxp.mark(rs, true), r.rects);
    if (r.removed) await page.evaluate((rm) => window.__dsxp.markRemoved(rm), r.removed);
    if (r.badged) await page.evaluate(([b, t]) => window.__dsxp.badgeAt(b, t), [box, r.badged]);
    const img = await save(await page.screenshot({ clip: box }), `after-${v.key}`);
    const applied = clip(r.applied.map((o, i) => (['text', 'annotate', 'insert'].includes(o.op) && r.texts?.[i] ? { ...o, text: r.texts[i] } : o)));
    after.push(afterEntry(v, applied, img, {}, plan.lang));
  }
  return { screen, crop: box, before, after };
}

/**
 * Whole-screen case with a DOM operation (state or region built on the screen itself). Open dialog: crop of the
 * dialog at scale 1; page: the window at half scale. The built block is outlined in green.
 */
async function synthCase(page, pageHalf, plan, { screensDir, outDir, width, height, encode }) {
  const screen = plan.screens[0];
  if (!screen) return { failed: 'no capture of the case screens' };
  const save = saver(plan, outDir, encode);
  const probe = loader(page, screensDir);
  await probe(screen);
  const s0 = await page.evaluate(() => window.__dsxp.screen());
  const dialog = !!s0.dialog;
  const pg = dialog ? page : pageHalf;
  const load = loader(pg, screensDir);
  const variants = [...plan.options.map((o) => ({ key: `o${o.index}`, option: o.index, ops: o.ops, none: o.none, note: o.note })), ...(plan.implicit ? [{ key: 'rule', option: null, ops: plan.implicit.ops, none: plan.implicit.none, label: plan.implicit.label }] : [])];
  let crop = dialog ? s0.dialog : { x: 0, y: 0, w: width, h: height };
  if (dialog) {
    for (const v of variants) {
      if (!v.ops || !domOps(v.ops)) continue;
      await load(screen);
      await pg.evaluate(() => window.__dsxp.screen());
      const r = await pg.evaluate((ops) => window.__dsxp.apply(ops), v.ops);
      if (r.error) { v.none = r.error; v.ops = null; continue; }
      const d = await pg.evaluate(() => window.__dsxp.screen());
      crop = unionCrop(crop, d.dialog);
    }
    crop = { x: crop.x - 8, y: crop.y - 8, w: crop.w + 16, h: crop.h + 16 };
  }
  const box = roundCrop(crop, width, height);
  await load(screen);
  const before = await save(await pg.screenshot({ clip: box }), 'before');
  const after = [];
  for (const v of variants) {
    const ex = (v.ops ?? []).find((o) => o.op === 'example');
    if (!v.ops) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: v.none ?? 'no preview' }); continue; }
    if (ex) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: 'an example from another screen does not mix with a change on the screen' }); continue; }
    await load(screen);
    await pg.evaluate(() => window.__dsxp.screen());
    const r = await pg.evaluate((ops) => window.__dsxp.apply(ops), v.ops);
    if (r.error) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: r.error }); continue; }
    if (r.rects.length) await pg.evaluate((rs) => window.__dsxp.mark(rs, true), r.rects);
    if (r.badged) await pg.evaluate(([b, t]) => window.__dsxp.badgeAt(b, t), [box, r.badged]);
    const img = await save(await pg.screenshot({ clip: box }), `after-${v.key}`);
    after.push(afterEntry(v, clip(r.applied.map((o, i) => (['text', 'annotate', 'insert'].includes(o.op) && r.texts?.[i] ? { ...o, text: r.texts[i] } : o))), img, {}, plan.lang));
  }
  return { screen, crop: box, before, after };
}

/** Whole-screen case (state, missing title, missing region): screen at half scale; `example` shows another capture. */
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
  if (!screen) return { failed: 'no capture of the case screens' };
  const before = await shot(screen);
  const variants = [...plan.options.map((o) => ({ key: `o${o.index}`, option: o.index, ops: o.ops, none: o.none })), ...(plan.implicit ? [{ key: 'rule', option: null, ops: plan.implicit.ops, none: plan.implicit.none, label: plan.implicit.label }] : [])];
  const after = [];
  for (const v of variants) {
    const ex = (v.ops ?? []).find((o) => o.op === 'example');
    if (!ex) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: v.none ?? 'whole screen: only the "example" operation has a preview' }); continue; }
    if (!existsSync(join(screensDir, `${ex.screen}.html`))) { after.push({ key: v.key, option: v.option, label: v.label ?? null, failed: `example capture ${ex.screen}.html does not exist` }); continue; }
    after.push({ key: v.key, option: v.option, label: v.label ?? null, op: [ex], description: describeOps([ex], plan.lang), kind_label: previewKind([ex], plan.lang), ...(await shot(ex.screen)) });
  }
  return { screen, before, after };
}

function flowCase(plan, { map, outDir }) {
  if (!map) return { failed: 'no flow map' };
  const d = flowDiagram(map, plan.screen, plan.rule, plan.lang);
  if (!d) return { failed: `screen "${plan.screen}" is not in the flow map` };
  const name = plan.hash.slice(0, 12);
  writeFileSync(join(outDir, `${name}.before.svg`), d.before);
  const after = [];
  for (const o of plan.options) after.push({ key: `o${o.index}`, option: o.index, failed: o.none });
  if (plan.implicit?.flow) { writeFileSync(join(outDir, `${name}.after-rule.svg`), d.after); after.push({ key: 'rule', option: null, label: plan.implicit.label, op: [{ op: 'flow' }], description: plan.implicit.label, kind_label: pageStrings(plan.lang ?? 'en').kind.flow, file: `${name}.after-rule.svg` }); }
  else if (plan.implicit) after.push({ key: 'rule', option: null, failed: plan.implicit.none });
  return { screen: plan.screen, before: { file: `${name}.before.svg` }, after };
}

const filesOf = (entry) => [entry.before?.file, ...(entry.after ?? []).map((a) => a.file)].filter(Boolean);

/**
 * Generates the previews. `playwright` null → only the flow diagrams; the other cases get a `failed` explanation.
 * Cache: a case whose hash did not change and whose files exist is not redone. `lang`: page language of the text
 * drawn on the images (recorded in the manifest).
 */
export async function runPreviews(plans, { screensDir, outDir, map = null, width = 1440, height = 900, playwright = null, log = () => {}, lang = 'en' } = {}) {
  const L = pageLang(lang);
  mkdirSync(outDir, { recursive: true });
  const old = readManifest(outDir);
  const manifest = { format: 'dsx-previews', version: PREVIEW_VERSION, generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), lang: L, width, screens_dir: screensDir, cases: { ...(old?.cases ?? {}) } };
  const stats = { cached: 0, generated: 0, failed: 0 };
  let browser = null, page = null, pageHalf = null, encode = null;
  const ensure = async () => {
    if (browser) return true;
    if (!playwright) return false;
    browser = await playwright.module.chromium.launch();
    page = await browser.newPage({ viewport: { width, height } });
    pageHalf = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 0.5 });
    encode = await encoder(browser);
    // module donors (state blocks, alerts, buttons, panel…), read from the captures themselves
    const files = existsSync(screensDir) ? readdirSync(screensDir).filter((f) => f.endsWith('.html')) : [];
    const kitPage = await browser.newPage({ viewport: { width, height } });
    const kit = await buildKit(kitPage, { screensDir, files, outDir, extras: [...new Set(plans.flatMap((p) => p.extras ?? []))], log });
    await kitPage.close();
    const init = `window.__dsxkit = ${JSON.stringify(kit).replace(/</g, '\\u003c')}; window.__dsxstr = ${JSON.stringify({ ...runtimeStrings(L), search: productText(plans.find((p) => p.productLang)?.productLang).search }).replace(/</g, '\\u003c')};`;
    await page.addInitScript(init);
    await pageHalf.addInitScript(init);
    return true;
  };
  try {
    for (const plan of plans) {
      const prev = old?.cases?.[plan.id];
      if (prev && prev.hash === plan.hash && !prev.failed && !(prev.after ?? []).some((a) => a.failed) && filesOf(prev).every((f) => existsSync(join(outDir, f)))) { stats.cached++; continue; }
      let entry;
      try {
        if (plan.kind === 'flow') entry = flowCase(plan, { map, outDir });
        else if (!(await ensure())) entry = { failed: 'Playwright not available in the project: capture preview not generated' };
        else if (plan.kind === 'screen') entry = await screenCase(pageHalf, plan, { screensDir, outDir, encode });
        else if (plan.kind === 'synth') entry = await synthCase(page, pageHalf, plan, { screensDir, outDir, width, height, encode });
        else entry = await elementCase(page, plan, { screensDir, outDir, width, height, encode });
      } catch (e) {
        entry = { failed: `error while generating: ${String(e.message).split('\n')[0]}` };
      }
      manifest.cases[plan.id] = { ids: plan.ids, family: plan.family, rule: plan.rule, kind: plan.kind, hash: plan.hash, ...(plan.capture_hashes ? { capture_hashes: plan.capture_hashes } : {}), ...entry };
      if (entry.failed) stats.failed++; else stats.generated++;
      log(`${plan.id} ${entry.failed ? `no preview: ${entry.failed}` : `${entry.after?.filter((a) => a.file).length ?? 0} after`}`);
    }
  } finally {
    if (browser) await browser.close();
  }
  // prune: files no manifest entry uses
  const used = new Set(Object.values(manifest.cases).flatMap(filesOf));
  for (const f of readdirSync(outDir)) if (/\.(webp|jpg|svg)$/.test(f) && !used.has(f)) rmSync(join(outDir, f));
  writeFileSync(join(outDir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return { manifest, stats };
}

/** Manifest summary by applied operation type and reasons for missing previews. */
export function summarizeManifest(manifest, ids = null) {
  const out = { cases: 0, with_preview: 0, by_op: {}, without: {}, failed_options: {} };
  for (const [id, e] of Object.entries(manifest?.cases ?? {})) {
    if (ids && !ids.has(id)) continue;
    out.cases++;
    if (e.failed) { out.without[e.failed.replace(/\(.*\)$/, '').trim()] = (out.without[e.failed.replace(/\(.*\)$/, '').trim()] ?? 0) + 1; continue; }
    const made = (e.after ?? []).filter((a) => a.file);
    if (e.before?.file) out.with_preview++;
    const ops = new Set(made.flatMap((a) => (a.op ?? []).map((o) => o.op)));
    if (!ops.size) ops.add(e.kind === 'screen' ? 'before only (screen)' : 'before only');
    for (const o of ops) out.by_op[o] = (out.by_op[o] ?? 0) + 1;
    for (const a of (e.after ?? []).filter((x) => !x.file)) out.failed_options[a.failed] = (out.failed_options[a.failed] ?? 0) + 1;
  }
  return out;
}

/** Builds the page cases and runs everything (used by the CLI and by audit.mjs --preview). */
export async function previewModule({ root, module, dir = null, out = null, screens = null, map = null, config = null, minSeverity = null, width = 1440, playwright, registry = null, log, lang = 'en' }) {
  const p = previewPaths({ root, module, dir, out, screens, map, config });
  const st = findings.load(findings.paths(p.findingsDir, module), module);
  const reg = registry ?? st.findings;
  findings.restatus(reg, st.decisions);
  const cases = findings.pageCases(reg, st.options, st.decisions);
  const flowMap = isFile(p.map) ? JSON.parse(readFileSync(p.map, 'utf8')) : null;
  // product language (text built inside the product): UX.md `content.language`, default pt-BR
  let productLang;
  try { productLang = p.ux && isFile(p.ux) ? loadConfig(p.ux).content?.language : undefined; } catch { productLang = undefined; }
  const plans = planPreviews(cases, { screensDir: p.screens, map: flowMap, minSeverity, width, lang, productLang });
  for (const pl of plans) pl.productLang = productLang;
  const r = await runPreviews(plans, { screensDir: p.screens, outDir: p.out, map: flowMap, width, playwright, log, lang });
  return { ...r, plans, out: p.out, summary: summarizeManifest(r.manifest, new Set(plans.map((x) => x.id))) };
}

async function main() {
  const a = parseArgs();
  if (!a.module || a.module === true) {
    console.error('Usage: node tools/ux-lint/preview.mjs --module <m> --root <project> [--config <file>] [--screens <captures>] [--map <flows.json>] [--min-severity <n>] [--out <dir>] [--width 1440] [--lang en|pt-BR] [--json]');
    process.exit(2);
  }
  let lang;
  try { lang = pageLang(a.lang); } catch (e) { console.error(e.message); process.exit(2); }
  const root = resolve(typeof a.root === 'string' ? a.root : process.cwd());
  const playwright = resolvePlaywright();
  if (!playwright) console.error(`${PLAYWRIGHT_MISSING}\nWithout it, only the flow diagrams come out; the page has no capture previews.`);
  const str = (v) => (typeof v === 'string' ? v : null);
  let r;
  try {
    r = await previewModule({
      root, module: a.module, dir: str(a.dir), out: str(a.out), screens: str(a.screens), map: str(a.map), config: str(a.config),
      minSeverity: a['min-severity'] !== undefined ? Number(a['min-severity']) : null, width: Number(a.width ?? 1440), playwright,
      log: a.verbose ? (m) => console.log(m) : () => {}, lang,
    });
  } catch (e) {
    if (/Executable doesn't exist|browserType\.launch/i.test(String(e.message))) { console.error(`The Playwright browser is not installed: run  npx playwright install chromium\n${e.message.split('\n')[0]}`); process.exit(3); }
    throw e;
  }
  if (a.json) { console.log(JSON.stringify({ out: r.out, stats: r.stats, summary: r.summary }, null, 2)); return; }
  const s = r.summary;
  console.log(`${r.out} · ${s.cases} case(s): ${r.stats.generated} generated, ${r.stats.cached} from cache, ${r.stats.failed} without preview`);
  console.log(`  by operation: ${Object.entries(s.by_op).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'}`);
  for (const [k, v] of Object.entries(s.without)) console.log(`  without preview (${v}): ${k}`);
  process.exit(playwright ? 0 : 3);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
