# Marcas de texto gerado e de texto burocrático

> **Quando consultar**
> - Antes de escrever ou revisar texto de interface produzido por agente (o rascunho de IA traz essas marcas por padrão).
> - Ao ler o relatório de `tools/ux-lint/text.mjs` e decidir como reescrever cada achado (regras X1–X11).
> - Quando uma tela "parece robótica", "parece feita por IA" ou "tem texto demais" e é preciso dizer exatamente por quê.
> - Este arquivo não trata de arquitetura de tela nem de fórmulas por elemento: para isso, `ux-writing.md`.

Texto de interface não é redação. Quem usa um produto operacional lê de passagem, entre uma tarefa e outra, e procura a próxima ação. Algumas construções denunciam que o texto foi gerado sem olhar para essa pessoa: soam como apresentação de slide, enfeitam o que deveria ser seco ou repetem o que a tela já diz. Cada marca abaixo traz por que incomoda, como reconhecer, como reescrever e a regra que a ferramenta usa para encontrá-la.

---

## 1. Travessão como pausa dramática (X1, X1b)

**Por que incomoda.** O travessão virou a assinatura mais reconhecível do texto gerado: cria suspense onde não há nenhum e junta duas ideias que deveriam ser duas frases, ou uma frase com vírgula. Em rótulo e botão, ainda ocupa espaço e atrapalha leitor de tela (alguns leem "travessão").

**Como reconhecer.** "—" ou "–" no meio de texto de interface. Não conta a meia-risca entre números e datas (`1–8`, `2024–2026`), que é intervalo. Um travessão sozinho numa célula para dizer "sem valor" é outra marca (X1b): parece vazio de verdade, não informa nada e some para quem usa leitor de tela.

**Como reescrever.** Escolha a pontuação que expressa a relação: vírgula para continuação, dois-pontos para explicação, ponto para duas ideias. Para valor ausente, diga o motivo ou deixe vazio com legenda.

| Antes | Depois |
|---|---|
| Assinado fora da plataforma — sem certificado do provedor | Assinado fora da plataforma, sem certificado do provedor |
| Envio concluído — confira os anexos | Envio concluído. Confira os anexos. |
| Célula: — | Não informado (ou célula vazia) |

## 2. Título composto "X — Y" (X2)

**Por que incomoda.** Título com dois blocos ("Revisar antes de gravar · arquivo.docx", "Etapa 2: escolher modelo") divide a atenção: a pessoa não sabe qual parte é o assunto. Em botão, "Remover da lista — Ana Souza" alonga o alvo e repete o nome que já está na linha.

**Como reconhecer.** Título, aba ou botão com separador no meio: travessão, meia-risca, dois-pontos, ponto médio ou barra vertical.

**Como reescrever.** Fique com o assunto no título e leve o resto para onde ele pertence: o nome do objeto vai para o nome acessível (aria-label) do botão; a contagem, para um selo; o arquivo, para uma linha de apoio.

| Antes | Depois |
|---|---|
| Botão "Remover da lista — Ana Souza" | Botão "Remover", aria-label "Remover Ana Souza da lista" |
| Revisar antes de gravar · cláusulas.docx | Título "Revisar antes de gravar"; apoio "Arquivo: cláusulas.docx" |
| Preço · 3 | "Preço" com selo "3" |

## 3. "Não só X, mas Y" e tríades

**Por que incomoda.** São fórmulas de persuasão: "não apenas organiza, mas também acelera", "rápido, seguro e confiável". Em produto operacional ninguém precisa ser convencido; precisa saber o que acontece. Tríades de adjetivos soam como folheto e quase nunca são verificáveis.

**Como reconhecer.** "Não só/não apenas … mas também"; três adjetivos ou três verbos em sequência sem informação concreta. A ferramenta não acusa (exige leitura); procure na revisão manual.

**Como reescrever.** Troque a promessa pelo fato que a pessoa usa para decidir.

| Antes | Depois |
|---|---|
| Não só envia o aditivo, mas também acompanha cada etapa. | Envia o aditivo e mostra quem já respondeu. |
| Um fluxo simples, rápido e seguro. | (corte: a tela mostra o fluxo) |

## 4. Descrição que repete o título (X3)

**Por que incomoda.** "Timbre do cliente" seguido de "Timbre deste cliente." gasta uma linha para dizer a mesma coisa. A pessoa lê duas vezes e aprende que o texto de apoio não vale a pena, e passa a ignorá-lo mesmo quando ele traz algo importante.

**Como reconhecer.** Texto logo abaixo do título que reutiliza a maior parte das palavras dele sem acrescentar fato, ou cuja primeira frase só reformula o título.

**Como reescrever.** Corte a repetição. Se ficar algo, que seja o que o título não diz: consequência, prazo, quem vê, o que fazer.

