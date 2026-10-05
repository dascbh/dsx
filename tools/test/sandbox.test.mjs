// Sandbox: mirror with 3-way state, apply/discard/sync conflicts, init detection and plan on a fictional Vite + React
// project, isolation and bundle checks, and the browser runtime (TypeScript, run by Node's type stripping when available).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { lintText } from '../lint-raw-values.mjs';
import { buildManifest as buildManifestMjs, designConfig } from '../design-md/lib/options.mjs';
import { sandboxConfig } from '../sandbox/lib/config.mjs';
import { apply, computeState, discard, globToRe, inScope, sync } from '../sandbox/lib/mirror.mjs';
import { aliasesOf, detect, envUsage, exportedNames, readJsonc, vitePlugins } from '../sandbox/lib/detect.mjs';
import { dsxRootFor, planFiles, planIgnores, planScripts, proposeBlock, sandboxIndexHtml } from '../sandbox/lib/harness.mjs';
import { bundleCheck, cspOf, isolationCheck } from '../sandbox/lib/isolation.mjs';
import { parseSandboxArgs } from '../sandbox/sandbox.mjs';

const ROOT = process.cwd();
const FIXTURE = join(ROOT, 'tools/test/fixtures/sandbox/project');
const CLI = join(ROOT, 'tools/sandbox/sandbox.mjs');
const TS = !!process.features?.typescript;
const tsSkip = TS ? false : 'Node without TypeScript type stripping (needs ≥ 22.18)';

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-sandbox-'));
  cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
const run = (root, ...args) => spawnSync(process.execPath, [CLI, '--root', root, ...args], { encoding: 'utf8' });
function initialized() {
  const root = project();
  const r = run(root, 'init', '--write');
  assert.equal(r.status, 0, r.stderr);
  return root;
}

/** Copies TypeScript files to a temp folder with explicit .ts imports (projects use extensionless ones). */
function loadTs(files, names) {
  const out = mkdtempSync(join(tmpdir(), 'dsx-sbx-ts-'));
  for (const f of files) {
    writeFileSync(join(out, f.split('/').pop()), readFileSync(join(ROOT, f), 'utf8').replace(/from '\.\.?\/(?:runtime\/)?([\w-]+)'/g, "from './$1.ts'"));
  }
  return Promise.all(names.map((n) => import(pathToFileURL(join(out, `${n}.ts`)).href)));
}
const runtime = () => loadTs(['templates/capture/fake-api.ts', 'templates/sandbox/runtime/scenarios.ts', 'templates/sandbox/runtime/intercept.ts'], ['fake-api', 'scenarios', 'intercept']);

// ------------------------------------------------------------------ CLI basics

test('args: boolean flags never swallow the next positional; --key value and --key=value', () => {
  assert.deepEqual(parseSandboxArgs(['apply', '--force', 'web/src/a.tsx']), { _: ['apply', 'web/src/a.tsx'], force: true });
  assert.deepEqual(parseSandboxArgs(['init', '--package', 'web', '--config=x.json']), { _: ['init'], package: 'web', config: 'x.json' });
});

test('CLI: usage exits 2, unconfigured project exits 3', () => {
  const root = project();
  assert.equal(run(root).status, 2);
  assert.equal(run(root, 'frobnicate').status, 3); // no sandbox block yet: setup comes first
  assert.equal(run(root, 'status').status, 3);
  const r = initialized();
  assert.equal(run(r, 'frobnicate').status, 2);
  assert.equal(run(r, 'apply').status, 3); // no mirror yet
  run(r, 'sync');
  assert.equal(run(r, 'apply').status, 2); // neither paths nor --all
});

// ------------------------------------------------------------------ detection and plan

