---
id: responsive-table
title: Como tornar tabelas responsivas no mobile?
category: data
components: [table, list, card]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["1.4.10", "1.3.1", "2.1.1", "2.4.7"]
related: [table-vs-cards, table-sorting, table-pagination, touch-target]
---

# Como tornar tabelas responsivas no mobile?

> **Regra:** Escolha a adaptação pela tarefa: SE a pessoa compara colunas, mantenha a grade em contêiner com rolagem horizontal própria; SE consulta registros isolados, empilhe ou use lista, sempre preservando a relação cabeçalho-célula.

## Contexto

Tabelas dependem da relação entre linhas e colunas. Encolher a largura corta valores, comprime textos e dificulta comparar. Não existe transformação única: a tarefa decide.

Em telas estreitas, a adaptação precisa preservar o sentido dos dados, e não só encaixá-los. Quem usa zoom, texto ampliado ou tecnologia assistiva conta com essa estrutura.

Em testes de comércio digital, tabelas densas funcionaram no desktop mas perderam eficiência no mobile quando exigiam rolagem nos dois eixos; essa evidência é contextual ao e-commerce.

## Decisão

- **SE** a comparação entre colunas é essencial (dados numéricos densos, matrizes) **ENTÃO** mantenha a grade em um contêiner com rolagem horizontal própria.
- **SE** cada linha é um registro independente (diretório, contatos) **ENTÃO** empilhe, repetindo o rótulo da coluna junto de cada valor.
- **SE** poucos atributos bastam para decidir **ENTÃO** use lista e mova dados secundários para detalhes expansíveis ou página própria.
- **SE** há muitas colunas **ENTÃO** reduza colunas (remova redundância, encurte rótulos) antes de comprimir conteúdo.
- **SE** a tabela é longa ou larga **ENTÃO** considere cabeçalho ou primeira coluna fixos.
- **SE** há rolagem horizontal **ENTÃO** sinalize conteúdo fora da tela e torne o contêiner focável por teclado.
- **SE** há seleção, ordenação ou ações **ENTÃO** mantenha-as disponíveis no mobile.
- **SENÃO** teste com dados reais antes de escolher.

## Quando usar

- Rolagem local: comparação multicoluna, dados densos.
- Linhas empilhadas: registros independentes.
- Lista: poucos atributos essenciais.
- Cabeçalho fixo: tabelas longas.

## Quando evitar

- Comprimir todas as colunas → **use em vez disso:** priorizar colunas.
- Rolagem horizontal na página inteira → **use em vez disso:** rolagem no contêiner.
- Empilhar sem rótulos → **use em vez disso:** rótulo repetido por valor.
- Duplicar versões desktop e mobile → **use em vez disso:** uma única estrutura adaptável.
- Dados comparativos virando cards desconectados.

## Faça

- Identifique a tarefa principal primeiro.
- Priorize colunas essenciais.
- Limite a rolagem à tabela.
- Preserve ações de linha visíveis ao toque.
- Teste com zoom, textos longos e dados reais.

## Evite

- Cortar valores importantes.
- Depender apenas do gesto horizontal sem indicação.
- Remover a barra de rolagem sem alternativa.
- Quebrar a ordem de leitura.

## Acessibilidade

- Mantenha `<table>`, `<caption>`, `<th>` e `<td>`; use `scope` ou `id`/`headers` em estruturas complexas (WCAG 1.3.1).
- Reflow a 320 CSS px: tabelas bidimensionais são exceção, mas a rolagem fica no contêiner (WCAG 1.4.10); a exceção não cobre filtros, busca ou paginação.
- Contêiner rolável focável por teclado, com foco visível (WCAG 2.1.1, 2.4.7).
- No layout empilhado, mantenha a relação programática valor-cabeçalho.
- Não duplique tabelas que ambas sejam lidas por leitor de tela.
- Teste a 320 px e zoom de 400%.

## Microcópia

| Situação | Exemplo |
|---|---|
| Dica de rolagem | "Role para o lado para ver mais colunas" |
| Empilhado | "Status: Ativo" |
| Detalhe expansível | "Ver mais detalhes" |

## Checklist de verificação

- [ ] A tarefa principal foi identificada?
- [ ] As colunas essenciais foram priorizadas?
- [ ] A comparação continua possível quando necessária?
- [ ] A rolagem horizontal fica restrita à tabela?
- [ ] Há indicação de conteúdo fora da tela?
- [ ] Cabeçalhos e células continuam associados?
- [ ] Ordenação, seleção e ações seguem acessíveis?
- [ ] O restante da página não rola na horizontal a 320 px?
- [ ] Funciona com teclado e leitor de tela?

## Fundamentação

- W3C WAI (Tables Tutorial): preservar relações estruturais em telas pequenas e zoom.
- WCAG 2.2, 1.4.10 (Reflow): 320 CSS px e exceção para dados bidimensionais.
- WCAG 2.2, 1.3.1 (Info and Relationships): relações cabeçalho-célula programáticas.
- Baymard Institute: tabelas de produtos perdem eficiência no mobile com rolagem em dois eixos (contexto de e-commerce).
- U.S. Web Design System (Table): tabelas roláveis para dados densos, empilhadas para diretórios.
- VTEX Shoreline (Table): cabeçalho e primeira coluna fixos.
- IBM Carbon (Data Table): espaço para dados densos, ações de linha visíveis no toque.
