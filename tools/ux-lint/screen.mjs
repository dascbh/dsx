#!/usr/bin/env node
// ux-lint, nível tela: aplica as regras T1–T7 do contrato do UX.md (knowledge/fundamentos/ux-md.md)
// sobre capturas HTML de telas. Sem dependências.
//
// Uso: node tools/ux-lint/screen.mjs <pasta-ou-arquivos.html...> [--ux UX.md] [--json] [--fail-at 3]
// Saída: achados por tela (regra, região, evidência arquivo:linha, severidade 0–4) e resumo.
// Código de saída 1 quando há achado com severidade >= --fail-at (padrão 3).
// JSON (--json): { summary, screens: [{ file, dialog_open, findings: [{ rule, severity, region, message, evidence }] }] }.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, textOf, getById, walk, contains } from './lib/html.mjs';

export const SEVERITY = { T1: 3, T2: 2, T3: 2, T4: 3, T5: 3, T6: 2, T7: 1 };
export const CANCEL_LABELS = ['cancelar', 'voltar', 'fechar', 'não', 'nao'];
export const GENERIC_DESTRUCTIVE_LABELS = ['confirmar', 'ok', 'sim', 'continuar'];
export const LABELS_WITHOUT_VERB = ['ok', 'sim', 'não', 'nao', 'enviar', 'confirmar'];

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
 * Analisa uma tela. `html` é o conteúdo; `file` entra na evidência; `cfg` vem de loadConfig/configFrom.
 * Devolve { file, dialog_open, findings: [{ rule, severity, region, message, evidence }] }.
 */
