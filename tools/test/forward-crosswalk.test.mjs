import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DSX_ROOT, loadPrinciples } from '../forward/lib/snapshot.mjs';
import {
  loadMatrix, checkCrosswalk, principlesForRule, principlesForItem, probeForRule, attributeOf, lensCheck, lawsIn,
  SEVERITY_TO_FORWARD, SEVERITY_FROM_FORWARD,
} from '../forward/lib/crosswalk.mjs';

const matrix = loadMatrix();
const principles = loadPrinciples();
const DOC = readFileSync(join(DSX_ROOT, 'docs', 'forward-compat.md'), 'utf8');

test('crosswalk: every rule of rules_index and review_rules has principles + probe, every law has principles, all ids exist in the snapshot', () => {
  const { problems } = checkCrosswalk(matrix, principles);
  assert.deepEqual(problems, []);
});

test('crosswalk: probes are English one-liners', () => {
  for (const [id, r] of [...Object.entries(matrix.rules_index), ...Object.entries(matrix.review_rules)]) {
    assert.ok(!/\n/.test(r.probe), `${id}: probe spans lines`);
    assert.ok(!/[ãõçáéíóúâêô]/i.test(r.probe), `${id}: probe is not English`);
  }
});

test('crosswalk: Nielsen heuristics H1–H10 are mapped through review_rules, unmapped ones are proposals in the doc', () => {
  for (let h = 1; h <= 10; h++) assert.ok(Array.isArray(matrix.review_rules[`H${h}`]?.principles), `H${h}`);
  assert.deepEqual(principlesForRule('H1', matrix), ['USE-1']);
  assert.deepEqual(principlesForRule('H4', matrix)[0], 'USE-3');
});

