---
id: monitoring-dashboard
title: Painel de acompanhamento
summary: Tela de visão geral que responde como as coisas estão e o que pede atenção agora, com indicadores, tendências e uma lista curta de pendências.
register: [operational]
when-to-use: SE a pessoa precisa saber a situação de um conjunto e decidir onde agir primeiro ENTÃO use painel de acompanhamento
avoid-when: a pessoa vai agir item a item sobre a lista inteira (use lista operacional), os números não levam a nenhuma decisão ou só há um indicador
regions: [page-header, period-bar, kpi-strip, charts-area, pending-list]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, empty, no-data-in-period, partial, stale, error, no-access]
patterns: [date-range-filter, skeleton-screen, empty-state, temporary-failure, retry, not-color-alone, table-vs-cards, long-loading]
variations: [kpis-above-list, pending-first, dashboard-per-role]
rules: [T1, T3, T6, F1, F2]
---

# Painel de acompanhamento

A tela de entrada de um módulo ou de uma carteira: quantos pedidos vencem neste mês, quantos aguardam resposta de terceiros, como evoluiu o volume, o que está atrasado. Cada número precisa responder "e daí?" — levar a uma lista filtrada onde a pessoa age. Painel que só exibe é decoração.

## Quando usar

- **SE** a pergunta da pessoa é "o que precisa de mim agora" **ENTÃO** a `pending-list` vem antes dos gráficos (variação `pending-first`).
- **SE** a pergunta é "como estamos indo" **ENTÃO** indicadores com comparação (contra o período anterior ou meta) e tendência.
- **SE** um indicador não leva a nenhuma ação **ENTÃO** remova-o ou mova para um relatório; o painel tem de 3 a 6 indicadores.
- **SE** cada número tem uma lista por trás **ENTÃO** o número é link para a `operational-list` já filtrada.
- **SE** perfis diferentes olham coisas diferentes **ENTÃO** use `dashboard-per-role`, não um painel com tudo.
- **SENÃO** (a pessoa vai trabalhar a lista inteira) **ENTÃO** comece pela `operational-list` com contadores nos filtros.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Visão geral (h1)    Atualizado 09:12 [Ação]        │
├──────────────────────────────────────────────────────────────┤
│ period-bar  [Este mês ▾]  comparar com: mês anterior          │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│ kpi-strip                                                     │
│ Vencem no mês│ Aguardando   │ Atrasados    │ Concluídos      │
│ 18  ↑4       │ 7            │ 3 ▲ atenção  │ 42  ↓2          │
├──────────────┴──────────────┴──────────────┴─────────────────┤
│ charts-area      Volume por semana  ▁▃▅▇▅▃                    │
├──────────────────────────────────────────────────────────────┤
│ pending-list   5 itens mais urgentes · Ver todos →             │
└──────────────────────────────────────────────────────────────┘
```

## O que vai em cada região

- **page-header** — `h1`, horário da última atualização dos dados e, se existir, uma primária (ex.: "Novo pedido"); exportar como secundária.
- **period-bar** — período com atalhos (hoje, 7 dias, mês, personalizado) e comparação; o período escolhido aparece por extenso e vale para todos os blocos.
- **kpi-strip** — de 3 a 6 cartões: rótulo, valor, variação com sinal e texto ("↑ 4 em relação ao mês anterior"), destaque de atenção com ícone além da cor; cada cartão é link para a lista filtrada.
- **charts-area** — 1 ou 2 gráficos que explicam a tendência; título que afirma a leitura, eixo com unidade, tabela alternativa acessível.
- **pending-list** — até 5–10 itens mais urgentes com motivo da urgência e ação direta, mais "Ver todos" para a lista completa.

## Ações

- **Primária:** no máximo uma, no `page-header`; muitos painéis não têm primária — tudo bem.
- **Navegação:** cada indicador e cada pendência leva a uma tela de trabalho; o painel não é beco sem saída.
- **Ações nas pendências:** uma ação curta por item (abrir, cobrar), nunca formulário embutido.
- **Atualizar:** botão para recarregar quando os dados não são em tempo real, com horário visível.

## Estados

- **loading** — esqueleto por bloco; cada bloco carrega de forma independente.
- **empty** — conta ou módulo novo, sem dados: explique o que aparecerá e leve à primeira ação produtiva (importar, criar).
- **no-data-in-period** — há dados, não no período escolhido: diga isso e sugira um período maior; nunca mostre zero como se fosse resultado.
- **partial** — um bloco falhou e os outros não: o bloco mostra erro próprio com "Tentar novamente"; os demais ficam.
- **stale** — os dados têm atraso conhecido (processamento noturno, sincronização): avise o horário de referência em destaque.
- **error** — falha geral: alerta na página com "Tentar novamente"; período escolhido preservado.
- **no-access** — o perfil não vê este painel ou parte dele: blocos restritos não aparecem; painel inteiro restrito explica a quem pedir acesso.

## Variações

### kpis-above-list
Faixa de indicadores no topo, gráficos no meio, pendências embaixo.
**Favorece:** gestão, leitura de tendência, reunião de acompanhamento.
**Piora:** quem precisa agir rola até encontrar o que fazer.

### pending-first
Lista de pendências no topo, indicadores compactos ao lado ou abaixo.
**Favorece:** quem opera; abre o painel para trabalhar.
**Piora:** a visão de tendência fica secundária; gestores perdem contexto.

### dashboard-per-role
Composição diferente por papel (operador, gestor, curador), definida pelo produto, não montada pela pessoa.
**Favorece:** cada perfil vê o que decide; menos ruído.
**Piora:** mais telas a manter e testar; quem troca de papel precisa reaprender; exige saber os papéis com precisão.

## Anti-padrões

- Doze cartões de número sem nenhum link.
- Variação comunicada só por verde e vermelho.
- Zero exibido quando o dado não carregou.
- Gráfico decorativo sem pergunta que ele responda.
- Período diferente em cada bloco sem dizer.
- Painel personalizável por arrastar como substituto de saber o que a pessoa precisa.

## Checklist

- [ ] De 3 a 6 indicadores, cada um com link para a lista filtrada.
- [ ] Variação com sinal, texto e ícone, não só cor.
- [ ] Período por extenso e comum a todos os blocos; horário de atualização visível.
- [ ] Falha de um bloco não derruba os outros.
- [ ] `no-data-in-period` distinto de `empty`.
- [ ] Gráficos com título que afirma a leitura e alternativa em tabela.
