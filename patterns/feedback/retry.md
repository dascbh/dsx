---
id: retry
title: Quando e como oferecer "Tentar novamente" após um erro?
category: feedback
components: [alert, button, snackbar]
type: recommendation
impact: medium
status: recommended
evidence: strong
wcag: ["4.1.3", "1.4.1", "2.1.1"]
related: [temporary-failure, double-submit, preserve-data-after-error, helpful-error-message]
---

# Quando e como oferecer "Tentar novamente" após um erro?

> **Regra:** Ofereça "Tentar novamente" só quando a causa for provavelmente temporária e a repetição for segura; preserve o estado, evite duplicidade e dê uma saída após poucas falhas.

## Contexto

A ação de repetir é útil quando a falha pode ser passageira e repetir tem chance real de concluir a tarefa. Não deve ser resposta automática para qualquer erro.

Boa recuperação reúne explicação curta, estado preservado, uma ação clara e teto de tentativas. Se a operação pode já ter terminado, deixe consultar o resultado primeiro ou adote um mecanismo contra duplicidade.

Repetir às cegas pode cobrar duas vezes, duplicar registros ou apagar dados.

## Decisão

- **SE** a causa é transitória (conexão caiu, tempo esgotado, indisponibilidade momentânea) **ENTÃO** ofereça "Tentar novamente".
- **SE** o dado é inválido **ENTÃO** leve o usuário ao campo para corrigir; não ofereça repetir.
- **SE** falta permissão **ENTÃO** explique e indique como obter acesso; não ofereça repetir.
- **SE** o sistema sabe que a tentativa falhará sempre **ENTÃO** não ofereça repetir.
- **SE** a ação cria, paga, envia ou exclui **ENTÃO** confirme o resultado antes de repetir, ou aplique idempotência no serviço.
- **SE** o usuário aciona repetir **ENTÃO** mostre processamento, bloqueie cliques duplicados e comunique o desfecho.
- **SE** houver uma ou poucas falhas seguidas **ENTÃO** ofereça saída: verificar conexão, ver status, voltar, salvar localmente ou pedir ajuda.
- **SE** o erro é contextual e não bloqueante **ENTÃO** use a ação junto à mensagem (inline ou snackbar), uma única ação.
- **SENÃO** preserve dados, filtros, posição e progresso.

## Quando usar

- Falha de rede, timeout ou indisponibilidade breve.
- Operação não concluída, com estado preservado.
- Feedback visível durante a nova tentativa.

## Quando evitar

- Dados inválidos → **use em vez disso:** correção guiada no campo.
- Permissão ausente → **use em vez disso:** orientação de acesso.
- Ação que pode duplicar efeitos → **use em vez disso:** verificar estado antes.
- Falha permanente → **use em vez disso:** saída alternativa.

## Faça

- Diga o que falhou e o que a nova tentativa vai fazer.
- Use uma única ação clara.
- Informe espera recomendada antes de repetir.
- Ofereça saída após falhas repetidas.

## Evite

- Mensagem "Erro" sozinha.
- Loop infinito de tentativas idênticas.
- Limpar dados ao falhar.
- Várias ações repetidas competindo.
- Mascarar uma ação que já foi concluída.

## Acessibilidade

- Botão com nome acessível claro; sem retirar o foco de forma inesperada.
- Anuncie "Tentando novamente" e o desfecho em região de status, sem mover o foco (WCAG 4.1.3).
- Desabilitar temporariamente evita duplicidade, mas o usuário deve entender o que acontece.
- Não dependa só de vermelho, ícone ou animação (WCAG 1.4.1); operação por teclado (WCAG 2.1.1).

## Microcópia

| Situação | Exemplo |
|---|---|
| Falha de carregamento | "Não foi possível carregar os resultados. Tentar novamente" |
| Em andamento | "Tentando novamente…" |
| Falha repetida | "Ainda não deu certo. Verifique sua conexão ou volte mais tarde." |
| Saída | "Voltar" |

## Checklist de verificação

- [ ] A causa pode ser temporária?
- [ ] A repetição é segura?
- [ ] A mensagem diz o que falhou?
- [ ] O botão descreve a ação?
- [ ] Dados e progresso foram preservados?
- [ ] O estado de nova tentativa é anunciado?
- [ ] Cliques duplicados são bloqueados?
- [ ] Há limite de tentativas e uma alternativa?
- [ ] Funciona por teclado?

## Fundamentação

- WCAG 2.2, 4.1.3 e técnica ARIA22: estados dinâmicos anunciados sem mover foco.
- Baymard Institute (mensagens de erro adaptativas, fluxo de checkout): mensagens específicas, preservação de dados, recuperação guiada.
- Adobe Spectrum (escrita de erros, alert banner): explicar, orientar, ação direta e inline.
- Material Design (Errors): snackbar com retry; não oferecer quando falhará sempre.
- IBM Carbon (ações comuns, notificações): ação curta e contextual.
- Padrão Digital GOV.BR (Message): feedback curto, global vs. contextual.
- IETF RFC 9110 e Stripe (idempotência): repetir com segurança operações idempotentes.
