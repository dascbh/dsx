---
name: mapear
description: "Mapeia o projeto em .dsx/mapas/: estrutura, UI, fluxos, tarefas, jornada, domínio e design system real com hazards, sem tocar no código nem no Figma. Use ao herdar ou iniciar um projeto e antes de construir, auditar ou levar ao Figma."
argument-hint: "[projeto | completo | design-system] [caminho para limitar a varredura, opcional — o padrão é o projeto inteiro]"
---

# mapear — o primeiro ato, em silêncio

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Esta skill varre o projeto — a estrutura física, a UI, a realidade de negócio
por baixo dela e o design system declarado — e grava mapas em `.dsx/mapas/`.
É um primeiro ato, não um relatório: o produto são os arquivos em disco, não
uma mensagem nesta conversa.

## Para quem são os mapas (o DSX inteiro, não só o Figma)

Os mapas existem para que nenhuma outra skill precise redescobrir o projeto do
zero. Quem lê o quê:

| mapa | quem lê |
|---|---|
| `mapa-projeto.{md,json}` | todos os agentes desta skill (reaproveitam a detecção de stack), `analisador-specs` (lista de docs), qualquer skill que precise saber onde ficam rotas, componentes, tema, testes e docs |
| `mapa-ui.{md,json}` | `figma-espelhar`, `figma-fundacoes`, `figma-cobertura`, `figma-trazer`; `construir-ui` (inventário de páginas, modais e kit antes de escrever JSX) |
| `fluxos.{md,json}`, `tarefas.{md,json}` | `construir-ui` (para onde a tela leva, quais passos e efeitos colaterais a tarefa tem), fase de Fluxos do `figma-espelhar`, `figma-trazer` |
| `dominio.{md,json}` | `construir-ui` (forma real dos dados, regras de negócio e validação), `figma-trazer`, `figma-primeiro`, `figma-espelhar` (dados de exemplo realistas em vez de inventados) |
| `jornada.{md,json}` | `revisar-ux` (personas, estágios e pontos de contato para as lentes de persona e o cognitive walkthrough), `figma-espelhar` (organizar telas por papel, desenhar diagramas de fluxo) |
| `design-system.{json,md}` | `design-md` Modo A (inventário real em vez de grep), `auditar-ds` (`hazards[]` como ponto de partida do drift), `figma-fundacoes` (variáveis, estilos e ícones), `figma-espelhar` |

`mapa-ui.json` (do `mapeador-ui`) já traz um bloco `designSystem` mais leve —
arquivo de tema, pacote de ícones, algumas cores e espaçamentos achados de
passagem. Ele continua sendo o sinal barato para quando o passo 3 ainda não
rodou. Quando `design-system.json` existe, ele **substitui** o bloco
`designSystem` do `mapa-ui.json` para tudo que precisa de fidelidade real — o
mapa mais rico vence, a mesma regra que já vale entre `mapa-projeto.md` e
`mapa-ui.md`.

Os fatos que uma pessoa confirmou (nomes de fluxo, dependências entre tarefas,
relações entre entidades) **não** moram nos mapas: moram em
`.dsx/mapas/confirmacoes.json`, que só a skill `confirmar-mapas` lê e grava.
Esta skill nunca toca nesse arquivo — e como ela regenera `fluxos.json`,
`tarefas.json` e `dominio.json` do zero, só `confirmar-mapas` devolve as
confirmações a eles.

## Modos

| modo | o que roda | quando |
|---|---|---|
| `projeto` | só o passo 1 | o projeto mudou de estrutura (pastas, docs, stack) e só o mapa físico precisa ser renovado |
| `completo` (padrão) | passos 1, 2 e 3, nessa ordem | primeiro ato num projeto, ou quando a UI e o domínio mudaram o bastante para as outras skills redescobrirem tudo |
| `design-system` | só o passo 3 | o tema/config mudou e `design-md`, `auditar-ds`, `figma-fundacoes` ou `figma-espelhar` refariam a extração por conta própria |

