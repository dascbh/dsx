#!/usr/bin/env node
// Local sandbox: an isolated copy (mirror) of the project's UI code served by a separate Vite build with fake auth, an
// intercepted and mocked API with scenarios (normal, empty, slow, error, forbidden), and a live design-lab manifest.
// Sandbox edits go back to the real code with `apply` (3-way conflict check, never commits). Skill: skills/sandbox/SKILL.md.
//
//   node tools/sandbox/sandbox.mjs init [--package <dir>] [--dry-run | --write [--migrate]] [--force]   detect, propose config + harness + patches
//   node tools/sandbox/sandbox.mjs sync [--force]                 first copy, or bring official changes into the mirror
//   node tools/sandbox/sandbox.mjs ensure                         copy only when there is no mirror yet
//   node tools/sandbox/sandbox.mjs status                         sandbox edits, official changes, conflicts
//   node tools/sandbox/sandbox.mjs diff [<path>…]                 official ↔ sandbox (git diff --no-index)
//   node tools/sandbox/sandbox.mjs apply <path>…|--all [--force] [--no-gates]   sandbox edits → official (never commits)
//   node tools/sandbox/sandbox.mjs discard <path>…|--all          throw sandbox edits away
//   node tools/sandbox/sandbox.mjs dev | build | preview          run the project's Vite with the sandbox config
//   node tools/sandbox/sandbox.mjs isolation-check [<dist>]       the sandbox build reaches no real host (default: sandbox dist)
//   node tools/sandbox/sandbox.mjs bundle-check <dist>            the OFFICIAL build carries nothing of the sandbox
//
// Common flags: --root <project> (default cwd), --config <file> (default <root>/.dsx/config.json), --json.
// Exit: 0 ok · 1 a gate failed (conflict, isolation, lint) · 2 usage · 3 missing tool or setup (Vite, config, mirror).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lintText } from '../lint-raw-values.mjs';
import { lintDesignMd } from '../lint-design-md.mjs';
import { lintUxMd } from '../lint-ux-md.mjs';
import { designConfig, writeManifest } from '../design-md/lib/options.mjs';
import { sandboxConfig, hasMirror } from './lib/config.mjs';
import { apply, computeState, diff, discard, ensure, sync } from './lib/mirror.mjs';
import { detect } from './lib/detect.mjs';
import { describePatch, migrationPlan, planFiles, planIgnores, planScripts, proposeBlock } from './lib/harness.mjs';
import { bundleCheck, isolationCheck } from './lib/isolation.mjs';

const DSX_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export class UsageError extends Error {}
export class ToolError extends Error {}

/** argv → { _: positionals, ...flags } (`--key value`, `--key=value`, bare `--flag`). */
export function parseSandboxArgs(argv) {
  const out = { _: [] };
  const BOOL = new Set(['dry-run', 'migrate', 'write', 'force', 'all', 'json', 'no-gates', 'color']);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const eq = a.indexOf('=');
    const key = a.slice(2, eq > 0 ? eq : undefined);
    if (eq > 0) out[key] = a.slice(eq + 1);
    else if (!BOOL.has(key) && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) out[key] = argv[++i];
    else out[key] = true;
  }
  return out;
}

const MARK = { new: 'A', deleted: 'D', edited: 'M' };
const UI_FILE = /\.(m?[jt]sx?|css|scss|less|vue|svelte|html)$/;

function requireMirror(sc) {
  if (!sc.configured) throw new ToolError(`no "sandbox" block in ${sc.configFile}: run \`sandbox.mjs init --write\` first`);
  if (!hasMirror(sc)) throw new ToolError('no mirror yet: run `sandbox.mjs sync`');
}

// ------------------------------------------------------------------ init

export function planInit(root, { pkg = null, config = null } = {}) {
  const d = detect(root, { pkg });
  const sc0 = sandboxConfig(root, { config });
  const block = proposeBlock(d, { existing: sc0.configured ? sc0.raw : null, dsxRoot: DSX_ROOT });
  const migration = migrationPlan(d, block);
  // After a migration the old files are gone from the harness folder: plan as if it were empty.
  const projectFile = (p) => (migration && p.startsWith(`${block.dir}/`) ? null : existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : null);
  const files = planFiles(d, block, projectFile).map((f) => ({ ...f, exists: projectFile(f.path) !== null }));
  const ignores = [...planIgnores(d, block, projectFile), ...planScripts(d, block, { migrating: !!migration }, projectFile)];
  return { detection: d, block, files, ignores, migration, configFile: sc0.configFile };
}

