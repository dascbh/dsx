---
id: not-color-alone
title: Por que não usar apenas cor para comunicar erros?
category: accessibility
components: [form-field, error-message, icon, chart]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["1.4.1", "1.4.11", "1.4.3", "3.3.1", "1.3.1"]
related: [form-errors, required-fields, field-error-position, success-confirmation]
---

# Por que não usar apenas cor para comunicar erros?

> **Regra:** Cor reforça o estado, mas nunca é o único sinal: acompanhe-a de texto que diga o problema, perto do elemento afetado.

## Contexto

Erros, avisos, obrigatoriedade e confirmações costumam ter cores próprias. Se a cor é o único sinal, quem tem daltonismo, baixa visão, tela com brilho reduzido, impressão em cinza ou usa leitor de tela pode não perceber o que aconteceu nem o que fazer.

O requisito não proíbe cor. Ele impede que a cor seja o único meio de transmitir informação, indicar ação, pedir resposta ou distinguir elemento. Texto, ícone, padrão ou borda adicional precisam carregar a mesma informação.

Um ícone sem significado explícito ou uma legenda distante também não resolve.

## Decisão

- **SE** um campo está inválido **ENTÃO** escreva o problema em texto, ligado ao campo, além de qualquer cor.
- **SE** a cor sinaliza sucesso, alerta ou erro **ENTÃO** acrescente texto ou ícone com significado.
- **SE** um campo é obrigatório **ENTÃO** marque com texto (ex.: "obrigatório"), não só com cor.
- **SE** gráficos, tabelas ou mapas distinguem categorias por cor **ENTÃO** adicione padrão, rótulo, forma ou legenda próxima.
- **SE** um estado de controle muda **ENTÃO** use sinal adicional (ícone, sublinhado, peso, texto).
- **SE** usa ícone como reforço **ENTÃO** ele precisa ter nome ou contexto compreensível.
- **SE** a informação aparece dinamicamente **ENTÃO** associe ao controle e verifique o anúncio no leitor de tela.
- **SENÃO** valide a tela em escala de cinza.

## Quando usar

- Erros de validação.
- Estados de sucesso, alerta, seleção e obrigatoriedade.
- Gráficos, tabelas e mapas com categorias por cor.
- Links e controles que mudam de estado.

## Quando evitar

- Borda ou fundo vermelho como única indicação → **use em vez disso:** mensagem textual mais ícone.
- Campo obrigatório só por cor → **use em vez disso:** texto "obrigatório" no rótulo.
- Legenda distante que exige memorização → **use em vez disso:** rótulo direto no elemento.
- Ícone no lugar do texto → **use em vez disso:** ícone com texto.

## Faça

- Escreva o estado e identifique o campo.
- Associe a mensagem ao controle.
- Mantenha contraste em texto, ícones e bordas.
- Teste em escala de cinza e com simulação de daltonismo.

## Evite

- Usar só vermelho para erro.
- Marcar sucesso só com verde.
- Trocar texto por ícone sem nome.
- Aceitar baixo contraste entre estados.
- Validar apenas visualmente.

## Acessibilidade

- 1.4.1 (nível A): cor não é o único meio visual.
- 1.4.11: contraste de ícones, bordas e indicadores de estado.
- 1.4.3: contraste do texto da mensagem.
- 3.3.1: erro descrito em texto; 1.3.1: relação campo-mensagem programática.
- Teste com pessoas que não distinguem cores, zoom, alto contraste, teclado e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Erro de campo | "Digite o número do cartão." |
| Senha | "Crie uma senha com pelo menos 8 caracteres." |
| Obrigatório | "Nome completo (obrigatório)" |
| Sucesso | "Dados salvos." |

## Checklist de verificação

- [ ] O erro tem indicação textual.
- [ ] O campo afetado está identificado.
- [ ] A tela continua compreensível em escala de cinza.
- [ ] O ícone reforça, mas não substitui, o texto.
- [ ] A mensagem está perto do elemento.
- [ ] Texto, ícones e bordas têm contraste suficiente.
- [ ] O estado dinâmico é anunciado.
- [ ] Obrigatoriedade não depende só de cor.

## Fundamentação

- WCAG 2.2, 1.4.1 e documento "Understanding" do critério: cor não pode ser o único meio.
- WCAG 2.2: 1.4.11, 1.4.3, 3.3.1 e 1.3.1.
- Padrão Digital GOV.BR (Message): cores semânticas como apoio, com alternativa textual.
- AMAWeb (manual e checklist): campos obrigatórios com texto além do vermelho; verificações de contraste.
- Adobe Spectrum (escrita para erros): borda, ícone e mensagem textual.
