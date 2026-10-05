# Renomeação para inglês (DSX 0.5.0, 2026-10)

> **Quando consultar**
> - Ao atualizar um projeto que usa o DSX de uma versão ≤ 0.4.0 para 0.5.0.
> - Ao ver o aviso "nome antigo, renomeie para X" de uma ferramenta ou skill.
> - Ao procurar o nome novo de um arquivo, comando, flag, chave ou id que mudou.

## A regra

- **Código e dados em inglês:** nomes de arquivos e pastas de ferramentas, scripts e dados; subcomandos e flags de CLI; chaves e valores de JSON/YAML (inclusive o front matter de padrões, arquétipos e do `UX.md`); ids (padrões, arquétipos, regiões, estados, variações); mapas em `.dsx/maps/` e suas chaves; títulos de testes; identificadores no código.
- **Documento para pessoas em português:** nome e conteúdo de `knowledge/**` (o front matter desses documentos é dado e fica em inglês), `templates/**`, skills (pasta e texto), agentes (nome e texto), mensagens impressas pelas ferramentas, texto de interface e títulos de seção do corpo dos `.md` (as 13 seções do `UX.md` e as do `DESIGN.md` em pt-BR continuam aceitas).
- **Forma das chaves:** `snake_case` em todo JSON e JSONL (saídas `--json`, mapas, índices, registros, changelog); `kebab-case` em YAML (front matter de `UX.md`, arquétipos, padrões e `knowledge/`, rubricas de eval). **Exceção única:** nomes que espelham uma API ou formato externo ficam como no original — campos da API do Figma (`fileKey` em `design/figma-reference.json`, `modeId`, `valuesByMode`… no snapshot e nos scripts `use_figma`), da API do Stitch (`designSystem`, `displayName`, `headlineFont`…), W3C DTCG (`$type`, `lineHeight` de tipografia), front matter do `DESIGN.md` (formato do Google: `fontSize`, `lineHeight`) e `hooks.json` do Claude Code (`PreToolUse`).
- **Transição:** o que a ferramenta **lê** de um projeto aceita também o nome antigo, com aviso "nome antigo, renomeie para X"; o que ela **escreve** usa só o nome novo. Subcomandos e flags antigos de todas as ferramentas continuam como apelidos com aviso "nome antigo, use X" (tabela única: `tools/lib/legacy-cli.mjs`). A leitura compatível existe para dar tempo de migrar; não conte com ela em versões futuras.

## Por que a versão é 0.5.0

Renomear quebra quem chama os nomes antigos. O DSX ainda está em 0.x, então a mudança que quebra sobe o segundo número (0.4.0 → 0.5.0).

## O que continua funcionando (leitura compatível)

- **`UX.md`** (lido por `lint-ux-md`, `screen.mjs`, `text.mjs`, `flow.mjs`): chaves e valores antigos do front matter, ids antigos de arquétipo e de estado, e o caminho `arquetipos/<id>.md` no corpo. Convertidos com aviso; tabela única em `tools/ux-lint/lib/legacy.mjs`.
- **`version: alpha` no `UX.md`** (DSX 0.7): até a 0.6 era a versão do formato; agora `version` é a versão do documento em semver e o formato vai em `format: alpha`. O `lint-ux-md` aceita `alpha` com aviso e a nota (`--score`) não dá os pontos de versão até a troca.
- **Mapa de fluxo `flows-<module>.json`** no formato antigo (`telas`, `transicoes`, `de`/`para`, `gatilho`, `jornadas`, tipo `dialogo`), em qualquer caminho, inclusive `.dsx/mapas/fluxos-<modulo>.json`.
- **`cases.json`** no formato antigo, em `text-page.mjs` e `findings.mjs options`; saída `--json` antiga dos verificadores em `findings.mjs register`/`check` (sem aviso).
- **Mapas em `.dsx/mapas/`** com os nomes em português (e o legado `.claude/figma-claude/`): agentes e skills leem e regravam em `.dsx/maps/`.
- **`design/figma-sync.md`**: `vez:` (valores `codigo`, `código`, `aplicando`), `arquivo:`, `desde:` — lidos com aviso pelo hook `turn-guard` e pelas skills figma-*. Linhas antigas do `design/figma-changelog.jsonl` e chaves antigas do `design/figma-reference.json` também são lidas.
- **Stitch:** `.stitch/conferencia*.json`, `.stitch/revisoes/` e `metadata.json` antigos são lidos pelas skills.
- **Argumentos de skill:** `figma-vez` aceita `codigo`/`aplicando`; `mapear` aceita os modos `projeto`/`completo`.
- **Subcomandos, flags e valores antigos de CLI**, em todas as ferramentas que os tinham (tabela única `tools/lib/legacy-cli.mjs`): `references.mjs` (`indice`, `buscar`, `baixar`, `avaliar`, `curar`; `--registro`, `--uso`, `--tema`, `--curados`; `operacional`, `claro`…), `design-system.mjs` (`exportar`, `conferir`, `--papel`), `analyze-html.mjs` (`--usos`), `tokens-to-figma.mjs` (`--colecao`), `text.mjs` (`--telas`, `--codigo`, `--ignorar`), `screen.mjs` e `flow.mjs` (`--falhar-em`), `text-page.mjs` (`--produto`, `--cor`, `--titulo`), `lint-ux-md.mjs` (`--arquetipos`). Rodam o nome novo e avisam "nome antigo, use X".
- **`tokens/contrast-pairs.json`** com a chave `uso` (`build-tokens` avisa; `contrast.mjs` e `figma-to-tokens` aceitam).
- **`btn()` do prelúdio do Figma** aceita os tipos `primária|secundária|destrutiva|neutra`.
- **Chaves camelCase da versão de trabalho anterior a esta** (ex.: `probableData`, `byRule`, `generatedAt` nos mapas): lidas pelas ferramentas e skills que leem esses arquivos.

## O que quebra (sem leitura compatível)

- **Caminhos de ferramentas** (tabela "Arquivos"; subcomandos e flags antigos seguem como apelidos, mas o caminho do script mudou): `tools/ux-lint/texto|tela|fluxo.mjs`, `tools/lint-arquetipos.mjs`, `tools/referencias.mjs`, `tools/figma/*-para-*`, `preludio.js`, `normalizar-svg-path.cjs`, `tools/stitch/analisar-html.mjs`, `hooks/guarda-vez.py`, `npm run lint:arquetipos`.
- **Chaves do JSON emitido** por todas as ferramentas (ux-lint, figma, stitch, `lint-design-md --json`, `lint-raw-values --json`, `palette`, `contrast`, `type-scale`, `references.mjs evaluate`), agora em inglês e `snake_case`, e funções exportadas em JS.
- **Catálogos do DSX:** ids e caminhos de padrões e arquétipos; front matter de padrões e arquétipos; chaves de `patterns/index.json`, `archetypes/index.json`, `references/design-md/index.json` e `curated.json`.
- **Prelúdio do Figma já colado e preenchido** (chave `TK` e constantes do bloco CONFIGURE): refaça a partir de `tools/figma/prelude.js`.
- **Rubricas e casos de eval:** caminhos, ids e chaves.
- **Pasta de achados do Figma** `design/figma-achados/` → `design/figma-findings/` (as skills escrevem no caminho novo).
- **Ids de padrão em documentos do projeto** (ex.: um `UX.md` que cita `patterns/acoes/desfazer.md` no corpo): troque pela tabela "Ids e arquivos dos 77 padrões".

## Como migrar um projeto

1. Renomeie `.dsx/mapas/` para `.dsx/maps/` e os arquivos de mapa (tabela "Mapas no projeto"), ou rode `/dsx:mapear` de novo — ele grava no caminho novo.
2. No `UX.md`, troque as chaves e valores do front matter pela tabela "UX.md"; `node <DSX>/tools/lint-ux-md.mjs UX.md` lista cada nome antigo que ainda resta.
3. Em `design/figma-sync.md`, troque `vez:` por `turn:` e os valores (`codigo` → `code`, `aplicando` → `applying`); nas linhas novas do `design/figma-changelog.jsonl`, use as chaves em inglês.
4. Atualize scripts, CI e documentos do projeto que chamam ferramentas do DSX pelos caminhos, subcomandos e flags antigos (tabelas "Arquivos" e das ferramentas).
5. Rode as ferramentas e zere os avisos "nome antigo".

## Tabelas antigo → novo

### Caminhos e arquivos (DSX)

#### Pastas

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `arquetipos/` | `archetypes/` | não |
| `referencias/` | `references/` | não |
| `evals/casos/` | `evals/cases/` | não |
| `evals/rubricas/` | `evals/rubrics/` | não |
| `referencias/design-md/designmd-app/*.md` | `references/design-md/designmd-app/*.md (conteúdo inalterado)` | não |

