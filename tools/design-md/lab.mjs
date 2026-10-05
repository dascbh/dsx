#!/usr/bin/env node
// Design lab: several candidate DESIGN.md files ("options") next to the official one, one active at a time, compared on
// the product's real screens (static page, no server) or switched live in the app in development (templates/theme-switcher),
// both through the same DESIGN.md → theme adapter (templates/theme-adapters). Skill: skills/design-lab/SKILL.md.
//
//   node tools/design-md/lab.mjs list [--official] [--json]                  options with score, problems, readable text, changes
//   node tools/design-md/lab.mjs add <name> --from-reference <slug>          copy of a curated reference (credit kept)
//   node tools/design-md/lab.mjs add <name> --from <file>                    copy of any DESIGN.md
//   node tools/design-md/lab.mjs add <name> --variant-of current|official|<option> --set <token>=<value> [--set …]
//   node tools/design-md/lab.mjs use <name>|official                         active pointer (design.active), DESIGN.md untouched
//   node tools/design-md/lab.mjs diff <a> <b> [--json]                       token diff and readable-text change
//   node tools/design-md/lab.mjs compare <a> <b> … --screens <list> --out <page.html> [--module <m>] [--lang en|pt-BR]
//                                [--no-capture] [--recapture-official] [--product <name>] [--width 1440]
//   node tools/design-md/lab.mjs promote <name> [--official-lint] [--allow-no-official-lint]
//   node tools/design-md/lab.mjs manifest [--out <file>]                     manifest for the live switcher
//   node tools/design-md/lab.mjs bundle-check <dist-dir>                     fails when the switcher reached a production bundle
//
// Common flags: --root <project> (default cwd), --config <file> (default <root>/.dsx/config.json).
// Names: `official` is the project's DESIGN.md; `current` is the active option, or the official file when none is active.
// Configuration (.dsx/config.json): { "design": { "official", "options_dir", "active", "manifest", "theme_gate" },
//   "capture": { "command", "cwd", "option_output", "module" } } — see skills/design-lab/SKILL.md.
// Exit: 0 ok · 1 a gate failed · 2 usage · 3 missing tool (Playwright) or capture failed.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lintDesignMd } from '../lint-design-md.mjs';
import { resolveProjectPaths } from '../ux-lint/lib/project-paths.mjs';
import { resolvePlaywright, PLAYWRIGHT_MISSING } from '../ux-lint/measure.mjs';
import {
  CURRENT, OFFICIAL, buildManifest, describe, designConfig, fileOf, officialLint, optionNames, previousCopies,
  readFrontMatter, resolveTokenPath, scanBundle, setToken, stampVariant, tokenDiff, validateName, writeDesignKey, writeManifest,
} from './lib/options.mjs';
import { buildComparePage } from './lib/page.mjs';

const DSX_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REFERENCES = join(DSX_ROOT, 'references', 'design-md', 'designmd-app');
const today = () => new Date().toISOString().slice(0, 10);

/** argv → { _: positionals, flags, set: [] } — `--set` repeats; `--key=value` and `--key value` both work. */
export function parseLabArgs(argv) {
  const out = { _: [], set: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const eq = a.indexOf('=');
    const key = a.slice(2, eq > 0 ? eq : undefined);
    let val = eq > 0 ? a.slice(eq + 1) : undefined;
    if (val === undefined && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) val = argv[++i];
    if (key === 'set') out.set.push(val ?? '');
    else out[key] = val ?? true;
  }
  return out;
}

export class UsageError extends Error {}
export class ToolError extends Error {}
const fail = (msg) => { throw new UsageError(msg); };
const rel = (dc, p) => relative(dc.root, p).split('\\').join('/') || '.';

function linterFor(a) {
  if (a['no-official-lint']) return null;
  return (file) => officialLint(file, { download: !!a['official-lint'] });
}

// ------------------------------------------------------------------ list / diff

export function listOptions(dc, { officialLinter = null } = {}) {
  const officialFm = existsSync(dc.official) ? readFrontMatter(readFileSync(dc.official, 'utf8')) : null;
  const rows = [];
  if (officialFm) rows.push({ id: OFFICIAL, active: !dc.active, ...describe(dc.official, { official: true, officialLinter }) });
  for (const n of optionNames(dc)) rows.push({ id: n, active: dc.active === n, ...describe(fileOf(dc, n), { officialFm, officialLinter }) });
  return rows;
}

