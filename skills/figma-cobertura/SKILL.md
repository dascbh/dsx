---
name: figma-cobertura
description: "Audita a cobertura entre código e Figma (rotas, diálogos, estados × frames) e atualiza a matriz nos dois sentidos. Use quando perguntarem se falta alguma tela no Figma ou para provar cobertura em vez de afirmá-la."
argument-hint: "[code→figma | figma→code]"
---

# figma-cobertura — cobertura se prova, não se afirma

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

"Acho que está tudo lá" é a resposta que sempre está errada. Um espelho do
produto no Figma só vale como documentação se existir uma lista **derivada do
código** e uma conferência item a item contra o arquivo.

Esta skill produz as duas coisas: o inventário e a matriz.

Resumo da auditoria (o resto da skill detalha cada fase):

- Enumere as superfícies **a partir do código** (rotas, diálogos, painéis,
  overlays, estados) e confira contra os frames do arquivo. Para cada item sem
  par, nomeie o destino: **falta**, **coberto por outro frame** (diga qual) ou
  **fora de escopo** (diga o motivo). Só o terceiro encerra o item.
- Se o projeto nasceu no Figma (sentido `figma→code`), leia a matriz
  invertida — frame → rota, com status `implementado` / `partial` / `falta` /
  `não vira código`.
- Números só entram no relatório se vierem de contagem, nunca de estimativa.

## Antes de qualquer coisa

Carregue a skill **`figma-use`** antes de toda chamada a `use_figma`. Leia
`design/figma-changelog.jsonl` (a última rodada e o ponteiro de `findings`) e o
`design/figma-reference.json` se existirem: um gap que pareceria novo pode já
estar registrado como fora de escopo numa rodada anterior.

## Fase A — inventário a partir do código

Nunca da memória, nunca da navegação pelo app. Do código. Se
`.dsx/maps/ui-map.json` já tem páginas, modais e estados levantados, reuse em
vez de rederivar; `.dsx/maps/project-map.json` cobre rotas e componentes num
grão mais grosso se o mapeamento de UI não rodou. Só faça grep do que nenhum dos
dois mapas cobre, e rode a skill `mapear` antes se o projeto andou desde que eles
foram escritos.

**Compatibilidade:** ao procurar um mapa, leia primeiro `.dsx/maps/`; se não
existir, aceite os legados `.dsx/mapas/` (nomes em português: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; chaves JSON antigas em camelCase, como `generatedAt` ou `subPages`, valem como as novas em snake_case; tudo com o aviso "nome antigo, renomeie para X") e `.claude/figma-claude/` (`ui-map.json`,
`project-map.json`, `task-flows.json`) e avise que ele será regravado no caminho
novo na próxima execução de `mapear`.

```bash
# 1. rotas — a espinha
grep -n "path=\|<Route\|createBrowserRouter\|routes:" src/App.tsx src/routes/* 2>/dev/null

# 2. diálogos e modais — a superfície que mais escapa
grep -rn "<Dialog \|<EditDialog\|<Modal\|useConfirm(" src/ | sed 's/:.*//' | sort | uniq -c | sort -rn

# 3. componentes com UI própria (não utilitários)
find src/components src/ui -name '*.tsx' | xargs wc -l | sort -n

# 4. estados que não são rota: empty, carregando, erro, variantes de resultado
grep -rn "EmptyState\|LoadError\|isLoading\|isError\|severity=" src/pages src/components | wc -l
```

### Taxonomia — classifique cada achado

| tipo | como reconhecer | vira |
|---|---|---|
| **rota** | entrada no roteador | um frame |
| **aba** | filho de `<Outlet>` ou `Tabs` dentro de uma rota | um frame por aba |
| **rota de componente compartilhado** | uma entrada de `sub_pages` em `ui-map.json` marcada `nav_visible: true` — um destino distinto do menu de navegação que por acaso renderiza pelo mesmo componente-fonte dos irmãos, via parâmetro de rota | frame próprio, como qualquer outra rota — **nunca** dobrada na contagem do pai |
| **diálogo** | `Dialog`/`Modal` | um frame sobre scrim |
| **painel** | card grande que só existe dentro de uma tela | some ao frame da tela, ou frame próprio se a tela ficar longa demais |
| **overlay** | menu, dropdown, toast, faixa fixa | frame pequeno próprio |
| **estado** | vazio / carregando / erro / cada desfecho de um fluxo com mais de um fim | um frame por variação que muda a decisão do usuário |

Estado que só muda uma palavra não merece frame. Estado que muda o que a pessoa
pode fazer, merece.

**Matriz montada sobre a *contagem* de páginas/rotas pode dar 100% e ainda
assim perder destinos reais de navegação.** Se três links da barra lateral
apontam para um mesmo componente com parâmetro de tipo, `ui-map.json` pode
registrar isso como uma única entrada em `pages` com três `sub_pages` — uma
matriz que só soma entradas de nível superior vai dizer "1 de 1, coberto" e
nunca notar que as outras duas nunca foram construídas. Conte cada sub-página
`nav_visible` como uma linha própria do inventário, igual a qualquer rota.

