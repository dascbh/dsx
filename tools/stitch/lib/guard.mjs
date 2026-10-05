// Real-data guard for anything that leaves the machine (Stitch uploads, published pages).
// The blocklist belongs to the PROJECT, never to the DSX: names of real clients, people, companies, tax ids,
// internal hosts. It is read from the project config (`.dsx/config.json` → `capture.blocklist`, or --config /
// $DSX_CONFIG) and, optionally, from a plain-text file (`capture.blocklist-file`, one entry per line, `#` comments).
//
// Entries: a plain string (matched case- and accent-insensitively as a substring) or a regex written as
// "/pattern/flags". Matching reports which ENTRY matched (it is already in the project config), never the
// surrounding text, so a refusal does not leak more of the document.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { readConfigFile, configFileFor } from '../../ux-lint/lib/project-paths.mjs';

const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Compiles entries into matchers. Invalid regexes are reported, not silently dropped. */
export function compileBlocklist(entries = []) {
  const out = [];
  const errors = [];
  for (const raw of entries) {
    const e = String(raw ?? '').trim();
    if (!e || e.startsWith('#')) continue;
    const m = e.match(/^\/(.+)\/([a-z]*)$/);
    if (m) {
      try {
        const re = new RegExp(m[1], m[2].replace(/[gy]/g, ''));
        out.push({ entry: e, test: (t) => re.test(t) || re.test(fold(t)) });
      }
      catch (err) { errors.push(`invalid blocklist regex ${e}: ${err.message}`); }
    } else {
      const f = fold(e);
      out.push({ entry: e, test: (t) => fold(t).includes(f) });
    }
  }
  return { matchers: out, errors };
}

/** Entries that match the text. */
export function blockedEntries(text, entries) {
  const { matchers } = compileBlocklist(entries);
  return matchers.filter((m) => m.test(text)).map((m) => m.entry);
}

/** Blocklist of a project: config entries + optional file. Returns { entries, source, errors }. */
export function loadBlocklist({ root = process.cwd(), config = null, env = process.env } = {}) {
  const file = configFileFor(resolve(root), config, env);
  let cfg = null;
  const errors = [];
  try { cfg = readConfigFile(file); } catch (e) { errors.push(e.message); }
  const capture = cfg?.capture ?? {};
  const entries = Array.isArray(capture.blocklist) ? [...capture.blocklist] : [];
  if (capture['blocklist-file']) {
    const f = resolve(dirname(file), capture['blocklist-file']);
    if (existsSync(f)) entries.push(...readFileSync(f, 'utf8').split('\n'));
    else errors.push(`blocklist file not found: ${f}`);
  }
  errors.push(...compileBlocklist(entries).errors);
  return { entries, source: cfg ? file : null, errors };
}
