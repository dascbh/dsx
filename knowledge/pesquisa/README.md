# Pesquisa: UX research e product discovery

Base de conhecimento para agentes que planejam pesquisa, avaliam experiências, medem usabilidade e apoiam decisões de produto. Os arquivos são escritos para consulta direta: regras imperativas, árvores SE → ENTÃO, fórmulas com exemplo resolvido e limites explícitos do que um agente consegue fazer sozinho.

## Quando consultar

- Alguém pede para "pesquisar", "validar", "testar com usuário" ou "descobrir o que construir".
- O pedido chega como solução pronta ("faz um dashboard", "coloca IA") e falta o problema.
- É preciso escolher método, calcular amostra, pontuar SUS, dimensionar um A/B ou estimar ROI.
- É preciso transformar notas brutas em achados, ou achados em recomendação para stakeholders.
- Alguém propõe usar usuários sintéticos (LLM) no lugar de pessoas.

## Doutrina (vale para todos os arquivos)

1. **Decisão antes de método.** Escreva primeiro qual decisão muda conforme o resultado. Sem decisão, não há pesquisa a planejar; há um problema de clareza.
2. **Usuário sintético gera hipótese, nunca evidência.** Toda saída de LLM que simule pessoas (respostas, reações, personas, notas SUS, "sessões") recebe o rótulo `HIPÓTESE — não validada com pessoas`.
3. **Nunca fabrique.** Não invente citações, IDs de sessão, percentuais, baselines, custos ou resultados de teste. Se o dado não foi fornecido, peça ou marque `<dado ausente>`.
4. **Rastreabilidade obrigatória.** Todo achado aponta para a fonte bruta (sessão, timestamp, evento, ticket, período). Achado sem fonte é opinião.
5. **Critério antes do dado.** Métricas, limiares de sucesso e regras de decisão são definidos antes da coleta.
6. **Escopo declarado.** Diga "3 de 7 participantes do segmento X, no protótipo v2", nunca "os usuários".
7. **Na dúvida, "Investigar".** Prefira classificar como Investigar a recomendar com certeza que o dado não sustenta.

## Arquivos

| Arquivo | Carregue quando |
|---|---|
| [metodos.md](metodos.md) | Escolher método; diferenciar gerativa/avaliativa e quali/quanti; entrevistas, card sorting, tree testing, benchmarking, analytics, heatmaps e session replay |
| [discovery-e-estrategia.md](discovery-e-estrategia.md) | Enquadrar problema, escrever jobs, montar Opportunity Solution Tree, mapear suposições, fake door, teste de conceito, MVP, estratégia de produto, PLG |
| [testes-de-usabilidade.md](testes-de-usabilidade.md) | Planejar, roteirizar, moderar ou analisar teste de usabilidade; definir amostra; classificar severidade |
| [metricas-e-roi.md](metricas-e-roi.md) | Calcular SUS, montar HEART, métricas de tarefa, dimensionar e analisar A/B, ROI/payback, matemática de funil (CRO) |
| [sintese-e-comunicacao.md](sintese-e-comunicacao.md) | Sintetizar dados, triangular, escrever achados rastreáveis, apresentar a stakeholders, organizar repositório/ResearchOps |
| [etica-e-inclusao.md](etica-e-inclusao.md) | Consentimento, LGPD, retenção, compensação, recrutamento inclusivo, acessibilidade do estudo |
| [personas-jornadas-blueprint.md](personas-jornadas-blueprint.md) | Personas baseadas em evidência, mapa de empatia, mapa de jornada, service blueprint |

Templates para preencher ficam em `templates/`: `plano-de-pesquisa.md`, `roteiro-entrevista.md`, `roteiro-teste-usabilidade.md`, `relatorio-de-achados.md`, `persona.md`, `jtbd.md`, `opportunity-solution-tree.md`, `assumption-map.md`.

## Cadeia de raciocínio padrão

```
decisão → incerteza → pergunta de pesquisa → tipo de evidência → método → amostra
→ coleta (com rastreabilidade) → análise → achado → recomendação → decisão registrada
```

Camadas de evidência, que nunca devem ser misturadas no mesmo parágrafo: **observação bruta** (o que foi dito/feito, com fonte) → **padrão** (repetição entre participantes) → **achado** (leitura sustentada pelo padrão) → **insight** (por que importa) → **recomendação** (direção a explorar) → **hipótese** (o que deve mudar se aplicada).

