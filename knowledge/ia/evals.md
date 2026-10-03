---
id: evals
area: ai
title: AI evals para produtos e experiências
evidence: contextual
related: [ux-para-agentes, generative-ui, rag-e-fontes, divida-de-experiencia]
---

# AI evals para produtos

> **Quando consultar**
> - Antes de lançar ou alterar qualquer recurso com IA (troca de modelo, prompt, ferramenta, base de conhecimento ou interface).
> - Ao escrever rubricas para julgar saídas abertas: textos, resumos, UI gerada por agente, DESIGN.md gerado.
> - Ao configurar um juiz-LLM, escolher métricas para RAG ou agentes, ou montar o scorecard de lançamento.
> - Quando alguém disser "testei e pareceu bom".

## 1. Definição

Eval é um teste **repetível** que verifica se um sistema com IA faz o que deveria, com qualidade suficiente para pessoas e contextos reais. Transforma expectativas, riscos e necessidades em critérios observáveis, comparáveis entre versões e acompanhados ao longo do tempo.

A unidade avaliada não é só o modelo: inclui prompt, contexto, recuperação, ferramentas, regras de negócio, interface, latência e custo. Um modelo pode ir bem em benchmark público e o produto falhar porque a busca trouxe o documento errado ou porque a pessoa não percebeu que precisava revisar.

Evals não substituem outros métodos:

| Método | Pergunta |
|---|---|
| Eval | O sistema se comporta conforme os critérios? |
| Teste de usabilidade | Como pessoas reais executam a tarefa e onde travam? |
| Analytics | O que acontece em escala? |
| Teste A/B | Uma alternativa causa resultado melhor? (só depois de ambas passarem nos mínimos) |

## 2. Quatro camadas

| Camada | Pergunta | O que medir |
|---|---|---|
| **Produto e experiência** | A IA ajuda a concluir a tarefa? | Sucesso da tarefa, retrabalho, compreensão, confiança calibrada, controle, recuperação |
| **Sistema** | O resultado é tecnicamente adequado? | Correção, factualidade, aterramento nas fontes, aderência à instrução, uso de ferramentas, latência, custo |
| **Risco** | Falhas inaceitáveis são evitadas? | Segurança, privacidade, vieses, vazamento, ações indevidas, recusas indevidas |
| **Operação** | A qualidade se mantém após mudanças? | Regressões, incidentes, traces de produção, novos casos |

**Regra:** métricas de risco não entram em média com as demais; funcionam como gate (seção 6).

## 3. Seis passos

1. **Comece pela tarefa, não pela métrica.** "Responder bem" é vago. "Identificar a política aplicável, explicar e mostrar a fonte" é avaliável. Em seguida, escreva a taxonomia de falhas: quais erros são toleráveis e quais nunca podem ocorrer.
2. **Monte um conjunto representativo.** Combine casos escritos por especialistas, situações reais de produção, casos de borda, entradas adversariais e, para ampliar cobertura, casos sintéticos. Algumas dezenas de casos realistas já revelam mudanças de comportamento num sistema novo; produtos maduros precisam de conjuntos maiores e vivos.
3. **Escreva rubricas antes de comparar versões.** Um critério por linha (factualidade, cobertura, relevância, clareza). Nota única "qualidade 8/10" não diz o que consertar.
4. **Case avaliador com critério.** Ver seção 4.
5. **Rode múltiplas tentativas.** Sistemas generativos variam. Distinga "passou em pelo menos uma de N" de "passou em todas as N"; quando consistência faz parte da qualidade, a segunda é a que importa.
6. **Converta falhas reais em regressão.** Observar a falha → entender a causa → criar o caso → corrigir → rodar a suíte → impedir que volte.

## 4. Tipos de avaliador

| Avaliador | Quando usar | Exemplos |
|---|---|---|
| **Código** | Condição verificável deterministicamente | Correspondência exata, regex, validação de schema, estado final de ferramenta, contraste ≥ 4.5:1, ausência de valor cru fora de token |
| **LLM-juiz** | Critério semântico aberto, em escala | Relevância, completude, aderência à instrução, comparação par a par |
| **Humano** | Julgamento de domínio, contexto, segurança | Adequação ao domínio, utilidade percebida, revisão de casos críticos, calibração do juiz |

**SE** um critério pode ser checado por código **ENTÃO** não use LLM-juiz para ele. Sistema maduro combina os três: automatizar tudo esconde vieses do avaliador; avaliar tudo à mão torna o ciclo lento.

## 5. Métricas por tipo de sistema

### RAG
Decomponha; avaliar só a resposta final esconde onde está o defeito.
- **Recuperação:** as fontes relevantes foram encontradas? (precisão e cobertura do contexto, fonte esperada presente)
- **Suficiência:** o contexto recuperado basta para responder?
- **Aterramento/fidelidade:** cada afirmação está apoiada no contexto?
- **Citação:** a fonte citada sustenta de fato a afirmação a que está ligada? Separe "citou certo" de "respondeu fiel".
- **Tarefa:** a resposta atende à necessidade?

