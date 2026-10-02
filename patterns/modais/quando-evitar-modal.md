---
id: quando-evitar-modal
titulo: Quando não usar modal?
categoria: modais
componentes: [modal, alerta, toast, painel-lateral, pagina]
tipo: antipadrao
impacto: alto
status: evitar
evidencia: forte
wcag: ["2.1.2", "2.4.3", "2.4.7", "1.4.10", "4.1.3"]
relacionados: [quando-usar-modal, fechar-modal, toast-alerta-inline, onde-exibir-erros]
---

# Quando não usar modal?

> **Regra:** Trate o modal como último recurso: use-o só para decisão curta que exige atenção imediata; fluxos longos, mensagens rotineiras e textos extensos ficam na página.

## Contexto

Um modal interrompe o fluxo e bloqueia a página ao fundo. Usado para tarefas extensas ou situações rotineiras, aumenta a complexidade e dificulta a navegação.

Ele também cria problemas de foco, rolagem e leitura em dispositivos móveis e tecnologias assistivas. Antes de abrir um modal, confira se o conteúdo cabe na página, se pode virar uma mensagem contextual ou se pede uma tela própria.

Orientações de design systems tratam o modal como exceção, sobretudo para fluxos de várias etapas, mensagens comuns, conteúdo longo e links externos.

## Decisão

- **SE** o fluxo tem várias etapas ou o formulário é longo **ENTÃO** use uma página própria.
- **SE** é mensagem de sucesso ou status **ENTÃO** use alerta ou toast, não modal.
- **SE** é erro de campo **ENTÃO** mostre inline e resumo, nunca modal.
- **SE** o conteúdo exige leitura extensa **ENTÃO** use página ou seção expansível.
- **SE** é informação complementar **ENTÃO** use painel lateral ou seção expansível.
- **SE** é uma tarefa simples **ENTÃO** use criação ou edição inline mantendo a página interativa.
- **SE** a pessoa vai para outro endereço **ENTÃO** use link direto, sem modal de confirmação.
- **SE** a decisão é curta e exige atenção imediata **ENTÃO** o modal é aceitável.
- **SE** o modal abriria sem ação da pessoa **ENTÃO** não abra.
- **SENÃO** mantenha o conteúdo na página.

## Quando usar

Este padrão orienta a evitar modal em:

- Fluxos de várias etapas.
- Formulários longos.
- Leitura extensa.
- Mensagens comuns ou rotineiras.
- Situações em que a página pode continuar interativa.
- Navegação para outro endereço.

## Quando evitar

- Mensagem de sucesso → **use em vez disso:** toast ou alerta.
- Erro de campo → **use em vez disso:** mensagem inline e resumo.
- Texto longo → **use em vez disso:** página ou seção expansível.
- Tarefa complexa → **use em vez disso:** página dedicada.
- Link externo bloqueado por confirmação → **use em vez disso:** link com aviso no texto.
- Abertura automática sem necessidade → **use em vez disso:** conteúdo no fluxo, aberto por ação da pessoa.

## Faça

- Prefira página própria para tarefas longas.
- Mostre erros no contexto.
- Use alerta para status.
- Mantenha a página interativa.
- Teste o fluxo no mobile.
- Reserve modal para exceções.

## Evite

- Colocar um fluxo inteiro em modal.
- Usar modal para toda mensagem.
- Esconder conteúdo importante no modal.
- Interromper sem ação da pessoa.
- Exigir confirmação para abrir links.
- Usar rolagem interna como solução padrão.

## Acessibilidade

- Se o modal for mantido, siga o padrão de diálogo: foco preso na janela, teclado previsível, fechamento claro e retorno do foco ao acionador (2.4.3, 2.1.2).
- Use `aria-modal="true"` só quando o fundo estiver realmente inativo para todos; caso contrário a semântica pode ocultar conteúdo necessário.
- Foco visível (2.4.7) e reflow em tela pequena e zoom (1.4.10).
- Mensagens de status na página usam região de status, sem roubar o foco (4.1.3).
- Teste a alternativa com teclado, zoom, leitor de tela e telas diferentes.

## Microcópia

| Situação | Exemplo |
|---|---|
| Sucesso sem modal | "Cliente cadastrado." |
| Erro sem modal | "Informe um e-mail válido." |
| Link externo | "Ver regulamento (abre em nova aba)" |
| Decisão curta que justifica modal | "Descartar as alterações?" |

## Checklist de verificação

- [ ] A tarefa pode ser concluída na página.
- [ ] O fluxo não tem várias etapas dentro do modal.
- [ ] O conteúdo é curto.
- [ ] A mensagem é realmente crítica.
- [ ] A pessoa iniciou a ação que abre o modal.
- [ ] Existe alternativa menos interruptiva e ela foi avaliada.
- [ ] A página continua utilizável no mobile.
- [ ] Links externos não passam por modal de confirmação.
- [ ] A alternativa passou por teste com leitor de tela e teclado.

## Fundamentação

- USWDS (Modal): avaliar outra solução primeiro; evitar em fluxos complexos, mensagens comuns, conteúdo extenso e links externos.
- W3C WAI-ARIA APG (Dialog Modal): fundo inativo, foco, teclado e retorno ao acionador.
- Padrão Digital GOV.BR (Modal): interrupção proposital, conteúdo conciso, ações claras.
- IBM Carbon (fluxos de criação; notificações): criação inline e toasts como alternativas não bloqueantes.
- GOV.UK Design System (Error summary): validação no fluxo, sem modal.
- AMAWeb e ABNT NBR 17225: foco visível, ordem previsível e ausência de bloqueio de teclado.