test('detect: package, entry, plugins, aliases, auth module and its exports, env classification, real hosts, capture data', () => {
  const d = detect(project());
  assert.equal(d.package, 'web');
  assert.equal(d.src, 'web/src');
  assert.equal(d.entry, 'web/src/main.tsx');
  assert.deepEqual(d.plugins.calls, ['react()', 'tailwindcss()']);
  assert.deepEqual(d.plugins.skipped, ['requireAttachmentsHost()']); // defined in the config: a production guard
  assert.equal(d.plugins.imports.length, 2);
  assert.deepEqual(d.aliases, { '@': 'web/src' });
  assert.equal(d.auth[0].file, 'web/src/context/AuthContext.tsx');
  assert.equal(d.auth[0].sdk, 'amazon-cognito-identity-js');
  assert.deepEqual(d.auth[0].exports.sort(), ['AuthProvider', 'useAuth']);
  assert.deepEqual(d.env.api_bases, { api: 'VITE_API_URL', files: 'VITE_API_FILES_URL' });
  assert.deepEqual(d.env.auth, ['VITE_COGNITO_CLIENT_ID', 'VITE_COGNITO_USER_POOL_ID']);
  assert.deepEqual(d.env.hosts, ['VITE_ATTACHMENTS_HOST']);
  assert.deepEqual(d.real_hosts, ['api.orders-platform.com', 'attachments-123456789012.s3.us-east-1.amazonaws.com', 'files.orders-platform.com']);
  assert.deepEqual(d.capture, { dirs: ['web/tests/capture'], legacy_imports: ['web/tests/capture'] });
  assert.deepEqual(d.host_validations.VITE_ATTACHMENTS_HOST.files, ['web/src/files/hostFormat.ts', 'web/vite.config.ts']);
  assert.equal(d.host_validations.VITE_ATTACHMENTS_HOST.value, 'attachments-000000000000.s3.us-east-1.amazonaws.com');
  assert.deepEqual(d.claims, { claims: ['cognito:groups', 'custom:org_id'], group_values: ['Admins'] });
  assert.deepEqual(d.denial_codes, ['MODULE_FORBIDDEN', 'ORG_FORBIDDEN']); // object keys of a code map count too
  assert.equal(d.host_validations.VITE_ATTACHMENTS_HOST.patterns.length, 1); // the header check is not a host format
  assert.deepEqual(d.shell_calls, ['/orgs/:param/settings', '/orgs/mine']);
  assert.deepEqual(d.fixtures, ['web/tests/fixtures']);
  assert.deepEqual(d.referenced_docs, ['design/foundation.md']); // exact docs; code paths and non-.md folders are not items
  assert.equal(d.foreign_harness, null);
  assert.equal(d.warnings.length, 1);
});

test('detect helpers: jsonc, exports, plugins without a config, env names', () => {
  assert.deepEqual(readJsonc('{ // c\n "a": [1,], /* x */ "b": "http://x" ,}'), { a: [1], b: 'http://x' });
  assert.deepEqual(exportedNames('export function A(){}\nexport const b=1\nexport { c as d, e }\nexport default X').sort(), ['A', 'b', 'd', 'default', 'e']);
  assert.deepEqual(vitePlugins(null).calls, ['react()']);
  const dir = mkdtempSync(join(tmpdir(), 'dsx-env-'));
  writeFileSync(join(dir, 'a.ts'), 'import.meta.env.VITE_BASE_URL; import.meta.env.VITE_REPORTS_ENDPOINT; import.meta.env.VITE_FEATURE_X');
  const e = envUsage([join(dir, 'a.ts')]);
  assert.deepEqual(e.api_bases, { api: 'VITE_BASE_URL', reports: 'VITE_REPORTS_ENDPOINT' });
  assert.deepEqual(e.other, ['VITE_FEATURE_X']);
  assert.deepEqual(aliasesOf(dir, dir), {});
});

