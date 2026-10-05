# UX writing and microcopy

> **When to consult**
> - When writing or reviewing any visible text: button, label, error, empty state, confirmation, toast, tooltip, transactional email.
> - When defining or applying a product's tone of voice.
> - When the same thing appears under different names on different screens.
> - When reviewing spelling and text conventions in pt-BR.

Interface text is design: it decides whether the person understands what is about to happen. Write for someone scanning the screen, not for someone reading it.

The quoted strings in this file are pt-BR microcopy, kept verbatim and marked "pt-BR example"; the rules apply in the project's UI language unless a section says it is pt-BR specific.

---

## 1. Principles

1. **Clarity.** Say exactly what happens. If a sentence allows two readings, rewrite it.
2. **Concision.** Cut words that do not change the meaning. Labels of 1–3 words; supporting sentences up to ~20 words; one idea per sentence.
3. **Usefulness.** Every piece of text helps the person move forward. If it does not, remove it.
4. **Consistency.** One concept, one word, across every screen, email and notification.
5. **Accessibility.** Active voice, no jargon, understandable across literacy levels; do not depend on color, position or icon to give the text its meaning.

**General rules**
- Lead with the information that sets this apart (pt-BR example: "Fatura vence amanhã", not "Lembramos que a sua fatura vence amanhã").
- Address the person directly (in pt-BR, "você") and describe the system, not their fault.
- Use the audience's terms (interviews, tickets, searches), not the company's.
- Write the text together with the design and with real content; never fill it in afterwards.

---

## 2. Formulas

### Buttons
`infinitive verb + object` → pt-BR example: "Salvar rascunho", "Excluir projeto", "Enviar proposta".
- The label predicts the result: the dialog button repeats the verb of the question.
- Avoid (pt-BR examples) "OK", "Sim", a bare "Enviar", "Clique aqui".
- Loading state: gerund + ellipsis (pt-BR example: "Salvando…").
- See [button-text](../../patterns/ux-writing/button-text.md), [link-text](../../patterns/ux-writing/link-text.md).

### Error messages
`what happened + why/where + how to fix it`
- pt-BR example: "Não foi possível concluir o pagamento. O cartão foi recusado pelo banco. Use outro cartão ou fale com o emissor."
- On a field: a short sentence with the fix (pt-BR example: "Informe um CPF com 11 dígitos").
- Never blame (pt-BR example: "Você digitou errado"), never expose a technical code without translating it, never use humor.
- See [helpful-error-message](../../patterns/ux-writing/helpful-error-message.md), [form-errors](../../patterns/forms/form-errors.md).

### Empty states
`what appears here + why it is empty (if not obvious) + action`
- pt-BR example: "Nenhum projeto ainda. Projetos reúnem arquivos e pessoas de um mesmo trabalho. [Criar projeto]"
- Search, pt-BR example: "Nenhum resultado para "contrato 2025". Confira a grafia ou tente um termo mais geral."
- See [empty-state](../../patterns/feedback/empty-state.md).

### Confirmations (before acting)
Title as a question with the verb and the object; body with the consequence; buttons with the verb.
- Title, pt-BR example: "Excluir o projeto Lançamento?"
- Body, pt-BR example: "Os 14 arquivos e o histórico serão apagados. Não é possível desfazer."
- Buttons, pt-BR example: "Excluir projeto" (destructive) · "Cancelar".
- See [confirm-action](../../patterns/actions/confirm-action.md), [confirm-deletion](../../patterns/actions/confirm-deletion.md).

### Success
`what was done + what comes next (if anything)`
- pt-BR example: "Convite enviado para ana@exemplo.com. Ela tem 7 dias para aceitar."
- Celebrate in proportion to the achievement; a simple purchase does not call for fireworks.
- See [success-confirmation](../../patterns/feedback/success-confirmation.md).

### Labels and supporting text
- The label names the data (pt-BR example: "Data de nascimento"); supporting text gives the format or the reason (pt-BR example: "Usamos para confirmar sua idade").
- A placeholder does not replace a label ([label-vs-placeholder](../../patterns/forms/label-vs-placeholder.md)).

---

## 3. Tone of voice

**Voice** is the product's fixed personality. **Tone** is how that personality adjusts to the situation. The same person speaks differently at a funeral and at a party without ceasing to be who they are.

### The 4 dimensions (Nielsen Norman Group model)

Place the product from 1 to 5 on each axis.

| Dimension | Pole 1 | Pole 5 | pt-BR example, pole 1 | pt-BR example, pole 5 |
|---|---|---|---|---|
| Formality | Casual | Formal | "Pronto, salvamos tudo pra você." | "As informações foram registradas." |
| Humor | Funny | Serious | "Opa, tropeçamos aqui. Já estamos levantando." | "Estamos com instabilidade e trabalhando na correção." |
| Respect | Irreverent | Respectful | "Foi mal, a culpa é nossa." | "Lamentamos o transtorno." |
| Enthusiasm | Enthusiastic | Matter-of-fact | "Tudo salvo! Continue de onde parou." | "Alterações salvas." |

Reference words for each pole help keep the course: casual = close, direct; formal = precise, professional; funny = light; serious = considered; irreverent = bold; respectful = careful; enthusiastic = lively; matter-of-fact = objective.

### How tone varies by context

