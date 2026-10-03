# Dimensões de UX

> **Quando consultar**
> - Ao auditar a UX de um módulo inteiro (skill `auditar-ux`, `tools/ux-lint/audit.mjs`): para ler o relatório por dimensão e saber o que a máquina verificou e o que ainda é julgamento.
> - Ao decidir onde um achado de revisão manual se encaixa (qual dimensão, qual regra ou heurística citar).
> - Ao propor regra nova: a matriz diz qual dimensão está descoberta e em que família a regra entra.

A auditoria olha a interface por **14 dimensões**. Cada uma responde a uma pergunta, se apoia em arquivos de `knowledge/`, em padrões de `patterns/` e em campos dos arquétipos, e é verificada de um de quatro jeitos: regra automática, regra automática + julgamento, só julgamento ou só referência. A fonte de verdade é a matriz `data/ux-dimensions.json` (dado, em inglês); as tabelas abaixo são geradas dela (`renderDimensionsTable` e `renderRulesTable` em `tools/ux-lint/audit.mjs`) e um teste confere que este documento cita toda dimensão e toda regra da matriz.

## Como cada dimensão é verificada

| Verificação | O que significa | O que o agente faz |
|---|---|---|
| Regra automática | A maior parte da pergunta é respondida pelos detectores | Confere os achados e propõe a correção |
| Regra automática + julgamento | Regras cobrem parte; o resto pede leitura com o knowledge citado | Confere os achados e revisa as lacunas da dimensão |
| Julgamento | Sem regra, ou só um sinal marginal | Revisa cada tela com o knowledge indicado e registra achado `origin: review` |
| Só referência | Knowledge que justifica e dimensiona achados de outras dimensões | Cita a lei ou o princípio no achado da outra dimensão; não gera achado próprio |

## Dimensões

