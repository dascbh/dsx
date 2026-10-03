---
id: pagina-publica-de-decisao
titulo: Página pública de decisão
resumo: Página aberta por link, sem login, onde um terceiro de fora do produto lê um pedido e registra uma decisão (de acordo, não concordância, aprovação, recusa).
registro: [consumo]
quando-usar: SE uma pessoa de fora do produto, sem conta, precisa ler algo e responder uma vez ENTÃO use página pública de decisão
evitar-quando: quem responde é usuário do produto (use a tela interna), a decisão exige identidade forte que o link não garante ou a pessoa precisa editar o conteúdo
regioes: [cabecalho-publico, resumo-do-pedido, documento-ou-detalhe, area-de-decisao, rodape-publico]
acao-primaria: { regiao: area-de-decisao, posicao: junto-ao-conteudo, max: 1 }
estados: [carregando, link-invalido, link-expirado, ja-respondido, enviando, erro, sucesso]
padroes: [hierarquia-de-botoes, texto-de-botao, confirmar-acao, clique-duplo-em-envio, confirmacao-de-sucesso, mensagem-de-erro-util, label-vs-placeholder, erros-em-formularios, alvo-de-toque, link-em-nova-aba, codigo-de-erro-tecnico, campos-obrigatorios]
variacoes: [decisao-binaria, decisao-com-motivo, decisao-com-identificacao, documento-longo-com-decisao-fixa]
regras: [T1, T3, T4, T5, T6, T7, F1]
---

# Página pública de decisão

A contraparte de um contrato recebe um link e precisa dizer se está de acordo com um aditivo; um fornecedor confirma dados; um cliente aprova uma proposta. Essa pessoa não conhece o produto, não tem conta, muitas vezes abre no celular, entre outras tarefas, e vai usar a tela uma vez. A página tem um trabalho: deixar claro **quem pede, o quê, até quando, e o que acontece com cada resposta** — e registrar a resposta sem ambiguidade.

## Quando usar

- **SE** quem responde não tem conta no produto **ENTÃO** use página pública de decisão, acessada por link de uso único ou com validade.
- **SE** as opções são concordar ou não, sem justificativa **ENTÃO** use `decisao-binaria`.
- **SE** a recusa precisa de motivo para o pedido seguir **ENTÃO** use `decisao-com-motivo`: motivo de uma lista mais mensagem, obrigatórios só na opção que os exige.
- **SE** a decisão precisa registrar quem respondeu **ENTÃO** use `decisao-com-identificacao` (nome e, se preciso, um dado conferível) antes do envio.
- **SE** o conteúdo a ler é longo **ENTÃO** use `documento-longo-com-decisao-fixa`, com a decisão sempre alcançável.
- **SE** a decisão tem efeito jurídico ou financeiro que exige identidade forte **ENTÃO** o link não basta: use assinatura com verificação de identidade (fora deste arquétipo).
- **SENÃO** (quem responde é usuário interno) **ENTÃO** a decisão mora na tela de trabalho dele.

## Mapa de regiões

```
┌──────────────────────────────────────────┐
│ cabecalho-publico  Marca de quem envia    │
├──────────────────────────────────────────┤
│ resumo-do-pedido                          │
│  Pedido de de acordo (h1)                 │
│  Enviado por Escritório X para Empresa Y  │
│  Responda até 15/10/2026                  │
├──────────────────────────────────────────┤
│ documento-ou-detalhe                      │
│  Texto ou prévia do documento · Baixar PDF│
├──────────────────────────────────────────┤
│ area-de-decisao                           │
│  ( ) Estou de acordo                      │
│  ( ) Não concordo  → motivo + mensagem    │
│  O que acontece depois: …                 │
│              [Enviar resposta]            │
├──────────────────────────────────────────┤
│ rodape-publico  Dúvidas: contato · Privac.│
└──────────────────────────────────────────┘
```

## O que vai em cada região

- **cabecalho-publico** — identidade de quem enviou (marca da organização remetente), sem menu do produto, sem links que levem a áreas com login.
- **resumo-do-pedido** — `h1` dizendo o que é pedido em linguagem comum; quem pede, para quem, a que se refere (nome do contrato ou objeto), prazo de resposta por extenso. Nada de jargão interno do produto.
- **documento-ou-detalhe** — o conteúdo a avaliar, legível no celular, com opção de baixar; alterações destacadas por mais de um sinal quando for revisão.
- **area-de-decisao** — as opções com rótulos que dizem a decisão ("Estou de acordo", "Não concordo"), consequência de cada uma em uma frase, campos condicionais com rótulo visível, e um único botão de envio que nomeia a ação.
- **rodape-publico** — como tirar dúvidas com quem enviou, aviso de privacidade, e nada mais.

