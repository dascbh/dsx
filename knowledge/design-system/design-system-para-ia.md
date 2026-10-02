# Design system para IA

## Quando consultar

- Ao preparar um design system para ser consumido por agentes que geram ou alteram interface.
- Ao definir o que um agente pode decidir sozinho, o que precisa de revisão e o que precisa de aprovação.
- Ao projetar ou governar UI generativa (interface montada dinamicamente por IA).
- Quando a saída de um agente "parece certa" visualmente mas está errada para o contexto.

## Tese

Consistência visual não é qualidade de experiência. Um agente com acesso só à biblioteca reproduz a aparência do produto sem entender as razões: usa o componente certo no momento errado, simplifica uma etapa necessária, transforma uma regra contextual em universal. Um design system preparado para IA conecta **linguagem visual, contexto de UX e governança**, e torna cada uma dessas camadas encontrável, atualizável e verificável por máquina.

Automação amplifica a estrutura que recebe: sistema inconsistente gera código inconsistente mais rápido.

## Três camadas de documentação (mais governança)

| Camada | Documenta | Arquivo / lugar | Serve a |
|---|---|---|---|
| Linguagem visual | Tokens, tipografia, formas, componentes, racional de aplicação | `DESIGN.md` + `tokens/` | Agentes, design, desenvolvimento |
| Operação | Comandos, arquitetura de código, convenções técnicas, limites do agente | `CLAUDE.md` / `AGENTS.md` / regras de ferramenta | Agentes de código |
| Contexto de UX | Usuários, problemas, evidências, modelos mentais, vocabulário real, padrões de interação validados, riscos | Base de contexto de UX do projeto (pesquisa, personas, JTBD, achados) | Produto, design, pesquisa, agentes |
| Governança (transversal) | Revisão, acessibilidade, aprovação, reversibilidade, autonomia | Política do projeto + gates automatizados | Time responsável |

Regras:

1. **Não misture camadas.** Decisão de pesquisa no `DESIGN.md` incha o arquivo e fica sem sustentação; regra de experiência espalhada em instruções operacionais se perde.
2. **Cada camada referencia as outras**, não as copia. `CLAUDE.md` aponta para o `DESIGN.md`; o `DESIGN.md` aponta para o contexto de UX quando uma regra visual depende de uma necessidade documentada.
3. **O contexto de UX não precisa ser um arquivo gigante.** Precisa ser encontrável a partir da decisão que ele sustenta.

Exemplo: numa tarefa contínua de comparação de itens, um agente só com componentes escolhe um modal de confirmação porque o componente existe. Com o contexto registrando que as pessoas comparam antes de decidir e que a ação é reversível, a composição muda: confirmação no fluxo, comparação visível, opção de desfazer. Mesmas peças, decisão diferente, justificada por evidência.

## Checklist de legibilidade por máquina

Um agente consegue usar o sistema sem adivinhar quando:

| Item | Como este repo atende |
|---|---|
| Tokens nomeados por papel | Camada semântica (`color.text.*`, `space.stack-*`…) |
| Referências entre tokens, sem duplicação | Aliases DTCG `{…}` resolvidos e validados por `tools/build-tokens.mjs` |
| Descrição de uso nos tokens ambíguos | `$description` (ex.: `color.border.strong`, `size.touch-target`) |
| Regras de composição e proibições explícitas | Seções Components e Do's and Don'ts do `DESIGN.md`; `patterns/` |
| Catálogo de componentes com propriedades, contextos de uso e **combinações inválidas** | Template de documentação em `componentes.md` |
| Estados e fallbacks especificados | Matriz de estados em `componentes.md` |
| Acessibilidade mensurável | `tokens/contrast-pairs.json`; matriz em `acessibilidade.md` |
| Níveis de autonomia e pontos de aprovação | Tabela de limites declarativos (abaixo), registrada no projeto |
| Origem, data e escopo de cada regra | Registro de rastreabilidade (abaixo) |
| Dono e rotina de revisão | `owner`/`updated` no `DESIGN.md` |
| Validação automática | `build-tokens --check`, `lint-design-md`, `lint-raw-values` |