## Mapa de métodos

Use a tabela como ponto de partida, não como regra. As amostras são referências de prática comuns; ajuste ao risco da decisão, à heterogeneidade do público e ao número de segmentos.

| Pergunta de pesquisa | Método | Amostra de referência | Duração típica | O que um agente pode fazer |
|---|---|---|---|---|
| Quem tem o problema e em que contexto? | Entrevista semiestruturada, estudo de campo, diário | 5–8 por segmento, até parar de surgir tema novo | 45–60 min por sessão; diário 1–3 semanas | Redigir guia, revisar viés das perguntas, transcrever, codificar rascunho para revisão humana |
| Como as pessoas resolvem isso hoje? | Entrevista sobre o último episódio concreto, inquérito contextual, análise de suporte | 5–8 por segmento | 45–90 min | Montar linha do tempo do episódio, extrair alternativas citadas em transcrições reais |
| Por que alguém "contrata" uma solução? | Entrevista JTBD (linha do tempo da decisão) | Pessoas que decidiram recentemente; rodadas de 5–10 | 45–60 min | Roteiro de linha do tempo; candidatos a job extraídos de transcrições reais, marcados para revisão |
| Esta ideia é entendida e relevante? | Teste de conceito | 5–10 por segmento | 30–45 min | Redigir estímulo neutro e roteiro; checar perguntas indutoras |
| Há interesse demonstrado em ação? | Fake door | Definida por tráfego e limiar fixado antes | Dias a poucas semanas | Copy honesta de saída, eventos, limiares, cálculo de taxa; nunca lançar sem aprovação humana |
| As pessoas conseguem usar a interface? | Teste de usabilidade moderado | ~5 por rodada em público homogêneo; 3–4 por segmento | 30–60 min | Tarefas em cenário, roteiro, métricas, rascunho de severidade |
| Quanto/quão rápido conseguem, em escala? | Usabilidade não moderada, benchmark | ~20+ para estimar taxas; calcular para precisão | 15–30 min por sessão | Validar ambiguidade das tarefas, filtrar sessões por regra prévia, calcular IC |
| Como agrupam o conteúdo? | Card sorting aberto | ~15 quali; 30–50 quanti | 20–40 min | Matriz de similaridade e clusters a partir de dados reais |
| Encontram as coisas nesta hierarquia? | Tree testing | Piloto quali pequeno, depois quanti planejado; menos de 10 tarefas | 10–20 min | Detectar rótulos repetidos nas tarefas, calcular sucesso direto/indireto |
| Onde o fluxo vaza? | Analytics de funil, heatmap, session replay | Todo o tráfego elegível, segmentado | Contínuo | Ler funil, calcular taxas por etapa, triagem de sessões para revisão humana |
| Com que frequência isso acontece? | Survey bem amostrado, analytics | Calcular pela margem de erro desejada | 1–3 semanas de coleta | Redigir questionário, checar viés, calcular margem de erro |
| A mudança causou o efeito? | Teste A/B | Calcular por taxa-base, MDE, α e poder | Ciclos completos de comportamento (mín. 1 semana) | Hipótese, cálculo de amostra, checagem de SRM, análise com IC |
| Qual a percepção geral de usabilidade? | SUS / UMUX-Lite após uso | Sem número universal; amostra pequena = linha de base exploratória | 2–3 min de aplicação | Pontuar, mostrar distribuição, comparar com baseline do próprio produto |
| Onde a experiência atual tem atrito? | Auditoria de UX (heurística + dados) | n/a (inspeção) | Dias | Inspeção heurística, varredura WCAG parcial, consolidação de duplicados; tudo como hipótese |

## O que um agente pode / não pode fazer

> **Pode:** estruturar planos, roteiros, tarefas e questionários; calcular SUS, taxas, intervalos, tamanho de amostra e ROI; transcrever e organizar notas; propor agrupamentos preliminares; montar matrizes de evidência; revisar viés de perguntas; adaptar relatórios por público; gerar hipóteses e casos de teste (inclusive com usuários sintéticos, rotulados como hipótese).
>
> **Não pode:** produzir evidência sobre pessoas sem pessoas; inventar citações, números ou resultados; decidir recrutamento, base legal ou questões éticas sozinho; afirmar causalidade sem desenho adequado; declarar vencedor de teste sem critério prévio; executar experimento com usuários reais sem aprovação humana; substituir a leitura do material bruto por um resumo automático.
