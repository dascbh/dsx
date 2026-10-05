// Project paths and component-kit profiles: precedence (flag > config file > UX.md `paths` > default), legacy
// capture folders read with a warning, stack detection of code folders, and kit selectors chosen in the UX.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveProjectPaths, detectCodeDirs, PATH_DEFAULTS, PATH_KEYS } from '../ux-lint/lib/project-paths.mjs';
import { kitProfile, KIT_IDS, KITS } from '../ux-lint/lib/kits.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';
import { resolveOptions } from '../ux-lint/audit.mjs';
import { lintUxMd } from '../lint-ux-md.mjs';
import { analyzeScreen } from '../ux-lint/screen.mjs';
import { readFileSync } from 'node:fs';

const NO_ENV = {};
const tmp = () => mkdtempSync(join(tmpdir(), 'dsx-paths-'));
const touch = (p, body = '<!doctype html><html><body><main><h1>x</h1></main></body></html>') => { mkdirSync(join(p, '..'), { recursive: true }); writeFileSync(p, body); };

test('defaults are generic and module-scoped; nothing names a product or a back-end folder', () => {
  const root = tmp();
  const p = resolveProjectPaths({ root, module: 'orders', env: NO_ENV });
  assert.equal(p.captures, join(root, '.dsx', 'captures', 'orders'));
  assert.equal(p.geometry, join(root, '.dsx', 'captures', 'orders', 'geometry'));
  assert.equal(p.map, join(root, '.dsx', 'maps', 'flows-orders.json'));
  assert.equal(p.findings, join(root, '.dsx', 'findings'));
  assert.equal(p.variations, join(root, '.dsx', 'variations'));
  assert.equal(p.ux, join(root, 'UX.md'));
  assert.deepEqual(p.code, []);
  assert.deepEqual(p.warnings, []);
  assert.ok(!JSON.stringify(PATH_DEFAULTS).includes('backend'));
  assert.deepEqual([...PATH_KEYS].sort(), ['captures', 'code', 'findings', 'geometry', 'map', 'ux', 'variations']);
});

test('precedence: flag > config file > UX.md paths > default; <module> is filled', () => {
  const root = tmp();
  writeFileSync(join(root, 'UX.md'), '---\nversion: 1.0.0\nname: P\npaths:\n  captures: ui-captures/<module>\n  map: maps/<module>.json\n  code: [web/src]\n---\n');
  mkdirSync(join(root, 'web', 'src'), { recursive: true });
  let p = resolveProjectPaths({ root, module: 'orders', env: NO_ENV });
  assert.equal(p.captures, join(root, 'ui-captures', 'orders'));
  assert.equal(p.sources.captures, 'ux');
  assert.deepEqual(p.code, [join(root, 'web', 'src')]);
  mkdirSync(join(root, '.dsx'), { recursive: true });
  writeFileSync(join(root, '.dsx', 'config.json'), JSON.stringify({ paths: { captures: 'shots/{module}' } }));
  p = resolveProjectPaths({ root, module: 'orders', env: NO_ENV });
  assert.equal(p.captures, join(root, 'shots', 'orders'));
  assert.equal(p.sources.captures, 'config');
  assert.equal(p.map, join(root, 'maps', 'orders.json'), 'keys absent from the config still come from the UX.md');
  p = resolveProjectPaths({ root, module: 'orders', env: NO_ENV, flags: { screens: 'x/y' } });
  assert.equal(p.captures, join(root, 'x', 'y'));
  assert.equal(p.sources.captures, 'flag');
});

test('explicit --config and $DSX_CONFIG point outside the project (read-only audits)', () => {
  const root = tmp();
  const outside = join(tmp(), 'cfg.json');
  writeFileSync(outside, JSON.stringify({ paths: { captures: 'legacy/<module>/code', code: ['web/src', 'server/strings'] } }));
  mkdirSync(join(root, 'web', 'src'), { recursive: true });
  mkdirSync(join(root, 'server', 'strings'), { recursive: true });
  const a = resolveProjectPaths({ root, module: 'm', config: outside, env: NO_ENV });
  assert.equal(a.captures, join(root, 'legacy', 'm', 'code'));
  assert.deepEqual(a.code, [join(root, 'web', 'src'), join(root, 'server', 'strings')]);
  assert.equal(a.configFile, outside);
  const b = resolveProjectPaths({ root, module: 'm', env: { DSX_CONFIG: outside } });
  assert.equal(b.captures, a.captures);
  const o = resolveOptions({ root, module: 'm', config: outside });
  assert.equal(o.screens, a.captures, 'audit uses the same resolver');
});