test('plan: block inside the package, synthetic environment + redirect for legacy capture data, swaps, blanked identity, existing block wins', () => {
  const root = project();
  const d = detect(root);
  const b = proposeBlock(d);
  assert.equal(b.dir, 'web/sandbox');
  assert.equal(b.mirror, 'web/sandbox/mirror');
  assert.deepEqual(b.items, ['web/src', 'web/public', 'DESIGN.md', '.dsx/design-options', 'design/foundation.md', 'web/tests/capture', 'web/tests/fixtures']);
  assert.deepEqual(b.personas[0].claims['cognito:groups'], ['Admins']);
  assert.deepEqual(b.personas[1].claims['cognito:groups'], []);
  assert.equal(b.personas[0].claims['custom:org_id'], 'sbx-org-id-1');
  assert.ok(!('groups' in b.personas[0].claims));
  assert.deepEqual(b.exempt, ['/orgs/:param/settings', '/orgs/mine']);
  assert.equal(b.scenario_responses.forbidden.body.error.code, 'MODULE_FORBIDDEN');
  assert.ok(!b.items.includes('web') && !b.items.includes('.') && !b.items.some((i) => i.startsWith('specs')));
  assert.ok(!proposeBlock({ ...d, referenced_docs: ['web', '.'] }).items.some((i) => i === 'web' || i === '.')); // never the package or the root
  assert.deepEqual(b.fictitious_hosts, ['attachments-000000000000.s3.us-east-1.amazonaws.com']);
  assert.deepEqual(b.swaps, { 'web/src/context/AuthContext.tsx': 'web/sandbox/auth/AuthContext.tsx' });
  assert.equal(b.env.VITE_COGNITO_CLIENT_ID, '');
  assert.equal(b.env.VITE_ATTACHMENTS_HOST, 'attachments-000000000000.s3.us-east-1.amazonaws.com'); // passes the app's format check
  assert.match(b.synthetic['web/tests/capture/environment.tsx'], /export \* from '\.\.\/\.\.\/\.\.\/\.\.\/runtime\/fake-api'/);
  assert.deepEqual(b.redirects, [{ specifier: './environment', importer_prefix: 'web/tests/capture', to: 'web/sandbox/runtime/fake-api.ts' }]);
  assert.equal(b.storage_key, 'dsx-sandbox');
  const kept = proposeBlock(d, { existing: { ...b, items: ['web/src', 'docs/extra'], ports: { dev: 4000, preview: 4001 } } });
  assert.equal(kept.ports.dev, 4000);
  assert.deepEqual(kept.items.slice(0, 2), ['web/src', 'docs/extra']); // team items kept, detected ones added
  assert.ok(kept.items.includes('design/foundation.md'));
  assert.ok(b.dsx_root.length > 0);
  assert.equal(dsxRootFor('/work/team/app', '/work/team/dsx'), '../dsx'); // sibling checkout: relative, works on any machine
  assert.equal(dsxRootFor('/work/team/app', '/opt/dsx'), '/opt/dsx'); // nothing in common below the disk root: absolute

  const files = planFiles(d, b);
  const paths = files.map((f) => f.path);
  for (const p of ['web/sandbox/main.sandbox.tsx', 'web/sandbox/runtime/fake-api.ts', 'web/sandbox/vite.sandbox.config.ts', 'web/sandbox/index.html', 'web/sandbox/auth/AuthContext.tsx', 'web/sandbox/mocks/index.ts']) assert.ok(paths.includes(p), p);
  const vite = files.find((f) => f.path.endsWith('vite.sandbox.config.ts')).content;
  assert.match(vite, /import tailwindcss from '@tailwindcss\/vite';/);
  assert.match(vite, /\/\* @dsx:plugins \*\/ react\(\), tailwindcss\(\) \/\* @dsx:end \*\//);
  assert.match(files.find((f) => f.path.endsWith('AuthContext.tsx')).content, /Real module exports: AuthProvider, useAuth/);
  const tsconfig = JSON.parse(files.find((f) => f.path.endsWith('tsconfig.json')).content);
  assert.deepEqual(tsconfig.compilerOptions.paths['@/*'], ['./mirror/web/src/*']);

  const ignores = planIgnores(d, b);
  assert.deepEqual(ignores.map((p) => p.file), ['.gitignore', 'web/eslint.config.js', 'web/eslint.config.js', 'web/vitest.config.ts']);
  assert.match(ignores[1].after, /globalIgnores\(\['sandbox\/mirror', 'sandbox\/dist', 'dist'\]\)/);
  assert.ok(ignores[2].note && !ignores[2].after);
  assert.match(ignores[3].after, /exclude: \['sandbox\/\*\*', \.\.\.configDefaults\.exclude\]/);
  const [scripts] = planScripts(d, b);
  const pkg = JSON.parse(scripts.after);
  assert.equal(pkg.scripts.sandbox, 'node sandbox/cli.mjs dev');
  assert.equal(pkg.scripts['sandbox:apply'], 'node sandbox/cli.mjs apply');
  assert.equal(pkg.dependencies.react, '^19.0.0'); // rest of package.json untouched
});

test('sandbox index.html: project head kept, CSP added, entry replaced', () => {
  const html = sandboxIndexHtml(readFileSync(join(FIXTURE, 'web/index.html'), 'utf8'));
  assert.match(html, /<div id="app"><\/div>/);
  assert.match(html, /src="\.\/main\.sandbox\.tsx"/);
  assert.deepEqual(cspOf(html).problems, []);
  assert.match(cspOf(sandboxIndexHtml(null, { 'connect-src': ['https://evil.example'] })).directives['connect-src'].join(' '), /^'self'/);
});

test('init: dry run writes nothing; --write writes harness, config block and ignores; second run is idempotent', () => {
  const root = project();
  const before = readFileSync(join(root, '.gitignore'), 'utf8');
  const dry = run(root, 'init');
  assert.equal(dry.status, 0, dry.stderr);
  assert.match(dry.stdout, /Dry run: nothing written/);
  assert.ok(!existsSync(join(root, 'web/sandbox')));
  assert.equal(readFileSync(join(root, '.gitignore'), 'utf8'), before);
  assert.equal(JSON.parse(readFileSync(join(root, '.dsx/config.json'), 'utf8')).sandbox, undefined);

  run(root, 'init', '--write');
  const cfg = JSON.parse(readFileSync(join(root, '.dsx/config.json'), 'utf8'));
  assert.ok(cfg.design && cfg.sandbox); // other blocks kept
  assert.match(readFileSync(join(root, '.gitignore'), 'utf8'), /\/web\/sandbox\/mirror\//);
  writeFileSync(join(root, 'web/sandbox/mocks/index.ts'), "import './orders';\n");
  assert.ok(JSON.parse(readFileSync(join(root, 'web/package.json'), 'utf8')).scripts['sandbox:status']);
  const again = JSON.parse(run(root, 'init', '--write', '--json').stdout);
  assert.deepEqual(again.ignores.filter((p) => !p.note), []);
  assert.equal(readFileSync(join(root, 'web/sandbox/mocks/index.ts'), 'utf8'), "import './orders';\n"); // project-owned file kept
  const forced = JSON.parse(run(root, 'init', '--write', '--force', '--json').stdout);
  assert.ok(forced.result.skipped.includes('web/sandbox/mocks/index.ts')); // --force refreshes only DSX-owned files
});

test('init: a harness DSX did not generate refuses --write; --migrate moves versioned files to .dsx, leaves ignored ones', () => {
  const root = project();
  spawnSync('git', ['init', '-q'], { cwd: root });
  mkdirSync(join(root, 'web/sandbox/mock'), { recursive: true });
  mkdirSync(join(root, 'web/sandbox/old-mirror'), { recursive: true });
  writeFileSync(join(root, 'web/sandbox/mock/orders.ts'), 'export {};\n');
  writeFileSync(join(root, 'web/sandbox/index.html'), '<html></html>\n');
  writeFileSync(join(root, 'web/sandbox/old-mirror/x.ts'), 'export {};\n');
  mkdirSync(join(root, 'web/sandbox/dist'), { recursive: true });
  writeFileSync(join(root, 'web/sandbox/dist/big.js'), '//\n');
  writeFileSync(join(root, '.gitignore'), 'node_modules\nweb/sandbox/old-mirror/\n');
  writeFileSync(join(root, 'web/.gitignore'), 'dist\n');
  const pj = JSON.parse(readFileSync(join(root, 'web/package.json'), 'utf8'));
  pj.scripts = { dev: 'vite', sandbox: 'node sandbox/old.mjs dev', 'sandbox:copy-old': 'node sandbox/old.mjs copy' };
  writeFileSync(join(root, 'web/package.json'), JSON.stringify(pj, null, 2));
  const dry = JSON.parse(run(root, 'init', '--dry-run', '--json').stdout);
  assert.deepEqual(dry.migration.move, ['index.html', 'mock']);
  assert.deepEqual(dry.migration.leave, ['dist', 'old-mirror']); // generated: never moved into .dsx/
  const scriptPatches = dry.ignores.filter((p) => p.file === 'web/package.json');
  assert.ok(scriptPatches[0].add.includes('scripts.sandbox (was: node sandbox/old.mjs dev)'));
  assert.match(scriptPatches.find((p) => p.manual).manual, /sandbox:copy-old/);
  assert.ok(dry.files.every((f) => !f.exists)); // planned as an empty folder

  const refused = run(root, 'init', '--write');
  assert.equal(refused.status, 1);
  assert.ok(!existsSync(join(root, 'web/sandbox/main.sandbox.tsx')));
  assert.equal(readFileSync(join(root, 'web/sandbox/index.html'), 'utf8'), '<html></html>\n');

  const r = run(root, 'init', '--write', '--migrate');
  assert.equal(r.status, 0, r.stderr);
  const prev = readdirSync(join(root, '.dsx')).find((n) => n.startsWith('sandbox-previous-'));
  assert.ok(existsSync(join(root, '.dsx', prev, 'mock/orders.ts')));
  assert.ok(existsSync(join(root, 'web/sandbox/old-mirror/x.ts')));
  assert.match(readFileSync(join(root, 'web/sandbox/index.html'), 'utf8'), /main\.sandbox\.tsx/);
  assert.equal(JSON.parse(run(root, 'init', '--dry-run', '--json').stdout).migration, null); // now it is ours
  assert.equal(JSON.parse(readFileSync(join(root, 'web/package.json'), 'utf8')).scripts.sandbox, 'node sandbox/cli.mjs dev');
});

test('launcher: npm scripts find the DSX through sandbox.dsx_root, DSX_ROOT overrides; a stale mirror is refused', () => {
  const root = initialized();
  const launcher = (env = {}) => spawnSync(process.execPath, [join(root, 'web/sandbox/cli.mjs'), 'sync'], { encoding: 'utf8', env: { ...process.env, DSX_ROOT: '', ...env } });
  const ok = launcher();
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /Mirror created/);
  assert.equal(launcher({ DSX_ROOT: join(root, 'nowhere') }).status, 3);

  const other = initialized();
  mkdirSync(join(other, 'web/sandbox/mirror/web'), { recursive: true });
  writeFileSync(join(other, 'web/sandbox/mirror/web/stale.ts'), '//\n');
  const r = run(other, 'sync');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /without a DSX base/);
});

