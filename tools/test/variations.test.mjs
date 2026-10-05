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
import { renderVariationsPages, groupsOf, delta, paginateRows, slidesOf, heroOf, todaySlideFor, plainFinding, badgeOf, leaders, kpisOf, valuesOf, changeRect, focusOf, bare } from '../ux-lint/lib/variations-page.mjs';
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
  assert.ok(r.warnings.some((w) => /"b".*text/.test(w)));
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
  for (const re of [/capture does not exist/, /pattern "nao-existe"/, /law "lei-inventada"/, /archetype "arquetipo-inventado"/, /"t-ffffffff" does not exist/, /same capture as "current"/, /changes only text/, /"decisions" missing/]) {
    assert.ok(errors.some((e) => re.test(e)), `missing error ${re}: ${errors.join(' | ')}`);
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
  assert.deepEqual(makeDecision(m, { variant: 'a', now: new Date('2026-10-04') }).decision, { format: 1, module: 'demo', flow: 'assistente', mode: 'variant', variant: 'a', comment: '', by: 'owner', at: '2026-10-04' });
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
  assert.deepEqual(sa.map((s) => s.part), ['path', 'state', 'behavior'], 'steps of the flow (screens) first, then states and behaviors');
  assert.equal(sa[0].n, 1);
  // hero: declared, else the screen frame without dialog with more words, else the first
  assert.equal(heroOf({ ...m.variants[0], hero: 'a1r' }).id, 'a1r');
  assert.equal(heroOf(m.variants[1], { b1: { words: 5 }, b2: { words: 9 } }).id, 'b2');
  assert.equal(heroOf(m.variants[1], { b1: { words: 5 }, b2: { words: 9, dialog_open: true } }).id, 'b1');
  // today's equivalent: compare_to, then same step name, then proportional order
  const today = slidesOf(rowsOf(m)[0]);
  const sb = slidesOf(m.variants[1]);
  assert.equal(todaySlideFor(sb[0], 0, 2, today), 1, 'Fornecedores matches by name');
  assert.equal(todaySlideFor(sb[1], 1, 2, today), 2, 'Conferir falls on the proportional position');
  const withCmp = { ...sb[1], cell: { ...sb[1].cell, frame: { ...sb[1].cell.frame, compare_to: 'c1' } } };
  assert.equal(todaySlideFor(withCmp, 1, 2, today), 0);
  const PT = { lang: 'pt-BR' };
  assert.deepEqual(delta(4, 1, false, PT), { kind: 'better', text: '▼ 3', word: 'melhor', sr: '3 a menos que hoje,' });
  assert.deepEqual(delta(4, 1), { kind: 'better', text: '▼ 3', word: 'better', sr: '3 fewer than today,' }, 'English by default');
  assert.equal(delta(2, 5, false, PT).word, 'pior', 'the word sits next to the arrow: color is not the only signal');
  assert.equal(delta(2, 5).kind, 'worse');
  assert.equal(delta(0, 0).kind, 'same');
  assert.equal(delta(0, 5, true).kind, 'better', 'problems solved: more is better');
  const rows = rowsOf(m);
  const letters = new Map([['current', 'Hoje'], ['a', 'A'], ['b', 'B']]);
  const values = { current: { steps: 3, clicks_to_done: 4, words_on_screen: 26, resolved: 0 }, a: { steps: 2, clicks_to_done: 2, words_on_screen: 12, resolved: 6 }, b: { steps: 2, clicks_to_done: 5, words_on_screen: 14, resolved: 0 } };
  const l = leaders(rows, values, kpisOf({}, 'pt-BR'), letters, 'pt-BR');
  assert.deepEqual([...l.best.steps].sort(), ['a', 'b']);
  assert.deepEqual([...l.best.clicks_to_done], ['a']);
  assert.match(l.sentence, /^Quem lidera cada número: A em telas, cliques até concluir, palavras por tela e problemas resolvidos; B em telas\.$/);
  assert.match(leaders(rows, values, kpisOf({}), letters).sentence, /^Who leads each number: A in screens, clicks to finish, words per screen and problems solved; B in screens\.$/);
  assert.equal(kpisOf({ done_label: 'o .zip' }, 'pt-BR')[1].label, 'Cliques até o .zip');
  assert.equal(kpisOf({ done_label: 'the .zip' })[1].label, 'Clicks to the .zip');
});

