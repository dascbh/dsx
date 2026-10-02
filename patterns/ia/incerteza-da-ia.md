---
id: incerteza-da-ia
titulo: Como comunicar limites e incerteza de respostas de IA?
categoria: ia
componentes: [aviso, rotulo, indicador-de-confianca]
tipo: decisao-contextual
impacto: alto
status: recomendado
evidencia: moderada
wcag: ["1.4.1", "4.1.3", "2.2.1", "3.1.5"]
relacionados: [rotular-conteudo-ia, fontes-da-ia, revisar-resultado-da-ia, confirmar-acao-da-ia, recuperar-erro-da-ia]
---

# Como comunicar limites e incerteza de respostas de IA?

> **Regra:** Comunique a incerteza perto do resultado, com linguagem proporcional ao desempenho real e ligada a uma ação concreta (conferir, comparar, ver fontes, pedir revisão); mostre número de confiança só se for válido e compreensível.

## Contexto

Modelos de IA não são igualmente confiáveis em todas as tarefas; o resultado varia com dados, contexto e formulação. Uma resposta fluente parece mais certa do que é, e a pessoa pode tratá-la como fato.

Limites explícitos evitam confiança excessiva e também rejeição indiscriminada de uma ferramenta útil nas tarefas certas. A comunicação deve ser calibrada ao risco, sem exigir percentual em toda resposta.

Um estudo de CHI mostrou que complexidade da tarefa e incerteza alteram a dependência da IA; por isso teste a comunicação no contexto real, sobretudo quando o impacto é alto.

## Decisão

- **SE** o desempenho varia ou a tarefa é ambígua, nova ou com dados incompletos **ENTÃO** mostre o limite junto à resposta.
- **SE** a saída pode afetar saúde, dinheiro, direitos, segurança ou algo difícil de reverter **ENTÃO** reforce o aviso e encaminhe para revisão humana, fontes ou confirmação.
- **SE** a evidência não sustenta certeza **ENTÃO** use "pode", "talvez" ou "provavelmente" e evite "isso está correto".
- **SE** existe mais de uma interpretação plausível **ENTÃO** mostre alternativas ou cenários.
- **SE** usa indicador de confiança **ENTÃO** explique o significado, o cálculo e o limiar que muda a conduta; **SENÃO** prefira categorias simples.
- **SE** a diferença numérica não muda a decisão **ENTÃO** não mostre falsa precisão (ex.: 87,3%).
- **SE** a qualidade é menor para idioma, dado ou tarefa específica **ENTÃO** avise.
- **SE** o impacto é baixo **ENTÃO** use aviso discreto; não aplique o mesmo alerta em todas as respostas.
- **SENÃO** mantenha um aviso curto e fixo, mas nunca como substituto de fontes ou revisão.

## Quando usar

- Respostas, recomendações e classificações de desempenho variável.
- Predições com cenários plausíveis.
- Conteúdo que será enviado, publicado ou usado para agir.

## Quando evitar

- Percentual sem explicação ou calibração → **use em vez disso:** categoria com texto.
- Disclaimer genérico no lugar de fontes ou revisão → **use em vez disso:** ação concreta de verificação.
- Alerta idêntico para baixo e alto impacto → **use em vez disso:** graduar pelo risco.
- Aviso distante do resultado → **use em vez disso:** junto da saída.

## Faça

- Diga qual parte precisa de verificação.
- Ofereça fontes, correção ou revisão humana.
- Mantenha o aviso visível até ser compreendido.
- Teste a compreensão com quem decide.

## Evite

- Afirmar que a IA "sabe" sem base.
- Usar só cor, ícone ou posição para sinalizar incerteza.
- Números sem unidade, referência ou limiar.
- Transferir toda a responsabilidade ao usuário com um disclaimer.
- Remover a possibilidade de seguir com segurança.

## Acessibilidade

- Limitação em texto, não só cor, ícone, som ou animação (WCAG 1.4.1).
- Linguagem simples; nomes acessíveis para indicadores e ações de verificação (WCAG 3.1.5 como referência de leitura).
- Foco visível e teclado em alertas, fontes e caminhos de recurso.
- Não faça o aviso sumir antes de ser lido (WCAG 2.2.1).
- Anuncie atualizações do resultado sem mover o foco (WCAG 4.1.3).
- Explique unidades e limiares para leitores de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Aviso geral | "Esta resposta pode conter erros. Confira antes de usar." |
| Alto impacto | "Não use como orientação médica. Consulte um profissional." |
| Alternativas | "Há duas interpretações possíveis. Qual você quis dizer?" |
| Ação | "Ver fontes" / "Pedir revisão" |

## Checklist de verificação

- [ ] A interface esclarece o que a IA faz e em que ponto pode errar?
- [ ] A linguagem corresponde ao desempenho real?
- [ ] O aviso fica perto do resultado relevante?
- [ ] O aviso leva a uma ação (conferir, comparar, revisar)?
- [ ] Indicadores numéricos têm significado e limiar explicados?
- [ ] O tratamento varia com impacto e reversibilidade?
- [ ] Nada depende só de cor ou ícone?
- [ ] Os controles funcionam por teclado e leitor de tela?

## Fundamentação

- Microsoft HAX Toolkit (diretrizes 2 e padrão 2A): comunicar desempenho e erros possíveis; ajustar precisão da linguagem.
- Google People + AI Guidebook: modelos mentais, calibração da confiança, comunicação de confiança.
- Amershi et al. (2019, CHI): 18 diretrizes de interação humano-IA.
- Salimzadeh, He e Gadiraju (2024, CHI): efeito da incerteza e do tipo de tarefa na dependência.
- Buçinca et al. (2021, CHI): reduzir dependência automática estimulando análise.
- Documentação pública de fornecedores de IA: respostas podem estar incorretas e exigem avaliação crítica.
