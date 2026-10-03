---
id: session-expired
title: Como comunicar sessão expirada?
category: authentication
components: [modal-dialog, status-message, timer, button]
type: recommendation
impact: critical
status: recommended
evidence: strong
wcag: ["2.2.1", "2.2.6", "4.1.3", "2.4.3", "2.1.1"]
related: [preserve-data-after-error, autosave-vs-save, temporary-failure, password-recovery, when-to-use-modal]
---

# Como comunicar sessão expirada?

> **Regra:** Avise antes do vencimento com o tempo restante e uma ação "Continuar sessão"; depois do vencimento, explique o motivo, proteja dados sensíveis e leve à reautenticação com retorno ao contexto seguro.

## Contexto

Uma sessão termina por inatividade, por limite máximo da política de segurança ou por mudança de risco. Para a pessoa, o problema não é só entrar de novo: expiração silenciosa interrompe a tarefa, apaga dados e passa a impressão de que o produto falhou.

A experiência trata dois momentos. Antes: avisar com tempo suficiente e permitir continuar quando a política autorizar. Depois: explicar o que houve, proteger informação sensível e oferecer caminho direto para autenticar e retomar.

Os limites vivem no servidor. Controle só no navegador pode ser contornado ou ficar dessincronizado, inclusive entre abas.

## Decisão

- **SE** a sessão está perto de vencer e pode ser prorrogada **ENTÃO** mostre aviso com tempo restante e ação principal "Continuar sessão".
- **SE** a decisão precisa interromper a tarefa **ENTÃO** use modal acessível; **SENÃO** use aviso não bloqueante.
- **SE** o aviso tem contador **ENTÃO** baseie-o no prazo real do servidor, sincronizado entre abas.
- **SE** a pessoa pede para continuar **ENTÃO** estenda só após confirmação do servidor; movimento passivo do mouse ou aba em segundo plano não renovam.
- **SE** a sessão já expirou **ENTÃO** troque o aviso por mensagem de estado, oculte dados sensíveis e leve ao login.
- **SE** há dados não sensíveis não enviados **ENTÃO** preserve-os e restaure a tarefa após autenticar, confirmando o que foi recuperado.
- **SE** a política proíbe prorrogar **ENTÃO** não ofereça "Continuar"; avise o prazo e oriente a salvar.
- **SE** o prazo não tem relação com segurança **ENTÃO** remova-o ou permita estender.
- **SENÃO** ofereça também "Sair agora" quando fizer sentido.

## Quando usar

- Áreas autenticadas com limite de inatividade.
- Dados pessoais, financeiros ou corporativos.
- Formulários e tarefas longas.
- Dispositivos compartilhados.

## Quando evitar

- Sem sessão autenticada → **use em vez disso:** nenhum aviso.
- Prazo sem relação com segurança → **use em vez disso:** remover o limite.
- Aviso repetitivo longe do vencimento → **use em vez disso:** um aviso no momento certo.
- Substituir salvamento automático → **use em vez disso:** salvar rascunho e avisar.

## Faça

- Explique motivo, consequência e o que cada ação faz.
- Ofereça "Continuar sessão" como ação principal.
- Teste com várias abas e tempos de conexão.
- Dê tempo suficiente para quem precisa de mais tempo para ler ou digitar.

## Evite

- Expirar em silêncio ou com erro genérico.
- Depender só do temporizador local.
- Anunciar cada segundo.
- Apagar trabalho seguro.
- Empilhar modais.
- Prometer extensão impossível.

## Acessibilidade

- Modal com nome e descrição, foco inicial em ação segura, foco contido e fundo inerte; ao fechar, devolva o foco a um ponto lógico.
- Avise limite de tempo e permita estendê-lo (2.2.1); permita reautenticar sem perder dados (2.2.6).
- Evite que o leitor de tela releia a contagem a cada segundo; anuncie em intervalos relevantes e mais uma vez quando restar pouco tempo (4.1.3).
- Tudo operável por teclado, sem depender de cor.
- Quando a sessão expirar, leve o foco à mensagem de estado e deixe claro o botão "Entrar novamente".

## Microcópia

| Situação | Exemplo |
|---|---|
| Título do aviso | "Sua sessão vai expirar" |
| Corpo | "Por segurança, você será desconectado em 2 minutos. Continuar?" |
| Ação principal | "Continuar sessão" |
| Saída | "Sair agora" |
| Expirada | "Sua sessão expirou por inatividade. Entre novamente para continuar." |
| Retorno | "Recuperamos o que você havia preenchido." |

## Checklist de verificação

- [ ] O motivo da expiração está explicado.
- [ ] O aviso aparece antes do vencimento, com tempo para responder.
- [ ] O contador corresponde ao prazo do servidor.
- [ ] Há ação para continuar e saída explícita.
- [ ] Várias abas se comportam de forma consistente.
- [ ] O estado expirado é diferente do aviso.
- [ ] Dados sensíveis somem da tela após expirar.
- [ ] A tarefa retorna após autenticar.
- [ ] Teclado e foco funcionam no diálogo.
- [ ] O leitor de tela não anuncia cada segundo.

## Fundamentação

- WCAG 2.2, critério 2.2.1 (Timing Adjustable): remover, ajustar ou estender limites de tempo não essenciais e avisar a tempo.
- WCAG 2.2, critério 2.2.6 (Timeouts): reautenticar sem perder dados.
- OWASP (Session Management Cheat Sheet): limites aplicados no servidor, inatividade mais duração absoluta, aviso prévio.
- NIST SP 800-63B-4: limites de sessão e reautenticação proporcional ao risco.
- U.S. Web Design System (Modal): sessão a expirar como caso de modal com consequência e ações claras.
- Design systems de serviços públicos (timeout de inatividade e modal de timeout): padrão de aviso, extensão e explicação pós-expiração.
