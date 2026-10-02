# Tipografia

## Quando consultar

- Ao definir ou revisar a escala tipográfica de um projeto.
- Ao escolher tamanho, peso ou entrelinha para qualquer texto de interface.
- Ao criar títulos responsivos ou tipografia fluida.
- Ao revisar legibilidade: texto pequeno, linha longa demais, hierarquia confusa.

## Regras

1. **Uma escala, uma razão.** Todos os tamanhos vêm de `base × razão^n`. Nada de 13, 15, 17 e 18px soltos lado a lado.
2. **Corpo nunca abaixo de 16px** (1rem) em texto corrido. Texto auxiliar pode ir a 14px; 12px é o piso absoluto e só para rótulos curtos com contraste forte.
3. **Use `rem`**, nunca `px` fixo em texto: respeita a preferência de tamanho do usuário e o zoom.
4. **Todo nível tem tamanho + entrelinha + peso** (e espaçamento entre letras quando preciso). Tamanho sozinho não é decisão completa.
5. **Linha de leitura entre 45 e 75 caracteres.** O repo fixa `size.measure` = 68ch.
6. **Hierarquia semântica independe da visual.** O `<h2>` é `<h2>` porque estrutura o documento, não porque é grande.
7. **No máximo 2 famílias e 4 pesos.**

## Escala modular

`tamanho(n) = base × razão^n`, com n = 0 para o corpo, positivo para títulos, negativo para texto menor.

| Razão | Nome | Caráter | Use quando |
|---|---|---|---|
| 1,067 | Segunda menor | Quase plano | Raramente; interfaces muito densas com pouca hierarquia |
| 1,125 | Segunda maior | Discreto | Apps densos, ferramentas de dados, painéis com muitos níveis |
| 1,2 | Terça menor | Contido | Produtos de produtividade, mobile, sistemas internos |
| 1,25 | Terça maior | Equilibrado | Padrão do repo; SaaS, dashboards, formulários |
| 1,333 | Quarta justa | Claro e confortável | Sites de produto, documentação, conteúdo misto |
| 1,414 | Quarta aumentada | Marcado | Páginas com poucos níveis e títulos fortes |
| 1,5 | Quinta justa | Expressivo | Landing pages, marketing |
| 1,618 | Áurea | Dramático | Editorial, portfólio; exagera em UI densa |

SE → ENTÃO:

- **SE** a tela tem muitos níveis de título num espaço pequeno (tabela, painel, mobile) **ENTÃO** razão entre 1,125 e 1,2.
- **SE** é produto de uso diário com formulários e listas **ENTÃO** 1,25 (padrão).
- **SE** é página de leitura ou documentação **ENTÃO** 1,25 a 1,333.
- **SE** é marketing com poucos blocos **ENTÃO** 1,333 a 1,5; considere escala fluida (abaixo).
- **SE** precisa de escala grande no desktop e contida no mobile **ENTÃO** use escala fluida com razão menor no mínimo e maior no máximo.

### A escala do repositório

`tokens/primitives.tokens.json` usa base 16px e razão 1,25 (terça maior):

| Token | px | Passo | Papel sugerido | Entrelinha sugerida |
|---|---|---|---|---|
| `font.size.12` | 12 | −2* | Legenda, rótulo de metadado | `font.lineHeight.normal` (1,5) |
| `font.size.14` | 14 | −1* | Texto auxiliar, ajuda de campo, tabela densa | 1,5 |
| `font.size.16` | 16 | 0 | Corpo, inputs, botões | 1,5 |
| `font.size.20` | 20 | 1 | Título de card/seção pequena | `font.lineHeight.snug` (1,25)–1,35 |
| `font.size.25` | 25 | 2 | Título de seção | 1,25 |
| `font.size.31` | 31 | 3 | Título de página (app) | 1,25 |
| `font.size.39` | 39 | 4 | Título de página (conteúdo) | `font.lineHeight.tight` (1,1)–1,15 |
| `font.size.49` | 49 | 5 | Display | 1,1 |
| `font.size.61` | 61 | 6 | Display de herói | 1,1 |

