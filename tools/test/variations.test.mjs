import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  manifestPath, rootFromManifest, validateManifest, loadRegistry, loadCatalogs, measureRow, measureCapture, divergences,
  lintManifest, makeDecision, parseCompose, writeDecision, rowsOf, countWords,
} from '../ux-lint/variations.mjs';
import { renderVariationsPages, groupsOf, delta, paginateRows, slidesOf, heroOf, todaySlideFor, plainFinding, badgeOf, leaders, kpisOf } from '../ux-lint/lib/variations-page.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'variations');
const FILE = manifestPath({ root: ROOT, module: 'demo', flow: 'assistente' });
const load = () => JSON.parse(readFileSync(FILE, 'utf8'));
const cfg = configFrom({});
const registry = loadRegistry(ROOT, 'demo').items;
const catalogs = loadCatalogs();

test('manifest path and root round-trip', () => {
  assert.equal(rootFromManifest(FILE), ROOT);
  assert.ok(existsSync(FILE));
});

test('validate: fixture passes, with a warning for the variant that does not change text', () => {
  const r = validateManifest(load(), { root: ROOT, catalogs, registry });
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some((w) => /"b".*texto/.test(w)));
});

test('validate: missing capture, unknown pattern/law/archetype, unknown finding, copied frames and fake variation are errors', () => {
  const m = load();
  m.variants[0].frames[0].capture = 'nao/existe.html';
  m.variants[0].patterns.push('nao-existe');
  m.variants[0].laws = ['lei-inventada'];
  m.variants[0].archetype = 'arquetipo-inventado';
  m.variants[0].resolves.push('t-ffffffff');
  m.variants[1].frames[0].capture = m.current.frames[0].capture;
  m.variants[1].changes = { screen: '', flow: '', behavior: '', text: 'troca o rótulo' };
  delete m.variants[1].metrics.decisions;
  const { errors } = validateManifest(m, { root: ROOT, catalogs, registry });
  for (const re of [/captura não existe/, /padrão "nao-existe"/, /lei "lei-inventada"/, /arquétipo "arquetipo-inventado"/, /"t-ffffffff" não existe/, /mesma captura de "current"/, /muda só Texto/, /"decisions" ausente/]) {
    assert.ok(errors.some((e) => re.test(e)), `faltou erro ${re}: ${errors.join(' | ')}`);
  }
});

test('measure: words exclude the header and nav shell; primaries and dialogs come from the UX.md selectors', () => {
  assert.equal(countWords('Gerar 4 documentos — já'), 4);
  const html = '<body><header>Produto Demo Grande</header><main><h1>Um dois</h1><button class="MuiButton-contained">Três</button></main><div role="dialog" hidden>x</div></body>';
  assert.deepEqual(measureCapture(html, cfg), { words: 3, primary_actions: 1, dialog_open: false });
  assert.equal(measureCapture('<body><main><p aria-live="polite">anúncio</p><input value="Ana Souza"><p>um</p></main></body>', cfg).words, 3);
  const dlg = '<body><main><p>muitas palavras aqui fora</p></main><div role="dialog"><h2>Excluir</h2><button class="MuiButton-contained">Excluir</button></div></body>';
  assert.deepEqual(measureCapture(dlg, cfg), { words: 2, primary_actions: 1, dialog_open: true });
  const m = load();
  const cur = measureRow(rowsOf(m)[0], { root: ROOT, cfg });
  assert.deepEqual(cur.metrics, { words_on_screen: 26, primary_actions: 2, dialogs: 0 });
  assert.deepEqual(divergences(m.current.metrics, cur.metrics), []);
  assert.deepEqual(divergences({ primary_actions: 2, words_on_screen: 100 }, { primary_actions: 1, words_on_screen: 103 }), [{ metric: 'primary_actions', declared: 2, measured: 1 }]);
});

test('lint: A resolves what it claims (flow and layout without geometry stay unverified); B keeps X1 and the review text and adds a sev-3 T4', () => {
  const r = lintManifest(load(), { root: ROOT, cfg, registry, geometry: null });
  const a = r.variants.a, b = r.variants.b;
  const st = (x) => Object.fromEntries(x.resolves.map((y) => [y.id, y.status]));
  assert.deepEqual(st(a), { 't-0000x1aa': 'resolved', 's-0000t1bb': 'resolved', 'st-000s1cc': 'resolved', 'l-000l6dd': 'unverified', 't-000descee': 'resolved', 'f-000f3ff': 'unverified' });
  assert.equal(a.ok, true);
  assert.deepEqual(st(b), { 't-0000x1aa': 'persists', 't-000descee': 'persists' });
  assert.deepEqual(b.blocking.map((x) => x.rule), ['T4']);
  assert.equal(b.ok, false);
});

