# Discovery e estratégia de produto

## Quando consultar

- O pedido chega como solução ("faz um app", "adiciona IA", "reduz os campos") sem problema descrito.
- Há uma métrica ruim e ninguém sabe explicar a causa.
- É preciso decidir o que construir, para quem e por quê, antes de investir em delivery.
- Ao escrever jobs, montar uma Opportunity Solution Tree, mapear suposições, planejar fake door, teste de conceito ou MVP.
- Ao formular ou revisar uma estratégia de produto ou uma iniciativa de crescimento guiado pelo produto (PLG).

## 1. Problem framing

Distinga cinco coisas que costumam ser confundidas:

| Conceito | O que é | Exemplo |
|---|---|---|
| Sintoma | Comportamento observável | Muita gente sai no passo de envio de documentos |
| Problema | Dificuldade situada, a investigar | Pessoas chegam a esse passo sem os documentos à mão |
| Hipótese | Explicação ainda não confirmada | Ninguém avisa antes quais documentos serão pedidos |
| Oportunidade | Direção de valor | Tornar os requisitos previsíveis |
| Solução | Intervenção específica | Listar documentos na tela inicial do cadastro |

Passo a passo:

1. Parta da situação, não da solução pedida: "o que está acontecendo que faz essa solução parecer necessária?".
2. Especifique pessoa e contexto (momento da jornada, dispositivo, urgência, conhecimento prévio). "Usuário" genérico não serve.
3. Separe dado de interpretação: "40% não avançam no passo 3" é dado; "o passo 3 causa abandono" é hipótese.
4. Descreva o impacto além da métrica (esforço, erro, contato com suporte, confiança, exclusão).
5. Liste hipóteses **concorrentes**, não uma só.
6. Verifique restrições: regulatória de verdade ou "sempre foi assim"?
7. Converta incertezas em perguntas de pesquisa.
8. Formule sem prescrever solução.

Frase-modelo: `<Pessoa> em <contexto> enfrenta <dificuldade>. Evidência: <fonte, período>. Importa porque <impacto>. Ainda não sabemos se <hipótese A>, <B> ou <C>.`

"Como poderíamos…" (HMW) só depois do entendimento, e sem solução embutida: "como poderíamos ajudar as pessoas a se prepararem para o que será pedido?", não "como poderíamos mostrar os documentos antes?".

Reenquadre quando: surgir população afetada não prevista, a causa estiver numa etapa anterior, segmentos tiverem dificuldades diferentes, uma métrica melhorar e outra piorar, ou uma restrição se revelar negociável.

## 2. Jobs to be Done

Pessoas "contratam" um produto para progredir numa situação. O job tem dimensão **funcional** (a tarefa), **emocional** (o estado que buscam ou evitam) e **social** (como querem ser vistas). Persona responde "quem"; job responde "por que agiu nesta situação". Perfis opostos podem ter o mesmo job. Use os dois juntos.

Job statement: `Quando <situação>, quero <motivação>, para <resultado esperado>.` Sem nome de funcionalidade.

Exemplo: "Quando fecho o mês com pouco tempo, quero confirmar que nenhum lançamento ficou sem categoria, para não refazer o relatório na frente da diretoria."

Entrevista JTBD:

1. Recrute quem decidiu recentemente (comprou, trocou, abandonou).
2. Ancore num evento datado e reconstrua a linha do tempo: primeiro pensamento → evento passivo (a tensão cresce) → evento ativo (decide procurar) → escolha.
3. Mapeie as **quatro forças**: empurrão do status quo, atração da nova solução, ansiedades com a troca, hábitos que prendem ao antigo.
4. Pergunte o que usaram antes e o que usariam se o produto sumisse (concorrentes reais, inclusive planilha e "não fazer nada").
5. Priorize por importância × satisfação atual: importância alta com satisfação baixa é onde há mais alavancagem.

Armadilhas: workshop de jobs sem entrevistas; job confundido com solução ("quer notificação"); granularidade errada (micro-clique ou "ser feliz"); perguntas hipotéticas.

Template: `templates/jtbd.md`.

## 3. Opportunity Solution Tree (Teresa Torres)

Liga um resultado desejado a oportunidades, soluções e testes, impedindo que a primeira ideia vire inevitável.

Níveis:

1. **Resultado** (topo): mudança de comportamento que o time influencia, com métrica, público e prazo. Não "aumentar receita", não "lançar feature X".
2. **Oportunidades**: necessidades, dores e desejos na linguagem do cliente. Teste: mais de uma solução poderia atendê-la? Se não, é solução disfarçada.
3. **Soluções**: alternativas realmente diferentes para **uma** oportunidade-alvo; procure ao menos três.
4. **Testes de suposição**: pequenos experimentos sobre os riscos de cada solução.

