#!/usr/bin/env node
// ux-lint, states level: applies rules S1–S3 of the UX.md contract (knowledge/foundations/ux-md.md, "States")
// to the folder of HTML captures. No dependencies.
//
// Usage: node tools/ux-lint/states.mjs <captures-folder> [--ux UX.md] [--archetypes <folder>] [--order capture-order.json]
//                                      [--json] [--fail-at 3]
//
// Capture convention: `<nn>-<screen-id>.html` is the screen's main state (with data, or the dialog open);
// `<nn>-<screen-id>.<state>.html` is one of its states (`02-library.empty.html`, `03-document.error.html`).
// Type and parent of each screen come, when present, from `capture-order.json` in the folder or the one above
// ([{ nn, id, type, parent }], the same as the capture-from-code skill); without it, every non-dialog screen is a page.
//
// S1 required state without a capture · S2 empty/error state without an exit action · S3 error message without guidance.
// Required states per screen type (the rule is in knowledge/foundations/ux-md.md, "States"):
//   page   — UX.md `states` ∪ archetype `states`, minus the main one (`success`) and the transient ones
//            (`running`, `submitting`, `saving`); UX.md `empty`/`empty-filtered` only when the archetype has
//            some empty state (detail and editor have no empty list) or the screen has no archetype.
//   child  — tab, panel or step with a captured parent (`parent` in capture-order): the page set minus what the
//            parent already requires (the parent's loading, error and no-access cover the child).
//   dialog — only `error` when the dialog has an action that calls the server (primary or destructive), and
//            `field-error` when the archetype declares it and the dialog has a required field; never `loading`,
//            `empty`, `no-access`.
//   panel with no archetype and no parent (e.g. a menu) — no required state.
// Empty-state wording, guidance verbs and dismiss labels come from every language pack (lib/lang/).
// JSON (--json): { summary, screens: [{ screen, nn, kind, archetype, parent, captures, required,
//                  findings: [{ rule, severity, state, region, message, evidence }] }] }.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { anyEmptyText, unionList } from './lib/lang/index.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, textOf, contains } from './lib/html.mjs';
import { loadArchetypes } from '../lint-archetypes.mjs';

export const SEVERITY = { S1: 2, S2: 2, S3: 2 };
/** Contract minimum when UX.md does not declare `states`. */
export const DEFAULT_STATES = ['loading', 'empty', 'error', 'no-access', 'success'];
/** Transient states: a capture is welcome but not required (they last less than a second). */
export const TRANSIENT_STATES = ['running', 'submitting', 'saving'];
/** State covered by the main capture, per screen type. */
export const PRINCIPAL_STATE = { page: 'success', child: 'success', dialog: 'open', panel: 'success' };
export const DIALOG_ARCHETYPES = ['confirmation-dialog', 'form-dialog'];
/** Loading states the parent covers for the child. */
const PAGE_LOAD_STATES = ['loading', 'error', 'no-access'];
/** States where the person needs a way out (S2). */
export const EXIT_STATES = /^(empty|empty-filtered|nothing-selected|no-data-in-period|error|no-access|invalid-link|expired-link|unavailable|item-removed)$/;
const ERROR_STATES = /^(error|no-access|invalid-link|expired-link|unavailable|item-removed|conflict)$/;
const EMPTY_STATES = /^(empty|empty-filtered|nothing-selected|no-data-in-period)$/;
/** Capture file name: `<nn>-<screen-id>[.<state>].html`. */
export const CAPTURE_RE = /^(\d+)-([a-z0-9]+(?:-[a-z0-9]+)*)(?:\.([a-z0-9]+(?:-[a-z0-9]+)*))?\.html$/;

