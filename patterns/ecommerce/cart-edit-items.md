---
id: cart-edit-items
title: Como alterar quantidade e remover itens no carrinho?
category: ecommerce
components: [cart, stepper, number-field, icon-button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["2.5.8", "4.1.3", "4.1.2", "1.4.1"]
related: [undo, guest-checkout, product-variants, confirm-deletion, touch-target]
---

# Como alterar quantidade e remover itens no carrinho?

> **Regra:** Ofereça stepper (mais e menos) com campo numérico quando a faixa for ampla, atualize totais sem botão "Atualizar" e torne a remoção explícita e reversível.

## Contexto

O carrinho é a etapa de revisão que antecede o checkout. Alterar quantidades e remover itens soam triviais, mas seletores ruins, totais defasados e controles ambíguos levam a pedidos errados e abandono.

Pesquisa aplicada de e-commerce encontrou dificuldade em seletores baseados só em campo aberto ou lista suspensa. Atualização imediata, alvos adequados e recuperação após remover reduzem atrito e mantêm quantidade, subtotal e total coerentes.

## Decisão

- **SE** a quantidade típica é pequena e frequente **ENTÃO** use botões de aumentar e diminuir.
- **SE** quantidades grandes são plausíveis **ENTÃO** combine os botões com campo numérico editável e teclado numérico no mobile.
- **SE** a pessoa altera a quantidade **ENTÃO** atualize item, subtotal, desconto, frete e total sem botão "Atualizar carrinho".
- **SE** a quantidade está em 1 e a pessoa diminui **ENTÃO** remova o item ou conduza claramente à remoção; não bloqueie o botão.
- **SE** a remoção é reversível **ENTÃO** remova sem diálogo bloqueador, mostre confirmação e ofereça "Desfazer".
- **SE** a remoção afeta kit, desconto, assinatura ou frete **ENTÃO** explique o efeito antes ou na confirmação.
- **SE** a quantidade viola estoque, mínimo, máximo ou múltiplo **ENTÃO** valide e mostre o limite no próprio item.
- **SE** a atualização é assíncrona **ENTÃO** mostre carregamento e impeça ação duplicada.
- **SE** a atualização falha **ENTÃO** restaure o valor anterior e ofereça tentar de novo.
- **SENÃO** mantenha também um botão "Remover" visível para facilitar a descoberta.

## Quando usar

- Carrinhos com quantidade editável antes do checkout.
- Mini carrinhos e listas de compra com edição direta.
- Compras recorrentes ou de várias unidades.

## Quando evitar

- Só stepper com intervalo muito amplo → **use em vez disso:** entrada direta validada.
- Lista suspensa extensa para quantidades comuns → **use em vez disso:** stepper e campo.
- Confirmação bloqueadora em toda remoção reversível → **use em vez disso:** desfazer.

## Faça

- Selecione o valor atual ao focar o campo para facilitar a substituição.
- Dê controles grandes e espaçados, e remoção em local previsível.
- Comunique sucesso ou erro no próprio item.

## Evite

- Botão "Atualizar carrinho" como único modo de confirmar.
- Campo livre sem limites ou validação.
- Remoção silenciosa ou totais desatualizados.
- Controles pequenos e comprimidos.

## Acessibilidade

- Botões nativos com nomes específicos: "Aumentar quantidade de [produto]", "Diminuir quantidade de [produto]", "Remover [produto]".
- Campo editável com rótulo, valor atual, mínimo, máximo e estado inválido programáticos; preserve teclado e setas.
- Alvos com no mínimo 24 × 24 CSS px, ou com espaçamento que compense (2.5.8).
- Comunique mudança de total, remoção, desfazer e erros como mensagens de status, sem deslocar o foco (4.1.3).
- Não dependa só de cor.

## Microcópia

| Situação | Exemplo |
|---|---|
| Remoção | "Camiseta azul removida do carrinho." |
| Desfazer | "Desfazer" |
| Limite de estoque | "Só temos 3 unidades disponíveis." |
| Múltiplo | "Este item é vendido em caixas de 6." |
| Falha | "Não foi possível atualizar a quantidade. Tentar novamente" |

## Checklist de verificação

- [ ] Existem botões de aumentar e diminuir e, se preciso, um campo numérico.
- [ ] A quantidade atual pode ser substituída sem concatenar dígitos.
- [ ] Item, subtotal e total atualizam juntos, sem botão separado.
- [ ] Diminuir em 1 não vira beco sem saída.
- [ ] A remoção tem feedback e opção de desfazer.
- [ ] Validam-se limites de estoque, mínimo, máximo e múltiplos.
- [ ] Estados de carregamento e erro impedem ação duplicada.
- [ ] Controles têm nome acessível, foco, alvo e contraste adequados.

## Fundamentação

- Baymard Institute (carrinho e alteração de quantidade): dificuldade com campo aberto e lista suspensa; atualização imediata e recuperação.
- WCAG 2.2, critério 2.5.8: tamanho mínimo de alvo.
- WCAG 2.2, critério 4.1.3: mensagens de status.
- W3C WAI-ARIA APG (Spinbutton): comportamento de entrada numérica por teclado.
- Design systems de plataformas de e-commerce (stepper e botão de ícone): exemplos de implementação, não evidência independente.
