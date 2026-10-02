---
name: stitch
description: Usa o Google Stitch como mesa de exploração do DSX, sem edição manual — sincroniza o design system do projeto (DESIGN.md) com o Stitch e confere o que ele preservou, gera telas e variantes a partir do problema, da persona e dos padrões do catálogo, critica cada tela com os gates e as lentes do DSX (papéis de cor, contraste, acessibilidade, heurísticas, texto), itera por instrução com edit_screens e traz a tela escolhida para o código com os tokens e componentes reais do projeto. Use quando quiser ver uma tela antes de codar, explorar alternativas, gerar variantes, revisar ou melhorar uma tela com agentes, ou quando alguém mencionar Stitch.
---

# Stitch no DSX: gerar, criticar, iterar, trazer

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`DESIGN.md`, `.stitch/`, `src/`) são do projeto do usuário.

**Papel do Stitch:** espaço de **exploração gerada**. O código continua sendo a fonte de verdade. Nada do Stitch entra no projeto sem passar pelos gates do DSX, e o HTML dele é referência de layout, **nunca código colado**.

**Pré-requisitos:** MCP `stitch` conectado e as skills oficiais do Google (`stitch-design`, `stitch-utilities`, `stitch-build`). Esta skill usa as oficiais para a mecânica e acrescenta o critério do DSX.

## Estado no projeto (`.stitch/`, mesma convenção das skills oficiais)

```
.stitch/
├── DESIGN.md          # export do DESIGN.md do projeto para o Stitch (gerado — não edite)
├── metadata.json      # projectId, título, telas, design system (formato da skill oficial manage-design-system)
├── conferencia.json   # última saída de `tools/stitch/design-system.mjs conferir --json`
├── designs/<slug>.html|png
└── revisoes/<slug>.md # crítica de cada rodada: achados, aceitos, recusados (com motivo)
```

Em `metadata.json`, acrescente ao formato oficial: `"designSystem": { "assetId", "conferido": "<data>", "status": "conforme|divergente" }`.

## Escolha o modo

| Pedido | Modo |
|---|---|
| Primeira vez no projeto, ou o DESIGN.md/tokens mudaram | **1. Sincronizar** |
| "Gera a tela de X", "como ficaria X" | **2. Gerar** (sincronize antes, se preciso) |
| "Me mostra opções", "outras versões" | **3. Variantes** |
| "Revisa/critica essa tela" (gerada ou já existente no Stitch) | **4. Criticar** |
| Aplicar as críticas aceitas | **5. Iterar** |
| "Implementa essa", "traz pro código" | **6. Trazer** |

O ciclo completo é **sincronizar → gerar → criticar → (você decide) → iterar → criticar → trazer**.

---

## 1. Sincronizar o design system

1. `node <DSX>/tools/lint-design-md.mjs DESIGN.md`. Se houver erro, conserte antes (skill `design-md`). O Stitch não vai consertar o seu sistema por você.
2. Exporte a versão para o Stitch:
   ```bash
   node <DSX>/tools/stitch/design-system.mjs exportar DESIGN.md -o .stitch/DESIGN.md
   ```
   Leia os AVISOS: raio quantizado e fontes que o Stitch não tem.
3. **Pare e confirme com o usuário** (checkpoint da skill oficial): nome, cor da marca, fontes, nível de raio e avisos.
4. Projeto: `list_projects`. Se não existir um projeto para este produto, use `create_project` e guarde o `projectId` em `.stitch/metadata.json`.
5. Importe **pelo DESIGN.md**: `upload_design_md` (base64 de `.stitch/DESIGN.md`) e, logo depois, `create_design_system_from_design_md` com o `{id, sourceScreen}` devolvido. Para arquivos grandes, use o script da skill oficial `upload-to-stitch`.
   - **Nunca use `update_design_system` para sincronizar.** Ele só aceita o modelo Material 3 (cor-semente) e apaga as cores nomeadas do DSX. Para mudar o sistema, reimporte o export.
