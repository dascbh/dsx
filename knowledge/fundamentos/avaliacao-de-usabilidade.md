# Avaliação de usabilidade: heurística, cognitive walkthrough e teste

> **Quando consultar**
> - Ao receber um pedido do tipo "revise esta tela/fluxo" e precisar de um método, não de opinião.
> - Ao decidir entre inspeção por especialista e teste com pessoas reais.
> - Ao escrever um relatório de achados que outra pessoa vai priorizar e implementar.
> - Ao simular a primeira experiência de um iniciante num fluxo novo.

Regra-mãe: escolha o método que produz a **evidência necessária para a próxima decisão** e declare o limite dele no relatório. Os critérios de cada heurística estão em [heuristicas-nielsen.md](heuristicas-nielsen.md).

---

## 1. Avaliação heurística (processo)

Inspeção sistemática de uma interface contra um conjunto de princípios definido antes. Não é passar os olhos numa checklist.

### Passos

1. **Delimite a pergunta e o escopo.** Produto, fluxo ou tarefa, público, dispositivo, versão. "Avaliar o app" é vago; "avaliar o fluxo de troca de plano no celular, para quem já é cliente" é avaliável.
2. **Escolha o conjunto de heurísticas antes de inspecionar.** As dez de Nielsen como base; acrescente critérios de domínio (IA, saúde, finanças, público infantil) quando o contexto exigir.
3. **Use de 3 a 5 avaliadores independentes.** Uma pessoa sozinha encontra apenas parte dos problemas; mais avaliadores ampliam a cobertura com retorno decrescente acima de cinco.
4. **Alinhe o briefing.** Todos recebem o mesmo contexto e o mesmo formato de registro. Ninguém vê os achados dos outros antes de terminar.
5. **Primeira passagem: familiarização.** Percorra a tarefa para entender objetivo, sequência e estado final. Não registre violações ainda.
6. **Segunda passagem: inspeção.** Registre cada achado no formato abaixo, tela a tela, estado a estado.
7. **Consolide.** Agrupe duplicatas; mantenha separados problemas com causas diferentes; deixe divergências entre avaliadores visíveis.
8. **Atribua severidade** (escala 0–4) só depois de consolidar.

### Para um agente que avalia sozinho

- Simule independência: faça passagens separadas com lentes diferentes (iniciante, usuário frequente, teclado/leitor de tela, mobile com uma mão) e consolide no fim.
- Inspecione todos os estados, não só o caminho feliz: vazio, carregando, erro, sucesso, desabilitado, conteúdo longo, tela pequena, zoom.
- Trate a sua primeira hipótese como suspeita; procure o caso que a contradiz.
- Declare no relatório que a avaliação de um agente organiza hipóteses; não substitui julgamento humano de contexto nem teste com pessoas.

### Estrutura de um achado defensável

| Campo | Conteúdo |
|---|---|
| Contexto | Fluxo, tela, estado, público, dispositivo |
| Evidência | O que está presente ou ausente, descrito de forma verificável |
| Problema potencial | A dificuldade que pode surgir (não afirmar comportamento não observado) |
| Heurística | Qual princípio explica o problema |
| Impacto provável | Compreensão, controle, erro ou conclusão da tarefa |
| Recomendação | Direção de solução, não redesenho imposto |
| Severidade | 0–4, com frequência × impacto × persistência |
| Validação | "Hipótese" quando depende de dado ou teste |

**Evidência vs. opinião**

| Opinião (evitar) | Evidência (usar) |
|---|---|
| "O botão está confuso." | "'Cancelar' e 'Confirmar' têm o mesmo preenchimento, tamanho e cor; nada indica qual é a ação principal." |
| "A tela está poluída." | "Há 7 elementos com peso visual de título acima da dobra; a ação 'Pagar' está abaixo deles." |
| "Troque a cor do botão." | "Diferenciar a hierarquia entre ação principal e secundária." |

### Erros comuns

- Misturar opinião com evidência.
- Atribuir severidade durante a inspeção.
- Confundir severidade com prioridade.
- Avaliadores que veem os achados uns dos outros.
- Prescrever a solução completa em vez da direção.
- Enfiar barreiras de acessibilidade no relatório heurístico em vez de encaminhar para auditoria WCAG.

---

## 2. Cognitive walkthrough

Inspeção guiada por tarefa: o avaliador percorre a sequência correta de ações **fingindo ser um iniciante** e procura barreiras de descoberta e de feedback.

### As 4 perguntas, feitas em cada ação

1. **Intenção.** A pessoa vai querer fazer esta ação neste momento? (Ela sabe que precisa disso?)
2. **Visibilidade.** Vai perceber que o controle correto está disponível?
3. **Associação.** Vai entender que este controle produz o resultado que ela quer?
4. **Feedback.** Depois de agir, vai ver um retorno que mostre que avançou?

Cada "não" vira um achado. Registre qual pergunta falhou; isso aponta o tipo de correção:

| Pergunta que falhou | Correção provável |
|---|---|
| 1. Intenção | Explicar o passo, reordenar o fluxo, remover a etapa |
| 2. Visibilidade | Hierarquia, posição, revelar o controle escondido |
| 3. Associação | Rótulo com verbo + objeto, ícone com texto, signifier mais claro |
| 4. Feedback | Estado visível, confirmação, progresso |

