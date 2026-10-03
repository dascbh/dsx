---
id: confirm-deletion
title: Quando pedir confirmação antes de excluir?
category: actions
components: [modal, button, snackbar]
type: contextual-decision
impact: high
status: caution
evidence: strong
wcag: ["3.3.4", "2.4.3", "2.1.2", "1.4.1"]
related: [destructive-action, undo, confirm-action, close-modal]
---

# Quando pedir confirmação antes de excluir?

> **Regra:** Peça confirmação só quando a exclusão for irreversível, ampla ou difícil de recuperar; nos demais casos, execute e ofereça "Desfazer".

## Contexto

Excluir não é o mesmo que sumir da tela. Antes de bloquear o fluxo com um modal, avalie impacto, reversibilidade e alcance da ação.

Confirmação usada sem critério vira ruído e induz clique automático. Excluir sem explicar a consequência, por outro lado, causa perda de trabalho, registros ou acesso. A proteção deve ser proporcional, sem criar etapa extra para toda exclusão simples.

A confirmação precisa explicar a consequência, não apenas perguntar "tem certeza?".

## Decisão

- **SE** a exclusão é facilmente reversível ou o item se recria sem custo **ENTÃO** execute e mostre "Desfazer"; não abra modal.
- **SE** é irreversível, de dados importantes ou de recuperação difícil **ENTÃO** confirme.
- **SE** são vários itens ao mesmo tempo **ENTÃO** confirme mostrando a quantidade e os nomes (ou resumo).
- **SE** afeta outras pessoas, registros ou configurações **ENTÃO** confirme descrevendo o efeito.
- **SE** o impacto é alto ou crítico **ENTÃO** exija confirmação adicional, como digitar o nome do recurso.
- **SE** confirma **ENTÃO** use título "Excluir <objeto>", botão "Excluir" e "Cancelar"; nunca "Sim"/"Não".
- **SE** o modal abre **ENTÃO** inicie o foco em "Cancelar" e não execute a exclusão com Esc.
- **SENÃO** mostre feedback de sucesso após excluir, sem modal extra.

## Quando usar

- Exclusão que não pode ser desfeita.
- Dados importantes ou difíceis de recriar.
- Exclusão em lote.
- Ação que afeta terceiros ou configurações.

## Quando evitar

- Ação reversível → **use em vez disso:** "Desfazer".
- Ações pequenas e repetitivas → **use em vez disso:** execução direta com feedback.
- Modal apenas para avisar que terminou → **use em vez disso:** toast de sucesso.

## Faça

- Identifique o item ou a quantidade.
- Descreva a consequência.
- Use verbo específico no botão.
- Escale a confirmação conforme o impacto.

## Evite

- "Tem certeza?" como única mensagem.
- Botões "Sim" e "Não".
- Confirmar toda exclusão.
- Esconder a consequência.
- Usar cor como único aviso.

## Acessibilidade

- Modal com título e descrição associados; o título identifica a ação ("Excluir projeto").
- Foco inicial na opção segura; foco contido no modal; Esc cancela sem excluir; foco volta ao acionador (WCAG 2.4.3, 2.1.2).
- Nomes claros, foco visível e diferença perceptível sem depender só de cor (WCAG 1.4.1).
- Atende à proteção exigida por WCAG 3.3.4 para exclusão de dados controláveis.

## Microcópia

| Situação | Exemplo |
|---|---|
| Título | "Excluir projeto Orçamento 2026?" |
| Consequência | "Os 14 arquivos serão apagados e não poderão ser recuperados." |
| Botões | "Excluir" / "Cancelar" |
| Confirmação forte | "Digite o nome do projeto para confirmar." |
| Reversível | "Tarefa excluída. Desfazer" |

## Checklist de verificação

- [ ] A exclusão é irreversível ou difícil de recuperar?
- [ ] O texto identifica o item ou a quantidade?
- [ ] A consequência está explicada?
- [ ] O botão usa "Excluir" e há "Cancelar"?
- [ ] "Desfazer" foi avaliado como alternativa?
- [ ] O modal aparece só quando o impacto justifica?
- [ ] Esc não executa a exclusão?
- [ ] O foco começa na opção segura e retorna ao acionador?
- [ ] Há feedback após excluir?

## Fundamentação

- IBM Carbon (Remove pattern, Modal Usage): níveis de impacto, confirmação proporcional, digitar o nome em casos críticos, danger modal.
- Adobe Spectrum (Alert Dialog): variante destrutiva e rótulo coerente com a ação.
- Padrão Digital GOV.BR (Modal): títulos e ações específicos; evitar "Tem certeza?" e "Sim/Não".
- U.S. Web Design System (Alert): confirmação mais intrusiva para ações destrutivas.
- W3C WAI-ARIA APG (Dialog Modal): foco, teclado, Escape, nome acessível.
- AMAWeb (checklist de acessibilidade): verificação de foco e teclado.