O argumento restante, se houver, é o **escopo**: um caminho que limita a
varredura (o padrão é o projeto inteiro). Repasse-o a cada agente.

## Passo 1 — estrutura física (`mapeador-projeto`)

Rode o agente `mapeador-projeto` (`agents/mapeador-projeto.md`). Ele grava
`.dsx/mapas/mapa-projeto.md` e `.dsx/mapas/mapa-projeto.json`.

Rode sempre que o projeto mudou desde o último mapa, ou como o primeiríssimo
passo num projeto que nunca rodou o DSX: o agente sempre regenera os dois
arquivos do zero e sobrescreve o que havia, então o mapa nunca deriva do que
mudou desde a última leitura.

Nos modos `completo` e `design-system`, se `.dsx/mapas/mapa-projeto.md` ainda
não existir, este passo é pré-requisito: todos os agentes dos passos 2 e 3
reaproveitam a detecção de stack dele em vez de re-derivá-la. No modo
`completo` ele roda sempre, fresco.

## Passo 2 — UI e realidade de negócio (cinco agentes em paralelo)

Rode cinco agentes **em paralelo, numa única mensagem com cinco chamadas de
ferramenta**:

- `mapeador-ui` (`agents/mapeador-ui.md`) — páginas e subpáginas, modais,
  design system, tipografia, iconografia, kit de componentes, estados →
  `.dsx/mapas/mapa-ui.{md,json}`
- `mapeador-fluxos` (`agents/mapeador-fluxos.md`) — como o usuário se move
  entre telas para atingir um objetivo: o grafo de navegação, desvios, pontos
  de entrada e saída → `.dsx/mapas/fluxos.{md,json}`
- `mapeador-tarefas` (`agents/mapeador-tarefas.md`) — os passos dentro de uma
  tarefa, e quais tarefas dependem de quais → `.dsx/mapas/tarefas.{md,json}`
- `mapeador-jornada` (`agents/mapeador-jornada.md`) — a experiência em
  estágios ao longo do tempo, por persona/papel, ligada à missão da
  plataforma → `.dsx/mapas/jornada.{md,json}`
- `mapeador-dominio` (`agents/mapeador-dominio.md`) — lógica de negócio,
  modelagem de dados, entidades e suas relações → `.dsx/mapas/dominio.{md,json}`

Três deles (`mapeador-fluxos`, `mapeador-tarefas`, `mapeador-jornada`)
reaproveitam oportunisticamente a saída de um irmão *se ela já existir*, para
poupar uma re-derivação — mas cada um foi escrito para cair no próprio grep
quando esse arquivo ainda não está lá, que é exatamente o que acontece com os
irmãos que não terminaram dentro do mesmo lote paralelo. É esse fallback que
torna seguro lançar os cinco de uma vez, não a ausência de relação entre eles.

Os cinco leem só código (e, no caso do `mapeador-jornada`, docs) — **nenhum
chama `use_figma` nem cria nada no Figma.** Isso vem depois, em
`figma-espelhar`.

Todo agente sempre regenera os próprios arquivos e sobrescreve o que havia
antes.

## Passo 3 — design system declarado (`extrator-design-system`)

Rode o agente `extrator-design-system` (`agents/extrator-design-system.md`).
Ele grava `.dsx/mapas/design-system.json` e `.dsx/mapas/design-system.md`.

Este passo lê só código — **nenhuma chamada a `use_figma`**, nada criado no
Figma. Isso vem depois, em `figma-fundacoes`, que lê esta saída em vez de
procurar um arquivo de tema por conta própria.

Antes de extrair qualquer coisa, leia a declaração de teto abaixo e
mantenha-se nela: o produto é a camada **declarada** de tokens com hazards de
drift detectados mecanicamente, não uma conferência contra o app renderizado,
e conteúdo canvas/WebGL (`react-force-graph-2d`, Three.js/`react-three-fiber`,
Phaser) não tem representação nativa no Figma — entra como dado de
referência, claramente separado dos tokens reais, nunca declarado como um.

