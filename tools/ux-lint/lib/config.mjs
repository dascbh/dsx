// Configuração do ux-lint: lê o front matter de um UX.md e completa com os padrões do contrato
// (knowledge/fundamentos/ux-md.md, "Schema do front matter"). Omitido = vale o padrão do DSX.
import { readFileSync } from 'node:fs';
import { parseYaml, splitFrontMatter } from '../../lib/yaml-lite.mjs';

export const PADROES = Object.freeze({
  navegacao: { 'profundidade-maxima': 3, retorno: 'obrigatorio' },
  acoes: {
    'primarias-por-regiao': 1,
    'posicao-primaria': 'topo-direita',
    'ordem-dialogo': 'cancelar-acao',
    'destrutiva-rotulo-especifico': true,
  },
  formularios: { rotulo: 'sempre-visivel', validacao: 'ao-sair-do-campo', obrigatorios: 'marcar-obrigatorios' },
  conteudo: { botoes: 'verbo-objeto', proibidos: [] },
  fluxos: { 'max-passos-jornada': 12, 'max-dialogos-empilhados': 1, 'becos-sem-saida': 0 },
  verificacao: {
    seletores: {
      regioes: ['header', 'nav', 'aside', 'main', '[role=dialog]'],
      dialogo: '[role=dialog]',
      primaria: '.MuiButton-contained',
      destrutiva: '.MuiButton-containedError, .MuiButton-colorError',
      botao: 'button, [role=button]',
      campo: 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select',
    },
  },
});

const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);

function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) {
    out[k] = isMap(v) && isMap(base[k]) ? merge(base[k], v) : v;
  }
  return out;
}

/** Front matter (objeto) → configuração completa. */
export function configFrom(frontMatter = {}) {
  const cfg = merge(PADROES, frontMatter);
  const s = cfg.verificacao.seletores;
  // Seletores aceitam string única ou lista; normaliza para string (lista com vírgula).
  for (const k of Object.keys(s)) if (Array.isArray(s[k]) && k !== 'regioes') s[k] = s[k].join(', ');
  if (typeof s.regioes === 'string') s.regioes = s.regioes.split(',').map((x) => x.trim()).filter(Boolean);
  if (!Array.isArray(cfg.conteudo.proibidos)) cfg.conteudo.proibidos = [cfg.conteudo.proibidos].filter(Boolean);
  return cfg;
}

/** Lê um UX.md (ou nada) e devolve a configuração. */
export function loadConfig(uxPath) {
  if (!uxPath) return configFrom({});
  const { frontMatter } = splitFrontMatter(readFileSync(uxPath, 'utf8'));
  if (!frontMatter) throw new Error(`${uxPath}: sem front matter (--- ... ---)`);
  return configFrom(parseYaml(frontMatter));
}
