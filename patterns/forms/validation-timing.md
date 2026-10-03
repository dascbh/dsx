---
id: validation-timing
title: Quando validar campos durante o preenchimento?
category: forms
components: [text-field, error-message, validation]
type: contextual-decision
impact: high
status: caution
evidence: strong
wcag: ["3.2.1", "3.3.1", "3.3.3", "4.1.3", "1.4.1"]
related: [form-errors, field-error-position, password-requirements, preserve-data-after-error]
---

# Quando validar campos durante o preenchimento?

> **Regra:** Valide ao avançar ou enviar; antecipe o feedback somente quando o valor estiver completo ou o requisito puder ser mostrado sem interromper a digitação.

## Contexto

Validar antes do envio corta retrabalho, mas pode interromper a digitação e levar a pessoa a crer que errou antes de terminar. O momento deve seguir o tipo de dado, a expectativa da tarefa e o custo da interrupção.

Estudos apontam ganho com a validação inline, mas também irritação quando o sistema indica erro cedo demais. Não há técnica universal: teste o resultado com o público e o tipo de campo reais.

A validação no navegador orienta, mas nunca dispensa a validação no servidor.

## Decisão

- **SE** o campo é obrigatório **ENTÃO** valide quando a pessoa tentar avançar ou enviar.
- **SE** o campo está vazio e acabou de receber foco **ENTÃO** não mostre erro.
- **SE** o formato tem tamanho conhecido (CEP, telefone, cartão) **ENTÃO** valide quando a entrada estiver completa.
- **SE** a regra exige consulta (disponibilidade de nome de usuário, cálculo) **ENTÃO** valide de modo assíncrono depois de uma pausa, com estado de carregamento e mensagem clara.
- **SE** é senha **ENTÃO** mostre os requisitos antes ou durante a digitação e marque cada critério ao ser atendido.
- **SE** existem campos dependentes (confirmação) **ENTÃO** revalide o campo relacionado logo que a mudança sanar ou gerar a inconsistência.
- **SE** o valor se tornou válido **ENTÃO** remova o erro imediatamente.
- **SE** o feedback apenas repetiria uma instrução já visível **ENTÃO** não valide durante a digitação.
- **SENÃO** valide ao tentar avançar ou enviar, sempre também no servidor.

## Quando usar

- Ao tentar avançar ou enviar.
- Quando o campo atinge tamanho completo e verificável.
- Quando uma regra assíncrona responde sem bloquear a tarefa.
- Requisitos de senha com critérios visíveis.
- Campos dependentes após alteração que mude a validade.

## Quando evitar

- Ao focar um campo vazio → **use em vez disso:** validar ao avançar.
- A cada tecla → **use em vez disso:** validar quando o valor estiver completo.
- Antes de a pessoa terminar o valor → **use em vez disso:** aguardar saída do campo ou valor completo.
- Com mudança automática de foco → **use em vez disso:** manter o foco onde a pessoa está.
- Consulta assíncrona sem estado → **use em vez disso:** indicador de carregamento e retorno claro.

## Faça

- Defina o gatilho por campo.
- Mostre requisitos antes da digitação.
- Indique estados assíncronos.
- Revalide campos dependentes.
- Remova o erro ao corrigir.
- Preserve os dados digitados.
- Mantenha a mensagem junto ao campo.
- Valide também no servidor.

## Evite

- Validar no foco.
- Interromper a cada tecla.
- Acusar erro prematuro.
- Mover o foco sem ação da pessoa.
- Esconder o estado de carregamento.
- Manter erro já corrigido.
- Depender só da validação no cliente.
- Usar só cor para o estado.

## Acessibilidade

- Receber foco não pode disparar mudança de contexto: sem envio automático, sem mover o foco (3.2.1).
- Vincule a mensagem ao controle por aria-describedby e aplique aria-invalid="true" se for inválido (3.3.1).
- Não faça o leitor de tela repetir aviso a cada tecla; anuncie mudanças dinâmicas com cuidado (4.1.3).
- Use texto, não apenas cor ou ícone (1.4.1).
- A mensagem explica como corrigir (3.3.3).
- Mantenha rótulo e instruções visíveis durante a digitação, sobretudo no mobile.
- Preserve os dados e a ordem do teclado; teste conexão lenta.

## Microcópia

| Situação | Exemplo |
|---|---|
| Campo obrigatório ao avançar | "Informe seu e-mail para continuar." |
| Formato incompleto | "O CEP tem 8 dígitos. Faltam 2." |
| Assíncrono | "Verificando se o nome está disponível..." |
| Requisito atendido | "Mínimo de 8 caracteres" (marcado como cumprido) |
| Divergência | "As senhas não coincidem." |

## Checklist de verificação

- [ ] O gatilho de validação está definido por tipo de campo.
- [ ] Nenhum erro aparece ao focar campo vazio.
- [ ] Nenhum erro aparece a cada tecla sem necessidade.
- [ ] Formatos completos são validados quando a entrada está completa.
- [ ] Requisitos de senha ficam visíveis antes do erro.
- [ ] Validação assíncrona mostra estado de carregamento.
- [ ] Campos dependentes são revalidados.
- [ ] O erro some assim que o valor fica válido.
- [ ] A mensagem está ligada ao campo por aria-describedby.
- [ ] O foco não muda sozinho.
- [ ] A mesma regra existe no servidor.

## Fundamentação

- Baymard Institute, teste de usabilidade da validação inline: benefícios e riscos de validação prematura; evidência de e-commerce.
- W3C WAI, validação de entrada: validação no cliente não substitui a do servidor; tolerância de formatos.
- WCAG 2.2, critério 3.2.1 (ao receber foco): sem mudança de contexto.
- Nielsen Norman Group, mensagens de erro hostis: evitar mensagens prematuras e informar restrições antes.
- NHS Digital Service Manual, mensagem de erro: mostrar erros ao tentar avançar.
- U.S. Web Design System, validação: problemas de usabilidade e acessibilidade em testes; imediato não é padrão universal.
- Padrão Digital de Governo, campo de entrada: mensagem junto ao campo com aria-describedby.
