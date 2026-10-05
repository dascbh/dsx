---
name: ux-md
description: "Cria, atualiza ou avalia o UX.md do projeto (como a interface se organiza e se comporta; rubrica de 100 pontos, gates e drift): extrai do código classificando cada tela num arquétipo, define para projeto novo ou audita com linter, nota, drift, ux-lint e revisão. Use quando faltar UX.md, telas do mesmo tipo divergirem, o drift acusar UX.md desatualizado ou pedirem para avaliá-lo."
---

# UX.md: criar, atualizar, avaliar

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `templates/`, `tools/`, `examples/`, `archetypes/` são relativos a ela; caminhos sem prefixo (`UX.md`, `.dsx/`, `src/`) são do projeto do usuário.

Contrato (schema, 13 seções, versão e frescor, desvios, nota e gates, drift U1–U6, regras T/F/S/C/L): `knowledge/fundamentos/ux-md.md`. Rubrica: `evals/rubrics/ux-md.yaml`. Modelo: `templates/UX.md`. Exemplo aprovado: `examples/UX.md`. Catálogo de tipos de tela: `archetypes/` (um cartão por id).

**Princípio:** o `DESIGN.md` diz como a tela **parece**; o `UX.md` diz **que tipo de tela é, onde fica cada coisa e como ela se comporta**. O valor está no que ele impede o agente de adivinhar: posição da primária, quando confirmar, o que mostrar no vazio, como se volta.

## UX.md and the UX blueprint

`UX.md` is the **product** contract: conventions every screen follows. The **objective** contract is the UX blueprint (`templates/ux-blueprint.md`), written into the front demand's Forward design family (`specs/<demand-id>/design/intended-model.md`, `flow.md`, `ia.md`). Keep them apart: UX.md never lists one objective's scenarios, and a blueprint cites UX.md policies by key instead of restating them. When a blueprint needs something UX.md forbids, record a deviation in UX.md (`deviations` + D… table) or revise UX.md in the same cycle; never let the two disagree silently. `tools/ux-lint/blueprint.mjs check` verifies the blueprint against the captures and the flow map; `ux-md-drift.mjs` keeps verifying UX.md against the product.

## Escolha o modo

- Não existe `UX.md` e há produto/código → **Modo A: extrair**
- Não existe `UX.md` e o projeto é novo → **Modo B: definir**
- Existe `UX.md` → **Modo C: avaliar** (e depois corrigir as lacunas)

## Modo A — Extrair do código

1. **Mapas primeiro.** Se `.dsx/maps/` não existir ou estiver velho, rode a skill `mapear`. Leia `ui-map` (telas, diálogos, componentes), `flows` (grafo de navegação), `tasks` (passos e confirmações), `journey` (persona e momentos) e `domain` (vocabulário das entidades). Item em `uncertain` não é fato: confirme com `confirmar-mapas` ou marque "(inferido)".
2. **Mapa de fluxo com evidência.** Para cada módulo, garanta um `.dsx/maps/flows-<module>.json` com `screens`, `transitions` (`trigger` + `evidence` `arquivo:linha`) e `journeys` (formato em `knowledge/fundamentos/ux-md.md`). Sem evidência no código, a transição não entra.
3. **Capturas pelo código.** Se o projeto tem uma skill de captura pelo código (`capture-from-code` do DSX, ou a do projeto), capture as telas principais e seus estados em HTML. São a entrada do ux-lint de tela e a referência de "como está hoje". Nunca reconstrua uma tela existente por texto.
4. **Classifique cada tela num arquétipo.** Para cada rota/diálogo do mapa, leia os cartões de `archetypes/` e escolha o de `quando-usar` que casa com a **tarefa** da tela (não com a aparência). SE nenhum casa → ENTÃO registre o desvio na seção 5 com o motivo. SE a tela faz duas tarefas de tipos diferentes → ENTÃO registre como desvio e proponha a separação.
5. **Derive as políticas do que o código já faz.** Conte, não suponha: onde está a primária nas telas do mesmo tipo, quantas primárias por região, ordem dos botões em diálogo, se ação irreversível pede confirmação, como o sucesso aparece (toast, inline), quais estados cada tela trata, como os formulários validam. A maioria vira a política no front matter; anote a evidência (arquivo ou tela) na prosa.
6. **Inconsistências viram "Não faça".** Toda divergência entre telas do mesmo arquétipo (ex.: primária no rodapé numa lista e no topo na outra; diálogo sobre diálogo; "Confirmar" em ação destrutiva) entra no bloco "Não faça" com a tela onde aparece. Problemas recorrentes resolvidos bem viram "Faça".
7. **Desvios estruturados.** Cada tela que difere do cartão de propósito entra na tabela "Desvios declarados" da seção 5 **e** no bloco `deviations` do front matter, com `screens` (ids do mapa), `rules` (as regras do ux-lint que o desvio explica: L9 para região ausente, T3 para `h1` de outra tela, F1 para beco intencional…), `reason` e `decided-by`. Dívida que deve ser corrigida não é desvio: vai em "Não faça".
8. **Seletores de verificação.** Preencha `verification.selectors` com as classes reais do kit (ex.: botão cheio do MUI, variante destrutiva do shadcn) olhando as capturas.
9. **Glossário.** Um glossário por vocabulário: se o produto tem módulos com termos próprios, use `content.glossary: { default: …, <módulo>: … }`.
10. **Pergunte ao usuário** só o que o código não responde: persona, o que é crítico errar, o que a experiência nunca faz, termos proibidos.
11. `version: 1.0.0`, `format: alpha`, `updated` de hoje. Valide (Modo C, passos 1 a 3).