// ------------------------------------------------------------------ mirror

test('mirror scope: items, filters, ignores, never the sandbox itself', () => {
  assert.ok(globToRe('**/*.data.ts').test('a/b/orders.data.ts'));
  assert.ok(globToRe('**/*.data.ts').test('orders.data.ts'));
  assert.ok(!globToRe('*.ts').test('a/b.ts'));
  const sc = sandboxConfig(initialized());
  assert.ok(inScope(sc, 'web/src/pages/Orders.tsx'));
  assert.ok(inScope(sc, 'web/tests/capture/orders.data.ts'));
  assert.ok(!inScope(sc, 'web/tests/capture/orders.capture.test.tsx'));
  assert.ok(!inScope(sc, 'web/tests/capture/environment.tsx')); // synthetic in the mirror, never compared
  assert.ok(!inScope(sc, 'web/src/node_modules/x.js'));
  assert.ok(!inScope(sc, 'web/package.json'));
});

test('sync: first copy with base, synthetic file written; later official changes come in, sandbox edits stay', () => {
  const root = initialized();
  const sc = sandboxConfig(root);
  const first = sync(sc);
  assert.ok(first.created);
  assert.equal(first.copied, 14);
  assert.ok(existsSync(join(sc.mirror, 'design/foundation.md')));
  assert.ok(existsSync(join(sc.mirror, 'web/tests/fixtures/order.json')));
  assert.match(readFileSync(join(sc.mirror, 'web/tests/capture/environment.tsx'), 'utf8'), /fake-api/);
  const base = JSON.parse(readFileSync(sc.baseFile, 'utf8'));
  assert.ok(base.created_at && base.files['web/src/main.tsx'].length === 64);
  assert.equal(computeState(sc).rows.length, 0);

  writeFileSync(join(root, 'web/src/api.ts'), '// official\n');
  writeFileSync(join(sc.mirror, 'web/src/pages/Orders.tsx'), '// sandbox\n');
  rmSync(join(root, 'web/src/index.css'));
  const r = sync(sc);
  assert.deepEqual(r.updated, ['web/src/api.ts']);
  assert.deepEqual(r.removed, ['web/src/index.css']);
  assert.equal(readFileSync(join(sc.mirror, 'web/src/pages/Orders.tsx'), 'utf8'), '// sandbox\n');
  assert.ok(!existsSync(join(sc.mirror, 'web/src/index.css')));
});

