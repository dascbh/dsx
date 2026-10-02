---
name: figma-convencoes
description: O contrato estrutural de um arquivo do Figma no ciclo DSX e a sua publicação dentro do próprio arquivo. Parte A (contrato) — numeração e conteúdo de cada página, o formato de nome de frame que `figma-trazer` e `figma-cobertura` leem de volta, a disciplina de correlacionar com o design system existente antes de desenhar qualquer coisa nova, o critério para criar ou evoluir um componente do kit sem quebrar retrocompatibilidade, como posicionar conteúdo novo numa página compartilhada sem colidir, e o formato de `design/figma-reference.json` (os fatos atuais — ids, nomes — que todo agente lê antes de redescobrir por API). Parte B (publicação) — escreve essas convenções no próprio arquivo: uma nota no canvas e `.description` nativa nos componentes, para que qualquer pessoa ou ferramenta que abra o arquivo, com ou sem o DSX, se oriente sem quebrar o round-trip. Use antes de qualquer edição cirúrgica num arquivo já montado — criar uma página nova, editar ou criar um componente do kit, adicionar um ícone, corrigir ou complementar uma tela isolada — que não seja um espelho completo (`figma-espelhar`) nem a aplicação de uma rodada inteira (`figma-trazer`); como passo de fechamento ao montar o ciclo pela primeira vez; e sempre que a estrutura do arquivo mudar o bastante para a nota ficar velha, ou depois de uma rodada em que o ciclo quebrou porque alguém não conhecia uma convenção.
---

# figma-convencoes — o contrato do qual o round-trip depende, escrito onde todo mundo vê

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Nome de página, nome de frame, nome de variável e constraint de vetor não são
estética — são a **interface** que `figma-trazer` e `figma-cobertura` leem
para saber o que cada coisa representa no código. Uma edição que "funciona" na
tela mas quebra essa interface não aparece como erro: aparece como uma linha a
mais na próxima auditoria de cobertura, ou como uma tela que a volta para o
código não sabe mais de onde veio.

Esta skill tem duas partes, e as duas são necessárias:

- **Parte A — o contrato** (seções 1–8): a checklist antes de qualquer edição
  que não seja uma rodada completa das outras skills. Vive no repositório e
  nas instruções que o agente carrega.
- **Parte B — a publicação** (seções 9–13): escrever o essencial do contrato
  **dentro do próprio arquivo do Figma**, porque uma pessoa que abre o
  arquivo direto no app do Figma nunca vê a Parte A.

Antes de qualquer `use_figma`: carregue a skill `figma-use` e leia
[plugin-api.md](../figma-espelhar/references/plugin-api.md) (armadilhas de
layout, texto, cor/variável, vetor, componente/instância — esta skill não
repete o que já está lá, só aponta onde cada regra se aplica). Antes de
qualquer `use_figma` de descoberta, leia `design/figma-reference.json`
(seção 8).

**A vez vale aqui também.** Toda edição desta skill escreve no Figma: leia
`design/figma-sync.md` (skill `figma-ciclo`) antes. Com `vez: design` (ou o
legado `turn: design`), edição vinda do código não acontece — e mesmo a nota
da Parte B, que é pequena, pode colidir visualmente com o que está sendo
trabalhado: diga ao usuário que há refino em curso e **confirme antes** de
acrescentar qualquer coisa. Sem registro, o ciclo ainda não foi montado:
ofereça `/dsx:figma-iniciar`.

---

# Parte A — o contrato estrutural

## 1. Estrutura de página — a numeração é o índice

```
00 · Fundamentos      capa + cor + tipografia/forma
01 · Componentes      ícones, chrome, kit de primitivos
02…0N · <áreas>        uma página por área/perfil de usuário, uma tela por rota
0N+1 · Fluxos
0N+2 · Diálogos
0N+3 · Estados e variações
0N+4 · Responsivo
0N+5 · Cobertura
09 (ou a última) · Propostas   — reservada para exploração de design (skills figma-ciclo e figma-propostas), NUNCA conteúdo de produto
```

