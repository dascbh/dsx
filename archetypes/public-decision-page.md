---
id: public-decision-page
title: Página pública de decisão
summary: Página aberta por link, sem login, onde um terceiro de fora do produto lê um pedido e registra uma decisão (confirmação, recusa, aprovação, pedido de ajuste).
register: [consumer]
when-to-use: SE uma pessoa de fora do produto, sem conta, precisa ler algo e responder uma vez ENTÃO use página pública de decisão
avoid-when: quem responde é usuário do produto (use a tela interna), a decisão exige identidade forte que o link não garante ou a pessoa precisa editar o conteúdo
regions: [public-header, request-summary, document-or-detail, decision-area, public-footer]
primary-action: { region: decision-area, position: inline, max: 1 }
states: [loading, invalid-link, expired-link, already-answered, submitting, error, success]
patterns: [button-hierarchy, button-text, confirm-action, double-submit, success-confirmation, helpful-error-message, label-vs-placeholder, form-errors, touch-target, link-in-new-tab, technical-error-code, required-fields]
variations: [binary-decision, decision-with-reason, decision-with-identification, long-document-with-sticky-decision]
rules: [T1, T3, T4, T5, T6, T7, F1]
---

# Página pública de decisão

Um fornecedor recebe um link e precisa confirmar ou recusar um pedido de compra; um parceiro confirma dados; um cliente aprova uma proposta. Essa pessoa não conhece o produto, não tem conta, muitas vezes abre no celular, entre outras tarefas, e vai usar a tela uma vez. A página tem um trabalho: deixar claro **quem pede, o quê, até quando, e o que acontece com cada resposta** — e registrar a resposta sem ambiguidade.

## Quando usar

- **SE** quem responde não tem conta no produto **ENTÃO** use página pública de decisão, acessada por link de uso único ou com validade.
- **SE** as opções são concordar ou não, sem justificativa **ENTÃO** use `binary-decision`.
- **SE** a recusa precisa de motivo para o pedido seguir **ENTÃO** use `decision-with-reason`: motivo de uma lista mais mensagem, obrigatórios só na opção que os exige.
- **SE** a decisão precisa registrar quem respondeu **ENTÃO** use `decision-with-identification` (nome e, se preciso, um dado conferível) antes do envio.
- **SE** o conteúdo a ler é longo **ENTÃO** use `long-document-with-sticky-decision`, com a decisão sempre alcançável.
- **SE** a decisão tem efeito legal ou financeiro que exige identidade forte **ENTÃO** o link não basta: use assinatura com verificação de identidade (fora deste arquétipo).
- **SENÃO** (quem responde é usuário interno) **ENTÃO** a decisão mora na tela de trabalho dele.

## Mapa de regiões

```
┌──────────────────────────────────────────┐
│ public-header  Marca de quem envia        │
├──────────────────────────────────────────┤
│ request-summary                           │
│  Confirmação de pedido (h1)               │
│  Enviado por Empresa X para Fornecedor Y  │
│  Responda até 15/10/2026                  │
├──────────────────────────────────────────┤
│ document-or-detail                        │
│  Texto ou prévia do documento · Baixar PDF│
├──────────────────────────────────────────┤
│ decision-area                             │
│  ( ) Confirmo o pedido                    │
│  ( ) Recuso        → motivo + mensagem    │
│  O que acontece depois: …                 │
│              [Enviar resposta]            │
├──────────────────────────────────────────┤
│ public-footer  Dúvidas: contato · Privac. │
└──────────────────────────────────────────┘
```

## O que vai em cada região

- **public-header** — identidade de quem enviou (marca da organização remetente), sem menu do produto, sem links que levem a áreas com login.
- **request-summary** — `h1` dizendo o que é pedido em linguagem comum; quem pede, para quem, a que se refere (número do pedido ou objeto), prazo de resposta por extenso. Nada de jargão interno do produto.
- **document-or-detail** — o conteúdo a avaliar, legível no celular, com opção de baixar; alterações destacadas por mais de um sinal quando for revisão.
- **decision-area** — as opções com rótulos que dizem a decisão ("Confirmo o pedido", "Recuso"), consequência de cada uma em uma frase, campos condicionais com rótulo visível, e um único botão de envio que nomeia a ação.
- **public-footer** — como tirar dúvidas com quem enviou, aviso de privacidade, e nada mais.

