# Paridade UX.md × DESIGN.md (DSX 0.7)

Decisão do dono: o `UX.md` tem a mesma importância e a mesma dinâmica de atualização do `DESIGN.md`. O `DESIGN.md` diz como a interface **parece**; o `UX.md` diz **que tipo de tela é cada uma, onde fica cada coisa e como ela se comporta**. Este inventário parte de `grep -rn "DESIGN.md"` (fora de `references/`) e registra, para cada lugar onde o `DESIGN.md` é tratado, o equivalente do `UX.md`.

Legenda: **já existia** (o equivalente estava lá antes da 0.7) · **criado agora** (entrou na 0.7) · **não se aplica** (com o motivo).

## Peças centrais

| Onde o DESIGN.md é tratado | Equivalente do UX.md | Situação |
|---|---|---|
| Skill `design-md` (Modos A/B/C, rubrica, gates) | Skill `ux-md`: Modos A/B/C; Modo C ganhou nota de 100, gates, drift, geração controlada e saída no mesmo formato | já existia; atualizado agora |
| Rubrica de 100 pontos + 5 gates (`evals/rubrics/design-md.yaml`) | `evals/rubrics/ux-md.yaml`: 9 critérios calculados por código (somam 100), 5 gates (`lint`, `essential-coverage`, `policy-fidelity`, `connected-to-agent`, `no-conflict`) e `judge-criteria` para o juiz | criado agora |
| Linter `tools/lint-design-md.mjs` | `tools/lint-ux-md.mjs` (já validava formato); agora também `--score` (nota por critério, faixas e gates) e validação de `deviations`, `version` semver e glossário por módulo. O DESIGN.md não tem cálculo de nota por código: a do UX.md vai além | já existia; `--score` criado agora |
| Conferência de drift (código × front matter: `lint-raw-values`, `hazards[]` do `extrator-design-system`) | `tools/ux-lint/ux-md-drift.mjs` (U1–U6: tela sem arquétipo, arquétipo de tela que sumiu, política que a maioria das telas não segue, estado sem captura, `updated` velho, desvio vencido); pré-requisito com aviso no `audit.mjs` | criado agora |
| `owner`/`updated`/`version: alpha` (formato) | `version` vira semver do documento (menor: política, arquétipo, desvio; patch: texto; maior: navegação/register), `format: alpha` para o formato, `updated` obrigatório na prática (frescor na nota e no drift). `version: alpha` é aceito com aviso | criado agora |
| `templates/DESIGN.md` | `templates/UX.md`: version/format, comentário de quando subir, bloco `deviations`, tabela "Desvios declarados", glossário por módulo, instrução "mesma mudança, mesmo commit" | já existia; atualizado agora |
| `examples/DESIGN.md` | `examples/UX.md`: `version: 1.4.0`, `format: alpha`, glossário inline, `deviations` D1–D3 e padrões citados como evidência | já existia; atualizado agora |
| `knowledge/design-system/design-md.md` | `knowledge/fundamentos/ux-md.md`: seções novas "Versão e frescor", "Desvios declarados", "Nota e gates", "Drift UX.md × produto", "Glossário por módulo"; o `design-md.md` agora aponta para o par | já existia; atualizado agora |
| Registro de achados (o DESIGN.md não tem) | Desvio declarado no `UX.md` silencia o achado coberto: status `accepted-deviation` em `findings.mjs` (não conta em abertos nem na trava, aparece na página com o motivo, reabre se o desvio sai ou vence); `knowledge/fundamentos/achados-de-ux.md` atualizado | criado agora |

## Skills