#### Arquivos

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `arquetipos/index.json` | `archetypes/index.json` | não |
| `referencias/design-md/curados.json` | `references/design-md/curated.json` | não |
| `referencias/design-md/indice.json` | `references/design-md/index.json` | não |
| `tools/referencias.mjs` | `tools/references.mjs` | não |
| `tools/lint-arquetipos.mjs` | `tools/lint-archetypes.mjs` | não |
| `tools/ux-lint/texto.mjs` | `tools/ux-lint/text.mjs` | não |
| `tools/ux-lint/tela.mjs` | `tools/ux-lint/screen.mjs` | não |
| `tools/ux-lint/fluxo.mjs` | `tools/ux-lint/flow.mjs` | não |
| `tools/figma/figma-para-tokens.mjs` | `tools/figma/figma-to-tokens.mjs` | não |
| `tools/figma/tokens-para-figma.mjs` | `tools/figma/tokens-to-figma.mjs` | não |
| `tools/figma/normalizar-svg-path.cjs` | `tools/figma/normalize-svg-path.cjs` | não |
| `tools/figma/preludio.js` | `tools/figma/prelude.js` | não |
| `tools/stitch/analisar-html.mjs` | `tools/stitch/analyze-html.mjs` | não |
| `hooks/guarda-vez.py` | `hooks/turn-guard.py` | não |
| `evals/casos/ui-gerada.jsonl` | `evals/cases/generated-ui.jsonl` | não |
| `evals/rubricas/ui-gerada.yaml` | `evals/rubrics/generated-ui.yaml` | não |
| `evals/rubricas/feature-ia.yaml` | `evals/rubrics/ai-feature.yaml` | não |
| `evals/rubricas/design-md.yaml` | `evals/rubrics/design-md.yaml` | não |
| `tools/test/arquetipos.test.mjs` | `tools/test/archetypes.test.mjs` | não |
| `tools/test/referencias.test.mjs` | `tools/test/references.test.mjs` | não |
| `tools/test/figma-ponte.test.mjs` | `tools/test/figma-bridge.test.mjs` | não |
| `tools/test/ux-lint-texto.test.mjs` | `tools/test/ux-lint-text.test.mjs` | não |

#### Mapas no projeto (`.dsx/`)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `.dsx/mapas/` | `.dsx/maps/` | sim (agentes e skills leem o legado e regravam no novo) |
| `mapa-projeto.{md,json}` | `project-map.{md,json}` | sim |
| `mapa-ui.{md,json}` | `ui-map.{md,json}` | sim |
| `fluxos.{md,json}` | `flows.{md,json}` | sim |
| `fluxos-<modulo>.json` | `flows-<module>.json` | sim (ux-lint flow.mjs aceita qualquer caminho e o formato antigo) |
| `tarefas.{md,json}` | `tasks.{md,json}` | sim |
| `jornada.{md,json}` | `journey.{md,json}` | sim |
| `dominio.{md,json}` | `domain.{md,json}` | sim |
| `confirmacoes.json` | `confirmations.json` | sim |
| `design/figma-achados/<rodada>.md` | `design/figma-findings/<rodada>.md` | sim (skills figma-*) |

#### Scripts do package.json

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `npm run lint:arquetipos` | `npm run lint:archetypes` | não |

### Padrões (`patterns/`)

#### Categorias (pastas)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `acessibilidade` | `accessibility` | não |
| `acoes` | `actions` | não |
| `autenticacao` | `authentication` | não |
| `busca-filtros` | `search-filters` | não |
| `conteudo` | `content` | não |
| `dados` | `data` | não |
| `formularios` | `forms` | não |
| `ia` | `ai` | não |
| `modais` | `modals` | não |
| `navegacao` | `navigation` | não |

#### Ids e arquivos dos 77 padrões

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `acessibilidade/alvo-de-toque.md` | `accessibility/touch-target.md` | não |
| `acessibilidade/foco-de-teclado.md` | `accessibility/keyboard-focus.md` | não |
| `acessibilidade/nao-so-cor.md` | `accessibility/not-color-alone.md` | não |
| `acoes/acao-destrutiva.md` | `actions/destructive-action.md` | não |
| `acoes/botao-desabilitado.md` | `actions/disabled-button.md` | não |
| `acoes/botao-flutuante.md` | `actions/floating-action-button.md` | não |
| `acoes/botao-icone-e-texto.md` | `actions/icon-and-text-button.md` | não |
| `acoes/clique-duplo-em-envio.md` | `actions/double-submit.md` | não |
| `acoes/confirmar-acao.md` | `actions/confirm-action.md` | não |
| `acoes/confirmar-exclusao.md` | `actions/confirm-deletion.md` | não |
| `acoes/desfazer.md` | `actions/undo.md` | não |
| `acoes/hierarquia-de-botoes.md` | `actions/button-hierarchy.md` | não |
| `acoes/icone-sem-texto.md` | `actions/icon-only-button.md` | não |
| `acoes/link-vs-botao.md` | `actions/link-vs-button.md` | não |
| `acoes/posicao-de-acoes.md` | `actions/action-placement.md` | não |
| `autenticacao/confirmar-senha.md` | `authentication/confirm-password.md` | não |
| `autenticacao/mostrar-senha.md` | `authentication/show-password.md` | não |
| `autenticacao/recuperar-senha.md` | `authentication/password-recovery.md` | não |
| `autenticacao/requisitos-de-senha.md` | `authentication/password-requirements.md` | não |
| `autenticacao/sessao-expirada.md` | `authentication/session-expired.md` | não |
| `busca-filtros/aplicacao-de-filtros.md` | `search-filters/applying-filters.md` | não |
| `busca-filtros/busca-sem-resultados.md` | `search-filters/no-search-results.md` | não |
| `busca-filtros/estrutura-de-filtros.md` | `search-filters/filter-structure.md` | não |
| `busca-filtros/filtros-ativos.md` | `search-filters/active-filters.md` | não |
| `conteudo/carrossel-automatico.md` | `content/auto-advancing-carousel.md` | não |
| `conteudo/carrossel.md` | `content/carousel.md` | não |
| `dados/filtro-de-periodo.md` | `data/date-range-filter.md` | não |
| `dados/ordenacao-de-tabela.md` | `data/table-sorting.md` | não |
| `dados/paginacao-de-tabela.md` | `data/table-pagination.md` | não |
| `dados/tabela-responsiva.md` | `data/responsive-table.md` | não |
| `dados/tabela-vs-cards.md` | `data/table-vs-cards.md` | não |
| `ecommerce/carrinho-editar-itens.md` | `ecommerce/cart-edit-items.md` | não |
| `ecommerce/checkout-convidado.md` | `ecommerce/guest-checkout.md` | não |
| `ecommerce/endereco-por-cep.md` | `ecommerce/address-by-postal-code.md` | não |
| `ecommerce/variacoes-de-produto.md` | `ecommerce/product-variants.md` | não |
| `feedback/carregamento-longo.md` | `feedback/long-loading.md` | não |
| `feedback/codigo-de-erro-tecnico.md` | `feedback/technical-error-code.md` | não |
| `feedback/confirmacao-de-sucesso.md` | `feedback/success-confirmation.md` | não |
| `feedback/duracao-de-toast.md` | `feedback/toast-duration.md` | não |
| `feedback/estado-vazio.md` | `feedback/empty-state.md` | não |
| `feedback/falha-temporaria.md` | `feedback/temporary-failure.md` | não |
| `feedback/porcentagem-de-progresso.md` | `feedback/progress-percentage.md` | não |
| `feedback/skeleton-screen.md` | `feedback/skeleton-screen.md` | não |
| `feedback/skeleton-vs-spinner.md` | `feedback/skeleton-vs-spinner.md` | não |
| `feedback/tentar-novamente.md` | `feedback/retry.md` | não |
| `feedback/toast-alerta-inline.md` | `feedback/toast-vs-inline-alert.md` | não |
| `formularios/autopreenchimento.md` | `forms/autofill.md` | não |
| `formularios/autosave-vs-salvar.md` | `forms/autosave-vs-save.md` | não |
| `formularios/campos-obrigatorios.md` | `forms/required-fields.md` | não |
| `formularios/dividir-formulario.md` | `forms/split-form.md` | não |
| `formularios/dropdown.md` | `forms/dropdown.md` | não |
| `formularios/erros-em-formularios.md` | `forms/form-errors.md` | não |
| `formularios/etapas-de-formulario.md` | `forms/form-steps.md` | não |
| `formularios/label-vs-placeholder.md` | `forms/label-vs-placeholder.md` | não |
| `formularios/momento-da-validacao.md` | `forms/validation-timing.md` | não |
| `formularios/onde-exibir-erros.md` | `forms/error-placement.md` | não |
| `formularios/ordem-dos-campos.md` | `forms/field-order.md` | não |
| `formularios/posicao-do-erro-no-campo.md` | `forms/field-error-position.md` | não |
| `formularios/preservar-dados-apos-erro.md` | `forms/preserve-data-after-error.md` | não |
| `formularios/upload-de-arquivos.md` | `forms/file-upload.md` | não |
| `ia/confirmar-acao-da-ia.md` | `ai/confirm-ai-action.md` | não |
| `ia/fontes-da-ia.md` | `ai/ai-sources.md` | não |
| `ia/incerteza-da-ia.md` | `ai/ai-uncertainty.md` | não |
| `ia/recuperar-erro-da-ia.md` | `ai/ai-error-recovery.md` | não |
| `ia/revisar-resultado-da-ia.md` | `ai/review-ai-output.md` | não |
| `ia/rotular-conteudo-ia.md` | `ai/label-ai-content.md` | não |
| `modais/fechar-modal.md` | `modals/close-modal.md` | não |
| `modais/quando-evitar-modal.md` | `modals/when-to-avoid-modal.md` | não |
| `modais/quando-usar-modal.md` | `modals/when-to-use-modal.md` | não |
| `navegacao/abas.md` | `navigation/tabs.md` | não |
| `navegacao/breadcrumbs.md` | `navigation/breadcrumbs.md` | não |
| `navegacao/link-em-nova-aba.md` | `navigation/link-in-new-tab.md` | não |
| `navegacao/navegacao-principal.md` | `navigation/main-navigation.md` | não |
| `navegacao/paginacao-vs-scroll.md` | `navigation/pagination-vs-scroll.md` | não |
| `ux-writing/mensagem-de-erro-util.md` | `ux-writing/helpful-error-message.md` | não |
| `ux-writing/texto-de-botao.md` | `ux-writing/button-text.md` | não |
| `ux-writing/texto-de-link.md` | `ux-writing/link-text.md` | não |

