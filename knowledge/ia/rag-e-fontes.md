---
id: rag-e-fontes
area: ai
title: RAG, fontes e verificação na experiência
evidence: contextual
related: [evals, evidencia-e-fontes, ux-para-agentes]
---

# RAG, fontes e verificação

> **Quando consultar**
> - Ao projetar qualquer experiência em que a IA responde com base em documentos, bases internas, catálogos, políticas ou dados recuperados.
> - Ao desenhar citações, estados de "não encontrei", fontes conflitantes, conteúdo restrito ou espera durante a busca.
> - Ao definir o contrato de resposta de um assistente de conhecimento.
>
> **Não precisa:** saber implementar embeddings ou bancos vetoriais. Precisa entender a arquitetura o bastante para projetar o que acontece quando a recuperação funciona, falha ou traz algo questionável.

## 1. O mínimo de arquitetura que UX precisa

RAG (geração aumentada por recuperação): antes de gerar, o sistema **busca** trechos relevantes numa base e os entrega ao modelo como contexto.

Duas fases:
1. **Preparação do conhecimento:** documentos são coletados, limpos, divididos em trechos (*chunks*), enriquecidos com metadados (título, origem, data, versão, dono, permissão) e indexados (por significado, por palavra-chave, ou híbrido).
2. **Resposta:** pergunta → interpretação → recuperação → seleção/reordenação → contexto → geração → apresentação com fontes e controles.

O último passo é onde mora a maior parte do trabalho de experiência.

| Termo | Por que importa para UX |
|---|---|
| Base de conhecimento | Define o que o produto pode e não pode responder |
| Trecho (*chunk*) | Corte ruim tira contexto e faz resposta parecer sustentada por fonte incompleta |
| Recuperador | A resposta pode falhar antes de chegar ao modelo |
| Reordenação | Decide quais evidências realmente chegam ao modelo |
| Aterramento | Separa resposta apoiada em fonte de conteúdo só do modelo |
| Janela de contexto | O sistema escolhe o que entra; algo relevante pode ficar de fora |

**Fato a carregar sempre:** RAG reduz alguns erros; não elimina alucinação. A interface **nunca** comunica "correto porque consultou documentos". Ela permite entender o que foi encontrado, de onde veio e como conferir. `[evidência: contextual]`

### Quando RAG não é a resposta
- **SE** a tarefa não depende de conhecimento externo **ENTÃO** modelo sem recuperação pode bastar.
- **SE** há um único documento pequeno **ENTÃO** envie-o direto no contexto.
- **SE** o problema é formato ou comportamento **ENTÃO** instruções ou ajuste fino resolvem melhor.
- **SE** a resposta precisa de dado estruturado exato **ENTÃO** consulte banco ou API.
- **SE** a base é contraditória ou abandonada **ENTÃO** RAG só torna informação ruim mais fácil de achar. Corrija a base antes.

## 2. Responsabilidades de UX

### 2.1 Promessa e escopo
"Pergunte qualquer coisa" cria expectativa impossível. "Pergunte sobre as políticas de RH publicadas nesta base" é honesto. Mostre coleções disponíveis, período coberto, data da última atualização e exemplos do que está fora de escopo. Padrão relacionado: [`ai-uncertainty`](../../patterns/ai/ai-uncertainty.md).

### 2.2 Fontes e citações
Um experimento randomizado publicado em 2025 encontrou que citações aumentam a confiança declarada, que muitas citações não aumentam mais do que uma, e que só uma pequena fração (cerca de um décimo) das citações exibidas foi de fato aberta pelos participantes. `[evidência: contextual — contexto experimental específico, confiança autorrelatada]`

Consequência: citação funciona como **sinal visual de credibilidade** mesmo quando ninguém a abre. Por isso:
- cada afirmação importante aponta para a fonte que **realmente** a sustenta;
- é possível abrir o documento original e ver o trecho recuperado;
- título, origem, data e versão ficam visíveis;
- fontes diferentes para partes diferentes da resposta ficam distinguíveis;
- o que é **inferência** do sistema aparece separado do que está escrito na fonte;
- **NUNCA** acrescente link decorativo que não sustenta o que está ao lado.

Componente e regras visuais: [`ai-sources`](../../patterns/ai/ai-sources.md).

### 2.3 Estados de falha distintos
"Não encontrei informação suficiente" costuma ser melhor que uma resposta fluente e mal apoiada. Cada situação abaixo tem tratamento próprio; não as colapse num único "erro".

| Situação | Resposta de experiência |
|---|---|
| Nenhuma fonte relevante | Declarar ausência de evidência; sugerir reformulação ou outro caminho |
| Pergunta fora do escopo | Explicar o que a base cobre |
| Fontes conflitantes | Mostrar a divergência e as fontes de cada lado; não escolher em silêncio |
| Fonte desatualizada | Expor data/versão; alertar quando isso pode mudar a decisão |
| Fonte existe, mas sem permissão | Não revelar conteúdo nem título; oferecer caminho para pedir acesso |
| Falha técnica na recuperação | Diferenciar de "não existe"; oferecer tentar de novo |
| Resposta parcial | Indicar o que foi respondido e o que ficou sem base |

