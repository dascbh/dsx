// Sandbox init — turns the detection into the "sandbox" config block, the harness files and the ignore patches.
// Pure planning: nothing is written here (sandbox.mjs writes the plan only with --write).
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCsp } from './isolation.mjs';

const DSX_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TEMPLATES = join(DSX_ROOT, 'templates', 'sandbox');
const posix = (p) => p.split('\\').join('/');
const tpl = (p) => readFileSync(join(TEMPLATES, p), 'utf8');

/** Files copied verbatim from templates/sandbox (owned by DSX: refreshed by `init --write --force`). */
export const RUNTIME_FILES = [
  'main.sandbox.tsx', 'runtime/scenarios.ts', 'runtime/config.ts', 'runtime/intercept.ts', 'runtime/install.ts',
  'runtime/router.ts', 'runtime/SandboxPanel.tsx', 'lib/settings.ts', 'lib/manifest.ts', 'cli.mjs',
];

const CAPTURE_FILTER = ['**/*.data.ts', '**/*.data.tsx', '**/fake-api.ts', 'fixtures/**'];

export const DEFAULT_PERSONAS = [
  { id: 'admin', label: 'Admin', claims: { sub: 'sbx-user-admin', email: 'alex.admin@example.test', name: 'Alex Admin', groups: ['admins'] } },
  { id: 'member', label: 'Member', claims: { sub: 'sbx-user-member', email: 'sam.member@example.test', name: 'Sam Member', groups: [] } },
];

/** Personas shaped like the real token: the claim names the code reads (cognito:groups, custom:*, roles…). */
export function proposePersonas(claims = { claims: [], group_values: [] }) {
  const groupClaim = claims.claims.find((c) => /(^|:)(groups|roles)$/.test(c)) ?? 'groups';
  const adminGroups = claims.group_values.filter((g) => /admin/i.test(g));
  const extra = Object.fromEntries(claims.claims.filter((c) => c !== groupClaim && /^(custom|https?)/.test(c))
    .map((c) => [c, `sbx-${c.split(/[:/]/).pop().replace(/_/g, '-')}-1`]));
  return DEFAULT_PERSONAS.map((p) => {
    const { groups, ...rest } = p.claims;
    return { ...p, claims: { ...rest, ...extra, [groupClaim]: p.id === 'admin' ? (adminGroups.length ? adminGroups : groups) : [] } };
  });
}

/** DSX path for the config: relative to the project when both share a folder below the disk root, else absolute. */
export function dsxRootFor(projectRoot, dsxRoot) {
  const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
  const [a, b] = [real(projectRoot), real(dsxRoot)];
  const shared = a.split(sep).filter((s, i) => s && s === b.split(sep)[i]).length;
  return shared >= 2 ? posix(relative(a, b)) || '.' : posix(b);
}