#### Front matter: chaves

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `titulo` | `title` | não |
| `categoria` | `category` | não |
| `componentes` | `components` | não |
| `tipo` | `type` | não |
| `impacto` | `impact` | não |
| `evidencia` | `evidence` | não |
| `relacionados` | `related` | não |
| `regra` | `rule` | não |
| `arquivo` | `file` | não |

#### Front matter: valores de `type`

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `recomendacao` | `recommendation` | não |
| `antipadrao` | `anti-pattern` | não |
| `decisao-contextual` | `contextual-decision` | não |
| `acessibilidade` | `accessibility` | não |

#### Front matter: valores de `impact`

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `critico` | `critical` | não |
| `alto` | `high` | não |
| `medio` | `medium` | não |
| `baixo` | `low` | não |

#### Front matter: valores de `status`

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `recomendado` | `recommended` | não |
| `usar-com-cautela` | `caution` | não |
| `evitar` | `avoid` | não |

#### Front matter: valores de `evidence`

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `forte` | `strong` | não |
| `moderada` | `moderate` | não |
| `fraca` | `weak` | não |
| `emergente` | `emerging` | não |

#### Front matter: valores de `components`

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `abas` | `tabs` | não |
| `alerta` | `alert` | não |
| `alerta-global` | `global-alert` | não |
| `area-de-arrastar-e-soltar` | `drop-zone` | não |
| `aviso` | `notice` | não |
| `barra-de-progresso` | `progress-bar` | não |
| `botao` | `button` | não |
| `botao-aplicar` | `apply-button` | não |
| `botao-carregar-mais` | `load-more-button` | não |
| `botao-continuar` | `continue-button` | não |
| `botao-copiar` | `copy-button` | não |
| `botao-de-icone` | `icon-button` | não |
| `botao-de-visibilidade` | `visibility-toggle` | não |
| `botao-desabilitado` | `disabled-button` | não |
| `botao-desfazer` | `undo-button` | não |
| `botao-flutuante` | `floating-action-button` | não |
| `botao-voltar` | `back-button` | não |
| `cabecalho` | `header` | não |
| `cabecalho-de-coluna` | `column-header` | não |
| `campo` | `field` | não |
| `campo-cep` | `postal-code-field` | não |
| `campo-condicional` | `conditional-field` | não |
| `campo-de-busca` | `search-field` | não |
| `campo-de-codigo` | `code-field` | não |
| `campo-de-formulario` | `form-field` | não |
| `campo-de-identificador` | `identifier-field` | não |
| `campo-de-senha` | `password-field` | não |
| `campo-de-texto` | `text-field` | não |
| `campo-numerico` | `number-field` | não |
| `carrinho` | `cart` | não |
| `carrossel` | `carousel` | não |
| `citacao` | `citation` | não |
| `controle-de-pausa` | `pause-control` | não |
| `controles-de-navegacao` | `navigation-controls` | não |
| `dialogo` | `dialog` | não |
| `dialogo-modal` | `modal-dialog` | não |
| `endereco` | `address` | não |
| `estado-vazio` | `empty-state` | não |
| `etapa-de-revisao` | `review-step` | não |
| `etiqueta` | `tag` | não |
| `filtro` | `filter` | não |
| `filtros` | `filters` | não |
| `formulario` | `form` | não |
| `formulario-de-endereco` | `address-form` | não |
| `formulario-de-redefinicao` | `reset-form` | não |
| `galeria` | `gallery` | não |
| `grafico` | `chart` | não |
| `grupo-de-botoes` | `button-group` | não |
| `guia-de-medidas` | `size-guide` | não |
| `icone` | `icon` | não |
| `icone-de-link-externo` | `external-link-icon` | não |
| `ilustracao` | `illustration` | não |
| `indicador-de-carregamento` | `loading-indicator` | não |
| `indicador-de-confianca` | `confidence-indicator` | não |
| `indicador-de-estado` | `status-indicator` | não |
| `indicador-de-etapas` | `step-indicator` | não |
| `indicador-de-posicao` | `position-indicator` | não |
| `input-de-arquivo` | `file-input` | não |
| `link-esqueci-senha` | `forgot-password-link` | não |
| `lista` | `list` | não |
| `lista-de-arquivos` | `file-list` | não |
| `lista-de-resultados` | `results-list` | não |
| `mensagem-de-erro` | `error-message` | não |
| `mensagem-de-estado` | `status-message` | não |
| `mensagem-inline` | `inline-message` | não |
| `menu-mobile` | `mobile-menu` | não |
| `modal-de-confirmacao` | `confirmation-modal` | não |
| `mostrar-senha` | `show-password` | não |
| `navegacao-secundaria` | `secondary-navigation` | não |
| `notificacao-temporaria` | `temporary-notification` | não |
| `pagina` | `page` | não |
| `pagina-de-confirmacao` | `confirmation-page` | não |
| `pagina-de-indisponibilidade` | `unavailable-page` | não |
| `paginacao` | `pagination` | não |
| `painel` | `panel` | não |
| `painel-de-filtros` | `filter-panel` | não |
| `painel-de-fontes` | `sources-panel` | não |
| `painel-lateral` | `side-panel` | não |
| `reautenticacao` | `reauthentication` | não |
| `regiao-de-status` | `status-region` | não |
| `resposta-de-ia` | `ai-response` | não |
| `resumo-de-acao` | `action-summary` | não |
| `resumo-de-erros` | `error-summary` | não |
| `resumo-de-revisao` | `review-summary` | não |
| `rotulo` | `label` | não |
| `scroll-infinito` | `infinite-scroll` | não |
| `selecao-de-conta` | `account-selection` | não |
| `seletor` | `picker` | não |
| `seletor-de-periodo` | `date-range-picker` | não |
| `sugestao-de-ia` | `ai-suggestion` | não |
| `tabela` | `table` | não |
| `temporizador` | `timer` | não |
| `texto-auxiliar` | `helper-text` | não |
| `texto-de-ajuda` | `help-text` | não |
| `validacao` | `validation` | não |

### Arquétipos (`archetypes/`)

#### Ids e arquivos

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `lista-operacional` | `operational-list` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `mestre-detalhe` | `master-detail` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `documento-com-visor` | `document-viewer` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `editor-com-painel` | `editor-with-panel` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `assistente-em-etapas` | `step-wizard` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `painel-de-acompanhamento` | `monitoring-dashboard` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `biblioteca` | `library` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `configuracoes` | `settings` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `pagina-publica-de-decisao` | `public-decision-page` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `dialogo-de-formulario` | `form-dialog` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `dialogo-de-confirmacao` | `confirmation-dialog` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |
| `painel-lateral-de-detalhe` | `detail-side-panel` | sim no UX.md (`lint-ux-md` aceita o id antigo com aviso) |

#### Front matter: chaves (inclui `primary-action{region,position,max}`)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `titulo` | `title` | não |
| `resumo` | `summary` | não |
| `registro` | `register` | não |
| `quando-usar` | `when-to-use` | não |
| `evitar-quando` | `avoid-when` | não |
| `regioes` | `regions` | não |
| `acao-primaria` | `primary-action` | não |
| `estados` | `states` | não |
| `padroes` | `patterns` | não |
| `variacoes` | `variations` | não |
| `regras` | `rules` | não |
| `arquivo` | `file` | não |
| `regiao` | `region` | não |
| `posicao` | `position` | não |

