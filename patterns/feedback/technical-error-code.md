---
id: technical-error-code
title: Erros técnicos devem mostrar códigos ao usuário?
category: feedback
components: [alert, error-message, copy-button]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["3.3.1", "3.3.3", "4.1.3", "1.4.1"]
related: [helpful-error-message, ai-error-recovery, retry, temporary-failure]
---

# Erros técnicos devem mostrar códigos ao usuário?

> **Regra:** Explique o impacto e o próximo passo primeiro; mostre um código apenas como referência secundária, rotulada e copiável, quando ele ajudar o suporte a localizar a ocorrência.

## Contexto

Um código de erro é um identificador para diagnóstico, suporte e rastreamento. Sozinho, não diz o que a pessoa pode fazer. A pergunta certa não é se códigos são bons, mas se este código ajuda este público a se recuperar ou pedir ajuda.

Para o público geral, a mensagem principal traduz o impacto e indica a ação segura. Códigos no início da mensagem desviam a atenção para algo que a maioria não sabe interpretar.

Detalhes técnicos também podem revelar a implementação ou facilitar enumeração de contas. A solução une clareza para quem usa, segurança na exposição e rastreabilidade para a equipe.

## Decisão

- **SE** o erro é simples e o usuário consegue corrigir (validação de campo, por exemplo) **ENTÃO** não mostre código; explique a correção.
- **SE** a falha persiste, afeta muitas pessoas ou exige investigação **ENTÃO** mostre código como referência secundária.
- **SE** não há canal de suporte ou o código não leva a nenhuma ação **ENTÃO** omita-o.
- **SE** mostra o código **ENTÃO** coloque-o depois da mensagem, com rótulo ("Código de referência: 8F4K2") e botão de copiar.
- **SE** gera o identificador **ENTÃO** use valor curto, estável e sem dado sensível, correlacionado a logs internos.
- **SE** a operação pode ter sido concluída **ENTÃO** informe como consultar o status antes de sugerir repetir.
- **SE** o fluxo é de autenticação ou recuperação de conta **ENTÃO** use mensagem genérica que não revele existência de conta ou regra interna.
- **SE** o público é técnico **ENTÃO** pode oferecer detalhes expansíveis ("Mostrar detalhes"), nunca stack trace bruto.
- **SENÃO** mantenha o detalhe técnico apenas nos logs.

## Quando usar

- Suporte precisa localizar a ocorrência.
- Falha persistente ou em massa.
- Canal de atendimento disponível.
- Código curto e sem dados sensíveis.

## Quando evitar

- Erros que a pessoa corrige sozinha → **use em vez disso:** mensagem com instrução.
- Validações de campo → **use em vez disso:** mensagem junto ao campo.
- Exposição de stack trace ou sistema interno → **use em vez disso:** logs.
- Autenticação com risco de enumeração → **use em vez disso:** mensagem genérica.
- Mensagem que some antes de copiar → **use em vez disso:** mensagem persistente.

## Faça

- Explique o que não aconteceu e se a operação foi concluída.
- Indique a ação segura.
- Rotule o código como referência.
- Preserve o estado da operação.
- Teste a referência com o time de suporte.

## Evite

- Começar a mensagem pelo número.
- Exibir stack trace ou dados internos.
- Culpar a pessoa.
- Pedir interpretação técnica.
- Revelar contas válidas.

## Acessibilidade

- Código como texto selecionável, com rótulo explícito e contraste adequado (WCAG 1.4.1: não se apoiar só em cor ou ícone).
- Botão "Copiar código" com nome acessível, foco visível e confirmação textual.
- Falha informativa em região de status sem mover o foco (WCAG 4.1.3); decisão urgente em alerta ou diálogo bem estruturado.
- Erro ligado a campo: identifique o item e associe a mensagem (WCAG 3.3.1, 3.3.3).

## Microcópia

| Situação | Exemplo |
|---|---|
| Mensagem principal | "Não foi possível salvar o arquivo. Tente novamente em instantes." |
| Referência | "Código de referência: 8F4K2" |
| Copiar | "Copiar código" / "Código copiado" |
| Suporte | "Se o problema continuar, informe este código ao suporte." |

## Checklist de verificação

- [ ] A mensagem explica o que aconteceu?
- [ ] A ação segura está clara?
- [ ] O código tem função real?
- [ ] O código vem depois da mensagem principal e tem rótulo?
- [ ] O código é copiável por teclado?
- [ ] O identificador não contém dados sensíveis?
- [ ] Stack trace e detalhes internos ficam fora da interface?
- [ ] O suporte consegue localizar a ocorrência pelo código?
- [ ] Fluxos de autenticação usam mensagem genérica?

## Fundamentação

- WCAG 2.2, 3.3.1 e 3.3.3: erro descrito em texto e sugestão de correção.
- OWASP (Error Handling Cheat Sheet e Improper Error Handling): sem detalhes de implementação na interface.
- IETF RFC 9457 (Problem Details): separar contrato de API de apresentação ao usuário.
- Adobe Spectrum (escrita de erros): código só quando útil, ao final.
- IBM Carbon (Notification): título curto, corpo conciso, ação de resolução.
- Atlassian Design System (mensagens de erro): explicar, oferecer alternativa, revelar detalhes gradualmente.
