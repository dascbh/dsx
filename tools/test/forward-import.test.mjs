import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { importFindings, importAlternatives, applyToManifest, reviewFiles, demandSize } from '../forward/import.mjs';
import { summary } from '../ux-lint/findings.mjs';

const REVIEW = `[meta]
demand_id = "ORD-7"
kind = "code"
context_policy = "artifact_only"
isolation_mode = "worktree"
rounds_planned = 1

[[finding]]
id = "s-0000abcd"
attribute = "usability_accessibility"
severity = "high"
principle = "USE-4"
probe = "T5: check that destructive actions name the consequence instead of a generic Confirm/OK/Yes"
evidence = "Delete order uses OK. Screens: orders-list."
blocking = false
backlog = true
`;

const ALTERNATIVES = `## How might we…
- HMW make approving need no page change?
- HMW let the system approve the routine ones?

## Alternatives
### A. Inline approve
Lens: subtract
Hypothesis: fewer steps.
### B. Auto-approve under limit
Lens: invert
Hypothesis: the system acts first.
Traded: harder to audit.

## Convergence
Chose: A — fewest steps.
`;

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-fwd-import-'));
  mkdirSync(join(dir, 'reviews', 'ORD-7'), { recursive: true });
  writeFileSync(join(dir, 'reviews', 'ORD-7', 'findings.toml'), REVIEW);
  writeFileSync(join(dir, 'reviews', 'ORD-7', 'findings-plan.toml'), 'not = [valid');
  mkdirSync(join(dir, 'specs', 'ORD-7', 'design'), { recursive: true });
  writeFileSync(join(dir, 'specs', 'ORD-7', 'spec.md'), '# ORD-7\n\n**Bold** intro\nTriage: **M** (one front demand)\n');
  writeFileSync(join(dir, 'specs', 'ORD-7', 'design', 'alternatives.md'), ALTERNATIVES);
  return dir;
}

test('import findings: reviews/*/findings*.toml → a DSX registry the findings tools summarize; bad files reported, not fatal', () => {
  const dir = project();
  try {
    assert.equal(reviewFiles(dir).length, 2);
    const r = importFindings(dir, { now: new Date('2026-10-05T00:00:00Z') });
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0], /findings-plan\.toml/);
    assert.equal(r.registry.items.length, 1);
    const s = summary(r.registry);
    assert.deepEqual(s.by_rule, { T5: 1 });
    assert.deepEqual(s.by_family, { screen: 1 });
    assert.deepEqual(s.by_status, { open: 1 });
    assert.equal(r.registry.items[0].id, 's-0000abcd');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('import alternatives: framings, lenses, choice and the gate check by the demand size', () => {
  const dir = project();
  try {
    assert.equal(demandSize(join(dir, 'specs', 'ORD-7', 'spec.md')), 'm');
    const [a] = importAlternatives(dir);
    assert.equal(a.size, 'm');
    assert.equal(a.required, 2);
    assert.deepEqual(a.gate, []);
    assert.deepEqual(a.alternatives.map((x) => [x.key, x.name, x.lens]), [['A', 'Inline approve', 'subtract'], ['B', 'Auto-approve under limit', 'invert']]);
    assert.equal(a.how_might_we.length, 2);
    assert.match(a.chose, /^A/);
    const manifest = { format: 1, variants: [{ id: 'a', name: 'Inline approve' }, { id: 'b', name: 'Something renamed' }, { id: 'c', name: 'Extra' }] };
    const r = applyToManifest(manifest, a);
    assert.deepEqual(r.manifest.variants.map((v) => v.lens), ['subtract', 'invert', undefined], 'match by name, then by letter');
    assert.deepEqual(r.manifest.how_might_we, ['make approving need no page change?', 'let the system approve the routine ones?']);
    assert.equal(manifest.variants[0].lens, undefined, 'the input manifest is not mutated');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
