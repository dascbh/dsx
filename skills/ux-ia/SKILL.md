---
name: ux-ia
description: "Desenha e revisa features de IA e agentes: autonomia por risco, confirmação específica, progresso, incerteza, fontes, rotulagem, revisão e recuperação de erro. Use em chat, copiloto, agente que executa ações ou resposta gerada."
---

# UX de IA e agentes

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/` são relativos a ela.

Referências: `knowledge/ia/ux-para-agentes.md`, `generative-ui.md`, `multimodal.md`, `rag-e-fontes.md`, `conteudo-sintetico.md`; padrões `patterns/ai/*`.

**Tese:** a IA barateia o rascunho, não o erro. O trabalho de UX é tornar o comportamento do sistema **compreensível, supervisionável e reversível**.

## 1. Classifique cada ação do sistema por risco

Liste tudo que a IA/agente pode **fazer** (não só dizer). Para cada ação:

| Risco | Exemplo | UI obrigatória |
|---|---|---|
| Baixo, reversível | reorganizar uma lista, rascunho | executar e informar; desfazer disponível |
| Moderado | alterar registro interno reversível | mostrar plano antes; acompanhar progresso; desfazer |
| Alto | enviar mensagem externa, publicar, convidar pessoas | **confirmação específica**: ação + alvo + consequência, com prévia |
| Crítico | mover dinheiro, apagar dados, mudar permissões | confirmação reforçada (revisão completa, digitar/2º fator), trilha de auditoria, nunca em lote silencioso |

Regras:
- Confirmação uniforme para tudo gera fadiga e aprovação automática — **calibre pelo risco**. `patterns/ai/confirm-ai-action.md`
- Nunca automação irreversível em fluxo sensível sem caminho de recuperação.
- Distinga na interface **sugerir** de **agir**.

## 2. Ciclo de interação que a UI precisa cobrir

1. **Intenção:** mostre o que o sistema entendeu (objetivo, escopo, restrições). Se ambíguo, pergunte com opções concretas ("Encontrei 2 pessoas chamadas Ana. Qual?").
2. **Plano/progresso:** passo atual, ferramentas e fontes em uso, decisões pendentes. Spinner genérico não basta para tarefas > 10s. `patterns/feedback/long-loading.md`
3. **Resultado:** rotulado como gerado por IA (`patterns/ai/label-ai-content.md`), com fontes/critérios quando afirma fatos (`patterns/ai/ai-sources.md`), e limites comunicados de forma acionável — não porcentagem solta (`patterns/ai/ai-uncertainty.md`).
4. **Revisão:** editar, refazer, refinar, aceitar parcialmente, descartar — sem perder a versão anterior (`patterns/ai/review-ai-output.md`).
5. **Falha:** diga o que falhou, preserve o que foi feito, repita só a etapa falha, ofereça caminho manual ou humano (`patterns/ai/ai-error-recovery.md`).
6. **Rastro:** histórico do que foi feito, com que dados e com qual aprovação.

## 3. Permissões e dados

- Peça permissão **no momento da necessidade**, explicando o benefício.
- Escopo limitável (por tarefa, prazo, conjunto de dados) e revogável; mostre onde revisar.
- Separe níveis: ler, sugerir, alterar, publicar.
- Captura ativa (microfone, câmera, tela) sempre perceptível e interrompível.

## 4. Handoff para humano

Ao transferir, leve: objetivo, passos feitos, evidências, decisões pendentes e motivo da transferência. A pessoa nunca repete o que já contou.

## 5. UI generativa (quando a IA monta a interface)

- Gere a partir de **catálogo aprovado** de componentes, por especificação declarativa — nunca código arbitrário em runtime.
- **Invariantes fixos:** navegação, identidade, mensagens legais, ações de alto risco. Só áreas contextuais variam.
- Todo layout gerado passa pelos mesmos gates: contraste, ordem de foco, nomes acessíveis, estados de erro/vazio.
- Fallback para interface fixa quando a geração falha.
- Prefira interface fixa para tarefas frequentes que dependem de memória espacial, operações de alto risco e ambientes regulados.

## 6. Anti-padrões (bloqueie)

Humanizar a IA para parecer mais capaz do que é · esconder que o conteúdo é gerado · "Continuar?" como confirmação · confiança maximizada em vez de calibrada · ação autônoma em dado sensível sem reversão · handoff sem contexto · medir só taxa de conclusão · respostas longas em voz quando a pessoa precisa comparar.

## Saída (desenho ou revisão)

```
Ações do sistema e risco: <ação> → <nível> → <UI exigida> (✔ existe / ✘ falta)
Ciclo coberto: intenção ✔ progresso ✔ rotulagem ✔ fontes ✔ revisão ✔ falha ✔ rastro ✔
Permissões: …
Riscos residuais e como medir: <métrica de confiança calibrada, taxa de correção, handoffs> — ver skill `evals`
```
