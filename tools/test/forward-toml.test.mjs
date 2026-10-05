import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseToml, tomlString, tomlValue, tomlStringList, TomlError } from '../forward/lib/toml-lite.mjs';

test('toml-lite: tables, arrays of tables, scalars and comments', () => {
  const d = parseToml(`
# comment
title = "Purchase orders" # trailing comment
count = 1_000
ratio = 0.5
neg = -3
on = true
when = 2026-10-05
stamp = 2026-10-05T12:00:00Z

[meta]
kind = 'adversarial'
"quoted key" = "x"
a.b.c = 1

[[finding]]
id = "F1"
severity = "high"

[[finding]]
id = "F2"
`);
  assert.equal(d.title, 'Purchase orders');
  assert.equal(d.count, 1000);
  assert.equal(d.ratio, 0.5);
  assert.equal(d.neg, -3);
  assert.equal(d.on, true);
  assert.equal(d.when, '2026-10-05');
  assert.equal(d.stamp, '2026-10-05T12:00:00Z');
  assert.equal(d.meta.kind, 'adversarial');
  assert.equal(d.meta['quoted key'], 'x');
  assert.equal(d.meta.a.b.c, 1);
  assert.deepEqual(d.finding.map((f) => f.id), ['F1', 'F2']);
});

test('toml-lite: multi-line strings, escapes and multi-line arrays', () => {
  const d = parseToml(`
evidence = """
Line one
Line "two" with \\"escapes\\" and \\u00e9.
"""
literal = '''
raw \\n stays'''
trim = """\\
   joined \\
   text"""
list = [
  "a", # comment inside
  "b",
]
nested = [[1, 2], ["x"]]
inline = { a = 1, b = "two" }
empty = []
`);
  assert.equal(d.evidence, 'Line one\nLine "two" with "escapes" and é.\n');
  assert.equal(d.literal, 'raw \\n stays');
  assert.equal(d.trim, 'joined text');
  assert.deepEqual(d.list, ['a', 'b']);
  assert.deepEqual(d.nested, [[1, 2], ['x']]);
  assert.deepEqual(d.inline, { a: 1, b: 'two' });
  assert.deepEqual(d.empty, []);
});

test('toml-lite: errors name the line, duplicates are rejected', () => {
  assert.throws(() => parseToml('a = 1\na = 2'), (e) => e instanceof TomlError && e.line === 2);
  assert.throws(() => parseToml('[t]\n[t]'), /defined twice/);
  assert.throws(() => parseToml('x = "open'), /single-line|unterminated/);
  assert.throws(() => parseToml('x = {{PLACEHOLDER}}'), TomlError);
});

test('toml-lite: writer output reads back to the same values', () => {
  const values = { s: 'a "quoted"\tvalue \\ with backslash', nl: 'two\nlines', n: 3, b: false, arr: ['x', 'y'], obj: { k: 'v' } };
  const text = Object.entries(values).map(([k, v]) => `${k} = ${tomlValue(v)}`).join('\n') + `\nlist = ${tomlStringList(['one', 'two "2"'])}\n`;
  const back = parseToml(text);
  assert.deepEqual({ ...back, list: undefined }, { ...values, list: undefined });
  assert.deepEqual(back.list, ['one', 'two "2"']);
  assert.equal(tomlString('plain'), '"plain"');
});
