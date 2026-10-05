import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import {
  SNAPSHOT_FILES, SNAPSHOT_DIR, readVersion, loadPrinciples, loadAttributes, loadDivergenceRules, loadFindingsTemplate, readSnapshot,
} from '../forward/lib/snapshot.mjs';
import { checkIntegrity, compareWith, syncFrom, lineDiff } from '../forward/sync.mjs';
import { parseToml } from '../forward/lib/toml-lite.mjs';

test('snapshot: every listed file is present and matches VERSION (no hand edits)', () => {
  assert.deepEqual(checkIntegrity(), []);
  const v = readVersion();
  assert.match(v.forward_version, /^\d+\.\d+\.\d+$/);
  assert.match(v.forward_commit, /^[0-9a-f]{40}$|^unknown$/);
});

test('snapshot: the TOML files parse with toml-lite', () => {
  for (const { path } of SNAPSHOT_FILES.filter((f) => f.path.endsWith('.toml') && !f.path.includes('template'))) {
    assert.doesNotThrow(() => parseToml(readSnapshot(path)), path);
  }
});

test('snapshot: principle catalog has the USE and DOM families and one attribute per id', () => {
  const p = loadPrinciples();
  for (const id of ['USE-1', 'USE-10', 'USE-15', 'DOM-1', 'DOM-7', 'MNT-5']) assert.ok(p.has(id), id);
  assert.equal(p.get('USE-3').attribute, 'usability_accessibility');
  assert.equal(p.get('DOM-1').attribute, 'functional_correctness');
  assert.ok(loadAttributes().get('usability_accessibility').probes.length > 0);
});

test('snapshot: divergence lenses and sizes come from the gate source', () => {
  const r = loadDivergenceRules();
  assert.deepEqual(r.lenses, ['subtract', 'invert', 'analogous', 'constraint-first', 'object-first']);
  assert.deepEqual(r.required, { m: 2, l: 3 });
});

test('snapshot: findings template keys and severities', () => {
  const t = loadFindingsTemplate();
  for (const k of ['demand_id', 'kind', 'context_policy', 'isolation_mode', 'rounds_planned']) assert.ok(t.meta.includes(k), k);
  for (const k of ['attribute', 'severity', 'probe', 'principle', 'evidence', 'blocking', 'backlog', 'fixed_in']) assert.ok(t.finding.includes(k), k);
  assert.deepEqual(t.severities, ['critical', 'high', 'medium', 'low']);
  assert.deepEqual(t.kinds, ['code', 'adversarial', 'plan', 'cycle']);
});

function fakeForward() {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-fwd-'));
  for (const { path } of SNAPSHOT_FILES) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), readFileSync(join(SNAPSHOT_DIR, path)));
  }
  mkdirSync(join(dir, '.claude-plugin'));
  writeFileSync(join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'forward', version: '9.9.9' }));
  return dir;
}

test('sync: --from a checkout copies, records the version and the diff; --check catches hand edits and divergence', () => {
  const fwd = fakeForward();
  const snap = mkdtempSync(join(tmpdir(), 'dsx-snap-'));
  try {
    let r = syncFrom(fwd, { dir: snap, now: new Date('2026-10-05T00:00:00Z') });
    assert.ok(r.written);
    assert.equal(r.changes.length, SNAPSHOT_FILES.length);          // all new
    assert.deepEqual(checkIntegrity(snap), []);
    assert.equal(readVersion(snap).forward_version, '9.9.9');
    assert.deepEqual(compareWith(fwd, snap), []);
    // Forward moves: divergence is reported, then a re-sync clears it with a diff
    const qa = join(fwd, 'spec/dimensions/quality-attributes.toml');
    writeFileSync(qa, readFileSync(qa, 'utf8').replace('USE-1 status visible', 'USE-1 status always visible'));
    const diverge = compareWith(fwd, snap);
    assert.equal(diverge.length, 1);
    assert.equal(diverge[0].diff.added, 1);
    assert.equal(diverge[0].diff.removed, 1);
    r = syncFrom(fwd, { dir: snap });
    assert.equal(r.changes.length, 1);
    assert.deepEqual(compareWith(fwd, snap), []);
    // a hand edit in the snapshot is caught by the checksum
    writeFileSync(join(snap, 'spec/roles.toml'), readFileSync(join(snap, 'spec/roles.toml'), 'utf8') + '\n# local edit\n');
    assert.ok(checkIntegrity(snap).some((p) => /roles\.toml: edited by hand/.test(p)));
    // not a Forward checkout
    rmSync(join(fwd, 'bin'), { recursive: true });
    assert.throws(() => syncFrom(fwd, { dir: snap }), /not a Forward checkout/);
  } finally { rmSync(fwd, { recursive: true, force: true }); rmSync(snap, { recursive: true, force: true }); }
});

test('sync: line diff marks additions and removals', () => {
  const d = lineDiff('a\nb\nc', 'a\nB\nc\nd');
  assert.equal(d.added, 2);
  assert.equal(d.removed, 1);
  assert.ok(d.lines.includes('- b') && d.lines.includes('+ B') && d.lines.includes('+ d'));
});

test('sync: snapshot equals the Forward checkout when one is available (skipped otherwise)', (t) => {
  const from = process.env.DSX_FORWARD_ROOT || join(SNAPSHOT_DIR, '..', '..', '..', 'forward');
  if (!existsSync(join(from, 'spec', 'dimensions', 'quality-attributes.toml'))) return t.skip('no Forward checkout (set DSX_FORWARD_ROOT)');
  const v = readVersion();
  const plugin = join(from, '.claude-plugin', 'plugin.json');
  const version = existsSync(plugin) ? JSON.parse(readFileSync(plugin, 'utf8')).version : null;
  if (version && version !== v.forward_version) return t.skip(`Forward checkout is ${version}, snapshot is ${v.forward_version}: run sync --from`);
  assert.deepEqual(compareWith(from).map((c) => c.path), []);
});