function writeInit(plan, { force, migrate }) {
  const root = plan.detection.root;
  if (plan.migration && !migrate) return { refused: true };
  let moved = null;
  if (plan.migration) {
    mkdirSync(join(root, plan.migration.to), { recursive: true });
    for (const e of plan.migration.move) renameSync(join(root, plan.migration.from, e), join(root, plan.migration.to, e));
    moved = plan.migration;
  }
  const written = [], skipped = [];
  for (const f of plan.files) {
    const p = join(root, f.path);
    if (existsSync(p) && !(force && f.owner === 'dsx')) { skipped.push(f.path); continue; }
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, f.content);
    written.push(f.path);
  }
  const cfg = existsSync(plan.configFile) ? JSON.parse(readFileSync(plan.configFile, 'utf8')) : {};
  cfg.sandbox = plan.block;
  mkdirSync(dirname(plan.configFile), { recursive: true });
  writeFileSync(plan.configFile, `${JSON.stringify(cfg, null, 2)}\n`);
  const patched = [];
  for (const p of plan.ignores.filter((x) => x.after)) { writeFileSync(join(root, p.file), p.after); patched.push(p.file); }
  return { refused: false, moved, written, skipped, patched, manual: plan.ignores.filter((x) => !x.after) };
}

function printInit(plan, result) {
  const d = plan.detection;
  const b = plan.block;
  console.log(`Project: ${d.root}`);
  console.log(`Package: ${d.package}  ·  src: ${d.src}  ·  entry: ${d.entry ?? '—'}  ·  vite: ${d.vite_config ?? '—'}`);
  console.log(`Stack: ${Object.entries(d.stack).filter(([, v]) => v).map(([k]) => k).join(', ') || '—'}  ·  plugins: ${d.plugins.calls.join(', ')}${d.plugins.skipped.length ? `  (left out: ${d.plugins.skipped.join(', ')})` : ''}`);
  console.log(`Auth module: ${d.auth[0] ? `${d.auth[0].file}${d.auth[0].sdk ? ` (${d.auth[0].sdk})` : ''} — exports ${d.auth[0].exports.join(', ')}` : '—'}`);
  if (d.auth.length > 1) console.log(`  other candidates: ${d.auth.slice(1, 4).map((a) => a.file).join(', ')}`);
  console.log(`Token claims read by the code: ${d.claims.claims.join(', ') || '—'}${d.claims.group_values.length ? `  ·  group names compared: ${d.claims.group_values.join(', ')}` : ''}`);
  console.log(`Personas: ${b.personas.map((p) => `${p.id} ${JSON.stringify(p.claims)}`).join('  |  ')}`);
  console.log(`API bases: ${Object.entries(b.api_bases).map(([k, v]) => `${k} ← ${v}`).join(', ') || '—'}`);
  if (d.env.auth.length) console.log(`Identity settings blanked: ${d.env.auth.join(', ')}`);
  for (const v of d.env.hosts) {
    const h = d.host_validations[v];
    console.log(`Fictitious host: ${v} = ${b.env[v] ?? '—'}${h ? `  (validated by ${h.patterns.join(' ')} in ${h.files.join(', ')}${h.value ? '; value passes it' : '; NO passing value found'})` : ''}`);
  }
  if (d.env.other.length) console.log(`Other env vars (left as is): ${d.env.other.join(', ')}`);
  console.log(`Real hosts the build must not contain: ${d.real_hosts.join(', ') || '— (none in .env files; add sandbox.real_hosts)'}`);
  console.log(`Exempt from error/forbidden (called by providers/layout): ${b.exempt.join(', ') || '—'}`);
  if (b.scenario_responses?.forbidden) console.log(`Forbidden answer: ${b.scenario_responses.forbidden.status} ${JSON.stringify(b.scenario_responses.forbidden.body)}${d.denial_codes.length > 1 ? `  (other denial codes in the code: ${d.denial_codes.slice(1).join(', ')})` : ''}`);
  if (d.capture.dirs.length) console.log(`Capture data reused: ${d.capture.dirs.join(', ')}${d.capture.legacy_imports.length ? ` (redirect './environment' in ${d.capture.legacy_imports.join(', ')})` : ''}`);
  console.log(`\nMirror items: ${b.items.join(', ')}`);
  if (plan.migration) {
    const m = plan.migration;
    console.log(`\nEXISTING HARNESS not generated by DSX in ${m.from}.`);
    console.log(`  --write alone is refused (a mixed harness would break). --write --migrate moves ${m.move.join(', ')} to ${m.to} (nothing deleted) and writes the new one; port mocks and auth from there (skill sandbox, "Migrating a harness").`);
    if (m.leave.length) console.log(`  Left in place (git-ignored, delete by hand when done): ${m.leave.map((e) => `${m.from}/${e}`).join(', ')}`);
  }
  console.log(`Harness (${b.dir}):`);
  for (const f of plan.files) console.log(`  ${f.exists ? '=' : '+'} ${f.path}${f.owner === 'project' ? '  (yours to edit)' : ''}`);
  console.log('Patches to project files:');
  for (const p of plan.ignores) console.log(`  ${describePatch(p)}`);
  if (!plan.ignores.length) console.log('  already in place');
  if (plan.ignores.some((p) => p.file === d.package_json && p.after)) console.log(`  (npm scripts run ${b.dir}/cli.mjs, which finds the DSX at sandbox.dsx_root = ${b.dsx_root}; env DSX_ROOT overrides it per machine)`);
  for (const w of d.warnings) console.log(`WARNING ${w}`);
  if (!result) {
    console.log(`\nDry run: nothing written. Re-run with --write${plan.migration ? ' --migrate' : ''} to create the harness, the "sandbox" block in ${relative(d.root, plan.configFile)} and the patches above.`);
    return;
  }
  if (result.refused) { console.log('\nRefused: nothing written. Add --migrate to move the existing harness aside first.'); return; }
  if (result.moved) console.log(`\nMoved ${result.moved.move.map((e) => `${result.moved.from}/${e}`).join(', ')} → ${result.moved.to}/`);
  console.log(`\nWritten: ${result.written.length} file(s)${result.skipped.length ? ` · kept (already there): ${result.skipped.length} — --force refreshes the DSX-owned ones` : ''}`);
  if (result.patched.length) console.log(`Patched: ${result.patched.join(', ')}`);
  for (const m of result.manual) console.log(`${m.note ? 'NOTE' : 'DO BY HAND'} ${describePatch(m)}`);
  console.log('Next: fill the auth replacement exports, then `sandbox.mjs sync` and `sandbox.mjs dev`.');
}