const ERROR_ALERT = '.MuiAlert-standardError, .MuiAlert-filledError, .MuiAlert-outlinedError, .MuiAlert-colorError';
const ANY_ALERT = '[role=alert], .MuiAlert-root';
const ACTION = 'button, [role=button], a[href], [role=link]';
const NOT_EXIT = '[role=tab], .MuiTab-root, .MuiTableSortLabel-root, [role=combobox], [role=switch], [role=checkbox], [role=radio]';
/** Product-text vocabulary from every language pack (lib/lang/): a screen in either language is recognized. */
const anyOf = (list) => list.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const EMPTY_TEXT = { test: (t) => anyEmptyText(t) };
/** Next-step verbs and phrases in an error message (every pack). No diacritics, lowercase. */
const GUIDANCE = new RegExp(`\\b(${anyOf(unionList('guidance'))})\\b`, 'i');
const ONLY_FAILURE = new RegExp(`^(${anyOf(unionList('onlyFailure'))})\\b[^a-z]{0,40}$`, 'i');
const DISMISS = new RegExp(`^(${anyOf(unionList('dismiss'))})$`, 'i');
const CODE_LIKE = /\b(HTTP\s*)?[45]\d\d\b|\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b|\bERR[_-]/;

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// ---------- inputs ----------

/** Lists the captures of a folder grouped by screen: Map<screenId, { nn, main, states: Map<state, file> }>. */
export function discoverCaptures(dir) {
  const screens = new Map();
  for (const f of readdirSync(dir).sort()) {
    const m = CAPTURE_RE.exec(f);
    if (!m) continue;
    const [, nn, id, state] = m;
    if (!screens.has(id)) screens.set(id, { nn, main: null, states: new Map() });
    const s = screens.get(id);
    if (state) s.states.set(state, join(dir, f));
    else { s.main = join(dir, f); s.nn = nn; }
  }
  return screens;
}

/** Archetypes: id → { states, regions, primary_action }. Reads index.json when present; otherwise the cards. */
export function loadArchetypeStates(dir) {
  const out = {};
  if (!dir || !existsSync(dir)) return out;
  const index = join(dir, 'index.json');
  if (existsSync(index)) {
    for (const a of JSON.parse(readFileSync(index, 'utf8'))) out[a.id] = { states: a.states ?? [], regions: a.regions ?? [] };
    return out;
  }
  for (const c of loadArchetypes(dir)) if (c.fm?.id) out[c.fm.id] = { states: c.fm.states ?? [], regions: c.fm.regions ?? [] };
  return out;
}

/** capture-order.json of the folder or the one above → Map<id, { type, parent }>. */
export function loadOrder(dir, explicit = null) {
  const file = explicit ?? [join(dir, 'capture-order.json'), join(dirname(dir), 'capture-order.json')].find(existsSync);
  if (!file || !existsSync(file)) return { file: null, order: new Map() };
  const list = JSON.parse(readFileSync(file, 'utf8'));
  return { file, order: new Map((Array.isArray(list) ? list : list.screens ?? []).map((x) => [x.id, { type: x.type ?? null, parent: x.parent ?? null }])) };
}

/** Screen → archetype map from UX.md `archetypes` ({ archetype: [screens] }). */
export function archetypeByScreen(cfg) {
  const out = new Map();
  for (const [arch, screens] of Object.entries(cfg.archetypes ?? {})) for (const s of [].concat(screens ?? [])) out.set(String(s), arch);
  return out;
}

// ---------- analysis of one capture ----------

function regionOf(root, node, cfg) {
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
  const d = dialogs.find((x) => contains(x, node));
  if (d) return d;
  return closest(node, (sel.regions ?? []).filter((r) => r !== sel.dialog).join(', ') || 'main') ?? root;
}

const regionName = (r, cfg) => {
  if (!r || r.type !== 'element') return '(screen)';
  if (matches(r, cfg.verification.selectors.dialog)) return 'dialog';
  return r.tag + (r.attrs.role ? `[role=${r.attrs.role}]` : '');
};

function disabled(n) {
  for (let x = n; x && x.type === 'element'; x = x.parent) {
    if ('disabled' in x.attrs || x.attrs['aria-disabled'] === 'true' || / Mui-disabled /.test(` ${x.attrs.class || ''} `)) return true;
  }
  return false;
}

