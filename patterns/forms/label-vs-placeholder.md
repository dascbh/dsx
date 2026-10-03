---
id: label-vs-placeholder
title: Label ou placeholder: o que usar em formulários?
category: forms
components: [text-field, label, placeholder, helper-text]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.2", "1.3.1", "4.1.2", "1.4.3", "2.5.3"]
related: [required-fields, field-order, form-errors, helpful-error-message]
---

# Label ou placeholder: o que usar em formulários?

> **Regra:** Todo campo tem label visível e associado; o placeholder serve apenas como exemplo curto ou formato, nunca como identificação.

## Contexto

O placeholder some assim que a pessoa começa a digitar. Se ele é o único texto que identifica o campo, ela esquece o que deveria informar e tem dificuldade de revisar os dados antes de enviar.

Além disso, placeholders costumam ter contraste baixo e não são tratados como rótulo por tecnologias assistivas. O label visível continua na tela durante e depois do preenchimento, serve de alvo de clique e dá nome ao campo para leitor de tela e comando de voz.

Instruções longas pertencem a um texto auxiliar próximo ao campo, não ao placeholder.

## Decisão

- **SE** existe um campo de entrada **ENTÃO** forneça label visível, curto e específico.
- **SE** o campo precisa de formato ou exemplo **ENTÃO** use placeholder curto, só como complemento.
- **SE** a instrução tem mais que uma frase curta ou deve ser relida **ENTÃO** use texto auxiliar associado por aria-describedby.
- **SE** o campo é obrigatório **ENTÃO** indique isso no label, nunca só no placeholder.
- **SE** o campo é de busca **ENTÃO** mantenha label (visível ou, no mínimo, nome acessível) e botão claro.
- **SE** o design pede label flutuante **ENTÃO** garanta que o label permaneça visível com o campo preenchido.
- **SENÃO** label acima do campo, texto auxiliar abaixo do label.

## Quando usar

- Label visível: em todos os campos.
- Placeholder: exemplo curto ("nome@empresa.com.br") ou formato ("DD/MM/AAAA").
- Texto auxiliar: regras, restrições e instruções persistentes.

## Quando evitar

- Placeholder como único label → **use em vez disso:** label visível.
- Regras longas no placeholder → **use em vez disso:** texto auxiliar.
- Obrigatoriedade apenas no placeholder → **use em vez disso:** marca no label.
- Label que desaparece no foco → **use em vez disso:** label persistente.

## Faça

- Associe label e campo com for e id.
- Escreva labels que identifiquem o propósito sem ambiguidade.
- Mantenha exemplos de placeholder em poucas palavras.
- Relacione o texto auxiliar ao campo com aria-describedby.
- Teste o campo já preenchido.

## Evite

- Usar exemplo como se fosse label.
- Repetir no placeholder a regra já escrita no texto auxiliar.
- Confiar no contraste padrão do placeholder.
- Remover o contexto do campo ao receber foco.

## Acessibilidade

- O nome acessível vem do label, não do placeholder (3.3.2, 4.1.2).
- Associação programática label-campo (1.3.1).
- Instruções continuam disponíveis após preencher.
- Se houver placeholder, garanta contraste suficiente (1.4.3).
- O nome acessível deve conter o texto visível do label, para comando de voz (2.5.3).

## Microcópia

| Situação | Exemplo |
|---|---|
| Label | "E-mail" |
| Placeholder de exemplo | "nome@empresa.com.br" |
| Texto auxiliar | "Use o e-mail cadastrado na sua conta." |
| Label obrigatório | "CPF (obrigatório)" |
| Label de busca | "Pesquisar pedidos" |

## Checklist de verificação

- [ ] Todo campo tem label visível.
- [ ] O label permanece visível após o preenchimento.
- [ ] O label identifica claramente o propósito.
- [ ] O placeholder é só um exemplo ou formato curto.
- [ ] Nenhuma instrução longa está no placeholder.
- [ ] Label e campo estão associados (for/id).
- [ ] O texto auxiliar está ligado por aria-describedby.
- [ ] A obrigatoriedade não depende só do placeholder.
- [ ] O campo foi testado com teclado e leitor de tela.

## Fundamentação

- WCAG 2.2, critério 3.3.2: rótulos ou instruções para entrada de dados.
- W3C Forms Tutorial (rotular controles; instruções de formulário): associação for/id e limites do placeholder.
- GOV.UK Design System (Text input): label visível, sem placeholder no lugar de label ou dica.
- U.S. Web Design System (Text input): campo com label e cautela com placeholder.
- Padrão Digital GOV.BR (Input): distingue label, placeholder e texto auxiliar.
- Material Design 3 e Apple Human Interface Guidelines: o label permanece visível; o placeholder desaparece.
- AMAWeb e ABNT NBR 17225: verificação de existência e clareza de rótulos.
