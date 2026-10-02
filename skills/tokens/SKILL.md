---
name: tokens
description: "Cria e corrige design tokens DTCG em 3 camadas: paleta OKLCH, escalas tipográfica e de espaçamento, temas claro/escuro e contraste verificado no build. Use ao montar a fundação, trocar a marca, adicionar dark mode ou achar valores crus."
---

# Design tokens

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `tokens/`, `tools/` são relativos a ela.

Referências: `knowledge/design-system/tokens.md`, `cor.md`, `tipografia.md`, `espacamento-e-layout.md`.

## Arquitetura obrigatória

| Camada | Arquivo (no DSX) | Nomeia | Quem consome |
|---|---|---|---|
| 1. Primitivos | `tokens/primitives.tokens.json` | o **valor** (`color.brand.600`, `space.4`) | só a camada 2 |
| 2. Semânticos | `tokens/semantic.light.tokens.json`, `semantic.dark.tokens.json` | a **intenção** (`color.text.primary`, `color.action.danger`, `space.stack-md`) | componentes e telas |
| 3. Componente (opcional) | `tokens/component.tokens.json` | a **peça** (`button.primary.bg`) | um componente |

Regras:
- Componentes **nunca** consomem primitivos. Telas **nunca** consomem valores crus.
- Temas são arquivos semânticos com **as mesmas chaves**; só os valores mudam. O build falha se o tema escuro tiver chave que o claro não tem.
- Todo par texto/fundo e UI/fundo que existe na interface está declarado em `tokens/contrast-pairs.json` com o mínimo exigido (4.5 texto, 3 UI não textual).

Se o projeto do usuário usa outro sistema (Tailwind, MUI, CSS vars soltas), **mantenha o formato dele** e aplique as mesmas três camadas e regras; use as ferramentas do DSX só para gerar e verificar valores.

## Receitas

**Nova cor de marca / rampa de cor**
```bash
node tools/palette.mjs "#3d5afe" --name brand            # JSON com contraste de cada passo
node tools/palette.mjs "#3d5afe" --name brand --format dtcg
```
- Rampa 50–950 em OKLCH (passos perceptualmente uniformes). Na prática, com texto branco o passo **600** costuma ser o primeiro ≥ 4.5:1 — confirme na saída.
- Ação primária no tema claro: o primeiro passo com `contrasteBranco ≥ 4.5`. Texto de link: um passo mais escuro que a ação.
- Tema escuro: **não inverta a rampa**. Use passos claros (200–300) para ação com texto escuro, e superfícies 900–950.

**Escala tipográfica**
```bash
node tools/type-scale.mjs --base 16 --ratio major-third --format css
node tools/type-scale.mjs --base 16 --ratio minor-third --fluid --max-ratio perfect-fourth --format css
```
Razão: 1.125–1.2 para produto denso; 1.25 para produto geral; 1.333+ para editorial/marketing. Corpo nunca < 16px em leitura; mínimo absoluto 12px para legendas.

**Escala de espaçamento**
```bash
node tools/spacing-scale.mjs --base 4 --format dtcg
```

**Compilar e verificar**
```bash
node tools/build-tokens.mjs           # gera tokens/build/tokens.css (+ JSON resolvido por tema) e checa contraste
node tools/build-tokens.mjs --check   # só verifica (CI)
node tools/contrast.mjs "#4f5a6b" "#ffffff"
```

**Tokens de um projeto (não do DSX)**
```bash
node tools/build-tokens.mjs --tokens <projeto>/tokens          # gera <projeto>/tokens/build/ e verifica contraste
```

**Ponte com o Figma**
```bash
node tools/figma/tokens-para-figma.mjs --tokens <pasta> --script > /tmp/vars.js   # colar em use_figma (skill figma-fundacoes)
node tools/figma/figma-para-tokens.mjs --snapshot <snapshot-full.json> --tokens <pasta> [--write]
```
A volta (`--write`) só altera tokens existentes e roda o gate de contraste; variável nova no Figma é decisão desta skill, nunca criação automática.

## Fluxo para alterar tokens

1. Mude o **primitivo** se o valor muda em todo lugar; mude o **semântico** se a intenção passa a apontar para outro valor.
2. Ao criar semântico novo: nome = `<categoria>.<papel>[-<variante>][-<estado>]` (ex.: `color.action.primary-hover`). Adicione `$description` dizendo onde usar.
3. Adicione o par em `contrast-pairs.json` se for cor de texto/UI.
4. Rode o build. **Falha de contraste bloqueia** — ajuste o passo da rampa, não o mínimo.
5. Rode `node tools/lint-raw-values.mjs <src>` no projeto para achar valores crus que agora têm token.
6. Atualize o front matter e a seção Colors do `DESIGN.md` (skill `design-md`).

## Saída

```
Tokens criados/alterados: <lista com camada>
Pares de contraste: N verificados, todos ≥ mínimo (pior: <par> = X:1)
Arquivos gerados: …
Impacto: <componentes/telas afetados>
```
