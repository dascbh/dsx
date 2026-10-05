// Capture-from-code tools: real-data guard, Stitch send plan and key handling (no network), canvas layout, journey
// page, flow validation against the code, thumbnail naming, and the capture templates' contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { compileBlocklist, blockedEntries, loadBlocklist } from '../stitch/lib/guard.mjs';
import { apiKey, redact, screenRequest, screenIdFrom, uploadHtml } from '../stitch/lib/stitch-api.mjs';
import { plan, titleOf, registryFor } from '../stitch/send.mjs';
import { journeyRows, layoutInstances, labelCard, GAP_X, WIDTH } from '../stitch/arrange-canvas.mjs';
import { renderJourneys } from '../stitch/journeys.mjs';
import { validateFlow } from '../capture/validate-flow.mjs';
import { screenIdOfCapture, thumbnailJobs } from '../capture/render.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'dsx-capture-'));
const FLOW = {
  module: 'purchasing',
  screens: [
    { id: 'orders', name: 'Orders', type: 'page', route: '/orders' },
    { id: 'order', name: 'Order', type: 'page', route: '/orders/:id' },
    { id: 'cancel-order', name: 'Cancel order', type: 'dialog' },
    { id: 'confirm', name: 'Supplier confirmation', type: 'page', route: '/confirm/:token', persona: ['supplier'] },
  ],
  transitions: [
    { id: 't1', from: 'orders', to: 'order', trigger: { type: 'row', label: 'PO-2026-0412' }, evidence: 'src/Orders.tsx:3' },
    { id: 't2', from: 'order', to: 'cancel-order', trigger: { type: 'button', label: 'Cancel order' }, evidence: 'src/Order.tsx:2' },
    { id: 't3', from: 'order', to: 'confirm', trigger: { type: 'external-link', label: 'Send to supplier' }, evidence: 'src/Order.tsx:4' },
  ],
  journeys: [
    { id: 'j1', name: 'Cancel an order', persona: 'buyer', goal: 'Stop an order that is no longer needed', steps: ['t1', 't2'], persona_switches: [] },
    { id: 'j2', name: 'Supplier confirms', persona: 'buyer', personas: ['buyer', 'supplier'], steps: ['t1', 't3'], persona_switches: [] },
  ],
};

test('guard: plain entries ignore case and accents, regex entries work, reports the entry only', () => {
  const list = ['Acme Real Corp', 'José Example', '/\\b\\d{3}-\\d{2}-\\d{4}\\b/'];
  assert.deepEqual(blockedEntries('<p>ACME real corp</p>', list), ['Acme Real Corp']);
  assert.deepEqual(blockedEntries('<p>Jose example</p>', list), ['José Example']);
  assert.deepEqual(blockedEntries('id 123-45-6789', list), ['/\\b\\d{3}-\\d{2}-\\d{4}\\b/']);
  assert.deepEqual(blockedEntries('<p>Northwind Fasteners</p>', list), []);
  assert.match(compileBlocklist(['/(/']).errors[0], /invalid blocklist regex/);
});

test('guard: blocklist comes from the project config (config file + list file), never from the DSX', () => {
  const root = tmp();
  mkdirSync(join(root, '.dsx'));
  writeFileSync(join(root, '.dsx', 'config.json'), JSON.stringify({ capture: { blocklist: ['Real Client'], 'blocklist-file': 'names.txt' } }));
  writeFileSync(join(root, '.dsx', 'names.txt'), '# people\nPat Realname\n');
  const b = loadBlocklist({ root, env: {} });
  assert.deepEqual(b.entries.filter((e) => e && !e.startsWith('#')), ['Real Client', 'Pat Realname']);
  assert.deepEqual(loadBlocklist({ root: tmp(), env: {} }).entries, []);
});

test('stitch api: key from env or ~/.claude.json, never in error messages; request shape and screen id', async () => {
  assert.equal(apiKey({ STITCH_API_KEY: 'k-env' }, tmp()), 'k-env');
  const home = tmp();
  writeFileSync(join(home, '.claude.json'), JSON.stringify({ mcpServers: { stitch: { headers: { 'X-Goog-Api-Key': 'k-file' } } } }));
  assert.equal(apiKey({}, home), 'k-file');
  assert.throws(() => apiKey({}, tmp()), (e) => /STITCH_API_KEY/.test(e.message) && !/k-file/.test(e.message));
  assert.equal(redact('bad key k-secret here', 'k-secret'), 'bad key [redacted] here');
  const req = screenRequest('<p>x</p>', '02 · Orders');
  assert.equal(Buffer.from(req.screen.htmlCode.fileContentBase64, 'base64').toString(), '<p>x</p>');
  assert.equal(req.screen.screenType, 'DOCUMENT');
  assert.equal(screenIdFrom({ screens: [{ sourceScreen: 'projects/9/screens/abc123' }] }), 'abc123');
  let seen;
  const fetchImpl = async (url, init) => { seen = { url, init }; return { ok: false, status: 403, text: async () => 'denied for k-secret' }; };
  await assert.rejects(uploadHtml('9', '<p/>', 't', { key: 'k-secret', fetchImpl }), (e) => !e.message.includes('k-secret') && /403/.test(e.message));
  assert.equal(seen.init.headers['X-Goog-Api-Key'], 'k-secret');
  assert.match(seen.url, /\/projects\/9\/screens:batchCreate$/);
});

