# Testes de usabilidade

## Quando consultar

- Ao planejar, roteirizar, moderar ou analisar qualquer teste em que pessoas executam tarefas numa interface ou protótipo.
- Ao decidir quantos participantes recrutar, ou ao ouvir "cinco usuários bastam".
- Ao escolher entre teste moderado e não moderado.
- Ao classificar severidade de problemas ou decidir quando parar.
- Quando alguém propuser "testar com usuários sintéticos".

## 1. O que é e o que não é

Participantes representativos executam tarefas realistas enquanto se registra o que fazem: sucesso, hesitações, erros, caminhos, pedidos de ajuda. Usabilidade, no sentido da ISO 9241-11, combina **eficácia**, **eficiência** e **satisfação** num contexto de uso específico.

- Entrevista coleta relato; teste observa interação.
- Avaliação heurística é previsão de especialista; teste é observação de comportamento.
- Gravar sessões não é testar; sem tarefas e critério, é só vídeo.

## 2. Planejamento

1. **Decisão e perguntas.** "Clientes novos escolhem a forma de entrega sem ajuda?" e não "testar o checkout".
2. **Material na fidelidade certa.** Wireframe navegável para fluxo e estrutura; alta fidelidade quando a dúvida envolve conteúdo, densidade ou microinteração.
3. **Recrutamento por critério relevante**: experiência no domínio, frequência de uso, papel, dispositivo, tecnologia assistiva. Segmentos diferentes são analisados separadamente. Colegas de time não contam.
4. **Tarefas em cenário** (ver seção 3).
5. **Critério de sucesso por tarefa, definido antes**: sucesso sem ajuda · sucesso com dificuldade · sucesso com ajuda · falha.
6. **Métricas alinhadas à pergunta**: taxa de conclusão, tempo, erros, pedidos de ajuda, SEQ pós-tarefa, SUS ao final (ver `metricas-e-roi.md`).
7. **Roteiro de sessão** (seção 5).
8. **Piloto** com uma pessoa fora do time: corrige tarefas ambíguas, tempo e falhas técnicas.
9. **Moderar sem ensinar.**
10. **Registrar observações, não interpretações.** "Abriu Perfil procurando o endereço" e não "não entendeu a navegação".

Template: `templates/roteiro-teste-usabilidade.md` e `templates/plano-de-pesquisa.md`.

## 3. Escrita de tarefas: cenário, não instrução

A tarefa dá motivação e objetivo; nunca revela o caminho nem repete rótulos da interface.

| Ruim (instrução) | Bom (cenário) |
|---|---|
| Clique em "Meus pedidos" e cancele a compra | Você comprou este fone ontem e mudou de ideia. Mostre o que faria |
| Altere o endereço de entrega no seu perfil | Você se mudou na semana passada e quer receber a próxima compra na casa nova |
| Use o filtro de preço para achar um produto até R$ 200 | Você tem R$ 200 para um presente de aniversário. Encontre uma opção |

Regras:

- **SE** a tarefa contém o rótulo exato de um botão ou menu **ENTÃO** reescreva com as palavras do usuário.
- **SE** a tarefa descreve passos **ENTÃO** troque por objetivo e motivação.
- **SE** o sucesso não é verificável na tela **ENTÃO** defina um estado final observável ("confirmação exibida").
- Uma tarefa = um objetivo. Ordene das mais simples às mais complexas, ou randomize quando comparar versões.
- Forneça dados fictícios necessários (endereço, cartão de teste) para que ninguém use dados reais.

## 4. Quantos participantes: a regra dos cinco e seus limites

O modelo de Nielsen e Landauer estima a proporção de problemas encontrados:

```
encontrados = N × [1 − (1 − L)^n]
```

`N` = total de problemas existentes · `L` = probabilidade média de um participante revelar um problema · `n` = número de participantes.

Leitura mais útil: um problema que afeta uma fração `p` das pessoas tem probabilidade `1 − (1 − p)^n` de aparecer ao menos uma vez com `n` participantes.

Exemplos resolvidos:

- `p = 0,31`, `n = 5`: `1 − 0,69^5 = 1 − 0,156 ≈ 0,84` → cerca de 84% de chance de ver o problema.
- `p = 0,31`, `n = 3`: `1 − 0,69^3 = 1 − 0,329 ≈ 0,67`.
- `p = 0,10`, `n = 5`: `1 − 0,90^5 = 1 − 0,590 ≈ 0,41` → problema que atinge 1 em 10 passa despercebido na maioria das rodadas de cinco.
- Quantos para 85% de chance com `p = 0,10`? `n = ln(0,15) / ln(0,90) ≈ 18`.

Limites, que o agente deve declarar sempre que citar "cinco usuários":

- `L` não é constante: varia com o produto, as tarefas, o público e o avaliador. Os 31% vieram de estudos específicos.
- Cinco é ponto de partida para teste **formativo, qualitativo, com público homogêneo e iteração** (testar, corrigir, testar de novo).
- Com vários segmentos distintos, recrute 3–4 por segmento.
- Para **estimar** taxas, tempos ou comparar versões, trate cerca de 20 como mínimo de referência e calcule a precisão desejada.
- Aumente a amostra quando: problemas raros importam, há risco regulatório ou de segurança, a consequência de perder um problema é alta.
- O modelo não diz nada sobre problemas que as tarefas escolhidas não exercitam.

## 5. Moderado vs não moderado

