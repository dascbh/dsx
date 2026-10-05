#!/usr/bin/env node
// ux-lint, consistency level: applies rules C1–C3 of the UX.md contract (knowledge/foundations/ux-md.md,
// "Consistency") to the folder of HTML captures, comparing the screens with each other. No dependencies.
//
// Usage: node tools/ux-lint/consistency.mjs <folder-or-files.html...> [--ux UX.md] [--module <m>] [--json] [--fail-at 3]
//
// Inventory: buttons, titles and tabs of each capture (the same as text.mjs, `takeInventory`). With a dialog open,
// only the dialog. State captures (`<nn>-<screen>.<state>.html`) count as the same screen.
//
// C1 same action with different labels. Same function = same verb group (excluir/remover/apagar, delete/remove;
//    salvar/gravar, save; criar/novo/adicionar, create/new/add; editar/alterar, edit; baixar/exportar, download/export)
//    on the same object (first content word after the verb, singular; with no object in the label, the one in the
//    accessible name or in the dialog title when it starts with a verb of the same group; with no object at all, the
//    button is left out). Dismiss (cancelar/voltar/fechar, cancel/back/close) counts only inside a dialog and with the
//    same role: "cancel" when the dialog has another action, "close" when it has none.
// C2 same button label with different visual variants (contained × outlined × text) across captures.
// C3 same concept with different names in titles and tabs: a term from the glossary's "never call it"/"avoid" column
//    (UX.md `content.glossary`: path to a .md with a table, term → synonyms map, "inline" = table in the UX.md
//    itself, or per-module map { default: …, <module>: … } chosen by --module) and known synonym pairs of the
//    declared language pack (`content.language`), which apply with or without a glossary.
// Verb groups and action stop/destination words come from every language pack (lib/lang/).
// JSON (--json): { summary, findings: [{ rule, severity, key, text, message, occurrences: [{ text, kind, variant,
//                  screens, evidence }] }] }.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadGlossary, glossarySource } from './lib/glossary.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { closest, querySelectorAll, matches, isHidden } from './lib/html.mjs';
import { takeInventory, visibleText } from './text.mjs';
import { kitProfile } from './lib/kits.mjs';
import { langPack, unionList, unionVerbGroups } from './lib/lang/index.mjs';

export const SEVERITY = { C1: 2, C2: 1, C3: 1 };
/** Verb groups of the same action (lowercase, no diacritics), union of every language pack. `novo`/`nova` count as one verb. */
export const VERB_GROUPS = unionVerbGroups();
/** Rival names of the same concept in titles and tabs, default (pt-BR) pack; the analysis uses the declared pack. */
export const KNOWN_SYNONYMS = langPack().knownSynonyms;
const VISUAL_VARIANTS = ['contained', 'outlined', 'text'];
const SKIP_VARIANTS = ['composite', 'chip', 'sort', 'toggle', 'list-item'];
const STOP = new Set(unionList('actionStopWords'));
const DESTINATION = new Set(unionList('destinationWords'));
const CAPTURE_RE = /^(\d+-[a-z0-9]+(?:-[a-z0-9]+)*)(?:\.[a-z0-9-]+)?\.html$/;

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const words = (s) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);
const singular = (w) => (w.length > 4 && /[^s]s$/.test(w) ? w.slice(0, -1) : w).replace(/oe$/, 'ao').replace(/coe$/, 'cao');
const VERB_OF = new Map(Object.entries(VERB_GROUPS).flatMap(([g, vs]) => vs.map((v) => [v, g])));
const canonicalVerb = (v) => (v === 'nova' ? 'novo' : v);

/** Screen of a capture: `<nn>-<id>` (the state in the file name is dropped). */
export const screenOf = (file) => { const b = basename(String(file)); const m = CAPTURE_RE.exec(b); return m ? m[1] : b.replace(/\.html?$/, ''); };

/** Label → { verb, group, object } (object = 1st content word after the verb, singular). */
export function parseAction(label) {
  const w = words(label);
  if (!w.length) return null;
  const group = VERB_OF.get(w[0]);
  if (!group) return null;
  // "Adicionar à proposta", "Add to proposal": what follows the preposition is the destination, not the object.
  if (w[1] && DESTINATION.has(w[1])) return { verb: canonicalVerb(w[0]), group, object: null, destination: singular(w.slice(2).find((x) => !STOP.has(x)) ?? '') || null };
  const rest = w.slice(1).filter((x) => !STOP.has(x) && !/^\d+$/.test(x));
  return { verb: canonicalVerb(w[0]), group, object: rest.length ? singular(rest[0]) : null };
}

// ---------- inventory ----------