## Ações

- **Primária:** uma, na `decision-area`, junto ao conteúdo — "Enviar resposta" (ou o verbo da opção escolhida). As opções em si não são botões cheios concorrentes; escolher e enviar são dois atos, para evitar toque acidental.
- **Confirmação:** antes de gravar, recapitule a escolha ("Você vai registrar: Recuso — motivo: prazo") quando a resposta não pode ser mudada; se pode ser mudada até o prazo, diga isso e dispense a confirmação.
- **Envio:** bloqueia clique duplo, mostra progresso, só confirma depois da gravação.
- **Saídas:** baixar o documento e contatar o remetente; abrir em nova aba avisa.

## Estados

- **loading** — esqueleto simples; nada do conteúdo antes de validar o link.
- **invalid-link** — link adulterado ou inexistente: mensagem neutra, sem revelar se o pedido existe, e como pedir um novo link a quem enviou. Sem código técnico na tela.
- **expired-link** — prazo passou ou link substituído: diga que expirou, quando, e como pedir um novo.
- **already-answered** — resposta já registrada: mostre qual, quando, e se ainda pode ser alterada; nunca reabra o formulário em branco.
- **submitting** — botão com indicador, opções bloqueadas.
- **error** — falha ao gravar: a escolha e o texto continuam preenchidos, mensagem diz o que fazer ("Tente de novo em instantes; se persistir, fale com …").
- **success** — página final com a resposta registrada, data e hora, o que acontece agora e opção de baixar comprovante; nada de redirecionar para a página inicial do produto.

## Variações

### binary-decision
Duas opções e um botão de envio.
**Favorece:** respostas rápidas, celular, baixa carga.
**Piora:** não captura nuances; recusas sem motivo travam o fluxo do lado de quem pediu.

### decision-with-reason
A opção de recusa abre motivo (lista) e mensagem obrigatórios.
**Favorece:** recusa acionável; quem pediu sabe o que mudar.
**Piora:** mais atrito na recusa — mantenha a lista curta e a mensagem com orientação do que escrever; nunca exija motivo para concordar.

### decision-with-identification
Campos de nome (e, se necessário, cargo ou documento) antes do envio.
**Favorece:** rastro de quem respondeu quando o link pode ser repassado.
**Piora:** coleta dado pessoal — peça só o necessário e diga para quê; não substitui verificação de identidade.

### long-document-with-sticky-decision
Conteúdo longo com a decisão em barra fixa no rodapé (ou "Ir para a resposta").
**Favorece:** pedidos extensos, com muitas linhas; decisão sempre alcançável.
**Piora:** barra fixa rouba altura no celular; pode estimular decidir sem ler — mostre o progresso de leitura em vez de bloquear.

## Anti-padrões

- Botões "Aceitar" e "Recusar" cheios lado a lado, gravando ao primeiro toque.
- Termos internos ("requisição", "fase", "token", "tenant") na tela de quem é de fora.
- Link expirado mostrando erro técnico ou a página de login do produto.
- Reabrir o formulário vazio para quem já respondeu.
- Exigir criação de conta para responder.
- Sucesso que não diz o que foi registrado nem quando.
- Motivo obrigatório mesmo para quem concorda.

## Checklist

- [ ] `h1` em linguagem comum; quem pede, o quê e o prazo por extenso no topo.
- [ ] Opções com rótulo da decisão e consequência; uma primária de envio, separada da escolha.
- [ ] Campos condicionais com rótulo visível; obrigatórios só onde precisam.
- [ ] `invalid-link`, `expired-link` e `already-answered` distintos, sem código técnico.
- [ ] Envio protegido contra clique duplo; erro preserva a escolha.
- [ ] Sucesso com resposta, data e hora e próximo passo.
- [ ] Funciona em celular: alvos de toque adequados, sem rolagem horizontal.
- [ ] Nenhum termo interno do produto no texto visível.
