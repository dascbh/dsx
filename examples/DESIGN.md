---
version: alpha
name: DSX Base
description: Tema padrão do framework DSX. Interface de produto (SaaS/B2B), densidade média, foco em leitura e tarefa.
owner: time-de-design-system
updated: 2026-10-01
colors:
  canvas: "#ffffff"
  surface: "#f4f7fc"
  text-primary: "#1f2226"
  text-secondary: "#4f5a6b"
  text-muted: "#627187"
  link: "#4646b9"
  border: "#d2dae4"
  border-strong: "#7a8aa2"
  focus: "#5754ed"
  primary: "#5754ed"
  primary-hover: "#4646b9"
  on-primary: "#ffffff"
  secondary: "#e7ecf3"
  on-secondary: "#1f2226"
  danger: "#ce1d1f"
  on-danger: "#ffffff"
  success-bg: "#e9fdec"
  on-success-bg: "#105325"
  danger-bg: "#fef4f3"
  on-danger-bg: "#7b201b"
  warning-bg: "#fff5ed"
  on-warning-bg: "#683601"
  info-bg: "#f0f8fe"
  on-info-bg: "#12496d"
  ai-surface: "#f5f6fe"
  ai-accent: "#5754ed"
typography:
  display:
    fontFamily: Inter
    fontSize: 49px
    fontWeight: 700
    lineHeight: 1.1
  h1:
    fontFamily: Inter
    fontSize: 31px
    fontWeight: 600
    lineHeight: 1.25
  h2:
    fontFamily: Inter
    fontSize: 25px
    fontWeight: 600
    lineHeight: 1.25
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "6": 24px
  "8": 32px
  "12": 48px
  "16": 64px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.2} {spacing.4}"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.2} {spacing.4}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
    rounded: "{rounded.md}"
    height: 40px
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.2} {spacing.3}"
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  ai-response:
    backgroundColor: "{colors.ai-surface}"
    borderColor: "{colors.ai-accent}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
---

# DSX Base

Fonte de tokens: `tokens/*.tokens.json` (compilados em `tokens/build/tokens.css`). Este arquivo é a tradução legível dessas decisões. Se houver divergência, **os tokens vencem** e este arquivo deve ser corrigido.

## Overview

Interface de trabalho, não de vitrine. A pessoa usuária chega para concluir uma tarefa e sair. Por isso:

- **Calma visual:** superfícies neutras, no máximo **uma** cor de destaque competindo por atenção em cada viewport (a cor primária).
- **Hierarquia pela tipografia e pelo espaço**, não por cor nem por caixas. Bordas e sombras são o último recurso.
- **Densidade média:** controles de 40px, espaçamento em grade de 4px, texto corrido limitado a 68 caracteres por linha.
- **Previsibilidade acima de surpresa:** a mesma ação tem sempre a mesma aparência e a mesma posição.

Personalidade em critérios observáveis: sóbria (sem gradientes, sem ilustrações decorativas em telas de tarefa), direta (rótulos com verbo), confiável (todo estado do sistema tem representação visível).

## Colors

| Papel | Token | Onde aparece | Onde NUNCA aparece |
|---|---|---|---|
| Primária | `primary` | Ação principal da tela (1 por região), estado selecionado, anel de foco | Texto corrido, fundos grandes, ícones decorativos |
| Secundária | `secondary` | Ações alternativas ao lado da primária | Como única ação de um formulário |
| Perigo | `danger` | Ações destrutivas confirmadas e mensagens de erro | Para "chamar atenção" em algo que não é erro ou destruição |
| Canvas / Surface | `canvas`, `surface` | Fundo da página / cards e painéis | — |
| Texto | `text-primary`, `text-secondary`, `text-muted` | Conteúdo, apoio, metadados | `text-muted` em texto essencial para concluir a tarefa |
| Feedback | `*-bg` + `on-*-bg` | Alertas e mensagens inline de sucesso, erro, atenção e informação | Decoração |
| IA | `ai-surface`, `ai-accent` | Exclusivamente para marcar conteúdo gerado por IA | Qualquer outro conteúdo |

Regras:

- Todo par texto/fundo listado acima tem contraste **≥ 4.5:1**; bordas de campo, foco e ícones informativos têm **≥ 3:1**. Os pares são verificados por `node tools/build-tokens.mjs`.
- **Cor nunca é o único sinal.** Erro = cor + ícone + texto; selecionado = cor + peso/forma/marcador.
- No tema escuro a primária vira um tom claro com texto escuro (`on-primary` escuro). Não inverta cores à mão: use os tokens semânticos, que já têm valor por tema.

## Typography

- Família única (Inter, com fallback de sistema) para toda a interface; monoespaçada só para código e identificadores.
- Escala modular de razão **1.25** com base 16px.
- **`h1` é o título único da página.** `h2` agrupa seções; `h3` agrupa blocos dentro de uma seção. Não pule níveis.
- `display` só em telas de boas-vindas ou estados vazios de primeiro uso — nunca em telas de tarefa.
- `body` (16px/1.5) para todo texto de leitura. Nunca menor que 14px para conteúdo; 12px só para legendas não essenciais.
- Peso 600 para títulos e 500 para rótulos. Não use 700 fora de `display`.
- Largura máxima de texto corrido: **68ch**.

