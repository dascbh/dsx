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
 *  Fonte: `design/figma-reference.json` → `fundacao.icones.frameId`. */
const ID_FRAME_ICONES = 'ID_DO_FRAME_DE_ICONES';

/** Prefixo do nome dos componentes de ícone: `Ícone/Add`, `Ícone/Cancel`… */
const PREFIXO_ICONE = 'Ícone/';

/** Tamanho nativo dos componentes de ícone (MUI, Lucide etc. usam 24). */
const ICONE_NATIVO = 24;

/** Família tipográfica real do projeto — a mesma que o código carrega. */
const FAMILIA = 'Plus Jakarta Sans';
const PESOS = ['Regular', 'Medium', 'SemiBold', 'Bold'];

/** Nomes dos estilos de texto usados pelos helpers (criados em figma-fundacoes). */
const ESTILO = {
  tituloSecao: 'Título/Seção (SectionCard)',
  cabecalhoTabela: 'Rótulo/Cabeçalho de tabela',
};

/** Papéis → variável do Figma. Defaults = tokens semânticos do DSX.
 *  Se o projeto não usa tokens no formato DSX, troque pelos nomes semânticos
 *  do tema dele (mantendo as chaves à esquerda, que é o que os helpers leem). */
const TK = {
  fundoPagina: 'color/bg/canvas',
  fundoSuperficie: 'color/bg/surface',
  textoPrimario: 'color/text/primary',
  textoSecundario: 'color/text/secondary',
  textoCabecalhoTabela: 'color/text/secondary',
  textoSobreAcao: 'color/text/on-action',
  bordaCard: 'color/border/default',
  bordaDivisor: 'color/border/default',
  acaoPrimaria: 'color/action/primary',
  acaoPerigo: 'color/action/danger',
  sucesso: 'color/feedback/success-icon',
  atencao: 'color/feedback/warning-icon',
  erro: 'color/feedback/danger-icon',
  info: 'color/feedback/info-icon',
};

/** Ícone por tom do Verdict/alerta. Ajustado 2026-08-18: WarningAmber/ErrorOutline
 *  não existem mais no projeto de origem — usar ReportProblem/Cancel. Sem
 *  entrada para `neutral` de propósito: ele não tem ícone próprio e cai em
 *  InfoOutlined no verdict() abaixo; esse fallback é decisão de desenho, não
 *  caso esquecido (o tom em si continua validado por `umDe`).
 *  Troque pelos nomes exportados pelo pacote de ícones do SEU projeto. */
const ICONE_TOM = {
  safe: 'CheckCircle', warn: 'ReportProblem', danger: 'Cancel', info: 'InfoOutlined',
};

/** Chrome da tela (casca). Larguras/alturas do AppBar e do menu lateral. */
const LARGURA_TELA = 1440;
const ALTURA_APPBAR = 48;

// ═════════════════════════════════════════════════════════════════════════════
// fim do CONFIGURE
// ═════════════════════════════════════════════════════════════════════════════

// ── base ─────────────────────────────────────────────────────────────────────
const vs = await figma.variables.getLocalVariablesAsync();
const V = {}; vs.forEach(v => V[v.name] = v);
const tsl = await figma.getLocalTextStylesAsync();
const TS = {}; tsl.forEach(s => TS[s.name] = s);

const FA = s => ({ family: FAMILIA, style: s });
await Promise.all(PESOS.map(s => figma.loadFontAsync(FA(s))));

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
const T = async (chars, estilo, cor) => {
  if (!TS[estilo]) throw new Error(`estilo de texto "${estilo}" não existe no arquivo — confira ESTILO no CONFIGURE`);
  const t = figma.createText();
  t.fontName = FA('Regular');
  t.characters = chars;
  await t.setTextStyleIdAsync(TS[estilo].id);
  fill(t, cor);
  return t;
};
/** Texto avulso (tamanhos que não têm estilo próprio). */
const RAW = (chars, peso, size, cor) => {
  const t = figma.createText();
  t.fontName = FA(peso);
  t.characters = chars;
  t.fontSize = size;
  t.lineHeight = { unit: 'PERCENT', value: 145 };
  fill(t, cor);
  return t;
};

