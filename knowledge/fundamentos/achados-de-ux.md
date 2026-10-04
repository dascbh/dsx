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

**Recorte.** O diálogo inteiro quando o elemento está num diálogo; senão o cartão, seção ou grupo ao redor, com até ~720 px de largura (mais só quando o próprio elemento é mais largo), escala 1, sempre com o elemento inteiro dentro. O "depois" usa a mesma janela do "antes" (a união dos recortes de todas as opções), então dá para comparar sem mexer o olho. Antes: elemento contornado em vermelho; depois: o elemento alterado contornado em verde (remoção: linha tracejada onde ele estava). Imagens em WebP (JPEG se o navegador não codificar WebP), qualidade ~70. Achado da tela inteira (estado ausente, título ausente, região ausente) mostra a tela em meia escala.

**Operações** (campo `preview` da opção: um objeto ou uma lista aplicada em ordem):

| `op` | Efeito no DOM da captura | Campos |
|---|---|---|
| `text` | troca o texto do elemento (no campo, o placeholder) | `text` |
| `remove` | esconde o elemento | — |
| `variant` | copia as classes de um botão da mesma captura com a variante pedida | `variant`: `contained` \| `outlined` \| `text` |
| `move` | leva o elemento para o fim ou o começo do grupo de ações e/ou alinha o contêiner | `to`: `end` \| `start`; `justify`: `flex-end` \| `flex-start` \| `center` \| `space-between` |
| `style` | CSS inline, só propriedades de layout e tipografia da lista fechada (`max-width`, `width`, `margin*`, `padding*`, `gap`, `font-size`, `font-weight`, `line-height`, `text-align`, `justify-content`, `align-items`, `flex-*`, `order`, `display`…; nunca cor) | `css`: `{ "max-width": "72ch" }` |
| `example` | não muda nada: mostra como referência a captura de outra tela ou estado que já faz certo | `screen`: `02-acervo.error` |
| `none` | sem prévia; a página diz por quê | `reason` |

Qualquer operação aceita `selector` para mirar outro elemento da captura. Exemplo: `{ "text": "Avançar", "preview": [{ "op": "move", "to": "end", "justify": "flex-end" }] }`.

**Prévia padrão** (opção sem `preview`):
- **Texto** (`text`): a opção com texto pronto vira `text`; `(remover)` vira `remove`; "Manter…" fica sem prévia (igual a hoje); opção que lista textos de vários elementos (`A · B · C`) aplica o trecho com mais palavras em comum com o elemento; instrução com o texto entre aspas depois do nome do elemento (`Título "…"`, `Rodapé "…"`) troca só o texto principal e avisa; outras instruções de estrutura ficam sem prévia. Nome acessível e dica (tooltip) não aparecem em pixels: sem prévia, com o motivo.
- **Layout L1** → `move` (`to: end`, `justify: flex-end`); **L7** → `style` (`max-width: 72ch`); **C2** → `variant` da maioria; **S1** → `example` com a captura do mesmo estado em outra tela (do mesmo tipo, diálogo ou página, quando houver); **fluxo F1, F2, F5** → mini diagrama SVG antes/depois das transições da tela no mapa (sem navegador): saída nova, jornada declarada, caminho de volta.
- Operação que não muda nada na captura (`move`/`style` com o elemento já assim) não gera imagem igual: a página diz que nesta captura nada muda.

**Caso sem opções** (famílias de tela, layout, estados, fluxo) mostra, ao lado de "Hoje", a **correção indicada pela regra** com a mesma prévia padrão. Não é opção de decisão: o formulário continua igual.

**Onde fica** (gerado, fora do git: ignore `.dsx/findings/*/previews/`):
```
.dsx/findings/<modulo>/previews/
├── previews.json          # manifesto: caso → before, after[] (opção, op aplicada, descrição) ou failed com o motivo
└── <hash>.before.webp …   # imagens; screen-<hash>.webp para a tela inteira; .svg para fluxo
```
Cache: o hash do caso junta a versão das prévias, as capturas envolvidas, o localizador e as operações; caso com hash igual e arquivos presentes não é refeito, e arquivo que nenhum caso usa é apagado. A página marca como desatualizada a prévia cuja captura mudou depois de gerada.

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