### Por que é um passo à parte

Ele não entra no lote paralelo do passo 2. Os cinco mapeadores são greps
baratos, só de código, que terminam juntos; o extrator pode executar a
chamada `createTheme()` do próprio projeto ou rodar um build real do
Tailwind v4, o que é mais pesado — por isso roda sozinho, depois do lote, e
por isso existe o modo `design-system` para refazê-lo sem pagar o resto (e
os modos `projeto` e o passo 2 nunca o pagam).

### Antes de prometer qualquer coisa a um designer ou usuário

Extração estática entrega a camada **declarada** de tokens — o que
`theme.ts`, a config resolvida do Tailwind ou um bloco `:root { --x }`
realmente dizem. Ela **não** verifica se o app **renderizado** bate com esses
valores. Sobrescritas no ponto de uso (`sx={{...}}` num componente MUI, uma
classe Tailwind condicional montada com `clsx`/`cva`, um `style={{...}}`
inline) são o jeito mais comum de componentes reais divergirem do tema, e
nada aqui pega isso de forma sistemática — só as checagens mecânicas de
hazard abaixo pegam padrões específicos e nomeados disso.

UI renderizada em canvas e WebGL (`react-force-graph-2d`, `three.js` /
`react-three-fiber`, Phaser, ou `getContext('2d')` cru) **não tem
representação nativa no Figma, ponto.** O Figma não tem runtime JS nem
contexto WebGL. A cor de um nó calculada a partir de um dado em tempo de
renderização, um material iluminado do Three.js, um efeito de partículas do
Phaser — nada disso existe como valor até o app rodar de fato, e o Figma não
roda o app. Capturar as constantes literais a partir das quais um script de
canvas foi construído (uma paleta fixa, uma fonte fixa) é material de
referência útil. Declará-las como token de design intercambiável, do qual o
resto do pipeline pode construir uma variável do Figma, não é — não faça, e
não deixe uma skill a jusante fazer.

**Se perguntarem "dá para ser 100% fiel, sem perder nada": não.**
Estilização DOM (MUI/Tailwind/Emotion/CSS variables) tem extração de alta
fidelidade do que está *declarado*. Canvas/WebGL tem um retrato de
referência documentado, não um token. Diga isso com todas as letras em vez
de deixar um artefato impressionantemente detalhado sugerir mais do que
entrega.

### Vários adaptadores, quase sempre

Projetos reais misturam stacks. Dos quatro projetos sobre os quais esta
doutrina foi construída: dois precisaram de MUI **e** Tailwind v4 juntos
(Tailwind instalado e buildando, contribuindo com quase zero tokens reais —
essa combinação é por si só um hazard que vale nomear, não motivo para
escolher um e ignorar o outro); um precisou de Tailwind v3 **e** CSS
variables genéricas **e** um adaptador de canvas (Three.js) ao mesmo tempo;
só um jogo puro em Phaser precisou de exatamente um adaptador. Detecte todo
adaptador que se aplica e rode todos — nunca pare no primeiro que casar.

### Hazards são sinais, não veredictos

Todo hazard que o extrator reporta (hex duplicado, cor fora da paleta, raio
ou sombra duplicados, lógica de cor condicionada ao modo, fonte não
carregada, texto em canvas numa fonte que não bate com o tema real,
adaptador de rendimento quase zero) vem de uma checagem nomeada, repetível,
baseada em grep — não de ler o código e formar uma opinião. É um limite de
escopo deliberado: um sinal sempre calculado do mesmo jeito é confiável de
um modo que "o agente achou que isto parecia errado" não é. Trate um hazard
como "olhe aqui", não como "isto está quebrado" — a mesma postura que
`uncertain[]` tem nos outros mapas. É por isso que `auditar-ds` parte de
`hazards[]` e ainda mede o drift por conta própria, e que `design-md` Modo A
usa `design-system.json` como inventário sem promover um hazard a decisão.

