import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { DSX_ROOT, loadFindingsTemplate } from '../forward/lib/snapshot.mjs';
import { parseToml } from '../forward/lib/toml-lite.mjs';
import { registryToReview, renderReviewToml, reviewToItems } from '../forward/lib/findings-toml.mjs';
import { renderAlternatives, checkAlternatives, parseAlternatives } from '../forward/lib/alternatives.mjs';
import { readUxMd, renderProductMd, glossaryRows } from '../forward/lib/product-md.mjs';
import { exportFindings, exportVariations, exportUxMd, parsePairs } from '../forward/export.mjs';
import { glossaryFromMarkdown } from '../ux-lint/lib/glossary.mjs';

// Neutral fixture: a purchase-orders app.
const item = (id, rule, severity, status = 'open', extra = {}) => ({
  id, family: { X: 'text', T: 'screen', F: 'flow', L: 'layout', S: 'states', C: 'consistency' }[rule[0]] ?? 'text', rule, severity,
  element: null, text: `text of ${id}`, variants: [], screens: ['orders-list'], source: ['src/pages/OrdersPage.tsx:42'],
  message: `message of ${id}`, origin: 'detector', first_seen: '2026-10-01', last_seen: '2026-10-05', present: status !== 'fixed', status, ...extra,
});
const REGISTRY = {
  module: 'orders', updated: '2026-10-05', runs: [{ at: '2026-10-05T10:00:00Z', sources: ['text', 'screen', 'flow'], commit: 'abc1234' }],
  items: [
    item('s-00000001', 'T5', 3),                                   // high, USE-4
    item('s-00000002', 'T1', 3),                                   // high, USE-8
    item('t-00000003', 'X6', 1),                                   // low
    item('f-00000004', 'F3', 2),                                   // no principle → probe only
    item('l-00000005', 'L8', 2, 'regression'),
    item('t-00000006', 'X3', 2, 'fixed'),                          // filtered out by status
    item('t-00000007', 'X1', 2, 'accepted-deviation'),             // filtered out
    item('t-00000008', 'H7', 2, 'open', { origin: 'review', family: 'text' }),  // judgment rule without principle → skipped
    item('t-00000009', 'LAW', 2, 'open', { origin: 'review', message: 'Lei de Hick: seven equal choices in the toolbar' }),
    item('t-00000010', 'desc', 4, 'open', { origin: 'review' }),   // critical, USE-9
    item('t-00000011', 'X2', 0),                                   // severity 0
    item('c-00000012', 'C1', 2, 'decided'),
  ],
};

test('findings export: severity map, statuses, principle/probe per item, cap with notes', () => {
  const r = registryToReview(REGISTRY, { demandId: 'ORD-12', maxFindings: 3 });
  const all = [...r.findings.map((f) => f.id), ...r.notes.map((n) => n.split(' ')[0])];
  assert.ok(!all.includes('t-00000006') && !all.includes('t-00000007'), 'fixed and accepted-deviation are not exported by default');
  assert.deepEqual(r.findings.map((f) => [f.id, f.severity]), [['t-00000010', 'critical'], ['s-00000001', 'high'], ['s-00000002', 'high']]);
  assert.equal(r.findings[0].principle, 'USE-9');
  assert.equal(r.findings[0].probe, undefined, 'a review rule cites a principle, not a probe');
  assert.equal(r.findings[1].principle, 'USE-4');
  assert.match(r.findings[1].probe, /^T5: /);
  assert.equal(r.notes.length, 5);                                 // F3, L8, LAW, C1, X6 beyond the cap of 3
  assert.ok(r.notes.some((n) => /^f-00000004 medium F3:/.test(n)), 'F3 has no principle: the note cites its probe');
  assert.ok(r.notes.some((n) => /^t-00000009 medium USE-8:/.test(n)), 'LAW cites the principle of the law it names');
  assert.deepEqual(r.skipped.map((s) => s.id).sort(), ['t-00000008', 't-00000011']);
  assert.equal(r.meta.commit, 'abc1234');
  assert.equal(r.meta.context_policy, 'artifact_only');
});

