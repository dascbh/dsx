# Base de conhecimento: IA

> **Quando consultar este índice**
> - No início de qualquer tarefa que envolva um recurso com IA no produto (agente, assistente, busca com IA, interface gerada, voz/câmera, conteúdo sintético).
> - Quando a tarefa usa IA **no processo** de design ou pesquisa (vibe coding, gerador de wireframe, síntese de entrevistas, personas sintéticas).
> - Para escolher qual documento carregar. Carregue **só** os documentos indicados pela tabela de roteamento; não carregue a pasta inteira.

## O que esta pasta cobre

Conhecimento de fundo, escrito para agentes, sobre como projetar, avaliar e documentar experiências com IA. Os documentos explicam **por que** e **quando**; as regras de componente ficam nos cards de padrão em `patterns/ai/`, que estes documentos referenciam em vez de repetir.

| Arquivo | Assunto | Carregar quando |
|---|---|---|
| [`ux-para-agentes.md`](ux-para-agentes.md) | Seis princípios, matriz de autonomia por risco, confirmação, progresso, recuperação, permissões, handoff, fluxo em fases, métricas | O sistema **age** em nome da pessoa (envia, publica, altera, compra, concede acesso) |
| [`generative-ui.md`](generative-ui.md) | Interface composta em tempo de uso: níveis de maturidade, invariantes, catálogo declarativo, fallbacks, quando a UI fixa vence | O produto escolhe dinamicamente qual forma de interface mostrar |
| [`multimodal.md`](multimodal.md) | Tela, toque, texto, voz e câmera numa mesma tarefa com estado único; privacidade de captura; fallback | Adição de voz, câmera, áudio ou alternância de modalidade |
| [`evals.md`](evals.md) | Quatro camadas, seis passos, tipos de avaliador, métricas de RAG e agentes, scorecard, rubricas, calibração de juiz-LLM, rubrica YAML para UI gerada | Antes de lançar ou alterar recurso com IA; ao julgar saídas geradas |
| [`rag-e-fontes.md`](rag-e-fontes.md) | Papel de UX em respostas baseadas em documentos: escopo, citações, estados de falha, permissões, latência, contrato de resposta | Assistente de conhecimento, busca com IA, respostas com fontes |
| [`evidencia-e-fontes.md`](evidencia-e-fontes.md) | Evidência × sinal × previsão, sete perguntas, hierarquia de confiança e tags de nível | Ao escrever ou revisar **qualquer** skill, card ou documento com afirmações |
| [`pesquisa-com-ia.md`](pesquisa-com-ia.md) | Síntese de pesquisa rastreável, prompt de advogado do diabo, doutrina de personas sintéticas | IA aplicada a entrevistas, testes, feedback; proposta de usuário simulado |
| [`divida-de-experiencia.md`](divida-de-experiencia.md) | Dívida de experiência com IA, ressaca do vibe coding, geradores de wireframe, controles e papéis do designer | Telas, fluxos ou código gerados por IA; time acelera e qualidade cai |
| [`conteudo-sintetico.md`](conteudo-sintetico.md) | Rotulagem de conteúdo de IA, metadados (EXIF, IPTC, XMP, ICC), C2PA, marcas d'água, limites da detecção | Exibir conteúdo gerado; fluxos de imagem; recurso de verificação de origem |

## Roteamento rápido (SE → ENTÃO)

- **SE** a tarefa é "o agente vai fazer X pelo usuário" **ENTÃO** carregue `ux-para-agentes.md` + `evals.md` (seção de agentes).
- **SE** a resposta da IA cita documentos ou bases **ENTÃO** carregue `rag-e-fontes.md`.
- **SE** a IA decide entre tabela, formulário, gráfico ou controles **ENTÃO** carregue `generative-ui.md` + `evals.md` (rubrica da seção 8).
- **SE** entra voz ou câmera **ENTÃO** carregue `multimodal.md`.
- **SE** um agente de código vai gerar telas a partir do DESIGN.md e do UX.md **ENTÃO** carregue `divida-de-experiencia.md` + `evals.md`.
- **SE** alguém quer "validar com usuários sintéticos" ou "a IA sintetizou as entrevistas" **ENTÃO** carregue `pesquisa-com-ia.md`.
- **SE** você está escrevendo uma skill, card ou documento deste framework **ENTÃO** carregue `evidencia-e-fontes.md` e marque o nível de cada afirmação.
- **SE** a tela exibe conteúdo gerado ou lida com upload/exportação de imagens **ENTÃO** carregue `conteudo-sintetico.md`.

## Cards de padrão relacionados

Regras de componente, com decisão, faça/evite, acessibilidade e checklist:

| Card | Problema |
|---|---|
| [`ai-uncertainty`](../../patterns/ai/ai-uncertainty.md) | Comunicar limites e incerteza de forma acionável |
| [`ai-sources`](../../patterns/ai/ai-sources.md) | Mostrar fontes e critérios das respostas |
| [`review-ai-output`](../../patterns/ai/review-ai-output.md) | Revisar e editar o que a IA gerou antes de usar |
| [`ai-error-recovery`](../../patterns/ai/ai-error-recovery.md) | Erros de IA e caminhos de recuperação |
| [`confirm-ai-action`](../../patterns/ai/confirm-ai-action.md) | Confirmar ações executadas pela IA |
| [`label-ai-content`](../../patterns/ai/label-ai-content.md) | Indicar que um conteúdo foi gerado por IA |

## Princípios transversais

Valem para todos os documentos desta pasta:

1. **Calibrar confiança, não maximizá-la.** A pessoa precisa saber quando confiar, quando verificar e quando assumir o controle.
2. **Autonomia proporcional ao risco; reversibilidade por padrão.** Nenhuma automação irreversível em fluxo sensível sem confirmação específica.
3. **Saída de IA é hipótese até validação.** Vale para síntese de pesquisa, persona, wireframe e código.
4. **Rastreabilidade.** Insight leva ao trecho de origem; resposta leva à fonte; ação leva a quem aprovou.
5. **Design system como infraestrutura de governança.** Tokens, catálogo e regras de uso limitam o que é gerado.
6. **Avaliar em camadas.** Código onde for determinístico, juiz-LLM calibrado onde for semântico, pessoas onde exigir julgamento; gates separados de metas.
7. **Nível de evidência declarado** em toda afirmação (tags `alta`, `contextual`, `sinal`, `hipótese`).
8. **Acessibilidade como critério testável**, inclusive em composições geradas e em todas as modalidades.

## Convenções dos documentos

- Cabeçalho YAML com `id`, `area`, `titulo`, `evidencia` (nível predominante do documento) e `relacionados`.
- Bloco **Quando consultar** no topo; regras no imperativo; decisões no formato **SE → ENTÃO**; seções de **anti-padrões** e **checklist** no fim.
- Exemplos e valores são fictícios e neutros. Limiares numéricos marcados como "exemplo" devem ser definidos e registrados pelo produto.
- Normas públicas citadas quando aplicável: WCAG (contraste, modalidades de entrada), C2PA (procedência), NIST AI RMF (gestão de risco).

## Manutenção

- Áreas como generative UI e agentes estão em evolução rápida; regras apoiadas em `sinal` devem ser revistas quando surgir evidência nova.
- Ao atualizar um documento, mantenha o vínculo com os cards em vez de copiar suas regras.
- Falhas observadas em produção devem virar casos em `evals/` e, se mudarem uma regra, atualização aqui.