## Modo B — Definir para projeto novo

1. Entreviste em uma rodada: persona e tarefa principal, frequência e contexto (desktop 8 h/dia? celular em trânsito?), o que custa caro errar, o que o produto nunca faz.
2. Escolha `product.register` com `knowledge/design-system/escolher-design-system.md`. O registro restringe os arquétipos: SE `operational` → ENTÃO lista operacional, master-detail, editor com painel e painel de acompanhamento são a base; SE `consumer` ou `brand` → ENTÃO prefira poucas telas por tarefa, assistente em etapas e página pública de decisão; SE `editorial` → ENTÃO documento com visor e biblioteca. Confirme no campo `register` de cada cartão.
3. Liste as telas a partir das tarefas (uma tarefa principal por tela) e atribua o arquétipo de cada uma no front matter.
4. Fixe as políticas em aberto (posição da primária, confirmação, feedback, validação) consultando os padrões correspondentes em `patterns/` (skill `padroes`). Escolha uma opção e escreva por quê.
5. Preencha `templates/UX.md` inteiro. Nenhuma seção pode ficar só com comentário. "Faça e não faça" vem de riscos concretos da tarefa enquanto não houver problema real; revise depois do primeiro teste.

## Regras de escrita (valem para A e B)

- Critério observável em vez de adjetivo: ~~"navegação intuitiva"~~ → "toda tela não raiz tem migalha e botão de voltar; profundidade máxima 3".
- Nomes de áreas e botões exatamente como aparecem na tela.
- Seção 5 é uma tabela: tela | arquétipo | variação | desvio. Toda tela do front matter aparece nela.
- Não repita os padrões: cite o id (`patterns/actions/action-placement.md`) e diga qual opção o produto fixou.
- Não invente telas que não existem nem políticas que o código contradiz sem registrar a contradição.
- **Versão:** a cada mudança suba `version` (arquétipo, política ou desvio → menor; só texto → patch; modelo de navegação ou `register` → maior) e `updated`, no mesmo commit da mudança de UI que a motivou.

## Modo C — Avaliar

**Passo 1 — Formato (automático):**
```bash
node <DSX>/tools/lint-ux-md.mjs UX.md          # --json para máquina
```
Qualquer ERRO reprova. Avisos de "sem cartão" indicam arquétipo sem referência no catálogo ainda.