/** Actions that take the person out of the state: a visible, enabled button or link (tabs, sorting and fields do not count). */
function exits(scope) {
  return querySelectorAll(scope, ACTION).filter((b) => !isHidden(b) && !disabled(b) && !matches(b, NOT_EXIT) && !closest(b, NOT_EXIT) && !closest(b, '[aria-hidden=true]'));
}

/** State messages in the capture: error alerts (and any alert in an error capture) or the empty text. */
function stateMessages(root, state, cfg) {
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
  const inFocus = (n) => !dialogs.length || dialogs.some((d) => contains(d, n));
  const visible = (n) => !isHidden(n) && inFocus(n) && clean(textOf(n));
  const alertSel = state && ERROR_STATES.test(state) ? ANY_ALERT : ERROR_ALERT;
  const alerts = querySelectorAll(root, alertSel).filter(visible).filter((a, _, all) => !all.some((b) => b !== a && contains(b, a)));
  if (state && EMPTY_STATES.test(state)) {
    const blocks = querySelectorAll(root, 'p, td, li, strong, h2, h3, h4, h5, h6, .MuiTypography-root').filter(visible)
      .filter((n) => EMPTY_TEXT.test(clean(textOf(n))));
    return { kind: 'empty', nodes: blocks.filter((a, _, all) => !all.some((b) => b !== a && contains(b, a))) };
  }
  return { kind: 'error', nodes: alerts };
}

/**
 * Analyzes the capture of a state (or the main one, `state = null`, for S3 only). Returns S2/S3 findings.
 * `file` goes into the evidence.
 */
export function analyzeStateCapture(html, state, cfg = configFrom({}), file = 'tela.html') {
  const root = parseHtml(html);
  const findings = [];
  const ev = (n) => `${file}:${n.line}:${n.col}`;
  const add = (rule, region, message, evidence) => findings.push({ rule, severity: SEVERITY[rule], state: state ?? 'principal', region, message, evidence });
  const { kind, nodes } = stateMessages(root, state, cfg);

  // S2: empty/error without an exit action in the state's region.
  if (state && EXIT_STATES.test(state)) {
    const sel = cfg.verification.selectors;
    const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
    const anchor = nodes[0] ?? dialogs[0] ?? querySelectorAll(root, 'main')[0] ?? root;
    const region = anchor === root ? root : regionOf(root, anchor, cfg);
    if (!exits(region).length) {
      add('S2', regionName(region, cfg), `state "${state}" without an exit button or link in the region (offer the next step: try again, clear the filter, create, go back)`, anchor === root ? file : ev(anchor));
    }
  }

  // S3: error message without guidance.
  if (kind === 'error') {
    if (state && ERROR_STATES.test(state) && !nodes.length) {
      add('S3', '(screen)', `state "${state}" without a visible error message (say what happened and what to do)`, file);
    }
    for (const n of nodes) {
      const text = clean(textOf(n));
      const hasAction = exits(n).length > 0;
      const guided = GUIDANCE.test(fold(text));
      const bare = ONLY_FAILURE.test(fold(text)) || (CODE_LIKE.test(text) && text.split(' ').length <= 6);
      if (!bare && (guided || hasAction)) continue;
      add('S3', regionName(regionOf(root, n, cfg), cfg), `error message without guidance: "${text.slice(0, 100)}" (say what happened and what the person can do)`, ev(n));
    }
  }
  return findings;
}

/** Does the main capture's dialog call the server (primary/destructive other than cancel) and have a required field? */
function dialogTraits(html, cfg) {
  const root = parseHtml(html);
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
  const scope = dialogs.length ? dialogs : [];
  const cancel = DISMISS;
  let serverAction = false, requiredField = false;
  for (const d of scope) {
    for (const b of querySelectorAll(d, sel.button)) {
      if (isHidden(b) || cancel.test(clean(textOf(b)))) continue;
      if (matches(b, sel.primary) || matches(b, sel.destructive)) serverAction = true;
    }
    if (querySelectorAll(d, '[required], [aria-required=true], .MuiFormLabel-asterisk').length) requiredField = true;
  }
  return { open: dialogs.length > 0, serverAction, requiredField };
}

