# Métodos de pesquisa

## Quando consultar

- Antes de escolher qualquer método, ou quando alguém já escolheu um método sem dizer qual pergunta ele responde.
- Ao planejar entrevistas, card sorting, tree testing, benchmarking ou análise de analytics/heatmap/session replay.
- Quando surgir a dúvida "isso é pesquisa gerativa ou avaliativa?", "preciso de quali ou quanti?".

Para testes de usabilidade, veja `testes-de-usabilidade.md`. Para métodos de validação de valor (fake door, conceito, MVP), veja `discovery-e-estrategia.md`.

## 1. Classifique pela pergunta, não pelo nome do método

A mesma técnica pode servir a propósitos diferentes. Uma entrevista pode explorar um problema ou avaliar uma proposta; um survey pode descobrir ou medir. Por isso o agente classifica sempre a **pergunta**.

| Eixo | Lado A | Lado B |
|---|---|---|
| Propósito | **Gerativa**: o que precisamos entender ou resolver? Produz conhecimento sobre pessoas, contexto, necessidades | **Avaliativa**: como esta solução se sai? Produz problemas encontrados e evidência de desempenho |
| Momento da avaliação | **Formativa**: melhorar algo em construção | **Somativa**: comparar contra uma referência (baseline, concorrente, meta) |
| Natureza do dado | **Qualitativo**: por quê, como; descobre problemas e mecanismos | **Quantitativo**: quanto, com que frequência; mede e compara |
| Fonte | **Atitudinal**: o que a pessoa diz | **Comportamental**: o que a pessoa faz |
| Contexto de uso | Natural (campo, analytics) · Roteirizado (teste) · Limitado (card sort, tree test) · Sem produto (entrevista exploratória) | |

Regras:

- Não confunda gerativa com qualitativa: um survey grande pode ser gerativo.
- Não confunda gerativa com "antes do lançamento": produto maduro com comportamento inexplicado exige pesquisa gerativa de novo.
- Relato não prova comportamento. "Eu usaria" não demonstra demanda, frequência nem causa.
- Combine quali e quanti como padrão: o quanti aponta onde, o quali explica por quê.

## 2. Árvore de seleção

- **SE** não existe decisão identificável **ENTÃO** pare e pergunte "o que muda conforme o resultado?" antes de propor método.
- **SE** a incerteza é sobre quem, contexto ou necessidade **ENTÃO** entrevistas, estudo de campo, diário, leitura de tickets de suporte.
- **SE** é sobre como resolvem hoje **ENTÃO** entrevista ancorada no último episódio + analytics do comportamento atual.
- **SE** há algo concreto para avaliar e a pergunta é "conseguem usar?" **ENTÃO** teste de usabilidade.
- **SE** a pergunta é "quanto/quantos" **ENTÃO** analytics ou survey amostrado; nunca percentuais de entrevista.
- **SE** a pergunta é causal ("a mudança causou?") **ENTÃO** experimento controlado (A/B); sem tráfego suficiente, rollout gradual com grupo comparável.
- **SE** a dúvida é como agrupar conteúdo **ENTÃO** card sorting; **SE** é se encontram algo numa estrutura **ENTÃO** tree testing.
- **SE** já existe evidência suficiente para a decisão **ENTÃO** não pesquise; documente a evidência e siga.
- **SE** a mudança é pequena, barata e reversível **ENTÃO** considere testar direto em produção com monitoramento.

Checklist antes de fechar o método: qual decisão? o que é desconhecido? a pergunta é sobre problema ou solução? existe algo concreto para avaliar? quero "quanto" ou "por quê"? comportamento observado ou percepção relatada? quem precisa estar representado? que evidência contradiria minha leitura atual?

Processo em nove passos: contexto da decisão → mapa do que se sabe, se crê e se ignora → perguntas de pesquisa → revisão da evidência existente → tipo de evidência necessária → método → participantes/fontes → coleta com rastreabilidade → análise ligada à decisão, com limites.

## 3. Entrevistas com usuários

Servem para entender experiências, necessidades e comportamentos **relatados**. A evidência é principalmente atitudinal; trate-a como tal.

Formatos: estruturada (comparabilidade alta), **semiestruturada** (padrão: temas fixos com aprofundamentos livres), não estruturada (domínio quase desconhecido).

