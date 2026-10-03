---
id: keyboard-focus
title: Como indicar o foco de teclado?
category: accessibility
components: [button, link, field, menu]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["2.4.7", "1.4.11", "2.4.11", "2.4.13"]
related: [touch-target, not-color-alone, close-modal, link-text]
---

# Como indicar o foco de teclado?

> **Regra:** Todo controle acionável por teclado deve mostrar indicador de foco visível, com contraste de pelo menos 3:1 frente às cores vizinhas, sem ficar coberto por elementos fixos.

## Contexto

Na navegação por teclado, o foco indica qual elemento responderá ao próximo comando. Ao apertar Tab, a pessoa deve enxergar sua posição e saber o que Enter ou Espaço vão disparar.

O navegador oferece um indicador nativo, mas CSS que remove o outline, contraste baixo e barras fixas sobre o controle tornam o foco imperceptível.

Este padrão trata da visibilidade do foco; não substitui ordem lógica de navegação, semântica ou operação completa por teclado.

## Decisão

- **SE** o indicador nativo é visível e suficiente **ENTÃO** preserve-o.
- **SE** você personaliza o foco **ENTÃO** use contorno ao redor do controle inteiro, com contraste >= 3:1 contra as cores adjacentes (1.4.11).
- **SE** o foco seria só uma variação sutil de fundo **ENTÃO** acrescente contorno, espessura ou outra mudança estrutural.
- **SE** existe cabeçalho, rodapé ou painel fixo **ENTÃO** garanta que o controle focado não fique totalmente encoberto (2.4.11), por exemplo com margem de rolagem.
- **SE** o componente é customizado ou recebe foco programático **ENTÃO** aplique o mesmo estado de foco.
- **SE** busca padrão mais robusto **ENTÃO** use o critério AAA 2.4.13 como referência (contorno de cerca de 2 px), sem tratá-lo como exigência AA.
- **SENÃO** use `:focus-visible` com contorno claro.

## Quando usar

- Links, botões e botões só com ícone.
- Campos, caixas de seleção, opções, interruptores.
- Menus, abas, listas suspensas.
- Componentes personalizados.

## Quando evitar

- Remover o outline sem equivalente → **use em vez disso:** estilo próprio de foco.
- Usar hover como indicação de posição → **use em vez disso:** estado de foco.
- Aplicar foco só a botões → **use em vez disso:** estilo para todos os interativos.

## Faça

- Preserve o foco nativo quando funcionar.
- Use contorno claro ao redor do controle.
- Verifique o contraste em fundos e estados diferentes.
- Teste com Tab, Shift+Tab, Enter e Espaço.

## Evite

- `outline: none` sem substituto.
- Cor quase invisível como único sinal.
- Elementos fixos cobrindo o controle focado.
- Esquecer links e componentes customizados.

## Acessibilidade

- WCAG 2.4.7 (AA): ao menos um modo com foco visível.
- WCAG 1.4.11 (AA): indicador estilizado com 3:1 de contraste.
- WCAG 2.4.11 (AA): foco não totalmente encoberto.
- WCAG 2.4.13 (AAA): referência mais rigorosa de tamanho e contraste.
- Cor não é o único sinal; combine contorno, espessura ou posição.

## Microcópia

Não se aplica.

## Checklist de verificação

- [ ] Todo elemento operável mostra foco ao receber Tab?
- [ ] O indicador aparece sem depender de hover?
- [ ] O indicador se distingue claramente do estado normal?
- [ ] O contraste do indicador é >= 3:1?
- [ ] O foco permanece visível sobre fundos e estados diferentes?
- [ ] Nenhum elemento fixo cobre o controle focado?
- [ ] Links, botões e componentes customizados foram testados?
- [ ] Zoom e tecnologia assistiva foram testados?

## Fundamentação

- WCAG 2.2, 2.4.7 (Focus Visible): exige foco visível; técnica com `:focus-visible`.
- WCAG 2.2, 1.4.11 (Non-text Contrast): 3:1 para o indicador.
- WCAG 2.2, 2.4.11 (Focus Not Obscured): foco não encoberto por conteúdo do autor.
- WCAG 2.2, 2.4.13 (Focus Appearance): referência AAA.
- Padrão Digital GOV.BR (Button): manter estado de foco; Tab, Enter e Espaço.
- IBM Carbon (Focus): foco em todos os interativos, borda de 2 px, contraste 3:1.
