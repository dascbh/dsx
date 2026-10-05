// Design options of a project: candidate DESIGN.md files next to the official one, the active pointer, token diff,
// variants by token, and the manifest the live switcher reads. Used by tools/design-md/lab.mjs.
//
// Where things live (docs/forward-compat.md, "Design options"): the official DESIGN.md stays where the project has it;
// options are DSX-only state in `.dsx/design-options/<name>.md` (never in Forward's `design/` foundation folder);
// the pointer is `design.active` in `.dsx/config.json`. All configurable in the `design` block of that file.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { parseYaml, splitFrontMatter } from '../../lib/yaml-lite.mjs';
import { configFileFor, readConfigFile } from '../../ux-lint/lib/project-paths.mjs';
import { evaluate } from '../../references.mjs';
import { mainPairs, palettes } from './roles.mjs';

export const DESIGN_DEFAULTS = Object.freeze({
  official: 'DESIGN.md',
  options_dir: '.dsx/design-options',
  manifest: null,
  theme_gate: null,
});
export const OFFICIAL = 'official';
export const CURRENT = 'current';
export const NAME_RE = /^[a-z0-9][a-z0-9-]{0,47}$/;
export const PREVIOUS_RE = /^previous-\d{4}-\d{2}-\d{2}(-\d+)?$/;

/** The design block of the project config, with defaults and absolute paths. */
export function designConfig(root, { config = null, env = process.env } = {}) {
  const base = resolve(root ?? process.cwd());
  const file = configFileFor(base, config, env);
  const cfg = readConfigFile(file) ?? {};
  const d = { ...DESIGN_DEFAULTS, ...(cfg.design ?? {}) };
  const abs = (p) => (p ? resolve(base, p) : null);
  return {
    root: base, configFile: file, config: cfg,
    official: abs(d.official), optionsDir: abs(d.options_dir), active: d.active ?? null,
    manifest: abs(d.manifest), themeGate: d.theme_gate ?? null,
    capture: cfg.capture ?? {},
  };
}

/** Writes `design.<key>` into the config file, keeping every other key. `undefined` removes the key. */
export function writeDesignKey(dc, key, value) {
  const cfg = readConfigFile(dc.configFile) ?? {};
  cfg.design = { ...(cfg.design ?? {}) };
  if (value === undefined || value === null) delete cfg.design[key]; else cfg.design[key] = value;
  mkdirSync(dirname(dc.configFile), { recursive: true });
  writeFileSync(dc.configFile, `${JSON.stringify(cfg, null, 2)}\n`);
  dc.config = cfg;
  if (key === 'active') dc.active = value ?? null;
}

/** Names of the options on disk (previous-<date> copies left out). */
export function optionNames(dc) {
  if (!existsSync(dc.optionsDir)) return [];
  return readdirSync(dc.optionsDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3))
    .filter((n) => NAME_RE.test(n) && !PREVIOUS_RE.test(n)).sort();
}

export function previousCopies(dc) {
  if (!existsSync(dc.optionsDir)) return [];
  return readdirSync(dc.optionsDir).filter((f) => f.endsWith('.md') && PREVIOUS_RE.test(f.slice(0, -3))).sort();
}

export function validateName(name) {
  if (!NAME_RE.test(name ?? '')) return `"${name}": use lowercase letters, digits and hyphens (up to 48), starting with a letter or digit`;
  if (name === OFFICIAL || name === CURRENT) return `"${name}" is reserved`;
  if (PREVIOUS_RE.test(name)) return `"${name}" is reserved for the copies kept by promote`;
  return null;
}

/** File of an option name: official, current (the active option, or the official one) or an option. */
export function fileOf(dc, name) {
  if (name === OFFICIAL) return dc.official;
  if (name === CURRENT) return dc.active ? join(dc.optionsDir, `${dc.active}.md`) : dc.official;
  return join(dc.optionsDir, `${name}.md`);
}

export function readFrontMatter(md) {
  const { frontMatter } = splitFrontMatter(md.replace(/\r\n/g, '\n'));
  return frontMatter ? parseYaml(frontMatter) : {};
}

// ------------------------------------------------------------------ token diff

const GROUPS = ['colors', 'colors-dark', 'typography', 'spacing', 'rounded', 'components'];

/** Flat map "group.key[.prop]" → raw value of the token groups. */
export function flattenTokens(fm) {
  const out = {};
  const walk = (o, p) => {
    for (const [k, v] of Object.entries(o ?? {})) {
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, `${p}.${k}`);
      else out[`${p}.${k}`.slice(1)] = v;
    }
  };
  for (const g of GROUPS) if (fm?.[g] && typeof fm[g] === 'object') walk(fm[g], `.${g}`);
  return out;
}

const norm = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v);

