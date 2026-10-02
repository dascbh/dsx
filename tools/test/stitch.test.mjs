import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exportar, conferir, raioStitch, fonteStitch, lerListaStitch } from '../stitch/design-system.mjs';
import { analisar } from '../stitch/analisar-html.mjs';

const DESIGN = readFileSync('examples/DESIGN.md', 'utf8');
const coresDsx = () => {
  const out = {};
  for (const m of DESIGN.split('---')[1].matchAll(/^ {2}([a-z-]+): "(#[0-9a-f]{6})"/gm)) out[m[1].replace(/-/g, '_')] = m[2];
  return out;
};
/** Resposta de list_design_systems no formato observado no Stitch real. */
const lista = (theme) => JSON.stringify({ designSystems: [{ name: 'assets/abc', designSystem: { displayName: 'DSX Base', theme } }] });

test('exportar declara DEFAULT = raio de controle, sem mexer no resto', () => {
  const { texto, esperado } = exportar(DESIGN);
  assert.match(texto, /^rounded:\n {2}DEFAULT: 8px\n {2}sm: 4px/m);
  assert.equal(texto.replace('  DEFAULT: 8px\n', ''), DESIGN);
  assert.equal(esperado.roundness, 'ROUND_EIGHT');
  assert.equal(exportar(texto).texto, texto, 'idempotente');
});

test('raio e fonte no vocabulário do Stitch', () => {
  assert.equal(raioStitch('8px'), 'ROUND_EIGHT');
  assert.equal(raioStitch('0.25rem'), 'ROUND_FOUR');
  assert.equal(raioStitch('10px'), 'ROUND_EIGHT');
  assert.equal(raioStitch('9999px'), 'ROUND_FULL');
  assert.equal(fonteStitch('Inter'), 'INTER');
  assert.equal(fonteStitch('"IBM Plex Sans", system-ui'), 'IBM_PLEX_SANS');
  assert.equal(fonteStitch('Roboto'), 'ROBOTO_FLEX');
  assert.equal(fonteStitch('Fonte Inventada'), null);
});

test('conferir: importado com exportar → conforme (marca em primary-container é mapeamento, não erro)', () => {
  const nc = { ...coresDsx(), primary: '#3d37d4', primary_container: '#5754ed', tertiary_fixed_dim: '#ffb68f' };
  const r = conferir(DESIGN, lerListaStitch(lista({ roundness: 'ROUND_EIGHT', headlineFont: 'INTER', bodyFont: 'INTER', namedColors: nc })));
  assert.equal(r.ok, true, r.problemas.join('; '));
  assert.ok(r.avisos.some((a) => a.includes('primary-container')));
  assert.equal(r.mapeamento['tertiary-fixed-dim'], 'color.feedback.warning-icon');
});

test('conferir: importado sem DEFAULT → raio 4px reprova', () => {
  const r = conferir(DESIGN, lerListaStitch(lista({ roundness: 'ROUND_FOUR', namedColors: coresDsx() })));
  assert.equal(r.ok, false);
  assert.ok(r.problemas.some((p) => p.includes('ROUND_FOUR')));
});

test('conferir: depois de update_design_system as cores do DSX somem → reprova', () => {
  const r = conferir(DESIGN, lerListaStitch(lista({ roundness: 'ROUND_EIGHT', namedColors: { primary: '#3d37d4', surface: '#f8f9ff', primary_container: '#5754ed' } })));
  assert.equal(r.ok, false);
  assert.ok(r.problemas.some((p) => p.includes('sumiram')));
});

test('conferir: paleta ainda não processada → reprova pedindo nova leitura', () => {
  const r = conferir(DESIGN, lerListaStitch(lista({ roundness: 'ROUND_EIGHT' })));
  assert.equal(r.ok, false);
  assert.ok(r.problemas[0].includes('assíncrona'));
});

const HTML = (corpo) => `<!DOCTYPE html><html lang="pt-BR"><head>
<script>tailwind.config = { theme: { extend: { colors: { "primary": "#3d37d4", "primary-container": "#5754ed", "on-primary": "#ffffff",
"canvas": "#ffffff", "text-primary": "#1f2226", "text-muted": "#627187", "surface-variant": "#e4e1ee", "pale": "#dddddd" },
borderRadius: { "DEFAULT": "0.5rem", "full": "9999px" } } } }</script></head><body>${corpo}</body></html>`;
const PAPEIS = ['primary', 'on-primary', 'canvas', 'text-primary', 'text-muted'];

test('analisar: separa papéis do DSX e do Stitch, com destino no DSX', () => {
  const r = analisar(HTML('<h1 class="text-text-primary">Clientes</h1><button class="bg-primary-container text-on-primary">Adicionar cliente</button><div class="bg-surface-variant text-text-primary">x</div>'), { papeisDsx: PAPEIS });
  assert.equal(r.cores.totalUsos, 5);
  assert.equal(r.cores.usosDsx, 3);
  assert.equal(r.cores.papeis.find((p) => p.papel === 'surface-variant').mapearPara, 'color.bg.sunken');
  assert.equal(r.ok, true);
});

test('analisar: reprova contraste ruim, botão sem nome, clicável sem teclado e campo sem rótulo', () => {
  const r = analisar(HTML(`<h1>T</h1>
    <p class="bg-canvas text-pale">texto claro demais</p>
    <button class="p-2"><span class="material-symbols-outlined">close</span></button>
    <tr class="cursor-pointer"><td>linha</td></tr>
    <input type="text" placeholder="Buscar">`), { papeisDsx: PAPEIS });
  assert.equal(r.ok, false);
  const regras = r.falhas.join(' | ');
  assert.match(regras, /contraste/);
  assert.match(regras, /botão sem nome/);
  assert.match(regras, /clicável sem acesso por teclado/);
  assert.match(regras, /campo sem rótulo/);
});

test('analisar: o que está certo passa — aria-label, label for, linha com tabindex', () => {
  const r = analisar(HTML(`<h1>T</h1>
    <button aria-label="Fechar"><span class="material-symbols-outlined">close</span></button>
    <tr class="cursor-pointer" tabindex="0"><td>linha</td></tr>
    <label for="q">Buscar cliente</label><input id="q" type="text">
    <a href="/clientes/1" aria-label="Ver detalhes de Acme"><span class="material-symbols-outlined">chevron_right</span></a>`), { papeisDsx: PAPEIS });
  assert.deepEqual(r.falhas, []);
});

test('analisar: valores arbitrários do Tailwind são contados', () => {
  const r = analisar(HTML('<h1>T</h1><div class="bg-[#ff0000] p-[13px]">x</div>'));
  assert.deepEqual(r.arbitrarios, ['bg-[#ff0000]', 'p-[13px]']);
});