Formatos que ajudam máquinas: JSON DTCG, YAML de front matter, tabelas Markdown com colunas fixas, frases imperativas com SE → ENTÃO, números com unidade. Formatos que atrapalham: imagens sem texto, regras implícitas em exemplos, prosa sem estrutura, documentação só dentro da ferramenta de design.

## Limites declarativos de autonomia

Escreva, por projeto, o que o agente **decide sozinho**, o que **propõe para revisão** e o que **exige aprovação** antes de chegar a usuários. Não deixe implícito.

| Nível | O agente pode | Exemplos |
|---|---|---|
| Autônomo | Executar e relatar | Compor tela com componentes e tokens existentes; aplicar estados obrigatórios; corrigir drift apontado pelo linter; ajustar espaçamento dentro da escala |
| Revisão | Implementar como proposta, marcada para revisão humana | Nova variante de componente; novo token semântico; mudança de hierarquia de uma tela existente; texto de erro ou de confirmação novo |
| Aprovação | Apenas propor; não implementar sem aprovação explícita | Novo componente; mudança de token primitivo ou de marca; remoção/renomeação de token (MAJOR); exceção a regra de acessibilidade; fluxo que envolve dinheiro, dados pessoais, permissões, publicação externa ou ação irreversível |
| Proibido | Nunca | Valor cru em código de UI; contornar gates de contraste; remover foco visível; automatizar ação irreversível sem confirmação e caminho de recuperação |

SE → ENTÃO:

- **SE** a tarefa cabe no catálogo e nos tokens **ENTÃO** execute (autônomo) e liste os tokens/componentes usados.
- **SE** nenhum componente existente resolve **ENTÃO** pare e proponha (aprovação); não crie componente "provisório".
- **SE** a regra visual conflita com uma necessidade de UX documentada **ENTÃO** a necessidade vence; registre a exceção e peça revisão.
- **SE** não há contexto de UX para a decisão **ENTÃO** declare a suposição explicitamente no resultado; não a apresente como fato.
- **SE** a ação afeta dados ou terceiros de forma irreversível **ENTÃO** a interface precisa de confirmação específica (ação, alvo, consequência) e de recuperação.

## Rastreabilidade

Toda regra de contexto (e toda exceção) registra:

| Campo | Exemplo de conteúdo |
|---|---|
| Regra | "Confirmação de exclusão é inline com desfazer, não modal" |
| Origem | Achado de pesquisa, decisão de produto, requisito legal, incidente |
| Evidência | Referência ao estudo, ticket, teste, métrica |
| Data | Quando foi decidida |
| Escopo | Em que fluxos vale; onde **não** vale |
| Limitações | O que a evidência não cobre |
| Dono | Quem pode alterar |
| Revisão | Quando revisar ou condição que invalida a regra |

Regras:

- Regra sem origem é tratada como **suposição**, e o agente deve dizê-lo ao usá-la.
- Saída de IA (síntese, persona sintética, sugestão) é **hipótese** até validação humana; nunca entra no registro como evidência.
- Ao gerar interface, o agente lista quais regras de contexto aplicou. Isso permite auditar decisões, não só pixels.
- Riscos a vigiar: **desalinhamento semântico** (visual certo, contexto errado), **decisão distribuída** (cada prompt interpreta a marca de um jeito) e **deriva documental** (pesquisa evolui, contexto envelhece).

## Governança de UI generativa

UI generativa é interface criada ou adaptada por IA durante o uso, a partir da intenção, do contexto e dos dados. O design system deixa de ser só biblioteca e vira **infraestrutura de governança**: define o que pode ser montado, como e com que portões de qualidade.

### Princípios

