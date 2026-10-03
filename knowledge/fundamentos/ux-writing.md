# UX writing e microcopy

> **Quando consultar**
> - Ao escrever ou revisar qualquer texto visível: botão, rótulo, erro, vazio, confirmação, toast, tooltip, e-mail transacional.
> - Ao definir ou aplicar tom de voz de um produto.
> - Quando a mesma coisa aparece com nomes diferentes em telas diferentes.
> - Ao revisar ortografia e convenções de texto em pt-BR.

Texto de interface é design: ele decide se a pessoa entende o que vai acontecer. Escreva para quem varre a tela, não para quem lê.

---

## 1. Princípios

1. **Clareza.** Diga exatamente o que acontece. Se a frase admite duas leituras, reescreva.
2. **Concisão.** Corte palavras que não mudam o sentido. Rótulos de 1–3 palavras; frases de apoio até ~20 palavras; uma ideia por frase.
3. **Utilidade.** Cada texto ajuda a avançar. Se não ajuda, remova.
4. **Consistência.** Um conceito, uma palavra, em todas as telas, e-mails e notificações.
5. **Acessibilidade.** Voz ativa, sem jargão, compreensível por diferentes níveis de letramento; não dependa de cor, posição ou ícone para dar sentido ao texto.

**Regras gerais**
- Comece pela informação que diferencia ("Fatura vence amanhã", não "Lembramos que a sua fatura vence amanhã").
- Fale com a pessoa ("você") e descreva o sistema, não a culpa dela.
- Use os termos do público (entrevistas, tickets, buscas), não os da empresa.
- Escreva o texto junto com o design e com conteúdo real; nunca preencha depois.

---

## 2. Fórmulas

### Botões
`verbo no infinitivo + objeto` → "Salvar rascunho", "Excluir projeto", "Enviar proposta".
- Rótulo prevê o resultado: o botão do dialog repete o verbo da pergunta.
- Evite "OK", "Sim", "Enviar" sozinho, "Clique aqui".
- Estado de carregamento: gerúndio + reticências ("Salvando…").
- Ver [button-text](../../patterns/ux-writing/button-text.md), [link-text](../../patterns/ux-writing/link-text.md).

### Mensagens de erro
`o que aconteceu + por quê/onde + como resolver`
- "Não foi possível concluir o pagamento. O cartão foi recusado pelo banco. Use outro cartão ou fale com o emissor."
- Em campo: frase curta com a correção ("Informe um CPF com 11 dígitos").
- Nunca culpe ("Você digitou errado"), nunca exponha código técnico sem tradução, nunca use humor.
- Ver [helpful-error-message](../../patterns/ux-writing/helpful-error-message.md), [form-errors](../../patterns/forms/form-errors.md).

### Estados vazios
`o que aparece aqui + por que está vazio (se não óbvio) + ação`
- "Nenhum projeto ainda. Projetos reúnem arquivos e pessoas de um mesmo trabalho. [Criar projeto]"
- Busca: "Nenhum resultado para "contrato 2025". Confira a grafia ou tente um termo mais geral."
- Ver [empty-state](../../patterns/feedback/empty-state.md).

### Confirmações (antes de agir)
Título como pergunta com o verbo e o objeto; corpo com a consequência; botões com o verbo.
- Título: "Excluir o projeto Lançamento?"
- Corpo: "Os 14 arquivos e o histórico serão apagados. Não é possível desfazer."
- Botões: "Excluir projeto" (destrutivo) · "Cancelar".
- Ver [confirm-action](../../patterns/actions/confirm-action.md), [confirm-deletion](../../patterns/actions/confirm-deletion.md).

### Sucesso
`o que foi feito + o que vem agora (se houver)`
- "Convite enviado para ana@exemplo.com. Ela tem 7 dias para aceitar."
- Celebre na proporção do feito; uma compra simples não pede fogos de artifício.
- Ver [success-confirmation](../../patterns/feedback/success-confirmation.md).