test('findings export: blocking only for critical/high tied to a declared criterion; backlog only medium+', () => {
  const r = registryToReview(REGISTRY, { demandId: 'ORD-12', maxFindings: 20, criteria: { 's-00000001': 'C2', X6: 'C3', 'l-00000005': 'C4' } });
  const by = Object.fromEntries(r.findings.map((f) => [f.id, f]));
  assert.equal(by['s-00000001'].blocking, true);
  assert.match(by['s-00000001'].evidence, /Breaks declared criterion C2/);
  assert.equal(by['t-00000003'].blocking, false, 'low severity never blocks');
  assert.equal(by['l-00000005'].blocking, false, 'medium never blocks');
  assert.match(by['l-00000005'].evidence, /cannot block/);
  assert.equal(by['s-00000002'].blocking, false, 'no declared criterion, no blocking');
  assert.equal(by['t-00000003'].backlog, false, 'a low finding is never a backlog line');
  assert.equal(by['s-00000002'].backlog, true);
  assert.equal(r.findings[0].id, 's-00000001', 'blocking findings come first');
});

test('findings export: TOML follows the template keys and reads back, with a round trip through the importer', () => {
  const r = registryToReview(REGISTRY, { demandId: 'ORD-12', minSeverity: 2 });
  const text = renderReviewToml(r);
  const t = loadFindingsTemplate();
  const parsed = parseToml(text);
  for (const k of Object.keys(parsed.meta)) assert.ok(t.meta.includes(k) || ['round', 'commit', 'probed', 'notes'].includes(k), `meta key ${k} not in the template`);
  for (const f of parsed.finding) {
    for (const k of Object.keys(f)) assert.ok(t.finding.includes(k) || k === 'id', `finding key ${k} not in the template`);
    assert.ok(t.severities.includes(f.severity));
    assert.ok(f.probe || f.principle, 'I8: probe or principle');
  }
  assert.ok(parsed.finding.every((f) => f.severity !== 'low'), 'min-severity 2 drops low');
  const items = reviewToItems(parsed, { file: 'reviews/ORD-12/findings.toml' });
  assert.equal(items.length, parsed.finding.length);
  const back = items.find((i) => i.id === 's-00000001');
  assert.equal(back.rule, 'T5');
  assert.equal(back.family, 'screen');
  assert.equal(back.severity, 3);
  assert.equal(back.origin, 'forward');
  assert.equal(back.forward.principle, 'USE-4');
});

test('importer: a hand-written Forward finding becomes a DSX item; fixed_in means fixed', () => {
  const items = reviewToItems(parseToml(`
[meta]
demand_id = "ORD-3"
kind = "code"
context_policy = "artifact_only"
[[finding]]
id = "F1"
attribute = "usability_accessibility"
severity = "medium"
principle = "USE-3"
evidence = "The filter is 'Period' on the list and 'Range' on the report."
blocking = false
backlog = true
[[finding]]
id = "F2"
attribute = "security_privacy"
severity = "high"
probe = "missing authorization on a non-obvious path"
evidence = "GET /orders/:id answers for another supplier."
blocking = true
fixed_in = "deadbee"
`));
  assert.deepEqual(items.map((i) => [i.id, i.rule, i.severity, i.status, i.family]), [
    ['ORD-3/F1', 'USE-3', 2, 'open', 'review'], ['ORD-3/F2', 'probe', 3, 'fixed', 'review'],
  ]);
});

// ---------- alternatives ----------

const MANIFEST = {
  format: 1, module: 'orders', flow: 'approve', title: 'Approve purchase orders', persona: 'Buyer, desktop, daily', task: 'Approve the orders waiting for me',
  how_might_we: ['make approving one order need no page change?', 'HMW let the system approve the routine ones?'],
  current: { id: 'current', name: 'Today', cost: 'Three pages per order.', frames: [], metrics: { steps: 3 } },
  variants: [
    { id: 'a', name: 'Inline approve', lens: 'subtract', hypothesis: 'Removing the detail page removes two steps.', cost: 'Less context.', tradeoffs: ['No room for notes.'], changes: {}, frames: [] },
    { id: 'b', name: 'Auto-approve under limit', lens: 'invert', hypothesis: 'The system approves routine orders.', cost: 'Needs a policy.', tradeoffs: ['Harder to audit.'], changes: {}, frames: [] },
    { id: 'c', name: 'Supplier board', lens: 'object-first', hypothesis: 'Grouping by supplier speeds batches.', cost: 'New page.', tradeoffs: [], changes: {}, frames: [] },
  ],
};