\* Abaixo do corpo, a razão pura daria 12,8px e 10,24px. O repo arredondou para 14 e 12 deliberadamente, para não criar texto abaixo do piso legível. Faça o mesmo em qualquer escala: passos negativos são truncados pelos mínimos, não pela matemática.

A camada semântica de tipografia (papéis como "corpo", "título de card") ainda não existe nos arquivos de token. Até existir, componentes podem ler `--font-size-16` etc., mas documente o papel no componente. Ao criar a camada, adicione-a em `semantic.light.tokens.json` (o tema escuro herda automaticamente) e aponte para os primitivos.

### Gerar uma escala

```bash
node tools/type-scale.mjs --base 16 --ratio major-third            # JSON: px, rem, entrelinha por passo
node tools/type-scale.mjs --base 16 --ratio 1.2 --format css       # custom properties
```

Razões aceitas por nome: `minor-second`, `major-second`, `minor-third`, `major-third`, `perfect-fourth`, `augmented-fourth`, `perfect-fifth`, `golden`, ou um número. `--min` e `--max` controlam quantos passos (padrão −1 a 6). A saída nomeia os passos `caption`, `small`, `body`, `h6` … `h1`, `display`.

## Entrelinha (line-height)

Regra geral: quanto maior o texto, menor a entrelinha relativa.

| Tamanho | Entrelinha | Motivo |
|---|---|---|
| ≤ 18px (corpo, auxiliar) | 1,5 (faixa aceitável 1,4–1,6) | Leitura contínua; ajuda pessoas com dislexia |
| 19–24px | ~1,35 | Títulos curtos de 1–2 linhas |
| 25–32px | ~1,25 | Títulos de seção |
| 33–48px | ~1,15 | Títulos de página |
| > 48px | ~1,1 | Display |
| Rótulo de botão, chip, tag (uma linha) | 1,2–1,4, ou altura do controle definida por `size.control-*` | O alinhamento vertical vem do contêiner, não da entrelinha |

Essa é exatamente a função `lineHeight()` de `tools/type-scale.mjs`.

- Use entrelinha **sem unidade** (`1.5`, não `24px`) para que ela acompanhe o tamanho.
- O texto precisa suportar que o usuário aumente entrelinha para 1,5×, espaçamento entre parágrafos para 2×, entre letras para 0,12em e entre palavras para 0,16em sem cortar conteúdo (1.4.12). Por isso: **nada de altura fixa em contêiner de texto**.

## Medida (comprimento de linha)

- Corpo: **45 a 75 caracteres por linha**; ~66 é o ponto ideal. Use `max-inline-size: var(--size-measure)` (68ch) em blocos de texto corrido.
- Mobile: 30–50 caracteres é aceitável por limite físico.
- Texto em colunas estreitas (cards, sidebars) pode ficar abaixo de 45, mas evite parágrafos longos nelas.
- Nunca deixe parágrafo ocupar a largura total de uma tela larga.

## Tamanhos mínimos

| Uso | Mínimo | Observação |
|---|---|---|
| Texto corrido | 16px | 17–18px melhora leitura em mobile e conteúdo longo |
| Inputs | 16px | Abaixo disso, alguns navegadores móveis aplicam zoom automático ao focar |
| Texto auxiliar, ajuda, tabela densa | 14px | Com contraste ≥ 4,5:1 |
| Legenda, metadado curto | 12px | Nunca para instrução, erro ou conteúdo essencial |
| Texto informativo | nunca < 12px | — |

## Pesos

