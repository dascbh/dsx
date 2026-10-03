---
id: toast-duration
title: Quanto tempo uma notificação temporária deve permanecer?
category: feedback
components: [toast, snackbar, temporary-notification]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["2.2.1", "4.1.3", "2.1.1", "1.4.1"]
related: [toast-vs-inline-alert, success-confirmation, undo, retry]
---

# Quanto tempo uma notificação temporária deve permanecer?

> **Regra:** Notificação com ação, erro importante ou informação única nunca some sozinha; só mensagens curtas de baixo impacto podem desaparecer, começando em 4 a 10 segundos e ajustadas pelo tamanho do texto.

## Contexto

Avisos temporários dão um retorno rápido sem cortar o fluxo. Quanto tempo ficam na tela é decisão de UX, e não um valor universal: varia com o tamanho da mensagem, a urgência, a ação esperada, o dispositivo e a chance de rever a informação depois.

Se desaparece cedo, a mensagem se perde para quem precisa de mais tempo para ler ou achar. Se permanece demais, tapa controles e distrai. O risco aumenta quando o toast é o único meio de saber o ocorrido ou traz a única ação de correção.

O intervalo de 4 a 10 segundos é referência de implementação de alguns sistemas, não lei comprovada. Valide com conteúdo, dispositivo, leitura assistiva e teste com pessoas.

## Decisão

- **SE** a mensagem é sucesso simples ou informação curta, sem ação obrigatória **ENTÃO** use dispensa automática.
- **SE** o texto é curto **ENTÃO** comece testando entre 4 e 10 segundos.
- **SE** o texto é mais longo **ENTÃO** aumente o tempo ou troque por mensagem persistente.
- **SE** a mensagem tem ação (desfazer, tentar novamente, revisar) **ENTÃO** mantenha até a ação ser feita ou a mensagem ser dispensada.
- **SE** é erro que exige correção, mensagem crítica ou emergencial **ENTÃO** não use temporizador; use padrão persistente.
- **SE** é a única confirmação de uma ação importante **ENTÃO** não temporize.
- **SE** a informação é relevante depois **ENTÃO** ofereça outro caminho de consulta (central de notificações, estado na página, histórico).
- **SE** há várias mensagens em sequência **ENTÃO** mostre uma por vez, sem reiniciar nem esconder o tempo de leitura da anterior.
- **SENÃO** prefira mensagem persistente.

## Quando usar

- Dispensa automática para sucesso simples de baixo impacto.
- Informação curta sem ação obrigatória.
- Permanência quando há desfazer, tentar novamente ou outra ação.
- Fechamento manual sempre disponível.

## Quando evitar

- Erros importantes → **use em vez disso:** mensagem inline ou alerta persistente.
- Única confirmação de uma ação → **use em vez disso:** estado persistente na página.
- Mensagem com ação necessária → **use em vez disso:** notificação que permanece até dispensar.
- Textos longos → **use em vez disso:** alerta, inline ou página.
- Mesma duração para todos os textos → **use em vez disso:** tempo definido pelo conteúdo.

## Faça

- Defina o tempo pelo conteúdo.
- Comece em 4 a 10 segundos para mensagens curtas.
- Mantenha ações disponíveis.
- Mostre uma mensagem por vez.
- Ofereça botão de fechar.
- Permita consultar depois o que for relevante.

## Evite

- Tempo fixo para tudo.
- Fazer erro desaparecer.
- Esconder a única confirmação.
- Empilhar notificações.
- Ação que some antes de ser usada.
- Interromper sem necessidade.

## Acessibilidade

- Não use temporizador em mensagens críticas, emergenciais ou que exigem decisão.
- Para informação sem ação, use região semântica status ou log, sem mover o foco (4.1.3).
- Mensagens com ação ficam disponíveis a teclado e leitor de tela até serem resolvidas ou dispensadas (2.1.1).
- Limites de tempo devem poder ser desativados, ajustados ou ampliados; o toast pode sumir sem isso apenas quando existe alternativa equivalente para consultar a informação (2.2.1).
- O foco não pode se perder ao fechar o toast.
- Não use só cor ou ícone (1.4.1).
- Teste tempo com teclado, zoom, leitor de tela e tamanhos de texto maiores.

## Microcópia

| Situação | Exemplo |
|---|---|
| Sucesso breve | "Alterações salvas." |
| Com desfazer (persiste até agir) | "Conversa arquivada. Desfazer" |
| Sessão encerrada | "Sua sessão terminou por inatividade. Entrar de novo" |
| Fechar | "Fechar notificação" |

## Checklist de verificação

- [ ] Toasts com auto-dispensa são curtos e de baixo impacto.
- [ ] Toasts com ação não têm temporizador.
- [ ] Erros importantes não usam toast temporário.
- [ ] A duração varia conforme o comprimento do texto.
- [ ] Existe botão de fechar com nome acessível.
- [ ] A informação importante pode ser consultada depois.
- [ ] Só uma notificação aparece por vez.
- [ ] O toast usa role status ou log e não rouba o foco.
- [ ] Testado com teclado, zoom e leitor de tela.

## Fundamentação

- WCAG 2.2, critério 2.2.1 (limite de tempo ajustável): quando temporizar é aceitável.
- IBM Carbon, padrão, uso e acessibilidade de notificações: toasts temporários, inline persistente, sem temporizador em críticas.
- Material Design e Android Developers, snackbars: referência de 4 a 10 segundos, uma por vez, duração indefinida com controle de fechamento.
- Atlassian Design, flag com dispensa automática: exemplo de implementação (8 segundos), não regra universal.
- Padrão Digital de Governo, mensagem: evitar mensagens que desaparecem sozinhas.
- Adobe Spectrum, toast: mensagem temporária e contextual.
- Nielsen Norman Group, visibilidade do status do sistema: feedback oportuno, sem número universal.
- Interaction Design Foundation e MeasuringU: feedback pouco interruptivo e validação da duração com testes.
