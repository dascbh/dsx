# UX dimensions

> **When to consult**
> - When auditing the UX of a whole module (skill `audit-ux`, `tools/ux-lint/audit.mjs`): to read the per-dimension report and know what the machine checked and what is still judgment.
> - When deciding where a manual review finding fits (which dimension, which rule or heuristic to cite).
> - When proposing a new rule: the matrix says which dimension is uncovered and which family the rule belongs to.

The audit looks at the interface through **14 dimensions**. Each one answers one question, relies on files in `knowledge/`, on patterns in `patterns/` and on archetype fields, and is verified in one of four ways: automated rule, automated rule + judgment, judgment only, or reference only. The source of truth is the matrix `data/ux-dimensions.json`; the tables below are generated from it (`renderDimensionsTable` and `renderRulesTable` in `tools/ux-lint/audit.mjs`), and a test checks that this document cites every dimension and every rule in the matrix.

## How each dimension is verified

| Verification | What it means | What the agent does |
|---|---|---|
| Automated rule | Most of the question is answered by the detectors | Checks the findings and proposes the fix |
| Automated rule + judgment | Rules cover part of it; the rest needs a read against the cited knowledge | Checks the findings and reviews the dimension's gaps |
| Judgment | No rule, or only a marginal signal | Reviews each screen with the cited knowledge and records findings with `origin: review` |
| Reference only | Knowledge that justifies and sizes findings of other dimensions | Cites the law or principle in the other dimension's finding; produces no finding of its own |

## Dimensions

| Dimension | Question | Rules | Verification | Heuristics | Gaps |
|---|---|---|---|---|---|
| Text (`text`) | Does every visible text say what the person needs, in their own words, with no generated-text mark and no implementation term? | X1, X1b, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11, T6, T7 | automated rule + judgment | H2, H4, H8 | Tone of voice by context, sentence clarity, text that says less than it should (missing consequence, deadline or who sees it), generic adjectives and 'not only X, but Y' constructions are not checked by any rule; they are left to the ux-writing review. |
| Actions (`actions`) | Is there a single primary action per region, placed where the product declares it, and do destructive actions say what they do? | T1, T2, T5, L1 | automated rule + judgment | H3, H4, H5 | Safety distance between a destructive and a common action, disabled-with-reason vs. hidden, undo after acting and confirmation proportional to risk (confirmation in UX.md) are not checked. |
| Layout (`layout`) | Does the screen have the regions of its archetype, with alignment, proximity and line length that show what belongs to what? | L4, L5, L7, L9 | automated rule + judgment | H4, H8 | Reflow at 320 px, 200% zoom, density suited to the use and cards inside cards are not measured; captures are taken at a single width. |
| Visual hierarchy (`hierarchy`) | Is the first element perceived the entry point or the primary action, with a coherent heading scale and no competing emphasis? | T3, L2, L3, L6 | automated rule + judgment | H6, H8 | The blur test, hierarchy in grayscale, focus order matching visual order and accent color used as decoration are left to judgment. |
| Information architecture (`information-architecture`) | Does everything live where the audience expects it, with names that predict the content and depth within the limit? | F2 | judgment | H2, H6 | Labels that predict content, where each function lives, depth (navigation.max-depth in UX.md) and findability have no rule; F2 only flags a screen outside every journey. |
| Navigation (`navigation`) | Does the person know where they are, where they came from and how to go back, with no stacked dialogs? | F4, F5 | automated rule + judgment | H1, H3, H6 | Highlighted active item, a title that says where you are, maximum depth and consistency of the way back across screens are not checked. |
| Flows (`flows`) | Do the main journeys complete, have a way out on every screen and fit the declared step limit? | F0, F1, F3 | automated rule + judgment | H3, H7 | Cognitive walkthrough (does the person know the next step?), persona switches within a journey, decision points without a labeled exit and a flow end with no confirmation are left to review. |
| Forms (`forms`) | Does every field have a visible label, a natural order, validation at the right moment and an error that says how to fix it? | T4 | automated rule + judgment | H5, H6, H9 | Required vs. optional marking, a suitable field type, autocomplete, validation timing and keeping data after an error are not checked in static captures. |
| States (`states`) | Does every screen have its required states captured, and do empty and error offer a way out and say what to do? | S1, S2, S3 | automated rule + judgment | H1, H3, H9 | Duration and delay of the loading indicator, success proportional to what was done, a no-permission state that says who grants access and a temporary failure distinct from empty need judgment on each state capture. |
| Consistency (`consistency`) | Do the same action and the same concept have the same name, the same look and the same place on every screen? | C1, C2, C3 | automated rule + judgment | H4 | Behavioral consistency (same component, different reaction), a different validation rule for the same data and external consistency with the platform are not checked. |
| Accessibility (`accessibility`) | Is the screen usable by keyboard, screen reader, zoom and low vision (WCAG 2.2 AA)? | L8 | automated rule + judgment | — | Contrast (measured separately by tools/stitch/analyze-html.mjs and tools/contrast.mjs), visible focus, focus order, ARIA, icon names, reduced motion and reflow are left to the accessibility skill. Heuristics are not accessibility: this dimension serves no Nielsen heuristic. |
| Nielsen heuristics (`heuristics`) | Against the ten heuristics, what gets in the way of using this screen or flow, and how severe is it? | — | judgment | H1, H2, H3, H4, H5, H6, H7, H8, H9, H10 | Automated rules serve heuristics (see rules_index), but H7 (efficiency), H10 (help) and most of H1 (status) have no rule; the full heuristic evaluation is an agent review. |
| Cognitive laws (`cognitive-laws`) | Do the number of options, target size and distance, grouping and framing respect how people perceive and decide? | — | reference only | H6, H8 | Used to justify and size findings of other dimensions. Laws cited outside the DSX (Miller, Tesler, Doherty, peak-end, Von Restorff, Zeigarnik, aesthetic-usability) are not yet in the knowledge base (see data/gap-analysis/nielsen-and-laws.json). |
| Dark patterns (`dark-patterns`) | Does any screen push the person against their own interest (hidden cost, confirmshaming, preselection, obstruction)? | — | judgment | H3, H4, H5 | No automated rule: pre-checked consent, a decline worded to shame and a decline with much less visual weight than accept could be detected in captures (proposal in data/gap-analysis/nielsen-and-laws.json). |

