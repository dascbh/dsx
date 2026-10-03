/**
 * Prelúdio de helpers para `use_figma` — cole no topo de cada script.
 *
 * NÃO roda no Node: é código do Plugin API do Figma, colado dentro de uma
 * chamada `use_figma` (por isso o `await` no nível de topo e o objeto global
 * `figma`). `node --check` reclamaria do `await` solto — é esperado.
 *
 * Cada chamada a `use_figma` roda num contexto novo: não há import, não há
 * estado entre chamadas. Este prelúdio é o preço fixo por script, e paga:
 * sem ele, montar uma tela vira dezenas de linhas de `createFrame` cru e o
 * layout sai posicionado à mão em vez de auto-layout.
 *
 * Depende de: variáveis de cor (coleções `Primitivos` / `Semântico` /
 * `Componente`) e estilos de texto já criados (skill `figma-fundacoes`), e do
 * frame de ícones com os componentes `Ícone/<Nome>`. Os nomes de variável
 * seguem a convenção DSX — o token DTCG com `/` no lugar de `.`
 * (`color.text.primary` → `color/text/primary`).
 *
 * Antes de colar, preencha o bloco CONFIGURE abaixo com os fatos do projeto.
 * Eles estão em `design/figma-reference.json` (skill `figma-convencoes`) —
 * leia de lá em vez de redescobrir por API.
 */

// ═════════════════════════════════════════════════════════════════════════════
// CONFIGURE — fatos específicos do projeto. Tudo o que muda de um arquivo do
// Figma para outro mora aqui; o resto do prelúdio não deveria precisar de
// edição.
// ═════════════════════════════════════════════════════════════════════════════

/** Id do frame que agrupa os componentes de ícone (fase Fundações).
 *  Fonte: `design/figma-reference.json` → `foundation.icons.frameId`. */
const ICON_FRAME_ID = 'ID_DO_FRAME_DE_ICONES';

/** Prefixo do nome dos componentes de ícone: `Ícone/Add`, `Ícone/Cancel`… */
const ICON_PREFIX = 'Ícone/';

/** Tamanho nativo dos componentes de ícone (MUI, Lucide etc. usam 24). */
const ICON_NATIVE_SIZE = 24;

/** Família tipográfica real do projeto — a mesma que o código carrega. */
const FONT_FAMILY = 'Plus Jakarta Sans';
const FONT_WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold'];

/** Nomes dos estilos de texto usados pelos helpers (criados em figma-fundacoes). */
const TEXT_STYLE = {
  sectionTitle: 'Título/Seção (SectionCard)',
  tableHeader: 'Rótulo/Cabeçalho de tabela',
};

/** Papéis → variável do Figma. Defaults = tokens semânticos do DSX.
 *  Se o projeto não usa tokens no formato DSX, troque pelos nomes semânticos
 *  do tema dele (mantendo as chaves à esquerda, que é o que os helpers leem). */
const TK = {
  pageBg: 'color/bg/canvas',
  surfaceBg: 'color/bg/surface',
  textPrimary: 'color/text/primary',
  textSecondary: 'color/text/secondary',
  textTableHeader: 'color/text/secondary',
  textOnAction: 'color/text/on-action',
  cardBorder: 'color/border/default',
  dividerBorder: 'color/border/default',
  actionPrimary: 'color/action/primary',
  actionDanger: 'color/action/danger',
  success: 'color/feedback/success-icon',
  warning: 'color/feedback/warning-icon',
  danger: 'color/feedback/danger-icon',
  info: 'color/feedback/info-icon',
};

/** Ícone por tom do Verdict/alerta. Ajustado 2026-08-18: WarningAmber/ErrorOutline
 *  não existem mais no projeto de origem — usar ReportProblem/Cancel. Sem
 *  entrada para `neutral` de propósito: ele não tem ícone próprio e cai em
 *  InfoOutlined no verdict() abaixo; esse fallback é decisão de desenho, não
 *  caso esquecido (o tom em si continua validado por `oneOf`).
 *  Troque pelos nomes exportados pelo pacote de ícones do SEU projeto. */
const TONE_ICON = {
  safe: 'CheckCircle', warn: 'ReportProblem', danger: 'Cancel', info: 'InfoOutlined',
};