test('alternatives export: the rendered file passes the divergence checks at M and L; discards carry Traded', () => {
  const r = renderAlternatives(MANIFEST, { mode: 'variant', variant: 'a', comment: 'fewest steps', by: 'owner', at: '2026-10-05' });
  assert.deepEqual(r.problems, []);
  assert.deepEqual(checkAlternatives(r.text, 2), []);
  assert.deepEqual(checkAlternatives(r.text, 3), []);
  assert.match(r.text, /^Chose: A — fewest steps \(decided by owner, 2026-10-05\)$/m);
  assert.equal((r.text.match(/^Traded: /gm) ?? []).length, 2);
  assert.match(r.text, /^- HMW make approving one order/m);
  const p = parseAlternatives(r.text);
  assert.deepEqual(p.alternatives.map((a) => a.lens), ['subtract', 'invert', 'object-first']);
  assert.equal(p.how_might_we.length, 2);
  assert.match(p.chose, /^A/);
});

test('alternatives export: composition, missing lens, shared lens and missing decision are reported', () => {
  const compose = renderAlternatives(MANIFEST, { mode: 'compose', compose: { screen: 'a', flow: 'b', behavior: 'a', text: 'current' }, at: '2026-10-05' });
  assert.match(compose.text, /^Chose: A — a composition — screen from a, flow from b, behavior from a, text from current/m);
  assert.equal((compose.text.match(/^Traded: /gm) ?? []).length, 2);
  assert.deepEqual(checkAlternatives(compose.text, 3), []);
  const noLens = structuredClone(MANIFEST); delete noLens.variants[1].lens; noLens.variants[2].lens = 'subtract';
  const r = renderAlternatives(noLens, null, { hmw: ['only one'] });
  assert.ok(r.problems.some((p) => /"b" has no lens/.test(p)));
  assert.ok(r.problems.some((p) => /no convergence/.test(p)));
  assert.ok(r.problems.some((p) => /1 "How might we"/.test(p)));
  const breaches = checkAlternatives(r.text, 2);
  assert.ok(breaches.some((b) => /1 distinct lens/.test(b)));
  assert.ok(breaches.some((b) => /How might we/.test(b)));
  assert.deepEqual(parsePairs('a=subtract, b = invert'), { a: 'subtract', b: 'invert' });
});

// ---------- ux-md ----------

