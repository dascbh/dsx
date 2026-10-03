import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exportDesignMd, checkDesignSystem, stitchRadius, stitchFont, readStitchList } from '../stitch/design-system.mjs';
import { analyzeHtml } from '../stitch/analyze-html.mjs';

const DESIGN = readFileSync('examples/DESIGN.md', 'utf8');
const dsxColors = () => {
  const out = {};
  for (const m of DESIGN.split('---')[1].matchAll(/^ {2}([a-z-]+): "(#[0-9a-f]{6})"/gm)) out[m[1].replace(/-/g, '_')] = m[2];
  return out;
};
/** Resposta de list_design_systems no formato observado no Stitch real. */
const list = (theme) => JSON.stringify({ designSystems: [{ name: 'assets/abc', designSystem: { displayName: 'DSX Base', theme } }] });

test('export declares DEFAULT = control radius without touching the rest', () => {
  const { text, expected } = exportDesignMd(DESIGN);
  assert.match(text, /^rounded:\n {2}DEFAULT: 8px\n {2}sm: 4px/m);
  assert.equal(text.replace('  DEFAULT: 8px\n', ''), DESIGN);
  assert.equal(expected.roundness, 'ROUND_EIGHT');
  assert.equal(exportDesignMd(text).text, text, 'idempotente');
});

test('radius and font in the Stitch vocabulary', () => {
  assert.equal(stitchRadius('8px'), 'ROUND_EIGHT');
  assert.equal(stitchRadius('0.25rem'), 'ROUND_FOUR');
  assert.equal(stitchRadius('10px'), 'ROUND_EIGHT');
  assert.equal(stitchRadius('9999px'), 'ROUND_FULL');
  assert.equal(stitchFont('Inter'), 'INTER');
  assert.equal(stitchFont('"IBM Plex Sans", system-ui'), 'IBM_PLEX_SANS');
  assert.equal(stitchFont('Roboto'), 'ROBOTO_FLEX');
  assert.equal(stitchFont('Fonte Inventada'), null);
});

test('check: imported with export → compliant (brand in primary-container is a mapping, not an error)', () => {
  const nc = { ...dsxColors(), primary: '#3d37d4', primary_container: '#5754ed', tertiary_fixed_dim: '#ffb68f' };
  const r = checkDesignSystem(DESIGN, readStitchList(list({ roundness: 'ROUND_EIGHT', headlineFont: 'INTER', bodyFont: 'INTER', namedColors: nc })));
  assert.equal(r.ok, true, r.problems.join('; '));
  assert.ok(r.warnings.some((a) => a.includes('primary-container')));
  assert.equal(r.mapping['tertiary-fixed-dim'], 'color.feedback.warning-icon');
});

test('check: imported without DEFAULT → 4px radius fails', () => {
  const r = checkDesignSystem(DESIGN, readStitchList(list({ roundness: 'ROUND_FOUR', namedColors: dsxColors() })));
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('ROUND_FOUR')));
});

test('check: after update_design_system the DSX colors vanish → fails', () => {
  const r = checkDesignSystem(DESIGN, readStitchList(list({ roundness: 'ROUND_EIGHT', namedColors: { primary: '#3d37d4', surface: '#f8f9ff', primary_container: '#5754ed' } })));
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('sumiram')));
});

test('check: palette not processed yet → fails asking to list again', () => {
  const r = checkDesignSystem(DESIGN, readStitchList(list({ roundness: 'ROUND_EIGHT' })));
  assert.equal(r.ok, false);
  assert.ok(r.problems[0].includes('assíncrona'));
});

const HTML = (body) => `<!DOCTYPE html><html lang="pt-BR"><head>
<script>tailwind.config = { theme: { extend: { colors: { "primary": "#3d37d4", "primary-container": "#5754ed", "on-primary": "#ffffff",
"canvas": "#ffffff", "text-primary": "#1f2226", "text-muted": "#627187", "surface-variant": "#e4e1ee", "pale": "#dddddd" },
borderRadius: { "DEFAULT": "0.5rem", "full": "9999px" } } } }</script></head><body>${body}</body></html>`;
const ROLES = ['primary', 'on-primary', 'canvas', 'text-primary', 'text-muted'];

test('analyze: separates DSX and Stitch roles, with a DSX target', () => {
  const r = analyzeHtml(HTML('<h1 class="text-text-primary">Clientes</h1><button class="bg-primary-container text-on-primary">Adicionar cliente</button><div class="bg-surface-variant text-text-primary">x</div>'), { dsxRoles: ROLES });
  assert.equal(r.colors.total_uses, 5);
  assert.equal(r.colors.dsx_uses, 3);
  assert.equal(r.colors.roles.find((p) => p.role === 'surface-variant').map_to, 'color.bg.sunken');
  assert.equal(r.ok, true);
});

test('analyze: fails poor contrast, unnamed button, clickable without keyboard and unlabelled field', () => {
  const r = analyzeHtml(HTML(`<h1>T</h1>
    <p class="bg-canvas text-pale">texto claro demais</p>
    <button class="p-2"><span class="material-symbols-outlined">close</span></button>
    <tr class="cursor-pointer"><td>linha</td></tr>
    <input type="text" placeholder="Buscar">`), { dsxRoles: ROLES });
  assert.equal(r.ok, false);
  const rules = r.failures.join(' | ');
  assert.match(rules, /contraste/);
  assert.match(rules, /botão sem nome/);
  assert.match(rules, /clicável sem acesso por teclado/);
  assert.match(rules, /campo sem rótulo/);
});

test('analyze: what is right passes — aria-label, label for, row with tabindex', () => {
  const r = analyzeHtml(HTML(`<h1>T</h1>
    <button aria-label="Fechar"><span class="material-symbols-outlined">close</span></button>
    <tr class="cursor-pointer" tabindex="0"><td>linha</td></tr>
    <label for="q">Buscar cliente</label><input id="q" type="text">
    <a href="/clientes/1" aria-label="Ver detalhes de Acme"><span class="material-symbols-outlined">chevron_right</span></a>`), { dsxRoles: ROLES });
  assert.deepEqual(r.failures, []);
});

test('analyze: arbitrary Tailwind values are counted', () => {
  const r = analyzeHtml(HTML('<h1>T</h1><div class="bg-[#ff0000] p-[13px]">x</div>'));
  assert.deepEqual(r.arbitrary, ['bg-[#ff0000]', 'p-[13px]']);
});

test('CLI: old subcommand "exportar" runs export and warns with the new name', async () => {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, ['tools/stitch/design-system.mjs', 'exportar', 'examples/DESIGN.md'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /DEFAULT/);
  assert.match(r.stderr, /"exportar" é nome antigo, use "export"/);
});
