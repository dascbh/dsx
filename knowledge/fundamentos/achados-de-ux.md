# Registro de achados de UX

> **Quando consultar**
> - Depois de rodar qualquer verificador de UX (`tools/ux-lint/text.mjs`, `screen.mjs`, `flow.mjs`): o resultado entra no registro, nunca fica só na conversa.
> - Para saber o que está aberto, o que o dono já decidiu, o que foi corrigido e o que voltou.
> - Ao montar a trava contra piora (pre-commit ou CI) de um projeto.

## Por que existe

Um verificador só acha. Sem um registro durável, cada execução recomeça do zero: perde-se o que o dono escolheu, não se sabe o que já foi corrigido e o mesmo problema volta sem ninguém notar. O registro dá a cada achado um **id estável**, guarda a **decisão do dono separada do resultado da máquina** e calcula o **status** comparando execuções.

## Onde fica (no projeto, versionado)

```
.dsx/findings/<modulo>/
├── findings.json   # escrito pela ferramenta a cada registro (não edite à mão)
├── options.json    # escrito pela skill: 2–3 opções por achado, com convenção e recomendação
├── decisions.json  # escrito pelo dono (página ou chat → `findings.mjs decide/import`)
└── previews/       # gerado por preview.mjs, fora do git (ver "Prévia das opções")
```

Os três ficam separados de propósito: registrar de novo reescreve só `findings.json`; opções e decisões sobrevivem.

## Formato

`findings.json`
```json
{
  "module": "contratos",
  "updated": "2026-10-03",
  "runs": [{ "at": "2026-10-03T12:00:00Z", "sources": ["text", "screen", "flow"], "commit": "602d8c2" }],
  "items": [{
    "id": "t-7f3a9c2e",              // prefixo da família (t | s | f | st | c) + 8 hex do hash estável
    "family": "text",                // text (X) | screen (T) | flow (F) | states (S) | consistency (C)
    "rule": "X1",
    "severity": 2,                   // 0–4
    "element": "button",             // button | title | label | placeholder | tooltip | helper | alert | tab | menu | cell | accessible-name
    "text": "Remover da lista — {}",
    "variants": ["Remover da lista — Ricardo Almeida"],
    "screens": ["07-dlg-destinatarios"],
    "source": ["frontend/src/pages/contratos/assinatura/DestinatariosDialog.tsx:80"],
    "message": "travessão no texto",
    "origin": "detector",            // detector (veio de um verificador) | review (revisão manual, via opções)
    "first_seen": "2026-10-03", "last_seen": "2026-10-03",
    "present": true,                 // apareceu na última execução da sua família
    "fixed_at": null,                // dia em que deixou de aparecer pela última vez (guarda a memória para `regression`)
    "status": "open"                 // calculado (ver ciclo)
  }],
  "deviations": [{ "id": "D3", "screens": ["modelo-editor"], "rules": ["T3"], "reason": "…", "decided_by": "dono", "until": null }]
}
```
`deviations` é a cópia dos desvios declarados no `UX.md` na última execução que o leu (`register --ux`, ou `<root>/UX.md`). Item coberto por um deles leva também `"deviation": { "id", "reason", "decided_by", "until" }` e status `accepted-deviation`.
Itens da família `layout` levam também `selectors` (caminho do elemento medido na captura, só para localizar a prévia; não entra no id). Itens das famílias `screen` e `states` levam também `region` (em `states`, o estado + a região: `error · main`). `source` é relativo à raiz do projeto; nas famílias `screen`, `states` e `consistency` aponta a captura (`.html:linha`), nas outras o código.

**Id estável** = hash de `family | rule | âncora`, onde a âncora é, nesta ordem: a primeira origem no código sem o número da linha (o arquivo) + o texto normalizado (minúsculas, espaços únicos, dados variáveis trocados por `{}` — números, datas, horas, valores e, quando há `variants`, o trecho que muda entre elas); sem origem no código, a tela + região + texto. Mudar a linha do arquivo não muda o id; mudar o texto ou o arquivo muda. Dois ajustes declarados: na família `flow` a âncora é sempre a tela (ou jornada) do mapa, porque a evidência dela lista transições de entrada que mudam sem o achado mudar; e nas famílias `text` e `consistency` sem origem no código a âncora não leva tela, porque o achado agrupa várias telas (em `consistency`, o texto é a função ou o conceito — "excluir minuta" —, não os rótulos achados). Quando o conjunto de variantes muda e com ele o texto-modelo, o item herda o id registrado de mesma família, regra e arquivo que tenha uma variante em comum.

