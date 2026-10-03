---
name: ux-md
description: "Cria, atualiza ou avalia o UX.md do projeto (como a interface se organiza e se comporta): extrai do código classificando cada tela num arquétipo, define para projeto novo ou audita com linter, ux-lint e revisão. Use quando faltar UX.md, telas do mesmo tipo divergirem ou pedirem para avaliá-lo."
---

# UX.md: criar, atualizar, avaliar

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `templates/`, `tools/`, `examples/`, `archetypes/` são relativos a ela; caminhos sem prefixo (`UX.md`, `.dsx/`, `src/`) são do projeto do usuário.

Contrato (schema, 13 seções, regras T1–T7 e F1–F5): `knowledge/fundamentos/ux-md.md`. Modelo: `templates/UX.md`. Exemplo aprovado: `examples/UX.md`. Catálogo de tipos de tela: `archetypes/` (um cartão por id).

**Princípio:** o `DESIGN.md` diz como a tela **parece**; o `UX.md` diz **que tipo de tela é, onde fica cada coisa e como ela se comporta**. O valor está no que ele impede o agente de adivinhar: posição da primária, quando confirmar, o que mostrar no vazio, como se volta.

## Escolha o modo

- Não existe `UX.md` e há produto/código → **Modo A: extrair**
- Não existe `UX.md` e o projeto é novo → **Modo B: definir**
- Existe `UX.md` → **Modo C: avaliar** (e depois corrigir as lacunas)

## Modo A — Extrair do código

1. **Mapas primeiro.** Se `.dsx/maps/` não existir ou estiver velho, rode a skill `mapear`. Leia `ui-map` (telas, diálogos, componentes), `flows` (grafo de navegação), `tasks` (passos e confirmações), `journey` (persona e momentos) e `domain` (vocabulário das entidades). Item em `uncertain` não é fato: confirme com `confirmar-mapas` ou marque "(inferido)".
2. **Mapa de fluxo com evidência.** Para cada módulo, garanta um `.dsx/maps/flows-<module>.json` com `screens`, `transitions` (`trigger` + `evidence` `arquivo:linha`) e `journeys` (formato em `knowledge/fundamentos/ux-md.md`). Sem evidência no código, a transição não entra.
3. **Capturas pelo código.** Se o projeto tem uma skill de captura pelo código (ex.: `code-to-stitch`), capture as telas principais e seus estados em HTML. São a entrada do ux-lint de tela e a referência de "como está hoje". Nunca reconstrua uma tela existente por texto.
4. **Classifique cada tela num arquétipo.** Para cada rota/diálogo do mapa, leia os cartões de `archetypes/` e escolha o de `quando-usar` que casa com a **tarefa** da tela (não com a aparência). SE nenhum casa → ENTÃO registre o desvio na seção 5 com o motivo. SE a tela faz duas tarefas de tipos diferentes → ENTÃO registre como desvio e proponha a separação.
5. **Derive as políticas do que o código já faz.** Conte, não suponha: onde está a primária nas telas do mesmo tipo, quantas primárias por região, ordem dos botões em diálogo, se ação irreversível pede confirmação, como o sucesso aparece (toast, inline), quais estados cada tela trata, como os formulários validam. A maioria vira a política no front matter; anote a evidência (arquivo ou tela) na prosa.
6. **Inconsistências viram "Não faça".** Toda divergência entre telas do mesmo arquétipo (ex.: primária no rodapé numa lista e no topo na outra; diálogo sobre diálogo; "Confirmar" em ação destrutiva) entra no bloco "Não faça" com a tela onde aparece. Problemas recorrentes resolvidos bem viram "Faça".
7. **Seletores de verificação.** Preencha `verification.selectors` com as classes reais do kit (ex.: botão cheio do MUI, variante destrutiva do shadcn) olhando as capturas.
8. **Pergunte ao usuário** só o que o código não responde: persona, o que é crítico errar, o que a experiência nunca faz, termos proibidos.
9. Valide (Modo C, passos 1 e 2).

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

## Modo C — Avaliar

**Passo 1 — Formato (automático):**
```bash
node <DSX>/tools/lint-ux-md.mjs UX.md          # --json para máquina
```
Qualquer ERRO reprova. Avisos de "sem cartão" indicam arquétipo sem referência no catálogo ainda.

**Passo 2 — Tela e fluxo (automático, gate objetivo):**
```bash
node <DSX>/tools/ux-lint/screen.mjs <pasta-de-capturas> --ux UX.md
node <DSX>/tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json --ux UX.md
```
Achados de severidade ≥ 3 são correção antes de entregar ou dívida registrada com dono. Registre em `.dsx/findings` e decida pelo registro: rode com `--json`, `node <DSX>/tools/ux-lint/findings.mjs register --module <m> --screen screen.json --flow flow.json --root <repo>`, e trate as decisões pelo registro (`findings.mjs page`/`decide`, contrato em `knowledge/fundamentos/achados-de-ux.md`). Dívida registrada = item `open` ou `ignored` com motivo; `findings.mjs check` no CI impede que piore.

**Passo 3 — Julgamento (skill `revisar-ux`):** o que a máquina não mede.
- O arquétipo atribuído casa com a tarefa de cada tela? (Leia o `quando-usar` e o `evitar-quando` do cartão.)
- As políticas do front matter são o que o produto faz de fato, ou são aspiração? Contradição sem registro é reprovação.
- "Faça e não faça" vêm de problemas reais (tela, achado, chamado) ou são genéricos?
- Percurso cognitivo das jornadas principais sobre as capturas, usando a seção 11 como roteiro.

**Saída:** lista de achados (onde, regra ou princípio, severidade 0–4, correção) e o diff proposto no `UX.md`.

## Checklist

- [ ] Toda tela e diálogo do mapa está no front matter `archetypes` ou declarado como desvio na seção 5.
- [ ] Políticas com evidência (Modo A) ou com o padrão que as justifica (Modo B).
- [ ] Inconsistências encontradas viraram "Não faça" com a tela de origem.
- [ ] `lint-ux-md.mjs` sem erro; `ux-lint` de tela e fluxo rodados e registrados em `.dsx/findings/<modulo>/`; severidade ≥ 3 tratada.
- [ ] Linha no `CLAUDE.md`/`AGENTS.md` do projeto: "antes de criar ou rearranjar tela, leia `UX.md`".
