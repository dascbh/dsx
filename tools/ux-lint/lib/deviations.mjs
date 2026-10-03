// Desvios declarados no front matter do UX.md (`deviations:`) e a cobertura deles sobre os achados de UX.
// Contrato: knowledge/fundamentos/ux-md.md ("Desvios declarados") e knowledge/fundamentos/achados-de-ux.md
// (status `accepted-deviation`). Sem dependências.
//
// deviations:
//   - id: D3
//     screens: [modelo-editor, lote-passo-1]     # ids do mapa de fluxo / das capturas; "*" = todas as telas
//     rules: [T3, L6]                            # ids de regra do ux-lint (T, F, S, C, L, X) ou do drift (U);
//                                                # vazio = desvio só documental (não silencia achado)
//     reason: "Tarefa dentro da aba Biblioteca"
//     decided-by: "dono do produto"
//     until: 2026-12-31                          # opcional: depois desta data o desvio não cobre mais nada
//
// Um achado fica coberto quando a regra dele está em `rules` e todas as telas dele estão em `screens`.

const RULE_ID = /^(?:T[1-7]|F[1-5]|S[1-3]|C[1-3]|L[1-9]|X(?:1b|[1-9]|1[01])|U[1-6])$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const list = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]).map((x) => String(x).trim()).filter(Boolean);

/** Id da tela a partir de um nome de captura, de tela do registro ou de id do mapa: `15-bloco-edicao.error` → `bloco-edicao`. */
export function screenKey(name) {
  return String(name ?? '').replace(/^.*[\\/]/, '').replace(/\.geometry\.json$|\.html?$/, '').replace(/^\d+[-_]/, '').replace(/\..*$/, '').trim();
}

/**
 * Lê e valida `deviations` do front matter (lista em bloco, lista inline ou mapa id → campos).
 * Devolve { deviations: [{ id, screens, rules, reason, decided_by, until }], errors, warnings }.
 */
export function parseDeviations(raw) {
  const errors = [];
  const warnings = [];
  if (raw === undefined || raw === null) return { deviations: [], errors, warnings };
  let entries;
  if (Array.isArray(raw)) entries = raw;
  else if (typeof raw === 'object') entries = Object.entries(raw).map(([id, v]) => ({ id, ...(v && typeof v === 'object' ? v : {}) }));
  else { errors.push('deviations: esperado lista de desvios (- id: D1 …).'); return { deviations: [], errors, warnings }; }
  const seen = new Set();
  const deviations = [];
  entries.forEach((e, i) => {
    const where = `deviations[${i}]`;
    if (!e || typeof e !== 'object' || Array.isArray(e)) { errors.push(`${where}: esperado mapa com id, screens, rules, reason, decided-by.`); return; }
    const id = e.id === undefined ? '' : String(e.id).trim();
    if (!id) errors.push(`${where}: sem id (ex.: D1).`);
    else if (seen.has(id)) errors.push(`deviations: id ${id} repetido.`);
    seen.add(id);
    const label = id || where;
    for (const k of Object.keys(e)) if (!['id', 'screens', 'rules', 'reason', 'decided-by', 'until'].includes(k)) warnings.push(`deviations ${label}: chave desconhecida "${k}".`);
    const screens = list(e.screens);
    const rules = list(e.rules);
    if (!screens.length) errors.push(`deviations ${label}: sem screens (ids das telas; "*" para todas).`);
    for (const r of rules) if (!RULE_ID.test(r)) errors.push(`deviations ${label}: regra "${r}" não existe (use ids T, F, S, C, L, X ou U).`);
    const reason = e.reason === undefined ? '' : String(e.reason).trim();
    if (!reason) errors.push(`deviations ${label}: sem reason (o motivo aparece na página de achados).`);
    const decidedBy = e['decided-by'] === undefined ? '' : String(e['decided-by']).trim();
    if (!decidedBy) errors.push(`deviations ${label}: sem decided-by (quem aceitou o desvio).`);
    const until = e.until === undefined || e.until === null || e.until === '' ? null : String(e.until).trim();
    if (until && !DATE.test(until)) errors.push(`deviations ${label}: until "${until}" fora do formato AAAA-MM-DD.`);
    deviations.push({ id, screens, rules, reason, decided_by: decidedBy, until });
  });
  return { deviations, errors, warnings };
}

const day = (now) => (now instanceof Date ? now : new Date(now ?? Date.now())).toISOString().slice(0, 10);

/** O desvio venceu (`until` anterior a hoje)? */
export const expired = (dev, now = new Date()) => !!dev.until && dev.until < day(now);

/** O desvio cobre a tela? */
export function coversScreen(dev, screen) {
  const k = screenKey(screen);
  return dev.screens.some((s) => s === '*' || s === String(screen) || screenKey(s) === k);
}

/**
 * Primeiro desvio vigente que cobre o achado (regra em `rules` e todas as telas em `screens`), ou null.
 * Achado sem tela (ex.: consistência sem captura) só é coberto por desvio com "*".
 */
export function coveringDeviation(item, deviations = [], now = new Date()) {
  const screens = (item.screens ?? []).filter(Boolean);
  for (const dev of deviations) {
    if (expired(dev, now) || !dev.rules.includes(item.rule)) continue;
    if (!screens.length ? dev.screens.includes('*') : screens.every((s) => coversScreen(dev, s))) return dev;
  }
  return null;
}

/** Ids `D<n>` citados no corpo (tabela de desvios da seção 5). */
export function bodyDeviationIds(body) {
  const ids = new Set();
  for (const line of String(body ?? '').split('\n')) {
    const m = line.match(/^\s*\|\s*\**(D\d+)\**\s*\|/);
    if (m) ids.add(m[1]);
  }
  return [...ids];
}
