// The DSX is an open framework: nothing in it may name a specific product, client, module or folder layout of a
// project that uses it (docs/decoupling-2026-10.md). This test walks the repository and fails on known
// project-specific markers. Exceptions: third-party references (references/), and the two documents that record
// the history of the decoupling and of renamed names.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules', 'references']);
const ALLOWED = new Set(['docs/decoupling-2026-10.md', 'docs/renames-2026-10.md', 'tools/test/decoupling.test.mjs']);
const TEXT = /\.(md|mjs|cjs|js|ts|tsx|json|html|css|ya?ml|toml|txt)$/;

// product, client and module names of projects that used the DSX, and their fixed folders
export const MARKERS = [
  /\bauris\b/i, /ferroeste/i, /azevedo/i, /a[çc]o verde/i,
  /backend\/shared/i, /frontend\/src/i, /frontend\/tests\/stitch-capture/i, /code-to-stitch/i,
  /\bminutas?\b/i, /\baditivos?\b/i, /tribut[aá]ri[oa]/i, /\/contratos\b/i, /flows-contratos/i,
  /#0e71b8/i, /\bNormaChat\b/,
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (TEXT.test(name) && st.size < 3_000_000) yield p;
  }
}

test('decoupling: no project-specific names, modules or folders anywhere in the DSX', () => {
  const hits = [];
  for (const file of walk(ROOT)) {
    const rel = relative(ROOT, file).split('\\').join('/');
    if (ALLOWED.has(rel)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => { for (const m of MARKERS) if (m.test(line)) hits.push(`${rel}:${i + 1} ${m} ${line.trim().slice(0, 100)}`); });
  }
  assert.deepEqual(hits, [], `project-specific markers found:\n${hits.join('\n')}`);
});
