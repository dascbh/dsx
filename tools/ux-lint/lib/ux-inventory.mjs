// Screen inventory of a module, to compare against the UX.md (score and drift): screens of the flow map
// (.dsx/maps/flows-<module>.json) and of the captures (<nn>-<screen>[.<state>].html), and the date of their last
// change (git when the files are versioned; otherwise the file date). No dependencies.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, isAbsolute } from 'node:path';
import { execFileSync } from 'node:child_process';
import { normalizeFlowMap } from './legacy.mjs';

const CAPTURE_RE = /^(\d+)-([a-z0-9]+(?:-[a-z0-9]+)*)(?:\.([a-z0-9]+(?:-[a-z0-9]+)*))?\.html$/;
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const normRoute = (s) => String(s ?? '').trim().replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Reads the map and the captures. Returns { screens: Map<id, { id, name, route, type, in_map, captures: [file],
 * states: Set }>, map, screens_dir, has_map, has_captures }.
 */
export function loadInventory({ map = null, screens = null } = {}) {
  const out = new Map();
  const get = (id) => {
    if (!out.has(id)) out.set(id, { id, name: null, route: null, type: null, in_map: false, captures: [], states: new Set() });
    return out.get(id);
  };
  let hasMap = false;
  if (map && isFile(map)) {
    const { map: data } = normalizeFlowMap(JSON.parse(readFileSync(map, "utf8")));
    for (const s of data.screens ?? []) {
      if (!s?.id) continue;
      const e = get(String(s.id));
      Object.assign(e, { name: s.name ?? null, route: s.route ?? null, type: s.type ?? null, in_map: true });
    }
    hasMap = true;
  }
  let hasCaptures = false;
  if (screens && isDir(screens)) {
    for (const f of readdirSync(screens).sort()) {
      const m = f.match(CAPTURE_RE);
      if (!m) continue;
      const e = get(m[2]);
      e.captures.push(f);
      e.states.add(m[3] ?? 'success');
      hasCaptures = true;
    }
  }
  return { screens: out, map: hasMap ? map : null, screens_dir: hasCaptures ? screens : null, has_map: hasMap, has_captures: hasCaptures };
}

/** Does the front matter entry (`archetypes.<id>: [entries]`) name this screen (id, route or name)? */
export function entryMatches(entry, screen) {
  const v = String(entry ?? '').trim();
  if (!v) return false;
  if (v === screen.id) return true;
  if (v.startsWith('/') && screen.route && normRoute(v) === normRoute(screen.route)) return true;
  if (screen.name && fold(v) === fold(screen.name)) return true;
  return false;
}

/** Archetype assigned to the screen by the front matter, or null. */
export function archetypeOf(screen, archetypes = {}) {
  for (const [arch, entries] of Object.entries(archetypes || {})) {
    if ([].concat(entries ?? []).some((e) => entryMatches(e, screen))) return arch;
  }
  return null;
}

const rel = (root, p) => { const r = relative(root, p); return r && !r.startsWith('..') && !isAbsolute(r) ? r : p; };

function gitRoot(dir) {
  try { return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; } catch { return null; }
}

/**
 * Last change of the screens: the most recent commit touching the map or the captures folder (date YYYY-MM-DD), or,
 * with nothing versioned, the modification date of the newest file. Returns { date, source: 'git'|'mtime', paths }
 * or null.
 */
export function lastScreensChange({ map = null, screens = null, root = null } = {}) {
  const paths = [map, screens].filter((p) => p && existsSync(p));
  if (!paths.length) return null;
  const top = gitRoot(root ?? (isDir(paths[0]) ? paths[0] : dirname(paths[0])));
  if (top) {
    try {
      const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths.map((p) => rel(top, p))], { cwd: top, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (date) return { date, source: 'git', paths };
    } catch { /* no history */ }
  }
  let newest = 0;
  for (const p of paths) {
    if (isFile(p)) newest = Math.max(newest, statSync(p).mtimeMs);
    else for (const f of readdirSync(p)) if (f.endsWith('.html') || f.endsWith('.json')) newest = Math.max(newest, statSync(join(p, f)).mtimeMs);
  }
  return newest ? { date: new Date(newest).toISOString().slice(0, 10), source: 'mtime', paths } : null;
}
