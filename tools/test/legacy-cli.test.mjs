import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEGACY_CLI, normalizeArgv, parseCli } from '../lib/legacy-cli.mjs';

const run = (tool, argv) => { const w = []; const out = normalizeArgv(tool, argv, (m) => w.push(m)); return { out, w }; };

test('legacy CLI: old subcommand runs the new one with a warning', () => {
  const { out, w } = run('stitch/design-system.mjs', ['exportar', 'DESIGN.md', '-o', 'x.md']);
  assert.deepEqual(out, ['export', 'DESIGN.md', '-o', 'x.md']);
  assert.match(w[0], /"exportar" is an old name, use "export"/);
});

test('legacy CLI: only the first positional is treated as subcommand', () => {
  const { out } = run('references.mjs', ['evaluate', 'buscar']);
  assert.deepEqual(out, ['evaluate', 'buscar']);
});

test('legacy CLI: old flags (separate and inline) become new flags', () => {
  const { out, w } = run('ux-lint/text.mjs', ['--telas', 'caps', '--codigo=src', '--json']);
  assert.deepEqual(out, ['--screens', 'caps', '--code=src', '--json']);
  assert.equal(w.length, 2);
});

test('legacy CLI: old values of a flag are translated', () => {
  const a = parseCli('references.mjs', ['buscar', '--registro', 'operacional', '--tema=claro', '--curados'], () => {});
  assert.deepEqual(a._, ['search']);
  assert.equal(a.register, 'operational');
  assert.equal(a.theme, 'light');
  assert.equal(a.curated, true);
});

test('legacy CLI: new names pass untouched and silent; unknown tool is a no-op', () => {
  const { out, w } = run('ux-lint/screen.mjs', ['caps', '--fail-at', '3']);
  assert.deepEqual(out, ['caps', '--fail-at', '3']);
  assert.equal(w.length, 0);
  assert.deepEqual(run('nao-existe.mjs', ['--x']).out, ['--x']);
});

test('legacy CLI: every tool in the table exists and uses the table', () => {
  for (const tool of Object.keys(LEGACY_CLI)) {
    const src = readFileSync(new URL(`../${tool}`, import.meta.url), 'utf8');
    assert.ok(src.includes(`'${tool}'`) && /legacy-cli\.mjs/.test(src), `${tool} does not use tools/lib/legacy-cli.mjs`);
  }
});