### Rótulos e textos de apoio
- Rótulo nomeia o dado ("Data de nascimento"); texto de apoio dá formato ou motivo ("Usamos para confirmar sua idade").
- Placeholder não substitui rótulo ([label-vs-placeholder](../../patterns/forms/label-vs-placeholder.md)).

---

## 3. Tom de voz

**Voz** é a personalidade fixa do produto. **Tom** é como essa personalidade se ajusta à situação. A mesma pessoa fala diferente num velório e numa festa, sem deixar de ser quem é.

### As 4 dimensões (modelo de Nielsen Norman Group)

Posicione o produto de 1 a 5 em cada eixo.

| Dimensão | Polo 1 | Polo 5 | Exemplo polo 1 | Exemplo polo 5 |
|---|---|---|---|---|
| Formalidade | Casual | Formal | "Pronto, salvamos tudo pra você." | "As informações foram registradas." |
| Humor | Engraçado | Sério | "Opa, tropeçamos aqui. Já estamos levantando." | "Estamos com instabilidade e trabalhando na correção." |
| Respeito | Irreverente | Respeitoso | "Foi mal, a culpa é nossa." | "Lamentamos o transtorno." |
| Entusiasmo | Entusiasmado | Pragmático | "Tudo salvo! Continue de onde parou." | "Alterações salvas." |

Palavras de referência para cada polo ajudam a manter o rumo: casual = próximo, direto; formal = preciso, profissional; engraçado = leve; sério = ponderado; irreverente = ousado; respeitoso = cuidadoso; entusiasmado = animado; pragmático = objetivo.

### Como o tom varia por contexto

| Contexto | Ajuste | Regra |
|---|---|---|
| Erro, falha, cobrança, perda de dados | Mais sério, respeitoso e pragmático | Empatia é clareza e solução, não emoji; zero humor |
| Segurança, privacidade, saúde, dinheiro | Mais formal e preciso | Nunca ambíguo; nomes exatos de valores e prazos |
| Onboarding | Levemente entusiasmado | Entusiasmo sem sacrificar instrução |
| Sucesso | Proporcional ao feito | Pequeno feito, comemoração pequena |
| Estado vazio, dicas | Pode ser mais leve | Sem esconder a ação |

### Como definir o tom

1. Escolha 3–5 adjetivos de personalidade (e o que eles **não** são: "direto, mas não seco").
2. Levante a linguagem do público em avaliações, suporte e fóruns.
3. Posicione nas 4 dimensões (1–5).
4. Liste palavras preferidas e palavras proibidas.
5. Escreva pares antes/depois para erro, sucesso, vazio, onboarding, cobrança.
6. Teste amostras com pessoas do público e documente para todos os times.

**Anti-padrão:** produto com várias personalidades (marketing leve no onboarding, engenharia fria nos erros). Revise todos os textos contra o mesmo guia.

---

## 4. Regras de estilo pt-BR

**Capitalização e pontuação**
- Caixa de frase: só a primeira letra maiúscula em títulos, botões e rótulos ("Criar nova conta", não "Criar Nova Conta"). Nomes próprios mantêm maiúscula.
- Sem ponto final em botões, rótulos, títulos e itens de menu. Com ponto final em frases completas de apoio e mensagens.
- Exclamação com moderação: no máximo uma, só em sucesso real. Nunca em erro.
- Reticências com o caractere único "…" para estados em andamento.

**Gramática**
- Botões e itens de menu no infinitivo ("Salvar", "Baixar relatório"); instruções no imperativo ("Informe seu e-mail"). Não misture formas na mesma interface.
- Voz ativa: "Enviamos o código" em vez de "O código foi enviado por nós".
- Evite gerundismo ("vamos estar enviando" → "vamos enviar").
- Crase: obrigatória antes de palavra feminina regida por "a" ("Volte à página inicial", "Às 18h"); proibida antes de verbo e de palavra masculina ("a partir de segunda", "a prazo"). Depois de "até" é facultativa ("até as 18h" ou "até às 18h"): escolha uma forma e mantenha.
- Concordância com números gerados por código: trate singular e plural ("1 item", "2 itens"; "Nenhum item") e nunca "item(s)".
- Gênero: prefira construções neutras quando possível ("Boas-vindas" em vez de "Bem-vindo(a)"; "Pessoas usuárias" só se o guia adotar). Nunca use "(a)" ou "@".
- Siglas: gênero do termo por extenso ("a CNH", "o CPF", "a API").