Isso evita corrigir o prompt quando o problema é a busca, ou trocar o modelo quando o problema é a base. Detalhes de UX: `rag-e-fontes.md`.

### Agentes
Avalie **trajetória e resultado**:
- verificação determinística do estado final;
- ferramentas certas, com parâmetros certos;
- ações proibidas (qualquer ocorrência reprova);
- resultado julgado por rubrica;
- análise de traces;
- repetição da mesma tarefa para medir consistência.

Não exija trajetória rígida demais: caminhos diferentes podem chegar ao mesmo resultado válido. Mas um agente que acerta por um caminho perigoso ou caro precisa reprovar.

### Experiência e operação
Sucesso da tarefa, tempo até sucesso, abandono, correções; latência p50/p95; **custo por tarefa bem-sucedida** (mais informativo que custo por chamada).

## 6. Scorecard: gates, limiares, metas, guardrails

Nunca calcule média de métricas de naturezas diferentes. Um sistema com qualidade 92, experiência 90 e segurança 40 não é "nota 74"; é um sistema que não pode ser lançado.

| Tipo | Função | Exemplo | Se falhar |
|---|---|---|---|
| **Gate** | Bloqueia lançamento | Zero ações críticas inseguras no conjunto de release; zero vazamento de dado de outro usuário | Não lança |
| **Limiar** | Mínimo aceitável | Sucesso da tarefa ≥ valor definido pelo produto | Revisar antes de seguir |
| **Meta de otimização** | Melhoria contínua | Reduzir custo por tarefa bem-sucedida | Comparar alternativas |
| **Guardrail** | Impedir piora colateral | Abandono e retrabalho não aumentam | Bloquear ganho local que piora a experiência |

Não existe limiar universal: os números saem do produto, do risco e do contexto. Registre no scorecard quem definiu cada número e por quê.

## 7. Rubricas e juiz-LLM

### Regras de desenho de rubrica
1. **Um critério por linha.** Nunca "claro e correto" no mesmo item.
2. **Escala ordinal curta** (0–3 ou 1–4) com **âncora descritiva** para cada ponto.
3. **Exemplos de aprovado e reprovado** para cada critério.
4. **Separe gate binário de nota.** O que é inaceitável é sim/não e não se compensa.
5. **Exija evidência por nota:** o avaliador cita o trecho ou elemento que justifica.
6. **Escreva a rubrica antes de ver as saídas** da versão nova.
7. **Versione** a rubrica; mudança de rubrica invalida comparação direta com rodadas antigas.

### Calibração do juiz-LLM
Juízes têm vieses conhecidos: preferência por posição, por respostas longas e por certos estilos.
- Monte um conjunto rotulado por pessoas (com especialistas de domínio quando couber).
- Meça a concordância entre juiz e rótulos humanos **por critério**, não só no total.
- Investigue cada divergência; ajuste a rubrica ou o prompt do juiz.
- Em comparação par a par, alterne a ordem das respostas e descarte julgamentos que mudam com a ordem.
- Peça critérios específicos, nunca "dê uma nota".
- Recalibre quando trocar o modelo juiz, a rubrica ou o domínio.
- **SE** a concordância de um critério ficar baixa **ENTÃO** esse critério volta para avaliação humana.

## 8. Exemplo: rubrica para "UI gerada por agente"