test('send: plan skips recorded ids, flags missing files and blocked captures; titles and registry location', () => {
  const dir = tmp();
  writeFileSync(join(dir, '02-orders.html'), '<p>Northwind</p>');
  writeFileSync(join(dir, '03-order.html'), '<p>Acme Real Corp</p>');
  const order = [{ nn: '01', id: 'home', name: 'Home', route: '/' }, { nn: '02', id: 'orders', name: 'Orders', route: '/orders' }, { nn: '03', id: 'order', name: 'Order' }, { nn: '04', id: 'gone', name: 'Gone' }];
  const p = plan(order, { dir, registry: { home: { screen: 's1' } }, blocklist: ['Acme Real Corp'] });
  assert.deepEqual(p.map((x) => x.status), ['skip', 'send', 'blocked', 'missing']);
  assert.equal(p[1].title, '02 · Orders · /orders');
  assert.equal(titleOf({ nn: '03', name: 'Order' }), '03 · Order');
  assert.equal(registryFor('/p/.dsx/captures/m'), '/p/.dsx/captures/m/stitch-screens.json');
  assert.equal(registryFor('/p/.stitch/m/code'), '/p/.stitch/m/stitch-screens.json', 'legacy layout keeps its registry');
});

test('send CLI: a blocked capture exits 3 without network; dry run lists the plan', () => {
  const root = tmp();
  mkdirSync(join(root, '.dsx'));
  writeFileSync(join(root, '.dsx', 'config.json'), JSON.stringify({ capture: { blocklist: ['Acme Real Corp'] } }));
  writeFileSync(join(root, 'a.html'), '<p>Acme Real Corp</p>');
  writeFileSync(join(root, 'b.html'), '<p>Northwind</p>');
  const env = { ...process.env, DSX_CONFIG: '', STITCH_API_KEY: 'k-never-printed' };
  const blocked = spawnSync(process.execPath, ['tools/stitch/send.mjs', 'p1', join(root, 'a.html'), '--root', root], { encoding: 'utf8', env });
  assert.equal(blocked.status, 3);
  assert.match(blocked.stderr, /REFUSED a\.html: matches blocklist entry "Acme Real Corp"/);
  const dry = spawnSync(process.execPath, ['tools/stitch/send.mjs', 'p1', join(root, 'b.html'), '--root', root, '--dry-run', '--title', '02 · Orders'], { encoding: 'utf8', env });
  assert.equal(dry.status, 0);
  assert.match(dry.stdout, /send\s+b\.html {2}"02 · Orders"/);
  assert.ok(!(blocked.stdout + blocked.stderr + dry.stdout + dry.stderr).includes('k-never-printed'));
});

test('arrange: one row per journey in visit order, outside row, instances laid out without piling up', () => {
  const registry = { orders: { nn: '02', screen: 'S2' }, order: { nn: '03', screen: 'S3' }, 'cancel-order': { nn: '05', screen: 'S5' }, confirm: { nn: '09', screen: 'S9' }, extra: { nn: '20', screen: 'S20' }, 'label:j1': { screen: 'L1' } };
  const rows = journeyRows(FLOW, registry);
  assert.deepEqual(rows.map((r) => r.screens), [['orders', 'order', 'cancel-order'], ['orders', 'order', 'confirm'], ['extra']]);
  assert.equal(rows[0].eyebrow, 'Journey · buyer');
  const inst = layoutInstances(rows, registry, { project: 'p', sizes: { S2: { width: 1440, height: 2000 } } });
  const row0 = inst.filter((i) => i.y === 0);
  assert.deepEqual(row0.map((i) => i.sourceScreen.split('/').pop()), ['L1', 'S2', 'S3', 'S5']);
  assert.equal(row0[1].x, WIDTH + GAP_X);
  const repeated = inst.filter((i) => i.sourceScreen.endsWith('/S2'));
  assert.equal(repeated.length, 2);
  assert.notEqual(repeated[0].id, repeated[1].id, 'a screen in two journeys gets two instances');
  assert.ok(inst.find((i) => i.sourceScreen.endsWith('/S3') && i.y > 0).y >= 2000, 'next row starts below the tallest screen');
  assert.match(labelCard({ title: 'Cancel <order>', lines: ['x'] }), /Cancel &lt;order&gt;/);
});

