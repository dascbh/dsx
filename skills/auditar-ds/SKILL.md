---
name: auditar-ds
description: Audita a saúde de um design system existente em código — inventário de tokens e componentes, drift (valores crus e componentes fora do kit, por 1000 linhas), duplicação ("quase iguais"), cobertura de estados e acessibilidade por componente, paridade claro/escuro, documentação e governança — e atribui nível de maturidade com plano de correção priorizado. Use quando a UI estiver inconsistente entre telas, antes de um redesign, ao herdar um projeto, ou periodicamente para medir a evolução do sistema.
---

# Auditoria de design system

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `tools/`, `templates/` são relativos a ela.

Referências: `knowledge/design-system/governanca-e-maturidade.md`, `componentes.md`, `tokens.md`, `acessibilidade.md`.

## 1. Inventário (medido, não estimado)

Para bases grandes, delegue ao subagente `extrator-design-system`. Colete:

- **Tokens:** onde estão definidos, quantos por categoria, se há camada semântica, se há tema escuro.
- **Drift:**
  ```bash
  node tools/lint-raw-values.mjs src --json > drift.json   # ocorrências e driftPorMilLinhas
  ```
  Liste as 10 cores cruas mais frequentes e o token que deveria substituí-las.
- **Componentes:** lista do kit compartilhado; para cada um, nº de usos (grep de import) e nº de implementações paralelas (ex.: 3 botões diferentes).
- **Estados:** matriz componente × estado (padrão, hover, foco visível, ativo, desabilitado, carregando, erro, vazio). Marque ✔/✘/n.a.
- **Acessibilidade por componente:** nome acessível, teclado, contraste — amostra mínima: botão, campo, select, modal, abas, tabela, toast.
- **Documentação:** existe DESIGN.md? Storybook/catálogo? Documentação diz quando usar e quando não usar?
- **Governança:** dono, versionamento, processo de contribuição, changelog.

## 2. Diagnóstico

Classifique cada problema:

| Tipo | Exemplo | Severidade |
|---|---|---|
| Fundação | sem camada semântica; contraste falhando em par essencial | alta |
| Drift | 40 cores cruas; 3 escalas de espaçamento concorrentes | alta se > 5/1000 linhas |
| Duplicação | `Button`, `Btn`, `PrimaryButton` | média |
| Estados ausentes | campo sem estado de erro, lista sem vazio | alta em fluxo crítico |
| Acessibilidade | modal sem foco preso; ícone sem nome | alta (bloqueio = crítica) |
| Documentação | componente sem critério de uso | média |
| Governança | sem dono / sem versão | média |

## 3. Maturidade

| Nível | Descrição | Sinal |
|---|---|---|
| 0 — Ad hoc | estilos por tela | sem tokens |
| 1 — Biblioteca | componentes reutilizáveis, valores repetidos | tokens só primitivos ou soltos |
| 2 — Sistema | tokens em camadas, kit com estados, doc de uso | drift < 5/1000 linhas |
| 3 — Governado | dono, versão, contribuição, a11y no CI, métricas de adoção | regressão visual/a11y automatizada |
| 4 — Legível por agentes | DESIGN.md aprovado (≥ 90), padrões e gates automáticos usados por agentes | geração controlada sem invenções |

## 4. Plano de correção

Ordem padrão (cada etapa destrava a seguinte):
1. Corrigir pares de contraste que falham (skill `tokens`).
2. Criar/organizar camada semântica; mapear cores cruas mais frequentes para tokens.
3. Consolidar duplicatas no componente mais usado; deprecar os outros com caminho de migração.
4. Completar estados nos componentes de fluxos críticos.
5. Escrever/atualizar DESIGN.md (skill `design-md`) e conectar aos agentes.
6. Colocar gates no CI: `tools/build-tokens.mjs --check`, `lint-raw-values`, axe.

## Saída

```
Maturidade: nível N (<nome>) — evidência: …
Drift: X ocorrências em Y linhas (Z/1000) — top 5 valores crus → token sugerido
Componentes: N no kit; duplicatas: …; estados ausentes críticos: …
Acessibilidade: bloqueadores: …
Plano (máx. 8 itens, em ordem): item — esforço (P/M/G) — impacto
Métrica para acompanhar: drift/1000 linhas, % de telas usando só o kit, nota do DESIGN.md
```