**Antes de criar uma página nova**, pergunte: isso é uma **área/perfil real do
produto** (ex.: um novo portal de outro papel) ou é **uma tela a mais dentro de
uma área que já existe**? Só o primeiro caso justifica página nova — o segundo
é só mais um frame na página que já existe, na faixa livre (seção 6).

Se a resposta for página nova, ela entra na posição semântica certa da
sequência, não no fim. Os nomes de página são strings, não ids — renumerar é
seguro para o Figma (o `id` do nó não muda quando você troca `page.name`), mas
tem dois custos que precisam ser pagos na mesma rodada:

- **depois de renumerar, `grep` o repo pelo nome velho** (`design/figma-sync.md`,
  `design/figma-reference.json`, qualquer script ou skill que cite
  `"0X · Nome"` literal) e atualize as referências;
- **regere o baseline**: o retrato canônico (`tools/figma/snapshot.js`)
  identifica cada frame por `página › nome do frame`, então renomear a página
  faz o próximo diff ler todos os frames dela como "removido + novo".

Nunca insira uma página fora de sequência só para evitar o trabalho de
renumerar.

## 2. Nome de frame — o campo do qual tudo depende

```
<Rótulo> · <ação ou estado> (<origem exata no código>)
```

A `<origem>` é a parte que sustenta o contrato: precisa ser um caminho de
arquivo, uma rota, ou um nome de export — nunca uma descrição vaga. `(Painel de
notificações)` não permite que `figma-trazer` ou `figma-cobertura` liguem o
frame a `components/NotificationBell.tsx`; `(NotificationBell)` permite.

```
Demandas · Lista (/demandas)
Diálogo · Novo produto (ProductsPage.tsx)
Overlay · menu de notificações (NotificationBell.tsx)
Espécies · Lista · isError (OntologyTabs.tsx SpeciesTab)
```

Editou um frame existente sem mudar o que ele representa? **Não renomeie.** O
nome é a chave que o diff e a cobertura usam para parear "antes" e "depois" no
nível do frame — o retrato identifica cada frame por `página › nome do frame`
—, então trocar o nome de um frame que só teve o conteúdo ajustado faz o diff
ler como "frame apagado + frame novo" em vez de "frame mudou". (Dentro do
frame, os nós são pareados por `id` e depois por caminho — seção 10.)

## 3. Antes de desenhar qualquer coisa nova — correlacione, não reinvente

A própria página `01 · Componentes` já carrega a regra, na legenda do Kit de
Primitivos: *"Token ou primitivo ausente = parar e propor, nunca inventar
inline."* Isso não pode ser só uma frase que ninguém lê — é o gate que evita
que cada tela nova vire uma reinterpretação levemente diferente da anterior.

Antes de escrever o script que compõe uma tela, diálogo ou estado:

1. **Busque primeiro.** Liste o que já existe na página `01 · Componentes`
   (as specs "Spec · X" e suas descrições de uso) e nas funções de
   `tools/figma/preludio.js`. `figma.currentPage.query()` no frame do kit é
   mais barato e mais confiável do que confiar em memória de uma rodada
   anterior. Se o arquivo usa biblioteca publicada, `search_design_system`
   também (skill `figma-levar`, "Reusar antes de criar").
2. **Existe algo que resolve isso?** Use o helper/instância existente. Não
   monte a estrutura equivalente com `createFrame`/`createText` cru só porque
   é mais rápido no momento — é exatamente esse atalho que produz duas peças
   visualmente parecidas e estruturalmente diferentes.
3. **Existe algo PARECIDO mas não idêntico?** Não é ainda uma decisão de
   desenhar — é a entrada da seção 5 (criar ou evoluir). Pare e decida lá, não
   resolva inline "só desta vez".
4. **Nada existe** e você confirmou isso (não presumiu) → aí sim é composição
   nova. Se ela for exclusiva desta tela, componha local. Se você já sabe que
   vai se repetir, vá direto para a seção 5.

