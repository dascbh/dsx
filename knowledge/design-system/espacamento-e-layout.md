# Espaçamento e layout

## Quando consultar

- Ao definir padding, margem ou gap de qualquer componente ou tela.
- Ao montar grid de página, breakpoints ou comportamento responsivo.
- Ao criar um modo de densidade (compacto/confortável) ou adaptar uma tabela densa.
- Ao migrar espaçamentos legados para a escala.

## Regras

1. **Todo espaço vem da escala.** Nenhum `13px`, `18px` ou `25px` em código de UI. O linter (`tools/lint-raw-values.mjs`) sinaliza qualquer px ≥ 2 fora de token.
2. **Prefira o token semântico** (`space.inset-*`, `space.stack-*`, `space.inline-*`, `space.section`) ao primitivo (`space.<n>`). O semântico carrega a intenção e é o que muda num modo de densidade.
3. **Espaço entre irmãos é responsabilidade do pai** (`gap` ou seletor de pilha), não de `margin` no filho. Componentes não têm margem externa própria.
4. **Proximidade comunica relação.** Itens relacionados ficam mais próximos entre si do que de itens não relacionados. Espaço interno ≤ espaço externo.
5. **Tamanho de controle e alvo de toque também são escala**: `size.control-*` e `size.touch-target`.
6. **Componentes crescem com o conteúdo.** Evite largura/altura fixas em contêiner de texto.

## A grade de 4/8

- O repo usa **unidade de 4px** com nomes por multiplicador: `space.4` = 4 × 4 = 16px.
- Na prática, use majoritariamente múltiplos de 8 (`space.2`, `space.4`, `space.6`, `space.8` …) e reserve os passos de 4 (`space.1`, `space.3`, `space.5`) para ajustes finos de componentes compactos: ícone + rótulo, chip, célula de tabela, badge.
- Os meios-passos `space.0_5` (2px) e `space.1_5` (6px) existem para óptica fina (ex.: deslocamento de ícone, padding de badge). Não use para layout.

| Token | px | rem | Uso típico |
|---|---|---|---|
| `space.0` | 0 | 0 | Reset |
| `space.0_5` | 2 | 0,125 | Ajuste óptico |
| `space.1` | 4 | 0,25 | Ícone ↔ texto em chip, padding de badge |
| `space.1_5` | 6 | 0,375 | Ajuste fino em controle compacto |
| `space.2` | 8 | 0,5 | Label ↔ campo, itens de lista compacta |
| `space.3` | 12 | 0,75 | Gap entre ícone e rótulo de botão, padding compacto |
| `space.4` | 16 | 1 | Padding padrão de card, gap entre campos |
| `space.5` | 20 | 1,25 | Raro; padding horizontal de controle grande |
| `space.6` | 24 | 1,5 | Padding de card espaçoso, gutter |
| `space.8` | 32 | 2 | Entre grupos de conteúdo |
| `space.10` | 40 | 2,5 | Entre blocos |
| `space.12` | 48 | 3 | Entre blocos grandes |
| `space.16` | 64 | 4 | Entre seções de página |
| `space.20` / `24` / `32` | 80 / 96 / 128 | 5 / 6 / 8 | Seções de marketing, heróis |

Gerar a escala (para outro projeto ou base 8):

```bash
node tools/spacing-scale.mjs --base 4 --format css    # --space-4: 1rem; /* 16px */
node tools/spacing-scale.mjs --base 8 --format dtcg   # bloco para primitives.tokens.json
```

Os multiplicadores são fixos (0, 0,5, 1, 1,5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32): densos no início, esparsos no fim, porque a diferença entre 4 e 8px importa dentro de um botão, e a diferença entre 120 e 128px não importa entre seções. Mantenha a escala usada em produção enxuta; 6 a 10 valores cobrem quase tudo.

## Semântica: inset, stack, inline, section