| Skill | Como trata o DESIGN.md | Equivalente do UX.md | Situação |
|---|---|---|---|
| `iniciar` | cria/avalia o DESIGN.md e liga ao contexto dos agentes | passo 4 "UX.md" (Modo A/B/C com `--score` e drift); bloco de contexto do `CLAUDE.md`/`AGENTS.md` diz "antes de criar ou alterar UI, leia `DESIGN.md` (como parece) e `UX.md` (que tipo de tela, onde fica cada coisa, como se comporta)"; gates de CI com `lint-ux-md` e `ux-md-drift`; relatório com nota do UX.md | criado agora |
| `construir-ui` | para sem DESIGN.md | para sem UX.md (manda para `iniciar`/`ux-md` Modo A); lê o arquétipo e os desvios da tela antes de construir; gate final com `ux-lint` (screen, states), `lint-ux-md` e drift; "mudou comportamento, atualize o UX.md no mesmo commit"; relatório com arquétipo e versão | criado agora |
| `design-md` | é a skill do DESIGN.md | validação passo 3 liga os dois num bloco só | criado agora |
| `ux-md` | — | a skill do UX.md | já existia; atualizado agora |
| `revisar-ux` | (não citava) | lê desvios da tela (divergência coberta não é achado), falta de UX.md é o primeiro achado, drift desatualiza a regra; registro com `accepted-deviation` | já existia; atualizado agora |
| `auditar-ds` | DESIGN.md na documentação, nível 4 de maturidade, plano e métrica | UX.md e drift na documentação; nível 4 exige DESIGN.md **e** UX.md ≥ 90 sem drift; plano e CI com `lint-ux-md`/`ux-md-drift`; métrica "nota do UX.md e % de telas com arquétipo". O par de comportamento por módulo é `auditar-ux` | criado agora |
| `auditar-ux` | — | pré-requisito "UX.md em dia" (drift), desvio em vez de vários `ignore`, glossário por módulo repassado | já existia; atualizado agora |
| `padroes` | DESIGN.md vence padrão, com divergência apontada | o UX.md escolhe entre opções do padrão e vale para o arquétipo inteiro; decisão recorrente vai para o UX.md (versão menor) em vez de tela a tela | criado agora |
| `stitch` | sincroniza o DESIGN.md com o Stitch e critica cores | prompt descreve o arquétipo e as políticas do UX.md (o Stitch não importa UX.md); `ux-lint/screen.mjs` no HTML gerado; ao trazer, UX.md atualizado se a tela é nova. A sincronização do design system continua só com o DESIGN.md: **não se aplica** ao UX.md porque o Stitch não tem onde guardá-lo | criado agora (parte) |
| `escolher-ds` | constrói o DESIGN.md a partir da referência | usa `product.register`/`density` do UX.md quando existe (outro registro = versão maior do UX.md); telas mostradas cobrem os arquétipos principais | criado agora |
| `evals` | rubrica `design-md.yaml`, comparar versões do DESIGN.md | rubrica `ux-md.yaml`, `lint-ux-md --score` e `ux-lint` como avaliadores de código, UX.md entre as versões comparadas | criado agora |
| `arranjar-tela` | lê DESIGN.md para a aparência | já lia o UX.md (arquétipo, desvios, "Fere o UX.md?") | já existia |
| `ux-writing` | glossário no DESIGN.md ou docs | glossário de `content.glossary` do UX.md, por módulo, com `--module` em `text.mjs`/`consistency.mjs` | já existia; atualizado agora |
| `figma-ciclo` | gate "regra nova de uso → DESIGN.md na mesma rodada" | gate "mudança de comportamento → UX.md na mesma rodada" | criado agora |
| `figma-trazer` | classe "padrão novo → DESIGN.md"; regra nova de uso é documentação | classe "comportamento" → UX.md + `ux-lint`; mesma regra de documentação | criado agora |
| `figma-primeiro` | fundação vira tokens + DESIGN.md antes da 1ª tela | telas viram UX.md (Modo B) antes da 1ª tela — sem ele, `construir-ui` para | criado agora |
| `figma-levar` | DESIGN.md é pré-requisito obrigatório | UX.md é pré-requisito **não bloqueante**: dá os estados por tela (states + arquétipo) e o agrupamento por arquétipo | criado agora |
| `figma-fundacoes` | DESIGN.md + tokens → variáveis do Figma | não se aplica: variáveis são aparência; nada do UX.md vira variável |
| `figma-espelhar` | fonte das fundações do espelho | não se aplica: espelha a aparência do código; estados e arquétipo chegam pelo `figma-levar` |
| `figma-iniciar` | fonte de verdade da ida (DESIGN.md + tokens) | não se aplica: registro do ciclo; comportamento entra pelos gates de `figma-ciclo`/`figma-trazer` |
| `figma-convencoes` | descrição de componente vem do DESIGN.md | não se aplica: regra de uso de componente é visual; regra de tela está no UX.md e não vai para o componente |
| `tokens` | atualiza o front matter e Colors do DESIGN.md | não se aplica: tokens não têm comportamento |

## Agentes, ferramentas, testes

