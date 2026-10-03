---
id: password-requirements
title: Como informar os requisitos de senha?
category: authentication
components: [password-field, help-text, form]
type: recommendation
impact: critical
status: recommended
evidence: strong
wcag: ["3.3.8", "1.3.5", "1.4.1", "4.1.3", "3.3.2"]
related: [show-password, confirm-password, password-recovery, validation-timing]
---

# Como informar os requisitos de senha?

> **Regra:** Mostre os requisitos junto ao campo antes da digitação, priorize comprimento e bloqueio de senhas comuns em vez de regras de composição arbitrárias, e nunca impeça colar ou gerenciadores de senha.

## Contexto

Requisitos de senha fazem parte da tarefa, não podem ser surpresa pós-envio. Sem eles à vista, criar a senha vira tentativa e erro e a rejeição chega tarde, sem indicar o que mudar.

Regras de composição que parecem rígidas (maiúscula, número, símbolo obrigatórios) tendem a gerar padrões previsíveis e dificultam a memorização. Comprimento, bloqueio de segredos comuns ou vazados e suporte a passphrases comunicam melhor a política real.

A interface deve espelhar exatamente a política aplicada no servidor.

## Decisão

- **SE** o usuário cria ou troca senha **ENTÃO** exiba os requisitos junto ao campo antes de qualquer digitação.
- **SE** a senha é o único fator **ENTÃO** exija no mínimo 15 caracteres; **SE** faz parte de fluxo multifator **ENTÃO** o mínimo pode ser 8 (referência NIST SP 800-63B-4; ajuste ao risco e à norma aplicável).
- **SE** define-se um máximo **ENTÃO** permita senhas longas e passphrases, aceite espaços e caracteres suportados, e nunca trunque em silêncio.
- **SE** a senha é comum, previsível ou vazada **ENTÃO** bloqueie e explique como corrigir, sem revelar dados internos da regra.
- **SE** há regra de composição **ENTÃO** só mantenha se houver justificativa de risco.
- **SE** há feedback durante a digitação **ENTÃO** atualize cada requisito individualmente (atendido / ainda falta) sem interromper o leitor de tela a cada tecla.
- **SE** o usuário cola ou usa gerenciador **ENTÃO** aceite; ofereça controle de mostrar/ocultar.
- **SENÃO** valide no cliente, para orientar, e no servidor, para garantir, aplicando a mesma política.

## Quando usar

- Criação de conta e troca de senha.
- Recuperação de acesso e convites.
- Configuração de novo fator de autenticação.
- Mudança de política de segurança.

## Quando evitar

- Feedback apenas após o envio → **use em vez disso:** requisitos visíveis antes.
- Lista longa de regras técnicas → **use em vez disso:** mínimo claro + bloqueio de senhas comuns.
- Limite máximo curto ou oculto → **use em vez disso:** limite alto e informado.
- Medidor de força opaco → **use em vez disso:** requisitos em texto.

## Faça

- Separe obrigatório de dica opcional.
- Informe os limites reais (mínimo e máximo).
- Permita colar e preenchimento automático.
- Ofereça mostrar/ocultar senha com controle acessível.
- Mantenha cliente e servidor com a mesma regra.

## Evite

- Exigir classes de caracteres sem base.
- Rejeitar espaços sem necessidade.
- Bloquear colar ou gerenciadores.
- Mudar a regra só no servidor.
- Registrar a senha em logs ou analytics.

## Acessibilidade

- Rótulo visível e nome acessível; `autocomplete="new-password"` na criação.
- Associe as instruções ao campo com `aria-describedby` (WCAG 3.3.2).
- Não bloqueie colar nem gerenciadores (WCAG 3.3.8).
- Estados em texto, não só cor, ícone ou medidor (WCAG 1.4.1); atualizações via região de status (WCAG 4.1.3).
- Controle de mostrar senha com nome, estado e operação por teclado.

## Microcópia

| Situação | Exemplo |
|---|---|
| Instrução | "Use pelo menos 15 caracteres. Frases longas funcionam bem." |
| Requisito atendido | "Atendido: 15 ou mais caracteres" |
| Requisito pendente | "Falta: pelo menos 15 caracteres" |
| Senha comum | "Essa senha é muito comum. Escolha outra." |

## Checklist de verificação

- [ ] Os requisitos aparecem antes da digitação?
- [ ] O mínimo está explícito?
- [ ] O máximo permite passphrases?
- [ ] Senhas comuns ou vazadas são bloqueadas?
- [ ] Cada requisito mostra estado em texto?
- [ ] Colar e gerenciadores funcionam?
- [ ] Mostrar/ocultar senha é operável por teclado?
- [ ] Cliente e servidor aplicam a mesma política?
- [ ] A senha não aparece em logs?

## Fundamentação

- NIST SP 800-63B-4: mínimos de 15 e 8 caracteres conforme fator, passphrases, bloqueio de segredos comuns, sem composição arbitrária.
- NIST 800-63 FAQ: composição fixa tem benefício menor que o esperado.
- OWASP Authentication Cheat Sheet: comprimento, bloqueio de senhas comprometidas, força como apoio.
- OWASP Password Storage Cheat Sheet: nunca armazenar senha em texto puro.
- W3C WAI técnica H100 e WCAG 2.2, 3.3.8 (Accessible Authentication): campos marcados, sem bloqueio de colar e gerenciadores.
- Baymard Institute: validação inline com feedback positivo antes do envio.
- Padrão Digital GOV.BR (Input): instruções e mensagens ligadas ao campo.