| Token semântico | Aponta para | Significado |
|---|---|---|
| `space.inset-xs` | `space.1` (4px) | Padding interno mínimo: badge, tag |
| `space.inset-sm` | `space.2` (8px) | Padding de controle compacto, célula densa |
| `space.inset-md` | `space.4` (16px) | Padding padrão de card, painel, modal |
| `space.inset-lg` | `space.6` (24px) | Padding de área de conteúdo espaçosa |
| `space.stack-sm` | `space.2` (8px) | Vertical entre label e campo, título e subtítulo |
| `space.stack-md` | `space.4` (16px) | Vertical entre campos, itens de uma lista com respiro |
| `space.stack-lg` | `space.8` (32px) | Vertical entre grupos (fieldsets, blocos de card) |
| `space.section` | `space.16` (64px) | Vertical entre seções de página |
| `space.inline-sm` | `space.2` (8px) | Horizontal entre ícone e texto, chips lado a lado |
| `space.inline-md` | `space.3` (12px) | Horizontal entre botões de um grupo |

- **Inset** = espaço dentro de uma caixa, em todos os lados (pode ser assimétrico: horizontal maior que vertical em botões).
- **Stack** = espaço vertical entre irmãos empilhados.
- **Inline** = espaço horizontal entre irmãos lado a lado.
- **Section** = separação de alto nível na página.

```css
.form { display: grid; gap: var(--space-stack-md); }
.field { display: grid; gap: var(--space-stack-sm); }
.actions { display: flex; gap: var(--space-inline-md); margin-block-start: var(--space-stack-lg); }
.panel { padding: var(--space-inset-md); border-radius: var(--radius-card); }
```

SE → ENTÃO:

- **SE** dois elementos pertencem ao mesmo item (label + campo, título + meta) **ENTÃO** `stack-sm`.
- **SE** são itens irmãos de mesmo nível (campos de um formulário) **ENTÃO** `stack-md`.
- **SE** são grupos diferentes **ENTÃO** `stack-lg`; **SE** são seções da página **ENTÃO** `section`.
- **SE** precisa de um valor que nenhum semântico cobre **ENTÃO** use o primitivo e avalie se o caso merece um novo semântico (repete em 3+ lugares? então sim).

## Tamanhos de controle e alvo

| Token | Valor | Uso |
|---|---|---|
| `size.control-sm` | 32px | Controles em tabela ou barra densa, apenas com ponteiro fino |
| `size.control-md` | 40px | Padrão de botões, inputs, selects |
| `size.control-lg` | 48px | Mobile, ações principais, formulários de uso público |
| `size.touch-target` | 44px | Área tocável mínima do sistema |
| `size.focus-ring` | 2px | Espessura do anel de foco |
| `size.measure` | 68ch | Largura máxima de texto corrido |

Alvo de ponteiro: WCAG 2.5.8 (AA) exige **24 × 24 CSS px** ou espaçamento equivalente; o padrão do sistema é **44px**. Um controle visual de 32px pode ter área de toque de 44px via padding ou pseudo-elemento. Detalhes em `acessibilidade.md`.

## Densidade

Densidade é um **modo** que remapeia os semânticos, não um conjunto paralelo de componentes.

| Semântico | Compacto | Confortável (padrão do repo) | Espaçoso |
|---|---|---|---|
| `space.inset-md` | `space.3` (12px) | `space.4` (16px) | `space.6` (24px) |
| `space.stack-md` | `space.3` (12px) | `space.4` (16px) | `space.6` (24px) |
| `size.control-md` | 32px | 40px | 48px |

(Os modos compacto e espaçoso são uma proposta: não existem como arquivos no repo. Implementar = novo arquivo semântico com as mesmas chaves e um seletor como `[data-density="compact"]`.)

SE → ENTÃO:

- **SE** a tela é de dados (tabelas, logs, painéis de operação) usados por especialistas com mouse **ENTÃO** compacto é aceitável.
- **SE** o público é amplo, o uso é em mobile ou toque **ENTÃO** confortável ou espaçoso; nunca compacto por padrão.
- **SE** oferecer compacto **ENTÃO** mantenha `size.touch-target` e o piso de 24px; densidade reduz respiro, não área de alvo.
- **SE** compacto deixaria o corpo abaixo de 14px **ENTÃO** não reduza a tipografia; reduza só espaço.

## Grid de página