Isto é sobre a **construção do sistema**, não sobre "limpar" o que o código
faz — a regra zero (seção 7) continua mandando espelhar uma tela feia como
está. O que esta seção proíbe é criar uma inconsistência **nova**, no
próprio espelho, por atalho.

Um exemplo real do que essa disciplina existe para evitar: `TorreSummaryStrip`,
em `DemandsPage.tsx`, duplica a forma visual de `StatStrip` localmente no
próprio código-fonte — porque o `toneColor` de `StatStrip` não produzia a cor
que a Torre de Controle precisava. O espelho reproduziu essa duplicação
fielmente (é o código real, a regra zero manda desenhar como está) — mas é
exatamente o tipo de garfo que esta seção existe para impedir **dentro do
Figma**: se duas telas do espelho precisam de "quase StatStrip", isso é sinal
de evoluir o primitivo StatStrip (seção 5), não de duas cópias divergentes no
arquivo de design.

## 4. Editar um componente existente sem quebrar as instâncias

Um componente do kit (ícone, botão, chip, AppBar, Drawer) já tem dezenas a
centenas de instâncias espalhadas pelo arquivo. A regra:

- **Edite o nó do componente principal no lugar** (mesmo `id` —
  `getNodeByIdAsync` + mutação), nunca apague e recrie. Recriar muda o id, e
  toda instância existente vira uma instância órfã do componente antigo.
- O Figma recalcula instâncias existentes contra o componente principal
  automaticamente — você **não** precisa (e não deve tentar) tocar frame por
  frame. Depois de editar o principal, confira o efeito numa amostra pequena de
  instâncias já em uso em telas reais (não só numa instância nova criada para
  teste), porque é isso que prova que a propagação funcionou.
- **Depois de qualquer rodada grande de `use_figma`**, procure componentes que
  você não criou: o servidor MCP costuma componentizar estruturas repetidas
  sozinho (`figma.currentPage.query('COMPONENT, COMPONENT_SET')` e compare com
  o que você esperava criar). Isso achata variação — ver "a armadilha cara" em
  [plugin-api.md](../figma-espelhar/references/plugin-api.md).
- **Nunca apague um nó pequeno e solto** só porque parece descartável — pode
  ser o componente principal de Chip/Botão/Ícone. Confira `type` e `name`
  antes de qualquer `.remove()`.

## 5. Criar ou evoluir um componente do kit — critério, não impulso

Esta é a decisão que a seção 3 empurra para cá quando "busque primeiro" não
resolveu sozinho. Siga nesta ordem, sem pular etapa:

1. **Valide de novo, explicitamente.** Confirme com uma busca real (`query()`
   na página 01, nomes de variável/estilo) que não existe — "acho que não
   tem" não é validação.
2. **Existe e serve** → pare aqui, reuse via instância/token. Isto nunca
   deveria ter chegado à seção 5 — se chegou, releia a seção 3.
3. **Existe mas não serve exatamente** (falta uma variação, um tamanho, um
   estado) → é candidato a **evoluir o componente existente**, não a um
   componente paralelo. Critério para distinguir evoluir de criar novo: mesmo
   propósito semântico e mesma família visual → evoluir (nova variante/prop
   no componente que já existe); propósito diferente → primitivo novo.
4. **Não existe mesmo** → confirme que serve (ou vai servir) em **≥ 2
   lugares** — o mesmo critério que o diff do ciclo já usa (`mesma mudança em
   ≥ 2 frames = primitivo`). Um uso só é composição local da tela (seção 3,
   passo 4), não vira peça do kit.
