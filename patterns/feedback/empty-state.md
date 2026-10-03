---
id: empty-state
title: Como criar bons estados vazios?
category: feedback
components: [empty-state, illustration, button, list, table]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["1.1.1", "1.3.1", "2.1.1", "2.4.7", "1.4.3"]
related: [no-search-results, active-filters, temporary-failure, skeleton-vs-spinner, retry]
---

# Como criar bons estados vazios?

> **Regra:** Identifique a causa do vazio, explique-a em título curto mais uma frase de contexto e ofereça uma única ação principal coerente com essa causa.

## Contexto

Um estado vazio aparece quando uma área ainda não tem conteúdo: primeiro uso, busca sem resultado, tarefa concluída, falta de permissão ou falha temporária. Cada causa pede um próximo passo diferente, então a mesma mensagem não serve para todas.

"Nenhum item" pode significar ausência de dados, filtro restritivo, erro, bloqueio por permissão ou trabalho concluído. Uma tela vazia sem explicação parece quebrada ou sem saída.

A mensagem deve informar o que a pessoa vê, o que isso quer dizer e o que fazer em seguida. Não há layout único; a escolha varia com a causa, a tarefa e o contexto do produto.

## Decisão

- **SE** é o primeiro uso **ENTÃO** explique para que serve a área e convide a começar ("Criar primeiro item").
- **SE** a busca ou os filtros zeraram o resultado **ENTÃO** preserve a consulta e ofereça editar termos ou "Limpar filtros".
- **SE** ainda não há dados mas virão depois de uma ação ou integração **ENTÃO** descreva o que aparecerá e quando, sem sugerir erro.
- **SE** houve erro ou indisponibilidade **ENTÃO** use mensagem de falha com "Tentar novamente"; não apresente como coleção vazia.
- **SE** a pessoa não tem permissão **ENTÃO** explique a restrição sem expor dados e indique como pedir acesso.
- **SE** a tarefa foi concluída ou a área foi limpa **ENTÃO** confirme o resultado e só sugira próximo passo se for relevante.
- **SE** o conteúdo está apenas carregando **ENTÃO** use estado de carregamento, não vazio.
- **SE** há várias ações possíveis **ENTÃO** destaque uma principal e rebaixe as demais.
- **SENÃO** escreva título específico e texto que acrescente contexto, sem repeti-lo.

## Quando usar

- Área sem dados ou conteúdo.
- Busca ou filtros sem resultados.
- Tarefa concluída ou área limpa.
- Conteúdo indisponível por erro, permissão ou configuração.
- Primeiro uso que precisa de orientação.

## Quando evitar

- Conteúdo existe e está carregando → **use em vez disso:** skeleton ou spinner.
- Ocorreu falha → **use em vez disso:** mensagem de erro com recuperação.
- Mensagem só "Nada encontrado" → **use em vez disso:** causa mais próximo passo.
- Ações concorrentes sem prioridade → **use em vez disso:** uma ação principal.
- Ilustração como única explicação → **use em vez disso:** texto como portador da informação.

## Faça

- Nomeie o estado com título curto e específico.
- Relacione a ação à causa.
- Preserve busca e filtros.
- Trate imagens decorativas como decorativas.

## Evite

- Escrever só "Sem dados".
- Culpar a pessoa.
- Confundir erro com ausência de dados.
- Links genéricos sem relação com a intenção.
- Repetir ações concorrentes.

## Acessibilidade

- Título como cabeçalho, texto associado e ação com rótulo claro (1.3.1); a explicação vem antes de qualquer tabela ou lista vazia.
- Imagem decorativa com alternativa vazia; imagem informativa com alternativa equivalente (1.1.1).
- Contraste suficiente (1.4.3), foco visível (2.4.7) e operação completa por teclado (2.1.1).
- Teste com zoom e leitor de tela nos casos de erro, sem resultados e sem permissão.

## Microcópia

| Situação | Exemplo |
|---|---|
| Primeiro uso | "Você ainda não tem projetos. Crie o primeiro para organizar suas tarefas." |
| Filtros | "Nenhum resultado com estes filtros." + "Limpar filtros" |
| Sem permissão | "Você não tem acesso a esta área. Peça acesso ao administrador." |
| Erro | "Não foi possível carregar a lista. Tentar novamente" |
| Concluído | "Tudo em dia. Nenhuma pendência." |

## Checklist de verificação

- [ ] O motivo do vazio está claro.
- [ ] O texto explica o que deveria aparecer.
- [ ] Existe uma ação principal relevante, com verbo claro.
- [ ] Erro está separado de "sem dados".
- [ ] Busca e filtros oferecem recuperação.
- [ ] A imagem é decorativa ou tem alternativa adequada.
- [ ] A explicação vem antes de conteúdo irrelevante na ordem de leitura.
- [ ] Passou por teste com leitor de tela, teclado e zoom.

## Fundamentação

- IBM Carbon (estados vazios): classifica por causa e orienta explicar o quê, por quê e qual ação seguir.
- Baymard Institute (páginas sem resultados): busca sem alternativa vira beco sem saída; contexto de busca e comércio.
- Nielsen Norman Group (diretrizes de mensagens de erro): linguagem compreensível e orientação de recuperação.
- Shopify Polaris e GitHub Primer (estado vazio): primeiro uso, ausência e erro com texto específico e ação principal.
- Material Design (legado) e Padrão Digital de Governo (GOV.BR): finalidade do estado vazio e orientação de próxima ação.
- WCAG 2.2 (W3C WAI): estrutura, teclado e alternativas para conteúdo não textual.