Regras de condução:

- Separe **perguntas de pesquisa** (o que o time quer saber) de **perguntas ao participante** (o que se pergunta na sessão). Nunca leia a pergunta de pesquisa em voz alta.
- Ancore em episódio concreto: "Conte a última vez que você…" e depois "o que aconteceu em seguida?". Vá do geral ao episódio, não o contrário.
- Evite perguntas indutoras ("foi confuso, né?"), hipotéticas ("você usaria?"), defensivas ("por que não fez X?") e de design transferido ("o que devemos construir?").
- Ouça mais do que fala. Tolere o silêncio. Não defenda o produto.
- O guia é um mapa: siga pistas inesperadas e volte aos temas.
- Registre com ID de sessão e timestamp; preserve casos divergentes.

Combinação com teste de usabilidade numa mesma sessão é possível, desde que as perguntas iniciais não antecipem o que será avaliado.

Template: `templates/roteiro-entrevista.md`.

## 4. Card sorting

Investiga como as pessoas agrupam e nomeiam conteúdo. Insumo para arquitetura de informação, não prova de navegação.

| Tipo | Uso |
|---|---|
| Aberto | Participante cria e nomeia grupos. Exploratório |
| Fechado | Categorias dadas. Verifica encaixe; para findabilidade, prefira tree testing |
| Híbrido | Categorias dadas + possibilidade de criar. Use com justificativa, pois as categorias sugeridas influenciam |

Passo a passo: pergunta específica → inventário de conteúdo (incluindo itens ambíguos) → cartões com linguagem neutra, sem jargão e sem palavras repetidas que induzam grupo → em torno de 30–50 cartões (o piloto revela fadiga e um grupo "diversos" inchado) → recrutar usuários reais por segmento → piloto → instruções sem ensinar (pode criar quantos grupos quiser, deixar cartão sozinho) → registrar hesitações.

Análise:

- Revise sessões individuais antes de agregar.
- Padronize nomes de grupos com cautela; só funda "Minha conta" e "Perfil" se o conteúdo agrupado for o mesmo.
- **Matriz de similaridade**: percentual de participantes que puseram dois cartões juntos. Alto = associação forte; valores medianos = ambiguidade a investigar.
- **Dendrograma**: mostra clusters; não vira menu automaticamente.

Armadilhas: só colegas internos; categoria embutida no texto do cartão; impor número de grupos; usar card sorting para medir findabilidade.

## 5. Tree testing

Avalia se as pessoas encontram itens numa hierarquia apenas textual, isolando estrutura e rótulos de qualquer efeito visual.

Passo a passo: decisão e escopo → tarefas prioritárias (vindas de buscas internas, tickets, fluxos de alto valor e áreas suspeitas) → árvore sem ícones nem descrições, com destinos corretos definidos (pode haver mais de um) → tarefas como cenário **sem repetir rótulos da árvore** → recrutar quem conhece o domínio mas não a estrutura → piloto → coletar caminhos completos → analisar por tarefa → iterar mudando uma variável por vez.

Exemplo de tarefa: ruim — "Encontre a segunda via da fatura". Bom — "O boleto deste mês não chegou e você precisa pagar até sexta. Onde procuraria?"

Métricas:

- `sucesso = participantes que chegaram a um destino correto / participantes` (por tarefa e por segmento).
- **Sucesso direto** (sem voltar) vs **indireto** (com retornos). Muito sucesso indireto indica estrutura confusa mesmo com sucesso alto.
- **Primeiro clique**: qual ramo de primeiro nível foi escolhido. Primeiro clique errado é forte preditor de dificuldade.
- **Destinos concorrentes**: ramos que "roubam" respostas por semelhança semântica.

Limites: não avalia visibilidade de menu, hierarquia visual, busca, links contextuais nem a página final. Mantenha menos de 10 tarefas por participante.

Sequência típica de IA: card sorting → proposta de estrutura → tree testing → protótipo → teste de usabilidade.

## 6. Benchmarking de UX

Estudo avaliativo **repetível**: as mesmas tarefas, métricas e condições, medidas em rodadas para comparar contra uma linha de base.

Vocabulário: **baseline** (primeira medição confiável) · **benchmark** (o processo repetível) · **meta** (alvo) · **delta** (diferença entre rodadas).