**Passo 2 — Nota, gates e drift (automático):**
```bash
node <DSX>/tools/lint-ux-md.mjs UX.md --score --map .dsx/maps/flows-<module>.json --screens <pasta-de-capturas>
node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <module> --root .
```
Nota de 100 pontos por critério (cobertura de telas, políticas com evidência, estados, fluxos, glossário, faça/não faça, seletores, frescor, desvios) e gates: `lint`, `essential-coverage`, `policy-fidelity`, `connected-to-agent` (código) e `no-conflict` (juiz). Qualquer gate ✘ reprova, independentemente da nota. Faixas como no `DESIGN.md`: 90–100 robusto · 75–89 utilizável com lacunas · 60–74 revisar · < 60 alto risco. Drift U1–U6 é correção do documento (arquétipo faltando, tela que sumiu, política que a maioria das telas não segue, estado sem captura, `updated` velho, desvio vencido).

**Passo 3 — Tela e fluxo (automático, gate objetivo):**
```bash
node <DSX>/tools/ux-lint/screen.mjs <pasta-de-capturas> --ux UX.md
node <DSX>/tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json --ux UX.md
```
Achados de severidade ≥ 3 são correção antes de entregar ou dívida registrada com dono. Registre em `.dsx/findings` e decida pelo registro: rode com `--json`, `node <DSX>/tools/ux-lint/findings.mjs register --module <m> --screen screen.json --flow flow.json --root <repo>`, e trate as decisões pelo registro (`findings.mjs page`/`decide`, contrato em `knowledge/fundamentos/achados-de-ux.md`). Dívida registrada = item `open` ou `ignored` com motivo; `findings.mjs check` no CI impede que piore.

**Passo 4 — Julgamento (skill `revisar-ux` e `juiz-de-evals` com `evals/rubrics/ux-md.yaml`, `judge-criteria`):** o que a máquina não mede.
- O arquétipo atribuído casa com a tarefa de cada tela? (Leia o `quando-usar` e o `evitar-quando` do cartão.)
- As políticas do front matter são o que o produto faz de fato, ou são aspiração? Contradição sem registro é reprovação.
- "Faça e não faça" vêm de problemas reais (tela, achado, chamado) ou são genéricos?
- Percurso cognitivo das jornadas principais sobre as capturas, usando a seção 11 como roteiro.
- Cada desvio de `deviations` é decisão de produto com motivo, ou dívida disfarçada?

**Passo 5 — Geração controlada** (teste de aceitação, como no `DESIGN.md`): peça uma tela nova de um arquétipo já usado só com o `UX.md`, o `DESIGN.md` e o código. Cada posição de ação, confirmação, estado ou rótulo que o agente teve de inventar é lacuna do `UX.md`.

**Saída do Modo C:**
```
Gates: lint ✔/✘ · cobertura ✔/✘ · fidelidade ✔/✘ · conexão ✔/✘ · conflitos ✔/✘
Nota: NN/100 (faixa) · version X.Y.Z · updated AAAA-MM-DD
Por critério: <critério> NN/peso — evidência
Drift: U… (o que mudar no UX.md)
Achados de tela/fluxo: id, regra, severidade, correção (ou desvio a declarar)
Lacunas reveladas na geração controlada: …
Diff proposto no UX.md (com a nova version): …
```

## Checklist

- [ ] Toda tela e diálogo do mapa está no front matter `archetypes` ou declarado como desvio na seção 5.
- [ ] Políticas com evidência (Modo A) ou com o padrão que as justifica (Modo B).
- [ ] Inconsistências encontradas viraram "Não faça" com a tela de origem.
- [ ] `lint-ux-md.mjs` sem erro; `ux-lint` de tela e fluxo rodados e registrados em `.dsx/findings/<modulo>/`; severidade ≥ 3 tratada.
- [ ] Desvios na tabela da seção 5 e no bloco `deviations` (mesmos ids); `rules` preenchido quando o desvio explica um achado.
- [ ] `version` (semver) e `updated` atualizados no mesmo commit da mudança de UI.
- [ ] `lint-ux-md.mjs --score` com gates de código ✔ e `ux-md-drift.mjs` sem achado (ou cada achado virou correção no arquivo).
- [ ] Bloco de contexto no `CLAUDE.md`/`AGENTS.md` do projeto (skill `iniciar`, passo 6): "antes de criar ou alterar UI, leia `DESIGN.md` (como parece) e `UX.md` (que tipo de tela, onde fica cada coisa, como se comporta)".