function printList(dc, rows) {
  if (!rows.length) { console.log(`No DESIGN.md at ${rel(dc, dc.official)} and no options in ${rel(dc, dc.optionsDir)}.`); return; }
  for (const r of rows) {
    const ok = r.pairs.filter((p) => p.ok).length;
    const marks = [r.active ? '● active' : '', r.credit ? `credit: ${r.credit}` : ''].filter(Boolean).join(' · ');
    console.log(`${r.id === OFFICIAL ? 'official' : r.id}  (${rel(dc, r.file)})${marks ? `  ${marks}` : ''}`);
    console.log(`  ${r.name}${r.schemes.length > 1 ? ' · light + dark' : ` · ${r.schemes[0]} only`}`);
    console.log(`  score ${r.score}/100 · DSX lint ${r.errors.length} error(s), ${r.warnings.length} warning(s)${r.official_lint ? (r.official_lint.available ? ` · official lint ${r.official_lint.errors} error(s), ${r.official_lint.warnings} warning(s)` : ' · official lint unavailable (--official-lint downloads it)') : ''}`);
    console.log(`  contrast ${ok}/${r.pairs.length} main pairs OK${r.pairs.filter((p) => !p.ok).map((p) => ` · FAIL ${p.id}${r.schemes.length > 1 ? ` (${p.scheme})` : ''} ${p.ratio}:1 < ${p.min}`).join('')}`);
    if (r.diff) console.log(`  vs official: ${r.diff.changed.length} changed, ${r.diff.added.length} added, ${r.diff.removed.length} removed${r.diff.changed.slice(0, 4).map((x) => ` · ${x.path} ${x.from} → ${x.to}`).join('')}`);
    for (const e of r.errors.slice(0, 3)) console.log(`  ERROR ${e}`);
  }
  const prev = previousCopies(dc);
  if (prev.length) console.log(`\n${prev.length} copy(ies) kept by promote: ${prev.join(', ')}`);
}

function diffFiles(dc, a, b) {
  const fa = fileOf(dc, a), fb = fileOf(dc, b);
  for (const [n, f] of [[a, fa], [b, fb]]) if (!existsSync(f)) fail(`option "${n}" not found (${rel(dc, f)})`);
  const ma = readFrontMatter(readFileSync(fa, 'utf8')), mb = readFrontMatter(readFileSync(fb, 'utf8'));
  const da = describe(fa, { official: true }), db = describe(fb, { official: true });
  const key = (p) => `${p.scheme}:${p.id}`;
  const before = Object.fromEntries(da.pairs.map((p) => [key(p), p]));
  const contrast = db.pairs.map((p) => ({ id: p.id, scheme: p.scheme, from: before[key(p)]?.ratio ?? null, to: p.ratio, min: p.min, ok: p.ok }))
    .filter((x) => x.from !== x.to);
  return { a, b, ...tokenDiff(ma, mb), contrast, score: { from: da.score, to: db.score } };
}

// ------------------------------------------------------------------ add / use / promote / manifest

