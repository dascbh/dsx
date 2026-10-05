---
name: repensar-ux
description: "Repensa uma tela ou um fluxo inteiro como designer sênior: entende a tarefa e a dor com evidência, diverge em 3 variações realmente diferentes (estrutura da tela, divisão do fluxo, comportamento e texto), constrói cada uma com os componentes reais do projeto pelo harness de captura, mede, roda os detectores do ux-lint, compara numa página e leva a escolhida a produção. Use quando pedirem para \"repensar uma tela ou fluxo\", \"outras versões\", \"variações\", \"como poderia ser\", ou quando os achados de um fluxo pedem outra solução e não remendo."
argument-hint: "<módulo> <fluxo ou tela>"
---

# Repensar UX

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `archetypes/`, `tools/`, `data/` são relativos a ela; caminhos sem prefixo (`UX.md`, `.dsx/`, `src/`) são do projeto; as pastas de captura e de código vêm de `docs/project-paths.md`.

Referências: `knowledge/fundamentos/variacoes-de-ux.md` (eixos, como gerar alternativas genuínas, hipótese e trade-off, armadilhas), `knowledge/fundamentos/achados-de-ux.md` (registro), `knowledge/fundamentos/psicologia-e-leis.md`, `archetypes/`, `patterns/index.json`, `data/ux-dimensions.json` (`laws_index`).

**Diferença para as vizinhas.** `auditar-ux` acha e corrige elemento por elemento (prévias por achado). `arranjar-tela` reorganiza as regiões de **uma** tela dentro do mesmo arquétipo. Esta skill muda a solução: outra estrutura de tela, outra sequência de passos, outro comportamento e outro texto, para o fluxo inteiro. Quando o problema cabe numa troca de rótulo ou posição, volte para `auditar-ux`; repensar custa caro.

## Quando repensar em vez de remendar

- **SE** vários achados do mesmo fluxo têm a mesma causa (passos demais, decisão no lugar errado, texto explicando o que a estrutura devia mostrar) **ENTÃO** repense: remendar cada um mantém a causa.
- **SE** o arquétipo da tela não casa mais com a tarefa (o `evitar-quando` do cartão descreve o uso real) **ENTÃO** repense.
- **SE** o dono pede "outra cara", "outra forma", "variações" **ENTÃO** repense, com a evidência do passo 1 antes de desenhar.
- **SENÃO** (achado isolado, correção óbvia) **ENTÃO** `auditar-ux` ou `construir-ui`.

## 1. Entender a tarefa e a dor (evidência antes de ideia)

Escreva, com fonte para cada linha:

1. **Persona e frequência** — do `UX.md` (tabela de personas) e do mapa de jornada. Diária ou rara muda tudo (assistente para tarefa rara, página única para tarefa diária).
2. **Tarefa**, com início e fim — da jornada do mapa (`.dsx/maps/flows-<m>.json`, `journeys[].steps`); anote o `journey_ref`.
3. **Como é hoje**, medido: passos, cliques até concluir no caminho feliz (conte as transições da jornada), diálogos, ações primárias, palavras por tela, decisões. É a linha "Hoje" do manifesto.
4. **A dor**, pelos achados abertos do registro (`.dsx/findings/<m>/findings.json`) que tocam as telas do fluxo: liste ids, regras e severidade. Agrupe por causa. Os ids entram em `resolves` das variantes.
5. **Restrições** que nenhuma variante pode quebrar: regras de negócio do domínio, políticas do `UX.md` (posição da primária, confirmação, estados obrigatórios), acessibilidade.

Sem registro de achados nem capturas do fluxo, rode antes a `auditar-ux` (ou ao menos as capturas do fluxo e `audit.mjs --register`): sem evidência a variação é palpite.

## 2. Divergir: três variações realmente diferentes

Três, nem mais nem menos. Cada uma tem **uma ideia central** numa frase (`concept`) e muda os quatro eixos — **tela, fluxo, comportamento e texto** — de forma coerente com essa ideia (eixos e técnicas em `knowledge/fundamentos/variacoes-de-ux.md`). Ancore cada variante no catálogo: `archetype` (id de `archetypes/`), `patterns` (ids de `patterns/`, com ou sem a categoria: `undo` ou `actions/undo`) e, quando a ideia vem de uma lei, `laws` (ids de `laws_index` em `data/ux-dimensions.json`: `hick`, `cognitive-load`, `fitts`…).

