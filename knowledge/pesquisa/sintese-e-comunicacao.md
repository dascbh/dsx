# Síntese e comunicação de pesquisa

## Quando consultar

- Depois da coleta, ao transformar notas, transcrições e gravações em achados.
- Ao combinar fontes diferentes (entrevistas, testes, analytics, suporte) e lidar com resultados que conflitam.
- Ao escrever relatório, apresentar a stakeholders ou montar material assíncrono.
- Ao organizar um repositório de pesquisa ou processos de ResearchOps.
- Quando alguém pedir "resume o que os usuários disseram" a um modelo de linguagem.

## 1. Princípio: a cadeia de evidência

```
observação bruta (com fonte) → padrão → achado → insight → recomendação → hipótese → validação
```

| Camada | Exemplo | Regra |
|---|---|---|
| Observação | P03, 14:22: "eu sempre ligo antes de aprovar, não confio no status" | Literal, com ID e timestamp |
| Padrão | 4 de 6 gestores confirmam por outro canal antes de aprovar | Contagem com denominador |
| Achado | O status exibido não é suficiente para gestores decidirem | Sustentado pelo padrão, com escopo |
| Insight | Confirmação humana funciona como garantia quando o risco é alto | Interpretação marcada como tal |
| Recomendação | Explorar exibição de quem aprovou e quando, no próprio status | Verbo de exploração, não "implementar já" |
| Hipótese | Se o status trouxer autoria e horário, contatos de confirmação caem | Testável |

Regras:

- **Todo achado aponta para observações brutas.** Sem link para a fonte, o achado não entra no relatório.
- Nunca misture camadas no mesmo enunciado. "Usuários odeiam o status" mistura padrão, interpretação e exagero.
- Preserve casos divergentes; não os apague para a narrativa ficar limpa.
- Uma citação isolada ilustra; não prova padrão.

## 2. Nuggets: a unidade rastreável

Um **nugget** é a menor unidade de evidência reutilizável: uma observação com fonte e metadados.

```
ID: N-<estudo>-<nº>
Observação: <fala literal ou comportamento observado>
Fonte: <participante pseudonimizado> · <sessão> · <timestamp ou evento>
Tipo: fala | comportamento | dado quantitativo | artefato
Contexto: <tarefa, tela, segmento, dispositivo>
Tags: <tema>, <etapa da jornada>, <componente>
```

Achados referenciam nuggets (`sustentado por N-12, N-17, N-31`). Recomendações referenciam achados. Assim qualquer pessoa sobe da decisão até a fala original.

## 3. Síntese por afinidade e análise temática

**Diagrama de afinidade** (rápido, colaborativo):

1. Extraia uma observação por nota, com ID da fonte.
2. Agrupe de baixo para cima por semelhança de significado, não por tela ou por pergunta do roteiro.
3. Nomeie cada grupo com uma frase que diga algo ("não sabem o que vem depois do envio"), não com um tópico ("pós-envio").
4. Agrupe os grupos em temas maiores.
5. Conte quantos participantes distintos sustentam cada grupo.
6. Procure as notas que não cabem: muitas vezes são o achado mais importante.

**Análise temática** (mais rigorosa):

1. Familiarização: leia ou ouça todo o material.
2. Codificação inicial: rótulos curtos em trechos relevantes.
3. Busca de temas: agrupe códigos.
4. Revisão: confira cada tema contra os dados; separe, junte ou descarte.
5. Definição e nome dos temas.
6. Redação, com trechos que exemplificam.

Para reduzir viés: dois codificadores no mesmo material e discussão das divergências; registro do livro de códigos; busca ativa de evidência contrária.

**Síntese assistida por IA.** Útil para transcrever, sugerir códigos e agrupar rascunhos. Riscos: encontrar padrão onde não há, ignorar a anomalia, perder ironia ou contexto, inventar fala plausível. Regras:

- Peça extração com IDs e trechos literais, nunca "resuma o que disseram".
- Confira cada citação e cada contagem contra a transcrição.
- Peça explicitamente contradições entre fala e comportamento e contra-argumentos aos temas.
- Revise a transcrição automática em trechos com jargão, sotaque ou termos técnicos.
- Pseudonimize antes de enviar material a qualquer ferramenta, e só use ferramentas com tratamento de dados verificado.

## 4. Triangulação

Combinação planejada de métodos, fontes, pesquisadores ou lentes teóricas sobre a mesma pergunta.

| Tipo | Exemplo |
|---|---|
| Metodológica | Entrevistas + teste + analytics |
| De fontes | Segmentos, canais, períodos, dispositivos diferentes |
| De pesquisadores | Dois codificam o mesmo material |
| Teórica | Lentes distintas, só se gerarem pergunta útil |

Analise cada fonte pela lógica do seu método (não transforme entrevistas em percentuais) e compare numa **matriz de evidências**:

| Fonte/método | Pergunta | Amostra/contexto | Achado | Força do sinal | Limitação | Relação |
|---|---|---|---|---|---|---|
| Analytics de funil | Onde abandonam? | Todo o tráfego, mês X | Queda forte no passo de pagamento | Alta (volume) | Não explica motivo | — |
| Entrevistas | Por quê? | 6 clientes recentes | Surpresa com frete no fim | Média | Relato | Complementa |
| Teste moderado | Conseguem concluir? | 5 novos clientes | 3 voltam ao carrinho para ver custo total | Média | Protótipo | Corrobora |

Quando fontes conflitam, antes de descartar alguma, verifique: a pergunta era a mesma? o segmento? tarefas, dispositivos e períodos são comparáveis? é comportamento, relato ou interpretação? há viés de recrutamento, moderação ou instrumentação? Às vezes as experiências são simplesmente diferentes. Relate o conflito.

