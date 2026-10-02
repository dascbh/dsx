---
id: endereco-por-cep
titulo: Como aproveitar o CEP para completar o endereço no checkout?
categoria: ecommerce
componentes: [campo-cep, formulario-de-endereco, autocomplete]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: moderada
wcag: ["1.3.5", "2.1.1", "3.3.1", "3.3.4", "1.4.1"]
relacionados: [autopreenchimento, erros-em-formularios, checkout-convidado, preservar-dados-apos-erro]
---

# Como aproveitar o CEP para completar o endereço no checkout?

> **Regra:** Peça o CEP primeiro, consulte ao completar o valor, preencha só o que a fonte retornou e mantenha tudo revisável, editável e com fallback manual.

## Contexto

Num checkout brasileiro, o CEP é um bom ponto de partida para achar cidade, estado, logradouro e outros dados. Digita-se menos, principalmente no celular. Porém o resultado nem sempre vem completo ou correto para entrega: podem faltar número, complemento, unidade ou referência.

A automação deve agilizar a tarefa sem ocultar a decisão. A pessoa precisa reconhecer o endereço encontrado, ajustar qualquer dado, completar as lacunas e preencher manualmente se o CEP não for achado.

Em testes de checkout, uma fração relevante dos endereços digitados à mão tinha erro de ortografia ou de informação; a busca automática completa foi a solução mais eficiente quando aplicável.

## Decisão

- **SE** o CEP é chave confiável para o território atendido **ENTÃO** peça-o no início do bloco de endereço.
- **SE** o CEP tem o número completo de dígitos válidos **ENTÃO** dispare a consulta automaticamente, sem botão separado.
- **SE** o usuário ainda digita **ENTÃO** não consulte a cada tecla; espere o valor completo.
- **SE** a consulta retorna endereço **ENTÃO** exiba-o em grupo identificável, editável, e deixe número e complemento em branco para a pessoa.
- **SE** o CEP não é localizado, é ambíguo ou a consulta falha **ENTÃO** mantenha o formulário manual e mostre mensagem acionável.
- **SE** a pessoa troca ou limpa o CEP **ENTÃO** preserve número, complemento e referência.
- **SE** já havia endereço informado **ENTÃO** não o substitua silenciosamente.
- **SE** o país não usa CEP **ENTÃO** use o formato local de endereço.
- **SENÃO** valide o endereço inteiro antes de liberar a finalização do pedido.

## Quando usar

- Existe fonte de consulta confiável para a área atendida.
- A resposta chega rápido na conexão esperada.
- A pessoa pode revisar número e complemento antes de concluir.
- O serviço trata ausência, ambiguidade e falha sem travar.

## Quando evitar

- Consulta com baixa cobertura sem correção simples → **use em vez disso:** formulário manual completo.
- Digitação bloqueada até a resposta da API → **use em vez disso:** campos sempre editáveis.
- Preenchimento que sobrescreve dados → **use em vez disso:** preencher só campos vazios.
- Resultado não revisado antes de compra irreversível → **use em vez disso:** etapa de conferência.

## Faça

- Rotule o campo como "CEP" com texto de ajuda curto, se preciso.
- Exiba como estados separados: carregando, com resultado, sem resultado e com erro.
- Preserve o valor digitado durante a consulta.
- Teste com teclado, leitor de tela, autofill, celular e conexão lenta.

## Evite

- Seguir automaticamente para a próxima etapa sem espaço de revisão.
- Spinner sem dizer o que está sendo consultado.
- Remover o formulário manual quando não há resultado.
- Confundir endereço sugerido com confirmado.
- `type="number"` no CEP (perde zeros à esquerda e atrapalha máscara).
- Exibir só erro técnico da API.

## Acessibilidade

- Rótulo visível ligado a cada campo; tokens de `autocomplete` (`postal-code`, `address-line1`, `address-line2`, `address-level2`, `address-level1`, `country`) segundo 1.3.5.
- O CEP aceita colar e editar; a máscara não pode impedir isso.
- Busca operável por teclado (2.1.1) e estados anunciados sem mover o foco.
- Mensagens de validação em texto, identificando o problema e preservando dados válidos (3.3.1).
- Permita revisar e corrigir antes de ação crítica (3.3.4).

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo | "CEP" |
| Consultando | "Buscando endereço…" |
| Não encontrado | "Não encontramos esse CEP. Preencha o endereço manualmente." |
| Revisão | "Confira o endereço e informe o número." |
| Falha | "Não foi possível consultar agora. Você pode preencher à mão." |

## Checklist de verificação

- [ ] O CEP é pedido no início do bloco de endereço.
- [ ] A consulta começa sozinha ao completar o valor.
- [ ] O endereço encontrado é visível e editável.
- [ ] Número e complemento não são preenchidos automaticamente.
- [ ] Existe fallback manual para ausência, ambiguidade e erro.
- [ ] Durante o carregamento, o CEP e os dados já preenchidos permanecem.
- [ ] O endereço é validado antes de finalizar o pedido.
- [ ] Campos têm rótulo visível e tokens de autocomplete.
- [ ] Foi testado em celular, teclado e leitor de tela.

## Fundamentação

- Baymard Institute (endereços no checkout): falhas frequentes na digitação manual; busca automática completa como melhor opção; detecção de cidade e estado a partir do CEP como alternativa; validação do endereço antes de finalizar.
- WCAG 2.2, critério 1.3.5 (Identify Input Purpose): propósito do campo identificado programaticamente.
- WCAG 2.2, critério 2.1.1 (Keyboard) e 1.4.1 (Use of Color): operação por teclado e informação sem depender de cor.
- WAI (prevenção de erros): permitir revisar e corrigir antes de ação crítica.
- Design systems de campos de texto de plataformas de e-commerce: referência de rótulos, ajuda e estados, não prova de redução de erros.