test('page helpers: problems in plain language and a human badge (pt-BR and en)', () => {
  const r = (id) => registry.get(id);
  const lang = 'pt-BR';
  assert.equal(plainFinding(r('t-0000x1aa'), { lang }), 'Travessão usado como pausa no texto: "Avançar — próximo passo"');
  assert.equal(plainFinding(r('t-0000x1aa')), 'Dash used as a pause in the text: "Avançar — próximo passo"', 'English by default; the quoted product text stays as is');
  assert.equal(plainFinding(r('l-000l6dd'), { where: 'hoje em Fornecedores', lang }), 'O botão principal só aparece rolando a página: "Avançar" (hoje em Fornecedores)');
  assert.equal(plainFinding(r('t-000descee'), { lang }), 'descrição que repete o que a tela já mostra');
  assert.equal(plainFinding({ family: 'layout', rule: 'L7', anchor: 'linha longa em "Cada arquivo traz"' }, { lang }), 'Linha de texto longa demais para ler: "Cada arquivo traz…"');
  assert.equal(badgeOf({ status: 'resolved' }, { lang }).label, 'resolvido');
  assert.equal(badgeOf({ status: 'persists' }, { lang }).label, 'continua');
  assert.equal(badgeOf({ status: 'persists' }).label, 'still there');
  const sus = badgeOf({ status: 'resolved', suspect: true, family: 'text', rule: 'X6' }, { similar: [{ anchor: 'Gerar agora mesmo todas as propostas' }], lang });
  assert.equal(sus.label, 'precisa conferir');
  assert.match(sus.why, /"Gerar agora mesmo todas as propostas"/);
  assert.match(badgeOf({ status: 'unverified', family: 'flow' }, { lang }).why, /caminho entre as telas/);
  assert.match(badgeOf({ status: 'unverified', family: 'layout' }, { lang }).why, /posição na tela não foi medida/);
  assert.match(badgeOf({ status: 'unverified', reason: 'finding not in the registry' }).why, /not in the module registry/);
});

