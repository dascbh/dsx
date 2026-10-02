---
id: paginacao-de-tabela
titulo: Quando usar e como configurar paginação em tabelas e listas?
categoria: dados
componentes: [paginacao, tabela, lista]
tipo: decisao-contextual
impacto: medio
status: usar-com-cautela
evidencia: moderada
wcag: ["2.4.3", "1.4.1", "2.4.7", "4.1.3", "2.5.8"]
relacionados: [paginacao-vs-scroll, ordenacao-de-tabela, tabela-responsiva, filtros-ativos]
---

# Quando usar e como configurar paginação em tabelas e listas?

> **Regra:** Pagine coleções grandes de ordem estável, mostrando a página atual, mantendo página, filtros e ordenação recuperáveis e nomeando todos os controles.

## Contexto

Paginação divide uma coleção em páginas por quantidade de itens. Ela melhora orientação, retorno e desempenho, mas encarece a navegação e pode interromper a comparação. Não é sinônimo de etapas, abas, carrossel, scroll infinito ou "Carregar mais".

A escolha depende da tarefa: achar um resultado, explorar, comparar, consultar histórico ou avançar por fases. Se mal aplicada, a paginação oculta o tamanho do conteúdo, rompe filtros e ordenação, faz perder a posição de leitura ou força a refazer o caminho.

Em listas de produtos há contextos em que "Carregar mais" ajuda a comparar; esse achado é de e-commerce e não vale como regra universal.

## Decisão

- **SE** a coleção é extensa (resultados de busca, arquivos, tabelas administrativas, históricos) **ENTÃO** use paginação.
- **SE** carregar tudo prejudica desempenho ou leitura e a ordem é estável **ENTÃO** use paginação.
- **SE** a pessoa pode precisar voltar, compartilhar URL ou ir a uma página específica **ENTÃO** use paginação com a página na URL.
- **SE** o tamanho total é conhecido e confiável **ENTÃO** mostre página atual, páginas relevantes e total.
- **SE** o último resultado é desconhecido **ENTÃO** não invente a última página.
- **SE** a lista é curta ou a ordem muda a cada carga **ENTÃO** não pagine.
- **SE** itens precisam ser comparados continuamente na mesma tela **ENTÃO** considere "Carregar mais" ou listagem única.
- **SE** o conteúdo é dividido por assunto ou por etapas obrigatórias **ENTÃO** use abas ou etapas, não paginação.
- **SENÃO** defina a quantidade por página pela tarefa, tipo de item, dispositivo e desempenho, e teste.

## Quando usar

- Resultados de busca extensos e arquivos.
- Tabelas e listas administrativas grandes.
- Históricos e registros ordenados.
- Coleções cujas páginas têm URL.

## Quando evitar

- Coleções curtas → **use em vez disso:** lista completa.
- Conteúdo narrativo por tema → **use em vez disso:** seções, abas ou páginas por assunto.
- Processos obrigatórios → **use em vez disso:** indicador de etapas.
- Comparação contínua entre itens → **use em vez disso:** "Carregar mais".
- Paginar só para aumentar visualizações → **use em vez disso:** lista completa ou paginação funcional.

## Faça

- Destaque a página atual.
- Ofereça "Anterior" e "Próxima".
- Use reticências só para omitir páginas intermediárias, com nome acessível.
- Mantenha a navegação em uma linha; no mobile, reduza controles sem esconder a posição.
- Preserve o ponto de leitura ao voltar de um item.

## Evite

- Apagar filtros ao trocar de página.
- Reordenar itens sem aviso.
- Controles sem nome.
- Confundir páginas com etapas.
- Duas linhas de paginação.

## Acessibilidade

- Região `<nav aria-label="Paginação">`; links quando o controle leva a outra URL, botões quando atualiza no mesmo contexto.
- Página atual com `aria-current="page"`; nomes como "Página 2", "Página anterior", "Próxima página".
- Estado não só por cor ou peso (1.4.1); foco visível (2.4.7); alvo de toque adequado (2.5.8).
- Atualize URL ou título na troca de página e anuncie mudanças sem mover o foco (4.1.3, 2.4.3).
- Teste teclado, leitor de tela, zoom, mobile e botão Voltar.

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo da região | "Paginação" |
| Página atual | "Página 3 de 12" |
| Anterior | "Página anterior" |
| Próxima | "Próxima página" |
| Resumo | "Mostrando 21–40 de 240 resultados" |

## Checklist de verificação

- [ ] A coleção é grande o bastante para dividir.
- [ ] A divisão segue a quantidade, e não o assunto ou a etapa.
- [ ] Página e filtros são recuperáveis pela URL.
- [ ] A ordem dos itens é estável.
- [ ] A página atual está identificada.
- [ ] "Anterior" e "Próxima" têm nomes claros.
- [ ] O total aparece só quando é confiável.
- [ ] A quantidade por página foi testada.
- [ ] Funciona com teclado, leitor de tela, zoom e mobile.

## Fundamentação

- USWDS (Pagination): paginação por quantidade, página atual, anterior/próxima, total conhecido ou não.
- Padrão Digital GOV.BR (Pagination): variações do componente em listas extensas.
- W3C técnica ARIA26: identificar o item atual com aria-current.
- Baymard Institute (Product List UX): quantidade, dispositivo e tarefa influenciam a escolha; achados específicos de e-commerce.
- WCAG 2.2: ordem de foco, mensagens de status e uso não exclusivo de cor.
