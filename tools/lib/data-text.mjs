// Text fields of DSX data files (`data/*.json`). Round 4 (2026-10) renamed the `*_pt` keys to plain names
// (`name_pt` → `name`, `summary_pt` → `summary`, `question_pt` → `question`, `gaps_pt` → `gaps`,
// `proposal_pt` → `proposal`, `source_rule_pt` → `source_rule`) and translated the content to English.
// Readers take the new key first and fall back to the legacy one, so an older copy of the data still works.

/** Text of `key` in `obj`: `obj[key]`, else `obj[key + '_pt']`, else `fallback`. */
export function dataText(obj, key, fallback = undefined) {
  if (!obj || typeof obj !== 'object') return fallback;
  const v = obj[key] ?? obj[`${key}_pt`];
  return v === undefined || v === null ? fallback : v;
}
