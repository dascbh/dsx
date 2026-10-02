---
id: pesquisa-com-ia
area: ia
titulo: IA na pesquisa de UX — síntese rastreável e personas sintéticas
evidencia: contextual
relacionados: [evidencia-e-fontes, divida-de-experiencia, evals]
---

# IA na pesquisa de UX

> **Quando consultar**
> - Ao usar IA para transcrever, codificar, agrupar ou sintetizar entrevistas, testes, chamados ou feedback.
> - Quando alguém propuser personas sintéticas, "usuários simulados" ou "entrevistas com IA".
> - Ao revisar um relatório, persona ou mapa de empatia que tenha passado por IA.
> - Ao decidir se um achado pode fundamentar uma decisão de produto.
>
> **Doutrina:** saída de IA é **hipótese, nunca evidência**. Evidência é registro de pessoas reais em condições documentadas.

## 1. A pergunta que separa uso legítimo de abuso

Estamos usando a IA para **formular** o que precisamos investigar, ou para **alegar** que já investigamos? A primeira é preparação útil. A segunda é fabricação de evidência, mesmo sem intenção.

Toda saída que passa por IA mistura três operações; identifique onde cada uma começa:
1. **Organizar** dados reais (transcrever, agrupar, etiquetar).
2. **Inferir** a partir deles (padrões, temas, interpretações).
3. **Gerar** conteúdo novo (depoimentos, perfis, respostas simuladas).

Só a primeira preserva o estatuto de evidência, e ainda assim exige conferência. A segunda é interpretação a validar. A terceira é hipótese.

## 2. Síntese assistida com rastreabilidade

### Regra-chave
**De cada insight, deve ser possível chegar ao trecho exato da fonte** (participante, sessão, minuto ou linha). Insight sem trilha de volta não entra em relatório nem em decisão.

### Fluxo em quatro passos
1. **Preparar os dados.** Anonimize dado pessoal antes de enviar a qualquer ferramenta, conforme a política de privacidade e consentimento da organização. Corrija a transcrição em termos técnicos, jargões, sotaques e gírias: uma palavra errada inverte o sentido de uma crítica.
2. **Extrair em camadas, não resumir.** "Resuma o que os usuários disseram" produz texto pasteurizado que apaga as anomalias, que é onde costuma estar o achado relevante. Peça extração estruturada:

   ```text
   Analise apenas a transcrição fornecida. Para cada item, inclua o identificador
   do participante e o trecho literal que o sustenta. Extraia:
   1) dores declaradas explicitamente;
   2) necessidades não ditas, marcando-as como INTERPRETAÇÃO;
   3) contradições entre o que a pessoa diz e o que relata ter feito;
   4) falas de forte carga emocional;
   5) comentários isolados que fogem do padrão (não descarte por serem raros).
   Não estime frequência fora desta amostra. Se não houver base, escreva "sem evidência".
   ```
3. **Triangular.** Compare a saída com outra lente (outro modelo, outra pessoa codificando, outra fonte de dado: uso, chamados). Achado que só uma lente vê é frágil.
4. **Validar com humano.** Confronte com notas de observação: linguagem corporal, hesitação, contexto e ironia que a transcrição não carrega. Quem sintetiza ouve ao menos parte das gravações; ler só resumos é delegação prematura.

### Prompt de advogado do diabo
Depois de obter os achados, peça sempre a contraprova:

```text
Para cada achado acima, apresente o argumento mais forte contra ele usando
somente os dados fornecidos. Aponte trechos que o contradizem, participantes
que não o confirmam e explicações alternativas para o mesmo comportamento.
Não use conhecimento externo.
```

Achados que não sobrevivem ao contra-argumento voltam a ser hipótese.

### Riscos da síntese com IA
| Risco | Como aparece | Controle |
|---|---|---|
| Alucinação de padrão | Correlação inexistente; termo frequente vira "dor" ignorando ironia | Exigir trecho literal por achado; conferir amostra |
| Perda do porquê | Sentimento classificado sem a razão cultural ou de interface | Extrair contexto junto com a fala |
| Prompt preguiçoso | Óbvio genérico | Prompt de camadas + contradições |
| Delegação prematura | Equipe lê resumo, não ouve gente | Escuta mínima obrigatória das sessões |
| Supressão da anomalia | Modelo normaliza o que foge da média | Pedir explicitamente os casos isolados |

## 3. Personas sintéticas

### O que são
Perfis gerados ou operados por IA para simular perspectivas e respostas de um público. Variam muito: de "imagine uma gerente financeira" a agentes construídos a partir de entrevistas reais. A diferença decisiva é **de onde vem a informação e como o resultado foi validado**.

| Representação | Base | Uso adequado |
|---|---|---|
| Persona de pesquisa | Padrões em dados de pessoas reais | Comunicar necessidades dentro do alcance da pesquisa |
| Proto-persona | Suposições explícitas da equipe | Alinhar o que se acredita e o que falta investigar |
| Persona sintética | Perfil gerado/usado por IA | Explorar hipóteses, com origem e limite identificados |
| Usuário sintético interativo | Sistema que responde ou age como um perfil | Simulação cuja validade depende da tarefa e de avaliação própria |

Nome, foto e biografia detalhada não tornam um perfil mais verdadeiro.

