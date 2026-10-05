// Compatible reading (2026-10 transition, docs/renames-2026-10.md): old Portuguese names in the UX.md front
// matter, the flow map and casos.json. One table, used by lint-ux-md, the ux-lint configuration, flow.mjs and the
// choice pages. Everything read under an old name is converted to the new one and produces a warning
// "old name, rename to X". Nothing here is written. The Portuguese names below are compatibility data.

/** UX.md front matter keys: old path (with the parent already renamed) → new name. */
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

/** Old values per new path. */
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

/** Old archetype ids → new. */
export const ARCHETYPE_IDS = {
  'lista-operacional': 'operational-list', 'mestre-detalhe': 'master-detail', 'documento-com-visor': 'document-viewer',
  'editor-com-painel': 'editor-with-panel', 'assistente-em-etapas': 'step-wizard', 'painel-de-acompanhamento': 'monitoring-dashboard',
  biblioteca: 'library', configuracoes: 'settings', 'pagina-publica-de-decisao': 'public-decision-page',
  'dialogo-de-formulario': 'form-dialog', 'dialogo-de-confirmacao': 'confirmation-dialog', 'painel-lateral-de-detalhe': 'detail-side-panel',
};

/** Old state ids → new. */
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
 * Converts a UX.md front matter with old names to the new ones.
 * Returns { frontMatter, warnings }. Does not change the object it receives.
 */
export function normalizeUxFrontMatter(fm) {
  const warnings = [];
  const walk = (obj, path, oldPath) => {
    const keys = UX_KEYS[path] || {};
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const nk = keys[k] ?? k;
      const np = join(path, nk), op = join(oldPath, k);
      if (nk !== k) warnings.push(`old name "${op}", rename to "${np}"`);
      if (nk in out) warnings.push(`"${np}" appears under both the new and the old name; the last one wins`);
      let val = v;
      if (np === 'archetypes' && isMap(v)) {
        val = {};
        for (const [id, routes] of Object.entries(v)) {
          const nid = ARCHETYPE_IDS[id] ?? id;
          if (nid !== id) warnings.push(`archetype with old id "${id}" in ${np}, rename to "${nid}"`);
          val[nid] = routes;
        }
      } else if (np === 'states' && Array.isArray(v)) {
        val = v.map((s) => {
          const ns = STATE_IDS[s] ?? s;
          if (ns !== s) warnings.push(`state with old name "${s}" in states, rename to "${ns}"`);
          return ns;
        });
      } else if (isMap(v) && UX_KEYS[np]) {
        val = walk(v, np, op);
      } else if (isMap(v) && np === 'verification.selectors') {
        val = walk(v, np, op);
      } else if (typeof v === 'string' && UX_VALUES[np]?.[v]) {
        val = UX_VALUES[np][v];
        warnings.push(`old value "${v}" in ${np}, rename to "${val}"`);
      }
      out[nk] = val;
    }
    return out;
  };
  return { frontMatter: isMap(fm) ? walk(fm, '', '') : fm, warnings };
}

// ---------------------------------------------------------------- flow map (flows-<module>.json)

const FLOW_TOP = { telas: 'screens', transicoes: 'transitions', jornadas: 'journeys' };
const FLOW_ITEM = {
  screens: { nome: 'name', tipo: 'type', rota: 'route', pai: 'parent', componente: 'component', evidencia: 'evidence' },
  transitions: { de: 'from', para: 'to', gatilho: 'trigger', evidencia: 'evidence' },
  journeys: { nome: 'name', passos: 'steps', trocas_persona: 'persona_switches' },
};
const TRIGGER = { tipo: 'type', rotulo: 'label' };
/** Old screen types → new. */
export const SCREEN_TYPES = { pagina: 'page', página: 'page', dialogo: 'dialog', diálogo: 'dialog', aba: 'tab', painel: 'panel', gaveta: 'drawer' };

