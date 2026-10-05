#!/usr/bin/env node
// Auditoria de UX: ponto de entrada único. Sem dependências.
// Confere os pré-requisitos (capturas, mapa de fluxo, UX.md e se ele está em dia com o produto, código), roda os
// detectores do registro abaixo
// (os que existirem), opcionalmente registra o resultado em .dsx/findings/<módulo>/ e imprime o relatório por
// dimensão, lido da matriz data/ux-dimensions.json. Com --page, gera a página de decisão.
//
// Uso: node tools/ux-lint/audit.mjs --module <m> --root <projeto> [--config <file>] [--screens <dir>] [--code <dirs...>]
//        [--map <flows.json>] [--ux UX.md] [--geometry <dir>] [--measure] [--dir <findings>] [--register]
//        [--preview [--min-severity <n>]] [--page <saida.html> [--preview-files] [--max-page-mb 10]] [--json]
//        [--criteria <cycles/C-n/plan.md> [--evidence <recorded.json>] [--criteria-out <results.json>]] [--owner-role <role>]
// Quality sections (data/pipeline-quality.json, tools/ux-lint/criteria.mjs): UI quality (5 metrics), UX quality
// (5 dimensions) and design-system adherence, each with its own verdict per declared criterion (pass | fail | unknown |
// not-applicable; unknown is never pass); the 14 dimensions follow as a diagnostic. The JSON carries `provenance`.
// --preview roda tools/ux-lint/preview.mjs antes da página (prévias antes/depois tiradas das capturas; Playwright
// resolvido a partir do diretório atual). A página sai paginada: <saida>.html, <saida>-2.html… (≤ 10 MB cada).
// Caminhos: lib/project-paths.mjs (flag > --config/.dsx/config.json > `paths` do UX.md > padrão; docs/project-paths.md).
// Padrões: --screens <root>/.dsx/captures/<m> · --geometry <root>/.dsx/captures/<m>/geometry (saída de measure.mjs;
//          com --measure a auditoria mede antes) · --map <root>/.dsx/maps/flows-<m>.json · --ux <root>/UX.md ·
//          --code pastas detectadas pela stack · --dir <root>/.dsx/findings. `.stitch/<m>/code` (legado) é lido com aviso.
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join, resolve, relative, isAbsolute, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as findings from './findings.mjs';
import { analyzeDrift, driftHeadline } from './ux-md-drift.mjs';
import { evaluateForAudit, formatQuality } from './criteria.mjs';
import { buildProvenance } from '../lib/provenance.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';

const DSX = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const MATRIX_PATH = join(DSX, 'data', 'ux-dimensions.json');

/**
 * Registro de detectores: família, caminho (relativo à raiz do DSX), insumos exigidos e argumentos.
 * Detector cujo arquivo não existe é tolerado: a auditoria avisa e a dimensão dele perde cobertura.
 * Todos devem aceitar `--json` e devolver o formato descrito em knowledge/fundamentos/achados-de-ux.md.
 */
