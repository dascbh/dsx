# UX review: <screen or flow>

<!-- Use with the `review-ux` skill. Sort findings by severity. At most 3 findings of severity ≤ 1. -->

**Date:** <YYYY-MM-DD> · **Evaluator:** <name or agent> · **Confidence:** high (rendered screen) | medium (screenshot + code) | low (code only)

## Framing

- **Audience and context:** <persona/role, device, frequency>
- **Main task:** <start → end>
- **What the screen promises:** <through its own UI>
- **Scope evaluated:** <routes/states/themes/widths checked> · **Not evaluated:** <…>

## Summary

<3 lines: the most serious problem, the recurring pattern, the #1 recommendation.>

| Severity | Count |
|---|---|
| 4 — catastrophe | <n> |
| 3 — major | <n> |
| 2 — minor | <n> |
| 1 — cosmetic | <n> |

## Findings

### <no.>. <short problem title> — severity <0–4>

- **Where:** <screen › region › element>
- **What happens:** <observable description>
- **Why it is a problem:** <heuristic H#, pattern `patterns/<cat>/<id>.md`, WCAG criterion, cognitive law>
- **Who is affected:** <everyone / keyboard / screen reader / mobile / beginners…>
- **Proposed fix:** <concrete; code or microcopy when possible>
- **Evidence:** <screenshot, walkthrough step, measurement>
<!-- If it depends on an assumption about users: [hypothesis — validate with research] -->

## Main task walkthrough

| Step | Will they try? | Will they notice? | Will they associate? | Do they understand the feedback? | Finding |
|---|---|---|---|---|---|
| <1> | ✔/✘ | ✔/✘ | ✔/✘ | ✔/✘ | <#> |

## What to preserve

- <correct decision that must not be lost in the next iteration>

## Next steps

1. <highest-impact fix>
2. <…>
3. <if applicable: user test to validate hypotheses>
