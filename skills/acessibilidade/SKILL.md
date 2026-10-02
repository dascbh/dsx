---
name: acessibilidade
description: Audita e corrige acessibilidade de telas e componentes contra WCAG 2.2 nível AA — semântica e nomes acessíveis, teclado e foco (visível, não obscurecido, ordem), contraste de texto e de UI não textual, alvo de toque, formulários e erros, conteúdo dinâmico (live regions), zoom/reflow 320px, movimento reduzido e padrões ARIA de componentes (modal, abas, menu, combobox, toast). Use ao construir ou revisar qualquer UI, quando pedirem auditoria WCAG/a11y, antes de lançamento, ou quando um componente customizado substituir um elemento nativo.
---

# Acessibilidade (WCAG 2.2 AA)

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/` são relativos a ela.

Referências: `knowledge/design-system/acessibilidade.md` (requisitos por componente), `patterns/acessibilidade/*`, WAI-ARIA Authoring Practices Guide (APG) para padrões de widget.

**Regra zero:** use o elemento HTML nativo antes de ARIA. `<button>` em vez de `<div role="button">`, `<a href>` para navegação, `<dialog>`/biblioteca testada para modal. ARIA errada é pior que nenhuma.

## Procedimento

Rode na ordem — cada camada pega coisas que a anterior não pega.

### 1. Automático (pega ~30–40% dos problemas)
- Se o projeto tiver axe/Lighthouse/Playwright, rode-os na tela. Senão, recomende `@axe-core/playwright` no CI.
- `node tools/contrast.mjs <fg> <bg>` para cada par de cor da tela que não está nos tokens já verificados.
- `node tools/lint-raw-values.mjs <src>` — cor crua costuma ser contraste não verificado.

### 2. Teclado (manual, obrigatório)
- [ ] Todo interativo é alcançável com Tab, na ordem visual (2.4.3).
- [ ] Foco **sempre visível**, contraste ≥ 3:1, nunca `outline: none` sem substituto (2.4.7, 2.4.11).
- [ ] Foco não fica escondido sob header fixo, banner de cookies ou toast (2.4.11).
- [ ] Sem armadilha de teclado; Esc fecha overlays; foco volta ao gatilho ao fechar (2.1.2).
- [ ] Widgets compostos seguem o APG (abas com setas, menu com setas, combobox com setas + Enter).
- [ ] "Pular para o conteúdo" quando há navegação repetida (2.4.1).

### 3. Leitor de tela / semântica
- [ ] Um `h1`; níveis de título sem pulos; landmarks (`header`, `nav`, `main`, `footer`) (1.3.1).
- [ ] Todo controle tem nome acessível que **contém o texto visível** (4.1.2, 2.5.3).
- [ ] Ícone sem texto: `aria-label`; ícone decorativo: `aria-hidden="true"`.
- [ ] Imagens informativas com `alt` que diz a função/conteúdo; decorativas com `alt=""` (1.1.1).
- [ ] Campos com `<label>` associado; ajuda e erro ligados por `aria-describedby`; obrigatório indicado em texto e `aria-required` (1.3.1, 3.3.2).
- [ ] Erro de validação: `aria-invalid="true"`, mensagem em texto, foco movido para o resumo de erros ou o primeiro campo (3.3.1, 3.3.3).
- [ ] Mudanças dinâmicas anunciadas: `role="status"` para sucesso/progresso, `role="alert"` só para erro urgente (4.1.3).
- [ ] Estado de componentes exposto: `aria-expanded`, `aria-selected`, `aria-pressed`, `aria-current`, `aria-sort`.

### 4. Visual
- [ ] Texto ≥ 4.5:1; texto grande (≥ 24px ou ≥ 18.66px negrito) ≥ 3:1 (1.4.3).
- [ ] Bordas de campo, ícones informativos, estados de foco/seleção ≥ 3:1 contra o adjacente (1.4.11).
- [ ] Informação nunca só por cor (1.4.1) — `patterns/acessibilidade/nao-so-cor.md`.
- [ ] Zoom 200% sem perda; largura 320px sem rolagem horizontal (1.4.4, 1.4.10).
- [ ] Espaçamento de texto aumentado não quebra layout (1.4.12).
- [ ] Alvos ≥ 24×24px ou com espaçamento equivalente (2.5.8); padrão do sistema 44×44px — `patterns/acessibilidade/alvo-de-toque.md`.

### 5. Movimento, tempo e entrada
- [ ] `prefers-reduced-motion` respeitado; nada pisca > 3×/s (2.3.1).
- [ ] Carrossel/animação automática com pausa (2.2.2) — `patterns/conteudo/carrossel-automatico.md`.
- [ ] Limite de tempo avisado e extensível (2.2.1) — `patterns/autenticacao/sessao-expirada.md`.
- [ ] Arrastar tem alternativa de clique (2.5.7).
- [ ] Autenticação não exige teste cognitivo; permite colar senha e gerenciador de senhas (3.3.8).
- [ ] Não pedir de novo dado já informado no mesmo fluxo (3.3.7).

## Relatório

Para cada falha: **critério WCAG** (número + nome), **onde**, **quem é afetado** (teclado, leitor de tela, baixa visão, daltonismo, motor, cognitivo), **severidade** (bloqueia a tarefa = 4), **correção** com código quando possível.

Encerre com: `Conformidade estimada: AA ✔/✘ — N bloqueadores, N maiores, N menores. Testado com: <ferramentas/métodos>. Não testado: <o que ficou de fora, ex.: leitor de tela real>.`

Nunca declare "100% acessível". Declare o que foi testado.