5. **Ao criar OU atualizar**, respeite o que já está estabelecido — não
   introduza um padrão visual novo pela porta dos fundos:
   - **variável/token**: só existe se tiver valor real correspondente nos
     tokens do projeto (DTCG, `theme.ts` ou equivalente) — nunca invente
     porque "faria sentido"; token novo nasce no código pela skill `tokens` e
     chega ao Figma pela ponte `tools/figma/tokens-para-figma.mjs`, nunca o
     contrário. Nome = caminho DTCG com `/` no lugar de `.`
     (`color/feedback/danger-icon`, `space/stack-md`); ponto dentro do nome
     falha (`space/0.5` não — o DSX grava `space/0_5`); `scopes` explícito;
     variável semântica preenchida nos dois modos (`Claro`/`Escuro`) da
     coleção `Semântico`; regra de uso copiada da tabela "Colors" do
     `DESIGN.md` para a `description`.
   - **ícone**: `COMPONENT` 24×24, path normalizado para `M/L/C/Q/Z` absolutos
     com todo subpath fechado com `Z` (`node <DSX>/tools/figma/normalizar-svg-path.cjs "<d>"`),
     nome exato `Ícone/<NomeExportadoPeloPacote>`, `constraints: SCALE` em
     **todo** vetor filho — não só no primeiro, se o ícone tiver mais de um
     path interno (contorno + furo, como `Visibility`/`DeleteOutline`). Na
     instância, o tamanho muda com `rescale(tamanho / 24)`, não `resize`
     (`icon()` de `tools/figma/preludio.js`).
   - **primitivo**: mesma densidade, raio, hierarquia de botão e escala
     tipográfica que o resto do kit já define — um primitivo novo não é
     licença para reabrir essas decisões.
   - documente na página `01 · Componentes` no mesmo formato "Spec · X" das
     peças existentes: nome, descrição de uso, exemplo populado com dado real
     — e a `.description` nativa do componente (seção 12);
   - se a composição depende de script, adicione a função helper equivalente
     em `tools/figma/preludio.js` (ou na cópia do projeto) na mesma rodada —
     senão o próximo agente reinventa de novo, e a seção 3 falha
     silenciosamente para ele.
6. **Retrocompatibilidade não é opcional ao atualizar — e não se prova por
   instrução, só por teste.** A doutrina já pedia `constraints: SCALE` em todo
   ícone desde sempre, e mesmo assim uma fundação inteira de 51 ícones foi
   criada com `MIN/MIN` numa rodada real — a instrução sozinha não bastou.
   Depois de mudar um componente existente: (1) instancie em condição
   adversa — para ícone, tamanho pequeno (≤ 16px, menor que os 24px nativos);
   (2) confira renderizado numa amostra de instâncias que **já estavam em
   produção** antes da sua mudança, não só numa instância nova criada para
   testar. Foi assim que a correção de constraint dos ícones foi confirmada
   na prática: checando o ícone do botão "Nova norma" e do dropdown de CRO
   já existentes em telas reais. Se a amostra antiga quebrou ou não mudou, o
   "arranjo" não terminou — o Plugin API aceita a constraint errada sem
   reclamar, só o screenshot mostra.
7. **Registre a decisão**, não só o resultado — "evoluí X em vez de criar Y
   porque Z" é o dado que evita que outro agente desfaça sua escolha na
   próxima rodada por não saber que ela foi deliberada. Lugar: a linha da
   rodada em `design/figma-changelog.jsonl` (campo `resumo`) e, se a peça
   ganhou regra de uso nova, o `DESIGN.md` (skill `design-md`).

## 6. Posicionar conteúdo novo sem colidir

Páginas de telas/diálogos/estados recebem contribuição de várias rodadas (e,
com Workflow, de vários agentes ao mesmo tempo). Nunca assuma posição livre —
**meça antes de posicionar**:

```js
const p = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(p);
const maxX = Math.max(0, ...p.children.map(c => c.x + c.width));
const maxY = Math.max(0, ...p.children.map(c => c.y + c.height));
// novo conteúdo começa em maxX + uma folga generosa (≥1500px), nunca em (0,0)
```

Se o trabalho vai rodar em paralelo (vários agentes de um `Workflow` na mesma
página), reserve uma **faixa X exclusiva por agente** antes de disparar — cada
um empilha verticalmente dentro da própria faixa. Faixas de 2000–2200px de
largura cobrem confortavelmente uma tela de 1440px ou um diálogo com folga.
(Posicionar em paralelo não muda a regra de que as **mutações** em si são
sequenciais por arquivo — skill `figma-levar`.)

## 7. Regra zero ainda vale numa edição cirúrgica

