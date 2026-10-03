---
name: figma-ciclo
description: "Governa o ciclo código ↔ Figma: de quem é a vez, como a rodada abre e fecha, registro de sincronia, changelog, gates e baseline. Use ao montar o ciclo, antes de reespelhar um arquivo refinado ou quando código e Figma divergiram."
---

# figma-ciclo — a única regra que faz o ida-e-volta funcionar

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

O ciclo é simples de descrever e fácil de quebrar:

```
código ──espelho──▶ Figma ──refino──▶ Figma ──aplicação──▶ código ──▶ (repete)
```

O que o quebra é sempre a mesma coisa: **alguém reespelha o arquivo depois que
o designer refinou**, e o script sobrescreve o trabalho dele. Nenhuma habilidade
técnica evita isso — só uma regra de autoridade declarada em disco.

## A regra: um lado é autoritativo por vez

| vez | significa | proibido |
|---|---|---|
| **`code`** | o Figma é espelho; o código manda | refinar no Figma esperando que sobreviva |
| **`design`** | há refinamento em curso no Figma | **reespelhar**, sob qualquer pretexto |
| **`applying`** | as propostas estão virando código | mexer nos mesmos arquivos por fora |

A vez fica escrita no repositório. Se não estiver escrita, você não sabe de quem
é a vez — e a resposta correta é **perguntar antes de escrever qualquer coisa**,
nos dois lados.

A regra não depende só de disciplina: o hook `turn-guard` do DSX lê o registro
abaixo e **nega** qualquer `use_figma` que escreva no arquivo enquanto a vez for
`design` (leitura — snapshot, inventário, diff — passa sempre). Para ler ou
trocar a vez, use `/dsx:figma-vez`.

## O registro de sincronia

Um arquivo versionado no repo — `design/figma-sync.md` ou equivalente. É curto
de propósito; ninguém mantém o que é longo.

```markdown
# Sincronia com o Figma

file: S8z0…  ·  https://figma.com/design/S8z0…
turn: design                        # code | design | applying
since: 2026-08-20
baseline: design/figma-baseline/   # retrato canônico — é o "antes" do diff

## Rodadas
- r1 · 2026-08-14 · espelho completo (00–08, 134 frames) · turn → code
- r2 · 2026-08-20 · refino de densidade das listas · turn → design

## Pendentes (escopo desta rodada, ainda não construído)
- Nenhuma

## Propostas abertas
09 · Propostas → “Demandas · lista densa”, “Chip de status sem borda”

## Aplicadas na última rodada
- Espaçamento de célula 8→6px  → token `space/stack-sm`, tema
- Contador do SectionCard em tabular-nums → primitivo `SectionCard`

## Recusadas (com motivo, para não voltarem)
- Chip sem borda — cor deixaria de ser acompanhada de forma (2º canal)

## Divergências conhecidas
- Nenhuma
```

Ao ler, o registro aceita os nomes antigos em português — `vez:` no lugar de
`turn:`, `arquivo:`/`desde:` no lugar de `file:`/`since:` e os valores `codigo`
e `aplicando` no lugar de `code` e `applying` — com o aviso "nome antigo,
renomeie para X". Ao reescrever o arquivo, grave sempre com os nomes novos.

`Pendentes` e `Divergências conhecidas` parecem iguais e não são — confundir as
duas foi o que deixou uma rodada se declarar fechada enquanto trabalho que ela
ainda pretendia fazer continuava sem construir. `Pendentes` é escopo que esta
rodada pretendia cobrir e não cobriu (orçamento, tempo, divisão em várias
passadas) — a rodada não está de fato pronta enquanto houver algo aqui.
`Divergências conhecidas` é decisão já tomada: ou um limite permanente de
ferramenta (uma propriedade bloqueada pelo MCP, um teto de tamanho de resposta
com contorno documentado) ou um corte de escopo explícito que o usuário assinou
(ex.: escolher a trilha Essencial em vez da Completa). Um item só sai de
`Pendentes` para `Divergências conhecidas` quando alguém decide de verdade
"isto não vai ser feito", com o motivo escrito — nunca por ficar esquecido em
`Pendentes` até ninguém notar que envelheceu.

Sem `Recusadas`, a mesma proposta volta toda rodada. Sem `Divergências`, o
arquivo mente por omissão.

## O changelog — a mesma história, em formato que um agente lê

`figma-sync.md` é deliberadamente curto — uma linha por rodada. Isso é ótimo
pra um humano abrir e entender o estado em 10 segundos, e ruim pra um agente
que precisa saber **exatamente** o que mudou antes de aplicar algo com
precisão. As duas necessidades não cabem no mesmo arquivo sem que uma sacrifique
a outra — por isso são arquivos separados, não um mais longo:

```
design/figma-sync.md            → estado atual + índice de uma linha por rodada (humano)
design/figma-changelog.jsonl    → uma entrada estruturada por rodada (agente)
design/figma-findings/<rodada>.md → achados completos da rodada (dado, não conversa)
design/figma-reference.json     → fatos atuais (ids, nomes) — skill figma-convencoes
```

`figma-changelog.jsonl` é **append-only**: cada rodada adiciona uma linha,
nunca reescreve as anteriores — é o formato certo pra histórico que só cresce,
e evita o custo de reparsear/reescrever um JSON array inteiro a cada rodada.

```jsonl
{"round":"r1","date":"2026-08-14","direction":"code->figma","author":"figma-espelhar","summary":"espelho completo, 00-08, 134 frames","frames_created":134,"frames_changed":0,"frames_removed":0,"tokens_changed":[],"turn_after":"design","findings":"design/figma-findings/r1.md"}
{"round":"r2","date":"2026-08-22","direction":"figma->code","author":"figma-trazer","summary":"densidade das listas aplicada no SectionCard e no token de espaçamento","frames_created":0,"frames_changed":7,"frames_removed":0,"tokens_changed":["space/stack-sm"],"turn_after":"code","findings":"design/figma-findings/r2.md"}
```

Campos mínimos: `round`, `date`, `direction` (`code->figma` ou
`figma->code`), `author` (a skill ou o fluxo que rodou), `summary` (uma frase),
`frames_created`/`frames_changed`/`frames_removed` (contagem real, não
estimada), `tokens_changed` (lista de nomes de variável, vazio se nenhum),
`turn_after` (o estado de `turn` que a rodada deixou), `findings` (caminho pro
arquivo com os achados completos daquela rodada — ver abaixo).
Ao ler um changelog antigo, aceite as chaves em português (`rodada`, `data`,
`direcao`, `autor`, `resumo`, `framesCriados`, `framesAlterados`,
`framesRemovidos`, `tokensAlterados`, `vezApos`, `achados`; valores
`codigo->figma`/`figma->codigo`/`codigo`/`aplicando`) e avise "nome antigo,
renomeie para X"; linhas novas usam só as chaves em inglês. Não reescreva as
linhas antigas (o arquivo é só-inclusão).

**Os achados não cabem numa linha, e não devem ficar só na conversa.** Uma
rodada de `figma-espelhar`, `figma-levar`, `figma-cobertura` ou `figma-trazer`
frequentemente descobre coisas reais sobre o produto (bug de responsivo medido,
botão que não faz nada, token duplicado) — se isso só existe na resposta de chat
que gerou a rodada, some assim que a conversa for arquivada. Grave em
`design/figma-findings/<rodada>.md`, um por achado, com a mesma precisão que uma
revisão adversarial — é dado, não narrativa. Cada achado usa a escala de
severidade 0–4 do DSX (skill `revisar-ux`: 0 não é problema · 1 cosmético ·
2 menor · 3 maior · 4 catástrofe; barreira de acessibilidade que bloqueia a
tarefa é sempre 4):

```markdown
### A-r1-03 · Ação "Resolver" não faz nada na lista de demandas
- onde: `src/pages/Demands.tsx` · frame `02 · Demandas › Lista`
- o que acontece: o botão chama `onResolve` que não está ligado a nada
- por que é problema: ação visível sem efeito (heurística 1 — visibilidade do estado)
- severidade: 3
- evidência: medido em 1440 e 375px; console sem erro
- destino: fora de escopo desta rodada — precisa de decisão de produto
```

Todo agente que for **aplicar** uma mudança (`figma-trazer`) ou **auditar**
(`figma-cobertura`) lê `figma-changelog.jsonl` antes de agir, não só
`figma-sync.md` — é lá que está o `summary` e a `direction` precisos da última
rodada, e o ponteiro pros achados que talvez já expliquem algo que pareceria
uma divergência nova.

## A rodada

**1. Abrir.** Confira a vez. Se for `design`, você não espelha — negocie a
passagem primeiro.

**2. Espelhar (só a primeira vez é completa).** A rodada 1 carrega o arquivo
inteiro (skill `figma-levar`, que orquestra `figma-fundacoes`, `figma-espelhar`
e `figma-cobertura`). As seguintes reespelham **apenas as telas que o código
mudou desde a última sincronia** — descubra pelo histórico:

```bash
git diff --name-only <ultimo-sync>..HEAD -- src/pages src/components src/theme.ts
```