/** Inventory of one capture: [{ kind: button|title|tab, text, variant, screen, evidence, action }]. */
export function inventory(html, cfg = configFrom({}), file = 'tela.html') {
  const sel = cfg.verification.selectors;
  // dialog footer and title of the kit (lib/kits.mjs); the footer declared in UX.md wins
  const kit = cfg.kitProfile ?? kitProfile(cfg.verification?.kit);
  const footerSel = sel['dialog-footer'] || kit.regions['dialog-footer'];
  const titleSel = `h1, h2, h3${kit['dialog-title'] ? `, ${kit['dialog-title']}` : ''}`;
  const out = [];
  const items = takeInventory(html, cfg);
  for (const it of items) {
    if (!['button', 'title', 'tab'].includes(it.type)) continue;
    const dialog = closest(it.node, sel.dialog);
    const entry = { kind: it.type, text: clean(it.text), variant: it.variant ?? null, context: dialog ? 'dialog' : 'page', screen: screenOf(file), evidence: `${file}:${it.line}:${it.col}` };
    if (it.type === 'button') {
      if (SKIP_VARIANTS.includes(it.variant)) continue;
      let action = parseAction(entry.text);
      if (action && !action.object && action.group !== 'dismiss') {
        const aria = parseAction(it.node.attrs['aria-label'] ?? '');
        const title = dialog ? parseAction(dialogTitle(dialog, titleSel)) : null;
        action.object = (aria?.group === action.group && aria.object) || (title?.group === action.group && title.object) || null;
      }
      if (action?.group === 'dismiss') {
        // only a dismiss button with text (the icon ✕ has another role), inside a dialog; the role depends on whether
        // its button group (footer) has a main action (primary or destructive)
        if (!dialog || it.variant === 'icon' || words(entry.text).length > 1) action = null;
        else {
          const footer = (footerSel && closest(it.node.parent, footerSel)) ?? it.node.parent;
          const main = querySelectorAll(footer, sel.button).filter((b) => b !== it.node && !isHidden(b) && (matches(b, sel.primary) || matches(b, sel.destructive)));
          action.object = main.length ? 'cancel' : 'close';
        }
      }
      entry.action = action;
    }
    out.push(entry);
  }
  return out;
}

function dialogTitle(dialog, titleSel = 'h1, h2, h3') {
  const t = querySelectorAll(dialog, titleSel)[0];
  return t ? visibleText(t) : '';
}

// ---------- glossary ----------

// Glossary reading (single or per module) lives in lib/glossary.mjs; re-exported here for compatibility.
export { glossaryFromMarkdown, loadGlossary } from './lib/glossary.mjs';

// ---------- rules ----------

const containsPhrase = (text, phrase) => {
  const t = ` ${words(text).map(singular).join(' ')} `;
  const p = words(phrase).map(singular).join(' ');
  return p && t.includes(` ${p} `);
};

function occurrences(entries, { byVariant = true } = {}) {
  const by = new Map();
  for (const e of entries) {
    const k = `${e.kind}|${e.text}|${byVariant ? e.variant ?? '' : ''}`;
    if (!by.has(k)) by.set(k, { text: e.text, kind: e.kind, variant: byVariant ? e.variant ?? null : null, screens: [], evidence: [] });
    const o = by.get(k);
    if (!o.screens.includes(e.screen)) o.screens.push(e.screen);
    if (o.evidence.length < 3) o.evidence.push(e.evidence);
  }
  return [...by.values()];
}