## Layout

- Grade de espaçamento de **4px**. Use apenas os passos de `spacing` — nada de 5px, 10px, 15px.
- Ritmo vertical: 8px entre rótulo e campo, 16px entre campos, 32px entre grupos, 64px entre seções.
- Containers: largura máxima de 1200px para páginas de conteúdo; tabelas e dashboards podem usar largura total.
- Breakpoints: 640 / 768 / 1024 / 1280px. Abaixo de 640px, layout de uma coluna e ações primárias ocupando a largura total.
- Formulários em coluna única. Campos relacionados curtos (CEP + número) podem dividir a linha.
- Ação primária à direita no rodapé de diálogos e formulários desktop; no mobile, empilhada com a primária no topo.

## Elevation & Depth

Profundidade é comunicada por **contraste de superfície** primeiro, borda em segundo, sombra em terceiro.

| Nível | Uso | Tratamento |
|---|---|---|
| 0 | Página | `canvas`, sem borda |
| 1 | Cards, painéis | `surface` + borda `border` |
| 2 | Dropdowns, popovers, tooltips | `canvas` + sombra `md` |
| 3 | Modais e diálogos | `canvas` + sombra `lg` + scrim `overlay` |

Nunca empilhe mais de dois níveis visíveis ao mesmo tempo (ex.: modal sobre modal é proibido).

## Shapes

- Raio `md` (8px) para controles (botões, campos, chips); `lg` (12px) para containers (cards, modais); `full` para avatares e badges.
- Não misture raios diferentes em elementos do mesmo nível.
- Ícones em traço de 1.5–2px, tamanho 16px em linha com texto e 20px isolados.

## Components

Todo componente interativo implementa **todos** os estados: padrão, hover, foco visível, ativo, desabilitado, carregando e — quando recebe dados — erro, vazio e sucesso.

- **Botão:** altura 40px (alvo de toque ≥ 44px no mobile via área clicável). Rótulo = verbo + objeto ("Salvar alterações"). Em envio: desabilita, mostra spinner no próprio botão e mantém a largura. Uma única primária por região.
- **Campo de texto:** rótulo visível acima (nunca só placeholder); texto de ajuda abaixo; erro abaixo do campo, com ícone e texto, ligado por `aria-describedby`. Validar ao sair do campo ou ao enviar — nunca a cada tecla.
- **Card:** um assunto por card; título `h3`; no máximo uma ação primária.
- **Tabela:** preferir a cards quando a pessoa compara atributos; cabeçalho fixo, ordenação indicada por ícone + `aria-sort`.
- **Modal:** só para decisões que bloqueiam o fluxo. Fecha com Esc, botão visível e clique no scrim (exceto se houver dados não salvos). Foco preso dentro e devolvido ao gatilho.
- **Toast:** só para confirmação de ações não críticas; 6s por padrão (4–10s conforme o tamanho do texto), pausável no hover/foco, anunciado por `role="status"`. Se tiver ação (ex.: "Desfazer"), fica até ser usado ou dispensado. Erros nunca vão para toast.
- **Resposta de IA:** sempre em `ai-response`, com rótulo "Gerado por IA", fontes quando houver e ações de editar/refazer/descartar.

## Do's and Don'ts

**Faça**

- Use apenas tokens semânticos (`var(--color-text-primary)`), nunca primitivos nem valores crus.
- Projete os estados vazio, carregando e erro antes do estado ideal.
- Escreva rótulos de botão com verbo e objeto.
- Mantenha a ação primária no mesmo lugar em todas as telas do mesmo tipo.
- Peça confirmação específica (ação + objeto + consequência) só para ações destrutivas ou irreversíveis; para o resto, ofereça desfazer.

**Não faça**

- Não crie variante nova de componente sem registrar o motivo neste arquivo.
- Não use cor para decorar; cor carrega significado.
- Não use placeholder como rótulo.
- Não desabilite o botão de envio para "impedir erro" — deixe enviar e explique o que falta.
- Não use modal para conteúdo longo, formulários extensos ou mensagens de sucesso.
- Não abra links em nova aba sem avisar.

## Accessibility

- Meta: **WCAG 2.2 nível AA** em todas as telas.
- Foco visível com anel de 2px em `focus`, contraste ≥ 3:1, nunca removido (`outline: none` sem substituto é proibido).
- Alvo de toque mínimo 24×24px (piso) e 44×44px (padrão do sistema).
- Respeite `prefers-reduced-motion`: transições acima de 200ms viram fade simples ou nada.
- Zoom de 200% e largura de 320px sem perda de conteúdo nem rolagem horizontal.
- Toda imagem informativa tem `alt`; ícones sem texto têm nome acessível.

## Agent Instructions

1. Leia este arquivo e `tokens/build/tokens.css` antes de qualquer mudança de interface.
2. Reutilize componentes existentes. Se nenhum servir, explique por que antes de criar um novo.
3. Consulte `patterns/` para decisões de interação (modal ou não, toast ou inline, etc.).
4. Entregue a lista de tokens e componentes usados e os estados implementados.
5. Rode `node tools/lint-raw-values.mjs <pasta-alterada>` e corrija toda ocorrência antes de concluir.
