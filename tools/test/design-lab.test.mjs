// Design lab: several DESIGN.md options, the active pointer, promote, the comparison page, the DESIGN.md → theme
// adapters (TypeScript, run by Node's type stripping when available) and the live switcher's selection logic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseYaml, splitFrontMatter } from '../lib/yaml-lite.mjs';
import { lintText } from '../lint-raw-values.mjs';
import { analyzeScreen } from '../ux-lint/screen.mjs';
import { analyzeText } from '../ux-lint/text.mjs';
import { analyzeHtml } from '../stitch/analyze-html.mjs';
import { ROLE_KEYS, TYPE_KEYS, DARK_EXPLICIT_ROLES, rolesOf, schemeRoles, palettes, mainPairs } from '../design-md/lib/roles.mjs';
import { designConfig, optionNames, setToken, tokenDiff, readFrontMatter, scanBundle, buildManifest, validateName } from '../design-md/lib/options.mjs';
import { addOption, useOption, promoteOption, listOptions, compare, findCapture, screenLabel, parseLabArgs, UsageError } from '../design-md/lab.mjs';
import { buildComparePage, changeGroups } from '../design-md/lib/page.mjs';

const ROOT = process.cwd();
const FIXTURE = join(ROOT, 'tools/test/fixtures/design-lab/DESIGN.md');
const REFS = join(ROOT, 'references/design-md/designmd-app');
const LAB = join(ROOT, 'tools/design-md/lab.mjs');
const TS = !!process.features?.typescript;
const tsSkip = TS ? false : 'Node without TypeScript type stripping (needs ≥ 22.18)';

/** Copies the TypeScript templates to a temp folder with explicit .ts imports (projects use extensionless ones). */
function loadTs(dir, names) {
  const out = mkdtempSync(join(tmpdir(), 'dsx-ts-'));
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
    writeFileSync(join(out, f), readFileSync(join(dir, f), 'utf8').replace(/from '\.\/([\w-]+)'/g, "from './$1.ts'"));
  }
  return Promise.all(names.map((n) => import(pathToFileURL(join(out, `${n}.ts`)).href)));
}
const adapters = () => loadTs(join(ROOT, 'templates/theme-adapters'), ['design-md', 'mui', 'css-vars', 'tailwind']);

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-lab-'));
  copyFileSync(FIXTURE, join(dir, 'DESIGN.md'));
  return dir;
}
const corpus = () => [FIXTURE, join(ROOT, 'examples/DESIGN.md'), ...readdirSync(REFS).filter((f) => f.endsWith('.md')).map((f) => join(REFS, f))];

// ------------------------------------------------------------------ parser and roles parity (TS ↔ linter's parser)

test('parser: the TypeScript parser reads every front matter exactly like the linter (fixture, example, 40 references)', { skip: tsSkip }, async () => {
  const [d] = await adapters();
  for (const f of corpus()) {
    const md = readFileSync(f, 'utf8');
    const { frontMatter } = splitFrontMatter(md);
    assert.deepEqual(d.parseYaml(frontMatter), parseYaml(frontMatter), f);
    assert.equal(d.splitFrontMatter(md).frontMatter, frontMatter, f);
  }
});

test('roles: TS and JS role tables and role resolution agree, light and dark', { skip: tsSkip }, async () => {
  const [d] = await adapters();
  assert.deepEqual(d.ROLE_KEYS, ROLE_KEYS);
  assert.deepEqual(d.TYPE_KEYS, TYPE_KEYS);
  assert.deepEqual(d.DARK_EXPLICIT_ROLES, DARK_EXPLICIT_ROLES);
  for (const f of corpus()) {
    const md = readFileSync(f, 'utf8');
    const design = d.parseDesignMd(md);
    const fm = readFrontMatter(md);
    assert.deepEqual(design.schemes, palettes(fm).schemes, f);
    for (const scheme of design.schemes) assert.deepEqual(JSON.parse(JSON.stringify(d.rolesOf(design, scheme))), JSON.parse(JSON.stringify(schemeRoles(fm, scheme))), `${f} ${scheme}`);
    assert.deepEqual(JSON.parse(JSON.stringify(d.rolesOfPalette(design.colors))), JSON.parse(JSON.stringify(rolesOf(palettes(fm).light))), f);
  }
});

