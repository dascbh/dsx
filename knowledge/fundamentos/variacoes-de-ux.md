# Variações de UX

> **Quando consultar**
> - Antes de propor outras versões de uma tela ou de um fluxo (skill `repensar-ux`).
> - Quando os achados de um fluxo se repetem com a mesma causa e corrigir um por um não resolve.
> - Para avaliar se um conjunto de alternativas é diverso de verdade ou são a mesma ideia com outra roupa.

## O que é uma variação

Uma variação é **outra resposta para a mesma tarefa**, com uma ideia central que dá para dizer numa frase e que muda o que a pessoa vê, a ordem em que faz as coisas, o que acontece quando ela age e as palavras que lê. Trocar a cor do botão é ajuste; levar o botão para outro lugar é arranjo; dividir a tarefa de outro jeito, mudar quem decide quando, ou trocar uma confirmação por um desfazer é variação.

A comparação só serve se as alternativas forem **comparáveis** (mesma tarefa, mesma persona, mesmos dados fictícios, mesmos componentes do produto) e **diferentes** (ideias centrais que não cabem uma dentro da outra).

## Eixos de variação

Cada eixo é uma alavanca. Uma variação forte move vários, todos a serviço da mesma ideia.

| Eixo | Pergunta | Exemplos de movimento |
|---|---|---|
| **Estrutura da tela** | Que tipo de tela resolve a tarefa? | assistente em etapas → formulário de página com seções; lista + detalhe → tabela com edição na linha; painel lateral → página própria |
| **Divisão do fluxo** | Quantos passos, em que ordem, onde começa? | juntar passos que não dependem um do outro; começar pelo que a pessoa já tem (a planilha, o contrato) e não pelo que o sistema precisa; tirar a revisão final quando tudo já está à vista |
| **Modelo de interação** | Como a pessoa age sobre os dados? | escolher um por um → marcar em lote; preencher formulário → editar na tabela; arrastar → escolher na lista; copiar um existente em vez de começar do zero |
| **Densidade e texto** | Quanto texto, e de que tipo? | instrução longa → rótulo que se explica; parágrafo de regra → aviso no ponto em que a regra morde; título genérico → título que diz o resultado ("Gerar 12 minutas") |
| **Momento da validação** | Quando a pessoa descobre que algo está errado? | no envio → ao sair do campo → enquanto digita (só para formato); erro de lote no fim → pendência marcada em cada linha antes de gerar |
| **Confirmação × desfazer** | A ação pede licença antes ou permite voltar depois? | diálogo "Tem certeza?" → ação imediata com "Desfazer" por alguns segundos; confirmação genérica → confirmação que repete a consequência (quantos, quais) |
| **Primeiro plano × segundo plano** | A pessoa espera ou segue trabalhando? | tela de espera bloqueante → progresso em linha e aviso ao terminar; gerar tudo antes de mostrar → mostrar cada item assim que fica pronto; salvar manual → salvamento automático com indicação |

Use `patterns/` para a solução concreta de cada movimento (`form-steps`, `split-form`, `validation-timing`, `undo`, `confirm-action`, `long-loading`, `progress-percentage`, `autosave-vs-save`…) e `archetypes/` para a estrutura (`step-wizard`, `operational-list`, `editor-with-panel`, `form-dialog`…).

## Como gerar alternativas genuínas

1. **Comece pela causa, não pelo sintoma.** Junte os achados do fluxo por causa ("a pessoa decide o modelo antes de saber quantos destinatários tem", "o texto explica o que a estrutura esconde"). Cada causa sugere um eixo.
2. **Force ideias centrais opostas.** Um trio útil: uma que **corta** (menos passos, menos tela, menos texto), uma que **reorganiza** (outro ponto de partida, outra ordem, outro modelo de interação) e uma que **muda o comportamento** (desfazer, validação antecipada, trabalho em segundo plano). Se duas variantes cabem na mesma frase, descarte uma.
3. **Troque de arquétipo pelo menos uma vez.** Leia o `evitar-quando` do arquétipo atual: se ele descreve o uso real (tarefa diária num assistente feito para tarefa rara), uma variante deve usar o arquétipo indicado ali.
4. **Pergunte "e se não existisse?"** para cada passo, diálogo e parágrafo. O que sobra quando o passo some é uma variante.
5. **Pegue emprestado de outra tela do próprio produto** que já resolve um problema parecido: consistência é argumento, e os componentes já existem.
6. **Só então escreva o texto.** O texto da variante é reescrito para a nova estrutura (títulos que dizem o resultado, botões com verbo e objeto, sem instrução de passo que a estrutura tornou óbvia), pela skill `ux-writing`.

