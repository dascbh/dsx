#!/usr/bin/env node
// Keeps data/forward/ an unchanged copy of the Forward files DSX reads. No dependencies.
//
//   node tools/forward/sync.mjs --from <forward-checkout> [--dry-run]   copy the files, show the diff, rewrite VERSION
//   node tools/forward/sync.mjs --check [--from <forward-checkout>]    fail (exit 1) when the snapshot diverges:
//                                                                       from VERSION's checksums (a hand edit), and,
//                                                                       with --from, from the Forward checkout
//
// The checkout may also come from the DSX_FORWARD_ROOT environment variable. Nothing in data/forward/ is edited by
// hand: Forward is canonical, and a local change belongs in Forward.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { SNAPSHOT_FILES, SNAPSHOT_DIR, VERSION_FILE, sha256, readVersion } from './lib/snapshot.mjs';
import { tomlString } from './lib/toml-lite.mjs';

/** Line diff (LCS) as unified-style lines: ' ' kept, '-' removed, '+' added. Context trimmed to `context` lines. */
export function lineDiff(a, b, { context = 2, max = 120 } = {}) {
  const x = a.split('\n'), y = b.split('\n');
  const n = x.length, m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) { ops.push([' ', x[i], i + 1]); i++; j++; }
    else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) { ops.push(['+', y[j], j + 1]); j++; }
    else { ops.push(['-', x[i], i + 1]); i++; }
  }
  const keep = ops.map((o, k) => o[0] !== ' ' || ops.slice(Math.max(0, k - context), k + context + 1).some((p) => p[0] !== ' '));
  const out = [];
  let gap = false;
  ops.forEach((o, k) => {
    if (!keep[k]) { gap = true; return; }
    if (gap && out.length) out.push('  …');
    gap = false;
    out.push(`${o[0]} ${o[1]}`);
  });
  const added = ops.filter((o) => o[0] === '+').length, removed = ops.filter((o) => o[0] === '-').length;
  return { added, removed, lines: out.length > max ? [...out.slice(0, max), `  … ${out.length - max} more line(s)`] : out };
}

