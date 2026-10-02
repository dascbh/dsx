---
id: autopreenchimento
titulo: Quando usar preenchimento automático?
categoria: formularios
componentes: [campo-de-texto, autocomplete, combobox, endereco]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["1.3.5", "3.3.7", "2.1.1", "1.4.1", "4.1.2"]
relacionados: [dropdown, endereco-por-cep, campos-obrigatorios, preservar-dados-apos-erro]
---

# Quando usar preenchimento automático?

> **Regra:** Use preenchimento automático para reduzir digitação, mas mantenha todos os campos visíveis, editáveis e confirmáveis pela pessoa.

## Contexto

Preencher formulários demanda memória, digitação e conferência. O preenchimento automático alivia esse trabalho, mas o termo abrange comportamentos diferentes: o navegador oferece dados guardados (autofill), o campo propõe opções enquanto se digita (autocomplete de lista) ou o sistema completa campos relacionados depois de uma seleção.

Nenhum deles deve ocultar o que foi preenchido nem converter uma sugestão em decisão sem volta. A pessoa precisa saber de onde veio o valor, conferi-lo, corrigi-lo e continuar à mão se a sugestão faltar ou estiver errada.

Misturar autofill com autocomplete de busca gera interface difícil de anunciar, navegar e corrigir.

## Decisão

- **SE** o campo coleta dado recorrente da própria pessoa (nome, e-mail, telefone, endereço, CEP, usuário, cartão) **ENTÃO** declare o atributo autocomplete com o token padronizado correspondente e mantenha o rótulo visível.
- **SE** a pessoa precisa achar um valor em lista grande **ENTÃO** use sugestões curtas e relevantes, navegáveis por teclado, que aceitem digitação contínua.
- **SE** não há correspondência na lista **ENTÃO** permita informar o valor manualmente.
- **SE** é endereço **ENTÃO** use a busca como apoio, preencha os campos relacionados após a seleção e mantenha-os visíveis e editáveis, com alternativa de digitar manualmente.
- **SE** uma seleção preenche outros campos **ENTÃO** indique o que mudou e mantenha editáveis.
- **SE** o valor pode pertencer a outra pessoa **ENTÃO** não habilite autofill ou exija confirmação.
- **SE** a sugestão altera decisão importante **ENTÃO** peça confirmação explícita.
- **SENÃO** não impeça o autofill do navegador.

## Quando usar

- Campo de dado conhecido e recorrente da própria pessoa.
- Propósito do campo identificável por token padronizado.
- Lista extensa em que sugestões relevantes ajudam.
- Resultado revisável antes do envio.
- Alternativa manual disponível.

## Quando evitar

- Valor que pode pertencer a outra pessoa → **use em vez disso:** campo em branco com rótulo claro.
- Sugestão que altera decisão importante sem confirmação → **use em vez disso:** etapa de confirmação.
- Sistema que não mostra todos os campos preenchidos → **use em vez disso:** campos convencionais visíveis.
- Lista longa, irrelevante ou que cobre campos e rótulos → **use em vez disso:** lista curta posicionada sem sobreposição.
- Apagar o que a pessoa digitou sem aviso → **use em vez disso:** preservar e avisar.

## Faça

- Identifique o propósito real do campo com o token correto.
- Mantenha o rótulo visível.
- Mostre sugestões curtas e relevantes.
- Preserve a edição manual.
- Permita revisar os valores preenchidos.
- Teste sem dados salvos, com dados divergentes e endereço não encontrado.

## Evite

- Preencher sem explicar.
- Ocultar campos relacionados.
- Forçar uma sugestão.
- Bloquear a entrada manual.
- Enviar o formulário automaticamente.
- Apagar dados sem aviso.
- Depender de um navegador específico.

## Acessibilidade

- Use autocomplete com valores válidos, coerentes com a finalidade real do campo (1.3.5); o token acompanha o dado que o rótulo pede, e não o nome interno no código.
- Para sugestões, use aria-autocomplete conforme o comportamento real: list, inline ou both; anuncie abertura, item ativo e seleção (4.1.2).
- Mantenha o foco no campo enquanto a lista aparece; teclado navega e seleciona; ofereça forma clara de rejeitar (2.1.1).
- Não use só cor, posição ou alteração visual para mostrar o valor escolhido (1.4.1).
- Não remova rótulos, instruções ou campos convencionais depois da sugestão.
- Evite pedir de novo dados já informados na mesma sessão (3.3.7).
- Teste leitor de tela, teclado, zoom, toque e voz.

## Microcópia

| Situação | Exemplo |
|---|---|
| Sem resultado | "Não encontramos esse endereço. Preencha os campos manualmente." |
| Aviso de preenchimento | "Preenchemos rua, bairro e cidade. Confira os dados." |
| Alternativa manual | "Digitar endereço manualmente" |
| Rótulo | "CEP" |

## Checklist de verificação

- [ ] Campos de dados pessoais têm autocomplete com token padronizado correto.
- [ ] O rótulo continua visível depois de preencher.
- [ ] Os campos relacionados preenchidos continuam visíveis e editáveis.
- [ ] Existe alternativa de digitação manual quando não há sugestão.
- [ ] A lista de sugestões funciona com teclado e não cobre o formulário.
- [ ] O formulário não é enviado automaticamente após a seleção.
- [ ] Nada digitado é apagado sem aviso.
- [ ] Testado sem dados salvos e com dados divergentes.

## Fundamentação

- W3C WAI, técnica H98 e critério 1.3.5: tokens autocomplete padronizados e benefícios para pessoas com dificuldades motoras, de memória e linguagem.
- W3C, regra de validação do atributo autocomplete: estrutura válida dos tokens.
- W3C WAI-ARIA 1.2, aria-autocomplete: sugestões inline, em lista ou combinadas.
- Baymard Institute, busca automática de endereço e autocomplete: reduz erros, mas campos convencionais visíveis e entrada manual são necessários; evidência de e-commerce.
- Baymard Institute, detecção automática de cidade e estado: menos digitação em dispositivos móveis.
- GOV.UK Design System, campo de texto: autocomplete para acelerar o preenchimento.
- Adobe Spectrum, IBM Carbon e U.S. Web Design System, combo box: sugestões que mantêm o campo editável.