/** Detection → the "sandbox" block of .dsx/config.json (paths relative to the project root, POSIX). */
export function proposeBlock(d, { existing = null, dsxRoot = DSX_ROOT } = {}) {
  const dir = d.package === '.' ? 'sandbox' : `${d.package}/sandbox`;
  const mirror = `${dir}/mirror`;
  const items = [d.src, d.public_dir, d.design_md ? 'DESIGN.md' : null, d.ux_md ? 'UX.md' : null, '.dsx/design-options',
    ...(d.referenced_docs ?? []), ...d.capture.dirs, ...(d.fixtures ?? [])].filter(Boolean)
    // never the root, the package itself, nor anything containing the sandbox (the mirror would copy itself)
    .filter((it) => it !== '.' && it !== d.package && !`${dir}/`.startsWith(`${it}/`));
  const filters = Object.fromEntries(d.capture.dirs.map((c) => [c, CAPTURE_FILTER]));
  const synthetic = {};
  const redirects = [];
  for (const c of d.capture.legacy_imports) {
    const fromDir = join(d.root, mirror, c);
    const target = posix(relative(fromDir, join(d.root, dir, 'runtime', 'fake-api')));
    synthetic[`${c}/environment.tsx`] = `// DSX sandbox synthetic file (mirror only, never applied): the capture data imports './environment', which needs\n// Vitest; in the sandbox it re-exports the framework-free fake API instead.\nexport * from '${target.startsWith('.') ? target : `./${target}`}';\n`;
    redirects.push({ specifier: './environment', importer_prefix: c, to: `${dir}/runtime/fake-api.ts` });
  }
  const auth = d.auth[0];
  const env = {};
  for (const v of d.env.auth) env[v] = '';
  const fictitious = [];
  for (const v of d.env.hosts) {
    // A host the code validates by format gets a fictitious value that passes it (never reached: listed as fictitious).
    const host = d.host_validations?.[v]?.value ?? `${v.replace(/^VITE_/, '').replace(/_HOST$/, '').toLowerCase().replace(/_/g, '-')}.sandbox.invalid`;
    env[v] = host;
    fictitious.push(host);
  }
  const block = {
    package: d.package, dir, mirror, items, filters,
    ignore: ['.DS_Store', 'node_modules', 'variants'],
    synthetic, redirects,
    entry: d.entry, public_dir: d.public_dir, aliases: d.aliases,
    swaps: auth ? { [auth.file]: `${dir}/auth/${basename(auth.file)}` } : {},
    api_bases: d.env.api_bases,
    env, fictitious_hosts: fictitious, real_hosts: d.real_hosts,
    exempt: d.shell_calls ?? [], personas: proposePersonas(d.claims),
    scenario_responses: d.denial_codes?.length ? { forbidden: { status: 403, body: { error: { code: d.denial_codes[0], message: 'Scenario: forbidden' } } } } : {}, default_persona: 'admin', default_scenario: 'normal',
    latency_ms: 250, slow_ms: 2500, storage_key: 'dsx-sandbox', labels: {},
    ports: { dev: 3100, preview: 3101 }, csp_extra: {},
    // where the npm scripts find the DSX, relative to the project root so a sibling checkout works on any machine
    // (env DSX_ROOT overrides it where the DSX lives elsewhere, e.g. CI or the plugin folder)
    dsx_root: dsxRootFor(d.root, dsxRoot),
  };
  // What the team already decided wins over a new guess; mirrored items are merged (a new detection adds, never drops).
  if (!existing) return block;
  return { ...block, ...existing, items: [...new Set([...(existing.items ?? []), ...block.items])] };
}

