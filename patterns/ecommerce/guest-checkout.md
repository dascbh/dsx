---
id: guest-checkout
title: Quando oferecer checkout como convidado?
category: ecommerce
components: [checkout, account-selection, button, form]
type: recommendation
impact: high
status: recommended
evidence: moderate
wcag: ["3.3.2", "2.4.6", "2.4.3", "2.5.3"]
related: [cart-edit-items, address-by-postal-code, form-steps, password-recovery]
---

# Quando oferecer checkout como convidado?

> **Regra:** Quando a conta não é essencial para concluir a compra, ofereça "Continuar como convidado" de forma explícita e destacada no início da seleção de conta, e proponha criar conta só depois da confirmação do pedido.

## Contexto

O checkout de convidado desvincula a coleta dos dados que a transação exige da decisão de manter cadastro. A questão não é se a loja deve abolir contas, mas se criar conta precisa ocorrer antes ou durante a compra para que a pessoa finalize.

Criar conta acrescenta uma decisão e, em muitos fluxos, senha ou verificação que não são necessárias ao pedido. Pesquisas de checkout relatam dificuldade quando a opção de convidado é discreta, aparece abaixo de login e cadastro ou só surge depois do e-mail.

Também há atrito quando a pessoa escolhe continuar como convidada e o fluxo volta a pedir cadastro.

## Decisão

- **SE** a conta não é indispensável para concluir a compra **ENTÃO** ofereça checkout como convidado.
- **SE** houver seleção de conta **ENTÃO** coloque a opção de convidado no início, com destaque comparável ao do login.
- **SE** o cliente é recorrente **ENTÃO** mantenha o login disponível, sem exigi-lo de quem é novo.
- **SE** criar conta traz valor real **ENTÃO** ofereça depois da confirmação do pedido, explicando os benefícios, sem interromper o checkout.
- **SE** a conta é essencial ao serviço ou há exigência operacional ou normativa justificada **ENTÃO** explique no início por que ela é necessária e quais dados serão usados.
- **SE** a pessoa escolheu convidado **ENTÃO** não peça senha nem cadastro no meio do fluxo.
- **SE** houver erro ou retorno **ENTÃO** preserve os dados preenchidos.
- **SENÃO** trate convidado como caminho padrão para compras pontuais.

## Quando usar

- Compras pontuais ou de baixa recorrência.
- Produtos que não dependem de área autenticada.
- Lojas em que rastreio, suporte e comprovante funcionam por e-mail ou número do pedido.
- Fluxos mobile com atenção e espaço limitados.

## Quando evitar

- Conta é parte essencial do serviço → **use em vez disso:** explicar a necessidade antes e pedir só os dados necessários.
- Relação recorrente precisa existir antes da transação → **use em vez disso:** cadastro curto no início, com justificativa.

## Faça

- Use rótulos como "Continuar como convidado" ou "Comprar sem criar conta".
- Informe, quando verdadeiro, que a conta pode ser criada depois.
- Mantenha o login acessível.
- Valide a decisão no contexto do produto, público e modelo de negócio.

## Evite

- Exigir cadastro antes de verificar se é necessário.
- Esconder a opção em link de baixo destaque.
- Rótulo vago como "Continuar".
- Revelar a opção só depois do e-mail.
- Afirmar que convidado sempre aumenta conversão.

## Acessibilidade

- O rótulo deve deixar claro o que acontece ao ativar (3.3.2); "Continuar" sozinho não informa o destino.
- Controle alcançável por teclado, com foco visível e ordem de foco previsível (2.4.3).
- Nome acessível coerente com o texto visível (2.5.3).
- Teste com leitor de tela, zoom e viewport mobile.

## Microcópia

| Situação | Exemplo |
|---|---|
| Opção principal | "Continuar como convidado" |
| Login | "Já tenho conta" |
| Pós-compra | "Quer salvar seus dados para a próxima compra? Crie uma senha." |
| Conta obrigatória | "Para este serviço, precisamos de uma conta. Leva menos de um minuto." |

## Checklist de verificação

- [ ] A conta é realmente necessária para concluir esta compra.
- [ ] A opção de convidado aparece no início da seleção de conta.
- [ ] O rótulo informa o que acontecerá.
- [ ] A opção tem destaque comparável ao do login.
- [ ] É possível concluir sem criar senha.
- [ ] A oferta de criar conta aparece só após a confirmação do pedido.
- [ ] Os dados preenchidos permanecem após erro ou retorno.
- [ ] O fluxo opera com teclado, leitor de tela, zoom e no mobile.

## Fundamentação

- Baymard Institute (tornar o checkout de convidado proeminente; deixar a criação de conta para a etapa de confirmação): dificuldade com opção discreta e ganho ao adiar o cadastro.
- Baymard Institute (metodologia de pesquisa): base dos testes de usabilidade de checkout; evidência contextual.
- W3C WAI, técnica G131 e critério 3.3.2 (Labels or Instructions): rótulos e instruções claras quanto ao propósito dos controles.
