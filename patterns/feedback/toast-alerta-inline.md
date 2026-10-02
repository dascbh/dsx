---
id: toast-alerta-inline
titulo: Toast, alerta ou mensagem inline: qual usar?
categoria: feedback
componentes: [toast, alerta, mensagem-inline, banner]
tipo: decisao-contextual
impacto: medio
status: usar-com-cautela
evidencia: forte
wcag: ["4.1.3", "3.3.1", "1.4.1", "1.4.3", "2.1.1"]
relacionados: [duracao-de-toast, erros-em-formularios, confirmacao-de-sucesso, falha-temporaria]
---

# Toast, alerta ou mensagem inline: qual usar?

> **Regra:** Escolha o padrão pelo escopo da mensagem: toast para confirmação breve, inline para algo ligado a um elemento, alerta persistente para condição da página ou do serviço.

## Contexto

O retorno deve surgir no local e na hora adequados. Toast, alerta e mensagem inline não são versões visuais de um mesmo recurso: cada um tem escopo, duração e nível de interação próprios.

Um toast que desaparece pode ocultar um erro que exige correção. Uma mensagem inline distante do campo atrapalha o entendimento. Um alerta persistente para qualquer evento gera interrupção em excesso e desgasta a atenção.

A escolha acertada indica o que ocorreu, que parte da interface foi atingida e qual é o passo seguinte.

## Decisão

- **SE** é sucesso, informação breve ou ação de baixo impacto **ENTÃO** use toast.
- **SE** o feedback pertence a um campo, item, formulário ou seção **ENTÃO** use mensagem inline, junto ao elemento, até o problema ser resolvido ou dispensado.
- **SE** a condição atinge a página, o serviço ou boa parte da experiência **ENTÃO** adote alerta persistente, com uma ação clara se houver.
- **SE** é erro que exige correção **ENTÃO** nunca use toast; use inline ou alerta.
- **SE** a informação é crítica **ENTÃO** não a deixe apenas em mensagem temporária.
- **SE** a mensagem tem ação **ENTÃO** mantenha-a disponível até a ação ser realizada.
- **SE** a situação exige bloqueio ou decisão imediata **ENTÃO** use modal.
- **SE** há várias mensagens **ENTÃO** priorize e não empilhe sem ordem.
- **SENÃO** prefira inline, perto do que mudou.

## Quando usar

- Toast: sucesso, informação breve, ações de baixo impacto.
- Inline: erros, validações e orientações ligadas a um elemento.
- Alerta persistente: condições de página ou serviço.
- Modal: só quando a situação exige bloqueio.
- Consulta posterior para mensagens que desaparecem.

## Quando evitar

- Toast para erros que exigem correção → **use em vez disso:** mensagem inline.
- Informação crítica em mensagem temporária → **use em vez disso:** alerta persistente.
- Inline para problema que afeta toda a página → **use em vez disso:** alerta de página.
- Alerta persistente para feedback rotineiro → **use em vez disso:** toast.
- Várias mensagens empilhadas sem prioridade → **use em vez disso:** uma por vez, ordenadas.

## Faça

- Relacione a mensagem ao elemento afetado.
- Explique o que aconteceu.
- Mostre o próximo passo.
- Mantenha textos curtos.
- Preserve mensagens que exigem ação.
- Permita consultar mensagens importantes depois.

## Evite

- Usar toast para tudo.
- Fazer erro importante desaparecer.
- Colocar mensagem longe do problema.
- Repetir o mesmo aviso em vários lugares.
- Texto genérico.
- Interromper sem necessidade.

## Acessibilidade

- Mensagens sem ação não roubam o foco; anuncie sem interromper o fluxo (4.1.3).
- Use role status para informação simples e role alert somente para urgência real.
- Mensagens com ação ficam disponíveis a teclado e leitor de tela; botão de fechar com nome acessível (2.1.1).
- Mensagem temporária nunca é o único meio de acessar uma informação importante.
- Erros de campo ligados ao controle e descritos em texto (3.3.1).
- Não dependa só de cor ou ícone (1.4.1); mantenha contraste (1.4.3) e foco visível.
- Teste zoom, teclado e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Toast de sucesso | "Perfil atualizado." |
| Inline em campo | "Informe um e-mail válido, como nome@empresa.com." |
| Alerta de página | "Estamos com instabilidade no envio de boletos. Acompanhar status" |
| Fechar | "Fechar aviso" |
| Falha com ação | "Não foi possível salvar. Tentar novamente" |

## Checklist de verificação

- [ ] O padrão corresponde ao escopo da mensagem.
- [ ] Mensagens de campo estão adjacentes ao campo.
- [ ] Nenhum erro que exige correção aparece apenas em toast.
- [ ] Mensagens com ação não somem sozinhas.
- [ ] Há próximo passo claro.
- [ ] Mensagens importantes podem ser consultadas depois.
- [ ] A mensagem não depende só de cor ou ícone.
- [ ] O botão de fechar tem nome acessível.
- [ ] Testado com teclado e leitor de tela.

## Fundamentação

- IBM Carbon, padrão, uso e acessibilidade de notificações: inline, toast, acionável, banner e modal por escopo, permanência e interrupção; papéis status, alert e log.
- Padrão Digital de Governo, mensagem e notificação: mensagens globais e contextuais, feedback próximo ao elemento.
- Adobe Spectrum, redação de erros: alertas inline para objetos e validação; temporárias para baixa consequência.
- U.S. Web Design System, alerta: mensagem persistente no contexto da página.
- GOV.UK Design System, banner de notificação: informação persistente que afeta o serviço.
- Baymard Institute: validação inline ajuda a localizar e corrigir; validação prematura frustra (evidência de formulários e checkout).
- Nielsen Norman Group, 10 heurísticas: visibilidade do status e recuperação de erros.
- Interaction Design Foundation: feedback claro, pouco interruptivo e fácil de dispensar.
