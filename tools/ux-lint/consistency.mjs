#!/usr/bin/env node
// ux-lint, nível consistência: aplica as regras C1–C3 do contrato do UX.md (knowledge/fundamentos/ux-md.md,
// "Consistência") sobre a pasta de capturas HTML, comparando as telas entre si. Sem dependências.
//
// Uso: node tools/ux-lint/consistency.mjs <pasta-ou-arquivos.html...> [--ux UX.md] [--module <m>] [--json] [--fail-at 3]
//
// Inventário: botões, títulos e abas de cada captura (o mesmo do text.mjs, `takeInventory`). Com diálogo aberto, só o
// diálogo. Capturas de estado (`<nn>-<tela>.<estado>.html`) contam como a mesma tela.
//
// C1 mesma ação com rótulos diferentes. Mesma função = mesmo grupo de verbo (excluir/remover/apagar; salvar/gravar;
//    criar/novo/adicionar; editar/alterar; baixar/exportar/download) sobre o mesmo objeto (primeira palavra de
//    conteúdo depois do verbo, sem plural; sem objeto no rótulo, vale o do nome acessível ou o do título do diálogo
//    quando ele começa com verbo do mesmo grupo; sem objeto nenhum, o botão fica fora). Dispensar (cancelar/voltar/
//    fechar) só conta em diálogo e com o mesmo papel: "cancelar" quando o diálogo tem outra ação, "fechar" quando
//    não tem.
// C2 mesmo rótulo de botão com variantes visuais diferentes (cheio × contornado × texto) entre capturas.
// C3 mesmo conceito com nomes diferentes nos títulos e abas: termo da coluna "nunca chamar de"/"evitar" do glossário
//    (`content.glossary` do UX.md: caminho de um .md com tabela, mapa termo → sinônimos, "inline" = tabela no
//    próprio UX.md, ou mapa por módulo { default: …, <módulo>: … } escolhido por --module) e pares de sinônimos
//    conhecidos (KNOWN_SYNONYMS), que valem com ou sem glossário.
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

export const SEVERITY = { C1: 2, C2: 1, C3: 1 };
/** Grupos de verbo da mesma ação (minúsculas, sem acento). `novo`/`nova` contam como o mesmo verbo. */
export const VERB_GROUPS = {
  delete: ['excluir', 'remover', 'apagar', 'deletar', 'delete', 'remove'],
  save: ['salvar', 'gravar', 'save'],
  dismiss: ['cancelar', 'voltar', 'fechar', 'cancel', 'close', 'back'],
  create: ['criar', 'novo', 'nova', 'cadastrar', 'create', 'new'],
  // adicionar põe algo que já existe num lugar (cláusula da biblioteca na minuta); criar faz um objeto novo
  add: ['adicionar', 'incluir', 'add'],
  edit: ['editar', 'alterar', 'modificar', 'edit'],
  download: ['baixar', 'exportar', 'download', 'descarregar', 'export'],
};
/** Conceitos com nomes rivais em títulos e abas (sem glossário, só estes). */
export const KNOWN_SYNONYMS = [
  ['configuracoes', 'preferencias'], ['modelo', 'template'], ['painel', 'dashboard'], ['historico', 'log'],
  ['lixeira', 'excluidos'], ['notificacoes', 'avisos'], ['pesquisa', 'busca'], ['usuario', 'utilizador'], ['relatorio', 'report'],
];
const VISUAL_VARIANTS = ['contained', 'outlined', 'text'];
const SKIP_VARIANTS = ['composite', 'chip', 'sort', 'toggle', 'list-item'];
const STOP = new Set('o a os as um uma uns umas de da do das dos em no na nos nas para pra ao aos à às e ou com sem por the of to a an this esta este esse essa'.split(' '));
const DESTINATION = new Set(['a', 'ao', 'aos', 'na', 'no', 'nas', 'nos', 'em', 'para', 'pra', 'to', 'into']);
const CAPTURE_RE = /^(\d+-[a-z0-9]+(?:-[a-z0-9]+)*)(?:\.[a-z0-9-]+)?\.html$/;

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const words = (s) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);
const singular = (w) => (w.length > 4 && /[^s]s$/.test(w) ? w.slice(0, -1) : w).replace(/oe$/, 'ao').replace(/coe$/, 'cao');
const VERB_OF = new Map(Object.entries(VERB_GROUPS).flatMap(([g, vs]) => vs.map((v) => [v, g])));
const canonicalVerb = (v) => (v === 'nova' ? 'novo' : v);