Regras:

- Comece pela decisão, não pelo painel de métricas.
- Escolha 5–10 tarefas críticas, com ponto de partida e critério de sucesso objetivo ("pagamento concluído e confirmação exibida", não "clicou em pagar").
- Use 2–4 métricas complementares: sucesso, tempo, erros/ajuda, percepção (SUS ou SEQ).
- Congele o protocolo antes da coleta (recrutamento, instruções, ordem das tarefas, dispositivo, regras de ajuda). Esse é o contrato de comparabilidade.
- Preserve dados brutos. Use participantes novos e equivalentes a cada rodada.
- Registre tudo o que mudou entre rodadas (versão, sazonalidade, ferramenta, perfil).
- Na análise, responda três perguntas separadas: que diferença foi observada? com quanta incerteza (IC, distribuição)? importa para a decisão?

Benchmark competitivo aplica as mesmas tarefas e critérios a vários produtos. Serve para posicionar, não para ranking de vaidade.

## 7. Analytics, heatmaps e session replay

Ferramentas de analytics comportamental mostram **o que** aconteceu, nunca **por quê**.

| Fonte | Mostra | Bom para |
|---|---|---|
| Analytics de eventos/funil | Volumes, taxas por etapa, coortes | Localizar onde o fluxo vaza, dimensionar alcance |
| Heatmap (clique, rolagem) | Agregado de interações numa página | Ver se elementos importantes são alcançados e clicados |
| Session replay | Sequência de uma sessão individual | Entender o padrão por trás de um número |

Sinais e leituras possíveis (nenhum é diagnóstico sozinho):

- **Rage clicks** (cliques repetidos rápidos): falta de resposta, feedback insuficiente ou lentidão. Verifique desempenho técnico antes de culpar o design.
- **Dead clicks** (clique sem efeito): algo parece interativo e não é. Há falsos positivos (seleção de texto, por exemplo).
- **Quick back** (entra e volta): expectativa não atendida, navegação errada ou simples comparação.
- **Rolagem excessiva**: busca por algo difícil de achar, ou leitura atenta. Depende do contexto.

Como usar:

1. Parta de pergunta específica.
2. Segmente (página, dispositivo, origem, comportamento).
3. Assista sessões suficientes para ver padrões **e** contradições; não escolha só as que confirmam a tese.
4. Separe observação, interpretação e hipótese.
5. Quantifique alcance no analytics antes de priorizar.
6. Explique o mecanismo com pesquisa quali; valide a solução com teste.

Limites: consentimento, bloqueadores e falhas de implementação enviesam a amostra; canvas e iframes de terceiros podem não ser capturados; resumos automáticos de sessões são triagem e exigem conferência no original. Sem pergunta, sem pessoa responsável pela análise e sem governança de dados, a ferramenta vira ruído. Privacidade: mascare campos sensíveis antes da coleta (ver `etica-e-inclusao.md`).

Antes de confiar em qualquer taxa, confira a instrumentação: eventos duplicados, tags ausentes, denominador errado, efeito do banner de consentimento.

## Armadilhas gerais

- Escolher método pela ferramenta disponível ou pela familiaridade.
- Enquadrar como "validar" (o desenho já escolheu a resposta). Prefira perguntas neutras e busque evidência que refute.
- Recrutar errado: método certo com participantes errados produz pesquisa fraca.
- Converter entrevistas em percentuais ou eventos em "falas".
- Tratar pesquisa como fase única antes do design.
- Generalizar além do escopo coletado.

## O que um agente pode / não pode fazer

> **Pode:** sugerir método a partir da pergunta; redigir guias, cartões, tarefas e protocolos; detectar rótulos repetidos e perguntas indutoras; calcular matrizes de similaridade, sucesso direto/indireto, deltas e intervalos a partir de dados reais; fazer triagem de sessões e heatmaps para revisão humana; transcrever e codificar rascunhos.
>
> **Não pode:** gerar respostas, ordenações de cartões, caminhos de árvore ou sessões "simuladas" e tratá-las como dado; definir sozinho critérios de recrutamento; transformar resumo automático em achado sem checar o material bruto; afirmar causa a partir de heatmap ou replay.
