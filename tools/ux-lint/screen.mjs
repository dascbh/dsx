#!/usr/bin/env node
// ux-lint, screen level: applies rules T1–T7 of the UX.md contract (knowledge/foundations/ux-md.md)
// to HTML captures of screens. No dependencies.
//
// Usage: node tools/ux-lint/screen.mjs <folder-or-files.html...> [--ux UX.md] [--json] [--fail-at 3]
// Output: findings per screen (rule, region, file:line evidence, severity 0–4) and a summary.
// Exit code 1 when a finding has severity >= --fail-at (default 3).
// Product-text vocabulary (dismiss, generic and verbless labels) comes from the language pack (lib/lang/).
// JSON (--json): { summary, screens: [{ file, dialog_open, findings: [{ rule, severity, region, message, evidence }] }] }.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { langPack, unionList } from './lib/lang/index.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, textOf, getById, walk, contains } from './lib/html.mjs';

export const SEVERITY = { T1: 3, T2: 2, T3: 2, T4: 3, T5: 3, T6: 2, T7: 1 };
/** Dismiss labels of every language pack (a cancel button is recognized in either language). */
export const CANCEL_LABELS = unionList('dismiss');
/** Default (pt-BR) lists, kept as exports for compatibility; the rules read the pack of `content.language`. */
export const GENERIC_DESTRUCTIVE_LABELS = langPack().genericDestructiveLabels;
export const LABELS_WITHOUT_VERB = langPack().labelsWithoutVerb;

const norm = (s) => s.toLowerCase().replace(/[.!?:…]+$/, '').replace(/\s+/g, ' ').trim();
const ariaHidden = (n) => !!closest(n, '[aria-hidden=true]');

function accessibleName(root, n) {
  const t = textOf(n);
  if (t) return t;
  if (n.attrs['aria-label']) return n.attrs['aria-label'].trim();
  if (n.attrs['aria-labelledby']) {
    return n.attrs['aria-labelledby'].split(/\s+/).map((id) => getById(root, id)).filter(Boolean).map(textOf).join(' ').trim();
  }
  return (n.attrs.title || '').trim();
}

function fieldLabel(root, f) {
  if (f.attrs['aria-label']?.trim()) return f.attrs['aria-label'].trim();
  if (f.attrs['aria-labelledby']) {
    const t = f.attrs['aria-labelledby'].split(/\s+/).map((id) => getById(root, id)).filter(Boolean).map(textOf).join(' ').trim();
    if (t) return t;
  }
  if (f.attrs.id) {
    for (const l of querySelectorAll(root, 'label')) if (l.attrs.for === f.attrs.id && textOf(l)) return textOf(l);
  }
  const anc = closest(f.parent, 'label');
  if (anc && textOf(anc)) return textOf(anc);
  if (f.attrs.title?.trim()) return f.attrs.title.trim();
  return '';
}

/**
 * Analyzes one screen. `html` is the content; `file` goes into the evidence; `cfg` comes from loadConfig/configFrom.
 * Returns { file, dialog_open, findings: [{ rule, severity, region, message, evidence }] }.
 */