Recuperação de erro: [`ai-error-recovery`](../../patterns/ai/ai-error-recovery.md).

### 2.4 Latência
Recuperar, reordenar e montar contexto adiciona tempo; recuperação agêntica (várias consultas, várias fontes) adiciona mais.
- Espera curta: indicador simples.
- Espera longa: feedback ligado à tarefa ("consultando as 3 bases selecionadas", "comparando resultados").
- **NUNCA** encene raciocínio que não está acontecendo para deixar a espera mais interessante. Feedback descreve estado real.

### 2.5 Permissões
O filtro de permissão acontece **antes** do conteúdo chegar ao modelo, não depois na interface. Estados a projetar:
- fonte indisponível para esta pessoa;
- conteúdo que pede autenticação adicional;
- resposta parcialmente baseada em material restrito;
- permissão mudou no meio da conversa;
- citação que não pode expor título nem trecho;
- pessoas diferentes recebendo respostas diferentes para a mesma pergunta (e entendendo por quê).

### 2.6 Verificação, correção e contestação
"Não gostei" sozinho ensina pouco. Feedback útil identifica onde falhou:
- a fonte recuperada estava errada;
- a fonte estava certa e a resposta interpretou mal;
- a informação estava desatualizada;
- faltou uma fonte importante;
- correta, mas confusa;
- a pergunta foi entendida de outro jeito.

Cada categoria leva a uma correção diferente (base, recuperação, geração ou interface). Permita também contestar a resposta e pedir confirmação a uma área responsável. Revisão de resultado: [`review-ai-output`](../../patterns/ai/review-ai-output.md).

## 3. Contrato de resposta

Antes de desenhar a conversa, escreva o contrato. Exemplo:

```yaml
contrato_de_resposta:
  cita_fontes: obrigatorio_por_afirmacao_relevante
  separa_fato_de_inferencia: sim
  visivel_sem_expandir: [resposta_direta, condicoes, data_da_fonte]
  admite_nao_saber_quando: "nenhum trecho recuperado sustenta a afirmação central"
  exige_confirmacao_antes_de_agir: "qualquer ação derivada com risco >= alto"
  erros_bloqueantes: ["citar fonte que não sustenta", "expor conteúdo sem permissão"]
```

Estrutura recomendada para respostas sobre normas e políticas: resposta direta → condições → fonte de cada condição → data e versão → exceções e limites → ação necessária → caminho para confirmar com o responsável.

Exemplo ruim: "Sim, é permitido trabalhar remotamente até 30 dias." Sem fonte, sem vigência, sem exceções, sem dizer quem confirma.

## 4. Processo de trabalho

1. **Tarefa humana primeiro.** "Ajudar analistas a achar a política aplicável sem ler dezenas de PDFs" em vez de "criar um chatbot dos documentos".
2. **Mapear fontes e donos.** Repositórios, responsáveis, frequência de atualização, permissões, nível de autoridade.
3. **Coletar perguntas reais** (buscas, chamados, entrevistas): simples, ambíguas, incompletas, fora de escopo, multi-intenção, multi-fonte.
4. **Escrever o contrato de resposta.**
5. **Prototipar falhas antes do caminho feliz** (seção 2.3).
6. **Transformar as perguntas reais em evals** (ver `evals.md`, seção 5).
7. **Testar com pessoas:** entendem, percebem limites, encontram a fonte, sabem quando verificar, recuperam falhas?
8. **Trazer a produção de volta:** consultas sem resultado, reformulações, fontes abertas e reclamações viram casos de regressão.

## 5. Anti-padrões

- Promessa ilimitada ("pergunte qualquer coisa").
- Citação como enfeite, desvinculada da afirmação.
- Escolher silenciosamente uma entre fontes conflitantes.
- Tratar falha técnica e ausência de informação como a mesma mensagem.
- Filtrar permissão só na tela, depois do modelo já ter lido o conteúdo.
- Loading que finge etapas inexistentes.
- Medir qualidade só pelo texto, sem medir a tarefa.
- Aumentar confiança percebida sem verificar se a confiança é merecida.

## 6. Checklist

- [ ] O escopo da base (coleções, período, atualização) está visível.
- [ ] Fica claro quando a resposta usa fontes externas.
- [ ] Cada afirmação relevante está ligada à fonte que a sustenta; inferências são marcadas.
- [ ] A pessoa abre a origem, vê o trecho, a data e a versão.
- [ ] O sistema admite falta de evidência.
- [ ] Ausência de evidência, fora de escopo, conflito, desatualização, sem permissão e falha técnica têm estados distintos.
- [ ] Permissões são aplicadas antes da recuperação chegar ao modelo.
- [ ] A espera é comunicada sem encenação.
- [ ] Feedback identifica a camada da falha; há caminho para contestar.
- [ ] Recuperação, geração, citação e tarefa são avaliadas separadamente, e falhas de produção voltam para a suíte.