Editar um componente ou complementar uma tela não é licença para "já que estou
aqui, deixa eu ajeitar". Se o código está feio, inconsistente ou faltando
tratamento de erro, **desenhe como está** e registre o achado — a mesma regra
de `figma-espelhar` (formato em `design/figma-achados/<rodada>.md`, severidade
0–4). Uma correção estética deliberada é refino de design, e refino de design
só acontece com `vez: design` no registro de sincronia (`figma-ciclo`) — nunca
como efeito colateral de uma edição vinda do código.

## 8. Referência de agente — não redescubra, leia

Cada agente que abre o arquivo (de qualquer lado — vai escrever no Figma, ou
vai ler o Figma para mudar código) tende a **redescobrir** os fatos básicos do
zero: qual é o id da coleção de variáveis, qual o id do frame de ícones, quais
os nomes exatos dos 51 ícones, qual componente é o AppBar. Isso custa chamadas
de API caras e — pior — cada agente pode descrever o mesmo fato com uma
palavra diferente, e aí dois agentes que nunca se leram divergem sem perceber.

Mantenha `design/figma-reference.json` no repo do código, no mesmo diretório
do registro de sincronia. Não é editado à mão — é **regenerado** ao fim de
qualquer fase que crie ou mude fundação/estrutura (`figma-fundacoes`,
`figma-espelhar` fases 2–3, `figma-levar`, `figma-cobertura` ao fechar a
matriz, e sempre que a seção 5 desta skill criar ou atualizar um componente):

```json
{
  "fileKey": "6I4VlpwuCYRfpx4yYQqHx3",
  "fileUrl": "https://www.figma.com/design/6I4VlpwuCYRfpx4yYQqHx3",
  "atualizadoEm": "2026-08-18",
  "paginas": { "00 · Fundamentos": "0:1", "01 · Componentes": "2:2", "…": "…" },
  "fundacao": {
    "colecoes": {
      "Primitivos": { "id": "VariableCollectionId:3:1", "modos": { "Valor": "3:0" } },
      "Semântico": { "id": "VariableCollectionId:3:2", "modos": { "Claro": "3:1", "Escuro": "3:2" } },
      "Componente": { "id": "VariableCollectionId:3:3", "modos": { "Valor": "3:3" } }
    },
    "variaveis": ["color/bg/canvas", "color/bg/surface", "color/text/primary", "…"],
    "estilosTexto": ["Título/Página (h4)", "…"],
    "icones": { "frameId": "5:2", "nomes": ["Add", "Cancel", "…"] },
    "chrome": { "appbar": "13:13", "drawerAberto": "13:14", "drawerRecolhido": "13:40" },
    "kitPrimitivosFrameId": "14:20"
  },
  "frames": [
    { "id": "27:1428", "name": "Demandas · Lista (/demandas)", "origem": "DemandsPage.tsx", "pagina": "02 · App do patrocinador" }
  ]
}
```

`frames` é a mesma informação da matriz de `08 · Cobertura`, só que em formato
que um agente lê com `Read` em vez de reconstruir com `get_metadata` — as duas
devem sempre bater; se divergirem, a matriz no Figma é a fonte de verdade e o
JSON está desatualizado (regenere). `fundacao.icones.frameId` e os nomes de
estilo são o que preenche o bloco CONFIGURE de `tools/figma/preludio.js`.

Todo agente desta doutrina começa uma sessão de trabalho **lendo este arquivo
primeiro**, antes de qualquer `use_figma` de descoberta — só cai para
`get_metadata`/`get_variable_defs` quando o arquivo não existir ainda ou algum
id citado nele não resolver mais (sinal de que ele está desatualizado e
precisa ser regenerado, não de que o agente deve adivinhar).

---

# Parte B — o arquivo se explica sozinho, mesmo sem o DSX

## 9. Por que publicar o contrato no próprio arquivo

