# Nielsen's heuristics

> **When to consult**
> - When reviewing any screen, flow or component and you need to name *why* something gets in the way of use.
> - When rating the severity of a finding (0–4 scale) before proposing a priority.
> - When producing a heuristic evaluation report (the process is in [usability-evaluation.md](usability-evaluation.md)).
> - When designing something new: use the audit questions as a preventive checklist.

The ten heuristics are broad usability principles, not binary rules. A violation is a **signal to investigate in context**, not proof of failure. Always separate what is observable (evidence) from what is interpretation (potential problem).

---

## Severity scale (0–4)

Rate each finding on three factors and combine them:

| Factor | Question | Low | High |
|---|---|---|---|
| **Frequency** | How many people will run into it? | Rare case, specific profile | Everyone who goes through the flow |
| **Impact** | How hard is it to overcome when it happens? | Slight hesitation | Blocker, error, loss of data or money |
| **Persistence** | Does the person learn to work around it, or stumble every time? | Overcome once, stays solved | Repeats on every use |

| Level | Name | Operational criterion | Action |
|---|---|---|---|
| 0 | Not a problem | None of the three factors is relevant | Discard or record as a note |
| 1 | Cosmetic | Low impact, does not slow the task | Fix if there is slack |
| 2 | Minor | Slows down or confuses, but the person finishes | Low priority, goes into the backlog |
| 3 | Major | High impact **or** high frequency with medium impact; causes recurring errors or abandonment | High priority, fix in the current cycle |
| 4 | Catastrophe | Prevents completing the task, causes unrecoverable loss or financial harm | Blocks release |

**Usage rules**
- Assign severity **after** consolidating all findings, not during the inspection.
- IF the flow involves money, personal data, permissions, deletion or bulk actions THEN raise the severity one level by default.
- IF there is unrecoverable data loss THEN minimum severity is 3.
- Severity is not priority: a major problem that affects few people, or that depends on another delivery, may be prioritized later. Record the two separately.
- Severity is not business cost: a level-2 friction repeated millions of times may cost more than a rare level 4. When data exists, cite it.

---

## H1. Visibility of system status

**Principle.** The interface tells the person, in a timely way, what is happening after each action and where they are.

**Signs of violation**
- A button that does not change state when clicked; nothing indicates the click was registered.
- A spinner with no time estimate or explanation; a "processing" operation with no outcome.
- A progress percentage that does not correspond to real work.
- Navigation that does not mark the current section or step.

**Audit questions**
- After each action, can you tell whether it is in progress, done or failed?
- Does the displayed state match the real state of the system (not the intent)?
- Is there a perceptible response within 0.1 s to confirm the interaction? (thresholds in [interaction-and-feedback.md](interaction-and-feedback.md))

**Typical fix.** Distinct states for idle, loading, success and error; "Step 2 of 4"; a toast after saving. See [skeleton-vs-spinner](../../patterns/feedback/skeleton-vs-spinner.md), [long-loading](../../patterns/feedback/long-loading.md), [success-confirmation](../../patterns/feedback/success-confirmation.md), [progress-percentage](../../patterns/feedback/progress-percentage.md).

**Typical severity.** 3 if the action is financial or irreversible and there is no confirmation; 2 for low-risk actions.

## H2. Match between system and the real world

**Principle.** Speak the audience's language and follow the natural order of the task, not the internal structure of the company or the database.

**Signs of violation**
- Exposed technical codes ("Error 500", "403 Forbidden").
- Labels in a language other than the product's (e.g. "Submit" or "Dashboard" in a Portuguese-language product, without need).
- Internal acronyms, table names, team jargon.
- Fields in a different order from what the person has in hand (e.g. a physical document).

**Audit questions**
- Does someone from the audience understand every word and icon without training?
- Did any term come from the org chart or the code rather than from usage?

**Typical fix.** Replace terms with the vocabulary observed in interviews, tickets and searches; use familiar metaphors (trash can, magnifying glass). See [technical-error-code](../../patterns/feedback/technical-error-code.md).

## H3. User control and freedom

**Principle.** Every situation entered by mistake has a clear, cheap way out.

**Signs of violation**
- A modal with no close button, or one that ignores Esc.
- A long form that loses everything when you leave the page.
- Deletion with no undo and no recovery period.
- A flow with no "Back", or with "Cancel" hidden.

