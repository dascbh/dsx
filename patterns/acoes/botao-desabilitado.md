---
id: botao-desabilitado
titulo: Esconder ou desabilitar uma ação indisponível?
categoria: acoes
componentes: [botao, botao-desabilitado, tooltip]
tipo: decisao-contextual
impacto: alto
status: usar-com-cautela
evidencia: moderada
wcag: ["4.1.2", "2.1.1", "1.4.1", "1.4.3", "2.4.7"]
relacionados: [hierarquia-de-botoes, clique-duplo-em-envio, mensagem-de-erro-util, campos-obrigatorios]
---

# Esconder ou desabilitar uma ação indisponível?

> **Regra:** Esconda a ação irrelevante; mantenha visível e explicada a ação central que está temporariamente bloqueada; nunca desabilite sem dizer por quê.

## Contexto

Uma ação fica indisponível quando falta um pré-requisito, quando não cabe no contexto, quando a pessoa não tem permissão ou quando há falha do sistema. É preciso escolher entre retirar o controle da tela e deixá-lo bloqueado.

Esconder e desabilitar passam mensagens distintas. Esconder diminui o ruído; desabilitar mantém a ação visível e no mesmo lugar, mas barra o uso. Botão com aparência ativa que não reage deixa dúvida; botão oculto pode sugerir que o recurso nem existe.

O atributo nativo disabled costuma retirar o controle da ordem de tabulação, o que reduz a descoberta por teclado e leitor de tela. Por isso a escolha afeta clareza, prevenção de erro e acessibilidade.

## Decisão

- **SE** a ação é irrelevante para o contexto e sua ausência não desorienta **ENTÃO** esconda.
- **SE** a ação é permanentemente indisponível para a pessoa e não há caminho de solicitação ou upgrade **ENTÃO** esconda.
- **SE** a ação é central ao fluxo e falta uma condição clara e temporária **ENTÃO** mantenha visível, desabilitada e com o requisito em texto persistente ao lado.
- **SE** a pessoa precisa consultar o motivo ao focar ou acionar o controle **ENTÃO** use estado inativo focável que responde com a explicação; não marque aria-disabled="true" se ele ainda puder ser acionado.
- **SE** o controle não pode ser acionado mas deve continuar descoberto por teclado **ENTÃO** use aria-disabled="true" e bloqueie a operação no código.
- **SE** a disponibilidade ainda está sendo carregada **ENTÃO** mostre estado de carregamento, não esconda nem desabilite sem contexto.
- **SE** o bloqueio vem de falha, permissão ou limitação da plataforma **ENTÃO** ofereça explicação persistente, alternativa ou caminho de recuperação.
- **SE** o conteúdo deve ser consultado mas não editado **ENTÃO** use somente leitura, não desabilitado.
- **SE** validar no clique e explicar o que falta é viável **ENTÃO** prefira isso a desabilitar.
- **SE** o botão evita novo envio durante o processamento **ENTÃO** desabilite e comunique o carregamento.

## Quando usar

- Esconder: ação sem sentido no contexto ou sem possibilidade de acesso para a pessoa.
- Desabilitar: pré-requisito claro e temporário, posição que ajuda a entender o fluxo, ação central da tarefa.
- Inativo focável: a explicação depende de foco ou acionamento.

## Quando evitar

- Esconder ação central só porque está temporariamente indisponível → **use em vez disso:** mantê-la visível com explicação.
- Desabilitar sem explicar → **use em vez disso:** texto de requisito persistente próximo.
- Tooltip como única explicação de controle nativo disabled → **use em vez disso:** texto visível ou estado inativo focável.
- Apenas pointer-events: none → **use em vez disso:** bloqueio real no código.
- aria-hidden="true" em ação focável → **use em vez disso:** remover do DOM ou do foco.

## Faça

- Classifique a causa: irrelevante, pré-requisito, carregamento, permissão ou falha.
- Mostre o requisito perto do controle.
- Preserve rótulo e posição da ação principal.
- Reative o controle assim que a condição for atendida.
- Comunique a reativação quando for importante.
- Teste teclado, leitor de tela, zoom e alto contraste.

## Evite

- Esconder a ação principal sem dizer como concluir a tarefa.
- Deixar o controle desabilitado após a condição ser atendida.
- Usar só cinza, opacidade ou baixo contraste como sinal.
- Aplicar aria-disabled="true" e deixar a operação ainda executável.
- Manter permanentemente desabilitado um controle sem razão para existir.
- Remover ação importante durante falha temporária.

## Acessibilidade

- O atributo disabled remove o controle da tabulação e da operação; use quando a pessoa não precisa descobrir a ação naquele estado (4.1.2).
- Para manter a descoberta, use aria-disabled="true" com foco permitido, bloqueio no código e explicação acessível.
- Não use aria-hidden="true" em elemento focável.
- Não dependa de cor, opacidade ou baixo contraste para indicar o estado (1.4.1, 1.4.3).
- Preserve nome acessível, foco visível (2.4.7) e o motivo perto do controle, alcançável por teclado (2.1.1).
- Teste ordem de foco, zoom, alto contraste e a reativação.

## Microcópia

| Situação | Exemplo |
|---|---|
| Pré-requisito | "Preencha o CPF para continuar." |
| Permissão | "Somente administradores podem convidar pessoas." |
| Disponível só no desktop | "Disponível apenas na versão para computador." |
| Carregando | "Verificando disponibilidade..." |
| Manutenção temporária | "Criar novo estará disponível a partir de 12/11." |

## Checklist de verificação

- [ ] A causa da indisponibilidade está classificada.
- [ ] Ação irrelevante ou sem caminho de acesso foi removida, não desabilitada.
- [ ] Todo controle desabilitado tem o motivo em texto visível e persistente.
- [ ] O motivo não depende apenas de tooltip.
- [ ] O estado não depende só de cor ou opacidade.
- [ ] Com aria-disabled, a operação é bloqueada no código.
- [ ] Nenhum elemento focável usa aria-hidden.
- [ ] O controle volta ao estado ativo quando a condição muda.
- [ ] Teclado e leitor de tela encontram o motivo.

## Fundamentação

- W3C WAI-ARIA Authoring Practices: interface de teclado e tratamento de controles desabilitados.
- MDN, aria-disabled e aria-hidden: aria-disabled comunica o estado sem bloquear o comportamento; aria-hidden não deve ser usado em focáveis.
- GitHub Primer, experiências degradadas, criação e botões: remover ações não essenciais, esconder criação sem permissão, diferenciar botão inativo de desabilitado.
- Microsoft Fluent 2, botão: explicar o que está indisponível e por quê.
- IBM Carbon, estados somente leitura: distinguir desabilitado temporário de somente leitura.
- Material Design 3, estados: desabilitado indica componente inoperável.
- Nielsen Norman Group, botões desabilitados: risco de não responder sem explicar.
- WCAG 2.2, critérios 4.1.2, 1.4.1 e 2.1.1.