test('3-way: conflicts refuse apply (all-or-nothing) and are kept by sync; --force wins; apply never touches other files', () => {
  const root = initialized();
  const sc = sandboxConfig(root);
  sync(sc);
  writeFileSync(join(sc.mirror, 'web/src/index.css'), 'body { margin: 1px; }\n');
  writeFileSync(join(root, 'web/src/index.css'), 'body { margin: 2px; }\n');
  writeFileSync(join(sc.mirror, 'web/src/pages/New.tsx'), 'export const New = 1;\n');
  rmSync(join(sc.mirror, 'web/src/api.ts'));
  const rows = Object.fromEntries(computeState(sc).rows.map((x) => [x.path, x]));
  assert.ok(rows['web/src/index.css'].conflict);
  assert.equal(rows['web/src/pages/New.tsx'].mirror, 'new');
  assert.equal(rows['web/src/api.ts'].mirror, 'deleted');

  const refused = apply(sc, { all: true });
  assert.ok(refused.refused);
  assert.ok(!existsSync(join(root, 'web/src/pages/New.tsx')));
  assert.deepEqual(sync(sc).conflicts, ['web/src/index.css']);
  assert.equal(readFileSync(join(sc.mirror, 'web/src/index.css'), 'utf8'), 'body { margin: 1px; }\n');

  const partial = apply(sc, { targets: ['web/src/pages', 'web/src/api.ts'] });
  assert.deepEqual(partial.applied.map((a) => a.path).sort(), ['web/src/api.ts', 'web/src/pages/New.tsx']);
  assert.ok(!existsSync(join(root, 'web/src/api.ts')));
  assert.equal(readFileSync(join(root, 'web/src/index.css'), 'utf8'), 'body { margin: 2px; }\n');

  apply(sc, { targets: ['web/src/index.css'], force: true });
  assert.equal(readFileSync(join(root, 'web/src/index.css'), 'utf8'), 'body { margin: 1px; }\n');
  assert.equal(computeState(sc).rows.length, 0);
});