| | Moderado (remoto ou presencial) | Não moderado (remoto) |
|---|---|---|
| Melhor para | Entender por quê, protótipo instável, tarefas complexas, temas sensíveis | Escala, comparação padronizada, métricas objetivas, participantes dispersos |
| Riscos | Viés do moderador, custo por sessão | Tarefa ambígua ou link quebrado corrompe dezenas de sessões antes de alguém notar |
| Exige | Moderador treinado, roteiro | Piloto completo, critérios de sessão válida antes da coleta, monitoramento durante |

**SE** o protótipo exige explicação, tem caminhos imprevistos ou o tema é sensível **ENTÃO** moderado.
**SE** o protótipo é estável, as tarefas são inequívocas e a pergunta é "quanto" **ENTÃO** não moderado.
Combinação recomendada: moderado para descobrir e afinar a linguagem das tarefas → não moderado para escala → moderado de novo para explicar padrões.

Critérios de sessão válida (não moderado, definidos antes): falha de gravação, perfil fora do critério, participação duplicada, abandono antes das tarefas principais, respostas incoerentes com o comportamento.

## 6. Roteiro de sessão moderada

1. **Abertura (2–3 min):** propósito, duração, gravação, quem assiste, confidencialidade, direito de parar. "Estamos testando o produto, não você." Confirme o consentimento.
2. **Aquecimento:** contexto e experiência prévia relevante.
3. **Instruções:** pensar em voz alta, sem tutorial da interface.
4. **Tarefas**, uma por vez; anote caminho, erros, hesitações, pedidos de ajuda.
5. **Pós-tarefa:** SEQ (uma pergunta, 7 pontos) e perguntas sobre incidentes observados.
6. **Encerramento:** SUS se previsto, "algo que não perguntei?", agradecimento e compensação.

Respostas neutras quando o participante pergunta "posso clicar aqui?": "o que você faria se estivesse sozinho?", "o que espera que aconteça?", "o que está procurando agora?". Pensar em voz alta revela expectativas, mas não dá acesso garantido às causas.

## 7. Regra de parada

Dentro da sessão:

- Defina um tempo máximo por tarefa no plano. Ao atingir, ou se o participante desistir duas vezes, registre **falha** e siga.
- Se o participante demonstrar desconforto real, pause ou encerre; a dignidade vale mais que o dado.
- Ajudou? A tarefa vira "sucesso com ajuda" ou "falha", nunca "sucesso".

Entre sessões:

- Continue enquanto novos participantes revelarem problemas novos de severidade relevante.
- Prática comum: se duas sessões seguidas não trazem nenhum problema novo de severidade 2 ou maior, encerre a rodada, corrija e reteste.
- Problema crítico claro já na primeira sessão? Corrija antes das próximas se o protótipo permitir; não gaste sessões confirmando o óbvio.
- Se a sessão piloto ou as duas primeiras revelarem tarefa mal escrita, pare, reescreva e descarte esses dados da tarefa.

## 8. Severidade

Escala de Jakob Nielsen (0–4):

| Nota | Significado |
|---|---|
| 0 | Não é problema de usabilidade |
| 1 | Cosmético; corrigir se sobrar tempo |
| 2 | Menor; baixa prioridade |
| 3 | Maior; prioridade alta |
| 4 | Catastrófico; corrigir antes de lançar |

Severidade combina **frequência** (quantos encontraram), **impacto** (atrapalha ou impede?) e **persistência** (incomoda uma vez ou sempre?). Pondere também a importância da tarefa. Um único caso crítico (perda de dados, ação irreversível, risco financeiro) justifica atenção mesmo com n = 1.

Alternativa verbal equivalente: crítico (impede tarefa essencial ou causa dano) · alto (dificuldade substancial, exige ajuda) · médio (hesitação, retrabalho, conclui) · baixo (atrito localizado).

## 9. Análise

Cadeia por problema: **observação** ("3 de 5 procuraram 'alterar endereço' em Perfil", com IDs de sessão) → **achado** (a localização não corresponde à expectativa) → **impacto** (abandono, contato com suporte) → **ação** (explorar posição e rótulo alternativos e retestar).

- Agrupe por tarefa, etapa do fluxo, componente e tema.
- Registre também o que funcionou; isso evita que a próxima versão quebre o que estava bom.
- Consolide duplicados: mesma causa em várias telas é problema sistêmico.
- Não converta "3 de 5" em "60%" no relatório.
- Planeje o reteste após corrigir.

## 10. Acessibilidade no teste

Se o público inclui pessoas com deficiência ou usuários de tecnologia assistiva, recrute-as para a rodada principal, não para um estudo separado no fim. Verifique antes da sessão se o protótipo funciona com leitor de tela, teclado e ampliação. Detalhes em `etica-e-inclusao.md`.

## Armadilhas

- Testar sem pergunta de pesquisa.
- Tarefas que entregam o caminho.
- Ajudar cedo demais ou ensinar a interface.
- Focar em opinião ("gostou?") em vez de comportamento.
- Tratar "cinco" como lei.
- Teste único, sem reteste.
- Relatar só problemas.

## O que um agente pode / não pode fazer

> **Pode:** redigir tarefas em cenário e detectar rótulos vazados; montar roteiro e plano; calcular amostra pela fórmula e declarar seus limites; calcular taxas de conclusão, tempos e intervalos; transcrever; propor agrupamento de observações e rascunho de severidade para revisão; executar inspeção com usuário sintético para **gerar hipóteses** de problemas e casos de teste.
>
> **Não pode:** ser o participante; apresentar resultado de "teste com usuário sintético" como teste de usabilidade; moderar sessão real sem humano responsável; atribuir severidade final sem revisão humana; inventar observações, citações ou contagens; declarar o produto "usável" a partir de inspeção.
