---
id: form-errors
title: Como estruturar mensagens de erro em formulários?
category: forms
components: [form-field, error-message, error-summary]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["3.3.1", "3.3.3", "1.4.1", "1.3.1", "4.1.3"]
related: [helpful-error-message, preserve-data-after-error, validation-timing, not-color-alone, required-fields]
---

# Como estruturar mensagens de erro em formulários?

> **Regra:** Toda mensagem de erro de campo nomeia o campo pelo rótulo, descreve o problema, diz como corrigir, fica ligada ao controle e não apaga o que a pessoa digitou.

## Contexto

Durante ou após o envio, a pessoa pode informar dados ausentes, inválidos ou incompatíveis com as regras. Ela precisa identificar o problema, entender a correção e retomar a tarefa sem redigitar tudo.

"Ocorreu um erro" obriga a investigar; uma mensagem que cita o campo, explica o que falhou e aponta o próximo passo transforma a falha em ação. Isso reduz retrabalho e ajuda quem tem limitação visual, cognitiva ou de linguagem.

Formatos, limites e requisitos previsíveis devem ser explicados antes do erro, na dica do campo.

## Decisão

- **SE** o sistema detecta entrada ausente, fora do formato ou fora dos valores permitidos **ENTÃO** mostre mensagem junto ao campo.
- **SE** há vários erros **ENTÃO** repita as mensagens em resumo no início do formulário.
- **SE** o formato ou limite é previsível **ENTÃO** explique antes, na dica.
- **SE** existe correção conhecida **ENTÃO** sugira-a, salvo risco de segurança.
- **SE** a falha é de serviço, permissão ou elegibilidade **ENTÃO** não use erro de campo; use comunicação própria com próximos passos.
- **SE** a correção exige consulta ou edição **ENTÃO** não use alerta temporário.
- **SE** a pessoa ainda não teve chance razoável de preencher **ENTÃO** não acuse erro.
- **SENÃO** valide ao tentar avançar ou enviar.

## Quando usar

- Campo obrigatório vazio.
- Formato incorreto (e-mail, data).
- Número fora do intervalo ou opção não permitida.
- Combinação de valores que o sistema consegue explicar.

## Quando evitar

- Problemas que a pessoa não resolve alterando a entrada → **use em vez disso:** mensagem de serviço com contexto e próximo passo.
- Toast para erro que exige correção → **use em vez disso:** mensagem inline persistente.
- Tratar mensagem inline, foco e momento como regra universal → **use em vez disso:** testar no fluxo real.

## Faça

- Nomeie o campo com o mesmo texto do rótulo.
- Descreva o que foi aceito ou rejeitado.
- Indique ação concreta.
- Preserve os valores digitados.
- Mantenha a mensagem visível até a correção.

## Evite

- Mensagens vagas.
- Depender só de cor.
- Validar cedo demais.
- Apagar dados.
- Confundir erro de entrada com falha do serviço.
- Fazer a mensagem sumir sozinha.

## Acessibilidade

- Erro detectado automaticamente é identificado e descrito em texto (3.3.1); correção sugerida quando conhecida (3.3.3).
- Cor não é o único sinal (1.4.1).
- Vincule a mensagem por `aria-describedby` ou `aria-errormessage`; aplique `aria-invalid="true"` quando o valor foi tido como inválido, e não apenas porque o campo obrigatório está vazio antes do envio.
- Mensagens dinâmicas em região ao vivo; `role="alert"` só para o realmente importante e sem mover o foco (4.1.3).
- O resumo deve permitir navegar a cada campo.

## Microcópia

| Situação | Exemplo |
|---|---|
| Obrigatório vazio | "Informe seu e-mail." |
| Formato | "Digite o e-mail no formato nome@empresa.com.br." |
| Intervalo | "A quantidade deve ser entre 1 e 10." |
| Data | "Informe uma data a partir de hoje." |
| Evitar | "Entrada inválida." |

## Checklist de verificação

- [ ] O texto identifica o campo.
- [ ] A mensagem explica o problema.
- [ ] A mensagem indica como corrigir.
- [ ] O erro não depende só de cor ou ícone.
- [ ] A mensagem está associada ao campo por atributo ARIA.
- [ ] Os dados digitados são preservados.
- [ ] O resumo, quando existe, tem links para os campos.
- [ ] O erro não aparece antes de uma tentativa razoável.
- [ ] Foi testado com teclado, zoom e leitor de tela.

## Fundamentação

- WCAG 2.2: 3.3.1 (identificação de erro), 3.3.3 (sugestão de correção), 1.4.1 (cor), 1.3.1 (relações).
- WAI-ARIA 1.2 (aria-invalid, aria-errormessage) e padrão Alert do APG.
- GOV.UK Design System (Error message, Error summary): proximidade, resumo vinculado, não apagar valores.
- Nielsen Norman Group (diretrizes de mensagens de erro; heurística 9): linguagem humana, problema preciso, sugestão construtiva.
- Padrão Digital GOV.BR (Message, Input) e Adobe Spectrum (escrita para erros).
- CMS Design System (Error validation) e AMAWeb.