/** Chrome da tela (casca). Larguras/alturas do AppBar e do menu lateral. */
const SCREEN_WIDTH = 1440;
const APPBAR_HEIGHT = 48;

// ═════════════════════════════════════════════════════════════════════════════
// fim do CONFIGURE
// ═════════════════════════════════════════════════════════════════════════════

// ── base ─────────────────────────────────────────────────────────────────────
const vs = await figma.variables.getLocalVariablesAsync();
const V = {}; vs.forEach(v => V[v.name] = v);
const tsl = await figma.getLocalTextStylesAsync();
const TS = {}; tsl.forEach(s => TS[s.name] = s);

const FA = s => ({ family: FONT_FAMILY, style: s });
await Promise.all(FONT_WEIGHTS.map(s => figma.loadFontAsync(FA(s))));

/** Paint sólido ligado à variável `n`. Falha alto se a variável não existe —
 *  variável ausente = parar e propor, nunca inventar inline. */
const P = n => {
  if (!V[n]) throw new Error(`variável "${n}" não existe no arquivo — confira TK no CONFIGURE ou rode figma-fundacoes`);
  return figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
};
const fill = (nd, n) => { nd.fills = [P(n)]; };
const bord = (nd, n, w) => { nd.strokes = [P(n)]; nd.strokeWeight = w == null ? 1 : w; };
/** Tinta translúcida: precisa de read-modify-write
 *  (ver skills/figma-espelhar/references/plugin-api.md, "Cor e variáveis"). */
const tint = (nd, n, a) => {
  nd.fills = [P(n)];
  const f = JSON.parse(JSON.stringify(nd.fills));
  f[0].opacity = a;
  nd.fills = f;
};

const AL = (dir, props) => figma.createAutoLayout(dir, props);
/** Texto com estilo do arquivo. */
const T = async (chars, style, color) => {
  if (!TS[style]) throw new Error(`estilo de texto "${style}" não existe no arquivo — confira TEXT_STYLE no CONFIGURE`);
  const t = figma.createText();
  t.fontName = FA('Regular');
  t.characters = chars;
  await t.setTextStyleIdAsync(TS[style].id);
  fill(t, color);
  return t;
};
/** Texto avulso (tamanhos que não têm estilo próprio). */
const RAW = (chars, weight, size, color) => {
  const t = figma.createText();
  t.fontName = FA(weight);
  t.characters = chars;
  t.fontSize = size;
  t.lineHeight = { unit: 'PERCENT', value: 145 };
  fill(t, color);
  return t;
};

// ── ícones (componentes criados pela skill figma-fundacoes) ──────────────────
const ICO = {};
for (const c of (await figma.getNodeByIdAsync(ICON_FRAME_ID)).children) {
  ICO[c.name.replace(ICON_PREFIX, '')] = c;
}
/** Instância de ícone no tamanho pedido.
 *  `rescale`, não `resize`: `resize` só muda a caixa da instância e deixa o
 *  vetor interno no tamanho nativo quando a constraint do vetor não é SCALE —
 *  o glifo vaza ou fica deslocado. `rescale` escala a instância inteira,
 *  vetor incluído, independentemente da constraint (ver figma-convencoes,
 *  seção "Criar ou evoluir um componente do kit", item de retrocompatibilidade). */
const icon = (name, color, size) => {
  if (!ICO[name]) throw new Error(`ícone "${name}" não existe em ${ICON_PREFIX}* — confira o frame de ícones`);
  const i = ICO[name].createInstance();
  i.rescale((size || 18) / ICON_NATIVE_SIZE);
  i.children[0].fills = [P(color)];
  return i;
};

const TONE = {
  safe: TK.success, warn: TK.warning, danger: TK.danger,
  neutral: TK.textPrimary, info: TK.info,
};

/** Guarda de conjunto fechado: tipo/tom não reconhecido tem que falhar alto,
 *  não degradar em silêncio para o ramo que por acaso é o fallback. Fallback
 *  silencioso aqui é como um erro de digitação numa chamada de helper vira
 *  cor errada sem nada no relatório para pegar (mesma doutrina do `uncertain`
 *  dos mapas — vale também para o próprio código). */