#### Registros (`register`; mesmo vocabulário no UX.md e nas referências)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `operacional` | `operational` | não |
| `consumo` | `consumer` | não |
| `marca` | `brand` | não |

#### Regiões

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `cabecalho-da-pagina` | `page-header` | não |
| `trilha-de-etapas` | `step-trail` | não |
| `corpo-da-etapa` | `step-body` | não |
| `rodape-de-navegacao` | `navigation-footer` | não |
| `navegacao-de-colecoes` | `collection-navigation` | não |
| `barra-de-busca` | `search-bar` | não |
| `conteudo` | `content` | não |
| `visualizacao-rapida` | `quick-view` | não |
| `menu-de-secoes` | `section-menu` | não |
| `corpo-da-secao` | `section-body` | não |
| `rodape-da-secao` | `section-footer` | não |
| `zona-de-risco` | `danger-zone` | não |
| `cabecalho-do-dialogo` | `dialog-header` | não |
| `corpo-do-dialogo` | `dialog-body` | não |
| `rodape-do-dialogo` | `dialog-footer` | não |
| `barra-do-visor` | `viewer-toolbar` | não |
| `visor` | `viewer` | não |
| `painel-de-informacoes` | `info-panel` | não |
| `barra-de-ferramentas` | `toolbar` | não |
| `area-de-edicao` | `editing-area` | não |
| `painel-lateral` | `side-panel` | não |
| `barra-de-status` | `status-bar` | não |
| `barra-de-filtros` | `filter-bar` | não |
| `barra-de-acoes-em-lote` | `bulk-actions-bar` | não |
| `rodape-da-lista` | `list-footer` | não |
| `coluna-mestre` | `master-column` | não |
| `coluna-detalhe` | `detail-column` | não |
| `cabecalho-publico` | `public-header` | não |
| `resumo-do-pedido` | `request-summary` | não |
| `documento-ou-detalhe` | `document-or-detail` | não |
| `area-de-decisao` | `decision-area` | não |
| `rodape-publico` | `public-footer` | não |
| `barra-de-periodo` | `period-bar` | não |
| `faixa-de-indicadores` | `kpi-strip` | não |
| `area-de-graficos` | `charts-area` | não |
| `lista-de-pendencias` | `pending-list` | não |
| `cabecalho-do-painel` | `panel-header` | não |
| `corpo-do-painel` | `panel-body` | não |
| `rodape-do-painel` | `panel-footer` | não |

#### Estados

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `carregando` | `loading` | não |
| `erro-de-campo` | `field-error` | não |
| `erro` | `error` | não |
| `enviando` | `submitting` | não |
| `sucesso` | `success` | não |
| `rascunho-retomado` | `draft-restored` | não |
| `vazio` | `empty` | não |
| `vazio-por-filtro` | `empty-filtered` | não |
| `sem-acesso` | `no-access` | não |
| `alteracoes-nao-salvas` | `unsaved-changes` | não |
| `salvando` | `saving` | não |
| `aberto` | `open` | não |
| `executando` | `running` | não |
| `processando` | `processing` | não |
| `indisponivel` | `unavailable` | não |
| `salvo` | `saved` | não |
| `conflito` | `conflict` | não |
| `somente-leitura` | `read-only` | não |
| `nada-selecionado` | `nothing-selected` | não |
| `link-invalido` | `invalid-link` | não |
| `link-expirado` | `expired-link` | não |
| `ja-respondido` | `already-answered` | não |
| `sem-dados-no-periodo` | `no-data-in-period` | não |
| `parcial` | `partial` | não |
| `desatualizado` | `stale` | não |
| `item-removido` | `item-removed` | não |
| `editando` | `editing` | não |

#### Variações

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `trilha-horizontal` | `horizontal-trail` | não |
| `trilha-vertical-lateral` | `vertical-side-trail` | não |
| `etapa-de-revisao-final` | `final-review-step` | não |
| `assistente-em-dialogo` | `wizard-in-dialog` | não |
| `grade-de-cartoes` | `card-grid` | não |
| `lista-densa` | `dense-list` | não |
| `colecoes-em-arvore` | `collection-tree` | não |
| `com-visualizacao-rapida` | `with-quick-view` | não |
| `salvar-por-secao` | `save-per-section` | não |
| `salvar-ao-alterar` | `save-on-change` | não |
| `abas-no-topo` | `top-tabs` | não |
| `confirmacao-simples` | `simple-confirmation` | não |
| `digitar-para-confirmar` | `type-to-confirm` | não |
| `desfazer-em-vez-de-confirmar` | `undo-instead-of-confirm` | não |
| `confirmacao-com-consequencias-listadas` | `confirmation-with-consequences` | não |
| `dialogo-curto` | `short-dialog` | não |
| `dialogo-com-secoes` | `sectioned-dialog` | não |
| `promover-a-pagina` | `promote-to-page` | não |
| `visor-com-painel-a-direita` | `viewer-with-right-panel` | não |
| `visor-em-tela-cheia` | `fullscreen-viewer` | não |
| `comparacao-lado-a-lado` | `side-by-side-comparison` | não |
| `painel-fixo-a-direita` | `fixed-right-panel` | não |
| `painel-recolhivel` | `collapsible-panel` | não |
| `painel-com-abas` | `tabbed-panel` | não |
| `foco-sem-painel` | `focus-without-panel` | não |
| `com-acoes-em-lote` | `with-bulk-actions` | não |
| `cards-no-mobile` | `cards-on-mobile` | não |
| `filtros-em-painel-lateral` | `filters-in-side-panel` | não |
| `agrupada-por-status` | `grouped-by-status` | não |
| `duas-colunas-fixas` | `two-fixed-columns` | não |
| `mestre-recolhivel` | `collapsible-master` | não |
| `detalhe-empilhado-no-mobile` | `stacked-detail-on-mobile` | não |
| `decisao-binaria` | `binary-decision` | não |
| `decisao-com-motivo` | `decision-with-reason` | não |
| `decisao-com-identificacao` | `decision-with-identification` | não |
| `documento-longo-com-decisao-fixa` | `long-document-with-sticky-decision` | não |
| `indicadores-acima-da-lista` | `kpis-above-list` | não |
| `pendencias-primeiro` | `pending-first` | não |
| `painel-por-perfil` | `dashboard-per-role` | não |
| `sobreposto` | `overlay` | não |
| `empurrando-o-conteudo` | `push-content` | não |
| `leitura-com-link-para-pagina` | `read-with-page-link` | não |

#### Posições da ação primária

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `topo-direita` | `top-right` | não |
| `rodape-direita` | `bottom-right` | não |
| `junto-ao-conteudo` | `inline` | não |

### Ferramentas gerais

#### Chaves e ids de saída

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `lint-design-md --json: info.secoes` | `info.sections` | não |
| `lint-design-md --json: info.referencias` | `info.references` | não |
| `lint-design-md --json: info.paresContraste` | `info.contrast_pairs` | não |
| `lint-raw-values --json: ocorrencias` | `occurrences` | não |
| `lint-raw-values --json: driftPorMilLinhas` | `drift_per_1000_lines` | não |
| `lint-raw-values regra cor-hex` | `color-hex` | não |
| `lint-raw-values regra cor-func` | `color-func` | não |
| `lint-raw-values regra px-solto` | `loose-px` | não |
| `lint-raw-values regra z-magico` | `magic-z` | não |
| `lint-raw-values regra tw-arbitr` | `tw-arbitrary` | não |
| `palette --format json: contrasteBranco` | `contrast_white` | não |
| `palette --format json: contrastePreto` | `contrast_black` | não |
| `tokens/contrast-pairs.json: uso` | `use` | sim (build-tokens avisa; contrast.mjs aceita as duas) |
| `lint-archetypes: exports loadArquetipos, lintArquetipos, REGISTROS, POSICOES, REGRAS` | `loadArchetypes, lintArchetypes, REGISTERS, POSITIONS, RULES` | não |
| `lint-patterns: ENUMS.categoria/tipo/impacto/evidencia` | `ENUMS.category/type/impact/evidence` | não |
| `patterns/index.json e archetypes/index.json: chaves em português (titulo, categoria, arquivo…)` | `mesmas chaves do front matter em inglês (title, category, file…)` | não |


### UX.md e ux-lint

