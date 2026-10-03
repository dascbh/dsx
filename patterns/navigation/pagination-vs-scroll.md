---
id: pagination-vs-scroll
title: Paginação, "Carregar mais" ou scroll infinito?
category: navigation
components: [pagination, load-more-button, infinite-scroll, list]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["2.1.1", "2.4.3", "4.1.3", "1.4.10", "2.4.8"]
related: [table-pagination, long-loading, skeleton-vs-spinner, active-filters]
---

# Paginação, "Carregar mais" ou scroll infinito?

> **Regra:** Se localizar e retornar pesam mais, adote paginação; se explorar e comparar pesam mais, adote "Carregar mais"; deixe o scroll infinito para feeds em que seguir rolando é a própria tarefa.

## Contexto

Os três padrões fatiam uma coleção, mas produzem experiências distintas. A paginação gera páginas e pontos de retorno. "Carregar mais" conserva tudo no mesmo contexto mediante ação explícita. O scroll infinito acrescenta conteúdo sozinho conforme a rolagem.

A decisão parte da tarefa (localizar, comparar, explorar, revisitar, chegar ao fim), do volume, da estabilidade dos resultados, do desempenho e da necessidade de orientação. Estudos com listas de produtos sugerem situações em que "Carregar mais" favorece a comparação, mas isso é hipótese de design, e não regra geral.

O custo vai além do visual: carregamento automático afeta histórico, foco, leitura assistiva, acesso ao rodapé e recuperação após abrir um item.

## Decisão

- **SE** a pessoa precisa achar, citar, compartilhar ou rever uma página determinada **ENTÃO** adote paginação.
- **SE** posição, total ou URL são relevantes **ENTÃO** use paginação.
- **SE** resultados, tabelas e históricos pedem pontos de retorno previsíveis **ENTÃO** adote paginação.
- **SE** a pessoa explora e compara itens numa lista contínua e decide quando ver mais **ENTÃO** use "Carregar mais".
- **SE** o conteúdo é feed de descoberta ou sequencial e continuar é a tarefa **ENTÃO** considere scroll infinito, desde que posição, histórico, rodapé, teclado e tecnologia assistiva continuem funcionando.
- **SE** precisa de continuidade mas também de controle **ENTÃO** use híbrido: blocos automáticos mais botão manual.
- **SE** a lista é curta **ENTÃO** não pagine.
- **SENÃO** comece pela paginação e valide com conteúdo e tarefas reais.

## Quando usar

- Paginação: buscas, tabelas, históricos, arquivos.
- "Carregar mais": catálogos e listas de exploração.
- Scroll infinito: feeds de novidades e conteúdo sequencial.
- Blocos: coleções grandes que pesam se carregadas de uma vez.

## Quando evitar

- Scroll infinito em buscas ou tabelas de consulta → **use em vez disso:** paginação.
- Paginação em lista curta → **use em vez disso:** lista completa.
- "Carregar mais" quando se precisa ir direto à última página → **use em vez disso:** paginação.
- Todo padrão que perde filtros, ordenação, posição ou itens já vistos → **use em vez disso:** guardar o estado na URL ou na sessão.
- Escolher porque o concorrente usa → **use em vez disso:** testar a tarefa principal.

## Faça

- Preserve posição, filtros, ordenação e itens já carregados.
- Defina um fim claro da coleção.
- Mostre espera, erro e fim.
- Informe o que foi adicionado.
- Meça localização de itens, retorno e percepção de controle.

## Evite

- Esconder o rodapé.
- Duplicar itens ao carregar.
- Mover o foco sem aviso.
- Impedir voltar ao ponto anterior.
- Disparar requisições simultâneas que alterem a ordem.

## Acessibilidade

- Paginação dentro de `<nav>` com rótulo exclusivo, links de nome claro e `aria-current="page"`.
- "Carregar mais" é `<button>` real; anuncie início, resultado e fim por mensagem de status sem roubar o foco (4.1.3).
- Mantenha ordem de foco previsível após a atualização (2.4.3).
- O scroll infinito como feed segue o padrão de feed do WAI-ARIA: artigos identificáveis, posição, tamanho do conjunto e `aria-busy`.
- Teste teclado (2.1.1), zoom de 200% e 400% (1.4.10), conexão lenta e botão Voltar.

## Microcópia

| Situação | Exemplo |
|---|---|
| Botão | "Carregar mais 20 resultados" |
| Status | "20 itens adicionados. Mostrando 60 de 140." |
| Fim | "Você chegou ao fim da lista." |
| Erro | "Não foi possível carregar mais itens. Tentar novamente" |
| Paginação | "Página 3 de 12" |

## Checklist de verificação

- [ ] A tarefa principal (encontrar, comparar, explorar) foi definida.
- [ ] A necessidade de página ou URL específica foi avaliada.
- [ ] A posição e os itens vistos são preservados.
- [ ] Filtros, ordenação e busca permanecem ativos.
- [ ] O padrão funciona por teclado.
- [ ] Carregamento e resultado são anunciados.
- [ ] Erro, repetição e fim da coleção têm tratamento.
- [ ] O botão Voltar recupera o contexto.
- [ ] A decisão foi testada com conteúdo real.

## Fundamentação

- USWDS (Pagination): navegação em `nav`, rótulo e página atual.
- Padrão Digital GOV.BR (Pagination): variantes com botão e rolagem automática.
- W3C WAI-ARIA APG (Feed Pattern): estrutura de feeds, posição, foco e aria-busy.
- W3C (Status Messages, Focus Order): anúncio sem mover o foco e ordem de foco.
- Baymard Institute (Product List UX): paginação versus carregamento adicional dependem de tarefa, volume e dispositivo; achados específicos de e-commerce.
