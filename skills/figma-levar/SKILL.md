---
name: figma-levar
description: "Leva o projeto inteiro ao Figma a partir dos mapas e do DESIGN.md: fundação, telas, estados e seções por jornada, com ledger retomável. Use quando o mapeamento está pronto e é hora de construir no Figma."
---

# figma-levar — construir a partir do que já se sabe, não de um olhar novo

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

**Entrada (opcional):** `[essencial|completa] [jornada ou rota, para uma execução pontual]`.

Quando esta skill roda, o projeto normalmente já passou por `mapear` →
`confirmar-mapas`: rotas, modais, grafo de navegação, dependências entre
tarefas, personas/jornada, modelo de domínio e um design system extraído com
adaptadores por framework e checado contra hazards já existem como arquivos.
`figma-espelhar` e `figma-fundacoes` são anteriores a essa fase de descoberta —
a fase 1 delas ainda diz "use o artefato se existir, senão grep". Esta skill
transforma os artefatos em **pré-requisito duro**: sem artefato, não há
construção — falhe rápido e diga qual skill rodar. Essa é a alavanca real que
a descoberta acrescenta — `flows.json` dá arestas reais
from/to/trigger/condition em vez de chamadas de navegação retraçadas,
`journey.json` dá personas reais em vez de papéis adivinhados, e os
`hazards[]` de `design-system.json` dão um registro estruturado de deriva em
vez de achados em prosa encontrados no olho.

Esta skill **orquestra**, não duplica. Toda a doutrina do Plugin API paga caro
— normalização de path de ícone, o bug de opacidade com read-modify-write,
efeitos colaterais da componentização, armadilhas de layout — continua
exatamente onde já mora: `figma-espelhar`, `figma-fundacoes` e
[plugin-api.md](../figma-espelhar/references/plugin-api.md). O que está aqui é
genuinamente novo: o gate de artefatos, o ledger de estado, o
reusar-antes-de-criar, a exposição de hazards e a camada de jornada.

## Primeira linha da resposta — qual projeto

**Antes de qualquer outra coisa, diga contra qual projeto isto está rodando**
— nome do diretório e caminho — como primeira linha da resposta. Este é o
passo mais longo e de maior consequência do fluxo Figma (escritas reais num
arquivo real do Figma, muitas vezes ao longo de várias sessões); não deixe o
usuário adivinhando qual projeto está sendo tocado.

## Antes de tudo

Carregue **`figma-use`** antes de toda chamada a `use_figma`, e também
**`figma-generate-library`** e **`figma-generate-design`** — as skills oficiais
do próprio Figma para exatamente este problema. Elas ensinam as mecânicas que
esta skill assume: ordem de construção wrapper-first, o padrão de ledger de
estado, execução estritamente sequencial e descoberta reusar-antes-de-criar.
Não rederive essas mecânicas do zero; siga-as.

**Nunca chame `use_figma` com script que altera o arquivo enquanto a vez é do
design.** Leia `design/figma-sync.md` antes (skill `figma-ciclo`):

- Se `turn: design` (ou o legado `vez: design`), **pare** e diga ao usuário.
  Há refino em curso; escrever agora sobrescreve. (O hook `turn-guard` também
  bloqueia, mas não deixe o hook ser o primeiro a avisar.)
- Se não houver registro, o projeto ainda não tem ciclo: ofereça
  `/dsx:figma-iniciar`.

**Nunca paralelize chamadas `use_figma` que alteram o arquivo.** Mutações de
estado no Figma são estritamente sequenciais, mesmo quando a orquestração em
volta tecnicamente poderia dispará-las em paralelo. Chamadas de descoberta
só-leitura (screenshots, metadata, busca em biblioteca) podem rodar em paralelo
entre si; nada que cria, muda ou remove um nó pode.

## Gate de artefatos — sem eles, não há construção

Confira que existem, **antes de escrever qualquer coisa**:

| artefato | produzido por | sem ele |
|---|---|---|
| `.dsx/maps/ui-map.json` | skill `mapear` | pare: rode `mapear` |
| `.dsx/maps/flows.json` | skill `mapear` | pare: rode `mapear` |
| `.dsx/maps/journey.json` | skill `mapear` | pare: rode `mapear` |
| `.dsx/maps/domain.json` | skill `mapear` | pare: rode `mapear` |
| `.dsx/maps/design-system.json` (com `hazards[]`) | skill `mapear` | pare: rode `mapear` |
| `DESIGN.md` | skill `design-md` (Modo A extrai do código e do `design-system.json`) | pare: rode `design-md` |
| tokens DTCG do projeto (`tokens/*.tokens.json` ou `*.tokens.json`) | skill `tokens` | **não bloqueia** — sem eles, os valores vêm do `design-system.json` |
| `UX.md` | skill `ux-md` (Modo A extrai do código e dos mapas) | **não bloqueia** — com ele, os estados levados por tela são os de `states` + os do arquétipo da tela, e as seções podem agrupar por arquétipo; sem ele, os estados vêm do código e o relatório diz isso |
| `.dsx/maps/tasks.json` | skill `mapear` | não bloqueia — sem ele, a fase Diálogos conta passos pelo componente |
| `design/as-is-to-be.md` | skill `confirmar-mapas` | não bloqueia — sem ele, a fase Cobertura não tem contra o que cruzar; diga isso no relatório |