// ── ícones (componentes criados pela skill figma-fundacoes) ──────────────────
const ICO = {};
for (const c of (await figma.getNodeByIdAsync(ID_FRAME_ICONES)).children) {
  ICO[c.name.replace(PREFIXO_ICONE, '')] = c;
}
/** Instância de ícone no tamanho pedido.
 *  `rescale`, não `resize`: `resize` só muda a caixa da instância e deixa o
 *  vetor interno no tamanho nativo quando a constraint do vetor não é SCALE —
 *  o glifo vaza ou fica deslocado. `rescale` escala a instância inteira,
 *  vetor incluído, independentemente da constraint (ver figma-convencoes,
 *  seção "Criar ou evoluir um componente do kit", item de retrocompatibilidade). */
const icon = (nome, cor, size) => {
  if (!ICO[nome]) throw new Error(`ícone "${nome}" não existe em ${PREFIXO_ICONE}* — confira o frame de ícones`);
  const i = ICO[nome].createInstance();
  i.rescale((size || 18) / ICONE_NATIVO);
  i.children[0].fills = [P(cor)];
  return i;
};

const TOM = {
  safe: TK.sucesso, warn: TK.atencao, danger: TK.erro,
  neutral: TK.textoPrimario, info: TK.info,
};

/** Guarda de conjunto fechado: tipo/tom não reconhecido tem que falhar alto,
 *  não degradar em silêncio para o ramo que por acaso é o fallback. Fallback
 *  silencioso aqui é como um erro de digitação numa chamada de helper vira
 *  cor errada sem nada no relatório para pegar (mesma doutrina do `uncertain`
 *  dos mapas — vale também para o próprio código). */
const umDe = (valor, permitidos, rotulo) => {
  if (!permitidos.includes(valor)) {
    throw new Error(`${rotulo} "${valor}" não é um de: ${permitidos.join(', ')}`);
  }
  return valor;
};

// ── casca de tela ────────────────────────────────────────────────────────────
/** Tela com AppBar + menu lateral por instância; devolve o container de conteúdo. */
function screen(page, name, x, y, h, APPBAR, DRAWER, larguraMenu) {
  const s = figma.createFrame();
  s.name = name; s.resize(LARGURA_TELA, h); s.x = x; s.y = y;
  s.clipsContent = true; fill(s, TK.fundoPagina);
  page.appendChild(s);

  const bar = APPBAR.createInstance(); bar.x = 0; bar.y = 0; s.appendChild(bar);
  const dr = DRAWER.createInstance(); dr.x = 0; dr.y = ALTURA_APPBAR;
  dr.resize(larguraMenu, h - ALTURA_APPBAR); s.appendChild(dr);

  const main = AL('VERTICAL', {
    itemSpacing: 0, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24,
  });
  main.name = 'main'; main.fills = [];
  s.appendChild(main); main.x = larguraMenu; main.y = ALTURA_APPBAR;
  main.resize(LARGURA_TELA - larguraMenu, 10);
  main.layoutSizingHorizontal = 'FIXED';
  main.layoutSizingVertical = 'HUG';
  return { s, main, dr };
}
/** Depois de montar: ajusta a altura da tela ao conteúdo real. */
function fechar(s, main, dr) {
  s.resize(LARGURA_TELA, main.height + ALTURA_APPBAR + 20);
  if (dr) dr.resize(dr.width, s.height - ALTURA_APPBAR);
}

// ── primitivos ───────────────────────────────────────────────────────────────
const TIPOS_BOTAO = ['primária', 'secundária', 'destrutiva', 'neutra'];
function btn(rotulo, tipo, nomeIcone, small) {
  umDe(tipo, TIPOS_BOTAO, 'tipo de botão');
  const b = AL('HORIZONTAL', {
    itemSpacing: 7,
    paddingLeft: small ? 10 : 16, paddingRight: small ? 10 : 16,
    paddingTop: small ? 5 : 7, paddingBottom: small ? 5 : 7,
  });
  b.name = 'Botão · ' + tipo;
  b.counterAxisAlignItems = 'CENTER'; b.primaryAxisAlignItems = 'CENTER';
  b.cornerRadius = 999;
  const cor = tipo === 'primária' ? TK.textoSobreAcao
    : tipo === 'destrutiva' ? TK.acaoPerigo
    : tipo === 'neutra' ? TK.textoSecundario
    : TK.acaoPrimaria;
  if (tipo === 'primária') fill(b, TK.acaoPrimaria);
  else { b.fills = []; if (tipo === 'secundária') bord(b, TK.acaoPrimaria); }
  if (nomeIcone) b.appendChild(icon(nomeIcone, cor, small ? 15 : 17));
  b.appendChild(RAW(rotulo, 'SemiBold', small ? 12.5 : 13.5, cor));
  return b;
}