Toda a doutrina da Parte A — numeração de páginas, nome de frame,
reusar-antes-de-criar, a página `09 · Propostas` para explorar alternativas,
Sections por fluxo — vive como instruções que o **DSX** carrega numa sessão de
agente. Uma pessoa de design que abre o arquivo direto no app do Figma nunca
vê nada disso. Nem um outro agente de IA, nem a sessão de um colega sem o DSX,
nem as ferramentas nativas do próprio Figma. A convenção é real, mas é
invisível para todo mundo que não é o DSX, neste repo, agora.

É nessa lacuna que o round-trip quebra de verdade — não por mau gosto, mas por
uma edição estrutural que ninguém sabia que estava fora da convenção.

## 10. O que de fato quebra o round-trip — e o que não

O diff (skill `figma-ciclo`, [references/diff.md](../figma-ciclo/references/diff.md);
`tools/figma/snapshot.js` e `tools/figma/diff-baseline.cjs`) trabalha em dois
níveis, e a diferença importa:

- **Frame de topo:** identificado por `página › nome do frame`.
- **Nós dentro do frame:** pareados por **`id` do Figma** primeiro, depois por
  caminho (`página/frame/nome[ordinal]/…`) no que sobrou, e só então
  classificados como adicionado/removido.

Consequências:

- **Editar o conteúdo de um frame no lugar é seguro.** Os ids sobrevivem; o
  diff encontra cada nó e mostra exatamente o que mudou.
- **Renomear um frame (ou a página dele, ou movê-lo de página) não é
  inofensivo.** O frame em si ainda existe, mas o diff o lê como "frame
  removido" + "frame novo" e não mostra o que mudou dentro. Se o nome precisa
  mudar porque o frame passou a representar outra coisa (seção 2), faça a
  troca e **regere o baseline na mesma rodada**, e regenere
  `design/figma-reference.json`. Mantenha sempre o sufixo `(<origem>)` — é
  dele que uma pessoa ou um script rederiva a ligação com o código.
- **Apagar um frame e desenhar um novo no lugar é pior.** O frame novo não tem
  id em comum com nada do baseline — mesmo com o mesmo nome, os nós só
  pareiam por caminho, e o que não casar aparece como um par sem relação
  `+ novo` / `− removido` em vez de um diff da coisa que de fato mudou; toda
  decisão de design já aplicada numa rodada anterior parece pedir revisão de
  novo.
- **Explorar uma variante dentro de uma página real (02, 03…) em vez de
  `09 · Propostas`** não quebra o pareamento mecanicamente, mas quebra o
  contrato: o próximo espelho ou passada de cobertura lê aquilo como "é assim
  que a tela está agora", não "uma de três opções em consideração" (skill
  `figma-propostas`).
- **Reestruturar o que está aninhado em quê** (envolver o conteúdo de um frame
  num grupo novo) muda o caminho do percurso mesmo quando as folhas mantêm os
  ids — o diff ainda encontra os nós, mas quem lê o relatório tem mais trabalho
  para distinguir "moveu" de "mudou".

Nada disso é imposto pelo Figma. É imposto por quem edita o arquivo saber
disso — que é exatamente o que esta parte torna possível para quem nunca leu a
doutrina do DSX.

## 11. Dois lugares onde a convenção precisa morar — escreva nos dois

1. **O repositório** (`design/figma-sync.md`, `design/figma-reference.json`,
   `.dsx/figma/ledger.json`, `.dsx/mapas/*.json`) — autoritativo, versionado,
   no git. Lido por qualquer sessão de agente com o DSX neste repo. Invisível
   para quem abre o arquivo do Figma diretamente.
2. **O próprio arquivo do Figma** — visível para todo mundo que o abre,
   qualquer que seja a ferramenta. Dois mecanismos nativos:
   - **Uma nota no canvas** (um frame de texto de verdade) — legível por uma
     pessoa, e por qualquer agente de IA que chame
     `get_metadata`/`get_design_context` naquela página, mesmo um que nunca
     ouviu falar do DSX.
   - **`.description` em componentes e frames** — aparece automaticamente no
     Dev Mode e no painel Assets, e é o que `get_design_context` devolve para
     um componente sem ninguém precisar procurar um bloco de texto antes.

