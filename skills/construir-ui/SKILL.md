---
name: construir-ui
description: "Constrói ou altera UI dentro do design system: lê DESIGN.md (como parece) e UX.md (arquétipo da tela, ações, estados), reusa componentes, segue o catálogo de padrões, implementa todos os estados e verifica contraste, valores crus e ux-lint. Use sempre que escrever ou modificar código de interface."
---

# Construir UI dentro do sistema

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Todos os caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` abaixo são relativos a ela. Caminhos sem prefixo (`DESIGN.md`, `UX.md`, `src/`) são do projeto do usuário.

O objetivo não é "uma tela bonita", é **uma tela que parece ter sido feita pelo mesmo time que fez o resto do produto** e que funciona em todos os estados, para todas as pessoas.

## 0. Pré-condições

1. Procure `DESIGN.md` na raiz do projeto. **Se não existir**, pare e rode a skill `iniciar` (ou `design-md` no modo "extrair do código"). Construir sem fonte visual é a principal causa de drift.
2. Procure `UX.md` na raiz do projeto. **Se não existir**, pare e rode a skill `iniciar` (ou `ux-md` no Modo A, "extrair do código"): construir sem saber que tipo de tela é, onde fica a primária e quais estados são obrigatórios é a principal causa de telas do mesmo tipo divergirem. **Antes de desenhar, leia o arquétipo da tela**: a linha dela na seção "Arquétipos de tela" (e os desvios D… que a citam), o cartão `archetypes/<id>.md` (regiões, ação primária, estados, variações), a posição e o limite de ações primárias, a política de confirmação e feedback, os estados obrigatórios e os termos proibidos. Tela sem arquétipo na tabela: proponha um e registre no `UX.md` antes de construir (skill `ux-md`); para escolher entre arranjos, skill `arranjar-tela`.
3. Localize a fonte de tokens (CSS variables, tema do Tailwind, `tokens/*.json`, tema MUI…) e a pasta de componentes compartilhados. Anote os caminhos.
4. Se existirem mapas do projeto (`.dsx/maps/`, gerados pela skill `mapear`), leia os relevantes antes de desenhar: `flows.json` (de onde a tela é alcançada e para onde leva), `tasks.json` (passos e dependências), `domain.json` (de onde vêm os dados, cardinalidades), `journey.json` (persona e momento). Itens em `uncertain` não são fato — confirme com o usuário ou rode `confirmar-mapas`.
5. Se o projeto mantém o ciclo com o Figma (`design/figma-sync.md` existe) e a vez é `design`, **não altere as telas que estão em refino** sem combinar — a mudança vai colidir com a próxima volta (skill `figma-vez`). Ao concluir com vez `code`, as telas tocadas entram no próximo reespelho incremental (`figma-espelhar`).
6. Se a tela vem de uma variação escolhida (skill `repensar-ux`, `.dsx/variations/<module>/<flow>/decision.json`), construa a variante decidida (ou a composição por eixo) a partir do manifesto e do código de teste dela: o código em `tests/…/variants/` é referência de composição com os mesmos componentes, nunca colado na produção. Atualize o `UX.md` (arquétipo, desvio, fluxo) no mesmo commit e confira na re-auditoria que os ids de `resolves` viraram `fixed`.
7. Se a tela vem do Stitch (`.stitch/designs/<slug>.html|png`), ela é **referência de layout e conteúdo**, não código: siga o modo "Trazer" da skill `stitch` (cores mapeadas por papel, componentes do projeto, correções que a crítica apontou).
8. Se a tarefa for uma feature nova sem problema definido ("faz uma tela de X"), pergunte **para quem** e **qual tarefa** a tela resolve antes de desenhar. Uma frase basta.

## 0b. Product pipeline contract (Forward)

When the work belongs to a Forward cycle (`cycles/C-<n>/plan.md` exists), the UI realizes a contract written before it (`knowledge/foundations/product-pipeline-ux.md`):

1. **Read the blueprint** of the front demand: `specs/<demand-id>/design/intended-model.md` (actors, jobs, primary actions and consequences, acceptance scenarios) and, when present, `flow.md` and `ia.md`. UI is the realization of this contract, not the source of the job. A blueprint gap (missing state, screen without requirement) goes back to its owner; do not improvise it in code. Check before building: `node <DSX>/tools/ux-lint/blueprint.mjs check --design specs/<demand-id>/design --no-captures`.
2. **Read the UI/UX criteria** of the plan (`node <DSX>/tools/ux-lint/criteria.mjs list cycles/C-<n>/plan.md`). Build toward the declared targets and counter-metrics; never edit them (the plan is frozen at sign-off).
3. **Internal criticism before code.** Write six short entries — strongest counter-case, unsupported claims, failure/recovery scenarios, accessibility, domain/data contradictions, security/operational risks — each resolved (what you changed) or turned into an explicit limitation or measurement task. Put it in the demand's notes on `cycles/C-<n>/board.md` (or in the variations manifest's `critique` when the screen comes from `repensar-ux`). It never replaces the isolated review (`revisor-ux`, Forward `fde-review`).
4. **After UI**, verify the realized journey: recapture, then `blueprint.mjs check --design specs/<demand-id>/design --module <m> [--journey <id>]` (no orphans both ways, DOM-5) and `audit.mjs --module <m> --root . --criteria cycles/C-<n>/plan.md --criteria-out evals/ux/C-<n>-criteria.json`. Report UI quality, UX quality and DS adherence as separate verdicts; `unknown` stays unknown.

## 1. Descoberta antes de escrever código

Faça este inventário **antes** de criar qualquer arquivo:

- [ ] Quais componentes existentes resolvem partes da tela? (busque por nome: `Button`, `Input`, `Dialog`, `Table`, `EmptyState`, `Skeleton`, `Toast`…)
- [ ] Existe tela semelhante no produto? Abra-a: ela define layout, posição de ações e densidade que você deve repetir.
- [ ] Quais decisões de interação a tela exige? Para cada uma, consulte o catálogo `patterns/README.md` (ou `patterns/index.json`) — exemplos: modal ou página? toast ou inline? paginação ou "carregar mais"? tabela ou cards? quando validar o campo?

Registre as decisões numa lista curta (`decisão → padrão aplicado`). Ela entra no relatório final.

## 2. Regras de construção

**Tokens**
- Use **somente tokens semânticos** (`--color-text-primary`, `--space-stack-md`). Nunca primitivos (`--color-brand-600`) em componente, nunca valor cru (`#5754ed`, `13px`).
- Se faltar um token, **não invente valor**: proponha o token novo (nome + papel + valor + contraste) no relatório e use o mais próximo existente.

**Componentes**
- Reutilize. Só crie componente novo se nenhum existente servir **e** explique por quê.
- Variante nova de componente existente exige justificativa registrada (seção Components do DESIGN.md).

**Layout e hierarquia** (detalhes: `knowledge/fundamentos/hierarquia-visual.md`, `knowledge/design-system/espacamento-e-layout.md`)
- Um `h1` por página. Hierarquia por tamanho/peso/espaço antes de cor/caixas.
- Uma ação primária por região. Posição consistente com telas do mesmo tipo (`patterns/actions/action-placement.md`, `patterns/actions/button-hierarchy.md`).
- Espaçamento só da escala; agrupe por proximidade (Gestalt).
- Texto corrido ≤ 68ch.

**Formulários** (`knowledge/fundamentos/formularios.md`)
- Rótulo visível sempre; placeholder nunca substitui rótulo.
- Validação ao sair do campo ou ao enviar; erro junto ao campo + resumo no topo se houver vários; nunca apagar o que a pessoa digitou.
- Não desabilite o botão de envio para "evitar erro" — `patterns/actions/disabled-button.md`.

**Texto** — siga `skills/ux-writing/SKILL.md`: botões com verbo + objeto, erros que dizem o que houve e como resolver, vocabulário igual ao do resto do produto.

## 3. Estados obrigatórios

Toda superfície que recebe dados ou ação implementa:

| Estado | Padrão de referência |
|---|---|
| Carregando | `patterns/feedback/skeleton-vs-spinner.md`, `patterns/feedback/long-loading.md` |
| Vazio (primeiro uso, sem resultado, limpo pelo usuário) | `patterns/feedback/empty-state.md`, `patterns/search-filters/no-search-results.md` |
| Erro (validação, falha temporária, permissão) | `patterns/forms/form-errors.md`, `patterns/feedback/temporary-failure.md`, `patterns/feedback/retry.md` |
| Sucesso | `patterns/feedback/success-confirmation.md`, `patterns/feedback/toast-vs-inline-alert.md` |
| Envio em andamento | `patterns/actions/double-submit.md` |
| Interativos: hover, foco visível, ativo, desabilitado | `patterns/accessibility/keyboard-focus.md` |

Se o projeto tiver tema escuro, verifique os dois temas.

## 4. Verificação antes de entregar

Rode e corrija até passar:

```bash
node <DSX>/tools/lint-raw-values.mjs <pastas-alteradas>     # zero valores crus
node <DSX>/tools/contrast.mjs "<texto>" "<fundo>"           # para cada par novo de cor
node <DSX>/tools/lint-design-md.mjs DESIGN.md               # se você alterou o DESIGN.md
node <DSX>/tools/ux-lint/screen.mjs <captura.html> --ux UX.md   # gate de UX da tela (T1–T7), sobre a captura nova
node <DSX>/tools/ux-lint/states.mjs <capturas> --ux UX.md       # estados obrigatórios do arquétipo capturados (S1–S3)
node <DSX>/tools/lint-ux-md.mjs UX.md                           # se você alterou o UX.md
node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <m> --root .   # o UX.md ainda descreve as telas (U1–U6)
```

Achado de severidade ≥ 3 do ux-lint bloqueia a entrega (ou vira dívida registrada em `.dsx/findings/<modulo>/` com dono). Captura pela skill de captura do projeto (`capture-from-code` do DSX, ou o harness do projeto); sem captura, diga no relatório que o gate de UX não rodou.

**Mudou comportamento, atualize o `UX.md` no mesmo commit.** Tela nova ou removida, arquétipo, posição de ação, confirmação, feedback, estado ou fluxo diferente do que o `UX.md` diz: atualize a linha da tela (seção 5), a política ou o desvio (bloco `deviations` + tabela D…), o mapa `.dsx/maps/flows-<module>.json` se a navegação mudou, e suba `version` (política ou arquétipo → menor; só texto → patch) e `updated`. O drift (U5) acusa `updated` mais velho que as telas.

Se houver app rodando, abra a tela (navegador ou screenshot) e confira: largura 320px, zoom 200%, navegação só por teclado (Tab/Shift+Tab/Enter/Esc), tema escuro.

Checklist mínimo de acessibilidade (completo em `skills/acessibilidade/SKILL.md`):
- [ ] Todo controle tem nome acessível; ícone sem texto tem `aria-label`.
- [ ] Ordem de foco segue a ordem visual; foco nunca fica escondido.
- [ ] Alvo de toque ≥ 24px (padrão 44px).
- [ ] Erro comunicado por texto + ícone, não só cor; ligado ao campo por `aria-describedby`.
- [ ] Mudanças dinâmicas importantes anunciadas (`role="status"` / `role="alert"`).

**Design-system adherence is its own verdict** (Forward `design-system-lifecycle.md`): tokens and kit, semantics, rendered parity, interaction/accessibility and adoption, each pass/fail/unknown with the foundation revision. A clean `lint-raw-values` does not make a screen with poor action topology acceptable, and a good layout does not excuse unexplained drift.

## 5. Relatório de entrega

Termine com, no máximo, 15 linhas:

```
Componentes reutilizados: …
Componentes/variantes novos (com motivo): …
Tokens usados: … | Tokens propostos: …
Decisões de interação: <decisão> → <padrão>
Arquétipo: <id> (UX.md <version>) · desvios aplicados: D… ou nenhum
Estados implementados: carregando ✔ vazio ✔ erro ✔ sucesso ✔ foco ✔ …
Verificações: lint-raw-values 0 ocorrências · contraste OK · ux-lint sem sev ≥ 3 · drift 0 · teclado OK · 320px OK
UX.md: atualizado para <version> (o que mudou) | sem mudança de comportamento
Pipeline (Forward cycle only): blueprint check <n errors> · criteria pass n / fail n / unknown n · DS adherence <verdict> · critique 6/6
Pendências / riscos: …
```

Para uma segunda opinião independente, peça ao subagente `revisor-ux` que revise a tela **sem** receber seu raciocínio.