export const DETECTOR_REGISTRY = [
  { family: 'text', path: 'tools/ux-lint/text.mjs', needs: ['screens'],
    args: (c) => ['--screens', c.screens, ...(c.code.length ? ['--code', ...c.code] : []), ...(c.ux ? ['--ux', c.ux] : []), ...(c.module ? ['--module', c.module] : []), '--json'] },
  { family: 'screen', path: 'tools/ux-lint/screen.mjs', needs: ['screens'],
    args: (c) => [c.screens, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'flow', path: 'tools/ux-lint/flow.mjs', needs: ['map'],
    args: (c) => [c.map, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'layout', path: 'tools/ux-lint/layout.mjs', needs: ['geometry'],
    args: (c) => [c.geometry, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'states', path: 'tools/ux-lint/states.mjs', needs: ['screens'],
    args: (c) => [c.screens, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'consistency', path: 'tools/ux-lint/consistency.mjs', needs: ['screens'],
    args: (c) => [c.screens, ...(c.ux ? ['--ux', c.ux] : []), ...(c.module ? ['--module', c.module] : []), '--json'] },
];

const COVERAGE_PT = { automated: 'automática', partial: 'parcial', judgment: 'julgamento', reference: 'referência' };
const FAMILY_PT = { text: 'texto (X)', screen: 'tela (T)', flow: 'fluxo (F)', layout: 'layout (L)', states: 'estados (S)', consistency: 'consistência (C)' };
const OPEN = new Set(findings.OPEN_STATUSES);

export function loadMatrix(path = MATRIX_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ---------- argumentos ----------

/** Interpreta argv; `--code` aceita várias pastas até a próxima flag. */
export function parseAuditArgs(argv) {
  const out = { code: [] };
  const flags = new Set(['register', 'json', 'measure', 'preview', 'preview-files']);
  let current = null;
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split('=');
      if (flags.has(k)) { out[k] = true; current = null; continue; }
      if (inline !== undefined) { if (k === 'code') out.code.push(inline); else out[k] = inline; current = null; continue; }
      current = k;
      continue;
    }
    if (current === 'code') { out.code.push(a); continue; }
    if (current) { out[current] = a; current = null; continue; }
    (out._ ??= []).push(a);
  }
  return out;
}

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

/** Completa os caminhos com os padrões do projeto. */
export function resolveOptions(o) {
  const p = resolveProjectPaths({
    root: o.root, module: o.module, config: typeof o.config === 'string' ? o.config : null,
    flags: { screens: o.screens, geometry: o.geometry, map: o.map, ux: o.ux, dir: o.dir, code: o.code },
  });
  return {
    module: o.module, root: p.root,
    screens: p.captures, geometry: p.geometry, measure: !!o.measure, map: p.map, ux: p.ux,
    code: p.code, codeDefaulted: p.codeDefaulted, dir: p.findings, pathWarnings: p.warnings, pathSources: p.sources,
    register: !!o.register, page: o.page ? resolve(o.page) : null, json: !!o.json,
    preview: !!o.preview, previewFiles: !!o['preview-files'], minSeverity: o['min-severity'] !== undefined ? Number(o['min-severity']) : null,
    maxPageMb: o['max-page-mb'] !== undefined ? Number(o['max-page-mb']) : null,
  };
}

// ---------- pré-requisitos ----------

const STATE_CAPTURE = /^\d+-[\w-]+\.[\w-]+\.html$/;

/**
 * Confere o que a auditoria precisa. Devolve [{ id, ok, path, detail, fix? }]; `fix` diz como gerar o que falta.
 * Também devolve `available` (insumos utilizáveis pelos detectores).
 */
export function checkPrerequisites(opt) {
  const rel = (p) => { const r = relative(opt.root, p); return r && !r.startsWith('..') && !isAbsolute(r) ? r : p; };
  const items = [];
  const html = isDir(opt.screens) ? readdirSync(opt.screens).filter((f) => f.endsWith('.html')) : [];
  const states = html.filter((f) => STATE_CAPTURE.test(f));
  items.push(html.length
    ? { id: 'screens', ok: true, path: opt.screens, detail: `${rel(opt.screens)} (${html.length - states.length} telas, ${states.length} capturas de estado)` }
    : { id: 'screens', ok: false, path: opt.screens, detail: `sem capturas HTML em ${rel(opt.screens)}`,
      fix: `capture as telas pelo código do projeto (skill capture-from-code do DSX, ou o harness de captura do projeto) em ${rel(opt.screens)}; estados como <nn>-<tela>.<estado>.html ao lado da captura principal` });
  for (const w of opt.pathWarnings ?? []) items.push({ id: 'paths', ok: false, warning: true, path: null, detail: w });
  items.push(isFile(opt.map)
    ? { id: 'map', ok: true, path: opt.map, detail: rel(opt.map) }
    : { id: 'map', ok: false, path: opt.map, detail: `sem mapa de fluxo em ${rel(opt.map)}`,
      fix: `gere o mapa com a skill mapear (mapeador-fluxos) no formato de knowledge/fundamentos/ux-md.md, confira com a skill confirmar-mapas e salve em ${rel(opt.map)}` });
  items.push(isFile(opt.ux)
    ? { id: 'ux', ok: true, path: opt.ux, detail: rel(opt.ux) }
    : { id: 'ux', ok: false, path: opt.ux, detail: `sem UX.md em ${rel(opt.ux)} (vale o padrão do DSX)`,
      fix: `extraia o UX.md com a skill ux-md e valide: node ${join(DSX, 'tools', 'lint-ux-md.mjs')} ${rel(opt.ux)}` });
  let drift = null;
  if (isFile(opt.ux)) {
    try {
      drift = analyzeDrift(readFileSync(opt.ux, 'utf8'), { map: isFile(opt.map) ? opt.map : null, screens: html.length ? opt.screens : null, geometry: isDir(opt.geometry) ? opt.geometry : null, root: opt.root, now: opt.now ?? new Date() });
      const tool = join(DSX, 'tools', 'ux-lint', 'ux-md-drift.mjs');
      items.push(drift.findings.length
        ? { id: 'ux-fresh', ok: false, warning: true, path: opt.ux, detail: `UX.md desatualizado: ${driftHeadline(drift)}`,
          fix: `atualize o UX.md (skill ux-md, Modo C) e suba version/updated no mesmo commit; detalhe: node ${tool} ${rel(opt.ux)} --module ${opt.module} --root ${opt.root}` }
        : { id: 'ux-fresh', ok: true, path: opt.ux, detail: 'UX.md em dia com o mapa e as capturas (arquétipos, políticas, estados, updated)' });
    } catch (e) {
      items.push({ id: 'ux-fresh', ok: false, warning: true, path: opt.ux, detail: `drift do UX.md não calculado: ${e.message}` });
    }
  }
  const geo = isDir(opt.geometry) ? readdirSync(opt.geometry).filter((f) => f.endsWith('.geometry.json')) : [];
  const newest = (dir, files) => Math.max(0, ...files.map((f) => statSync(join(dir, f)).mtimeMs));
  const stale = geo.length && html.length && newest(opt.screens, html) > newest(opt.geometry, geo);
  items.push(geo.length
    ? { id: 'geometry', ok: !stale, path: opt.geometry, detail: `${rel(opt.geometry)} (${geo.length} telas medidas)${stale ? '; mais antiga que as capturas' : ''}`,
      ...(stale ? { fix: `meça de novo: node ${join(DSX, 'tools', 'ux-lint', 'measure.mjs')} ${rel(opt.screens)} --out ${rel(opt.geometry)} --ux UX.md (ou rode a auditoria com --measure)` } : {}) }
    : { id: 'geometry', ok: false, path: opt.geometry, detail: `sem geometria medida em ${rel(opt.geometry)} (regras L de layout e hierarquia não rodam)`,
      fix: `node ${join(DSX, 'tools', 'ux-lint', 'measure.mjs')} ${rel(opt.screens)} --out ${rel(opt.geometry)} --ux UX.md (precisa do Playwright no projeto), ou rode a auditoria com --measure` });
  const code = opt.code.filter(isDir);
  items.push(code.length
    ? { id: 'code', ok: true, path: code.join(' '), detail: code.map(rel).join(', ') }
    : { id: 'code', ok: false, path: null, detail: 'sem pastas de código: o texto não aponta arquivo:linha da origem',
      fix: 'passe --code <pastas do front e das constantes de texto>' });
  return {
    items, drift,
    available: { screens: html.length ? opt.screens : null, geometry: geo.length ? opt.geometry : null, map: isFile(opt.map) ? opt.map : null, ux: isFile(opt.ux) ? opt.ux : null, code, module: opt.module },
  };
}

// ---------- detectores ----------

/** Junta { rule, severity } de qualquer forma de saída (fallback de contagem para família não registrável). */
export function extractRuleHits(json) {
  const out = [];
  // Saída agrupada (text.mjs): conta os grupos, não as ocorrências por tela.
  if (json && !Array.isArray(json) && Array.isArray(json.findings)) json = json.findings;
  const walk = (v, ctx) => {
    if (Array.isArray(v)) { for (const x of v) walk(x, ctx); return; }
    if (!v || typeof v !== 'object') return;
    if (typeof v.rule === 'string' && Number.isFinite(v.severity) && !v.probable_data) {
      out.push({ rule: v.rule, severity: v.severity, screen: v.screen ?? ctx.screen ?? null, message: v.message ?? '' });
      return;
    }
    const next = v.file ? { screen: basename(String(v.file)).replace(/\.html?$/, '') } : ctx;
    for (const [k, x] of Object.entries(v)) if (k !== 'summary' && k !== 'ranking' && k !== 'screens_index') walk(x, next);
  };
  walk(json, {});
  return out;
}

/** Roda os detectores do registro. Devolve [{ family, path, status, file?, count?, hits?, error?, reason? }]. */
export function runDetectors(available, { root, registry = DETECTOR_REGISTRY, workDir }) {
  const results = [];
  for (const d of registry) {
    const path = isAbsolute(d.path) ? d.path : join(DSX, d.path);
    if (!existsSync(path)) { results.push({ family: d.family, path: d.path, status: 'missing' }); continue; }
    const lacking = d.needs.filter((n) => !available[n]);
    if (lacking.length) { results.push({ family: d.family, path: d.path, status: 'skipped', reason: `falta ${lacking.join(', ')}` }); continue; }
    const ctx = { ...available, code: available.code ?? [] };
    const r = spawnSync(process.execPath, [path, ...d.args(ctx)], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    let json = null;
    try { json = JSON.parse(r.stdout); } catch { /* sem JSON */ }
    if (!json || (r.status !== 0 && r.status !== 1)) {
      results.push({ family: d.family, path: d.path, status: 'error', error: (r.stderr || r.error?.message || `saída ${r.status}`).trim().split('\n').slice(-3).join(' ') });
      continue;
    }
    const file = join(workDir, `${d.family}.json`);
    writeFileSync(file, JSON.stringify(json));
    const hits = extractRuleHits(json);
    results.push({ family: d.family, path: d.path, status: 'ran', file, count: hits.length, hits });
  }
  return results;
}

// ---------- registro ----------

const clone = (x) => JSON.parse(JSON.stringify(x));

/**
 * Funde os resultados no registro (em memória; grava só com `write`). Famílias que o findings.mjs ainda não
 * conhece ficam fora do registro e entram no relatório só como contagem desta execução.
 */
export function mergeRun(detectors, opt, { write = false, now = new Date() } = {}) {
  const p = findings.paths(opt.dir, opt.module);
  const st = findings.load(p, opt.module);
  const before = clone(st.findings);
  const known = new Set(findings.FAMILIES);
  const inputs = { root: opt.root };
  const unregistered = [];
  for (const d of detectors.filter((x) => x.status === 'ran')) {
    if (known.has(d.family)) inputs[d.family] = d.file;
    else unregistered.push(d.family);
  }
  const ran = Object.keys(inputs).filter((k) => k !== 'root');
  let commit = null;
  if (ran.length) {
    const run = findings.collect(inputs, st.findings.items);
    st.findings.module = opt.module;
    try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: opt.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; } catch { /* sem git */ }
    findings.merge(st.findings, run, { now, commit, decisions: st.decisions, deviations: findings.deviationsFromUx(opt.ux) });
    if (write) {
      mkdirSync(p.base, { recursive: true });
      writeFileSync(p.findings, `${JSON.stringify(st.findings, null, 2)}\n`);
    }
  }
  return { paths: p, before, after: st.findings, options: st.options, decisions: st.decisions, unregistered, registeredFamilies: ran };
}

// ---------- relatório por dimensão ----------

const ruleDimension = (matrix, item) => {
  if (item.dimension && matrix.dimensions.some((d) => d.id === item.dimension)) return item.dimension;
  if (matrix.rules_index[item.rule]) return matrix.rules_index[item.rule].dimension;
  return matrix.review_rules?.[item.rule]?.dimension ?? null;
};

/**
 * Relatório por dimensão: cobertura (de projeto e efetiva), abertos por severidade, novos, corrigidos e
 * regressões nesta execução, achados de família não registrável e lacunas.
 */
export function dimensionReport(matrix, merged, detectors) {
  const beforeById = new Map((merged.before.items ?? []).map((i) => [i.id, i]));
  const status = new Map(detectors.map((d) => [d.family, d.status]));
  const out = [];
  const empty = () => ({ open: 0, by_severity: { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 }, added: 0, fixed: 0, regressions: 0, accepted: 0, review: 0, unregistered: 0, unregistered_by_severity: { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 } });
  const buckets = new Map(matrix.dimensions.map((d) => [d.id, empty()]));
  buckets.set('(none)', empty());
  for (const it of merged.after.items ?? []) {
    const b = buckets.get(ruleDimension(matrix, it) ?? '(none)');
    const prev = beforeById.get(it.id);
    if (OPEN.has(it.status)) { b.open++; b.by_severity[it.severity] = (b.by_severity[it.severity] ?? 0) + 1; }
    if (it.origin === 'review' && OPEN.has(it.status)) b.review++;
    if (!prev && it.present) b.added++;
    if (prev?.present && !it.present) b.fixed++;
    if (it.status === 'regression') b.regressions++;
    if (it.status === 'accepted-deviation') b.accepted++;
  }
  for (const d of detectors.filter((x) => x.status === 'ran' && merged.unregistered.includes(x.family))) {
    for (const h of d.hits) {
      const b = buckets.get(ruleDimension(matrix, h) ?? '(none)');
      b.unregistered++;
      b.unregistered_by_severity[h.severity] = (b.unregistered_by_severity[h.severity] ?? 0) + 1;
    }
  }
  for (const dim of matrix.dimensions) {
    const families = [...new Set(dim.rules.map((r) => matrix.rules_index[r]?.family).filter(Boolean))];
    const missing = families.filter((f) => status.get(f) !== 'ran');
    let effective = dim.coverage;
    if (families.length && missing.length === families.length) effective = 'judgment';
    else if (missing.length && dim.coverage === 'automated') effective = 'partial';
    out.push({
      id: dim.id, name_pt: dim.name_pt, coverage: dim.coverage, effective_coverage: effective,
      families, missing_families: missing.map((f) => ({ family: f, status: status.get(f) ?? 'missing' })),
      rules: dim.rules, heuristics: dim.heuristics, knowledge: dim.knowledge,
      ...buckets.get(dim.id), gaps_pt: dim.gaps_pt,
    });
  }
  const none = buckets.get('(none)');
  if (none.open || none.unregistered) out.push({ id: '(none)', name_pt: 'Sem dimensão (regra fora da matriz)', coverage: null, effective_coverage: null, families: [], missing_families: [], rules: [], heuristics: [], knowledge: [], ...none, gaps_pt: 'Acrescente a regra em data/ux-dimensions.json (rules_index e a dimensão).' });
  return out;
}

const sevLine = (s) => [4, 3, 2, 1].map((k) => `s${k} ${s[k] ?? 0}`).join(' · ');

export function formatReport(r) {
  const L = [];
  L.push(`Auditoria de UX · módulo ${r.module} · ${r.root}`);
  L.push('\nPré-requisitos');
  for (const p of r.prerequisites) {
    L.push(`  ${p.ok ? '✓' : p.warning ? '!' : '✗'} ${p.id}: ${p.detail}`);
    if (!p.ok && p.fix) L.push(`      como gerar: ${p.fix}`);
  }
  L.push('\nDetectores');
  for (const d of r.detectors) {
    const what = FAMILY_PT[d.family] ?? d.family;
    if (d.status === 'ran') L.push(`  ✓ ${what}: ${d.count} achado(s)${r.unregistered.includes(d.family) ? ' (família ainda não registrável no findings.mjs: só contagem)' : ''}`);
    else if (d.status === 'missing') L.push(`  – ${what}: detector ausente (${d.path}); dimensões dele ficam no julgamento`);
    else if (d.status === 'skipped') L.push(`  – ${what}: não rodou (${d.reason})`);
    else L.push(`  ✗ ${what}: erro (${d.error})`);
  }
  if (r.ux_drift?.findings.length) {
    L.push(`\nUX.md × produto (${r.ux_drift.findings.length} achado(s) de drift)`);
    for (const f of r.ux_drift.findings) L.push(`  ${f.rule} sev ${f.severity}${f.screen ? ` | ${f.screen}` : ''} | ${f.message}`);
  }
  L.push(`\nRegistro: ${r.registered ? `gravado em ${r.findings_file}` : `não gravado (use --register); comparado com ${r.findings_file}`}`);
  if (r.quality) {
    for (const p of r.quality.problems ?? []) L.push(`\nAVISO critérios: ${p}`);
    for (const e of r.quality.validation?.errors ?? []) L.push(`\nAVISO critérios: ${e}`);
    L.push(formatQuality(r.quality, { criteriaFile: r.quality.plan }));
    if (r.quality.out) L.push(`  results: ${r.quality.out}`);
    L.push('\nDiagnostic — 14 dimensions (raw counts; a count is not a verdict)');
  }
  L.push('\nRelatório por dimensão');
  for (const d of r.dimensions) {
    const cov = d.coverage ? `${COVERAGE_PT[d.coverage]}${d.effective_coverage !== d.coverage ? ` → ${COVERAGE_PT[d.effective_coverage]} nesta execução` : ''}` : '';
    const miss = d.missing_families.length ? ` · sem detector: ${d.missing_families.map((m) => m.family).join(', ')}` : '';
    L.push(`\n${d.name_pt} [${d.id}] · cobertura ${cov}${miss}`);
    L.push(`  abertos ${d.open} (${sevLine(d.by_severity)})${d.review ? `, ${d.review} de revisão` : ''} · novos ${d.added} · corrigidos ${d.fixed} · regressões ${d.regressions}${d.accepted ? ` · ${d.accepted} desvio(s) aceito(s)` : ''}${d.unregistered ? ` · ${d.unregistered} fora do registro (${sevLine(d.unregistered_by_severity)})` : ''}`);
    if (d.coverage !== 'automated' || d.missing_families.length) L.push(`  lacunas: ${d.gaps_pt}`);
    if (['judgment', 'reference'].includes(d.effective_coverage) && d.knowledge.length) L.push(`  revisar com: ${d.knowledge.join(', ')}`);
  }
  const t = r.totals;
  L.push(`\nTotal: ${t.open} abertos (${sevLine(t.by_severity)}) · ${t.added} novos · ${t.fixed} corrigidos · ${t.regressions} regressões${t.accepted ? ` · ${t.accepted} desvios aceitos (não contam)` : ''}${t.unregistered ? ` · ${t.unregistered} fora do registro (família que o findings.mjs ainda não registra)` : ''}`);
  if (r.preview) {
    const p = r.preview;
    if (!p.summary) L.push(`Prévias: ${p.detail}`);
    else {
      L.push(`Prévias: ${p.summary.cases} caso(s) · ${p.stats.generated} gerado(s), ${p.stats.cached} do cache, ${p.stats.failed} sem prévia · em ${p.out}${p.detail ? ` (${p.detail})` : ''}`);
      L.push(`  por operação: ${Object.entries(p.summary.by_op).map(([k, v]) => `${k} ${v}`).join(' · ') || 'nenhuma'}`);
      for (const [k, v] of Object.entries(p.summary.without)) L.push(`  sem prévia (${v}): ${k}`);
    }
  }
  for (const w of r.page_warnings ?? []) L.push(`AVISO: ${w}`);
  if (r.pages?.length > 1) { L.push(`Página de decisão: ${r.pages.length} páginas`); for (const p of r.pages) L.push(`  ${p.file} · ${p.cases} casos · ${(p.bytes / 1048576).toFixed(2)} MB`); }
  else if (r.page) L.push(`Página de decisão: ${r.page}${r.pages?.[0] ? ` · ${(r.pages[0].bytes / 1048576).toFixed(2)} MB` : ''}`);
  return L.join('\n');
}

// ---------- tabelas do documento (knowledge/fundamentos/dimensoes-de-ux.md) ----------

const VERIFIED_PT = { automated: 'regra automática', partial: 'regra automática + julgamento', judgment: 'julgamento', reference: 'só referência' };
const cell = (s) => String(s).replace(/\|/g, '\\|');

/** Tabela das dimensões, gerada da matriz; o documento a contém literalmente (teste em tools/test/ux-dimensions.test.mjs). */
export function renderDimensionsTable(matrix) {
  const rows = ['| Dimensão | Pergunta | Regras | Verificação | Heurísticas | Lacunas |', '|---|---|---|---|---|---|'];
  for (const d of matrix.dimensions) {
    rows.push(`| ${d.name_pt} (\`${d.id}\`) | ${cell(d.question_pt)} | ${d.rules.length ? d.rules.join(', ') : '—'} | ${VERIFIED_PT[d.coverage]} | ${d.heuristics.length ? d.heuristics.map((h) => `H${h}`).join(', ') : '—'} | ${cell(d.gaps_pt)} |`);
  }
  return rows.join('\n');
}

/** Tabela das regras (rules_index), gerada da matriz. */
export function renderRulesTable(matrix) {
  const name = new Map(matrix.dimensions.map((d) => [d.id, d.name_pt]));
  const rows = ['| Regra | Família | Dimensão | Sev | Heurísticas | O que acusa |', '|---|---|---|---|---|---|'];
  for (const [id, r] of Object.entries(matrix.rules_index)) {
    rows.push(`| ${id} | ${r.family} | ${name.get(r.dimension) ?? r.dimension} | ${r.severity} | ${r.heuristics.length ? r.heuristics.map((h) => `H${h}`).join(', ') : '—'} | ${cell(r.summary_pt)} |`);
  }
  return rows.join('\n');
}

// ---------- orquestração ----------

/** Roda measure.mjs (se existir e houver capturas) para gerar a geometria das regras L. */
export function measureGeometry(opt) {
  const tool = join(DSX, 'tools', 'ux-lint', 'measure.mjs');
  if (!existsSync(tool)) return { id: 'measure', ok: false, path: null, detail: 'measure.mjs não existe nesta versão do DSX' };
  if (!isDir(opt.screens)) return { id: 'measure', ok: false, path: null, detail: 'sem capturas para medir' };
  const r = spawnSync(process.execPath, [tool, opt.screens, '--out', opt.geometry, ...(isFile(opt.ux) ? ['--ux', opt.ux] : [])], { cwd: opt.root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status === 0) return { id: 'measure', ok: true, path: opt.geometry, detail: 'geometria medida nesta execução' };
  const why = (r.stderr || r.stdout || '').trim().split('\n').slice(-2).join(' ');
  return { id: 'measure', ok: false, path: null, detail: `medição falhou (saída ${r.status}): ${why}`, fix: r.status === 3 ? 'instale o Playwright no projeto (npm i -D playwright && npx playwright install chromium)' : undefined };
}

/**
 * Roda o preview.mjs (processo filho, no diretório atual — de onde o Playwright do projeto é resolvido) sobre o
 * registro desta execução, gravado num diretório temporário para levar os seletores que o layout acabou de medir.
 */
export function runPreviewTool(merged, opt, workDir, previewsDir) {
  const tool = join(DSX, 'tools', 'ux-lint', 'preview.mjs');
  if (!existsSync(tool)) return { ok: false, detail: 'preview.mjs não existe nesta versão do DSX' };
  const tmp = join(workDir, 'registry');
  const base = join(tmp, opt.module);
  mkdirSync(base, { recursive: true });
  writeFileSync(join(base, 'findings.json'), JSON.stringify(merged.after));
  writeFileSync(join(base, 'options.json'), JSON.stringify(merged.options));
  writeFileSync(join(base, 'decisions.json'), JSON.stringify(merged.decisions));
  const args = [tool, '--module', opt.module, '--root', opt.root, '--dir', tmp, '--out', previewsDir, '--screens', opt.screens, '--map', opt.map, '--json',
    ...(opt.minSeverity !== null && opt.minSeverity !== undefined ? ['--min-severity', String(opt.minSeverity)] : [])];
  const r = spawnSync(process.execPath, args, { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let json = null;
  try { json = JSON.parse(r.stdout); } catch { /* sem JSON */ }
  const why = (r.stderr || '').trim().split('\n').slice(0, 3).join(' ');
  if (!json) return { ok: false, detail: `preview.mjs falhou (saída ${r.status}): ${why}` };
  return { ok: r.status === 0, playwright: r.status !== 3, out: json.out, stats: json.stats, summary: json.summary, detail: r.status === 3 ? 'Playwright indisponível: só os diagramas de fluxo saíram; rode de uma pasta do projeto que tenha o Playwright' : null };
}

/** Executa a auditoria. `registry` permite trocar o registro de detectores (testes). */
export function runAudit(raw, { registry = DETECTOR_REGISTRY, matrix = loadMatrix(), now = new Date() } = {}) {
  const opt = { ...resolveOptions(raw), now };
  const measured = opt.measure ? measureGeometry(opt) : null;
  const pre = checkPrerequisites(opt);
  if (measured) pre.items.push(measured);
  const workDir = mkdtempSync(join(tmpdir(), 'dsx-audit-'));
  try {
    const detectors = runDetectors(pre.available, { root: opt.root, registry, workDir });
    const merged = mergeRun(detectors, opt, { write: opt.register, now });
    const dimensions = dimensionReport(matrix, merged, detectors);
    const totals = dimensions.reduce((t, d) => {
      t.open += d.open; t.added += d.added; t.fixed += d.fixed; t.regressions += d.regressions; t.unregistered += d.unregistered; t.accepted += d.accepted;
      for (const k of [4, 3, 2, 1]) t.by_severity[k] += d.by_severity[k] ?? 0;
      return t;
    }, { open: 0, added: 0, fixed: 0, regressions: 0, unregistered: 0, accepted: 0, by_severity: { 4: 0, 3: 0, 2: 0, 1: 0 } });
    const quality = evaluateForAudit({
      criteria: typeof raw.criteria === 'string' ? raw.criteria : null, evidence: typeof raw.evidence === 'string' ? raw.evidence : null,
      screens: pre.available.screens, map: pre.available.map, ux: pre.available.ux, items: merged.after.items ?? [], findingsPath: merged.paths.findings, root: opt.root,
    });
    const provenance = buildProvenance({
      root: opt.root, ownerRole: typeof raw['owner-role'] === 'string' ? raw['owner-role'] : 'orchestrator', generator: 'dsx tools/ux-lint/audit.mjs', now,
      sources: [pre.available.screens, pre.available.map, pre.available.ux, pre.available.geometry, quality.plan, quality.evidence],
      criteria: quality.results.map((r) => r.id),
      evidenceClass: [...new Set(['observed', ...quality.results.map((r) => r.evidence?.class).filter(Boolean)])],
      assumptions: ['captures render the real components with fictional data; static probes do not render the declared viewport'],
      gaps: [...pre.items.filter((p) => !p.ok).map((p) => `${p.id}: ${p.detail}`), ...quality.problems, ...(quality.results.filter((r) => r.verdict === 'unknown').map((r) => `${r.id} unknown: ${r.reason}`))],
    });
    if (typeof raw['criteria-out'] === 'string') {
      const out = resolve(raw['criteria-out']);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, `${JSON.stringify({ format: 1, plan: quality.plan, provenance, validation: quality.validation, criteria: quality.results, report: quality.report }, null, 2)}\n`);
      quality.out = out;
    }
    let page = null, pages = null, preview = null, pageWarnings = [];
    const previewsDir = join(opt.dir, opt.module, 'previews');
    if (opt.preview) preview = runPreviewTool(merged, opt, workDir, previewsDir);
    if (opt.page) {
      findings.restatus(merged.after, merged.decisions);
      const w = findings.writePages(merged.after, merged.options, merged.decisions, opt.page, {
        product: raw.product ?? '', color: raw.color ?? '#2B59C3', previewsDir, screensDir: opt.screens, previewFiles: opt.previewFiles,
        noPreview: !opt.preview && !existsSync(join(previewsDir, 'previews.json')), ...(opt.maxPageMb ? { maxBytes: opt.maxPageMb * 1048576 } : {}),
      });
      page = opt.page;
      pages = w.pages;
      pageWarnings = w.warnings;
    }
    return {
      module: opt.module, root: opt.root, registered: opt.register && merged.registeredFamilies.length > 0,
      findings_file: merged.paths.findings, prerequisites: pre.items, ux_drift: pre.drift ? { findings: pre.drift.findings, summary: pre.drift.summary } : null,
      detectors: detectors.map(({ hits, file, ...d }) => d), unregistered: merged.unregistered,
      dimensions, totals, page, pages, page_warnings: pageWarnings, preview,
      quality: { plan: quality.plan, out: quality.out ?? null, validation: quality.validation, problems: quality.problems, criteria: quality.results, ...quality.report },
      provenance,
    };
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

const USAGE = 'Uso: node tools/ux-lint/audit.mjs --module <m> --root <projeto> [--config <file>] [--screens <dir>] [--code <dirs...>] [--config <file>] [--map <flows.json>] [--ux UX.md] [--geometry <dir>] [--measure] [--dir <findings>] [--register] [--preview [--min-severity <n>]] [--page <saida.html> [--preview-files] [--max-page-mb 10]] [--criteria <cycles/C-n/plan.md> [--evidence <file.json>] [--criteria-out <file.json>]] [--owner-role <role>] [--json]';

function main() {
  const a = parseAuditArgs(process.argv.slice(2));
  if (!a.module || a.module === true) { console.error(USAGE); process.exit(2); }
  const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
  const r = runAudit(a, { now });
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else console.log(formatReport(r));
  process.exit(r.detectors.some((d) => d.status === 'ran') ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