- Repo: `font.weight.regular` (400), `medium` (500), `semibold` (600), `bold` (700).
- Corpo em 400. Ênfase em linha com 600. Títulos 600–700. Rótulos de botão 500–600.
- Não use peso abaixo de 400 em texto de interface; traço fino perde contraste efetivo, principalmente no tema escuro.
- Hierarquia se faz combinando tamanho, peso, cor (`color.text.primary` vs `secondary`) e espaço. Não dependa só de tamanho.

## Famílias

- Repo: `font.family.sans` (Inter com fallbacks de sistema) e `font.family.mono` (para código, dados tabulares e identificadores).
- Prefira famílias com x-height alta para tamanhos pequenos.
- Sempre declare fallback de sistema e use `font-display: swap` (ou `optional`) para não esconder texto enquanto a fonte carrega; ajuste métricas do fallback para evitar salto de layout.
- Números em tabela: use algarismos tabulares (`font-variant-numeric: tabular-nums`).

## Espaçamento entre letras

- Display e títulos grandes: levemente negativo (≈ −0,01 a −0,02em).
- Corpo: 0.
- Caixa-alta pequena (overline, tag): levemente positivo (≈ +0,02 a +0,06em).
- Evite caixa-alta em frases longas; evite itálico e texto justificado em blocos.

## Tipografia fluida com `clamp()`

Use para títulos e páginas de conteúdo; mantenha o corpo estável em 16px.

```bash
node tools/type-scale.mjs --base 16 --ratio minor-third --fluid \
  --max-ratio perfect-fourth --min-vw 360 --max-vw 1440 --format css
```

Saída (trecho real):

```css
--font-size-body: clamp(1rem, 1rem + 0vw, 1rem);
--font-size-h1: clamp(2.986rem, 2.1112rem + 3.8878vw, 5.6102rem);
```

Regras:

- O termo preferido **sempre** soma `rem` + `vw`. Só `vw` não responde ao zoom do navegador e viola 1.4.4.
- Mantenha `máximo ÷ mínimo ≤ 2,5` em cada passo; acima disso o zoom de 200% pode não dobrar o texto de fato.
- Mínimo do corpo ≥ 1rem; o tamanho mínimo de qualquer passo deve ser legível em 320px de largura.
- Entrelinha calculada pelo tamanho máximo do passo; reavalie em mobile se o título quebrar em muitas linhas.
- Teste: zoom 200% e largura de 320 CSS px sem rolagem horizontal (1.4.10).

## Acessibilidade tipográfica

- Contraste depende do tamanho: 4,5:1 normal; 3:1 apenas para ≥ 24px ou ≥ 18,66px em negrito.
- Nunca bloqueie zoom (`user-scalable=no`, `maximum-scale=1`).
- Um `<h1>` por página; sem pular níveis por estética.
- Texto em imagem só para logotipo.
- Truncar com reticências exige forma de ler o texto completo (tooltip acessível por teclado, expandir, ou página de detalhe).

## Anti-padrões

- Tamanhos soltos sem relação (13, 15, 17px).
- Estilos com nomes subjetivos ("Título especial", "texto menorzinho").
- Corpo em 14px "porque cabe mais".
- Entrelinha em px fixo.
- Botão com altura fixa que corta texto traduzido ou ampliado.
- Parágrafo em largura total de desktop.
- Título fluido só com `vw`.
- Mais de duas famílias ou pesos 300 em texto de interface.

## Checklist

- [ ] Base ≥ 16px e uma razão única, justificada pelo tipo de produto.
- [ ] Cada nível com tamanho, entrelinha (sem unidade) e peso.
- [ ] Corpo com entrelinha 1,4–1,6 e `max-inline-size` ≤ 75ch (`size.measure`).
- [ ] Nada abaixo de 12px; inputs ≥ 16px.
- [ ] Unidades em `rem`; fluido usa `rem + vw` e máximo/mínimo ≤ 2,5.
- [ ] Hierarquia de headings correta no HTML.
- [ ] Testado com zoom 200%, largura 320px e espaçamento de texto aumentado.