#### UX.md — chaves do front matter

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `produto` (`persona`, `registro`, `plataforma`, `densidade`) | `product` (`persona`, `register`, `platform`, `density`) | sim, com aviso |
| `navegacao` (`modelo`, `profundidade-maxima`, `retorno`) | `navigation` (`model`, `max-depth`, `back`) | sim, com aviso |
| `arquetipos` | `archetypes` | sim, com aviso |
| `acoes` (`primarias-por-regiao`, `posicao-primaria`, `ordem-dialogo`, `destrutiva-rotulo-especifico`) | `actions` (`primary-per-region`, `primary-position`, `dialog-order`, `destructive-specific-label`) | sim, com aviso |
| `confirmacao` (`irreversivel`, `reversivel`) | `confirmation` (`irreversible`, `reversible`) | sim, com aviso |
| `feedback` (`sucesso`, `erro-de-campo`, `erro-de-sistema`, `esqueleto-acima-de-ms`) | `feedback` (`success`, `field-error`, `system-error`, `skeleton-after-ms`) | sim, com aviso |
| `estados` | `states` | sim, com aviso |
| `formularios` (`rotulo`, `validacao`, `obrigatorios`) | `forms` (`label`, `validation`, `required`) | sim, com aviso |
| `conteudo` (`glossario`, `botoes`, `proibidos`, `nomes-proprios`) | `content` (`glossary`, `buttons`, `forbidden`, `proper-nouns`) | sim, com aviso |
| `fluxos` (`max-passos-jornada`, `max-dialogos-empilhados`, `becos-sem-saida`) | `flows` (`max-journey-steps`, `max-stacked-dialogs`, `dead-ends`) | sim, com aviso |
| `verificacao.seletores` (`regioes`, `dialogo`, `rodape-dialogo`, `primaria`, `destrutiva`, `botao`, `campo`) | `verification.selectors` (`regions`, `dialog`, `dialog-footer`, `primary`, `destructive`, `button`, `field`) | sim, com aviso |

#### UX.md — valores

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| registro `operacional` · `consumo` · `editorial` · `marca` | `operational` · `consumer` · `editorial` · `brand` | sim, com aviso |
| plataforma `ambos` | `both` | sim, com aviso |
| densidade `baixa` · `media` · `alta` | `low` · `medium` · `high` | sim, com aviso |
| retorno `obrigatorio` · `opcional` | back `mandatory` · `optional` | sim, com aviso |
| posição `topo-direita` · `rodape-direita` · `junto-ao-conteudo` | `top-right` · `bottom-right` · `inline` | sim, com aviso |
| ordem `cancelar-acao` · `acao-cancelar` | `cancel-action` · `action-cancel` | sim, com aviso |
| irreversível `dialogo` · `digitar-nome` | `dialog` · `type-name` | sim, com aviso |
| reversível `desfazer` · `nenhuma` | `undo` · `none` | sim, com aviso |
| sucesso `pagina` | `page` | sim, com aviso |
| erro de sistema `alerta-na-pagina` | `page-alert` | sim, com aviso |
| rótulo `sempre-visivel` | `always-visible` | sim, com aviso |
| validação `ao-sair-do-campo` · `ao-enviar` · `em-tempo-real` | `on-blur` · `on-submit` · `realtime` | sim, com aviso |
| obrigatórios `marcar-obrigatorios` · `marcar-opcionais` | `mark-required` · `mark-optional` | sim, com aviso |
| botões `verbo-objeto` | `verb-object` | sim, com aviso |
| estados `carregando` · `vazio` · `erro` · `sem-acesso` · `sucesso` (e os demais estados de arquétipo) | `loading` · `empty` · `error` · `no-access` · `success` (…) | sim, com aviso |
| ids de arquétipo em `archetypes` (ex.: `lista-operacional`) e caminho `arquetipos/<id>.md` no corpo | ids novos (ex.: `operational-list`), `archetypes/<id>.md` | sim, com aviso |

#### ux-lint — ferramentas e flags

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `tools/ux-lint/texto.mjs` · `tela.mjs` · `fluxo.mjs` | `text.mjs` · `screen.mjs` · `flow.mjs` | não (caminho mudou) |
| `tools/ux-lint/pagina-texto.mjs` (já renomeado antes) | `text-page.mjs` | não |
| `--telas` · `--codigo` · `--ignorar` (text.mjs) | `--screens` · `--code` · `--ignore` | sim (apelido com aviso) |
| `--falhar-em` (screen.mjs, flow.mjs) | `--fail-at` | sim (apelido com aviso) |
| `--produto` · `--cor` · `--titulo` (text-page.mjs) | `--product` · `--color` · `--title` | sim (apelido com aviso) |
| `--arquetipos` (lint-ux-md.mjs) | `--archetypes` | sim (apelido com aviso) |
| `casos.json` (`options --from`, text-page) | `cases.json` (nome do arquivo é livre; o formato mudou) | sim (formato antigo lido com aviso) |

#### ux-lint — chaves do JSON emitido (`--json`)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `achados` · `resumo` · `telas` · `ranking` | `findings` · `summary` · `screens` · `ranking` | sim, pelo `findings.mjs` (register/check) |
| `regra` · `severidade` · `mensagem` · `sugestao` · `texto` · `tipos` · `tipo` | `rule` · `severity` · `message` · `suggestion` · `text` · `types` · `type` | sim, pelo `findings.mjs` |
| `evidencia` · `evidencias` | `evidence` | sim, pelo `findings.mjs` |
| `origem` {`trecho`, `total`, `local` (`codigo`/`dado`), `ocorrencias` [{`arquivo`, `linha`, `teste`}]} | `source` {`snippet`, `total`, `location` (`code`/`data`), `occurrences` [{`file`, `line`, `test`}]} | sim, pelo `findings.mjs` |
| `variantes` · `dado` · `severidadeOriginal` · `provavelDado` | `variants` · `probableData` · `originalSeverity` · `probableData` | sim, pelo `findings.mjs` |
| `porRegra` {`achados`, `ocorrencias`, `dado`} · `porTipo` · `inventarioPorTipo` · `porSeveridade` · `telasComAchado` · `textos` | `byRule` {`findings`, `occurrences`, `probableData`} · `byType` · `inventoryByType` · `bySeverity` · `screensWithFindings` · `texts` | sim, pelo `findings.mjs` |
| tela: `arquivo` · `dialogoAberto` · `regiao` · `inventario` | `file` · `dialogOpen` · `region` · `inventory` | sim, pelo `findings.mjs` |
| fluxo: `arquivo` · `tela` · `transicoes` · `jornadas` | `file` · `screen` · `transitions` · `journeys` | sim, pelo `findings.mjs` |
| inventário: `variante` · `titulo` · `rotulo` · `visivel` · `controle` · `truncavel` · `completo` · `doAriaLabel` · `linha` | `variant` · `title` · `label` · `visible` · `control` · `truncatable` · `full` · `fromAriaLabel` · `line` | não (só informativo) |
| tipos de elemento `título` · `botão` · `aba` · `rótulo` · `texto de apoio` · `alerta` · `nome acessível` · `valor vazio` | `title` · `button` · `tab` · `label` · `helper` · `alert` · `accessible-name` · `empty-value` | sim, pelo `findings.mjs` |
| variantes de botão `ícone` · `item de lista` · `ordenação` · `alternância` · `item de menu` · `outro` · `composto`; de título `acordeão` · `diálogo` | `icon` · `list-item` · `sort` · `toggle` · `menu-item` · `other` · `composite`; `accordion` · `dialog` | não (só informativo) |
| — (novo) | `warnings` no JSON quando o UX.md ou o mapa usa nome antigo | — |

Nota: as chaves novas seguem o camelCase já usado no registro (`byStatus`); por isso `probableData`, não `probable_data`.

#### cases.json (opções para a página e para `findings.mjs options`)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `casos` | `cases` | sim, com aviso |
| `elemento` · `regra` · `severidade` · `texto` · `variantes` · `origem` · `telas` · `problema` | `element` · `rule` · `severity` · `text` · `variants` · `source` · `screens` · `problem` | sim, com aviso |
| `opcoes` [{`texto`, `convencao`, `nota`}] | `options` [{`text`, `convention`, `note`}] | sim, com aviso |
| `recomendada` {`indice`, `porque`} | `recommended` {`index`, `why`} | sim, com aviso |
| valores de elemento `botao` · `titulo` · `rotulo` · `dica` · `apoio` · `alerta` · `aba` · `nome-acessivel` · `celula` | `button` · `title` · `label` · `tooltip` · `helper` · `alert` · `tab` · `accessible-name` · `cell` | sim (já existia) |
| id de caso gerado pela página `caso-…`, atributo `data-caso` | `case-…`, `data-case` | não (só a página gerada) |

#### Mapa de fluxo `.dsx/maps/flows-<module>.json`

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `telas` [{`id`, `nome`, `tipo`, `rota`, `pai`, `componente`, `persona`}] | `screens` [{`id`, `name`, `type`, `route`, `parent`, `component`, `persona`}] | sim, com aviso (flow.mjs) |
| `transicoes` [{`id`, `de`, `para`, `gatilho` {`tipo`, `rotulo`}, `evidencia`}] | `transitions` [{`id`, `from`, `to`, `trigger` {`type`, `label`}, `evidence`}] | sim, com aviso |
| `jornadas` [{`id`, `nome`, `passos`, `trocas_persona`}] | `journeys` [{`id`, `name`, `steps`, `persona_switches`}] | sim, com aviso |
| tipo de tela `pagina` · `dialogo` · `aba` · `painel` · `gaveta` | `page` · `dialog` · `tab` · `panel` · `drawer` | sim, com aviso |