## Hipótese e trade-off

**Hipótese** = mudança → efeito → para quem → como saber. Exemplo: "Juntar modelo e destinatários numa tela reduz de 9 para 4 os cliques de quem gera lotes toda semana; medimos pelo tempo até baixar o .zip." Sem "para quem", a hipótese não decide nada; sem "como saber", não pode falhar.

**Trade-off** = o que piora, para quem, e o risco. Toda variação piora alguma coisa: tela mais densa para o iniciante, menos chance de revisar, mais custo de construir, um componente novo. Variante sem trade-off escrito não foi pensada até o fim. Escreva o trade-off com a mesma precisão da hipótese ("quem gera pela primeira vez não vê mais a explicação do passo 2").

## Armadilhas

- **Variação cosmética:** cor, ícone, ordem de botões, espaçamento. Não muda a tarefa; é ajuste, vai para `auditar-ux` ou `arranjar-tela`.
- **Espantalho:** duas variantes ruins para a terceira brilhar. O dono percebe e a comparação perde o valor; cada variante deve ser a melhor versão da sua ideia.
- **Favorita disfarçada:** três versões da mesma ideia. Teste: as três frases de conceito são intercambiáveis?
- **Esquecer os estados:** a variante é linda com dados e quebra no vazio, no erro ou no rascunho recuperado. Capture os estados que o arquétipo exige.
- **Prometer sem medir:** "menos cliques" sem contar. Declare as métricas e confira com `variations.mjs measure`.
- **Resolver um achado criando outro:** a variante tira o travessão e cria um campo sem rótulo. O `lint` acusa achado novo; severidade ≥ 3 reprova.
- **Composição incoerente:** "fluxo de B com texto de A" quando o texto de A fala de um passo que B eliminou. Reescreva o texto para a combinação.
- **Maquete no lugar de produto:** variação desenhada fora dos componentes reais compara uma promessa com um produto. Construa pelo harness de captura do projeto.
- **Confundir revisão com prova:** a comparação mostra problemas prováveis e ganhos plausíveis; decisão cara pede teste com usuários (skill `pesquisa`).

## Decisões rápidas (SE → ENTÃO)

- **SE** a tarefa é diária e o fluxo é um assistente **ENTÃO** uma variante deve ser página única com seções.
- **SE** a pessoa já chega com os dados prontos (planilha, documento) **ENTÃO** uma variante começa por eles.
- **SE** o fluxo termina com uma espera longa **ENTÃO** uma variante põe o trabalho em segundo plano com progresso em linha.
- **SE** a ação é reversível e frequente **ENTÃO** uma variante troca a confirmação por desfazer; **SENÃO** (irreversível, cara) a confirmação fica e repete a consequência.
- **SE** o texto explica uma regra que a estrutura poderia mostrar **ENTÃO** uma variante tira o texto e mostra a regra no lugar onde ela vale.

## Checklist

- [ ] Persona, tarefa e métricas de hoje escritas com fonte; achados do fluxo agrupados por causa.
- [ ] Três ideias centrais opostas, cada uma numa frase.
- [ ] Cada variante move tela, fluxo, comportamento e texto a serviço da sua ideia.
- [ ] Arquétipo, padrões e leis citados por id.
- [ ] Hipótese com efeito, público e medida; trade-off com o que piora e para quem.
- [ ] Estados exigidos capturados; métricas conferidas; nenhum achado novo de severidade ≥ 3.
- [ ] Construída com componentes reais e dados fictícios; nenhuma variante espantalho.
