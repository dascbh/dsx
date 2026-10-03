---
id: field-error-position
title: A mensagem de erro vai antes ou depois do campo?
category: forms
components: [form-field, error-message, error-summary]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.1", "3.3.3", "1.3.1", "1.4.1", "4.1.3"]
related: [error-placement, form-errors, validation-timing, preserve-data-after-error]
---

# A mensagem de erro vai antes ou depois do campo?

> **Regra:** Coloque a mensagem na mesma unidade visual do rótulo e do campo, em posição consistente e ligada programaticamente ao controle; após o envio, repita-a em um resumo no topo.

## Contexto

Quando o envio falha, a pessoa precisa perceber, sem caçar, três coisas: que existe erro, qual campo é o afetado e como corrigi-lo. A mensagem deve ficar junto do campo e seguir a ordem de leitura, e não num alerta distante.

Não existe resposta universal para "antes ou depois". Em muitos padrões a mensagem fica depois do rótulo e da dica e antes do controle; o essencial é ser percebida na sequência, manter posição consistente e estar associada ao campo. Para grupos de rádio ou checkbox, ela fica junto da pergunta.

A posição anda junto com o momento: validar cedo demais pune a pessoa; validar só no fim a surpreende.

## Decisão

- **SE** o erro é de um campo simples **ENTÃO** exiba a mensagem junto ao campo, na mesma posição em todo o formulário.
- **SE** o campo é grupo de rádio ou checkbox **ENTÃO** coloque a mensagem junto da pergunta e do grupo.
- **SE** o envio falhou **ENTÃO** exiba um resumo no topo da área principal e repita cada mensagem ao lado do respectivo campo, com texto idêntico.
- **SE** o resumo existe **ENTÃO** cada item aponta para o controle e o foco vai ao resumo ou ao primeiro erro.
- **SE** o campo está vazio e acabou de receber foco **ENTÃO** não valide.
- **SE** a validação durante o preenchimento é justificada pela regra **ENTÃO** valide sem interromper a digitação; **SENÃO** valide ao avançar ou enviar.
- **SE** o valor foi corrigido **ENTÃO** remova a mensagem e preserve os dados.
- **SE** o problema é de elegibilidade ou serviço **ENTÃO** use comunicação própria, não erro de campo.

## Quando usar

- Após tentar enviar ou avançar.
- Em formulários longos ou com vários erros.
- Quando feedback durante o preenchimento evita erro previsível.

## Quando evitar

- Validar ao focar um campo vazio → **use em vez disso:** validar ao avançar.
- Validar a cada tecla → **use em vez disso:** validar ao concluir o campo, com regra clara.
- Alerta distante sem vínculo com o campo → **use em vez disso:** mensagem inline mais resumo.
- Mensagem só "inválido" → **use em vez disso:** problema mais correção.

## Faça

- Mantenha rótulo, dica e mensagem juntos.
- Explique o problema e como corrigir.
- Use o mesmo texto no resumo e no campo.
- Preserve o que já foi digitado.

## Evite

- Esconder a mensagem em tooltip.
- Duplicar textos conflitantes.
- Indicar o erro só por cor, ícone ou posição.
- Perder o foco após o envio.

## Acessibilidade

- Texto identifica o campo e descreve o erro (3.3.1) e sugere correção quando conhecida (3.3.3).
- Associe mensagem e controle com `aria-describedby` e marque `aria-invalid="true"`.
- Grupos usam `fieldset` e `legend` (1.3.1).
- Não dependa de cor (1.4.1); anuncie mensagens dinâmicas sem roubar foco (4.1.3).
- Coloque o resumo antes do formulário, com título claro.

## Microcópia

| Situação | Exemplo |
|---|---|
| Título do resumo | "Há 2 problemas para corrigir" |
| Item do resumo | "Informe o CPF com 11 dígitos" |
| Mensagem no campo | "Informe o CPF com 11 dígitos." |
| Grupo | "Escolha uma forma de pagamento." |

## Checklist de verificação

- [ ] A mensagem identifica o campo.
- [ ] Explica o problema e orienta a correção.
- [ ] Está próxima do campo, na mesma posição em todos os campos.
- [ ] Há resumo após o envio, com links para os campos.
- [ ] O texto do resumo é igual ao do campo.
- [ ] Nada é validado ao focar campo vazio.
- [ ] A validação não interrompe a digitação.
- [ ] A mensagem some quando o valor é corrigido.
- [ ] Os dados preenchidos são preservados.
- [ ] O foco vai ao resumo ou ao primeiro erro.

## Fundamentação

- W3C WAI (User Notification) e WCAG 2.2 (3.3.1): resumo mais mensagem inline, sem posição única imposta.
- Baymard Institute: validação inline evita descoberta tardia, mas validação prematura prejudica.
- Nielsen Norman Group (mensagens de erro hostis; diretrizes): proximidade, linguagem humana, momento certo.
- NHS Digital Service Manual: mensagem junto à pergunta; sem validar no foco ou na digitação.
- USWDS (Form) e Padrão Digital GOV.BR (Input): mensagem ligada ao campo.
- CMS Design System e Adobe Spectrum: resumo mais mensagem local; valores preservados.