### Procedimento

1. Defina uma tarefa específica e realista ("agendar uma consulta para a próxima semana").
2. Descreva a pessoa: conhecimento prévio, contexto de uso, limitações.
3. Liste a sequência correta de ações, passo a passo.
4. Aplique as 4 perguntas a cada ação.
5. Registre problemas com contexto e evidência.
6. Classifique a severidade.
7. Recomende direções.

### Regras para agentes

- Use só o que a interface mostra. Não use conhecimento do código, da especificação ou do glossário interno.
- Imagine uma pessoa com dúvidas, não o usuário ideal.
- Não discuta solução durante a passagem; anote e siga.

### Quando usar / não usar

- **Usar:** fluxos novos antes de desenvolver; protótipos antes de teste; tarefas críticas (cadastro, login, compra); produtos que precisam ser aprendidos rápido; complemento à avaliação heurística.
- **Não usar:** sem tarefa definida; para medir satisfação; quando o problema é de estratégia e não de interação; quando é preciso entender motivação profunda; quando o comportamento depende de dados reais que o protótipo não tem.

---

## 3. Inspeção vs. teste com pessoas

| | Avaliação heurística / walkthrough | Teste de usabilidade |
|---|---|---|
| Quem executa | Especialistas (ou agente) inspecionam | Pessoas representativas fazem tarefas |
| Evidência | Problemas potenciais por violação de princípio | Comportamento observado: hesitação, erro, tempo, abandono |
| Força | Rápida, barata, possível antes de recrutar | Mostra uso real e interpretação real |
| Limite | Pode prever problema que não ocorre e perder problema real | Depende de amostra, tarefas e protocolo |
| Momento | Cedo, revisões rápidas, triagem | Protótipo funcional ou produto no ar |

### Regra de decisão

- SE a pergunta é "esta interface viola princípios conhecidos?" ENTÃO avaliação heurística.
- SE a pergunta é "um iniciante consegue descobrir como fazer X?" ENTÃO cognitive walkthrough.
- SE a pergunta é "as pessoas do público conseguem e entendem?" ou há divergência entre especialistas ENTÃO teste de usabilidade.
- SE o achado é severidade 3–4 e a correção é cara ENTÃO valide com teste antes de investir.
- SE não há tempo nem acesso a pessoas ENTÃO inspecione, marque tudo como hipótese e diga isso.
- SE a pergunta é sobre impacto no negócio ENTÃO nenhum dos dois basta: cruze com métricas (tempo por tarefa, erros, abandono por etapa, motivos de contato com suporte).

Sequência eficiente: inspeção gera hipóteses → priorizam-se os riscos críticos → teste valida os críticos → síntese separa confirmado de incerto → itera.

Cadeia de impacto para justificar prioridade: heurística violada → problema potencial → tarefa afetada → comportamento observado → métrica → resultado.

---

## 4. Modelo de relatório

```markdown
# Avaliação de usabilidade — <fluxo/tela>

## Escopo
- Pergunta: <o que queremos saber>
- Fluxo/tarefa: <...>
- Público: <...>
- Dispositivo/versão: <...>
- Método: avaliação heurística (10 de Nielsen + <extras>) | cognitive walkthrough | ambos
- Limites: inspeção sem usuários; achados marcados como hipótese exigem teste

## Resumo
- Total de achados: N (4: x · 3: y · 2: z · 1: w)
- Três problemas mais graves, uma linha cada

## Achados
### A1 — <título curto descrevendo o problema>
- Contexto: <tela, estado>
- Evidência: <observável>
- Problema potencial: <...>
- Heurística / pergunta do walkthrough: <H5 / P3>
- Impacto: <compreensão | controle | erro | conclusão>
- Severidade: <0–4> (frequência: <>, impacto: <>, persistência: <>)
- Recomendação: <direção>
- Padrão relacionado: <link para pattern card>
- Validação: <confirmado | hipótese>

## Fora do escopo / encaminhado
- Barreiras de acessibilidade para auditoria WCAG
- Questões de estratégia de produto

## Próximos passos
- <responsável> — <ação> — <prazo>
```

---

## Checklist de auditoria

- [ ] Pergunta e escopo definidos (fluxo, público, dispositivo, versão).
- [ ] Conjunto de heurísticas escolhido antes da inspeção.
- [ ] Passagem de familiarização feita antes de registrar achados.
- [ ] Todos os estados inspecionados, não só o caminho feliz.
- [ ] Cada achado tem evidência observável, separada de opinião.
- [ ] Walkthrough: tarefa concreta, perfil descrito, sequência listada, 4 perguntas por ação.
- [ ] Duplicatas consolidadas; causas diferentes mantidas separadas.
- [ ] Severidade atribuída após consolidar, com os três fatores.
- [ ] Hipóteses marcadas como tal; limites do método declarados.
- [ ] Recomendações dão direção, não redesenho completo.
- [ ] Acessibilidade encaminhada para auditoria específica.
- [ ] Achados priorizados têm responsável e próximo passo.