```yaml
rubric: generated-ui-by-agent
version: 1.0
scope: "Saídas de composição de interface por agente (generative UI nível 1-2) e telas geradas a partir do DESIGN.md"
evaluator-inputs: [user-request, declarative-spec, render-light, render-dark, accessibility-tree, catalog, design-md]

gates:   # binários; qualquer falha reprova a saída inteira
  - id: G1-catalog
    criterion: "Usa apenas componentes do catálogo e nenhuma combinação marcada como inválida"
    evaluator: code   # validação de schema
  - id: G2-tokens
    criterion: "Nenhum valor visual cru (cor, espaçamento, raio, fonte) fora dos tokens"
    evaluator: code   # lint de valores crus
  - id: G3-contrast
    criterion: "Pares texto/fundo >= 4.5:1 (texto normal) e >= 3:1 (texto grande e componentes), em light e dark"
    evaluator: code
  - id: G4-invariants
    criterion: "Navegação, avisos legais, rótulo de IA e controles de cancelar/desfazer presentes e inalterados"
    evaluator: code
  - id: G5-critical-action
    criterion: "Toda ação de risco alto ou crítico passa pela confirmação fixa (ação, alvo, consequência)"
    evaluator: code + sampled_human
  - id: G6-keyboard
    criterion: "Todos os controles alcançáveis por teclado, com foco visível e nome acessível"
    evaluator: code   # varredura automatizada + árvore de acessibilidade

criteria:   # escala 0-3, com evidência obrigatória
  - id: C1-format-fit
    question: "O tipo de componente escolhido é o certo para a tarefa pedida?"
    evaluator: llm_judge
    anchors:
      0: "Formato atrapalha (ex.: parágrafo para comparar 5 itens)"
      1: "Formato funciona, mas exige esforço evitável"
      2: "Formato adequado, com pequenos excessos ou faltas"
      3: "Formato é o mais direto para a tarefa"
    pass-example: "Pedido de comparação de 4 planos vira tabela-comparativa com destaque de melhor valor"
    fail-example: "Mesmo pedido vira 4 cards soltos sem atributos alinhados"
  - id: C2-completeness
    question: "Toda informação necessária para decidir ou agir está presente, sem inventar dados?"
    evaluator: llm_judge
    anchors:
      0: "Falta dado essencial ou há dado inventado"
      1: "Falta dado relevante"
      2: "Completo, com detalhe secundário ausente"
      3: "Completo e só com o necessário"
  - id: C3-hierarchy
    question: "A ordem visual e de leitura prioriza o que a pessoa precisa primeiro?"
    evaluator: llm_judge
    anchors:
      0: "Ação principal ou informação-chave escondida"
      1: "Prioridade confusa"
      2: "Clara, com um elemento competindo"
      3: "Hierarquia inequívoca"
  - id: C4-states
    question: "Estados de carregando, vazio, erro e parcial estão previstos para os dados envolvidos?"
    evaluator: code + llm_judge
    anchors:
      0: "Nenhum estado alternativo"
      1: "Só carregando"
      2: "Falta um estado relevante"
      3: "Todos os estados pertinentes"
  - id: C5-microcopy
    question: "Rótulos e mensagens são claros, consistentes com o glossário e sem ambiguidade?"
    evaluator: llm_judge
    anchors:
      0: "Termos contraditórios ou ação ambígua"
      1: "Vários rótulos vagos"
      2: "Um rótulo melhorável"
      3: "Texto claro e consistente"
  - id: C6-consistency-across-runs
    question: "Pedidos equivalentes (5 execuções) geram composições reconhecivelmente iguais?"
    evaluator: code   # similaridade estrutural entre specs
    anchors:
      0: "Componentes diferentes a cada execução"
      1: "Mesmo componente, ordem e agrupamento instáveis"
      2: "Variação só em detalhe"
      3: "Estrutura estável"
  - id: C7-task
    question: "Uma pessoa representativa conclui a tarefa com essa saída?"
    evaluator: human   # amostra de sessões
    anchors:
      0: "Não conclui"
      1: "Conclui com ajuda"
      2: "Conclui com hesitação"
      3: "Conclui direto"

decision-rules:
  output-passes: "todos os gates passam E nenhum critério com nota 0 E media(C1..C6) >= 2.0"
  runs-per-case: 5
  consistency: "caso aprovado somente se as 5 execuções forem aprovadas"
  evidence: "cada nota cita o elemento (id da spec ou trecho) que a justifica"
  judge-calibration: "recalibrar contra rótulos humanos a cada mudança de rubrica, modelo juiz ou catálogo"
  thresholds: "valores acima são de exemplo; o produto define e registra os seus"
```

## 9. Armadilhas

- Usar benchmark público como teste de aceitação do produto.
- Concluir a partir de uma única resposta.
- Média de métricas incompatíveis.
- Juiz-LLM sem calibração humana.
- Conjunto de teste congelado após o lançamento.
- Medir adoção (mais sessões, mais prompts) como se fosse valor entregue.

## 10. Quem define o quê

| Papel | Contribuição |
|---|---|
| Produto | Objetivo, trade-offs, critérios de lançamento |
| Pesquisa de UX | Necessidades, rubricas, validação qualitativa |
| Design | Interação, controle, feedback, recuperação |
| Engenharia | Infraestrutura de avaliação, instrumentação, traces |
| Especialistas de domínio | Respostas de referência e critérios profissionais |
| Segurança, privacidade, governança | Gates de risco, políticas, modelagem de ameaças |

"Boa resposta" não é propriedade só linguística: depende da intenção, do momento, da consequência do erro e do que a pessoa precisa fazer depois. Por isso UX participa da definição dos evals.

## 11. Checklist

- [ ] A tarefa e a taxonomia de falhas estão escritas antes das métricas.
- [ ] O conjunto mistura especialistas, produção, borda e adversarial.
- [ ] Cada critério tem um avaliador adequado (código > juiz > humano conforme o caso).
- [ ] Rubricas têm um critério por linha, âncoras, exemplos e exigência de evidência.
- [ ] Juiz-LLM calibrado contra rótulos humanos, por critério.
- [ ] Execuções múltiplas por caso quando consistência importa.
- [ ] Scorecard separa gates, limiares, metas e guardrails; sem médias de risco.
- [ ] RAG e agentes avaliados por partes (recuperação/geração/citação; trajetória/estado final).
- [ ] Falhas de produção viram casos de regressão de forma rotineira.