When a detector does not exist or did not run (missing capture, map or detector file), the audit downgrades the dimension's coverage for that run: if none of its families ran, the dimension becomes judgment and the report lists the knowledge for the review.

## Rules by dimension

Fixed ids per family: `X` text (`tools/ux-lint/text.mjs`), `T` screen (`tools/ux-lint/screen.mjs`), `F` flow (`tools/ux-lint/flow.mjs`), `L` layout and hierarchy (layout.mjs), `S` states (`tools/ux-lint/states.mjs`) and `C` consistency (consistency.mjs). Severity on the 0–4 scale of [nielsen-heuristics.md](nielsen-heuristics.md).

| Rule | Family | Dimension | Sev | Heuristics | What it flags |
|---|---|---|---|---|---|
| X1 | text | Text | 2 | H8 | Em or en dash used as a pause in the text |
| X1b | text | Text | 1 | H2 | Dash standing in for an empty value |
| X2 | text | Text | 2 | H4, H8 | Title, tab or button made of two blocks joined by a separator |
| X3 | text | Text | 1 | H8 | Supporting text that only repeats the title |
| X4 | text | Text | 2 | H8 | Empty opener ("Here you can…", "On this screen…") |
| X5 | text | Text | 1 | H4 | Label, button or title ending with sentence punctuation |
| X6 | text | Text | 1 | H2, H4 | Button that is long, has no object or does not start with a verb |
| X7 | text | Text | 1 | H8 | Tooltip or accessible name that repeats the visible text or over-explains |
| X8 | text | Text | 1 | H5, H8 | Placeholder that repeats the label instead of showing the format |
| X9 | text | Text | 1 | H8 | Explanatory parenthesis in a title, label or button |
| X10 | text | Text | 1 | H4 | Title Case instead of sentence case |
| X11 | text | Text | 2 | H2 | Implementation term on screen (hash, token, API, payload…) |
| T1 | screen | Actions | 3 | H4, H8 | More primary actions in a region than actions.primary-per-region |
| T2 | screen | Actions | 2 | H4, H5 | Cancel vs. action order reversed in the dialog footer |
| T3 | screen | Visual hierarchy | 2 | H8 | Screen without exactly one main heading (h1) |
| T4 | screen | Forms | 3 | H5, H6 | Field with no visible label and no accessible name (placeholder only) |
| T5 | screen | Actions | 3 | H5 | Destructive action with a generic label (Confirm, OK, Yes) |
| T6 | screen | Text | 2 | H2 | Term forbidden by UX.md (content.forbidden) in visible text |
| T7 | screen | Text | 1 | H2, H4 | Button whose label is not verb + object |
| F0 | flow | Flows | 1 | — | Map transition points to a screen that does not exist (integrity warning, outside the contract) |
| F1 | flow | Flows | 3 | H3 | Screen (not a dialog) with no outgoing transition |
| F2 | flow | Information architecture | 1 | H6 | Screen outside every journey in the map |
| F3 | flow | Flows | 2 | H7 | Journey with more steps than flows.max-journey-steps |
| F4 | flow | Navigation | 2 | H3, H8 | Dialog opened from another dialog beyond flows.max-stacked-dialogs |
| F5 | flow | Navigation | 3 | H3, H1 | Non-root screen with no transition back to its parent or origin |
| L1 | layout | Actions | 2 | H4 | Primary action outside the declared position (UX.md or archetype) |
| L2 | layout | Visual hierarchy | 2 | H8 | Competing emphasis: too many elements with high visual weight above the fold |
| L3 | layout | Visual hierarchy | 2 | H8, H4 | Broken heading scale (h1 is not the largest, a lower level larger than a higher one) |
| L4 | layout | Layout | 1 | H8 | Fields, labels or card columns with left edges at more than 2 positions |
| L5 | layout | Layout | 1 | H8 | Proximity: label far from its field, scattered action group, element closer to the neighboring group |
| L6 | layout | Visual hierarchy | 2 | H6, H8 | Primary action or title below the fold (900 px) |
| L7 | layout | Layout | 1 | H8 | Running-text line longer than 90 characters |
| L8 | layout | Accessibility | 2 | H5 | Clickable target smaller than 24 × 24 px (WCAG 2.5.8) |
| L9 | layout | Layout | 1 | H4, H6 | Region of the declared archetype missing from the screen |
| S1 | states | States | 2 | H1 | Required state (UX.md or archetype) without a capture |
| S2 | states | States | 2 | H3, H9 | Empty or error state with no way-out action |
| S3 | states | States | 2 | H9 | Error message with no guidance on what to do |
| C1 | consistency | Consistency | 2 | H4 | Same action with different labels across screens (synonyms) |
| C2 | consistency | Consistency | 1 | H4 | Same button label with different visual variants |
| C3 | consistency | Consistency | 1 | H4, H2 | Same concept with different names in titles and tabs |