test('parser: references, colors-dark, components and schemes are normalized', { skip: tsSkip }, async () => {
  const [d] = await adapters();
  const design = d.parseDesignMd(readFileSync(FIXTURE, 'utf8'));
  assert.equal(design.name, 'Orchard Ledger');
  assert.deepEqual(design.schemes, ['light', 'dark']);
  assert.equal(design.colorsDark.primary, '#7ea6f2');
  assert.equal(design.colorsDark.danger, design.colors.danger, 'dark inherits what it does not redefine');
  assert.equal(design.components['button-primary'].backgroundColor, design.colors.primary);
  assert.equal(design.components['button-primary'].typography.fontSize, '14px', 'a typography reference becomes the level');
  assert.equal(design.components['button-primary'].padding, '8px 16px', 'several references in one value');
  assert.equal(d.spacingUnit(design), 8);
  assert.equal(d.controlRadius(design), 8);
  assert.deepEqual(d.webFontFamilies(design), ['Inter', 'JetBrains Mono']);
  assert.match(d.googleFontUrls(design)[0], /family=Inter:wght@400;500;600;700/);
  const carbon = d.parseDesignMd(readFileSync(join(REFS, 'carbon-design.md'), 'utf8'));
  assert.deepEqual(carbon.schemes, ['dark']);
  assert.equal(d.schemeOf(carbon, 'light'), 'dark', 'a dark-only file renders dark whatever the product asks');
  assert.throws(() => d.parseDesignMd('# no front matter'), /front matter/);
  assert.throws(() => d.parseDesignMd('---\ncolors:\n  - a\n  b: c\n---\n'), /YAML line/);
});

// ------------------------------------------------------------------ adapters

function colorsIn(obj) {
  return [...JSON.stringify(obj).matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase());
}

test('mui adapter: palette by scheme, typography, radius, spacing and component slots, without inventing a color', { skip: tsSkip }, async () => {
  const [d, mui] = await adapters();
  const design = d.parseDesignMd(readFileSync(FIXTURE, 'utf8'));
  const light = mui.toMuiThemeOptions(design, { mode: 'light' });
  const dark = mui.toMuiThemeOptions(design, { mode: 'dark' });
  assert.equal(light.palette.mode, 'light');
  assert.equal(light.palette.primary.main, '#5754ed');
  assert.equal(light.palette.primary.dark, '#4646b9', 'primary-hover → the contained hover');
  assert.equal(light.palette.background.default, '#ffffff');
  assert.equal(dark.palette.primary.main, '#7ea6f2');
  assert.equal(dark.palette.primary.dark, undefined, 'a light hover is not carried into dark');
  assert.equal(dark.palette.error, undefined, 'dark danger only when colors-dark declares it');
  assert.equal(dark.palette.background.default, '#0d1724');
  assert.equal(light.shape.borderRadius, 8);
  assert.equal(light.spacing, 8);
  assert.equal(light.typography.fontFamily, 'Inter');
  assert.equal(light.typography.h1.fontSize, `${31 / 16}rem`);
  assert.equal(light.typography.body1.lineHeight, 1.5);
  for (const c of ['MuiAppBar', 'MuiTableHead', 'MuiOutlinedInput', 'MuiButton', 'MuiChip']) assert.ok(light.components[c], c);
  assert.equal(light.components.MuiTableHead.styleOverrides.root.backgroundColor, '#f4f7fc', 'no table-header token → surface');
  const declared = new Set([...Object.values(design.colors), ...Object.values(design.colorsDark)].map((x) => x.toLowerCase()));
  for (const opts of [light, dark]) for (const c of colorsIn(opts)) assert.ok(declared.has(c), `${c} is not a color of the file`);
  assert.equal(mui.toMuiThemeOptions(design, { components: false }).components, undefined);
  const carbon = mui.toMuiThemeOptions(d.parseDesignMd(readFileSync(join(REFS, 'carbon-design.md'), 'utf8')), { mode: 'light' });
  assert.equal(carbon.palette.mode, 'dark');
  assert.equal(carbon.shape.borderRadius, 0);
  assert.equal(carbon.components.MuiChip, undefined, 'no status containers → the product keeps its chip tones');
});

