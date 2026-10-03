---
id: product-variants
title: Como exibir variações de produto: tamanho, cor e disponibilidade?
category: ecommerce
components: [picker, swatch, radio-group, select, size-guide]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["1.4.1", "2.1.1", "4.1.2", "1.3.1", "2.4.7"]
related: [dropdown, cart-edit-items, disabled-button, not-color-alone]
---

# Como exibir variações de produto: tamanho, cor e disponibilidade?

> **Regra:** Mostre cada dimensão de variação como grupo rotulado, recalcule a disponibilidade da combinação após cada escolha e atualize imagem, preço, estoque e compra.

## Contexto

Num produto com variações, a pessoa escolhe uma combinação, e não um item genérico. Camiseta tem tamanho e cor; tênis pode ter tamanho, cor e largura. A disponibilidade é da combinação, e não de cada atributo isolado.

O seletor precisa responder a três perguntas: que decisões existem, que valores estão disponíveis e o que muda depois da escolha. Se a relação entre cor, tamanho e disponibilidade fica oculta, a pessoa experimenta combinações, decora estados e reconfere o tempo todo se dá para comprar.

A recomendação diminui a incerteza, mas deve ser ajustada ao catálogo; não vale como regra universal.

## Decisão

- **SE** uma variação muda o item efetivamente comprado **ENTÃO** use um controle separado para cada dimensão.
- **SE** há poucas opções comparáveis **ENTÃO** mostre-as diretamente (botões, rádio, swatches), sem menu.
- **SE** o conjunto é grande ou a decisão é secundária **ENTÃO** use select ou busca, mantendo visíveis as escolhas centrais.
- **SE** a disponibilidade depende da combinação **ENTÃO** recalcule após cada seleção e diferencie selecionado, disponível, indisponível e carregando.
- **SE** a combinação muda imagem, preço, estoque ou entrega **ENTÃO** atualize todos esses itens juntos.
- **SE** uma opção está indisponível **ENTÃO** não a apresente como ativa; explique o estado e ofereça próximo passo (avisar quando chegar, outra cor).
- **SE** tamanho e ajuste importam **ENTÃO** ofereça guia de medidas que preserve a seleção atual ao abrir e fechar.
- **SE** a combinação inicial está indisponível **ENTÃO** não a deixe como padrão.
- **SE** uma lista traz variantes do mesmo produto **ENTÃO** agrupe-as em um item quando isso facilitar a leitura.
- **SENÃO** um grupo rotulado por dimensão.

## Quando usar

- Variação altera o item comprado.
- Disponibilidade varia entre combinações.
- Poucos valores precisam ser comparados antes da decisão.
- Imagem, preço ou entrega mudam conforme a variação.
- Lista mistura variantes do mesmo produto.

## Quando evitar

- Select genérico escondendo escolhas centrais → **use em vez disso:** opções visíveis por dimensão.
- Swatch sem nome acessível ou só com cor → **use em vez disso:** swatch com nome e indicador de seleção.
- Indisponível apresentado como ativo → **use em vez disso:** estado indisponível distinto.
- Desabilitar sem explicar → **use em vez disso:** estado com motivo e próximo passo.
- Atualizar só o seletor → **use em vez disso:** atualizar página inteira.
- Combinação indisponível como padrão → **use em vez disso:** primeira combinação disponível.

## Faça

- Use rótulo visível por grupo ("Cor", "Tamanho").
- Mantenha a seleção feita ao abrir e fechar o guia de medidas.
- Diferencie selecionado, disponível, indisponível e carregando.
- Mostre o estado da combinação antes de liberar a compra.
- Dê nome acessível a cada swatch.
- Valide no mobile, com teclado e com tecnologia assistiva.

## Evite

- Obrigar a tentar combinações inválidas para descobrir disponibilidade.
- Usar só linha, cor ou ícone para comunicar estado.
- Esconder valores críticos em menus sem necessidade.
- Limpar silenciosamente uma escolha anterior.
- Nomes ambíguos como "Opção" quando "Cor" ou "Tamanho" são mais claros.

## Acessibilidade

- Nome, relação e estado identificáveis por teclado e tecnologia assistiva (4.1.2, 1.3.1).
- Toda a funcionalidade por teclado, com foco visível e ordem previsível (2.1.1, 2.4.7).
- Cor nunca é o único meio de distinguir seleção ou indisponibilidade (1.4.1).
- Escolha única: semântica de radio group; listas maiores: select nativo ou listbox correto.
- Ao atualizar estados, comunique a mudança sem mover o foco.

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo do grupo | "Tamanho" |
| Nome de swatch | "Cor: azul-marinho" |
| Indisponível | "M, indisponível nesta cor" |
| Próximo passo | "Avise-me quando chegar" |
| Guia | "Ver guia de medidas" |
| Aviso de combinação | "Azul-marinho, tamanho M: 3 unidades em estoque" |

## Checklist de verificação

- [ ] Cada dimensão tem grupo e rótulo visível.
- [ ] Escolhas importantes estão visíveis quando a quantidade permite.
- [ ] A disponibilidade da combinação atual é compreensível.
- [ ] Opções indisponíveis não parecem ativas.
- [ ] Imagem, preço, estoque, entrega e botão de compra refletem a seleção.
- [ ] O estado não depende só de cor.
- [ ] Cada swatch tem nome acessível.
- [ ] O guia de medidas preserva a seleção.
- [ ] Funciona por teclado e no mobile.

## Fundamentação

- Baymard Institute, pesquisa de página de produto, vestuário e agrupamento de variações em um item de lista: atrito quando cor, tamanho e disponibilidade ficam escondidos; evidência de e-commerce, com as limitações da fonte.
- Documentação de componentes de seleção de design systems de e-commerce: referência de implementação, não substituta de pesquisa.
- WCAG 2.2: uso de cor (1.4.1) e teclado (2.1.1).
- W3C WAI-ARIA Authoring Practices, padrão de radio group: escolha única.