test('discard: sandbox file goes back to official; a sandbox-only file disappears', () => {
  const root = initialized();
  const sc = sandboxConfig(root);
  sync(sc);
  writeFileSync(join(sc.mirror, 'web/src/main.tsx'), '// changed\n');
  writeFileSync(join(sc.mirror, 'web/src/Extra.tsx'), '// new\n');
  assert.equal(discard(sc, { all: true }).discarded.length, 2);
  assert.equal(readFileSync(join(sc.mirror, 'web/src/main.tsx'), 'utf8'), readFileSync(join(root, 'web/src/main.tsx'), 'utf8'));
  assert.ok(!existsSync(join(sc.mirror, 'web/src/Extra.tsx')));
  assert.equal(computeState(sc).rows.length, 0);
});

test('apply CLI: gates run on applied files (raw values) and the design-lab manifest is refreshed; exit 1 on a failed gate', () => {
  const root = initialized();
  run(root, 'sync');
  const sc = sandboxConfig(root);
  writeFileSync(join(sc.mirror, 'web/src/pages/Bad.tsx'), "export const Bad = () => <div style={{ color: '#ff0000' }} />;\n");
  writeFileSync(join(sc.mirror, '.dsx/design-options/bold.md'), '---\nname: Bold\n---\n# Bold\n');
  const r = run(root, 'apply', '--all', '--json');
  assert.equal(r.status, 1, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.gates.find((g) => g.gate === 'raw-values').ok, false);
  assert.ok(out.gates.find((g) => g.gate === 'design-lab-manifest').ok);
  const manifest = JSON.parse(readFileSync(join(root, 'web/src/dev/design-lab/options.json'), 'utf8'));
  assert.deepEqual(manifest.options.map((o) => o.name), ['bold', 'calm']);
});

// ------------------------------------------------------------------ isolation