## Ações

- **Primária:** uma, na `area-de-decisao`, junto ao conteúdo — "Enviar resposta" (ou o verbo da opção escolhida). As opções em si não são botões cheios concorrentes; escolher e enviar são dois atos, para evitar toque acidental.
- **Confirmação:** antes de gravar, recapitule a escolha ("Você vai registrar: Não concordo — motivo: valor") quando a resposta não pode ser mudada; se pode ser mudada até o prazo, diga isso e dispense a confirmação.
- **Envio:** bloqueia clique duplo, mostra progresso, só confirma depois da gravação.
- **Saídas:** baixar o documento e contatar o remetente; abrir em nova aba avisa.

## Estados

- **carregando** — esqueleto simples; nada do conteúdo antes de validar o link.
- **link-invalido** — link adulterado ou inexistente: mensagem neutra, sem revelar se o pedido existe, e como pedir um novo link a quem enviou. Sem código técnico na tela.
- **link-expirado** — prazo passou ou link substituído: diga que expirou, quando, e como pedir um novo.
- **ja-respondido** — resposta já registrada: mostre qual, quando, e se ainda pode ser alterada; nunca reabra o formulário em branco.
- **enviando** — botão com indicador, opções bloqueadas.
- **erro** — falha ao gravar: a escolha e o texto continuam preenchidos, mensagem diz o que fazer ("Tente de novo em instantes; se persistir, fale com …").
- **sucesso** — página final com a resposta registrada, data e hora, o que acontece agora e opção de baixar comprovante; nada de redirecionar para a página inicial do produto.

## Variações

### decisao-binaria
Duas opções e um botão de envio.
**Favorece:** respostas rápidas, celular, baixa carga.
**Piora:** não captura nuances; recusas sem motivo travam o fluxo do lado de quem pediu.

### decisao-com-motivo
A opção de recusa abre motivo (lista) e mensagem obrigatórios.
**Favorece:** recusa acionável; quem pediu sabe o que mudar.
**Piora:** mais atrito na recusa — mantenha a lista curta e a mensagem com orientação do que escrever; nunca exija motivo para concordar.

### decisao-com-identificacao
Campos de nome (e, se necessário, cargo ou documento) antes do envio.
**Favorece:** rastro de quem respondeu quando o link pode ser repassado.
**Piora:** coleta dado pessoal — peça só o necessário e diga para quê; não substitui verificação de identidade.

### documento-longo-com-decisao-fixa
Conteúdo longo com a decisão em barra fixa no rodapé (ou "Ir para a resposta").
**Favorece:** contratos e aditivos extensos; decisão sempre alcançável.
**Piora:** barra fixa rouba altura no celular; pode estimular decidir sem ler — mostre o progresso de leitura em vez de bloquear.

## Anti-padrões

- Botões "Aceitar" e "Recusar" cheios lado a lado, gravando ao primeiro toque.
- Termos internos ("minuta", "fase", "token", "tenant") na tela de quem é de fora.
- Link expirado mostrando erro técnico ou a página de login do produto.
- Reabrir o formulário vazio para quem já respondeu.
- Exigir criação de conta para responder.
- Sucesso que não diz o que foi registrado nem quando.
- Motivo obrigatório mesmo para quem concorda.

## Checklist

- [ ] `h1` em linguagem comum; quem pede, o quê e o prazo por extenso no topo.
- [ ] Opções com rótulo da decisão e consequência; uma primária de envio, separada da escolha.
- [ ] Campos condicionais com rótulo visível; obrigatórios só onde precisam.
- [ ] `link-invalido`, `link-expirado` e `ja-respondido` distintos, sem código técnico.
- [ ] Envio protegido contra clique duplo; erro preserva a escolha.
- [ ] Sucesso com resposta, data e hora e próximo passo.
- [ ] Funciona em celular: alvos de toque adequados, sem rolagem horizontal.
- [ ] Nenhum termo interno do produto no texto visível.