export function analyzeScreen(html, cfg = configFrom({}), file = 'tela.html') {
  const root = parseHtml(html);
  const sel = cfg.verification.selectors;
  const regionSel = [...sel.regions, sel.dialog].join(', ');
  const findings = [];
  const ev = (n) => `${file}:${n.line}:${n.col}`;
  const evs = (ns) => [...new Set(ns.map(ev))].join(', ');
  const add = (rule, region, message, evidence) =>
    findings.push({ rule, severity: SEVERITY[rule], region, message, evidence });

  // Regiões: rótulo estável por elemento (tag, id/role e, no diálogo, o título).
  const counts = {};
  const labels = new Map();
  const regionLabel = (r) => {
    if (!r) return '(fora de região)';
    if (labels.has(r)) return labels.get(r);
    let base = r.tag + (r.attrs.id && !/^_r_|^:r/.test(r.attrs.id) ? `#${r.attrs.id}` : '');
    if (matches(r, sel.dialog)) {
      const title = r.attrs['aria-labelledby'] ? textOf(getById(root, r.attrs['aria-labelledby'].split(/\s+/)[0]) || r) : r.attrs['aria-label'] || '';
      base = `diálogo${title ? ` "${title.slice(0, 60)}"` : ''}`;
    } else if (r.attrs.role) base += `[role=${r.attrs.role}]`;
    counts[base] = (counts[base] || 0) + 1;
    const label = counts[base] > 1 ? `${base} (${counts[base]}º)` : base;
    labels.set(r, label);
    return label;
  };
  const regionOf = (n) => closest(n, regionSel);

  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d) && !closest(d.parent, sel.dialog));
  const dialogOpen = dialogs.length > 0;
  // Com diálogo aberto, a página atrás fica fora das regras de região (é o que a pessoa vê em foco).
  const inFocus = (n) => !dialogOpen || dialogs.some((d) => contains(d, n));

  const buttons = querySelectorAll(root, sel.button).filter((b) => !isHidden(b));
  const order = new Map();
  let i = 0;
  for (const n of walk(root)) order.set(n, i++);
  const primary = (b) => matches(b, sel.primary);
  const destructive = (b) => matches(b, sel.destructive);

  // T1 — primárias por região (com diálogo aberto, só o diálogo conta).
  const max = cfg.actions['primary-per-region'];
  const byRegion = new Map();
  for (const b of buttons.filter((b) => primary(b) && inFocus(b))) {
    const r = regionOf(b);
    if (!byRegion.has(r)) byRegion.set(r, []);
    byRegion.get(r).push(b);
  }
  for (const [r, bs] of byRegion) {
    if (bs.length > max) {
      add('T1', regionLabel(r), `${bs.length} ações primárias (máx. ${max}): ${bs.map((b) => `"${accessibleName(root, b)}"`).join(', ')}`, evs(bs));
    }
  }

  // T2 — ordem no rodapé do diálogo.
  const dialogOrder = cfg.actions['dialog-order'];
  for (const d of dialogs) {
    const inDialog = buttons.filter((b) => contains(d, b));
    const cancel = inDialog.filter((b) => CANCEL_LABELS.includes(norm(accessibleName(root, b))));
    const mainActions = inDialog.filter((b) => (primary(b) || destructive(b)) && !cancel.includes(b));
    for (const p of mainActions) {
      // Sobe do botão principal até o primeiro ancestral, abaixo do próprio diálogo, que também tem um
      // botão de cancelar: é o rodapé. Botões em áreas diferentes (conteúdo × rodapé) não são comparados.
      // Com `verification.selectors.dialog-footer`, o rodapé é declarado; sem ele, é inferido.
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
        const expected = dialogOrder === 'action-cancel' ? 'ação antes de cancelar' : 'cancelar antes da ação';
        add('T2', regionLabel(d), `ordem "${accessibleName(root, pair)}" × "${accessibleName(root, p)}" invertida (esperado: ${expected})`, `${ev(pair)}, ${ev(p)}`);
      }
    }
  }

  // T3 — exatamente um h1.
  // Com diálogo aberto, a tela de base é avaliada na própria captura: não repete o T3.
  const h1 = querySelectorAll(root, 'h1').filter((h) => !isHidden(h));
  if (dialogs.length === 0 && h1.length !== 1) {
    add('T3', '(tela)', h1.length === 0 ? 'nenhum título principal (h1)' : `${h1.length} títulos principais (h1): ${h1.map((h) => `"${textOf(h).slice(0, 50)}"`).join(', ')}`, h1.length ? evs(h1) : file);
  }

  // T4 — campo com rótulo visível ou nome acessível.
  const fields = querySelectorAll(root, sel.field).filter((f) => inFocus(f) && !isHidden(f) && !ariaHidden(f) && !/^(submit|button|reset|image)$/.test(f.attrs.type || ''));
  for (const f of fields) {
    if (fieldLabel(root, f)) continue;
    const ph = f.attrs.placeholder;
    add('T4', regionLabel(regionOf(f)), ph ? `campo só com placeholder ("${ph}"), sem rótulo` : `campo <${f.tag}${f.attrs.name ? ` name="${f.attrs.name}"` : ''}> sem rótulo nem nome acessível`, ev(f));
  }

  // T5 — destrutiva com rótulo genérico.
  const flagged = new Set();
  if (cfg.actions['destructive-specific-label'] !== false) {
    for (const b of buttons.filter((b) => destructive(b) && inFocus(b))) {
      const name = accessibleName(root, b);
      if (GENERIC_DESTRUCTIVE_LABELS.includes(norm(name))) {
        flagged.add(b);
        add('T5', regionLabel(regionOf(b)), `ação destrutiva com rótulo genérico "${name}" (diga o que acontece: "Excluir pedido")`, ev(b));
      }
    }
  }

  // T6 — termos proibidos no texto visível (palavra inteira, sem caixa).
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
      add('T6', region, `termo proibido "${t}" no texto visível (${nodes.length}×), ex.: "${snippet}"`, evs(nodes.slice(0, 3).map((n) => n.parent)));
    }
  }

  // T7 — rótulo de botão sem verbo + objeto (aviso).
  const withoutVerb = new Map();
  for (const b of buttons) {
    if (flagged.has(b) || !inFocus(b)) continue;
    const name = accessibleName(root, b);
    if (!LABELS_WITHOUT_VERB.includes(norm(name))) continue;
    const region = regionLabel(regionOf(b));
    const k = `${norm(name)}|${region}`;
    if (!withoutVerb.has(k)) withoutVerb.set(k, { name, region, bs: [] });
    withoutVerb.get(k).bs.push(b);
  }
  for (const { name, region, bs } of withoutVerb.values()) {
    add('T7', region, `botão "${name}" sem verbo + objeto${bs.length > 1 ? ` (${bs.length}×)` : ''} (ex.: "Enviar pedido")`, evs(bs));
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
    console.error('Uso: node tools/ux-lint/screen.mjs <pasta-ou-arquivos.html...> [--ux UX.md] [--json] [--fail-at 3]');
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
      console.log(`✗ ${name}${r.dialog_open ? ' (diálogo aberto)' : ''}`);
      for (const a of r.findings.sort((x, y) => y.severity - x.severity || x.rule.localeCompare(y.rule))) {
        console.log(`   ${a.rule} sev ${a.severity} | ${a.region} | ${a.message}\n      ${a.evidence}`);
      }
    }
    const rules = Object.entries(summary.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum';
    console.log(`\nResumo: ${summary.screens} telas, ${summary.screens_with_findings} com achado, ${summary.findings} achados (${rules}); severidade ${Object.entries(summary.by_severity).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }
  const failed = results.some((r) => r.findings.some((a) => a.severity >= threshold));
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