test('arrange: comparison rows align columns to the widest screen', () => {
  const registry = { a: { screen: 'A' }, b: { screen: 'B' } };
  const rows = [{ id: null, screens: ['a', 'b'] }, { id: null, screens: [{ screen: 'X' }, { screen: 'Y' }] }];
  const inst = layoutInstances(rows, registry, { project: 'p', sizes: { X: { width: 1900, height: 900 } }, align: true });
  assert.equal(inst.find((i) => i.sourceScreen.endsWith('/B')).x, 1900 + GAP_X);
});

test('journeys page: neutral template, data embedded safely, legacy map keys accepted', () => {
  const html = renderJourneys({ ...FLOW, journeys: [{ ...FLOW.journeys[0], name: 'Cancel </script><b>x' }] }, { thumbnails: { orders: 'data:image/png;base64,AA==' }, validated: true });
  assert.match(html, /Journey map · module purchasing/);
  assert.ok(!html.includes('</script><b>'), 'no script break-out from data');
  assert.ok(html.includes('data:image/png;base64,AA=='));
  const legacy = renderJourneys({ telas: [{ id: 'a', nome: 'A', tipo: 'pagina' }], transicoes: [], jornadas: [] });
  assert.match(legacy, /"screens":\[\{"id":"a","name":"A","type":"page"\}\]/);
  const tpl = readFileSync('templates/capture/journeys.html', 'utf8');
  assert.ok(!/lawyer|curator|advogad|curador/i.test(tpl), 'personas are generic, colored by order of appearance');
});

test('validate-flow: evidence must exist and contain the label or a navigation signal; chains need persona switches', () => {
  const root = tmp();
  mkdirSync(join(root, 'src'));
  writeFileSync(join(root, 'src', 'Orders.tsx'), 'export default () => (\n  <Table>\n    <Row onClick={() => navigate(`/orders/${id}`)} />\n  </Table>\n);\n');
  writeFileSync(join(root, 'src', 'Order.tsx'), 'x\n<Button>Cancel order</Button>\nx\n<a href={link}>Send to supplier</a>\n');
  const ok = validateFlow(FLOW, { root });
  assert.equal(ok.ok, true, ok.failures.join('\n'));
  assert.equal(ok.checked, 3);
  const bad = validateFlow({ ...FLOW, transitions: [...FLOW.transitions, { id: 't4', from: 'cancel-order', to: 'nowhere', trigger: { type: 'button', label: 'Keep' }, evidence: 'src/Order.tsx:99' }],
    journeys: [{ id: 'j3', name: 'Broken', steps: ['t2', 't1'], persona_switches: [] }] }, { root });
  assert.ok(bad.failures.some((f) => /t4: to="nowhere" is not a screen/.test(f)));
  assert.ok(bad.failures.some((f) => /t4: line 99 outside/.test(f)));
  assert.ok(bad.failures.some((f) => /j3: step 1 breaks the chain/.test(f)));
  assert.equal(validateFlow({ ...FLOW, journeys: [{ id: 'j3', steps: ['t2', 't1'], persona_switches: [1] }] }, { root }).ok, true);
});

test('render helpers: thumbnails only for main captures, named by screen id', () => {
  const dir = tmp();
  for (const f of ['02-orders.html', '02-orders.empty.html', '05-cancel-order.html', 'notes.html', 'orders.thumb.png']) writeFileSync(join(dir, f), '');
  assert.equal(screenIdOfCapture('02-orders.html'), 'orders');
  assert.equal(screenIdOfCapture('02-orders.empty.html'), null);
  assert.deepEqual(thumbnailJobs(dir).map((j) => j.output.split('/').pop()), ['orders.thumb.png', 'cancel-order.thumb.png']);
});

test('capture templates: contract names, guard env var, naming helper, no product-specific content', () => {
  const files = ['serialize.ts', 'environment.tsx', 'orders.capture.test.tsx', 'orders.data.ts', 'states.capture.test.tsx', 'vitest.capture.config.ts', 'journeys.html'];
  for (const f of files) assert.ok(existsSync(join('templates', 'capture', f)), f);
  const ser = readFileSync('templates/capture/serialize.ts', 'utf8');
  for (const fn of ['export function saveCapture', 'export function captureName', 'copyFieldValues', 'releaseHeight', 'expandDialog', 'inlineImages', 'cssOf']) assert.ok(ser.includes(fn), fn);
  const env = readFileSync('templates/capture/environment.tsx', 'utf8');
  assert.match(env, /process\.env\.DSX_CAPTURE === '1'/);
  assert.match(env, /export function assertAllRoutesSimulated/);
  for (const f of files.filter((x) => x.endsWith('.test.tsx'))) assert.match(readFileSync(join('templates', 'capture', f), 'utf8'), /it\.runIf\(CAPTURE\)/, f);
  const all = files.map((f) => readFileSync(join('templates', 'capture', f), 'utf8')).join('\n');
  assert.ok(!/frontend\/src|backend\/|\.stitch\//.test(all), 'no fixed project folders in the templates');
});