test('isolation-check: real hosts, identity endpoints, open CSP and missing interceptor fail; a clean build passes', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dsx-sbx-dist-'));
  mkdirSync(join(dist, 'assets'));
  writeFileSync(join(dist, 'index.html'), sandboxIndexHtml(null));
  writeFileSync(join(dist, 'assets/a.js'), 'el.setAttribute("data-dsx-sandbox","");fetch("/__dsx/api/orders")');
  assert.ok(isolationCheck(dist, { realHosts: ['api.orders-platform.com'] }).ok);
  const sc = sandboxConfig(dist, { block: { real_hosts: ['a.example.com', 'b-000.example.com'], fictitious_hosts: ['b-000.example.com'] } });
  assert.deepEqual(sc.realHosts, ['a.example.com']); // a real-looking fictitious host is never refused

  writeFileSync(join(dist, 'assets/b.js'), 'fetch("https://api.orders-platform.com/v1");x="https://cognito-idp.us-east-1.amazonaws.com/"');
  const bad = isolationCheck(dist, { realHosts: ['api.orders-platform.com'] });
  assert.deepEqual(bad.findings.map((f) => f.rule).sort(), ['auth-endpoint', 'real-host']);
  rmSync(join(dist, 'assets/b.js'));

  writeFileSync(join(dist, 'index.html'), '<html><head><meta http-equiv="Content-Security-Policy" content="connect-src *"></head></html>');
  assert.equal(isolationCheck(dist).findings[0].rule, 'csp');
  writeFileSync(join(dist, 'index.html'), '<html><head></head></html>');
  writeFileSync(join(dist, 'assets/a.js'), 'plain');
  assert.deepEqual(isolationCheck(dist).findings.map((f) => f.rule), ['csp', 'no-interceptor']);
});

test('bundle-check: official build must not carry the sandbox', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dsx-off-dist-'));
  writeFileSync(join(dist, 'index.js'), 'console.log(1)');
  assert.ok(bundleCheck(dist).ok);
  assert.equal(run(dist, 'bundle-check', '.').status, 0);
  writeFileSync(join(dist, 'leak.js'), 'const c = __DSX_SANDBOX__;');
  assert.equal(bundleCheck(dist).hits.length, 1);
  assert.equal(run(dist, 'bundle-check', '.').status, 1);
});

// ------------------------------------------------------------------ templates

test('templates: no raw values, product names, Vitest or real hosts; marker and storage key present', () => {
  const dir = join(ROOT, 'templates/sandbox');
  const files = [];
  const walk = (d) => { for (const f of readdirSync(d, { withFileTypes: true })) f.isDirectory() ? walk(join(d, f.name)) : files.push(join(d, f.name)); };
  walk(dir);
  for (const f of files.filter((x) => /\.(tsx?|html)$/.test(x))) {
    const t = readFileSync(f, 'utf8');
    assert.deepEqual(lintText(t, f), [], f);
    assert.doesNotMatch(t, /from 'vitest'/, f);
  }
  const all = files.map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.match(all, /data-dsx-sandbox/);
  assert.match(all, /'dsx-sandbox'/);
  assert.doesNotMatch(readFileSync(join(ROOT, 'templates/capture/orders.data.ts'), 'utf8'), /from '\.\/environment'/);
});

