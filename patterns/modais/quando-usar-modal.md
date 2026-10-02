---
id: quando-usar-modal
titulo: Quando usar modal?
categoria: modais
componentes: [modal, dialogo, botao]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["2.1.1", "2.1.2", "2.4.3", "2.4.7", "1.4.10", "4.1.2"]
relacionados: [quando-evitar-modal, fechar-modal, foco-de-teclado, confirmar-acao]
---

# Quando usar modal?

> **Regra:** Use modal só para decisão ou tarefa curta que exige atenção imediata; se uma página, mensagem inline ou painel lateral resolver, não use modal.

## Contexto

Uma modal sobrepõe a página atual e impede a interação com o fundo. A interrupção ajuda em decisões importantes, mas faz a pessoa perder o contexto e dificulta a navegação, principalmente em telas pequenas, com teclado e com tecnologias assistivas.

O uso excessivo aumenta a carga cognitiva. Antes de abrir uma modal, verifique se outro padrão resolve com menos interrupção.

Quando usada, a modal precisa controlar o foco, impedir interação acidental com o fundo e fechar de forma previsível.

## Decisão

- **SE** a pessoa deve confirmar uma ação importante ou difícil de desfazer **ENTÃO** use modal curta.
- **SE** a mensagem é crítica e exige reconhecimento **ENTÃO** use modal.
- **SE** a tarefa é curta (poucos campos) e não deve tirar a pessoa da tela **ENTÃO** use modal.
- **SE** a escolha bloqueia o próximo passo **ENTÃO** use modal.
- **SE** o formulário é longo ou complexo **ENTÃO** use página própria.
- **SE** há várias etapas **ENTÃO** use fluxo em página com indicador de progresso.
- **SE** é mensagem comum de erro ou sucesso **ENTÃO** use mensagem inline ou toast.
- **SE** é o conteúdo principal da página **ENTÃO** não use modal.
- **SE** a abertura seria automática e frequente **ENTÃO** não use modal.
- **SENÃO** prefira painel lateral ou conteúdo contextual.

## Quando usar

- Confirmação de ação importante.
- Decisão difícil de desfazer.
- Mensagem crítica que exige reconhecimento.
- Tarefa curta sem perda de contexto.
- Informação complementar e pontual.
- Escolha que bloqueia o próximo passo.

## Quando evitar

- Formulários longos ou complexos → **use em vez disso:** página dedicada.
- Fluxos com várias etapas → **use em vez disso:** fluxo em páginas.
- Mensagens comuns de erro ou sucesso → **use em vez disso:** mensagem inline ou toast.
- Conteúdo principal → **use em vez disso:** corpo da página.
- Link externo sem necessidade de confirmação → **use em vez disso:** link direto.
- Interrupções automáticas e frequentes → **use em vez disso:** aviso não bloqueante.

## Faça

- Use modais com moderação.
- Abra apenas depois de uma ação clara da pessoa.
- Escreva um título específico que explique o propósito.
- Use botões com ações explícitas ("Excluir", "Manter").
- Mantenha o conteúdo curto.
- Ofereça um botão de fechar visível e uma saída clara.

## Evite

- Abrir sem contexto ou sem ação prévia.
- Usar "Sim" e "Não" isolados.
- Colocar páginas inteiras dentro de modais.
- Esconder o botão de fechar.
- Usar modal para toda mensagem.
- Bloquear a pessoa sem explicar.
- Criar várias áreas de rolagem aninhadas.

## Acessibilidade

- Use role="dialog" e nomeie com título visível via aria-labelledby (4.1.2).
- Use aria-modal="true" somente quando o fundo estiver de fato inativo para todos.
- Ao abrir, mova o foco para dentro; Tab permanece dentro da modal e não prende a pessoa (2.1.1, 2.1.2).
- Escape fecha quando apropriado; ao fechar, o foco volta ao elemento que abriu (2.4.3).
- Botão de fechar visível e indicador de foco preservado (2.4.7).
- Permita rolagem vertical para conteúdo maior e teste zoom de 400% sem perda de conteúdo (1.4.10).
- Teste teclado e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Título | "Descartar rascunho?" |
| Ação principal | "Descartar" |
| Ação secundária | "Continuar editando" |
| Fechar | "Fechar" |
| Escolha delimitada | "Escolha a forma de envio" |

## Checklist de verificação

- [ ] Nenhum padrão menos disruptivo resolve o caso.
- [ ] A modal abre após uma ação da pessoa.
- [ ] O título explica o propósito.
- [ ] Os botões descrevem suas ações, sem "Sim" e "Não".
- [ ] O conteúdo é curto e não exige fluxo de várias etapas.
- [ ] Existe botão de fechar visível.
- [ ] O foco entra na modal e permanece nela.
- [ ] Escape fecha, quando apropriado.
- [ ] O foco retorna ao elemento acionador.
- [ ] Testada com teclado e leitor de tela.

## Fundamentação

- W3C WAI-ARIA Authoring Practices, padrão de diálogo modal: foco inicial, Tab, Escape, retorno do foco e aria-modal.
- U.S. Web Design System, modal: uso com moderação, alternativas menos disruptivas, evitar fluxos complexos e mensagens comuns.
- Padrão Digital de Governo, modal: interrupções propositais, decisões críticas e tarefas curtas; conteúdo conciso e ações claras.
- AMAWeb, checklist ABNT NBR 17225 e manual de acessibilidade digital: foco visível, ordem previsível e operação por teclado.