### Fidelidade de ícones e fontes, por origem

- `@mui/icons-material` / `lucide-react`: leia os dados de path do próprio
  pacote diretamente (o mesmo mecanismo que `figma-fundacoes` já usava —
  mudou de lugar, sem alteração).
- Conjuntos de ícones feitos à mão (um `Icon.tsx` local com um mapa
  `PATHS`): extraia como um pacote de ícones privado, com o mesmo formato de
  um pacote real.
- `next/font`: leia o `.fontFamily` resolvido no resultado da chamada do
  loader, ou o `@font-face` emitido na saída do build — nunca assuma que ele
  bate com o nome do pacote npm (um descompasso de sufixo `Variable` já foi
  um bug real, publicado, em pelo menos um projeto sobre o qual esta
  doutrina foi construída).
- `@fontsource*`: leia a família que o próprio pacote registra, pelo mesmo
  motivo.
- Uma fonte citada num token de tipografia sem nenhum mecanismo de
  carregamento encontrado em lugar nenhum: isso é o hazard `unloaded-font`,
  não um fato a descartar em silêncio.

## Silêncio

Não cole, resuma nem encaminhe ao usuário o que os agentes acharam — eles
também não vão devolver mais que uma linha. Quando o modo escolhido
terminar, confirme numa única linha curta que os mapas foram renovados,
nomeando o projeto (o `root` do `mapa-projeto.json`) para não haver
ambiguidade numa sessão que alterna entre mais de um, e incluindo a
contagem de hazards quando o passo 3 rodou. Depois siga em frente — nada
além disso.

Exemplo: `Mapas renovados em /caminho/do/projeto (modo completo) — design system com 7 hazards.`

## Regras

- **Nunca chama `use_figma`.** Esta skill é só código e docs; não precisa
  da vez e é segura em qualquer vez do ciclo (`codigo`, `design` ou
  `aplicando` em `design/figma-sync.md`), sem ler nem alterar o registro.
- **Sempre sobrescreve.** Cada agente regenera os próprios arquivos por
  completo; nunca mescla com a versão anterior nem a remenda.
- **Projeto sem código ainda.** Se o projeto nasceu no Figma e ainda não foi
  implementado, a maioria dos mapas volta vazia, e isso está correto: não
  invente conteúdo para preenchê-los. Rode `mapear` de novo depois que o
  primeiro lote de telas for implementado (`figma-primeiro` já manda fazer
  isso).
- **Compatibilidade com o fluxo anterior.** Ao procurar um mapa, leia
  primeiro `.dsx/mapas/`; se não existir, aceite o legado
  `.claude/figma-claude/` (`project-map.*`, `ui-map.*`, `user-flows.*`,
  `task-flows.*`, `journey-map.*`, `domain-map.*`, `design-system.*`) e
  avise que ele será regravado no caminho novo na próxima execução. Esta
  skill sempre **grava** só em `.dsx/mapas/` — que é exatamente essa
  próxima execução.
- **Chaves JSON em inglês.** Os campos dos mapas (`entities`, `uncertain`,
  `hazards`, `edges`, `designSystem`…) são contrato de máquina e ficam como
  estão; só a prosa dos `.md` é em português.

## Montando num projeto pela primeira vez

1. `/dsx:mapear` (modo `completo`) — os três passos.
2. Se a precisão importa mais que a velocidade, `/dsx:confirmar-mapas` —
   confirma com o usuário o que os mapas marcaram como inferido e grava
   `design/as-is-to-be.md`.
3. Daí em diante, cada skill lê o mapa que lhe cabe: `design-md` Modo A e
   `auditar-ds` partem de `design-system.json`; `construir-ui` de
   `fluxos`/`tarefas`/`dominio`; `revisar-ux` de `jornada`; `figma-fundacoes`
   constrói variáveis, estilos e componentes de ícone do Figma a partir de
   `design-system.json` em vez de re-derivá-los.
