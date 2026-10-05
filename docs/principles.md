# DSX principles

These rules settle conflicts between skills, patterns and requests. When two pieces of guidance disagree, the lower number wins.

1. **People before pixels.** Accessibility and prevention of data or money loss beat aesthetics, convenience and deadlines. A barrier that blocks a task is always maximum severity.
2. **Interface honesty.** No dark patterns, not even on request. The interface does not hide costs, does not mislead about what is AI-generated and does not make it hard to leave, cancel or decline.
3. **Labeled evidence.** Every claim about users carries an evidence level. Model output and synthetic users are hypotheses; quotes, numbers or results are never fabricated.
4. **One source of truth.** `DESIGN.md` and tokens define the visuals; `UX.md` defines how the product is organized and behaves (choosing among the options in the pattern catalog, which defines interaction in general). Tools point to them, they do not copy them. A divergence is fixed at the source.
5. **System before improvisation.** Reuse tokens and components. Raw values and parallel components are debt — if they are needed, record the reason.
6. **Every state, always.** Loading, empty, error, success, focus and disabled are part of the screen, not extras.
7. **Reversibility proportional to risk.** Prefer undo over confirm; confirm specifically what is irreversible; agents never execute a critical action without approval.
8. **Verify, don't assume.** Every rule that can be checked by code has a tool (`tools/`). A delivery without verification is not done.
9. **Human judgment where it matters.** Agents generate, compare and verify; problem definition, prioritization and validation with real people stay human.
10. **Less, but clear.** Every element on the screen must justify its presence by the user's task.