test('runtime: router, scenarios → states, exempt routes, preferences precedence, hosts, fake JWT', { skip: tsSkip }, async () => {
  const [api, sc, ic] = await runtime();
  assert.deepEqual(sc.SCENARIOS, ['normal', 'empty', 'slow', 'error', 'forbidden']);
  assert.deepEqual(Object.values(sc.STATE_OF), ['success', 'empty', 'loading', 'error', 'no-access']);
  const cfg = { storage_key: 'dsx-sandbox', default_scenario: 'normal', default_persona: 'admin', latency_ms: 0, slow_ms: 0, bases: [{ name: 'api', prefix: '/__dsx/api' }], exempt: ['GET api:/me', '/orgs/:id/settings'], fictitious_hosts: ['*.sandbox.invalid'], personas: [], labels: {}, scenario_responses: {} };
  const router = api.createRouter();
  router.add('GET api:/orders', api.ok([{ id: 1 }, { id: 2 }]));
  router.add('GET api:/orders/:id', (ctx) => api.ok({ id: ctx.params.id }));
  router.add('GET api:/me', api.ok({ id: 'u' }));
  router.add('POST api:/orders', [api.fail(422, 'INVALID'), { status: 201, body: { data: { id: 3 } } }]);
  const ask = (scenario, method, path) => ic.answer(router, cfg, { scenario, persona: null, latency_ms: 0 }, method, 'api', path, new URLSearchParams(), null, new Headers());

  assert.deepEqual((await ask('normal', 'GET', '/orders/7')).resp.body, { data: { id: '7' } });
  assert.deepEqual((await ask('empty', 'GET', '/orders')).resp.body, { data: [] });
  assert.equal((await ask('error', 'GET', '/orders')).resp.status, 500);
  assert.equal((await ask('forbidden', 'GET', '/orders')).resp.status, 403);
  assert.equal((await ask('forbidden', 'GET', '/me')).resp.status, 200); // exempt: the session keeps working
  router.add('GET api:/orgs/:id/settings', api.ok({}));
  assert.equal((await ask('forbidden', 'GET', '/orgs/o1/settings')).resp.status, 200); // any base, :param segment
  assert.equal((await ask('forbidden', 'GET', '/orgs/o1/settings/x')).resp.status, 403);
  assert.equal((await ask('error', 'GET', '/orders')).resp.body.error.code, 'SANDBOX_ERROR');
  cfg.scenario_responses = { forbidden: { status: 403, body: { error: { code: 'ORG_FORBIDDEN' } } } };
  assert.deepEqual((await ask('forbidden', 'GET', '/orders')).resp.body, { error: { code: 'ORG_FORBIDDEN' } });
  cfg.scenario_responses = {};
  const created = [];
  router.add('POST api:/notes', (ctx) => { const n = { id: api.newId('note'), ...ctx.body }; created.push(n); return api.respond(201, { data: n }); });
  router.add('GET api:/notes', () => created);
  router.add('DELETE api:/notes/:id', () => undefined);
  const post = await ic.answer(router, cfg, { scenario: 'normal', persona: null, latency_ms: 0 }, 'POST', 'api', '/notes', new URLSearchParams(), '{"text":"a"}', new Headers());
  assert.equal(post.resp.status, 201);
  assert.match(post.resp.body.data.id, /^note-/);
  assert.equal((await ask('normal', 'GET', '/notes')).resp.body[0].text, 'a'); // state in memory, plain value → 200
  assert.equal((await ask('normal', 'DELETE', '/notes/x')).resp.status, 204);
  assert.deepEqual(api.noContent(), { status: 204, body: null });
  const none = await ask('normal', 'GET', '/nope');
  assert.equal(none.kind, 'no-mock');
  assert.equal(none.resp.status, 404);
  assert.equal((await ask('normal', 'POST', '/orders')).resp.status, 422);
  assert.equal((await ask('normal', 'POST', '/orders')).resp.status, 201);
  assert.equal((await ask('normal', 'POST', '/orders')).resp.status, 201); // last answer repeats

  const stored = { getItem: () => JSON.stringify({ scenario: 'slow', latency_ms: 900 }) };
  assert.deepEqual(sc.choosePreferences(cfg, '?scenario=error', sc.readStored(stored, 'dsx-sandbox')), { scenario: 'error', persona: 'admin', latency_ms: 900 });
  assert.equal(sc.choosePreferences(cfg, '?scenario=bogus', {}).scenario, 'normal');
  assert.ok(sc.hostMatches('files.sandbox.invalid', cfg.fictitious_hosts));
  assert.ok(!sc.hostMatches('sandbox.invalid.example.com', cfg.fictitious_hosts));
  const [h, p, s] = sc.fakeJwt({ sub: 'x' }).split('.');
  assert.equal(JSON.parse(Buffer.from(h, 'base64url')).alg, 'none');
  assert.equal(JSON.parse(Buffer.from(p, 'base64url')).sub, 'x');
  assert.equal(s, 'sandbox');
});

test('manifest: the sandbox TypeScript builder matches the design lab one', { skip: tsSkip }, async () => {
  const [m] = await loadTs(['templates/sandbox/lib/manifest.ts'], ['manifest']);
  const root = project();
  writeFileSync(join(root, '.dsx/design-options/previous-2026-01-01.md'), '---\nname: Old\n---\n');
  writeFileSync(join(root, '.dsx/design-options/Bad Name.md'), '---\nname: Bad\n---\n');
  const dc = designConfig(root);
  const expected = buildManifestMjs(dc);
  const got = m.buildManifest({ root, official: dc.official, optionsDir: dc.optionsDir ?? dc.options_dir ?? join(root, '.dsx/design-options'), active: dc.active ?? null });
  assert.deepEqual(got, expected);
});