`options.json`
```json
{ "items": { "t-7f3a9c2e": { "problem": "…", "options": [{ "text": "…", "convention": "Polaris: verbo + objeto", "note": "…" }], "recommended": { "index": 0, "why": "…" }, "case": "c16" } } }
```
`case` (opcional) agrupa ids cobertos pelo mesmo caso: a página mostra um cartão só e a decisão vale para todos.
`preview` (opcional, em cada opção) diz como mostrar a opção aplicada à tela real; sem ele vale a prévia padrão da família (ver "Prévia das opções").

`cases.json` (entrada de `findings.mjs options --from` e de `text-page.mjs`, escrito pela skill)
```json
{ "cases": [{ "id": "c16", "element": "button", "rule": "X2", "severity": 2, "text": "Remover da lista — Ana", "variants": [],
  "source": ["src/Dlg.tsx:80"], "screens": ["07-dlg"], "problem": "…",
  "options": [{ "text": "…", "convention": "Polaris: verbo + objeto", "note": "…" }], "recommended": { "index": 0, "why": "…" } }] }
```

## Prévia das opções (antes e depois tirados da captura)

A página de decisão mostra cada caso com a **imagem de hoje** e, em cada opção, a **imagem depois**, recortadas da captura real da tela (os pixels da captura feita pelo código, nunca maquete nem tela gerada por texto). Quem gera é `tools/ux-lint/preview.mjs` (ou `audit.mjs --preview`); a página só lê o resultado.

**Como acha o elemento.** Pelo que o achado já guarda: texto e variantes (o texto-modelo vira padrão, `{}` casa com qualquer trecho), rótulos citados na mensagem (T1, T7, L1, L6, L8), o começo do texto (L7), o exemplo citado (T6), o atributo (`aria-label`, `title`, `placeholder`) quando o texto não está em pixels, e o **seletor medido** das regras L: o `register` guarda em `selectors` o caminho do elemento que o `measure.mjs` mediu, sem entrar no id. Tela representativa: a primeira tela do caso onde o elemento aparece (as capturas de estado da mesma tela entram depois); no C2, a tela da variante que destoa.

**Recorte.** O diálogo inteiro quando o elemento está num diálogo; senão o cartão, seção ou grupo ao redor, com até ~720 px de largura (mais só quando o próprio elemento é mais largo), escala 1, sempre com o elemento inteiro dentro. O "depois" usa a mesma janela do "antes" (a união dos recortes de todas as opções, com balões e selos), então dá para comparar sem mexer o olho. Antes: elemento contornado em vermelho; depois: o elemento alterado ou montado contornado em verde (remoção: linha tracejada onde ele estava). Imagens em WebP (JPEG se o navegador não codificar WebP), qualidade ~70. Achado da tela inteira mostra a tela em meia escala; com estado ou região montados na tela, o diálogo aberto sai recortado em escala 1. L6 mostra a janela inteira (a dobra é o assunto), com a linha da dobra antes e depois.

**Sempre da captura, nunca maquete.** Tudo o que a prévia acrescenta vem de alguma captura do módulo: o **kit de doadores** (`tools/ux-lint/lib/preview-kit.mjs`, cache em `previews/kit.json`) percorre as capturas e guarda, com o CSS que cada pedaço usa, o bloco de estado de `*.error.html`, `*.empty.html` e `*.loading.html` (o que a captura de estado tem e a tela base não tem; com o alinhamento e o espaçamento do contêiner que o envolvia), alertas por cor, botões por variante, painel, título, legenda, chip, texto de apoio, campo de busca, as classes de tooltip do kit, a cor de erro do tema (regra `.Mui-error`) e a escala de títulos h1–h6 como o produto a usa (moda do tamanho de cada nível, sem nível de baixo maior que o de cima). Quando a própria captura tem o pedaço, ele vem dela; senão, do kit.

