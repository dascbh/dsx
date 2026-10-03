---
id: close-modal
title: Como fechar um modal corretamente?
category: modals
components: [modal, button]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["2.1.2", "2.4.3", "2.4.7", "4.1.2"]
related: [when-to-use-modal, when-to-avoid-modal, confirm-action, keyboard-focus]
---

# Como fechar um modal corretamente?

> **Regra:** Todo modal tem uma saída visível e nomeada, descarta dados somente com confirmação e devolve o foco ao elemento que o abriu.

## Contexto

Fechar um modal vai além de tirar uma camada da tela. A pessoa precisa saber que ação encerra o diálogo, o destino do que foi digitado e onde o foco vai parar.

Sem saída clara, o usuário fica preso, perde dados ou não sabe se a tarefa terminou. Para quem usa teclado ou leitor de tela, perder o ponto de retorno desorienta por completo.

Fechar, cancelar, salvar e descartar são ações diferentes e devem ter rótulos diferentes.

## Decisão

- **SE** o modal é aberto por um controle **ENTÃO** ao fechar devolva o foco a esse controle.
- **SE** a tarefa pode ser abandonada **ENTÃO** ofereça "Cancelar" ao lado de uma ação primária com verbo específico.
- **SE** o modal tem botão de fechar apenas com ícone **ENTÃO** dê a ele nome acessível "Fechar".
- **SE** há dados não salvos **ENTÃO** preserve-os ou peça confirmação explícita antes de descartar.
- **SE** Escape pode encerrar sem perda **ENTÃO** habilite Escape; **SE** apagaria trabalho **ENTÃO** acione confirmação.
- **SE** o modal é transacional **ENTÃO** priorize "Cancelar" e a ação primária em vez de depender só do X.
- **SENÃO** mantenha o X visível no canto do diálogo.

## Quando usar

- Modais com saída visível e compreensível.
- Casos em que fechar, cancelar e salvar têm efeitos distintos.
- Diálogos em que o foco pode retornar ao acionador.

## Quando evitar

- X sem nome acessível como única saída → **use em vez disso:** botão com `aria-label="Fechar"` mais ação textual.
- "Sim", "Não" ou "OK" ambíguos → **use em vez disso:** verbos específicos.
- Fluxo longo com rolagem dentro do modal → **use em vez disso:** página própria.

## Faça

- Nomeie o botão de fechar.
- Diferencie fechar, cancelar e salvar nos rótulos.
- Confirme antes de descartar dados.
- Remova o bloqueio do fundo ao fechar.
- Retorne o foco ao acionador.

## Evite

- Descartar dados silenciosamente.
- Deixar o foco escapar para trás do modal.
- Usar "Sim"/"Não" isolados.
- Perder o contexto da tela de origem.

## Acessibilidade

- Use `role="dialog"`, título via `aria-labelledby` e `aria-modal="true"` apenas se o fundo estiver realmente inativo.
- Ao abrir, mova o foco para um controle adequado; Tab e Shift+Tab ficam contidos no modal (WCAG 2.1.2, 2.4.3).
- Foco visível em todos os controles (WCAG 2.4.7).
- Ícone sem texto precisa de nome acessível (WCAG 4.1.2).
- Teste com teclado, zoom e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Botão de ícone | "Fechar" |
| Abandonar tarefa | "Cancelar" |
| Salvar | "Salvar alterações" |
| Confirmar descarte | "Descartar alterações" / "Continuar editando" |

## Checklist de verificação

- [ ] Existe botão de fechar visível?
- [ ] O botão tem nome acessível?
- [ ] Fechar, cancelar e salvar têm rótulos distintos?
- [ ] Escape fecha quando não há perda de dados?
- [ ] O foco fica contido no modal enquanto aberto?
- [ ] O foco retorna ao acionador ao fechar?
- [ ] Dados não salvos são preservados ou confirmados?
- [ ] O fundo volta a ficar interativo?

## Fundamentação

- W3C WAI-ARIA APG (Dialog Modal): foco inicial, contenção, Escape, retorno ao acionador, nome acessível.
- IBM Carbon (Modal, acessibilidade e uso): ciclo de Tab, Escape, X, diferença entre modais passivas e transacionais.
- Padrão Digital GOV.BR (Modal): ações distintas e delimitadas.
- U.S. Web Design System (Modal): comportamentos de interação.
- AMAWeb (checklist de acessibilidade): verificação de teclado, foco e identificação.