function chip(rotulo, tom, preenchido) {
  umDe(tom, Object.keys(TOM), 'tom do chip');
  const c = AL('HORIZONTAL', { paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2 });
  c.name = 'Chip'; c.counterAxisAlignItems = 'CENTER'; c.cornerRadius = 999;
  const t = TOM[tom];
  if (preenchido) { fill(c, t); c.appendChild(RAW(rotulo, 'Medium', 11, TK.textoSobreAcao)); }
  else { c.fills = []; bord(c, t); c.appendChild(RAW(rotulo, 'Medium', 11, t)); }
  return c;
}

async function card(parent, titulo, contagem, acao) {
  const c = AL('VERTICAL', {
    itemSpacing: 14, paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 16,
  });
  c.name = 'SectionCard · ' + titulo;
  fill(c, TK.fundoSuperficie); bord(c, TK.bordaCard); c.cornerRadius = 10;
  parent.appendChild(c); c.layoutSizingHorizontal = 'FILL';

  const head = AL('HORIZONTAL', { itemSpacing: 10 });
  head.counterAxisAlignItems = 'CENTER'; head.fills = [];
  c.appendChild(head); head.layoutSizingHorizontal = 'FILL';
  head.appendChild(await T(titulo, ESTILO.tituloSecao, TK.textoPrimario));
  // contagem aceita string OU nó (chip) — o código real usa os dois
  if (contagem) head.appendChild(
    typeof contagem === 'string' ? RAW(contagem, 'Regular', 13, TK.textoSecundario) : contagem);
  const sp = figma.createFrame(); sp.fills = []; sp.resize(4, 4);
  head.appendChild(sp); sp.layoutSizingHorizontal = 'FILL';
  if (acao) head.appendChild(acao);
  return c;
}

/** Faixa de status com borda esquerda de 2px — a borda é um filho em fluxo,
 *  não um nó absoluto (absoluto não aceita layoutSizingVertical FILL). */
function verdict(parent, tom, titulo, corpo) {
  umDe(tom, Object.keys(TOM), 'tom do verdict');
  const v = AL('HORIZONTAL', { itemSpacing: 0 }); v.name = 'Verdict';
  fill(v, TK.fundoSuperficie); bord(v, TK.bordaDivisor); v.clipsContent = true;
  parent.appendChild(v); v.layoutSizingHorizontal = 'FILL';

  const bar = figma.createFrame(); bar.strokes = []; fill(bar, TOM[tom]);
  v.appendChild(bar); bar.resize(2, 10);
  bar.layoutSizingHorizontal = 'FIXED'; bar.layoutSizingVertical = 'FILL';

  const inner = AL('HORIZONTAL', {
    itemSpacing: 10, paddingLeft: 14, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
  });
  inner.fills = []; v.appendChild(inner); inner.layoutSizingHorizontal = 'FILL';
  inner.appendChild(icon(ICONE_TOM[tom] || 'InfoOutlined', TOM[tom], 17));
  const c = AL('VERTICAL', { itemSpacing: 2 }); c.fills = [];
  inner.appendChild(c); c.layoutSizingHorizontal = 'FILL';
  c.appendChild(RAW(titulo, 'Bold', 13.5, TK.textoPrimario));
  if (corpo) {
    const b = RAW(corpo, 'Regular', 12.5, TK.textoSecundario);
    c.appendChild(b); b.layoutSizingHorizontal = 'FILL'; b.textAutoResize = 'HEIGHT';
  }
  return v;
}

/** Campo de formulário com o rótulo no entalhe da borda (MUI outlined).
 *  valor === null → campo vazio: o rótulo fica dentro, como o MUI faz. */
