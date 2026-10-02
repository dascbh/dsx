---
id: filtros-ativos
titulo: Como mostrar os filtros ativos?
categoria: busca-filtros
componentes: [filtro, chip, lista]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["4.1.2", "4.1.3", "1.4.1", "2.1.1"]
relacionados: [estrutura-de-filtros, aplicacao-de-filtros, busca-sem-resultados, filtro-de-periodo]
---

# Como mostrar os filtros ativos?

> **Regra:** Depois de aplicar filtros, exiba um resumo visível com nome e valor de cada critério, remoção individual e uma ação "Limpar filtros", fora de qualquer painel fechado.

## Contexto

Aplicar um filtro altera os resultados, mas a tarefa continua: a pessoa precisa entender por que a lista encolheu, quais critérios restringem e como ampliar de novo.

Um contador como "3 filtros" prova que há um recorte, mas não revela qual. O resumo deve exibir os valores aplicados junto à lista ou ao controle de filtros.

Sem esse resumo, uma lista reduzida pode parecer o catálogo inteiro, e remover critérios exige reabrir o painel e caçar cada controle.

## Decisão

- **SE** há um ou mais filtros aplicados **ENTÃO** mostre o resumo ao lado dos resultados.
- **SE** o painel de filtros está fechado ou em gaveta **ENTÃO** o resumo e a contagem continuam visíveis fora dele.
- **SE** exibe cada item **ENTÃO** use "Atributo: valor" ("Marca: Nike", "Preço: até R$ 300"); contador apenas complementa.
- **SE** o usuário quer desfazer um critério **ENTÃO** cada item tem ação própria de remoção, sem reabrir o painel.
- **SE** há dois ou mais filtros **ENTÃO** ofereça "Limpar filtros" explícito, sem escondê-lo em menus.
- **SE** o painel usa botão "Aplicar" **ENTÃO** escolhas pendentes não aparecem como aplicadas até a confirmação.
- **SE** o usuário volta de uma página de detalhe **ENTÃO** mantenha os filtros (estado na URL ou no histórico).
- **SE** não há resultado **ENTÃO** explique e ofereça relaxar ou limpar o recorte.
- **SENÃO** em mobile use lista horizontal ou empilhada que indique itens além da área visível.

## Quando usar

- Listas com mais de um filtro.
- Catálogos e resultados de busca.
- Filtros escondidos em gaveta ou menu.
- Fluxos com ida e volta a páginas de detalhe.

## Quando evitar

- Lista sem filtros aplicados → **use em vez disso:** não exibir o resumo.
- Chips sem ação de remover → **use em vez disso:** chips removíveis ou texto simples.
- Contador sem nome ou valor → **use em vez disso:** "Atributo: valor".

## Faça

- Informe quantos resultados restam e atualize a cada mudança.
- Sincronize resumo, controles, contagem e URL.
- Posicione o resumo em local previsível acima da lista.
- Preserve o estado ao usar Voltar.

## Evite

- Mostrar só um contador.
- Obrigar a reabrir o painel para remover.
- Apagar filtros sem aviso.
- Perder o recorte na navegação.

## Acessibilidade

- Cada remoção é uma ação nomeada, como "Remover filtro Marca: Nike", com foco visível e uso por teclado e toque (WCAG 4.1.2, 2.1.1).
- Agrupe o resumo com título ou nome acessível.
- Anuncie nova quantidade de resultados em região de status sem mover o foco (WCAG 4.1.3).
- Após remover, mantenha o foco em ponto previsível se o controle sumir.
- Não dependa só de cor (WCAG 1.4.1); lista horizontal precisa ser navegável por teclado.

## Microcópia

| Situação | Exemplo |
|---|---|
| Item removível | "Marca: Nike" com ação "Remover filtro Marca: Nike" |
| Limpar tudo | "Limpar filtros" |
| Contagem | "12 resultados" |
| Painel fechado | "Filtros (3)" |

## Checklist de verificação

- [ ] O resumo mostra atributo e valor de cada filtro?
- [ ] Cada filtro pode ser removido individualmente?
- [ ] Existe "Limpar filtros" visível?
- [ ] O resumo aparece com o painel fechado?
- [ ] A contagem de resultados acompanha o estado?
- [ ] Os filtros persistem ao usar Voltar?
- [ ] A remoção funciona por teclado, toque e leitor de tela?
- [ ] Escolhas não confirmadas não aparecem como aplicadas?

## Fundamentação

- Baymard Institute (filtros aplicados em visão geral e boas práticas de listas): problemas de confirmação, remoção e contexto sem resumo; soluções para desktop e mobile.
- IBM Carbon (Filtering): indicador de quantidade e limpeza sem reabrir o contêiner.
- Red Hat PatternFly (Filters): chips removíveis, limpar todos, contagem.
- WCAG 2.2, 4.1.2 (Name, Role, Value): nome e estado dos controles de remoção.
- WCAG 2.2, 4.1.3 e técnica ARIA22: anúncios de status sem mover foco.