/** Token diff a → b: { changed: [{ path, from, to }], added: [{ path, to }], removed: [{ path, from }] }. */
export function tokenDiff(fmA, fmB) {
  const a = flattenTokens(fmA), b = flattenTokens(fmB);
  const changed = [], added = [], removed = [];
  for (const [p, v] of Object.entries(b)) {
    if (!(p in a)) added.push({ path: p, to: v });
    else if (norm(a[p]) !== norm(v)) changed.push({ path: p, from: a[p], to: v });
  }
  for (const [p, v] of Object.entries(a)) if (!(p in b)) removed.push({ path: p, from: v });
  return { changed, added, removed, count: changed.length + added.length + removed.length };
}

// ------------------------------------------------------------------ evaluation

/** Official linter (@google/design.md). `download: false` uses only a cached copy (npx --no); never throws. */
export function officialLint(file, { download = false, timeout = 60000 } = {}) {
  const r = spawnSync('npx', [download ? '-y' : '--no', '@google/design.md', 'lint', file], { encoding: 'utf8', timeout, shell: process.platform === 'win32' });
  try {
    const j = JSON.parse(r.stdout);
    const sum = j.summary ?? {};
    const errors = (j.findings ?? []).filter((f) => f.severity === 'error').map((f) => `${f.path ?? ''} ${f.message}`.trim());
    return { available: true, errors: sum.errors ?? errors.length, warnings: sum.warnings ?? 0, error_messages: errors };
  } catch {
    return { available: false };
  }
}

