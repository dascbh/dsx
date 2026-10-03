# Dark patterns

> **Quando consultar**
> - Ao projetar ou revisar cadastro, checkout, assinatura, cancelamento, consentimento de dados, ofertas e notificações.
> - Quando um pedido envolve "aumentar conversão", "reduzir cancelamento" ou "fazer a pessoa aceitar".
> - Ao decidir o peso visual entre aceitar e recusar, ou o texto de uma recusa.
> - Antes de implementar urgência, escassez, prova social ou opção pré-selecionada.

Dark pattern é um padrão de interface que leva a pessoa a uma decisão que ela não tomaria se estivesse plenamente informada e sem pressão, em benefício de quem oferece o produto. A pergunta-teste:

> **A pessoa consegue decidir de forma informada, sem pressão desproporcional, e sair tão facilmente quanto entrou?** Se não, é dark pattern ou está perto disso.

---

## 1. Persuasão ética vs. manipulação

| Persuasão ética | Manipulação |
|---|---|
| Mostra valor real com dados verdadeiros | Depende de omissão, erro ou cansaço |
| Destaca a ação recomendada, mas a alternativa segue visível e clara | Esconde, rebaixa ou ridiculariza a alternativa |
| Condições aparecem antes da decisão | Condições aparecem depois do clique ou em letra miúda |
| Urgência baseada em fato verificável | Urgência inventada ou contador que reinicia |
| Decisão reversível com esforço comparável | Sair custa muito mais que entrar |

Destacar o botão principal não é dark pattern. Torna-se quando o destaque serve para impedir que a pessoa perceba ou alcance a outra opção.

---

## 2. Catálogo

| Nome | Como reconhecer | Dano | Alternativa ética |
|---|---|---|---|
| **Custos ocultos** (drip pricing) | Taxa, frete, renovação ou condição só aparece no último passo | Pagar mais que o esperado; decisão tomada com informação errada | Preço total, periodicidade e taxas visíveis desde a primeira exibição do preço |
| **Obstrução** (roach motel) | Assinar em 1 clique; cancelar exige ligação, chat, várias telas ou motivo obrigatório | Continuar pagando contra a vontade | Cancelar no mesmo canal e com esforço comparável a assinar; pesquisa de motivo opcional |
| **Confirmshaming** | Recusa redigida para envergonhar ("Não, prefiro perder dinheiro") | Pressão emocional; desrespeito | Recusa neutra ("Agora não", "Não, obrigado") com peso visual comparável |
| **Continuidade forçada** | Teste grátis vira cobrança sem aviso; cartão exigido sem necessidade | Cobrança não esperada | Avisar antes de cobrar, mostrar a data, permitir cancelar em um passo durante o teste |
| **Isca e troca** (bait and switch) | O controle faz algo diferente do anunciado ("X" que abre oferta, "Continuar" que assina) | Ação não intencional | Rótulo e ícone correspondem ao efeito, sempre |
| **Sneaking / item adicionado** | Seguro, doação, garantia ou assinatura incluídos no carrinho sem escolha | Compra não autorizada | Opt-in explícito; nada adicionado sem ação da pessoa |
| **Pré-seleção indevida** | Consentimento, newsletter, compartilhamento de dados ou extra já marcados | Consentimento não livre; dados expostos | Caixas desmarcadas; padrão mais protetivo à privacidade |
| **Urgência falsa** | Contador que reinicia, "oferta termina hoje" todo dia | Decisão apressada e mal informada | Só prazos reais, com fonte e o que acontece ao fim |
| **Escassez falsa** | "Últimas 2 unidades", "15 pessoas vendo agora" sem base | Pressão por medo de perder | Só dados reais e atualizados, ou nada |
| **Prova social falsa** | Depoimentos inventados, avaliações filtradas, números sem origem | Confiança construída sobre mentira | Avaliações reais, com critério de exibição declarado |
| **Consentimento desequilibrado** | "Aceitar tudo" em destaque; recusar exige várias telas | Coleta de dados sem consentimento real | Aceitar, recusar e ajustar no mesmo nível, num passo |
| **Pergunta capciosa** | Dupla negação, checkbox que marca para *não* receber, texto confuso | Escolha oposta à pretendida | Frase afirmativa, uma ação por controle |
| **Interferência visual** | Recusa em cinza claro, link minúsculo, botão principal onde se espera "cancelar" | Erro induzido | Opções equivalentes com contraste legível e posição convencional |
| **Insistência** (nagging) | Pedido repetido a cada visita após recusa; modal que volta sempre | Desgaste até ceder | Respeitar a recusa por período razoável; opção "não perguntar de novo" |
| **Anúncio disfarçado** | Publicidade com aparência de conteúdo, resultado ou botão do sistema | Clique enganado | Rotular claramente como anúncio ou patrocinado |
| **Cadastro forçado** | Conta obrigatória para tarefa que não precisa dela | Coleta de dados desnecessária; abandono | Opção de convidado quando possível ([guest-checkout](../../patterns/ecommerce/guest-checkout.md)) |
| **Ancoragem enganosa** | "De R$ 999 por R$ 199" com preço "de" nunca praticado | Percepção de valor falsa | Comparação apenas com preço real e recente |