export function analyzeScreen(html, cfg = configFrom({}), file = 'screen.html') {
  const root = parseHtml(html);
  const L = langPack(cfg);
  const sel = cfg.verification.selectors;
  const regionSel = [...sel.regions, sel.dialog].join(', ');
  const findings = [];
  const ev = (n) => `${file}:${n.line}:${n.col}`;
  const evs = (ns) => [...new Set(ns.map(ev))].join(', ');
  const add = (rule, region, message, evidence) =>
    findings.push({ rule, severity: SEVERITY[rule], region, message, evidence });

  // Regions: a stable label per element (tag, id/role and, for a dialog, its title).
  const counts = {};
  const labels = new Map();
  const regionLabel = (r) => {
    if (!r) return '(outside any region)';
    if (labels.has(r)) return labels.get(r);
    let base = r.tag + (r.attrs.id && !/^_r_|^:r/.test(r.attrs.id) ? `#${r.attrs.id}` : '');
    if (matches(r, sel.dialog)) {
      const title = r.attrs['aria-labelledby'] ? textOf(getById(root, r.attrs['aria-labelledby'].split(/\s+/)[0]) || r) : r.attrs['aria-label'] || '';
      base = `dialog${title ? ` "${title.slice(0, 60)}"` : ''}`;
    } else if (r.attrs.role) base += `[role=${r.attrs.role}]`;
    counts[base] = (counts[base] || 0) + 1;
    const label = counts[base] > 1 ? `${base} (#${counts[base]})` : base;
    labels.set(r, label);
    return label;
  };
  const regionOf = (n) => closest(n, regionSel);

  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d) && !closest(d.parent, sel.dialog));
  const dialogOpen = dialogs.length > 0;
  // With a dialog open, the page behind it is outside the region rules (the dialog is what the person sees in focus).
  const inFocus = (n) => !dialogOpen || dialogs.some((d) => contains(d, n));

  const buttons = querySelectorAll(root, sel.button).filter((b) => !isHidden(b));
  const order = new Map();
  let i = 0;
  for (const n of walk(root)) order.set(n, i++);
  const primary = (b) => matches(b, sel.primary);
  const destructive = (b) => matches(b, sel.destructive);

  // T1: primary actions per region (with a dialog open, only the dialog counts).
  const max = cfg.actions['primary-per-region'];
  const byRegion = new Map();
  for (const b of buttons.filter((b) => primary(b) && inFocus(b))) {
    const r = regionOf(b);
    if (!byRegion.has(r)) byRegion.set(r, []);
    byRegion.get(r).push(b);
  }
  for (const [r, bs] of byRegion) {
    if (bs.length > max) {
      add('T1', regionLabel(r), `${bs.length} primary actions (max. ${max}): ${bs.map((b) => `"${accessibleName(root, b)}"`).join(', ')}`, evs(bs));
    }
  }

  // T2: order in the dialog footer.
  const dialogOrder = cfg.actions['dialog-order'];
  for (const d of dialogs) {
    const inDialog = buttons.filter((b) => contains(d, b));
    const cancel = inDialog.filter((b) => CANCEL_LABELS.includes(norm(accessibleName(root, b))));
    const mainActions = inDialog.filter((b) => (primary(b) || destructive(b)) && !cancel.includes(b));
    for (const p of mainActions) {
      // Walk up from the main button to the first ancestor, below the dialog itself, that also holds a cancel
      // button: that is the footer. Buttons in different areas (content vs footer) are not compared.
      // With `verification.selectors.dialog-footer` the footer is declared; without it, it is inferred.
      let group = p.parent, pair = null;
      const footer = sel['dialog-footer'] ? closest(p, sel['dialog-footer']) : null;
      if (footer && contains(d, footer)) {
        pair = cancel.find((c) => contains(footer, c)) ?? null;
        group = d;
      }
      while (!pair && group && group !== d) {
        pair = cancel.find((c) => contains(group, c));
        if (pair) break;
        group = group.parent;
      }
      if (!pair) continue;
      const cancelFirst = order.get(pair) < order.get(p);
      const wrong = dialogOrder === 'action-cancel' ? cancelFirst : !cancelFirst;
      if (wrong) {
        const expected = dialogOrder === 'action-cancel' ? 'action before cancel' : 'cancel before action';
        add('T2', regionLabel(d), `order "${accessibleName(root, pair)}" × "${accessibleName(root, p)}" reversed (expected: ${expected})`, `${ev(pair)}, ${ev(p)}`);
      }
    }
  }

  // T3: exactly one h1.
  // With a dialog open, the base screen is judged in its own capture: T3 is not repeated.
  const h1 = querySelectorAll(root, 'h1').filter((h) => !isHidden(h));
  if (dialogs.length === 0 && h1.length !== 1) {
    add('T3', '(screen)', h1.length === 0 ? 'no main title (h1)' : `${h1.length} main titles (h1): ${h1.map((h) => `"${textOf(h).slice(0, 50)}"`).join(', ')}`, h1.length ? evs(h1) : file);
  }

  // T4: field with a visible label or an accessible name.
  const fields = querySelectorAll(root, sel.field).filter((f) => inFocus(f) && !isHidden(f) && !ariaHidden(f) && !/^(submit|button|reset|image)$/.test(f.attrs.type || ''));
  for (const f of fields) {
    if (fieldLabel(root, f)) continue;
    const ph = f.attrs.placeholder;
    add('T4', regionLabel(regionOf(f)), ph ? `field with only a placeholder ("${ph}"), no label` : `field <${f.tag}${f.attrs.name ? ` name="${f.attrs.name}"` : ''}> without a label or accessible name`, ev(f));
  }

  // T5: destructive action with a generic label.
  const flagged = new Set();
  if (cfg.actions['destructive-specific-label'] !== false) {
    for (const b of buttons.filter((b) => destructive(b) && inFocus(b))) {
      const name = accessibleName(root, b);
      if (L.genericDestructiveLabels.includes(norm(name))) {
        flagged.add(b);
        add('T5', regionLabel(regionOf(b)), `destructive action with a generic label "${name}" (say what happens: "${L.destructiveExample}")`, ev(b));
      }
    }
  }

  // T6: forbidden terms in the visible text (whole word, case-insensitive).
  const terms = (cfg.content.forbidden || []).map(String).filter(Boolean);
  if (terms.length) {
    const re = terms.map((t) => [t, new RegExp(`(?<![\\p{L}\\p{N}_])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_])`, 'iu')]);
    const seen = new Map();
    for (const n of walk(root)) {
      if (n.type !== 'text' || !n.text.trim() || !inFocus(n) || isHidden(n.parent)) continue;
      for (const [t, r] of re) {
        if (!r.test(n.text)) continue;
        const k = `${t}|${regionLabel(regionOf(n.parent))}`;
        if (!seen.has(k)) seen.set(k, { t, region: regionLabel(regionOf(n.parent)), nodes: [] });
        seen.get(k).nodes.push(n);
      }
    }
    for (const { t, region, nodes } of seen.values()) {
      const snippet = nodes[0].text.replace(/\s+/g, ' ').trim().slice(0, 80);
      add('T6', region, `forbidden term "${t}" in the visible text (${nodes.length}×), e.g. "${snippet}"`, evs(nodes.slice(0, 3).map((n) => n.parent)));
    }
  }

  // T7: button label without verb + object (warning).
  const withoutVerb = new Map();
  for (const b of buttons) {
    if (flagged.has(b) || !inFocus(b)) continue;
    const name = accessibleName(root, b);
    if (!L.labelsWithoutVerb.includes(norm(name))) continue;
    const region = regionLabel(regionOf(b));
    const k = `${norm(name)}|${region}`;
    if (!withoutVerb.has(k)) withoutVerb.set(k, { name, region, bs: [] });
    withoutVerb.get(k).bs.push(b);
  }
  for (const { name, region, bs } of withoutVerb.values()) {
    add('T7', region, `button "${name}" without verb + object${bs.length > 1 ? ` (${bs.length}×)` : ''} (e.g. "${L.examples.buttonWithObject}")`, evs(bs));
  }

  return { file, dialog_open: dialogOpen, findings };
}