#### Identificadores exportados

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `lint-ux-md.mjs`: `ARQUETIPOS`, `SECOES`, opção `arquetiposDir`, `info.arquetipos`, `info.secoes` | `ARCHETYPES`, `SECTIONS`, `archetypesDir`, `info.archetypes`, `info.sections` | não |
| `ux-lint/lib/config.mjs`: `PADROES` | `DEFAULTS` (+ `cfg.legacyWarnings`, não enumerável) | não |
| `screen.mjs`: `analisarTela`, `resumir`, `SEVERIDADE`, `ROTULOS_CANCELAR`, `ROTULOS_GENERICOS_DESTRUTIVA`, `ROTULOS_SEM_VERBO` | `analyzeScreen`, `summarize`, `SEVERITY`, `CANCEL_LABELS`, `GENERIC_DESTRUCTIVE_LABELS`, `LABELS_WITHOUT_VERB` | não |
| `flow.mjs`: `analisarFluxo`, `SEVERIDADE` | `analyzeFlow`, `SEVERITY` | não |
| `text.mjs`: `analisarTexto`, `inventariar`, `regrasDoItem`, `termosDe`, `agrupar`, `ranking`, `resumir`, `indexarCodigo`, `indexarFonte`, `semComentarios`, `trechos`, `origemDe`, `textoDe`, `lerArgs`, `SEVERIDADE`, `TIPOS`, `ROTULOS_SEM_VERBO`, `TERMOS_TECNICOS` | `analyzeText`, `takeInventory`, `rulesForItem`, `termsFrom`, `group`, `ranking`, `summarize`, `indexCode`, `indexSource`, `stripComments`, `snippets`, `sourceOf`, `visibleText`, `parseTextArgs`, `SEVERITY`, `TYPES` (+ `TYPE_LABEL`), `LABELS_WITHOUT_VERB`, `TECHNICAL_TERMS` | não |
| `findings.mjs`: `check()` devolve `{ pass, novos, regressoes, conhecidos }` | `{ pass, added, regressions, known }` | não |
| — (novo) | `tools/ux-lint/lib/legacy.mjs`: `normalizeUxFrontMatter`, `normalizeFlowMap`, `normalizeCases`, `normalizeDetectorJson`, `OLD_FLAGS`, `rejectOldFlags`, tabelas `UX_KEYS`, `UX_VALUES`, `ARCHETYPE_IDS`, `STATE_IDS`, `SCREEN_TYPES`, `TEXT_TYPES` | — |

### Referências de DESIGN.md

#### Referências de DESIGN.md (`tools/references.mjs`, `references/design-md/`)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `tools/referencias.mjs` | `tools/references.mjs` | não (caminho do script) |
| `referencias/design-md/indice.json` | `references/design-md/index.json` | não (arquivo do DSX, regravado) |
| `referencias/design-md/curados.json` | `references/design-md/curated.json` | não (arquivo do DSX, regravado) |
| subcomando `indice` | `index` | sim, com aviso |
| subcomando `buscar` | `search` | sim, com aviso |
| subcomando `baixar` | `fetch` | sim, com aviso |
| subcomando `avaliar` | `evaluate` | sim, com aviso |
| subcomando `curar` | `curate` | sim, com aviso |
| `--registro` | `--register` | sim, com aviso |
| `--uso` | `--use` | sim, com aviso |
| `--tema` | `--theme` | sim, com aviso |
| `--curados` | `--curated` | sim, com aviso |
| valor de `--register`: `operacional` / `consumo` / `marca` | `operational` / `consumer` / `brand` (`editorial`, `experimental` iguais) | sim, com aviso |
| valor de `--theme`: `claro` / `escuro` | `light` / `dark` | sim, com aviso |
| index.json: `fonte`, `licenca`, `atualizado`, `itens` | `source`, `license`, `updated`, `items` | não |
| index.json item: `titulo`, `descricao`, `categoria`, `uso`, `estilo`, `palavras` | `title`, `description`, `category`, `use_case`, `style`, `keywords` | não |
| index.json `dsx.registro`, `dsx.registros`, `dsx.tema` | `dsx.register`, `dsx.registers`, `dsx.theme` | não |
| valores de registro `operacional`, `consumo`, `marca` | `operational`, `consumer`, `brand` | não (no JSON) |
| valores de tema `claro`, `escuro`, `claro-e-escuro` | `light`, `dark`, `light-and-dark` | não (no JSON) |
| curated.json: `criterio`, `atualizado`, `itens` | `criteria`, `updated`, `items` | não |
| curated.json item: `titulo`, `registro`, `tema`, `uso`, `nota`, `contrasteReprovado`, `erros`, `avisos`, `arquivo` | `title`, `register`, `theme`, `use_case`, `score`, `contrast_failures`, `errors`, `warnings`, `file` | não |
| curated.json `tokens.cores`, `tokens.tipografia`, `tokens.componentes` | `tokens.colors`, `tokens.typography`, `tokens.components` | não |
| saída de `evaluate` (JSON): `nota`, `tema`, `erros`, `avisos`, `contrasteComponentes`, `contrasteReprovado`, `tokens.{cores,tipografia,componentes}`; par `{componente, razao}` | `score`, `theme`, `errors`, `warnings`, `component_contrast`, `contrast_failures`, `tokens.{colors,typography,components}`; par `{component, ratio}` | não |
| exports `classificar`, `avaliar` | `classify`, `evaluate` (novo: `normalizeArgs`) | não |
| user-agent `dsx-referencias/1.0` | `dsx-references/1.0` | — |
| teste `tools/test/referencias.test.mjs` | `tools/test/references.test.mjs` | — |

### Figma, Stitch, hook, mapas e evals

#### Figma — ferramentas, exports e chaves de saída

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `tools/figma/tokens-para-figma.mjs` | `tools/figma/tokens-to-figma.mjs` | não (caminho) |
| `tools/figma/figma-para-tokens.mjs` | `tools/figma/figma-to-tokens.mjs` | não (caminho) |
| `tools/figma/normalizar-svg-path.cjs` | `tools/figma/normalize-svg-path.cjs` | não (caminho) |
| `tools/figma/preludio.js` | `tools/figma/prelude.js` | não (caminho) |
| exports `COLECOES`, `paraNomeFigma`, `paraCaminhoDtcg`, `hexParaRgba`, `converterValor`, `scopesPara`, `planejar`, `gerarScript` | `COLLECTIONS`, `toFigmaName`, `toDtcgPath`, `hexToRgba`, `convertValue`, `scopesFor`, `plan`, `generateScript` | não |
| exports `paraDtcg`, `comparar`, `aplicar` | `toDtcg`, `compare`, `apply` | não |
| plano `--json`: `colecoes{nome,modos}`, `variaveis[{colecao,nome,tipoDtcg,tipo,scopes,descricao,valores{valor}}]`, `naoSuportados`, `resumo` | `collections{name,modes}`, `variables[{collection,name,dtcg_type,type,scopes,description,values{value}}]`, `unsupported`, `summary` | não |
| retorno do script gerado: `criadas`, `atualizadas`, `pendentes`, `colecoes` | `created`, `updated`, `pending`, `collections` | não |
| diff `--json`: `mudancas[{token,arquivo,modo,antes,depois,herdado}]`, `novos[{nome,colecao,valor,motivo}]`, `sugestoes[{sugestao}]`, `ausentesNoFigma` | `changes[{token,file,mode,before,after,inherited}]`, `added[{name,collection,value,reason}]`, `suggestions[{suggestion}]`, `missing_in_figma` | não |
| prelúdio CONFIGURE: `ID_FRAME_ICONES`, `PREFIXO_ICONE`, `ICONE_NATIVO`, `FAMILIA`, `PESOS`, `ESTILO{tituloSecao,cabecalhoTabela}`, `TK{fundoPagina,fundoSuperficie,textoPrimario,textoSecundario,textoCabecalhoTabela,textoSobreAcao,bordaCard,bordaDivisor,acaoPrimaria,acaoPerigo,sucesso,atencao,erro,info}`, `ICONE_TOM`, `LARGURA_TELA`, `ALTURA_APPBAR` | `ICON_FRAME_ID`, `ICON_PREFIX`, `ICON_NATIVE_SIZE`, `FONT_FAMILY`, `FONT_WEIGHTS`, `TEXT_STYLE{sectionTitle,tableHeader}`, `TK{pageBg,surfaceBg,textPrimary,textSecondary,textTableHeader,textOnAction,cardBorder,dividerBorder,actionPrimary,actionDanger,success,warning,danger,info}`, `TONE_ICON`, `SCREEN_WIDTH`, `APPBAR_HEIGHT` | não (o prelúdio é colado a cada script) |
| prelúdio helpers `umDe`, `fechar`, `TOM`, `TIPOS_BOTAO` | `oneOf`, `finish`, `TONE`, `BUTTON_TYPES` | não |
| `btn(…, 'primária' \| 'secundária' \| 'destrutiva' \| 'neutra')` | `btn(…, 'primary' \| 'secondary' \| 'destructive' \| 'neutral')` | sim (valores antigos aceitos; nome do frame no Figma continua `Botão · primária`) |
| nomes de coleção/modo no Figma (`Primitivos`, `Semântico`, `Componente`, `Valor`, `Claro`, `Escuro`) | sem mudança (texto do arquivo do Figma) | — |
| snapshot / baseline `variaveis`, `estilos`, `nos`, `oculto`, `modo: completo` | já eram `variables`, `styles`, `nodes`, `hidden`, `mode: full` | sim (`diff-baseline.cjs`, já existia) |