test('crosswalk: every rule or law without a principle is listed as a principle proposal in docs/forward-compat.md', () => {
  const { unmapped } = checkCrosswalk(matrix, principles);
  const section = DOC.split(/^## /m).find((s) => /^Principle proposals for Forward/.test(s)) ?? '';
  assert.ok(section, 'docs/forward-compat.md has a "Principle proposals for Forward" section');
  for (const r of unmapped.rules.filter((r) => r !== 'LAW')) assert.ok(new RegExp(`\\b${r}\\b`).test(section), `rule ${r} without principle and without proposal`);
  for (const l of unmapped.laws) assert.ok(section.includes(`\`${l}\``), `law ${l} without principle and without proposal`);
  // proposals never invent an id in a Forward family
  assert.ok(!/\b(USE|DOM|MNT|SEC|REL|PERF|COST|OBS)-(1[6-9]|[2-9]\d)\b/.test(section), 'a proposal must not invent a principle id');
});

test('crosswalk: the doc table lists every rule with its principles', () => {
  for (const [id, r] of [...Object.entries(matrix.rules_index), ...Object.entries(matrix.review_rules)]) {
    const row = DOC.split('\n').find((l) => l.startsWith(`| ${id} |`));
    assert.ok(row, `doc has no row for ${id}`);
    for (const p of r.principles) assert.ok(row.includes(p), `${id}: doc row misses ${p}`);
  }
});

test('crosswalk: item principles, LAW items cite the law they name, attributes come from the catalog', () => {
  assert.deepEqual(principlesForItem({ rule: 'T5' }, matrix), ['USE-4', 'USE-9']);
  assert.deepEqual(principlesForItem({ rule: 'F3' }, matrix), []);
  assert.deepEqual(lawsIn('violates Hick (lei de hick) and jakob', matrix).slice(0, 2), ['hick', 'jakob']);
  assert.deepEqual(principlesForItem({ rule: 'LAW', message: 'Lei de Jakob: the order differs from the platform' }, matrix), ['USE-11']);
  assert.deepEqual(principlesForItem({ rule: 'LAW', message: 'no law named' }, matrix), []);
  assert.equal(attributeOf('USE-6', principles), 'usability_accessibility');
  assert.equal(attributeOf('DOM-5', principles), 'functional_correctness');
  assert.equal(attributeOf('MNT-5', principles), 'maintainability');
  assert.match(probeForRule('X6', matrix), /verb \+ object/);
});

test('crosswalk: severity table is total over 1–4 and invertible', () => {
  assert.deepEqual(SEVERITY_TO_FORWARD, { 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' });
  for (const [n, s] of Object.entries(SEVERITY_TO_FORWARD)) assert.equal(SEVERITY_FROM_FORWARD[s], Number(n));
  assert.equal(SEVERITY_TO_FORWARD[0], undefined);
});

test('lensCheck: lenses from the gate list, duplicates warned, size enforced', () => {
  const m = { variants: [{ id: 'a', lens: 'subtract' }, { id: 'b', lens: 'subtract' }, { id: 'c', lens: 'sideways' }], how_might_we: ['one'] };
  const r = lensCheck(m, { size: 'M' });
  assert.ok(r.errors.some((e) => /"sideways"/.test(e)));
  assert.ok(r.errors.some((e) => /1 distinct lens/.test(e)));
  assert.ok(r.warnings.some((w) => /share the lens "subtract"/.test(w)));
  assert.ok(r.warnings.some((w) => /how_might_we/.test(w)));
  const ok = lensCheck({ variants: [{ id: 'a', lens: 'subtract' }, { id: 'b', lens: 'invert' }], how_might_we: ['x', 'y'] }, { size: 'M' });
  assert.deepEqual(ok.errors, []);
  assert.deepEqual(ok.warnings, []);
});

test('pattern crosswalk: DSX patterns/archetypes and Forward ui-patterns ids exist on both sides', async () => {
  const { parseToml } = await import('../forward/lib/toml-lite.mjs');
  const { readSnapshot } = await import('../forward/lib/snapshot.mjs');
  const ui = parseToml(readSnapshot('spec/references/ui-patterns.toml'));
  const fwd = { pattern: new Set(ui.pattern.map((p) => p.id)), archetype: new Set(ui.archetype.map((a) => a.id)), system: new Set(ui.system.map((s) => s.id)) };
  const c = JSON.parse(readFileSync(join(DSX_ROOT, 'data', 'forward', 'dsx-crosswalk.json'), 'utf8'));
  const dsxPatterns = new Set(JSON.parse(readFileSync(join(DSX_ROOT, 'patterns', 'index.json'), 'utf8')).map((p) => p.id));
  const dsxArch = new Set(JSON.parse(readFileSync(join(DSX_ROOT, 'archetypes', 'index.json'), 'utf8')).map((a) => a.id));
  const covered = new Set();
  for (const [section, ids] of [['patterns', dsxPatterns], ['archetypes', dsxArch]]) {
    for (const [id, e] of Object.entries(c[section])) {
      assert.ok(ids.has(id), `DSX ${section} ${id} does not exist`);
      assert.ok(['exact', 'partial', 'none'].includes(e.fit), `${id}: fit`);
      for (const ref of e.forward) {
        const [kind, fid] = ref.split(':');
        assert.ok(fwd[kind]?.has(fid), `${id}: Forward ${ref} does not exist`);
        covered.add(ref);
      }
    }
  }
  for (const p of c.forward_only.patterns) { assert.ok(fwd.pattern.has(p)); assert.ok(!covered.has(`pattern:${p}`), `${p} is mapped, not Forward-only`); }
  for (const a of c.forward_only.archetypes) { assert.ok(fwd.archetype.has(a)); assert.ok(!covered.has(`archetype:${a}`)); }
  for (const p of fwd.pattern) assert.ok(covered.has(`pattern:${p}`) || c.forward_only.patterns.includes(p), `Forward pattern ${p} neither mapped nor listed as Forward-only`);
  for (const a of fwd.archetype) assert.ok(covered.has(`archetype:${a}`) || c.forward_only.archetypes.includes(a), `Forward archetype ${a} neither mapped nor listed`);
});