Se algum obrigatório falta, **pare e diga qual skill rodar antes** — não caia
em silêncio para redescobrir pelo código. Tudo daqui para frente trata esses
arquivos como fato.

**Compatibilidade com o fluxo anterior:** procure primeiro em `.dsx/maps/`;
se não existir, aceite os legados `.dsx/mapas/` (nomes em português: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; chaves JSON antigas em camelCase, como `generatedAt` ou `subPages`, valem como as novas em snake_case; tudo com o aviso "nome antigo, renomeie para X") e `.claude/figma-claude/` (`ui-map.json`,
`user-flows.json`, `task-flows.json`, `journey-map.json`, `domain-map.json`,
`design-system.json`, `figma-harness.md` em `design/`) e avise que ele será
regravado no caminho novo na próxima execução de `mapear`. As chaves JSON dos
mapas ficam em inglês (`entities`, `uncertain`, `hazards`, `edges`…) — são
contrato de máquina.

**Mapa velho?** Se `design-system.json` é mais antigo que a última mudança no
tema/tokens do projeto, rode `mapear` de novo antes da fase Fundações.

## Ordem de orquestração

Esta skill chama as existentes, cada uma lendo a sua parte dos artefatos em vez
de redescobrir, nesta ordem:

1. `mapear` — só se `design-system.json` (ou outro mapa) estiver velho;
2. `figma-fundacoes` — tokens → variáveis, estilos de texto, ícones;
3. `figma-espelhar` — telas, diálogos, fluxos, estados;
4. `figma-cobertura` — verificação de fechamento.

Antes de qualquer `use_figma` de descoberta, leia `design/figma-reference.json`
(skill `figma-convencoes`) — ids e nomes já conhecidos estão lá.

## Fonte de verdade das fundações — DESIGN.md + tokens

Ordem de busca dos valores: tokens DTCG (`tokens/*.tokens.json` ou
`*.tokens.json`) → `.dsx/maps/design-system.json` → `ui-map` → tema
detectado no código.

Com tokens DTCG, gere o plano de variáveis com a ponte do DSX em vez de
montar variável por variável:

```bash
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens <pasta-dos-tokens>           # plano (JSON) — leia antes
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens <pasta-dos-tokens> --script > /tmp/vars.js
```

Cole o script gerado (`/tmp/vars.js`) em `use_figma`. Ele é idempotente: reusa
coleção, modo e variável pelo nome e só cria o que falta. Esquema resultante:
`Primitivos` (modo `Valor`), `Semântico` (modos `Claro`/`Escuro`, aliases para
Primitivos), `Componente` (aliases para Semântico); nomes = caminho DTCG com
`/` no lugar de `.` (`color/text/primary`, `color/action/primary`,
`space/stack-md`, `radius/control`). Detalhes na skill `figma-fundacoes`.

As regras de uso de cada cor vêm da tabela "Colors" do `DESIGN.md` — viram a
`description` da variável no Figma e a legenda das amostras em
`00 · Fundamentos`. Variável sem regra de uso no `DESIGN.md` é lacuna: registre
como achado, não invente a regra.

## O ledger de estado — obrigatório para qualquer coisa além de um punhado de chamadas

Grave `.dsx/figma/ledger.json` depois de **cada** chamada que altera o
arquivo, não só no fim. Formato (chaves em inglês — contrato de máquina):

```json
{
  "run_id": "levar-2026-08-18",
  "phase": "screens",
  "step": "route:/demandas",
  "entities": {
    "collections": { "Primitivos": "id:...", "Semântico": "id:...", "Componente": "id:..." },
    "variables": { "color/action/primary": "id:..." },
    "text_styles": { "Título/Página (h4)": "id:..." },
    "components": { "Chip": "key:...", "Botão": "key:..." },
    "pages": { "00 · Fundamentos": "id:...", "02 · Demandas": "id:..." },
    "wrappers": { "/demandas": "id:..." }
  },
  "pending_validations": ["/demandas:screenshot"],
  "completed_steps": ["foundations", "chrome"]
}
```