| Dimensão | Pergunta | Regras | Verificação | Heurísticas | Lacunas |
|---|---|---|---|---|---|
| Texto (`text`) | Cada texto visível diz o que a pessoa precisa, na palavra dela, sem marca de texto gerado nem termo de implementação? | X1, X1b, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11, T6, T7 | regra automática + julgamento | H2, H4, H8 | Tom de voz por contexto, clareza de frase, texto que diz menos do que devia (falta de consequência, prazo ou quem vê), adjetivos genéricos e construções 'não só X, mas Y' não são verificados por regra; ficam com a revisão por ux-writing. |
| Ações (`actions`) | A ação principal é uma só por região, está onde o produto declara e as ações destrutivas dizem o que fazem? | T1, T2, T5, L1 | regra automática + julgamento | H3, H4, H5 | Distância de segurança entre destrutiva e ação comum, desabilitado com motivo × escondido, desfazer depois de agir e confirmação proporcional ao risco (confirmation do UX.md) não são verificados. |
| Layout (`layout`) | A tela tem as regiões do seu arquétipo, com alinhamento, proximidade e medida de linha que mostram o que pertence a quê? | L4, L5, L7, L9 | regra automática + julgamento | H4, H8 | Reflow em 320 px, zoom de 200%, densidade adequada ao uso e cards dentro de cards não são medidos; as capturas são numa largura só. |
| Hierarquia visual (`hierarchy`) | O primeiro elemento percebido é o ponto de entrada ou a ação principal, com uma escala de títulos coerente e sem ênfases disputando? | T3, L2, L3, L6 | regra automática + julgamento | H6, H8 | Teste do borrão, hierarquia em escala de cinza, ordem de foco igual à ordem visual e cor de destaque usada como decoração ficam com o julgamento. |
| Arquitetura da informação (`information-architecture`) | Cada coisa mora onde o público espera, com nomes que preveem o conteúdo e profundidade dentro do limite? | F2 | julgamento | H2, H6 | Rotulagem que prevê o conteúdo, lugar de cada função, profundidade (navigation.max-depth do UX.md) e findability não têm regra; F2 só acusa tela fora de jornada. |
| Navegação (`navigation`) | A pessoa sabe onde está, de onde veio e como volta, sem diálogos empilhados? | F4, F5 | regra automática + julgamento | H1, H3, H6 | Item ativo destacado, título que diz onde se está, profundidade máxima e consistência do caminho de volta entre telas não são verificados. |
| Fluxos (`flows`) | As jornadas principais terminam, têm saída em toda tela e cabem no limite de passos declarado? | F0, F1, F3 | regra automática + julgamento | H3, H7 | Percurso cognitivo (a pessoa sabe o próximo passo?), trocas de persona dentro da jornada, pontos de decisão sem saída rotulada e fim de fluxo sem confirmação ficam com a revisão. |
| Formulários (`forms`) | Todo campo tem rótulo visível, ordem natural, validação no momento certo e erro que diz como corrigir? | T4 | regra automática + julgamento | H5, H6, H9 | Marcação de obrigatório × opcional, tipo de campo adequado, autocomplete, momento da validação e preservação de dados depois do erro não são verificados nas capturas estáticas. |
| Estados (`states`) | Toda tela tem capturados os estados obrigatórios, e vazio e erro dão uma saída e dizem o que fazer? | S1, S2, S3 | regra automática + julgamento | H1, H3, H9 | Duração e atraso do indicador de carregamento, sucesso proporcional ao feito, estado sem permissão que diz quem concede e falha temporária distinta de vazio pedem julgamento sobre cada captura de estado. |
| Consistência (`consistency`) | A mesma ação e o mesmo conceito têm o mesmo nome, a mesma aparência e o mesmo lugar em todas as telas? | C1, C2, C3 | regra automática + julgamento | H4 | Consistência de comportamento (mesmo componente, reação diferente), regra de validação diferente para o mesmo dado e consistência externa com a plataforma não são verificadas. |
| Acessibilidade (`accessibility`) | A tela é usável por teclado, leitor de tela, zoom e baixa visão (WCAG 2.2 AA)? | L8 | regra automática + julgamento | — | Contraste (medido à parte por tools/stitch/analyze-html.mjs e tools/contrast.mjs), foco visível, ordem de foco, ARIA, nomes de ícones, movimento reduzido e reflow ficam com a skill acessibilidade. Heurística não é acessibilidade: a dimensão não serve heurística de Nielsen. |
| Heurísticas de Nielsen (`heuristics`) | Considerando as dez heurísticas, o que atrapalha o uso desta tela ou fluxo e com que severidade? | — | julgamento | H1, H2, H3, H4, H5, H6, H7, H8, H9, H10 | As regras automáticas servem a heurísticas (ver rules_index), mas H7 (eficiência), H10 (ajuda) e a maior parte de H1 (status) não têm regra; a avaliação heurística completa é revisão do agente. |
| Leis cognitivas (`cognitive-laws`) | Quantidade de opções, tamanho e distância dos alvos, agrupamentos e enquadramento respeitam como as pessoas percebem e decidem? | — | só referência | H6, H8 | Usada para justificar e dimensionar achados de outras dimensões. Leis citadas fora do DSX (Miller, Tesler, Doherty, pico-fim, Von Restorff, Zeigarnik, estética-usabilidade) ainda não estão no knowledge (ver data/gap-analysis/nielsen-and-laws.json). |
| Dark patterns (`dark-patterns`) | Alguma tela induz a pessoa contra o próprio interesse (custo escondido, recusa constrangedora, pré-seleção, obstrução)? | — | julgamento | H3, H4, H5 | Nenhuma regra automática: consentimento pré-marcado, recusa redigida para envergonhar e recusa com peso visual muito menor que o aceite poderiam ser detectados nas capturas (proposta em data/gap-analysis/nielsen-and-laws.json). |

Quando um detector não existe ou não rodou (falta captura, mapa ou o arquivo do detector), a auditoria rebaixa a cobertura da dimensão naquela execução: se nenhuma família dela rodou, a dimensão vira julgamento e o relatório lista o knowledge para a revisão.

## Regras por dimensão

Ids fixos por família: `X` texto (`tools/ux-lint/text.mjs`), `T` tela (`tools/ux-lint/screen.mjs`), `F` fluxo (`tools/ux-lint/flow.mjs`), `L` layout e hierarquia (layout.mjs), `S` estados (`tools/ux-lint/states.mjs`) e `C` consistência (consistency.mjs). Severidade na escala 0–4 de [heuristicas-nielsen.md](heuristicas-nielsen.md).

