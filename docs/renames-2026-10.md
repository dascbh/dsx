# Renaming to English (DSX 0.5.0, 2026-10)

> **When to consult this**
> - When upgrading a project that uses the DSX from version ≤ 0.4.0 to 0.5.0.
> - When a tool or skill shows the warning "nome antigo, renomeie para X" (old name, rename to X).
> - When looking for the new name of a file, command, flag, key or id that changed.

## The rule

- **Code and data in English:** names of tool, script and data files and folders; CLI subcommands and flags; JSON/YAML keys and values (including the front matter of patterns, archetypes and `UX.md`); ids (patterns, archetypes, regions, states, variations); maps in `.dsx/maps/` and their keys; test titles; identifiers in code.
- **Documents for people in Portuguese:** name and content of `knowledge/**` (the front matter of those documents is data and stays in English), `templates/**`, skills (folder and text), agents (name and text), messages printed by the tools, interface text and section headings in the body of `.md` files (the 13 `UX.md` sections and the `DESIGN.md` ones in pt-BR are still accepted).
- **Key shape:** `snake_case` in all JSON and JSONL (`--json` outputs, maps, indexes, registries, changelog); `kebab-case` in YAML (front matter of `UX.md`, archetypes, patterns and `knowledge/`, eval rubrics). **Single exception:** names that mirror an external API or format stay as in the original — Figma API fields (`fileKey` in `design/figma-reference.json`, `modeId`, `valuesByMode`… in the snapshot and in the `use_figma` scripts), Stitch API fields (`designSystem`, `displayName`, `headlineFont`…), W3C DTCG (`$type`, typography `lineHeight`), `DESIGN.md` front matter (Google's format: `fontSize`, `lineHeight`) and Claude Code's `hooks.json` (`PreToolUse`).
- **Transition:** what a tool **reads** from a project also accepts the old name, with the warning "nome antigo, renomeie para X" (old name, rename to X); what it **writes** uses only the new name. Old subcommands and flags of every tool remain as aliases with the warning "nome antigo, use X" (old name, use X) (single table: `tools/lib/legacy-cli.mjs`). The compatible read exists to give time to migrate; do not count on it in future versions.

## Why the version is 0.5.0

Renaming breaks whoever calls the old names. The DSX is still at 0.x, so the breaking change bumps the second number (0.4.0 → 0.5.0).

## What keeps working (compatible read)

- **`UX.md`** (read by `lint-ux-md`, `screen.mjs`, `text.mjs`, `flow.mjs`): old front matter keys and values, old archetype and state ids, and the `arquetipos/<id>.md` path in the body. Converted with a warning; single table in `tools/ux-lint/lib/legacy.mjs`.
- **`version: alpha` in `UX.md`** (DSX 0.7): up to 0.6 it was the format version; now `version` is the document version in semver and the format goes in `format: alpha`. `lint-ux-md` accepts `alpha` with a warning and the score (`--score`) withholds the version points until the change.
- **Flow map `flows-<module>.json`** in the old format (`telas`, `transicoes`, `de`/`para`, `gatilho`, `jornadas`, type `dialogo`), at any path, including `.dsx/mapas/fluxos-<modulo>.json`.
- **`cases.json`** in the old format, in `text-page.mjs` and `findings.mjs options`; the old `--json` output of the checkers in `findings.mjs register`/`check` (no warning).
- **Maps in `.dsx/mapas/`** with the Portuguese names (and the legacy `.claude/figma-claude/`): agents and skills read them and rewrite them in `.dsx/maps/`.
- **`design/figma-sync.md`**: `vez:` (values `codigo`, `código`, `aplicando`), `arquivo:`, `desde:` — read with a warning by the `turn-guard` hook and by the figma-* skills. Old lines of `design/figma-changelog.jsonl` and old keys of `design/figma-reference.json` are also read.
- **Stitch:** old `.stitch/conferencia*.json`, `.stitch/revisoes/` and `metadata.json` are read by the skills.
- **Skill arguments:** `figma-vez` accepts `codigo`/`aplicando`; `mapear` accepts the modes `projeto`/`completo`.
- **Old CLI subcommands, flags and values**, in every tool that had them (single table `tools/lib/legacy-cli.mjs`): `references.mjs` (`indice`, `buscar`, `baixar`, `avaliar`, `curar`; `--registro`, `--uso`, `--tema`, `--curados`; `operacional`, `claro`…), `design-system.mjs` (`exportar`, `conferir`, `--papel`), `analyze-html.mjs` (`--usos`), `tokens-to-figma.mjs` (`--colecao`), `text.mjs` (`--telas`, `--codigo`, `--ignorar`), `screen.mjs` and `flow.mjs` (`--falhar-em`), `text-page.mjs` (`--produto`, `--cor`, `--titulo`), `lint-ux-md.mjs` (`--arquetipos`). They run the new name and warn "nome antigo, use X" (old name, use X).
- **`tokens/contrast-pairs.json`** with the `uso` key (`build-tokens` warns; `contrast.mjs` and `figma-to-tokens` accept it).
- **`btn()` from the Figma prelude** accepts the types `primária|secundária|destrutiva|neutra`.
- **camelCase keys from the working version before this one** (e.g. `probableData`, `byRule`, `generatedAt` in the maps): read by the tools and skills that read those files.

## What breaks (no compatible read)

- **Tool paths** (table "Files"; old subcommands and flags remain as aliases, but the script path changed): `tools/ux-lint/texto|tela|fluxo.mjs`, `tools/lint-arquetipos.mjs`, `tools/referencias.mjs`, `tools/figma/*-para-*`, `preludio.js`, `normalizar-svg-path.cjs`, `tools/stitch/analisar-html.mjs`, `hooks/guarda-vez.py`, `npm run lint:arquetipos`.
- **Keys of the JSON emitted** by every tool (ux-lint, figma, stitch, `lint-design-md --json`, `lint-raw-values --json`, `palette`, `contrast`, `type-scale`, `references.mjs evaluate`), now in English and `snake_case`, and exported JS functions.
- **DSX catalogs:** pattern and archetype ids and paths; pattern and archetype front matter; keys of `patterns/index.json`, `archetypes/index.json`, `references/design-md/index.json` and `curated.json`.
- **Figma prelude already pasted and filled in** (the `TK` key and the constants of the CONFIGURE block): redo it from `tools/figma/prelude.js`.
- **Eval rubrics and cases:** paths, ids and keys.
- **Figma findings folder** `design/figma-achados/` → `design/figma-findings/` (the skills write to the new path).
- **Pattern ids in project documents** (e.g. a `UX.md` that cites `patterns/acoes/desfazer.md` in the body): replace them using the table "Ids and files of the 77 patterns".

## How to migrate a project

1. Rename `.dsx/mapas/` to `.dsx/maps/` and the map files (table "Maps in the project"), or run `/dsx:mapear` again — it writes to the new path.
2. In `UX.md`, replace the front matter keys and values using the table "UX.md"; `node <DSX>/tools/lint-ux-md.mjs UX.md` lists every old name still left.
3. In `design/figma-sync.md`, replace `vez:` with `turn:` and the values (`codigo` → `code`, `aplicando` → `applying`); in new lines of `design/figma-changelog.jsonl`, use the English keys.
4. Update scripts, CI and project documents that call DSX tools by the old paths, subcommands and flags (the "Files" table and the tool tables).
5. Run the tools and clear the "nome antigo" (old name) warnings.

## Old → new tables

### Paths and files (DSX)

#### Folders

| Old | New | Compatible read? |
|---|---|---|
| `arquetipos/` | `archetypes/` | no |
| `referencias/` | `references/` | no |
| `evals/casos/` | `evals/cases/` | no |
| `evals/rubricas/` | `evals/rubrics/` | no |
| `referencias/design-md/designmd-app/*.md` | `references/design-md/designmd-app/*.md (content unchanged)` | no |

#### Files

| Old | New | Compatible read? |
|---|---|---|
| `arquetipos/index.json` | `archetypes/index.json` | no |
| `referencias/design-md/curados.json` | `references/design-md/curated.json` | no |
| `referencias/design-md/indice.json` | `references/design-md/index.json` | no |
| `tools/referencias.mjs` | `tools/references.mjs` | no |
| `tools/lint-arquetipos.mjs` | `tools/lint-archetypes.mjs` | no |
| `tools/ux-lint/texto.mjs` | `tools/ux-lint/text.mjs` | no |
| `tools/ux-lint/tela.mjs` | `tools/ux-lint/screen.mjs` | no |
| `tools/ux-lint/fluxo.mjs` | `tools/ux-lint/flow.mjs` | no |
| `tools/figma/figma-para-tokens.mjs` | `tools/figma/figma-to-tokens.mjs` | no |
| `tools/figma/tokens-para-figma.mjs` | `tools/figma/tokens-to-figma.mjs` | no |
| `tools/figma/normalizar-svg-path.cjs` | `tools/figma/normalize-svg-path.cjs` | no |
| `tools/figma/preludio.js` | `tools/figma/prelude.js` | no |
| `tools/stitch/analisar-html.mjs` | `tools/stitch/analyze-html.mjs` | no |
| `hooks/guarda-vez.py` | `hooks/turn-guard.py` | no |
| `evals/casos/ui-gerada.jsonl` | `evals/cases/generated-ui.jsonl` | no |
| `evals/rubricas/ui-gerada.yaml` | `evals/rubrics/generated-ui.yaml` | no |
| `evals/rubricas/feature-ia.yaml` | `evals/rubrics/ai-feature.yaml` | no |
| `evals/rubricas/design-md.yaml` | `evals/rubrics/design-md.yaml` | no |
| `tools/test/arquetipos.test.mjs` | `tools/test/archetypes.test.mjs` | no |
| `tools/test/referencias.test.mjs` | `tools/test/references.test.mjs` | no |
| `tools/test/figma-ponte.test.mjs` | `tools/test/figma-bridge.test.mjs` | no |
| `tools/test/ux-lint-texto.test.mjs` | `tools/test/ux-lint-text.test.mjs` | no |

#### Maps in the project (`.dsx/`)

| Old | New | Compatible read? |
|---|---|---|
| `.dsx/mapas/` | `.dsx/maps/` | yes (agents and skills read the legacy one and rewrite into the new one) |
| `mapa-projeto.{md,json}` | `project-map.{md,json}` | yes |
| `mapa-ui.{md,json}` | `ui-map.{md,json}` | yes |
| `fluxos.{md,json}` | `flows.{md,json}` | yes |
| `fluxos-<modulo>.json` | `flows-<module>.json` | yes (ux-lint flow.mjs accepts any path and the old format) |
| `tarefas.{md,json}` | `tasks.{md,json}` | yes |
| `jornada.{md,json}` | `journey.{md,json}` | yes |
| `dominio.{md,json}` | `domain.{md,json}` | yes |
| `confirmacoes.json` | `confirmations.json` | yes |
| `design/figma-achados/<rodada>.md` | `design/figma-findings/<rodada>.md` | yes (figma-* skills) |

#### package.json scripts

| Old | New | Compatible read? |
|---|---|---|
| `npm run lint:arquetipos` | `npm run lint:archetypes` | no |

### Patterns (`patterns/`)

#### Categories (folders)

| Old | New | Compatible read? |
|---|---|---|
| `acessibilidade` | `accessibility` | no |
| `acoes` | `actions` | no |
| `autenticacao` | `authentication` | no |
| `busca-filtros` | `search-filters` | no |
| `conteudo` | `content` | no |
| `dados` | `data` | no |
| `formularios` | `forms` | no |
| `ia` | `ai` | no |
| `modais` | `modals` | no |
| `navegacao` | `navigation` | no |

#### Ids and files of the 77 patterns

| Old | New | Compatible read? |
|---|---|---|
| `acessibilidade/alvo-de-toque.md` | `accessibility/touch-target.md` | no |
| `acessibilidade/foco-de-teclado.md` | `accessibility/keyboard-focus.md` | no |
| `acessibilidade/nao-so-cor.md` | `accessibility/not-color-alone.md` | no |
| `acoes/acao-destrutiva.md` | `actions/destructive-action.md` | no |
| `acoes/botao-desabilitado.md` | `actions/disabled-button.md` | no |
| `acoes/botao-flutuante.md` | `actions/floating-action-button.md` | no |
| `acoes/botao-icone-e-texto.md` | `actions/icon-and-text-button.md` | no |
| `acoes/clique-duplo-em-envio.md` | `actions/double-submit.md` | no |
| `acoes/confirmar-acao.md` | `actions/confirm-action.md` | no |
| `acoes/confirmar-exclusao.md` | `actions/confirm-deletion.md` | no |
| `acoes/desfazer.md` | `actions/undo.md` | no |
| `acoes/hierarquia-de-botoes.md` | `actions/button-hierarchy.md` | no |
| `acoes/icone-sem-texto.md` | `actions/icon-only-button.md` | no |
| `acoes/link-vs-botao.md` | `actions/link-vs-button.md` | no |
| `acoes/posicao-de-acoes.md` | `actions/action-placement.md` | no |
| `autenticacao/confirmar-senha.md` | `authentication/confirm-password.md` | no |
| `autenticacao/mostrar-senha.md` | `authentication/show-password.md` | no |
| `autenticacao/recuperar-senha.md` | `authentication/password-recovery.md` | no |
| `autenticacao/requisitos-de-senha.md` | `authentication/password-requirements.md` | no |
| `autenticacao/sessao-expirada.md` | `authentication/session-expired.md` | no |
| `busca-filtros/aplicacao-de-filtros.md` | `search-filters/applying-filters.md` | no |
| `busca-filtros/busca-sem-resultados.md` | `search-filters/no-search-results.md` | no |
| `busca-filtros/estrutura-de-filtros.md` | `search-filters/filter-structure.md` | no |
| `busca-filtros/filtros-ativos.md` | `search-filters/active-filters.md` | no |
| `conteudo/carrossel-automatico.md` | `content/auto-advancing-carousel.md` | no |
| `conteudo/carrossel.md` | `content/carousel.md` | no |
| `dados/filtro-de-periodo.md` | `data/date-range-filter.md` | no |
| `dados/ordenacao-de-tabela.md` | `data/table-sorting.md` | no |
| `dados/paginacao-de-tabela.md` | `data/table-pagination.md` | no |
| `dados/tabela-responsiva.md` | `data/responsive-table.md` | no |
| `dados/tabela-vs-cards.md` | `data/table-vs-cards.md` | no |
| `ecommerce/carrinho-editar-itens.md` | `ecommerce/cart-edit-items.md` | no |
| `ecommerce/checkout-convidado.md` | `ecommerce/guest-checkout.md` | no |
| `ecommerce/endereco-por-cep.md` | `ecommerce/address-by-postal-code.md` | no |
| `ecommerce/variacoes-de-produto.md` | `ecommerce/product-variants.md` | no |
| `feedback/carregamento-longo.md` | `feedback/long-loading.md` | no |
| `feedback/codigo-de-erro-tecnico.md` | `feedback/technical-error-code.md` | no |
| `feedback/confirmacao-de-sucesso.md` | `feedback/success-confirmation.md` | no |
| `feedback/duracao-de-toast.md` | `feedback/toast-duration.md` | no |
| `feedback/estado-vazio.md` | `feedback/empty-state.md` | no |
| `feedback/falha-temporaria.md` | `feedback/temporary-failure.md` | no |
| `feedback/porcentagem-de-progresso.md` | `feedback/progress-percentage.md` | no |
| `feedback/skeleton-screen.md` | `feedback/skeleton-screen.md` | no |
| `feedback/skeleton-vs-spinner.md` | `feedback/skeleton-vs-spinner.md` | no |
| `feedback/tentar-novamente.md` | `feedback/retry.md` | no |
| `feedback/toast-alerta-inline.md` | `feedback/toast-vs-inline-alert.md` | no |
| `formularios/autopreenchimento.md` | `forms/autofill.md` | no |
| `formularios/autosave-vs-salvar.md` | `forms/autosave-vs-save.md` | no |
| `formularios/campos-obrigatorios.md` | `forms/required-fields.md` | no |
| `formularios/dividir-formulario.md` | `forms/split-form.md` | no |
| `formularios/dropdown.md` | `forms/dropdown.md` | no |
| `formularios/erros-em-formularios.md` | `forms/form-errors.md` | no |
| `formularios/etapas-de-formulario.md` | `forms/form-steps.md` | no |
| `formularios/label-vs-placeholder.md` | `forms/label-vs-placeholder.md` | no |
| `formularios/momento-da-validacao.md` | `forms/validation-timing.md` | no |
| `formularios/onde-exibir-erros.md` | `forms/error-placement.md` | no |
| `formularios/ordem-dos-campos.md` | `forms/field-order.md` | no |
| `formularios/posicao-do-erro-no-campo.md` | `forms/field-error-position.md` | no |
| `formularios/preservar-dados-apos-erro.md` | `forms/preserve-data-after-error.md` | no |
| `formularios/upload-de-arquivos.md` | `forms/file-upload.md` | no |
| `ia/confirmar-acao-da-ia.md` | `ai/confirm-ai-action.md` | no |
| `ia/fontes-da-ia.md` | `ai/ai-sources.md` | no |
| `ia/incerteza-da-ia.md` | `ai/ai-uncertainty.md` | no |
| `ia/recuperar-erro-da-ia.md` | `ai/ai-error-recovery.md` | no |
| `ia/revisar-resultado-da-ia.md` | `ai/review-ai-output.md` | no |
| `ia/rotular-conteudo-ia.md` | `ai/label-ai-content.md` | no |
| `modais/fechar-modal.md` | `modals/close-modal.md` | no |
| `modais/quando-evitar-modal.md` | `modals/when-to-avoid-modal.md` | no |
| `modais/quando-usar-modal.md` | `modals/when-to-use-modal.md` | no |
| `navegacao/abas.md` | `navigation/tabs.md` | no |
| `navegacao/breadcrumbs.md` | `navigation/breadcrumbs.md` | no |
| `navegacao/link-em-nova-aba.md` | `navigation/link-in-new-tab.md` | no |
| `navegacao/navegacao-principal.md` | `navigation/main-navigation.md` | no |
| `navegacao/paginacao-vs-scroll.md` | `navigation/pagination-vs-scroll.md` | no |
| `ux-writing/mensagem-de-erro-util.md` | `ux-writing/helpful-error-message.md` | no |
| `ux-writing/texto-de-botao.md` | `ux-writing/button-text.md` | no |
| `ux-writing/texto-de-link.md` | `ux-writing/link-text.md` | no |

#### Front matter: keys

| Old | New | Compatible read? |
|---|---|---|
| `titulo` | `title` | no |
| `categoria` | `category` | no |
| `componentes` | `components` | no |
| `tipo` | `type` | no |
| `impacto` | `impact` | no |
| `evidencia` | `evidence` | no |
| `relacionados` | `related` | no |
| `regra` | `rule` | no |
| `arquivo` | `file` | no |

#### Front matter: values of `type`

| Old | New | Compatible read? |
|---|---|---|
| `recomendacao` | `recommendation` | no |
| `antipadrao` | `anti-pattern` | no |
| `decisao-contextual` | `contextual-decision` | no |
| `acessibilidade` | `accessibility` | no |

#### Front matter: values of `impact`

| Old | New | Compatible read? |
|---|---|---|
| `critico` | `critical` | no |
| `alto` | `high` | no |
| `medio` | `medium` | no |
| `baixo` | `low` | no |

#### Front matter: values of `status`

| Old | New | Compatible read? |
|---|---|---|
| `recomendado` | `recommended` | no |
| `usar-com-cautela` | `caution` | no |
| `evitar` | `avoid` | no |

#### Front matter: values of `evidence`

| Old | New | Compatible read? |
|---|---|---|
| `forte` | `strong` | no |
| `moderada` | `moderate` | no |
| `fraca` | `weak` | no |
| `emergente` | `emerging` | no |

#### Front matter: values of `components`

| Old | New | Compatible read? |
|---|---|---|
| `abas` | `tabs` | no |
| `alerta` | `alert` | no |
| `alerta-global` | `global-alert` | no |
| `area-de-arrastar-e-soltar` | `drop-zone` | no |
| `aviso` | `notice` | no |
| `barra-de-progresso` | `progress-bar` | no |
| `botao` | `button` | no |
| `botao-aplicar` | `apply-button` | no |
| `botao-carregar-mais` | `load-more-button` | no |
| `botao-continuar` | `continue-button` | no |
| `botao-copiar` | `copy-button` | no |
| `botao-de-icone` | `icon-button` | no |
| `botao-de-visibilidade` | `visibility-toggle` | no |
| `botao-desabilitado` | `disabled-button` | no |
| `botao-desfazer` | `undo-button` | no |
| `botao-flutuante` | `floating-action-button` | no |
| `botao-voltar` | `back-button` | no |
| `cabecalho` | `header` | no |
| `cabecalho-de-coluna` | `column-header` | no |
| `campo` | `field` | no |
| `campo-cep` | `postal-code-field` | no |
| `campo-condicional` | `conditional-field` | no |
| `campo-de-busca` | `search-field` | no |
| `campo-de-codigo` | `code-field` | no |
| `campo-de-formulario` | `form-field` | no |
| `campo-de-identificador` | `identifier-field` | no |
| `campo-de-senha` | `password-field` | no |
| `campo-de-texto` | `text-field` | no |
| `campo-numerico` | `number-field` | no |
| `carrinho` | `cart` | no |
| `carrossel` | `carousel` | no |
| `citacao` | `citation` | no |
| `controle-de-pausa` | `pause-control` | no |
| `controles-de-navegacao` | `navigation-controls` | no |
| `dialogo` | `dialog` | no |
| `dialogo-modal` | `modal-dialog` | no |
| `endereco` | `address` | no |
| `estado-vazio` | `empty-state` | no |
| `etapa-de-revisao` | `review-step` | no |
| `etiqueta` | `tag` | no |
| `filtro` | `filter` | no |
| `filtros` | `filters` | no |
| `formulario` | `form` | no |
| `formulario-de-endereco` | `address-form` | no |
| `formulario-de-redefinicao` | `reset-form` | no |
| `galeria` | `gallery` | no |
| `grafico` | `chart` | no |
| `grupo-de-botoes` | `button-group` | no |
| `guia-de-medidas` | `size-guide` | no |
| `icone` | `icon` | no |
| `icone-de-link-externo` | `external-link-icon` | no |
| `ilustracao` | `illustration` | no |
| `indicador-de-carregamento` | `loading-indicator` | no |
| `indicador-de-confianca` | `confidence-indicator` | no |
| `indicador-de-estado` | `status-indicator` | no |
| `indicador-de-etapas` | `step-indicator` | no |
| `indicador-de-posicao` | `position-indicator` | no |
| `input-de-arquivo` | `file-input` | no |
| `link-esqueci-senha` | `forgot-password-link` | no |
| `lista` | `list` | no |
| `lista-de-arquivos` | `file-list` | no |
| `lista-de-resultados` | `results-list` | no |
| `mensagem-de-erro` | `error-message` | no |
| `mensagem-de-estado` | `status-message` | no |
| `mensagem-inline` | `inline-message` | no |
| `menu-mobile` | `mobile-menu` | no |
| `modal-de-confirmacao` | `confirmation-modal` | no |
| `mostrar-senha` | `show-password` | no |
| `navegacao-secundaria` | `secondary-navigation` | no |
| `notificacao-temporaria` | `temporary-notification` | no |
| `pagina` | `page` | no |
| `pagina-de-confirmacao` | `confirmation-page` | no |
| `pagina-de-indisponibilidade` | `unavailable-page` | no |
| `paginacao` | `pagination` | no |
| `painel` | `panel` | no |
| `painel-de-filtros` | `filter-panel` | no |
| `painel-de-fontes` | `sources-panel` | no |
| `painel-lateral` | `side-panel` | no |
| `reautenticacao` | `reauthentication` | no |
| `regiao-de-status` | `status-region` | no |
| `resposta-de-ia` | `ai-response` | no |
| `resumo-de-acao` | `action-summary` | no |
| `resumo-de-erros` | `error-summary` | no |
| `resumo-de-revisao` | `review-summary` | no |
| `rotulo` | `label` | no |
| `scroll-infinito` | `infinite-scroll` | no |
| `selecao-de-conta` | `account-selection` | no |
| `seletor` | `picker` | no |
| `seletor-de-periodo` | `date-range-picker` | no |
| `sugestao-de-ia` | `ai-suggestion` | no |
| `tabela` | `table` | no |
| `temporizador` | `timer` | no |
| `texto-auxiliar` | `helper-text` | no |
| `texto-de-ajuda` | `help-text` | no |
| `validacao` | `validation` | no |

### Archetypes (`archetypes/`)

#### Ids and files

| Old | New | Compatible read? |
|---|---|---|
| `lista-operacional` | `operational-list` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `mestre-detalhe` | `master-detail` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `documento-com-visor` | `document-viewer` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `editor-com-painel` | `editor-with-panel` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `assistente-em-etapas` | `step-wizard` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `painel-de-acompanhamento` | `monitoring-dashboard` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `biblioteca` | `library` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `configuracoes` | `settings` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `pagina-publica-de-decisao` | `public-decision-page` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `dialogo-de-formulario` | `form-dialog` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `dialogo-de-confirmacao` | `confirmation-dialog` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |
| `painel-lateral-de-detalhe` | `detail-side-panel` | yes in UX.md (`lint-ux-md` accepts the old id with a warning) |

#### Front matter: keys (includes `primary-action{region,position,max}`)

| Old | New | Compatible read? |
|---|---|---|
| `titulo` | `title` | no |
| `resumo` | `summary` | no |
| `registro` | `register` | no |
| `quando-usar` | `when-to-use` | no |
| `evitar-quando` | `avoid-when` | no |
| `regioes` | `regions` | no |
| `acao-primaria` | `primary-action` | no |
| `estados` | `states` | no |
| `padroes` | `patterns` | no |
| `variacoes` | `variations` | no |
| `regras` | `rules` | no |
| `arquivo` | `file` | no |
| `regiao` | `region` | no |
| `posicao` | `position` | no |

#### Registers (`register`; same vocabulary in UX.md and in the references)

| Old | New | Compatible read? |
|---|---|---|
| `operacional` | `operational` | no |
| `consumo` | `consumer` | no |
| `marca` | `brand` | no |

#### Regions

| Old | New | Compatible read? |
|---|---|---|
| `cabecalho-da-pagina` | `page-header` | no |
| `trilha-de-etapas` | `step-trail` | no |
| `corpo-da-etapa` | `step-body` | no |
| `rodape-de-navegacao` | `navigation-footer` | no |
| `navegacao-de-colecoes` | `collection-navigation` | no |
| `barra-de-busca` | `search-bar` | no |
| `conteudo` | `content` | no |
| `visualizacao-rapida` | `quick-view` | no |
| `menu-de-secoes` | `section-menu` | no |
| `corpo-da-secao` | `section-body` | no |
| `rodape-da-secao` | `section-footer` | no |
| `zona-de-risco` | `danger-zone` | no |
| `cabecalho-do-dialogo` | `dialog-header` | no |
| `corpo-do-dialogo` | `dialog-body` | no |
| `rodape-do-dialogo` | `dialog-footer` | no |
| `barra-do-visor` | `viewer-toolbar` | no |
| `visor` | `viewer` | no |
| `painel-de-informacoes` | `info-panel` | no |
| `barra-de-ferramentas` | `toolbar` | no |
| `area-de-edicao` | `editing-area` | no |
| `painel-lateral` | `side-panel` | no |
| `barra-de-status` | `status-bar` | no |
| `barra-de-filtros` | `filter-bar` | no |
| `barra-de-acoes-em-lote` | `bulk-actions-bar` | no |
| `rodape-da-lista` | `list-footer` | no |
| `coluna-mestre` | `master-column` | no |
| `coluna-detalhe` | `detail-column` | no |
| `cabecalho-publico` | `public-header` | no |
| `resumo-do-pedido` | `request-summary` | no |
| `documento-ou-detalhe` | `document-or-detail` | no |
| `area-de-decisao` | `decision-area` | no |
| `rodape-publico` | `public-footer` | no |
| `barra-de-periodo` | `period-bar` | no |
| `faixa-de-indicadores` | `kpi-strip` | no |
| `area-de-graficos` | `charts-area` | no |
| `lista-de-pendencias` | `pending-list` | no |
| `cabecalho-do-painel` | `panel-header` | no |
| `corpo-do-painel` | `panel-body` | no |
| `rodape-do-painel` | `panel-footer` | no |

#### States

| Old | New | Compatible read? |
|---|---|---|
| `carregando` | `loading` | no |
| `erro-de-campo` | `field-error` | no |
| `erro` | `error` | no |
| `enviando` | `submitting` | no |
| `sucesso` | `success` | no |
| `rascunho-retomado` | `draft-restored` | no |
| `vazio` | `empty` | no |
| `vazio-por-filtro` | `empty-filtered` | no |
| `sem-acesso` | `no-access` | no |
| `alteracoes-nao-salvas` | `unsaved-changes` | no |
| `salvando` | `saving` | no |
| `aberto` | `open` | no |
| `executando` | `running` | no |
| `processando` | `processing` | no |
| `indisponivel` | `unavailable` | no |
| `salvo` | `saved` | no |
| `conflito` | `conflict` | no |
| `somente-leitura` | `read-only` | no |
| `nada-selecionado` | `nothing-selected` | no |
| `link-invalido` | `invalid-link` | no |
| `link-expirado` | `expired-link` | no |
| `ja-respondido` | `already-answered` | no |
| `sem-dados-no-periodo` | `no-data-in-period` | no |
| `parcial` | `partial` | no |
| `desatualizado` | `stale` | no |
| `item-removido` | `item-removed` | no |
| `editando` | `editing` | no |

#### Variations

| Old | New | Compatible read? |
|---|---|---|
| `trilha-horizontal` | `horizontal-trail` | no |
| `trilha-vertical-lateral` | `vertical-side-trail` | no |
| `etapa-de-revisao-final` | `final-review-step` | no |
| `assistente-em-dialogo` | `wizard-in-dialog` | no |
| `grade-de-cartoes` | `card-grid` | no |
| `lista-densa` | `dense-list` | no |
| `colecoes-em-arvore` | `collection-tree` | no |
| `com-visualizacao-rapida` | `with-quick-view` | no |
| `salvar-por-secao` | `save-per-section` | no |
| `salvar-ao-alterar` | `save-on-change` | no |
| `abas-no-topo` | `top-tabs` | no |
| `confirmacao-simples` | `simple-confirmation` | no |
| `digitar-para-confirmar` | `type-to-confirm` | no |
| `desfazer-em-vez-de-confirmar` | `undo-instead-of-confirm` | no |
| `confirmacao-com-consequencias-listadas` | `confirmation-with-consequences` | no |
| `dialogo-curto` | `short-dialog` | no |
| `dialogo-com-secoes` | `sectioned-dialog` | no |
| `promover-a-pagina` | `promote-to-page` | no |
| `visor-com-painel-a-direita` | `viewer-with-right-panel` | no |
| `visor-em-tela-cheia` | `fullscreen-viewer` | no |
| `comparacao-lado-a-lado` | `side-by-side-comparison` | no |
| `painel-fixo-a-direita` | `fixed-right-panel` | no |
| `painel-recolhivel` | `collapsible-panel` | no |
| `painel-com-abas` | `tabbed-panel` | no |
| `foco-sem-painel` | `focus-without-panel` | no |
| `com-acoes-em-lote` | `with-bulk-actions` | no |
| `cards-no-mobile` | `cards-on-mobile` | no |
| `filtros-em-painel-lateral` | `filters-in-side-panel` | no |
| `agrupada-por-status` | `grouped-by-status` | no |
| `duas-colunas-fixas` | `two-fixed-columns` | no |
| `mestre-recolhivel` | `collapsible-master` | no |
| `detalhe-empilhado-no-mobile` | `stacked-detail-on-mobile` | no |
| `decisao-binaria` | `binary-decision` | no |
| `decisao-com-motivo` | `decision-with-reason` | no |
| `decisao-com-identificacao` | `decision-with-identification` | no |
| `documento-longo-com-decisao-fixa` | `long-document-with-sticky-decision` | no |
| `indicadores-acima-da-lista` | `kpis-above-list` | no |
| `pendencias-primeiro` | `pending-first` | no |
| `painel-por-perfil` | `dashboard-per-role` | no |
| `sobreposto` | `overlay` | no |
| `empurrando-o-conteudo` | `push-content` | no |
| `leitura-com-link-para-pagina` | `read-with-page-link` | no |

#### Primary action positions

| Old | New | Compatible read? |
|---|---|---|
| `topo-direita` | `top-right` | no |
| `rodape-direita` | `bottom-right` | no |
| `junto-ao-conteudo` | `inline` | no |

### General tools

#### Output keys and ids

| Old | New | Compatible read? |
|---|---|---|
| `lint-design-md --json: info.secoes` | `info.sections` | no |
| `lint-design-md --json: info.referencias` | `info.references` | no |
| `lint-design-md --json: info.paresContraste` | `info.contrast_pairs` | no |
| `lint-raw-values --json: ocorrencias` | `occurrences` | no |
| `lint-raw-values --json: driftPorMilLinhas` | `drift_per_1000_lines` | no |
| `lint-raw-values rule cor-hex` | `color-hex` | no |
| `lint-raw-values rule cor-func` | `color-func` | no |
| `lint-raw-values rule px-solto` | `loose-px` | no |
| `lint-raw-values rule z-magico` | `magic-z` | no |
| `lint-raw-values rule tw-arbitr` | `tw-arbitrary` | no |
| `palette --format json: contrasteBranco` | `contrast_white` | no |
| `palette --format json: contrastePreto` | `contrast_black` | no |
| `tokens/contrast-pairs.json: uso` | `use` | yes (build-tokens warns; contrast.mjs accepts both) |
| `lint-archetypes: exports loadArquetipos, lintArquetipos, REGISTROS, POSICOES, REGRAS` | `loadArchetypes, lintArchetypes, REGISTERS, POSITIONS, RULES` | no |
| `lint-patterns: ENUMS.categoria/tipo/impacto/evidencia` | `ENUMS.category/type/impact/evidence` | no |
| `patterns/index.json and archetypes/index.json: keys in Portuguese (titulo, categoria, arquivo…)` | `same front matter keys in English (title, category, file…)` | no |


### UX.md and ux-lint

#### UX.md — front matter keys

| Old | New | Compatible read? |
|---|---|---|
| `produto` (`persona`, `registro`, `plataforma`, `densidade`) | `product` (`persona`, `register`, `platform`, `density`) | yes, with warning |
| `navegacao` (`modelo`, `profundidade-maxima`, `retorno`) | `navigation` (`model`, `max-depth`, `back`) | yes, with warning |
| `arquetipos` | `archetypes` | yes, with warning |
| `acoes` (`primarias-por-regiao`, `posicao-primaria`, `ordem-dialogo`, `destrutiva-rotulo-especifico`) | `actions` (`primary-per-region`, `primary-position`, `dialog-order`, `destructive-specific-label`) | yes, with warning |
| `confirmacao` (`irreversivel`, `reversivel`) | `confirmation` (`irreversible`, `reversible`) | yes, with warning |
| `feedback` (`sucesso`, `erro-de-campo`, `erro-de-sistema`, `esqueleto-acima-de-ms`) | `feedback` (`success`, `field-error`, `system-error`, `skeleton-after-ms`) | yes, with warning |
| `estados` | `states` | yes, with warning |
| `formularios` (`rotulo`, `validacao`, `obrigatorios`) | `forms` (`label`, `validation`, `required`) | yes, with warning |
| `conteudo` (`glossario`, `botoes`, `proibidos`, `nomes-proprios`) | `content` (`glossary`, `buttons`, `forbidden`, `proper-nouns`) | yes, with warning |
| `fluxos` (`max-passos-jornada`, `max-dialogos-empilhados`, `becos-sem-saida`) | `flows` (`max-journey-steps`, `max-stacked-dialogs`, `dead-ends`) | yes, with warning |
| `verificacao.seletores` (`regioes`, `dialogo`, `rodape-dialogo`, `primaria`, `destrutiva`, `botao`, `campo`) | `verification.selectors` (`regions`, `dialog`, `dialog-footer`, `primary`, `destructive`, `button`, `field`) | yes, with warning |

#### UX.md — values

| Old | New | Compatible read? |
|---|---|---|
| register `operacional` · `consumo` · `editorial` · `marca` | `operational` · `consumer` · `editorial` · `brand` | yes, with warning |
| platform `ambos` | `both` | yes, with warning |
| density `baixa` · `media` · `alta` | `low` · `medium` · `high` | yes, with warning |
| back `obrigatorio` · `opcional` | back `mandatory` · `optional` | yes, with warning |
| position `topo-direita` · `rodape-direita` · `junto-ao-conteudo` | `top-right` · `bottom-right` · `inline` | yes, with warning |
| order `cancelar-acao` · `acao-cancelar` | `cancel-action` · `action-cancel` | yes, with warning |
| irreversible `dialogo` · `digitar-nome` | `dialog` · `type-name` | yes, with warning |
| reversible `desfazer` · `nenhuma` | `undo` · `none` | yes, with warning |
| success `pagina` | `page` | yes, with warning |
| system error `alerta-na-pagina` | `page-alert` | yes, with warning |
| label `sempre-visivel` | `always-visible` | yes, with warning |
| validation `ao-sair-do-campo` · `ao-enviar` · `em-tempo-real` | `on-blur` · `on-submit` · `realtime` | yes, with warning |
| required `marcar-obrigatorios` · `marcar-opcionais` | `mark-required` · `mark-optional` | yes, with warning |
| buttons `verbo-objeto` | `verb-object` | yes, with warning |
| states `carregando` · `vazio` · `erro` · `sem-acesso` · `sucesso` (and the other archetype states) | `loading` · `empty` · `error` · `no-access` · `success` (…) | yes, with warning |
| archetype ids in `archetypes` (e.g. `lista-operacional`) and the path `arquetipos/<id>.md` in the body | new ids (e.g. `operational-list`), `archetypes/<id>.md` | yes, with warning |

#### ux-lint — tools and flags

| Old | New | Compatible read? |
|---|---|---|
| `tools/ux-lint/texto.mjs` · `tela.mjs` · `fluxo.mjs` | `text.mjs` · `screen.mjs` · `flow.mjs` | no (path changed) |
| `tools/ux-lint/pagina-texto.mjs` (already renamed before) | `text-page.mjs` | no |
| `--telas` · `--codigo` · `--ignorar` (text.mjs) | `--screens` · `--code` · `--ignore` | yes (alias with warning) |
| `--falhar-em` (screen.mjs, flow.mjs) | `--fail-at` | yes (alias with warning) |
| `--produto` · `--cor` · `--titulo` (text-page.mjs) | `--product` · `--color` · `--title` | yes (alias with warning) |
| `--arquetipos` (lint-ux-md.mjs) | `--archetypes` | yes (alias with warning) |
| `casos.json` (`options --from`, text-page) | `cases.json` (the file name is free; the format changed) | yes (old format read with a warning) |

#### ux-lint — keys of the emitted JSON (`--json`)

| Old | New | Compatible read? |
|---|---|---|
| `achados` · `resumo` · `telas` · `ranking` | `findings` · `summary` · `screens` · `ranking` | yes, via `findings.mjs` (register/check) |
| `regra` · `severidade` · `mensagem` · `sugestao` · `texto` · `tipos` · `tipo` | `rule` · `severity` · `message` · `suggestion` · `text` · `types` · `type` | yes, via `findings.mjs` |
| `evidencia` · `evidencias` | `evidence` | yes, via `findings.mjs` |
| `origem` {`trecho`, `total`, `local` (`codigo`/`dado`), `ocorrencias` [{`arquivo`, `linha`, `teste`}]} | `source` {`snippet`, `total`, `location` (`code`/`data`), `occurrences` [{`file`, `line`, `test`}]} | yes, via `findings.mjs` |
| `variantes` · `dado` · `severidadeOriginal` · `provavelDado` | `variants` · `probableData` · `originalSeverity` · `probableData` | yes, via `findings.mjs` |
| `porRegra` {`achados`, `ocorrencias`, `dado`} · `porTipo` · `inventarioPorTipo` · `porSeveridade` · `telasComAchado` · `textos` | `byRule` {`findings`, `occurrences`, `probableData`} · `byType` · `inventoryByType` · `bySeverity` · `screensWithFindings` · `texts` | yes, via `findings.mjs` |
| screen: `arquivo` · `dialogoAberto` · `regiao` · `inventario` | `file` · `dialogOpen` · `region` · `inventory` | yes, via `findings.mjs` |
| flow: `arquivo` · `tela` · `transicoes` · `jornadas` | `file` · `screen` · `transitions` · `journeys` | yes, via `findings.mjs` |
| inventory: `variante` · `titulo` · `rotulo` · `visivel` · `controle` · `truncavel` · `completo` · `doAriaLabel` · `linha` | `variant` · `title` · `label` · `visible` · `control` · `truncatable` · `full` · `fromAriaLabel` · `line` | no (informational only) |
| element types `título` · `botão` · `aba` · `rótulo` · `texto de apoio` · `alerta` · `nome acessível` · `valor vazio` | `title` · `button` · `tab` · `label` · `helper` · `alert` · `accessible-name` · `empty-value` | yes, via `findings.mjs` |
| button variants `ícone` · `item de lista` · `ordenação` · `alternância` · `item de menu` · `outro` · `composto`; title variants `acordeão` · `diálogo` | `icon` · `list-item` · `sort` · `toggle` · `menu-item` · `other` · `composite`; `accordion` · `dialog` | no (informational only) |
| — (new) | `warnings` in the JSON when the UX.md or the map uses an old name | — |

Note: the new keys follow the camelCase already used in the registry (`byStatus`); hence `probableData`, not `probable_data`.

#### cases.json (options for the page and for `findings.mjs options`)

| Old | New | Compatible read? |
|---|---|---|
| `casos` | `cases` | yes, with warning |
| `elemento` · `regra` · `severidade` · `texto` · `variantes` · `origem` · `telas` · `problema` | `element` · `rule` · `severity` · `text` · `variants` · `source` · `screens` · `problem` | yes, with warning |
| `opcoes` [{`texto`, `convencao`, `nota`}] | `options` [{`text`, `convention`, `note`}] | yes, with warning |
| `recomendada` {`indice`, `porque`} | `recommended` {`index`, `why`} | yes, with warning |
| element values `botao` · `titulo` · `rotulo` · `dica` · `apoio` · `alerta` · `aba` · `nome-acessivel` · `celula` | `button` · `title` · `label` · `tooltip` · `helper` · `alert` · `tab` · `accessible-name` · `cell` | yes (already existed) |
| case id generated by the page `caso-…`, attribute `data-caso` | `case-…`, `data-case` | no (generated page only) |

#### Flow map `.dsx/maps/flows-<module>.json`

| Old | New | Compatible read? |
|---|---|---|
| `telas` [{`id`, `nome`, `tipo`, `rota`, `pai`, `componente`, `persona`}] | `screens` [{`id`, `name`, `type`, `route`, `parent`, `component`, `persona`}] | yes, with warning (flow.mjs) |
| `transicoes` [{`id`, `de`, `para`, `gatilho` {`tipo`, `rotulo`}, `evidencia`}] | `transitions` [{`id`, `from`, `to`, `trigger` {`type`, `label`}, `evidence`}] | yes, with warning |
| `jornadas` [{`id`, `nome`, `passos`, `trocas_persona`}] | `journeys` [{`id`, `name`, `steps`, `persona_switches`}] | yes, with warning |
| screen type `pagina` · `dialogo` · `aba` · `painel` · `gaveta` | `page` · `dialog` · `tab` · `panel` · `drawer` | yes, with warning |

#### Exported identifiers

| Old | New | Compatible read? |
|---|---|---|
| `lint-ux-md.mjs`: `ARQUETIPOS`, `SECOES`, option `arquetiposDir`, `info.arquetipos`, `info.secoes` | `ARCHETYPES`, `SECTIONS`, `archetypesDir`, `info.archetypes`, `info.sections` | no |
| `ux-lint/lib/config.mjs`: `PADROES` | `DEFAULTS` (+ `cfg.legacyWarnings`, non-enumerable) | no |
| `screen.mjs`: `analisarTela`, `resumir`, `SEVERIDADE`, `ROTULOS_CANCELAR`, `ROTULOS_GENERICOS_DESTRUTIVA`, `ROTULOS_SEM_VERBO` | `analyzeScreen`, `summarize`, `SEVERITY`, `CANCEL_LABELS`, `GENERIC_DESTRUCTIVE_LABELS`, `LABELS_WITHOUT_VERB` | no |
| `flow.mjs`: `analisarFluxo`, `SEVERIDADE` | `analyzeFlow`, `SEVERITY` | no |
| `text.mjs`: `analisarTexto`, `inventariar`, `regrasDoItem`, `termosDe`, `agrupar`, `ranking`, `resumir`, `indexarCodigo`, `indexarFonte`, `semComentarios`, `trechos`, `origemDe`, `textoDe`, `lerArgs`, `SEVERIDADE`, `TIPOS`, `ROTULOS_SEM_VERBO`, `TERMOS_TECNICOS` | `analyzeText`, `takeInventory`, `rulesForItem`, `termsFrom`, `group`, `ranking`, `summarize`, `indexCode`, `indexSource`, `stripComments`, `snippets`, `sourceOf`, `visibleText`, `parseTextArgs`, `SEVERITY`, `TYPES` (+ `TYPE_LABEL`), `LABELS_WITHOUT_VERB`, `TECHNICAL_TERMS` | no |
| `findings.mjs`: `check()` returns `{ pass, novos, regressoes, conhecidos }` | `{ pass, added, regressions, known }` | no |
| — (new) | `tools/ux-lint/lib/legacy.mjs`: `normalizeUxFrontMatter`, `normalizeFlowMap`, `normalizeCases`, `normalizeDetectorJson`, `OLD_FLAGS`, `rejectOldFlags`, tables `UX_KEYS`, `UX_VALUES`, `ARCHETYPE_IDS`, `STATE_IDS`, `SCREEN_TYPES`, `TEXT_TYPES` | — |

### DESIGN.md references

#### DESIGN.md references (`tools/references.mjs`, `references/design-md/`)

| Old | New | Compatible read? |
|---|---|---|
| `tools/referencias.mjs` | `tools/references.mjs` | no (script path) |
| `referencias/design-md/indice.json` | `references/design-md/index.json` | no (DSX file, rewritten) |
| `referencias/design-md/curados.json` | `references/design-md/curated.json` | no (DSX file, rewritten) |
| subcommand `indice` | `index` | yes, with warning |
| subcommand `buscar` | `search` | yes, with warning |
| subcommand `baixar` | `fetch` | yes, with warning |
| subcommand `avaliar` | `evaluate` | yes, with warning |
| subcommand `curar` | `curate` | yes, with warning |
| `--registro` | `--register` | yes, with warning |
| `--uso` | `--use` | yes, with warning |
| `--tema` | `--theme` | yes, with warning |
| `--curados` | `--curated` | yes, with warning |
| value of `--register`: `operacional` / `consumo` / `marca` | `operational` / `consumer` / `brand` (`editorial`, `experimental` unchanged) | yes, with warning |
| value of `--theme`: `claro` / `escuro` | `light` / `dark` | yes, with warning |
| index.json: `fonte`, `licenca`, `atualizado`, `itens` | `source`, `license`, `updated`, `items` | no |
| index.json item: `titulo`, `descricao`, `categoria`, `uso`, `estilo`, `palavras` | `title`, `description`, `category`, `use_case`, `style`, `keywords` | no |
| index.json `dsx.registro`, `dsx.registros`, `dsx.tema` | `dsx.register`, `dsx.registers`, `dsx.theme` | no |
| register values `operacional`, `consumo`, `marca` | `operational`, `consumer`, `brand` | no (in the JSON) |
| theme values `claro`, `escuro`, `claro-e-escuro` | `light`, `dark`, `light-and-dark` | no (in the JSON) |
| curated.json: `criterio`, `atualizado`, `itens` | `criteria`, `updated`, `items` | no |
| curated.json item: `titulo`, `registro`, `tema`, `uso`, `nota`, `contrasteReprovado`, `erros`, `avisos`, `arquivo` | `title`, `register`, `theme`, `use_case`, `score`, `contrast_failures`, `errors`, `warnings`, `file` | no |
| curated.json `tokens.cores`, `tokens.tipografia`, `tokens.componentes` | `tokens.colors`, `tokens.typography`, `tokens.components` | no |
| `evaluate` output (JSON): `nota`, `tema`, `erros`, `avisos`, `contrasteComponentes`, `contrasteReprovado`, `tokens.{cores,tipografia,componentes}`; pair `{componente, razao}` | `score`, `theme`, `errors`, `warnings`, `component_contrast`, `contrast_failures`, `tokens.{colors,typography,components}`; pair `{component, ratio}` | no |
| exports `classificar`, `avaliar` | `classify`, `evaluate` (new: `normalizeArgs`) | no |
| user-agent `dsx-referencias/1.0` | `dsx-references/1.0` | — |
| test `tools/test/referencias.test.mjs` | `tools/test/references.test.mjs` | — |

### Figma, Stitch, hook, maps and evals

#### Figma — tools, exports and output keys

| Old | New | Compatible read? |
|---|---|---|
| `tools/figma/tokens-para-figma.mjs` | `tools/figma/tokens-to-figma.mjs` | no (path) |
| `tools/figma/figma-para-tokens.mjs` | `tools/figma/figma-to-tokens.mjs` | no (path) |
| `tools/figma/normalizar-svg-path.cjs` | `tools/figma/normalize-svg-path.cjs` | no (path) |
| `tools/figma/preludio.js` | `tools/figma/prelude.js` | no (path) |
| exports `COLECOES`, `paraNomeFigma`, `paraCaminhoDtcg`, `hexParaRgba`, `converterValor`, `scopesPara`, `planejar`, `gerarScript` | `COLLECTIONS`, `toFigmaName`, `toDtcgPath`, `hexToRgba`, `convertValue`, `scopesFor`, `plan`, `generateScript` | no |
| exports `paraDtcg`, `comparar`, `aplicar` | `toDtcg`, `compare`, `apply` | no |
| plan `--json`: `colecoes{nome,modos}`, `variaveis[{colecao,nome,tipoDtcg,tipo,scopes,descricao,valores{valor}}]`, `naoSuportados`, `resumo` | `collections{name,modes}`, `variables[{collection,name,dtcg_type,type,scopes,description,values{value}}]`, `unsupported`, `summary` | no |
| return value of the generated script: `criadas`, `atualizadas`, `pendentes`, `colecoes` | `created`, `updated`, `pending`, `collections` | no |
| diff `--json`: `mudancas[{token,arquivo,modo,antes,depois,herdado}]`, `novos[{nome,colecao,valor,motivo}]`, `sugestoes[{sugestao}]`, `ausentesNoFigma` | `changes[{token,file,mode,before,after,inherited}]`, `added[{name,collection,value,reason}]`, `suggestions[{suggestion}]`, `missing_in_figma` | no |
| prelude CONFIGURE: `ID_FRAME_ICONES`, `PREFIXO_ICONE`, `ICONE_NATIVO`, `FAMILIA`, `PESOS`, `ESTILO{tituloSecao,cabecalhoTabela}`, `TK{fundoPagina,fundoSuperficie,textoPrimario,textoSecundario,textoCabecalhoTabela,textoSobreAcao,bordaCard,bordaDivisor,acaoPrimaria,acaoPerigo,sucesso,atencao,erro,info}`, `ICONE_TOM`, `LARGURA_TELA`, `ALTURA_APPBAR` | `ICON_FRAME_ID`, `ICON_PREFIX`, `ICON_NATIVE_SIZE`, `FONT_FAMILY`, `FONT_WEIGHTS`, `TEXT_STYLE{sectionTitle,tableHeader}`, `TK{pageBg,surfaceBg,textPrimary,textSecondary,textTableHeader,textOnAction,cardBorder,dividerBorder,actionPrimary,actionDanger,success,warning,danger,info}`, `TONE_ICON`, `SCREEN_WIDTH`, `APPBAR_HEIGHT` | no (the prelude is pasted into every script) |
| prelude helpers `umDe`, `fechar`, `TOM`, `TIPOS_BOTAO` | `oneOf`, `finish`, `TONE`, `BUTTON_TYPES` | no |
| `btn(…, 'primária' \| 'secundária' \| 'destrutiva' \| 'neutra')` | `btn(…, 'primary' \| 'secondary' \| 'destructive' \| 'neutral')` | yes (old values accepted; the frame name in Figma stays `Botão · primária`) |
| collection/mode names in Figma (`Primitivos`, `Semântico`, `Componente`, `Valor`, `Claro`, `Escuro`) | no change (text of the Figma file) | — |
| snapshot / baseline `variaveis`, `estilos`, `nos`, `oculto`, `modo: completo` | already were `variables`, `styles`, `nodes`, `hidden`, `mode: full` | yes (`diff-baseline.cjs`, already existed) |

#### Figma — registry, changelog and reference in the project

| Old | New | Compatible read? |
|---|---|---|
| `design/figma-sync.md`: `arquivo:`, `vez:`, `desde:` | `file:`, `turn:`, `since:` | yes (hook and skills read the old one and warn) |
| turn values `codigo`, `código`, `aplicando` | `code`, `applying` (`design` unchanged) | yes |
| `design/figma-changelog.jsonl`: `rodada`, `data`, `direcao`, `autor`, `resumo`, `framesCriados`, `framesAlterados`, `framesRemovidos`, `tokensAlterados`, `vezApos`, `achados` | `round`, `date`, `direction`, `author`, `summary`, `frames_created`, `frames_changed`, `frames_removed`, `tokens_changed`, `turn_after`, `findings` | yes (skills read old lines; the file is append-only, old lines are not rewritten) |
| `direcao` `codigo->figma` / `figma->codigo` | `direction` `code->figma` / `figma->code` | yes |
| `design/figma-achados/<rodada>.md` | `design/figma-findings/<rodada>.md` | no (path; the changelog's `findings` pointer says where it is) |
| `design/figma-reference.json`: `atualizadoEm`, `paginas`, `fundacao`, `colecoes`, `modos`, `variaveis`, `estilosTexto`, `icones{frameId,nomes}`, `chrome{drawerAberto,drawerRecolhido}`, `kitPrimitivosFrameId`, `frames[{origem,pagina}]` | `updatedAt`, `pages`, `foundation`, `collections`, `modes`, `variables`, `textStyles`, `icons{frameId,names}`, `chrome{drawerOpen,drawerCollapsed}`, `kitPrimitivesFrameId`, `frames[{source,page}]` | yes (read with a warning; rewritten on the next regeneration) |
| `.dsx/figma/ledger.json` | no change (already in English) | — |
| `figma-vez` argument: `codigo \| design \| aplicando` | `code \| design \| applying` | yes |
| `figma-cobertura` argument: `codigo→figma \| figma→codigo` | `code→figma \| figma→code` | not declared |

#### Hook

| Old | New | Compatible read? |
|---|---|---|
| `hooks/guarda-vez.py` | `hooks/turn-guard.py` (hooks.json updated) | — (the plugin points to the new one) |
| reads `vez:` (accepted the legacy `turn:`) | reads `turn:` (accepts the legacy `vez:` and the values `codigo`/`aplicando`, with a warning at SessionStart) | yes |
| message "feche-a (/dsx:figma-vez codigo)" | "/dsx:figma-vez code" | — |

#### Stitch

| Old | New | Compatible read? |
|---|---|---|
| `tools/stitch/analisar-html.mjs` | `tools/stitch/analyze-html.mjs` | no (path) |
| `design-system.mjs exportar` / `conferir` | `design-system.mjs export` / `check` | yes (alias with warning) |
| exports `FONTES_STITCH`, `MAPEAMENTO_MATERIAL`, `lerDesignMd`, `fonteStitch`, `raioStitch`, `exportar`, `lerListaStitch`, `conferir` | `STITCH_FONTS`, `MATERIAL_MAPPING`, `readDesignMd`, `stitchFont`, `stitchRadius`, `exportDesignMd`, `readStitchList`, `checkDesignSystem` | no |
| `analisar-html` export: `lerConfig`, `analisar(html, { papeisDsx })` | `readConfig`, `analyzeHtml(html, { dsxRoles })` | no |
| `check --json`: `problemas`, `avisos`, `preservadas`, `alteradas[{papel,dsx,stitch}]`, `ausentes`, `extras`, `mapeamento`, `semMapa` | `problems`, `warnings`, `preserved`, `changed[{role,dsx,stitch}]`, `missing`, `extras`, `mapping`, `unmapped` | no |
| `export` (JS return value): `texto`, `avisos`, `esperado` | `text`, `warnings`, `expected` | no |
| `analyze-html --json`: `falhas`, `temConfig`, `raio`, `cores{totalUsos,usosDsx,percentualDsx,papeis[{papel,usos,valor,origem,mapearPara}]}`, `contraste`, `arbitrarios`, `inline{exemplos}`, `a11y[{regra,ocorrencias,exemplo}]`; `origem: desconhecida` | `failures`, `has_config`, `radius`, `colors{total_uses,dsx_uses,dsx_percent,roles[{role,uses,value,source,map_to}]}`, `contrast`, `arbitrary`, `inline{examples}`, `a11y[{rule,occurrences,example}]`; `source: unknown` | no |
| `.stitch/conferencia.json`, `.stitch/conferencia-bruta.json`, `.stitch/revisoes/` | `.stitch/check.json`, `.stitch/check-raw.json`, `.stitch/reviews/` | yes (the skill reads the old one and warns) |
| `metadata.json` → `designSystem.conferido`, `status: conforme\|divergente` | `designSystem.checkedAt`, `status: compliant\|divergent` | yes |

#### Maps

| Old | New | Compatible read? |
|---|---|---|
| `.dsx/mapas/` | `.dsx/maps/` | yes (agents and skills read the legacy one and rewrite into the new one; the legacy `.claude/figma-claude/` is still accepted) |
| `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`, `design-system` (`.json`/`.md`) | `project-map`, `ui-map`, `flows`, `tasks`, `journey`, `domain`, `confirmations`, `design-system` | yes |
| JSON keys of the `mapear` maps | no change (they were already English: `screens`… stays with fork A in `flows-<module>`) | — |
| `mapear` modes: `projeto`, `completo` | `project`, `full` (`design-system` unchanged) | yes (accepted with a warning) |
| header of `design/as-is-to-be.md`: `validado`, `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes` | `validated`, `project-map`, `ui-map`, `flows`, `tasks`, `journey`, `domain`, `confirmations` | yes |

#### Evals

| Old | New | Compatible read? |
|---|---|---|
| `evals/casos/`, `evals/rubricas/` | `evals/cases/`, `evals/rubrics/` | no |
| `ui-gerada.jsonl` / `ui-gerada.yaml` / `feature-ia.yaml` | `generated-ui.jsonl` / `generated-ui.yaml` / `ai-feature.yaml` | no |
| rubric ids `ui-gerada`, `feature-ia` | `generated-ui`, `ai-feature` | no |
| rubric keys: `versao`, `tentativas_por_caso`, `aprovacao`, `criterios`, `avaliador`, `como`, `limiar`, `ancoras`, `metas`, `nota_maxima`, `faixas`, `ancoras_genericas`, `teste_de_aceitacao`, `descricao`, `tentativas`, `metricas_de_produto`, `como_medir`, `peso` | `version`, `attempts_per_case`, `approval`, `criteria`, `evaluator`, `how`, `threshold`, `anchors`, `goals`, `max_score`, `bands`, `generic_anchors`, `acceptance_test`, `description`, `attempts`, `product_metrics`, `how_to_measure`, `weight` | no |
| evaluator `codigo`, `juiz`, `humano` | `code`, `judge`, `human` | no |
| bands `robusto`, `utilizavel-com-lacunas`, `revisar-antes-de-usar`, `alto-risco` | `robust`, `usable-with-gaps`, `review-before-use`, `high-risk` | no |
| gates/criteria: `sem-valores-crus`, `contraste`, `nomes-acessiveis`, `foco-visivel`, `estados-obrigatorios`, `sem-dark-patterns`, `reuso-de-componentes`, `hierarquia-visual`, `padroes-de-interacao`, `texto`, `responsividade`, `rotulagem`, `confirmacao-por-risco`, `acoes-proibidas`, `recuperacao`, `intencao`, `progresso`, `incerteza-e-fontes`, `revisao-do-resultado`, `confianca-calibrada`, `fidelidade`, `contraste-essencial`, `conectado-ao-agente`, `sem-conflito`, `fidelidade-a-fonte`, `validade-tecnica`, `tokens-semanticos`, `intencao-e-prosa`, `componentes-e-estados`, `acessibilidade`, `operacao-com-agente`, `manutencao` | `no-raw-values`, `contrast`, `accessible-names`, `visible-focus`, `required-states`, `no-dark-patterns`, `component-reuse`, `visual-hierarchy`, `interaction-patterns`, `text`, `responsiveness`, `labeling`, `risk-based-confirmation`, `forbidden-actions`, `recovery`, `intent`, `progress`, `uncertainty-and-sources`, `output-review`, `calibrated-trust`, `fidelity`, `essential-contrast`, `connected-to-agent`, `no-conflict`, `source-fidelity`, `technical-validity`, `semantic-tokens`, `intent-and-prose`, `components-and-states`, `accessibility`, `agent-operation`, `maintenance` | no |
| JSONL cases: `tipo` (`tipico\|borda\|adversarial`), `pedido`, `esperado`, `verificar` | `type` (`typical\|edge\|adversarial`), `request`, `expected`, `verify` | no |
| output of the `juiz-de-evals` agent: `criterio`, `evidencias`, `nota`, `ancora`, `justificativa`, `confianca` (`alta\|media\|baixa`) | `criterion`, `evidence`, `score`, `anchor`, `rationale`, `confidence` (`high\|medium\|low`) | no |
| example in `knowledge/ia/evals.md`: `rubrica`, `escopo`, `entradas_do_avaliador`, `criterio`, `pergunta`, `aprovado_exemplo`, `reprovado_exemplo`, `regras_de_decisao`… | `rubric`, `scope`, `evaluator_inputs`, `criterion`, `question`, `pass_example`, `fail_example`, `decision_rules`… | — (example) |

### Convention round (snake_case in JSON, kebab-case in YAML, CLI aliases)

#### Knowledge, indexes and general tools

| Old | New | Compatible read? |
|---|---|---|
| front matter of `knowledge/**`: `titulo`, `evidencia`, `relacionados` | `title`, `evidence`, `related` | no (no tool reads it) |
| `area: ia` · `evidencia: contextual` · `evidencia: sinal` | `area: ai` · `evidence: contextual` · `evidence: signal` | no |
| `archetypes/index.json`: `primary-action` | `primary_action` (in the card's front matter it stays `primary-action`) | no |
| `contrast.mjs` (JSON output): `AA-texto`, `AA-texto-grande`, `AA-ui-nao-textual`, `AAA-texto`, `AAA-texto-grande` | `aa_text`, `aa_large_text`, `aa_non_text_ui`, `aaa_text`, `aaa_large_text` | no |
| `type-scale.mjs` (JSON output): `lineHeight`, `minPx`, `maxPx` | `line_height`, `min_px`, `max_px` | no |
| `references.mjs search` (internal): `curatedItem` | `curated_item` | no |
| `LEGACY_*` tables and `normalizeArgs` in `references.mjs` | `tools/lib/legacy-cli.mjs` (`LEGACY_CLI`, `normalizeArgv`, `parseCli`) | — |
| warning "… renomeie para X" of the CLI aliases | "… é nome antigo, use X (docs/renames-2026-10.md)" | — |

#### ux-lint — round 2 (snake_case convention in JSON and CLI aliases)

| Old | New | Compatible read? |
|---|---|---|
| `screen.mjs --json`: `screens[].dialogOpen` | `screens[].dialog_open` | yes (`findings.mjs` normalizes) |
| `screen.mjs --json`: `summary.screensWithFindings`, `summary.byRule`, `summary.bySeverity` | `summary.screens_with_findings`, `summary.by_rule`, `summary.by_severity` | yes (`findings.mjs` normalizes) |
| `flow.mjs --json`: `summary.byRule` | `summary.by_rule` | yes (`findings.mjs` normalizes) |
| `text.mjs --json`: `findings[].probableData`, `findings[].originalSeverity` | `probable_data`, `original_severity` | yes (`findings.mjs` normalizes) |
| `text.mjs --json`: `summary.probableData`, `summary.byRule[r].probableData`, `summary.inventoryByType`, `summary.byType`, `summary.byRule` | `summary.probable_data`, `summary.by_rule[r].probable_data`, `summary.inventory_by_type`, `summary.by_type`, `summary.by_rule` | yes (`findings.mjs` normalizes) |
| `text.mjs --json`: `screens[].inventory[].fromAriaLabel` | `from_aria_label` | yes (`findings.mjs` normalizes) |
| `findings.mjs status --json`: `byStatus`, `byFamily`, `byRule`, `bySeverity` | `by_status`, `by_family`, `by_rule`, `by_severity` | — (output) |
| old flags of ux-lint and of `lint-ux-md` (`--telas`, `--codigo`, `--ignorar`, `--falhar-em`, `--produto`, `--cor`, `--titulo`, `--arquetipos`) | `--screens`, `--code`, `--ignore`, `--fail-at`, `--product`, `--color`, `--title`, `--archetypes` | yes: alias with the warning "nome antigo, use --X" (before: exited with code 2) — table in `tools/lib/legacy-cli.mjs` |
| export `OLD_FLAGS` and `rejectOldFlags` in `tools/ux-lint/lib/legacy.mjs` | removed (replaced by `normalizeArgv`/`parseCli` from `tools/lib/legacy-cli.mjs`) | no |
| `parseTextArgs(argv)` | `parseTextArgs(argv, warn?)` (applies the aliases) | — |

#### Round 2 — key convention (Figma, Stitch, maps, evals)

| Old | New | Compatible read? |
|---|---|---|
| `design-system.mjs exportar` / `conferir`, `--papel` | `export` / `check`, `--role` | yes, alias with warning (`tools/lib/legacy-cli.mjs`) |
| `analyze-html.mjs --usos` | `--uses` | yes, alias with warning |
| `tokens-to-figma.mjs --colecao` | `--collection` | yes, alias with warning |
| maps `.dsx/maps/*.json`: `generatedAt` | `generated_at` | yes (agents and skills read camelCase with a warning) |
| `project-map.json`: `specsAndTests`, `designSystem{themeFile,iconPackage,foundationDoc}`, `figmaCycle`, `syncRegistry`, `baselineFiles` | `specs_and_tests`, `design_system{theme_file,icon_package,foundation_doc}`, `figma_cycle`, `sync_registry`, `baseline_files` | yes |
| `ui-map.json`: `subPages`, `navVisible`, `triggeredFrom`, `designSystem{themeFile,colorTokens,spacingScale,radiusScale}`, `componentKit`, `screensWithEmpty`, `screensWithLoading`, `screensWithError`, `screensMissingStates`, `formsLibrary` | `sub_pages`, `nav_visible`, `triggered_from`, `design_system{theme_file,color_tokens,spacing_scale,radius_scale}`, `component_kit`, `screens_with_empty`, `screens_with_loading`, `screens_with_error`, `screens_missing_states`, `forms_library` | yes |
| `flows.json`: `entryPoints`, `deadEnds`, `guardedRoutes` | `entry_points`, `dead_ends`, `guarded_routes` | yes |
| `tasks.json`: `errorHandling`, `confirmationRequired` | `error_handling`, `confirmation_required` | yes |
| `journey.json`: `outOfUiTouchpoints` | `out_of_ui_touchpoints` | yes |
| `domain.json`: `businessRules`, `apiSurface` | `business_rules`, `api_surface` | yes |
| `design-system.json`: `adaptersUsed`, `loadedVia`, `fontSizes`, `perThousandLines`, `suggestedToken`, typography `fontFamily`/`fontSize`/`fontWeight` | `adapters_used`, `loaded_via`, `font_sizes`, `per_thousand_lines`, `suggested_token`, `font_family`/`font_size`/`font_weight` | yes |
| `confirmations.json`: `confirmedAt`, `leftOpenAt`; `map` value `fluxos`/`dominio`… | `confirmed_at`, `left_open_at`; `flows`/`domain`… | yes |
| `.dsx/figma/ledger.json`: `runId`, `textStyles`, `pendingValidations`, `completedSteps` | `run_id`, `text_styles`, `pending_validations`, `completed_steps` | yes |
| `design/figma-reference.json`: `fileUrl`, `updatedAt`, `textStyles`, `frameId`, `drawerOpen`, `drawerCollapsed`, `kitPrimitivesFrameId` (`fileKey` stays, it is a Figma API name) | `file_url`, `updated_at`, `text_styles`, `frame_id`, `drawer_open`, `drawer_collapsed`, `kit_primitives_frame_id` | yes |
| Stitch `metadata.json`: `designSystem.checkedAt` (`designSystem` and `assetId` stay, they are Stitch API names) | `designSystem.checked_at` | yes |
| YAML rubrics: `attempts_per_case`, `how_to_measure`, `product_metrics`, `max_score`, `generic_anchors`, `acceptance_test` | `attempts-per-case`, `how-to-measure`, `product-metrics`, `max-score`, `generic-anchors`, `acceptance-test` | no |
| rubric example in `knowledge/ia/evals.md`: `evaluator_inputs` (and values `user_request`…), `pass_example`, `fail_example`, `decision_rules`, `output_passes`, `runs_per_case`, `judge_calibration` | `evaluator-inputs` (`user-request`…), `pass-example`, `fail-example`, `decision-rules`, `output-passes`, `runs-per-case`, `judge-calibration` | — (document) |

#### Round 3 — project paths and capture (2026-10-05)

Nothing in the DSX names a project's folders any more (`docs/project-paths.md`, `docs/decoupling-2026-10.md`).

| Old | New | Compatible read? |
|---|---|---|
| captures in `.stitch/<module>/code/` (fixed default) | `.dsx/captures/<module>/`, configurable (`paths.captures`) | yes: read when the new folder has no capture, with a warning |
| geometry in `.stitch/<module>/geometry/` | `.dsx/captures/<module>/geometry/` (`paths.geometry`) | yes: follows legacy captures |
| `--code` default `frontend/src` + `backend/shared` | folders detected from the stack; others in `paths.code` | — (projects with text outside the front end declare it) |
| `verification.selectors.primary`/`destructive` default `.MuiButton-*` | `verification.kit` profile (`auto` = union of mui, shadcn, chakra, antd, bootstrap + generic) | yes: `auto` keeps MUI detection; explicit selectors still win |
| project capture skill `code-to-stitch` (outside the DSX) | `skills/capture-from-code` + `templates/capture/` + `tools/capture/`, `tools/stitch/send.mjs`, `arrange-canvas.mjs`, `journeys.mjs` | — |
| capture guard `STITCH_CAPTURE=1` | `DSX_CAPTURE=1` | yes: the template honors both |
| real-name check hardcoded in the project's `send.sh` | project blocklist `capture.blocklist` / `capture.blocklist-file` in `.dsx/config.json` | — |
| default page accent `#0E71B8` | `#2B59C3` (dark `#7EA6F2`) | — (`--color` still overrides) |

## Round 4 — English (2026-10-05)

DSX 0.9.0. The whole DSX is now in English, like Forward: docs, knowledge, skills, agents, templates, patterns, archetypes, tool messages and code comments. **Exception:** text the end user of a product sees follows the project's language — the text detectors keep judging pt-BR by default and gain an `en` pack (`content.language` in `UX.md`), and pt-BR microcopy examples inside the knowledge stay, labeled "pt-BR example". No flag, subcommand, JSON/YAML key or data file changed name in this round, except the `*_pt` data keys (read as legacy).

**Why 0.9.0:** skill, agent, knowledge and template paths changed, and tool output literals (`ERRO` → `ERROR`…) changed, which breaks scripts that grep them. Everything that a project or an agent invokes by name keeps working through aliases:

- **Skills and agents:** every old name stays invocable as a minimal stub (`skills/<old>/SKILL.md`, `agents/<old>.md`, description "Deprecated alias of <new> — use <new>.") that sends to the new one; `tools/test/aliases.test.mjs` checks that every stub points to an existing skill or agent and that no stub points to another stub.
- **Knowledge and templates:** `knowledge/fundamentos/README.md` and `knowledge/pesquisa/README.md` keep the old → new table; `ia/` and `design-system/` list their former file names; old template files are stubs.
- **Docs:** `docs/principios.md`, `docs/integracoes.md` and `docs/fluxo-figma.md` are one-line notes pointing to the new file.

**How to migrate a project:** replace `/dsx:<old>` commands and `skills/<old>`/`agents/<old>` references with the new names (tables below), replace `knowledge/…` and `templates/…` paths, and update scripts or CI that grep tool output for `ERRO`, `AVISO`, `FALHA`, `QUEBRADO`, `APROVADO`/`REPROVADO`, `CONFORME`/`DIVERGENTE` or "renomeie para". Optionally declare `content.language` in `UX.md` (omitted = `pt-BR`).

### knowledge

Folders: `knowledge/fundamentos/` → `knowledge/foundations/` (merged with the existing folder), `knowledge/pesquisa/` → `knowledge/research/`; `knowledge/ia/` and `knowledge/design-system/` keep their names. Content translated to English; pt-BR microcopy examples stay, labeled "pt-BR example". `knowledge/fundamentos/README.md` and `knowledge/pesquisa/README.md` remain as old → new tables; `ia/README.md` and `design-system/README.md` end with "Former file names".

| Old | New | Compatible read? |
|---|---|---|
| `knowledge/fundamentos/README.md` | `knowledge/foundations/README.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/achados-de-ux.md` | `knowledge/foundations/ux-findings.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/arquitetura-da-informacao.md` | `knowledge/foundations/information-architecture.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/avaliacao-de-usabilidade.md` | `knowledge/foundations/usability-evaluation.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/dark-patterns.md` | `knowledge/foundations/dark-patterns.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/dimensoes-de-ux.md` | `knowledge/foundations/ux-dimensions.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/elementos-comparados.md` | `knowledge/foundations/compared-elements.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/fontes-de-ux.md` | `knowledge/foundations/ux-sources.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/formularios.md` | `knowledge/foundations/forms.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/heuristicas-nielsen.md` | `knowledge/foundations/nielsen-heuristics.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/hierarquia-visual.md` | `knowledge/foundations/visual-hierarchy.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/interacao-e-feedback.md` | `knowledge/foundations/interaction-and-feedback.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/marcas-de-texto-gerado.md` | `knowledge/foundations/generated-text-marks.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/psicologia-e-leis.md` | `knowledge/foundations/psychology-and-laws.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/tendencias.md` | `knowledge/foundations/trends.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/ux-md.md` | `knowledge/foundations/ux-md.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/ux-writing.md` | `knowledge/foundations/ux-writing.md` | old-path table in the README of the old folder |
| `knowledge/fundamentos/variacoes-de-ux.md` | `knowledge/foundations/ux-variations.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/README.md` | `knowledge/research/README.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/discovery-e-estrategia.md` | `knowledge/research/discovery-and-strategy.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/etica-e-inclusao.md` | `knowledge/research/ethics-and-inclusion.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/metodos.md` | `knowledge/research/methods.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/metricas-e-roi.md` | `knowledge/research/metrics-and-roi.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/personas-jornadas-blueprint.md` | `knowledge/research/personas-journeys-blueprint.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/sintese-e-comunicacao.md` | `knowledge/research/synthesis-and-communication.md` | old-path table in the README of the old folder |
| `knowledge/pesquisa/testes-de-usabilidade.md` | `knowledge/research/usability-testing.md` | old-path table in the README of the old folder |
| `knowledge/ia/conteudo-sintetico.md` | `knowledge/ia/synthetic-content.md` | listed in "Former file names" of the folder README |
| `knowledge/ia/divida-de-experiencia.md` | `knowledge/ia/experience-debt.md` | listed in "Former file names" of the folder README |
| `knowledge/ia/evidencia-e-fontes.md` | `knowledge/ia/evidence-and-sources.md` | listed in "Former file names" of the folder README |
| `knowledge/ia/pesquisa-com-ia.md` | `knowledge/ia/research-with-ai.md` | listed in "Former file names" of the folder README |
| `knowledge/ia/rag-e-fontes.md` | `knowledge/ia/rag-and-sources.md` | listed in "Former file names" of the folder README |
| `knowledge/ia/ux-para-agentes.md` | `knowledge/ia/ux-for-agents.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/acessibilidade.md` | `knowledge/design-system/accessibility.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/componentes.md` | `knowledge/design-system/components.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/cor.md` | `knowledge/design-system/color.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/design-system-para-ia.md` | `knowledge/design-system/design-system-for-ai.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/escolher-design-system.md` | `knowledge/design-system/choosing-a-design-system.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/espacamento-e-layout.md` | `knowledge/design-system/spacing-and-layout.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/governanca-e-maturidade.md` | `knowledge/design-system/governance-and-maturity.md` | listed in "Former file names" of the folder README |
| `knowledge/design-system/tipografia.md` | `knowledge/design-system/typography.md` | listed in "Former file names" of the folder README |
| front matter `id`/`related` in `knowledge/ia/*.md` (`ux-para-agentes`, `rag-e-fontes`, `divida-de-experiencia`, `evidencia-e-fontes`, `pesquisa-com-ia`, `conteudo-sintetico`) | same as the new file name (`ux-for-agents`, `rag-and-sources`, `experience-debt`, `evidence-and-sources`, `research-with-ai`, `synthetic-content`) | no (no tool reads them) |
| evidence tags `[evidência: alta/contextual/sinal/hipótese]` in `knowledge/ia/` | `[evidence: high/contextual/signal/hypothesis]` | — (document) |
| `data/ux-dimensions.json` (0.6.0 → 0.7.0): `name_pt`, `question_pt`, `gaps_pt`, `summary_pt`; values translated; `laws_index.*.aliases` added with the former pt-BR law names | `name`, `question`, `gaps`, `summary` | readers in `tools/` accept the old keys (E3) |
| `data/gap-analysis/*.json`: `source_rule_pt`, `proposal_pt`, `summary_pt`; values translated | `source_rule`, `proposal`, `summary` | readers in `tools/` accept the old keys (E3) |

### tools/patterns

Patterns, archetypes, templates and examples are in English; tool messages and code comments are in English. No flag, subcommand, JSON/YAML key or data file changed name. Text the end user of a product sees is judged in the product's language (`content.language`).

| Old | New | Compatible read? |
|---|---|---|
| `templates/padrao.md` | `templates/pattern.md` | yes: the old file is a stub pointing to the new one |
| `templates/componente.md` | `templates/component.md` | yes: stub |
| `templates/relatorio-de-achados.md` | `templates/findings-report.md` | yes: stub |
| `templates/relatorio-heuristico.md` | `templates/heuristic-report.md` | yes: stub |
| `templates/roteiro-entrevista.md` | `templates/interview-guide.md` | yes: stub |
| `templates/plano-de-pesquisa.md` | `templates/research-plan.md` | yes: stub |
| `templates/roteiro-teste-usabilidade.md` | `templates/usability-test-script.md` | yes: stub |
| pattern card sections `Contexto`, `Decisão`, `Quando usar`, `Quando evitar`, `Faça`, `Evite`, `Acessibilidade`, `Microcópia`, `Checklist de verificação`, `Fundamentação`; line `> **Regra:**`; `SE/ENTÃO/SENÃO`; `→ **use em vez disso:**` | `Context`, `Decision`, `When to use`, `When to avoid`, `Do`, `Avoid`, `Accessibility`, `Microcopy`, `Verification checklist`, `Rationale`; `> **Rule:**`; `IF/THEN/ELSE`; `→ **use instead:**` | yes: `lint-patterns` accepts either set per card |
| archetype sections `Quando usar`, `Mapa de regiões`, `O que vai em cada região`, `Ações`, `Estados`, `Variações`, `Anti-padrões`, `Checklist`; `SE … ENTÃO`; `**Favorece:**`/`**Piora:**` | `When to use`, `Region map`, `What goes in each region`, `Actions`, `States`, `Variations`, `Anti-patterns`, `Checklist`; `IF … THEN`; `**Favors:**`/`**Worsens:**` | yes: `lint-archetypes` and `section()` accept either |
| UX.md body sections, canonical in pt-BR (`Visão geral` … `Instruções para agentes`) | canonical in English (`Overview`, `Personas & Tasks`, `Information Architecture`, `Navigation`, `Screen Archetypes`, `Layout & Regions`, `Actions`, `Feedback & States`, `Forms`, `Content & Microcopy`, `Flows`, `Do's and Don'ts`, `Agent Instructions`) | yes: pt-BR titles stay accepted aliases |
| — | UX.md `content.language: pt-BR \| en` (new, optional) | omitted = `pt-BR`, so detector results do not change |
| text detector vocabulary hardcoded in `text.mjs`, `states.mjs`, `consistency.mjs`, `screen.mjs`, `geometry.mjs` | language packs `tools/ux-lint/lib/lang/{pt-BR,en}.mjs` (`index.mjs`: `langPack`, `resolveLang`, `unionList`) | yes: pt-BR pack reproduces the old lists |
| tool output literals `ERRO`, `AVISO`, `FALHA`, `QUEBRADO`, `APROVADO`/`REPROVADO`, `CONFORME`/`DIVERGENTE`, "nome antigo, renomeie para X" | `ERROR`, `WARNING`, `FAIL`, `BROKEN`, `PASSED`/`FAILED`, `CONFORMS`/`DIVERGES`, `old name "X", rename to "Y"` / "`--x` is an old name, use `--y`" | — (messages; scripts that grep them must update) |
| detector messages and region labels in pt-BR (`'(tela)'`, `'diálogo'`, `'(principal)'`) | English (`'(screen)'`, `'dialog'`, `'(main)'`) | yes: geometry reads `diálogo`; `findings.mjs register` relinks a finding whose id changed only because its message or region was reworded |
| `--json` keys `name_pt`, `band_pt`, `gaps_pt` (lint-ux-md `--score`, audit) | `name`, `band_name`, `gaps` (same value; the `_pt` keys stay as aliases) | yes |
| findings/variations/text pages always in pt-BR | `--lang en\|pt-BR` (default `en`; `pt`, `en-US` normalized) on `findings.mjs page`, `text-page.mjs`, `audit.mjs --page`, `preview.mjs`, `variations.mjs page` | yes: `--lang pt-BR` reproduces the former page |
| `variations.mjs decide` default `by: "dono"` | `by: "owner"` | yes: both read as "not given" |
| readers of `data/*.json` `*_pt` keys | `tools/lib/data-text.mjs` `dataText(obj, key)` (new key first, then `<key>_pt`) | yes |

### skills and agents

Folders and files renamed with `git mv` (history preserved), `name:` updated and content translated; the old name is a deprecated alias stub (see above). Unchanged: `capture-from-code`, `design-md`, `discovery`, `evals`, `figma-diff`, `stitch`, `tokens`, `ux-ia`, `ux-md`, `ux-writing`.

| Old | New | Compatible read? |
|---|---|---|
| `skills/acessibilidade/` | `skills/accessibility/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/arranjar-tela/` | `skills/arrange-screen/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/auditar-ds/` | `skills/audit-ds/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/auditar-ux/` | `skills/audit-ux/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/confirmar-mapas/` | `skills/confirm-maps/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/construir-ui/` | `skills/build-ui/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/escolher-ds/` | `skills/choose-ds/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-ciclo/` | `skills/figma-cycle/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-cobertura/` | `skills/figma-coverage/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-convencoes/` | `skills/figma-conventions/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-espelhar/` | `skills/figma-mirror/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-fundacoes/` | `skills/figma-foundations/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-iniciar/` | `skills/figma-init/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-levar/` | `skills/figma-push/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-primeiro/` | `skills/figma-first/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-propostas/` | `skills/figma-proposals/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-trazer/` | `skills/figma-pull/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/figma-vez/` | `skills/figma-turn/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/iniciar/` | `skills/init/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/mapear/` | `skills/map-ux/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/padroes/` | `skills/patterns/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/pesquisa/` | `skills/research/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/repensar-ux/` | `skills/rethink-ux/` | yes: deprecated alias stub; `/dsx:<old>` still runs |
| `skills/revisar-ux/` | `skills/review-ux/` | yes: deprecated alias stub; `/dsx:<old>` still runs |

| Old | New | Compatible read? |
|---|---|---|
| `agents/analisador-specs.md` | `agents/spec-analyzer.md` | yes: deprecated alias stub |
| `agents/extrator-design-system.md` | `agents/design-system-extractor.md` | yes: deprecated alias stub |
| `agents/juiz-de-evals.md` | `agents/eval-judge.md` | yes: deprecated alias stub |
| `agents/leitor-figma.md` | `agents/figma-reader.md` | yes: deprecated alias stub |
| `agents/mapeador-dominio.md` | `agents/domain-mapper.md` | yes: deprecated alias stub |
| `agents/mapeador-fluxos.md` | `agents/flow-mapper.md` | yes: deprecated alias stub |
| `agents/mapeador-jornada.md` | `agents/journey-mapper.md` | yes: deprecated alias stub |
| `agents/mapeador-projeto.md` | `agents/project-mapper.md` | yes: deprecated alias stub |
| `agents/mapeador-tarefas.md` | `agents/task-mapper.md` | yes: deprecated alias stub |
| `agents/mapeador-ui.md` | `agents/ui-mapper.md` | yes: deprecated alias stub |
| `agents/revisor-ux.md` | `agents/ux-reviewer.md` | yes: deprecated alias stub |

Skill arguments: `figma-mirror` and `figma-push` take `essential|complete` (old `essencial|completa` still accepted); `map-ux` keeps reading `projeto`/`completo`; `figma-turn` keeps reading `codigo`/`aplicando`.

### docs, hooks, tokens and evals

| Old | New | Compatible read? |
|---|---|---|
| `docs/principios.md` | `docs/principles.md` | yes: the old file is a pointer note |
| `docs/integracoes.md` | `docs/integrations.md` | yes: pointer note |
| `docs/fluxo-figma.md` | `docs/figma-flow.md` | yes: pointer note |
| `design/figma-sync.md` sections `## Rodadas`, `## Pendentes`, `## Propostas abertas`, `## Aplicadas na última rodada`, `## Recusadas`, `## Divergências conhecidas` | `## Rounds`, `## Pending`, `## Open proposals`, `## Applied in the last round`, `## Rejected`, `## Known divergences` | yes: the figma-* skills read the old headings and rewrite them in English |
| `hooks/turn-guard.py` messages ("vez do DESIGN", "nome antigo, renomeie para `turn:`", "Bloqueado pelo ciclo…") and `hooks.json` description | English ("DESIGN's turn", "old name, rename to `turn:`", "Blocked by the DSX Figma↔code cycle…") | — (messages; `turn:`/`vez:` and legacy values are read as before) |
| `tokens/contrast-pairs.json` `use` values (`texto principal`…) and `$description` of the token files | English (`primary text`…) | — (descriptions only; keys and values unchanged, `tokens/build/` regenerated) |
| `evals/rubrics/*.yaml` and `evals/cases/generated-ui.jsonl` text (questions, anchors, prompts) | English; ids, keys and weights unchanged | — |
| Stitch `metadata.json` `designSystem.status` `conforme\|divergente` | `compliant\|divergent` | yes: the `stitch` skill reads the old values |
| `data/pipeline-quality.json` `dsx_tools` "skill acessibilidade", "skill auditar-ds" | "skill accessibility", "skill audit-ds" | — |
| `README.md`, `AGENTS.md`, `CLAUDE.md`, `.claude-plugin/*` descriptions | English; the naming rule is now "everything in English except product-facing text" | — |