/** The sandbox index.html: the project's own (fonts, root element, meta) with a CSP and the sandbox entry. */
export function sandboxIndexHtml(projectHtml, cspExtra = {}) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(cspExtra)}" />`;
  const base = projectHtml ?? '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Sandbox</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n';
  let html = base.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>\s*/gi, '');
  html = html.replace(/<head([^>]*)>/i, `<head$1>\n    ${csp}`);
  html = html.replace(/(<script[^>]+type=["']module["'][^>]+src=["'])[^"']+(["'])/i, '$1./main.sandbox.tsx$2');
  html = html.replace(/(<script[^>]+src=["'])[^"']+(["'][^>]+type=["']module["'])/i, '$1./main.sandbox.tsx$2');
  return html;
}

/** vite.sandbox.config.ts with the project's own plugins (imports and calls copied from its vite.config). */
export function viteConfigText(plugins) {
  return tpl('vite.sandbox.config.ts')
    .replace(/\/\/ @dsx:plugin-imports[\s\S]*?\/\/ @dsx:end/, `// @dsx:plugin-imports\n${plugins.imports.join('\n')}\n// @dsx:end`)
    .replace(/\/\* @dsx:plugins \*\/[\s\S]*?\/\* @dsx:end \*\//, `/* @dsx:plugins */ ${plugins.calls.join(', ')} /* @dsx:end */`);
}

export function fakeAuthText(auth) {
  const head = auth
    ? `// Replaces ${auth.file}${auth.sdk ? ` (identity SDK: ${auth.sdk})` : ''}.\n// Real module exports: ${auth.exports.join(', ') || '(none found)'} — export the same names and shapes here.\n`
    : '// No auth module detected: wire this file through sandbox.swaps in .dsx/config.json if the app needs a session.\n';
  return head + tpl('auth/fake-auth.tsx');
}

export function tsconfigText(d, block) {
  const sandboxAbs = join(d.root, block.dir);
  const toSandbox = (p) => { const r = posix(relative(sandboxAbs, join(d.root, p))); return r.startsWith('.') ? r : `./${r}`; };
  const pkgAbs = join(d.root, d.package);
  const ext = ['tsconfig.app.json', 'tsconfig.json'].find((f) => existsSync(join(pkgAbs, f)));
  const paths = { '@dsx-entry': [toSandbox(`${block.mirror}/${block.entry}`)] };
  for (const [k, v] of Object.entries(block.aliases)) paths[`${k}/*`] = [`${toSandbox(`${block.mirror}/${v}`)}/*`];
  const json = {
    ...(ext ? { extends: posix(relative(sandboxAbs, join(pkgAbs, ext))) } : {}),
    compilerOptions: { noEmit: true, baseUrl: '.', paths, types: ['vite/client', 'node'] },
    include: ['*.ts', '*.tsx', 'runtime', 'mocks', 'auth', 'lib', toSandbox(`${block.mirror}/${d.src}`)],
    exclude: ['dist', 'vite.sandbox.config.ts'],
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

/** Every harness file: { path (relative to the project root), content, owner: dsx|project }. */
export function planFiles(d, block, projectFile = (p) => (existsSync(join(d.root, p)) ? readFileSync(join(d.root, p), 'utf8') : null)) {
  const at = (p) => `${block.dir}/${p}`;
  const files = RUNTIME_FILES.map((p) => ({ path: at(p), content: tpl(p), owner: 'dsx' }));
  files.push({ path: at('runtime/fake-api.ts'), content: readFileSync(join(DSX_ROOT, 'templates', 'capture', 'fake-api.ts'), 'utf8'), owner: 'dsx' });
  files.push({ path: at('vite.sandbox.config.ts'), content: viteConfigText(d.plugins), owner: 'dsx' });
  files.push({ path: at('index.html'), content: sandboxIndexHtml(d.index_html ? projectFile(d.index_html) : null, block.csp_extra), owner: 'dsx' });
  files.push({ path: at('tsconfig.json'), content: tsconfigText(d, block), owner: 'dsx' });
  files.push({ path: at('mocks/index.ts'), content: "// DSX sandbox — mock registry: one file per module, imported here (the first registered match wins).\n// The `sandbox` skill fills this from the API inventory; see templates/sandbox/mocks/example.ts for the shape.\nexport {};\n", owner: 'project' });
  for (const [, to] of Object.entries(block.swaps)) files.push({ path: to, content: fakeAuthText(d.auth[0]), owner: 'project' });
  return files;
}

/** Ignore patches: the mirror and the build out of git, lint and tests (a duplicate would count as clones and run twice). */
export function planIgnores(d, block, projectFile = (p) => (existsSync(join(d.root, p)) ? readFileSync(join(d.root, p), 'utf8') : null)) {
  const relPkg = (p) => posix(relative(join(d.root, d.package), join(d.root, p)));
  const mirrorPkg = relPkg(block.mirror);
  const distPkg = relPkg(`${block.dir}/dist`);
  const dirPkg = relPkg(block.dir);
  const out = [];
  const gi = projectFile('.gitignore') ?? '';
  const lines = [`/${block.mirror}/`, `/${block.dir}/dist/`].filter((l) => !gi.split('\n').includes(l));
  if (lines.length) out.push({ file: '.gitignore', after: `${gi.replace(/\n?$/, '\n')}\n# DSX sandbox (mirror and build are local)\n${lines.join('\n')}\n`, add: lines });

  if (d.eslint_config) {
    const f = posix(relative(d.root, d.eslint_config));
    const t = projectFile(f);
    const entries = [`'${mirrorPkg}'`, `'${distPkg}'`].filter((e) => !t.includes(e));
    if (entries.length && /globalIgnores\(\[/.test(t)) out.push({ file: f, after: t.replace(/globalIgnores\(\[/, `globalIgnores([${entries.join(', ')}, `), add: entries });
    else if (entries.length) out.push({ file: f, manual: `add ${entries.join(', ')} to the ignored paths (e.g. globalIgnores([...]) or an { ignores: [...] } entry)` });
    out.push({ file: f, note: `if lint flags the mocks or the fake auth, relax rules only for '${dirPkg}/mocks/**' and '${dirPkg}/auth/**' (e.g. @typescript-eslint/no-explicit-any), never for src/` });
  }
  if (d.vitest_config) {
    const f = posix(relative(d.root, d.vitest_config));
    const t = projectFile(f);
    const entry = `'${dirPkg}/**'`;
    if (!t.includes(entry) && /exclude\s*:\s*\[/.test(t)) out.push({ file: f, after: t.replace(/exclude\s*:\s*\[/, (m) => `${m}${entry}, `), add: [entry] });
    else if (!t.includes(entry)) out.push({ file: f, manual: `add ${entry} to test.exclude (keep configDefaults.exclude)` });
  }
  return out;
}

/**
 * npm scripts in the front package for the sandbox commands, through the versioned launcher <dir>/cli.mjs.
 * Missing ones are added. Existing `sandbox*` scripts that point elsewhere are replaced when migrating a foreign harness
 * (they would break once it moves) and only reported otherwise; other `sandbox*` scripts are listed for removal.
 */
export function planScripts(d, block, { migrating = false } = {}, projectFile = (p) => (existsSync(join(d.root, p)) ? readFileSync(join(d.root, p), 'utf8') : null)) {
  if (!d.package_json) return [];
  const text = projectFile(d.package_json);
  const json = JSON.parse(text);
  const launcher = posix(relative(join(d.root, d.package), join(d.root, block.dir, 'cli.mjs')));
  const cli = (cmd) => `node ${launcher} ${cmd}`;
  const wanted = {
    sandbox: cli('dev'), 'sandbox:build': cli('build'), 'sandbox:preview': cli('preview'), 'sandbox:sync': cli('sync'),
    'sandbox:status': cli('status'), 'sandbox:diff': cli('diff'), 'sandbox:apply': cli('apply'), 'sandbox:discard': cli('discard'),
  };
  const scripts = json.scripts ?? {};
  const out = [];
  const add = Object.keys(wanted).filter((k) => !scripts[k]);
  const differ = Object.keys(wanted).filter((k) => scripts[k] && scripts[k] !== wanted[k]);
  const replace = migrating ? differ : [];
  if (add.length || replace.length) {
    json.scripts = { ...scripts, ...Object.fromEntries([...add, ...replace].map((k) => [k, wanted[k]])) };
    const indent = text.match(/^[ \t]+(?=")/m)?.[0] ?? '  ';
    out.push({
      file: d.package_json, after: `${JSON.stringify(json, null, indent)}\n`,
      add: [...add.map((k) => `scripts.${k}`), ...replace.map((k) => `scripts.${k} (was: ${scripts[k]})`)],
    });
  }
  if (!migrating && differ.length) out.push({ file: d.package_json, note: `kept, they differ from the DSX ones: ${differ.map((k) => `${k} = ${scripts[k]}`).join(' · ')}` });
  const orphans = Object.keys(scripts).filter((k) => /^sandbox(:|$)/.test(k) && !wanted[k]);
  if (orphans.length) out.push({ file: d.package_json, manual: `remove the old sandbox scripts no DSX command replaces: ${orphans.map((k) => `${k} = ${scripts[k]}`).join(' · ')}` });
  return out;
}

/**
 * A harness DSX did not generate is moved aside to .dsx/sandbox-previous-<date>/ — outside the front package, so its lint
 * and tests never see it — never deleted, never mixed with the new one. Git-ignored entries (its old mirror, its build)
 * stay where they are, still ignored, to be deleted by hand (generated: never versioned by a move into .dsx/).
 */
export function migrationPlan(d, block, today = new Date().toISOString().slice(0, 10)) {
  if (!d.foreign_harness) return null;
  let to = `.dsx/sandbox-previous-${today}`;
  for (let i = 2; existsSync(join(d.root, to)); i++) to = `.dsx/sandbox-previous-${today}-${i}`;
  const paths = d.foreign_harness.entries.map((e) => `${block.dir}/${e}`);
  const g = spawnSync('git', ['-C', d.root, 'check-ignore', ...paths], { encoding: 'utf8' });
  const ignored = new Set((g.stdout || '').split('\n').filter(Boolean).map((p) => p.split('/').pop()));
  // without git, generated folders are recognized by name
  if (g.status !== 0 && g.status !== 1) for (const e of d.foreign_harness.entries) if (/^(dist|build|node_modules|\.vite|coverage)$|mirror/i.test(e)) ignored.add(e);
  const move = d.foreign_harness.entries.filter((e) => !ignored.has(e));
  const leave = d.foreign_harness.entries.filter((e) => !move.includes(e));
  return { from: block.dir, to, move, leave };
}

/** Unified-looking preview of a planned patch (only the added lines). */
export const describePatch = (p) => (p.note ? `${p.file}: NOTE — ${p.note}` : p.manual ? `${p.file}: MANUAL — ${p.manual}` : `${p.file}: + ${p.add.join('  + ')}`);