const oneOf = (value, allowed, label) => {
  if (!allowed.includes(value)) {
    throw new Error(`${label} "${value}" não é um de: ${allowed.join(', ')}`);
  }
  return value;
};

// ── casca de tela ────────────────────────────────────────────────────────────
/** Tela com AppBar + menu lateral por instância; devolve o container de conteúdo. */
function screen(page, name, x, y, h, APPBAR, DRAWER, menuWidth) {
  const s = figma.createFrame();
  s.name = name; s.resize(SCREEN_WIDTH, h); s.x = x; s.y = y;
  s.clipsContent = true; fill(s, TK.pageBg);
  page.appendChild(s);

  const bar = APPBAR.createInstance(); bar.x = 0; bar.y = 0; s.appendChild(bar);
  const dr = DRAWER.createInstance(); dr.x = 0; dr.y = APPBAR_HEIGHT;
  dr.resize(menuWidth, h - APPBAR_HEIGHT); s.appendChild(dr);

  const main = AL('VERTICAL', {
    itemSpacing: 0, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24,
  });
  main.name = 'main'; main.fills = [];
  s.appendChild(main); main.x = menuWidth; main.y = APPBAR_HEIGHT;
  main.resize(SCREEN_WIDTH - menuWidth, 10);
  main.layoutSizingHorizontal = 'FIXED';
  main.layoutSizingVertical = 'HUG';
  return { s, main, dr };
}
/** Depois de montar: ajusta a altura da tela ao conteúdo real. */
function finish(s, main, dr) {
  s.resize(SCREEN_WIDTH, main.height + APPBAR_HEIGHT + 20);
  if (dr) dr.resize(dr.width, s.height - APPBAR_HEIGHT);
}

// ── primitivos ───────────────────────────────────────────────────────────────
const BUTTON_TYPES = ['primary', 'secondary', 'destructive', 'neutral'];
// Nome do frame no Figma (texto do arquivo, em pt-BR) e valores antigos aceitos na chamada.
const BUTTON_LABEL = { primary: 'primária', secondary: 'secundária', destructive: 'destrutiva', neutral: 'neutra' };
const LEGACY_BUTTON_TYPE = { 'primária': 'primary', 'secundária': 'secondary', destrutiva: 'destructive', neutra: 'neutral' };
function btn(label, type, iconName, small) {
  type = LEGACY_BUTTON_TYPE[type] || type;
  oneOf(type, BUTTON_TYPES, 'tipo de botão');
  const b = AL('HORIZONTAL', {
    itemSpacing: 7,
    paddingLeft: small ? 10 : 16, paddingRight: small ? 10 : 16,
    paddingTop: small ? 5 : 7, paddingBottom: small ? 5 : 7,
  });
  b.name = 'Botão · ' + BUTTON_LABEL[type];
  b.counterAxisAlignItems = 'CENTER'; b.primaryAxisAlignItems = 'CENTER';
  b.cornerRadius = 999;
  const color = type === 'primary' ? TK.textOnAction
    : type === 'destructive' ? TK.actionDanger
    : type === 'neutral' ? TK.textSecondary
    : TK.actionPrimary;
  if (type === 'primary') fill(b, TK.actionPrimary);
  else { b.fills = []; if (type === 'secondary') bord(b, TK.actionPrimary); }
  if (iconName) b.appendChild(icon(iconName, color, small ? 15 : 17));
  b.appendChild(RAW(label, 'SemiBold', small ? 12.5 : 13.5, color));
  return b;
}

function chip(label, tone, filled) {
  oneOf(tone, Object.keys(TONE), 'tom do chip');
  const c = AL('HORIZONTAL', { paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2 });
  c.name = 'Chip'; c.counterAxisAlignItems = 'CENTER'; c.cornerRadius = 999;
  const t = TONE[tone];
  if (filled) { fill(c, t); c.appendChild(RAW(label, 'Medium', 11, TK.textOnAction)); }
  else { c.fills = []; bord(c, t); c.appendChild(RAW(label, 'Medium', 11, t)); }
  return c;
}

