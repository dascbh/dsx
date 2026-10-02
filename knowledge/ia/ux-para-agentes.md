---
id: ux-para-agentes
area: ia
titulo: UX para agentes de IA
evidencia: contextual
relacionados: [generative-ui, evals, rag-e-fontes, divida-de-experiencia]
---

# UX para agentes de IA

> **Quando consultar**
> - Antes de projetar ou revisar qualquer fluxo em que o sistema **age** em nome da pessoa (envia, publica, altera, compra, agenda, concede acesso), e não apenas responde.
> - Ao decidir quanto um agente pode fazer sozinho e onde entra uma confirmação.
> - Ao desenhar progresso, histórico, permissões, recuperação de falha ou transferência para atendimento humano.
> - Ao definir métricas ou roteiro de teste para uma experiência agêntica.
>
> **Não consultar para:** respostas puramente informativas sem efeito colateral (ver `rag-e-fontes.md`) ou composição dinâmica de tela (ver `generative-ui.md`).

## 1. O problema que muda

Uma interface tradicional liga cada gesto a uma consequência direta. Um agente recebe um **objetivo** e escolhe os passos; entre o pedido e o resultado existem dezenas de decisões que ninguém especificou. Isso cria quatro tensões que o design precisa resolver:

| Tensão | O que acontece | Resposta de UX |
|---|---|---|
| Imprevisibilidade | O caminho escolhido difere do imaginado | Mostrar interpretação e plano antes de agir |
| Assimetria de informação | O sistema sabe o que usou; a pessoa vê só o resultado | Progresso e histórico verificáveis |
| Escala da consequência | Um pedido afeta muitos registros ou outras pessoas | Autonomia proporcional ao risco |
| Responsabilidade difusa | Na falha, ninguém sabe quem decidiu ou aprovou | Trilha de ações e aprovações |

Distinga sempre três modos, porque cada um cria uma expectativa diferente:

- **Chatbot**: responde; a pessoa conduz tudo. Foco em clareza da resposta.
- **Copiloto**: sugere dentro de uma tarefa; a pessoa decide e executa. Foco em revisão e aceite consciente.
- **Agente**: planeja e executa etapas; o sistema conduz parte do trabalho. Foco em delegação, acompanhamento, controle e recuperação.

**Regra:** quando um mesmo produto alterna entre esses modos, a interface deve deixar visível qual modo está ativo. Sugerir e agir nunca podem ter a mesma aparência.

## 2. Os seis princípios

### 2.1 Intenção clara
Antes de agir, o agente demonstra que entendeu objetivo, escopo e restrições. Não precisa repetir o pedido inteiro; precisa expor as interpretações que mudariam o resultado.

- **SE** a instrução tem ambiguidade que pode causar dano ou retrabalho (qual documento, quais destinatários, qual canal, há dado sigiloso?) **ENTÃO** pergunte antes de executar.
- **SE** a ambiguidade é irrelevante para o resultado **ENTÃO** siga com a interpretação mais provável e mostre-a de forma editável.

### 2.2 Autonomia proporcional ao risco
Ver a matriz da seção 3. Confirmar tudo é tão ruim quanto não confirmar nada: excesso de alerta ensina a pessoa a aprovar sem ler.

### 2.3 Progresso visível
Um spinner genérico não permite supervisionar uma tarefa delegada. Exiba:
- o objetivo em execução;
- etapas concluídas, etapa atual e próxima;
- ferramentas e fontes em uso;
- decisões aguardando a pessoa e bloqueios.

Visibilidade **não** é despejar raciocínio técnico interno. É mostrar fatos externos e verificáveis que ajudam a acompanhar.

### 2.4 Confirmação específica
Toda confirmação nomeia **ação + alvo + consequência**. "Continuar?" não informa nada; "Enviar esta proposta para 12 clientes da carteira Sul agora? O envio não pode ser desfeito." permite decidir.

Antes do botão de confirmar, mostre o que será afetado: antes/depois em edição de conteúdo; destinatários e texto final em mensagens; quem ganha qual permissão em mudanças de acesso. Detalhes do componente: [`confirmar-acao-da-ia`](../../patterns/ia/confirmar-acao-da-ia.md).