1. **Resultado antes de layout.** Especifique objetivo, restrições e critérios de qualidade, não a posição de cada elemento.
2. **Liberdade controlada.** Catálogo aprovado de componentes, combinações permitidas e proibidas, regras documentadas.
3. **Invariantes fixos.** Navegação, identidade, mensagens legais e ações de alto risco não são geradas; só áreas contextuais se adaptam.
4. **Especificação declarativa, não código arbitrário.** O agente produz uma descrição (componente + propriedades + dados) que o sistema renderiza com componentes reais. Execução de código gerado em tempo de uso é risco de segurança e de consistência.
5. **Acessibilidade na infraestrutura.** Como as combinações explodem, semântica, ordem de foco e contraste precisam vir garantidos pelos componentes e validados na composição.
6. **Fallback sempre.** Toda geração tem estado de carregamento, erro e uma versão estática de reserva.

### Níveis de maturidade

| Nível | O que é gerado | Controle exigido |
|---|---|---|
| 1. Controles contextuais | Botões, campos, opções inseridos numa estrutura estável | Catálogo de controles; validação de propriedades |
| 2. Composição de componentes | Cards, tabelas, formulários, gráficos montados a partir do catálogo | Esquema declarativo; regras de combinação; checagem de contraste e semântica pós-composição |
| 3. Experiência específica de tarefa | Página ou ferramenta inteira (painel, simulador) | Tudo acima + avaliação dinâmica, revisão humana por amostragem, invariantes protegidos |

Comece no nível 1. Suba de nível só com gates do nível atual automatizados.

### Quando usar e quando não usar

- **Use** quando há grande variação de contexto ou de combinações de dados, trabalho exploratório/analítico, ou quando gerar elimina esforço de digitação.
- **Prefira interface fixa** para tarefas frequentes que dependem de velocidade e memória espacial, operações de alto risco, ambientes regulados e ações simples.

### Fluxo de design

1. Definir resultados e critérios de sucesso (não telas).
2. Catalogar componentes confiáveis com regras, contextos, propriedades e combinações inválidas.
3. Projetar estados de falha: carregando, erro, sem dados, fallback.
4. Avaliar continuamente: adequação do formato à tarefa, completude da informação, conclusão da tarefa, consistência entre variações geradas.

### Gates automatizáveis para saídas geradas

- Zero valor cru: `node tools/lint-raw-values.mjs <saída>` (drift = 0).
- Só componentes do catálogo (validação do esquema declarativo).
- Pares de contraste da composição dentro dos mínimos (`tools/contrast.mjs`).
- Estados obrigatórios presentes para cada componente interativo.
- Mesma tarefa executada várias vezes: medir taxa de tokens fora do sistema, componentes inventados e estados ausentes. Saída gerativa varia; uma execução não prova nada.

## Anti-padrões

- Entregar ao agente só a biblioteca visual e esperar decisões de UX corretas.
- Um "arquivo de contexto" único misturando visual, operação e pesquisa.
- Regras sem origem nem data.
- Autonomia implícita: o agente cria componentes porque ninguém disse que não podia.
- Variabilidade sem propósito: gerar de novo algo que deveria ser estável, destruindo memória espacial.
- UI gerada sem fallback, sem estado de erro ou sem caminho para recuperar controle.
- Avaliar geração por uma amostra única ou só por aparência.
- Tratar persona sintética ou síntese automática como evidência.

## Checklist

- [ ] Três camadas separadas e referenciadas entre si (visual, operação, contexto de UX), mais política de governança.
- [ ] Itens do checklist de legibilidade por máquina atendidos.
- [ ] Tabela de autonomia (autônomo / revisão / aprovação / proibido) registrada no projeto.
- [ ] Regras de contexto com origem, evidência, data, escopo, dono e revisão.
- [ ] Agente lista tokens, componentes e regras de contexto aplicados em cada entrega.
- [ ] UI generativa com catálogo, combinações proibidas, invariantes, especificação declarativa e fallback.
- [ ] Gates automatizados rodando sobre a saída gerada, com múltiplas execuções.