Leia este arquivo no início de **cada fase**, não só uma vez no começo da
execução — uma execução retomada numa conversa nova não tem memória de nada
além deste arquivo e do que já está de fato no arquivo do Figma. Nunca
alucine um id de mais cedo na conversa; se ele não está neste arquivo,
rederive-o com uma consulta só-leitura (pelo nome determinístico) antes de
usar. É esse o mecanismo que torna uma execução de 50–100+ chamadas
retomável em vez de um script tudo-ou-nada.

Compatibilidade: um ledger legado em `.claude/figma-claude/figma-registry.json`
é lido como ponto de partida e regravado em `.dsx/figma/ledger.json`; um ledger com chaves em camelCase (`runId`, `textStyles`, `pendingValidations`, `completedSteps`) é lido com o aviso "nome antigo, renomeie para X" e regravado em snake_case.

**Nunca confie em `completed_steps`/`phase`/`step` ao pé da letra numa
retomada.** A última escrita do ledger de uma execução interrompida
frequentemente está velha — uma execução real desta skill foi retomada de um
ledger que dizia 2 de 34 telas construídas quando uma varredura ao vivo do
arquivo encontrou 22 já lá (o processo tinha morrido num erro de API e depois
numa suspensão da máquina antes de qualquer das duas escritas chegar). Antes
de continuar qualquer execução retomada — conversa nova, nova tentativa depois
de uma falha, ou depois de qualquer interrupção — rode uma chamada `use_figma`
só-leitura que varre o arquivo ao vivo (nomes de página/frame, pela mesma
convenção determinística usada para criá-los) e reconcilie com o ledger
primeiro. Onde discordarem, o arquivo ao vivo vence: corrija o ledger para
bater antes de escrever qualquer coisa nova, e só então retome. Essa
reconciliação é obrigatória em toda retomada, não um recurso para quando algo
parece errado.

## Reusar antes de criar

Antes de construir qualquer componente ou tela, confira se o arquivo de
destino — ou uma biblioteca já ligada a ele — já o tem:

1. `get_libraries` no arquivo de destino, **antes** de `search_design_system`.
   Resultado vazio não prova que não existe biblioteca — é paginado; pagine
   antes de concluir que não há nada para buscar.
2. `search_design_system`, um termo por chamada, nunca consulta composta
   ("button" e "input" em duas chamadas, não um "button input").
3. `getLocalVariableCollectionsAsync()` só enxerga variáveis **locais**. As
   variáveis de uma biblioteca publicada são invisíveis para ele. Se o arquivo
   usa uma biblioteca, `search_design_system` com `includeVariables: true` é o
   único jeito de encontrá-las — não conclua "não há variáveis" só pela
   chamada local.

Reuse se a API de propriedades e o modelo de ligação a tokens batem; envolva
uma instância aninhada se o visual bate mas a API não; reconstrua só quando
nenhum dos dois funciona. É isso que impede uma nova execução de criar um
segundo `Botão`, ligeiramente diferente, ao lado de um que já existe. O
critério completo para evoluir vs. criar uma peça do kit está na skill
`figma-convencoes`.

## Exposição de hazards — nunca normalize em silêncio

Os `hazards[]` de `design-system.json` (`duplicated-hex`, `off-palette-hex`,
`duplicated-radius`, `duplicated-shadow`, `mode-conditional-color-logic`,
`canvas-font-mismatch`, `unloaded-font`, `near-zero-yield-adapter`) são achados
de deriva, não defeitos para consertar quietinho enquanto espelha. Em
`00 · Fundamentos`, ao lado da amostra ou estilo que cada hazard afeta,
acrescente um pequeno quadro de alerta visualmente distinto (borda tracejada,
token `color/feedback/warning-icon`) com o `detail` e a `evidence`
(arquivo:linha) do hazard como legenda. É a regra zero — espelhe o que existe,
não redesenhe — aplicada a tokens do mesmo jeito que já se aplica a telas feias
em `figma-espelhar`. Cada hazard também vira um bloco em
`design/figma-findings/<rodada>.md`, com severidade 0–4 (formato na skill
`figma-espelhar`, seção "Achados").

## Sections de jornada — em camada por cima, não no lugar

Mantenha o esquema de páginas de `figma-espelhar` (`02 · <app principal>`,
`03 · <outro perfil>`, numerados por rota/funcionalidade) — taxonomia de
páginas por persona briga com o jeito como as pessoas procuram as coisas num
arquivo ("acha a página de configurações"), e o esquema existente já separa
por papel. Ponha as jornadas por cima com **Sections** nativas do Figma, uma
por fluxo nomeado de `flows.json`, envolvendo os frames que pertencem a ele.
Use `devStatus` (`READY_FOR_DEV` / `COMPLETED`) em cada section como marcador
real e ajustável de progresso de construção — **não** como detector de deriva:
o Plugin API não rastreia se um nó mudou depois que o status foi definido (é um
sinal só do app do Figma, visível para humanos). A detecção de deriva de rodada
em rodada continua sendo o que já é — o hash de conteúdo de
`tools/figma/diff-baseline.cjs`.

