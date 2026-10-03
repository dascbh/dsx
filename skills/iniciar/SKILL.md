---
name: iniciar
description: "Instala o DSX num projeto: detecta stack, tokens e componentes, cria ou avalia o DESIGN.md (como parece) e o UX.md (como se organiza e se comporta), conecta os dois ao contexto dos agentes (CLAUDE.md, AGENTS.md, Cursor, Copilot) e sugere gates. Use na primeira vez que o DSX roda num repositório."
---

# Iniciar o DSX num projeto

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `templates/`, `tools/`, `examples/`, `archetypes/` são relativos a ela.

## 1. Descobrir (sem perguntar o que o código responde)

Levante e anote:
- Framework de UI (React/Vue/Svelte/HTML), estilização (Tailwind v3/v4, CSS Modules, styled, MUI, CSS vars), presença de tema escuro.
- Onde estão: tokens/tema, componentes compartilhados, páginas/rotas, testes visuais/a11y.
- Arquivos de contexto de agente existentes: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `DESIGN.md`, `UX.md`.
- Telas e diálogos (rotas, componentes de página, diálogos) e se há mapa de fluxo (`.dsx/maps/flows-<module>.json`) e capturas das telas.
- Glossário implícito: 10–20 termos de domínio mais frequentes nas strings da UI.

Para projetos médios ou grandes, rode antes a skill `mapear` (estrutura, UI, fluxos, tarefas, jornada, domínio e design system real em `.dsx/maps/`) e, se houver dúvidas marcadas como `uncertain`, `confirmar-mapas`. Os passos abaixo passam a ler os mapas em vez de redescobrir.

## 2. Perguntar (uma rodada, só o que falta)

- Produto e público em uma frase; contexto de uso (dispositivo, frequência).
- Densidade desejada (compacta / média / arejada) e tom de voz.
- O que **nunca** pode acontecer na interface (ex.: "nunca esconder taxas", "nunca modal no checkout").
- O que é crítico errar na tarefa principal e termos de implementação que nunca aparecem na tela (vão para o `UX.md`).

## 3. DESIGN.md

- Não existe → skill `design-md` (Modo A se há UI, Modo B se é projeto novo). Ponto de partida: `templates/DESIGN.md`; referência de qualidade: `examples/DESIGN.md`.
- Existe → skill `design-md` Modo C (avaliar) e registre a nota.

## 4. UX.md

O `UX.md` é o par do `DESIGN.md`: diz que tipo de tela é cada uma, onde fica cada coisa e como ela se comporta. Tem o mesmo peso: sem ele, a skill `construir-ui` para.

- Não existe → skill `ux-md` (**Modo A** se há UI: mapas, capturas, cada tela classificada num arquétipo de `archetypes/`, políticas contadas no código; **Modo B** se é projeto novo). Ponto de partida: `templates/UX.md` (com `version: 1.0.0`, `format: alpha`); referência de qualidade: `examples/UX.md`.
- Existe → skill `ux-md` **Modo C** (avaliar) e registre a nota:
  ```bash
  node <DSX>/tools/lint-ux-md.mjs UX.md --score --map .dsx/maps/flows-<module>.json --screens <capturas>
  node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <module> --root .
  ```
- Projeto com vários módulos de vocabulário diferente: `content.glossary` por módulo (`{ default: …, <módulo>: … }`).
- Desvios já conhecidos (tela que difere do arquétipo de propósito) vão no bloco `deviations` com as regras que silenciam.

## 5. Tokens

- Projeto sem tokens semânticos → skill `tokens`. Mantenha o formato nativo da stack (ex.: CSS vars + `@theme` no Tailwind v4), aplicando as três camadas.
- Projeto com tokens → só verifique contraste dos pares essenciais.

## 6. Conectar aos agentes (fonte única, nunca duplicar)

O `DESIGN.md` e o `UX.md` são as fontes. Os demais arquivos **apontam** para eles. Adicione (ou crie) apenas o bloco abaixo, adaptando caminhos:

**`AGENTS.md`** (lido por vários agentes) e **`CLAUDE.md`** (no Claude Code, pode importar com `@AGENTS.md`, `@DESIGN.md` ou `@UX.md`):
```markdown
## Interface e design
- Antes de criar ou alterar UI, leia `DESIGN.md` (como parece) e `UX.md` (que tipo de tela, onde fica cada coisa, como se comporta), e os tokens em `<caminho-dos-tokens>`.
- Toda tela tem arquétipo na seção "Arquétipos de tela" do `UX.md`; tela nova sem arquétipo: proponha e registre antes de construir.
- Use só tokens semânticos e componentes de `<caminho-dos-componentes>`; justifique qualquer componente novo.
- Decisões de interação (modal, toast, validação, tabela…) seguem o `UX.md` e, no que ele não fixa, o catálogo de padrões do DSX.
- Toda tela implementa os estados de `states` do `UX.md` (carregando, vazio, erro, sem acesso, sucesso) e os do arquétipo.
- Mudou comportamento de UI (tela, arquétipo, ação, estado, fluxo): atualize o `UX.md` no mesmo commit, com `version` e `updated`.
- Antes de concluir: `node <DSX>/tools/lint-raw-values.mjs <pastas-alteradas>` sem ocorrências e `node <DSX>/tools/ux-lint/screen.mjs <captura> --ux UX.md` sem severidade ≥ 3.
```

**`.cursor/rules/design.mdc`** (só se o time usa Cursor) — veja `docs/integracoes.md`; use `globs` para aplicar apenas a arquivos de UI e referencie o `DESIGN.md` e o `UX.md` em vez de copiar regras.

**`.github/copilot-instructions.md`** (só se o time usa Copilot) — mesmo bloco, curto.

Não carregue contexto visual em tarefas que não são de UI (migrações, infra): por isso as regras de ferramenta usam `globs`.

## 7. Gates

Sugira ao usuário (não instale dependências sem pedir):
- CI: `node <DSX>/tools/build-tokens.mjs --check` (se usar tokens DTCG), `lint-raw-values` nas pastas de UI, `lint-design-md`, `lint-ux-md` e `ux-md-drift.mjs --fail-at 2` (UX.md em dia com o mapa e as capturas).
- Registro de achados de UX com trava: `node <DSX>/tools/ux-lint/findings.mjs check --module <m> …` (desvios do `UX.md` não contam).
- Regressão visual e axe com Playwright, se já houver Playwright.

## 8. Figma (opcional)

Se o time usa Figma, ofereça montar o ciclo depois da fundação: `figma-iniciar` → `figma-levar` (guia em `docs/fluxo-figma.md`). Requer o MCP oficial do Figma conectado.

## 9. Relatório

```
Stack: …   Tokens: <onde> (<camadas>)   Componentes: <onde> (N)
DESIGN.md: criado/avaliado — nota NN/100, gates ✔/✘
UX.md: criado/avaliado — version X.Y.Z, nota NN/100, gates ✔/✘, drift N achado(s), telas com arquétipo N/M
Contexto conectado em: AGENTS.md ✔ CLAUDE.md ✔ Cursor — Copilot — (DESIGN.md e UX.md)
Drift inicial: X/1000 linhas
Próximos passos recomendados (máx. 5): …
```
