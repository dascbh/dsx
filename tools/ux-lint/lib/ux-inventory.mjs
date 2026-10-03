// Inventário de telas de um módulo, para confrontar com o UX.md (nota e drift): telas do mapa de fluxo
// (.dsx/maps/flows-<module>.json) e das capturas (<nn>-<tela>[.<estado>].html), e a data da última mudança
// delas (git quando os arquivos estão versionados; senão, a data do arquivo). Sem dependências.
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
 * Lê o mapa e as capturas. Devolve { screens: Map<id, { id, name, route, type, in_map, captures: [arquivo],
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

/** A entrada do front matter (`archetypes.<id>: [entradas]`) nomeia esta tela (id, rota ou nome)? */
export function entryMatches(entry, screen) {
  const v = String(entry ?? '').trim();
  if (!v) return false;
  if (v === screen.id) return true;
  if (v.startsWith('/') && screen.route && normRoute(v) === normRoute(screen.route)) return true;
  if (screen.name && fold(v) === fold(screen.name)) return true;
  return false;
}

/** Arquétipo atribuído à tela pelo front matter, ou null. */
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
 * Última mudança das telas: o commit mais recente que tocou o mapa ou a pasta de capturas (data AAAA-MM-DD), ou,
 * sem nada versionado, a data de modificação do arquivo mais novo. Devolve { date, source: 'git'|'mtime', paths }
 * ou null.
 */
export function lastScreensChange({ map = null, screens = null, root = null } = {}) {
  const paths = [map, screens].filter((p) => p && existsSync(p));
  if (!paths.length) return null;
  const top = gitRoot(root ?? (isDir(paths[0]) ? paths[0] : dirname(paths[0])));
  if (top) {
    try {
      const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths.map((p) => rel(top, p))], { cwd: top, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (date) return { date, source: 'git', paths };
    } catch { /* sem histórico */ }
  }
  let newest = 0;
  for (const p of paths) {
    if (isFile(p)) newest = Math.max(newest, statSync(p).mtimeMs);
    else for (const f of readdirSync(p)) if (f.endsWith('.html') || f.endsWith('.json')) newest = Math.max(newest, statSync(join(p, f)).mtimeMs);
  }
  return newest ? { date: new Date(newest).toISOString().slice(0, 10), source: 'mtime', paths } : null;
}
