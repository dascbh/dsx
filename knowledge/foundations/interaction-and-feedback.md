# Interaction and feedback

> **When to consult**
> - When specifying the behavior of a control, an asynchronous action or a transition.
> - When deciding what feedback to show (and when) after a click, a submission or a load.
> - When designing microinteractions, state animations, empty states or first use.
> - When reviewing a screen that "does not respond", "looks frozen" or "does not say what to do".

---

## 1. Interaction design: what to specify

Interaction design defines how the person acts and how the system responds. Think in five dimensions:

| Dimension | Covers | Question |
|---|---|---|
| Words | Labels, messages | Does the text state the action and the result? |
| Visual representation | Icons, color, typography | Is the state recognizable? |
| Objects and space | Device, posture, one hand vs. desk | Is the control reachable in this context? |
| Time | Duration, pace, animation, waiting | Does the response arrive at the right time? |
| Behavior | System rules and reactions | What happens in each case, including the error case? |

Norman's principles that every control must answer: **visibility** (what can I do?), **feedback** (what happened?), **constraints** (what keeps me from making a mistake?), **mapping** (are control and effect coherent?), **affordance/signifier** (how do I know I can act?), **consistency** (does it work like similar ones?).

**For each control, specify:** trigger → rules → feedback → states (default, hover, focus, pressed, loading, success, error, disabled) → exit (how to undo or leave).

---

## 2. Response time thresholds

| Time | Perception | What to show |
|---|---|---|
| ≤ 0.1 s | Instantaneous; the person feels they caused the effect | Only the control's state change (pressed, checked) |
| 0.1–1 s | Notices the delay but keeps their train of thought | Nothing extra, or a discreet indicator; avoid a flashing spinner |
| 1–10 s | Attention starts to drift | Loading indicator; skeleton if the structure is known |
| > 10 s | The person will go do something else | Determinate progress (step or %), an estimate, the option to cancel or continue in the background and be notified when done |

**Rules**
- IF the response may take between ~0.3 and 1 s THEN delay the indicator by ~300 ms to avoid a flash, and once it appears keep it for at least ~500 ms.
- IF the content structure is predictable THEN use a skeleton; IF it is not, or the action is a submission, use a spinner in the button itself. See [skeleton-vs-spinner](../../patterns/feedback/skeleton-vs-spinner.md), [skeleton-screen](../../patterns/feedback/skeleton-screen.md).
- IF the operation exceeds 10 s THEN show real progress and allow cancelling. See [long-loading](../../patterns/feedback/long-loading.md).
- Only show a percentage if it corresponds to measured work ([progress-percentage](../../patterns/feedback/progress-percentage.md)).
- On submit, block resubmission and show a loading state in the button ([double-submit](../../patterns/actions/double-submit.md)).
- For low-risk actions with a high success rate, consider an optimistic update with a clear rollback if it fails. For payments, **never** declare success before the real confirmation.

---

## 3. Feedback

Every relevant action has a perceptible response faithful to the real state.

| Type | Function | Example |
|---|---|---|
| Confirmation | Action completed | "Order placed. You will receive the tracking code by email." |
| State | Current situation | Selected, saved, paused, unavailable |
| Progress | How much is left | "Step 2 of 4", upload bar |
| Guidance | Next step | Tip in the empty state |
| Recovery | What went wrong and how to fix it | "No connection. Your changes are saved here and will be sent when you reconnect." |

**Three moments:** immediate (the click was registered), during the wait (something is happening), after (what changed and what comes next).

**Rules**
- Feedback proportional to risk: discreet for saving a field, explicit for paying.
- Explain the consequence and the next step, not just "Success".
- Use more than one channel: text + visual + programmatic announcement (an `aria-live` region) for assistive technologies.
- Choose the vehicle by scope: inline for the field, an alert for the section or page, a toast for transient, non-critical confirmation. See [toast-vs-inline-alert](../../patterns/feedback/toast-vs-inline-alert.md), [toast-duration](../../patterns/feedback/toast-duration.md).
- A toast does not carry an error that requires action nor information the person needs to reread; do not move focus to it.
- Immediate validation is not aggressive: do not flag an error before the person has a chance to finish ([validation-timing](../../patterns/forms/validation-timing.md)).
- Temporary failures: say it is temporary, preserve what was done and offer a retry ([temporary-failure](../../patterns/feedback/temporary-failure.md), [retry](../../patterns/feedback/retry.md)).

**Anti-patterns:** generic messages; stacked notifications with no priority; feedback only by color, sound or animation; discarding data on failure; invented progress.

---

## 4. Microinteractions

Anatomy (Saffer):
1. **Trigger** — started by the person (click, gesture) or by the system (a message arrived).
2. **Rules** — what happens and what must not happen.
3. **Feedback** — what is seen, heard or felt.
4. **Loops and modes** — repetition, duration, context variations.

Examples: flipping a toggle, marking a favorite, pull to refresh, a password strength meter, a "typing" indicator.

**Animation thresholds**