// ------------------------------------------------------------------ status / apply gates

function printStatus(st) {
  const edited = st.rows.filter((r) => r.mirror && !r.same);
  const official = st.rows.filter((r) => r.official && !r.mirror);
  const conflicts = st.rows.filter((r) => r.conflict);
  console.log(`Mirror of ${st.base.commit ?? '?'} (created ${st.base.created_at}${st.base.updated_at !== st.base.created_at ? `, updated ${st.base.updated_at}` : ''})`);
  console.log(`\nEdited in the sandbox (${edited.length}):`);
  for (const r of edited) console.log(`  ${MARK[r.mirror]} ${r.path}${r.conflict ? '   ! CONFLICT (official changed too)' : ''}`);
  console.log(`\nChanged only in the official code (${official.length}) — \`sync\` brings them in:`);
  for (const r of official) console.log(`  ${MARK[r.official]} ${r.path}`);
  console.log(`\nConflicts: ${conflicts.length}`);
}

/** Gates after apply: raw values in applied UI files, DESIGN.md / UX.md linters, design-lab manifest refresh. */
export function applyGates(sc, applied) {
  const gates = [];
  const paths = applied.filter((a) => a.change !== 'deleted').map((a) => a.path);
  const hits = paths.filter((p) => UI_FILE.test(p) && !/\.(test|spec|data)\.[jt]sx?$/.test(p)).flatMap((p) => lintText(readFileSync(join(sc.root, p), 'utf8'), p));
  gates.push({ gate: 'raw-values', ok: hits.length === 0, detail: hits.length ? hits.slice(0, 10).map((h) => `${h.file}:${h.line} ${h.match}`) : [] });
  const designTouched = applied.some((a) => a.path === 'DESIGN.md' || a.path.startsWith('.dsx/design-options/'));
  if (paths.includes('DESIGN.md')) {
    const r = lintDesignMd(readFileSync(join(sc.root, 'DESIGN.md'), 'utf8'));
    gates.push({ gate: 'design-md', ok: r.ok, detail: r.errors ?? [] });
  }
  if (paths.includes('UX.md')) {
    const r = lintUxMd(readFileSync(join(sc.root, 'UX.md'), 'utf8'));
    gates.push({ gate: 'ux-md', ok: r.ok, detail: r.errors ?? [] });
  }
  if (designTouched) {
    const dc = designConfig(sc.root);
    const out = writeManifest(dc);
    gates.push({ gate: 'design-lab-manifest', ok: true, detail: out ? [`refreshed ${relative(sc.root, out)}`] : ['no design.manifest configured: nothing to refresh'] });
  }
  return gates;
}