### O que a pesquisa disponível sugere `[evidência: contextual]`
- Comparações de simulações com estudos reais encontraram respostas **genéricas e otimistas demais**, que omitem justamente a fricção que a pesquisa procura.
- Agentes construídos a partir de entrevistas longas com pessoas reais reproduziram respostas de questionário de forma razoavelmente consistente com as próprias pessoas. Isso é consistência em itens de questionário, **não** previsão de comportamento numa interface.
- Perfis só demográficos (idade, renda, profissão) funcionam pior que perfis com valores e padrões de comportamento; auditorias encontraram estereótipos em personas geradas, inclusive em narrativas aparentemente positivas.

### Usos permitidos
- **Exploração preparatória:** listar situações que a equipe não considerou (conexão ruim, informação incompleta, aprovação por terceiro, interrupção). Amplia a lista do que investigar; não diz o que é frequente.
- **Ensaio de pesquisa:** praticar o roteiro, achar termos ambíguos, treinar perguntas de aprofundamento. Termina obrigatoriamente em piloto com pessoas.
- **Hipóteses concorrentes:** diante de um abandono, gerar explicações alternativas e a evidência que diferenciaria cada uma. Muitas vezes nem precisa de persona; pedir hipóteses direto evita dar autoridade de "personagem" à saída.

### Usos proibidos
| Conclusão pretendida | Por que a simulação não serve | O que é necessário |
|---|---|---|
| "As pessoas precisam disto" | A necessidade pode ter vindo do próprio prompt | Relatos situados, alternativas atuais, consequências |
| "A navegação está fácil" | Desempenho de agente não estima desempenho humano | Observação de tarefa com o público |
| "Este segmento pagaria mais" | Declaração gerada não envolve orçamento nem escolha real | Investigação de valor e comportamento comercial |
| "É acessível" | Imitar um perfil não reproduz uso real de tecnologia assistiva | Avaliação de acessibilidade com pessoas com deficiência |
| "X% dos usuários..." | 100 perfis do mesmo modelo não são 100 pessoas independentes | Amostra real |
| Aprovar lançamento | Nenhuma das anteriores | Evidência direta proporcional ao risco |

Também proibido: calcular SUS ou outro questionário padronizado com respostas sintéticas e reportá-lo como resultado de pesquisa; apresentar personagens simulados como participantes recrutados; usar RAG sobre documentos internos e chamar a resposta gerada de evidência (o registro original é a evidência; a resposta é extração, interpretação ou hipótese).

### Regras de uso
1. **Declare a decisão e o limite.** Escreva o que a atividade entrega ("levantar perguntas sobre aprovação de pagamentos") e o que **não** pode decidir (lançamento, prevalência).
2. **Separe fato de suposição.** Cada dado fornecido ao modelo tem origem, data e contexto. Não complete o perfil com renda, hábitos ou opiniões inventadas.
3. **Peça hipóteses, lacunas e evidência necessária**, sem depoimentos nem frequências. Confira a classificação de origem que o modelo fizer: ele também erra a origem.
4. **Converta em plano verificável:** pergunta, público, método e **o que contrariaria** a hipótese.
5. **Registre o desfecho:** sustentada naquele contexto, contrariada ou inconclusiva, com vínculo aos registros.
6. **Evite circularidade:** se o prompt afirma que o usuário tem dificuldade com relatórios, a "persona" reclamando de relatórios só devolveu sua premissa.
7. **Rotule como simulação** cada trecho que possa circular isolado.

### Registro de hipótese (uma linha por hipótese)
```yaml
origem: "Simulação por IA — não é fala de participante"
hipotese: "Aprovar pelo celular ajuda em urgências fora do escritório"
base_disponivel: "Descrição da tarefa pela equipe; nenhuma observação"
lacuna: "Frequência, restrições e impacto desconhecidos"
pergunta: "Como foi a última aprovação urgente feita fora do escritório?"
como_investigar: "Entrevista sobre episódio recente + registros de uso"
o_que_contrariaria: "Atraso causado por conferência interna, mesmo com acesso móvel"
responsavel: "pesquisa"
estado: nao_investigada   # sustentada | contrariada | inconclusiva
```
Guarde à parte ferramenta, versão do modelo, data, instruções e fontes fornecidas, para auditoria.

## 4. Anti-padrões

- Relatório com insight sem trecho de origem.
- "A IA analisou 200 entrevistas e concluiu" sem conferência humana.
- Persona sintética com foto e biografia apresentada como resultado de pesquisa.
- Frequência de resposta sintética apresentada como percentual do público.
- Simular pessoas com deficiência no lugar de incluí-las.
- Usar falta de orçamento como justificativa para tratar simulação como evidência.
- Pesquisa desenhada só para confirmar o que a simulação sugeriu.

## 5. Checklist

- [ ] Dados anonimizados e transcrições corrigidas antes do processamento.
- [ ] Prompt de extração em camadas, com trecho literal por achado.
- [ ] Prompt de advogado do diabo aplicado; achados frágeis rebaixados.
- [ ] Triangulação com outra lente e validação contra notas de observação.
- [ ] Cada insight leva ao trecho de origem.
- [ ] Personas sintéticas restritas a exploração, ensaio e hipóteses, com limite declarado.
- [ ] Cada hipótese tem pergunta, método, critério de refutação e estado registrado.
- [ ] Nenhum número, depoimento ou métrica padronizada vindo de simulação aparece como dado de pessoas.
