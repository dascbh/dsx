// Provenance block for every substantive artifact a DSX generator writes (Forward spec/product-pipeline.md,
// "Artifacts, provenance and versioning"): date, owner role, sources with their Git revision, criterion ids,
// evidence class, assumptions, unresolved gaps and the superseded artifact. No dependencies.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, relative, isAbsolute, resolve } from 'node:path';

/** Forward working roles plus the orchestrating agent (which authors design/** and routes evidence). */
export const OWNER_ROLES = ['fde-spec', 'fde-architecture', 'fde-implementation', 'fde-adversarial', 'fde-promotion', 'orchestrator'];
export const EVIDENCE_CLASSES = ['observed', 'expert-inferred', 'human', 'synthetic'];

const git = (cwd, args) => {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; } catch { return null; }
};

/**
 * Revision of one source: the last commit that touched it (short SHA) and whether the working copy differs from it;
 * outside Git, a content hash (`sha256:<12>`) so the reader can still tell whether the source changed.
 */
export function sourceRevision(path, { root = null } = {}) {
  const abs = resolve(root ?? process.cwd(), path);
  if (!existsSync(abs)) return { path, sha: null, state: 'missing' };
  const dir = statSync(abs).isDirectory() ? abs : dirname(abs);
  const top = git(dir, ['rev-parse', '--show-toplevel']);
  const shown = root ? relOrAbs(root, abs) : path;
  if (top) {
    const rel = relative(top, abs) || '.';
    const sha = git(top, ['log', '-1', '--format=%h', '--', rel]);
    const dirty = git(top, ['status', '--porcelain', '--', rel]);
    if (sha) return { path: shown, sha, state: dirty ? 'modified' : 'committed' };
    return { path: shown, sha: hashOf(abs), state: 'untracked' };
  }
  return { path: shown, sha: hashOf(abs), state: 'untracked' };
}

function relOrAbs(root, abs) {
  const r = relative(root, abs);
  return r && !r.startsWith('..') && !isAbsolute(r) ? r : abs;
}

function hashOf(abs) {
  try {
    if (statSync(abs).isDirectory()) return null;
    return `sha256:${createHash('sha256').update(readFileSync(abs)).digest('hex').slice(0, 12)}`;
  } catch { return null; }
}

/**
 * Builds the block. `sources` are paths (relative to `root` or absolute); null/missing entries are dropped.
 * Throws on an unknown owner role or evidence class so a generator cannot invent a parallel vocabulary.
 */
export function buildProvenance({
  root = process.cwd(), ownerRole = 'orchestrator', sources = [], criteria = [], evidenceClass = 'observed',
  assumptions = [], gaps = [], superseded = null, generator = null, now = new Date(),
} = {}) {
  if (!OWNER_ROLES.includes(ownerRole)) throw new Error(`provenance: owner role "${ownerRole}" is not one of ${OWNER_ROLES.join(', ')}`);
  const classes = [].concat(evidenceClass);
  for (const c of classes) if (!EVIDENCE_CLASSES.includes(c)) throw new Error(`provenance: evidence class "${c}" is not one of ${EVIDENCE_CLASSES.join(', ')}`);
  return {
    date: now.toISOString().slice(0, 10),
    owner_role: ownerRole,
    ...(generator ? { generator } : {}),
    head: git(root, ['rev-parse', '--short', 'HEAD']),
    sources: [...new Set(sources.filter(Boolean))].map((p) => sourceRevision(p, { root })),
    criteria: [...new Set(criteria.filter(Boolean))],
    evidence_class: classes.length === 1 ? classes[0] : classes,
    assumptions: assumptions.filter(Boolean),
    gaps: gaps.filter(Boolean),
    superseded: superseded ?? null,
  };
}

/** Problems of a provenance block read back from disk (missing keys, unknown role/class). */
export function checkProvenance(p) {
  const out = [];
  if (!p || typeof p !== 'object') return ['no provenance block'];
  for (const k of ['date', 'owner_role', 'sources', 'criteria', 'evidence_class', 'assumptions', 'gaps']) if (!(k in p)) out.push(`provenance: missing "${k}"`);
  if (p.owner_role && !OWNER_ROLES.includes(p.owner_role)) out.push(`provenance: unknown owner role "${p.owner_role}"`);
  for (const c of [].concat(p.evidence_class ?? [])) if (!EVIDENCE_CLASSES.includes(c)) out.push(`provenance: unknown evidence class "${c}"`);
  return out;
}
