# Marks of generated and bureaucratic text

> **When to consult**
> - Before writing or reviewing interface text produced by an agent (an AI draft carries these marks by default).
> - When reading the report from `tools/ux-lint/text.mjs` and deciding how to rewrite each finding (rules X1–X11).
> - When a screen "feels robotic", "looks AI-made" or "has too much text" and you need to say exactly why.
> - This file does not cover screen architecture or per-element formulas: for that, see `ux-writing.md`.

**Language.** The detector judges the project's UI language: pt-BR by default; `content.language: en` in the `UX.md` selects the English pack. The before/after examples below are pt-BR examples, kept verbatim; the explanation of each mark applies to either language.

Interface text is not an essay. People using an operational product read in passing, between one task and the next, looking for the next action. Some constructions give away that the text was generated without looking at that person: they sound like a slide deck, embellish what should be plain, or repeat what the screen already says. Each mark below gives why it bothers, how to recognize it, how to rewrite it, and the rule the tool uses to find it.

---

## 1. Dash as a dramatic pause (X1, X1b)

**Why it bothers.** The em dash has become the most recognizable signature of generated text: it creates suspense where there is none and joins two ideas that should be two sentences, or one sentence with a comma. In labels and buttons it also takes up space and gets in the way of screen readers (some read it aloud as "dash").

**How to recognize it.** "—" or "–" in the middle of interface text. The en dash between numbers and dates (`1–8`, `2024–2026`) does not count: that is a range. A lone dash in a cell meaning "no value" is a separate mark (X1b): it looks genuinely empty, tells nothing, and disappears for people using a screen reader.

**How to rewrite it.** Pick the punctuation that expresses the relation: comma for continuation, colon for explanation, period for two ideas. For a missing value, state the reason or leave it empty with a caption.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Aprovado fora da plataforma — sem registro do aprovador | Aprovado fora da plataforma, sem registro do aprovador |
| Envio concluído — confira os anexos | Envio concluído. Confira os anexos. |
| Célula: — | Não informado (ou célula vazia) |

## 2. Compound "X — Y" title (X2)

**Why it bothers.** A title with two blocks ("Revisar antes de gravar · arquivo.docx", "Etapa 2: escolher modelo") splits attention: the person cannot tell which part is the subject. On a button, "Remover da lista — Ana Souza" lengthens the target and repeats the name already on the row.

**How to recognize it.** A title, tab or button with a separator in the middle: em dash, en dash, colon, middle dot or vertical bar.

**How to rewrite it.** Keep the subject in the title and move the rest to where it belongs: the object's name goes into the button's accessible name (aria-label); the count, into a badge; the file name, into a supporting line.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Botão "Remover da lista — Ana Souza" | Botão "Remover", aria-label "Remover Ana Souza da lista" |
| Revisar antes de gravar · itens.xlsx | Título "Revisar antes de gravar"; apoio "Arquivo: itens.xlsx" |
| Preço · 3 | "Preço" com selo "3" |

## 3. "Not only X, but Y" and triads

**Why it bothers.** These are persuasion formulas: "não apenas organiza, mas também acelera", "rápido, seguro e confiável". In an operational product nobody needs convincing; they need to know what happens. Adjective triads sound like a brochure and are almost never verifiable.

**How to recognize it.** "Não só/não apenas … mas também" (in English, "not only … but also"); three adjectives or three verbs in a row with no concrete information. The tool does not flag this (it takes reading); look for it in manual review.

**How to rewrite it.** Replace the promise with the fact the person uses to decide.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Não só envia o pedido, mas também acompanha cada etapa. | Envia o pedido e mostra quem já confirmou. |
| Um fluxo simples, rápido e seguro. | (cut: the screen shows the flow) |

## 4. Description that repeats the title (X3)

**Why it bothers.** "Endereço de entrega" followed by "Endereço de entrega deste fornecedor." spends a line saying the same thing. The person reads it twice, learns that supporting text is not worth it, and starts ignoring it even when it carries something important.

**How to recognize it.** Text right below the title that reuses most of its words without adding a fact, or whose first sentence only rephrases the title.