Gere as três a partir de **ideias centrais opostas**, não de ajustes de uma mesma ideia. Um bom trio costuma ter: uma que **corta** (menos passos, menos tela), uma que **reorganiza** (outra ordem, outro ponto de partida, outro modelo de interação) e uma que **muda o comportamento** (desfazer em vez de confirmar, validação na hora, trabalho em segundo plano). Cada uma escreve `hypothesis` (o que melhora e para quem) e `tradeoffs` (o que piora; nunca vazio).

**Variação falsa não conta** (o `validate` reprova as detectáveis):
- só trocar cor, ícone, ordem de botões ou espaçamento;
- mudar um eixo só (o `validate` exige pelo menos dois eixos e avisa o que ficou parado);
- reaproveitar os frames de hoje ou de outra variante;
- duas variantes com a mesma ideia central em roupas diferentes;
- variante sem âncora no catálogo (arquétipo, padrão ou lei);
- variante que quebra uma restrição do passo 1 (essa é descartada, não comparada).

### Falsifiable hypotheses and lenses (manifest format 2)

Each variant is a bet that can be proven wrong (Forward "Hypotheses" stage, USE-10). In a `"format": 2` manifest every variant declares, in plain words:

| Field | What it says |
|---|---|
| `audience` | who the variant is for (persona and situation) |
| `causal_bet` | what change causes which improvement, and why |
| `counter_hypothesis` | the strongest reason the bet could be wrong |
| `falsification_test` | the observation that would prove it wrong (a session, a measure, a threshold) |
| `expected_metric` | the number that should move, from the manifest metrics or a cycle criterion id |
| `guardrail` | what must not get worse |
| `lens` | one of Forward's lenses: `subtract`, `invert`, `analogous`, `constraint-first`, `object-first` — distinct per variant (variants sharing a lens count as one) |

