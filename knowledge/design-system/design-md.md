# DESIGN.md

## Quando consultar

- Ao criar o `DESIGN.md` de um projeto (novo ou existente) a partir de `templates/DESIGN.md`.
- Ao revisar, pontuar ou auditar um `DESIGN.md` existente.
- Ao conectar o `DESIGN.md` a um agente ou ferramenta de IA.
- Quando um agente gerou interface fora do padrão e é preciso descobrir que lacuna do arquivo permitiu isso.

## O que é

`DESIGN.md` é um arquivo Markdown na raiz do projeto que descreve a linguagem visual do produto para **pessoas e agentes** ao mesmo tempo. Tem duas camadas:

1. **Front matter YAML**: tokens estruturados, verificáveis por máquina (o "o quê").
2. **Corpo Markdown**: intenção, critérios de uso, hierarquia, estados, restrições (o "quando, por que e onde não").

Um valor sozinho não carrega decisão. Com só os tokens, o agente acerta a cor e erra o uso; com a prosa, ele decide como alguém do time decidiria.

O formato é uma especificação aberta em estágio alfa (`version: alpha`). Trate como instável: versione o arquivo e revise quando a especificação mudar.

### O que ele não é

- **Não é o design system inteiro.** Biblioteca de componentes, código, governança e contribuição continuam existindo; o `DESIGN.md` é a porta de entrada legível.
- **Não decide UX.** Não resolve arquitetura de informação, jornada ou adequação do problema; isso pertence à camada de contexto de UX (ver `design-system-para-ia.md`). Que tipo de tela é cada uma, onde fica a ação primária, quando confirmar e quais estados são obrigatórios vão no par dele, o `UX.md` (`knowledge/fundamentos/ux-md.md`), que tem a mesma rubrica de 100 pontos, os mesmos gates e a mesma regra de manutenção.
- **Não é `CLAUDE.md`/`AGENTS.md`.** Esses carregam instruções operacionais (comandos, arquitetura de código, restrições técnicas) e apenas **apontam** para o `DESIGN.md` e o `UX.md`.

## Schema do front matter (como no template do repo)

| Campo | Obrigatório | Conteúdo |
|---|---|---|
| `version` | sim | Versão do formato (`alpha`) |
| `name` | sim | Nome do produto |
| `description` | recomendado | Tipo de produto, público, densidade de uso |
| `owner` | recomendado (linter avisa) | Time ou pessoa que mantém |
| `updated` | recomendado (linter avisa) | Data da última revisão, `AAAA-MM-DD` |
| `colors` | sim (linter erra) | Papéis → hex. Nomes por papel: `canvas`, `surface`, `text-primary`, `text-secondary`, `border`, `border-strong`, `focus`, `primary`, `on-primary`, `danger`, `on-danger` |
| `typography` | sim (linter erra) | Níveis (`h1`, `body`, `label`…) com `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` |
| `spacing` | recomendado | Escala; chaves espelhando os multiplicadores do repo (`"1": 4px`, `"4": 16px`…) |
| `rounded` | recomendado | Raios (`sm`, `md`…) |
| `components` | recomendado | Componentes que **referenciam** tokens com `{grupo.chave}` |

```yaml
---
version: alpha
name: Exemplo
owner: time-plataforma
updated: 2026-10-01
colors:
  canvas: "#ffffff"
  surface: "#f4f7fc"
  text-primary: "#1f2226"
  text-secondary: "#4f5a6b"
  border-strong: "#7a8aa2"
  focus: "#5754ed"
  primary: "#5754ed"
  on-primary: "#ffffff"
typography:
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  "2": 8px
  "4": 16px
  "6": 24px
rounded:
  md: 8px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
---
```

Os hex acima são os valores resolvidos do tema claro deste repositório (`tokens/build/tokens.light.json`): `canvas` = `color.bg.canvas`, `primary` = `color.action.primary` etc. Quando o projeto usa o pipeline de tokens, **o front matter é derivado dos tokens, nunca o contrário**; diga isso no topo do corpo e qual fonte vence em conflito.

Convenções que o linter usa:

- Para cada cor de fundo com texto, declare `on-<papel>`; o par `on-X` sobre `X` é checado a 4,5:1.
- `text-*` e `link` são checados a 4,5:1 contra `canvas`/`background`/`surface`; `border-strong`, `focus` e `primary` a 3:1 contra o primeiro fundo.
- Referência `{grupo.chave}` inexistente é erro. Cor crua dentro de `components` é aviso.
- Prefira YAML em bloco (uma chave por linha): é mais fácil de revisar em diff. Sempre coloque referências entre aspas (`"{colors.primary}"`); sem aspas, YAML pode interpretá-las como mapa. O linter aceita mapas em linha simples (`{ sm: 4px, md: 8px }`), mas não listas aninhadas nem texto multilinha.

## As 8 seções do corpo

| # | Seção (`##`) | Deve responder |
|---|---|---|
| 1 | Overview | Direção visual em critérios observáveis; tipo de uso (tarefa × vitrine); densidade; o que a interface nunca faz |
| 2 | Colors | Papel → token → onde aparece → onde nunca aparece; regras de contraste; "cor nunca é o único sinal"; tema escuro |
| 3 | Typography | Hierarquia (quem é título único, quem agrupa, quem é leitura); escala e razão; mínimos; pesos; medida |
| 4 | Layout | Grade de espaço, ritmo vertical (rótulo/campo, campos, grupos, seções), contêineres, breakpoints, mobile, posição das ações primárias |
| 5 | Elevation & Depth | Como camadas se distinguem (superfície, borda, sombra); limite de empilhamento |
| 6 | Shapes | Raio por tipo de elemento; linguagem de ícones |
| 7 | Components | Para cada componente central: quando usar, variantes, todos os estados, contraindicações |
| 8 | Do's and Don'ts | Blocos **Faça** e **Não faça**, ≥ 3 itens cada, derivados de erros reais |

Recomendadas (o linter avisa se faltarem): **Accessibility** (meta WCAG, foco, alvo, movimento reduzido, zoom, alternativa textual) e **Agent Instructions** (quando consultar, o que preservar, como validar). O linter aceita títulos em pt-BR equivalentes (Visão geral, Cores, Tipografia, Layout e espaçamento, Elevação, Formas, Componentes, Faça e não faça, Acessibilidade, Instruções para agentes).

## Especificação oficial e linter oficial

O formato tem especificação pública do Google Labs (versão `alpha`, licença Apache-2.0) e uma CLI própria, o pacote `@google/design.md`, usável sem instalar com `npx -y @google/design.md <comando>`:

| Comando | Para que serve |
|---|---|
| `lint DESIGN.md` | Relatório JSON com achados por severidade: referência quebrada, falta de cor primária ou de tipografia, contraste abaixo de AA, token declarado e nunca usado, seções fora da ordem canônica, chave desconhecida |
| `diff A.md B.md` | Mudanças token a token entre duas versões e regressões |
| `export --format dtcg\|json-tailwind\|css-tailwind DESIGN.md` | Tokens em W3C DTCG, Tailwind v3 (`theme.extend`) ou Tailwind v4 (`@theme`) |
| `spec [--rules]` | A especificação e as regras do linter, na versão instalada |

Use os dois linters: o do DSX (`tools/lint-design-md.mjs`) cobre os gates de qualidade da rubrica (pares de contraste declarados, prosa vaga, seções recomendadas); o oficial cobre conformidade ao formato. Divergências conhecidas entre o DSX e a especificação oficial:

- **Sub-tokens de componente.** A especificação aceita só `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. O DSX também usa `borderColor` (o template e `examples/DESIGN.md`), e o linter oficial avisa a cada uso. **SE** o arquivo vai para uma ferramenta que segue estritamente a especificação **ENTÃO** descreva a borda na prosa da seção Components e no papel de cor (`border`, `*-border`), sem o sub-token.
- **Seções recomendadas.** Accessibility e Agent Instructions são exigência do DSX, não da especificação; o linter oficial não reclama da ausência nem da presença.
- **Títulos em pt-BR.** O linter do DSX aceita os equivalentes em português; o oficial verifica a ordem pelos nomes canônicos em inglês. Para máxima compatibilidade, use os títulos canônicos.

Referências prontas no formato, para escolher e adaptar: `escolher-design-system.md`.

## Regras de escrita

1. **Critério observável no lugar de adjetivo.** "Moderno, clean, elegante" não orienta. Escreva "no máximo uma cor de destaque por viewport; hierarquia por tamanho e peso; cards sem sombra no tema claro". O linter avisa sobre adjetivos vagos.
2. **Ligue cada token à intenção.** Para cada cor: onde aparece, onde não aparece, papel na hierarquia.
3. **Escreva hierarquia, não inventário.** "H1 é o título único da página; H2 agrupa blocos; corpo é leitura e texto funcional" vale mais que a lista de tamanhos.
4. **Números em vez de "bonito".** Contraste mínimo, alvo de toque, largura de linha, durações.
5. **Do/Don't nascem de falhas reais** observadas em gerações anteriores ou em produção. Platitude ("seja consistente") não conta.
6. **Só documente o que existe** em produção ou foi deliberadamente decidido. Componente inventado é a origem mais comum de alucinação do agente.
7. **Marque o inferido.** Ao documentar produto existente, separe "observado no código" de "inferido".
8. **Prosa não contradiz tokens.** Se o texto diz "raio 8px" e o token diz 12px, o arquivo reprova.
9. **Instrução para o agente em três partes**: quando consultar (antes de qualquer mudança de UI), o que preservar (tokens e componentes existentes), como validar (comandos e checklist).

## Fluxo de criação

1. **Defina a fonte da verdade**: produto existente (documente o que está em uso), design system com tokens (traduza), projeto novo (decida a direção antes), referência externa (adapte, nunca copie).
2. **Copie `templates/DESIGN.md` para a raiz** do projeto.
3. **Preencha o front matter** a partir dos tokens resolvidos (`tokens/build/tokens.light.json`) ou dos valores observados.
4. **Escreva as 8 seções + 2 recomendadas**, com intenção e critérios.
5. **Valide**: `node tools/lint-design-md.mjs DESIGN.md` (use `--json` para máquina). Sai com 0 se os gates objetivos passam, 1 caso contrário.
6. **Compare por amostragem** com produção ou com o arquivo de design.
7. **Conecte ao agente** e faça uma geração controlada (ver auditoria, passe 5).

Extração automática a partir de um site ou do CSS é aceitável como **rascunho**: ela captura valores, não intenção, estados, acessibilidade nem guardrails. Curadoria humana é obrigatória.

## Conectar aos agentes

- **Nunca assuma autodescoberta.** Configure pelo mecanismo nativo de cada ferramenta.
- Agente de terminal com arquivo de memória do projeto: importe o arquivo no `CLAUDE.md`/`AGENTS.md` (ex.: linha `@DESIGN.md`) junto da instrução de quando consultá-lo.
- Editores com regras de projeto: crie uma regra no diretório de regras da ferramenta, com escopo (`globs`) para arquivos de UI, apontando para o `DESIGN.md`.
- **Fonte única**: as regras de cada ferramenta apenas referenciam o `DESIGN.md`; não copiam conteúdo dele.
- **Carga contextual**: não injete o contexto visual em tarefas sem UI (migração de banco, infraestrutura).
- Siga a documentação atual de cada ferramenta; sintaxe obsoleta falha em silêncio.

Esqueleto de pedido de geração: "Leia o DESIGN.md antes. Objetivo: <tarefa do usuário>. Use apenas tokens e componentes existentes; justifique qualquer variante nova. Inclua estados vazio, carregando, erro, sucesso, foco e desabilitado. Ao final, liste os tokens e componentes usados."

Esqueleto de auditoria pós-geração: comparar cores, tipografia, espaço e raio com o `DESIGN.md`; checar reuso de componentes; checar estados e acessibilidade; listar divergências e corrigir **só** elas. Depois, revisão humana: o agente garante coerência, não julgamento de UX.

## Rubrica de 100 pontos

Princípio: **pontue o quanto o arquivo poupa o agente de adivinhar.**

| Critério | Peso | Pergunta |
|---|---:|---|
| Fidelidade à fonte | 15 | Tokens, componentes e regras correspondem ao produto ou a um sistema deliberadamente definido? |
| Validade técnica | 10 | Estrutura interpretável, linter aprovado, referências resolvidas? |
| Tokens semânticos | 10 | Nomes por função, escalas coerentes, sem duplicação arbitrária? |
| Intenção e prosa | 15 | A prosa explica decisões que o valor sozinho não explica? |
| Componentes e estados | 15 | Componentes críticos têm variantes e estados relevantes? |
| Acessibilidade | 15 | Regras verificáveis (números, critérios), não frase genérica? |
| Responsividade e casos extremos | 8 | Mobile, conteúdo longo, vazio/erro/carregando? |
| Guardrails | 5 | Restrições específicas contra erros recorrentes? |
| Operação com agente | 4 | O arquivo comprovadamente chega ao contexto do agente? |
| Manutenção | 3 | Dono, data, rotina de revisão? |

Faixas: **90–100** fonte confiável; **75–89** utilizável com lacunas controladas; **60–74** revisar antes de virar autoridade; **< 60** alto risco: o agente vai inventar decisões centrais.

### Cinco gates (reprovam independentemente da nota)

1. Erro estrutural ou referência não resolvida. *(automatizado: `lint-design-md`)*
2. Contradição com o produto ou a fonte sem justificativa documentada.
3. Falha de contraste em combinação essencial (ex.: texto principal sobre fundo abaixo de 4,5:1). *(automatizado para os pares declarados)*
4. O arquivo nunca chega à ferramenta em que o agente trabalha.
5. Instruções conflitantes para o mesmo contexto.

## Auditoria em cinco passes

1. **Estrutura**: rode `node tools/lint-design-md.mjs`. Corrija todos os `ERRO` antes de qualquer julgamento.
2. **Fonte da verdade**: amostre tokens, tipografia e 3+ componentes contra produção, código ou arquivo de design.
3. **Lacunas de improvisação**: leia como alguém que nunca viu o produto; anote cada decisão que ainda exige inferência (qual botão é primário? o que fazer com texto longo? como mostrar erro?).
4. **Pontuar e aplicar gates**: nota por critério com evidência; qualquer gate reprovado = reprovado.
5. **Geração controlada**: peça uma tela nova usando só o contexto do projeto + `DESIGN.md`. Registre o que o agente inventou (cores, componentes, estados ausentes); rode `tools/lint-raw-values.mjs` no resultado. Cada invenção vira correção no arquivo ou novo item de "Não faça". Repita a mesma tarefa mais de uma vez: saída gerativa varia.

## Manutenção

- Versione junto com o código; `updated` atualizado a cada revisão; `owner` explícito.
- Revise quando: tokens mudarem, componente ganhar regra, linguagem visual evoluir, comportamento experimental virar padrão, ou uma geração controlada revelar invenção recorrente.
- Rode o linter no CI em todo PR que toque `DESIGN.md` ou `tokens/`.
- Audite periodicamente instruções conflitantes entre `DESIGN.md`, `CLAUDE.md`/`AGENTS.md` e regras de ferramentas; remova o obsoleto.

## Anti-padrões

- Copiar o template sem adaptar (o linter acusa placeholders `<…>`).
- Lista de valores sem intenção.
- Componentes que não existem em produção.
- Texto contradizendo tokens.
- Mesmo conteúdo duplicado em várias regras de ferramenta.
- Tratar a especificação alfa como definitiva.
- Usar o `DESIGN.md` para decisões de pesquisa ou de jornada.

## Checklist

- [ ] Front matter com `version`, `name`, `owner`, `updated`, `colors`, `typography` e `components` por referência.
- [ ] Pares `on-*` declarados para todo fundo com texto.
- [ ] 8 seções obrigatórias + Accessibility + Agent Instructions preenchidas.
- [ ] Sem adjetivos vagos; regras com números.
- [ ] Do/Don't com ≥ 3 itens cada, vindos de falhas reais.
- [ ] `node tools/lint-design-md.mjs` aprovado.
- [ ] Arquivo importado/referenciado no mecanismo nativo de cada ferramenta usada.
- [ ] Geração controlada feita; invenções corrigidas.
- [ ] Nota ≥ 75 e nenhum gate reprovado.