/** Converts a flow map with old names. Returns { map, warnings }. */
export function normalizeFlowMap(map) {
  const warnings = new Set();
  if (!isMap(map)) return { map, warnings: [] };
  const out = {};
  for (const [k, v] of Object.entries(map)) {
    const nk = FLOW_TOP[k] ?? k;
    if (nk !== k) warnings.add(`old name "${k}", rename to "${nk}"`);
    const itemKeys = FLOW_ITEM[nk];
    out[nk] = itemKeys && Array.isArray(v) ? v.map((it) => {
      if (!isMap(it)) return it;
      const o = {};
      for (const [ik, iv] of Object.entries(it)) {
        const nik = itemKeys[ik] ?? ik;
        if (nik !== ik) warnings.add(`old name "${nk}[].${ik}", rename to "${nik}"`);
        let val = iv;
        if (nik === 'trigger' && isMap(iv)) {
          val = {};
          for (const [tk, tv] of Object.entries(iv)) {
            const ntk = TRIGGER[tk] ?? tk;
            if (ntk !== tk) warnings.add(`old name "trigger.${tk}", rename to "${ntk}"`);
            val[ntk] = tv;
          }
        }
        if (nk === 'screens' && nik === 'type' && typeof iv === 'string' && SCREEN_TYPES[iv.toLowerCase()]) {
          val = SCREEN_TYPES[iv.toLowerCase()];
          warnings.add(`old screen type "${iv}", rename to "${val}"`);
        }
        o[nik] = val;
      }
      return o;
    }) : v;
  }
  return { map: out, warnings: [...warnings] };
}

// ---------------------------------------------------------------- cases.json (choice pages)

const CASE_TOP = { casos: 'cases' };
const CASE_ITEM = {
  elemento: 'element', regra: 'rule', severidade: 'severity', texto: 'text', variantes: 'variants', origem: 'source', telas: 'screens',
  problema: 'problem', opcoes: 'options', recomendada: 'recommended', decisao: 'decision',
};
const OPTION_ITEM = { texto: 'text', convencao: 'convention', nota: 'note' };
const RECOMMENDED = { indice: 'index', porque: 'why' };

/** Converts a cases.json (or casos.json) with old names. Accepts a list or { cases }. Returns { data, warnings }. */
export function normalizeCases(data) {
  const warnings = new Set();
  const mapKeys = (obj, table, where) => {
    if (!isMap(obj)) return obj;
    const o = {};
    for (const [k, v] of Object.entries(obj)) {
      const nk = table[k] ?? k;
      if (nk !== k) warnings.add(`old name "${where}${k}", rename to "${nk}"`);
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

// ---------------------------------------------------------------- detector JSON output

const DETECTOR_KEYS = {
  achados: 'findings', resumo: 'summary', telas: 'screens', regra: 'rule', severidade: 'severity', texto: 'text', mensagem: 'message',
  sugestao: 'suggestion', tipos: 'types', tipo: 'type', evidencias: 'evidence', evidencia: 'evidence', origem: 'source', ocorrencias: 'occurrences',
  arquivo: 'file', linha: 'line', teste: 'test', trecho: 'snippet', local: 'location', variantes: 'variants', regiao: 'region', tela: 'screen',
  dialogoAberto: 'dialog_open', inventario: 'inventory', dado: 'probable_data', provavelDado: 'probable_data', severidadeOriginal: 'original_severity',
  porRegra: 'by_rule', porSeveridade: 'by_severity', porTipo: 'by_type', inventarioPorTipo: 'inventory_by_type', telasComAchado: 'screens_with_findings',
  transicoes: 'transitions', jornadas: 'journeys', textos: 'texts',
  // camelCase of the in-development 0.5.0 → snake_case (convention: all JSON in snake_case)
  dialogOpen: 'dialog_open', probableData: 'probable_data', originalSeverity: 'original_severity', byRule: 'by_rule', bySeverity: 'by_severity',
  byType: 'by_type', inventoryByType: 'inventory_by_type', screensWithFindings: 'screens_with_findings', fromAriaLabel: 'from_aria_label',
  byStatus: 'by_status', byFamily: 'by_family',
};
/** Old element types (text detector output) → new. */
export const TEXT_TYPES = {
  'título': 'title', 'botão': 'button', aba: 'tab', 'rótulo': 'label', 'texto de apoio': 'helper', alerta: 'alert',
  'nome acessível': 'accessible-name', 'valor vazio': 'empty-value',
};

/** Converts (recursively) the old JSON output of text.mjs / screen.mjs / flow.mjs to the new names. */
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
