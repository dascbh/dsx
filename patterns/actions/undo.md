---
id: undo
title: Quando oferecer a opção Desfazer?
category: actions
components: [toast, snackbar, undo-button]
type: recommendation
impact: medium
status: recommended
evidence: strong
wcag: ["4.1.3", "2.1.1", "2.2.1", "3.3.4", "1.4.1"]
related: [confirm-action, confirm-deletion, destructive-action, toast-duration, toast-vs-inline-alert]
---

# Quando oferecer a opção Desfazer?

> **Regra:** Ofereça "Desfazer" logo após uma ação reversível iniciada pela pessoa, com texto que diga o que mudou, e só se a reversão restaurar o estado completo.

## Contexto

"Desfazer" reverte uma ação já concluída, sem pedir confirmação antes de cada interação. Não se confunde com "Cancelar", que interrompe algo em curso, nem com lixeira ou histórico, que oferecem recuperação persistente.

Pessoas erram, sobretudo em telas pequenas e listas densas. A reversibilidade evita impor confirmação a todos, mas só dá segurança quando é real: um "Desfazer" que expira cedo, restaura parte do estado ou não reverte efeitos externos cria falsa sensação de proteção.

A pessoa deve entender o que mudou, qual ação será revertida e o que acontece depois.

## Decisão

- **SE** a ação é reversível, iniciada pela pessoa e o erro acidental é plausível (arquivar, remover de lista, mover, marcar, alterar estado) **ENTÃO** aplique a mudança na hora e mostre notificação breve com "Desfazer".
- **SE** a reversão restaura conteúdo, posição, relações, seleção e permissões **ENTÃO** ofereça "Desfazer".
- **SE** o sistema não restaura o estado exato **ENTÃO** não ofereça "Desfazer".
- **SE** há efeito financeiro, legal, de privacidade, externo ou sobre outras pessoas **ENTÃO** use confirmação antes, atraso controlado ou recuperação persistente.
- **SE** a ação é irreversível **ENTÃO** peça confirmação clara antes.
- **SE** a ação ainda está em andamento **ENTÃO** use "Cancelar", não "Desfazer".
- **SE** a notificação pode desaparecer **ENTÃO** ofereça também lixeira, histórico ou registro de alterações.
- **SENÃO** feedback simples sem ação.

## Quando usar

- Ação reversível com estado anterior restaurável.
- Resultado visível e compreensível.
- Reversão rápida e confiável.
- Existe outra via de recuperação em casos importantes.

## Quando evitar

- Ação irreversível → **use em vez disso:** confirmação antes.
- Efeito financeiro ou legal → **use em vez disso:** confirmação ou atraso controlado.
- Dados sensíveis já compartilhados → **use em vez disso:** confirmação antes de compartilhar.
- Efeito imediato sobre terceiros → **use em vez disso:** confirmação.
- Ação em andamento → **use em vez disso:** "Cancelar".

## Faça

- Nomeie o que mudou e o objeto afetado.
- Use uma única ação clara.
- Reverta de forma atômica, sem duplicar nem perder dados.
- Confirme a reversão com novo feedback.
- Garanta teclado e nome acessível.

## Evite

- "Desfazer" genérico sem contexto.
- Reverter só parte da ação.
- Depender só do tempo para recuperar algo importante.
- Várias notificações concorrentes.
- Prometer o que o sistema não cumpre.

## Acessibilidade

- Anuncie o resultado em região de status, sem mover o foco (4.1.3).
- "Desfazer" operável por teclado, toque e tecnologia assistiva (2.1.1), com nome que cite o objeto quando necessário.
- Não dependa só de cor, ícone, posição ou desaparecimento da notificação (1.4.1).
- Se houver tempo limitado, dê tempo suficiente ou caminho persistente (2.2.1).
- Para ações relevantes, o mecanismo de reversão apoia a prevenção de erros (3.3.4).

## Microcópia

| Situação | Exemplo |
|---|---|
| Arquivar | "Conversa arquivada. Desfazer" |
| Remover da lista | "Item removido da lista. Desfazer" |
| Reversão concluída | "Conversa restaurada." |
| Nome acessível | "Desfazer arquivamento da conversa" |
| Recuperação persistente | "Você também pode restaurar pela Lixeira." |

## Checklist de verificação

- [ ] A ação pode ser revertida de verdade.
- [ ] A reversão restaura o estado completo.
- [ ] A mensagem explica o que mudou.
- [ ] O rótulo "Desfazer" é específico.
- [ ] A mudança aparece imediatamente.
- [ ] A reversão é atômica e confiável.
- [ ] O controle funciona por teclado.
- [ ] O foco não é movido sem necessidade.
- [ ] O status é anunciado a tecnologia assistiva.
- [ ] Existe alternativa persistente para ações relevantes.
- [ ] O padrão não substitui confirmação necessária.

## Fundamentação

- Nielsen Norman Group (10 heurísticas, controle e liberdade do usuário): permitir reverter ações indesejadas.
- Baymard Institute (toques acidentais): reversibilidade como alternativa de menor atrito à confirmação.
- WCAG 2.2, 4.1.3, e técnica ARIA22: mensagem de status sem receber foco.
- Material Design (Snackbars): ação única "Desfazer"; ação temporária não pode ser o único caminho.
- Adobe Spectrum e React Spectrum (Toast): ação opcional relacionada à mensagem.
- IBM Carbon (Notification usage): uma ação contextual por notificação.
- VA.gov Design System (Snackbar): desfazer e dispensar com feedback da reversão.
- Interaction Design Foundation: histórico de ações e reversão no tratamento de erros.
