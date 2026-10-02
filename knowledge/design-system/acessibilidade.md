# Acessibilidade no design system (WCAG 2.2 AA)

## Quando consultar

- Ao criar, alterar ou revisar qualquer componente interativo.
- Ao definir estilos de foco, alvos de toque, animações ou mensagens de status.
- Ao montar a seção de acessibilidade da documentação de um componente.
- Ao auditar uma tela: use a matriz por componente como roteiro.

## Princípios operacionais

1. **Acessibilidade é anatomia, não acabamento.** Ela entra na especificação do componente; corrigir depois multiplica o custo por cada tela que reusou o erro.
2. **HTML nativo primeiro.** `<button>`, `<a href>`, `<input>`, `<select>`, `<dialog>`, `<table>` resolvem papel, teclado e estado. ARIA só preenche o que o nativo não oferece. `div` clicável é falha.
3. **Nome visível = nome programático** (2.5.3). O texto que a pessoa vê precisa estar contido no nome acessível.
4. **Automação não certifica.** Ferramenta automática encontra uma parte dos problemas; complete com teclado, leitor de tela, zoom e, quando possível, pessoas reais.
5. **Componente aprovado isolado pode falhar no fluxo.** Teste composições: modal dentro de formulário, toast sobre header fixo.
6. **Nada de overlays de acessibilidade "de um clique".** Não resolvem a experiência.

## Requisitos transversais (valem para todo componente)

| Requisito | Regra | Critério |
|---|---|---|
| Contraste de texto | 4,5:1 (3:1 só para ≥ 24px ou ≥ 18,66px negrito) | 1.4.3 |
| Contraste não textual | 3:1 para contorno de controle, ícone informativo, indicador de estado e foco | 1.4.11 |
| Não só cor | Estado e significado com sinal extra (texto, ícone, forma) | 1.4.1 |
| Teclado | Tudo operável por teclado, sem armadilha | 2.1.1, 2.1.2 |
| Ordem de foco | Segue a ordem lógica/visual | 2.4.3 |
| Foco visível | Indicador sempre visível ao navegar por teclado | 2.4.7 |
| Foco não obscurecido | O elemento focado não pode ficar totalmente coberto por conteúdo do autor (header fixo, banner de cookies, toast) | 2.4.11 |
| Alvo de ponteiro | ≥ 24 × 24 CSS px ou espaçamento equivalente; padrão do sistema 44px | 2.5.8 |
| Arrastar | Toda ação de arrastar tem alternativa com clique/toque simples | 2.5.7 |
| Zoom e reflow | Utilizável a 200%; sem rolagem 2D a 320 CSS px | 1.4.4, 1.4.10 |
| Espaçamento de texto | Suporta entrelinha 1,5, letras 0,12em, palavras 0,16em, parágrafos 2em sem perda | 1.4.12 |
| Nome, papel, valor | Estados (expandido, selecionado, marcado, desabilitado) expostos programaticamente | 4.1.2 |
| Mensagens de status | Anunciadas sem mover o foco | 4.1.3 |

### Foco: especificação padrão do sistema

```css
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: var(--size-focus-ring) solid var(--color-border-focus);
  outline-offset: var(--space-0_5);
}
```

- `color.border.focus` tem par validado ≥ 3:1 contra `color.bg.canvas` nos dois temas (ver `tokens/contrast-pairs.json`). Se o componente fica sobre outra superfície (`bg.surface`, `action.primary`), valide esse par também.
- Use `:focus-visible` para não mostrar o anel em clique de mouse, mas **nunca** `outline: none` sem substituto equivalente.
- Anel de 2px com afastamento é a meta recomendada. O critério de aparência do foco (2.4.13) é AAA; adotá-lo como padrão evita discussões caso a caso.
- Para não ser obscurecido: `scroll-padding-block-start` igual à altura do header fixo; toasts e barras fixas não se posicionam sobre o conteúdo focável sem deslocá-lo.

### Alvo de toque

- Mínimo normativo: **24 × 24 px** (2.5.8). Exceções: alvo inline em texto, alvo com espaçamento suficiente (um círculo de 24px centrado nele não toca outro alvo), controle nativo não estilizado, ou quando o tamanho é essencial.
- Padrão do sistema: **44px** (`size.touch-target`). Use sempre em mobile e em ações primárias.
- Aumente a área clicável sem aumentar o visual: padding no próprio elemento ou `::after` posicionado. Em checkbox e radio, o `<label>` faz parte da área clicável.

