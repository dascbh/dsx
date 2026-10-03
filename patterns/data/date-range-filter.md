---
id: date-range-filter
title: Como estruturar filtros de período em dashboards?
category: data
components: [filter, date-range-picker, dashboard, card, chart]
type: contextual-decision
impact: high
status: caution
evidence: moderate
wcag: ["1.4.1", "3.3.1", "3.3.2", "4.1.2", "4.1.3"]
related: [applying-filters, active-filters, filter-structure, empty-state]
---

# Como estruturar filtros de período em dashboards?

> **Regra:** Exiba sempre, em texto, o intervalo ativo, o que ele controla, a data da última atualização dos dados e quais cards ficam fora do recorte.

## Contexto

O período define a janela em que todas as métricas são lidas. Gráficos, cards, tabelas e alertas mudam de significado conforme o recorte, a granularidade, o fuso e o momento da última atualização. Por isso o período é parte do contexto da informação, não apenas um calendário.

Quando o intervalo fica escondido ou ambíguo, a pessoa compara números fora de contexto, diagnostica quedas que não existem, ignora dados parciais ou presume que todos os painéis seguem o mesmo recorte. Em vendas, SLA, incidentes e logs isso corrói a confiança operacional.

Este padrão vale para dashboards e telas analíticas com vários indicadores. Date pickers de formulário e filtros genéricos têm padrões próprios.

## Decisão

- **SE** o tempo é a principal dimensão de leitura da tela **ENTÃO** use um filtro de período global no topo, com o intervalo ativo escrito por extenso.
- **SE** o filtro controla todos ou quase todos os painéis **ENTÃO** trate-o como global; **SE** controla só uma seção ou card **ENTÃO** posicione-o junto dessa seção.
- **SE** algum card usa janela própria **ENTÃO** declare a exceção dentro do próprio card.
- **SE** há períodos recorrentes **ENTÃO** forneça atalhos relativos (Hoje, Últimos 7 dias, Últimos 30 dias, Mês atual) além de "Personalizado", e mostre as datas efetivas que resultam.
- **SE** a tarefa é investigar incidente, campanha, auditoria ou fechamento **ENTÃO** permita intervalo personalizado com início e fim validados.
- **SE** o período pode ser exibido em unidades diferentes (dia, semana, mês) **ENTÃO** trate a granularidade como controle separado.
- **SE** a decisão depende de dados recentes **ENTÃO** mostre a última atualização.
- **SE** há mais de um fuso, conta ou região **ENTÃO** informe o fuso usado.
- **SE** a consulta é pesada ou há vários filtros combinados **ENTÃO** use botão "Aplicar"; **SENÃO** aplique automaticamente.
- **SENÃO** use um padrão coerente com a tarefa (ex.: últimos 30 dias) e permita voltar a ele sem apagar os outros filtros.

## Quando usar

- Dashboards e relatórios com indicadores ao longo do tempo.
- Telas com cards, gráficos e tabelas que dependem de uma janela comum.
- Produtos com dados atrasados, parciais ou em atualização.
- Fluxos de drill-down que herdam o período.

## Quando evitar

- Filtro global quando cada card tem janela própria → **use em vez disso:** um filtro local em cada card.
- Aplicação automática em dashboard pesado → **use em vez disso:** botão "Aplicar".
- Ícone de calendário sem texto → **use em vez disso:** botão com o intervalo escrito.

## Faça

- Escreva o intervalo ativo ao lado do controle.
- Diferencie período relativo de fixo no próprio rótulo.
- Rotule separadamente campos de início e fim, com formato esperado.
- Permita limpar ou restaurar o padrão sem remover outros filtros sem aviso.
- Sinalize dados parciais ou atrasados.

## Evite

- Comparar gráficos de granularidades diferentes como equivalentes.
- Misturar período relativo e fixo sem explicar qual vale.
- Omitir o fuso em produtos multi-região.
- Duplicar filtros de período desalinhados na mesma tela.
- Indicar escopo ou erro só por cor.

## Acessibilidade

- O controle precisa de rótulo, nome, papel e estado programáticos (4.1.2).
- Campos de início e fim têm rótulos próprios, formato e erros específicos (3.3.1, 3.3.2).
- Não use apenas cor para marcar período ativo ou card fora do escopo (1.4.1).
- Anuncie carregamento, atualização e erro por região de status, sem mover o foco (4.1.3).
- Com aplicação manual, indique se há mudanças ainda não aplicadas.

## Microcópia

| Situação | Exemplo |
|---|---|
| Intervalo ativo | "Últimos 30 dias (02 set – 01 out)" |
| Atalho personalizado | "Personalizado" |
| Última atualização | "Atualizado hoje às 14:05 (horário de Brasília)" |
| Card com exceção | "Este gráfico usa o mês atual" |
| Data inválida | "A data final deve ser posterior à inicial." |
| Botão manual | "Aplicar período" |

## Checklist de verificação

- [ ] O período ativo aparece em texto visível.
- [ ] Está claro se o período é relativo ou fixo.
- [ ] O escopo do filtro (global ou local) está explícito.
- [ ] Cards com janela própria declaram essa janela.
- [ ] Existe valor padrão e forma de restaurá-lo.
- [ ] O intervalo personalizado valida início, fim e datas inválidas.
- [ ] Granularidade é um controle separado do período.
- [ ] A última atualização aparece quando a decisão depende de dados recentes.
- [ ] O fuso aparece quando há mais de uma região ou equipe.
- [ ] O modo de aplicação (automático ou manual) condiz com o custo da consulta.
- [ ] Rótulos e mensagens funcionam por teclado e leitor de tela.

## Fundamentação

- Documentação de filtros de dashboard de ferramentas analíticas (Metabase, Looker Studio, Tableau): escopo global, de seção e de card; datas relativas versus fixas.
- Documentação de dashboards de observabilidade (Grafana): seletor de tempo, fuso, atualização e período preservado.
- IBM Carbon (Date picker, Data table): rótulos, formato de data, teclado e fuso.
- GOV.UK Design System (Date input): fieldset, dica e mensagens de erro específicas.
- WCAG 2.2: rótulos e instruções (3.3.2), uso não exclusivo de cor (1.4.1), nome-papel-valor (4.1.2), mensagens de status (4.1.3).
- Pesquisa em visual analytics (Heer e Shneiderman; Hochheiser e Shneiderman): filtros dinâmicos e consultas por intervalo em séries temporais.