**Números, datas e moeda**
- Moeda: "R$ 1.234,56" (espaço após R$, ponto de milhar, vírgula decimal).
- Data: "dd/mm/aaaa" em campos; por extenso quando ambíguo ("5 de março").
- Hora: "14h30" ou "14:30"; escolha um formato e mantenha.
- Use algarismos para quantidades na interface ("3 arquivos"), não por extenso.

**Vocabulário**
- Prefira português quando há equivalente comum ("Entrar" em vez de "Login" como ação; "Painel" em vez de "Dashboard", salvo se o público usa o termo em inglês).
- "E-mail" com hífen; "on-line" ou "online": escolha uma grafia e registre no glossário.
- Evite "por favor" em instruções curtas; reserve para pedidos que custam algo à pessoa.
- Evite "clique"/"toque": descreva a ação ("Selecione", "Abra") ou deixe o rótulo falar.
- Links descrevem o destino ("Ver política de reembolso"), nunca "clique aqui".

---

## 5. Consistência de glossário

- Mantenha um glossário com: termo preferido, termos proibidos/sinônimos rejeitados, definição de uma linha, onde aparece.
- Mesma ação, mesmo verbo: se é "Excluir" num lugar, não é "Apagar" ou "Remover" noutro, a menos que sejam ações diferentes (remover da lista ≠ excluir do sistema). Se forem diferentes, os nomes precisam ser diferentes **e** explicados.
- Mesmo objeto, mesmo substantivo em menu, título, botão, e-mail e notificação ("assinatura" não vira "plano" no e-mail).
- Antes de criar um termo novo, procure no glossário. SE o conceito existe ENTÃO reuse a palavra.
- Revise strings geradas por código (plural, gênero, concatenação) com valores reais extremos (0, 1, muitos, nomes longos).

---

## 6. Anti-padrões

- Erro genérico ("Algo deu errado") sem causa nem saída.
- Confirmação vaga ("Tem certeza?" + "Sim/Não").
- Placeholder como rótulo ou com instrução que some ao digitar.
- Anglicismo sem necessidade; jargão interno; siglas sem explicação.
- Termos diferentes para a mesma coisa entre telas.
- Humor ou emoji em erro, cobrança ou perda de dados.
- Texto que culpa ou pressiona ("Você esqueceu…", "Não, prefiro perder dinheiro"). Ver [dark-patterns.md](dark-patterns.md).
- Texto escrito isolado do design, encaixado depois.

---

## Checklist de auditoria

- [ ] Botões com verbo + objeto, no infinitivo; nenhum "OK", "Sim" ou "Clique aqui".
- [ ] Erros dizem o que houve, por quê/onde e como resolver, sem culpa e sem humor.
- [ ] Confirmações nomeiam o objeto e a consequência; botão repete o verbo.
- [ ] Estados vazios dizem o que aparece ali e oferecem a próxima ação.
- [ ] Sucesso diz o que foi feito e o que vem agora, com entusiasmo proporcional.
- [ ] Tom ajustado ao contexto dentro da mesma voz; sério em erro, dinheiro e segurança.
- [ ] Caixa de frase; sem ponto final em rótulos e botões; reticências "…" em estados de andamento.
- [ ] Moeda, datas e horas no padrão brasileiro e consistentes.
- [ ] Plural e gênero tratados em strings dinâmicas; nada de "(s)" ou "(a)".
- [ ] Um termo por conceito em todas as telas, conferido contra o glossário.
- [ ] Links descrevem o destino; rótulos de campo persistentes.
- [ ] Uma pessoa sem conhecimento técnico entende cada frase sem reler.