Os artefatos do lado do Figma não substituem o registro do repo — a nota no
canvas termina com um ponteiro para ele, não com uma cópia do conteúdo. Estado
(o que foi aplicado, o que foi recusado, de quem é a vez) continua morando só
em `design/figma-sync.md`; duplicá-lo no canvas só cria uma segunda cópia,
mais velha, para ficar desatualizada.

### Antes de escrever

Leia `.dsx/figma/ledger.json` (`entities.pages`), `design/figma-reference.json`
(`paginas`) e `design/figma-sync.md` para a ordem real de páginas do projeto,
o padrão de nome de frame e o caminho do repo — **nunca** cole o modelo
abaixo literalmente. (Legado: aceite `.claude/figma-claude/figma-registry.json`
se o ledger novo ainda não existir.)

### A nota de convenções no canvas

Onde: a capa de `00 · Fundamentos`, ou uma pequena section própria se a capa
já estiver densa com o conteúdo de cor/tipo/hazard que `figma-fundacoes` e
`figma-levar` puseram lá (ou onde a página de fundações do projeto já guarda
suas próprias notas). Gere a partir dos **fatos atuais e reais do projeto** —
a ordem de páginas como foi de fato construída, o caminho real do repo, se a
página `09 · Propostas` já existe — nunca cole o modelo abaixo literalmente:

```
CONVENÇÕES — leia antes de editar

Ordem das páginas: 00 Fundamentos · 01 Componentes · 02+ telas por perfil/área ·
NN Fluxos · NN Diálogos · NN Estados · NN Responsivo · NN Cobertura · 09 Propostas.
Página nova só para uma área/perfil real do produto, na posição semântica certa;
tela a mais de uma área existente é frame novo na página que já existe.

Nome de frame: "<Rótulo> · <ação ou estado> (<origem no código>)" —
ex.: "Demandas · Lista (/demandas)", "Diálogo · Novo produto (ProductsPage.tsx)".
A matriz de cobertura e a volta para o código usam a origem entre parênteses
para achar o arquivo que o frame representa. Edite frames NO LUGAR; não
renomeie um frame só porque o conteúdo mudou (o diff lê frame renomeado como
removido + novo), e nunca apague e redesenhe — o histórico se perde.

Explorando uma alternativa? Duplique em "09 · Propostas", não ao lado do
original dentro de uma página real. Variante deixada numa página real é lida
como "é assim que a tela está agora" no próximo espelho ou cobertura.

Reuse antes de desenhar algo novo: confira 01 · Componentes (e qualquer
biblioteca ligada) primeiro. Parecido mas não igual → evolua o componente ou
envolva uma instância, não crie um garfo em silêncio. Token ou primitivo
ausente = parar e propor, nunca inventar inline.

Estado completo — o que foi aplicado, o que foi recusado e por quê, de quem é
a vez agora — vive no repositório ligado, não aqui: design/figma-sync.md
(<caminho ou URL do repo, se conhecido>).
```

Se o projeto ainda não tem a página `09 · Propostas`, crie uma vazia nesta
passada ou diga claramente na nota que a exploração ainda não tem casa — não
referencie uma página que não existe.

## 12. Descrição de componentes e frames

No mínimo, todo componente de `01 · Componentes` ganha uma:

```js
// use_figma
node.description =
  "Corresponde a apps/web/components/ui/Cta.tsx. Só a variante primária.";
// ou, se ainda não há correspondente no código (um primitivo que o DSX
// construiu porque não existia nada parecido no código real):
node.description =
  "Só no Figma — sem equivalente no código. Criado durante o espelho porque " +
  "o app monta esse padrão inline em vez de como componente compartilhado. " +
  "Não ligue ao Code Connect.";
```

Se o `DESIGN.md` tem regra de uso para o componente (quando usar, quando não
usar), acrescente-a em uma frase depois do mapeamento — é o que uma pessoa de
design lê no painel Assets.

Diga explicitamente quando não há correspondência no código — a mesma regra de
honestidade que a exposição de hazards da skill `figma-levar` já aplica a
tokens. Um mapeamento falso que parece plausível é pior que uma lacuna
admitida, porque é o tipo de coisa em que o Code Connect ou um agente futuro
confiaria às cegas.

