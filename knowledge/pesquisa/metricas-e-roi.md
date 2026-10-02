# Métricas de UX, experimentos e ROI

## Quando consultar

- Ao aplicar ou pontuar SUS, ou ao comparar notas de usabilidade.
- Ao montar um conjunto de métricas para um produto ou feature (HEART).
- Ao calcular taxas de sucesso, tempo e erro, com intervalos honestos para amostras pequenas.
- Ao planejar ou analisar um teste A/B: tamanho de amostra, MDE, duração, peeking, SRM, A/A.
- Ao estimar ROI ou payback de uma melhoria de UX, ou ler um funil de conversão.

## 1. Métricas: camadas e funções

| Camada | Exemplos |
|---|---|
| Sinal de experiência | facilidade percebida, satisfação, confiança relatada |
| Comportamento na tarefa | sucesso, erros, abandono, tempo, adoção de feature |
| Resultado de produto/negócio | ativação, retenção, conversão, contatos de suporte |
| Guardrail | erros críticos, reclamações, cancelamentos, acessibilidade |

Cada métrica cumpre uma **função** que depende da pergunta: **diagnóstica** (onde falha), **de resultado** (o efeito pretendido, geralmente lagging) ou **guardrail** (o efeito indesejado que não pode piorar).

Regras:

- **SE** a métrica mudar e o time não souber o que investigar ou decidir **ENTÃO** ela não serve; descarte.
- Menos tempo é bom numa compra e pode ser ruim numa leitura. Mais cliques pode significar utilidade, dificuldade ou etapa extra. Interprete no contexto.
- "O indicador mudou" ≠ "mudou junto com a versão nova" ≠ "a versão nova causou". Só a terceira afirmação sustenta atribuição, e ela exige desenho experimental.

## 2. HEART (Google)

Estrutura de pensamento, não painel obrigatório. Para cada dimensão relevante, siga **Goals → Signals → Metrics**.

| Dimensão | Goal (exemplo) | Signal | Metric |
|---|---|---|---|
| Happiness | Pessoas se sentem seguras ao pagar | Resposta a pergunta pós-tarefa | Média SEQ no passo de pagamento |
| Engagement | Uso intencional do relatório | Abertura do relatório | Usuários que abrem ≥ 1×/semana ÷ ativos |
| Adoption | Novos descobrem a exportação | Primeira exportação | Novos que exportam em 14 dias ÷ novos elegíveis |
| Retention | Contas continuam usando | Retorno após 30 dias | Retenção de coorte no dia 30 |
| Task success | Concluir cadastro sem ajuda | Conclusão e erros | Taxa de conclusão; erros por sessão |

Escolha 2–3 dimensões ligadas à decisão em curso. Para ferramentas de trabalho, considere dimensões de carga cognitiva, aprendizado e eficiência.

## 3. Métricas de tarefa

```
taxa de conclusão = tarefas concluídas / tarefas tentadas × 100
taxa de erro      = erros observados / oportunidades de erro
tempo na tarefa   = reporte mediana (ou média geométrica) só das tentativas bem-sucedidas, junto com a taxa de sucesso
variação absoluta = novo − anterior  (em pontos percentuais)
variação relativa = (novo − anterior) / anterior × 100
```

**Amostra pequena exige intervalo.** Para taxas de conclusão com n pequeno, use o intervalo de Wald ajustado (95%):

```
p_aj = (x + 1,92) / (n + 3,84)
IC   = p_aj ± 1,96 × √( p_aj × (1 − p_aj) / (n + 3,84) )
```

Exemplo: 4 de 5 concluíram. `p_aj = 5,92 / 8,84 ≈ 0,67`. Erro padrão `√(0,67 × 0,33 / 8,84) ≈ 0,158`. IC ≈ `0,67 ± 0,31` → **de 36% a 98%**. Conclusão honesta: "4 de 5 concluíram; a taxa real pode estar entre cerca de um terço e quase todos". Não escreva "80% de sucesso".

SEQ (Single Ease Question): uma pergunta após cada tarefa, escala de 7 pontos, de "muito difícil" a "muito fácil". Barata e boa para comparar tarefas.

## 4. SUS (System Usability Scale, John Brooke)

Dez afirmações, resposta de 1 (discordo totalmente) a 5 (concordo totalmente), aplicadas **depois** que a pessoa usou o sistema. Itens ímpares são positivos, pares são negativos:

1. Eu gostaria de usar este sistema com frequência.
2. Achei o sistema desnecessariamente complexo.
3. Achei o sistema fácil de usar.
4. Acho que precisaria de apoio técnico para conseguir usar o sistema.
5. As funções deste sistema estão bem integradas.
6. Achei o sistema inconsistente demais.
7. Imagino que a maioria das pessoas aprenderia a usar este sistema rapidamente.
8. Achei o sistema muito trabalhoso de usar.
9. Eu me senti confiante usando o sistema.
10. Precisei aprender muitas coisas antes de conseguir usar o sistema.