| Antes | Depois |
|---|---|
| Título "Timbre do cliente"; apoio "Timbre deste cliente. Só o curador da biblioteca altera." | Título "Timbre do cliente"; apoio "Só o curador da biblioteca altera." |
| Título "Minutas salvas"; apoio "Aqui ficam as minutas que foram salvas." | Título "Minutas salvas", sem apoio; ou apoio "Minutas ficam 90 dias depois de enviadas." |

## 5. Abertura vazia (X4)

**Por que incomoda.** "Aqui você pode", "Nesta tela", "Esta página mostra", "Use esta aba para", "Veja abaixo", "Clique aqui" descrevem a interface em vez de ajudar a usá-la. São as primeiras palavras, as mais lidas, gastas em nada.

**Como reconhecer.** Texto de apoio, alerta, dica ou placeholder que começa por uma dessas fórmulas.

**Como reescrever.** Comece pelo que a pessoa faz ou ganha; o lugar ela já sabe, está nele.

| Antes | Depois |
|---|---|
| Aqui você pode acompanhar os aditivos enviados. | Aditivos enviados e quem já respondeu. |
| Use esta aba para revisar as cláusulas antes de gravar. | Revise as cláusulas antes de gravar. |
| Clique aqui para baixar o modelo. | Link "Baixar modelo" |

## 6. Adjetivos genéricos

**Por que incomoda.** "Poderoso", "intuitivo", "completo", "robusto", "inteligente", "fácil" não dizem nada que a pessoa possa conferir, e o produto não precisa se elogiar dentro dele mesmo.

**Como reconhecer.** Adjetivo de avaliação aplicado ao próprio produto ou à ação ("um modo fácil de"). A ferramenta não acusa; procure na revisão manual.

**Como reescrever.** Corte o adjetivo ou troque por número, prazo ou consequência.

| Antes | Depois |
|---|---|
| Importação inteligente de cláusulas | Importar cláusulas de um .docx |
| Um jeito fácil de gerar minutas em lote | Gere até 50 minutas de uma vez |

## 7. Parêntese explicativo (X9)

**Por que incomoda.** "Configurar timbres (nome e logo)" admite que o rótulo não basta e remenda com um aposto. Em rótulo de campo, "(só nesta minuta)" esconde uma regra importante num cochicho.

**Como reconhecer.** Parêntese com palavras em rótulo, botão, título ou aba. Não contam números ("Histórico (3)"), siglas ("(CNPJ)") nem "(opcional)".

**Como reescrever.** Escolha um rótulo que já diga tudo; se a regra importa, ela vira texto de apoio visível.

| Antes | Depois |
|---|---|
| Configurar timbres (nome e logo) | Configurar timbre |
| Texto da cláusula (só nesta minuta) | Rótulo "Texto da cláusula"; apoio "A mudança vale só para esta minuta." |
| Cadência (dias) | Cadência em dias |

## 8. Pontuação de redação em rótulo e botão (X5)

**Por que incomoda.** Ponto final em botão, aba ou título e dois-pontos em rótulo acima do campo são hábitos de texto corrido. Na interface, viram ruído visual e deixam o rótulo com cara de frase.

**Como reconhecer.** Botão, título ou aba terminados em "."; rótulo terminado em ":" ou ".". Reticências de progresso ("Carregando…") e interrogação de confirmação ("Excluir minuta?") estão certas.

**Como reescrever.** Tire a pontuação. Se o título precisa de ponto porque é uma frase inteira, ele provavelmente é um texto de apoio.

| Antes | Depois |
|---|---|
| Botão "Salvar minuta." | Salvar minuta |
| Rótulo "Nome da parte:" | Nome da parte |
| Título "Resposta registrada em 02/10/2026 14:37." | Título "Resposta registrada"; apoio "Em 02/10/2026, às 14:37" |

## 9. Caixa De Título (X10)

**Por que incomoda.** "Contratos e Aditivos", "Sumário Executivo", "Baixar Word Assinado": maiúscula em cada palavra é convenção do inglês. Em pt-BR, só nomes próprios e siglas levam maiúscula no meio; o resto pesa a leitura e parece tradução.

**Como reconhecer.** Botão, aba ou título em que todas as palavras de conteúdo depois da primeira começam com maiúscula. Siglas ("TO BE", "PDFs") ficam de fora; nomes próprios do domínio vão em `content.proper-nouns` no UX.md.

**Como reescrever.** Só a primeira letra maiúscula (mais nomes próprios e siglas).

| Antes | Depois |
|---|---|
| Contratos e Aditivos | Contratos e aditivos |
| Simulador de Regimes | Simulador de regimes |
| Baixar Word | Baixar Word (se "Word" estiver declarado como nome próprio) |

## 10. Botão que não é ação (X6)