Alguns tipos de nó bloqueiam propriedades do mesmo jeito que
`SectionNode.devStatus` pode ser bloqueado por uma ponte MCP (a skill
`figma-levar` documenta essa falha para Sections) — confira o que a API ao vivo
de fato permite antes de prometer que uma descrição foi definida; se um tipo
recusar, cubra aquele nó na nota do canvas e diga isso no relatório.

### Verificação e relatório

Screenshot da nota e de uma amostra de componentes no painel (ou do retorno de
`get_design_context` de um deles) e confirme que estão legíveis antes de
terminar. Relate: o que foi escrito, onde, e tudo o que não pôde ser definido
(um tipo de nó que bloqueia `.description`, uma página `09 · Propostas`
ausente) com o que foi feito no lugar.

## 13. Quando rodar a Parte B — e o que ela não resolve

Rode:

- como passo de fechamento toda vez que o ciclo é montado pela primeira vez
  num projeto (skill `figma-iniciar`) — logo depois do registro de sincronia,
  antes de o arquivo ser entregue a uma pessoa de design ou a qualquer um fora
  das sessões do DSX;
- ao fim da primeira construção de `figma-levar`;
- sempre que a numeração de páginas ou a convenção de `09 · Propostas` mudar;
- sempre que uma rodada quebrou por causa de uma edição estrutural que não
  seguiu a convenção — atualize a nota com o que aconteceu de fato, do mesmo
  jeito que um quadro de hazard registra um achado: específico, datado, nada
  vago.

O que ela **não** resolve: isto torna a convenção **descobrível**, não
**imposta**. Uma pessoa ou outra IA ainda pode ignorar a nota e apagar e
recriar um frame em vez de editá-lo. Pegar isso não é trabalho desta skill — é
dos diagnósticos "Sinais de que o ciclo quebrou" da skill `figma-ciclo` e do
mecanismo de diff/reconciliação na retomada, que existem para detectar e
recuperar exatamente isso, não para impedir de vez. Esta parte reduz a
frequência tornando a regra visível para quem está prestes a quebrá-la; não
promete zero.

---

## Checklist antes de fechar qualquer edição estrutural

- [ ] Conferi a vez em `design/figma-sync.md` antes de escrever
- [ ] Antes de compor algo novo, busquei na página 01 e no prelúdio — não
      presumi que não existia (seção 3)
- [ ] Se criei ou atualizei um componente do kit: validei ausência, confirmei
      uso em ≥ 2 lugares, e testei retrocompatibilidade em instância já
      existente, não só numa nova (seção 5)
- [ ] Componente novo ou alterado tem `.description` honesta (com ou sem
      correspondente no código) (seção 12)
- [ ] Screenshot do que foi editado, renderizado — não só o retorno do script
- [ ] Nenhuma instância ficou órfã (componente apagado/recriado com id novo)
- [ ] Nenhum componente novo apareceu por conta do MCP sem eu ter criado
- [ ] Todo frame novo/editado tem `<origem>` exata entre parênteses no nome
- [ ] Nenhum frame teve o nome trocado sem mudar o que representa; se trocou
      (ou página renumerada), o baseline foi regerado na mesma rodada
- [ ] Se mudou o que uma rodada cobre: `design/figma-sync.md` e a matriz de
      `08 · Cobertura` (ou equivalente) refletem o novo estado — não deixe a
      próxima auditoria descobrir sozinha
- [ ] Se mexeu em fundação, página, frame ou componente do kit:
      `design/figma-reference.json` (seção 8) foi regenerado — não deixado
      desatualizado para o próximo agente redescobrir ou, pior, confiar num id
      que já mudou
- [ ] Se mudou página, numeração ou a convenção de propostas: a nota de
      convenções no canvas foi atualizada (seção 11)
- [ ] O registro de sincronia ganhou uma entrada no changelog estruturado
      (`design/figma-changelog.jsonl` — skill `figma-ciclo`)
