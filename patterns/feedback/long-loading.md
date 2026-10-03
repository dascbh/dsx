---
id: long-loading
title: Como tratar carregamentos que demoram muito?
category: feedback
components: [loading-indicator, progress-bar, skeleton]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["4.1.3", "2.2.2", "2.3.3"]
related: [skeleton-vs-spinner, progress-percentage, skeleton-screen, double-submit]
---

# Como tratar carregamentos que demoram muito?

> **Regra:** Escolha o indicador pela duração e pelo tipo de espera: nada abaixo de 1 s, indeterminado de 1 a 3 s, progresso real acima de 3 s e, acima de 10 s, preserve a tarefa e ofereça continuar, cancelar ou acompanhar depois.

## Contexto

Quando a resposta demora, a pessoa precisa saber se o sistema está trabalhando, quanto avançou e o que pode fazer enquanto espera. Sem retorno, a espera parece falha e leva a cliques repetidos, abandono e perda de confiança.

O indicador não acelera o processo, mas reduz a incerteza e ajuda a decidir se espera ou tenta outra coisa. A escolha depende da duração esperada, de haver progresso mensurável e do escopo afetado.

Os intervalos abaixo são heurísticas de projeto cruzadas de várias fontes, não limites universais.

## Decisão

- **SE** a operação leva menos de 1 s **ENTÃO** não mostre indicador, para evitar flash.
- **SE** dura de 1 a 3 s **ENTÃO** exiba carregamento indeterminado e localizado, caso a espera seja notada.
- **SE** leva mais de 3 s e há estimativa confiável **ENTÃO** use progresso determinado; **SENÃO** mantenha estado indeterminado com contexto textual.
- **SE** ultrapassa 10 s **ENTÃO** não deixe spinner sem fim: informe o estado, guarde a tarefa e permita seguir, cancelar ou acompanhar depois.
- **SE** a estrutura do conteúdo é conhecida e aparece em partes **ENTÃO** use skeleton; **SENÃO** não use.
- **SE** o carregamento afeta uma área pequena **ENTÃO** limite o indicador a ela; não use overlay de página inteira.
- **SE** o estado muda **ENTÃO** troque o indicador por sucesso, erro ou cancelamento.
- **SE** é um envio **ENTÃO** bloqueie cliques duplicados sem apagar dados.
- **SENÃO** mantenha apenas um indicador por contexto.

## Quando usar

- Buscas, filtros e carga de dados lentos.
- Envios, importações, exportações e cálculos demorados.
- Operações de duração variável (rede, volume, serviço externo).
- Processos que podem seguir em segundo plano.

## Quando evitar

- Operação tão rápida que o indicador pisca → **use em vez disso:** nenhum indicador.
- Spinner sem contexto nem saída → **use em vez disso:** texto de status + opção de continuar ou cancelar.
- Porcentagem sem avanço real → **use em vez disso:** indeterminado.
- Vários loaders simultâneos → **use em vez disso:** um por contexto.

## Faça

- Diga o que está carregando.
- Mostre progresso só quando mensurável.
- Preserve contexto e dados.
- Ofereça cancelar ou recuperar quando seguro.
- Termine sempre em sucesso, erro ou cancelamento.

## Evite

- Spinner sem explicação.
- Bloqueio total da tela sem necessidade.
- Promessas de tempo imprecisas.
- Cliques duplicados processados.

## Acessibilidade

- Texto compreensível associado, como "Carregando resultados".
- `role="status"` ou `aria-live="polite"` para mensagens, sem mover o foco (WCAG 4.1.3); `aria-busy="true"` na região afetada.
- Use semântica de barra de progresso só com valor atual real; não invente `aria-valuenow` para indeterminado.
- Não dependa de cor, movimento ou som; respeite redução de movimento (WCAG 2.3.3).
- Informe conclusão, falha e cancelamento de forma programática.

## Microcópia

| Situação | Exemplo |
|---|---|
| Indeterminado | "Carregando resultados…" |
| Determinado | "Importando… 75%" |
| Longo | "Isso pode levar alguns minutos. Você pode continuar usando o sistema e avisaremos ao terminar." |
| Cancelar | "Cancelar importação" |
| Falha | "A importação não foi concluída. Tentar novamente" |

## Checklist de verificação

- [ ] O estado diz o que está carregando?
- [ ] O indicador está no escopo correto?
- [ ] Esperas menores que 1 s não exibem indicador?
- [ ] A porcentagem reflete avanço real?
- [ ] O skeleton espelha a estrutura esperada?
- [ ] Acima de 10 s há opção de continuar, cancelar ou acompanhar?
- [ ] O carregamento termina em sucesso, erro ou cancelamento?
- [ ] Envios duplicados são evitados?
- [ ] O status é anunciado sem mover o foco?

## Fundamentação

- Nielsen Norman Group: indicadores de progresso reduzem a incerteza e aumentam a tolerância à espera.
- Baymard Institute: impaciência e cliques repetidos em etapas lentas de e-commerce.
- GitHub Primer (Loading): esperas curtas, indeterminado, determinado e tarefas longas.
- IBM Carbon (Loading): skeleton para conteúdo progressivo, escopo, evitar múltiplos loaders.
- WCAG 2.2, 4.1.3 (Status Messages).
- Padrão Digital GOV.BR (Loading): determinado com cancelar e indeterminado.