function field(parent, rotulo, valor, largura, ajuda, multilinha) {
  const wrap = AL('VERTICAL', { itemSpacing: 4 }); wrap.fills = [];
  parent.appendChild(wrap);
  if (largura) {
    wrap.resize(largura, 10);
    wrap.layoutSizingHorizontal = 'FIXED'; wrap.layoutSizingVertical = 'HUG';
  } else wrap.layoutSizingHorizontal = 'FILL';

  const f = AL('HORIZONTAL', {
    paddingLeft: 12, paddingRight: 12, paddingTop: 9, paddingBottom: multilinha ? 30 : 9,
  });
  f.name = 'TextField · ' + rotulo; f.counterAxisAlignItems = 'MIN';
  f.cornerRadius = 4; f.clipsContent = false; f.fills = []; bord(f, TK.bordaCard);
  /** createAutoLayout() vem com clipsContent=true por padrão — o rótulo do
   *  entalhe fica posicionado ACIMA da borda superior do próprio frame
   *  (y negativo), então o wrapper precisa de clipsContent=false também,
   *  senão o rótulo é cortado (achado 2026-08-18, fase Fundações). */
  wrap.clipsContent = false;
  wrap.appendChild(f); f.layoutSizingHorizontal = 'FILL';

  const inner = RAW(valor == null ? rotulo : valor, 'Regular', 13,
    valor == null ? TK.textoSecundario : TK.textoPrimario);
  f.appendChild(inner); inner.layoutSizingHorizontal = 'FILL'; inner.textAutoResize = 'HEIGHT';

  if (valor != null) {                       // entalhe: tampa a borda atrás do rótulo
    const bg = figma.createFrame(); bg.name = 'notch'; bg.strokes = [];
    fill(bg, TK.fundoSuperficie); bg.resize(10, 3);
    f.appendChild(bg); bg.layoutPositioning = 'ABSOLUTE';   // depois do appendChild
    const lb = RAW(rotulo, 'Regular', 10.5, TK.textoSecundario);
    f.appendChild(lb); lb.layoutPositioning = 'ABSOLUTE'; lb.x = 9; lb.y = -7;
    bg.resize(lb.width + 6, 3); bg.x = 7; bg.y = -1.5;
  }
  if (ajuda) {
    const h = RAW(ajuda, 'Regular', 11.5, TK.textoSecundario);
    wrap.appendChild(h); h.layoutSizingHorizontal = 'FILL'; h.textAutoResize = 'HEIGHT';
  }
  return wrap;
}

/** Tabela densa. cols = [[rótulo, largura, alinhamento?]]; linhas = matriz de nós.
 *  CONFIRA: Σ larguras + (n−1)×12 ≤ largura interna do container. */
async function table(parent, cols, linhas) {
  const wrap = AL('VERTICAL', { itemSpacing: 0 }); wrap.name = 'Tabela'; wrap.fills = [];
  parent.appendChild(wrap); wrap.layoutSizingHorizontal = 'FILL';

  const hd = AL('HORIZONTAL', { itemSpacing: 12, paddingTop: 8, paddingBottom: 8 });
  hd.fills = []; bord(hd, TK.bordaDivisor);
  hd.strokeTopWeight = 0; hd.strokeLeftWeight = 0; hd.strokeRightWeight = 0; hd.strokeBottomWeight = 1;
  wrap.appendChild(hd); hd.layoutSizingHorizontal = 'FILL';
  for (const c of cols) {
    const t = await T(c[0], ESTILO.cabecalhoTabela, TK.textoCabecalhoTabela);
    hd.appendChild(t);
    t.layoutSizingHorizontal = 'FIXED'; t.resize(c[1], t.height); t.textAutoResize = 'HEIGHT';
    t.textAlignHorizontal = c[2] === 'right' ? 'RIGHT' : 'LEFT';
  }
  for (let ri = 0; ri < linhas.length; ri++) {
    const r = AL('HORIZONTAL', { itemSpacing: 12, paddingTop: 9, paddingBottom: 9 });
    r.name = 'linha'; r.counterAxisAlignItems = 'CENTER'; r.fills = [];
    if (ri < linhas.length - 1) {
      bord(r, TK.bordaDivisor);
      r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 1;
    }
    wrap.appendChild(r); r.layoutSizingHorizontal = 'FILL';
    for (let ci = 0; ci < cols.length; ci++) {
      const h = AL('HORIZONTAL', { itemSpacing: 8 }); h.fills = [];
      h.counterAxisAlignItems = 'CENTER';
      h.primaryAxisAlignItems = cols[ci][2] === 'right' ? 'MAX' : 'MIN';
      r.appendChild(h);
      h.layoutSizingHorizontal = 'FIXED'; h.resize(cols[ci][1], 10); h.layoutSizingVertical = 'HUG';
      const arr = Array.isArray(linhas[ri][ci]) ? linhas[ri][ci] : [linhas[ri][ci]];
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