async function card(parent, title, count, action) {
  const c = AL('VERTICAL', {
    itemSpacing: 14, paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 16,
  });
  c.name = 'SectionCard · ' + title;
  fill(c, TK.surfaceBg); bord(c, TK.cardBorder); c.cornerRadius = 10;
  parent.appendChild(c); c.layoutSizingHorizontal = 'FILL';

  const head = AL('HORIZONTAL', { itemSpacing: 10 });
  head.counterAxisAlignItems = 'CENTER'; head.fills = [];
  c.appendChild(head); head.layoutSizingHorizontal = 'FILL';
  head.appendChild(await T(title, TEXT_STYLE.sectionTitle, TK.textPrimary));
  // contagem aceita string OU nó (chip) — o código real usa os dois
  if (count) head.appendChild(
    typeof count === 'string' ? RAW(count, 'Regular', 13, TK.textSecondary) : count);
  const sp = figma.createFrame(); sp.fills = []; sp.resize(4, 4);
  head.appendChild(sp); sp.layoutSizingHorizontal = 'FILL';
  if (action) head.appendChild(action);
  return c;
}

/** Faixa de status com borda esquerda de 2px — a borda é um filho em fluxo,
 *  não um nó absoluto (absoluto não aceita layoutSizingVertical FILL). */
function verdict(parent, tone, title, body) {
  oneOf(tone, Object.keys(TONE), 'tom do verdict');
  const v = AL('HORIZONTAL', { itemSpacing: 0 }); v.name = 'Verdict';
  fill(v, TK.surfaceBg); bord(v, TK.dividerBorder); v.clipsContent = true;
  parent.appendChild(v); v.layoutSizingHorizontal = 'FILL';

  const bar = figma.createFrame(); bar.strokes = []; fill(bar, TONE[tone]);
  v.appendChild(bar); bar.resize(2, 10);
  bar.layoutSizingHorizontal = 'FIXED'; bar.layoutSizingVertical = 'FILL';

  const inner = AL('HORIZONTAL', {
    itemSpacing: 10, paddingLeft: 14, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
  });
  inner.fills = []; v.appendChild(inner); inner.layoutSizingHorizontal = 'FILL';
  inner.appendChild(icon(TONE_ICON[tone] || 'InfoOutlined', TONE[tone], 17));
  const c = AL('VERTICAL', { itemSpacing: 2 }); c.fills = [];
  inner.appendChild(c); c.layoutSizingHorizontal = 'FILL';
  c.appendChild(RAW(title, 'Bold', 13.5, TK.textPrimary));
  if (body) {
    const b = RAW(body, 'Regular', 12.5, TK.textSecondary);
    c.appendChild(b); b.layoutSizingHorizontal = 'FILL'; b.textAutoResize = 'HEIGHT';
  }
  return v;
}

/** Campo de formulário com o rótulo no entalhe da borda (MUI outlined).
 *  valor === null → campo vazio: o rótulo fica dentro, como o MUI faz. */
function field(parent, label, value, width, help, multiline) {
  const wrap = AL('VERTICAL', { itemSpacing: 4 }); wrap.fills = [];
  parent.appendChild(wrap);
  if (width) {
    wrap.resize(width, 10);
    wrap.layoutSizingHorizontal = 'FIXED'; wrap.layoutSizingVertical = 'HUG';
  } else wrap.layoutSizingHorizontal = 'FILL';

  const f = AL('HORIZONTAL', {
    paddingLeft: 12, paddingRight: 12, paddingTop: 9, paddingBottom: multiline ? 30 : 9,
  });
  f.name = 'TextField · ' + label; f.counterAxisAlignItems = 'MIN';
  f.cornerRadius = 4; f.clipsContent = false; f.fills = []; bord(f, TK.cardBorder);
  /** createAutoLayout() vem com clipsContent=true por padrão — o rótulo do
   *  entalhe fica posicionado ACIMA da borda superior do próprio frame
   *  (y negativo), então o wrapper precisa de clipsContent=false também,
   *  senão o rótulo é cortado (achado 2026-08-18, fase Fundações). */
  wrap.clipsContent = false;
  wrap.appendChild(f); f.layoutSizingHorizontal = 'FILL';

  const inner = RAW(value == null ? label : value, 'Regular', 13,
    value == null ? TK.textSecondary : TK.textPrimary);
  f.appendChild(inner); inner.layoutSizingHorizontal = 'FILL'; inner.textAutoResize = 'HEIGHT';

  if (value != null) {                       // entalhe: tampa a borda atrás do rótulo
    const bg = figma.createFrame(); bg.name = 'notch'; bg.strokes = [];
    fill(bg, TK.surfaceBg); bg.resize(10, 3);
    f.appendChild(bg); bg.layoutPositioning = 'ABSOLUTE';   // depois do appendChild
    const lb = RAW(label, 'Regular', 10.5, TK.textSecondary);
    f.appendChild(lb); lb.layoutPositioning = 'ABSOLUTE'; lb.x = 9; lb.y = -7;
    bg.resize(lb.width + 6, 3); bg.x = 7; bg.y = -1.5;
  }
  if (help) {
    const h = RAW(help, 'Regular', 11.5, TK.textSecondary);
    wrap.appendChild(h); h.layoutSizingHorizontal = 'FILL'; h.textAutoResize = 'HEIGHT';
  }
  return wrap;
}