#### Figma — registro, changelog e referência no projeto

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `design/figma-sync.md`: `arquivo:`, `vez:`, `desde:` | `file:`, `turn:`, `since:` | sim (hook e skills leem o antigo e avisam) |
| valores da vez `codigo`, `código`, `aplicando` | `code`, `applying` (`design` igual) | sim |
| `design/figma-changelog.jsonl`: `rodada`, `data`, `direcao`, `autor`, `resumo`, `framesCriados`, `framesAlterados`, `framesRemovidos`, `tokensAlterados`, `vezApos`, `achados` | `round`, `date`, `direction`, `author`, `summary`, `frames_created`, `frames_changed`, `frames_removed`, `tokens_changed`, `turn_after`, `findings` | sim (skills leem linhas antigas; o arquivo é só-inclusão, linhas antigas não são reescritas) |
| `direcao` `codigo->figma` / `figma->codigo` | `direction` `code->figma` / `figma->code` | sim |
| `design/figma-achados/<rodada>.md` | `design/figma-findings/<rodada>.md` | não (caminho; o ponteiro `findings` do changelog diz onde está) |
| `design/figma-reference.json`: `atualizadoEm`, `paginas`, `fundacao`, `colecoes`, `modos`, `variaveis`, `estilosTexto`, `icones{frameId,nomes}`, `chrome{drawerAberto,drawerRecolhido}`, `kitPrimitivosFrameId`, `frames[{origem,pagina}]` | `updatedAt`, `pages`, `foundation`, `collections`, `modes`, `variables`, `textStyles`, `icons{frameId,names}`, `chrome{drawerOpen,drawerCollapsed}`, `kitPrimitivesFrameId`, `frames[{source,page}]` | sim (lido com aviso; regravado na próxima regeneração) |
| `.dsx/figma/ledger.json` | sem mudança (já em inglês) | — |
| argumento de `figma-vez`: `codigo \| design \| aplicando` | `code \| design \| applying` | sim |
| argumento de `figma-cobertura`: `codigo→figma \| figma→codigo` | `code→figma \| figma→code` | não declarado |

#### Hook

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `hooks/guarda-vez.py` | `hooks/turn-guard.py` (hooks.json atualizado) | — (o plugin aponta para o novo) |
| lê `vez:` (aceitava o legado `turn:`) | lê `turn:` (aceita o legado `vez:` e os valores `codigo`/`aplicando`, com aviso no SessionStart) | sim |
| mensagem "feche-a (/dsx:figma-vez codigo)" | "/dsx:figma-vez code" | — |

#### Stitch

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `tools/stitch/analisar-html.mjs` | `tools/stitch/analyze-html.mjs` | não (caminho) |
| `design-system.mjs exportar` / `conferir` | `design-system.mjs export` / `check` | sim (apelido com aviso) |
| exports `FONTES_STITCH`, `MAPEAMENTO_MATERIAL`, `lerDesignMd`, `fonteStitch`, `raioStitch`, `exportar`, `lerListaStitch`, `conferir` | `STITCH_FONTS`, `MATERIAL_MAPPING`, `readDesignMd`, `stitchFont`, `stitchRadius`, `exportDesignMd`, `readStitchList`, `checkDesignSystem` | não |
| export de `analisar-html`: `lerConfig`, `analisar(html, { papeisDsx })` | `readConfig`, `analyzeHtml(html, { dsxRoles })` | não |
| `check --json`: `problemas`, `avisos`, `preservadas`, `alteradas[{papel,dsx,stitch}]`, `ausentes`, `extras`, `mapeamento`, `semMapa` | `problems`, `warnings`, `preserved`, `changed[{role,dsx,stitch}]`, `missing`, `extras`, `mapping`, `unmapped` | não |
| `export` (retorno JS): `texto`, `avisos`, `esperado` | `text`, `warnings`, `expected` | não |
| `analyze-html --json`: `falhas`, `temConfig`, `raio`, `cores{totalUsos,usosDsx,percentualDsx,papeis[{papel,usos,valor,origem,mapearPara}]}`, `contraste`, `arbitrarios`, `inline{exemplos}`, `a11y[{regra,ocorrencias,exemplo}]`; `origem: desconhecida` | `failures`, `has_config`, `radius`, `colors{total_uses,dsx_uses,dsx_percent,roles[{role,uses,value,source,map_to}]}`, `contrast`, `arbitrary`, `inline{examples}`, `a11y[{rule,occurrences,example}]`; `source: unknown` | não |
| `.stitch/conferencia.json`, `.stitch/conferencia-bruta.json`, `.stitch/revisoes/` | `.stitch/check.json`, `.stitch/check-raw.json`, `.stitch/reviews/` | sim (skill lê o antigo e avisa) |
| `metadata.json` → `designSystem.conferido`, `status: conforme\|divergente` | `designSystem.checkedAt`, `status: compliant\|divergent` | sim |

#### Mapas

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `.dsx/mapas/` | `.dsx/maps/` | sim (agentes e skills leem o legado e regravam no novo; legado `.claude/figma-claude/` continua aceito) |
| `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`, `design-system` (`.json`/`.md`) | `project-map`, `ui-map`, `flows`, `tasks`, `journey`, `domain`, `confirmations`, `design-system` | sim |
| chaves JSON dos mapas do `mapear` | sem mudança (já eram inglês: `screens`… fica com o fork A no `flows-<module>`) | — |
| modos do `mapear`: `projeto`, `completo` | `project`, `full` (`design-system` igual) | sim (aceitos com aviso) |
| cabeçalho de `design/as-is-to-be.md`: `validado`, `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes` | `validated`, `project-map`, `ui-map`, `flows`, `tasks`, `journey`, `domain`, `confirmations` | sim |

#### Evals

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `evals/casos/`, `evals/rubricas/` | `evals/cases/`, `evals/rubrics/` | não |
| `ui-gerada.jsonl` / `ui-gerada.yaml` / `feature-ia.yaml` | `generated-ui.jsonl` / `generated-ui.yaml` / `ai-feature.yaml` | não |
| ids de rubrica `ui-gerada`, `feature-ia` | `generated-ui`, `ai-feature` | não |
| chaves das rubricas: `versao`, `tentativas_por_caso`, `aprovacao`, `criterios`, `avaliador`, `como`, `limiar`, `ancoras`, `metas`, `nota_maxima`, `faixas`, `ancoras_genericas`, `teste_de_aceitacao`, `descricao`, `tentativas`, `metricas_de_produto`, `como_medir`, `peso` | `version`, `attempts_per_case`, `approval`, `criteria`, `evaluator`, `how`, `threshold`, `anchors`, `goals`, `max_score`, `bands`, `generic_anchors`, `acceptance_test`, `description`, `attempts`, `product_metrics`, `how_to_measure`, `weight` | não |
| avaliador `codigo`, `juiz`, `humano` | `code`, `judge`, `human` | não |
| faixas `robusto`, `utilizavel-com-lacunas`, `revisar-antes-de-usar`, `alto-risco` | `robust`, `usable-with-gaps`, `review-before-use`, `high-risk` | não |
| gates/critérios: `sem-valores-crus`, `contraste`, `nomes-acessiveis`, `foco-visivel`, `estados-obrigatorios`, `sem-dark-patterns`, `reuso-de-componentes`, `hierarquia-visual`, `padroes-de-interacao`, `texto`, `responsividade`, `rotulagem`, `confirmacao-por-risco`, `acoes-proibidas`, `recuperacao`, `intencao`, `progresso`, `incerteza-e-fontes`, `revisao-do-resultado`, `confianca-calibrada`, `fidelidade`, `contraste-essencial`, `conectado-ao-agente`, `sem-conflito`, `fidelidade-a-fonte`, `validade-tecnica`, `tokens-semanticos`, `intencao-e-prosa`, `componentes-e-estados`, `acessibilidade`, `operacao-com-agente`, `manutencao` | `no-raw-values`, `contrast`, `accessible-names`, `visible-focus`, `required-states`, `no-dark-patterns`, `component-reuse`, `visual-hierarchy`, `interaction-patterns`, `text`, `responsiveness`, `labeling`, `risk-based-confirmation`, `forbidden-actions`, `recovery`, `intent`, `progress`, `uncertainty-and-sources`, `output-review`, `calibrated-trust`, `fidelity`, `essential-contrast`, `connected-to-agent`, `no-conflict`, `source-fidelity`, `technical-validity`, `semantic-tokens`, `intent-and-prose`, `components-and-states`, `accessibility`, `agent-operation`, `maintenance` | não |
| casos JSONL: `tipo` (`tipico\|borda\|adversarial`), `pedido`, `esperado`, `verificar` | `type` (`typical\|edge\|adversarial`), `request`, `expected`, `verify` | não |
| saída do agente `juiz-de-evals`: `criterio`, `evidencias`, `nota`, `ancora`, `justificativa`, `confianca` (`alta\|media\|baixa`) | `criterion`, `evidence`, `score`, `anchor`, `rationale`, `confidence` (`high\|medium\|low`) | não |
| exemplo em `knowledge/ia/evals.md`: `rubrica`, `escopo`, `entradas_do_avaliador`, `criterio`, `pergunta`, `aprovado_exemplo`, `reprovado_exemplo`, `regras_de_decisao`… | `rubric`, `scope`, `evaluator_inputs`, `criterion`, `question`, `pass_example`, `fail_example`, `decision_rules`… | — (exemplo) |