**How to rewrite it.** Cut the repetition. If something remains, make it what the title does not say: consequence, deadline, who sees it, what to do.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Título "Endereço de entrega"; apoio "Endereço de entrega deste fornecedor. Só o comprador responsável altera." | Título "Endereço de entrega"; apoio "Só o comprador responsável altera." |
| Título "Rascunhos salvos"; apoio "Aqui ficam os rascunhos que foram salvos." | Título "Rascunhos salvos", sem apoio; ou apoio "Rascunhos ficam 90 dias depois do último acesso." |

## 5. Empty opener (X4)

**Why it bothers.** "Aqui você pode", "Nesta tela", "Esta página mostra", "Use esta aba para", "Veja abaixo", "Clique aqui" (pt-BR examples; in English, "Here you can", "On this screen", "Click here") describe the interface instead of helping to use it. They are the first words, the most read, spent on nothing.

**How to recognize it.** Supporting text, alert, tip or placeholder that starts with one of these formulas.

**How to rewrite it.** Start with what the person does or gains; they already know where they are, they are in it.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Aqui você pode acompanhar os pedidos enviados. | Pedidos enviados e quem já confirmou. |
| Use esta aba para revisar os itens antes de gravar. | Revise os itens antes de gravar. |
| Clique aqui para baixar o modelo. | Link "Baixar modelo" |

## 6. Generic adjectives

**Why it bothers.** "Poderoso", "intuitivo", "completo", "robusto", "inteligente", "fácil" (powerful, intuitive, complete, robust, smart, easy) say nothing the person can check, and the product does not need to praise itself from within.

**How to recognize it.** An evaluative adjective applied to the product itself or to the action ("um modo fácil de", "an easy way to"). The tool does not flag this; look for it in manual review.

**How to rewrite it.** Cut the adjective or replace it with a number, deadline or consequence.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Importação inteligente de itens | Importar itens de uma planilha .xlsx |
| Um jeito fácil de gerar pedidos em lote | Gere até 50 pedidos de uma vez |

## 7. Explanatory parenthesis (X9)

**Why it bothers.** "Configurar fornecedores (nome e CNPJ)" admits the label is not enough and patches it with an aside. In a field label, "(só neste pedido)" hides an important rule in a whisper.

**How to recognize it.** A parenthesis containing words in a label, button, title or tab. Numbers ("Histórico (3)"), acronyms ("(CNPJ)") and "(opcional)" do not count.

**How to rewrite it.** Choose a label that already says everything; if the rule matters, it becomes visible supporting text.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Configurar fornecedores (nome e CNPJ) | Configurar fornecedores |
| Preço unitário (só neste pedido) | Rótulo "Preço unitário"; apoio "A mudança vale só para este pedido." |
| Cadência (dias) | Cadência em dias |

## 8. Essay punctuation in labels and buttons (X5)

**Why it bothers.** A period at the end of a button, tab or title and a colon on a label above a field are running-text habits. In the interface they become visual noise and make the label look like a sentence.

**How to recognize it.** A button, title or tab ending in "."; a label ending in ":" or ".". Progress ellipses ("Carregando…") and a confirmation question mark ("Excluir pedido?") are correct.

**How to rewrite it.** Remove the punctuation. If the title needs a period because it is a full sentence, it is probably supporting text.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Botão "Salvar pedido." | Salvar pedido |
| Rótulo "Nome da parte:" | Nome da parte |
| Título "Resposta registrada em 02/10/2026 14:37." | Título "Resposta registrada"; apoio "Em 02/10/2026, às 14:37" |

## 9. Title Case (X10)

**Why it bothers.** "Pedidos e Fornecedores", "Resumo Executivo", "Baixar Nota Assinada": capitalizing every word is an English convention. In pt-BR, only proper nouns and acronyms take a capital mid-phrase; the rest weighs on reading and looks like a translation.

**How to recognize it.** A button, tab or title in which every content word after the first starts with a capital. Acronyms ("TO BE", "PDFs") are excluded; domain proper nouns go in `content.proper-nouns` in the UX.md.

**How to rewrite it.** Capitalize only the first letter (plus proper nouns and acronyms).

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Pedidos e Fornecedores | Pedidos e fornecedores |
| Simulador de Regimes | Simulador de regimes |
| Baixar Word | Baixar Word (if "Word" is declared as a proper noun) |