### 2.5 Recuperação e reversibilidade
Projete para a falha, não só para o caminho feliz. A pessoa deve conseguir:
- interromper uma execução em andamento;
- desfazer quando tecnicamente possível;
- repetir **apenas** a etapa que falhou;
- manter salvo o que já foi concluído;
- transferir o caso para uma pessoa com contexto.

Saber que é possível desfazer reduz o risco percebido e aumenta a disposição a delegar. Padrão de erro: [`recuperar-erro-da-ia`](../../patterns/ia/recuperar-erro-da-ia.md).

### 2.6 Responsabilidade rastreável
Depois da execução, deve ser possível reconstruir: objetivo recebido, ações feitas, ferramentas acessadas, aprovações concedidas, resultados e falhas. Isso serve para auditoria, mas também para a pessoa aprender como o agente trabalha e explicar o resultado a terceiros.

## 3. Matriz de autonomia por risco

Classifique **cada ação** do agente (não o produto inteiro) pelo pior efeito plausível, considerando reversibilidade, sensibilidade dos dados e impacto em terceiros.

| Nível | Critério | Exemplos | Autonomia | UI obrigatória |
|---|---|---|---|---|
| **Baixo** | Reversível, privado, sem terceiros | Ordenar uma lista temporária, rascunhar texto local | Executar e informar | Aviso discreto do que foi feito + desfazer |
| **Moderado** | Reversível, altera dado persistente interno | Atualizar registros internos, mover arquivos, etiquetar itens | Mostrar plano e permitir acompanhar | Plano visível antes, progresso por etapa, histórico, desfazer em lote |
| **Alto** | Externo, público ou difícil de reverter | Enviar mensagem a terceiros, publicar conteúdo, agendar com outras pessoas | Pedir confirmação antes | Prévia do resultado final + confirmação específica (ação, alvo, consequência) + cancelar |
| **Crítico** | Financeiro, legal, de acesso ou irreversível | Movimentar dinheiro, alterar permissões, excluir definitivamente, assinar | Confirmação reforçada e controles extras | Revisão persistente em tela, resumo de valores/alvos, fricção deliberada (digitar valor ou nome), segundo fator ou aprovador quando exigido, registro auditável |

Regras de aplicação:
- **SE** não for possível classificar o risco **ENTÃO** trate como o nível acima.
- **SE** a ação mistura níveis (ex.: atualiza registros e notifica cliente) **ENTÃO** a etapa de maior risco define o controle, e as de menor risco seguem sem confirmação extra.
- **SE** a pessoa aprovou explicitamente uma regra recorrente ("sempre arquive notas fiscais") **ENTÃO** a autonomia pode subir um nível para aquela regra, com escopo, prazo e caminho para revogar visíveis.
- **NUNCA** rebaixe um nível crítico por conveniência ou por histórico de acertos do agente.

## 4. Incerteza acionável

O agente não deve soar igualmente confiante em tudo. Esconder dúvida simplifica no curto prazo e destrói confiança no primeiro erro.

- Prefira linguagem que leve a uma decisão a um percentual opaco: "Há duas pessoas chamadas Ana Lima no seu contato; qual delas recebe?" é melhor que "82% de confiança".
- Sinalize dados ausentes, alternativas concorrentes e pontos que pedem revisão.
- Detalhamento visual e textual: [`incerteza-da-ia`](../../patterns/ia/incerteza-da-ia.md).

## 5. Permissões como experiência

- Peça acesso **no momento** em que ele se torna necessário, não em bloco no onboarding.
- Explique a ligação entre a permissão e o benefício.
- Ofereça escopo limitado: por tarefa, por prazo, por conjunto de dados.
- Diferencie os verbos: **ler**, **sugerir**, **alterar**, **publicar**. Cada um é uma concessão distinta.
- Mostre onde revisar e revogar o que foi concedido.

## 6. Handoff para humano

O agente precisa reconhecer quando não consegue avançar com segurança. A transferência só tem valor se quem assume não precisa recomeçar. O pacote de handoff deve conter:

```yaml
handoff:
  objetivo: "Contestar cobrança de R$ 389,90 em 14/09"
  motivo_da_transferencia: "Lojista aparece com dois CNPJs; regra de contestação ambígua"
  etapas_concluidas:
    - "Transação identificada e confirmada pelo cliente"
    - "Regras de contestação consultadas (política v3, vigente)"
  evidencias: ["extrato do período", "trecho da política aplicável"]
  decisoes_pendentes: ["Qual CNPJ usar no protocolo"]
  acoes_ja_executadas_com_efeito: []   # nada enviado externamente
  proximo_passo_sugerido: "Confirmar CNPJ com o cliente e submeter"
  prazo_relevante: "Janela de contestação termina em 7 dias"
```

