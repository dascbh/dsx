# Screen elements compared across design systems

> **When to consult**
> - When deciding the text, position or use of a button, field label, tooltip, title, description or message, and more than one convention is possible.
> - When assembling the options of a text survey (skill `ux-writing`): each option must say which convention it comes from.
> - When someone says "in system X it works like this": check here whether it is a general convention or a local choice.

Summary, in our own words, of the most cited public conventions — Material Design 3 (Google), Carbon (IBM), Polaris (Shopify), GOV.UK Design System, Atlassian Design System and Human Interface Guidelines (Apple). Guidelines change; check the source (`ux-sources.md`) before citing a rule as definitive. The **DSX** column is this framework's default choice for a pt-BR product; the project's `UX.md` may fix another. Quoted label examples in the DSX column and the "Recurring options" are pt-BR microcopy, kept verbatim.

## Button

| Aspect | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Label | short, states the action | 1–3 words, verb | verb + object ("Add product") | verb, describes what happens ("Continue", "Save and continue") | short, verb | verb or short action name | **verb + object**, up to 4 words (pt-BR: "Criar pedido") |
| Case | first letter capitalized only | first letter capitalized only | first letter capitalized only | first letter capitalized only | first letter capitalized only | **each word capitalized** (English) | first letter capitalized only; in pt-BR, title case sounds translated |
| Punctuation | no period | no period | no period | no period | no period | no period | no period, no dash, no parentheses |
| Primary per area | one highest-emphasis action | one primary per group | one primary per section | one per page (the page does one thing) | one primary per group | one default action per window | **one per region** (rule T1) |
| Order in a dialog | confirm on the right, dismiss on the left | primary on the right | primary on the right | does not use dialogs by default | primary on the right | default action on the right | **Cancel to the left of the action** |
| Vague labels | avoids "OK" without context | avoids "Yes/No" | avoids "OK"; repeats the title's verb | avoids "Click here" | avoids "OK" when there is a consequence | "OK" only to acknowledge information | never "OK", "Sim", "Confirmar" alone on an action with a consequence |

**Recurring options** for a button that carries a name (pt-BR example: "Remover da lista — Ricardo Almeida"):
- A · remove icon with accessible name "Remover Ricardo Almeida" and the name visible in the row (Carbon, Atlassian: per-row action);
- B · text "Remover" in the row, name in the accessible name (Polaris);
- C · action in the row menu "Mais ações ▸ Remover" (Material, when there are several actions per item).

## Field label

| Aspect | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Position | inside the field, floats up on focus (filled/outlined) | **above** the field | above | **above**, with a hint between label and field | above | on the left (window forms) or above | **above** or the kit's floating label; never placeholder only |
| Help text | below the field | below the field | below the field | between label and field ("hint") | below | below or footer | below, one sentence, only if it changes what the person types |
| Required × optional | asterisk on required fields | "(optional)" on optional fields | "(optional)" | **"(optional)"**; required is the default | asterisk | varies | one convention per form (the `UX.md` fixes it) |
| Punctuation | no colon | no colon | no colon | no colon | no colon | colon on left-aligned labels | no colon |

## Tooltip

| Aspect | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Purpose | name an icon; brief complement | short definition or icon label | icon label, extra non-essential information | **avoids** tooltips; uses visible text or expandable "details" | icon label, keyboard shortcut | name a control without text | name an icon-only button; never essential information |
| Length | a few words | 1 short sentence | 1 sentence | — | a few words | a few words | up to ~8 words; a long explanation becomes visible help text |
| Repeat the label | no | no | no | — | no | no | no (rule X7) |
| On a disabled control | avoids | avoids | avoids | — | avoids | avoids | no: explain the block in visible text |

## Title and description

| Aspect | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Page title | one, short, says where you are | one per page | name of the object or task | **one h1 per page**, the question or the task | one | window title | one `h1`, no compound separator ("X — Y" becomes title + context below) |
| Dialog title | states the action or the question | states the action | main button's verb repeated ("Delete product?" → "Delete") | — | states the action | states the action | question or action + object (pt-BR: "Excluir o pedido?") and a button with the same verb |
| Description under the title | optional, short | optional | only if it adds something | content before the form, short | optional | optional | **only if it adds** something the title does not say; never rephrase the title (rule X3) |
| Case | first letter capitalized | first letter capitalized | first letter capitalized | first letter capitalized | first letter capitalized | each word capitalized (titles, English) | first letter capitalized |

## Messages (error, empty, alert)

| Aspect | Convergence across systems | DSX |
|---|---|---|
| Field error | next to the field, says what to do (pt-BR: "Informe a data do contrato") | same; no "inválido" on its own |
| System error | says what happened, what the person can do and whether the data was preserved | same; no technical code on its own |
| Empty state | says what will appear there and the first action | same; one action, not two primaries |
| Alert | one per region, tone proportional to the risk | same; color is never the only signal |

## Checklist

- [ ] Each option offered in a survey says which convention it comes from (or "product choice").
- [ ] The project's `UX.md` fixes one option per aspect (label position, required × optional, dialog order).
- [ ] Visible text without dashes, compound titles, explanatory parentheses, or a period on a button (see `generated-text-marks.md`).