### Movimento reduzido

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Durações do sistema: `motion.feedback` (120ms), `motion.transition` (200ms), `motion.overlay` (320ms). Nada além disso sem justificativa.
- Com movimento reduzido: troque deslocamento, zoom e paralaxe por fade curto ou mudança instantânea. Mantenha o feedback de estado (ele é informação), remova o movimento decorativo.
- Animação automática que dura mais de 5 segundos precisa de pausar/parar/ocultar (2.2.2).
- Nada pisca mais de 3 vezes por segundo (2.3.1).
- Animação disparada por interação poder ser desligada é AAA (2.3.3); respeitar `prefers-reduced-motion` cobre esse caso na prática.

## Matriz por tipo de componente

### Botão

- Elemento `<button>` (ou `<a>` se navega para outra URL; a regra é: ação = botão, destino = link).
- Nome acessível vem do rótulo visível; botão só com ícone exige `aria-label` e o ícone com `aria-hidden="true"`.
- Estados visuais e programáticos: hover, `:focus-visible`, active, disabled, loading. Em loading, mantenha o foco no botão, use `aria-busy="true"` ou anuncie o progresso por região viva, e impeça duplo envio.
- Desabilitado: prefira explicar por que a ação não está disponível. Se o botão precisa continuar descobrível por teclado, use `aria-disabled="true"` e bloqueie a ação no código, em vez de `disabled`.
- Alvo ≥ 24px; altura padrão `size.control-md` (40px) e área de toque 44px.
- Rótulo de ação preenchida em `color.text.on-action` (par validado).

### Link

- `<a href>` real. Texto descreve o destino fora de contexto (2.4.4); evite "clique aqui", "saiba mais" soltos.
- Distinto do texto ao redor por algo além da cor: sublinhado em texto corrido.
- `aria-current="page"` no item da navegação que representa a página atual.
- Link que abre nova aba ou baixa arquivo avisa no texto ou por ícone com nome acessível.

### Campo de texto (input/textarea)

- `<label for>` associado ao `id`; placeholder **não** substitui label.
- Instruções e formato esperado visíveis antes do erro (3.3.2), associados por `aria-describedby`.
- Obrigatório marcado visualmente (texto ou asterisco explicado) e com `required`/`aria-required`.
- `autocomplete` correto para dados pessoais (nome, e-mail, telefone, endereço).
- Erro: identificado em texto (3.3.1), específico e com sugestão de correção (3.3.3), `aria-invalid="true"`, mensagem ligada por `aria-describedby`, ícone + texto + borda (não só cor). A mensagem persiste até a correção.
- Ao enviar com erros: foque o primeiro campo inválido ou um resumo de erros com links.
- Contorno do campo ≥ 3:1 (`color.border.strong`).
- Colar sempre permitido, inclusive em senha e código (3.3.8). Não peça de novo o que já foi informado no fluxo (3.3.7).
- Transações legais/financeiras: permitir revisar, corrigir ou desfazer antes de confirmar (3.3.4).

### Select, combobox, autocomplete