**Operações** (campo `preview` da opção: um objeto ou uma lista aplicada em ordem):

| `op` | Efeito no DOM da captura | Campos |
|---|---|---|
| `text` | troca o texto do elemento (no campo, o placeholder); botão só de ícone (achado pelo `aria-label`) vira anotação de leitor de tela | `text`, com marcadores: `{self}` (texto de hoje), `{part:0}`/`{part:1}` (blocos separados por travessão, `·` ou `\|`), `{no-parens}` (sem o parêntese), `{context}` (rótulo mais próximo antes do elemento, em minúsculas) |
| `remove` | esconde o elemento | — |
| `variant` | copia as classes de um botão com a variante pedida (da captura, senão do kit; nunca de um botão desabilitado) | `variant`: `contained` \| `outlined` \| `text` |
| `move` | leva o elemento para o fim ou o começo do grupo de ações e/ou alinha o contêiner; `region-top` sobe o elemento (ou o grupo de botões dele) para o ponto mais baixo da região que ainda cabe na primeira dobra | `to`: `end` \| `start` \| `region-top`; `justify`: `flex-end` \| `flex-start` \| `center` \| `space-between`; `fold` (900) |
| `style` | CSS inline, só propriedades de layout e tipografia da lista fechada (`max-width`, `width`, `margin*`, `padding*`, `gap`, `font-size`, `font-weight`, `line-height`, `text-align`, `justify-content`, `align-items`, `flex-*`, `order`, `display`…; nunca cor). Valor `theme:h1`…`theme:h6` usa a escala de títulos do kit; `theme:self`, o nível do próprio título | `css`: `{ "max-width": "60ch" }` |
| `align` | alinha a borda esquerda dos itens localizados (o campo inteiro, com rótulo): empilhados, à do primeiro; em linhas, às colunas da primeira linha, mantendo a borda direita | `mode`: `auto` \| `left` \| `columns` |
| `replace-text-many` | troca vários trechos de uma vez no elemento (ou na tela) e arruma a pontuação que sobra | `pairs`: `[{ "from", "to" }]` (`to` vazio tira o trecho); `scope`: `element` \| `screen` |
| `insert` | insere uma cópia de um elemento real antes/depois/dentro do alvo, com texto | `like`: `chip` \| `helper` \| `caption` \| `search-field` \| `panel` \| `alert-info` \| `alert-warning` \| `alert-success`, ou `from` (captura) + `source` (seletor); `position`: `before` \| `after` \| `prepend` \| `append`; `text`; `placeholder` |
| `wrap` | põe o alvo dentro de uma cópia do painel/cartão da captura, com título | `title` |
| `annotate` | balão ligado ao elemento: "Leitor de tela: «…»" (nome acessível), a dica com as classes de tooltip do kit, ou nota | `kind`: `screen-reader` \| `tooltip` \| `hint`; `text` |
| `badge` | a imagem de hoje com um selo no canto do recorte; não é falha | `text` (padrão "Sem mudança") |
| `synthesize-state` | monta na tela um estado que nenhuma captura mostra (ver abaixo) | `state`; `title`, `text`, `action` trocam os textos padrão |
| `synthesize-region` | insere a região de arquétipo que falta como contêiner (cópia do painel da captura) com título; `search-bar` vira cópia do campo de busca | `region`, `title` |
| `example` | não muda nada: mostra como referência a captura de outra tela ou estado que já faz certo | `screen`: `02-acervo.error` |
| `none` | sem prévia; a página diz por quê | `reason` |

Qualquer operação aceita `selector` para mirar outro elemento da captura e `targets` (`all`, `all-but-last`, `all-but-first` ou o índice) quando o localizador acha vários. Exemplo: `{ "text": "Ver histórico, com selo \"1\"", "preview": [{ "op": "text", "text": "Ver histórico" }, { "op": "insert", "like": "chip", "position": "after", "text": "1" }] }`.