Regras:

- Oportunidades vêm de histórias reais de clientes; poucas entrevistas já permitem um rascunho, que se revisa a cada nova leva.
- Filho é subconjunto do pai; irmãos têm escopo comparável. Um mapa de jornada ajuda a estruturar o primeiro nível.
- Escolha a oportunidade-alvo por tamanho, frequência, importância, insatisfação com alternativas e encaixe estratégico. Esforço técnico entra na escolha de solução, não de oportunidade.
- OST não é roadmap, backlog nem mapa de jornada. É documento vivo.

Template: `templates/opportunity-solution-tree.md`.

## 4. Discovery contínuo

Product discovery decide qual problema resolver, para quem e que solução merece ser construída; delivery transforma essas decisões em software. Os dois rodam em paralelo.

Quatro riscos a cobrir (formulação popularizada por Marty Cagan): **valor** (vão escolher?), **usabilidade** (conseguem usar?), **viabilidade técnica** (dá para construir e operar?), **viabilidade de negócio** (funciona para a organização: jurídico, marca, suporte, modelo). Engenharia entra cedo.

Discovery contínuo é contato semanal com clientes feito pelo próprio trio que constrói (produto, design, engenharia), em atividades pequenas ligadas a um resultado. "Contínuo" significa cadência sustentável, não volume. Não substitui pesquisa especializada em temas complexos ou populações sensíveis.

Cadência semanal de referência: rever resultado e árvore → uma entrevista ou observação → sintetizar e atualizar a árvore → explorar soluções e listar suposições → executar um teste pequeno e decidir.

Meça a qualidade do discovery por: tempo entre pergunta e evidência útil; frequência de contato do time com clientes; parcela de iniciativas com riscos explícitos; alternativas avaliadas antes de construir; decisões alteradas por evidência. Contar entrevistas não mede nada.

## 5. Mapeamento de suposições

- **Suposição**: algo que precisa ser verdade para a solução funcionar.
- **Hipótese**: afirmação testável que liga mudança a resultado.
- **Fato**: afirmação com evidência adequada, dentro de limites de público e período.

Categorias: desejabilidade, usabilidade, viabilidade técnica, viabilidade de negócio, ética (quem pode ser prejudicado, excluído, manipulado ou exposto).

Matriz importância × força da evidência:

| | Evidência fraca | Evidência forte |
|---|---|---|
| **Importante** | **Testar primeiro** | Seguir |
| **Pouco importante** | Periférica, monitorar | Pano de fundo |

Passo a passo: uma solução específica → escrita individual antes da discussão (reduz efeito manada) → organizar por categoria perguntando "o que precisa ser verdade?" → reescrever em forma observável ("gestores identificam despesas sem categoria em até 5 minutos") → posicionar citando a origem da evidência (dado, pesquisa, observação; cargo não é evidência) → escolher 1–3 críticas → definir o menor teste e o critério de sucesso **antes**.

Testes baratos: protótipo, pergunta única sobre comportamento passado, mineração de tickets/logs, spike técnico. Escolha pelo tipo de suposição, não pela ferramenta.

Template: `templates/assumption-map.md`.

## 6. Fake door

Uma entrada para algo que ainda não existe mede interesse demonstrado em ação.

- **SE** a demanda é incerta, construir é caro, há tráfego e dá para explicar logo após o clique **ENTÃO** fake door é candidato.
- **SE** a ação pode causar dano financeiro, emocional ou de privacidade, envolve público vulnerável ou tarefa sensível (pagamento, saúde, segurança) **ENTÃO** não use.

Regras:

1. Isole uma suposição.
2. Defina exposição válida (quem de fato viu a entrada) e evento de sucesso.
3. Fixe limiares **antes**: acima de X avança para pesquisa; entre X e Y ajusta mensagem e repete; abaixo de Y investiga ou descarta.
4. Mensagem de saída honesta e imediata: explica que a função está em avaliação, agradece, oferece alternativa e devolve a pessoa à tarefa sem perder dados.
5. Avise suporte; envolva jurídico/privacidade quando houver coleta de dados.
6. Monitore métricas de proteção: abandono da tarefa original, contatos de suporte, queda de uso.

`taxa de interação = cliques / exposições válidas`. Não compare taxas entre posições ou tráfegos diferentes. Nunca cobre por algo inexistente nem use urgência falsa. Curiosidade não é compromisso: complemente com lista de espera ou entrevista.