## 10. Button that is not an action (X6)

**Why it bothers.** A button with five or more words becomes a sentence and stops reading as a target. A button without a verb ("Novo item", "Categorias") forces the person to guess whether it creates, opens or filters. A bare "OK", "Sim" or "Confirmar" does not say what it confirms.

**How to recognize it.** A button with more than 4 words; a button that does not start with an infinitive verb (when the UX.md sets `content.buttons: verb-object`); labels from the list without an object. Clickable cards, list items, sorting and chips are not evaluated.

**How to rewrite it.** Verb + object, up to 4 words. Detail goes into the supporting text or the dialog title.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Novo item | Criar item |
| Baixar PDF para assinar fora | Baixar PDF |
| Confirmar | Confirmar vínculo |

## 11. Tip that repeats or over-explains (X7) and placeholder that repeats the label (X8)

**Why it bothers.** A tooltip or aria-label identical to the visible text makes the screen reader repeat the same thing and does not help someone hovering. A tip longer than 12 words is an explanation hidden behind a gesture many people never make. A placeholder equal to the label disappears on typing and teaches nothing.

**How to recognize it.** `title` or `aria-label` equal to the text of the same element (except truncated text, where the tip is the full text); a long tip on a control; a placeholder that contains the label.

**How to rewrite it.** Remove the redundant attribute. An explanation that matters becomes visible supporting text. The placeholder shows the expected format, or goes.

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Botão "Salvar" com title "Salvar" | Botão "Salvar" sem title |
| Dica "Refaz a leitura dos dados e o OCR das páginas pendentes. Dados confirmados não mudam." | Botão "Ler de novo"; apoio "O que você confirmou não muda." |
| Rótulo "CNPJ", placeholder "CNPJ" | Rótulo "CNPJ", placeholder "00.000.000/0000-00" |

## 12. Implementation term (X11)

**Why it bothers.** "sha256", "hash", "token", "payload", "API", "JSON", "5xx", "OCR" are the builder's words, not the user's. For the person, they become noise or insecurity ("what is this? did I do something wrong?").

**How to recognize it.** Terms from `content.forbidden` in the UX.md, plus the tool's default list. "OCR" passes when it is explained in the same sentence.

**How to rewrite it.** State the effect with the domain's word. Technical detail, if support needs it, goes into a secondary field (`patterns/feedback/technical-error-code.md`).

| Before (pt-BR example) | After (pt-BR example) |
|---|---|
| Documento (sha256, o mesmo da aprovação) | É o mesmo documento que foi aprovado |
| Erro 5xx ao enviar | Não conseguimos enviar agora. Tente de novo em instantes. |
| Refaz o OCR das páginas | Lê de novo as páginas digitalizadas |

---

## Fix at the source

The text that appears on screen is almost never born on the screen: it comes from a vocabulary file, a template with interpolated data, or a server response. Run the tool with `--code` to get `file:line` for each finding and fix it there, once, for every screen that uses the text.

- **IF** the finding points to a template (`Remover da lista — ${nome}`) → THEN fix the template; all variants go away together.
- **IF** the flagged piece (the dash, the capital letter) came from interpolated data (an order, person or category name) → THEN it is not interface text; the tool separates these cases as "likely data".
- **IF** the same text appears on many screens (navigation, header) → THEN fix it first: the gain is proportional to frequency.

## Checklist

- [ ] No em dash or en dash outside a numeric range; a missing value says "Não informado" (pt-BR example) or stays empty.
- [ ] Titles, tabs and buttons have a single subject; object name in the aria-label, count in a badge.
- [ ] No "not only … but also", no adjective triad, no self-praising adjective.
- [ ] Supporting text adds a fact the title lacks; no empty opener.
- [ ] Labels, buttons and titles without explanatory parenthesis, without a final period and without a colon.
- [ ] Sentence case everywhere; capitals only for proper nouns and acronyms.
- [ ] Buttons: verb + object, up to 4 words.
- [ ] Tip and aria-label do not repeat the visible text; short tip; placeholder shows the format.
- [ ] No visible implementation term.
- [ ] Each fix made at the source (`file:line` from the report), not in the capture.