**Estado montado na tela** (`synthesize-state`, padrão do S1). A receita (`STATE_RECIPES` em `lib/preview-spec.mjs`) diz onde e com o quê: `replace` troca o conteúdo abaixo do cabeçalho (título e abas ficam) pelo bloco de estado — sem acesso, link inválido ou expirado, indisponível, já respondido; `replace-data` troca só a tabela ou lista (os filtros ficam) — carregando, vazio, vazio por filtro, sem dados no período, erro de carga; `banner` insere o alerta da cor certa no topo do conteúdo (em diálogo, acima do rodapé de ações) — erro e sem acesso em diálogo, processando, parcial, desatualizado, conflito, salvo, não salvo, somente leitura, rascunho recuperado; `field-error` marca o campo obrigatório com as classes de erro do kit (`Mui-error`) e a cor de erro do tema lida do CSS da captura, com o texto de erro abaixo. Sem alerta vermelho em nenhuma captura, o erro em diálogo copia um alerta da captura e o pinta com a cor de erro do tema (texto escuro, fundo claro, borda e ícone na cor). Textos padrão pela política de feedback do UX.md: sem acesso diz quem concede, erro diz o que fazer; texto da opção vence o padrão. A legenda é "Proposta montada com componentes da própria tela".

**Prévia padrão** (opção sem `preview`):
- **Texto** (`text`): a opção com texto pronto vira `text` (inclusive frase com aspas internas, como “Criar aditivo”); `"A" → "B"` aplica B; `Rótulo: texto` aplica o texto; `(remover)` vira `remove`; "Manter…" vira `badge` "Sem mudança"; opção que lista textos de vários elementos (`A · B · C`) aplica o trecho com mais palavras em comum (radical de 5 letras) ou, sem palavra em comum, o que repete os números do texto de hoje, e por último o primeiro, com nota; instrução com o texto entre aspas depois do nome do elemento (`Título "…"`, `texto "…"` depois de `;`) troca só o texto principal e avisa; `X, com apoio "Y"` insere o apoio, `com selo "Y"` insere o chip, `com nome acessível "Y"` anota o leitor de tela; outras instruções de estrutura ficam sem prévia (declare `preview`). Nome acessível vira `annotate` de leitor de tela e dica vira `annotate` de dica, com o nome ou a dica de hoje no "antes".
- **Por regra**: **L1** → `move` (`to: end`, `justify: flex-end`); **L3** → `style` com `theme:self` nos títulos citados; **L4** → `align`; **L6** → `move` `region-top`; **L7** → `style` (`max-width: 60ch`, cerca de 72 caracteres: o `ch` é a largura do zero, maior que a letra média); **L8** → `style` `min-width`/`min-height` 24 px (44 se a mensagem pedir); **L9** → `synthesize-region`; **C1** → `text` com o rótulo citado primeiro, na tela do outro; **C2** → `variant` da maioria; **T1** → `variant` `outlined` nas primárias da região menos a última; **T3** → o texto mais destacado no topo (título editável incluso) na escala de h1 + anotação "Título, nível 1"; **T6** → `replace-text-many` trocando o termo por palavra comum (`SES` → "e-mail"; hash e `sha256` saem); **T7** e **X6** sem objeto → `text` `"<botão> {context}"`; **X2** → primeiro bloco no título e o segundo em apoio abaixo; **X6** longo → primeiro bloco; **X9** → sem o parêntese; **S1** → `synthesize-state`; **fluxo F1, F2, F5** → mini diagrama SVG antes/depois das transições da tela no mapa (sem navegador): saída nova, jornada declarada, caminho de volta.
- Operação de posição ou estilo que não muda nada na captura (`move`/`style`/`align` com o elemento já assim) mostra a imagem de hoje com o selo "Já está assim nesta tela".

**Legenda do tipo.** Abaixo de cada "depois" a página diz o tipo: "Texto trocado", "Elemento removido", "Peso do botão trocado", "Elemento movido", "Estilo ajustado", "Tamanho na escala do tema", "Proposta montada com componentes da própria tela", "Anotação: leitor de tela", "Anotação: dica", "Sem mudança", "Já está assim nesta tela", "Exemplo de outra tela", "Diagrama do fluxo" (vem de `kind_label` no manifesto).