| Faixa de largura | Colunas | Gutter | Margem lateral |
|---|---|---|---|
| Pequena (celular) | 4 | `space.4` (16px) | `space.4` (16px) |
| Média (tablet, janela estreita) | 8 | `space.6` (24px) | `space.6` (24px) |
| Grande (desktop) | 12 | `space.6` (24px) | `space.8`+ ou centralizado com largura máxima |

- Gutters e margens vêm da escala de espaço.
- Defina uma **largura máxima de conteúdo** para telas largas; texto corrido continua limitado por `size.measure` mesmo dentro dela.
- Use CSS Grid para estrutura de página e Flexbox para alinhar itens em uma dimensão.

## Breakpoints

- **Guiados pelo conteúdo, não por modelos de aparelho.** Coloque um breakpoint onde o layout quebra: a navegação deixa de caber, a tabela perde legibilidade, o formulário fica largo demais.
- Mobile primeiro: escreva o estilo base para a menor largura e adicione regras com `min-width`.
- Pontos de partida comuns (ajuste ao conteúdo): ~600px, ~900px, ~1200px. O repo ainda não tem tokens de breakpoint; se criar, nomeie por função (`breakpoint.nav-collapse`) ou tamanho (`breakpoint.md`), nunca por aparelho (`breakpoint.ipad`).
- **Container queries** para componentes que vivem em larguras diferentes (card na sidebar vs na área principal): o componente reage ao espaço que tem, não à tela.

## Regras responsivas

1. Funciona em **320 CSS px** de largura sem rolagem horizontal (1.4.10), exceto conteúdo que exige 2D (tabela de dados, mapa).
2. **Ordem visual = ordem do DOM = ordem de foco.** Não reordene com `order` ou grid-area de forma que o Tab salte.
3. Tabelas largas: rolagem horizontal **dentro** do contêiner da tabela, com cabeçalho preservado, ou transformação em lista que mantém a associação rótulo-valor.
4. Navegação: lateral fixa no desktop pode virar barra inferior ou menu no mobile; documente a regra no handoff.
5. Imagens com dimensões declaradas (`width`/`height` ou `aspect-ratio`) para não deslocar o layout; `srcset`/`sizes` para resolução.
6. Elementos fixos (header, barra de ação) não podem cobrir o elemento focado (2.4.11); reserve `scroll-padding` equivalente à altura deles.
7. Teste com teclado virtual aberto em mobile: o campo focado e o botão de envio devem continuar visíveis.

## Raio e elevação (relacionados ao layout)

- Raio: `radius.control` (8px) para controles, `radius.card` (12px) para cards e painéis, `radius.pill` para chips e badges. Elementos aninhados usam raio interno ≤ raio externo menos o padding.
- Elevação: `shadow.sm|md|lg` no tema claro; no escuro, prefira distinguir camadas por `color.bg.*` (ver `cor.md`).

## Migração de legado

1. Liste todos os valores de espaço em uso (o linter ajuda: `node tools/lint-raw-values.mjs src --json`).
2. Agrupe valores próximos (14/15/16 → 16).
3. Mapeie cada grupo para um token da escala.
4. Substitua primeiro nos componentes mais usados; depois nas telas.
5. Acompanhe o drift a cada rodada; não troque tudo de uma vez.

## Anti-padrões

- Valores ímpares ou fora da escala (7, 13, 18px).
- `margin` no componente para compensar ausência de `gap` no pai.
- Altura fixa em card ou botão que contém texto.
- Semânticos com nomes vagos ("médio") sem definição.
- Compacto que reduz área de toque.
- Breakpoint com nome de aparelho.
- Reordenar visualmente sem reordenar o DOM.

## Checklist

- [ ] Nenhum px fora da escala no código (`lint-raw-values` limpo).
- [ ] Padding por `space.inset-*`; distâncias verticais por `space.stack-*`; horizontais por `space.inline-*`.
- [ ] Espaço entre irmãos via `gap` do pai.
- [ ] Controles com `size.control-*`; área de toque ≥ 24px, padrão 44px.
- [ ] Grid 4/8/12 com gutters da escala e largura máxima definida.
- [ ] Breakpoints pelo conteúdo; container queries onde o componente muda de contexto.
- [ ] Funciona em 320px, com zoom 200%, e a ordem de foco segue a ordem visual.