Manual review findings use the family's rules when they fit (a bad text the detector missed goes in as `X3`, not as a new rule) and, when they do not, a review id from `review_rules` in the matrix: `H1`…`H10` (heuristic), `DP` (dark pattern), `IA`, `A11Y` (with the WCAG criterion in the message), `LAW` (with the law from `laws_index`) and `desc` (text case without a rule, the default of `findings.mjs options`). That way every finding lands in a dimension.

## How to read the per-dimension report

`node tools/ux-lint/audit.mjs --module <m> --root <project>` prints, for each dimension:

- **coverage**: the designed one (from the matrix) and, if it changed in this run, the effective one (`partial → judgment in this run`), with the families that have no detector.
- **open**: present findings not yet resolved (status `open`, `decided` or `regression`), by severity `s4 · s3 · s2 · s1`; how many came from manual review.
- **new**: ids that did not exist in the registry before this run.
- **fixed**: were present and disappeared in this run.
- **regressions**: came back after being fixed.
- **unregistered**: findings of a family that `findings.mjs` does not register yet: they appear only as a count, with no id.
- **gaps** and **review with**: what the dimension does not check and the knowledge for the agent's review.

IF → THEN decisions:

- **IF** a dimension with partial or automated coverage has zero open findings **THEN** that only says its rules passed; the gaps still need review.
- **IF** coverage dropped to judgment in this run **THEN** generate the missing input (the report gives the command) before reviewing by hand what the machine would measure.
- **IF** "No dimension" appears **THEN** a detector emitted a rule outside the matrix: add it to `rules_index` and to the right dimension.
- **IF** new findings or regressions of severity ≥ 2 appear **THEN** handle them before the old open ones: this is the guard against getting worse (`findings.mjs check`).

## Gaps from other sources

Two systematic comparisons, recorded as data:

- `data/gap-analysis/web-design-rules.json`: the 65 rules of a public visual design guide for websites (no license: only short paraphrases, nothing copied). 42 are already covered, 17 partially and 6 not; 6 of the partial or uncovered ones are about brand websites (personality, photos, decorative imagery) and fall outside product scope. What applies to product became a proposal:
  - **Icons** (not covered): a knowledge addition with a single library, a style consistent with the typography and sizes from the scale; rule C4 (more than one icon library in the captures).
  - **Justified or long centered text** (partial): rule L10.
  - **Color and underline reserved for links** (partial): rule C5.
  - **Long text without subheadings** (partial): rule L11, low priority in operational products.
  - **Animation duration** (covered in knowledge, not verified): have `tools/lint-raw-values.mjs` also look at ms values outside the motion tokens.
  - **Responsive** (covered in knowledge, not verified): also capture at 375 px and run the layout rules at both widths.
- `data/gap-analysis/nielsen-and-laws.json`: the 10 heuristics and 13 UX laws. Heuristics H2, H3, H4, H8 and H9 are covered by rules; H1, H5, H6, H7 and H10 partially (proposals: S4 loading without indicator, T8 dialog without a visible close, L12 destructive action right next to the primary one). Laws: Hick, Fitts, Jakob, proximity and similarity covered; Miller, Tesler, Doherty, common region, Von Restorff and aesthetic-usability partially; peak-end and Zeigarnik are not in the knowledge base (proposal: add them to [psychology-and-laws.md](psychology-and-laws.md); rule F6, journey that does not end in success; rule L14, card inside a card; rule L13, more than 7 same-level actions in a bar).

Proposed ids (L10–L14, C4, C5, S4, T8, F6) are reservations, not active rules: they only enter `rules_index` when the detector exists.

## Checklist

- [ ] I ran `tools/ux-lint/audit.mjs` with captures, map and `UX.md`; no prerequisite missing without a reason.
- [ ] Every judgment or reference dimension was reviewed with the cited knowledge, and each problem became an `origin: review` finding with a rule or review id.
- [ ] No finding under "No dimension".
- [ ] The dimension's gaps were read before concluding that it "passed".
- [ ] A new rule enters the matrix (`rules_index` and dimension) together with the detector, and this document is regenerated.
