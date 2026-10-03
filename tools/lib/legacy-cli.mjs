// Apelidos de CLI da transição de nomes (docs/renames-2026-10.md): subcomandos, flags e valores antigos
// em português continuam funcionando, com aviso "nome antigo, use X". Tabela única para todas as ferramentas.
// Cada ferramenta chama normalizeArgv('<ferramenta>', argv) antes de interpretar os argumentos
// (ou parseCli, que já devolve o resultado de parseArgs).
import { parseArgs } from './cli.mjs';

/** ferramenta (caminho relativo a tools/) → { commands, flags, values: { flag: { antigo: novo } } } */
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

const say = (msg) => console.error(`AVISO  ${msg} (docs/renames-2026-10.md)`);

/**
 * Troca subcomando (primeiro posicional), flags e valores antigos pelos novos, avisando cada troca.
 * Aceita `--flag valor` e `--flag=valor`. Devolve um novo argv.
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
      if (t.flags?.[k]) { warn(`--${k} é nome antigo, use --${t.flags[k]}`); k = t.flags[k]; }
      const vals = t.values?.[k];
      if (inline !== undefined) {
        if (vals?.[inline]) { warn(`--${k} ${inline} é nome antigo, use ${vals[inline]}`); inline = vals[inline]; }
        out.push(`--${k}=${inline}`);
      } else {
        out.push(`--${k}`);
        const next = argv[i + 1];
        if (vals && next !== undefined && !next.startsWith('--')) {
          i++;
          if (vals[next]) { warn(`--${k} ${next} é nome antigo, use ${vals[next]}`); out.push(vals[next]); } else out.push(next);
        }
      }
      continue;
    }
    if (!seenPositional && t.commands?.[a]) { warn(`subcomando "${a}" é nome antigo, use "${t.commands[a]}"`); a = t.commands[a]; }
    seenPositional = true;
    out.push(a);
  }
  return out;
}

/** parseArgs com os apelidos da ferramenta aplicados. */
export function parseCli(tool, argv = process.argv.slice(2), warn = say) {
  return parseArgs(normalizeArgv(tool, argv, warn));
}