/** Applies C1–C3 to the inventory of every capture. Returns the list of findings. `cfg` picks the synonym pack. */
export function analyzeConsistency(entries, { glossary = [], cfg = null } = {}) {
  const synonyms = langPack(cfg).knownSynonyms;
  const findings = [];
  const add = (rule, key, text, message, occ) => findings.push({ rule, severity: SEVERITY[rule], key, text, message, occurrences: occ });
  const fmt = (occ) => occ.map((o) => `"${o.text}" (${o.screens.slice(0, 3).join(', ')}${o.screens.length > 3 ? ', …' : ''})`).join(' × ');

  // C1: same function, different verbs.
  const byFunction = new Map();
  for (const e of entries) {
    if (e.kind !== 'button' || !e.action?.object) continue;
    const k = `${e.action.group}|${e.action.object}`;
    if (!byFunction.has(k)) byFunction.set(k, []);
    byFunction.get(k).push(e);
  }
  for (const [k, list] of byFunction) {
    const verbs = [...new Set(list.map((e) => e.action.verb))];
    if (verbs.length < 2) continue;
    const [group, object] = k.split('|');
    const occ = occurrences(list, { byVariant: false });
    const role = group === 'dismiss' ? (object === 'cancel' ? 'dismiss dialog with an action' : 'close dialog without an action') : `${group} · ${object}`;
    // stable text (id anchor in the register): the function, not the verbs found, which change between runs
    add('C1', k, group === 'dismiss' ? role : `${VERB_GROUPS[group][0]} ${object}`,
      `same action (${role}) with different labels: ${fmt(occ)}; pick one verb and use it on every screen`, occ);
  }

  // C2: same label, different visual variants.
  const byLabel = new Map();
  for (const e of entries) {
    if (e.kind !== 'button' || !VISUAL_VARIANTS.includes(e.variant)) continue;
    // the trigger on the page ("Remove", text) and the confirmation in the dialog ("Remove", contained) have
    // different roles: compare only within the same context
    const k = `${e.context}|${fold(e.text).replace(/[.!?:…]+$/, '')}`;
    if (!byLabel.has(k)) byLabel.set(k, []);
    byLabel.get(k).push(e);
  }
  for (const [k, list] of byLabel) {
    const variants = [...new Set(list.map((e) => e.variant))];
    if (variants.length < 2) continue;
    const occ = occurrences(list);
    add('C2', k, `${list[0].text}${list[0].context === 'dialog' ? ' (dialog)' : ''}`,
      `button "${list[0].text}" with different visual variants (${occ.map((o) => `${o.variant} on ${o.screens.slice(0, 3).join(', ')}${o.screens.length > 3 ? ', …' : ''}`).join('; ')}); the same action has the same weight on every screen`, occ);
  }

  // C3: rival names of the same concept in titles and tabs.
  const heads = entries.filter((e) => e.kind === 'title' || e.kind === 'tab');
  const canonical = new Set(glossary.map((g) => fold(g.term)));
  for (const g of glossary) {
    for (const avoid of g.avoid) {
      if (canonical.has(fold(avoid)) || containsPhrase(g.term, avoid)) continue;
      const hit = heads.filter((e) => containsPhrase(e.text, avoid));
      if (!hit.length) continue;
      const occ = occurrences(hit);
      add('C3', `glossary|${fold(avoid)}`, `${avoid} → ${g.term}`,
        `${occ.map((o) => `"${o.text}"`).join(', ')} uses "${avoid}"; the glossary calls it "${g.term}"`, occ);
    }
  }
  for (const set of synonyms) {
    const present = set.map((w) => heads.filter((e) => words(e.text).map(singular).includes(singular(w))));
    const used = present.filter((l) => l.length);
    if (used.length < 2) continue;
    const occ = occurrences(used.flat());
    add('C3', `synonyms|${set.join('|')}`, set.filter((_, i) => present[i].length).join(' × '),
      `same concept with different names in titles/tabs: ${fmt(occ)}; settle on one name (and record it in the glossary)`, occ);
  }
  return findings.sort((a, b) => a.rule.localeCompare(b.rule) || a.key.localeCompare(b.key));
}

function listHtml(inputs) {
  const out = [];
  for (const e of inputs) {
    if (statSync(e).isDirectory()) { for (const f of readdirSync(e).sort()) if (f.endsWith('.html')) out.push(join(e, f)); }
    else out.push(e);
  }
  return out;
}

export function summarize(findings, files, entries) {
  const byRule = {};
  const bySeverity = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const f of findings) { byRule[f.rule] = (byRule[f.rule] || 0) + 1; bySeverity[f.severity]++; }
  return {
    captures: files.length,
    screens: new Set(entries.map((e) => e.screen)).size,
    inventory: { button: entries.filter((e) => e.kind === 'button').length, title: entries.filter((e) => e.kind === 'title').length, tab: entries.filter((e) => e.kind === 'tab').length },
    findings: findings.length, by_rule: byRule, by_severity: bySeverity,
  };
}

const USAGE = 'Usage: node tools/ux-lint/consistency.mjs <folder-or-files.html...> [--ux UX.md] [--module <m>] [--json] [--fail-at 3]';

function main() {
  const args = parseCli('ux-lint/consistency.mjs');
  if (!args._.length) { console.error(USAGE); process.exit(2); }
  const uxPath = typeof args.ux === 'string' ? args.ux : null;
  const cfg = loadConfig(uxPath);
  const module = typeof args.module === 'string' ? args.module : null;
  const glossary = loadGlossary(cfg, uxPath, module);
  const glossaryKey = glossarySource(cfg.content?.glossary, module).module;
  const files = listHtml(args._);
  const entries = files.flatMap((f) => inventory(readFileSync(f, 'utf8'), cfg, f));
  const findings = analyzeConsistency(entries, { glossary, cfg });
  const summary = { ...summarize(findings, files, entries), glossary_terms: glossary.length, ...(glossaryKey ? { glossary_module: glossaryKey } : {}) };
  const threshold = Number(args['fail-at'] ?? 3);
  if (args.json) console.log(JSON.stringify({ summary, findings, ...(cfg.legacyWarnings.length ? { warnings: cfg.legacyWarnings } : {}) }, null, 2));
  else {
    for (const f of findings) {
      console.log(`${f.rule} sev ${f.severity} | ${f.text}\n   ${f.message}`);
      for (const o of f.occurrences) console.log(`      "${o.text}"${o.variant ? ` [${o.variant}]` : ''} · ${o.evidence[0]}`);
    }
    const rules = Object.entries(summary.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'none';
    console.log(`\nSummary: ${summary.captures} captures (${summary.screens} screens), ${summary.inventory.button} buttons, ${summary.inventory.title} titles, ${summary.inventory.tab} tabs; glossary${glossaryKey ? ` (${glossaryKey})` : ''} with ${glossary.length} terms; ${summary.findings} findings (${rules})`);
  }
  process.exit(findings.some((f) => f.severity >= threshold) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