export function addOption(dc, name, a) {
  const bad = validateName(name);
  if (bad) fail(bad);
  const dest = fileOf(dc, name);
  if (existsSync(dest) && !a.force) fail(`option "${name}" already exists (${rel(dc, dest)}); use --force to replace it`);
  let md;
  let note;
  if (a['from-reference']) {
    const slug = String(a['from-reference']);
    const src = join(REFERENCES, `${slug}.md`);
    if (!existsSync(src)) fail(`reference "${slug}" has no local copy: node tools/references.mjs fetch ${slug} (or search with node tools/references.mjs search --curated)`);
    md = readFileSync(src, 'utf8');
    note = `from reference ${slug} (designmd.app, CC BY 4.0 — the credit at the end of the file stays)`;
  } else if (a.from) {
    const src = resolve(dc.root, String(a.from));
    if (!existsSync(src)) fail(`file not found: ${a.from}`);
    md = readFileSync(src, 'utf8');
    note = `from ${rel(dc, src)}`;
  } else if (a['variant-of']) {
    const base = String(a['variant-of']);
    const src = fileOf(dc, base);
    if (!existsSync(src)) fail(`base "${base}" not found (${rel(dc, src)})`);
    if (!a.set.length) fail('a variant needs at least one --set <token>=<value>');
    md = readFileSync(src, 'utf8');
    const fm = readFrontMatter(md);
    const paths = [];
    for (const s of a.set) {
      const i = s.indexOf('=');
      if (i <= 0) fail(`--set "${s}": use <token>=<value>, e.g. colors.primary=#1d4ed8`);
      const r = resolveTokenPath(fm, s.slice(0, i).trim());
      if (r.error) fail(r.error);
      md = setToken(md, r.path, s.slice(i + 1).trim());
      paths.push(r.path);
    }
    const baseName = base === CURRENT ? (dc.active ?? OFFICIAL) : base;
    md = stampVariant(md, baseName, paths, today());
    note = `variant of ${baseName}: ${paths.join(', ')}`;
  } else fail('add needs --from-reference <slug>, --from <file> or --variant-of <base> --set <token>=<value>');
  try { readFrontMatter(md); } catch (e) { fail(`the new option does not parse: ${e.message}`); }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, md);
  const lint = lintDesignMd(md);
  const manifest = writeManifest(dc);
  return { name, file: dest, note, lint, manifest };
}

export function useOption(dc, name) {
  if (name !== OFFICIAL) {
    const bad = validateName(name);
    if (bad) fail(bad);
    if (!existsSync(fileOf(dc, name))) fail(`option "${name}" not found; options: ${optionNames(dc).join(', ') || 'none'}`);
  }
  writeDesignKey(dc, 'active', name === OFFICIAL ? undefined : name);
  return { active: dc.active, manifest: writeManifest(dc) };
}

