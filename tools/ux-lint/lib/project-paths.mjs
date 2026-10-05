// Project path resolution for every ux-lint tool (audit, variations, preview, measure, findings, ux-md-drift)
// and for the capture/Stitch tools. One function, one precedence order, documented in
// docs/project-paths.md:
//
//   1. command-line flag (--screens, --geometry, --map, --dir, --code, --ux …)
//   2. config file: --config <file> or $DSX_CONFIG, else <root>/.dsx/config.json → { "paths": { … } }
//   3. the `paths` block in the UX.md front matter
//   4. generic defaults (PATH_DEFAULTS); code folders detected from the stack (detectCodeDirs)
//
// Values are relative to the project root; `<module>` (or `{module}`) is replaced by the module id.
// Capture folders written by DSX ≤ 0.7 (`.stitch/<module>/code`, `.stitch/<module>/geometry`) are still
// read when the generic default does not exist, with a warning (docs/renames-2026-10.md).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, isAbsolute, relative } from 'node:path';
import { parseYaml, splitFrontMatter } from '../../lib/yaml-lite.mjs';

/** Generic defaults. Nothing here names a product, a module or a stack-specific folder. */
export const PATH_DEFAULTS = Object.freeze({
  captures: '.dsx/captures/<module>',
  geometry: '.dsx/captures/<module>/geometry',
  map: '.dsx/maps/flows-<module>.json',
  findings: '.dsx/findings',
  variations: '.dsx/variations',
  ux: 'UX.md',
});

/** Locations used before the paths were configurable (DSX ≤ 0.7). Read with a warning, never written by default. */
export const LEGACY_PATHS = Object.freeze({
  captures: '.stitch/<module>/code',
  geometry: '.stitch/<module>/geometry',
});

/** Keys accepted in `paths` (UX.md front matter and .dsx/config.json). `code` is a list. */
export const PATH_KEYS = Object.freeze([...Object.keys(PATH_DEFAULTS), 'code']);

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const hasHtml = (p) => isDir(p) && readdirSync(p).some((f) => f.endsWith('.html'));
const fill = (p, module) => String(p).replace(/<module>|\{module\}/g, module ?? '');

/** Reads a JSON config file. Missing file → null; invalid JSON → throws with the path. */
export function readConfigFile(file) {
  if (!file || !isFile(file)) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch (e) { throw new Error(`${file}: invalid JSON (${e.message})`); }
}

/** Which config file applies: explicit --config, then $DSX_CONFIG, then <root>/.dsx/config.json. */
export function configFileFor(root, explicit = null, env = process.env) {
  if (explicit) return resolve(explicit);
  if (env.DSX_CONFIG) return resolve(env.DSX_CONFIG);
  return join(root, '.dsx', 'config.json');
}

/** The `paths` block of a UX.md front matter (or {}). Never throws: a broken UX.md is the lint's job. */
export function uxPathsBlock(uxPath) {
  if (!uxPath || !isFile(uxPath)) return {};
  try {
    const { frontMatter } = splitFrontMatter(readFileSync(uxPath, 'utf8'));
    const fm = frontMatter ? parseYaml(frontMatter) : {};
    return fm && typeof fm.paths === 'object' && !Array.isArray(fm.paths) ? fm.paths : {};
  } catch { return {}; }
}

/** Front-end roots tried by the stack heuristic, in order. */
const FRONT_DIRS = ['frontend', 'web', 'client', 'app', 'ui', 'www', 'site'];
/** Source folders inside a front-end root, in order of preference. */
const SOURCE_DIRS = ['src', 'app', 'pages', 'components', 'lib'];

/**
 * Code folders where user-facing text is born, detected from the stack: every package root (the project
 * root, a conventional front-end folder, `apps/*`, `packages/*`) contributes its first existing source
 * folder. A root without package.json contributes `src`/`app`/`lib` when present (non-JS stacks).
 * Returns absolute paths; empty when nothing is recognizable (the audit then asks for --code).
 */
export function detectCodeDirs(root) {
  const bases = [root, ...FRONT_DIRS.map((d) => join(root, d))];
  for (const mono of ['apps', 'packages']) {
    const dir = join(root, mono);
    if (isDir(dir)) for (const d of readdirSync(dir).sort()) if (!d.startsWith('.')) bases.push(join(dir, d));
  }
  const out = [];
  for (const b of bases) {
    if (!isDir(b)) continue;
    const pkg = isFile(join(b, 'package.json'));
    if (!pkg && b !== root) continue;
    const src = SOURCE_DIRS.map((s) => join(b, s)).find(isDir);
    if (src && !out.includes(src)) out.push(src);
  }
  return out;
}