Uma section só pode carregar `devStatus` se estiver diretamente sob uma página
(ou sob outra section que não tenha status) — não aninhe uma section com
status dentro de outra.

Algumas pontes MCP bloqueiam `SectionNode.devStatus`. Confira o que a API ao
vivo de fato permite antes de prometer que o status foi definido; se recusar,
registre no relatório e no ledger, não finja.

`04 · Fluxos` é construída das arestas de `flows.json` cruzadas com as
personas/estágios de `journey.json` — raias por ator, transições de estágio
sintetizadas com marcadores de hazard/ponto de dor, não um despejo literal de
uma caixa por nó do grafo cru.

## Wireframes

Não há artefato lo-fi separado. "Wireframes" aqui significa a trilha Essencial
já existente de `figma-espelhar` (fundações + uma tela por rota + fluxos, só
estrutura) — a incerteza que normalmente justifica uma passada lo-fi
deliberada não se aplica quando estrutura, texto e hierarquia já estão
resolvidos em código rodando. `04 · Fluxos` continua esquemática
(caixas/losangos/setas) qualquer que seja a trilha; é uma distinção de gênero já
corretamente separada no esquema de páginas, não um rebaixamento de
fidelidade.

## Imagens reais

Se a fonte é um app web e uma tela contém imagens reais (fotos, ilustrações,
qualquer coisa que não seja preenchimento sólido nem ícone), rode
`generate_figma_design` contra o mesmo arquivo em paralelo à construção por
componentes — ele captura um screenshot pixel a pixel do app rodando,
incluindo imagens que o próprio Plugin API não consegue buscar por URL.
Transfira os valores de `imageHash` dos preenchimentos de imagem da captura
para a construção ligada a componentes e depois apague a captura. Pular isso
quando há imagens deixa frames de imagem em branco.

## Plano de execução

| Fase | Lê | Escreve |
|---|---|---|
| 0. Gate | `design/figma-sync.md`, os artefatos obrigatórios | nada — falha rápido se algum faltar |
| 1. Fundações | tokens DTCG (via `tokens-to-figma.mjs`) ou `design-system.json`; `DESIGN.md` (regras de uso); `hazards[]` | variáveis, estilos de texto, componentes de ícone (`figma-fundacoes`) + quadros de hazard em `00` |
| 2. Chrome | layout compartilhado de `ui-map.json` | `COMPONENT`s de chrome, uma chamada |
| 3. Telas | páginas/sub-páginas de `ui-map.json`, `domain.json` para dados de exemplo | frames de `02`/`03`, envolvidos em Sections por pertencimento a fluxo — um frame por sub-página `nav_visible` também, nunca dobrado no pai (`figma-espelhar` fase 4) |
| 4. Diálogos | modais de `ui-map.json`, contagem de passos de `tasks.json` | `05 · Diálogos` |
| 5. Estados | dados de estados ausentes de `ui-map.json` | `06 · Estados e variações` — placeholders marcados como tal, nunca fabricados |
| 6. Fluxos | `flows.json`, `journey.json` | raias de `04 · Fluxos` + mapa de rotas |
| 7. Responsivo | só breakpoints reais encontrados no código | `07 · Responsivo` |
| 8. Cobertura | matriz da `figma-cobertura`, cruzada com `design/as-is-to-be.md` | `08 · Cobertura` |

Atualize o ledger depois de cada fase, não só de cada chamada. Screenshot de
cada frame e olhe — a verificação de `figma-espelhar` vale aqui sem exceção.

## Fechamento

Sem estes passos, a próxima rodada de diff reapresenta tudo como novidade:

1. **Regere o baseline** e **atualize o registro** `design/figma-sync.md`
   exatamente como `figma-espelhar` já faz.
2. **Append** de uma linha em `design/figma-changelog.jsonl`:

   ```jsonl
   {"round":"r1","date":"2026-08-18","direction":"code->figma","author":"figma-levar","summary":"fundações + 34 telas + fluxos, trilha essencial","frames_created":41,"frames_changed":0,"frames_removed":0,"tokens_changed":[],"turn_after":"design","findings":"design/figma-findings/r1.md"}
   ```

   Contagens reais (do ledger reconciliado com o arquivo ao vivo), nunca
   estimadas.
3. **Achados** (hazards, telas que não couberam no orçamento, `devStatus`
   recusado) em `design/figma-findings/<rodada>.md`, com severidade 0–4.
4. **Regenere** `design/figma-reference.json` (skill `figma-convencoes`) — esta
   skill sempre muda fundação e estrutura.
5. Se é a primeira construção do arquivo, feche com a nota de convenções no
   próprio arquivo (skill `figma-convencoes`, Parte B).
