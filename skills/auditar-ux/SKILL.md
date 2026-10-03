---
name: auditar-ux
description: "Auditoria de UX de um módulo inteiro, por dimensão: confere capturas, mapa de fluxo e UX.md, roda todos os detectores com um comando, registra os achados, revisa por julgamento o que a máquina não mede, propõe opções, gera a página de decisão, aplica as decisões na origem e re-audita. Use quando pedirem auditoria de UX de um módulo ou produto, \"o que está ruim nessa área\", antes de uma rodada de correções de UX ou para medir se a UX melhorou desde a última vez."
---

# Auditar UX

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `references/`, `tools/` são relativos a ela.

Referências: `knowledge/fundamentos/dimensoes-de-ux.md` (as 14 dimensões e como ler o relatório), `data/ux-dimensions.json` (a matriz), `knowledge/fundamentos/achados-de-ux.md` (registro, ids, status), `knowledge/fundamentos/ux-md.md` (regras T/F e insumos), skill `ux-writing` (opções de texto), skill `revisar-ux` (método de julgamento por tela).

Diferença para `revisar-ux`: aquela revisa uma tela ou um fluxo; esta audita um módulo inteiro, com registro durável e relatório por dimensão, e termina com as decisões aplicadas e uma re-auditoria.

## 1. Pré-requisitos

A auditoria só vale com três insumos do projeto, nesta ordem de importância:

1. **Capturas das telas pelo código do projeto** (HTML renderizado a partir dos componentes reais, nunca tela gerada por texto). Padrão: `<projeto>/.stitch/<módulo>/code/<nn>-<tela>.html`. Estados (vazio, erro, carregando, sem acesso…) ficam ao lado: `<nn>-<tela>.<estado>.html`. No AURIS a captura é a skill `code-to-stitch` do projeto.
2. **Mapa de fluxo conferido**: `<projeto>/.dsx/maps/flows-<módulo>.json`, gerado pela skill `mapear` (mapeador de fluxos) com evidência arquivo:linha e confirmado com o dono pela skill `confirmar-mapas`. Mapa não conferido gera F1/F5 falsos.
3. **`UX.md`** na raiz do projeto, válido em `node <DSX>/tools/lint-ux-md.mjs UX.md` e **em dia com o produto**: a auditoria roda o drift (`tools/ux-lint/ux-md-drift.mjs`) como pré-requisito e avisa "UX.md desatualizado: …" (tela sem arquétipo, arquétipo de tela que sumiu, política que a maioria das telas não segue, estado sem captura, `updated` velho, desvio vencido). Sem `UX.md` valem os padrões do DSX, e as regras que dependem de declaração (posição da ação primária, estados obrigatórios, termos proibidos, desvios aceitos) perdem força; com `UX.md` desatualizado, os achados medem contra uma regra velha. Atualize-o (skill `ux-md`, Modo C) antes de decidir achados que dependem do ponto acusado.

Também: as pastas de código onde o texto nasce (`--code`), para o texto apontar arquivo:linha; e a **geometria medida** das capturas (`<projeto>/.stitch/<módulo>/geometry/*.geometry.json`, gerada por `node <DSX>/tools/ux-lint/measure.mjs <capturas> --out <pasta> --ux UX.md`, que precisa do Playwright no projeto), sem a qual as regras L de layout e hierarquia não rodam. Com `--measure` a auditoria mede antes de rodar.

## 2. Rodar a auditoria e registrar

```bash
node <DSX>/tools/ux-lint/audit.mjs --module <m> --root <projeto> --register [--measure]
```

O comando confere os pré-requisitos (e diz como gerar o que falta), roda os detectores que existirem (texto, tela, fluxo, layout, estados, consistência), grava em `<projeto>/.dsx/findings/<m>/findings.json` e imprime o **relatório por dimensão**. Padrões: `--screens <root>/.stitch/<m>/code`, `--geometry <root>/.stitch/<m>/geometry`, `--map <root>/.dsx/maps/flows-<m>.json`, `--ux <root>/UX.md`, `--code <root>/frontend/src <root>/backend/shared` (só os que existem). Sem `--register`, compara com o registro sem gravar (útil antes de mexer).

- **SE** um pré-requisito falta **ENTÃO** gere-o com o comando indicado e rode de novo; não substitua captura ausente por julgamento.
- **SE** um detector aparece como ausente ou fora do registro **ENTÃO** a dimensão dele vai para o julgamento (passo 3) nesta rodada e o relatório final diz isso.
- **SE** aparecem novos ou regressões **ENTÃO** comece por eles.
- **SE** um achado é diferença de propósito do produto (vale para uma regra em várias telas) **ENTÃO** declare o desvio no bloco `deviations` do `UX.md` (com `rules` e `screens`) em vez de `ignore` um por um; na próxima execução ele aparece como "desvio aceito", com o motivo, e não conta como aberto. Desvio que sai do `UX.md` reabre o achado.
- O glossário do C3 e do X10 é o do módulo (`content.glossary: { default: …, <m>: … }`); a auditoria repassa o `--module`.

## 3. Julgamento do que a máquina não mede

