---
name: escolher-ds
description: "Escolhe e constrói o design system a partir de referências curadas (biblioteca designmd.app, 759 DESIGN.md, 40 avaliados): triagem pelo registro do produto, avaliação por dois linters, 3 opções + 1 contrastante mostradas nas telas do produto (Stitch) e adaptação no DESIGN.md do projeto. Use em projeto novo, redesenho ou quando sugerirem 'usa o estilo X'."
---

# Escolher e construir o design system

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `references/`, `tools/` são relativos a ela.

Referência: `knowledge/design-system/escolher-design-system.md` (registro, avaliação, apresentação, construção). Formato e linter oficial: `knowledge/design-system/design-md.md`.

**Princípio:** referência pronta acelera, mas só depois de três filtros, nessa ordem: **registro do produto** (para que uso), **avaliação objetiva** (o arquivo funciona?) e **adaptação** (vira o sistema *deste* produto, não uma cópia).

## 1. Contexto (antes de olhar estilos)

Levante, do código, dos mapas (`.dsx/maps/`) ou perguntando o mínimo:
- persona e tarefa principal; frequência e duração de uso;
- **registro**: `operational`, `consumer`, `editorial`, `brand` ou `experimental` (tabela no knowledge). SE o projeto tem `UX.md` → ENTÃO use o `product.register` e a `product.density` dele (os arquétipos das telas já dependem desse registro); escolher outro registro aqui é mudança maior do `UX.md` (skill `ux-md`, `version` 2.0.0) e precisa do dono;
- densidade-alvo, plataforma (desktop, mobile), tema claro/escuro (`--theme light|dark`);
- o que já é fixo: cor de marca, fonte licenciada, componentes existentes;
- exigências de acessibilidade além do AA.
Sem problema declarado, passe pela skill `discovery` primeiro.

## 2. Triagem no catálogo

```bash
node tools/references.mjs search --register <registro> --use "<palavras da persona e do domínio>" --curated --n 8
node tools/references.mjs search --register <registro> --use "<...>" --n 15          # também os não curados
```
- Curados (`references/design-md/curated.json`) já têm nota (`score`) e defeitos (`contrast_failures`, `errors`, `warnings`). Fora deles, baixe o candidato: `node tools/references.mjs fetch <slug>`.
- Descarte `experimental` para produto operacional; desconfie de estilo cujo caso de uso é só "landing page".

## 3. Avaliação objetiva de cada candidata

```bash
node tools/references.mjs evaluate references/design-md/designmd-app/<slug>.md
npx -y @google/design.md lint references/design-md/designmd-app/<slug>.md
```
Liste por opção: nota, contraste reprovado (componente e razão), componentes ausentes, avisos do linter oficial. Contraste < 4,5:1 → a opção só entra como "adaptável", com a correção proposta.

## 4. Apresentar 3 + 1

- Três opções no registro e **uma contrastante**. Para cada uma: o que favorece, o que piora, nota/defeitos, esforço de adaptação, e o crédito (designmd.app, CC BY 4.0).
- **Mostrar no produto** (as telas mostradas cobrem os arquétipos principais do `UX.md`, quando existe — uma lista, um detalhe ou editor, um diálogo —, porque o tema quebra de jeitos diferentes em cada tipo de tela):
  - Projeto com telas e captura pelo código (skill `capture-from-code`): **renderize as telas reais com o tema de cada opção** — um tema por cima do tema do produto, montado do front matter da referência (paleta, fonte, raio e as cores fixas que o tema do produto tiver). Envie ao Stitch uma linha por opção, mesma tela na mesma coluna, mais a linha do atual. Escolha um ou dois fluxos curtos, não o produto inteiro.
  - **Não use `apply_design_system` em telas capturadas do código**: elas carregam o CSS real com cores fixas, e a ferramenta quase não muda nada (testado em 2026-10-02: só um selo mudou). Ela funciona em telas geradas pelo próprio Stitch.
  - Projeto sem telas: gere a mesma tela-chave com cada design system (skill `stitch`, modo Gerar) e critique cada uma (modo Criticar).
- **Critique cada opção nas telas, não no arquivo:** o que quebra no uso real (ex.: tema escuro deixa escura a folha de um documento; paleta neutra apaga a distinção por cor entre estados de campo) pesa mais que a nota. Anote também o que **não** mudou com o tema: são cores fixas no código do produto, dívida de design system a registrar.
- **Pare e peça a escolha ao dono do produto.** Não escolha por ele.

## 5. Construir o DESIGN.md do projeto

Siga "Construção" do knowledge (copiar como rascunho com crédito → trocar identidade → papéis do DSX → corrigir defeitos → prosa do produto). Depois, a skill `design-md` (Modo C) avalia o resultado e a skill `tokens` gera rampas e escalas.

## 6. Validar e sincronizar

```bash
node tools/lint-design-md.mjs DESIGN.md
npx -y @google/design.md lint DESIGN.md
npx -y @google/design.md export --format dtcg DESIGN.md > tokens.dtcg.json   # se o projeto usa DTCG
```
Leve ao Stitch (skill `stitch`, modo Sincronizar) e confira com `node tools/stitch/design-system.mjs check`.

## Saída

```
Registro: <registro> · persona: <...> · fixos: <cor/fonte/…>
Opções: A <slug> (nota, defeitos) · B · C · contrastante D
Visto em: <projeto Stitch, telas>
Escolha do dono: <slug> → DESIGN.md do projeto (crédito mantido)
Gates: DSX <aprovado/reprovado> · oficial <erros/avisos> · Stitch <conforme/divergente>
```
