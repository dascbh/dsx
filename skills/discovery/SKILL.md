---
name: discovery
description: Conduz product discovery antes de construir — enquadra o problema (problem framing), escreve jobs-to-be-done, monta a opportunity solution tree, mapeia e prioriza suposições (desejabilidade, viabilidade, factibilidade, usabilidade, ética), escolhe o teste mais barato (fake door, teste de conceito, protótipo, MVP) e define métricas de sucesso e escopo negativo num brief enxuto. Use quando o pedido chegar como solução pronta ("faz uma tela de X") sem problema definido, no início de uma feature, ou quando ninguém souber dizer como medir se deu certo.
---

# Discovery de produto

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `templates/` são relativos a ela.

Referências: `knowledge/pesquisa/discovery-e-estrategia.md`, `metricas-e-roi.md`; templates `jtbd.md`, `opportunity-solution-tree.md`, `assumption-map.md`, `brief.md`.

**Regra:** discovery reduz o risco de construir a coisa errada. Ele termina quando a próxima decisão está clara — não quando o documento está bonito.

## 1. Enquadre o problema

Responda com evidência (ou marque `[sem evidência]`):
- **Quem** tem o problema (segmento, papel, contexto)?
- **Qual** é o problema, em termos de comportamento observado — não de solução ausente? ~~"Falta um dashboard"~~ → "Gestores levam 2h por semana montando o relatório manualmente."
- **Por que agora?** Qual o custo de não resolver?
- **Como saberemos** que resolvemos? (métrica de resultado, não de entrega)

Se o pedido veio como solução, reescreva-o como problema e confirme com quem pediu.

## 2. Job to be done

`templates/jtbd.md`: **Quando** <situação>, **quero** <motivação>, **para** <resultado esperado>. Inclua dimensões funcional, emocional e social, e as soluções que a pessoa "contrata" hoje (inclusive planilha, WhatsApp, não fazer nada).

## 3. Opportunity solution tree

`templates/opportunity-solution-tree.md`: **resultado desejado** (1 métrica) → **oportunidades** (necessidades/dores ouvidas de usuários) → **soluções** (≥ 3 por oportunidade escolhida) → **experimentos** (testam suposições da solução). Compare soluções entre si; nunca avalie uma só.

## 4. Suposições

`templates/assumption-map.md`: liste o que precisa ser verdade para cada solução funcionar, nas categorias desejabilidade, viabilidade (negócio), factibilidade (técnica), usabilidade e ética. Posicione em **importância × evidência**. Teste primeiro as **importantes com pouca evidência**.

## 5. Teste mais barato que responde

| Suposição | Teste |
|---|---|
| As pessoas querem isto? | fake door / landing com medição, entrevista de problema |
| Entendem a proposta? | teste de conceito (5–8 pessoas) |
| Conseguem usar? | protótipo + teste de usabilidade |
| Pagam / adotam? | pré-venda, piloto, MVP concierge |
| Dá para construir? | spike técnico |

Defina **antes** do teste: o que conta como sucesso e o que você fará se falhar. Fake door exige aviso honesto logo após o clique e não pode coletar pagamento.

## 6. Brief

`templates/brief.md`, uma página: problema e evidência · pessoas e job · resultado esperado e métrica (com linha de base) · escopo **e escopo negativo** (o que fica de fora) · suposições abertas e como serão testadas · riscos (inclusive de acessibilidade e ética) · restrições.

## O que um agente pode e não pode fazer

- **Pode:** reescrever pedidos de solução como problema, rascunhar JTBD/OST/mapa de suposições, gerar alternativas de solução, sugerir experimentos, calcular amostra e métricas.
- **Não pode:** afirmar que um problema existe ou é frequente sem dado, "validar" uma solução com usuários sintéticos, escolher o resultado de negócio pelo time.
