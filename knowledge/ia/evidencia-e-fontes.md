---
id: evidencia-e-fontes
area: ai
title: Evidência, sinal e previsão — níveis de confiança para o framework
evidence: contextual
related: [pesquisa-com-ia, rag-e-fontes, divida-de-experiencia]
---

# Evidência, sinal e previsão

> **Quando consultar**
> - Ao escrever ou revisar **qualquer** skill, card de padrão, DESIGN.md ou documento deste framework que faça uma afirmação sobre comportamento de pessoas, eficácia de um padrão ou tendência.
> - Ao usar um número, estudo, relatório ou "todo mundo está fazendo" para justificar uma decisão de produto.
> - Ao avaliar se uma novidade de IA deve mudar uma recomendação existente.
>
> **Regra-mãe deste framework:** toda afirmação em skill, padrão ou documento de contexto carrega um **nível de evidência declarado**. Afirmação sem nível é tratada como hipótese.

## 1. Três camadas que não se misturam

| Camada | O que é | Exemplo de forma |
|---|---|---|
| **Evidência** | Algo observado e sustentado por dados, estudo ou documentação verificável | "Num experimento controlado, o grupo X concluiu a tarefa mais rápido" |
| **Sinal** | Movimento que indica direção, sem prova de consolidação | "Vários produtos passaram a gerar controles dentro do chat" |
| **Previsão** | Interpretação sobre o que pode acontecer a partir dos sinais | "Interfaces fixas vão perder espaço" |

Relatórios de tendência costumam juntar as três num mesmo parágrafo: o dado é sólido e a conclusão projetada a partir dele, não. A pergunta não é só "qual é a fonte?", mas "o que **exatamente** essa fonte permite concluir?".

Duas distinções que mais enganam:
- **Capacidade ≠ adoção.** Uma demonstração prova que algo é possível, não que pessoas ou empresas usam. Pode haver uso amplo de IA em geral e uso ainda inicial de agentes autônomos ao mesmo tempo.
- **Observado ≠ declarado.** Uso registrado em produto, resposta de questionário ("sinto que trabalho mais rápido") e opinião de especialista medem coisas diferentes.

## 2. As sete perguntas

Antes de transformar uma afirmação em regra, passe-a por:

1. **Qual é a fonte original?** Chegue ao estudo, dado ou documento, não a quem repercutiu.
2. **O dado é observado ou autodeclarado?**
3. **Quem foi estudado?** Tamanho, representatividade, região, profissão, contexto.
4. **Há interesse comercial?** Não desqualifica; muda a leitura.
5. **Fala de capacidade técnica ou de adoção real?**
6. **Existe comparação ao longo do tempo?** Direção pesa mais que fotografia isolada.
7. **Aplica-se ao nosso contexto?** Evidência forte em outro público, setor, país ou tipo de produto pode ter validade baixa aqui.

O objetivo não é eliminar incerteza, é **torná-la explícita**.

## 3. Hierarquia de confiança

Use estes quatro níveis como vocabulário padrão do framework:

| Nível | Tag | Critério | Exemplos de base |
|---|---|---|---|
| **Alta** | `[evidência: alta]` | Resultado replicado, revisado por pares, dados públicos robustos ou convergência de fontes independentes | Diretrizes de interação humano-IA validadas empiricamente; critérios WCAG; múltiplos estudos concordantes |
| **Contextual** | `[evidência: contextual]` | Estudos grandes e transparentes, dados de uso real, relatórios institucionais com limites declarados | Experimento controlado único; dados de uma plataforma; pesquisa com metodologia aberta |
| **Sinal** | `[evidência: sinal]` | Mudanças de produto, funções novas, padrões repetidos entre empresas, estudos iniciais, preprints, dados de um único ecossistema | Lançamentos, especificações em versão alfa, relatórios de tendência |
| **Hipótese** | `[evidência: hipótese]` | Demonstrações, previsões sem método, opinião individual, saída de IA, afirmação sem fonte original | Post de especialista, persona sintética, síntese de IA não verificada |

Mapeamento para o campo `evidencia` dos cards de padrão (`forte | moderada | emergente`): `alta` → forte; `contextual` → moderada; `sinal` → emergente. `hipótese` não sustenta card de padrão sozinha: vira pergunta de pesquisa, não recomendação.

**O erro comum não é usar fonte fraca; é usar fonte fraca como se fosse forte.** Uma demonstração serve muito bem para levantar hipótese. Não deve sustentar sozinha uma decisão estratégica.

