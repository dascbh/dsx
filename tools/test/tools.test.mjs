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

test('contraste WCAG: valores de referência', () => {
  assert.equal(contrast('#000000', '#ffffff').toFixed(2), '21.00');
  assert.equal(contrast('#ffffff', '#ffffff').toFixed(2), '1.00');
  assert.equal(contrast('#767676', '#ffffff').toFixed(2), '4.54');
});

test('OKLCH ida e volta preserva a cor', () => {
  for (const hex of ['#4f46e5', '#16a34a', '#64748b']) assert.equal(oklchToHex(hexToOklch(hex)), hex);
});

test('paleta: 11 passos, luminosidade decrescente, passo 600 legível com texto branco', () => {
  const p = palette('#4f46e5');
  const steps = Object.keys(p);
  assert.equal(steps.length, 11);
  const contrasts = steps.map((s) => p[s].contrasteBranco);
  for (let i = 1; i < contrasts.length; i++) assert.ok(contrasts[i] > contrasts[i - 1]);
  assert.ok(p[600].contrasteBranco >= 4.5);
});

test('escala tipográfica: base no passo 0 e crescimento pela razão', () => {
  const s = typeScale({ base: 16, ratio: 'major-third' });
  const body = s.steps.find((x) => x.step === 0);
  assert.equal(body.px, 16);
  assert.equal(s.steps.find((x) => x.step === 2).px, 25);
  assert.match(fluidScale({}).steps[0].value, /^clamp\(/);
});

test('espaçamento: múltiplos da base', () => {
  for (const s of spacingScale(4)) assert.equal(s.px % 2, 0);
  assert.equal(spacingScale(8).find((s) => s.token === '2').px, 16);
});

test('tokens: aliases resolvem e ciclos são detectados', () => {
  const flat = flatten({ a: { $value: '#fff' }, b: { $value: '{a}' }, c: { $value: '{b}' } });
  assert.equal(resolve(flat).c, '#fff');
  assert.throws(() => resolve(flatten({ x: { $value: '{y}' }, y: { $value: '{x}' } })), /circular/);
});

test('tokens do repositório: todos os pares de contraste passam nos dois temas', () => {
  const { resolved } = build();
  const fails = checkContrast(resolved).filter((r) => !r.ok);
  assert.deepEqual(fails, []);
});

test('lint DESIGN.md: exemplo aprovado, template reprovado', () => {
  assert.equal(lintDesignMd(readFileSync('examples/DESIGN.md', 'utf8')).ok, true);
  const t = lintDesignMd(readFileSync('templates/DESIGN.md', 'utf8'));
  assert.equal(t.ok, false);
});

test('lint DESIGN.md: detecta referência quebrada e contraste ruim', () => {
  const md = `---\nname: X\ncolors:\n  canvas: "#ffffff"\n  primary: "#cccccc"\n  on-primary: "#ffffff"\ntypography:\n  body:\n    fontSize: 16px\n    lineHeight: 1.5\ncomponents:\n  b:\n    backgroundColor: "{colors.nope}"\n---\n## Overview\nx\n`;
  const r = lintDesignMd(md);
  assert.ok(r.errors.some((e) => e.includes('{colors.nope}')));
  assert.ok(r.errors.some((e) => e.includes('on-primary sobre primary')));
});

test('yaml-lite: mapas aninhados e escalares', () => {
  const y = parseYaml('a:\n  b: "#fff"\n  c: 1.5\nd: texto # comentário');
  assert.deepEqual(y, { a: { b: '#fff', c: 1.5 }, d: 'texto' });
});

test('lint de valores crus: acusa hex/px e respeita dsx-ignore', () => {
  const hits = lintText('.a { color: #ff0000; margin: 13px; }\n.b { color: #000; } /* dsx-ignore */');
  assert.deepEqual(hits.map((h) => h.rule).sort(), ['cor-hex', 'px-solto']);
});