function listHtml(inputs) {
  const out = [];
  for (const e of inputs) {
    if (statSync(e).isDirectory()) {
      for (const f of readdirSync(e).sort()) if (f.endsWith('.html')) out.push(join(e, f));
    } else out.push(e);
  }
  return out;
}

export function summarize(results) {
  const byRule = {};
  const bySeverity = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of results) for (const a of r.findings) {
    byRule[a.rule] = (byRule[a.rule] || 0) + 1;
    bySeverity[a.severity]++;
  }
  return {
    screens: results.length,
    screens_with_findings: results.filter((r) => r.findings.length).length,
    findings: results.reduce((s, r) => s + r.findings.length, 0),
    by_rule: byRule,
    by_severity: bySeverity,
  };
}

function main() {
  const args = parseCli('ux-lint/screen.mjs');
  if (!args._.length) {
    console.error('Usage: node tools/ux-lint/screen.mjs <folder-or-files.html...> [--ux UX.md] [--json] [--fail-at 3]');
    process.exit(2);
  }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const results = listHtml(args._).map((f) => analyzeScreen(readFileSync(f, 'utf8'), cfg, f));
  const summary = summarize(results);
  const threshold = Number(args['fail-at'] ?? 3);
  if (args.json) console.log(JSON.stringify({ summary, screens: results, ...(cfg.legacyWarnings.length ? { warnings: cfg.legacyWarnings } : {}) }, null, 2));
  else {
    for (const r of results) {
      const name = basename(r.file);
      if (!r.findings.length) { console.log(`✓ ${name}`); continue; }
      console.log(`✗ ${name}${r.dialog_open ? ' (dialog open)' : ''}`);
      for (const a of r.findings.sort((x, y) => y.severity - x.severity || x.rule.localeCompare(y.rule))) {
        console.log(`   ${a.rule} sev ${a.severity} | ${a.region} | ${a.message}\n      ${a.evidence}`);
      }
    }
    const rules = Object.entries(summary.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'none';
    console.log(`\nSummary: ${summary.screens} screens, ${summary.screens_with_findings} with findings, ${summary.findings} findings (${rules}); severity ${Object.entries(summary.by_severity).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }
  const failed = results.some((r) => r.findings.some((a) => a.severity >= threshold));
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