6. Espere ~10s (o processamento é assíncrono), chame `list_design_systems`, salve a resposta em `.stitch/conferencia-bruta.json` e confira:
   ```bash
   node <DSX>/tools/stitch/design-system.mjs conferir DESIGN.md .stitch/conferencia-bruta.json --asset <assetId> --json > .stitch/conferencia.json
   ```
   - **DIVERGENTE** → corrija pela causa apontada e reimporte. Não gere telas sobre um sistema divergente.
   - **CONFORME com avisos** → normal. A marca fica em `primary-container` e `primary` recebe um tom derivado; os papéis Material 3 extras têm destino definido em `mapeamento`.
   - **Limite conhecido:** mesmo com o design system em `ROUND_EIGHT`, a config Tailwind de cada tela gerada pode declarar outro raio (observado: 4px). Por isso o raio da tela do Stitch **nunca** é referência: no código, valem os tokens `radius.*` do DSX.

## 2. Gerar uma tela

1. **Contexto antes do prompt.** Se a tela não tem problema declarado, use a skill `discovery` primeiro. Reúna:
   - persona e tarefa principal;
   - de onde a tela é alcançada e para onde leva (`.dsx/mapas/fluxos.json`, se existir);
   - entidades e dados (`.dsx/mapas/dominio.json`).
2. **Padrões que se aplicam:** consulte `patterns/index.json`, por exemplo `tabela-vs-cards`, `filtros-ativos`, `paginacao-de-tabela`, `estado-vazio`, `hierarquia-de-botoes`. Traduza cada regra em **comportamento descrito**, sem o id. Exemplo: "filtros ativos visíveis como chips removíveis, com 'Limpar filtros'".
3. **Monte o prompt** no template da skill oficial `stitch-design:generate-design`: propósito e intenção, plataforma e estrutura da página numerada.
   - **Sem cores, fontes, raios ou hex.** O design system do projeto cuida disso; repetir causa conflito. Vale a regra da skill oficial `generate-design`. A `enhance-prompt` injeta o design system no prompt, então **não** siga essa parte dela.
   - **Texto em pt-BR, no glossário do produto,** com botões no formato verbo + objeto (skill `ux-writing`).
   - **Dados fictícios realistas.** **Nunca** use dados reais de clientes ou pessoas: o prompt sai para um serviço externo.
   - **Uma ação primária por região,** dita explicitamente.
4. Chame `generate_screen_from_text` com o `projectId`, o prompt, `deviceType` e `designSystem: "assets/<assetId>"`.
   - A geração leva de 1 a 3 minutos.
   - **Não repita a chamada:** se der timeout, consulte `get_screen` a cada 30s, até 10 vezes.
5. Baixe para `.stitch/designs/<slug>`:
   - o HTML (`htmlCode.downloadUrl`);
   - o screenshot com `=w<width>` no fim da URL, porque sem isso vem uma miniatura.
6. Mostre ao usuário o texto e as sugestões que vêm em `outputComponents` (regra das skills oficiais).
7. **Estados:** o Stitch gera o estado ideal. Para vazio, erro e carregando, gere telas irmãs com `edit_screens` ou `generate_screen_from_text`, ou registre que esses estados serão construídos direto no código. Não esqueça deles.

## 3. Variantes

`generate_variants` sobre a tela-base, com `variantCount` de 2 a 3 e `creativeRange`:
- `REFINE`: polimento;
- `EXPLORE`: alternativas reais de layout;
- `REIMAGINE`: só quando o problema é a abordagem.

Use `aspects: ["LAYOUT"]` para comparar estruturas. Cada variante é uma **hipótese**: escreva qual tarefa ela favorece e qual piora. Critique todas pelo modo 4 antes de pedir a escolha. Propostas são hipóteses, não evidência; para decisões caras, sugira teste com pessoas (skill `pesquisa`).

## 4. Criticar (sempre antes de iterar ou trazer)

