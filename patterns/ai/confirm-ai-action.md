---
id: confirm-ai-action
title: Quando pedir confirmação antes de uma ação executada pela IA?
category: ai
components: [modal, button, action-summary]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["3.3.4", "2.4.3", "4.1.3", "1.4.1"]
related: [confirm-action, destructive-action, review-ai-output, ai-error-recovery, undo]
---

# Quando pedir confirmação antes de uma ação executada pela IA?

> **Regra:** A IA prepara a ação sem executá-la; peça confirmação explícita imediatamente antes de qualquer efeito relevante, externo, destrutivo, financeiro ou difícil de reverter, mostrando alvo, escopo e consequência.

## Contexto

Uma IA pode apenas sugerir, mas também enviar mensagens, publicar, apagar dados, alterar permissões, executar comandos ou comprar. Nesses casos, a intenção do sistema não equivale à autorização da pessoa.

A confirmação devolve o controle no ponto em que a sugestão vira efeito no mundo. Ela reduz comandos equivocados, interpretações erradas e uso indevido de permissões, mas não torna a ação segura por si só: combine com escopo claro, permissões adequadas, registro e recuperação.

Tampouco deve interromper, a cada interação, tarefas de baixo risco.

## Decisão

- **SE** a ação envia algo a terceiros, publica, exclui, compra, altera permissões, roda comandos ou deploys **ENTÃO** exija confirmação antes do efeito.
- **SE** a ação afeta outra pessoa ou sistema externo **ENTÃO** exija confirmação.
- **SE** a saída é só informativa, rascunho não enviado, edição local reversível ou formatação de baixo risco **ENTÃO** não peça confirmação.
- **SE** pede confirmação **ENTÃO** mostre resumo curto: alvo, escopo, conteúdo ou comando e consequência principal.
- **SE** o botão confirma **ENTÃO** use verbo explícito ("Confirmar envio", "Publicar", "Executar comando"); nunca "Continuar".
- **SE** revisar reduz o risco **ENTÃO** permita editar a proposta antes de confirmar.
- **SE** o impacto é alto (destrutivo, financeiro, permissões, dados sensíveis) **ENTÃO** aumente a clareza e a fricção; **SENÃO** mantenha leve.
- **SE** é lote autorizado explicitamente em automação segura **ENTÃO** dispense confirmação item a item.
- **SE** a ação foi executada **ENTÃO** mostre o resultado e ofereça desfazer ou recuperar quando tecnicamente possível.

## Quando usar

- Mensagens, e-mails e convites a terceiros.
- Publicação ou alteração de conteúdo público.
- Exclusão ou alteração difícil de reverter.
- Compras e transações.
- Comandos, scripts, commits e deploys.
- Permissões, configurações e dados sensíveis.

## Quando evitar

- Respostas puramente informativas → **use em vez disso:** exibir direto.
- Rascunho não enviado → **use em vez disso:** pré-visualização editável.
- Modal para cada sugestão → **use em vez disso:** confirmar só no ponto de efeito.

## Faça

- Mostre o verbo da ação no botão.
- Separe visualmente prévia de execução.
- Permita cancelar sem perder o trabalho.
- Registre e exiba o resultado.

## Evite

- Executar antes da confirmação.
- Pedir confirmação depois do efeito.
- Pré-selecionar confirmação em ação de alto impacto.
- Esconder o cancelar.
- Repetir confirmações em fluxo de baixo risco.

## Acessibilidade

- Modal com nome acessível; título e mensagem anunciados.
- Foco entra no modal, vai à ação segura ou ao primeiro controle relevante, não escapa; Esc cancela; foco volta ao acionador (WCAG 2.4.3).
- Informação crítica em texto, não só cor ou ícone (WCAG 1.4.1).
- Anuncie estado de execução e resultado (WCAG 4.1.3).
- Campos de edição e revisão acessíveis por teclado e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Resumo | "Enviar e-mail para 3 clientes com o assunto 'Proposta revisada'." |
| Botão | "Confirmar envio" |
| Cancelar | "Voltar e editar" |
| Resultado | "E-mail enviado. Desfazer" |

## Checklist de verificação

- [ ] A IA mostra exatamente o que vai fazer?
- [ ] Alvo, escopo e consequência estão claros?
- [ ] A confirmação ocorre antes do efeito?
- [ ] O botão traz verbo explícito?
- [ ] É possível revisar ou editar a proposta?
- [ ] Cancelar não destrói o trabalho?
- [ ] A fricção varia com o impacto?
- [ ] Resultado e opção de desfazer aparecem após executar?
- [ ] O fluxo funciona com teclado e leitor de tela?

## Fundamentação

- Microsoft Fluent 2 (Responsible AI): controle humano em ações da IA.
- IBM Carbon for AI: padrões de IA responsável.
- Documentação de agentes de código e assistentes (modo agente, comandos, segurança): aprovação antes de executar comandos com efeito externo.
- Documentação pública de uso de computador por IA: aprovação humana em ações sensíveis.
- WCAG 2.2, 3.3.4 (Error Prevention): reversão, conferência ou confirmação em dados controláveis.