| Use | Duration |
|---|---|
| Control state change (hover, toggle) | 100–200 ms |
| Entry/exit of small elements (tooltip, menu) | 150–250 ms |
| Panel, modal and page transitions | 250–400 ms |
| Ceiling for functional animation | ~500 ms |

- Enter with deceleration (ease-out), exit with acceleration (ease-in); the exit slightly shorter than the entry.
- Respect `prefers-reduced-motion`: replace movements and zooms with a fade or an instant change.
- Nothing flashes more than 3 times per second.
- The state must be readable without the animation.

**Anti-patterns:** decorative animation on a frequent action; animation out of proportion to the action; delaying the task to show an effect; different behavior on identical controls; noticeable performance cost.

---

## 5. Empty states

An empty screen is an opportunity to guide. Explain the cause, name what is missing and offer the next step.

| Type | Goal | Minimum content | Action |
|---|---|---|---|
| First use | Show value and get started | What will appear here and why it matters | Create the first item |
| Search with no results | Recover the search | The searched term, spelling/term suggestions | Adjust the search ([no-search-results](../../patterns/search-filters/no-search-results.md)) |
| Filters that exclude everything | Show the cause | Active filters | Remove one filter or clear all ([active-filters](../../patterns/search-filters/active-filters.md)) |
| Done | Acknowledge the achievement | "All caught up" | None, or an optional next task |
| No permission | Explain the requirement | Who can grant access | Request access |
| Temporary failure | Do not confuse with absence | It is an error, not empty | Try again |

**Rules**
- Distinguish empty from loading and from error; each has its own visuals and text.
- One sentence is usually enough; a title + one line + one action.
- One primary action; no button if there is no relevant action.
- Text before illustration; the illustration subordinate, never looking clickable, and never pushing the action off screen.
- Sample data identified as fictitious and removable.
- Never clear the person's search term or filters.

See [empty-state](../../patterns/feedback/empty-state.md).

### States checked by the machine

Each screen state becomes its own capture, so the review looks at what the person sees when the list comes back empty or the server fails, not just the happy path. The convention is `<nn>-<screen>.<state>.html` next to the main capture (`02-orders.html`, `02-orders.empty.html`, `02-orders.error.html`); the list of required states comes from `UX.md` and from the screen's archetype. The checker `tools/ux-lint/states.mjs` applies three rules ([ux-md.md](ux-md.md), "States"):

| Id | What fails | How to fix |
|---|---|---|
| S1 | Required state with no capture (the screen was not seen in that state) | Capture the state; if it does not exist in the product, that is the finding |
| S2 | Empty or error state without a button or exit link in the state's region | Offer the next step: try again, clear filters, create the first item, go back |
| S3 | Error message without guidance ("Error", "Failed", a code, or only the explanation) | Say what happened and what to do: "We couldn't reach the server right now. Try again in a moment." |

Loading, error and no-access apply to the screen that fetches the data; a tab or panel that lives inside it inherits those states from the parent. A dialog requires only the error of its own action (and the field error, when it has a required field): it has no loading or empty state.

---

## 6. Onboarding

Goal: get the person to the **first real value**, not to finish a tour.

**Patterns**
- **Progressive disclosure:** the essentials first, advanced features when asked for.
- **Contextual help:** a tip in the place and at the moment of the action; a disconnected tip is ignored.
- **Empty state as a guide:** the first use of each area teaches how to create the first item.
- **First-value task:** define which action shows the person understood the product and optimize the path to it.
- **Setup checklist:** when there are several required steps, show progress and allow doing them out of order.

**Rules**
- One main action with a clear verb (create, import, invite).
- Minimize decisions and fields before the first value; collect the rest later.
- Allow skipping, pausing and revisiting, unless regulation requires otherwise.
- Ask for permissions (notifications, location, camera) at the moment they make sense, explaining the benefit before the system prompt.
- Measure behavior (completion of the value task, retention), not screen views or clicks on "Got it".

**Anti-patterns:** a mandatory intro carousel; blocking the product until the tour is done; tips that keep coming back with no way to dismiss them; necessary information hidden in a skippable step; asking for all permissions on the first screen.

---

## Audit checklist

- [ ] Each control has its trigger, rules, feedback, states and exit specified.
- [ ] Visual response in ≤ 0.1 s for every interaction.
- [ ] Loading indicator for waits > 1 s; real progress and cancellation for > 10 s.
- [ ] No spinner flash on fast responses; no invented percentage.
- [ ] Submissions block double clicks and show loading in the button.
- [ ] Feedback proportional to risk, with consequence and next step.
- [ ] Important messages announced to assistive technologies without stealing focus.
- [ ] Functional animations between 100 and 400 ms, respecting reduced motion.
- [ ] Empty, loading and error are distinct states, each with appropriate text and action.
- [ ] Each required state has a `<nn>-<screen>.<state>.html` capture and passes `states.mjs` (S1–S3).
- [ ] Error messages say what happened and what to do; empty and error states have an exit in their own region.
- [ ] Empty search and filter results preserve what the person typed and show how to get out.
- [ ] Onboarding leads to a defined value task and can be skipped and revisited.
- [ ] Permissions requested in context, with the benefit explained.