Informe à pessoa usuária que houve transferência, para quem, por quê e quando esperar retorno.

## 7. Fluxo em fases

Para tarefas sensíveis, divida o trabalho em fases com decisão de UX própria. Exemplo genérico de contestação de cobrança:

| Fase | O agente faz | Decisão de UX |
|---|---|---|
| Entender | Identifica o item em questão | Confirma com a pessoa qual item é |
| Investigar | Consulta detalhes e regras | Mostra fontes consultadas e lacunas |
| Preparar | Monta o pedido | Resumo com valores, alvos e consequências |
| Submeter | Executa a ação externa | Confirmação explícita (nível alto/crítico) |
| Acompanhar | Monitora o andamento | Estado, prazo e próximos passos |
| Exceção | Encontra ambiguidade | Handoff humano com o pacote da seção 6 |

Use esta estrutura como molde para qualquer delegação com efeito externo.

## 8. Anti-padrões

- **Humanizar o agente** (nome, avatar, emoção) a ponto de sugerir capacidade ou responsabilidade humana que ele não tem.
- **Confirmação uniforme** para todas as ações: gera fadiga e aprovação automática.
- **Spinner genérico** em tarefa longa com múltiplas etapas.
- **"Deseja continuar?"** sem ação, alvo e consequência.
- **Ação autônoma sobre dado sensível sem caminho de reversão.**
- **Handoff sem contexto**: a pessoa que assume precisa refazer a investigação.
- **Assimetria deliberada**: esconder fontes e ferramentas usadas.
- **Responsabilidade difusa**: na falha, nada indica quem aprovou o quê.
- **Medir só taxa de conclusão**, ignorando esforço de revisão e ações indesejadas.
- **Maximizar confiança** em vez de calibrá-la.

## 9. Pesquisa e métricas

Testar só se o agente conclui a tarefa mede capacidade técnica, não a relação com a pessoa. Investigue:
- A pessoa entende o que delegou?
- Consegue prever o que vai acontecer antes de confirmar?
- Percebe quando o agente está incerto ou travado?
- Sabe interromper, corrigir e desfazer?
- Consegue verificar o resultado sem refazer o trabalho?
- Sua confiança acompanha a confiabilidade real?

Inclua no roteiro situações ambíguas e falhas provocadas, não só o caminho ideal.

| Dimensão | Métricas possíveis |
|---|---|
| Eficácia | Objetivos concluídos corretamente; qualidade do resultado |
| Eficiência | Tempo total; número de intervenções; esforço de revisão |
| Controle | Taxa de interrupções/correções bem-sucedidas; tempo de recuperação |
| Previsibilidade | Concordância entre o que a pessoa esperava e o que foi feito |
| Confiança calibrada | Delegação compatível com a taxa real de acerto por tipo de tarefa |
| Segurança | Ações indesejadas; permissões excessivas; incidentes |
| Handoff | Transferências resolvidas sem retrabalho; contexto preservado |

Como montar a suíte automática correspondente (trajetória, ações proibidas, estado final): ver `evals.md`.

## 10. Checklist

- [ ] A interface diferencia "sugerindo" de "agindo".
- [ ] Objetivo, escopo e restrições interpretados podem ser vistos e editados antes da execução.
- [ ] Cada ação está classificada em baixo/moderado/alto/crítico e recebe a UI da matriz.
- [ ] Confirmações citam ação, alvo e consequência, com prévia do resultado.
- [ ] O progresso mostra etapa atual, concluídas, fontes/ferramentas e pendências.
- [ ] Incerteza e dados ausentes aparecem de forma que levem a uma decisão.
- [ ] Pausar, corrigir, cancelar e desfazer estão disponíveis; falha parcial repete só a etapa falha.
- [ ] Permissões são pedidas no momento certo, com escopo limitado e revogáveis.
- [ ] Existe handoff humano com o pacote completo de contexto.
- [ ] O histórico reconstrói ações, ferramentas e aprovações.
- [ ] O agente foi testado com ambiguidade e falhas, e as métricas incluem controle e confiança calibrada.
