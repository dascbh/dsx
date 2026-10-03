---
name: ux-writing
description: "Escreve e revisa todo texto da interface em pt-BR: botões, erros, vazios, toasts, confirmações e conteúdo de IA, com tom definido e glossário consistente. Use ao criar ou mudar qualquer string visível."
---

# UX writing

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/` são relativos a ela.

Referências: `knowledge/fundamentos/ux-writing.md`, `knowledge/fundamentos/marcas-de-texto-gerado.md` (marcas de texto gerado por IA e burocrático, regras X1–X11), `patterns/ux-writing/*` (texto de botão, texto de link, mensagem de erro útil).

## Levantamento automático (quando há telas para olhar)

Antes de revisar à mão, deixe a ferramenta achar o que é mecânico. Ela não julga arquitetura de tela, só o texto.

1. Rode sobre as capturas HTML, apontando o código onde os textos nascem:
   ```bash
   node tools/ux-lint/text.mjs --screens <pasta-de-capturas> --code <pastas-do-front> <pastas-de-vocabulário> --ux UX.md [--ignore <arquivo.html>] [--json]
   ```
   Sem capturas, gere-as antes (skill `code-to-stitch` no projeto, ou qualquer HTML renderizado).
2. Leia o resumo por regra e o ranking "Textos mais problemáticos" (severidade × número de telas). Priorize por severidade e frequência: texto da navegação ou do cabeçalho, que aparece em todas as telas, vem primeiro.
3. Corrija **na origem** (`arquivo:linha` do relatório), uma vez: o vocabulário ou o template, não a captura. Um achado com "variantes do mesmo template" se resolve numa linha só.
4. Ignore a seção "Provável dado": ali a marca veio do conteúdo interpolado (nome de minuta, pessoa, categoria), não do texto da interface.
5. Para reescrever cada achado, use os antes/depois de `knowledge/fundamentos/marcas-de-texto-gerado.md`. As marcas que a ferramenta não acusa (tríades, "não só … mas também", adjetivos genéricos) entram na revisão manual abaixo.
6. Rode de novo depois de corrigir e recapturar: o número de achados da interface deve cair, sem achado novo.

## Registrar em `.dsx/findings` e decidir pelo registro

O resultado não fica na conversa nem em pasta temporária (contrato: `knowledge/fundamentos/achados-de-ux.md`).

1. `node tools/ux-lint/findings.mjs register --module <m> --text texto.json [--screen tela.json] [--flow fluxo.json] --root <repo>` — cada achado ganha id estável e status.
2. Escreva as opções em `cases.json` (formato em `knowledge/fundamentos/achados-de-ux.md`) e ligue-as aos ids: `findings.mjs options --module <m> --from cases.json`. Caso de revisão manual (descrição desnecessária) entra como item `origin: "review"`.
3. `findings.mjs page --module <m> pagina.html --product "<produto>" --color "<primária>"`: o dono marca A/B/C ou Ignorar (com motivo) e usa "Copiar decisões"; grave com `findings.mjs import --module <m> decisions.json` (ou `decide` para uma decisão dita no chat).
4. Aplique na origem só o que está `decided` (`findings.mjs status --module <m>` lista com `arquivo:linha`), recapture, registre de novo e confira `fixed`. `findings.mjs check` no pre-commit ou CI impede achado novo e regressão.

## Antes de escrever

1. Leia o glossário do projeto, se existir (DESIGN.md, `docs/`, ou strings existentes). **Mesmo conceito = mesma palavra em todas as telas.** Se não existir, monte um com os 10–20 termos do domínio a partir das strings atuais e aponte divergências.
2. Identifique o tom de voz nas 4 dimensões (formal↔casual, sério↔divertido, respeitoso↔irreverente, entusiasmado↔objetivo). Interface de tarefa tende a objetivo e respeitoso. O tom **muda com o momento**: erro e perda de dinheiro pedem mais sobriedade que boas-vindas.

## Fórmulas

| Elemento | Fórmula | Exemplo |
|---|---|---|
| Botão | verbo no infinitivo + objeto | "Salvar alterações", "Enviar proposta" — nunca "OK", "Sim", "Enviar" solto quando há ambiguidade |
| Link | descreve o destino | "Ver política de reembolso" — nunca "clique aqui" |
| Erro de campo | o que aconteceu + como resolver, sem culpar | "Informe um CEP com 8 números." |
| Erro de sistema | o que houve + o que foi preservado + próximo passo | "Não conseguimos salvar agora. Suas alterações continuam aqui. Tente de novo em instantes." |
| Estado vazio | o que é este lugar + por que está vazio + ação | "Nenhuma fatura ainda. As faturas aparecem aqui depois do primeiro pagamento." |
| Confirmação destrutiva | ação + objeto + consequência; botões repetem o verbo | "Excluir o projeto 'Site 2026'? Os 14 arquivos serão apagados e não podem ser recuperados." → [Cancelar] [Excluir projeto] |
| Sucesso | o que foi feito (+ desfazer se cabível) | "Proposta enviada para Ana Souza." [Desfazer] |
| Carregamento longo | o que está acontecendo + quanto falta | "Gerando relatório… cerca de 30 segundos." |
| Conteúdo de IA | rótulo + limite + ação | "Resumo gerado por IA. Confira os valores antes de enviar." |

## Regras

- Frases curtas; uma ideia por frase; a informação mais importante primeiro.
- Voz ativa, segunda pessoa implícita ("Informe seu e-mail"), sem "o usuário" na interface.
- Sem jargão técnico ou interno ("payload", "erro 500", nome de tabela). Código técnico só como detalhe secundário para suporte — `patterns/feedback/technical-error-code.md`.
- Não culpe ("Você digitou errado") nem infantilize ("Ops! 🙈") em erro.
- Números como algarismos; datas e moeda no formato brasileiro (`01/10/2026`, `R$ 1.234,56`).
- Sentence case em títulos e botões ("Criar conta", não "Criar Conta").
- Plural e gênero gerados por código: trate 0, 1 e N ("Nenhum item", "1 item", "3 itens").
- Siglas com gênero correto ("a API", "o PDF"); crase e acentuação revisadas.
- Rótulos de campo não terminam com dois-pontos quando acima do campo; placeholder nunca substitui rótulo.

## Revisão de um fluxo

1. Extraia todas as strings do fluxo (código ou tela) para uma tabela: `tela | elemento | texto atual`.
2. Marque: inconsistência de termo, fórmula violada, tom fora do momento, erro de português, texto que não ajuda a decidir, marca de texto gerado (`knowledge/fundamentos/marcas-de-texto-gerado.md`).
3. Proponha a reescrita na coluna ao lado, com o motivo em ≤ 8 palavras.
4. Atualize o glossário com qualquer termo decidido.

Saída: a tabela `tela | elemento | atual | proposto | motivo` + glossário atualizado.


## Levantamento com opções para o dono escolher

1. `node tools/ux-lint/text.mjs --screens <capturas> --code <pastas do código> --ux UX.md --json > text.json` — achados X1–X11 com a origem `arquivo:linha`.
2. Some a revisão por julgamento do que a máquina não pega bem: **descrições desnecessárias** (repetem o óbvio, explicam o que a tela já mostra, tom de manual).
3. Para cada caso, escreva 2–3 opções prontas para colar, cada uma com a convenção de origem (`knowledge/fundamentos/elementos-comparados.md`: Material, Carbon, Polaris, GOV.UK, Atlassian, Apple HIG, DSX) e uma recomendada com o porquê. Quando a correção é de lugar (nome vai para o nome acessível, explicação sai da dica e vira texto visível), diga isso na opção.
4. Registre e gere a página pelo registro (`findings.mjs options` + `findings.mjs page`, seção anterior): mostra cada elemento renderizado hoje e em cada opção, com id, status e o formulário de decisão. Sem registro, `node tools/ux-lint/text-page.mjs cases.json pagina.html --product "<produto>" --color "<primária>"` gera só a página. O dono escolhe; a correção é feita na origem.
