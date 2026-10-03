---
name: iniciar
description: "Instala o DSX num projeto: detecta stack, tokens e componentes, cria ou avalia o DESIGN.md, conecta o contexto aos agentes (CLAUDE.md, AGENTS.md, Cursor, Copilot) e sugere gates. Use na primeira vez que o DSX roda num repositório."
---

# Iniciar o DSX num projeto

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `templates/`, `tools/`, `examples/` são relativos a ela.

## 1. Descobrir (sem perguntar o que o código responde)

Levante e anote:
- Framework de UI (React/Vue/Svelte/HTML), estilização (Tailwind v3/v4, CSS Modules, styled, MUI, CSS vars), presença de tema escuro.
- Onde estão: tokens/tema, componentes compartilhados, páginas/rotas, testes visuais/a11y.
- Arquivos de contexto de agente existentes: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `DESIGN.md`.
- Glossário implícito: 10–20 termos de domínio mais frequentes nas strings da UI.

Para projetos médios ou grandes, rode antes a skill `mapear` (estrutura, UI, fluxos, tarefas, jornada, domínio e design system real em `.dsx/maps/`) e, se houver dúvidas marcadas como `uncertain`, `confirmar-mapas`. Os passos abaixo passam a ler os mapas em vez de redescobrir.

## 2. Perguntar (uma rodada, só o que falta)

- Produto e público em uma frase; contexto de uso (dispositivo, frequência).
- Densidade desejada (compacta / média / arejada) e tom de voz.
- O que **nunca** pode acontecer na interface (ex.: "nunca esconder taxas", "nunca modal no checkout").

## 3. DESIGN.md

- Não existe → skill `design-md` (Modo A se há UI, Modo B se é projeto novo). Ponto de partida: `templates/DESIGN.md`; referência de qualidade: `examples/DESIGN.md`.
- Existe → skill `design-md` Modo C (avaliar) e registre a nota.

## 4. Tokens

- Projeto sem tokens semânticos → skill `tokens`. Mantenha o formato nativo da stack (ex.: CSS vars + `@theme` no Tailwind v4), aplicando as três camadas.
- Projeto com tokens → só verifique contraste dos pares essenciais.

## 5. Conectar aos agentes (fonte única, nunca duplicar)

O DESIGN.md é a única fonte. Os demais arquivos **apontam** para ele. Adicione (ou crie) apenas o bloco abaixo, adaptando caminhos:

**`AGENTS.md`** (lido por vários agentes) e **`CLAUDE.md`** (no Claude Code, pode importar com `@AGENTS.md` ou `@DESIGN.md`):
```markdown
## Interface e design
- Antes de criar ou alterar qualquer UI, leia `DESIGN.md` e os tokens em `<caminho-dos-tokens>`.
- Use só tokens semânticos e componentes de `<caminho-dos-componentes>`; justifique qualquer componente novo.
- Decisões de interação (modal, toast, validação, tabela…) seguem o catálogo de padrões do DSX.
- Toda tela implementa estados de carregando, vazio, erro e sucesso.
- Antes de concluir: `node <DSX>/tools/lint-raw-values.mjs <pastas-alteradas>` sem ocorrências.
```

**`.cursor/rules/design.mdc`** (só se o time usa Cursor) — veja `docs/integracoes.md`; use `globs` para aplicar apenas a arquivos de UI e referencie o DESIGN.md em vez de copiar regras.

**`.github/copilot-instructions.md`** (só se o time usa Copilot) — mesmo bloco, curto.

Não carregue contexto visual em tarefas que não são de UI (migrações, infra): por isso as regras de ferramenta usam `globs`.

## 6. Gates

Sugira ao usuário (não instale dependências sem pedir):
- CI: `node <DSX>/tools/build-tokens.mjs --check` (se usar tokens DTCG), `lint-raw-values` nas pastas de UI, `lint-design-md`.
- Regressão visual e axe com Playwright, se já houver Playwright.

## 7. Figma (opcional)

Se o time usa Figma, ofereça montar o ciclo depois da fundação: `figma-iniciar` → `figma-levar` (guia em `docs/fluxo-figma.md`). Requer o MCP oficial do Figma conectado.

## 8. Relatório

```
Stack: …   Tokens: <onde> (<camadas>)   Componentes: <onde> (N)
DESIGN.md: criado/avaliado — nota NN/100, gates ✔/✘
Contexto conectado em: AGENTS.md ✔ CLAUDE.md ✔ Cursor — Copilot —
Drift inicial: X/1000 linhas
Próximos passos recomendados (máx. 5): …
```
