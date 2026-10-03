import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, hexToOklch, oklchToHex } from '../lib/color.mjs';
import { palette } from '../palette.mjs';
import { typeScale, fluidScale } from '../type-scale.mjs';
import { spacingScale } from '../spacing-scale.mjs';
import { flatten, resolve, build, checkContrast } from '../build-tokens.mjs';
import { lintDesignMd } from '../lint-design-md.mjs';
import { lintText } from '../lint-raw-values.mjs';
import { parseYaml } from '../lib/yaml-lite.mjs';

test('WCAG contrast: reference values', () => {
  assert.equal(contrast('#000000', '#ffffff').toFixed(2), '21.00');
  assert.equal(contrast('#ffffff', '#ffffff').toFixed(2), '1.00');
  assert.equal(contrast('#767676', '#ffffff').toFixed(2), '4.54');
});

test('OKLCH round trip preserves the color', () => {
  for (const hex of ['#4f46e5', '#16a34a', '#64748b']) assert.equal(oklchToHex(hexToOklch(hex)), hex);
});

test('palette: 11 steps, decreasing lightness, step 600 readable with white text', () => {
  const p = palette('#4f46e5');
  const steps = Object.keys(p);
  assert.equal(steps.length, 11);
  const contrasts = steps.map((s) => p[s].contrast_white);
  for (let i = 1; i < contrasts.length; i++) assert.ok(contrasts[i] > contrasts[i - 1]);
  assert.ok(p[600].contrast_white >= 4.5);
});

test('type scale: base at step 0 and growth by ratio', () => {
  const s = typeScale({ base: 16, ratio: 'major-third' });
  const body = s.steps.find((x) => x.step === 0);
  assert.equal(body.px, 16);
  assert.equal(s.steps.find((x) => x.step === 2).px, 25);
  assert.match(fluidScale({}).steps[0].value, /^clamp\(/);
});

test('spacing: multiples of the base', () => {
  for (const s of spacingScale(4)) assert.equal(s.px % 2, 0);
  assert.equal(spacingScale(8).find((s) => s.token === '2').px, 16);
});

test('tokens: aliases resolve and cycles are detected', () => {
  const flat = flatten({ a: { $value: '#fff' }, b: { $value: '{a}' }, c: { $value: '{b}' } });
  assert.equal(resolve(flat).c, '#fff');
  assert.throws(() => resolve(flatten({ x: { $value: '{y}' }, y: { $value: '{x}' } })), /circular/);
});

test('repository tokens: all contrast pairs pass in both themes', () => {
  const { resolved } = build();
  const fails = checkContrast(resolved).filter((r) => !r.ok);
  assert.deepEqual(fails, []);
});

test('DESIGN.md lint: example passes, template fails', () => {
  assert.equal(lintDesignMd(readFileSync('examples/DESIGN.md', 'utf8')).ok, true);
  const t = lintDesignMd(readFileSync('templates/DESIGN.md', 'utf8'));
  assert.equal(t.ok, false);
});

test('DESIGN.md lint: detects broken reference and poor contrast', () => {
  const md = `---\nname: X\ncolors:\n  canvas: "#ffffff"\n  primary: "#cccccc"\n  on-primary: "#ffffff"\ntypography:\n  body:\n    fontSize: 16px\n    lineHeight: 1.5\ncomponents:\n  b:\n    backgroundColor: "{colors.nope}"\n---\n## Overview\nx\n`;
  const r = lintDesignMd(md);
  assert.ok(r.errors.some((e) => e.includes('{colors.nope}')));
  assert.ok(r.errors.some((e) => e.includes('on-primary sobre primary')));
});

test('yaml-lite: nested maps and scalars', () => {
  const y = parseYaml('a:\n  b: "#fff"\n  c: 1.5\nd: texto # comentário');
  assert.deepEqual(y, { a: { b: '#fff', c: 1.5 }, d: 'texto' });
});

test('raw values lint: flags hex/px and honors dsx-ignore', () => {
  const hits = lintText('.a { color: #ff0000; margin: 13px; }\n.b { color: #000; } /* dsx-ignore */');
  assert.deepEqual(hits.map((h) => h.rule).sort(), ['color-hex', 'loose-px']);
});

test('skills and agents front matter: name and description quoted (strict YAML)', async () => {
  const { readdirSync, existsSync } = await import('node:fs');
  const files = [
    ...readdirSync('skills').map((d) => `skills/${d}/SKILL.md`).filter((f) => existsSync(f)),
    ...readdirSync('agents').filter((f) => f.endsWith('.md')).map((f) => `agents/${f}`),
  ];
  for (const f of files) {
    const fm = readFileSync(f, 'utf8').split('---')[1];
    assert.match(fm, /^name: [a-z0-9-]+$/m, `${f}: name`);
    // Sem aspas, ": " no meio do texto quebra o YAML e a skill aparece sem descrição.
    assert.match(fm, /^description: "(?:[^"\\]|\\.)+"$/m, `${f}: description deve ser uma string entre aspas`);
  }
});