/**
 * Resolves every project path for one module.
 * @param {object} o
 * @param {string} [o.root]      project root (default: cwd)
 * @param {string} [o.module]    module id (fills `<module>`)
 * @param {object} [o.flags]     explicit values: { captures|screens, geometry, map, findings|dir, variations, ux, code: [] }
 * @param {string} [o.config]    explicit config file (else $DSX_CONFIG, else <root>/.dsx/config.json)
 * @param {object} [o.env]       environment (tests)
 * @returns {{ root, module, ux, captures, geometry, map, findings, variations, code: string[], codeDefaulted: boolean,
 *             sources: Record<string,string>, warnings: string[], configFile: string|null, config: object|null }}
 */
export function resolveProjectPaths({ root, module = null, flags = {}, config = null, env = process.env } = {}) {
  const base = resolve(root ?? process.cwd());
  const abs = (p) => (isAbsolute(p) ? p : resolve(base, p));
  const warnings = [];
  const sources = {};
  const configFile = configFileFor(base, config, env);
  let cfg = null;
  try { cfg = readConfigFile(configFile); } catch (e) { warnings.push(e.message); }
  const fromConfig = cfg?.paths && typeof cfg.paths === 'object' ? cfg.paths : {};
  const f = { ...flags, captures: flags.captures ?? flags.screens, findings: flags.findings ?? flags.dir };

  // UX.md first: its own location cannot come from its own front matter.
  let ux;
  if (f.ux) { ux = abs(f.ux); sources.ux = 'flag'; }
  else if (fromConfig.ux) { ux = abs(fill(fromConfig.ux, module)); sources.ux = 'config'; }
  else { ux = abs(PATH_DEFAULTS.ux); sources.ux = 'default'; }
  const fromUx = uxPathsBlock(ux);

  const pick = (key) => {
    if (f[key]) { sources[key] = 'flag'; return abs(f[key]); }
    if (fromConfig[key]) { sources[key] = 'config'; return abs(fill(fromConfig[key], module)); }
    if (fromUx[key]) { sources[key] = 'ux'; return abs(fill(fromUx[key], module)); }
    sources[key] = 'default';
    return abs(fill(PATH_DEFAULTS[key], module));
  };
  let captures = pick('captures');
  let geometry = pick('geometry');
  const map = pick('map');
  const findings = pick('findings');
  const variations = pick('variations');

  if (module && sources.captures === 'default' && !hasHtml(captures)) {
    const legacy = abs(fill(LEGACY_PATHS.captures, module));
    if (hasHtml(legacy)) {
      captures = legacy;
      sources.captures = 'legacy';
      warnings.push(`legacy capture folder ${rel(base, legacy)} (DSX ≤ 0.7): move the captures to ${fill(PATH_DEFAULTS.captures, module)}/ or declare paths.captures in .dsx/config.json or the UX.md (docs/project-paths.md)`);
    }
  }
  // Geometry follows legacy captures (measured next to them), so old projects keep working unchanged.
  if (module && sources.geometry === 'default' && sources.captures === 'legacy') {
    geometry = abs(fill(LEGACY_PATHS.geometry, module));
    sources.geometry = 'legacy';
  }

  let code;
  const listOf = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  if (listOf(f.code).length) { code = listOf(f.code).map(abs); sources.code = 'flag'; }
  else if (listOf(fromConfig.code).length) { code = listOf(fromConfig.code).map((p) => abs(fill(p, module))); sources.code = 'config'; }
  else if (listOf(fromUx.code).length) { code = listOf(fromUx.code).map((p) => abs(fill(p, module))); sources.code = 'ux'; }
  else { code = detectCodeDirs(base); sources.code = 'detected'; }
  if (sources.code !== 'flag') code = code.filter(isDir);

  return {
    root: base, module, ux, captures, geometry, map, findings, variations, code,
    codeDefaulted: sources.code === 'detected', sources, warnings,
    configFile: cfg ? configFile : null, config: cfg,
  };
}

function rel(root, p) {
  const r = relative(root, p);
  return r && !r.startsWith('..') && !isAbsolute(r) ? r : p;
}

/** Path relative to the root when inside it (for messages). */
export const relToRoot = rel;

/** True when a path exists (file or folder). */
export const pathExists = (p) => !!p && existsSync(p);