Reespelho completo depois da rodada 1 é quase sempre erro: destrói refinamento e
custa dez vezes mais que o incremental. Faça só se o registro disser que a vez é
`code` e o usuário pedir explicitamente.

**3. Congelar o "antes" e passar a vez.** Rode o snapshot com `MODE = 'full'`
([tools/figma/snapshot.js](../../tools/figma/snapshot.js), colado dentro de
`use_figma`) e **comite** `design/figma-baseline/*.json`. É esse retrato que
torna o diff possível — e é o git que passa a dar histórico versionado ao
arquivo de design. Só então escreva `turn: design` — e só se `## Pendentes`
estiver vazio. Baseline comitado é necessário, mas não suficiente: prova que
existe um "antes" contra o qual diferenciar, não que a rodada terminou o que se
propôs a construir. Um espelho que adiou de propósito parte do próprio escopo
(acabou o orçamento no meio, dividido em várias passadas) não é rodada fechada
só porque existe baseline — virar a vez ali entrega autoridade sobre trabalho
que ainda era do código, e a próxima pessoa a abrir o arquivo não tem como
distinguir "designer, pode seguir" de "inacabado, volte aqui". Mantenha a vez em
`code`, liste o que falta em `## Pendentes`, e só vire quando estiver de fato
vazio (ou quando os itens tiverem sido reclassificados explicitamente para
`## Divergências conhecidas`, com motivo).

Num arquivo grande (dezenas de rotas, dezenas de diálogos), uma varredura
`MODE = 'full'` do arquivo inteiro pode estourar o limite de tamanho da resposta
de `use_figma` e truncar no meio do JSON — é falha real, observada, não
hipótese. Quando acontecer, caia para `MODE = 'hashes'` (o caminho leve do
próprio script), anote o recuo em `## Divergências conhecidas` do
`figma-sync.md`, e complemente com chamadas `MODE = 'full'` com `TARGETS`
restrito aos frames que o hash de uma rodada seguinte acusar. Não trave a rodada
esperando cobertura de baseline detalhada em tudo de uma vez — só-hash já detecta
*que* um frame mudou, e isso basta para conduzir o diff de rodada a rodada.

O designer edita **no lugar**: o pareamento por id fica exato e o baseline
guarda o estado anterior. Duplicar frame numa página `09 · Propostas` serve para
**explorar alternativas** (duas ou três versões para escolher), não para refino
incremental (convenção da página na skill `figma-propostas`).

