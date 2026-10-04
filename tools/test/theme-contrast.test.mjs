import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEME_TOKENS } from '../ux-lint/text-page.mjs';
import { contrast } from '../lib/color.mjs';

// Tokens das páginas geradas pelo ux-lint (achados e variações), nos dois temas: o escuro herda do claro o que
// não redefine.
function themes(css) {
  const block = (re) => Object.fromEntries([...(re.exec(css)?.[1] ?? '').matchAll(/--([a-z-]+):(#[0-9A-Fa-f]{3,6})/g)].map((m) => [m[1], m[2]]));
  const light = block(/^:root\{([^}]*)\}/m);
  const dark = { ...light, ...block(/:root\[data-theme="dark"\]\{([^}]*)\}/) };
  const media = { ...light, ...block(/prefers-color-scheme:dark\)\{:root:not\(\[data-theme="light"\]\)\{([^}]*)\}/) };
  return { light, dark, media };
}

const TEXT = [
  ['fg', 'bg'], ['fg', 'surface'], ['muted', 'bg'], ['muted', 'surface'], ['accent', 'surface'], ['accent', 'bg'],
  ['on-accent', 'accent'], ['fg', 'accent-soft'], ['muted', 'accent-soft'], ['accent', 'accent-soft'],
  ['ok', 'ok-soft'], ['warn', 'warn-soft'], ['bad', 'bad-soft'], ['ok', 'surface'], ['bad', 'surface'], ['warn', 'surface'],
];
const CONTROL = [['control-line', 'surface'], ['control-line', 'bg']];

test('theme tokens: text over background ≥ 4.5:1 and control border ≥ 3:1, in light and dark', () => {
  const t = themes(THEME_TOKENS);
  assert.deepEqual(t.dark, t.media, 'o tema escuro pelo sistema e o forçado têm os mesmos valores');
  for (const [name, tok] of Object.entries({ light: t.light, dark: t.dark })) {
    for (const [a, b] of TEXT) {
      assert.ok(tok[a] && tok[b], `${name}: falta --${a} ou --${b}`);
      const r = contrast(tok[a], tok[b]);
      assert.ok(r >= 4.5, `${name}: --${a} sobre --${b} = ${r.toFixed(2)}:1 (mín. 4,5)`);
    }
    for (const [a, b] of CONTROL) {
      const r = contrast(tok[a], tok[b]);
      assert.ok(r >= 3, `${name}: --${a} contra --${b} = ${r.toFixed(2)}:1 (mín. 3)`);
    }
  }
});

test('theme tokens: dark accent needs dark text (white on #5AA9E6 is 2.5:1)', () => {
  const t = themes(THEME_TOKENS);
  assert.ok(contrast('#FFFFFF', t.dark.accent) < 4.5, 'o accent escuro é claro: texto branco não serve');
  assert.notEqual(t.dark['on-accent'].toUpperCase(), '#FFFFFF');
});
