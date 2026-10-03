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
└── decisions.json  # escrito pelo dono (página ou chat → `findings.mjs decide/import`)
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
    "id": "t-7f3a9c2e",              // prefixo da família (t | s | f) + 8 hex do hash estável
    "family": "text",                // text (X) | screen (T) | flow (F)
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
  }]
}
```
Itens da família `screen` levam também `region`. `source` é relativo à raiz do projeto; na família `screen` aponta a captura (`.html:linha`), nas outras o código.

**Id estável** = hash de `family | rule | âncora`, onde a âncora é, nesta ordem: a primeira origem no código sem o número da linha (o arquivo) + o texto normalizado (minúsculas, espaços únicos, dados variáveis trocados por `{}` — números, datas, horas, valores e, quando há `variants`, o trecho que muda entre elas); sem origem no código, a tela + região + texto. Mudar a linha do arquivo não muda o id; mudar o texto ou o arquivo muda. Dois ajustes declarados: na família `flow` a âncora é sempre a tela (ou jornada) do mapa, porque a evidência dela lista transições de entrada que mudam sem o achado mudar; e na família `text` sem origem no código a âncora não leva tela, porque um achado de texto agrupa várias telas. Quando o conjunto de variantes muda e com ele o texto-modelo, o item herda o id registrado de mesma família, regra e arquivo que tenha uma variante em comum.

`options.json`
```json
{ "items": { "t-7f3a9c2e": { "problem": "…", "options": [{ "text": "…", "convention": "Polaris: verbo + objeto", "note": "…" }], "recommended": { "index": 0, "why": "…" }, "case": "c16" } } }
```
`case` (opcional) agrupa ids cobertos pelo mesmo caso: a página mostra um cartão só e a decisão vale para todos.

`cases.json` (entrada de `findings.mjs options --from` e de `text-page.mjs`, escrito pela skill)
```json
{ "cases": [{ "id": "c16", "element": "button", "rule": "X2", "severity": 2, "text": "Remover da lista — Ana", "variants": [],
  "source": ["src/Dlg.tsx:80"], "screens": ["07-dlg"], "problem": "…",
  "options": [{ "text": "…", "convention": "Polaris: verbo + objeto", "note": "…" }], "recommended": { "index": 0, "why": "…" } }] }
```

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
| `fixed` (corrigido) | não apareceu na última execução da sua família, depois de ter aparecido |
| `regression` (regressão) | voltou a aparecer depois de `fixed` |

Itens de revisão manual (`origin: "review"`) não são vistos pelos verificadores: uma execução nunca os marca como ausentes, então ficam `open`, `decided` ou `ignored` até alguém revisar de novo.

## Trava contra piora (`findings.mjs check`)

Roda os mesmos verificadores (ou lê o JSON de uma execução) e compara com o registro:
- **achado novo** (id que não existe no registro) de severidade ≥ `--min` (padrão 2) → reprova;
- **regressão** → reprova;
- achados já registrados e abertos → toleram (a dívida é conhecida), mas aparecem no resumo.

Assim o produto só melhora: nada novo entra pior, e o que foi corrigido não volta.

## Fluxo de trabalho

1. **Detectar**: rodar `text.mjs`/`screen.mjs`/`flow.mjs` com `--json`.
2. **Registrar**: `node tools/ux-lint/findings.mjs register --module <m> --text t.json --screen s.json --flow f.json --root <repo>`.
3. **Propor**: a skill escreve as opções (`findings.mjs options --module <m> --from cases.json`); caso que não casa com nenhum achado entra como item de revisão manual.
4. **Decidir**: o dono escolhe na página (`findings.mjs page`, que gera o formulário e um JSON de decisões para colar) ou no chat; `findings.mjs import` / `decide` grava em `decisions.json`.
5. **Aplicar**: corrigir na origem (`arquivo:linha`), uma decisão por vez ou em lote.
6. **Confirmar**: detectar e registrar de novo — o que sumiu vira `fixed`; o que voltou, `regression`.
7. **Travar**: `findings.mjs check` no pre-commit ou no CI.

## Checklist

- [ ] Todo resultado de verificador de UX entra em `.dsx/findings/<modulo>/` (não fica em pasta temporária nem só na conversa).
- [ ] Decisões do dono gravadas em `decisions.json`, com quem e quando; `ignore` sempre com motivo.
- [ ] Depois de corrigir, registrar de novo e conferir o status `fixed`.
- [ ] `findings.mjs check` ligado no pre-commit ou CI do projeto.
