// Interface text of the design options comparison page (tools/design-md/lib/page.mjs), per page language.
// `--lang en|pt-BR` on `lab.mjs compare`; English is the default. Every key exists in both languages.
const plural = (n, one, many) => (n === 1 ? one : many);

const EN = {
  html_lang: 'en',
  title: (m) => `Design options${m ? ` · ${m}` : ''}`,
  eyebrow: (n, m) => `${m ? `${m} · ` : ''}${n} ${plural(n, 'option', 'options')} side by side`,
  question: 'Which visual direction should we follow?',
  lede: 'The same screens drawn with each option. Look at them side by side, open any screen to see it large, and record your choice at the end.',
  official: 'Current',
  official_hint: 'What the product looks like today',
  summary_label: 'Summary of each option',
  score: 'Quality score',
  score_hint: 'How complete and consistent the file is (100 is best)',
  readability: 'Readable text and controls',
  readability_value: (ok, n) => `${ok} of ${n} combinations pass`,
  readability_none: 'Nothing to measure',
  fails: 'Hard to read:',
  dark_too: 'Light and dark modes',
  light_only: 'Light mode only',
  dark_only: 'Dark mode only',
  changes: 'What changes from the current one',
  no_changes: 'Same values as the current one',
  changes_more: (n) => `and ${n} more`,
  credit: (c) => `Based on ${c}`,
  problems: (n) => `${n} ${plural(n, 'problem', 'problems')} in the file`,
  official_check: (e, w) => `Format check: ${e} ${plural(e, 'error', 'errors')}, ${w} ${plural(w, 'warning', 'warnings')}`,
  grid_title: 'Screens',
  grid_hint: 'Each row is one screen; each column is one option. Select a screen to see it large; use ← and → to switch options, ↑ and ↓ to switch screens.',
  open_screen: (s, o) => `Enlarge the ${s} screen in option ${o}`,
  no_image: 'Screen not captured',
  zoomed: 'Screen enlarged',
  prev_option: 'Previous option',
  next_option: 'Next option',
  prev_screen: 'Previous screen',
  next_screen: 'Next screen',
  actual_size: 'Actual size',
  close: 'Close',
  of: ' of ',
  decision_title: 'Your choice',
  decision_lede: 'Copy the decision and send it to whoever maintains the product: they apply it, you do not need to run anything.',
  keep_current: 'Keep the current one',
  follow: (o) => `Follow ${o}`,
  comment: 'Comment',
  comment_hint: 'Optional: what made you choose it, or what to adjust before applying',
  by: 'Your name',
  by_error: 'Write your name so the maintainer knows who decided',
  choice_error: 'Choose one option',
  copy: 'Copy decision',
  copied: 'Decision copied. Paste it in a message to the maintainer.',
  copy_failed: 'Copy did not work: the text is selected below, copy it by hand.',
  resumed: 'Your previous answer was restored.',
  clear: 'Clear answer',
  decision_text: 'Decision text',
  maintainer: 'For the maintainer',
  maintainer_text: 'Apply the chosen option with the lab tool; it only replaces the official file when the checks pass, and keeps a copy of the previous one.',
  about: 'How these numbers are measured',
  about_score: 'Quality score: starts at 100 and loses points for each structural problem, each warning of the DSX checker and each component whose text is hard to read.',
  about_contrast: 'Readable text: main text, secondary text and button text need a contrast of 4.5:1; the main color and field borders need 3:1 (WCAG 2.2, level AA).',
  about_same: 'All columns show the same screens with the same data; only the visual direction changes.',
  pair: {
    'text-on-background': 'Main text on the page', 'text-on-surface': 'Main text on cards', 'secondary-text': 'Secondary text',
    'button-text': 'Text on the main button', 'main-color': 'Main color against the page', 'field-border': 'Field border', 'danger-button': 'Text on the delete button',
  },
  scheme: { light: 'light', dark: 'dark' },
  change: {
    primary: 'Main color', background: 'Page background', surface: 'Card and panel background', text: 'Main text color', 'text-secondary': 'Secondary text color',
    border: 'Borders', danger: 'Delete and error color', status: 'Status colors', table: 'Table colors', 'other-colors': 'Other colors', dark: 'Dark mode colors',
    font: 'Font', size: 'Text sizes', weight: 'Text weight', 'line-height': 'Line spacing', 'letter-spacing': 'Letter spacing',
    spacing: 'Spacing (density)', rounded: 'Corner rounding', components: 'Component details',
  },
  decision_summary: (o) => (o ? `Your choice: ${o}.` : 'No option chosen yet.'),
};

