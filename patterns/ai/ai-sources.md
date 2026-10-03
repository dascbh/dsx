---
id: ai-sources
title: Como mostrar fontes e critérios nas respostas de IA?
category: ai
components: [citation, sources-panel, ai-response, link]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["2.1.1", "2.4.4", "2.4.7", "1.4.1", "4.1.2"]
related: [label-ai-content, ai-uncertainty, review-ai-output, confirm-ai-action]
---

# Como mostrar fontes e critérios nas respostas de IA?

> **Regra:** Ligue cada afirmação relevante à fonte que a sustenta, deixe a fonte abrível e, em saídas de alto impacto, mostre também os critérios, dados e limites usados.

## Contexto

Uma resposta de IA pode sintetizar documentos, sugerir uma ação ou embasar uma decisão. Se parte de fontes, dados ou regras, a pessoa precisa enxergar o que a sustenta e avaliar se ela se aplica ao seu contexto.

Citação não garante correção: a fonte pode estar incompleta, mal interpretada ou não sustentar o trecho. O objetivo é permitir verificação proporcional ao risco, não passar confiança automática.

Um texto bem redigido soa confiável mesmo quando é impróprio. Fontes e critérios à vista permitem confrontar a interpretação com a origem e decidir se vale buscar outra evidência.

## Decisão

- **SE** a resposta usa busca, documentos, bases internas ou arquivos enviados **ENTÃO** mostre as fontes junto do trecho que cada uma sustenta.
- **SE** o risco é baixo (sugestão local e reversível) **ENTÃO** links ou trechos bastam; não exija lista extensa.
- **SE** a saída é uma recomendação, classificação ou decisão de grande impacto (saúde, finanças, segurança, direitos, seleção de pessoas) **ENTÃO** explique também os dados considerados, as regras aplicadas, as limitações e a incerteza.
- **SE** não há base verificável **ENTÃO** diga isso explicitamente; nunca invente citação.
- **SE** a resposta mistura conteúdo pesquisado, dados da pessoa e conhecimento geral do modelo **ENTÃO** identifique cada origem.
- **SE** a fonte não sustenta o trecho **ENTÃO** não a exiba.
- **SE** a fonte tem acesso restrito ou contém dados privados **ENTÃO** respeite permissões e avise.
- **SENÃO** ofereça no mínimo um painel de fontes visível e fácil de achar.

## Quando usar

- Pesquisa na web, documentos e bases internas.
- Resumos, análises e recomendações que serão conferidos.
- Fluxos de alto impacto.
- Respostas com várias origens.
- Sistemas que classificam ou recomendam por regras e filtros.

## Quando evitar

- Lista extensa de fontes para sugestão trivial → **use em vez disso:** nenhuma ou uma única referência.
- Detalhe técnico que não ajuda a avaliar → **use em vez disso:** critérios em linguagem simples.
- Explicação no lugar de revisão humana ou confirmação → **use em vez disso:** explicação mais revisão.
- Exposição de dados pessoais para "explicar" → **use em vez disso:** resumo sem dados sensíveis.

## Faça

- Vincule a fonte ao trecho exato.
- Mostre tipo, data e contexto da fonte quando relevantes.
- Separe fato citado, inferência da IA e sugestão prática.
- Informe limites e ausência de evidência com clareza.
- Ofereça caminho para questionar ou corrigir.

## Evite

- Citações decorativas ou sem relação direta.
- Fontes escondidas em menu difícil.
- Explicações genéricas apresentadas como justificativa específica.
- Indicador de confiança sem explicar o que mede.
- Fonte que a pessoa não consegue abrir.

## Acessibilidade

- Cada citação é operável por teclado (2.1.1) e tem nome acessível que identifica a fonte (4.1.2).
- Não associe fonte e trecho só por número, cor ou posição (1.4.1).
- Avise se a fonte abre em outra página, pede login ou tem acesso restrito (2.4.4).
- Painel de fontes com foco visível (2.4.7) e ordem de leitura previsível.
- Linguagem clara para incerteza e ausência de fontes.

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo de fontes | "Fontes usadas nesta resposta" |
| Citação | "Fonte 2: Relatório trimestral, mar/2026" |
| Sem base | "Não encontrei fonte que sustente esta informação." |
| Origem mista | "Baseado nos arquivos que você enviou e em conhecimento geral" |
| Critérios | "Critérios aplicados: prazo, valor e histórico de pagamento" |

## Checklist de verificação

- [ ] Cada afirmação importante tem fonte identificável.
- [ ] As fontes podem ser abertas e conferidas.
- [ ] Fato citado, inferência e sugestão estão diferenciados.
- [ ] Decisões de alto impacto exibem critérios ou dados considerados.
- [ ] Limites e incerteza aparecem sem falsa precisão.
- [ ] Não há citação irrelevante ou inventada.
- [ ] As fontes respeitam permissões e privacidade.
- [ ] Citações e painel funcionam por teclado e leitor de tela.

## Fundamentação

- Microsoft HAX Toolkit, diretriz 11: explicações apropriadas sobre saídas e ações da IA.
- Amershi et al. (CHI 2019), Guidelines for Human-AI Interaction: justificativa compreensível do comportamento.
- Google PAIR (Crafting helpful explanations): explicações que ajudam a avaliar a IA.
- Documentação pública de produtos de IA com citações e painéis de fontes (assistentes de busca e de produtividade): verificação da origem.
- WCAG 2.2: operabilidade por teclado, propósito do link e nome-papel-valor.
