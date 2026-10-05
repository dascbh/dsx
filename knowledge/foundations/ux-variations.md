# UX variations

> **When to consult**
> - Before proposing other versions of a screen or a flow (skill `rethink-ux`).
> - When a flow's findings keep repeating with the same cause and fixing them one by one does not solve it.
> - To judge whether a set of alternatives is genuinely diverse or the same idea in different clothes.

## What a variation is

A variation is **another answer to the same task**, with a central idea you can state in one sentence and that changes what the person sees, the order in which they do things, what happens when they act and the words they read. Changing the button color is a tweak; moving the button somewhere else is an arrangement; splitting the task differently, changing who decides when, or replacing a confirmation with an undo is a variation.

The comparison is only useful if the alternatives are **comparable** (same task, same persona, same fictitious data, same product components) and **different** (central ideas that do not fit inside one another).

## Variation axes

Each axis is a lever. A strong variation moves several of them, all in service of the same idea.

| Axis | Question | Example moves |
|---|---|---|
| **Screen structure** | What kind of screen solves the task? | step wizard → single-page form with sections; list + detail → table with inline editing; side panel → its own page |
| **Flow split** | How many steps, in what order, where does it start? | merge steps that do not depend on each other; start from what the person already has (the spreadsheet, the contract), not from what the system needs; drop the final review when everything is already in view |
| **Interaction model** | How does the person act on the data? | pick one by one → select in bulk; fill in a form → edit in the table; drag → pick from a list; copy an existing one instead of starting from scratch |
| **Density and text** | How much text, and of what kind? | long instruction → self-explanatory label; paragraph of rules → warning at the point where the rule bites; generic title → title that states the result ("Generate 12 orders") |
| **Validation timing** | When does the person find out something is wrong? | on submit → on leaving the field → while typing (format only); batch error at the end → issue flagged on each row before generating |
| **Confirmation × undo** | Does the action ask permission first or allow going back afterwards? | "Are you sure?" dialog → immediate action with "Undo" for a few seconds; generic confirmation → confirmation that restates the consequence (how many, which) |
| **Foreground × background** | Does the person wait or keep working? | blocking wait screen → inline progress and a notice when done; generate everything before showing → show each item as soon as it is ready; manual save → autosave with an indicator |

Use `patterns/` for the concrete solution to each move (`form-steps`, `split-form`, `validation-timing`, `undo`, `confirm-action`, `long-loading`, `progress-percentage`, `autosave-vs-save`…) and `archetypes/` for the structure (`step-wizard`, `operational-list`, `editor-with-panel`, `form-dialog`…).

## How to generate genuine alternatives

1. **Start from the cause, not the symptom.** Group the flow's findings by cause ("the person picks the template before knowing how many recipients they have", "the text explains what the structure hides"). Each cause suggests an axis.
2. **Force opposing central ideas.** A useful trio: one that **cuts** (fewer steps, less screen, less text), one that **reorganizes** (another starting point, another order, another interaction model) and one that **changes behavior** (undo, early validation, background work). If two variants fit in the same sentence, drop one.
3. **Switch archetype at least once.** Read the current archetype's `evitar-quando`: if it describes the real use (a daily task in a wizard built for a rare task), one variant should use the archetype it points to.
4. **Ask "what if it didn't exist?"** for each step, dialog and paragraph. What remains when the step disappears is a variant.
5. **Borrow from another screen of the product itself** that already solves a similar problem: consistency is an argument, and the components already exist.
6. **Only then write the text.** The variant's text is rewritten for the new structure (titles that state the result, buttons with verb and object, no step instruction that the structure made obvious), through the skill `ux-writing`.

## Hypothesis and trade-off

**Hypothesis** = change → effect → for whom → how we will know. Example: "Merging template and recipients into one screen cuts clicks from 9 to 4 for people who generate batches every week; we measure it by the time until the .zip is downloaded." Without "for whom", the hypothesis decides nothing; without "how we will know", it cannot fail.

**Trade-off** = what gets worse, for whom, and the risk. Every variation makes something worse: a denser screen for the novice, less chance to review, higher build cost, a new component. A variant with no written trade-off was not thought through. Write the trade-off with the same precision as the hypothesis ("first-time users no longer see the explanation of step 2").

## Traps

- **Cosmetic variation:** color, icon, button order, spacing. It does not change the task; it is a tweak and goes to `audit-ux` or `arrange-screen`.
- **Straw man:** two bad variants so the third can shine. The owner notices and the comparison loses its value; each variant must be the best version of its idea.
- **Disguised favorite:** three versions of the same idea. Test: are the three concept sentences interchangeable?
- **Forgetting states:** the variant looks great with data and breaks when empty, on error or with a recovered draft. Capture the states the archetype requires.
- **Promising without measuring:** "fewer clicks" without counting. Declare the metrics and check them with `variations.mjs measure`.
- **Fixing one finding by creating another:** the variant removes the dash and creates an unlabeled field. The `lint` flags a new finding; severity ≥ 3 fails.
- **Incoherent composition:** "B's flow with A's text" when A's text talks about a step that B removed. Rewrite the text for the combination.
- **Mockup instead of product:** a variation drawn outside the real components compares a promise with a product. Build it through the project's capture harness.
- **Mistaking review for proof:** the comparison shows likely problems and plausible gains; an expensive decision calls for testing with users (skill `research`).

## Quick decisions (IF → THEN)

- **IF** the task is daily and the flow is a wizard **THEN** one variant should be a single page with sections.
- **IF** the person already arrives with the data ready (spreadsheet, document) **THEN** one variant starts from it.
- **IF** the flow ends with a long wait **THEN** one variant moves the work to the background with inline progress.
- **IF** the action is reversible and frequent **THEN** one variant replaces the confirmation with undo; **ELSE** (irreversible, costly) the confirmation stays and restates the consequence.
- **IF** the text explains a rule the structure could show **THEN** one variant removes the text and shows the rule where it applies.

## Checklist

- [ ] Persona, task and current metrics written down with a source; the flow's findings grouped by cause.
- [ ] Three opposing central ideas, each in one sentence.
- [ ] Each variant moves screen, flow, behavior and text in service of its idea.
- [ ] Archetype, patterns and laws cited by id.
- [ ] Hypothesis with effect, audience and measure; trade-off with what gets worse and for whom.
- [ ] Required states captured; metrics checked; no new finding of severity ≥ 3.
- [ ] Built with real components and fictitious data; no straw-man variant.