const PT = {
  html_lang: 'pt-BR',
  title: (m) => `Opções de design${m ? ` · ${m}` : ''}`,
  eyebrow: (n, m) => `${m ? `${m} · ` : ''}${n} ${plural(n, 'opção', 'opções')} lado a lado`,
  question: 'Qual direção visual seguir?',
  lede: 'As mesmas telas desenhadas com cada opção. Compare lado a lado, abra qualquer tela para ver em tamanho grande e registre sua escolha no fim.',
  official: 'Atual',
  official_hint: 'Como o produto está hoje',
  summary_label: 'Resumo de cada opção',
  score: 'Nota de qualidade',
  score_hint: 'Quanto o arquivo está completo e coerente (100 é o melhor)',
  readability: 'Texto e controles legíveis',
  readability_value: (ok, n) => `${ok} de ${n} combinações passam`,
  readability_none: 'Nada para medir',
  fails: 'Difícil de ler:',
  dark_too: 'Modos claro e escuro',
  light_only: 'Só modo claro',
  dark_only: 'Só modo escuro',
  changes: 'O que muda em relação ao atual',
  no_changes: 'Mesmos valores do atual',
  changes_more: (n) => `e mais ${n}`,
  credit: (c) => `Baseada em ${c}`,
  problems: (n) => `${n} ${plural(n, 'problema', 'problemas')} no arquivo`,
  official_check: (e, w) => `Conferência do formato: ${e} ${plural(e, 'erro', 'erros')}, ${w} ${plural(w, 'aviso', 'avisos')}`,
  grid_title: 'Telas',
  grid_hint: 'Cada linha é uma tela; cada coluna é uma opção. Selecione uma tela para ver em tamanho grande; use ← e → para trocar de opção, ↑ e ↓ para trocar de tela.',
  open_screen: (s, o) => `Ampliar a tela ${s} na opção ${o}`,
  no_image: 'Tela não capturada',
  zoomed: 'Tela ampliada',
  prev_option: 'Opção anterior',
  next_option: 'Próxima opção',
  prev_screen: 'Tela anterior',
  next_screen: 'Próxima tela',
  actual_size: 'Tamanho real',
  close: 'Fechar',
  of: ' de ',
  decision_title: 'Sua escolha',
  decision_lede: 'Copie a decisão e envie para quem mantém o produto: essa pessoa aplica, você não precisa rodar nada.',
  keep_current: 'Manter a atual',
  follow: (o) => `Seguir ${o}`,
  comment: 'Comentário',
  comment_hint: 'Opcional: o que pesou na escolha, ou o que ajustar antes de aplicar',
  by: 'Seu nome',
  by_error: 'Escreva seu nome para quem mantém o produto saber quem decidiu',
  choice_error: 'Escolha uma opção',
  copy: 'Copiar decisão',
  copied: 'Decisão copiada. Cole numa mensagem para quem mantém o produto.',
  copy_failed: 'A cópia não funcionou: o texto está selecionado abaixo, copie à mão.',
  resumed: 'Sua resposta anterior foi recuperada.',
  clear: 'Limpar resposta',
  decision_text: 'Texto da decisão',
  maintainer: 'Para quem mantém o produto',
  maintainer_text: 'Aplique a opção escolhida com a ferramenta do laboratório; ela só troca o arquivo oficial quando as conferências passam, e guarda uma cópia do anterior.',
  about: 'Como estes números são medidos',
  about_score: 'Nota de qualidade: começa em 100 e perde pontos a cada problema de estrutura, a cada aviso do verificador do DSX e a cada componente com texto difícil de ler.',
  about_contrast: 'Texto legível: texto principal, texto secundário e texto de botão precisam de contraste 4,5:1; a cor principal e a borda dos campos precisam de 3:1 (WCAG 2.2, nível AA).',
  about_same: 'Todas as colunas mostram as mesmas telas com os mesmos dados; só a direção visual muda.',
  pair: {
    'text-on-background': 'Texto principal na página', 'text-on-surface': 'Texto principal nos cartões', 'secondary-text': 'Texto secundário',
    'button-text': 'Texto do botão principal', 'main-color': 'Cor principal contra a página', 'field-border': 'Borda dos campos', 'danger-button': 'Texto do botão de excluir',
  },
  scheme: { light: 'claro', dark: 'escuro' },
  change: {
    primary: 'Cor principal', background: 'Fundo da página', surface: 'Fundo de cartões e painéis', text: 'Cor do texto principal', 'text-secondary': 'Cor do texto secundário',
    border: 'Bordas', danger: 'Cor de excluir e de erro', status: 'Cores de situação', table: 'Cores da tabela', 'other-colors': 'Outras cores', dark: 'Cores do modo escuro',
    font: 'Fonte', size: 'Tamanhos de texto', weight: 'Peso do texto', 'line-height': 'Espaçamento entre linhas', 'letter-spacing': 'Espaçamento entre letras',
    spacing: 'Espaçamento (densidade)', rounded: 'Arredondamento dos cantos', components: 'Detalhes de componentes',
  },
  decision_summary: (o) => (o ? `Sua escolha: ${o}.` : 'Nenhuma opção escolhida ainda.'),
};

export const PAGE_LANGS = ['en', 'pt-BR'];
export function stringsFor(lang) {
  const t = String(lang ?? 'en').toLowerCase();
  return t === 'pt' || t.startsWith('pt') ? PT : EN;
}

/** Plain-language group of a token path, for the "what changes" list. */
export function changeGroup(path) {
  const [group, key = '', prop = ''] = path.split('.');
  if (group === 'colors-dark') return 'dark';
  if (group === 'colors') {
    if (/^(primary|brand|accent)(-hover|-strong|-dark)?$|^on-primary$/.test(key)) return 'primary';
    if (/^(canvas|background|bg)$/.test(key)) return 'background';
    if (/^(surface|paper|card)/.test(key)) return 'surface';
    if (/^(text-primary|text|foreground|on-background|on-surface)$/.test(key)) return 'text';
    if (/^(text-secondary|text-muted|muted-foreground|on-surface-variant)$/.test(key)) return 'text-secondary';
    if (/border|outline|divider|focus|ring/.test(key)) return 'border';
    if (/^(on-)?(danger|error|destructive)$/.test(key)) return 'danger';
    if (/success|warning|info|error|danger/.test(key)) return 'status';
    if (/table/.test(key)) return 'table';
    return 'other-colors';
  }
  if (group === 'typography') {
    if (prop === 'fontFamily') return 'font';
    if (prop === 'fontSize') return 'size';
    if (prop === 'fontWeight') return 'weight';
    if (prop === 'lineHeight') return 'line-height';
    if (prop === 'letterSpacing') return 'letter-spacing';
    return 'size';
  }
  if (group === 'spacing') return 'spacing';
  if (group === 'rounded') return 'rounded';
  return 'components';
}