Pontuação:

```
ímpares (1,3,5,7,9):  contribuição = resposta − 1
pares   (2,4,6,8,10): contribuição = 5 − resposta
SUS = (soma das 10 contribuições) × 2,5      → escala 0–100
nota do estudo = média dos participantes (mostre a distribuição também)
```

Exemplo resolvido. Respostas de um participante: `3, 3, 4, 2, 3, 3, 4, 2, 4, 2`.

- Ímpares: (3−1) + (4−1) + (3−1) + (4−1) + (4−1) = 2 + 3 + 2 + 3 + 3 = **13**
- Pares: (5−3) + (5−2) + (5−3) + (5−2) + (5−2) = 2 + 3 + 2 + 3 + 3 = **13**
- Soma 26 × 2,5 = **65**

Se cinco participantes obtiveram 65, 72,5, 85, 57,5 e 70, a média é `350 / 5 = 70`, com amplitude de 57,5 a 85. Relate média, n e distribuição.

Interpretação (referência, não lei): a média frequentemente citada em grandes bases é cerca de **68**. Abaixo de 50 indica problemas sérios; 70 a 80 é bom; acima de 80 é muito bom. Compare principalmente com a **linha de base do próprio produto**, no mesmo contexto.

Regras:

- SUS não é percentual: 80 não significa "80% usável".
- SUS mede percepção global; não diz onde nem por quê. Combine com sucesso, tempo, erros e observação.
- Não altere a redação sem documentar e pilotar; isso quebra a comparabilidade.
- Não compare estudos com públicos, tarefas, dispositivos ou versões diferentes.
- Erro comum: somar as respostas cruas sem inverter os itens pares.
- Com amostra pequena e sem histórico, trate o primeiro resultado como baseline exploratória.
- Alternativa curta: UMUX-Lite (dois itens).

## 5. Teste A/B: o essencial

Experimento em que usuários são sorteados entre controle e variante para verificar se **uma mudança específica** altera uma métrica. Não serve para descobrir o problema nem para escolher o design mais bonito.

Hipótese: `Acreditamos que mudar <elemento> de <atual> para <variante> vai aumentar <métrica> entre <público> porque <evidência ou mecanismo>.`

**Antes de lançar, fixe:** métrica primária, guardrails, MDE, tamanho de amostra, duração, regra de decisão e segmentos que serão analisados.

### Tamanho de amostra (regra de bolso)

Para comparar duas proporções com α = 0,05 bilateral e poder de 80% (aproximação de Lehr):

```
n por grupo ≈ 16 × p × (1 − p) / δ²
p = taxa-base   δ = diferença absoluta mínima que vale detectar (MDE absoluto)
```

Exemplos:

- Taxa-base 10%, MDE de 1 ponto percentual (10% → 11%): `16 × 0,09 / 0,0001 = 14.400` por grupo.
- Mesma base, MDE relativo de 5% (10% → 10,5%, δ = 0,005): `16 × 0,09 / 0,000025 = 57.600` por grupo.

Reduzir o MDE pela metade multiplica a amostra por quatro. Use calculadora estatística para o número final; a regra serve para checar viabilidade.

**MDE** é a menor mudança que justificaria implementar. Pergunte ao time "qual o menor ganho que valeria o custo?" antes de olhar qualquer dado.

Duração: `dias ≈ (n por grupo × número de grupos) / tráfego elegível diário`, arredondada para cobrir ciclos completos (no mínimo uma semana inteira, para incluir dias úteis e fim de semana).

- **SE** a duração calculada passa de algumas semanas **ENTÃO** o teste é inviável para esse MDE; aumente o MDE, mude a métrica para uma mais frequente, ou use outro método (pesquisa, rollout monitorado).

### Peeking

Olhar o resultado repetidamente e parar quando "ficou significativo" infla muito a taxa de falsos positivos. Regras:

- Rode até o n planejado, depois analise uma vez.
- Se for preciso monitorar durante, use método sequencial próprio para isso, definido antes.
- Olhar guardrails durante o teste para interromper por dano é permitido e recomendado.

### SRM (sample ratio mismatch)

Antes de comparar taxas, verifique se a divisão observada bate com a planejada. Teste qui-quadrado:

```
χ² = Σ (observado − esperado)² / esperado
```

Exemplo: divisão planejada 50/50; observados 50.000 no controle e 48.500 na variante. Total 98.500, esperado 49.250 por grupo. `χ² = 750²/49.250 + 750²/49.250 ≈ 22,8`. Com 1 grau de liberdade, isso corresponde a p < 0,001. **Há SRM: não analise o resultado**; investigue a atribuição, redirecionamentos, bots ou falhas de evento.

### Teste A/A

Rode duas versões idênticas antes de experimentos importantes. Serve para validar instrumentação, atribuição e a taxa de falsos positivos da plataforma. Diferenças "significativas" frequentes num A/A indicam problema no sistema de experimentação.

