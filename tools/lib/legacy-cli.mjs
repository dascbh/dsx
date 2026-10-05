// CLI aliases of the naming transition (docs/renames-2026-10.md): old Portuguese subcommands, flags and values
// keep working, with an "old name, use X" warning. One table for every tool.
// Each tool calls normalizeArgv('<tool>', argv) before parsing its arguments
// (or parseCli, which already returns the parseArgs result).
import { parseArgs } from './cli.mjs';

/** tool (path relative to tools/) → { commands, flags, values: { flag: { old: new } } } */
export const LEGACY_CLI = {
  'references.mjs': {
    commands: { indice: 'index', buscar: 'search', baixar: 'fetch', avaliar: 'evaluate', curar: 'curate' },
    flags: { registro: 'register', uso: 'use', tema: 'theme', curados: 'curated' },
    values: {
      register: { operacional: 'operational', consumo: 'consumer', marca: 'brand' },
      theme: { claro: 'light', escuro: 'dark', 'claro-e-escuro': 'light-and-dark' },
    },
  },
  'lint-ux-md.mjs': { flags: { arquetipos: 'archetypes' } },
  'ux-lint/text.mjs': { flags: { telas: 'screens', codigo: 'code', ignorar: 'ignore' } },
  'ux-lint/screen.mjs': { flags: { 'falhar-em': 'fail-at' } },
  'ux-lint/flow.mjs': { flags: { 'falhar-em': 'fail-at' } },
  'ux-lint/text-page.mjs': { flags: { produto: 'product', cor: 'color', titulo: 'title' } },
  'stitch/design-system.mjs': { commands: { exportar: 'export', conferir: 'check' }, flags: { papel: 'role' } },
  'stitch/analyze-html.mjs': { flags: { usos: 'uses' } },
  'figma/tokens-to-figma.mjs': { flags: { colecao: 'collection' } },
};

const say = (msg) => console.error(`WARNING  ${msg} (docs/renames-2026-10.md)`);

/**
 * Replaces old subcommand (first positional), flags and values with the new ones, warning on each.
 * Accepts `--flag value` and `--flag=value`. Returns a new argv.
 */
export function normalizeArgv(tool, argv = process.argv.slice(2), warn = say) {
  const t = LEGACY_CLI[tool];
  if (!t) return [...argv];
  const out = [];
  let seenPositional = false;
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    if (a.startsWith('--')) {
      let [k, inline] = a.slice(2).split(/=(.*)/s);
      if (t.flags?.[k]) { warn(`--${k} is an old name, use --${t.flags[k]}`); k = t.flags[k]; }
      const vals = t.values?.[k];
      if (inline !== undefined) {
        if (vals?.[inline]) { warn(`--${k} ${inline} is an old name, use ${vals[inline]}`); inline = vals[inline]; }
        out.push(`--${k}=${inline}`);
      } else {
        out.push(`--${k}`);
        const next = argv[i + 1];
        if (vals && next !== undefined && !next.startsWith('--')) {
          i++;
          if (vals[next]) { warn(`--${k} ${next} is an old name, use ${vals[next]}`); out.push(vals[next]); } else out.push(next);
        }
      }
      continue;
    }
    if (!seenPositional && t.commands?.[a]) { warn(`subcommand "${a}" is an old name, use "${t.commands[a]}"`); a = t.commands[a]; }
    seenPositional = true;
    out.push(a);
  }
  return out;
}

/** parseArgs with the tool's aliases applied. */
export function parseCli(tool, argv = process.argv.slice(2), warn = say) {
  return parseArgs(normalizeArgv(tool, argv, warn));
}