**Audit questions**
- At each reversible step, is it possible to cancel, go back and undo?
- What happens to the typed data if the person leaves?

**Typical fix.** Undo for a few seconds, automatic draft, trash. See [undo](../../patterns/actions/undo.md), [close-modal](../../patterns/modals/close-modal.md), [autosave-vs-save](../../patterns/forms/autosave-vs-save.md).

**Typical severity.** 3–4 when there is unrecoverable loss.

## H4. Consistency and standards

**Principle.** Same concept, same word, same look, same behavior (internal consistency), and respect for platform conventions (external consistency; Jakob's Law: people spend most of their time in other products).

**Signs of violation**
- "Save" on one screen and "Confirm" on another for the same action.
- A primary button that switches sides between screens.
- Different validation rules for the same data.
- Visually similar components with different behaviors.

**Audit questions**
- Do equivalent actions have the same name, appearance and position?
- Does the product follow the operating-system and industry standards the audience is already used to?

**Typical fix.** A single glossary, design system components, a fixed rule for action placement. See [action-placement](../../patterns/actions/action-placement.md), [button-hierarchy](../../patterns/actions/button-hierarchy.md).

**Caution.** A design system increases consistency but does not guarantee usability: the same component can work in one flow and fail in another.

## H5. Error prevention

**Principle.** Keep the error from happening instead of relying on a message afterward.

Distinguish two types:
- **Slip** (the person knows what they want and executes it wrong): prevent with constraints, input masks, well-spaced targets.
- **Mistake** (the decision itself is wrong for lack of information): prevent with clear consequences and good defaults.

**Signs of violation**
- "Delete" next to "Save", same size and color.
- A date field with no indicated format.
- A one-click destructive action with no confirmation and no undo.
- A generic confirmation ("Are you sure?") that the person learns to ignore.

**Audit questions**
- Which actions have the highest consequence, and what prevents errors in them?
- Does the confirmation name what will be lost, and does the button use the verb of the action?

**Typical fix.** Input mask and format example; separate opposite actions; a confirmation that describes the consequence. See [destructive-action](../../patterns/actions/destructive-action.md), [confirm-deletion](../../patterns/actions/confirm-deletion.md), [confirm-action](../../patterns/actions/confirm-action.md), [double-submit](../../patterns/actions/double-submit.md).

## H6. Recognition rather than recall

**Principle.** Keep options and information visible or easy to retrieve; recognizing costs less than remembering.

**Signs of violation**
- Requiring the person to type a code remembered from another screen.
- Unlabeled icons for infrequent actions.
- A modal that hides the data needed to decide.
- Navigation that does not show where the person is.

**Audit questions**
- Does the person need to remember something from another screen to complete this one?
- Are the icons understandable without hovering?

**Typical fix.** Visible labels, recent items, a summary of the previous step, breadcrumbs. See [breadcrumbs](../../patterns/navigation/breadcrumbs.md), [icon-only-button](../../patterns/actions/icon-only-button.md), [icon-and-text-button](../../patterns/actions/icon-and-text-button.md).

## H7. Flexibility and efficiency of use

**Principle.** Simple for beginners, fast for experienced users, without the accelerators getting in the beginner's way.

**Signs of violation**
- A daily-use tool with no shortcuts and no bulk actions.
- Advanced options mixed in with the basic ones.
- No way to save filters or preferences.

**Audit questions**
- Do frequent tasks have a short path?
- Can a beginner ignore the accelerators without penalty?

**Typical fix.** Documented shortcuts, command palette, saved filters, progressive disclosure, [autofill](../../patterns/forms/autofill.md).

## H8. Aesthetic and minimalist design

**Principle.** Every element justifies its presence by what it communicates. Minimalism is the absence of noise, not the absence of necessary content.

**Signs of violation**
- A dashboard with many charts of equal weight and no priority.
- Several simultaneous overlays (cookies + newsletter + chat).
- Dense text in onboarding; decoration competing with the main action.

**Audit questions**
- For each element: does it help achieve the goal of this screen?
- What competes visually with the main action?

**Typical fix.** One goal per screen, clear hierarchy (see [visual-hierarchy.md](visual-hierarchy.md)), remove before adding.

## H9. Help users recognize, diagnose, and recover from errors

**Principle.** The message says what happened, where, and how to fix it, in plain language, next to the problem, without blaming the person.

**Formula.** `[what happened] + [where / why] + [what to do now]`.

**Signs of violation**
- "Something went wrong" with no next step.
- All errors at the top without pointing to the field.
- A form cleared after a failure.
- An error indicated by color only.
- Validation triggered on every keystroke.

**Audit questions**
- Are the problem and the affected field identifiable? Is there a next step?
- Is the error perceptible without color? Does focus move to a predictable place?
- Was the typed data preserved?

**Fix examples**

| Before | After |
|---|---|
| Required | Enter your name |
| Invalid input | Use the format DD/MM/YYYY |
| Upload error | The file is larger than 10 MB. Choose a smaller one and upload it again. |

See [helpful-error-message](../../patterns/ux-writing/helpful-error-message.md), [form-errors](../../patterns/forms/form-errors.md), [preserve-data-after-error](../../patterns/forms/preserve-data-after-error.md), [not-color-alone](../../patterns/accessibility/not-color-alone.md), [retry](../../patterns/feedback/retry.md).

**Deliberate exception.** On login, not revealing whether the email exists can be a security decision. It must be deliberate and documented, never accidental.

## H10. Help and documentation

**Principle.** Ideally no help is needed; when it is, it sits close to the task, is searchable and is step-oriented.

**Signs of violation**
- Help only as a PDF, or a help center without search.
- A tutorial that appears once and cannot be revisited.
- No contextual help on complex fields.

**Audit questions**
- When the person gets stuck, where is the help, and does it answer the task?

**Typical fix.** Helper text on the field, explanatory empty states ([empty-state](../../patterns/feedback/empty-state.md)), task-based articles, a what's-new history.

---

## Where to focus when time is short

| Context | Priority heuristics |
|---|---|
| Asynchronous actions (submit, upload, payment) | H1, H9 |
| Forms | H5, H9, H6 |
| Destructive actions | H3, H5 |
| Complex or technical product | H2, H6, H4 |
| Product that grew fast | H4 |
| High-frequency flows | H7 |
| First use | H6, H2, H10 |

IF time allows only one flow THEN start with the highest-consequence one: checkout, payment, permissions, deletion, bulk operations.

## Extensions for AI products

The ten remain valid, but they do not cover probabilistic results and adaptive behavior. Add:
- Communicate what the system can and cannot do ([ai-uncertainty](../../patterns/ai/ai-uncertainty.md)).
- Distinguish low-confidence answers and show sources ([ai-sources](../../patterns/ai/ai-sources.md)).
- Strengthen control when the AI acts on the person's behalf ([confirm-ai-action](../../patterns/ai/confirm-ai-action.md)).
- Allow reviewing, correcting and undoing what the AI did ([review-ai-output](../../patterns/ai/review-ai-output.md), [ai-error-recovery](../../patterns/ai/ai-error-recovery.md)).
- Warn when the system's behavior has changed.

## A heuristic is not accessibility

Meeting a heuristic does not demonstrate WCAG conformance, and the reverse also holds. Use heuristics for comprehension, control and errors; use a specific audit (WCAG 2.2, ABNT NBR 17225) for semantics, alternative text, contrast, keyboard, focus and accessible names.

---

## Audit checklist

- [ ] Every action has a visible response faithful to the real state (H1).
- [ ] Audience vocabulary, no technical codes or internal acronyms (H2).
- [ ] Cancel, back, close and undo available where the action is reversible (H3).
- [ ] Same concept with the same name, look, position and behavior (H4).
- [ ] Destructive actions separated, confirmed with the consequence named, or undoable (H5).
- [ ] Nothing has to be memorized from another screen; icons for rare actions have labels (H6).
- [ ] Frequent tasks have a shortcut without hurting beginners (H7).
- [ ] No element without a function competes with the main action (H8).
- [ ] Errors follow the formula what + where + how to fix, without blame, without relying on color, preserving data (H9).
- [ ] Contextual help exists where the task is complex (H10).
- [ ] Severity assigned after consolidation, with frequency, impact and persistence made explicit.
- [ ] Flows involving money, data, permissions and deletion received +1 severity.