### Saída da fase A

Uma checklist com **arquivo → superfícies**, com contagem. É ela que vira a
matriz; guarde-a.

## Fase B — conferir contra o arquivo

Liste o que existe de fato, não o que você lembra de ter feito:

```js
// use_figma
return figma.root.children.map(p => ({
  page: p.name,
  frames: p.children.map(c => c.name),
}));
```

Os nomes de frame seguem o formato da skill `figma-convencoes` (ex.:
`Diálogo · Novo produto (ProductsPage)`) — o componente-fonte entre parênteses é
o que permite cruzar frame e arquivo sem adivinhar. Frame fora do formato é, por
si só, um achado: a volta (`figma-trazer`) não consegue ler de volta.

Cruze com a checklist. Para cada item sem frame, decida entre três destinos —
e **nomeie o destino**, não deixe implícito:

1. **falta** → construir;
2. **coberto por outro frame** → dizer qual (um painel dentro da tela conta);
3. **fora de escopo** → dizer o motivo.

Só o terceiro caso encerra o item sem trabalho, e só com motivo escrito.

## Fase C — a matriz no Figma

Uma página `08 · Cobertura` com uma tabela de três colunas:

| Arquivo | O que é | Onde está no arquivo |
|---|---|---|
| `pages/DemandsPage.tsx` | Lista, torre, detalhe, wizard, seleção de proposta | 02 · 3 telas · 05 · 9 diálogos · 06 · vazio, carregando, erro |

Agrupe por camada (fundação, chrome, rotas, cadastros, público). Marque cada
linha com um sinal de coberto — e use um sinal diferente para as exceções, com
o motivo na própria linha.

No topo, uma faixa de contagens **conferidas, não estimadas**:

```js
const total = figma.root.children.reduce((n, p) => n + p.children.length, 0);
```

Se você escreveu "123 frames" e a conta dá 134, a matriz perdeu a autoridade
inteira. Recalcule sempre que adicionar frames.

## A matriz invertida — quando o projeto nasceu no Figma

Se o Figma veio primeiro (skill `figma-primeiro`), a pergunta se inverte: não é
"que tela do código falta desenhar", é **"que frame do design ainda não virou
produto"**. A mesma matriz, lida ao contrário, com uma coluna a mais:

| Frame do Figma | Vira | Status |
|---|---|---|
| `Painel · visão geral` | rota `/painel` | implementado |
| `Painel · sem dados` | estado da rota `/painel` | falta |
| `Painel · v2 (exploração)` | — | não vira código, exploração |

Status possíveis: `implementado`, `partial` (com o que falta), `falta`,
`não vira código` (exploração, rascunho, referência — com o motivo).

A mesma regra de reuso da fase A vale aqui: se `.dsx/maps/ui-map.json` ou
`.dsx/maps/tasks.json` já tem a rota/tarefa do lado do código, use isso nas
colunas "Vira" e "Status" em vez de reconferir o código à mão.

Essa coluna é o que responde "quanto do design já virou produto" sem ninguém
abrir os dois lados — e é onde aparece o débito real do projeto.

## O que legitimamente fica de fora

Camadas sem superfície visual própria — clientes de API, providers de auth e
tema, helpers de formatação, regras de domínio, mocks. **Declare isso no rodapé
da matriz**, com a frase do que elas produzem na tela (mensagens de erro,
formato de data e moeda, tom de cada estado) e onde isso aparece. Omitir sem
declarar parece esquecimento.

## Código órfão — não desenhe, registre

Componente exportado que não está montado em nenhuma rota nem aba não é tela:
é código morto. Confirme antes de concluir:

```bash
grep -rn "NomeDoComponente" src/ | grep -v "arquivo-onde-e-definido"
```

Se não há uso, entre na matriz com sinal de atenção e o motivo: *"exportado mas
não montado em nenhuma rota — desenhá-lo sugeriria uma tela que o usuário não
alcança"*. Isso é um achado sobre o código, entregue de graça pela auditoria.

Achados da auditoria (código órfão, rota de navegação sem frame, frame fora do
formato de nome) recebem severidade 0–4 pela escala da skill `revisar-ux` e
vão para `design/figma-findings/<rodada>.md`, um por achado — é dado, não
narrativa, e não pode ficar só na conversa.

## Relatório ao usuário

Diga o que faltava, o que você fechou e o que ficou fora **com motivo**. Se nada
faltava, diga como verificou — a conferência é a resposta, não a impressão.

Números fechados (rotas, diálogos, estados, frames) só entram no relatório se
vierem da contagem, nunca de estimativa.

## Fechamento

A matriz desta skill e `design/figma-reference.json` (skill `figma-convencoes`,
campo `frames`) são a mesma informação em dois formatos — regenere o JSON a
partir da matriz que você acabou de fechar, nunca deixe um mais novo que o
outro. Se a rodada corrigiu um gap de cobertura, isso também é uma linha nova
em `design/figma-changelog.jsonl` (skill `figma-ciclo`), com
`frames_created`/`frames_changed`/`frames_removed` vindos da contagem e
`findings` apontando para `design/figma-findings/<rodada>.md`.
