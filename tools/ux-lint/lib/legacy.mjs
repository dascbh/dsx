// Leitura compatível (transição de 2026-10, docs/renames-2026-10.md): nomes antigos em português
// do front matter do UX.md, do mapa de fluxo e do casos.json. Uma tabela só, usada pelo lint-ux-md,
// pela configuração do ux-lint, pelo flow.mjs e pelas páginas de escolha. Tudo o que é lido com nome
// antigo é convertido para o novo e gera um aviso "nome antigo, renomeie para X". Nada aqui é escrito.

/** Chaves do front matter do UX.md: caminho antigo (com o pai já novo) → nome novo. */
export const UX_KEYS = {
  '': {
    produto: 'product', navegacao: 'navigation', arquetipos: 'archetypes', acoes: 'actions', confirmacao: 'confirmation',
    estados: 'states', formularios: 'forms', conteudo: 'content', fluxos: 'flows', verificacao: 'verification',
  },
  product: { registro: 'register', plataforma: 'platform', densidade: 'density' },
  navigation: { modelo: 'model', 'profundidade-maxima': 'max-depth', retorno: 'back' },
  actions: {
    'primarias-por-regiao': 'primary-per-region', 'posicao-primaria': 'primary-position', 'ordem-dialogo': 'dialog-order',
    'destrutiva-rotulo-especifico': 'destructive-specific-label',
  },
  confirmation: { irreversivel: 'irreversible', reversivel: 'reversible' },
  feedback: { sucesso: 'success', 'erro-de-campo': 'field-error', 'erro-de-sistema': 'system-error', 'esqueleto-acima-de-ms': 'skeleton-after-ms' },
  forms: { rotulo: 'label', validacao: 'validation', obrigatorios: 'required' },
  content: { glossario: 'glossary', botoes: 'buttons', proibidos: 'forbidden', 'nomes-proprios': 'proper-nouns' },
  flows: { 'max-passos-jornada': 'max-journey-steps', 'max-dialogos-empilhados': 'max-stacked-dialogs', 'becos-sem-saida': 'dead-ends' },
  verification: { seletores: 'selectors' },
  'verification.selectors': {
    regioes: 'regions', dialogo: 'dialog', 'rodape-dialogo': 'dialog-footer', primaria: 'primary', destrutiva: 'destructive',
    botao: 'button', campo: 'field',
  },
};

/** Valores antigos por caminho novo. */
export const UX_VALUES = {
  'product.register': { operacional: 'operational', consumo: 'consumer', marca: 'brand' },
  'product.platform': { ambos: 'both' },
  'product.density': { baixa: 'low', media: 'medium', alta: 'high' },
  'navigation.back': { obrigatorio: 'mandatory', opcional: 'optional' },
  'actions.primary-position': { 'topo-direita': 'top-right', 'rodape-direita': 'bottom-right', 'junto-ao-conteudo': 'inline' },
  'actions.dialog-order': { 'cancelar-acao': 'cancel-action', 'acao-cancelar': 'action-cancel' },
  'confirmation.irreversible': { dialogo: 'dialog', 'digitar-nome': 'type-name' },
  'confirmation.reversible': { desfazer: 'undo', nenhuma: 'none' },
  'feedback.success': { pagina: 'page' },
  'feedback.field-error': { 'no-campo': 'inline' },
  'feedback.system-error': { 'alerta-na-pagina': 'page-alert', pagina: 'page' },
  'forms.label': { 'sempre-visivel': 'always-visible' },
  'forms.validation': { 'ao-sair-do-campo': 'on-blur', 'ao-enviar': 'on-submit', 'em-tempo-real': 'realtime' },
  'forms.required': { 'marcar-obrigatorios': 'mark-required', 'marcar-opcionais': 'mark-optional' },
  'content.buttons': { 'verbo-objeto': 'verb-object' },
};

/** Ids antigos de arquétipo → novos. */
export const ARCHETYPE_IDS = {
  'lista-operacional': 'operational-list', 'mestre-detalhe': 'master-detail', 'documento-com-visor': 'document-viewer',
  'editor-com-painel': 'editor-with-panel', 'assistente-em-etapas': 'step-wizard', 'painel-de-acompanhamento': 'monitoring-dashboard',
  biblioteca: 'library', configuracoes: 'settings', 'pagina-publica-de-decisao': 'public-decision-page',
  'dialogo-de-formulario': 'form-dialog', 'dialogo-de-confirmacao': 'confirmation-dialog', 'painel-lateral-de-detalhe': 'detail-side-panel',
};

