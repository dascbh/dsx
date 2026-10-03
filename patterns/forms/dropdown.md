---
id: dropdown
title: Quando usar dropdown e quando evitar?
category: forms
components: [dropdown, select, combobox, radio, autocomplete]
type: contextual-decision
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "4.1.2", "2.1.1", "2.4.7", "1.4.10", "3.3.2"]
related: [autofill, label-vs-placeholder, filter-structure, field-order]
---

# Quando usar dropdown e quando evitar?

> **Regra:** Use dropdown apenas para escolha única entre valores predefinidos; poucas opções pedem opções visíveis e listas longas pedem busca.

## Contexto

Dropdown, select e combo box atendem a problemas distintos, ainda que muitas interfaces os tratem como um só controle. A escolha varia com o tamanho da lista, a necessidade de comparar, a probabilidade de a pessoa já saber o valor e o caráter único ou múltiplo da seleção.

Um dropdown esconde as opções até ser aberto: ganha espaço, mas soma uma interação e reduz a comparação. Em lista curta, a pessoa abre só para descobrir o que existe; em lista longa, percorre linhas sem visão geral nem busca.

Escolha o controle pela tarefa, não apenas pelo espaço disponível. Limites numéricos de itens são heurísticas, não regras rígidas.

## Decisão

- **SE** a escolha é única, os valores são predefinidos e exclusivos, e a compactação traz ganho real **ENTÃO** use select ou dropdown.
- **SE** a lista é curta e comparar ajuda a decidir **ENTÃO** use rádio, cartões ou lista aberta.
- **SE** a lista é longa ou a pessoa conhece parte do valor **ENTÃO** use autocomplete ou combo box e deixe claro se valores personalizados são aceitos.
- **SE** mais de um valor pode ser escolhido **ENTÃO** use caixas de seleção ou lista de múltipla escolha com resumo.
- **SE** a seleção dispara um comando **ENTÃO** use botão com menu, não dropdown de formulário.
- **SE** o controle é navegação **ENTÃO** use estrutura de navegação.
- **SE** não existe padrão sensato e neutro **ENTÃO** evite dropdown ou inclua opção explícita de "Selecione".
- **SE** o select nativo atende à tarefa **ENTÃO** use o nativo.
- **SE** o componente customizado carece de semântica, foco e teclado completos **ENTÃO** descarte-o.
- **SENÃO** prefira opções visíveis.

## Quando usar

- Uma única opção deve ser escolhida.
- Valores predefinidos e mutuamente exclusivos.
- Ordem previsível ou padrão sensato.
- Alternativas não precisam ficar visíveis para comparação.
- Espaço limitado e entrada restrita a valores válidos.
- Lista média, percorrível sem esforço.

## Quando evitar

- Poucas opções comparáveis → **use em vez disso:** rádio ou cartões.
- Lista extensa → **use em vez disso:** autocomplete.
- Valor conhecido da pessoa → **use em vez disso:** campo com sugestões.
- Seleção múltipla → **use em vez disso:** caixas de seleção.
- Ação ou comando → **use em vez disso:** botão com menu.
- Navegação principal → **use em vez disso:** menu de navegação.

## Faça

- Defina se a escolha é única ou múltipla.
- Verifique se as opções precisam ser comparadas.
- Mantenha o rótulo persistente, separado do valor selecionado.
- Agrupe opções relacionadas em listas longas.
- Mostre o valor selecionado.
- Valide com teclado, leitor de tela, zoom e telas estreitas.

## Evite

- Escolher dropdown só para economizar espaço.
- Esconder alternativas simples.
- Lista extensa sem busca ou agrupamento.
- Múltipla seleção sem resumo.
- Misturar campo de formulário com menu de comando.
- Placeholder como único rótulo.
- Combobox customizado sem teclado completo.
- Tratar limites numéricos como regra rígida.

## Acessibilidade

- Use rótulo visível associado ao campo (1.3.1, 3.3.2); não use placeholder como único rótulo.
- Dê preferência ao select nativo; se customizar, siga o padrão combobox do WAI-ARIA APG: nome acessível, estado expandido, vínculo com o popup, opção ativa e papel listbox (4.1.2).
- Verifique Tab, Enter ou Espaço, setas, Escape, digitação e filtragem (2.1.1).
- Foco visível, seleção que não muda silenciosamente, e foco devolvido ao acionador ao fechar (2.4.7).
- Verifique contraste, zoom de 200% e 400%, áreas de toque e menus que não saiam da viewport (1.4.10).

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo | "Estado" |
| Opção inicial | "Selecione um estado" |
| Busca em lista longa | "Digite o nome da cidade" |
| Sem resultado | "Nenhuma cidade encontrada. Confira a grafia." |
| Resumo de múltipla | "3 categorias selecionadas" |

## Checklist de verificação

- [ ] A escolha é única.
- [ ] Listas curtas e comparáveis usam opções visíveis.
- [ ] Listas longas têm busca ou agrupamento.
- [ ] O rótulo é visível e persiste após a seleção.
- [ ] O valor selecionado permanece visível.
- [ ] O controle não dispara comando nem navegação.
- [ ] Funciona com teclado: Tab, setas, Enter, Espaço e Escape.
- [ ] O componente customizado expõe nome, estado expandido e opção ativa.
- [ ] Funciona em zoom de 400% e em tela estreita.

## Fundamentação

- Baymard Institute, usabilidade de dropdowns: abertura desnecessária em listas curtas, dificuldade em longas, alternativas como rádio e autocomplete; limites numéricos como heurística de e-commerce.
- Nielsen Norman Group, listas dropdown e listbox: equilíbrio entre economia de espaço e opções escondidas.
- W3C WAI-ARIA Authoring Practices, padrão combobox: popup, foco, seleção e teclado.
- IBM Carbon, dropdown: diferença entre dropdown, filtrável, multiselect e combo box.
- Adobe Spectrum, combo box: sugestões para localizar valores.
- Design System GOV.BR, select: estados, comportamento e acessibilidade.