### Leitura do resultado

Reporte sempre: diferença absoluta e relativa, intervalo de confiança, n por grupo, duração, guardrails, custo e reversibilidade.

| Resultado | Ação |
|---|---|
| Variante melhor e acima do MDE | Implementar e monitorar |
| Controle melhor | Manter; investigar o mecanismo |
| Inconclusivo | Manter controle. "Sem diferença" significa sensibilidade insuficiente, não equivalência |
| Primária sobe, guardrail piora | Avaliar trade-off explicitamente |
| Segmentos divergem | Só considerar se o segmento foi planejado e tem amostra |

Significância estatística ≠ importância prática. Analisar muitos segmentos depois do teste produz achados por acaso. Não teste várias mudanças juntas se quiser saber qual funcionou. Experimentos não justificam dark patterns: ganho de curto prazo que corrói confiança é perda.

## 6. ROI de UX

```
ROI (%)          = (benefício − investimento) / investimento × 100
payback (meses)  = investimento / benefício mensal
economia suporte = chamados evitados × custo por chamado
produtividade    = horas economizadas × custo-hora   (só se o tempo vira trabalho útil)
receita incremental = conversões adicionais × margem de contribuição  (não receita bruta)
exposição de um problema = ocorrências × custo da consequência
```

Exemplo resolvido (números ilustrativos):

- Chamados sobre um fluxo: 2.400/mês → 1.800/mês depois da mudança = 600 evitados.
- Custo por chamado: R$ 20 → benefício mensal R$ 12.000 → anual R$ 144.000.
- Investimento completo (pesquisa, design, desenvolvimento, QA, implantação): R$ 60.000.
- ROI em 12 meses = (144.000 − 60.000) / 60.000 × 100 = **140%**.
- Payback = 60.000 / 12.000 = **5 meses**.

Passo a passo: baseline → métrica de UX que representa a mudança → KPI de negócio conectado → conversão em dinheiro → investimento **completo** → cálculo com premissas documentadas (período, fontes, método).

Regras:

- Separe **exposição** (valor ligado ao problema), **benefício esperado** (parte que a intervenção pode recuperar) e **benefício realizado** (medido depois). Misturar infla projeções.
- Sem causalidade forte, apresente cenários conservador, base e otimista.
- Custo evitado (suporte, retrabalho, erro) costuma ser mais defensável do que receita.
- Hierarquia de evidência para atribuir benefício: inspeção (potencial) < sinal comportamental < evidência de usuário (mecanismo) < experimento (atribuição).
- Evite falsa precisão ("R$ 283.749") e números universais do tipo "cada real em UX retorna X".
- Acessibilidade, segurança, privacidade e risco de dano podem justificar correção sem ROI.

## 7. Matemática de funil (CRO)

```
taxa de conversão = conversões / oportunidades × 100     (defina o denominador com precisão)
conversão global  = produto das taxas de cada etapa
```

Exemplo ilustrativo: 10.000 visitas → 30% iniciam cadastro (3.000) → 60% concluem o formulário (1.800) → 50% pagam (900). Global = 0,30 × 0,60 × 0,50 = **9%**.

Se a etapa do formulário sobe de 60% para 70%: 3.000 × 0,70 = 2.100 → 1.050 pagam → global **10,5%** (+1,5 p.p.; +16,7% relativo). Cada transição tem causa provável diferente (interesse, atrito de formulário, erro técnico, público errado). O analytics diz **onde**; a pesquisa diz **por quê**.

Regras:

- Confirme a instrumentação antes (eventos duplicados, tags ausentes, consentimento).
- Toda métrica primária tem guardrail: envios de formulário ↔ qualidade do lead; cadastros ↔ ativação; compras ↔ devoluções e cancelamentos; adoção ↔ sucesso na tarefa.
- Microconversão só importa se correlaciona com o resultado final.
- **SE** o tráfego não sustenta o MDE desejado **ENTÃO** não faça A/B de mudanças cosméticas; use pesquisa, heurística, replays e rollout monitorado.
- **SE** é bug evidente ou falha de acessibilidade **ENTÃO** corrija direto e monitore; não precisa de experimento.
- Documente também os testes perdedores.

## O que um agente pode / não pode fazer

> **Pode:** calcular SUS, médias, distribuições, intervalos de confiança, tamanho de amostra, duração, χ² de SRM, ROI, payback e funis a partir de dados fornecidos; propor árvore de métricas e guardrails; auditar planos de experimento (peeking, métricas pós-hoc, segmentos não planejados); montar cenários com premissas explícitas.
>
> **Não pode:** gerar respostas SUS, resultados de A/B ou baselines simulados; inventar custo por chamado, taxa-base ou tráfego (peça os dados); declarar vencedor sem critério fixado antes; afirmar causalidade sem desenho adequado; implantar variante sem aprovação humana.