| Regra | Família | Dimensão | Sev | Heurísticas | O que acusa |
|---|---|---|---|---|---|
| X1 | text | Texto | 2 | H8 | Travessão ou meia-risca usado como pausa no texto |
| X1b | text | Texto | 1 | H2 | Travessão no lugar de valor vazio |
| X2 | text | Texto | 2 | H4, H8 | Título, aba ou botão composto por dois blocos unidos por separador |
| X3 | text | Texto | 1 | H8 | Texto de apoio que só repete o título |
| X4 | text | Texto | 2 | H8 | Abertura vazia ("Aqui você pode…", "Nesta tela…") |
| X5 | text | Texto | 1 | H4 | Rótulo, botão ou título com pontuação final de redação |
| X6 | text | Texto | 1 | H2, H4 | Botão longo, sem objeto ou que não começa por verbo |
| X7 | text | Texto | 1 | H8 | Dica ou nome acessível que repete o texto visível ou explica demais |
| X8 | text | Texto | 1 | H5, H8 | Placeholder que repete o rótulo em vez de mostrar o formato |
| X9 | text | Texto | 1 | H8 | Parêntese explicativo em título, rótulo ou botão |
| X10 | text | Texto | 1 | H4 | Caixa De Título em vez de só a primeira maiúscula |
| X11 | text | Texto | 2 | H2 | Termo de implementação na tela (hash, token, API, payload…) |
| T1 | screen | Ações | 3 | H4, H8 | Mais ações primárias numa região do que actions.primary-per-region |
| T2 | screen | Ações | 2 | H4, H5 | Ordem cancelar × ação invertida no rodapé do diálogo |
| T3 | screen | Hierarquia visual | 2 | H8 | Tela sem exatamente um título principal (h1) |
| T4 | screen | Formulários | 3 | H5, H6 | Campo sem rótulo visível nem nome acessível (só placeholder) |
| T5 | screen | Ações | 3 | H5 | Ação destrutiva com rótulo genérico (Confirmar, OK, Sim) |
| T6 | screen | Texto | 2 | H2 | Termo proibido pelo UX.md (content.forbidden) no texto visível |
| T7 | screen | Texto | 1 | H2, H4 | Botão com rótulo que não é verbo + objeto |
| F0 | flow | Fluxos | 1 | — | Transição do mapa aponta para tela inexistente (aviso de integridade, fora do contrato) |
| F1 | flow | Fluxos | 3 | H3 | Tela (não diálogo) sem nenhuma transição de saída |
| F2 | flow | Arquitetura da informação | 1 | H6 | Tela fora de todas as jornadas do mapa |
| F3 | flow | Fluxos | 2 | H7 | Jornada com mais passos que flows.max-journey-steps |
| F4 | flow | Navegação | 2 | H3, H8 | Diálogo aberto a partir de outro além de flows.max-stacked-dialogs |
| F5 | flow | Navegação | 3 | H3, H1 | Tela não raiz sem transição de volta para a mãe ou a origem |
| L1 | layout | Ações | 2 | H4 | Ação primária fora da posição declarada (UX.md ou arquétipo) |
| L2 | layout | Hierarquia visual | 2 | H8 | Ênfases concorrentes: elementos de peso visual alto demais na primeira dobra |
| L3 | layout | Hierarquia visual | 2 | H8, H4 | Escala de títulos quebrada (h1 não é o maior, nível inferior maior que o superior) |
| L4 | layout | Layout | 1 | H8 | Campos, rótulos ou colunas de cartões com bordas esquerdas em mais de 2 posições |
| L5 | layout | Layout | 1 | H8 | Proximidade: rótulo longe do campo, grupo de ações espalhado, elemento mais perto do grupo vizinho |
| L6 | layout | Hierarquia visual | 2 | H6, H8 | Ação primária ou título fora da primeira dobra (900 px) |
| L7 | layout | Layout | 1 | H8 | Linha de texto corrido com mais de 90 caracteres |
| L8 | layout | Acessibilidade | 2 | H5 | Alvo clicável menor que 24 × 24 px (WCAG 2.5.8) |
| L9 | layout | Layout | 1 | H4, H6 | Região do arquétipo declarado ausente na tela |
| S1 | states | Estados | 2 | H1 | Estado obrigatório (UX.md ou arquétipo) sem captura |
| S2 | states | Estados | 2 | H3, H9 | Estado vazio ou de erro sem ação de saída |
| S3 | states | Estados | 2 | H9 | Mensagem de erro sem orientação do que fazer |
| C1 | consistency | Consistência | 2 | H4 | Mesma ação com rótulos diferentes entre telas (sinônimos) |
| C2 | consistency | Consistência | 1 | H4 | Mesmo rótulo de botão com variantes visuais diferentes |
| C3 | consistency | Consistência | 1 | H4, H2 | Mesmo conceito com nomes diferentes em títulos e abas |

Achados de revisão manual usam as regras da família quando cabem (um texto ruim que o detector não pegou entra como `X3`, não como regra nova) e, quando não cabem, um id de revisão de `review_rules` na matriz: `H1`…`H10` (heurística), `DP` (dark pattern), `IA`, `A11Y` (com o critério WCAG na mensagem), `LAW` (com a lei de `laws_index`) e `desc` (caso de texto sem regra, o padrão de `findings.mjs options`). Assim todo achado cai numa dimensão.

