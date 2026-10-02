---
name: pesquisa
description: "Planeja, roteiriza e sintetiza pesquisa com usuários (entrevista, usabilidade, card sorting, SUS, A/B) com síntese rastreável; usuário sintético é hipótese, nunca evidência. Use ao planejar ou analisar estudos com pessoas."
---

# Pesquisa com usuários

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `templates/` são relativos a ela.

Referências: `knowledge/pesquisa/README.md` (mapa de métodos), `metodos.md`, `testes-de-usabilidade.md`, `metricas-e-roi.md`, `sintese-e-comunicacao.md`, `etica-e-inclusao.md`, `knowledge/ia/pesquisa-com-ia.md`.

## Doutrina (inegociável)

1. **Agente não gera evidência.** Personas sintéticas, respostas simuladas e "o que um usuário diria" são **hipóteses** — servem para preparar roteiro e levantar cenários, nunca para aprovar decisão, estimar prevalência ou provar usabilidade.
2. **Nunca fabrique** citações, números, participantes ou resultados. Sem dado, escreva "sem dado".
3. **Todo achado aponta para a fonte bruta** (sessão, minuto, trecho). Achado sem rastro é opinião.
4. **Critério de sucesso definido antes de coletar.** Depois de ver os dados, não se muda a régua.

## 1. Comece pela decisão

Pergunte: *que decisão este estudo vai destravar, e o que mudaria se a resposta fosse X ou Y?* Se nada mudaria, não pesquise.

Transforme em pergunta de pesquisa e escolha o método pela tabela de `knowledge/pesquisa/README.md`. Atalhos:

| Preciso saber… | Método | Amostra típica |
|---|---|---|
| por que / como as pessoas fazem hoje | entrevista em profundidade | 5–8 por segmento |
| se conseguem usar esta tela | teste de usabilidade moderado | 5 por rodada, iterar |
| onde as pessoas esperam encontrar algo | tree testing | 50+ |
| como as pessoas agrupam conteúdo | card sorting | 15–30 |
| quanto / com que frequência | survey, analytics | depende da margem de erro |
| qual versão performa melhor | teste A/B | cálculo de amostra antes (MDE) |
| percepção de usabilidade comparável | SUS após tarefas | ≥ 12 para comparar |

## 2. Planeje

Preencha `templates/plano-de-pesquisa.md`: decisão, perguntas, hipóteses, método, perfil e critérios de recrutamento (inclusive pessoas com deficiência quando o público inclui), amostra, critério de sucesso, consentimento e tratamento de dados (LGPD), cronograma.

## 3. Roteirize

- Teste de usabilidade: `templates/roteiro-teste-usabilidade.md`. Tarefas são **cenários com objetivo**, não instruções de clique. ~~"Clique em Configurações e mude o plano"~~ → "Você quer pagar menos por mês. Veja o que dá para fazer."
- Entrevista: `templates/roteiro-entrevista.md`. Pergunte sobre **comportamento passado concreto** ("Conte da última vez que…"), não opinião sobre o futuro ("Você usaria…?").
- Perguntas de follow-up neutras: "O que você esperava?", "Me fale mais sobre isso." Nunca "Foi fácil, né?".

Um agente pode: rascunhar plano e roteiro, revisar viés das perguntas, simular uma sessão-piloto para checar fluxo e tempo **(marcando como ensaio)**.

## 4. Sintetize

1. Fragmente notas/transcrições em observações atômicas com origem (`P3, 12:40`).
2. Agrupe por afinidade; nomeie temas pelo **comportamento**, não pela solução.
3. Para cada achado: quantos participantes, severidade (0–4), evidência (2+ trechos), confiança.
4. **Triangule**: confira com outra fonte (analytics, suporte, outro método). Divergência é achado.
5. Rode o advogado do diabo: "Que dados deste estudo contradizem este achado?"
6. Só então recomendações, ligadas ao achado que as justifica.

Um agente pode: transcrever, fragmentar, propor agrupamentos e contra-argumentos. Um humano deve: validar cada achado contra a gravação e decidir prioridades.

## 5. Comunique

`templates/relatorio-de-achados.md`: decisão que motivou o estudo → resposta curta → 3–5 achados principais com evidência → recomendações priorizadas → limitações (amostra, viés, o que **não** dá para concluir).

Números com amostra pequena: reporte contagem ("4 de 5"), não porcentagem ("80%").