/** Everything `list` and the compare page show about one file. */
export function describe(file, { officialFm = null, official = false, officialLinter = null } = {}) {
  const md = readFileSync(file, 'utf8');
  let fm = {};
  let parseError = null;
  try { fm = readFrontMatter(md); } catch (e) { parseError = e.message; }
  const ev = evaluate(md);
  const { schemes } = palettes(fm);
  const pairs = mainPairs(fm);
  const diff = officialFm && !official ? tokenDiff(officialFm, fm) : null;
  const body = fm.typography?.body ?? fm.typography?.['body-md'] ?? Object.values(fm.typography ?? {})[0];
  return {
    file, name: typeof fm.name === 'string' ? fm.name : basename(file, '.md'), description: typeof fm.description === 'string' ? fm.description : '',
    parse_error: parseError, score: ev.score, errors: ev.errors, warnings: ev.warnings, schemes, pairs, diff,
    official_lint: officialLinter ? officialLinter(file) : null,
    credit: /designmd\.app/i.test(md) ? 'designmd.app (CC BY 4.0)' : null,
    swatches: swatchesOf(fm), font: String(body?.fontFamily ?? '').split(',')[0].replace(/['"]/g, '').trim() || null,
    radius: fm.rounded?.md ?? fm.rounded?.DEFAULT ?? fm.rounded?.sm ?? null,
    frontMatter: fm,
  };
}

function swatchesOf(fm) {
  const { light } = palettes(fm);
  const keys = [['primary', ['primary', 'brand', 'accent']], ['background', ['canvas', 'background']], ['surface', ['surface', 'background']], ['text', ['text-primary', 'text', 'on-background', 'on-surface']]];
  return keys.map(([role, ks]) => ({ role, color: ks.map((k) => light[k]).find(Boolean) ?? null })).filter((s) => s.color);
}

// ------------------------------------------------------------------ variants (edit the front matter text in place)

const fmtKey = (k) => (/^[\w-]+$/.test(k) && !/^\d/.test(k) ? k : `"${k}"`);
const fmtValue = (v) => (/^-?\d+(\.\d+)?$/.test(String(v)) ? String(v) : `"${String(v).replace(/"/g, '\\"')}"`);

/** Resolves a bare key ("primary") to its full path when exactly one token ends with it. */
export function resolveTokenPath(fm, path) {
  if (path.includes('.') || ['name', 'description', 'owner', 'updated'].includes(path)) return { path };
  let hits = Object.keys(flattenTokens(fm)).filter((p) => p.split('.').at(-1) === path);
  // a bare color name means the light value; the dark one is always written in full (colors-dark.<key>)
  if (hits.length > 1) { const light = hits.filter((p) => !p.startsWith('colors-dark.')); if (light.length === 1) hits = light; }
  if (hits.length === 1) return { path: hits[0] };
  if (!hits.length) return { error: `"${path}" is not a token of the base file: give the group, e.g. colors.${path}` };
  return { error: `"${path}" is ambiguous (${hits.join(', ')}): give the full path` };
}

/**
 * Splits a token path into keys, honoring keys that contain dots ("spacing.0.5" → ["spacing", "0.5"] when the file
 * has a "0.5" step) and quoted segments (spacing."0.5"). Unknown segments split on dots.
 */
export function splitTokenPath(fm, path) {
  const keys = [];
  let node = fm;
  let rest = String(path);
  while (rest) {
    let key;
    const q = rest.match(/^"([^"]+)"(?:\.|$)/) ?? rest.match(/^'([^']+)'(?:\.|$)/);
    if (q) { key = q[1]; rest = rest.slice(q[0].length); }
    else {
      const here = node && typeof node === 'object' ? Object.keys(node).filter((k) => rest === k || rest.startsWith(`${k}.`)).sort((a, b) => b.length - a.length) : [];
      key = here[0] ?? rest.split('.')[0];
      rest = rest.slice(key.length + 1);
    }
    keys.push(key);
    node = node && typeof node === 'object' ? node[key] : undefined;
  }
  return keys;
}

/**
 * Sets one token in the front matter text, keeping comments, order and formatting. Creates the missing groups
 * (two spaces per level). `path` is a dotted path (keys with dots are recognized) or an array of keys.
 */
export function setToken(md, path, value) {
  const text = md.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!m) throw new Error('the base file has no front matter');
  const lines = m[1].split('\n');
  const keys = Array.isArray(path) ? path : splitTokenPath(parseYaml(m[1]), path);
  const stack = []; // [{ indent, key, line }]
  let best = { depth: 0, line: -1, indent: -2 };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim() || /^\s*#/.test(raw) || /^\s*-/.test(raw)) continue;
    const km = raw.match(/^(\s*)("[^"]+"|'[^']+'|[^:#]+):(.*)$/);
    if (!km) continue;
    const indent = km[1].length;
    while (stack.length && stack.at(-1).indent >= indent) stack.pop();
    stack.push({ indent, key: km[2].replace(/^["']|["']$/g, '').trim(), line: i });
    const cur = stack.map((s) => s.key);
    let depth = 0;
    while (depth < cur.length && depth < keys.length && cur[depth] === keys[depth]) depth++;
    if (depth !== cur.length) continue;
    if (depth === keys.length) {
      const rest = km[3];
      const comment = rest.match(/\s+#.*$/)?.[0] ?? '';
      lines[i] = `${km[1]}${km[2]}: ${fmtValue(value)}${comment}`;
      return text.replace(m[1], () => lines.join('\n'));
    }
    if (depth > best.depth) best = { depth, line: i, indent };
  }
  // insert the missing levels after the deepest existing ancestor's block
  let at = lines.length;
  let indent = 0;
  if (best.line >= 0) {
    indent = best.indent + 2;
    at = best.line + 1;
    while (at < lines.length && (!lines[at].trim() || lines[at].match(/^\s*/)[0].length > best.indent)) at++;
    while (at > best.line + 1 && !lines[at - 1].trim()) at--;
  }
  const add = [];
  for (let d = best.depth; d < keys.length; d++) {
    const pad = ' '.repeat(indent + (d - best.depth) * 2);
    add.push(d === keys.length - 1 ? `${pad}${fmtKey(keys[d])}: ${fmtValue(value)}` : `${pad}${fmtKey(keys[d])}:`);
  }
  lines.splice(at, 0, ...add);
  return text.replace(m[1], () => lines.join('\n'));
}

/** Adds a YAML comment after the opening --- recording where a variant came from. */
export function stampVariant(md, base, paths, date) {
  return md.replace(/^---\n/, `---\n# dsx-design-lab: variant of ${base} (${date}) changing ${paths.join(', ')}\n`);
}

// ------------------------------------------------------------------ manifest (live switcher)

/** Manifest read by templates/theme-switcher: raw markdown of the official file and every option. */
export function buildManifest(dc) {
  const entry = (name, file) => {
    const md = readFileSync(file, 'utf8');
    let label = name;
    try { const fm = readFrontMatter(md); if (typeof fm.name === 'string' && fm.name) label = fm.name; } catch { /* keep the file name */ }
    return { name, label, source: relative(dc.root, file).split('\\').join('/'), markdown: md };
  };
  return {
    format: 1,
    kind: 'dsx-design-options',
    active: dc.active ?? null,
    official: existsSync(dc.official) ? entry(OFFICIAL, dc.official) : null,
    options: optionNames(dc).map((n) => entry(n, fileOf(dc, n))),
  };
}

export function writeManifest(dc, out = dc.manifest) {
  if (!out) return null;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(buildManifest(dc), null, 2)}\n`);
  return out;
}

/** Marker every switcher file carries; finding it in a production bundle means the switcher leaked. */
export const BUNDLE_MARKER = /dsx-design-(lab|options)/;

/** Files under `dir` (js, css, html, json, map excluded) whose text contains the marker. */
export function scanBundle(dir) {
  const hits = [];
  const walk = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(m?js|cjs|css|html?|json|txt)$/.test(f.name)) {
        const t = readFileSync(p, 'utf8');
        const i = t.search(BUNDLE_MARKER);
        if (i >= 0) hits.push({ file: p, excerpt: t.slice(Math.max(0, i - 40), i + 60).replace(/\s+/g, ' ') });
      }
    }
  };
  walk(dir);
  return hits;
}
