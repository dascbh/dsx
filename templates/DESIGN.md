---
version: alpha
name: <Nome do produto>
description: <Tipo de produto, público, densidade. Ex.: "App financeiro mobile para MEI, densidade baixa, uso em trânsito.">
owner: <time ou pessoa responsável>
updated: <AAAA-MM-DD>
# Cores por PAPEL, nunca por aparência ("primary", não "blue").
# Para cada cor de fundo usada com texto, declare o par "on-<papel>": o linter verifica o contraste.
colors:
  canvas: "<#hex>"
  surface: "<#hex>"
  text-primary: "<#hex>"
  text-secondary: "<#hex>"
  border: "<#hex>"
  border-strong: "<#hex>"
  focus: "<#hex>"
  primary: "<#hex>"
  on-primary: "<#hex>"
  danger: "<#hex>"
  on-danger: "<#hex>"
typography:
  h1:
    fontFamily: <família>
    fontSize: <px>
    fontWeight: <peso>
    lineHeight: <número>
  body:
    fontFamily: <família>
    fontSize: <px>
    fontWeight: <peso>
    lineHeight: <número>
  label:
    fontFamily: <família>
    fontSize: <px>
    fontWeight: <peso>
    lineHeight: <número>
spacing:
  "1": 4px
  "2": 8px
  "4": 16px
  "6": 24px
  "8": 32px
rounded:
  sm: <px>
  md: <px>
components:
  # Componentes referenciam tokens com {grupo.chave}; não repita valores crus.
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
---

# <Nome do produto>

<!-- Diga de onde vêm os valores (tokens, código, Figma) e qual fonte vence em caso de conflito. -->

## Overview

<!-- Direção visual em critérios OBSERVÁVEIS, não adjetivos. Troque "moderno e clean" por
"no máximo uma cor de destaque por viewport; hierarquia por tipografia e espaço; sem sombras em cards".
Inclua: tipo de uso (tarefa x vitrine), densidade, personalidade, o que a interface NUNCA faz. -->

## Colors

<!-- Tabela: Papel | Token | Onde aparece | Onde NUNCA aparece.
Regras de contraste (≥ 4.5:1 texto, ≥ 3:1 UI não textual), regra de "cor nunca é o único sinal",
comportamento no tema escuro. -->

## Typography

<!-- Regras de HIERARQUIA (h1 é título único da página…), não só lista de tamanhos.
Escala e razão, tamanho mínimo, pesos permitidos, largura máxima de linha. -->

## Layout

<!-- Grade de espaçamento, ritmo vertical (entre rótulo/campo, campos, grupos, seções), containers,
breakpoints, comportamento mobile, posição das ações primárias. -->

## Elevation & Depth

<!-- Como camadas são comunicadas (superfície, borda, sombra) e limite de empilhamento. -->

## Shapes

<!-- Raios por tipo de elemento, linguagem de ícones. -->

## Components

<!-- Para cada componente central: quando usar, variantes, TODOS os estados
(padrão, hover, foco, ativo, desabilitado, carregando, erro, vazio, sucesso), contraindicações. -->

## Do's and Don'ts

<!-- Derive de erros REAIS observados em gerações anteriores, não de platitudes. Mínimo 3 de cada. -->

**Faça**

- <regra>

**Não faça**

- <regra>

## Accessibility

<!-- Meta WCAG, foco, alvo de toque, movimento reduzido, zoom/reflow, texto alternativo. Tudo verificável. -->

## Agent Instructions

<!-- QUANDO consultar este arquivo, O QUE preservar, COMO validar (comandos, checklist). -->
