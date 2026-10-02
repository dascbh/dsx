---
name: revisar-ux
description: "Revisão de usabilidade de tela ou fluxo: heurísticas de Nielsen com severidade 0–4, cognitive walkthrough, hierarquia, estados, texto e padrões. Use para \"revisa essa tela\", auditoria de UX ou antes de entregar."
---

# Revisão de UX

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `templates/` são relativos a ela.

Referências: `knowledge/fundamentos/heuristicas-nielsen.md`, `avaliacao-de-usabilidade.md`, `psicologia-e-leis.md`, `hierarquia-visual.md`, `patterns/index.json`.

**Limite honesto:** revisão por especialista (humano ou agente) **encontra problemas prováveis; não prova** que pessoas reais terão o problema nem que a solução funciona. Para decisões caras, recomende teste com usuários (skill `pesquisa`).

## 1. Enquadre (antes de olhar detalhes)

Escreva em 3 linhas:
- **Para quem** é a tela (persona/papel) e **em que contexto** (dispositivo, frequência, pressa).
- **Tarefa principal** que a tela precisa permitir, com início e fim.
- **O que a tela promete** (o que ela diz ser, pelo próprio texto e hierarquia).

Se você não consegue responder, isso já é o primeiro achado (falta de clareza de propósito).

## 2. Inspecione a tela renderizada

Prefira a interface rodando (navegador/screenshot) ao código. Verifique: desktop e 320px de largura, tema claro e escuro, teclado, estados (vazio, carregando, erro). Se só houver código, diga isso no relatório — a confiança é menor.

## 3. Cognitive walkthrough da tarefa principal

Para **cada passo** da tarefa, responda:
1. A pessoa vai **tentar** fazer a coisa certa (sabe que este passo existe)?
2. Ela vai **perceber** que a ação certa está disponível?
3. Ela vai **associar** a ação ao resultado que quer (o rótulo diz o que ela pensa)?
4. Depois de agir, ela vai **entender** pelo feedback que progrediu?

Cada "não" é um achado. Conte os passos e cliques: esforço desnecessário é achado.

## 4. Passada heurística

Passe pelas 10 heurísticas usando as perguntas de auditoria de `knowledge/fundamentos/heuristicas-nielsen.md`. Atenção especial a:
- **H1 Visibilidade do status:** todo processo > 1s tem feedback; estados vazios explicam o próximo passo.
- **H3 Controle e liberdade:** há desfazer/cancelar/voltar sem perder dados?
- **H5 Prevenção de erros:** a interface evita o erro antes de reclamar dele?
- **H9 Recuperação:** a mensagem diz o que houve e como resolver?

Depois, as lentes complementares:
- **Hierarquia:** teste do "olhar semicerrado" — o elemento mais importante é o mais forte? Uma ação primária por região?
- **Fitts/Hick:** alvos frequentes grandes e próximos; poucas opções concorrentes na decisão principal.
- **Carga cognitiva:** a pessoa precisa lembrar algo de outra tela? Há jargão interno?
- **Padrões:** para cada decisão de interação (modal, toast, validação, tabela…), compare com o cartão correspondente em `patterns/` e cite o id quando houver desvio.
- **Dark patterns:** qualquer item de `knowledge/fundamentos/dark-patterns.md` é severidade ≥ 3.

## 5. Severidade

| Nota | Significado | Critério |
|---|---|---|
| 0 | Não é problema | Discordância estética sem impacto |
| 1 | Cosmético | Corrigir se sobrar tempo |
| 2 | Menor | Atrasa ou irrita; baixa prioridade |
| 3 | Maior | Faz a pessoa errar ou desistir em parte dos casos; prioridade alta |
| 4 | Catástrofe | Impede a tarefa, causa perda de dados/dinheiro ou exclui quem usa tecnologia assistiva; corrigir antes de lançar |

Severidade = **frequência × impacto × persistência**. Barreira de acessibilidade que bloqueia a tarefa é sempre 4.

## 6. Relatório

Use `templates/relatorio-heuristico.md`. Regras:
- Cada achado: **onde** (tela/elemento), **o que acontece**, **por que é problema** (heurística/padrão/lei), **severidade**, **correção proposta** concreta.
- Ordene por severidade; agrupe achados com a mesma causa raiz.
- Máximo 3 achados de severidade ≤ 1 (não afogue o importante).
- Inclua **o que está bom** (até 3 itens) — preserva decisões corretas na próxima iteração.
- Se a correção depende de suposição sobre o usuário, marque `[hipótese — validar com pesquisa]`.

Para revisão sem viés do construtor, delegue ao subagente `revisor-ux` passando **só** a tela/rota e o público — nunca seu raciocínio de construção.