"Mais recente" não é "mais confiável": um estudo antigo, com método claro e validação, pode valer mais que uma previsão nova baseada numa demo.

## 4. Tipos de fonte e seus limites

| Tipo | Ajuda a responder | Limite principal |
|---|---|---|
| Pesquisa acadêmica revisada | Como um comportamento foi estudado com controle | Amostra pequena; contexto distante |
| Preprint | O que está surgindo | Ainda sem revisão por pares → no máximo sinal |
| Frameworks públicos e de governança (ex.: NIST AI RMF) | Riscos e práticas de controle | Não são específicos de UX nem do seu setor |
| Diretrizes de grandes empresas | Orientação prática aplicável | Generalistas; podem refletir o ecossistema delas |
| Dados de uso real de plataforma | Como pessoas usam de fato | Limitado àquele produto e público |
| Pesquisa de mercado | Adoção e percepção em escala | Autodeclaração, amostragem, incentivo comercial |
| Documentação de produto | O que a tecnologia já faz | Capacidade não é valor nem adoção |
| Opinião, redes, newsletters | Descoberta de hipóteses | Nunca evidência isolada |

## 5. Regras de escrita para skills e documentos

- **Declare o nível** junto de cada afirmação não trivial, com a tag da seção 3.
- **Descreva o que foi medido, não o que você gostaria que significasse.** "Participantes relataram trabalhar mais rápido" ≠ "IA aumenta produtividade".
- **Números só com contexto mínimo:** tipo de estudo, ano, o que foi medido e o limite. Sem contexto, não cite o número.
- **Não invente estatística.** Na dúvida, descreva qualitativamente e marque como hipótese.
- **Separe recomendação de justificativa.** A regra pode ser forte por razão de risco (ex.: confirmar ações irreversíveis) mesmo com evidência só contextual; diga isso.
- **Registre origem, data e escopo** de regras de contexto de UX, e revise quando a fonte mudar.
- **Saída de IA é hipótese** até ser confrontada com dado ou pesquisa (ver `pesquisa-com-ia.md`).
- **SE** duas fontes conflitam **ENTÃO** apresente as duas com seus níveis; não escolha em silêncio.
- **SE** a evidência é apenas sinal **ENTÃO** a regra deve ser reversível e ter data de revisão.

Exemplo de afirmação bem escrita:

> Interfaces geradas para a tarefa podem ser preferidas a conversa pura em tarefas estruturadas; um estudo acadêmico de 2026 observou esse efeito em condições específicas. `[evidência: sinal]` Aplicar só onde houver eval próprio confirmando redução de esforço.

## 6. Leituras de tendência com a ressalva correta

Movimentos que aparecem de forma consistente entre fontes diferentes, e como tratá-los:

| Movimento | Nível | Implicação para o framework |
|---|---|---|
| UX passa a projetar comportamento do sistema, não só telas | sinal forte | Especificar estados, limites, confirmação e recuperação além de layout |
| Agentes tornam delegação e controle problemas de UX | sinal forte | Ver `ux-para-agentes.md` |
| Interfaces generativas aumentam a necessidade de avaliação | sinal | Ver `evals.md` e `generative-ui.md` |
| Pesquisa fica mais rápida e perde rastreabilidade sem salvaguarda | contextual | Rastreabilidade obrigatória insight → fonte |
| Confiança vira mecanismo projetável e mensurável | contextual | Medir confiança calibrada, não confiança máxima |

Previsões sobre cargos e profissões são expectativas de quem respondeu, não medições do que aconteceu; tratar como sinal.

## 7. Anti-padrões

- Citar quem repercutiu em vez da fonte original.
- Tratar percepção autodeclarada como medição objetiva.
- Tomar capacidade demonstrada por adoção.
- Generalizar dado de uma plataforma para o mercado inteiro.
- Usar preprint como evidência alta.
- Apresentar previsão com verbo no presente ("as interfaces são...").
- Afirmação sem nível de evidência em skill ou card.
- Número solto, sem estudo, ano e escopo.

## 8. Checklist

- [ ] Cada afirmação não trivial tem tag de nível (alta, contextual, sinal, hipótese).
- [ ] As fontes citadas são originais, não repercussões.
- [ ] Dado observado e dado declarado estão distinguidos.
- [ ] Capacidade e adoção não estão confundidas.
- [ ] Números vêm com tipo de estudo, ano, escopo e limite.
- [ ] Regras baseadas em sinal são reversíveis e têm data de revisão.
- [ ] Conflitos entre fontes estão expostos.
- [ ] Aplicabilidade ao contexto do produto foi considerada.