The manifest also records the convergence the designer recommends — `"choice": { "variant": "<id>", "why": "…" }` — and what each discarded variant traded — `"rejected_tradeoffs": { "<id>": "…" }`. The owner still decides on the page. `validate` requires all of this from format 2 and only warns on format 1 manifests. Export the Forward view for the demand: `variations.mjs alternatives --root <project> --module <m> --flow <f> --out specs/<demand-id>/design/alternatives.md` (the `Lens:`, `Hypothesis:`, `Traded:`, `Chose:` lines Forward's divergence gate reads). The page shows the hypothesis under "Como saber se funciona", without ids.

### Internal criticism (mandatory before the page goes to the owner)

Record in the manifest a `critique` block with six entries — `counter_case`, `unsupported_claims`, `failure_recovery`, `accessibility`, `domain_data`, `security_ops` — each `{ "status": "resolved" | "limitation" | "measurement", "note": "…" }`: resolved says what changed in the variants; limitation is said on the page as a risk; measurement becomes a falsification test or a cycle criterion with an unknown baseline. This self-check never replaces the isolated review (agent `revisor-ux`, Forward `fde-review`).

## 3. Construir com os componentes reais

Cada variante é **código de teste**, nunca produção: monte as telas com os componentes do projeto (os mesmos de `src/components/` e das páginas) e renderize pelo **harness de captura**, como as capturas de hoje (skill `capture-from-code`, com `environment.tsx` e `serialize.ts` de `templates/capture/`). Código em `<pasta de testes>/capture/variants/<flow>/<variant>/*.tsx` (vai em `code` no manifesto). Dados fictícios sempre, nunca nome de cliente real. Sem servidor, sem geração por texto, sem maquete.

- Componente que ainda não existe e a variante precisa: monte com os existentes; se não der, a variante diz isso no trade-off (custo de construir).
- Capture cada frame em `<root>/.dsx/variations/<m>/<flow>/<variant>/<nn>-<frame>.html`; estados com o sufixo da convenção (`<nn>-<frame>.<estado>.html`, ex.: `04-tudo.draft-restored.html`), que é como o lint reconhece o estado capturado.
- **Frames de comportamento** são pares antes/depois de uma ação: o frame `behavior` aponta `behavior.before` e `behavior.after` (ids de frames da mesma linha) e a `action` em palavras ("clica em Gerar 4 pedidos"). Exemplos: desfazer em vez de confirmar; validação na hora; progresso da geração; salvamento automático.

## 4. Medir e verificar

```bash
cd <projeto>/<pasta-com-playwright>   # pasta com o Playwright do projeto (recorte das telas e geometria)
node <DSX>/tools/ux-lint/variations.mjs validate --root <projeto> --module <m> --flow <f>
node <DSX>/tools/ux-lint/variations.mjs measure  --root <projeto> --module <m> --flow <f>
node <DSX>/tools/ux-lint/variations.mjs lint     --root <projeto> --module <m> --flow <f>
```

- `validate`: frames e capturas existem, `resolves` existe no registro, arquétipo/padrões/leis existem no DSX, as seis métricas presentes, regras contra variação falsa.
- `measure`: recalcula das capturas o que dá para medir e **mostra a divergência** com o declarado, sem sobrescrever.
- `lint`: roda texto (X), tela (T), estados (S) e, com o Playwright, layout (L) nos frames de cada variante; compara com os frames de hoje e cruza com `resolves`.

**Regras de aceite de uma variante** (o `lint` sai com 1 se alguma falhar):
- nenhum achado **novo** de severidade ≥ 3 (achado que hoje não existe);
- nenhum dos achados que ela diz resolver **persiste** (o detector ainda acusa, o texto citado continua na tela, o estado exigido continua sem frame);
- achados novos de severidade 2 aparecem na página e entram como trade-off, ou a variante é corrigida;
- `sem verificação` (fluxo, consistência, layout sem geometria, revisão sem texto) é conferido por julgamento e dito no relatório; não vira "resolvido" por omissão;
- `suspect` (a regra resolvida reaparece com outro texto) é conferido na captura antes de aceitar.

### Como contar cada métrica

| Métrica | Como contar | Medida pela ferramenta? |
|---|---|---|
| `steps` | telas distintas no caminho feliz, da entrada no fluxo ao fim (diálogo não conta como tela; conta em `dialogs`) | não, declarada (o `step` dos frames é rótulo da coluna, não contagem) |
| `clicks_to_done` | cliques e teclas de confirmação do caminho feliz, do início da tarefa ao fim (na linha Hoje, as transições da jornada no mapa; na variante, a sequência de frames). Digitação de valor não conta; escolher num seletor conta 1 | não, declarada |
| `dialogs` | passos cujo frame mostra diálogo aberto (seletor `dialog` do UX.md) | sim |
| `primary_actions` | maior número de ações primárias visíveis (seletor `primary` do UX.md) numa mesma tela do caminho (frames `screen`) | sim |
| `words_on_screen` | média, pelos frames `screen`, das palavras visíveis: com diálogo aberto, só o diálogo; senão o conteúdo sem `header` e `nav` (moldura do produto); fora `aria-hidden`, `aria-live` e `legend`; com o valor dos campos de texto | sim (tolerância de 10% na divergência) |
| `decisions` | escolhas que a pessoa precisa fazer no caminho feliz (modelo, destinatários, confirmar valores…); aceitar um padrão sem mexer não conta | não, declarada |

Escreva o método em `metrics_method` (texto livre, opcional, **em linguagem de negócio**: a página mostra a quem decide) quando o cenário pedir uma contagem específica; chaves, seletores e nomes de arquivo vão em `metrics_method_tech`, que só aparece em "Para quem constrói". A medida usa os frames `screen` como caminho feliz: se o manifesto conta outro conjunto, a divergência aparece e deve ser explicada. Todas as métricas são "menos é melhor" na página. Métrica que piora de propósito (mais palavras para explicar uma consequência, por exemplo) vai para o trade-off.

**Regras dos números** (a página aplica; o manifesto não pode contornar):
- **Conte o que dá para conferir.** Liste o que foi contado em `metrics_detail.<métrica>` (ex.: `clicks_to_done: ["Gerar em lote", "Adicionar requisições", …]`, um item por clique, a partir dos frames e das legendas); a página mostra a lista nos detalhes de cada versão e o `validate` avisa quando o tamanho da lista não bate com o número.
- **Mesmo resultado final ou não comparável.** O número só compara se a versão chega ao mesmo fim da tarefa (`done_label`, "o .zip com todas completas"). Se o caminho capturado termina diferente (um pedido fora do .zip, um item a menos), reconte incluindo o que falta para chegar lá; se o fluxo não permite, declare `metrics_detail.not_comparable.<métrica>: "motivo"`. A página marca "não comparável" com o motivo e tira a versão do líder e do selo.
- **Número principal só com o confirmado.** Em "problemas resolvidos", o número é o que a verificação confirma; os que precisam de conferência aparecem ao lado ("+ 6 a conferir") e nunca somam. O líder, o selo e a frase do topo usam o mesmo critério do número mostrado.
- **Medido vence declarado.** Palavras por tela mostram a medida das capturas; a declarada que diverge aparece como aviso no próprio número, não só no rodapé.

## 5. Comparar e decidir

```bash
node <DSX>/tools/ux-lint/variations.mjs page --root <projeto> --module <m> --flow <f> --out <saida.html> [--shots <pasta>] [--product …] [--findings-page <url da página de achados>]
```

Quem lê a página é a pessoa de produto ou o advogado, não quem construiu: ela precisa decidir em 2 minutos. **Regra: primeiro a resposta, depois o detalhe; sem ids nem jargão na frente.** Id de achado, nome de regra (X6, L1), id de arquétipo ou de padrão e termo de ferramenta ("sem verificação", "suspect") nunca aparecem fora do que está recolhido; lá dentro, só como âncora ou dica.

O que a página mostra, nesta ordem:

1. **A resposta** (primeira dobra a 1440 px): a pergunta numa frase (`question`, ou "Como <título> com menos trabalho?"), uma frase com quem lidera cada número e um cartão por versão (Hoje | A | B | C) com nome e ideia, a tela **no mesmo momento do fluxo nas quatro** (`hero`; sem ele, o frame da variante cujo `compare_to` é a tela principal de hoje), recortada na parte que importa (`compare_focus`) e com "Ampliar" visível, 4 números (telas, cliques até concluir ou até `done_label`, palavras por tela, problemas resolvidos) com a diferença para hoje escrita ("▼ 5 · melhor"; cor e seta nunca são o único sinal) e o selo "lidera" só no melhor de cada número (os demais em peso normal: no máximo três ênfases fortes na dobra), e uma linha de **o que ganha** (`gain`) e **o que custa** (`cost`). Sem `gain`/`cost`, a página usa a primeira frase da hipótese e o primeiro trade-off, cortados: escreva os dois curtos (uma linha cada), e confira que continuam verdadeiros depois de recontar os números.
2. **Uma versão por vez**, em abas (←/→ no teclado; no celular, seletor): passo a passo tipo apresentação, com a trilha em dois grupos: **Passos do fluxo** (frames `screen` sem diálogo aberto, numerados: "Passo 2 de 3", a mesma contagem de "Telas" no cartão) e **Estados e comportamentos** (estados, diálogos e pares antes/depois, sem número). Uma contagem só: a legenda não repete "Passo X de Y" (a página tira). A tela grande e legível, **recortada no conteúdo** (região `main` do UX.md; com diálogo aberto, a parte visível com o diálogo por cima), legenda de 1–2 linhas embaixo. Comportamento = "antes" e "depois" lado a lado a partir de 1200 px, com a ação entre eles e o que mudou contornado (diferença de pixels calculada na geração; mudança concentrada vira recorte em volta dela). **Comparar com hoje** põe ao lado a tela de hoje do passo equivalente (`compare_to`; senão o mesmo nome de passo; senão a posição na ordem), as duas recortadas no alto (ou em `compare_focus`), com "Ampliar as duas lado a lado" no tamanho real; o botão avisa que vale para todas as versões. Clique amplia em tela cheia, na largura natural, com rolagem e pinça no celular; a legenda do zoom diz "Versão 2 de 4" com o nome em destaque.
3. **Detalhes recolhidos**, em linguagem de negócio (texto uniforme, sem trocar de cor ou tamanho no meio da frase): o que muda (tela, fluxo, comportamento, texto), por que pode funcionar (hipótese), riscos (trade-offs), problemas que resolve com o texto do problema em português e um selo ("resolvido", "continua" ou "precisa conferir" dizendo o que conferir), novos pontos de atenção e a lista de cliques contados. O técnico (`changes_tech`, arquétipo, padrões, ids de achado, código) fica em **"Para quem constrói"**, recolhido; nenhum `title` com código.
4. **Decisão**: "Qual seguir?" na mesma ordem dos cartões (Hoje, A, B, C), comentário, "Quem decide" obrigatório (sem nome inventado), "Misturar partes" recolhido (por eixo; ligado, desabilita a escolha de versão inteira). A escolha anterior volta com o aviso "Retomamos sua escolha anterior" e "Limpar". **Sem terminal para o dono**: "Copiar decisão" e "Cole na conversa com quem conduz o projeto (ou envie por e-mail)"; a página diz que a escolha fica salva só naquele navegador; o arquivo da decisão e o comando `import` ficam em "Para quem constrói". Nada de "JSON" na tela.
5. "Como os números foram contados" recolhido no fim, em português (método, persona, tarefa, divergências medidas e números não comparáveis pelo nome da métrica, nunca pela chave); o técnico em "Para quem constrói".

Imagens: recorte do conteúdo a 1x (~1200 px de largura), WebP qualidade 0,75, embutidas; acima de ~10 MB a página se divide (Hoje em todas). As imagens e a diferença antes/depois ficam em cache em `--shots` (padrão `<flow>/shots/`, fora do git). A página sai como **documento completo** (doctype, `<html lang="pt-BR">`, charset, viewport); `--fragment` tira o esqueleto da página 1 para publicar como artefato.

**Aplique o DSX na própria página antes de entregar.** A página de comparação é uma tela como qualquer outra: copie o documento completo para `caps/01-comparacao.html` e rode `text.mjs --screens caps`, `screen.mjs caps`, `measure.mjs caps --out geo` (1440 e 390 de largura) + `layout.mjs geo` e `tools/stitch/analyze-html.mjs caps/01-comparacao.html`, até zerar severidade ≥ 2; depois peça uma revisão independente ao agente `revisor-ux` (só a página, as screenshots e o público). Confira com screenshots (1440 × 900 na primeira dobra, uma aba, "Comparar com hoje", um comportamento, a decisão, o zoom, tema escuro e celular com emulação real, `devices['iPhone 13']`) e itere até a primeira dobra responder sozinha "qual é melhor e por quê", os números baterem entre resumo, detalhes e método, e as telas serem legíveis.

O dono escolhe uma variante inteira ou **compõe por eixo** ("fluxo de B, texto de A"), com comentário, e copia a decisão. Grave:

```bash
node <DSX>/tools/ux-lint/variations.mjs import --root <projeto> decision.json
node <DSX>/tools/ux-lint/variations.mjs decide --root <projeto> --module <m> --flow <f> --variant b --comment "…"
node <DSX>/tools/ux-lint/variations.mjs decide --root <projeto> --module <m> --flow <f> --compose screen=b,flow=b,behavior=a,text=a
```

Grava `<root>/.dsx/variations/<m>/<flow>/decision.json`. Não construa antes da decisão. Composição por eixo pode gerar uma combinação incoerente (texto de A falando de um passo que B eliminou): descreva a combinação em uma frase e confirme com o dono antes de construir.

## 6. Levar a produção

Pela skill `construir-ui`, com a decisão como entrada: o código da variante é referência de composição (mesmos componentes), nunca colado da pasta de teste para a produção. No **mesmo commit**: a linha da tela e o arquétipo no `UX.md` (seção "Arquétipos de tela"), o desvio declarado quando a escolha fere uma política (bloco `deviations` + tabela D…), o mapa de fluxo se a navegação mudou, `version` e `updated`. Depois recapture o fluxo, rode `audit.mjs --register`: os ids de `resolves` da escolhida devem virar `fixed`, sem regressão.

## Manifesto (`<root>/.dsx/variations/<module>/<flow>/variations.json`)

```json
{
  "format": 1, "module": "purchasing", "flow": "batch", "title": "Gerar pedidos em lote",
  "persona": "…", "task": "…", "journey_ref": "j-lote-por-modelo",
  "current": { "id": "current", "name": "Hoje",
    "frames": [ { "id": "f1", "step": "Escolher modelo", "capture": ".dsx/captures/purchasing/17-batch-step-1.html", "kind": "screen", "caption": "…" } ],
    "metrics": { "steps": 4, "clicks_to_done": 9, "dialogs": 0, "primary_actions": 4, "words_on_screen": 180, "decisions": 4 } },
  "variants": [ {
    "id": "a", "name": "…", "concept": "uma frase com a ideia", "hero": "a1", "gain": "o que ganha, numa linha", "cost": "o que custa, numa linha",
    "changes": { "screen": "…", "flow": "…", "behavior": "…", "text": "…" },
    "archetype": "step-wizard", "patterns": ["form-steps", "undo"], "laws": ["hick"],
    "hypothesis": "o que melhora e para quem", "tradeoffs": ["o que piora / risco"],
    "resolves": ["l-336e4efa", "t-2f07996f"],
    "frames": [ { "id": "a2", "step": "Gerar", "capture": ".dsx/variations/purchasing/batch/a/03-generate.html", "kind": "behavior", "caption": "…",
                  "behavior": { "action": "clica em Gerar 4 pedidos", "before": "a1", "after": "a2" } } ],
    "metrics": { "steps": 2, "clicks_to_done": 4, "dialogs": 0, "primary_actions": 2, "words_on_screen": 90, "decisions": 3 },
    "code": ["web/tests/capture/variants/batch/a/*.tsx"]
  } ]
}
```

Chaves em `snake_case`; `kind`: `screen | state | behavior`; `laws`, `journey_ref` e `metrics_method` são opcionais; `state` (opcional no frame) vence o sufixo do nome da captura. Opcionais só da página: `question` e `done_label` (raiz), `metrics_method_tech` (raiz, técnico), `hero` (id de frame da linha), `gain` e `cost` (uma linha cada, também em `current`), `changes_tech` (na variante, por eixo, técnico: só em "Para quem constrói"; `changes` fica em linguagem de negócio), `metrics_detail` (na linha: `{ "clicks_to_done": ["…"], "not_comparable": { "clicks_to_done": "motivo" } }`), `compare_to` (no frame da variante, id de um frame de hoje) e `compare_focus` (no frame, `{ "x", "y", "w", "h" }` em frações da imagem: o recorte do cartão e da comparação). O `validate` confere `hero`, `compare_to`, `compare_focus` e `metrics_detail`. Arquivos gerados ao lado: `decision.json` (versionado) e `shots/` (cache, fora do git).

## Relatório (padrão)

```
Repensar · <módulo> · <fluxo> · <data>
Dor: <n> achados abertos (ids) · causa: …
Hoje: passos … · cliques … · diálogos … · primárias … · palavras/tela … · decisões …
Variantes: A <conceito> (arquétipo, padrões) · B … · C …
Lint: A resolve x/y, novos ≥2: n, bloqueio: não · B … · C …
Página: <caminho>
Decisão: <variante ou composição> · comentário
Produção: construir-ui · UX.md <versão> · re-auditoria: resolves → fixed <n>/<m>
Fica aberto: o que é sem verificação, hipótese a testar com usuários
```

Format 2 report lines (English): `Lenses: A <lens> · B <lens> · C <lens>` · `Choice: <id> — why; traded: B …, C …` · `Critique: 6/6 (resolved n · limitation n · measurement n)` · `alternatives.md: <path>`.

## Checklist

- [ ] Persona, tarefa, métricas de hoje e achados do fluxo levantados com fonte.
- [ ] Três variantes com ideia central oposta, quatro eixos, âncora no catálogo, hipótese e trade-off.
- [ ] Construídas com componentes reais pelo harness de captura, dados fictícios, código em pasta de teste.
- [ ] `validate` sem erro; `measure` sem divergência inexplicada; `lint` sem achado novo ≥ 3 e sem `persists`.
- [ ] Números conferíveis: cliques listados em `metrics_detail`, mesmo resultado final ou "não comparável" com motivo, problemas resolvidos só com o confirmado, palavras medidas.
- [ ] DSX aplicado na própria página (detectores sem severidade ≥ 2 e revisão do `revisor-ux`) e conferida por screenshot (a primeira dobra responde sozinha; telas legíveis; nada de id ou jargão na frente; decisão sem terminal para o dono); decisão gravada em `decision.json`.
- [ ] Escolhida construída pela `construir-ui`, com `UX.md` no mesmo commit e re-auditoria.
- [ ] O que é hipótese foi dito como hipótese (validar com pesquisa, skill `pesquisa`).
- [ ] Format 2: every variant with audience, causal bet, counter-hypothesis, falsification test, expected metric, guardrail and a distinct Forward lens; `choice` and `rejected_tradeoffs` recorded; `critique` complete; `alternatives.md` exported for the demand.