Leia na matriz (`data/ux-dimensions.json`) a cobertura de cada dimensão, ou a linha "revisar com" do relatório:

| Cobertura (efetiva) | O que fazer |
|---|---|
| Regra automática | Conferir os achados na captura (falso positivo vira `ignore` com motivo no passo 5) |
| Regra automática + julgamento | Conferir os achados e revisar as **lacunas** da dimensão com o knowledge dela |
| Julgamento | Revisar tela a tela com o knowledge indicado (`knowledge` da dimensão) |
| Só referência | Usar a lei ou o princípio para justificar e dimensionar achados das outras dimensões |

Ordem sugerida: dark patterns (se há consentimento, cobrança ou recusa) → arquitetura da informação e navegação → heurísticas (percurso cognitivo das jornadas do mapa, com as quatro perguntas de `revisar-ux`) → estados → acessibilidade (skill `acessibilidade`) → lacunas das dimensões parciais.

Cada problema encontrado vira um caso em `cases.json` (formato em `knowledge/fundamentos/achados-de-ux.md`), com:
- `rule`: a regra da família quando ela cabe (texto que o detector não pegou entra como `X3`, `X4`…); senão um id de revisão de `review_rules` na matriz — `H1`…`H10`, `DP`, `IA`, `A11Y` (critério WCAG na mensagem), `LAW` (a lei na mensagem);
- `severity` 0–4 pela escala de `knowledge/fundamentos/heuristicas-nielsen.md`, atribuída depois de juntar todos;
- `problem` com a evidência (tela, região, o que se vê) e o princípio violado; julgamento sem princípio nomeado não é achado;
- `screens` e `source` (arquivo:linha quando souber).

Registre com `node <DSX>/tools/ux-lint/findings.mjs options --module <m> --from cases.json --root <projeto>`: caso que casa com achado do detector liga as opções a ele; caso novo entra como achado `origin: review`.

## 4. Propor opções

Para cada achado aberto que o dono precisa decidir, 2–3 opções no próprio `cases.json`, com a convenção que as sustenta e uma recomendada com o porquê. Texto: siga a skill `ux-writing` (fórmulas, glossário, verbo + objeto). Layout e ações: cite o arquétipo e o padrão (`patterns/<categoria>/<id>.md`). Achado sem decisão real (correção única e óbvia) leva uma opção só.

## 5. Página de decisão

```bash
node <DSX>/tools/ux-lint/audit.mjs --module <m> --root <projeto> --page <projeto>/.dsx/findings/<m>/page.html
```

(ou `findings.mjs page`). O dono escolhe uma opção ou "Ignorar" com motivo e copia o JSON; grave com `findings.mjs import --module <m> decisions.json --root <projeto>` ou `findings.mjs decide` para uma decisão dita no chat. A página é gerada, não versionada.

## 6. Aplicar na origem

Corrija onde o problema nasce: o `source` (arquivo:linha) do achado, o template e não cada variante, a constante de texto e não a tela. Uma decisão por vez ou em lote por arquivo. Mudou regra de produto (posição de ação, estado obrigatório, termo proibido)? Atualize o `UX.md` junto.

## 7. Re-auditar

Recapture as telas alteradas e rode de novo o passo 2 com `--register`. O que sumiu vira `fixed`; o que voltou, `regression`. Achado de revisão não some sozinho: reveja a tela e decida de novo. Ligue `findings.mjs check` no pre-commit ou CI do projeto.

## Relatório final (padrão)

```
Auditoria de UX · <módulo> · <data> · commit <sha>
Insumos: <n> telas + <n> capturas de estado · mapa conferido em <data> · UX.md <válido|ausente>
Detectores: texto ✓ · tela ✓ · fluxo ✓ · layout <✓|ausente> · estados <✓|ausente> · consistência <✓|ausente>

Por dimensão (cobertura efetiva · abertos s4/s3/s2/s1 · novos · corrigidos · regressões)
  <dimensão> · <cobertura> · <a/b/c/d> · <n> · <n> · <n>
  …
Julgamento feito: <dimensões revisadas à mão> · <n> achados de revisão (regra ou heurística citada)
Decisões: <n> aplicadas · <n> ignoradas com motivo · <n> pendentes
Re-auditoria: antes <n> abertos → depois <n>; regressões <n>
Fica aberto: <lacunas das dimensões e o que precisa de pesquisa com usuários>
```

Não declare uma dimensão "boa" só porque não tem achado: diga a cobertura e as lacunas dela.

## Checklist

- [ ] Capturas pelo código, mapa conferido e `UX.md` válido antes de rodar.
- [ ] `audit.mjs --register` rodado; registro gravado em `.dsx/findings/<m>/`.
- [ ] Toda dimensão de julgamento ou referência revisada com o knowledge indicado; achados com regra ou id de revisão, severidade e princípio.
- [ ] Opções escritas (texto pela `ux-writing`) e página de decisão entregue ao dono.
- [ ] Decisões aplicadas na origem e `UX.md` atualizado quando a regra de produto mudou.
- [ ] Re-auditoria registrada; relatório final no formato acima.
