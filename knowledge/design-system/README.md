# Base de conhecimento: Design System

## Quando consultar

- Antes de criar, alterar ou auditar qualquer token, componente ou tema deste repositório.
- Quando precisar decidir um valor (cor, tamanho de fonte, espaço, raio, duração) e não souber qual token usar.
- Quando for escrever ou avaliar um `DESIGN.md`, ou preparar um design system para ser consumido por agentes.
- Quando precisar justificar uma decisão de sistema (governança, versão, métrica) para pessoas.

Esta pasta é a referência normativa do framework para tudo que é **sistema**: fundações, componentes, acessibilidade embutida, governança e legibilidade por máquina. Padrões de interação pontuais (formulário, modal, busca etc.) ficam em `patterns/`; esta pasta diz **com que peças** e **com que regras** esses padrões são montados.

## Regras de leitura para agentes

1. Carregue **só o arquivo do assunto** da tarefa. Não carregue a pasta inteira por padrão.
2. Se a tarefa toca UI em código, carregue no mínimo `tokens.md` + o arquivo da fundação envolvida (cor, tipografia ou espaçamento).
3. Se a tarefa cria ou altera um componente, carregue `componentes.md` + `acessibilidade.md`.
4. Valores numéricos destes arquivos são o padrão do framework. Se o `DESIGN.md` do projeto declarar outro valor, **o projeto vence**, desde que não viole um mínimo WCAG.
5. Nenhum arquivo daqui autoriza valor cru em código de UI. Toda regra se aplica por token.

## Índice

| Arquivo | Conteúdo | Carregue quando |
|---|---|---|
| `tokens.md` | Três camadas (primitivo → semântico → componente), gramática de nomes, formato DTCG, aliases, temas, pipeline do repo e comandos | Criar/renomear token, adicionar tema, rodar o build, entender por que um componente não troca de tema |
| `cor.md` | Rampa OKLCH 50–950, papéis semânticos, contraste WCAG 2.2 (4,5 / 3 / 7), 1.4.11, modo escuro, nunca só cor, nota de visualização de dados | Escolher ou gerar cor, criar par texto/fundo, revisar tema escuro, gráfico |
| `tipografia.md` | Escalas modulares e razões, entrelinha, medida 45–75ch, tamanhos mínimos, pesos, tipografia fluida com `clamp()` | Definir hierarquia de texto, escolher razão, criar título responsivo |
| `espacamento-e-layout.md` | Grade 4/8, escala, semântica inset/stack/inline, densidade, grid e breakpoints, regras responsivas | Montar layout, decidir padding/gap, criar modo compacto, responsividade |
| `acessibilidade.md` | WCAG 2.2 AA mapeado por tipo de componente, foco visível e não obscurecido, alvo 24/44px, movimento reduzido | Qualquer componente interativo; revisão de acessibilidade |
| `componentes.md` | Níveis do Atomic Design, anatomia, matriz de estados obrigatórios, variantes, nomes de API, template de documentação, handoff, documentar DS a partir de site existente | Criar/documentar componente, preparar handoff, inventariar legado |
| `governanca-e-maturidade.md` | Critérios de qualidade, rubrica de maturidade, adoção, drift, SemVer, contribuição, argumentos de ROI | Avaliar um DS, propor mudança, versionar, defender investimento |
| `design-md.md` | O que é o DESIGN.md, schema do front matter, 8 seções, regras de escrita, conexão com agentes, rubrica de 100 pontos com 5 gates, auditoria em 5 passes, manutenção | Escrever, revisar ou pontuar um DESIGN.md |
| `design-system-para-ia.md` | Três camadas de documentação, checklist de legibilidade por máquina, limites declarativos de autonomia, rastreabilidade, governança de UI generativa | Preparar o sistema para agentes, definir o que um agente pode decidir sozinho |

## Rotas rápidas (SE → ENTÃO)

