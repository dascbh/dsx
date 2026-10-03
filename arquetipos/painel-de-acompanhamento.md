---
id: painel-de-acompanhamento
titulo: Painel de acompanhamento
resumo: Tela de visão geral que responde como as coisas estão e o que pede atenção agora, com indicadores, tendências e uma lista curta de pendências.
registro: [operacional]
quando-usar: SE a pessoa precisa saber a situação de um conjunto e decidir onde agir primeiro ENTÃO use painel de acompanhamento
evitar-quando: a pessoa vai agir item a item sobre a lista inteira (use lista operacional), os números não levam a nenhuma decisão ou só há um indicador
regioes: [cabecalho-da-pagina, barra-de-periodo, faixa-de-indicadores, area-de-graficos, lista-de-pendencias]
acao-primaria: { regiao: cabecalho-da-pagina, posicao: topo-direita, max: 1 }
estados: [carregando, vazio, sem-dados-no-periodo, parcial, desatualizado, erro, sem-acesso]
padroes: [filtro-de-periodo, skeleton-screen, estado-vazio, falha-temporaria, tentar-novamente, nao-so-cor, tabela-vs-cards, carregamento-longo]
variacoes: [indicadores-acima-da-lista, pendencias-primeiro, painel-por-perfil]
regras: [T1, T3, T6, F1, F2]
---

# Painel de acompanhamento

A tela de entrada de um módulo ou de uma carteira: quantos contratos vencem neste mês, quantos aguardam resposta de terceiros, como evoluiu o volume, o que está atrasado. Cada número precisa responder "e daí?" — levar a uma lista filtrada onde a pessoa age. Painel que só exibe é decoração.

## Quando usar

- **SE** a pergunta da pessoa é "o que precisa de mim agora" **ENTÃO** a `lista-de-pendencias` vem antes dos gráficos (variação `pendencias-primeiro`).
- **SE** a pergunta é "como estamos indo" **ENTÃO** indicadores com comparação (contra o período anterior ou meta) e tendência.
- **SE** um indicador não leva a nenhuma ação **ENTÃO** remova-o ou mova para um relatório; o painel tem de 3 a 6 indicadores.
- **SE** cada número tem uma lista por trás **ENTÃO** o número é link para a `lista-operacional` já filtrada.
- **SE** perfis diferentes olham coisas diferentes **ENTÃO** use `painel-por-perfil`, não um painel com tudo.
- **SENÃO** (a pessoa vai trabalhar a lista inteira) **ENTÃO** comece pela `lista-operacional` com contadores nos filtros.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ cabecalho-da-pagina  Visão geral (h1)    Atualizado 09:12 [Ação]│
├──────────────────────────────────────────────────────────────┤
│ barra-de-periodo  [Este mês ▾]  comparar com: mês anterior    │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│ faixa-de-indicadores                                          │
│ Vencem no mês│ Aguardando   │ Atrasados    │ Concluídos      │
│ 18  ↑4       │ 7            │ 3 ▲ atenção  │ 42  ↓2          │
├──────────────┴──────────────┴──────────────┴─────────────────┤
│ area-de-graficos      Volume por semana  ▁▃▅▇▅▃               │
├──────────────────────────────────────────────────────────────┤
│ lista-de-pendencias   5 itens mais urgentes · Ver todos →      │
└──────────────────────────────────────────────────────────────┘
```

## O que vai em cada região

- **cabecalho-da-pagina** — `h1`, horário da última atualização dos dados e, se existir, uma primária (ex.: "Novo contrato"); exportar como secundária.
- **barra-de-periodo** — período com atalhos (hoje, 7 dias, mês, personalizado) e comparação; o período escolhido aparece por extenso e vale para todos os blocos.
- **faixa-de-indicadores** — de 3 a 6 cartões: rótulo, valor, variação com sinal e texto ("↑ 4 em relação ao mês anterior"), destaque de atenção com ícone além da cor; cada cartão é link para a lista filtrada.
- **area-de-graficos** — 1 ou 2 gráficos que explicam a tendência; título que afirma a leitura, eixo com unidade, tabela alternativa acessível.
- **lista-de-pendencias** — até 5–10 itens mais urgentes com motivo da urgência e ação direta, mais "Ver todos" para a lista completa.

## Ações

- **Primária:** no máximo uma, no `cabecalho-da-pagina`; muitos painéis não têm primária — tudo bem.
- **Navegação:** cada indicador e cada pendência leva a uma tela de trabalho; o painel não é beco sem saída.
- **Ações nas pendências:** uma ação curta por item (abrir, cobrar), nunca formulário embutido.
- **Atualizar:** botão para recarregar quando os dados não são em tempo real, com horário visível.

## Estados

- **carregando** — esqueleto por bloco; cada bloco carrega de forma independente.
- **vazio** — conta ou módulo novo, sem dados: explique o que aparecerá e leve à primeira ação produtiva (importar, criar).
- **sem-dados-no-periodo** — há dados, não no período escolhido: diga isso e sugira um período maior; nunca mostre zero como se fosse resultado.
- **parcial** — um bloco falhou e os outros não: o bloco mostra erro próprio com "Tentar novamente"; os demais ficam.
- **desatualizado** — os dados têm atraso conhecido (processamento noturno, sincronização): avise o horário de referência em destaque.
- **erro** — falha geral: alerta na página com "Tentar novamente"; período escolhido preservado.
- **sem-acesso** — o perfil não vê este painel ou parte dele: blocos restritos não aparecem; painel inteiro restrito explica a quem pedir acesso.

## Variações

### indicadores-acima-da-lista
Faixa de indicadores no topo, gráficos no meio, pendências embaixo.
**Favorece:** gestão, leitura de tendência, reunião de acompanhamento.
**Piora:** quem precisa agir rola até encontrar o que fazer.

### pendencias-primeiro
Lista de pendências no topo, indicadores compactos ao lado ou abaixo.
**Favorece:** quem opera; abre o painel para trabalhar.
**Piora:** a visão de tendência fica secundária; gestores perdem contexto.

### painel-por-perfil
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
- [ ] `sem-dados-no-periodo` distinto de `vazio`.
- [ ] Gráficos com título que afirma a leitura e alternativa em tabela.