// ---------- required states ----------

/**
 * Required states of a screen. `kind`: page | child | dialog | panel. `parentRequired`: the parent's required set
 * (children). `traits`: { serverAction, requiredField } of the dialog; { public } of a page without login (no `no-access`).
 */
export function requiredStates({ kind, archetype = null, uxStates = DEFAULT_STATES, archetypeStates = null, parentRequired = [], traits = {} }) {
  const arch = archetypeStates ?? [];
  if (kind === 'dialog') {
    const out = [];
    if (traits.serverAction) out.push('error');
    if (traits.requiredField && arch.includes('field-error')) out.push('field-error');
    return out;
  }
  if (kind === 'panel' && !archetype) return [];
  const archHasEmpty = arch.some((s) => EMPTY_STATES.test(s));
  const fromUx = uxStates.filter((s) => !EMPTY_STATES.test(s) || !archetype || archHasEmpty);
  let out = [...new Set([...fromUx, ...arch])]
    .filter((s) => s !== PRINCIPAL_STATE[kind] && s !== 'open' && !TRANSIENT_STATES.includes(s));
  if (kind === 'child') out = out.filter((s) => !parentRequired.includes(s) && !PAGE_LOAD_STATES.includes(s));
  // a public page without login has no "no access": whoever has the link gets in (invalid/expired link come from the archetype)
  if (traits.public) out = out.filter((s) => s !== 'no-access');
  return out;
}

/** Where each required state comes from (for the S1 message). */
function origin(state, uxStates, archetype, archStates, kind) {
  if (kind === 'dialog') return state === 'error' ? 'dialog with an action that calls the server' : `dialog with a required field, archetype ${archetype}`;
  const ux = uxStates.includes(state), ar = (archStates ?? []).includes(state);
  if (ux && ar) return `UX.md and archetype ${archetype}`;
  return ux ? 'UX.md' : `archetype ${archetype}`;
}

/**
 * Analisa a pasta inteira. Devolve [{ screen, nn, kind, archetype, parent, captures, required, findings }].
 * `archetypes`: id → { states } (loadArchetypeStates); `order`: Map from loadOrder.
 */
export function analyzeStates(dir, cfg = configFrom({}), { archetypes = {}, order = new Map() } = {}) {
  const captures = discoverCaptures(dir);
  const byScreen = archetypeByScreen(cfg);
  const uxStates = Array.isArray(cfg.states) && cfg.states.length ? cfg.states : DEFAULT_STATES;
  const info = new Map();
  // Step 1: type of each screen.
  for (const [id, c] of captures) {
    const archetype = byScreen.get(id) ?? null;
    const o = order.get(id) ?? {};
    const traits = c.main ? dialogTraits(readFileSync(c.main, 'utf8'), cfg) : {};
    let kind = 'page';
    if (DIALOG_ARCHETYPES.includes(archetype) || /^(dialog|modal)$/.test(o.type ?? '') || (!archetype && traits.open)) kind = 'dialog';
    else if (o.parent && captures.has(o.parent)) kind = 'child';
    else if (/^(panel|drawer)$/.test(o.type ?? '') && !archetype) kind = 'panel';
    if (o.type === 'public') traits.public = true;
    info.set(id, { kind, archetype, parent: o.parent ?? null, traits });
  }
  // Step 2: required. A child subtracts everything its parent (and the parent's parents) already require.
  const req = new Map();
  const covered = new Map();
  const requiredOf = (id, seen = new Set()) => {
    if (req.has(id)) return req.get(id);
    const i = info.get(id);
    if (!i || seen.has(id)) return [];
    seen.add(id);
    if (i.kind === 'child') requiredOf(i.parent, seen);
    const parentRequired = i.kind === 'child' ? covered.get(i.parent) ?? [] : [];
    const r = requiredStates({ kind: i.kind, archetype: i.archetype, uxStates, archetypeStates: archetypes[i.archetype]?.states ?? null, parentRequired, traits: i.traits });
    req.set(id, r);
    covered.set(id, [...new Set([...parentRequired, ...r])]);
    return r;
  };
  const results = [];
  for (const [id, c] of captures) {
    const i = info.get(id);
    const required = requiredOf(id);
    const findings = [];
    const mainFile = c.main ?? [...c.states.values()][0];
    for (const s of required) {
      if (c.states.has(s)) continue;
      findings.push({
        rule: 'S1', severity: SEVERITY.S1, state: s, region: '(screen)',
        message: `state "${s}" required (${origin(s, uxStates, i.archetype, archetypes[i.archetype]?.states, i.kind)}) without capture ${c.nn}-${id}.${s}.html`,
        evidence: mainFile,
      });
    }
    if (c.main) findings.push(...analyzeStateCapture(readFileSync(c.main, 'utf8'), null, cfg, c.main));
    for (const [s, f] of c.states) findings.push(...analyzeStateCapture(readFileSync(f, 'utf8'), s, cfg, f));
    results.push({ screen: id, nn: c.nn, kind: i.kind, archetype: i.archetype, parent: i.parent, captures: [...(c.main ? ['(main)'] : []), ...c.states.keys()], required, findings });
  }
  return results.sort((a, b) => a.nn.localeCompare(b.nn, 'en', { numeric: true }) || a.screen.localeCompare(b.screen));
}