**4. Diferenciar, depois aplicar.** Snapshot novo →
`node <DSX>/tools/figma/diff-baseline.cjs design/figma-baseline/app.json /tmp/atual.json`
→ relatório já classificado em `token` / `primitivo` / `composição`
(`/dsx:figma-diff` faz as duas fases e roda a comparação). A skill
`figma-trazer` consome esse relatório em vez de adivinhar o que mudou — e passa
cada item pelos [gates](#gates--o-que-trava-a-rodada) antes de tocar no código.
Mecanismo completo em [references/diff.md](references/diff.md).

**5. Fechar.** Atualize o registro (aplicadas, recusadas, vez → `code`),
reespelhe **as telas tocadas** e **regere o baseline** — se o baseline ficar
velho, a rodada seguinte vai reapresentar como novidade tudo que você acabou de
aplicar. Rodada que não fecha vira divergência silenciosa. Feche sempre com os
três arquivos: **append** de uma linha em `design/figma-changelog.jsonl`,
achados completos salvos em `design/figma-findings/<rodada>.md` se houver, e
`design/figma-reference.json` regenerado se fundação ou estrutura mudou
(skill `figma-convencoes`).

## Por que o ciclo existe — e onde cada lado ganha

| o Figma resolve melhor | o código resolve melhor |
|---|---|
| hierarquia, ritmo, densidade, respiro | comportamento, estado, dados reais |
| explorar 3 alternativas em 20 minutos | o que acontece quando a lista tem 4.000 itens |
| ver o conjunto de telas lado a lado | acessibilidade, foco, teclado |
| conversa com quem não lê código | responsividade de verdade |

Isso define o que **não** deve voltar do Figma: lógica de estado, regra de
negócio, texto que muda significado sem revisão, e qualquer coisa que só
funciona na largura em que o frame foi desenhado.

## Gates — o que trava a rodada

Trave e devolva, em vez de aplicar, quando a proposta:

- **rebaixa contraste** abaixo do piso de acessibilidade — mesmo se ficou bonito;
- **remove o segundo canal** de um estado (cor virando o único sinal);
- **cria um padrão que não existe no kit** — vira decisão de produto, não de tela;
- **contraria um padrão de interação** que o catálogo do DSX marca como `evitar`;
- **muda um token** sem que alguém tenha olhado o efeito nas outras telas;
- **desfaz um achado** que já tinha sido registrado como intencional.

Trava não é recusa definitiva: é pedido de decisão explícita de quem pode tomá-la.

### Como cada gate é verificado — são os gates do DSX

O ciclo não inventa critério próprio: a volta passa pelas mesmas verificações
que qualquer UI construída com o DSX. `figma-trazer` aplica esta lista item a
item; o que falhar volta como gate, com o motivo, para `## Recusadas` ou para
decisão.

| gate | como verificar | bloqueia quando |
|---|---|---|
| **contraste** | `node <DSX>/tools/contrast.mjs "#fg" "#bg"` para cada par texto/fundo e UI/fundo que a proposta toca (imprime AA/AAA texto, texto grande e UI não textual), nos dois temas | texto < 4.5 (grande < 3), UI não textual < 3 |
| **mudança de token** | aplicar via skill `tokens` (o snapshot vira diff DTCG com `node <DSX>/tools/figma/figma-to-tokens.mjs`) e rodar `node <DSX>/tools/build-tokens.mjs` | o build falha (par de contraste reprovado, chave do tema escuro sem par no claro, alias quebrado) — falha bloqueia, não vira aviso |
| **padrão de interação** | comparar a proposta com `patterns/index.json` (campo `regra`, `status`, `componentes`). Ex.: erro movido para toast → `toast-vs-inline-alert`; formulário longo dentro de modal → `when-to-avoid-modal` | a proposta contraria um padrão com `status: "evitar"` ou a `regra` de um padrão recomendado |
| **acessibilidade** | skill `acessibilidade`: foco visível, alvo de toque ≥ 24 × 24 px (piso AA) e 44 px em toque, informação não só por cor, ordem de leitura | qualquer barreira — e o 2º canal removido é sempre gate |
| **texto** | skill `ux-writing`: glossário do projeto, fórmulas de botão/erro/vazio, mesmo conceito = mesma palavra | texto que muda significado sem revisão, termo fora do glossário |
| **classe `token`** | skill `tokens` | ver "mudança de token" |
| **classe `primitivo` / `composição`** | regras da skill `construir-ui`: só tokens semânticos (nunca valor cru, nunca primitivo direto), estados obrigatórios (vazio, carregando, erro, sucesso, foco, desabilitado), `node <DSX>/tools/lint-raw-values.mjs` limpo | valor cru introduzido, estado faltando |
| **regra nova de uso** (componente, variante ou token novo, ou nova regra de quando usar) | atualizar o `DESIGN.md` via skill `design-md` na mesma rodada | a regra fica só no Figma ou só no código |
| **mudança de comportamento** (tela nova, arranjo ou arquétipo diferente, ação primária em outro lugar, confirmação, estado, fluxo) | atualizar o `UX.md` via skill `ux-md` na mesma rodada (linha da tela, política ou desvio; `version` e `updated`) e rodar `node <DSX>/tools/ux-lint/screen.mjs` na captura | a mudança contraria uma política do `UX.md` sem a política mudar, ou fica só no Figma ou só no código |

Um item só é dado como aplicado quando passou em todos os gates que se aplicam a
ele — registre no `figma-sync.md` qual gate travou cada recusada, para a
próxima rodada não reabrir a mesma discussão.

## Sinais de que o ciclo quebrou

- O Figma tem tela que não existe em rota nenhuma → alguém desenhou futuro no
  espelho. Mova para uma página de exploração; o espelho descreve o presente.
- Uma mudança aplicada some na rodada seguinte → houve reespelho com a vez
  errada. Reaplique e conserte a disciplina, não o arquivo.
- O diff reapresenta mudanças já aplicadas → o baseline não foi regerado no
  fechamento da rodada anterior. Regere e descarte o relatório.
- O diff acusa mudança em massa do tipo `FRAME`→`INSTANCE` → é a componentização
  automática do servidor MCP, não decisão de design. Trate como ruído e regere o
  baseline.
- A matriz de cobertura não fecha há duas rodadas → rode `figma-cobertura` antes
  de qualquer coisa nova.
- A vez está em `design`, mas `## Pendentes` tem itens → a rodada anterior foi
  declarada fechada sem estar. Volte a vez para `code` e termine o escopo.

## Quando o projeto nasceu no Figma

O ciclo é o mesmo; o que muda é a semente. Não há espelho inicial — há
**implementação** inicial (skill `figma-primeiro`). Três ajustes:

- **A vez começa em `design`**, não em `code`. O Figma é a fonte enquanto o
  código ainda não cobre o arquivo.
- **O baseline é tirado no momento em que você implementa cada leva**, não ao
  fim de um espelho. Ele congela o que virou código; o que veio depois no Figma
  é a próxima rodada.
- **A cobertura se lê invertida** — frame → rota, com status (`figma-cobertura`).
  Enquanto houver frame em `falta`, o ciclo ainda está na primeira volta.

Quando o código passa a cobrir o arquivo, a vez alterna normalmente e o
`figma-espelhar` entra como verificação, não como carga.

## Primeira montagem do ciclo num projeto

O ponto de entrada é `/dsx:figma-iniciar`, que segue esta sequência.

0. `/dsx:mapear`, se `.dsx/maps/project-map.md` ainda não existir — entrega a
   cada passo abaixo a estrutura física do projeto em vez de cada um
   redescobri-la, e desce uma camada: a UI em si (páginas, modais, tokens,
   tipografia, ícones), a navegação entre telas, os passos dentro de cada
   tarefa, a jornada ao longo do tempo, o domínio de negócio por baixo de tudo,
   e o design system extraído com detecção de riscos de drift
   (`design-system.json`, `hazards[]`). Se só existir um legado
   (`.dsx/mapas/` com nomes em português, ou `.claude/figma-claude/`), aceite-o e avise que ele será regravado em
   `.dsx/maps/` na próxima execução. `mapear` não chama `use_figma`, então o
   guarda da vez nunca o vê — rode em qualquer vez, inclusive `design`. Os
   mapas servem o DSX inteiro, não só o ciclo: `construir-ui` lê fluxos e
   domínio; `design-md` e `auditar-ds` leem `design-system.json`.
1. `mapear` sozinho deixa palpites nos mapas — tudo que os agentes inferiram em
   vez de observar, e tudo que a ida e a volta vão tratar como fato daqui em
   diante. Rode `/dsx:confirmar-mapas` se `design/as-is-to-be.md` ainda não
   existir: ele reexecuta o mapeamento, confronta os mapas com as specs e a
   documentação do próprio projeto, e conduz o usuário a confirmar ou corrigir
   cada ponto marcado como incerto. É o passo que decide quanto o resto do
   ciclo merece confiança — o único interativo de propósito, e pulá-lo só
   empurra as mesmas correções para depois, onde custam mais.
2. `/dsx:figma-levar` — o passo que de fato escreve no Figma. A fonte de verdade
   da ida é o `DESIGN.md` + os tokens do projeto (tokens DTCG →
   `.dsx/maps/design-system.json` → mapa de UI → tema detectado). Orquestra
   `figma-fundacoes`, `figma-espelhar` e `figma-cobertura`, nesta ordem,
   tratando os mapas como pré-requisito duro em vez de cair num inventário por
   grep. É o único passo de toda a sequência que chama `use_figma` para
   escrever — tudo antes dele é só código.
3. Code Connect nos primitivos do kit (`figma-trazer`, seção 4) — paga uma vez,
   barateia toda rodada seguinte.
4. Convenções escritas no próprio arquivo (`figma-convencoes`) — uma nota no
   canvas mais `.description` nos componentes do kit, e o contrato estrutural
   (página, nome, posição; reusar vs. criar componente do kit), para que um
   designer humano ou outro agente que abra o arquivo a frio, sem o DSX, saiba
   o padrão de nomes de página/frame e não quebre sem querer o pareamento do
   ida-e-volta.
5. Primeiro baseline comitado (`tools/figma/snapshot.js` com `MODE = 'full'`).
6. Registro de sincronia criado, mais a primeira linha em
   `design/figma-changelog.jsonl` e o primeiro `design/figma-reference.json`
   (skill `figma-convencoes`) — os três nascem juntos, não em rodadas
   separadas. `turn: design` só se o espelho de fato cobriu tudo a que se propôs
   (confira a matriz de cobertura, e se alguma tela/fluxo/estado foi adiada
   explicitamente em vez de construída) — liste o que sobrou em `## Pendentes`
   e mantenha `turn: code` até esvaziar. Um primeiro espelho grande costuma
   rodar em várias passadas de agente com orçamento fixo cada; é normal uma
   delas adiar parte do próprio escopo, e normal isso ainda precisar de uma
   passada de acompanhamento antes de o arquivo estar pronto para entregar a um
   designer.
7. Combinar em voz alta as duas regras que ninguém lê depois: **nunca reespelhar
   com a vez do design** e **regerar o baseline ao fechar a rodada**.