/** Ids antigos de estado → novos. */
export const STATE_IDS = {
  carregando: 'loading', 'erro-de-campo': 'field-error', erro: 'error', enviando: 'submitting', sucesso: 'success',
  'rascunho-retomado': 'draft-restored', vazio: 'empty', 'vazio-por-filtro': 'empty-filtered', 'sem-acesso': 'no-access',
  'alteracoes-nao-salvas': 'unsaved-changes', salvando: 'saving', aberto: 'open', executando: 'running', processando: 'processing',
  indisponivel: 'unavailable', salvo: 'saved', conflito: 'conflict', 'somente-leitura': 'read-only',
  'nada-selecionado': 'nothing-selected', 'link-invalido': 'invalid-link', 'link-expirado': 'expired-link',
  'ja-respondido': 'already-answered', 'sem-dados-no-periodo': 'no-data-in-period', parcial: 'partial',
  desatualizado: 'stale', 'item-removido': 'item-removed', editando: 'editing',
};

const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);
const join = (p, k) => (p ? `${p}.${k}` : k);

/**
 * Converte um front matter de UX.md com nomes antigos para os novos.
 * Devolve { frontMatter, warnings }. Não altera o objeto recebido.
 */
export function normalizeUxFrontMatter(fm) {
  const warnings = [];
  const walk = (obj, path, oldPath) => {
    const keys = UX_KEYS[path] || {};
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const nk = keys[k] ?? k;
      const np = join(path, nk), op = join(oldPath, k);
      if (nk !== k) warnings.push(`nome antigo "${op}", renomeie para "${np}"`);
      if (nk in out) warnings.push(`"${np}" aparece com o nome novo e com o antigo; vale o último`);
      let val = v;
      if (np === 'archetypes' && isMap(v)) {
        val = {};
        for (const [id, routes] of Object.entries(v)) {
          const nid = ARCHETYPE_IDS[id] ?? id;
          if (nid !== id) warnings.push(`arquétipo com id antigo "${id}" em ${np}, renomeie para "${nid}"`);
          val[nid] = routes;
        }
      } else if (np === 'states' && Array.isArray(v)) {
        val = v.map((s) => {
          const ns = STATE_IDS[s] ?? s;
          if (ns !== s) warnings.push(`estado com nome antigo "${s}" em states, renomeie para "${ns}"`);
          return ns;
        });
      } else if (isMap(v) && UX_KEYS[np]) {
        val = walk(v, np, op);
      } else if (isMap(v) && np === 'verification.selectors') {
        val = walk(v, np, op);
      } else if (typeof v === 'string' && UX_VALUES[np]?.[v]) {
        val = UX_VALUES[np][v];
        warnings.push(`valor antigo "${v}" em ${np}, renomeie para "${val}"`);
      }
      out[nk] = val;
    }
    return out;
  };
  return { frontMatter: isMap(fm) ? walk(fm, '', '') : fm, warnings };
}

// ---------------------------------------------------------------- mapa de fluxo (flows-<module>.json)

const FLOW_TOP = { telas: 'screens', transicoes: 'transitions', jornadas: 'journeys' };
const FLOW_ITEM = {
  screens: { nome: 'name', tipo: 'type', rota: 'route', pai: 'parent', componente: 'component', evidencia: 'evidence' },
  transitions: { de: 'from', para: 'to', gatilho: 'trigger', evidencia: 'evidence' },
  journeys: { nome: 'name', passos: 'steps', trocas_persona: 'persona_switches' },
};
const TRIGGER = { tipo: 'type', rotulo: 'label' };
/** Tipos de tela antigos → novos. */
export const SCREEN_TYPES = { pagina: 'page', página: 'page', dialogo: 'dialog', diálogo: 'dialog', aba: 'tab', painel: 'panel', gaveta: 'drawer' };

/** Converte um mapa de fluxo com nomes antigos. Devolve { map, warnings }. */
export function normalizeFlowMap(map) {
  const warnings = new Set();
  if (!isMap(map)) return { map, warnings: [] };
  const out = {};
  for (const [k, v] of Object.entries(map)) {
    const nk = FLOW_TOP[k] ?? k;
    if (nk !== k) warnings.add(`nome antigo "${k}", renomeie para "${nk}"`);
    const itemKeys = FLOW_ITEM[nk];
    out[nk] = itemKeys && Array.isArray(v) ? v.map((it) => {
      if (!isMap(it)) return it;
      const o = {};
      for (const [ik, iv] of Object.entries(it)) {
        const nik = itemKeys[ik] ?? ik;
        if (nik !== ik) warnings.add(`nome antigo "${nk}[].${ik}", renomeie para "${nik}"`);
        let val = iv;
        if (nik === 'trigger' && isMap(iv)) {
          val = {};
          for (const [tk, tv] of Object.entries(iv)) {
            const ntk = TRIGGER[tk] ?? tk;
            if (ntk !== tk) warnings.add(`nome antigo "trigger.${tk}", renomeie para "${ntk}"`);
            val[ntk] = tv;
          }
        }
        if (nk === 'screens' && nik === 'type' && typeof iv === 'string' && SCREEN_TYPES[iv.toLowerCase()]) {
          val = SCREEN_TYPES[iv.toLowerCase()];
          warnings.add(`tipo de tela antigo "${iv}", renomeie para "${val}"`);
        }
        o[nik] = val;
      }
      return o;
    }) : v;
  }
  return { map: out, warnings: [...warnings] };
}

