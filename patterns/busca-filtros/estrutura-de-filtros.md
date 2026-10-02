---
id: estrutura-de-filtros
titulo: Como estruturar filtros em uma interface?
categoria: busca-filtros
componentes: [filtro, checkbox, radio, select, painel-lateral]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["1.3.1", "3.3.2", "4.1.3", "1.4.10"]
relacionados: [filtros-ativos, aplicacao-de-filtros, busca-sem-resultados, filtro-de-periodo]
---

# Como estruturar filtros em uma interface?

> **Regra:** Ofereça só filtros que respondem a decisões reais da tarefa, agrupados por significado, com lógica de combinação previsível, estado ativo visível e saída simples (remover um, limpar todos).

## Contexto

Filtros restringem uma coleção já exibida por critérios como categoria, status, faixa de preço ou data. Funcionam quando a pessoa percebe o que é filtrável, como os critérios se somam e como desfazer.

Estruturar filtros não é despejar todos os atributos do banco numa lateral. É escolher critérios úteis, agrupá-los no vocabulário do domínio, usar o controle correto e comunicar o efeito de cada escolha.

Filtros numerosos, vagos ou mal agrupados levam o usuário a ignorar critérios importantes, aplicar combinações que não entende ou concluir que o item não existe.

## Decisão

- **SE** o usuário precisa achar algo que pode não estar na lista **ENTÃO** use busca, não filtro.
- **SE** só precisa mudar a sequência **ENTÃO** use ordenação, em controle separado do filtro.
- **SE** a lista é pequena e fácil de percorrer **ENTÃO** não ofereça filtros.
- **SE** o critério permite várias escolhas **ENTÃO** use caixas de seleção; **SE** só uma **ENTÃO** use rádio ou select; **SE** é valor numérico **ENTÃO** use intervalo; **SE** é período **ENTÃO** use controle de data.
- **SE** uma lista de opções é extensa **ENTÃO** adicione busca interna ou agrupamento.
- **SE** várias opções do mesmo atributo estão marcadas **ENTÃO** trate-as como alternativas (amplia); **SE** são grupos diferentes **ENTÃO** combine-os restringindo — e confirme isso em teste.
- **SE** há filtros secundários **ENTÃO** coloque-os em "Mais filtros" apenas se não esconderem algo decisivo.
- **SE** a tela é estreita **ENTÃO** abra os filtros em painel ou gaveta, com o botão mostrando a quantidade de filtros ativos.
- **SE** a combinação não retorna itens **ENTÃO** explique e ofereça remover ou relaxar filtros.
- **SENÃO** mostre os critérios mais usados primeiro.

## Quando usar

- Listas extensas e catálogos pesquisáveis.
- Coleções com atributos relevantes para decisão.
- Dashboards com muitos registros.
- Tarefas que combinam mais de um critério.

## Quando evitar

- Listas curtas → **use em vez disso:** listar tudo.
- Encontrar conteúdo ausente da lista → **use em vez disso:** busca.
- Apenas reordenar → **use em vez disso:** ordenação.
- Atributos sem efeito real ou que ninguém explica → **use em vez disso:** removê-los.

## Faça

- Parta das perguntas da tarefa, não dos campos do banco.
- Dê a cada grupo um nome curto e específico.
- Mostre os filtros ativos e a contagem de resultados.
- Permita remover um filtro e limpar todos.
- Preserve as escolhas ao recarregar ou voltar para a lista.

## Evite

- Misturar busca e filtro no mesmo controle.
- Expor todos os atributos disponíveis.
- Zerar escolhas sem aviso.
- Depender só de cor para mostrar o que está ativo.

## Acessibilidade

- Use controles nativos com `label` visível (WCAG 3.3.2).
- Agrupe opções relacionadas com `fieldset` e `legend` (WCAG 1.3.1).
- Em gaveta: botão com nome claro, estado expandido e contagem; foco entra no painel, fica visível e retorna ao acionador ao fechar.
- Anuncie mudança de resultados em região de status (WCAG 4.1.3).
- Garanta funcionamento em zoom de 200% e 400% e em tela estreita (WCAG 1.4.10).

## Microcópia

| Situação | Exemplo |
|---|---|
| Botão de painel | "Filtros (3)" |
| Limpar tudo | "Limpar filtros" |
| Resultado | "24 resultados" |
| Sem itens | "Nenhum item com esses filtros. Remova um filtro para ampliar." |

## Checklist de verificação

- [ ] Cada filtro responde a uma tarefa real?
- [ ] Busca e ordenação estão separadas dos filtros?
- [ ] Os critérios estão agrupados com nomes claros?
- [ ] O tipo de controle combina com o tipo de escolha?
- [ ] Os filtros ativos estão visíveis?
- [ ] Existe remover individual e limpar todos?
- [ ] Mudança de resultados é anunciada a leitor de tela?
- [ ] Grupos usam `fieldset`/`legend`?
- [ ] Filtros funcionam com teclado e em tela estreita?

## Fundamentação

- Baymard Institute: disponibilidade, escopo, lógica, layout e descoberta de filtros em listas de produtos (forte em e-commerce; validar em outros domínios).
- IBM Carbon: escolha do método de seleção, indicador de filtros aplicados, limpeza por categoria e global.
- GitHub Primer: distinção entre busca e filtro, estado recuperável, comunicação a tecnologias assistivas.
- W3C WAI (agrupar e rotular controles): fieldset/legend e label.
- Padrão Digital GOV.BR: referência de controles de seleção acessíveis.
