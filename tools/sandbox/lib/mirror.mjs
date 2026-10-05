// Sandbox mirror: an isolated copy of the project's UI code and design docs, at the same relative paths, with a base of
// hashes taken at copy time. Three versions of each file are compared — base (what was copied), mirror (sandbox edits)
// and official (the real repository) — so `sync` never overwrites sandbox work and `apply` never overwrites official work
// done meanwhile without --force.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { BASE_FILE } from './config.mjs';

export const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const posix = (p) => p.split('\\').join('/');

/** Minimal glob → RegExp: ** (any depth), * (one segment), ? (one char). Matched against the path inside the item. */
export function globToRe(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { re += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'; i += glob[i + 2] === '/' ? 2 : 1; }
    else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

/** Is `rel` (POSIX, relative to root) inside the mirrored items and accepted by their filters and ignores? */
export function inScope(sc, rel) {
  if (rel === BASE_FILE || sc.synthetic[rel] !== undefined) return false;
  const parts = rel.split('/');
  if (parts.some((p) => sc.ignore.includes(p))) return false;
  for (const item of sc.items) {
    const it = posix(item).replace(/\/$/, '');
    if (rel !== it && !rel.startsWith(`${it}/`)) continue;
    const globs = sc.filters[it];
    if (!globs?.length) return true;
    const inner = rel === it ? '' : rel.slice(it.length + 1);
    return globs.some((g) => globToRe(g).test(inner));
  }
  return false;
}

/** Every in-scope file under `side` (the project root or the mirror), as POSIX paths relative to it. */
export function listSide(sc, side) {
  const out = [];
  const walk = (abs) => {
    if (!existsSync(abs) || abs === sc.dir || abs === sc.mirror) return; // never mirror the sandbox into itself
    const st = statSync(abs);
    const rel = posix(relative(side, abs));
    if (st.isDirectory()) {
      if (sc.ignore.includes(abs.split(/[\\/]/).pop())) return;
      for (const e of readdirSync(abs)) walk(join(abs, e));
    } else if (inScope(sc, rel)) out.push(rel);
  };
  for (const item of sc.items) walk(join(side, item));
  return out.sort();
}

export function readBase(sc) {
  if (!existsSync(sc.baseFile)) return null;
  return JSON.parse(readFileSync(sc.baseFile, 'utf8'));
}
function writeBase(sc, base) {
  mkdirSync(dirname(sc.baseFile), { recursive: true });
  writeFileSync(sc.baseFile, `${JSON.stringify(base, null, 1)}\n`);
}

function gitCommit(root) {
  const r = spawnSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function writeSynthetic(sc) {
  for (const [rel, content] of Object.entries(sc.synthetic)) {
    const p = join(sc.mirror, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
}

/**
 * One row per file that differs anywhere. mirror / official: null (no change since the copy) | new | deleted | edited.
 * conflict: both sides changed and they differ. same: both sides hold identical content (nothing to do).
 */
export function computeState(sc) {
  const base = readBase(sc);
  if (!base) return null;
  const files = base.files ?? {};
  const official = new Set(listSide(sc, sc.root));
  const mirrored = new Set(listSide(sc, sc.mirror));
  const universe = new Set([...Object.keys(files), ...official, ...mirrored]);
  const kind = (b, x) => (b === null ? 'new' : x === null ? 'deleted' : 'edited');
  const rows = [];
  for (const rel of [...universe].sort()) {
    const b = files[rel] ?? null;
    const m = mirrored.has(rel) ? sha256(join(sc.mirror, rel)) : null;
    const o = official.has(rel) ? sha256(join(sc.root, rel)) : null;
    const mChanged = m !== b;
    const oChanged = o !== b;
    if (!mChanged && !oChanged) continue;
    rows.push({
      path: rel, base: b, mirror_hash: m, official_hash: o,
      mirror: mChanged ? kind(b, m) : null,
      official: oChanged ? kind(b, o) : null,
      conflict: mChanged && oChanged && m !== o,
      same: m === o,
    });
  }
  return { base, rows };
}

const selected = (rows, targets, all) => (all ? rows : rows.filter((r) => targets.some((t) => {
  const p = posix(t).replace(/\/$/, '');
  return r.path === p || r.path.startsWith(`${p}/`);
})));

/** First copy, or bring official changes into the mirror (sandbox edits are kept; conflicts kept unless force). */
export function sync(sc, { force = false } = {}) {
  const base = readBase(sc);
  const now = new Date().toISOString();
  if (!base) {
    // A leftover folder (an old harness's mirror) would mix stale files into the new mirror.
    if (existsSync(sc.mirror) && readdirSync(sc.mirror).some((e) => e !== '.DS_Store')) {
      throw new Error(`${sc.mirror} exists without a DSX base (an old mirror?): delete it, then sync again`);
    }
    const files = {};
    for (const rel of listSide(sc, sc.root)) {
      const to = join(sc.mirror, rel);
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(join(sc.root, rel), to);
      files[rel] = sha256(to);
    }
    writeSynthetic(sc);
    writeBase(sc, { created_at: now, commit: gitCommit(sc.root), updated_at: now, files });
    return { created: true, copied: Object.keys(files).length, updated: [], removed: [], conflicts: [] };
  }
  const { rows } = computeState(sc);
  const updated = [], removed = [], conflicts = [];
  for (const r of rows.filter((x) => x.official)) {
    if (r.mirror && !r.same && !force) { conflicts.push(r.path); continue; }
    const to = join(sc.mirror, r.path);
    if (r.official_hash === null) {
      rmSync(to, { force: true });
      delete base.files[r.path];
      removed.push(r.path);
    } else {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(join(sc.root, r.path), to);
      base.files[r.path] = r.official_hash;
      updated.push(r.path);
    }
  }
  writeSynthetic(sc);
  base.commit = gitCommit(sc.root) ?? base.commit;
  base.updated_at = now;
  writeBase(sc, base);
  return { created: false, copied: 0, updated, removed, conflicts };
}

export const ensure = (sc) => (readBase(sc) ? { created: false } : sync(sc));

/** Sandbox edits → official repository. All-or-nothing when any selected file conflicts (unless force). Never commits. */
export function apply(sc, { targets = [], all = false, force = false } = {}) {
  const st = computeState(sc);
  if (!st) throw new Error('no mirror yet: run `sandbox.mjs sync`');
  const rows = selected(st.rows.filter((r) => r.mirror && !r.same), targets, all);
  const conflicts = rows.filter((r) => r.conflict).map((r) => r.path);
  if (conflicts.length && !force) return { applied: [], conflicts, refused: true };
  const applied = [];
  for (const r of rows) {
    const dest = join(sc.root, r.path);
    if (r.mirror_hash === null) { rmSync(dest, { force: true }); delete st.base.files[r.path]; }
    else {
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(join(sc.mirror, r.path), dest);
      st.base.files[r.path] = r.mirror_hash;
    }
    applied.push({ path: r.path, change: r.mirror });
  }
  st.base.updated_at = new Date().toISOString();
  writeBase(sc, st.base);
  return { applied, conflicts, refused: false };
}

/** Throws away sandbox edits: the mirror file goes back to the official version (or disappears if official has none). */
export function discard(sc, { targets = [], all = false } = {}) {
  const st = computeState(sc);
  if (!st) throw new Error('no mirror yet: run `sandbox.mjs sync`');
  const rows = selected(st.rows.filter((r) => r.mirror), targets, all);
  for (const r of rows) {
    const to = join(sc.mirror, r.path);
    if (r.official_hash === null) { rmSync(to, { force: true }); delete st.base.files[r.path]; }
    else {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(join(sc.root, r.path), to);
      st.base.files[r.path] = r.official_hash;
    }
  }
  st.base.updated_at = new Date().toISOString();
  writeBase(sc, st.base);
  return { discarded: rows.map((r) => r.path) };
}

/** `git diff --no-index` between official and mirror for the rows that differ (path filter optional). */
export function diff(sc, { targets = [], color = false } = {}) {
  const st = computeState(sc);
  if (!st) throw new Error('no mirror yet: run `sandbox.mjs sync`');
  const rows = selected(st.rows.filter((r) => !r.same), targets, targets.length === 0);
  let out = '';
  for (const r of rows) {
    const a = r.official_hash === null ? '/dev/null' : join(sc.root, r.path);
    const b = r.mirror_hash === null ? '/dev/null' : join(sc.mirror, r.path);
    const g = spawnSync('git', ['--no-pager', 'diff', '--no-index', `--color=${color ? 'always' : 'never'}`, a, b], { encoding: 'utf8' });
    out += (g.stdout || '').split(sc.mirror).join('sandbox').split(sc.root).join('official');
  }
  return { rows, text: out };
}