**Caso sem opções** (famílias de tela, layout, estados, fluxo) mostra, ao lado de "Hoje", a **correção indicada pela regra** com a mesma prévia padrão. Não é opção de decisão: o formulário continua igual.

**Onde fica** (gerado, fora do git: ignore `.dsx/findings/*/previews/`):
```
.dsx/findings/<modulo>/previews/
├── previews.json          # manifesto: caso → before, after[] (opção, op aplicada, descrição, kind_label) ou failed com o motivo
├── kit.json               # doadores do módulo tirados das capturas (cache)
└── <hash>.before.webp …   # imagens; screen-<hash>.webp para a tela inteira; .svg para fluxo
```
Cache: o hash do caso junta a versão das prévias, o código que roda na captura (`lib/preview-runtime.mjs`), as capturas envolvidas, o localizador, as operações e, quando a operação usa o kit, o conjunto das capturas do módulo; caso com variante sem prévia é sempre refeito; caso com hash igual e arquivos presentes não é refeito, e arquivo que nenhum caso usa é apagado. A página marca como desatualizada a prévia cuja captura mudou depois de gerada.

**Página paginada.** A página sai em várias, cada uma autocontida (imagens embutidas em base64): `<saída>.html` (índice e página 1), `<saída>-2.html`… com no máximo ~10 MB e 60 casos por arquivo (o que vier antes), na ordem dos grupos (um grupo grande atravessa páginas). Navegação no topo e no rodapé. As escolhas ficam no `localStorage` do navegador (chave por módulo e versão do registro; a página funciona sem ele) e "Copiar decisões" de qualquer página copia as de todas; o topo mostra "N decididos de M". `--preview-files` referencia as imagens de `previews/` em vez de embutir (a ferramenta avisa se páginas + imagens passam de 255 arquivos).

## Entradas: saída `--json` dos verificadores

| Verificador | Forma | Campos que o registro lê |
|---|---|---|
| `text.mjs --screens … --code … --json` | `{ summary, ranking, findings: [grupo], screens: [por tela] }` | por grupo: `rule`, `severity`, `text`, `variants`, `types`, `screens`, `message`, `source.occurrences[{file, line}]`; `probable_data: true` quando a peça veio do dado (severidade 0) |
| `screen.mjs --json` | `{ summary, screens: [{ file, dialog_open, findings: [{ rule, severity, region, message, evidence }] }] }` | todos |
| `flow.mjs --json` | `{ file, findings: [{ rule, severity, screen, message, evidence: [] }], summary }` (ou lista, com vários mapas) | todos |

`types` (tipo do elemento no verificador de texto): `title`, `button`, `tab`, `label`, `placeholder`, `helper`, `alert`, `accessible-name`, `tooltip`, `empty-value`.

**Transição de nomes (2026-10).** Até a versão 0.4 os verificadores se chamavam `texto.mjs`, `tela.mjs` e `fluxo.mjs`, emitiam chaves em português (`achados`, `regra`, `severidade`, `telas`, `origem.ocorrencias[{arquivo, linha}]`…) e as opções vinham em `casos.json` (`casos`, `elemento`, `opcoes[{texto, convencao, nota}]`, `recomendada{indice, porque}`). O registro ainda **lê** esses JSON antigos e também as chaves camelCase de uma versão intermediária (`probableData`, `byRule`, `dialogOpen`…), e avisa "nome antigo, renomeie para X" no caso de `casos.json`; as ferramentas só escrevem os nomes novos. Flags antigas (`--telas`, `--codigo`, `--ignorar`, `--falhar-em`, `--produto`, `--cor`, `--titulo`, `--arquetipos`) continuam funcionando como apelido: a ferramenta troca pelo nome novo e avisa "nome antigo, use --X" (tabela única em `tools/lib/legacy-cli.mjs`). Tabela completa: `docs/renames-2026-10.md`.

**Convenção de chaves.** Todo JSON (saídas `--json`, `findings.json`, `options.json`, `decisions.json`, `cases.json`, mapas) usa **snake_case** (`by_rule`, `probable_data`, `first_seen`); front matter YAML (o `UX.md`) usa **kebab-case** (`primary-position`). Ids usados como valor ou como chave de um mapa de ids (`accessible-name`, `X10`) continuam como são.

