---
id: table-sorting
title: Como ordenar dados em tabelas?
category: data
components: [table, column-header, button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "4.1.2", "4.1.3", "2.1.1", "2.4.7"]
related: [table-pagination, responsive-table, table-vs-cards, filter-structure]
---

# Como ordenar dados em tabelas?

> **Regra:** Ofereça ordenação apenas em colunas com ordem significativa, mostre sempre a coluna e a direção ativas, ordene pelo valor real e exponha o estado via botão e `aria-sort`.

## Contexto

Ordenar reorganiza as linhas para comparar por um critério (nome, data, quantidade, valor). Só ajuda quando a coluna tem ordem que faz sentido para a tarefa e a interface mostra qual critério está valendo.

Ordenação não substitui filtro: ela reposiciona, não remove linhas. Sem estado ativo evidente, a pessoa não entende por que as linhas estão naquela sequência; sem controle acessível, a mudança é invisível a parte dos usuários.

## Decisão

- **SE** a pessoa precisa comparar itens por um critério **ENTÃO** permita ordenar por ele.
- **SE** a coluna é texto livre, descrição longa ou combinação de informações **ENTÃO** não torne ordenável.
- **SE** a tabela carrega **ENTÃO** aplique uma ordenação inicial útil (ex.: data mais recente) e indique-a.
- **SE** há coluna ativa **ENTÃO** mostre nome + indicador de crescente/decrescente, em apenas uma coluna quando a ordenação é única.
- **SE** o usuário ativa a mesma coluna **ENTÃO** alterne crescente e decrescente; se existir terceiro estado sem ordem, deixe-o reconhecível.
- **SE** a coluna tem datas, números, moedas ou tamanhos **ENTÃO** ordene pelo valor bruto, não pelo texto formatado ("R$ 9,00" antes de "R$ 10,00").
- **SE** a ordenação é remota **ENTÃO** mostre carregamento e informe o novo critério e a página.
- **SE** a tabela vira cards no mobile **ENTÃO** ofereça seletor equivalente de critério ou remova o controle.
- **SE** a ordem é prioridade manual do usuário **ENTÃO** não ofereça ordenação por coluna.

## Quando usar

- Tabelas longas com dados comparáveis.
- Relatórios, dashboards, catálogos e listas administrativas.
- Tarefas de achar extremos ou priorizar.

## Quando evitar

- Ordem natural única → **use em vez disso:** manter fixa.
- Linhas mescladas ou grupos hierárquicos → **use em vez disso:** sem ordenação.
- Mobile empilhado sem equivalência → **use em vez disso:** seletor de critério.

## Faça

- Use botão dentro de `<th scope="col">`.
- Mostre coluna e direção ativas.
- Alterne a direção de forma previsível.
- Anuncie a atualização.

## Evite

- Tornar todas as colunas ordenáveis.
- Depender só de cor ou de seta sem nome.
- Ordenar texto formatado.
- Mudar a direção sem feedback.

## Acessibilidade

- Marcação semântica de tabela com `<th scope="col">` (WCAG 1.3.1).
- Cabeçalho ordenável contém botão focável e acionável por teclado, com foco visível (WCAG 2.1.1, 2.4.7).
- `aria-sort="ascending"` ou `"descending"` no cabeçalho ativo (WCAG 4.1.2).
- Anuncie a mudança em `aria-live="polite"`, sem mover o foco (WCAG 4.1.3).
- Valores programáticos coerentes com o que é exibido.

## Microcópia

| Situação | Exemplo |
|---|---|
| Anúncio | "Tabela ordenada por data, mais recentes primeiro" |
| Nome do botão | "Ordenar por valor" |
| Mobile | "Ordenar por" |

## Checklist de verificação

- [ ] A ordenação serve a uma tarefa de comparação?
- [ ] Só colunas com ordem clara são ordenáveis?
- [ ] A coluna ativa está identificada?
- [ ] A direção está visível sem depender de cor?
- [ ] O controle funciona por teclado?
- [ ] Números, datas e moedas ordenam por valor bruto?
- [ ] `aria-sort` está em uma única coluna?
- [ ] A mudança é anunciada sem mover o foco?
- [ ] O mobile mantém forma equivalente de ordenar?

## Fundamentação

- Baymard Institute (ordenação em listas de produtos): ordenar por atributos relevantes e critério visível; evidência contextual a e-commerce.
- W3C WAI-ARIA APG (Sortable Table): botões em cabeçalhos e `aria-sort`.
- W3C WAI (módulo de tabelas): botão como controle e estado além do visual.
- Material Design (Data tables): coluna ordenada, inversão de direção.
- U.S. Web Design System (Table): colunas ordenáveis, valores brutos, região de status, limite no mobile empilhado.
- IBM Carbon (Data table): estados e interação.
