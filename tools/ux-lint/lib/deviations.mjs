// Deviations declared in the UX.md front matter (`deviations:`) and how they cover UX findings.
// Contract: knowledge/foundations/ux-md.md ("Declared deviations") and knowledge/foundations/ux-findings.md
// (status `accepted-deviation`). No dependencies.
//
// deviations:
//   - id: D3
//     screens: [modelo-editor, lote-passo-1]     # ids from the flow map / the captures; "*" = every screen
//     rules: [T3, L6]                            # ux-lint rule ids (T, F, S, C, L, X) or drift ids (U);
//                                                # empty = documentation-only deviation (silences nothing)
//     reason: "Task inside the Library tab"
//     decided-by: "product owner"
//     until: 2026-12-31                          # optional: after this date the deviation covers nothing
//
// A finding is covered when its rule is in `rules` and all its screens are in `screens`.

const RULE_ID = /^(?:T[1-7]|F[1-5]|S[1-3]|C[1-3]|L[1-9]|X(?:1b|[1-9]|1[01])|U[1-6])$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const list = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]).map((x) => String(x).trim()).filter(Boolean);

/** Screen id from a capture name, a register screen or a map id: `15-bloco-edicao.error` → `bloco-edicao`. */
export function screenKey(name) {
  return String(name ?? '').replace(/^.*[\\/]/, '').replace(/\.geometry\.json$|\.html?$/, '').replace(/^\d+[-_]/, '').replace(/\..*$/, '').trim();
}

/**
 * Reads and validates the front matter `deviations` (block list, inline list or id → fields map).
 * Returns { deviations: [{ id, screens, rules, reason, decided_by, until }], errors, warnings }.
 */
export function parseDeviations(raw) {
  const errors = [];
  const warnings = [];
  if (raw === undefined || raw === null) return { deviations: [], errors, warnings };
  let entries;
  if (Array.isArray(raw)) entries = raw;
  else if (typeof raw === 'object') entries = Object.entries(raw).map(([id, v]) => ({ id, ...(v && typeof v === 'object' ? v : {}) }));
  else { errors.push('deviations: expected a list of deviations (- id: D1 …).'); return { deviations: [], errors, warnings }; }
  const seen = new Set();
  const deviations = [];
  entries.forEach((e, i) => {
    const where = `deviations[${i}]`;
    if (!e || typeof e !== 'object' || Array.isArray(e)) { errors.push(`${where}: expected a map with id, screens, rules, reason, decided-by.`); return; }
    const id = e.id === undefined ? '' : String(e.id).trim();
    if (!id) errors.push(`${where}: no id (e.g. D1).`);
    else if (seen.has(id)) errors.push(`deviations: repeated id ${id}.`);
    seen.add(id);
    const label = id || where;
    for (const k of Object.keys(e)) if (!['id', 'screens', 'rules', 'reason', 'decided-by', 'until'].includes(k)) warnings.push(`deviations ${label}: unknown key "${k}".`);
    const screens = list(e.screens);
    const rules = list(e.rules);
    if (!screens.length) errors.push(`deviations ${label}: no screens (screen ids; "*" for all).`);
    for (const r of rules) if (!RULE_ID.test(r)) errors.push(`deviations ${label}: rule "${r}" does not exist (use T, F, S, C, L, X or U ids).`);
    const reason = e.reason === undefined ? '' : String(e.reason).trim();
    if (!reason) errors.push(`deviations ${label}: no reason (the reason appears on the findings page).`);
    const decidedBy = e['decided-by'] === undefined ? '' : String(e['decided-by']).trim();
    if (!decidedBy) errors.push(`deviations ${label}: no decided-by (who accepted the deviation).`);
    const until = e.until === undefined || e.until === null || e.until === '' ? null : String(e.until).trim();
    if (until && !DATE.test(until)) errors.push(`deviations ${label}: until "${until}" is not in the YYYY-MM-DD format.`);
    deviations.push({ id, screens, rules, reason, decided_by: decidedBy, until });
  });
  return { deviations, errors, warnings };
}

const day = (now) => (now instanceof Date ? now : new Date(now ?? Date.now())).toISOString().slice(0, 10);

/** Has the deviation expired (`until` before today)? */
export const expired = (dev, now = new Date()) => !!dev.until && dev.until < day(now);

/** Does the deviation cover the screen? */
export function coversScreen(dev, screen) {
  const k = screenKey(screen);
  return dev.screens.some((s) => s === '*' || s === String(screen) || screenKey(s) === k);
}

/**
 * First active deviation covering the finding (rule in `rules` and all screens in `screens`), or null.
 * A finding with no screen (e.g. consistency without a capture) is only covered by a deviation with "*".
 */
export function coveringDeviation(item, deviations = [], now = new Date()) {
  const screens = (item.screens ?? []).filter(Boolean);
  for (const dev of deviations) {
    if (expired(dev, now) || !dev.rules.includes(item.rule)) continue;
    if (!screens.length ? dev.screens.includes('*') : screens.every((s) => coversScreen(dev, s))) return dev;
  }
  return null;
}

/** `D<n>` ids cited in the body (deviations table of section 5). */
export function bodyDeviationIds(body) {
  const ids = new Set();
  for (const line of String(body ?? '').split('\n')) {
    const m = line.match(/^\s*\|\s*\**(D\d+)\**\s*\|/);
    if (m) ids.add(m[1]);
  }
  return [...ids];
}
