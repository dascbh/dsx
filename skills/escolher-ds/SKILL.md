---
name: escolher-ds
description: "Escolhe e constrói o design system a partir de referências curadas (biblioteca designmd.app, 759 DESIGN.md, 40 avaliados): triagem pelo registro do produto, avaliação por dois linters, 3 opções + 1 contrastante mostradas nas telas do produto (Stitch) e adaptação no DESIGN.md do projeto. Use em projeto novo, redesenho ou quando sugerirem 'usa o estilo X'."
---

# Escolher e construir o design system

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `referencias/`, `tools/` são relativos a ela.

Referência: `knowledge/design-system/escolher-design-system.md` (registro, avaliação, apresentação, construção). Formato e linter oficial: `knowledge/design-system/design-md.md`.

**Princípio:** referência pronta acelera, mas só depois de três filtros, nessa ordem: **registro do produto** (para que uso), **avaliação objetiva** (o arquivo funciona?) e **adaptação** (vira o sistema *deste* produto, não uma cópia).

## 1. Contexto (antes de olhar estilos)

Levante, do código, dos mapas (`.dsx/mapas/`) ou perguntando o mínimo:
- persona e tarefa principal; frequência e duração de uso;
- **registro**: `operacional`, `consumo`, `editorial`, `marca` ou `experimental` (tabela no knowledge);
- densidade-alvo, plataforma (desktop, mobile), tema claro/escuro;
- o que já é fixo: cor de marca, fonte licenciada, componentes existentes;
- exigências de acessibilidade além do AA.
Sem problema declarado, passe pela skill `discovery` primeiro.

## 2. Triagem no catálogo

```bash
node tools/referencias.mjs buscar --registro <registro> --uso "<palavras da persona e do domínio>" --curados --n 8
node tools/referencias.mjs buscar --registro <registro> --uso "<...>" --n 15      # também os não curados
```
- Curados (`referencias/design-md/curados.json`) já têm nota e defeitos. Fora deles, baixe o candidato: `node tools/referencias.mjs baixar <slug>`.
- Descarte `experimental` para produto operacional; desconfie de estilo cujo caso de uso é só "landing page".

## 3. Avaliação objetiva de cada candidata

```bash
node tools/referencias.mjs avaliar referencias/design-md/designmd-app/<slug>.md
npx -y @google/design.md lint referencias/design-md/designmd-app/<slug>.md
```
Liste por opção: nota, contraste reprovado (componente e razão), componentes ausentes, avisos do linter oficial. Contraste < 4,5:1 → a opção só entra como "adaptável", com a correção proposta.

## 4. Apresentar 3 + 1

- Três opções no registro e **uma contrastante**. Para cada uma: o que favorece, o que piora, nota/defeitos, esforço de adaptação, e o crédito (designmd.app, CC BY 4.0).
- **Mostrar no produto:**
  - Projeto com telas: capture as telas-chave do código (skill de captura do projeto, ex. `code-to-stitch`; nunca gere a tela existente por texto) e, no Stitch, importe cada opção como design system (skill `stitch`, modo Sincronizar, a partir do DESIGN.md da opção) e use `apply_design_system` nas telas capturadas. Uma linha do canvas por opção.
  - Projeto sem telas: gere a mesma tela-chave com cada design system (skill `stitch`, modo Gerar) e critique cada uma (modo Criticar).
- **Pare e peça a escolha ao dono do produto.** Não escolha por ele.

## 5. Construir o DESIGN.md do projeto

Siga "Construção" do knowledge (copiar como rascunho com crédito → trocar identidade → papéis do DSX → corrigir defeitos → prosa do produto). Depois, a skill `design-md` (Modo C) avalia o resultado e a skill `tokens` gera rampas e escalas.

## 6. Validar e sincronizar

```bash
node tools/lint-design-md.mjs DESIGN.md
npx -y @google/design.md lint DESIGN.md
npx -y @google/design.md export --format dtcg DESIGN.md > tokens.dtcg.json   # se o projeto usa DTCG
```
Leve ao Stitch (skill `stitch`, modo Sincronizar) e confira com `node tools/stitch/design-system.mjs conferir`.

## Saída

```
Registro: <registro> · persona: <...> · fixos: <cor/fonte/…>
Opções: A <slug> (nota, defeitos) · B · C · contrastante D
Visto em: <projeto Stitch, telas>
Escolha do dono: <slug> → DESIGN.md do projeto (crédito mantido)
Gates: DSX <aprovado/reprovado> · oficial <erros/avisos> · Stitch <conforme/divergente>
```