## 7. Teste de conceito

Pergunta: a ideia é entendida e relevante? (Usabilidade pergunta: conseguem usar?)

Estímulos: descrição curta (quem, problema, benefício, sem marketing), storyboard, wireframe de baixa fidelidade, ou Mágico de Oz (um humano executa por trás o que parece automático; útil para produtos de IA).

Passo a passo: decisão → hipóteses e o que as sustentaria ou contradiria → participantes representativos (em B2B: usuário, comprador, administrador) → estímulos comparáveis em ordem variada → piloto → facilitar sem vender → analisar por hipótese e segmento.

Pergunte: "com suas palavras, o que isto oferece?", "para quem parece feito?", "quando ajudaria?", "o que faz hoje?", "o que gera dúvida?", "o que espera que aconteça depois?". Não pergunte "gostou?" nem "usaria?". A distância entre a mensagem pretendida e a recebida é evidência.

Resultado: sustentado → prototipar · parcial → reformular e retestar · não sustentado → rever oportunidade · inconclusivo → corrigir o método.

## 8. MVP

MVP é um **experimento** para saber se a proposta entrega valor, não um lançamento enxuto. MVP difícil de usar pode ser rejeitado pela interface e não pela ideia.

Hipótese de valor: `Acreditamos que <proposta> é valiosa para <público>. Saberemos quando observarmos <sinal comportamental>.`

Escolha de formato por risco × recompensa:

| | Recompensa alta | Recompensa baixa |
|---|---|---|
| **Risco alto** | Protótipo / Mágico de Oz | Descartar ou reformular |
| **Risco baixo** | Construir em código com analytics | Adiar |

Sequência coerente de validação de valor: conceito (entende e vê valor?) → fake door (age?) → MVP (obtém valor de uso?). Ferramentas que barateiam construir não barateiam estar errado.

## 9. Estratégia de produto

Estratégia é um sistema de escolhas que concentra foco, não uma lista de features nem um roadmap. Hierarquia: visão → estratégia → discovery → roadmap → backlog → delivery, com aprendizado subindo e descendo.

Oito decisões explícitas: público e contexto · problema · proposta de valor · diferenciação · resultado de negócio · **renúncias** (o que não será priorizado neste ciclo) · riscos e evidências · métricas de sucesso. Sem renúncia visível, toda iniciativa parece alinhada.

Sinais de estratégia fraca: pouca seletividade, solução como ponto de partida, confusão com roadmap, dogmatismo metodológico.

## 10. Product-led growth (noções)

PLG é estratégia em que o produto participa de aquisição, ativação, monetização, retenção e expansão. Freemium é decisão de acesso e preço; PLG é o sistema inteiro.

- `ativação = usuários que atingem o evento de ativação / novos usuários elegíveis × 100`. O evento deve representar valor realizado, não só ser fácil de medir.
- **Time-to-value**: tempo e esforço entre cadastro e primeiro valor. Cada etapa de configuração precisa justificar sua presença.
- **PQL**: conta ou usuário com sinais comportamentais de intenção (ativação, uso recorrente, proximidade de limites).
- Valide a definição de ativação comparando retenção de coortes ativadas e não ativadas; correlação ainda não é causa.
- Em B2B, meça por conta, não só por usuário.

PLG ajuda pouco quando o produto exige muita customização antes do uso, quando usuário e comprador têm objetivos desalinhados ou quando o autoatendimento transfere risco indevido ao cliente.

## Armadilhas

- Feature no topo da árvore ou no lugar do problema.
- Opinião de stakeholder registrada como necessidade do cliente.
- Explorar uma única solução.
- Testar só usabilidade e ignorar valor e viabilidade.
- Definir critério de sucesso depois de ver o resultado.
- Workshops no lugar de contato real com clientes.

## O que um agente pode / não pode fazer

> **Pode:** rascunhar canvas de framing, hipóteses concorrentes e perguntas; reescrever oportunidades em linguagem de necessidade; gerar alternativas de solução e listas de suposições por categoria; redigir roteiro JTBD, estímulos de conceito, copy honesta de fake door, hipóteses de MVP e teses de estratégia; calcular taxas de interação e ativação a partir de dados fornecidos.
>
> **Não pode:** inventar histórias de clientes, jobs ou evidências que sustentem oportunidades (jobs gerados por LLM são hipóteses); posicionar suposições como "evidência forte" sem fonte citada; lançar fake door ou MVP com usuários reais sem aprovação humana; decidir a ética de um experimento; escolher as renúncias estratégicas, que são decisão de negócio.