export function summarize(results) {
  const byRule = {};
  const bySeverity = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of results) for (const a of r.findings) { byRule[a.rule] = (byRule[a.rule] || 0) + 1; bySeverity[a.severity]++; }
  return {
    screens: results.length,
    state_captures: results.reduce((s, r) => s + r.captures.filter((c) => c !== '(main)').length, 0),
    screens_with_findings: results.filter((r) => r.findings.length).length,
    findings: results.reduce((s, r) => s + r.findings.length, 0),
    by_rule: byRule,
    by_severity: bySeverity,
  };
}

const USAGE = 'Usage: node tools/ux-lint/states.mjs <captures-folder> [--ux UX.md] [--archetypes <folder>] [--order capture-order.json] [--json] [--fail-at 3]';
const DEFAULT_ARCHETYPES = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'archetypes');

function main() {
  const args = parseCli('ux-lint/states.mjs');
  const dir = args._[0];
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) { console.error(USAGE); process.exit(2); }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const archetypes = loadArchetypeStates(typeof args.archetypes === 'string' ? args.archetypes : DEFAULT_ARCHETYPES);
  const { file: orderFile, order } = loadOrder(dir, typeof args.order === 'string' ? args.order : null);
  const results = analyzeStates(dir, cfg, { archetypes, order });
  const summary = summarize(results);
  const threshold = Number(args['fail-at'] ?? 3);
  if (args.json) {
    console.log(JSON.stringify({ summary, ...(orderFile ? { order: orderFile } : {}), screens: results, ...(cfg.legacyWarnings.length ? { warnings: cfg.legacyWarnings } : {}) }, null, 2));
  } else {
    for (const r of results) {
      const tag = `${r.nn}-${r.screen} [${r.kind}${r.archetype ? ` · ${r.archetype}` : ''}] states: ${r.captures.join(', ') || '—'}; required: ${r.required.join(', ') || '—'}`;
      if (!r.findings.length) { console.log(`✓ ${tag}`); continue; }
      console.log(`✗ ${tag}`);
      for (const a of r.findings) console.log(`   ${a.rule} sev ${a.severity} | ${a.state} | ${a.region} | ${a.message}\n      ${a.evidence}`);
    }
    const rules = Object.entries(summary.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'none';
    console.log(`\nSummary: ${summary.screens} screens, ${summary.state_captures} state captures, ${summary.findings} findings (${rules})${orderFile ? `; types from ${basename(orderFile)}` : ''}`);
  }
  process.exit(results.some((r) => r.findings.some((a) => a.severity >= threshold)) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