| Onde | Equivalente do UX.md | Situação |
|---|---|---|
| `agents/juiz-de-evals.md` | aceita UX.md como artefato e `judge-criteria` | criado agora |
| `agents/revisor-ux.md` | compara comportamento com o arquétipo declarado; desvio não é achado; roda `screen.mjs` | criado agora |
| `agents/mapeador-projeto.md`, `mapeador-ui.md` | detectam `UX.md` junto do `DESIGN.md` | criado agora |
| `agents/mapeador-jornada.md` | lê persona, tarefas e jornadas do UX.md | criado agora |
| `agents/extrator-design-system.md` | não se aplica: extrai o design system visual (`design-system.json`); o UX.md sai dos mapas de UI e fluxo pela skill `ux-md` Modo A |
| `tools/ux-lint/audit.mjs` | drift como pré-requisito (aviso "UX.md desatualizado: …", item `ux-fresh`) e seção "UX.md × produto" no relatório; `--module` repassado a texto e consistência; desvios aceitos contados à parte | criado agora |
| `tools/ux-lint/findings.mjs` | `accepted-deviation`, `--ux`, `deviations` no registro, página com o motivo | criado agora |
| `tools/ux-lint/consistency.mjs`, `text.mjs` | `--module` escolhe o glossário (`lib/glossary.mjs`); no texto, termos canônicos com maiúscula no meio são nomes próprios no X10 | criado agora |
| `tools/lib/yaml-lite.mjs` | listas em bloco (`- id: D1`), para o bloco `deviations` | criado agora |
| `tools/references.mjs` | não se aplica: biblioteca pública de DESIGN.md de terceiros; não há equivalente de UX.md |
| `tools/stitch/design-system.mjs` | não se aplica: o Stitch só importa DESIGN.md |
| `tools/stitch/analyze-html.mjs` | equivalente de comportamento é `ux-lint/screen.mjs` sobre o HTML gerado (skill `stitch`) | criado agora (pelo procedimento, sem ferramenta nova) |
| testes do DESIGN.md (`tools.test.mjs`, `stitch.test.mjs`, `legacy-cli.test.mjs`) | `lint-ux-md.test.mjs` (existia) e `ux-md-parity.test.mjs` (nota, drift, desvio aceito, glossário por módulo, auditoria) | criado agora |
| `hooks/` | não se aplica: o único hook guarda a vez do Figma; o DESIGN.md também não tem hook |

## Documentos

| Onde | Equivalente do UX.md | Situação |
|---|---|---|
| `README.md` | UX.md como peça central (fonte de verdade, ferramentas, templates, examples, evals, diagrama) | criado agora |
| `AGENTS.md` | roteamento (`iniciar` sem UX.md, `ux-md` com nota/drift/desvios, `construir-ui` para sem os dois) e ferramentas (`--score`, `ux-md-drift`, `--module`, `--ux`) | criado agora |
| `docs/integracoes.md` | `@UX.md`, bloco da `iniciar` passo 6, Cursor e Copilot | criado agora |
| `docs/principios.md` | "Uma fonte de verdade": o UX.md define comportamento | criado agora |
| `docs/fluxo-figma.md` | fundação no código inclui o UX.md | criado agora |
| `docs/renames-2026-10.md` | `version: alpha` → semver + `format: alpha` | criado agora |
| `knowledge/design-system/design-system-para-ia.md`, `README.md` | camada "Comportamento" (UX.md) entre visual e operação | criado agora |
| `knowledge/design-system/governanca-e-maturidade.md` | UX.md no nível 4 | criado agora |
| `knowledge/ia/divida-de-experiencia.md`, `knowledge/ia/README.md` | UX.md entre os documentos de contexto que toda geração lê | criado agora |
| `knowledge/design-system/componentes.md`, `cor.md`, `escolher-design-system.md` | não se aplica: tratam de componente, cor e estilo visual |
| `knowledge/ia/evals.md`, `evidencia-e-fontes.md` | não se aplica: regras gerais de rubrica e evidência, que já valem para o UX.md |
| `CLAUDE.md` (do DSX) | não se aplica: cita o DESIGN.md só como exceção de formato externo nos nomes; o UX.md segue a regra geral (kebab-case), já descrita |
| `data/gap-analysis/web-design-rules.json` | não se aplica: análise de lacunas de terceiros sobre decisão visual (ícone) |

## O que fica de fora de propósito

- O drift (U1–U6) não entra no registro de achados: acusa o **documento** velho, não a tela errada. A correção é atualizar o UX.md.
- Os critérios abertos (o arquétipo casa com a tarefa? as políticas são reais? o desvio é justificado?) não somam pontos na nota de código; são `judge-criteria` e gates de julgamento, como os critérios `judge`/`human` do DESIGN.md.
- `version` do UX.md deixou de ser a versão do formato (diferente do DESIGN.md, que segue o formato do Google): a decisão do dono pede versão do documento, e o formato foi para `format`.