export function promoteOption(dc, name, { officialLinter = (f) => officialLint(f), allowNoOfficialLint = false, runGate = true } = {}) {
  const bad = validateName(name);
  if (bad) fail(bad);
  const src = fileOf(dc, name);
  if (!existsSync(src)) fail(`option "${name}" not found`);
  const md = readFileSync(src, 'utf8');
  const gates = [];
  const lint = lintDesignMd(md);
  gates.push({ gate: 'dsx-lint', ok: lint.ok, detail: lint.errors });
  const off = officialLinter ? officialLinter(src) : { available: false };
  if (off.available) gates.push({ gate: 'official-lint', ok: off.errors === 0, detail: off.error_messages ?? [] });
  else gates.push({ gate: 'official-lint', ok: allowNoOfficialLint, detail: [allowNoOfficialLint ? 'unavailable, skipped (--allow-no-official-lint)' : 'unavailable: run with --official-lint to download it, or --allow-no-official-lint'] });
  const passed = gates.every((g) => g.ok);
  const result = { name, gates, promoted: false, previous: null, theme_gate: null };
  if (!passed) return result;
  if (existsSync(dc.official)) {
    mkdirSync(dc.optionsDir, { recursive: true });
    let prev = join(dc.optionsDir, `previous-${today()}.md`);
    for (let n = 2; existsSync(prev); n++) prev = join(dc.optionsDir, `previous-${today()}-${n}.md`);
    copyFileSync(dc.official, prev);
    result.previous = prev;
  }
  writeFileSync(dc.official, md);
  result.promoted = true;
  if (dc.active === name || dc.active) writeDesignKey(dc, 'active', undefined);
  writeManifest(dc);
  if (dc.themeGate && runGate) {
    const r = spawnSync(dc.themeGate, { cwd: dc.root, shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    result.theme_gate = { command: dc.themeGate, ok: r.status === 0, tail: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-12).join('\n') };
  }
  return result;
}

// ------------------------------------------------------------------ compare

/** Screen tokens ("02-acervo", "acervo", "acervo.empty") → capture file in a folder, or null. */
export function findCapture(dir, token) {
  if (!dir || !existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.endsWith('.html'));
  const t = token.replace(/\.html$/, '');
  return files.find((f) => f === `${t}.html`) ?? files.find((f) => new RegExp(`^\\d+-${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.html$`).test(f)) ?? null;
}

const fillTemplate = (tpl, module, option) => String(tpl).replace(/<module>|\{module\}/g, module ?? '').replace(/<option>|\{option\}/g, option ?? '');

function runCapture(dc, { module, option = null, file = null }) {
  const cmd = dc.capture.command;
  if (!cmd) fail('no capture command: set capture.command in .dsx/config.json (skills/design-lab/SKILL.md), or pass --no-capture with existing captures');
  const env = { ...process.env, DSX_CAPTURE: '1', STITCH_CAPTURE: '1', DSX_CAPTURE_MODULE: module ?? '' };
  delete env.DSX_DESIGN_MD; delete env.STITCH_THEME; delete env.DSX_DESIGN_OPTION; delete env.DSX_CAPTURE_SUBDIR;
  if (option) Object.assign(env, { DSX_DESIGN_MD: file, STITCH_THEME: file, DSX_DESIGN_OPTION: option, DSX_CAPTURE_SUBDIR: `options/${option}` });
  const cwd = dc.capture.cwd ? resolve(dc.root, dc.capture.cwd) : dc.root;
  process.stderr.write(`capturing ${option ?? 'official'}…\n`);
  const r = spawnSync(cmd, { cwd, env, shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, status: r.status, tail: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-20).join('\n') };
}

function findPlaywright(dc) {
  const tries = [dc.capture.cwd, '.', 'frontend', 'web', 'client', 'app', 'ui', 'www', 'site'].filter(Boolean).map((d) => resolve(dc.root, d));
  for (const d of tries) if (existsSync(join(d, 'package.json'))) { const p = resolvePlaywright(d); if (p) return p; }
  return resolvePlaywright(process.cwd());
}

async function renderShots(playwright, jobs, width) {
  const browser = await playwright.module.chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    for (const j of jobs) {
      await page.goto(pathToFileURL(j.input).href, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(300);
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.screenshot({ path: j.output, type: 'jpeg', quality: 72, clip: { x: 0, y: 0, width, height: Math.min(Math.max(h, 900), 1800) } });
    }
  } finally {
    await browser.close();
  }
}

/** Captures (unless --no-capture), renders and writes the comparison page. `deps.playwright` replaces the project's (tests). */
export async function compare(dc, names, a, deps = {}) {
  if (names.length < 1) fail('compare needs at least one option (official is always added as the first column)');
  const screens = String(a.screens ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!screens.length) fail('compare needs --screens <list>, e.g. --screens 02-list,03-detail,05-dlg-confirm');
  if (!a.out || a.out === true) fail('compare needs --out <page.html>');
  const module = a.module ?? dc.capture.module ?? 'app';
  const paths = resolveProjectPaths({ root: dc.root, module, config: a.config ?? null });
  for (const w of paths.warnings) process.stderr.write(`warning: ${w}\n`);
  const cols = [OFFICIAL, ...names.filter((n) => n !== OFFICIAL)];
  for (const n of cols.slice(1)) { const bad = validateName(n); if (bad) fail(bad); if (!existsSync(fileOf(dc, n))) fail(`option "${n}" not found`); }
  const store = (id) => resolve(dc.root, fillTemplate(dc.config.design?.compare_dir ?? '.dsx/captures/<module>/options', module, id), id);
  const optionOut = (id) => resolve(dc.root, fillTemplate(dc.capture.option_output ?? `${relative(dc.root, paths.captures)}/options/<option>`, module, id));
  const sources = { [OFFICIAL]: paths.captures };
  for (const n of cols.slice(1)) sources[n] = optionOut(n);

  if (!a['no-capture']) {
    const missingOfficial = screens.some((s) => !findCapture(paths.captures, s));
    if (a['recapture-official'] || missingOfficial) {
      const r = runCapture(dc, { module });
      if (!r.ok) throw new ToolError(`capture failed (official, exit ${r.status}):\n${r.tail}`);
    }
    for (const n of cols.slice(1)) {
      const r = runCapture(dc, { module, option: n, file: fileOf(dc, n) });
      if (!r.ok) throw new ToolError(`capture failed (${n}, exit ${r.status}):\n${r.tail}`);
    }
  }
  const playwright = deps.playwright ?? findPlaywright(dc);
  if (!playwright) throw new ToolError(PLAYWRIGHT_MISSING);
  const jobs = [];
  const cells = {};
  for (const id of cols) {
    const dir = store(id);
    mkdirSync(dir, { recursive: true });
    for (const s of screens) {
      const f = findCapture(sources[id], s);
      if (!f) { process.stderr.write(`warning: ${s} not captured for ${id} (looked in ${rel(dc, sources[id])})\n`); continue; }
      const html = join(dir, f);
      if (resolve(sources[id], f) !== html) copyFileSync(join(sources[id], f), html);
      const output = join(dir, f.replace(/\.html$/, '.jpg'));
      jobs.push({ input: html, output });
      (cells[s] ??= {})[id] = output;
    }
  }
  await renderShots(playwright, jobs, Number(a.width ?? 1440));
  const officialFm = readFrontMatter(readFileSync(dc.official, 'utf8'));
  const linter = linterFor(a);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const columns = cols.map((id, i) => ({
    id, letter: i === 0 ? '' : letters[i - 1], official: id === OFFICIAL,
    info: pruneInfo(describe(fileOf(dc, id), { official: id === OFFICIAL, officialFm, officialLinter: linter })),
  }));
  const model = {
    module, product: typeof a.product === 'string' ? a.product : null,
    columns,
    screens: screens.map((s) => ({
      id: s, label: screenLabel(s),
      cells: Object.fromEntries(cols.map((id) => [id, cells[s]?.[id] ? `data:image/jpeg;base64,${readFileSync(cells[s][id]).toString('base64')}` : null])),
    })),
  };
  const html = buildComparePage(model, { lang: a.lang ?? 'en' });
  const out = resolve(String(a.out));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  return { out, bytes: Buffer.byteLength(html), columns: cols, screens, shots: jobs.length };
}

/** "02-dlg-confirm.empty" → "Dlg confirm (empty)": readable without the order prefix. */
export function screenLabel(token) {
  const [base, state] = token.replace(/\.html$/, '').replace(/^\d+-/, '').split('.');
  const words = base.replace(/-/g, ' ');
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}${state ? ` (${state})` : ''}`;
}

function pruneInfo(i) {
  const { frontMatter, file, ...rest } = i;
  return { ...rest, file: basename(file) };
}

// ------------------------------------------------------------------ CLI

export async function main(argv) {
  const a = parseLabArgs(argv);
  const [cmd, ...pos] = a._;
  const dc = designConfig(typeof a.root === 'string' ? a.root : process.cwd(), { config: typeof a.config === 'string' ? a.config : null });
  switch (cmd) {
    case 'list': {
      const rows = listOptions(dc, { officialLinter: a.official || a['official-lint'] ? linterFor(a) : (a['no-official-lint'] ? null : (f) => officialLint(f, { download: false })) });
      if (a.json) console.log(JSON.stringify(rows.map(pruneInfo), null, 2)); else printList(dc, rows);
      return 0;
    }
    case 'add': {
      if (!pos[0]) fail('usage: add <name> --from-reference <slug> | --from <file> | --variant-of <base> --set <token>=<value>');
      const r = addOption(dc, pos[0], a);
      console.log(`option ${r.name}: ${rel(dc, r.file)} (${r.note})`);
      console.log(`  DSX lint: ${r.lint.ok ? 'passed' : `${r.lint.errors.length} error(s)`}, ${r.lint.warnings.length} warning(s)`);
      for (const e of r.lint.errors.slice(0, 5)) console.log(`  ERROR ${e}`);
      if (r.manifest) console.log(`  manifest: ${rel(dc, r.manifest)}`);
      console.log(`  next: node tools/design-md/lab.mjs use ${r.name}  ·  compare ${r.name} --screens … --out …`);
      return 0;
    }
    case 'use': {
      if (!pos[0]) fail('usage: use <name>|official');
      const r = useOption(dc, pos[0]);
      console.log(`active: ${r.active ?? 'official'} (${rel(dc, dc.configFile)}; DESIGN.md unchanged)`);
      if (r.manifest) console.log(`manifest: ${rel(dc, r.manifest)}`);
      return 0;
    }
    case 'diff': {
      if (pos.length < 2) fail('usage: diff <a> <b>');
      const d = diffFiles(dc, pos[0], pos[1]);
      if (a.json) { console.log(JSON.stringify(d, null, 2)); return 0; }
      console.log(`${d.a} → ${d.b}: ${d.changed.length} changed, ${d.added.length} added, ${d.removed.length} removed · score ${d.score.from} → ${d.score.to}`);
      for (const x of d.changed) console.log(`  ~ ${x.path}: ${x.from} → ${x.to}`);
      for (const x of d.added) console.log(`  + ${x.path}: ${x.to}`);
      for (const x of d.removed) console.log(`  - ${x.path}: ${x.from}`);
      for (const x of d.contrast) console.log(`  contrast ${x.id} (${x.scheme}): ${x.from ?? '—'} → ${x.to}:1${x.ok ? '' : ` FAIL < ${x.min}`}`);
      return 0;
    }
    case 'compare': {
      const r = await compare(dc, pos, a);
      console.log(`page: ${r.out} (${(r.bytes / 1024 / 1024).toFixed(1)} MB) · ${r.columns.length} columns × ${r.screens.length} screens · ${r.shots} images`);
      return 0;
    }
    case 'promote': {
      if (!pos[0]) fail('usage: promote <name>');
      const r = promoteOption(dc, pos[0], { officialLinter: a['no-official-lint'] ? null : (f) => officialLint(f, { download: !!a['official-lint'] }), allowNoOfficialLint: !!a['allow-no-official-lint'] });
      for (const g of r.gates) console.log(`${g.ok ? 'PASS' : 'FAIL'} ${g.gate}${g.detail.length ? `: ${g.detail.slice(0, 5).join(' · ')}` : ''}`);
      if (!r.promoted) { console.log(`not promoted: ${rel(dc, dc.official)} unchanged`); return 1; }
      console.log(`promoted ${r.name} → ${rel(dc, dc.official)}${r.previous ? ` (previous kept in ${rel(dc, r.previous)})` : ''}`);
      console.log('WARNING the code theme must follow: update the project theme to the new values in the same change (DESIGN.md describes, the theme renders).');
      if (r.theme_gate) console.log(`${r.theme_gate.ok ? 'PASS' : 'FAIL'} theme gate (${r.theme_gate.command})${r.theme_gate.ok ? '' : `: the theme does not match the new DESIGN.md yet\n${r.theme_gate.tail}`}`);
      else console.log('No theme gate configured (design.theme_gate): nothing checks that the theme matches DESIGN.md.');
      return 0;
    }
    case 'manifest': {
      const out = typeof a.out === 'string' ? resolve(String(a.out)) : dc.manifest;
      if (!out) { console.log(JSON.stringify(buildManifest(dc), null, 2)); return 0; }
      writeManifest(dc, out);
      console.log(`manifest: ${rel(dc, out)} (${optionNames(dc).length} option(s), active: ${dc.active ?? 'official'})`);
      return 0;
    }
    case 'bundle-check': {
      if (!pos[0] || !existsSync(pos[0])) fail('usage: bundle-check <dist-dir>');
      const hits = scanBundle(resolve(pos[0]));
      if (hits.length) { for (const h of hits) console.log(`LEAK ${h.file}: …${h.excerpt}…`); console.log('The design switcher reached the production bundle: guard its import with import.meta.env.DEV.'); return 1; }
      console.log(`OK no design switcher code in ${pos[0]}`);
      return 0;
    }
    default:
      console.error('Usage: node tools/design-md/lab.mjs list|add|use|diff|compare|promote|manifest|bundle-check … (header of tools/design-md/lab.mjs)');
      return 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main(process.argv.slice(2)).then((code) => process.exit(code ?? 0), (e) => {
    if (e instanceof UsageError) { console.error(e.message); process.exit(2); }
    if (e instanceof ToolError) { console.error(e.message); process.exit(3); }
    console.error(e?.stack ?? e);
    process.exit(1);
  });
}