| Context | Adjustment | Rule |
|---|---|---|
| Error, failure, billing, data loss | More serious, respectful and matter-of-fact | Empathy is clarity and a solution, not emoji; zero humor |
| Security, privacy, health, money | More formal and precise | Never ambiguous; exact names for amounts and deadlines |
| Onboarding | Slightly enthusiastic | Enthusiasm without sacrificing instruction |
| Success | Proportional to the achievement | Small achievement, small celebration |
| Empty state, tips | Can be lighter | Without hiding the action |

### How to define the tone

1. Pick 3–5 personality adjectives (and what they are **not**: "direct, but not curt").
2. Gather the audience's language from reviews, support and forums.
3. Place the product on the 4 dimensions (1–5).
4. List preferred words and banned words.
5. Write before/after pairs for error, success, empty state, onboarding, billing.
6. Test samples with people from the audience and document them for every team.

**Anti-pattern:** a product with several personalities (light marketing in onboarding, cold engineering in errors). Review every text against the same guide.

---

## 4. pt-BR style rules

This section is specific to pt-BR interface text; every quoted string is a pt-BR example.

**Capitalization and punctuation**
- Sentence case: only the first letter capitalized in titles, buttons and labels ("Criar nova conta", not "Criar Nova Conta"). Proper nouns keep their capital.
- No period at the end of buttons, labels, titles and menu items. A period at the end of complete supporting sentences and messages.
- Exclamation marks sparingly: at most one, only for real success. Never in an error.
- Ellipsis as the single character "…" for in-progress states.

**Grammar**
- Buttons and menu items in the infinitive ("Salvar", "Baixar relatório"); instructions in the imperative ("Informe seu e-mail"). Do not mix forms in the same interface.
- Active voice: "Enviamos o código" instead of "O código foi enviado por nós".
- Avoid *gerundismo* ("vamos estar enviando" → "vamos enviar").
- Crase: required before a feminine word governed by "a" ("Volte à página inicial", "Às 18h"); forbidden before a verb and before a masculine word ("a partir de segunda", "a prazo"). After "até" it is optional ("até as 18h" or "até às 18h"): pick one form and keep it.
- Agreement with code-generated numbers: handle singular and plural ("1 item", "2 itens"; "Nenhum item") and never "item(s)".
- Gender: prefer neutral constructions where possible ("Boas-vindas" instead of "Bem-vindo(a)"; "Pessoas usuárias" only if the guide adopts it). Never use "(a)" or "@".
- Acronyms: take the gender of the spelled-out term ("a CNH", "o CPF", "a API").

**Numbers, dates and currency**
- Currency: "R$ 1.234,56" (space after R$, period as thousands separator, comma as decimal separator).
- Date: "dd/mm/aaaa" in fields; spelled out when ambiguous ("5 de março").
- Time: "14h30" or "14:30"; pick one format and keep it.
- Use digits for quantities in the interface ("3 arquivos"), not spelled-out numbers.

**Vocabulary**
- Prefer Portuguese when there is a common equivalent ("Entrar" instead of "Login" as an action; "Painel" instead of "Dashboard", unless the audience uses the English term).
- "E-mail" with a hyphen; "on-line" or "online": pick one spelling and record it in the glossary.
- Avoid "por favor" in short instructions; reserve it for requests that cost the person something.
- Avoid "clique"/"toque": describe the action ("Selecione", "Abra") or let the label speak.
- Links describe the destination ("Ver política de reembolso"), never "clique aqui".

---

## 5. Glossary consistency

- Keep a glossary with: preferred term, banned terms/rejected synonyms, a one-line definition, where it appears.
- Same action, same verb: if it is "Excluir" in one place, it is not "Apagar" or "Remover" in another (pt-BR example), unless they are different actions (removing from a list ≠ deleting from the system). If they are different, the names must be different **and** explained.
- Same object, same noun in menu, title, button, email and notification (pt-BR example: "assinatura" does not become "plano" in the email).
- Before creating a new term, look it up in the glossary. IF the concept exists THEN reuse the word.
- Review code-generated strings (plural, gender, concatenation) with extreme real values (0, 1, many, long names).

---

## 6. Anti-patterns

- Generic error (pt-BR example: "Algo deu errado") with no cause and no way out.
- Vague confirmation (pt-BR example: "Tem certeza?" + "Sim/Não").
- Placeholder used as a label, or carrying an instruction that disappears on typing.
- Needless anglicisms; internal jargon; unexplained acronyms.
- Different terms for the same thing across screens.
- Humor or emoji in an error, billing or data loss.
- Text that blames or pressures (pt-BR example: "Você esqueceu…", "Não, prefiro perder dinheiro"). See [dark-patterns.md](dark-patterns.md).
- Text written in isolation from the design and slotted in afterwards.

---

## Audit checklist

- [ ] Buttons with verb + object, in the infinitive; no "OK", "Sim" or "Clique aqui" (pt-BR examples).
- [ ] Errors say what happened, why/where and how to fix it, without blame and without humor.
- [ ] Confirmations name the object and the consequence; the button repeats the verb.
- [ ] Empty states say what appears there and offer the next action.
- [ ] Success says what was done and what comes next, with proportional enthusiasm.
- [ ] Tone adjusted to context within the same voice; serious in errors, money and security.
- [ ] Sentence case; no period at the end of labels and buttons; ellipsis "…" in in-progress states.
- [ ] Currency, dates and times in the Brazilian standard (pt-BR) and consistent.
- [ ] Plural and gender handled in dynamic strings; no "(s)" or "(a)".
- [ ] One term per concept on every screen, checked against the glossary.
- [ ] Links describe the destination; field labels persist.
- [ ] A person with no technical knowledge understands every sentence without rereading.