Triangular não prova causa, e nem toda decisão precisa de quatro métodos.

## 5. Do achado à recomendação

Achado verificável diz quem, em que tarefa, em que contexto, e com que contagem. "4 de 5 abriram o menu errado ao procurar o histórico" é melhor do que "usuários não acham o histórico".

Recomendação fraca: "melhorar o checkout". Recomendação útil: "explorar uma versão que mostre custo total e prazo antes da última etapa; testar se as pessoas comparam opções sem voltar ao carrinho".

Priorize por impacto, força da evidência, urgência, esforço e valor de aprendizado. Não use fórmulas com falsa precisão; registre quem decidiu, com que critério e quando reavaliar. **SE** o sinal existe mas a evidência é insuficiente **ENTÃO** classifique como **Investigar**.

Template de card de achado e relatório: `templates/relatorio-de-achados.md`.

## 6. Apresentar para stakeholders

Apresente decisões, não telas. Antes de montar qualquer material, responda: quem decide? que decisão? o que já sabem? que evidência mudaria a opinião deles? que feedback é útil agora?

Cada público decide algo diferente:

| Público | Quer saber |
|---|---|
| Liderança | Impacto, risco, prioridade, investimento, prazo |
| Produto | Comportamento, métricas, trade-offs, roadmap |
| Engenharia | Viabilidade, estados, regras, dependências, esforço |
| Suporte/operação | O que muda no atendimento e nos processos |

Estrutura: **decisão → contexto → problema → evidência → proposta → trade-offs → próximos passos.**

- Títulos-conclusão: "Gestores não confiam no status sem saber quem aprovou", não "Resultados do teste".
- Cada slide: título-conclusão, poucos fatos, por que importa, uma evidência visual (citação real, print, clipe curto).
- Mostre o material aos poucos durante o projeto; evite o "grande revelar" final.
- Fidelidade alinhada à decisão: wireframe convida discussão de estrutura; alta fidelidade desvia para detalhes visuais.
- Peça feedback específico ("verifiquem contra a regra de negócio", "apontem dependências faltando").
- Traduza sem simplificar demais: em vez de "violação heurística", diga "três lugares onde a mesma ação se comporta diferente, gerando erro e contato com suporte".
- Mostre trade-offs em tabela (opção, benefício, custo, quando escolher). Isso troca "qual tela você prefere" por "qual combinação serve ao objetivo".

Discordância: esclareça a preocupação → ligue ao objetivo → volte aos critérios e à evidência → defina ação (aceitar, testar alternativa, coletar dado, registrar restrição ou manter com justificativa).

Material assíncrono precisa funcionar sem narração: títulos-conclusão, decisão, dono e prazo explícitos, origem e limites da evidência, status (aprovado, em discussão, fora de escopo).

Para falar com liderança em termos de negócio, use a cadeia experiência → produto → operação → negócio → financeiro (ver `metricas-e-roi.md`). Comece por casos pequenos e mensuráveis.

## 7. Repositório e ResearchOps

ResearchOps são as pessoas, processos e ferramentas que permitem à pesquisa funcionar com qualidade e em escala. A comunidade de ResearchOps descreve oito frentes: ambiente, escopo, recrutamento e administração, dados e gestão de conhecimento, pessoas, contexto organizacional, governança, ferramentas e infraestrutura.

Componentes mínimos:

- **Gestão de participantes**: elegibilidade, histórico de participação, consentimentos, incentivos, preferências de contato; evita recrutar sempre as mesmas pessoas.
- **Repositório**: estudos e nuggets com metadados (data, método, produto/área, segmento, n, pesquisador), taxonomia de tags estável, níveis de acesso, prazo de retenção.
- **Governança**: padrões mínimos de consentimento, armazenamento, acesso a gravações, retenção e revisão de estudos de maior risco.
- **Modelo de serviço**: o que tem suporte dedicado e o que é autoatendimento (templates, revisões, horários de apoio).

Implantação: diagnostique → escolha **um** gargalo (frequência, custo, risco) → desenhe o fluxo antes de automatizar → defina responsáveis e regras → só então escolha ferramenta.

Maturidade: ad hoc → repetível (templates e donos) → gerenciado (repositório, governança, métricas) → estratégico (influencia investimentos).

Meça resultado, não atividade: tempo de recrutamento mantendo qualidade, reuso de achados em decisões, incidentes de governança. Repositório que ninguém consulta é cemitério; atribua manutenção.

## Armadilhas

- Começar o relatório pelo processo em vez da decisão.
- Incluir todas as telas exploradas.
- Inflar evidência ou generalizar amostra pequena.
- Confundir frequência com severidade.
- Expor dados identificáveis em slides e clipes.
- Defender a solução em vez de mostrar trade-offs.
- Sair da apresentação sem decisão, dono e prazo.

## O que um agente pode / não pode fazer

> **Pode:** transcrever, extrair nuggets com IDs, sugerir códigos e agrupamentos, montar matriz de evidências e destacar conflitos, contar participantes por tema, reescrever títulos como conclusões, adaptar o relatório por público, montar tabelas de trade-off, taguear e tornar o repositório pesquisável.
>
> **Não pode:** inventar ou parafrasear falas como se fossem literais; apresentar agrupamento automático como achado sem conferência no bruto; decidir o peso relativo de fontes conflitantes sem julgamento humano; "melhorar" a narrativa com certeza que a evidência não dá; enviar material identificável a ferramentas sem tratamento de dados verificado.