- **SE** vai escrever CSS/JSX/estilo **ENTÃO** leia `tokens.md` (seção "Consumo") e rode `node tools/lint-raw-values.mjs <pasta>` ao terminar.
- **SE** precisa de uma cor nova **ENTÃO** leia `cor.md`; gere com `tools/palette.mjs`; declare o par em `tokens/contrast-pairs.json`; rode `node tools/build-tokens.mjs`.
- **SE** precisa de um tamanho de texto **ENTÃO** use `font.size.*` existente; só gere escala nova com `tools/type-scale.mjs` se o projeto estiver definindo fundações.
- **SE** precisa de um espaço **ENTÃO** use primeiro o semântico (`space.inset-*`, `space.stack-*`, `space.inline-*`, `space.section`); só depois o primitivo `space.<n>`.
- **SE** o componente é interativo **ENTÃO** cumpra a linha correspondente em `acessibilidade.md` e a matriz de estados de `componentes.md`.
- **SE** a tarefa é "documentar o design system" **ENTÃO** combine `componentes.md` (inventário de legado) + `design-md.md` (formato de saída).
- **SE** a tarefa é "avaliar o design system" **ENTÃO** use `governanca-e-maturidade.md`; se o alvo é um `DESIGN.md`, use `design-md.md`.
- **SE** um agente vai gerar telas de forma autônoma **ENTÃO** leia `design-system-para-ia.md` antes de aceitar a tarefa.

## Artefatos do repositório citados nesta pasta

| Caminho | Papel |
|---|---|
| `tokens/primitives.tokens.json` | Camada 1: valores crus (cores 50–950, `space.*`, `radius.*`, `font.*`, `duration.*`, `easing.*`, `shadow.*`) |
| `tokens/semantic.light.tokens.json` | Camada 2, tema claro: papéis (`color.bg.*`, `color.text.*`, `space.inset-*`, `size.*` etc.) |
| `tokens/semantic.dark.tokens.json` | Camada 2, tema escuro: mesmas chaves de cor, valores diferentes |
| `tokens/contrast-pairs.json` | Pares texto/fundo e UI/fundo com mínimo exigido; validados nos dois temas |
| `tokens/build/` | Saída gerada (`tokens.css`, `tokens.light.json`, `tokens.dark.json`). Nunca editar à mão |
| `tools/build-tokens.mjs` | Resolve aliases, gera CSS/JSON e falha se algum par de contraste não passar |
| `tools/palette.mjs` | Gera rampa 50–950 em OKLCH a partir de uma cor |
| `tools/type-scale.mjs` | Gera escala tipográfica modular, estática ou fluida |
| `tools/spacing-scale.mjs` | Gera escala de espaço em grade de 4 ou 8 px |
| `tools/contrast.mjs` | Calcula contraste WCAG de um par ou de uma lista de pares |
| `tools/lint-raw-values.mjs` | Detecta valores crus em código de UI e calcula a métrica de drift |
| `templates/DESIGN.md` | Modelo de DESIGN.md do framework |
| `tools/lint-design-md.mjs` | Validador estrutural de DESIGN.md |

## Convenções comuns a todos os arquivos

- Cada arquivo começa com **Quando consultar**, segue com regras imperativas, decisões **SE → ENTÃO**, números, anti-padrões e termina com **Checklist**.
- Critérios WCAG citados referem-se à versão 2.2, nível AA, salvo indicação.
- Exemplos de código usam os nomes reais de tokens do repositório. Se um exemplo propõe um token que ainda não existe, o texto diz isso explicitamente.

## Checklist de uso desta pasta

- [ ] Carreguei apenas os arquivos relevantes para a tarefa.
- [ ] Conferi se o `DESIGN.md` do projeto sobrescreve algum valor padrão.
- [ ] Toda decisão visual da minha entrega aponta para um token existente.
- [ ] Rodei `node tools/build-tokens.mjs` se mexi em `tokens/`.
- [ ] Rodei `node tools/lint-raw-values.mjs` no código de UI que alterei.
- [ ] Cumpri a matriz de estados e a linha de acessibilidade de cada componente tocado.