**Por que incomoda.** Botão com cinco palavras ou mais vira frase e perde a leitura de alvo. Botão sem verbo ("Nova cláusula", "Categorias") obriga a adivinhar se ele cria, abre ou filtra. "OK", "Sim" e "Confirmar" soltos não dizem o que confirmam.

**Como reconhecer.** Botão com mais de 4 palavras; botão que não começa por verbo no infinitivo (quando o UX.md pede `content.buttons: verb-object`); rótulos da lista sem objeto. Cartões clicáveis, itens de lista, ordenação e chips não são avaliados.

**Como reescrever.** Verbo + objeto, até 4 palavras. Detalhe vai para o texto de apoio ou para o título do diálogo.

| Antes | Depois |
|---|---|
| Nova cláusula | Criar cláusula |
| Baixar PDF para assinar fora | Baixar PDF |
| Confirmar | Confirmar vínculo |

## 11. Dica que repete ou explica demais (X7) e placeholder que repete o rótulo (X8)

**Por que incomoda.** Tooltip ou aria-label idêntico ao texto visível faz o leitor de tela repetir a mesma coisa e não ajuda quem passa o mouse. Dica com mais de 12 palavras é uma explicação escondida atrás de um gesto que muita gente nunca faz. Placeholder igual ao rótulo some ao digitar e não ensina nada.

**Como reconhecer.** `title` ou `aria-label` igual ao texto do mesmo elemento (fora textos truncados, em que a dica é o texto inteiro); dica longa num controle; placeholder que contém o rótulo.

**Como reescrever.** Remova o atributo redundante. Explicação que importa vira texto de apoio visível. Placeholder mostra o formato esperado ou sai.

| Antes | Depois |
|---|---|
| Botão "Salvar" com title "Salvar" | Botão "Salvar" sem title |
| Dica "Refaz a leitura dos dados e o OCR das páginas pendentes. Dados confirmados não mudam." | Botão "Ler de novo"; apoio "O que você confirmou não muda." |
| Rótulo "CNPJ", placeholder "CNPJ" | Rótulo "CNPJ", placeholder "00.000.000/0000-00" |

## 12. Termo de implementação (X11)

**Por que incomoda.** "sha256", "hash", "token", "payload", "API", "JSON", "5xx", "OCR" são palavras de quem construiu, não de quem usa. Para a pessoa, viram ruído ou insegurança ("o que é isso? fiz algo errado?").

**Como reconhecer.** Termos de `content.forbidden` do UX.md, mais a lista padrão da ferramenta. "OCR" passa quando vem explicado na mesma frase.

**Como reescrever.** Diga o efeito com a palavra do domínio. Detalhe técnico, se o suporte precisar, vai num campo secundário (`patterns/feedback/technical-error-code.md`).

| Antes | Depois |
|---|---|
| Documento (sha256, o mesmo do de acordo) | É o mesmo documento aprovado no de acordo |
| Erro 5xx ao enviar | Não conseguimos enviar agora. Tente de novo em instantes. |
| Refaz o OCR das páginas | Lê de novo as páginas digitalizadas |

---

## Corrigir na origem

O texto que aparece na tela quase nunca nasce na tela: vem de um arquivo de vocabulário, de um template com dado interpolado ou de uma resposta do servidor. Rode a ferramenta com `--code` para ter `arquivo:linha` de cada achado e corrija lá, uma vez, para todas as telas que usam o texto.

- **SE** o achado aponta um template (`Remover da lista — ${nome}`) → ENTÃO corrija o template; todas as variantes somem juntas.
- **SE** a peça acusada (o travessão, a maiúscula) veio do dado interpolado (nome de minuta, de pessoa, de categoria) → ENTÃO não é texto da interface; a ferramenta separa esses casos como "provável dado".
- **SE** o mesmo texto aparece em muitas telas (navegação, cabeçalho) → ENTÃO corrija primeiro: o ganho é proporcional à frequência.

## Checklist

- [ ] Nenhum travessão ou meia-risca fora de intervalo numérico; valor ausente diz "Não informado" ou fica vazio.
- [ ] Títulos, abas e botões têm um assunto só; nome do objeto no aria-label, contagem em selo.
- [ ] Nenhum "não só … mas também", nenhuma tríade de adjetivos, nenhum adjetivo de autoelogio.
- [ ] Texto de apoio acrescenta fato que o título não tem; nenhuma abertura vazia.
- [ ] Rótulos, botões e títulos sem parêntese explicativo, sem ponto final e sem dois-pontos.
- [ ] Caixa de frase em tudo; maiúscula só em nome próprio e sigla.
- [ ] Botões: verbo + objeto, até 4 palavras.
- [ ] Dica e aria-label não repetem o texto visível; dica curta; placeholder mostra formato.
- [ ] Nenhum termo de implementação visível.
- [ ] Cada correção feita na origem (`arquivo:linha` do relatório), não na captura.
