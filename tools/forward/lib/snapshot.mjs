// The Forward snapshot under data/forward/: which files it holds, how to read them, and what DSX derives from them
// (principle catalog, divergence lenses, findings template keys). Forward is canonical; this module never edits it.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseToml } from './toml-lite.mjs';

export const DSX_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const SNAPSHOT_DIR = join(DSX_ROOT, 'data', 'forward');
export const VERSION_FILE = 'VERSION';

/**
 * Files copied from a Forward checkout, unchanged, at the same relative path. `role` says why DSX needs each one.
 * Adding a file here and running `node tools/forward/sync.mjs --from <forward>` is the whole procedure. Prose specs
 * (product-pipeline.md, design-system-lifecycle.md) are read in the Forward checkout, not copied: their paths are
 * relative to a Forward project and would read as broken links here.
 */
export const SNAPSHOT_FILES = [
  { path: 'spec/dimensions/quality-attributes.toml', role: 'canonical principle catalog (heuristic_principles) and adversarial probes' },
  { path: 'spec/references/ui-patterns.toml', role: 'curated UI reference base: systems, patterns, archetypes' },
  { path: 'templates/findings.template.toml', role: 'shape of reviews/<id>/findings.toml' },
  { path: 'spec/invariants.toml', role: 'I1–I8 and floors' },
  { path: 'spec/roles.toml', role: 'roles, write scopes and isolation' },
  { path: 'bin/fde/design.py', role: 'divergence gate: lens list and alternatives.md checks' },
];

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
export const snapshotPath = (rel, dir = SNAPSHOT_DIR) => join(dir, rel);
export const readSnapshot = (rel, dir = SNAPSHOT_DIR) => readFileSync(snapshotPath(rel, dir), 'utf8');

/** VERSION is TOML: forward_version, forward_commit, synced_at and [files] path → sha256. */
export function readVersion(dir = SNAPSHOT_DIR) {
  const f = join(dir, VERSION_FILE);
  if (!existsSync(f)) return null;
  return parseToml(readFileSync(f, 'utf8'));
}

// ---------- principle catalog ----------

const PRINCIPLE_RE = /^([A-Z]+-\d+)\s+(.*)$/s;

/**
 * Principles from `heuristic_principles` of every attribute: Map id → { id, attribute, text }.
 * The id is the leading token of each entry (USE-1, DOM-3, MNT-5…), exactly as Forward writes it.
 */
export function loadPrinciples(dir = SNAPSHOT_DIR) {
  const qa = parseToml(readSnapshot('spec/dimensions/quality-attributes.toml', dir));
  const out = new Map();
  for (const a of qa.attribute ?? []) {
    for (const entry of a.heuristic_principles ?? []) {
      const m = String(entry).match(PRINCIPLE_RE);
      if (m) out.set(m[1], { id: m[1], attribute: a.id, text: m[2] });
    }
  }
  return out;
}

/** Attributes of vector A with their adversarial probes: Map id → { id, label, probes }. */
export function loadAttributes(dir = SNAPSHOT_DIR) {
  const qa = parseToml(readSnapshot('spec/dimensions/quality-attributes.toml', dir));
  return new Map((qa.attribute ?? []).map((a) => [a.id, { id: a.id, label: a.label, probes: a.adversarial_probes ?? [] }]));
}

// ---------- divergence gate facts (read from the gate's own source, never restated) ----------

/** The lens list and required alternatives per size, read from Forward's design.py. */
export function loadDivergenceRules(dir = SNAPSHOT_DIR) {
  const src = readSnapshot('bin/fde/design.py', dir);
  const lensBlock = src.match(/^LENSES\s*=\s*\(([^)]*)\)/m);
  if (!lensBlock) throw new Error('design.py snapshot: LENSES not found — the gate changed shape; re-sync and update tools/forward');
  const lenses = [...lensBlock[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
  const reqBlock = src.match(/^REQUIRED_ALTERNATIVES\s*=\s*\{([^}]*)\}/m);
  const required = Object.fromEntries([...(reqBlock?.[1] ?? '').matchAll(/"(\w+)"\s*:\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
  return { lenses, required };
}

// ---------- findings template ----------

/**
 * Keys the template declares, read from the template text (active and commented lines):
 * { meta: [...], finding: [...], severities: [...], kinds: [...] }.
 */
export function loadFindingsTemplate(dir = SNAPSHOT_DIR) {
  const src = readSnapshot('templates/findings.template.toml', dir);
  const meta = [], finding = [];
  let section = null;
  for (const raw of src.split('\n')) {
    const line = raw.replace(/^#\s?/, '').trim();
    if (/^\[meta\]$/.test(line)) { section = 'meta'; continue; }
    if (/^\[\[finding\]\]$/.test(line)) { section = 'finding'; continue; }
    const k = line.match(/^([a-z_]+)\s*=/);
    if (!k || !section) continue;
    const list = section === 'meta' ? meta : finding;
    if (!list.includes(k[1])) list.push(k[1]);
  }
  const sev = src.match(/severity\s*=\s*"\w+"\s*#\s*([a-z| ]+)/);
  const kinds = src.match(/kind\s*=\s*"[^"]*"\s*#\s*([a-z| ]+)/);
  const split = (m) => (m ? m[1].split('|').map((s) => s.trim()).filter(Boolean) : []);
  return { meta, finding, severities: split(sev), kinds: split(kinds) };
}
