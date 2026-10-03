---
id: skeleton-vs-spinner
title: Skeleton ou spinner: quando usar cada um?
category: feedback
components: [skeleton, spinner, progress-bar, loading]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["4.1.3", "2.2.2", "2.3.3", "1.4.1"]
related: [skeleton-screen, progress-percentage, long-loading, double-submit]
---

# Skeleton ou spinner: quando usar cada um?

> **Regra:** Skeleton para a carga inicial de conteúdo com formato conhecido; spinner inline para ações curtas; barra de progresso só quando houver medida real.

## Contexto

Sem retorno, tela vazia parece defeito e a ação parece não ter surtido efeito. Skeleton, spinner, loading de página, barra de progresso e carregamento progressivo atendem a casos diferentes. Para escolher, descubra o que está carregando, a duração provável, se a estrutura é previsível e se a pessoa ainda pode interagir.

O padrão errado também prejudica: spinner de página inteira esconde a estrutura, skeleton em controle não explica uma ação e porcentagem inventada cria falsa expectativa. Esperas sem retorno geram ansiedade e cliques repetidos.

Não existe limite de tempo universal. Os marcos clássicos de 0,1, 1 e 10 segundos são uma heurística histórica de resposta, e não critério para escolher o indicador.

## Decisão

- **SE** é a carga inicial de lista, card, tabela ou área com formato conhecido **ENTÃO** use skeleton que reproduza a estrutura aproximada.
- **SE** é ação assíncrona curta (salvar, atualizar, pesquisar, enviar) **ENTÃO** use spinner ou loading inline junto do alvo e impeça acionamento repetido.
- **SE** a página ou uma área crítica está realmente bloqueada **ENTÃO** use loading de página ou sobreposição apenas nessa área.
- **SE** a tarefa é longa e há etapas ou percentual reais **ENTÃO** use progresso determinado.
- **SE** a espera existe mas a duração é desconhecida **ENTÃO** use progresso indeterminado.
- **SE** a página é lenta ou usa várias fontes **ENTÃO** carregue de forma progressiva: estrutura primeiro, dados depois, sem apagar o que já existe.
- **SE** a espera é longa **ENTÃO** informe o estado e ofereça cancelar, tentar novamente ou sair.
- **SENÃO** spinner inline com rótulo.

## Quando usar

- Skeleton: carga inicial com layout previsível.
- Spinner inline: ação localizada.
- Progresso determinado: upload, download, importação com medida real.
- Progressivo: dashboards e filtros com várias fontes.

## Quando evitar

- Skeleton em botões, campos, menus, modais ou toasts → **use em vez disso:** spinner inline ou estado desabilitado com rótulo.
- Spinner de página para área pequena → **use em vez disso:** indicador local.
- Percentual sem medição → **use em vez disso:** indeterminado.
- Vários loaders concorrentes → **use em vez disso:** um indicador por escopo.
- Spinner sem erro nem saída → **use em vez disso:** timeout com tentar novamente.

## Faça

- Preserve o layout para evitar saltos.
- Aproxime o indicador do alvo.
- Informe conclusão, falha e timeout.
- Respeite redução de movimento.
- Teste duração e recuperação reais.

## Evite

- Bloquear a interface inteira sem necessidade.
- Simular porcentagem.
- Depender só de animação ou cor.
- Remover do DOM o controle que tem foco.

## Acessibilidade

- Comunique o estado por texto e semântica, não só por movimento (1.4.1).
- Use `role="status"` ou região aria-live, sem mover o foco (4.1.3).
- Use `aria-busy="true"` na região em atualização e remova ao terminar.
- Progresso determinado: `role="progressbar"` com nome e valores mínimo, atual e máximo.
- Spinner com rótulo acessível ("Salvando").
- Respeite `prefers-reduced-motion` (2.3.3) e dê controle sobre animações longas (2.2.2).

## Microcópia

| Situação | Exemplo |
|---|---|
| Spinner de ação | "Salvando…" |
| Carga de lista | "Carregando resultados…" |
| Espera longa | "Isso está levando mais tempo que o normal." |
| Timeout | "Não conseguimos carregar. Tentar novamente" |
| Concluído | "Resultados atualizados." |

## Checklist de verificação

- [ ] Está claro o que está carregando.
- [ ] O padrão escolhido corresponde ao escopo.
- [ ] O skeleton reflete a estrutura final.
- [ ] O spinner fica junto do alvo.
- [ ] A página só é bloqueada quando necessário.
- [ ] Porcentagens refletem progresso real.
- [ ] Esperas longas oferecem status e saída.
- [ ] Cliques duplicados são impedidos sem perder o foco.
- [ ] Há anúncio por região de status.
- [ ] Foi testado com teclado, zoom e redução de movimento.

## Fundamentação

- IBM Carbon (Loading pattern, Inline loading, Progress bar): diferença entre skeleton, loading e progresso; aviso contra loaders concorrentes.
- Shopify Polaris (Spinner): rótulo acessível e não usar spinner de página inteira.
- Padrão Digital GOV.BR (Loading): indicadores determinados e indeterminados com ARIA.
- W3C WAI (mensagens de status) e WCAG 4.1.3: estado anunciado sem mover o foco.
- Baymard Institute: ansiedade e cliques repetidos em esperas sem retorno.
- Nielsen Norman Group (tempos de resposta, indicadores de progresso): expectativa e feedback, com ressalva de que os limites são históricos.
- GitHub Primer (Degraded experiences): informar carregamento, erro e timeout.
