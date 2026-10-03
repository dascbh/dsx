---
id: skeleton-screen
title: Skeleton screen melhora a percepção de carregamento?
category: feedback
components: [skeleton, loading-indicator, table, card]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["4.1.3", "2.3.3", "1.4.1", "2.4.3"]
related: [skeleton-vs-spinner, long-loading, progress-percentage, empty-state]
---

# Skeleton screen melhora a percepção de carregamento?

> **Regra:** Use skeleton quando a estrutura do conteúdo for previsível e a espera for perceptível; ele melhora a percepção, não o desempenho real.

## Contexto

Skeleton é um substituto que imita, de modo simplificado, a estrutura do conteúdo enquanto os dados chegam. Ele antecipa o que vai surgir e deixa uma espera moderada mais tolerável, sem encurtar o tempo real.

A escolha depende do contexto. Skeleton funciona melhor em carregamento de página ou de áreas grandes com estrutura conhecida; spinner serve para ação curta ou módulo isolado; barra de progresso serve quando o avanço é mensurável.

Um substituto impreciso, animado por muito tempo ou deixado na tela após uma falha piora a frustração e passa uma falsa impressão de desempenho. O ganho é perceptivo e depende de como se executa; tempo de resposta, estabilidade do layout e recuperação de erros seguem como responsabilidade do produto.

## Decisão

- **SE** há espera perceptível e forma, hierarquia e tamanho do conteúdo são previsíveis **ENTÃO** use skeleton.
- **SE** o carregamento costuma ser imediato **ENTÃO** não mostre estado intermediário, para não piscar.
- **SE** o processo tem progresso mensurável (upload, exportação) **ENTÃO** use indicador determinado.
- **SE** o conteúdo pode assumir formas muito diferentes ou a ação é localizada (um botão, um pequeno controle) **ENTÃO** use spinner no escopo da operação.
- **SE** o carregamento falha **ENTÃO** substitua o skeleton por erro com recuperação.
- **SE** o resultado é vazio **ENTÃO** substitua por estado vazio.
- **SE** o skeleton for usado **ENTÃO** reproduza o layout final e reserve o espaço, para evitar salto visual.
- **SENÃO** use indicador de carregamento adequado ao escopo.

## Quando usar

- Estrutura final previsível.
- Espera longa o bastante para justificar um estado intermediário.
- Placeholder consegue reservar o espaço do conteúdo.
- A página permanece reconhecível durante o carregamento.
- Transição para o conteúdo final sem salto visual.
- O estado pode virar erro, vazio ou sucesso.

## Quando evitar

- Resposta quase imediata → **use em vez disso:** nenhum indicador.
- Conteúdo de forma imprevisível → **use em vez disso:** spinner.
- Progresso mensurável → **use em vez disso:** barra de progresso.
- Pequeno controle ou ação momentânea → **use em vez disso:** spinner local.
- Placeholder que esconde falha ou vazio → **use em vez disso:** estado de erro ou vazio.
- Animação que distrai → **use em vez disso:** placeholder estático.

## Faça

- Reproduza o layout final.
- Reserve o espaço do conteúdo.
- Mostre o estado no escopo certo.
- Use movimento com moderação.
- Remova o placeholder ao concluir.
- Meça o tempo real e a percepção.

## Evite

- Usar por padrão.
- Simular progresso.
- Deixar a tela vazia.
- Animar sem fim.
- Esconder falhas.
- Tratar skeleton como otimização de desempenho.

## Acessibilidade

- Informe que a área está carregando uma única vez, sem anunciar cada placeholder.
- Use aria-busy="true" na região durante a carga e remova ao concluir.
- Mensagens de status via role="status", sem mover o foco (4.1.3).
- Não se apoie só em cor, brilho ou movimento para transmitir o estado (1.4.1).
- Respeite prefers-reduced-motion (2.3.3).
- Mantenha a ordem de foco estável (2.4.3) e oculte linhas decorativas da leitura assistiva.
- Valide com teclado, zoom e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Anúncio único para leitor de tela | "Carregando pedidos" |
| Falha | "Não foi possível carregar os pedidos. Tentar novamente" |
| Vazio | "Você ainda não tem pedidos." |

## Checklist de verificação

- [ ] O carregamento dura o bastante para justificar o skeleton.
- [ ] O placeholder tem a mesma estrutura e o mesmo espaço do conteúdo final.
- [ ] Não há salto de layout quando os dados chegam.
- [ ] Falha e vazio substituem o skeleton.
- [ ] Uploads e exportações usam progresso mensurável.
- [ ] A animação é sutil e respeita movimento reduzido.
- [ ] A região tem aria-busy durante a carga.
- [ ] O leitor de tela ouve um único aviso, não um por placeholder.
- [ ] O tempo real de carregamento também foi otimizado.

## Fundamentação

- Nielsen Norman Group, skeleton screens: placeholder semelhante a wireframe, efeito na percepção, diferença para spinner e barra de progresso, risco de moldura vazia.
- W3C WAI-ARIA, aria-busy e técnica ARIA22 (role=status): comunicar estado sem roubar foco.
- IBM Carbon, padrões de carregamento: skeleton, indicadores e carregamento progressivo.
- GitHub Primer, carregamento e tabela de dados: skeleton para grandes áreas e um único anúncio de carregamento.
- Atlassian Design System, skeleton: variações básica e com shimmer, com cautela sobre animação.