test('ux-md export: product, register, glossary with deny-list (readable back by the DSX glossary reader), deviations, gaps', () => {
  const ux = readUxMd(join(DSX_ROOT, 'examples', 'UX.md'));
  const md = renderProductMd(ux, { source: 'UX.md', now: new Date('2026-10-05') });
  assert.match(md, /^## Register$/m);
  assert.match(md, new RegExp(ux.product.register));
  assert.match(md, /^## Declared deviations/m);
  for (const d of ux.deviations) assert.ok(md.includes(`| ${d.id} |`), d.id);
  assert.match(md, /^## Not in UX\.md/m);
  const glossaryTable = '| Term | Meaning | Gender | Deny-list |\n|---|---|---|---|\n| Purchase order | A commitment to buy | — | "order slip", "ticket" |\n';
  assert.deepEqual(glossaryRows(glossaryTable), [{ term: 'Purchase order', meaning: 'A commitment to buy', gender: '', avoid: ["order slip", "ticket"] }]);
  assert.deepEqual(glossaryFromMarkdown(glossaryTable), [{ term: 'Purchase order', avoid: ["order slip", "ticket"] }], 'the exported table is what content.glossary: design/product.md reads');
});

// ---------- CLI paths and the Forward gate ----------

function forwardRoot() {
  const c = process.env.DSX_FORWARD_ROOT || join(DSX_ROOT, '..', 'forward');
  return existsSync(join(c, 'bin', 'fde', 'verify.py')) && existsSync(join(c, 'spec', 'invariants.toml')) ? c : null;
}

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-fwd-proj-'));
  writeFileSync(join(dir, 'registry.json'), JSON.stringify(REGISTRY));
  writeFileSync(join(dir, 'variations.json'), JSON.stringify(MANIFEST));
  writeFileSync(join(dir, 'decision.json'), JSON.stringify({ format: 1, module: 'orders', flow: 'approve', mode: 'variant', variant: 'b', comment: '', by: 'owner', at: '2026-10-05' }));
  return dir;
}

test('export CLI functions write at Forward paths and never overwrite a review record without force', () => {
  const dir = project();
  try {
    const f = exportFindings({ 'from-registry': join(dir, 'registry.json'), id: 'ORD-12', out: dir });
    assert.ok(f.written);
    assert.ok(existsSync(join(dir, 'reviews', 'ORD-12', 'findings.toml')));
    assert.equal(parseToml(readFileSync(f.file, 'utf8')).finding.length, 5, 'default cap is 5');
    writeFileSync(join(dir, 'fde.config.toml'), '[review]\nmax_findings = 2\n');
    const again = exportFindings({ 'from-registry': join(dir, 'registry.json'), id: 'ORD-12', out: dir });
    assert.equal(again.exists, true);
    assert.equal(again.written, false);
    const forced = exportFindings({ 'from-registry': join(dir, 'registry.json'), id: 'ORD-12', out: dir, force: true });
    assert.equal(parseToml(readFileSync(forced.file, 'utf8')).finding.length, 2, 'cap read from [review] max_findings');
    const v = exportVariations({ manifest: join(dir, 'variations.json'), id: 'ORD-12', out: dir });
    assert.ok(v.written);
    assert.ok(existsSync(join(dir, 'specs', 'ORD-12', 'design', 'alternatives.md')));
    const blocked = exportVariations({ manifest: join(dir, 'variations.json'), id: 'ORD-13', out: dir, decision: join(dir, 'missing.json') });
    assert.equal(blocked.blocked, true);
    assert.equal(existsSync(join(dir, 'specs', 'ORD-13')), false);
    const u = exportUxMd({ ux: join(DSX_ROOT, 'examples', 'UX.md'), out: dir });
    assert.ok(u.written);
    const u2 = exportUxMd({ ux: join(DSX_ROOT, 'examples', 'UX.md'), out: dir });
    assert.equal(u2.exists, true, 'an authored design/product.md is never overwritten');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Forward gate: exported findings.toml and alternatives.md pass verify.py (skipped without a Forward checkout)', (t) => {
  const fwd = forwardRoot();
  if (!fwd) return t.skip('no Forward checkout (set DSX_FORWARD_ROOT)');
  const py = spawnSync('python3', ['-c', 'import tomllib'], { encoding: 'utf8' });
  if (py.status !== 0) return t.skip('python3 with tomllib (3.11+) not available');
  const dir = project();
  try {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    cpSync(join(fwd, 'spec'), join(dir, '.fde', 'spec'), { recursive: true });
    cpSync(join(fwd, 'fde.config.toml'), join(dir, 'fde.config.toml'));
    exportFindings({ 'from-registry': join(dir, 'registry.json'), id: 'ORD-12', out: dir });
    exportVariations({ manifest: join(dir, 'variations.json'), id: 'ORD-12', out: dir });
    mkdirSync(join(dir, 'specs', 'ORD-12'), { recursive: true });
    writeFileSync(join(dir, 'specs', 'ORD-12', 'spec.md'), '# ORD-12\n\nTriage: **L**\n');
    const gate = (g) => spawnSync('python3', [join(fwd, 'bin', 'fde', 'verify.py'), '--gate', g], { cwd: dir, encoding: 'utf8' });
    for (const g of ['finding-discipline', 'adversarial-isolation', 'divergence']) {
      const r = gate(g);
      assert.equal(r.status, 0, `${g}: ${r.stdout}${r.stderr}`);
    }
    // the JS check and the gate agree on a broken file
    const alt = join(dir, 'specs', 'ORD-12', 'design', 'alternatives.md');
    writeFileSync(alt, readFileSync(alt, 'utf8').replace(/^Lens: invert$/m, 'Lens: subtract').replace(/^Chose: .*$/m, ''));
    const r = gate('divergence');
    assert.notEqual(r.status, 0);
    const js = checkAlternatives(readFileSync(alt, 'utf8'), 3);
    assert.ok(js.some((b) => /2 distinct lens/.test(b)) && /2 distinct lens/.test(r.stdout));
    assert.ok(js.some((b) => /Chose/.test(b)) && /Chose/.test(r.stdout));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