test('page (pt-BR): answer first (question, summary Hoje | A | B with 4 numbers, gain and cost), then one version at a time, details folded, decision', () => {
  const m = load();
  const lint = lintManifest(m, { root: ROOT, cfg, registry, geometry: null });
  const [p] = renderVariationsPages(m, { lint, registry, catalogs, file: 'v.html', lang: 'pt-BR' });
  const html = p.html;
  assert.match(html, /<title>Variações · Gerar documentos em lote<\/title>/);
  assert.match(html, /<h1>Como gerar documentos em lote com menos trabalho\?<\/h1>/);
  assert.match(html, /Quem lidera cada número: A em/);
  // summary: one card per version, 4 numbers, gains and costs
  const summary = html.slice(html.indexOf('class="resumo"'), html.indexOf('class="versoes"'));
  assert.equal((summary.match(/<article class="rc/g) ?? []).length, 3);
  assert.equal((summary.match(/<div class="kpi[ "]/g) ?? []).length, 12);
  for (const t of ['Telas', 'Cliques até concluir', 'Palavras por tela', 'Problemas resolvidos', 'Ganha', 'Custa']) assert.ok(summary.includes(t), t);
  assert.match(summary, /class="d d-better"/);
  assert.match(summary, /class="best">lidera/);
  assert.match(summary, /<span class="d d-better"><span aria-hidden="true">▼ \d+ · <\/span><span class="sr">[^<]+<\/span>melhor<\/span>/);
  assert.match(summary, /Quem gera lotes toda semana conclui com menos cliques/, 'no gain: first sentence of the hypothesis');
  // no finding id, rule name or pattern name in front of the decider
  const front = html.slice(0, html.indexOf('<details'));
  for (const raw of ['t-0000x1aa', 'l-000l6dd', 'X1', 'L6', 'autosave-vs-save', 'step-wizard', 'sem verificação', 'suspect']) assert.ok(!front.replace(/<[^>]+>/g, ' ').includes(raw), `jargon in front: ${raw}`);
  // tabs and step by step
  assert.equal((html.match(/role="tab" /g) ?? []).length, 3);
  assert.match(html, /<select id="aba-sel">/);
  assert.match(html, /Passo 1 de 1<\/span> · <b class="ind-s">Montar o lote/, 'A has one screen: the indicator counts only the steps of the flow');
  assert.match(html, /Passo 1 de 3<\/span> · <b class="ind-s">Escolher modelo/);
  assert.match(html, /<p class="tg-t" id="tg-p-a">Passos do fluxo<\/p>/);
  assert.match(html, /<p class="tg-t" id="tg-e-a">Estados e comportamentos<\/p>/);
  assert.match(html, /data-ind="Estado"/);
  assert.ok(!/<p class="legenda">Passo \d/.test(html), 'caption without "Passo X de Y": the only count is the indicator');
  assert.match(html, /class="bt-cmp" aria-pressed="false" aria-describedby="cmp-nota-a">Comparar com hoje/);
  assert.match(html, /<p class="nota cmp-nota" id="cmp-nota-a">"Comparar com hoje" vale para todas as versões ao mesmo tempo\.<\/p>/);
  assert.ok(!html.includes('id="cmp-nota-current"'), 'the Hoje tab does not mention a button it does not have');
  assert.match(html, /<div class="cmp" hidden><figure><figcaption class="tag tag-hoje">Hoje · Fornecedores/);
  assert.match(html, /<p class="acao"><span class="seta" aria-hidden="true"><\/span><span>clica em Gerar 4 documentos<\/span><\/p>/);
  assert.match(html, /figcaption class="tag">Antes<\/figcaption>/);
  assert.match(html, /figcaption class="tag tag-depois">Depois/);
  // folded details, in plain language, with a human badge
  for (const t of ['<summary>O que muda</summary>', '<summary>Por que pode funcionar</summary>', '<summary>Riscos (1)</summary>', 'Novos pontos de atenção', 'Problemas de hoje (6)']) assert.ok(html.includes(t), t);
  assert.match(html, /<summary>Problemas que resolve \(\d+ confirmados?, \d+ a conferir\)<\/summary>/);
  assert.match(html, /<li id="p-t-0000x1aa"><span class="selo selo-ok">resolvido<\/span> Travessão usado como pausa no texto/);
  assert.match(html, /selo-check">precisa conferir<\/span> Passos demais até concluir<span class="why">Depende do caminho entre as telas/);
  assert.ok(!/title="[a-z]+-[0-9a-z]+"/.test(html), 'no title attribute with a finding id');
  assert.match(html, /<span class="selo selo-bad">continua<\/span>/);
  // technical part only under "Para quem constrói"
  const tec = html.slice(html.indexOf('<details class="det tec"><summary>Para quem constrói</summary>', html.indexOf('id="v-a"')));
  assert.match(tec, /^<details class="det tec"><summary>Para quem constrói<\/summary><p>Arquétipo: Step wizard \(step-wizard\)\.<\/p><p>Padrões do catálogo: How do you structure steps in long forms\? \(form-steps\)/);
  assert.match(tec, /Achados citados: t-0000x1aa \(X1\)/);
  const plainA = html.slice(html.indexOf('id="v-a"'), html.indexOf('<details class="det tec">', html.indexOf('id="v-a"'))).replace(/<[^>]+>/g, ' ');
  for (const raw of ['step-wizard', 'form-steps', 't-0000x1aa', 'Padrões do catálogo']) assert.ok(!plainA.includes(raw), `technical outside the block: ${raw}`);
  // decision: A/B/None, mix folded, JSON compatible with import
  assert.match(html, /<h2 id="dec-t">Qual seguir\?<\/h2>/);
  assert.match(html, /<fieldset class="escolha" id="escolha" aria-describedby="escolha-erro"><legend class="sr">Versão escolhida<\/legend><label class="op"><input type="radio" name="variante" value="current">.*Nenhuma, manter como está.*value="a".*value="b"/, 'order Hoje, A, B, as the cards');
  assert.match(html, /Quem decide \(obrigatório\) <input name="por" autocomplete="name" required aria-required="true"/);
  assert.ok(!/\|\|'dono'/.test(html), 'no invented "dono" when the field is empty');
  assert.match(html, /Retomamos sua escolha anterior/);
  assert.match(html, /fs\.disabled=on/, 'mixing on disables choosing a whole version');
  assert.match(html, /Depois de copiar, cole na conversa com quem conduz o projeto \(ou envie por e-mail\)\. Sua escolha fica salva só neste navegador\./);
  const decTec = html.slice(html.indexOf('<details class="json tec" id="tec-dec">'));
  assert.match(decTec, /^<details class="json tec" id="tec-dec"><summary>Para quem constrói<\/summary>/);
  assert.ok(decTec.includes('variations.mjs import --root . decision.json'), 'command only under Para quem constrói');
  const decPlain = html.slice(html.indexOf('id="decisao"'), html.indexOf('<details class="json tec"')).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  assert.ok(!/JSON|variations\.mjs/.test(decPlain), 'no JSON or command outside the technical block');
  assert.match(html, /aria-label="Arquivo da decisão"/);
  assert.match(html, /<details class="mistura" id="mistura"><summary>Misturar partes de versões diferentes/);
  assert.match(html, /name="eixo-text"/);
  assert.match(html, /d=\{format:1,module:M\.module,flow:M\.flow,mode\}/);
  assert.match(html, /localStorage/);
  assert.match(html, /prefers-color-scheme:dark/);
  // full document by default; --fragment drops the skeleton (artifact)
  assert.match(html, /^<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>/);
  assert.match(html, /<\/body>\n<\/html>\n$/);
  const [frag] = renderVariationsPages(m, { lint, registry, catalogs, file: 'v.html', fragment: true, lang: 'pt-BR' });
  assert.match(frag.html, /^<title>/);
  assert.match(frag.html, /<div class="pg" lang="pt-BR">/);
  assert.ok(!frag.html.includes('<!doctype'));
  // accessible name as a sentence, no title case, no technical term
  assert.ok(!/aria-label="Ampliar: /.test(html));
  assert.ok(!/JSON/.test(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/JSON\.(parse|stringify)/g, '')), 'JSON does not show in the page text');
  const phone = html.slice(html.indexOf('@media (max-width:640px)'));
  assert.ok(phone.includes('.resumo{--cols:1!important}') && phone.includes('.abas{display:none}.sel-aba{display:grid}'), 'phone: stacked cards and a select instead of tabs');
  assert.match(html, /sem imagem/);
});

test('page images: content crop embedded once, with intrinsic size, and zoom', () => {
  const m = load();
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-var-shots-'));
  try {
    writeFileSync(join(tmp, 'x.content.1220x640.webp'), Buffer.from('RIFF0000WEBP'));
    const shots = new Map(rowsOf(m).flatMap((r) => r.frames.map((f) => [f.capture, { content: 'x.content.1220x640.webp', width: 1220, height: 640 }])));
    const [p] = renderVariationsPages(m, { registry, catalogs, shots, shotsDir: tmp, file: 'v.html', lang: 'pt-BR' });
    assert.match(p.html, /<button type="button" class="z crop hero" data-full="x\.content\.1220x640\.webp" data-name="A · Uma tela só" data-cap="[^"]+" data-unit="Versão" aria-label="Ampliar a tela da versão A no passo /);
    assert.match(p.html, /<span class="z-tag" aria-hidden="true">Ampliar<\/span>/, 'visible Ampliar label on the thumbnail');
    assert.match(p.html, /width="1220" height="640" loading="lazy"/);
    assert.match(p.html, /\.k1\{aspect-ratio:\d+\/\d+\}\.k1 img\{width:[\d.]+%;left:-?[\d.]+%;top:-?[\d.]+%\}/, 'crop by class, no inline style');
    assert.match(p.html, /class="z par-z" data-pair="x\.content\.1220x640\.webp\|x\.content\.1220x640\.webp"/, 'zoom the pair side by side in the comparison');
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
  assert.ok(errors.some((e) => /compare_to "z9" is not a frame of today/.test(e)), errors.join(' | '));
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

test('page numbers: resolved counts only the confirmed, words show the measured, a non-comparable metric leaves the race', () => {
  const m = load();
  const rows = rowsOf(m);
  const lint = { variants: { a: { resolves: [{ id: 't-0000x1aa', status: 'resolved' }, { id: 's-0000t1bb', status: 'resolved', suspect: true }, { id: 'st-000s1cc', status: 'unverified', family: 'flow' }, { id: 'l-000l6dd', status: 'persists' }] }, b: { resolves: [{ id: 't-0000x1aa', status: 'resolved' }, { id: 't-000descee', status: 'resolved' }] } } };
  const measured = { current: { metrics: { words_on_screen: 26 }, divergences: [], frames: { c1: {} } }, a: { metrics: { words_on_screen: 20 }, divergences: [{ metric: 'words_on_screen', declared: 12, measured: 20 }], frames: { a1: {} } }, b: { metrics: { words_on_screen: 14 }, divergences: [], frames: { b1: {} } } };
  const v = valuesOf(rows, { measured, lint });
  assert.equal(v.a.resolved, 1, 'only resolved without suspicion counts');
  assert.equal(v.a.to_check, 4, 'suspect, unverified and the two outside lint are "to check"; what persists does not count');
  assert.equal(v.b.resolved, 2);
  assert.equal(v.a.words_on_screen, 20, 'words: the measured value wins over the declared one');
  assert.equal(v.a.words_declared_off, 12);
  const letters = new Map([['current', 'Hoje'], ['a', 'A'], ['b', 'B']]);
  const l = leaders(rows, v, kpisOf({}), letters);
  assert.equal(l.best.resolved, undefined, 'A reaches B (1 + 4 to check ≥ 2): what is left to check could change the leader, so nobody gets the badge');
  const v3 = { ...v, a: { ...v.a, to_check: 0 } };
  assert.deepEqual([...leaders(rows, v3, kpisOf({}), letters).best.resolved], ['b'], 'the leader comes from the same confirmed number');
  assert.equal(delta(178, 175, false, { tolerance: 0.05, lang: 'pt-BR' }).word, 'praticamente igual a hoje', 'a small difference does not become "better"');
  assert.deepEqual([...l.best.words_on_screen], ['b']);
  // non-comparable metric: out of the leader and marked on the card with the reason
  const m2 = load();
  m2.variants[0].metrics_detail = { clicks_to_done: ['Gerar'], not_comparable: { clicks_to_done: 'termina com 1 documento fora do arquivo' } };
  m2.variants[0].metrics.clicks_to_done = 1;
  const v2 = valuesOf(rowsOf(m2), {});
  assert.deepEqual([...leaders(rowsOf(m2), v2, kpisOf({}), letters).best.clicks_to_done], ['b']);
  const [p] = renderVariationsPages(m2, { lint, measured, registry, catalogs, file: 'v.html', lang: 'pt-BR' });
  assert.match(p.html, /<span class="nc">não comparável<\/span><span class="nc-why">termina com 1 documento fora do arquivo<\/span>/);
  assert.match(p.html, /<span class="mais">\+ 4 a conferir<\/span>/);
  assert.match(p.html, /<span class="mais">medido nas telas \(estimativa inicial: 12\)<\/span>/);
  assert.match(p.html, /<summary>Os 1 cliques até concluir<\/summary><ol class="cliques"><li>Gerar<\/li><\/ol><p class="aviso">Não comparável: termina com 1 documento fora do arquivo<\/p>/);
  assert.match(p.html, /Números não comparáveis:<\/b> A, cliques: termina com 1 documento fora do arquivo/);
  assert.match(p.html, /Medido diferente do declarado:<\/b> A: palavras por tela medido 20, declarado 12/, 'metric by its name, not by the key');
});

test('page clicks: the counted list is shown per version and a mismatch with the number is flagged', () => {
  const m = load();
  m.variants[1].metrics_detail = { clicks_to_done: ['Enviar planilha', 'Conferir', 'Gerar', 'Baixar'] };
  const [p] = renderVariationsPages(m, { registry, catalogs, file: 'v.html', lang: 'pt-BR' });
  assert.match(p.html, /<summary>Os 4 cliques até concluir<\/summary><ol class="cliques"><li>Enviar planilha<\/li>/);
  assert.match(p.html, /A lista tem 4 e o número do resumo diz 3\./);
  const { warnings } = validateManifest(m, { root: ROOT, catalogs, registry });
  assert.ok(warnings.some((w) => /metrics_detail\.clicks_to_done lists 4 and the metric says 3/.test(w)), warnings.join(' | '));
});

test('validate: metrics_detail and compare_focus', () => {
  const m = load();
  m.variants[0].metrics_detail = { clicks: ['x'], clicks_to_done: 'Gerar', not_comparable: { passos: 'x', steps: '' } };
  m.variants[1].frames[0].compare_focus = { x: 0.6, y: 0, w: 0.6, h: 0.5 };
  const { errors } = validateManifest(m, { root: ROOT, catalogs, registry });
  for (const re of [/metrics_detail\.clicks is not a metric/, /metrics_detail\.clicks_to_done must be a list/, /not_comparable\.passos is not a metric/, /not_comparable\.steps without a reason/, /compare_focus needs x, y, w, h/]) assert.ok(errors.some((e) => re.test(e)), `missing ${re}: ${errors.join(' | ')}`);
  m.variants[0].metrics_detail = { clicks_to_done: ['Gerar', 'Baixar'] };
  m.variants[1].frames[0].compare_focus = { x: 0, y: 0, w: 0.5, h: 0.4 };
  assert.deepEqual(validateManifest(m, { root: ROOT, catalogs, registry }).errors, []);
});

test('page crops: focus of the comparison, change rectangle and mark of a behavior pair', () => {
  assert.deepEqual(focusOf({ compare_focus: { x: 0.1, y: 0.2, w: 0.5, h: 0.9 } }, { width: 1000, height: 2000 }), { x: 0.1, y: 0.2, w: 0.5, h: 0.1875 });
  assert.deepEqual(focusOf({}, { width: 1000, height: 400 }), { x: 0, y: 0, w: 0.62, h: 1 }, 'short screen: the whole height');
  assert.equal(changeRect(null, { width: 1000, height: 800 }, { width: 1000, height: 800 }), null);
  assert.equal(changeRect({ x: 0, y: 0, w: 1000, h: 700 }, { width: 1000, height: 800 }, { width: 1000, height: 800 }), null, 'almost everything changed: whole screen');
  const r = changeRect({ x: 600, y: 300, w: 100, h: 20 }, { width: 1000, height: 800 }, { width: 1000, height: 800 });
  assert.equal(r.w, 500, 'at least half the width');
  assert.ok(r.x <= 600 && r.x + r.w >= 700 && r.y <= 300 && r.y + r.h >= 320, JSON.stringify(r));
  assert.equal(bare('Passo 1 de 3: tabela do catálogo'), 'Tabela do catálogo');
  assert.equal(bare('Etapa 2 de 2: valores comuns'), 'Valores comuns');
  assert.equal(bare('Antes: CNPJ vazio'), 'CNPJ vazio');
  assert.equal(bare('Step 2 of 3: shared values'), 'Shared values');
  assert.equal(bare('Before: empty tax id'), 'Empty tax id');
  // before/after pair with the difference: crop on both images and outline of what changed
  const m = load();
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-var-diff-'));
  try {
    for (const n of ['a2.content.1000x800.webp', 'a3.content.1000x800.webp']) writeFileSync(join(tmp, n), Buffer.from('RIFF0000WEBP'));
    const byId = Object.fromEntries(m.variants[0].frames.map((f) => [f.id, f.capture]));
    const shots = new Map([[byId.a2, { content: 'a2.content.1000x800.webp', width: 1000, height: 800 }], [byId.a3, { content: 'a3.content.1000x800.webp', width: 1000, height: 800 }]]);
    const diffs = new Map([['a2.content.1000x800.webp|a3.content.1000x800.webp', { x: 600, y: 300, w: 100, h: 20 }]]);
    const [p] = renderVariationsPages(m, { registry, catalogs, shots, diffs, shotsDir: tmp, file: 'v.html', lang: 'pt-BR' });
    assert.equal((p.html.match(/<span class="mk m\d+" aria-hidden="true"><\/span>/g) ?? []).length, 2, 'outline on before and after');
    assert.match(p.html, /O recorte mostra a parte que mudou, contornada/);
    assert.match(p.html, /aria-label="Ampliar a tela da versão A no passo Gerar, antes"/);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('page slides: a frame with an open dialog is not a step of the flow', () => {
  const m = load();
  const s = slidesOf(m.variants[1], { b1: { dialog_open: true } });
  assert.deepEqual(s.map((x) => [x.step, x.part, x.n ?? null]), [['Conferir', 'path', 1], ['Fornecedores', 'dialog', null]]);
});

test('page (en, default): English interface, <html lang="en">, product text untouched; unknown lang throws', () => {
  const m = load();
  const lint = lintManifest(m, { root: ROOT, cfg, registry, geometry: null });
  const [p] = renderVariationsPages(m, { lint, registry, catalogs, file: 'v.html' });
  const html = p.html;
  assert.match(html, /^<!doctype html>\n<html lang="en">/);
  assert.match(html, /<div class="pg" lang="en">/);
  assert.match(html, /<title>Variations · Gerar documentos em lote<\/title>/);
  assert.match(html, /<h1>How to gerar documentos em lote with less work\?<\/h1>/);
  for (const t of ['Screens', 'Clicks to finish', 'Words per screen', 'Problems solved', 'Gains', 'Costs', 'Compare with today', 'Which one to follow?', 'Copy decision', 'For builders', 'How the numbers were counted']) assert.ok(html.includes(t), t);
  assert.match(html, /<span class="selo selo-ok">solved<\/span> Dash used as a pause in the text/);
  assert.match(html, /Step 1 of 3<\/span> · <b class="ind-s">Escolher modelo/, 'step names come from the manifest, as written');
  assert.match(html, /const T=\{[^}]*"copied":"Decision copied\./, 'the embedded script speaks the page language');
  const [pt] = renderVariationsPages(m, { lint, registry, catalogs, file: 'v.html', lang: 'pt' });
  assert.match(pt.html, /<html lang="pt-BR">/, 'pt normalizes to pt-BR');
  assert.match(renderVariationsPages(m, { registry, catalogs, file: 'v.html', lang: 'en-US' })[0].html, /<html lang="en">/);
  assert.throws(() => renderVariationsPages(m, { registry, catalogs, file: 'v.html', lang: 'fr' }), /unknown page language "fr"/);
});