test('css-vars adapter: :root, forced dark and system dark; dark-only files on :root', { skip: tsSkip }, async () => {
  const [d, , css] = await adapters();
  const design = d.parseDesignMd(readFileSync(FIXTURE, 'utf8'));
  const v = css.toCssVariables(design);
  assert.equal(v.base['--ds-color-primary'], '#5754ed');
  assert.equal(v.base['--ds-role-text'], '#1f2226');
  assert.equal(v.base['--ds-font-body-font-size'], '16px');
  assert.equal(v.base['--ds-space-4'], '16px');
  assert.equal(v.dark['--ds-color-primary'], '#7ea6f2');
  assert.equal(v.dark['--ds-color-danger'], undefined, 'only what changes goes to the dark block');
  assert.match(v.css, /^:root\{--ds-color-canvas:#ffffff;/);
  assert.match(v.css, /:root\[data-theme="dark"\]\{[^}]*--ds-color-primary:#7ea6f2/);
  assert.match(v.css, /@media \(prefers-color-scheme: dark\)\{:root:not\(\[data-theme="light"\]\)\{/);
  const carbon = css.toCssVariables(d.parseDesignMd(readFileSync(join(REFS, 'carbon-design.md'), 'utf8')), { prefix: 'x-' });
  assert.equal(carbon.dark, null);
  assert.match(carbon.css, /^:root\{--x-color-primary:#4589ff;.*color-scheme:dark\}$/);
});

test('tailwind adapter: preset with CSS variables or literal values, v4 @theme', { skip: tsSkip }, async () => {
  const [d, , , tw] = await adapters();
  const design = d.parseDesignMd(readFileSync(FIXTURE, 'utf8'));
  const p = tw.toTailwindPreset(design);
  assert.equal(p.theme.extend.colors.primary, 'var(--ds-color-primary)');
  assert.deepEqual(p.theme.extend.fontFamily.sans, ['Inter']);
  assert.deepEqual(p.theme.extend.fontSize.body, ['1rem', { lineHeight: '1.5', fontWeight: '400' }]);
  assert.equal(p.theme.extend.borderRadius.md, '8px');
  assert.deepEqual(p.darkMode, ['selector', '[data-theme="dark"]']);
  assert.equal(tw.toTailwindPreset(design, { cssVars: false }).theme.extend.colors.primary, '#5754ed');
  assert.match(tw.toTailwindTheme(design), /@theme \{\n {2}--color-canvas: var\(--ds-color-canvas\);/);
});

test('adapters and switcher: no raw values for the project drift linter, development marker present', () => {
  const dirs = ['templates/theme-adapters', 'templates/theme-switcher'];
  for (const dir of dirs) for (const f of readdirSync(dir)) {
    const hits = lintText(readFileSync(join(dir, f), 'utf8'), f);
    assert.deepEqual(hits, [], `${dir}/${f}`);
  }
  assert.match(readFileSync('templates/theme-switcher/DesignLabPanel.tsx', 'utf8'), /data-dsx-design-lab/);
  assert.match(readFileSync('templates/theme-switcher/selection.ts', 'utf8'), /dsx-design-lab:active/);
  assert.match(readFileSync('templates/theme-switcher/main.example.tsx', 'utf8'), /import\.meta\.env\.DEV \? lazy\(\(\) => import\(/);
  for (const f of ['MuiDesignLab.tsx', 'CssVarsDesignLab.tsx']) assert.match(readFileSync(join('templates/theme-switcher', f), 'utf8'), /import manifestJson from '\.\/options\.json'/, f);
  const ser = readFileSync('templates/capture/serialize.ts', 'utf8');
  assert.match(ser, /process\.env\.DSX_DESIGN_MD \|\| process\.env\.STITCH_THEME/, 'new name and legacy name');
  assert.match(ser, /options\/\$\{DESIGN_OPTION\}/);
});

// ------------------------------------------------------------------ live switcher selection

test('switcher selection: URL > remembered > manifest active > official; unknown names ignored; storage failures tolerated', { skip: tsSkip }, async () => {
  const [s] = await loadTs(join(ROOT, 'templates/theme-switcher'), ['selection']);
  const m = { format: 1, kind: 'dsx-design-options', active: 'dense', official: { name: 'official', label: 'X', source: 'DESIGN.md', markdown: '' }, options: [{ name: 'dense', label: 'd', source: '', markdown: '' }, { name: 'calm', label: 'c', source: '', markdown: '' }] };
  assert.equal(s.chooseOption(m, { search: '?ds=calm', stored: 'dense' }), 'calm');
  assert.equal(s.chooseOption(m, { search: '?ds=nope', stored: 'calm' }), 'calm');
  assert.equal(s.chooseOption(m, { search: '', stored: null }), 'dense');
  assert.equal(s.chooseOption({ ...m, active: 'gone' }, {}), 'official');
  assert.equal(s.chooseOption(m, { search: '?ds=official', stored: 'calm' }), 'official');
  assert.equal(s.urlWith('http://x.test/a?b=1#h', 'calm'), 'http://x.test/a?b=1&ds=calm#h');
  assert.equal(s.urlWith('http://x.test/a?ds=calm&b=1', 'official'), 'http://x.test/a?b=1');
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  assert.equal(s.readStored(broken), null);
  assert.doesNotThrow(() => s.writeStored('calm', broken));
  const mem = new Map();
  const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
  s.writeStored('calm', store);
  assert.equal(s.readStored(store), 'calm');
  s.writeStored('official', store);
  assert.equal(s.readStored(store), null);
  assert.equal(s.entryOf(m, 'calm').label, 'c');
});

// ------------------------------------------------------------------ lab: options, pointer, diff, promote, manifest

test('lab add: reference copy keeps the credit; variant edits tokens in place and records its origin', () => {
  const dir = project();
  const dc = designConfig(dir);
  const ref = addOption(dc, 'carbon', parseLabArgs(['--from-reference', 'carbon-design']));
  assert.match(readFileSync(ref.file, 'utf8'), /designmd\.app/);
  assert.equal(ref.file, join(dir, '.dsx/design-options/carbon.md'));
  const v = addOption(dc, 'dense', parseLabArgs(['--variant-of', 'current', '--set', 'spacing.4=12px', '--set', 'primary=#1d4ed8', '--set', 'colors-dark.focus=#ffcc00']));
  const md = readFileSync(v.file, 'utf8');
  assert.match(md, /^---\n# dsx-design-lab: variant of official \(\d{4}-\d{2}-\d{2}\) changing spacing\.4, colors\.primary, colors-dark\.focus\n/);
  const fm = readFrontMatter(md);
  assert.equal(fm.spacing['4'], '12px');
  assert.equal(fm.colors.primary, '#1d4ed8', 'a bare color name means the light value');
  assert.equal(fm['colors-dark'].primary, '#7ea6f2', 'dark untouched');
  assert.equal(fm['colors-dark'].focus, '#ffcc00', 'missing key inserted in its group');
  assert.ok(v.lint.ok);
  assert.deepEqual(optionNames(dc), ['carbon', 'dense']);
  assert.throws(() => addOption(dc, 'dense', parseLabArgs(['--from', 'DESIGN.md'])), /already exists/);
  assert.throws(() => addOption(dc, 'Official', parseLabArgs(['--from', 'DESIGN.md'])), UsageError);
  assert.throws(() => addOption(dc, 'x', parseLabArgs(['--variant-of', 'official', '--set', 'nothing=1'])), /not a token/);
  assert.throws(() => addOption(dc, 'x', parseLabArgs(['--from-reference', 'does-not-exist'])), /no local copy/);
  assert.equal(validateName('previous-2026-01-01'), '"previous-2026-01-01" is reserved for the copies kept by promote');
});

test('lab setToken: keeps comments and order, creates missing groups', () => {
  const md = '---\nname: X\ncolors:\n  primary: "#111111"   # brand\n  canvas: "#ffffff"\n---\nbody\n';
  const a = setToken(md, 'colors.primary', '#222222');
  assert.match(a, /primary: "#222222"   # brand\n {2}canvas/);
  const b = setToken(a, 'rounded.md', '6px');
  assert.match(b, /\nrounded:\n {2}md: "6px"\n---\nbody/);
  const c = setToken(b, 'colors.on-primary', '#ffffff');
  assert.match(c, /canvas: "#ffffff"\n {2}on-primary: "#ffffff"\nrounded:/);
  assert.equal(readFrontMatter(c).colors.primary, '#222222');
});

test('lab use: pointer in .dsx/config.json, other keys kept, DESIGN.md untouched, manifest refreshed', () => {
  const dir = project();
  mkdirSync(join(dir, '.dsx'), { recursive: true });
  writeFileSync(join(dir, '.dsx/config.json'), JSON.stringify({ paths: { captures: 'shots/<module>' }, design: { manifest: 'web/src/dev/options.json' } }));
  const before = readFileSync(join(dir, 'DESIGN.md'), 'utf8');
  const dc = designConfig(dir);
  addOption(dc, 'dense', parseLabArgs(['--variant-of', 'official', '--set', 'spacing.4=12px']));
  useOption(dc, 'dense');
  const cfg = JSON.parse(readFileSync(join(dir, '.dsx/config.json'), 'utf8'));
  assert.equal(cfg.design.active, 'dense');
  assert.equal(cfg.paths.captures, 'shots/<module>');
  assert.equal(readFileSync(join(dir, 'DESIGN.md'), 'utf8'), before);
  const man = JSON.parse(readFileSync(join(dir, 'web/src/dev/options.json'), 'utf8'));
  assert.equal(man.kind, 'dsx-design-options');
  assert.equal(man.active, 'dense');
  assert.equal(man.official.label, 'Orchard Ledger');
  assert.deepEqual(man.options.map((o) => o.name), ['dense']);
  assert.match(man.options[0].markdown, /spacing/);
  useOption(dc, 'official');
  assert.equal(JSON.parse(readFileSync(join(dir, '.dsx/config.json'), 'utf8')).design.active, undefined);
  assert.throws(() => useOption(dc, 'nope'), /not found/);
});

test('lab list and diff: score, problems, readable text in both schemes, changes vs official', () => {
  const dir = project();
  const dc = designConfig(dir);
  addOption(dc, 'bad', parseLabArgs(['--variant-of', 'official', '--set', 'colors.text-primary=#cccccc']));
  addOption(dc, 'carbon', parseLabArgs(['--from-reference', 'carbon-design']));
  const rows = listOptions(dc);
  assert.deepEqual(rows.map((r) => r.id), ['official', 'bad', 'carbon']);
  const [off, bad, carbon] = rows;
  assert.equal(off.score, 100);
  assert.equal(off.pairs.length, 13, '7 main pairs in light, 6 in dark (dark danger not declared)');
  assert.ok(off.pairs.every((p) => p.ok));
  assert.ok(bad.score < off.score);
  assert.ok(bad.errors.some((e) => /text-primary on canvas/.test(e)));
  assert.deepEqual(bad.pairs.filter((p) => !p.ok).map((p) => `${p.id}:${p.scheme}`), ['text-on-background:light', 'text-on-surface:light']);
  assert.deepEqual(bad.diff.changed, [{ path: 'colors.text-primary', from: '#1f2226', to: '#cccccc' }]);
  assert.deepEqual(carbon.schemes, ['dark']);
  assert.equal(carbon.credit, 'designmd.app (CC BY 4.0)');
  const r = spawnSync(process.execPath, [LAB, 'diff', 'official', 'bad', '--json', '--root', dir], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const d = JSON.parse(r.stdout);
  assert.equal(d.changed.length, 1);
  assert.deepEqual(d.contrast.map((x) => x.id), ['text-on-background', 'text-on-surface']);
  const l = spawnSync(process.execPath, [LAB, 'list', '--no-official-lint', '--root', dir], { encoding: 'utf8' });
  assert.equal(l.status, 0, l.stderr);
  assert.match(l.stdout, /bad {2}\(\.dsx\/design-options\/bad\.md\)\n/);
  assert.match(l.stdout, /FAIL text-on-background \(light\) 1\.61:1 < 4\.5/);
  assert.equal(spawnSync(process.execPath, [LAB, 'nope'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync(process.execPath, [LAB, 'use', 'nope', '--root', dir], { encoding: 'utf8' }).status, 2);
});

test('lab promote: only through the gates; keeps the previous file; clears the pointer; runs the theme gate', () => {
  const dir = project();
  mkdirSync(join(dir, '.dsx'), { recursive: true });
  writeFileSync(join(dir, '.dsx/config.json'), JSON.stringify({ design: { theme_gate: `${JSON.stringify(process.execPath)} -e "process.exit(1)"` } }));
  const dc = designConfig(dir);
  const original = readFileSync(join(dir, 'DESIGN.md'), 'utf8');
  addOption(dc, 'bad', parseLabArgs(['--variant-of', 'official', '--set', 'colors.text-primary=#cccccc']));
  addOption(dc, 'dense', parseLabArgs(['--variant-of', 'official', '--set', 'spacing.4=12px']));
  useOption(dc, 'dense');
  const unavailable = () => ({ available: false });
  const r1 = promoteOption(dc, 'bad', { officialLinter: unavailable, allowNoOfficialLint: true });
  assert.equal(r1.promoted, false);
  assert.equal(r1.gates.find((g) => g.gate === 'dsx-lint').ok, false);
  const r2 = promoteOption(dc, 'dense', { officialLinter: unavailable });
  assert.equal(r2.promoted, false, 'official linter unavailable and not allowed → not promoted');
  const r3 = promoteOption(dc, 'dense', { officialLinter: () => ({ available: true, errors: 1, warnings: 0, error_messages: ['x'] }) });
  assert.equal(r3.promoted, false);
  assert.equal(readFileSync(join(dir, 'DESIGN.md'), 'utf8'), original, 'nothing changes while a gate fails');
  const r4 = promoteOption(dc, 'dense', { officialLinter: () => ({ available: true, errors: 0, warnings: 3 }) });
  assert.equal(r4.promoted, true);
  assert.match(r4.previous, /\.dsx\/design-options\/previous-\d{4}-\d{2}-\d{2}\.md$/);
  assert.equal(readFileSync(r4.previous, 'utf8'), original);
  assert.equal(readFileSync(join(dir, 'DESIGN.md'), 'utf8'), readFileSync(join(dir, '.dsx/design-options/dense.md'), 'utf8'));
  assert.equal(designConfig(dir).active, null);
  assert.equal(r4.theme_gate.ok, false, 'the theme gate reports that the code theme has not followed yet');
  const r5 = promoteOption(dc, 'dense', { officialLinter: () => ({ available: true, errors: 0, warnings: 0 }), runGate: false });
  assert.match(r5.previous, /previous-\d{4}-\d{2}-\d{2}-2\.md$/, 'a second promote the same day keeps both copies');
  assert.ok(!optionNames(designConfig(dir)).some((n) => n.startsWith('previous-')), 'kept copies are not options');
});

test('lab bundle-check: finds the switcher marker in a build, passes a clean one', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dsx-dist-'));
  mkdirSync(join(dist, 'assets'));
  writeFileSync(join(dist, 'assets/index.js'), 'console.log("app")');
  assert.deepEqual(scanBundle(dist), []);
  assert.equal(spawnSync(process.execPath, [LAB, 'bundle-check', dist], { encoding: 'utf8' }).status, 0);
  writeFileSync(join(dist, 'assets/lab.js'), 'localStorage.getItem("dsx-design-lab:active")');
  assert.equal(scanBundle(dist).length, 1);
  assert.equal(spawnSync(process.execPath, [LAB, 'bundle-check', dist], { encoding: 'utf8' }).status, 1);
});

// ------------------------------------------------------------------ compare page

const PIXEL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

function sampleModel(dir) {
  const dc = designConfig(dir);
  addOption(dc, 'dense', parseLabArgs(['--variant-of', 'official', '--set', 'spacing.4=12px', '--set', 'rounded.md=6px']));
  const rows = listOptions(dc);
  return {
    module: 'ledger',
    columns: rows.map((r, i) => ({ id: r.id, letter: i ? 'A' : '', official: r.id === 'official', info: r })),
    screens: [{ id: '01-entries', label: 'Entries', cells: { official: PIXEL, dense: PIXEL } }, { id: '02-dlg-delete', label: 'Dlg delete', cells: { official: PIXEL, dense: null } }],
  };
}

test('compare page: grid, summary in plain words, decision without terminal, both languages, both themes', () => {
  const model = sampleModel(project());
  const html = buildComparePage(model, { lang: 'en' });
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Which visual direction should we follow\?/);
  assert.match(html, /prefers-color-scheme:dark/);
  assert.match(html, /:root\[data-theme="dark"\]/);
  assert.equal((html.match(/name="escolha"/g) ?? []).length, 2);
  assert.match(html, /Keep the current one/);
  assert.match(html, /Spacing \(density\)/);
  assert.match(html, /Corner rounding/);
  assert.match(html, /Screen not captured/);
  assert.match(html, /id="copiar">Copy decision</);
  assert.match(html, /data-k="0-1"/);
  assert.doesNotMatch(html, /\btokens?\b/i, 'no jargon in front of the owner');
  const pt = buildComparePage(model, { lang: 'pt-BR' });
  assert.match(pt, /<html lang="pt-BR">/);
  assert.match(pt, /Qual direção visual seguir\?/);
  assert.match(pt, /Copiar decisão/);
  assert.deepEqual(changeGroups(model.columns[1].info.diff).map((g) => g.group), ['spacing', 'rounded']);
});

test('compare page: passes the DSX detectors on its own HTML (screen, text, colors)', () => {
  const html = buildComparePage(sampleModel(project()), { lang: 'en' });
  const screen = analyzeScreen(html, undefined, 'compare.html');
  assert.deepEqual((screen.findings ?? screen.issues ?? []).map((f) => `${f.rule}: ${f.message}`), []);
  const text = analyzeText(html, undefined, 'compare.html');
  assert.deepEqual((text.findings ?? []).map((f) => `${f.rule}: ${f.text ?? f.message}`), []);
  const colors = analyzeHtml(html);
  assert.deepEqual((colors.contrast_failures ?? colors.failures ?? []).map((f) => JSON.stringify(f)), []);
});

test('compare: captures each option through the project command, renders, writes one page', async () => {
  const dir = project();
  const capDir = join(dir, '.dsx/captures/ledger');
  mkdirSync(capDir, { recursive: true });
  for (const f of ['01-entries.html', '02-dlg-delete.html']) writeFileSync(join(capDir, f), `<!doctype html><title>${f}</title><p>official</p>`);
  const script = join(dir, 'capture.mjs');
  writeFileSync(script, `import { mkdirSync, writeFileSync } from 'node:fs';
const out = '.dsx/captures/' + process.env.DSX_CAPTURE_MODULE + '/' + (process.env.DSX_CAPTURE_SUBDIR || '');
if (process.env.DSX_CAPTURE !== '1' || !process.env.DSX_DESIGN_MD || process.env.STITCH_THEME !== process.env.DSX_DESIGN_MD) process.exit(9);
mkdirSync(out, { recursive: true });
writeFileSync(out + '/01-entries.html', '<p>' + process.env.DSX_DESIGN_OPTION + '</p>');
`);
  mkdirSync(join(dir, '.dsx'), { recursive: true });
  writeFileSync(join(dir, '.dsx/config.json'), JSON.stringify({ capture: { command: `${JSON.stringify(process.execPath)} capture.mjs`, module: 'ledger' } }));
  const dc = designConfig(dir);
  addOption(dc, 'dense', parseLabArgs(['--variant-of', 'official', '--set', 'spacing.4=12px']));
  const shots = [];
  const playwright = { module: { chromium: { launch: async () => ({
    newPage: async () => ({ goto: async () => {}, waitForTimeout: async () => {}, evaluate: async () => 1200, screenshot: async ({ path, clip }) => { shots.push(clip); writeFileSync(path, Buffer.from(PIXEL.split(',')[1], 'base64')); } }),
    close: async () => {},
  }) } } };
  const out = join(dir, 'page/compare.html');
  const r = await compare(designConfig(dir), ['dense'], parseLabArgs(['--screens', 'entries,02-dlg-delete', '--out', out, '--lang', 'pt-BR']), { playwright });
  assert.deepEqual(r.columns, ['official', 'dense']);
  assert.equal(r.shots, 3, 'official 2 screens + dense 1 (the dialog was not captured for dense)');
  assert.ok(existsSync(join(capDir, 'options/dense/01-entries.html')), 'option captures land under options/<name>');
  assert.ok(existsSync(join(capDir, 'options/official/01-entries.jpg')), 'official renders are stored next to the options');
  assert.deepEqual(shots[0], { x: 0, y: 0, width: 1440, height: 1200 });
  const html = readFileSync(out, 'utf8');
  assert.match(html, /Qual direção visual seguir/);
  assert.match(html, /data:image\/jpeg;base64/);
  assert.match(html, /Tela não capturada/);
  await assert.rejects(compare(designConfig(dir), ['dense'], parseLabArgs(['--out', out]), { playwright }), /--screens/);
});

test('compare helpers: capture lookup by id, order prefix or state; readable screen labels', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-caps-'));
  for (const f of ['02-list.html', '02-list.empty.html', '05-dlg-confirm.html']) writeFileSync(join(dir, f), '');
  assert.equal(findCapture(dir, 'list'), '02-list.html');
  assert.equal(findCapture(dir, '02-list'), '02-list.html');
  assert.equal(findCapture(dir, 'list.empty'), '02-list.empty.html');
  assert.equal(findCapture(dir, 'missing'), null);
  assert.equal(screenLabel('05-dlg-confirm'), 'Dlg confirm');
  assert.equal(screenLabel('02-list.empty'), 'List (empty)');
  assert.deepEqual(parseLabArgs(['add', 'x', '--set', 'a=1', '--set=b=2', '--force']), { _: ['add', 'x'], set: ['a=1', 'b=2'], force: true });
});

test('roles: main pairs skip undeclared roles and cover both schemes', () => {
  const fm = readFrontMatter(readFileSync(FIXTURE, 'utf8'));
  const pairs = mainPairs(fm);
  assert.deepEqual([...new Set(pairs.map((p) => p.scheme))], ['light', 'dark']);
  assert.equal(pairs.filter((p) => p.scheme === 'dark' && p.id === 'danger-button').length, 0, 'dark danger not declared → not measured');
  assert.deepEqual(tokenDiff(fm, fm).count, 0);
  assert.equal(buildManifest(designConfig(project())).official.name, 'official');
});

test('lint-design-md: colors-dark is checked with the same pairs on the merged palette', async () => {
  const { lintDesignMd } = await import('../lint-design-md.mjs');
  const md = readFileSync(FIXTURE, 'utf8');
  assert.ok(lintDesignMd(md).ok);
  const bad = setToken(md, 'colors-dark.text-primary', '#1f2a3a');
  const r = lintDesignMd(bad);
  assert.ok(r.errors.some((e) => /^Insufficient contrast \(dark\): text-primary on canvas/.test(e)), r.errors.join('\n'));
  assert.ok(r.info.contrast_pairs.some((p) => p.scheme === 'dark'));
  assert.ok(!lintDesignMd(setToken(md, 'colors-dark.canvas', 'navy')).ok, 'dark values must be hex too');
});

test('lab setToken: keys with dots (spacing "0.5") and quoted segments', async () => {
  const { splitTokenPath } = await import('../design-md/lib/options.mjs');
  const md = '---\nname: X\nspacing:\n  "0.5": 4px\n  "1": 8px\n---\n';
  const fm = readFrontMatter(md);
  assert.deepEqual(splitTokenPath(fm, 'spacing.0.5'), ['spacing', '0.5']);
  assert.deepEqual(splitTokenPath(fm, 'spacing."1.5"'), ['spacing', '1.5']);
  assert.deepEqual(splitTokenPath(fm, 'typography.body.fontSize'), ['typography', 'body', 'fontSize']);
  const out = setToken(setToken(md, 'spacing.0.5', '3px'), 'spacing."1.5"', '9px');
  assert.deepEqual(readFrontMatter(out).spacing, { '0.5': '3px', 1: '8px', '1.5': '9px' });
});

test('mui adapter over a product theme: derived shades rebuilt, product values kept where the option is silent', { skip: tsSkip }, async () => {
  const [d, mui] = await adapters();
  const design = d.parseDesignMd(readFileSync(FIXTURE, 'utf8'));
  const outer = {
    palette: {
      mode: 'light',
      primary: { main: '#0b6bcb', dark: '#08497f', light: '#5a9be0', contrastText: '#ffffff' },
      secondary: { main: '#334155', contrastText: '#ffffff' },
      error: { main: '#d32f2f', contrastText: '#ffffff' }, warning: { main: '#ed6c02' }, info: { main: '#0288d1' }, success: { main: '#2e7d32' },
      background: { default: '#fafbfc', paper: '#ffffff' }, text: { primary: '#1e2130', secondary: '#64748b' }, divider: '#cbd5e1',
    },
    typography: { fontFamily: 'Roboto', h5: { fontFamily: 'Roboto', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' }, button: { fontFamily: 'Roboto', textTransform: 'none' } },
    shape: { borderRadius: 10 },
    spacing: (n) => `${n * 8}px`,
    components: { MuiTableHead: { styleOverrides: { root: { backgroundColor: '#0b6bcb', '& .MuiTableCell-head': { color: '#ffffff', textTransform: 'uppercase' } } } } },
  };
  const o = mui.themeOptionsOver(outer, design);
  assert.equal(o.palette.primary.main, '#5754ed');
  assert.equal(o.palette.primary.light, undefined, 'the product shades of the old primary are not carried over');
  assert.equal(o.palette.warning.main, '#683601', 'declared by the option');
  assert.equal(o.palette.text.primary, '#1f2226');
  assert.equal(typeof o.spacing, 'number', 'numeric spacing for createTheme, never the product function');
  assert.equal(o.typography.h5.fontFamily, undefined, 'new family: the product per-variant family goes away');
  assert.equal(o.typography.h5.letterSpacing, '-0.01em', 'other product typography stays');
  assert.equal(o.typography.button.textTransform, 'none');
  assert.equal(o.components.MuiTableHead.styleOverrides.root['& .MuiTableCell-head'].textTransform, 'uppercase', 'product overrides merged');
  assert.equal(o.components.MuiTableHead.styleOverrides.root.backgroundColor, '#f4f7fc', 'option recolors the fixed header');
  const silent = d.parseDesignMd('---\nname: S\ncolors:\n  primary: "#123456"\ntypography:\n  body:\n    fontSize: 14px\n---\n');
  const s = mui.themeOptionsOver(outer, silent);
  assert.equal(s.palette.secondary.main, '#334155', 'secondary undeclared → product value');
  assert.equal(s.palette.background.default, '#fafbfc');
  assert.equal(s.shape.borderRadius, 10);
  assert.equal(s.spacing, 8);
  assert.equal(s.typography.h5.fontFamily, 'Roboto', 'no new family: product families kept');
  const carbon = mui.themeOptionsOver(outer, d.parseDesignMd(readFileSync(join(REFS, 'carbon-design.md'), 'utf8')));
  assert.equal(carbon.palette.mode, 'dark');
  assert.equal(carbon.palette.background.default, '#161616');
  assert.equal(carbon.palette.text.secondary, undefined, 'a light product secondary text is not carried into a dark option');
});