- Prefira `<select>` nativo. Customizado só se houver necessidade real (busca, rich content) e seguindo o padrão ARIA de combobox: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` ou foco nas opções.
- Teclado: setas navegam, Enter seleciona, Esc fecha e devolve o valor anterior, digitação filtra.
- Número de resultados anunciado por região viva ("5 resultados").
- Mudar a seleção não dispara navegação nem envio automático (3.2.2).

### Checkbox, radio, switch

- Inputs nativos com `<label>`; o rótulo amplia a área de clique.
- Grupos em `<fieldset>` com `<legend>` que nomeia a pergunta.
- Estado marcado visível por forma (check, ponto, posição do switch), não só cor; indicador com 3:1.
- Radio: setas movem a seleção dentro do grupo; Tab entra e sai do grupo.
- Switch representa liga/desliga com efeito imediato; se precisa de "salvar", use checkbox. Exponha `role="switch"` e `aria-checked`.
- Checkbox "selecionar todos" com estado misto usa `aria-checked="mixed"` ou `indeterminate`.

### Modal / diálogo

- `<dialog>` com `showModal()` ou `role="dialog"` + `aria-modal="true"`; título ligado por `aria-labelledby`.
- Ao abrir: foco vai para o primeiro elemento útil (ou para o título, em conteúdo longo).
- Enquanto aberto: foco preso dentro; fundo inerte (`inert`), sem rolagem de fundo.
- Esc fecha (exceto quando fechar perderia dados sem aviso; então confirme). Botão de fechar visível com nome acessível.
- Ao fechar: foco volta ao elemento que abriu.
- Véu em `color.bg.overlay`; o conteúdo do modal não depende do fundo para contraste.
- Não abra modal sobre modal. Não use modal para tarefa contínua que exige consultar a tela de trás.

### Abas (tabs)

- `role="tablist"`, `role="tab"` com `aria-selected` e `aria-controls`, `role="tabpanel"` com `aria-labelledby`.
- Tab entra na lista e vai para o painel; setas esquerda/direita alternam abas; Home/End vão para a primeira/última (tabindex móvel).
- Aba selecionada indicada por forma (sublinhado, peso, borda) além da cor; indicador ≥ 3:1.
- Ativação automática ao focar só quando o painel carrega instantâneo; senão, ativação manual com Enter/Espaço.

### Toast / notificação

- Mensagem de status em `role="status"` (`aria-live="polite"`); só erros urgentes usam `role="alert"`.
- A região viva deve existir no DOM antes da mensagem ser inserida.
- Não feche automaticamente mensagens de erro nem toasts com ação ("Desfazer"). Para os demais, tempo suficiente para ler (heurística de partida: ~5s mais um acréscimo proporcional ao tamanho do texto), pausa em hover/foco e botão de fechar (2.2.1).
- Ícone + título por tipo (`color.feedback.*-icon`/`-text`), nunca só cor.
- Posição que não cubra o elemento focado nem a ação principal.
- Informação crítica não pode existir só no toast; repita-a na tela.

### Tabela de dados

- `<table>` com `<caption>` (ou nome via `aria-labelledby`), `<th scope="col|row">`.
- Ordenação: botão dentro do `<th>`, `aria-sort` no cabeçalho ativo.
- Ações por linha com nome que inclui o item ("Editar contrato 123", não só "Editar").
- Linhas selecionáveis com checkbox real e "selecionar todos" no cabeçalho.
- Responsivo: rolagem horizontal no contêiner com cabeçalho visível, ou lista que preserva rótulo-valor. Nunca `display: block` na tabela sem reconstruir a semântica.
- Status em célula: texto ou ícone com nome, não só cor de fundo.

### Tooltip

- Aparece em hover **e** em foco do gatilho; ligado por `aria-describedby` (descrição) ou é o próprio nome em botão de ícone.
- 1.4.13: dispensável (Esc fecha sem mover o foco), alcançável (o ponteiro pode passar para o tooltip sem ele sumir), persistente (fica até a pessoa sair ou dispensar).
- Só texto curto e complementar. Sem links, botões ou informação essencial: para isso use popover ou "toggletip" acionado por clique.
- Não use tooltip em elementos desabilitados não focáveis (ninguém por teclado o alcança).

### Menu / dropdown de ações

- Botão gatilho com `aria-haspopup="menu"` e `aria-expanded`.
- `role="menu"` com `menuitem` **apenas** para menus de ações (tipo aplicação). Navegação do site usa lista de links com padrão de disclosure, não `role="menu"`.
- Teclado: Enter/Espaço/seta para baixo abre e foca o primeiro item; setas navegam; Home/End; Esc fecha e devolve o foco ao gatilho; Tab fecha e segue.
- Item destrutivo identificado por texto (e cor `color.action.danger` como complemento) e confirmado conforme o risco.

## Testes mínimos por componente

1. Só teclado: Tab, Shift+Tab, Enter, Espaço, setas, Esc, Home/End.
2. Leitor de tela (um desktop e um móvel): nome, papel, estado e anúncios.
3. Zoom 200% e largura 320px.
4. Temas claro e escuro, e modo de alto contraste do sistema.
5. `prefers-reduced-motion: reduce`.
6. Checagem automática no CI como rede de proteção, não como certificado.

Documente no componente: como ele é anunciado, que teclas usa e quais pares de contraste consome.

## Anti-padrões

- `outline: none` sem substituto.
- `div`/`span` com `onclick` como botão.
- Placeholder como label.
- Erro só em vermelho, ou que some sozinho.
- Modal sem gestão de foco ou sem retorno ao gatilho.
- `role="menu"` na navegação principal.
- Tooltip com conteúdo essencial ou interativo.
- Toast de erro com fechamento automático.
- Header fixo cobrindo o campo focado.
- Animação de entrada longa sem respeitar movimento reduzido.

## Checklist

- [ ] Elemento HTML nativo correto; ARIA só onde necessário e correto.
- [ ] Nome acessível contém o rótulo visível.
- [ ] Contraste 4,5:1 texto e 3:1 contornos/ícones/foco, nos dois temas.
- [ ] Foco visível (`size.focus-ring` + `color.border.focus`) e nunca obscurecido.
- [ ] Alvo ≥ 24px; 44px no padrão do sistema.
- [ ] Teclado completo conforme a linha do componente nesta matriz.
- [ ] Estados expostos programaticamente; mensagens de status anunciadas.
- [ ] Movimento reduzido respeitado; nada pisca.
- [ ] Testado com teclado, leitor de tela, zoom 200% e 320px.