/** Tela de uma captura: `<nn>-<id>` (o estado do nome do arquivo sai). */
export const screenOf = (file) => { const b = basename(String(file)); const m = CAPTURE_RE.exec(b); return m ? m[1] : b.replace(/\.html?$/, ''); };

/** Rótulo → { verb, group, object } (objeto = 1ª palavra de conteúdo depois do verbo, no singular). */
export function parseAction(label) {
  const w = words(label);
  if (!w.length) return null;
  const group = VERB_OF.get(w[0]);
  if (!group) return null;
  // "Adicionar à minuta", "Salvar no modelo": o que vem depois da preposição é o destino, não o objeto.
  if (w[1] && DESTINATION.has(w[1])) return { verb: canonicalVerb(w[0]), group, object: null, destination: singular(w.slice(2).find((x) => !STOP.has(x)) ?? '') || null };
  const rest = w.slice(1).filter((x) => !STOP.has(x) && !/^\d+$/.test(x));
  return { verb: canonicalVerb(w[0]), group, object: rest.length ? singular(rest[0]) : null };
}

// ---------- inventário ----------

/** Inventário de uma captura: [{ kind: button|title|tab, text, variant, screen, evidence, action }]. */
export function inventory(html, cfg = configFrom({}), file = 'tela.html') {
  const sel = cfg.verification.selectors;
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
        const title = dialog ? parseAction(dialogTitle(dialog)) : null;
        action.object = (aria?.group === action.group && aria.object) || (title?.group === action.group && title.object) || null;
      }
      if (action?.group === 'dismiss') {
        // só o botão de dispensar com texto (o ✕ de ícone tem outro papel), dentro de diálogo; o papel depende de o
        // grupo de botões dele (rodapé) ter uma ação principal (primária ou destrutiva)
        if (!dialog || it.variant === 'icon' || words(entry.text).length > 1) action = null;
        else {
          const footer = closest(it.node.parent, '.MuiDialogActions-root') ?? it.node.parent;
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

function dialogTitle(dialog) {
  const t = querySelectorAll(dialog, 'h1, h2, h3, .MuiDialogTitle-root')[0];
  return t ? visibleText(t) : '';
}

// ---------- glossário ----------

// Leitura do glossário (único ou por módulo) em lib/glossary.mjs; reexportado aqui por compatibilidade.
export { glossaryFromMarkdown, loadGlossary } from './lib/glossary.mjs';

// ---------- regras ----------

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

/** Aplica C1–C3 ao inventário de todas as capturas. Devolve a lista de achados. */
export function analyzeConsistency(entries, { glossary = [] } = {}) {
  const findings = [];
  const add = (rule, key, text, message, occ) => findings.push({ rule, severity: SEVERITY[rule], key, text, message, occurrences: occ });
  const fmt = (occ) => occ.map((o) => `"${o.text}" (${o.screens.slice(0, 3).join(', ')}${o.screens.length > 3 ? ', …' : ''})`).join(' × ');

  // C1 — mesma função, verbos diferentes.
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
    const role = group === 'dismiss' ? (object === 'cancel' ? 'dispensar diálogo com ação' : 'fechar diálogo sem ação') : `${group} · ${object}`;
    // texto estável (âncora do id no registro): a função, não os verbos encontrados, que mudam entre execuções
    add('C1', k, group === 'dismiss' ? role : `${VERB_GROUPS[group][0]} ${object}`,
      `mesma ação (${role}) com rótulos diferentes: ${fmt(occ)} — escolha um verbo e use em todas as telas`, occ);
  }

  // C2 — mesmo rótulo, variantes visuais diferentes.
  const byLabel = new Map();
  for (const e of entries) {
    if (e.kind !== 'button' || !VISUAL_VARIANTS.includes(e.variant)) continue;
    // o gatilho na página ("Remover", texto) e a confirmação no diálogo ("Remover", cheio) têm papéis diferentes:
    // compara só dentro do mesmo contexto
    const k = `${e.context}|${fold(e.text).replace(/[.!?:…]+$/, '')}`;
    if (!byLabel.has(k)) byLabel.set(k, []);
    byLabel.get(k).push(e);
  }
  for (const [k, list] of byLabel) {
    const variants = [...new Set(list.map((e) => e.variant))];
    if (variants.length < 2) continue;
    const occ = occurrences(list);
    add('C2', k, `${list[0].text}${list[0].context === 'dialog' ? ' (diálogo)' : ''}`,
      `botão "${list[0].text}" com variantes visuais diferentes (${occ.map((o) => `${o.variant} em ${o.screens.slice(0, 3).join(', ')}${o.screens.length > 3 ? ', …' : ''}`).join('; ')}) — a mesma ação tem o mesmo peso em todas as telas`, occ);
  }

  // C3 — nomes rivais do mesmo conceito em títulos e abas.
  const heads = entries.filter((e) => e.kind === 'title' || e.kind === 'tab');
  const canonical = new Set(glossary.map((g) => fold(g.term)));
  for (const g of glossary) {
    for (const avoid of g.avoid) {
      if (canonical.has(fold(avoid)) || containsPhrase(g.term, avoid)) continue;
      const hit = heads.filter((e) => containsPhrase(e.text, avoid));
      if (!hit.length) continue;
      const occ = occurrences(hit);
      add('C3', `glossary|${fold(avoid)}`, `${avoid} → ${g.term}`,
        `${occ.map((o) => `"${o.text}"`).join(', ')} usa "${avoid}"; o glossário chama de "${g.term}"`, occ);
    }
  }
  for (const set of KNOWN_SYNONYMS) {
    const present = set.map((w) => heads.filter((e) => words(e.text).map(singular).includes(singular(w))));
    const used = present.filter((l) => l.length);
    if (used.length < 2) continue;
    const occ = occurrences(used.flat());
    add('C3', `synonyms|${set.join('|')}`, set.filter((_, i) => present[i].length).join(' × '),
      `mesmo conceito com nomes diferentes em títulos/abas: ${fmt(occ)} — fixe um nome (e registre no glossário)`, occ);
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

const USAGE = 'Uso: node tools/ux-lint/consistency.mjs <pasta-ou-arquivos.html...> [--ux UX.md] [--module <m>] [--json] [--fail-at 3]';

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
  const findings = analyzeConsistency(entries, { glossary });
  const summary = { ...summarize(findings, files, entries), glossary_terms: glossary.length, ...(glossaryKey ? { glossary_module: glossaryKey } : {}) };
  const threshold = Number(args['fail-at'] ?? 3);
  if (args.json) console.log(JSON.stringify({ summary, findings, ...(cfg.legacyWarnings.length ? { warnings: cfg.legacyWarnings } : {}) }, null, 2));
  else {
    for (const f of findings) {
      console.log(`${f.rule} sev ${f.severity} | ${f.text}\n   ${f.message}`);
      for (const o of f.occurrences) console.log(`      "${o.text}"${o.variant ? ` [${o.variant}]` : ''} · ${o.evidence[0]}`);
    }
    const rules = Object.entries(summary.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum';
    console.log(`\nResumo: ${summary.captures} capturas (${summary.screens} telas), ${summary.inventory.button} botões, ${summary.inventory.title} títulos, ${summary.inventory.tab} abas; glossário${glossaryKey ? ` (${glossaryKey})` : ''} com ${glossary.length} termos; ${summary.findings} achados (${rules})`);
  }
  process.exit(findings.some((f) => f.severity >= threshold) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