function forwardMeta(from) {
  let version = null, commit = null;
  for (const p of ['.claude-plugin/plugin.json', 'plugin.json']) {
    const f = join(from, p);
    if (existsSync(f)) { try { version = JSON.parse(readFileSync(f, 'utf8')).version ?? null; } catch { /* keep null */ } break; }
  }
  if (!version) {
    const inv = join(from, 'spec', 'invariants.toml');
    const m = existsSync(inv) && readFileSync(inv, 'utf8').match(/kernel_version\s*=\s*"([^"]+)"/);
    version = m ? m[1] : 'unknown';
  }
  try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: from, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { commit = 'unknown'; }
  let dirty = false;
  try {
    const st = execFileSync('git', ['status', '--porcelain', '--', ...SNAPSHOT_FILES.map((f) => f.path)], { cwd: from, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    dirty = st.trim().length > 0;
  } catch { /* not a git checkout */ }
  return { version, commit, dirty };
}

export function renderVersion({ version, commit, dirty }, hashes, now = new Date()) {
  const lines = [
    '# Forward snapshot copied by tools/forward/sync.mjs — do not edit by hand.',
    '# Forward is canonical; a change belongs in Forward, then `node tools/forward/sync.mjs --from <forward>`.',
    `forward_version = ${tomlString(version)}`,
    `forward_commit = ${tomlString(commit)}`,
    `forward_dirty = ${dirty ? 'true' : 'false'}`,
    `synced_at = ${tomlString(now.toISOString().slice(0, 10))}`,
    '',
    '[files]',
    ...Object.entries(hashes).map(([p, h]) => `${tomlString(p)} = ${tomlString(h)}`),
    '',
  ];
  return lines.join('\n');
}

/** Compares the snapshot with VERSION's checksums. Returns problems (strings). */
export function checkIntegrity(dir = SNAPSHOT_DIR) {
  const v = readVersion(dir);
  if (!v) return [`${VERSION_FILE} missing in ${dir}`];
  const problems = [];
  for (const { path } of SNAPSHOT_FILES) {
    const f = join(dir, path);
    if (!existsSync(f)) { problems.push(`${path}: missing from the snapshot`); continue; }
    const want = v.files?.[path];
    if (!want) { problems.push(`${path}: not listed in ${VERSION_FILE} — run sync --from`); continue; }
    if (sha256(readFileSync(f)) !== want) problems.push(`${path}: edited by hand (checksum differs from ${VERSION_FILE})`);
  }
  for (const p of Object.keys(v.files ?? {})) if (!SNAPSHOT_FILES.some((f) => f.path === p)) problems.push(`${p}: listed in ${VERSION_FILE} but no longer part of the snapshot`);
  return problems;
}

/** Compares the snapshot with a Forward checkout. Returns [{ path, status, diff }] for differing files. */
export function compareWith(from, dir = SNAPSHOT_DIR) {
  const out = [];
  for (const { path } of SNAPSHOT_FILES) {
    const src = join(from, path), dst = join(dir, path);
    if (!existsSync(src)) { out.push({ path, status: 'missing-in-forward' }); continue; }
    const a = existsSync(dst) ? readFileSync(dst, 'utf8') : '';
    const b = readFileSync(src, 'utf8');
    if (a !== b) out.push({ path, status: existsSync(dst) ? 'changed' : 'new', diff: lineDiff(a, b) });
  }
  return out;
}

export function syncFrom(from, { dir = SNAPSHOT_DIR, dryRun = false, now = new Date() } = {}) {
  const changes = compareWith(from, dir);
  const missing = changes.filter((c) => c.status === 'missing-in-forward');
  if (missing.length) throw new Error(`not a Forward checkout (missing ${missing.map((c) => c.path).join(', ')}): ${from}`);
  const meta = forwardMeta(from);
  if (dryRun) return { changes, meta, written: false };
  const hashes = {};
  for (const { path } of SNAPSHOT_FILES) {
    const buf = readFileSync(join(from, path));
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), buf);
    hashes[path] = sha256(buf);
  }
  writeFileSync(join(dir, VERSION_FILE), renderVersion(meta, hashes, now));
  return { changes, meta, written: true };
}

function printChanges(changes) {
  for (const c of changes) {
    console.log(`\n${c.status === 'new' ? 'new' : 'changed'}: ${c.path} (+${c.diff.added} −${c.diff.removed})`);
    for (const l of c.diff.lines) console.log(`  ${l}`);
  }
}

function main() {
  const args = parseArgs();
  const from = typeof args.from === 'string' ? resolve(args.from) : (process.env.DSX_FORWARD_ROOT ? resolve(process.env.DSX_FORWARD_ROOT) : null);
  const dir = typeof args.dir === 'string' ? resolve(args.dir) : SNAPSHOT_DIR;
  if (args.check) {
    const problems = checkIntegrity(dir);
    let changes = [];
    if (from) changes = compareWith(from, dir);
    for (const p of problems) console.error(`✗ ${p}`);
    if (changes.length) { console.error(`✗ snapshot diverges from ${from}:`); printChanges(changes); }
    if (problems.length || changes.length) process.exit(1);
    const v = readVersion(dir);
    console.log(`✓ Forward snapshot ${v.forward_version} (${String(v.forward_commit).slice(0, 7)}) intact${from ? `, identical to ${from}` : ''}`);
    return;
  }
  if (!from) { console.error('Usage: node tools/forward/sync.mjs --from <forward-checkout> [--dry-run] | --check [--from <forward-checkout>]'); process.exit(2); }
  let r;
  try { r = syncFrom(from, { dir, dryRun: !!args['dry-run'] }); } catch (e) { console.error(`✗ ${e.message}`); process.exit(2); }
  if (!r.changes.length) console.log('no file changed');
  else printChanges(r.changes);
  if (r.meta.dirty) console.warn(`! the Forward checkout has uncommitted changes in snapshot files; VERSION records forward_dirty = true`);
  console.log(r.written ? `\n✓ snapshot at Forward ${r.meta.version} (${String(r.meta.commit).slice(0, 7)}) written to ${dir}` : '\n(dry run: nothing written)');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