// ------------------------------------------------------------------ vite

function runVite(sc, args) {
  const bin = [join(sc.packageDir, 'node_modules', '.bin', 'vite'), join(sc.root, 'node_modules', '.bin', 'vite')].find(existsSync);
  if (!bin) throw new ToolError(`Vite not found in ${relative(sc.root, sc.packageDir) || '.'}/node_modules: install the project's dependencies`);
  const r = spawnSync(bin, [...args, '--config', sc.viteConfig], { cwd: sc.packageDir, stdio: 'inherit', env: { ...process.env, DSX_SANDBOX_ROOT: sc.root } });
  if (r.error) throw new ToolError(r.error.message);
  return r.status ?? 1;
}

// ------------------------------------------------------------------ main

export async function main(argv) {
  const a = parseSandboxArgs(argv);
  const [cmd, ...rest] = a._;
  const root = resolve(a.root ?? process.cwd());
  const json = !!a.json;
  const out = (obj, print) => (json ? console.log(JSON.stringify(obj, null, 2)) : print());

  if (!cmd || cmd === 'help') {
    console.log('Usage: sandbox.mjs init|sync|ensure|status|diff|apply|discard|dev|build|preview|isolation-check|bundle-check (see the header of tools/sandbox/sandbox.mjs)');
    return cmd ? 0 : 2;
  }
  if (cmd === 'init') {
    const plan = planInit(root, { pkg: a.package ?? null, config: a.config ?? null });
    if (a.write && a['dry-run']) throw new UsageError('init: --write and --dry-run together');
    const result = a.write ? writeInit(plan, { force: !!a.force, migrate: !!a.migrate }) : null;
    out({ detection: plan.detection, block: plan.block, migration: plan.migration, files: plan.files.map(({ content, ...f }) => f), ignores: plan.ignores.map(({ after, ...p }) => p), result }, () => printInit(plan, result));
    return result?.refused ? 1 : 0;
  }
  if (cmd === 'bundle-check') {
    if (!rest[0]) throw new UsageError('bundle-check needs the OFFICIAL build folder: sandbox.mjs bundle-check <dist>');
    const r = bundleCheck(resolve(root, rest[0]));
    out(r, () => console.log(r.ok ? 'Official build clean: no sandbox code in it.' : `Sandbox code in the official build:\n${r.hits.map((h) => `  ${h.file}: …${h.excerpt}…`).join('\n')}`));
    return r.ok ? 0 : 1;
  }

  const sc = sandboxConfig(root, { config: a.config ?? null });
  if (!sc.configured) throw new ToolError(`no "sandbox" block in ${sc.configFile}: run \`sandbox.mjs init --write\` first`);

  switch (cmd) {
    case 'sync': {
      const r = sync(sc, { force: !!a.force });
      out(r, () => {
        if (r.created) console.log(`Mirror created: ${r.copied} file(s) in ${relative(root, sc.mirror)}`);
        else console.log(`Updated: ${r.updated.length} · removed: ${r.removed.length} · kept (conflict, sandbox edit wins): ${r.conflicts.length}`);
        for (const c of r.conflicts) console.log(`  ! ${c}`);
      });
      return 0;
    }
    case 'ensure': { const r = ensure(sc); out(r, () => console.log(r.created ? 'Mirror created.' : 'Mirror already there.')); return 0; }
    case 'status': {
      requireMirror(sc);
      const st = computeState(sc);
      out(st, () => printStatus(st));
      return 0;
    }
    case 'diff': {
      requireMirror(sc);
      const r = diff(sc, { targets: rest, color: !!a.color || (!json && process.stdout.isTTY) });
      out({ rows: r.rows }, () => process.stdout.write(r.text || 'No differences.\n'));
      return 0;
    }
    case 'apply': {
      requireMirror(sc);
      if (!rest.length && !a.all) throw new UsageError('apply needs paths or --all');
      const r = apply(sc, { targets: rest, all: !!a.all, force: !!a.force });
      if (r.refused) {
        out(r, () => console.log(`Refused (nothing written): ${r.conflicts.length} conflict(s) — the official code changed too:\n${r.conflicts.map((c) => `  ! ${c}`).join('\n')}\nMerge by hand in the mirror (diff shows both sides), then apply with --force.`));
        return 1;
      }
      const gates = a['no-gates'] ? [] : applyGates(sc, r.applied);
      const failed = gates.filter((g) => !g.ok);
      out({ ...r, gates }, () => {
        console.log(`Applied to the official code (not committed): ${r.applied.length}`);
        for (const x of r.applied) console.log(`  ${MARK[x.change]} ${x.path}`);
        for (const g of gates) console.log(`${g.ok ? 'OK  ' : 'FAIL'} ${g.gate}${g.detail.length ? `: ${g.detail.join(' · ')}` : ''}`);
        if (failed.length) console.log('Gates failed: fix in the official code (or in the sandbox and apply again). Then run the build-ui checks on the touched screens.');
        else if (r.applied.length) console.log('Next: build-ui checks on the touched screens (captures, states, ux-md drift), then commit.');
      });
      return failed.length ? 1 : 0;
    }
    case 'discard': {
      requireMirror(sc);
      if (!rest.length && !a.all) throw new UsageError('discard needs paths or --all');
      const r = discard(sc, { targets: rest, all: !!a.all });
      out(r, () => console.log(`Discarded: ${r.discarded.length}${r.discarded.length ? `\n${r.discarded.map((p) => `  ${p}`).join('\n')}` : ''}`));
      return 0;
    }
    case 'dev': ensure(sc); return runVite(sc, []);
    case 'build': {
      ensure(sc);
      const code = runVite(sc, ['build']);
      if (code !== 0) return code;
      const r = isolationCheck(sc.dist, { realHosts: sc.realHosts });
      out(r, () => console.log(r.ok ? 'Isolation: OK (no real host, CSP closed, interceptor present).' : `Isolation FAILED:\n${r.findings.map((f) => `  ${f.rule}: ${f.file ? `${f.file} ` : ''}${f.detail}`).join('\n')}`));
      return r.ok ? 0 : 1;
    }
    case 'preview': return runVite(sc, ['preview']);
    case 'isolation-check': {
      const r = isolationCheck(rest[0] ? resolve(root, rest[0]) : sc.dist, { realHosts: sc.realHosts });
      out(r, () => console.log(r.ok ? `Isolation: OK (${r.files} file(s) checked).` : `Isolation FAILED:\n${r.findings.map((f) => `  ${f.rule}: ${f.file ? `${f.file} ` : ''}${f.detail}${f.excerpt ? ` — …${f.excerpt}…` : ''}`).join('\n')}`));
      return r.ok ? 0 : 1;
    }
    default:
      throw new UsageError(`unknown command "${cmd}" (init|sync|ensure|status|diff|apply|discard|dev|build|preview|isolation-check|bundle-check)`);
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