`decisions.json`
```json
{ "items": { "t-7f3a9c2e": { "choice": 0, "by": "dono", "at": "2026-10-03", "reason": null } } }
```
`choice`: índice da opção, `"ignore"` (exige `reason`) ou `"free"` com `text`.

## Ciclo de vida (status calculado, nunca escrito à mão)

| Status | Quando |
|---|---|
| `open` (aberto) | presente na última execução, sem decisão |
| `decided` (decidido) | presente, com decisão de opção ou texto livre (falta aplicar) |
| `ignored` (ignorado) | decisão `ignore` com motivo (não conta na trava) |
| `accepted-deviation` (desvio aceito) | presente, e coberto por um desvio vigente do bloco `deviations` do `UX.md` (regra em `rules`, todas as telas em `screens`, `until` não vencido). Não conta como aberto nem na trava; aparece na página com o motivo |
| `fixed` (corrigido) | não apareceu na última execução da sua família, depois de ter aparecido |
| `regression` (regressão) | voltou a aparecer depois de `fixed` |

Precedência: `ignored` (decisão do dono) → `fixed` → `accepted-deviation` → `regression` → `decided` → `open`. O desvio é recalculado a cada registro: se ele sai do `UX.md`, vence ou deixa de listar a regra ou a tela, o achado volta a `open` (ou `regression`). A diferença para `ignored`: o desvio é uma decisão de produto escrita no `UX.md`, que vale para todo achado da mesma regra naquelas telas, inclusive os que ainda não apareceram; `ignore` é a decisão sobre um id só.

Itens de revisão manual (`origin: "review"`) não são vistos pelos verificadores: uma execução nunca os marca como ausentes, então ficam `open`, `decided` ou `ignored` até alguém revisar de novo.

## Trava contra piora (`findings.mjs check`)

Roda os mesmos verificadores (ou lê o JSON de uma execução) e compara com o registro:
- **achado novo** (id que não existe no registro) de severidade ≥ `--min` (padrão 2) → reprova;
- **regressão** → reprova;
- achados já registrados e abertos → toleram (a dívida é conhecida), mas aparecem no resumo;
- achados cobertos por desvio declarado no `UX.md` (lido de `--ux` ou de `<root>/UX.md`) → passam, mesmo novos, e aparecem na contagem "coberto(s) por desvio declarado".

Assim o produto só melhora: nada novo entra pior, e o que foi corrigido não volta.

## Fluxo de trabalho

1. **Detectar**: rodar `text.mjs`/`screen.mjs`/`flow.mjs` com `--json`.
2. **Registrar**: `node tools/ux-lint/findings.mjs register --module <m> --text t.json --screen s.json --flow f.json --root <repo> [--ux UX.md]` (o `UX.md` dá os desvios aceitos).
3. **Propor**: a skill escreve as opções (`findings.mjs options --module <m> --from cases.json`); caso que não casa com nenhum achado entra como item de revisão manual.
4. **Prever**: `preview.mjs` (ou `audit.mjs --preview`) recorta antes e depois de cada caso das capturas.
5. **Decidir**: o dono escolhe na página (`findings.mjs page`, que gera o formulário e um JSON de decisões para colar) ou no chat; `findings.mjs import` / `decide` grava em `decisions.json`.
6. **Aplicar**: corrigir na origem (`arquivo:linha`), uma decisão por vez ou em lote.
7. **Confirmar**: detectar e registrar de novo — o que sumiu vira `fixed`; o que voltou, `regression`.
8. **Travar**: `findings.mjs check` no pre-commit ou no CI.

## Checklist

- [ ] Todo resultado de verificador de UX entra em `.dsx/findings/<modulo>/` (não fica em pasta temporária nem só na conversa).
- [ ] Decisões do dono gravadas em `decisions.json`, com quem e quando; `ignore` sempre com motivo.
- [ ] Desvio de produto (vale para uma regra em várias telas) declarado no bloco `deviations` do `UX.md`, não como vários `ignore`.
- [ ] Depois de corrigir, registrar de novo e conferir o status `fixed`.
- [ ] `findings.mjs check` ligado no pre-commit ou CI do projeto.