---

## 3. Linhas vermelhas: o agente deve se recusar a implementar

Recuse implementar, mesmo a pedido, e proponha a alternativa ética da tabela:

1. Pré-marcar consentimento de dados, marketing, compartilhamento com terceiros ou contratação de serviço extra.
2. Adicionar item, seguro, doação ou assinatura ao carrinho/pedido sem ação explícita da pessoa.
3. Esconder ou postergar preço total, taxas, periodicidade ou renovação automática até depois da decisão.
4. Tornar o cancelamento mais difícil que a contratação (outro canal obrigatório, passos extras, retenção que bloqueia a saída).
5. Contadores, estoques, visitantes ou prazos inventados ou que reiniciam.
6. Depoimentos, avaliações, números ou selos falsos.
7. Controle cujo efeito difere do rótulo (fechar que abre, cancelar que confirma).
8. Texto de recusa que envergonha, culpa ou ameaça.
9. Converter teste grátis em cobrança sem aviso prévio e caminho simples de cancelamento.
10. Esconder ou dificultar "recusar" em banner de consentimento.
11. Usar dupla negação ou linguagem ambígua em opções de consentimento ou cobrança.
12. Disfarçar anúncio como conteúdo ou como controle do sistema.

SE o pedido cair numa linha vermelha ENTÃO: diga qual padrão é, qual o dano, que pode violar normas de defesa do consumidor e de proteção de dados (no Brasil, CDC e LGPD; em outras jurisdições, regras equivalentes), e entregue a versão ética.

**Zona cinzenta (implementar só com salvaguardas):**
- Oferta de retenção ao cancelar: permitido se for **uma** tela, pulável, e o cancelamento continuar no mesmo fluxo.
- Destaque do plano recomendado: permitido se todos os planos mostram preço total e diferenças com a mesma clareza.
- Urgência: permitida se o prazo é real e a origem é mostrada.
- Lembretes: permitidos com frequência limitada e opção de parar.

---

## 4. Por que importa além da ética

- Conversão por confusão aparece como sucesso no painel e volta como cancelamento, estorno, reclamação e perda de confiança.
- O dano é desigual: pessoas com baixa familiaridade digital, limitações cognitivas, pouco tempo ou menos acesso a suporte têm mais dificuldade de perceber e reverter.
- Órgãos de defesa do consumidor e organismos internacionais (como a OCDE) tratam práticas como obstrução e custos ocultos como limitação de autonomia; várias são ilegais em diversas jurisdições.
- Manipulação aumenta carga cognitiva e quebra o modelo mental que a pessoa formou ao iniciar a tarefa ([psicologia-e-leis.md](psicologia-e-leis.md)).

---

## 5. Como revisar um fluxo

1. **Intenção:** que comportamento o fluxo quer provocar, e por quê?
2. **Transparência:** preço, dados, renovação e condições aparecem antes do clique decisivo?
3. **Equilíbrio:** aceitar, recusar, ajustar e sair têm linguagem neutra e destaque comparável?
4. **Autonomia:** dá para pausar, voltar e revisar sem perder o que foi feito?
5. **Reversibilidade:** há caminho simples para desfazer ou cancelar ([desfazer](../../patterns/actions/undo.md))?
6. **Inclusão:** pessoas com pouca familiaridade digital entendem a consequência?
7. **Evidência:** urgência, escassez, depoimentos e números são verdadeiros e atuais?
8. **Métrica:** o time acompanha arrependimento, reclamação, cancelamento e estorno, não só conversão?

**Teste de compreensão:** depois da decisão, pergunte à pessoa o que contratou, quanto vai pagar, quando, e como desfaria. Confusão recorrente é sinal de manipulação, mesmo sem intenção.

**No processo:** inclua critérios de transparência desde o briefing; registre alternativas consideradas; peça revisão a alguém que não desenhou o fluxo; revise quando preço, política ou lei mudar.

**Severidade:** 3 a 4 por padrão, porque afeta dinheiro, dados ou autonomia.

---

## Checklist de auditoria

- [ ] Preço total, taxas, periodicidade e renovação visíveis antes da decisão.
- [ ] Nenhum consentimento, extra ou assinatura pré-selecionado ou adicionado sem ação.
- [ ] Cancelar é tão simples quanto contratar, no mesmo canal.
- [ ] Recusa com linguagem neutra e peso visual comparável ao aceite.
- [ ] Todo controle faz exatamente o que o rótulo diz.
- [ ] Urgência, escassez, prova social e preços "de" são reais e verificáveis.
- [ ] Banner de consentimento com aceitar, recusar e ajustar no mesmo nível.
- [ ] Sem dupla negação nem ambiguidade em opções de dados ou cobrança.
- [ ] Anúncios rotulados; cadastro só quando necessário.
- [ ] Pedidos recusados não reaparecem a cada visita.
- [ ] Métricas de arrependimento e reclamação acompanham as de conversão.
- [ ] Nenhuma linha vermelha implementada; se pedida, recusada com alternativa.
