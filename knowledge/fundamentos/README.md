# Fundamentos de UX/UI

> **Quando consultar**
> - Antes de projetar, construir ou revisar qualquer tela, fluxo ou texto de interface.
> - Para escolher qual arquivo carregar: leia a tabela abaixo e carregue só o que a tarefa pede.
> - Os fundamentos dão o **porquê** e as regras gerais; os pattern cards em `../../patterns/` dão a solução concreta para cada situação recorrente.

## Arquivos

| Arquivo | Conteúdo | Carregue quando |
|---|---|---|
| [heuristicas-nielsen.md](heuristicas-nielsen.md) | As 10 heurísticas com sinais de violação, perguntas de auditoria e correções; escala de severidade 0–4 | For revisar qualquer interface ou classificar a gravidade de um achado |
| [avaliacao-de-usabilidade.md](avaliacao-de-usabilidade.md) | Processo de avaliação heurística, cognitive walkthrough (4 perguntas), inspeção vs. teste, modelo de relatório | For conduzir uma revisão formal, simular um iniciante ou escrever relatório de achados |
| [psicologia-e-leis.md](psicologia-e-leis.md) | Carga cognitiva, Fitts, Hick, Gestalt, affordance e signifiers, modelos mentais, vieses (enquadramento, confirmação, kill your darlings) | Decidir quantidade de opções, tamanho e posição de alvos, agrupamentos, ou justificar por que algo confunde |
| [hierarquia-visual.md](hierarquia-visual.md) | Alavancas de hierarquia, regras numéricas (tipo, espaço, contraste), padrões de varredura, densidade, teste do borrão | Montar layout, definir escala tipográfica/espaçamento, ou quando "tudo parece igual" |
| [interacao-e-feedback.md](interacao-e-feedback.md) | Especificação de interação, limiares 0,1/1/10 s, feedback, microinterações e durações, estados vazios, onboarding | Especificar comportamento de controles, carregamentos, animações, vazios ou primeiro uso |
| [ux-writing.md](ux-writing.md) | Princípios, fórmulas (botão, erro, vazio, confirmação, sucesso), tom de voz em 4 dimensões, estilo pt-BR, glossário | Escrever ou revisar qualquer texto visível |
| [formularios.md](formularios.md) | Estrutura, ordem, rótulos, tipos de campo, teclados móveis e autocomplete, validação, erros, etapas, envio | Criar ou revisar qualquer formulário |
| [arquitetura-da-informacao.md](arquitetura-da-informacao.md) | Sistemas de AI, onde algo deve morar, navegação, rotulagem, findability e busca, user flow, fidelidade de wireframe/protótipo | Decidir estrutura, navegação e nomes; desenhar fluxo; escolher fidelidade |
| [dark-patterns.md](dark-patterns.md) | Catálogo (nome, reconhecimento, dano, alternativa) e linhas vermelhas que o agente deve recusar | Qualquer fluxo de compra, assinatura, cancelamento, consentimento ou pedido para "aumentar conversão" |
| [ux-md.md](ux-md.md) | Contrato do `UX.md`: schema do front matter, 13 seções, arquétipos de tela e regras de verificação T1–T7/F1–F5 | Criar, extrair ou avaliar o `UX.md`; antes de construir ou rearranjar tela num projeto que o tem |
| [fontes-de-ux.md](fontes-de-ux.md) | Fontes externas de UX (CamaraUX, GOV.UK, Carbon, Material, NN/g, leis de UX…), o que cada uma oferece e como usar sem copiar | Buscar ideias ou lacunas para padrões e arquétipos; antes de citar ou trazer conteúdo de fora |
| [tendencias.md](tendencias.md) | Sinais e hipóteses para 2027 (IA agêntica, interfaces generativas, confiança) | Discussões de direção; produtos com IA. Nunca como fonte de regra |

## Ordem sugerida por tipo de tarefa

- **Revisar uma tela:** heuristicas-nielsen → hierarquia-visual → ux-writing → (formularios, se houver) → dark-patterns.
- **Projetar uma feature nova:** arquitetura-da-informacao (fluxo e lugar) → psicologia-e-leis → hierarquia-visual → interacao-e-feedback → ux-writing.
- **Auditoria formal com relatório:** avaliacao-de-usabilidade + heuristicas-nielsen.
- **Projetar/rearranjar tela:** ux-md (arquétipo e políticas do `UX.md` do projeto) → hierarquia-visual → interacao-e-feedback → formularios (se houver) → ux-writing; skill `arranjar-tela`.
- **Texto apenas:** ux-writing.
- **Monetização, consentimento, retenção:** dark-patterns primeiro.

## Convenções destes arquivos

- Cada arquivo abre com "Quando consultar" e fecha com "Checklist de auditoria".
- Regras são imperativas; decisões aparecem como **SE → ENTÃO**; números são limiares práticos, não leis.
- Severidade sempre na escala 0–4 de [heuristicas-nielsen.md](heuristicas-nielsen.md).
- Acessibilidade aparece integrada, mas conformidade WCAG exige auditoria específica.