// ---------------------------------------------------------------- cases.json (páginas de escolha)

const CASE_TOP = { casos: 'cases' };
const CASE_ITEM = {
  elemento: 'element', regra: 'rule', severidade: 'severity', texto: 'text', variantes: 'variants', origem: 'source', telas: 'screens',
  problema: 'problem', opcoes: 'options', recomendada: 'recommended', decisao: 'decision',
};
const OPTION_ITEM = { texto: 'text', convencao: 'convention', nota: 'note' };
const RECOMMENDED = { indice: 'index', porque: 'why' };

/** Converte um cases.json (ou casos.json) com nomes antigos. Aceita lista ou { cases }. Devolve { data, warnings }. */
export function normalizeCases(data) {
  const warnings = new Set();
  const mapKeys = (obj, table, where) => {
    if (!isMap(obj)) return obj;
    const o = {};
    for (const [k, v] of Object.entries(obj)) {
      const nk = table[k] ?? k;
      if (nk !== k) warnings.add(`nome antigo "${where}${k}", renomeie para "${nk}"`);
      o[nk] = v;
    }
    return o;
  };
  const item = (c) => {
    const o = mapKeys(c, CASE_ITEM, 'cases[].');
    if (Array.isArray(o?.options)) o.options = o.options.map((op) => mapKeys(op, OPTION_ITEM, 'options[].'));
    if (isMap(o?.recommended)) o.recommended = mapKeys(o.recommended, RECOMMENDED, 'recommended.');
    return o;
  };
  let out;
  if (Array.isArray(data)) out = data.map(item);
  else if (isMap(data)) {
    out = mapKeys(data, CASE_TOP, '');
    if (Array.isArray(out.cases)) out.cases = out.cases.map(item);
  } else out = data;
  return { data: out, warnings: [...warnings] };
}

// ---------------------------------------------------------------- saída JSON dos verificadores

const DETECTOR_KEYS = {
  achados: 'findings', resumo: 'summary', telas: 'screens', regra: 'rule', severidade: 'severity', texto: 'text', mensagem: 'message',
  sugestao: 'suggestion', tipos: 'types', tipo: 'type', evidencias: 'evidence', evidencia: 'evidence', origem: 'source', ocorrencias: 'occurrences',
  arquivo: 'file', linha: 'line', teste: 'test', trecho: 'snippet', local: 'location', variantes: 'variants', regiao: 'region', tela: 'screen',
  dialogoAberto: 'dialog_open', inventario: 'inventory', dado: 'probable_data', provavelDado: 'probable_data', severidadeOriginal: 'original_severity',
  porRegra: 'by_rule', porSeveridade: 'by_severity', porTipo: 'by_type', inventarioPorTipo: 'inventory_by_type', telasComAchado: 'screens_with_findings',
  transicoes: 'transitions', jornadas: 'journeys', textos: 'texts',
  // camelCase da versão 0.5.0 em desenvolvimento → snake_case (convenção: todo JSON em snake_case)
  dialogOpen: 'dialog_open', probableData: 'probable_data', originalSeverity: 'original_severity', byRule: 'by_rule', bySeverity: 'by_severity',
  byType: 'by_type', inventoryByType: 'inventory_by_type', screensWithFindings: 'screens_with_findings', fromAriaLabel: 'from_aria_label',
  byStatus: 'by_status', byFamily: 'by_family',
};
/** Tipos de elemento antigos (saída do verificador de texto) → novos. */
export const TEXT_TYPES = {
  'título': 'title', 'botão': 'button', aba: 'tab', 'rótulo': 'label', 'texto de apoio': 'helper', alerta: 'alert',
  'nome acessível': 'accessible-name', 'valor vazio': 'empty-value',
};

/** Converte (recursivamente) a saída JSON antiga de text.mjs / screen.mjs / flow.mjs para os nomes novos. */
export function normalizeDetectorJson(json) {
  const rec = (v, key) => {
    if (Array.isArray(v)) return v.map((x) => (key === 'types' && typeof x === 'string' ? TEXT_TYPES[x] ?? x : rec(x)));
    if (!isMap(v)) return key === 'location' ? ({ codigo: 'code', dado: 'data' }[v] ?? v) : key === 'type' && typeof v === 'string' ? TEXT_TYPES[v] ?? v : v;
    const o = {};
    for (const [k, x] of Object.entries(v)) { const nk = DETECTOR_KEYS[k] ?? k; o[nk] = rec(x, nk); }
    return o;
  };
  return rec(json);
}
