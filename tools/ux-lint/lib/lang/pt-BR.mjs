// Language pack: Brazilian Portuguese (pt-BR). Product-text vocabulary the text detectors judge against.
// This is the default pack (`content.language` omitted in UX.md), so results stay the same for existing projects.
// Every list is lowercase; entries marked "folded" have no diacritics (compare after NFD folding).
// Interface: see ./index.mjs (`langPack`). Keep the same keys in every pack.

export default Object.freeze({
  id: 'pt-BR',
  name: 'Português (Brasil)',

  // ---------- text.mjs (X1–X11) ----------
  /** X6: button text that is a bare confirmation with no object. */
  labelsWithoutVerb: ['ok', 'sim', 'não', 'nao', 'confirmar', 'enviar'],
  /** X4: empty openings ("Aqui você pode…", "Nesta tela…"). */
  emptyOpenings: [
    /^aqui (você|voce) (pode|encontra|vê|ve)\b/i,
    /^nest[ae] (tela|seção|secao|página|pagina|área|area|aba)\b/i,
    /^est[ae] (página|pagina|tela|seção|secao|área|area)\b/i,
    /^use (este|esta|estes|estas|o|a)\b.*\bpara\b/i,
    /^veja abaixo\b/i,
    /^clique aqui\b/i,
    /^abaixo (você|voce|estão|estao|está|esta)\b/i,
  ],
  /** X3 (content words) and X10 (minor words that stay lowercase in a title). */
  stopWords: 'de da do das dos e a o as os em no na nos nas para pra por com sem ao aos à às um uma uns umas ou que se seu sua seus suas este esta esse essa isso aqui já mais deste desta neste nesta desse dessa nesse nessa'.split(' '),
  /** X5/X6/X10: a company name is a value, not text to rewrite. */
  companyName: /\b(ltda|s\.?\s?a\.?|s\/a|eireli|me|epp)\b\.?/i,
  /** X6 with `content.buttons: verb-object`: does the first word look like a verb (infinitive)? */
  isVerb: (word) => /(ar|er|ir|or|ôr)(-se)?$/.test(String(word).toLowerCase().replace(/[^\p{L}-]/gu, '')),
  /** X9: parentheses that only mark a field as optional/required are fine. */
  optionalMarker: /^(opcional|obrigatório|obrigatorio)$/i,
  /** X11: "OCR" next to the plain-language word is fine ("reconhecimento de texto (OCR)"). */
  ocrExplained: /reconhec/i,
  /** X1: flag em/en dashes in product text. */
  flagDashes: true,
  /** Product-text examples used inside suggestions (they are written in the product language). */
  examples: {
    emptyValue: 'Não informado',
    buttonWithObject: 'Enviar pedido',
    verbObject: 'Criar pedido',
    object: 'objeto',
  },

  // ---------- states.mjs (S1–S3) ----------
  /** Text that announces an empty state (folded is not required: matched case-insensitively). */
  emptyText: /^(nenhum|nenhuma|ainda não|ainda nao|não há|nao ha|sem (resultados|itens|dados|registros)|vazio)\b|\bainda não (tem|há|foi)\b/i,
  /** Next-step verbs and phrases in an error message (folded, lowercase). */
  guidance: [
    'tente', 'tentar', 'verifique', 'verificar', 'confira', 'conferir', 'recarregue', 'recarregar', 'atualize', 'atualizar',
    'volte', 'voltar', 'contate', 'contatar', 'entre em contato', 'fale com', 'peca', 'pedir', 'solicite', 'solicitar',
    'aguarde', 'aguardar', 'selecione', 'selecionar', 'preencha', 'preencher', 'corrija', 'corrigir', 'revise', 'revisar',
    'envie', 'enviar', 'reenvie', 'carregue', 'carregar', 'abra', 'abrir', 'clique', 'use', 'usar', 'escolha', 'escolher',
    'faca', 'fazer', 'informe', 'informar', 'avise', 'avisar', 'acesse', 'acessar', 'reprocesse', 'reprocessar', 'crie', 'criar',
    'digite', 'conecte', 'conectar', 'remova', 'de novo', 'novamente', 'mais tarde', 'em instantes',
  ],
  /** A message that only says "it failed". */
  onlyFailure: ['erro', 'falha', 'falhou', 'algo deu errado', 'ocorreu um erro'],
  /** Dismiss buttons (they do not call the server). */
  dismiss: ['cancelar', 'voltar', 'fechar', 'não', 'nao'],

  // ---------- consistency.mjs (C1–C3) ----------
  /** Verbs of the same action (folded, lowercase). `novo`/`nova` count as the same verb. */
  verbGroups: {
    delete: ['excluir', 'remover', 'apagar', 'deletar'],
    save: ['salvar', 'gravar'],
    dismiss: ['cancelar', 'voltar', 'fechar'],
    create: ['criar', 'novo', 'nova', 'cadastrar'],
    // adicionar puts something that already exists somewhere (catalog item in the order); criar makes a new object
    add: ['adicionar', 'incluir'],
    edit: ['editar', 'alterar', 'modificar'],
    download: ['baixar', 'exportar', 'descarregar'],
  },
  /** Rival names for the same concept in titles and tabs (folded). */
  knownSynonyms: [
    ['configuracoes', 'preferencias'], ['modelo', 'template'], ['painel', 'dashboard'], ['historico', 'log'],
    ['lixeira', 'excluidos'], ['notificacoes', 'avisos'], ['pesquisa', 'busca'], ['usuario', 'utilizador'], ['relatorio', 'report'],
  ],
  /** Words skipped when looking for the object of an action. */
  actionStopWords: 'o a os as um uma uns umas de da do das dos em no na nos nas para pra ao aos à às e ou com sem por esta este esse essa'.split(' '),
  /** A preposition right after the verb introduces the destination, not the object ("Adicionar à proposta"). */
  destinationWords: ['a', 'ao', 'aos', 'na', 'no', 'nas', 'nos', 'em', 'para', 'pra'],
  /** Plural → singular for object matching. */
  singular: (w) => (w.length > 4 && /[^s]s$/.test(w) ? w.slice(0, -1) : w).replace(/oe$/, 'ao').replace(/coe$/, 'cao'),

  // ---------- option text (cases.json, variations) ----------
  /** An option that starts with one of these verbs is an instruction, not the product text itself. */
  instructionVerbs: ['manter', 'mover', 'trocar', 'usar', 'selo', 'remover', 'substituir', 'mostrar', 'esconder', 'tirar', 'levar',
    'deixar', 'separar', 'juntar', 'declarar', 'registrar', 'recolher', 'colocar', 'passar'],

  // ---------- screen.mjs (T1–T7) ----------
  /** T5: generic label on a destructive action (it should say what happens). */
  genericDestructiveLabels: ['confirmar', 'ok', 'sim', 'continuar'],
  /** T5 suggestion: a destructive label that says what happens (product language). */
  destructiveExample: 'Excluir pedido',

  // ---------- lib/geometry.mjs (L9 step-trail) ----------
  /** Words that open a wizard step label ("Passo 2", "Step 2"). */
  stepWords: ['passo', 'etapa'],
});