test('decision: whole variant or composition per axis, validated against the manifest, written next to it', () => {
  const m = load();
  assert.deepEqual(parseCompose('screen=a, flow=b,behavior=a,text=current'), { screen: 'a', flow: 'b', behavior: 'a', text: 'current' });
  assert.deepEqual(makeDecision(m, { variant: 'a', now: new Date('2026-10-04') }).decision, { format: 1, module: 'demo', flow: 'assistente', mode: 'variant', variant: 'a', comment: '', by: 'dono', at: '2026-10-04' });
  assert.ok(makeDecision(m, { variant: 'z' }).errors.length);
  assert.ok(makeDecision(m, { compose: { screen: 'a', flow: 'b' } }).errors.some((e) => /behavior/.test(e)));
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-var-'));
  try {
    const f = writeDecision(tmp, m, makeDecision(m, { compose: parseCompose('screen=a,flow=b,behavior=a,text=a'), comment: 'fluxo de B' }).decision);
    assert.equal(f, join(tmp, '.dsx', 'variations', 'demo', 'assistente', 'decision.json'));
    assert.equal(JSON.parse(readFileSync(f, 'utf8')).compose.flow, 'b');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('page helpers: slides, hero, equivalent step of today, deltas, leaders', () => {
  const m = load();
  const g = groupsOf({ frames: m.variants[0].frames });
  assert.deepEqual(g.map((x) => x.step), ['Montar o lote', 'Gerar']);
  assert.equal(g[1].cells.length, 1);
  assert.equal(g[1].cells[0].type, 'behavior');
  assert.equal(g[1].cells[0].before.id, 'a2');
  const sa = slidesOf(m.variants[0]);
  assert.deepEqual(sa.map((s) => s.step), ['Montar o lote', 'Montar o lote', 'Gerar']);
  // hero: declared, else the screen frame without dialog with more words, else the first
  assert.equal(heroOf({ ...m.variants[0], hero: 'a1r' }).id, 'a1r');
  assert.equal(heroOf(m.variants[1], { b1: { words: 5 }, b2: { words: 9 } }).id, 'b2');
  assert.equal(heroOf(m.variants[1], { b1: { words: 5 }, b2: { words: 9, dialog_open: true } }).id, 'b1');
  // today's equivalent: compare_to, then same step name, then proportional order
  const today = slidesOf(rowsOf(m)[0]);
  const sb = slidesOf(m.variants[1]);
  assert.equal(todaySlideFor(sb[0], 0, 2, today), 1, 'Destinatários casa pelo nome');
  assert.equal(todaySlideFor(sb[1], 1, 2, today), 2, 'Conferir cai na posição proporcional');
  const withCmp = { ...sb[1], cell: { ...sb[1].cell, frame: { ...sb[1].cell.frame, compare_to: 'c1' } } };
  assert.equal(todaySlideFor(withCmp, 1, 2, today), 0);
  assert.deepEqual(delta(4, 1), { kind: 'better', text: '▼ 3', sr: '3 a menos que hoje, melhor' });
  assert.equal(delta(2, 5).kind, 'worse');
  assert.equal(delta(0, 0).kind, 'same');
  assert.equal(delta(0, 5, true).kind, 'better', 'problemas resolvidos: mais é melhor');
  const rows = rowsOf(m);
  const letters = new Map([['current', 'Hoje'], ['a', 'A'], ['b', 'B']]);
  const values = { current: { steps: 3, clicks_to_done: 4, words_on_screen: 26, resolved: 0 }, a: { steps: 2, clicks_to_done: 2, words_on_screen: 12, resolved: 6 }, b: { steps: 2, clicks_to_done: 5, words_on_screen: 14, resolved: 0 } };
  const l = leaders(rows, values, kpisOf({}), letters);
  assert.deepEqual([...l.best.steps].sort(), ['a', 'b']);
  assert.deepEqual([...l.best.clicks_to_done], ['a']);
  assert.match(l.sentence, /^Quem lidera cada número: A em telas, cliques até concluir, palavras por tela e problemas resolvidos; B em telas\.$/);
  assert.equal(kpisOf({ done_label: 'o .zip' })[1].label, 'Cliques até o .zip');
});

test('page helpers: problems in plain Portuguese and a human badge', () => {
  const r = (id) => registry.get(id);
  assert.equal(plainFinding(r('t-0000x1aa')), 'Travessão usado como pausa no texto: "Avançar — próximo passo"');
  assert.equal(plainFinding(r('l-000l6dd'), { where: 'hoje em Destinatários' }), 'O botão principal só aparece rolando a página: "Avançar" (hoje em Destinatários)');
  assert.equal(plainFinding(r('t-000descee')), 'descrição que repete o que a tela já mostra');
  assert.equal(plainFinding({ family: 'layout', rule: 'L7', anchor: 'linha longa em "Cada arquivo traz"' }), 'Linha de texto longa demais para ler: "Cada arquivo traz…"');
  assert.equal(badgeOf({ status: 'resolved' }).label, 'resolvido');
  assert.equal(badgeOf({ status: 'persists' }).label, 'continua');
  const sus = badgeOf({ status: 'resolved', suspect: true, family: 'text', rule: 'X6' }, { similar: [{ anchor: 'Gerar agora mesmo todas as minutas' }] });
  assert.equal(sus.label, 'precisa conferir');
  assert.match(sus.why, /"Gerar agora mesmo todas as minutas"/);
  assert.match(badgeOf({ status: 'unverified', family: 'flow' }).why, /caminho entre as telas/);
  assert.match(badgeOf({ status: 'unverified', family: 'layout' }).why, /posição na tela não foi medida/);
});

test('page: answer first (question, summary Hoje | A | B with 4 numbers, gain and cost), then one version at a time, details folded, decision', () => {
  const m = load();
  const lint = lintManifest(m, { root: ROOT, cfg, registry, geometry: null });
  const [p] = renderVariationsPages(m, { lint, registry, catalogs, file: 'v.html' });
  const html = p.html;
  assert.match(html, /<title>Variações · Gerar documentos em lote<\/title>/);
  assert.match(html, /<h1>Como gerar documentos em lote com menos trabalho\?<\/h1>/);
  assert.match(html, /Quem lidera cada número: A em/);
  // resumo: um cartão por versão, 4 números, ganha e custa
  const summary = html.slice(html.indexOf('class="resumo"'), html.indexOf('class="versoes"'));
  assert.equal((summary.match(/<article class="rc/g) ?? []).length, 3);
  assert.equal((summary.match(/<div class="kpi">/g) ?? []).length, 12);
  for (const t of ['Telas', 'Cliques até concluir', 'Palavras por tela', 'Problemas resolvidos', 'Ganha', 'Custa']) assert.ok(summary.includes(t), t);
  assert.match(summary, /class="d d-better"/);
  assert.match(summary, /class="best">melhor/);
  assert.match(summary, /Quem gera lotes toda semana conclui com menos cliques/, 'sem gain: primeira frase da hipótese');
  // nada de id de achado, nome de regra ou de padrão na frente de quem decide
  const front = html.slice(0, html.indexOf('<details'));
  for (const raw of ['t-0000x1aa', 'l-000l6dd', 'X1', 'L6', 'autosave-vs-save', 'step-wizard', 'sem verificação', 'suspect']) assert.ok(!front.replace(/<[^>]+>/g, ' ').includes(raw), `jargão na frente: ${raw}`);
  // abas e passo a passo
  assert.equal((html.match(/role="tab" /g) ?? []).length, 3);
  assert.match(html, /<select id="aba-sel">/);
  assert.match(html, /Passo 1 de 3<\/span> · <b class="ind-s">Montar o lote/);
  assert.match(html, /class="bt-cmp" aria-pressed="false">Comparar com hoje/);
  assert.match(html, /<div class="cmp" hidden><figure><figcaption class="tag tag-hoje">Hoje · Destinatários/);
  assert.match(html, /<p class="acao"><span aria-hidden="true">↓<\/span> clica em Gerar 4 documentos<\/p>/);
  assert.match(html, /figcaption class="tag">Antes<\/figcaption>/);
  assert.match(html, /figcaption class="tag tag-depois">Depois/);
  // detalhes recolhidos, em linguagem simples, com selo humano
  for (const t of ['<summary>O que muda</summary>', '<summary>Por que pode funcionar</summary>', '<summary>Riscos (1)</summary>', 'Problemas que resolve (6', 'Novos pontos de atenção', 'Problemas de hoje (6)']) assert.ok(html.includes(t), t);
  assert.match(html, /<li id="p-t-0000x1aa" title="t-0000x1aa"><span class="selo selo-ok">resolvido<\/span> Travessão usado como pausa no texto/);
  assert.match(html, /selo-check">precisa conferir<\/span> Passos demais até concluir<br><span class="nota">Depende do caminho entre as telas/);
  assert.match(html, /<span class="selo selo-bad">continua<\/span>/);
  assert.match(html, /Base: Assistente em etapas\. Padrões do catálogo: Como estruturar etapas em formulários longos\? · Como tratar carregamentos que demoram muito\? · Autosave ou botão Salvar\?/);
  // decisão: A/B/Nenhuma, mistura recolhida, JSON compatível com import
  assert.match(html, /<h2 id="dec-t">Qual seguir\?<\/h2>/);
  assert.match(html, /name="variante" value="current">.*Nenhuma: manter como está/);
  assert.match(html, /<details class="mistura" id="mistura"><summary>Misturar partes de versões diferentes/);
  assert.match(html, /name="eixo-text"/);
  assert.match(html, /d=\{format:1,module:M\.module,flow:M\.flow,mode\}/);
  assert.match(html, /localStorage/);
  assert.match(html, /prefers-color-scheme:dark/);
  const phone = html.slice(html.indexOf('@media (max-width:640px)'));
  assert.ok(phone.includes('.resumo{--cols:1!important}') && phone.includes('.abas{display:none}.sel-aba{display:grid}'), 'celular: cartões empilhados e seletor no lugar das abas');
  assert.match(html, /sem imagem/);
});

test('page images: content crop embedded once, with intrinsic size, and zoom', () => {
  const m = load();
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-var-shots-'));
  try {
    writeFileSync(join(tmp, 'x.content.1220x640.webp'), Buffer.from('RIFF0000WEBP'));
    const shots = new Map(rowsOf(m).flatMap((r) => r.frames.map((f) => [f.capture, { content: 'x.content.1220x640.webp', width: 1220, height: 640 }])));
    const [p] = renderVariationsPages(m, { registry, catalogs, shots, shotsDir: tmp, file: 'v.html' });
    assert.match(p.html, /<button type="button" class="z hero" data-full="x\.content\.1220x640\.webp"/);
    assert.match(p.html, /width="1220" height="640" loading="lazy"/);
    assert.equal((p.html.match(/data:image\/webp;base64/g) ?? []).length, 1);
    assert.match(p.html, /<dialog id="zoom"/);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('validate: hero and compare_to must point to existing frames', () => {
  const m = load();
  m.variants[0].hero = 'nao-existe';
  m.variants[1].frames[0].compare_to = 'z9';
  const { errors } = validateManifest(m, { root: ROOT, catalogs, registry });
  assert.ok(errors.some((e) => /hero "nao-existe"/.test(e)), errors.join(' | '));
  assert.ok(errors.some((e) => /compare_to "z9" não é frame de hoje/.test(e)), errors.join(' | '));
  m.variants[0].hero = 'a1';
  m.variants[1].frames[0].compare_to = 'c2';
  assert.deepEqual(validateManifest(m, { root: ROOT, catalogs, registry }).errors, []);
});

test('page pagination: today on every page, variants split when images pass the limit', () => {
  const rows = rowsOf(load());
  const shots = new Map(rows.flatMap((r) => r.frames.map((f) => [f.capture, { content: `${f.id}.c` }])));
  assert.equal(paginateRows(rows, { shots, sizeOf: () => 1000, maxBytes: 10 * 1024 * 1024 }).length, 1);
  const pages = paginateRows(rows, { shots, sizeOf: () => 2 * 1024 * 1024, maxBytes: 10 * 1024 * 1024 });
  assert.equal(pages.length, 2);
  assert.ok(pages.every((p) => p[0].is_current));
  assert.deepEqual(pages.map((p) => p.slice(1).map((r) => r.id)), [['a'], ['b']]);
});
