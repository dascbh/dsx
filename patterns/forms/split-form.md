---
id: split-form
title: Quando dividir um formulário em várias etapas?
category: forms
components: [form, step-indicator, back-button, continue-button]
type: contextual-decision
impact: high
status: caution
evidence: strong
wcag: ["2.4.6", "2.4.3", "1.4.1", "3.3.7", "2.2.1", "1.3.1"]
related: [form-steps, field-order, autosave-vs-save, preserve-data-after-error]
---

# Quando dividir um formulário em várias etapas?

> **Regra:** Reduza campos antes de dividir telas; só crie etapas quando houver grupos com objetivo claro, e então preserve os dados, mostre o progresso e permita voltar e revisar.

## Contexto

Dividir não simplifica o formulário por si só. A decisão nasce da tarefa: que dados formam grupos compreensíveis, que sequência faz sentido e quanto esforço custará revisar, corrigir e retomar.

Cortar telas sem cortar esforço apenas empurra a complexidade para outro lugar. O que pesa é o total de campos que a pessoa lê e preenche, e não só o número de telas. Cada etapa soma navegação, carga e incerteza, e um formulário curto pode ficar pior quando é fatiado.

Etapas bem escolhidas dão estrutura, progresso e recuperação, e ajudam no celular.

## Decisão

- **SE** o formulário tem poucos campos **ENTÃO** mantenha em página única.
- **SE** há campos desnecessários **ENTÃO** remova antes de dividir; considere divulgação progressiva e teste página única.
- **SE** os campos formam grupos de objetivos distintos (dados pessoais, endereço, pagamento, revisão) **ENTÃO** divida por esses grupos.
- **SE** a ordem importa **ENTÃO** use sequência linear.
- **SE** o fluxo tem três ou mais etapas lineares **ENTÃO** use indicador de etapas.
- **SE** a lógica condicional altera o número de etapas **ENTÃO** não prometa total fixo; use indicação que não afirme total inexato.
- **SE** a pessoa precisa comparar seções ao mesmo tempo **ENTÃO** não divida.
- **SE** a pessoa pode sair e retomar **ENTÃO** salve o progresso e preserve os dados.
- **SENÃO** uma etapa por objetivo, nunca uma por campo.

## Quando usar

- Grupos de campos com objetivos distintos.
- Sequência natural de decisões.
- Tela única difícil de entender ou usar no mobile.
- Necessidade de salvar, sair e retomar.
- Etapas revisáveis antes da conclusão.

## Quando evitar

- Formulário curto → **use em vez disso:** página única.
- Comparação simultânea de seções → **use em vez disso:** página única com seções.
- Uma etapa por campo → **use em vez disso:** agrupar por objetivo.
- Divisão que só esconde campos desnecessários → **use em vez disso:** cortar os campos.
- Dados que não podem ser preservados → **use em vez disso:** página única.

## Faça

- Agrupe campos relacionados e dê a cada etapa um título claro.
- Mostre etapa atual e total quando o número é estável.
- Ofereça "Voltar" e "Continuar" separados do indicador.
- Permita revisar etapas concluídas.
- Mostre só etapas relevantes e permita ignorar as opcionais.

## Evite

- Etapas demais que alongam o progresso.
- Separar campos dependentes.
- Remover o "Voltar" ou apagar dados ao voltar.
- Usar o indicador como navegação.
- Dividir sem testar.

## Acessibilidade

- Título claro e hierarquia de cabeçalhos por etapa (2.4.6, 1.3.1).
- "Etapa X de Y" no título quando o total é conhecido.
- Etapa atual marcada com `aria-current`, sem depender só de cor (1.4.1).
- Ao trocar de etapa, mova o foco ao título ou conteúdo principal (2.4.3).
- Não peça de novo dados já informados na mesma sessão (3.3.7); sem limite de tempo sem ajuste (2.2.1).

## Microcópia

| Situação | Exemplo |
|---|---|
| Título | "Etapa 2 de 4: Endereço" |
| Avançar | "Continuar" |
| Retornar | "Voltar" |
| Última etapa | "Revisar e enviar" |
| Salvar | "Salvar e continuar depois" |

## Checklist de verificação

- [ ] A divisão representa objetivos ou grupos claros.
- [ ] Uma página única foi considerada e testada.
- [ ] Campos desnecessários foram removidos antes.
- [ ] Cada etapa tem título claro.
- [ ] O indicador representa o processo real.
- [ ] O total exibido é confiável.
- [ ] "Voltar" e "Continuar" têm rótulos claros.
- [ ] Os dados são preservados ao avançar e voltar.
- [ ] A pessoa consegue revisar etapas concluídas.
- [ ] O foco vai para a nova etapa.
- [ ] Foi testado com teclado, leitor de tela, zoom e mobile.

## Fundamentação

- Baymard Institute (checkout): a quantidade de campos considerados pesa mais que a de etapas; indicador com correspondência 1:1.
- Nielsen Norman Group (usabilidade de formulários): formulários curtos, sequência lógica, organização pela tarefa.
- W3C WAI (Multi-page Forms): etapas lógicas, progresso, dados preservados.
- USWDS (Step indicator): indicador para três ou mais etapas lineares; cautela com lógica condicional.
- IBM Carbon (Forms pattern): relação linear, progresso e revisão.
- GOV.UK Service Manual (Structuring forms): uma coisa por página e ramificação.
