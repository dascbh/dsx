// specs/<demand-id>/design/alternatives.md — the divergence artifact Forward's `divergence` gate reads. Written by
// tools/ux-lint/variations.mjs `toAlternativesMarkdown` (the single writer) from a Forward view of the manifest built
// here (lens/HMW overrides, owner decision.json), and read back by the importer. The structural check mirrors bin/fde/design.py's
// check_alternatives, with the lens list read from the snapshot of that same file; the parity is proven against
// verify.py in tools/test/forward-export.test.mjs.
import { loadDivergenceRules } from './snapshot.mjs';
import { toAlternativesMarkdown } from '../../ux-lint/variations.mjs';

const AXES = ['screen', 'flow', 'behavior', 'text'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const one = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// Same expressions as design.py (HMW_RE, LENS_RE, HYPOTHESIS_RE, TRADED_RE, CHOSE_RE).
const HMW_RE = /^\s*[-*+]\s*.*(?:how might we|\bHMW\b)/gim;
const LENS_RE = /^\s*[-*]?\s*lens\s*:\s*([a-z-]+)/gim;
const HYPOTHESIS_RE = /^\s*[-*]?\s*hypothesis\s*:\s*\S/gim;
const TRADED_RE = /^\s*[-*]?\s*traded\s*:\s*\S/gim;
const CHOSE_RE = /^\s*[-*]?\s*chose\s*:\s*\S/im;

/** Structural check of an alternatives.md, as the divergence gate runs it. Returns breach messages. */
export function checkAlternatives(text, required, { lenses = loadDivergenceRules().lenses } = {}) {
  const out = [];
  const count = (re) => (String(text).match(re) ?? []).length;
  if (count(HMW_RE) < 2) out.push("fewer than two 'How might we' framings — the reframe is the generative move, not the render (USE-12)");
  const found = [...String(text).matchAll(LENS_RE)].map((m) => m[1].toLowerCase());
  const unknown = [...new Set(found.filter((l) => !lenses.includes(l)))].sort();
  if (unknown.length) out.push(`unknown lens ${JSON.stringify(unknown)} — one of ${JSON.stringify(lenses)}`);
  const distinct = new Set(found.filter((l) => lenses.includes(l)));
  if (distinct.size < required) out.push(`${distinct.size} distinct lens(es), ${required} required — alternatives sharing a lens count as one (USE-10)`);
  if (count(HYPOTHESIS_RE) < found.length) out.push("an alternative has no 'Hypothesis:' — what it bets improves");
  if (!CHOSE_RE.test(text)) out.push("no 'Chose:' line — the convergence is not recorded");
  if (found.length && count(TRADED_RE) < Math.max(0, found.length - 1)) out.push("a discarded alternative has no 'Traded:' — the discard is the evidence that makes the choice auditable (USE-10)");
  return out;
}

/**
 * Forward view of a variations manifest, ready for tools/ux-lint/variations.mjs `toAlternativesMarkdown` (the one
 * writer of alternatives.md — frente C). It only fills what the manifest lacks, never rewrites what it has:
 * `lenses` (variantId → lens) and `hmw` override; the owner's decision.json wins over the designer's `choice`;
 * `rejected_tradeoffs` falls back to each discarded variant's `cost` + `tradeoffs`. Returns { manifest, problems } —
 * problems are what would keep the file from passing the gate.
 */
export function forwardView(manifest, decision = null, { lenses = {}, hmw = null, rules = loadDivergenceRules() } = {}) {
  const m = structuredClone(manifest);
  const problems = [];
  const variants = m.variants ?? [];
  for (const v of variants) if (lenses[v.id]) v.lens = lenses[v.id];
  if (hmw) m.how_might_we = hmw;
  const framings = [].concat(m.how_might_we ?? []).map(one).filter(Boolean);
  if (framings.length < 2) problems.push(`${framings.length} "How might we" framing(s); at least 2 are required (manifest how_might_we or --hmw)`);
  for (const v of variants) {
    if (!v.lens) problems.push(`variant "${v.id}" has no lens (one of ${rules.lenses.join(', ')})`);
    else if (!rules.lenses.includes(v.lens)) problems.push(`variant "${v.id}": lens "${v.lens}" is not one of ${rules.lenses.join(', ')}`);
    if (!one(v.causal_bet ?? v.hypothesis)) problems.push(`variant "${v.id}" has no hypothesis (causal_bet)`);
  }
  if (decision) {
    let chosen = decision.variant, why = one(decision.comment);
    if (decision.mode === 'compose') {
      const count = {};
      for (const a of AXES) { const id = decision.compose?.[a]; if (id) count[id] = (count[id] ?? 0) + 1; }
      chosen = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'current';
      why = `a composition — ${AXES.map((a) => `${a} from ${decision.compose?.[a]}`).join(', ')}${why ? `; ${why}` : ''}`;
    }
    m.choice = { variant: chosen, why: `${why || 'owner decision'} (decided by ${one(decision.by ?? 'owner')}${decision.at ? `, ${decision.at}` : ''})` };
  }
  const chosen = typeof m.choice === 'string' ? m.choice : m.choice?.variant ?? null;
  if (!chosen) problems.push('no convergence: neither decision.json nor the manifest "choice" says what was chosen');
  m.rejected_tradeoffs = { ...(m.rejected_tradeoffs ?? {}) };
  for (const v of variants) {
    if (v.id === chosen || one(m.rejected_tradeoffs[v.id])) continue;
    const t = [one(v.cost), ...(v.tradeoffs ?? []).map(one)].map((x) => x.replace(/[.;]+$/, '')).filter(Boolean).join('; ');
    if (t) m.rejected_tradeoffs[v.id] = t; else problems.push(`variant "${v.id}" is discarded and records no tradeoff`);
  }
  return { manifest: m, problems };
}

/** alternatives.md text via the variations.mjs writer, plus the problems of the Forward view. */
export function renderAlternatives(manifest, decision = null, opts = {}) {
  const view = forwardView(manifest, decision, opts);
  return { text: toAlternativesMarkdown(view.manifest), problems: view.problems, manifest: view.manifest };
}

/**
 * Reads an alternatives.md: { how_might_we, alternatives: [{ key, name, lens, hypothesis, traded, fields }], chose,
 * baseline }. Tolerant of hand-written files: it reads the lines the gate reads and keeps any other `Key: value`.
 */
export function parseAlternatives(md) {
  const out = { how_might_we: [], alternatives: [], chose: null, baseline: null };
  let section = null, cur = null;
  for (const raw of String(md ?? '').split('\n')) {
    const line = raw.trim();
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2 && !line.startsWith('###')) { section = h2[1].toLowerCase(); cur = null; continue; }
    const h3 = line.match(/^###\s+(?:([A-Z0-9]+)[.)]\s*)?(.*)$/);
    if (h3) { cur = { key: h3[1] ?? null, name: h3[2].trim(), lens: null, hypothesis: null, traded: null, fields: {} }; out.alternatives.push(cur); continue; }
    if (/^[-*+]\s*.*(how might we|\bHMW\b)/i.test(line)) { out.how_might_we.push(line.replace(/^[-*+]\s*/, '')); continue; }
    const kv = line.replace(/^[-*]\s*/, '').match(/^([A-Za-z][\w -]*?)\s*:\s*(.+)$/);
    if (!kv) continue;
    const k = kv[1].toLowerCase(), v = kv[2].trim();
    if (k === 'chose') { out.chose = v; continue; }
    if (section?.startsWith('baseline') && k === 'today') { out.baseline = v; continue; }
    if (!cur) continue;
    if (k === 'lens') cur.lens = v.toLowerCase().match(/^[a-z-]+/)?.[0] ?? v;
    else if (k === 'hypothesis') cur.hypothesis = v;
    else if (k === 'traded') cur.traded = v;
    else cur.fields[k] = v;
  }
  return out;
}

/** Variant id in a manifest for a parsed alternative: by letter position (A → first variant) or by name. */
export function matchVariant(manifest, alt) {
  const variants = manifest.variants ?? [];
  const byName = variants.find((v) => one(v.name).toLowerCase() === one(alt.name).toLowerCase());
  if (byName) return byName;
  const k = alt.key ? LETTERS.indexOf(alt.key) : -1;
  return k >= 0 ? variants[k] ?? null : null;
}
