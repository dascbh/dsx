---
id: tabela-vs-cards
titulo: Quando usar tabela em vez de cards?
categoria: dados
componentes: [tabela, card, lista]
tipo: decisao-contextual
impacto: alto
status: recomendado
evidencia: forte
wcag: ["1.3.1", "1.3.2", "1.4.10", "2.4.6", "2.4.7"]
relacionados: [tabela-responsiva, ordenacao-de-tabela, paginacao-de-tabela, estrutura-de-filtros]
---

# Quando usar tabela em vez de cards?

> **Regra:** Use tabela quando a pessoa precisa comparar atributos entre itens; use cards para resumos independentes e conteúdo heterogêneo.

## Contexto

Tabelas e cards estruturam a informação de modos diferentes. A tabela destaca as relações entre linhas e colunas, para consultar, comparar e operar dados. O card agrupa um resumo independente e leva a mais detalhes.

A escolha parte da tarefa, do conteúdo e do dispositivo, não da aparência. Tabela não é menos moderna, e card não é automaticamente mais amigável. Cards tendem a ser menos escaneáveis e piores para busca e comparação; a tabela perde força quando cada item tem estrutura muito diferente.

Para dados realmente tabulares, cabeçalhos, linhas e células carregam significado que precisa ser preservado também nas versões responsivas.

## Decisão

- **SE** os itens compartilham os mesmos atributos e a pessoa compara linhas ou colunas **ENTÃO** use tabela.
- **SE** a tarefa envolve busca, ordenação, filtros, seleção ou ações em massa **ENTÃO** use tabela.
- **SE** cada item é uma unidade independente, com resumo, imagem ou convite para ver detalhes **ENTÃO** use cards.
- **SE** o conteúdo é heterogêneo (mídia, texto e ações variáveis) **ENTÃO** use cards.
- **SE** os itens são homogêneos e não exigem comparação entre atributos **ENTÃO** use lista simples.
- **SE** a pessoa precisa localizar rapidamente um item específico **ENTÃO** não use cards.
- **SE** a tabela vira cards no mobile **ENTÃO** preserve o vínculo valor-cabeçalho, a ordem de leitura e as ações.
- **SENÃO** teste ambos com conteúdo real e meça o tempo para encontrar, comparar e abrir itens.

## Quando usar

- Tabela: mesmos atributos em todos os itens.
- Tabela: comparar preços, estados, datas, quantidades ou métricas.
- Tabela: pesquisa, ordenação, filtros, seleção e ações em lote.
- Cards: artigos, produtos ou recursos como unidades independentes.
- Cards: imagem, resumo e ação para abrir detalhes.
- Cards: coleções heterogêneas.

## Quando evitar

- Cards no lugar de dados tabulares → **use em vez disso:** tabela.
- Tabela para narrativas ou conteúdo sem relação entre colunas → **use em vez disso:** lista ou texto.
- Cards para achar item específico → **use em vez disso:** tabela ou lista com busca.
- Tabela para itens de estrutura muito diferente → **use em vez disso:** cards.
- Escolha por tendência visual → **use em vez disso:** decisão pela tarefa.

## Faça

- Identifique a tarefa principal antes de escolher.
- Alinhe os mesmos atributos em colunas quando houver comparação.
- Considere lista para conteúdo homogêneo.
- Teste com dados reais, não fictícios.
- Preserve a tarefa e as ações no mobile.

## Evite

- Usar cards como linhas de tabela.
- Forçar uma única estrutura para tudo.
- Escolher pela aparência.
- Esconder atributos importantes ao reduzir a tela.
- Quebrar a relação cabeçalho-valor no mobile.
- Testar só com conteúdo fictício.

## Acessibilidade

- Tabela semântica: caption, th com scope="col" ou scope="row" e td; em tabelas complexas, id e headers (1.3.1).
- Na versão empilhada ou responsiva, mantenha o vínculo valor-cabeçalho, a ordem de leitura e as ações (1.3.2); não esconda informação essencial.
- Cards em coleção usam lista semântica (ul e li) e títulos em hierarquia correta (1.3.1, 2.4.6).
- Dê nome acessível a links e botões; foco visível (2.4.7).
- Evite tornar o card inteiro um link quando ele contém outros controles.
- Teste teclado, leitor de tela, zoom de 400% e diferentes larguras (1.4.10).

## Microcópia

| Situação | Exemplo |
|---|---|
| Legenda da tabela | "Faturas dos últimos 12 meses" |
| Link de card | "Ver detalhes da fatura de março" |
| Sem resultados | "Nenhuma fatura encontrada para este filtro." |
| Rótulo de coluna empilhada | "Vencimento: 10/04/2026" |

## Checklist de verificação

- [ ] A tarefa principal está identificada.
- [ ] Dados comparáveis com os mesmos atributos usam tabela.
- [ ] Cards só aparecem para resumos independentes ou conteúdo heterogêneo.
- [ ] A tabela usa caption e th com scope.
- [ ] Na versão mobile, cada valor segue ligado ao seu cabeçalho.
- [ ] As ações continuam disponíveis no mobile.
- [ ] Coleções de cards usam lista semântica.
- [ ] O formato foi validado com conteúdo e tarefas reais.

## Fundamentação

- Nielsen Norman Group, definição de cards: bons para resumo e exploração, menos escaneáveis e adequados para comparação.
- Baymard Institute, listas de produtos e filtros: layout deve acompanhar tipo de item e tarefa; evidência de e-commerce.
- W3C WAI, tutorial de tabelas e dicas de tabelas acessíveis: marcação semântica e relações em versões responsivas.
- U.S. Web Design System, tabela e card: colunas para comparação; card não substitui linha de tabela.
- VTEX Shoreline, tabela: colunas para escanear, ordenar e comparar em contextos administrativos.
