---
id: form-steps
title: Como estruturar etapas em formulários longos?
category: forms
components: [step-indicator, form, button, review-summary]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "2.4.6", "3.3.1", "3.3.4", "2.2.1"]
related: [split-form, preserve-data-after-error, field-order, autosave-vs-save, validation-timing]
---

# Como estruturar etapas em formulários longos?

> **Regra:** Organize cada etapa por objetivo, mostre posição e progresso separados da navegação e preserve, permita revisar e recupere os dados ao avançar, voltar ou retomar.

## Contexto

Uma vez definido que o formulário precisa de etapas, é a estrutura que determina se a pessoa sabe onde está, o que falta e como corrigir o que preencheu. Etapa não é um trecho visual da página: é um objetivo ou conjunto de decisões, ligado às demais, que permite avançar, voltar, revisar e retomar sem perdas.

A decisão de dividir ou não está no padrão relacionado; aqui trata-se de como estruturar.

Etapas reduzem o que está visível por vez, mas acrescentam navegação, espera e incerteza. Um estudo controlado com profissionais de saúde mostrou página única melhor naquela tarefa; em checkout, o esforço percebido e o número de campos pesam mais que o número isolado de etapas. Portanto cada etapa deve organizar parte real da tarefa, não esconder campos.

## Decisão

- **SE** a divisão é por quantidade de campos **ENTÃO** refaça por objetivo ou grupo de decisões.
- **SE** campos dependem uns dos outros **ENTÃO** mantenha-os na mesma etapa.
- **SE** o fluxo é linear com 3 ou mais etapas de alto nível **ENTÃO** mostre indicador com etapa atual, concluídas e restantes.
- **SE** o total de etapas muda por condição **ENTÃO** não prometa "Etapa X de Y" fixo.
- **SE** o total é confiável **ENTÃO** informe "Etapa X de Y" no cabeçalho da etapa.
- **SE** há indicador **ENTÃO** separe-o dos botões; o indicador orienta e os botões agem.
- **SE** a pessoa volta ou avança **ENTÃO** preserve todas as respostas.
- **SE** a tarefa tem consequência importante **ENTÃO** mostre resumo para revisão antes do envio e permita editar etapas concluídas.
- **SE** há erro **ENTÃO** associe-o ao campo e mantenha as respostas válidas.
- **SENÃO** rotule a última ação de forma específica ("Revisar e enviar", "Concluir").

## Quando usar

- Três ou mais grupos de alto nível com sequência compreensível.
- Cada etapa com objetivo próprio e título curto.
- Dependências entre decisões que tornam a ordem importante.
- Produto capaz de preservar, revisar e recuperar dados.

## Quando evitar

- Formulário curto → **use em vez disso:** página única.
- Comparação entre campos de grupos diferentes → **use em vez disso:** mesma página.
- Divisão só para esconder campos → **use em vez disso:** cortar os campos desnecessários.
- Impossível preservar respostas → **use em vez disso:** página única.
- Indicador como único meio de navegação → **use em vez disso:** botões Voltar e Continuar.

## Faça

- Dê a cada etapa um título que diga o resultado dela.
- Mantenha Voltar e Continuar em posição e comportamento previsíveis.
- Teste a tarefa completa com pessoas.

## Evite

- Muitas etapas pequenas.
- Fragmentar uma decisão única.
- Apagar dados ao voltar.
- Usar o indicador como menu.

## Acessibilidade

- Título semântico por etapa; etapa atual identificável por texto e estrutura, não só cor (1.3.1, 2.4.6).
- Indicador em lista ordenada com `aria-current="step"` no item atual (técnica de implementação, não requisito isolado).
- Instruções necessárias repetidas em todas as etapas; etapas opcionais identificadas.
- Evite limite de tempo rígido; se indispensável, permita estender (2.2.1).
- Revisão antes de envio crítico (3.3.4); erros associados aos campos (3.3.1).
- Tudo operável por teclado, zoom e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Posição | "Etapa 2 de 4: Endereço de entrega" |
| Avançar | "Continuar" |
| Voltar | "Voltar" |
| Última | "Revisar e enviar" |
| Retomada | "Retomamos de onde você parou." |

## Checklist de verificação

- [ ] Cada etapa representa um objetivo ou grupo de decisões.
- [ ] Campos relacionados permanecem juntos.
- [ ] O título da etapa informa o que fazer.
- [ ] Dá para identificar a etapa atual sem depender da cor.
- [ ] O progresso mostra concluído e restante.
- [ ] O indicador está separado dos botões de navegação.
- [ ] Voltar não apaga dados.
- [ ] Existe revisão antes do envio quando há consequência importante.
- [ ] Erros permanecem associados aos campos.
- [ ] O fluxo passou por teste com leitor de tela, teclado e zoom.

## Fundamentação

- W3C WAI (formulários multipágina): grupos lógicos, instruções repetidas e comunicação do progresso.
- W3C WAI, técnica ARIA26: `aria-current` para identificar o item atual.
- U.S. Web Design System (Step indicator): fluxos lineares com três ou mais etapas, indicador separado da navegação.
- IBM Carbon (padrão de formulários): agrupar tarefas relacionadas, salvar, voltar e revisar; sem solução única.
- GOV.UK Design System (estruturação de formulários): uma pergunta ou decisão por página como ponto de partida, validado por pesquisa.
- Estudo controlado em saúde (JMIR Human Factors, 2021) comparando página única, multietapas e conversacional: alerta contra fragmentação; amostra e contexto específicos.
- Baymard Institute (fluxo e campos de checkout): esforço e número de campos pesam mais que o número de etapas.
- Padrão Digital de Governo (GOV.BR), Step e Wizard: progresso, etapas condicionais e risco de perda de dados.