## Como ler o relatório por dimensão

`node tools/ux-lint/audit.mjs --module <m> --root <projeto>` imprime, para cada dimensão:

- **cobertura** — a de projeto (da matriz) e, se mudou nesta execução, a efetiva (`parcial → julgamento nesta execução`), com as famílias sem detector.
- **abertos** — achados presentes ainda não resolvidos (status `open`, `decided` ou `regression`), por severidade `s4 · s3 · s2 · s1`; quantos vieram de revisão manual.
- **novos** — ids que não existiam no registro antes desta execução.
- **corrigidos** — estavam presentes e sumiram nesta execução.
- **regressões** — voltaram depois de corrigidos.
- **fora do registro** — achados de uma família que o `findings.mjs` ainda não registra: aparecem só como contagem, sem id.
- **lacunas** e **revisar com** — o que a dimensão não verifica e o knowledge para a revisão do agente.

Decisões SE → ENTÃO:

- **SE** uma dimensão de cobertura parcial ou automática tem zero abertos **ENTÃO** isso diz só que as regras dela passaram; as lacunas continuam a revisar.
- **SE** a cobertura caiu para julgamento nesta execução **ENTÃO** gere o insumo que falta (o relatório diz o comando) antes de revisar à mão o que a máquina mediria.
- **SE** aparece "Sem dimensão" **ENTÃO** um detector emitiu regra fora da matriz: acrescente em `rules_index` e na dimensão certa.
- **SE** novos ou regressões de severidade ≥ 2 aparecem **ENTÃO** trate antes dos abertos antigos: é a trava contra piora (`findings.mjs check`).

## Lacunas vindas de outras fontes

Duas comparações sistemáticas, gravadas como dado:

- `data/gap-analysis/web-design-rules.json` — as 65 regras de um guia público de design visual para sites (sem licença: só paráfrase curta, nada copiado). 42 já estão cobertas, 17 em parte e 6 não; 6 das parciais ou não cobertas são de site de marca (personalidade, fotos, imagem decorativa) e ficam fora do escopo de produto. O que vale para produto virou proposta:
  - **Ícones** (não coberto): acréscimo de knowledge com uma biblioteca só, estilo coerente com a tipografia e tamanhos da escala; regra C4 (mais de uma biblioteca de ícones nas capturas).
  - **Texto justificado ou centralizado longo** (parcial): regra L10.
  - **Cor e sublinhado reservados a link** (parcial): regra C5.
  - **Texto longo sem subtítulo** (parcial): regra L11, prioridade baixa em produto operacional.
  - **Duração de animação** (coberto no knowledge, sem verificação): `tools/lint-raw-values.mjs` passar a olhar ms fora dos tokens de movimento.
  - **Responsivo** (coberto no knowledge, sem verificação): capturar também em 375 px e rodar as regras de layout nas duas larguras.
- `data/gap-analysis/nielsen-and-laws.json` — as 10 heurísticas e 13 leis de UX. Heurísticas H2, H3, H4, H8 e H9 estão cobertas por regra; H1, H5, H6, H7 e H10 em parte (propostas: S4 carregamento sem indicador, T8 diálogo sem fechar visível, L12 destrutiva colada na primária). Leis: Hick, Fitts, Jakob, proximidade e semelhança cobertas; Miller, Tesler, Doherty, região comum, Von Restorff e estética-usabilidade em parte; pico-fim e Zeigarnik não estão no knowledge (proposta: acrescentar em [psicologia-e-leis.md](psicologia-e-leis.md); regra F6, jornada que não termina em sucesso; regra L14, cartão dentro de cartão; regra L13, mais de 7 ações de mesmo nível numa barra).

Ids propostos (L10–L14, C4, C5, S4, T8, F6) são reservas, não regras ativas: só entram em `rules_index` quando o detector existir.

## Checklist

- [ ] Rodei `tools/ux-lint/audit.mjs` com capturas, mapa e `UX.md`; nenhum pré-requisito ausente sem motivo.
- [ ] Toda dimensão de julgamento ou referência foi revisada com o knowledge indicado, e cada problema virou achado `origin: review` com regra ou id de revisão.
- [ ] Nenhum achado em "Sem dimensão".
- [ ] Lacunas da dimensão lidas antes de concluir que ela "passou".
- [ ] Regra nova entra na matriz (`rules_index` e dimensão) junto com o detector, e este documento é regenerado.