/** Tabela densa. cols = [[rótulo, largura, alinhamento?]]; linhas = matriz de nós.
 *  CONFIRA: Σ larguras + (n−1)×12 ≤ largura interna do container. */
async function table(parent, cols, rows) {
  const wrap = AL('VERTICAL', { itemSpacing: 0 }); wrap.name = 'Tabela'; wrap.fills = [];
  parent.appendChild(wrap); wrap.layoutSizingHorizontal = 'FILL';

  const hd = AL('HORIZONTAL', { itemSpacing: 12, paddingTop: 8, paddingBottom: 8 });
  hd.fills = []; bord(hd, TK.dividerBorder);
  hd.strokeTopWeight = 0; hd.strokeLeftWeight = 0; hd.strokeRightWeight = 0; hd.strokeBottomWeight = 1;
  wrap.appendChild(hd); hd.layoutSizingHorizontal = 'FILL';
  for (const c of cols) {
    const t = await T(c[0], TEXT_STYLE.tableHeader, TK.textTableHeader);
    hd.appendChild(t);
    t.layoutSizingHorizontal = 'FIXED'; t.resize(c[1], t.height); t.textAutoResize = 'HEIGHT';
    t.textAlignHorizontal = c[2] === 'right' ? 'RIGHT' : 'LEFT';
  }
  for (let ri = 0; ri < rows.length; ri++) {
    const r = AL('HORIZONTAL', { itemSpacing: 12, paddingTop: 9, paddingBottom: 9 });
    r.name = 'linha'; r.counterAxisAlignItems = 'CENTER'; r.fills = [];
    if (ri < rows.length - 1) {
      bord(r, TK.dividerBorder);
      r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 1;
    }
    wrap.appendChild(r); r.layoutSizingHorizontal = 'FILL';
    for (let ci = 0; ci < cols.length; ci++) {
      const h = AL('HORIZONTAL', { itemSpacing: 8 }); h.fills = [];
      h.counterAxisAlignItems = 'CENTER';
      h.primaryAxisAlignItems = cols[ci][2] === 'right' ? 'MAX' : 'MIN';
      r.appendChild(h);
      h.layoutSizingHorizontal = 'FIXED'; h.resize(cols[ci][1], 10); h.layoutSizingVertical = 'HUG';
      const arr = Array.isArray(rows[ri][ci]) ? rows[ri][ci] : [rows[ri][ci]];
      for (const el of arr) {
        if (!el) continue;
        h.appendChild(el);
        if (el.type === 'TEXT') {                     // esta ordem importa
          el.textAutoResize = 'HEIGHT';
          el.layoutSizingHorizontal = 'FILL';
          el.maxLines = 1;
          el.textTruncation = 'ENDING';
          el.textAlignHorizontal = cols[ci][2] === 'right' ? 'RIGHT' : 'LEFT';
        }
      }
    }
  }
  return wrap;
}

/** Espaçador vertical de altura fixa, esticado na largura do pai. */
function gap(parent, h) {
  const g = figma.createFrame(); g.name = 'gap'; g.fills = []; g.resize(10, h);
  parent.appendChild(g); g.layoutSizingHorizontal = 'FILL';
}
