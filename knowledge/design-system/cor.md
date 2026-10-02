# Cor

## Quando consultar

- Ao gerar ou ajustar uma rampa de cor, ou ao adicionar uma cor de marca ou de feedback.
- Ao escolher qual token de cor usar num texto, borda, ícone, ação ou alerta.
- Ao criar ou revisar o tema escuro.
- Ao desenhar estados (erro, sucesso), links, gráficos ou qualquer informação codificada por cor.

## Regras

1. **Gere rampas por algoritmo, nunca tom a tom à mão.** Use `tools/palette.mjs`.
2. **Componentes usam papéis (`color.text.*`, `color.action.*` …), nunca passos de rampa (`color.brand.600`).**
3. **Todo par de cor que carrega informação tem contraste calculado**, não estimado a olho, e está em `tokens/contrast-pairs.json`.
4. **Valide cada par em cada tema.** Passar no claro não diz nada sobre o escuro.
5. **Nunca use cor como único sinal.** Some texto, ícone, forma, padrão ou posição.
6. **Mínimo de três famílias**: marca, neutra e feedback (erro, sucesso, aviso, informação). O repo tem `brand`, `neutral`, `success`, `danger`, `warning`, `info`.

## Rampa 50–950 em OKLCH

Cada família tem 11 passos: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`. O número indica **luminosidade**, não "a cor da marca": o 50 é quase branco, o 950 é quase preto, em qualquer matiz.

Por que OKLCH: o canal L é perceptualmente uniforme. Fixar o mesmo L por passo em todas as famílias faz `danger.600` e `success.600` terem peso visual parecido, e faz o salto 100→200 parecer do mesmo tamanho que 700→800. Em HSL, um amarelo e um azul com a mesma "luminosidade" têm brilhos percebidos muito diferentes.

Como `tools/palette.mjs` funciona:

| Passo | L alvo (OKLCH) |
|---|---|
| 50 | 0,975 |
| 100 | 0,94 |
| 200 | 0,885 |
| 300 | 0,81 |
| 400 | 0,72 |
| 500 | 0,63 |
| 600 | 0,545 |
| 700 | 0,465 |
| 800 | 0,39 |
| 900 | 0,32 |
| 950 | 0,25 |

- A matiz (H) vem da cor-base.
- O croma (C) é máximo perto do meio da rampa e cai nas pontas (até 18% do croma da base), para evitar claros "sujos" e escuros saturados demais.
- A saída mostra o contraste de cada passo contra branco e contra preto, para escolher papéis sem adivinhar.

```bash
node tools/palette.mjs "#5754ed" --name brand              # JSON com contraste por passo
node tools/palette.mjs "#5754ed" --name brand --format dtcg # bloco para primitives.tokens.json
```

SE → ENTÃO:

- **SE** a cor da marca não cai exatamente num passo **ENTÃO** não force a rampa; escolha o passo mais próximo para o papel de ação e documente.
- **SE** o passo escolhido para ação falha contraste com o rótulo **ENTÃO** desça um passo (mais escuro) no tema claro; não clareie o texto.
- **SE** a cor de feedback é amarela/laranja **ENTÃO** espere que os passos médios falhem como fundo de texto branco; use o passo 800 para texto sobre `-50`, como o repo faz em `color.feedback.warning-text`.

## Uso por faixa de passo (orientação de partida)

| Faixa | Uso típico | Exemplo no repo (tema claro) |
|---|---|---|
| 50–100 | Fundos sutis, superfícies, fundos de alerta | `color.bg.surface` → `neutral.50`; `color.feedback.info-bg` → `info.50` |
| 200–300 | Divisores decorativos, fundos de hover discretos | `color.border.default` → `neutral.200` |
| 400–500 | Contornos de controle, ícones secundários | `color.border.strong` → `neutral.500` |
| 600–700 | Ação primária, links, texto secundário | `color.action.primary` → `brand.600`; `color.text.link` → `brand.700` |
| 700–800 | Hover/pressionado, texto sobre fundo de feedback | `color.action.primary-active` → `brand.800`; `-text` de feedback → `.800` |
| 900–950 | Texto principal, superfícies escuras | `color.text.primary` → `neutral.950` |

O passo 500 **não** é automaticamente a cor do botão. No repo, `brand.500` sobre branco dá 3,72:1: serve para elemento gráfico (≥ 3:1), mas não para texto.

## Papéis semânticos

| Grupo | Tokens | Regra |
|---|---|---|
| Fundo | `color.bg.canvas`, `surface`, `sunken`, `overlay`, `inverse` | `canvas` é a página; `surface` eleva (card, painel); `sunken` rebaixa (trilha, área de input); `overlay` é o véu de modal |
| Texto | `color.text.primary`, `secondary`, `muted`, `inverse`, `link`, `on-action` | `muted` é o mais claro permitido para texto; nada abaixo dele |
| Borda | `color.border.default`, `strong`, `focus` | `default` só para divisores decorativos; contorno de campo usa `strong`; foco usa `focus` |
| Ação | `color.action.primary[-hover/-active]`, `secondary[-hover]`, `danger[-hover]`, `disabled`, `disabled-text` | Rótulo de ação preenchida usa `color.text.on-action` |
| Feedback | `color.feedback.<tipo>-bg/-text/-icon` | Usar o trio junto; nunca `-icon` como cor de texto |
| IA | `color.ai.accent`, `color.ai.surface` | Marca discreta de conteúdo gerado por IA; não é cor de ação |

Pareamentos garantidos por construção: `text.on-action` sobre `action.*`; `feedback.X-text` sobre `feedback.X-bg`; `text.primary|secondary|muted` sobre `bg.canvas|surface`. Fora desses, calcule.

## Contraste WCAG 2.2

Fórmula: `(L1 + 0,05) / (L2 + 0,05)`, com L = luminância relativa sRGB (L1 a mais clara). Resultado de 1:1 a 21:1. `tools/lib/color.mjs` implementa exatamente isso.

| Situação | Mínimo AA | AAA | Critério |
|---|---|---|---|
| Texto normal | **4,5:1** | 7:1 | 1.4.3 / 1.4.6 |
| Texto grande (≥ 24px, ou ≥ 18,66px em negrito) | **3:1** | 4,5:1 | 1.4.3 / 1.4.6 |
| Componente de interface e gráfico informativo (contorno de campo, ícone que informa, indicador de estado, anel de foco, barra de gráfico) | **3:1** contra as cores adjacentes | — | 1.4.11 |
| Texto desabilitado, logotipo, decoração pura | Isento | — | — |

Regras práticas:

- Trate **todo texto de interface como "normal"** (4,5:1). Reserve 3:1 para títulos realmente grandes.
- Use 7:1 quando o contexto pedir AAA (saúde, finanças, setor público, público idoso ou com baixa visão) ou quando o `DESIGN.md` exigir.
- 1.4.11 vale para o que é **necessário para identificar o componente ou seu estado**: a borda de um input sem fundo próprio, o check de um checkbox, a cor que distingue a aba selecionada. Borda decorativa de card não precisa.
- Isenção de desabilitado não é licença para ilegível: mantenha `color.action.disabled-text` claramente distinguível e acompanhe de sinais não cromáticos.

Exemplos medidos sobre branco: `neutral.600` (4,96:1) passa como texto; `neutral.500` (3,51:1) passa como contorno, falha como texto; `neutral.400` (2,47:1) falha até como contorno. Esse último é o tom típico de placeholder mal escolhido.

### Os pares que mais falham (verifique sempre)

1. Rótulo do botão primário sobre a cor de ação (especialmente vermelho, laranja, amarelo, verde saturados).
2. Texto corrido sobre fundo levemente tingido da marca.
3. Placeholder e texto de apoio dentro de campo.
4. Ícone de status sobre a superfície do card.
5. Link dentro de parágrafo (contra o fundo e, se só a cor o distingue, contra o texto ao redor).
6. Anel de foco contra o fundo adjacente.

O repo já declara esses pares; rode `node tools/build-tokens.mjs` e leia cada linha `OK`/`FALHA` para os dois temas.

### Se um par falhar

1. Mova o papel para outro passo da rampa (mais escuro no claro, mais claro no escuro).
2. Se nenhum passo serve, regenere a rampa com outra cor-base ou ajuste o croma.
3. Nunca "conserte" adicionando sombra de texto ou opacidade.
4. Rode o build de novo; só publique com todos os pares em `OK`.

APCA pode ser usado como sinal complementar de legibilidade, mas a conformidade se mede pela razão WCAG 2.x.

## Tema escuro

Não é inversão. Regras:

- **Mesma rampa, outro mapeamento.** O escuro troca o passo apontado por cada papel; não gera cores novas. No repo: `color.bg.canvas` claro → `color.white`, escuro → `neutral.950`; `color.text.primary` claro → `neutral.950`, escuro → `neutral.50`.
- **Ação clareia no escuro.** `color.action.primary` vai de `brand.600` para `brand.300`; consequentemente `color.text.on-action` vira escuro (`neutral.950`). Hover no escuro vai para o lado mais claro (`brand.200`), não para o mais escuro.
- **Feedback inverte o trio.** Fundo `.950`, texto `.200`, ícone `.400`.
- **Elevação por tom, não por sombra.** Superfícies mais altas ficam um pouco mais claras (`bg.surface` = `neutral.900` sobre `bg.canvas` = `neutral.950`). Sombra pesada some sobre fundo escuro.
- **Evite preto puro e branco puro em áreas grandes.** O repo usa `neutral.950` e `neutral.50`.
- **Reduza croma de cores vibrantes.** Passos claros (200–400) já têm croma menor na rampa; não use o 500/600 saturado como texto ou ícone sobre fundo escuro.
- **Revalide tudo.** O mesmo 4,5:1 parece mais fraco no escuro; quando houver folga, prefira margem acima do mínimo.
- **Alfa depende do fundo.** `color.bg.overlay` tem valores diferentes por tema; valide o conteúdo sob o véu manualmente.

## Nunca só a cor (1.4.1)

| Caso | Sinal redundante obrigatório |
|---|---|
| Erro de campo | Ícone + texto da mensagem + `aria-invalid`; a borda vermelha é complemento |
| Sucesso / aviso / info | Ícone específico por tipo + título em texto |
| Link em parágrafo | Sublinhado (ou outro indicador não cromático) |
| Item selecionado, aba ativa | Peso, marcador, borda ou ícone, além da cor |
| Status em tabela (ativo, pendente) | Rótulo textual ou ícone com nome acessível |
| Obrigatório | Texto ou asterisco explicado, não só label colorido |

Cerca de 8% dos homens e 0,5% das mulheres têm alguma deficiência na percepção de cor; vermelho × verde é a confusão mais comum.

## Visualização de dados

- Séries categóricas: cores distinguíveis entre si **e** identificadas por rótulo direto, legenda próxima, forma de marcador ou padrão.
- Marcas de dados (barras, linhas, pontos) precisam de 3:1 contra o fundo do gráfico (1.4.11). Entre séries adjacentes, busque diferença de luminosidade, não só de matiz.
- Escalas sequenciais: uma matiz variando L (a rampa 50–950 serve). Divergentes: duas matizes com centro neutro.
- Não reutilize cores de feedback (danger/success) como cores de série; o leitor vai interpretar como erro/sucesso.
- Teste o gráfico em escala de cinza: se a leitura depende de cor, adicione outro canal.
- Ofereça a tabela de dados como alternativa para tecnologia assistiva.

## Anti-padrões

- Escolher tons à mão e "acertar no olho".
- Aprovar paleta olhando a rampa isolada, sem os pares reais de componente.
- Assumir que o passo 500 é a cor de ação.
- Placeholder em cinza claro (abaixo de 4,5:1).
- Copiar o mapeamento do claro para o escuro.
- Testar só texto e esquecer bordas, ícones e foco.
- Estado comunicado apenas por troca de cor.
- Usar `color.ai.accent` como cor de botão.

## Checklist

- [ ] Rampa gerada por `tools/palette.mjs` com 11 passos.
- [ ] Componentes consomem só papéis semânticos.
- [ ] Todo par de texto/ícone/contorno/foco está em `contrast-pairs.json` com o mínimo correto (4,5 ou 3).
- [ ] `node tools/build-tokens.mjs` sem `FALHA` nos temas claro e escuro.
- [ ] Tema escuro remapeado (ação clareia, feedback inverte, elevação por tom).
- [ ] Toda informação por cor tem sinal redundante.
- [ ] Gráficos com rótulo/padrão, 3:1 nas marcas e tabela alternativa.