### Rodada de convenção (snake_case em JSON, kebab-case em YAML, apelidos de CLI)

#### Knowledge, índices e ferramentas gerais

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| front matter de `knowledge/**`: `titulo`, `evidencia`, `relacionados` | `title`, `evidence`, `related` | não (nenhuma ferramenta lê) |
| `area: ia` · `evidencia: contextual` · `evidencia: sinal` | `area: ai` · `evidence: contextual` · `evidence: signal` | não |
| `archetypes/index.json`: `primary-action` | `primary_action` (no front matter do cartão continua `primary-action`) | não |
| `contrast.mjs` (saída JSON): `AA-texto`, `AA-texto-grande`, `AA-ui-nao-textual`, `AAA-texto`, `AAA-texto-grande` | `aa_text`, `aa_large_text`, `aa_non_text_ui`, `aaa_text`, `aaa_large_text` | não |
| `type-scale.mjs` (saída JSON): `lineHeight`, `minPx`, `maxPx` | `line_height`, `min_px`, `max_px` | não |
| `references.mjs search` (interno): `curatedItem` | `curated_item` | não |
| tabelas `LEGACY_*` e `normalizeArgs` em `references.mjs` | `tools/lib/legacy-cli.mjs` (`LEGACY_CLI`, `normalizeArgv`, `parseCli`) | — |
| aviso "… renomeie para X" dos apelidos de CLI | "… é nome antigo, use X (docs/renames-2026-10.md)" | — |

#### ux-lint — rodada 2 (convenção snake_case no JSON e apelidos de CLI)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `screen.mjs --json`: `screens[].dialogOpen` | `screens[].dialog_open` | sim (`findings.mjs` normaliza) |
| `screen.mjs --json`: `summary.screensWithFindings`, `summary.byRule`, `summary.bySeverity` | `summary.screens_with_findings`, `summary.by_rule`, `summary.by_severity` | sim (`findings.mjs` normaliza) |
| `flow.mjs --json`: `summary.byRule` | `summary.by_rule` | sim (`findings.mjs` normaliza) |
| `text.mjs --json`: `findings[].probableData`, `findings[].originalSeverity` | `probable_data`, `original_severity` | sim (`findings.mjs` normaliza) |
| `text.mjs --json`: `summary.probableData`, `summary.byRule[r].probableData`, `summary.inventoryByType`, `summary.byType`, `summary.byRule` | `summary.probable_data`, `summary.by_rule[r].probable_data`, `summary.inventory_by_type`, `summary.by_type`, `summary.by_rule` | sim (`findings.mjs` normaliza) |
| `text.mjs --json`: `screens[].inventory[].fromAriaLabel` | `from_aria_label` | sim (`findings.mjs` normaliza) |
| `findings.mjs status --json`: `byStatus`, `byFamily`, `byRule`, `bySeverity` | `by_status`, `by_family`, `by_rule`, `by_severity` | — (saída) |
| flags antigas do ux-lint e do `lint-ux-md` (`--telas`, `--codigo`, `--ignorar`, `--falhar-em`, `--produto`, `--cor`, `--titulo`, `--arquetipos`) | `--screens`, `--code`, `--ignore`, `--fail-at`, `--product`, `--color`, `--title`, `--archetypes` | sim: apelido com aviso "nome antigo, use --X" (antes: saía com código 2) — tabela em `tools/lib/legacy-cli.mjs` |
| export `OLD_FLAGS` e `rejectOldFlags` em `tools/ux-lint/lib/legacy.mjs` | removidos (substituídos por `normalizeArgv`/`parseCli` de `tools/lib/legacy-cli.mjs`) | não |
| `parseTextArgs(argv)` | `parseTextArgs(argv, warn?)` (aplica os apelidos) | — |

#### Rodada 2 — convenção de chaves (Figma, Stitch, mapas, evals)

| Antigo | Novo | Leitura compatível? |
|---|---|---|
| `design-system.mjs exportar` / `conferir`, `--papel` | `export` / `check`, `--role` | sim, apelido com aviso (`tools/lib/legacy-cli.mjs`) |
| `analyze-html.mjs --usos` | `--uses` | sim, apelido com aviso |
| `tokens-to-figma.mjs --colecao` | `--collection` | sim, apelido com aviso |
| mapas `.dsx/maps/*.json`: `generatedAt` | `generated_at` | sim (agentes e skills leem camelCase com aviso) |
| `project-map.json`: `specsAndTests`, `designSystem{themeFile,iconPackage,foundationDoc}`, `figmaCycle`, `syncRegistry`, `baselineFiles` | `specs_and_tests`, `design_system{theme_file,icon_package,foundation_doc}`, `figma_cycle`, `sync_registry`, `baseline_files` | sim |
| `ui-map.json`: `subPages`, `navVisible`, `triggeredFrom`, `designSystem{themeFile,colorTokens,spacingScale,radiusScale}`, `componentKit`, `screensWithEmpty`, `screensWithLoading`, `screensWithError`, `screensMissingStates`, `formsLibrary` | `sub_pages`, `nav_visible`, `triggered_from`, `design_system{theme_file,color_tokens,spacing_scale,radius_scale}`, `component_kit`, `screens_with_empty`, `screens_with_loading`, `screens_with_error`, `screens_missing_states`, `forms_library` | sim |
| `flows.json`: `entryPoints`, `deadEnds`, `guardedRoutes` | `entry_points`, `dead_ends`, `guarded_routes` | sim |
| `tasks.json`: `errorHandling`, `confirmationRequired` | `error_handling`, `confirmation_required` | sim |
| `journey.json`: `outOfUiTouchpoints` | `out_of_ui_touchpoints` | sim |
| `domain.json`: `businessRules`, `apiSurface` | `business_rules`, `api_surface` | sim |
| `design-system.json`: `adaptersUsed`, `loadedVia`, `fontSizes`, `perThousandLines`, `suggestedToken`, tipografia `fontFamily`/`fontSize`/`fontWeight` | `adapters_used`, `loaded_via`, `font_sizes`, `per_thousand_lines`, `suggested_token`, `font_family`/`font_size`/`font_weight` | sim |
| `confirmations.json`: `confirmedAt`, `leftOpenAt`; valor de `map` `fluxos`/`dominio`… | `confirmed_at`, `left_open_at`; `flows`/`domain`… | sim |
| `.dsx/figma/ledger.json`: `runId`, `textStyles`, `pendingValidations`, `completedSteps` | `run_id`, `text_styles`, `pending_validations`, `completed_steps` | sim |
| `design/figma-reference.json`: `fileUrl`, `updatedAt`, `textStyles`, `frameId`, `drawerOpen`, `drawerCollapsed`, `kitPrimitivesFrameId` (`fileKey` fica, é nome da API do Figma) | `file_url`, `updated_at`, `text_styles`, `frame_id`, `drawer_open`, `drawer_collapsed`, `kit_primitives_frame_id` | sim |
| Stitch `metadata.json`: `designSystem.checkedAt` (`designSystem` e `assetId` ficam, são da API do Stitch) | `designSystem.checked_at` | sim |
| rubricas YAML: `attempts_per_case`, `how_to_measure`, `product_metrics`, `max_score`, `generic_anchors`, `acceptance_test` | `attempts-per-case`, `how-to-measure`, `product-metrics`, `max-score`, `generic-anchors`, `acceptance-test` | não |
| exemplo de rubrica em `knowledge/ia/evals.md`: `evaluator_inputs` (e valores `user_request`…), `pass_example`, `fail_example`, `decision_rules`, `output_passes`, `runs_per_case`, `judge_calibration` | `evaluator-inputs` (`user-request`…), `pass-example`, `fail-example`, `decision-rules`, `output-passes`, `runs-per-case`, `judge-calibration` | — (documento) |

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