1. **Gates objetivos:**
   ```bash
   node <DSX>/tools/stitch/analisar-html.mjs .stitch/designs/<slug>.html --design-md DESIGN.md
   ```
   A ferramenta mede:
   - papéis de cor do DSX × papéis só do Stitch, com o destino de cada um;
   - contraste;
   - valores arbitrários;
   - triagem de acessibilidade: nome acessível, rótulos, teclado, h1, lang, `aria-sort`.

   **REPROVADO vira achado de severidade ≥ 3.**
2. **Olhe o screenshot.** Leia a imagem; não critique só pelo HTML.
3. **Lentes do DSX,** citando a fonte de cada achado:
   - `revisar-ux`: tese da tela, walkthrough da tarefa, heurísticas, severidade 0–4;
   - padrões do catálogo: cada decisão de interação;
   - `ux-writing`: termos, verbo + objeto, consistência. Contagens repetidas com palavras diferentes ("Exibindo" × "Mostrando") são comuns no Stitch;
   - `acessibilidade`: o que a triagem estática não pega.
4. **Revisão independente:** para telas importantes, dispare o subagente `revisor-ux` passando **só** o PNG, o HTML e o público. Não passe o prompt nem a sua crítica.
5. **Registre** em `.stitch/revisoes/<slug>.md` (formato de `templates/relatorio-heuristico.md`).
6. **Apresente ao usuário:** liste os achados por severidade e peça para ele escolher o que entra. Achados de token (cor, raio, fonte) **não** entram por tela; voltam para o modo 1.

## 5. Iterar

1. Transforme só os achados **aceitos** num prompt de `edit_screens`, numerado e específico em **local + mudança**. Em edição, hex é permitido só para cor exata, segundo a skill oficial.
2. Prefira 1 rodada com tudo o que foi aceito, ou uma por tema. Não refaça a tela do zero, a menos que o layout inteiro esteja errado.
3. Baixe a nova versão (ela ganha outro id; a original fica preservada) e **rode o modo 4 de novo**, inclusive a ferramenta de HTML.
   - A edição pode resolver só na aparência. Exemplo observado: uma linha "clicável" que ganhou só `cursor-pointer`, sem teclado. A ferramenta acusa isso.
4. Registre aceitos e recusados, com motivo, em `.stitch/revisoes/<slug>.md`.

## 6. Trazer para o código

**Para projetos existentes, a volta é pelo `construir-ui`, nunca pelo HTML do Stitch.**

1. Use o screenshot e o HTML como **referência de layout e conteúdo**.
2. **Mapeie cores pelo papel:**
   - papéis do DSX → os mesmos tokens semânticos;
   - papéis Material 3 → o destino em `mapeamento`, na saída do `conferir` ou do `analisar-html` (ex.: `primary-container` → `color.action.primary`).
3. **Use componentes do projeto.** O Stitch inventa a estrutura; você reusa o kit (`construir-ui`, seção 1).
4. **Corrija o que a crítica apontou e o Stitch não resolveu:** acesso por teclado, `href="#"` → rotas reais, `aria-sort` e estados vazio, erro e carregando.
5. **Gates de entrega:**
   - `lint-raw-values` com zero ocorrências;
   - contraste;
   - teclado;
   - 320px.

   Depois, revisão independente.

**Para protótipo novo, sem projeto ainda:** as skills oficiais `stitch-build:react-components` e `stitch-build:shadcn-ui` geram o app. Rode os gates do DSX no resultado e lembre que os tokens vêm da config do Stitch: troque-os pelos tokens DTCG do DSX (skill `tokens`) antes de o protótipo virar produto.

## Saída de cada rodada

```
Projeto: <título> (<projectId>) · design system: <assetId> — CONFORME/DIVERGENTE
Tela: <slug> (<screenId>) · versão N
Gates (analisar-html): papéis DSX NN% · contraste X/Y · a11y: <falhas>
Achados (sev ≥ 3): …   Aceitos: …   Recusados (motivo): …
Próximo passo: iterar | trazer | gerar variantes
```