test('legacy .stitch/<m>/code is read with a warning when the generic folder is empty; geometry follows', () => {
  const root = tmp();
  touch(join(root, '.stitch', 'orders', 'code', '01-list.html'));
  const p = resolveProjectPaths({ root, module: 'orders', env: NO_ENV });
  assert.equal(p.captures, join(root, '.stitch', 'orders', 'code'));
  assert.equal(p.geometry, join(root, '.stitch', 'orders', 'geometry'));
  assert.equal(p.sources.captures, 'legacy');
  assert.ok(p.warnings.some((w) => /legacy capture folder/.test(w) && w.includes('.dsx/captures/orders')));
  touch(join(root, '.dsx', 'captures', 'orders', '01-list.html'));
  const q = resolveProjectPaths({ root, module: 'orders', env: NO_ENV });
  assert.equal(q.sources.captures, 'default');
  assert.deepEqual(q.warnings, []);
});

test('code folders detected from the stack: front-end folder, monorepo apps, plain src', () => {
  const a = tmp();
  writeFileSync(join(a, 'package.json'), '{}');
  mkdirSync(join(a, 'src'));
  assert.deepEqual(detectCodeDirs(a), [join(a, 'src')]);
  const b = tmp();
  mkdirSync(join(b, 'frontend', 'src'), { recursive: true });
  writeFileSync(join(b, 'frontend', 'package.json'), '{}');
  mkdirSync(join(b, 'backend', 'shared'), { recursive: true });
  assert.deepEqual(detectCodeDirs(b), [join(b, 'frontend', 'src')], 'a back-end folder is never assumed');
  const c = tmp();
  for (const app of ['admin', 'shop']) { mkdirSync(join(c, 'apps', app, 'app'), { recursive: true }); writeFileSync(join(c, 'apps', app, 'package.json'), '{}'); }
  assert.deepEqual(detectCodeDirs(c), [join(c, 'apps', 'admin', 'app'), join(c, 'apps', 'shop', 'app')]);
});

test('kits: auto is the union (MUI behavior preserved), a chosen kit narrows, explicit selectors win', () => {
  assert.deepEqual(KIT_IDS, ['auto', 'generic', 'mui', 'shadcn', 'chakra', 'antd', 'bootstrap']);
  const auto = configFrom({});
  assert.equal(auto.verification.kit, 'auto');
  for (const k of Object.values(KITS)) assert.ok(auto.verification.selectors.primary.includes(k.primary.split(',')[0]));
  const antd = configFrom({ verification: { kit: 'antd' } });
  assert.ok(antd.verification.selectors.primary.startsWith('.ant-btn-primary'));
  assert.ok(!antd.verification.selectors.primary.includes('Mui'));
  assert.equal(antd.kitProfile.regions['dialog-footer'].split(',')[0], '.ant-modal-footer');
  const own = configFrom({ verification: { kit: 'mui', selectors: { primary: '.cta' } } });
  assert.equal(own.verification.selectors.primary, '.cta');
  assert.equal(configFrom({}).verification.selectors.primary, auto.verification.selectors.primary, 'defaults are not mutated across calls');
  assert.equal(kitProfile('nope').id, 'auto');
});

test('kits drive the screen rules: two primaries are found in bootstrap and shadcn markup', () => {
  const page = (a, b) => `<!doctype html><html><body><main><h1>Purchase orders</h1>${a}${b}</main></body></html>`;
  const bs = page('<button class="btn btn-primary">Create order</button>', '<button class="btn btn-primary">Export CSV</button>');
  const rules = (cfg, html) => analyzeScreen(html, cfg).findings.map((f) => f.rule);
  assert.ok(rules(configFrom({ verification: { kit: 'bootstrap' } }), bs).includes('T1'));
  assert.ok(!rules(configFrom({ verification: { kit: 'mui' } }), bs).includes('T1'), 'the MUI profile does not see Bootstrap primaries');
  const sh = page('<button class="inline-flex bg-primary text-primary-foreground">Create order</button>', '<button class="bg-primary">Approve order</button>');
  assert.ok(rules(configFrom({ verification: { kit: 'shadcn' } }), sh).includes('T1'));
});

test('UX.md lint accepts paths and verification.kit; rejects an unknown kit', () => {
  const example = readFileSync('examples/UX.md', 'utf8');
  assert.match(example, /^paths:\n  captures: \.dsx\/captures\/<module>/m, 'the example declares paths');
  assert.match(example, /^  kit: mui/m, 'the example declares its kit');
  const r = lintUxMd(example);
  assert.equal(r.ok, true, r.errors.join('\n'));
  assert.ok(!r.warnings.some((w) => /desconhecida: (paths|verification\.kit)/.test(w)));
  const bad = lintUxMd(example.replace(/^  kit: mui/m, '  kit: bulma'));
  assert.ok(bad.errors.some((e) => /verification\.kit/.test(e)));
});
