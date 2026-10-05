# <ComponentName>

<!-- Component documentation readable by people and agents. The "When NOT to use" section is mandatory:
a component without contraindications is an invitation to misuse. -->

**Status:** experimental | stable | deprecated (replacement: <…>) · **Owner:** <team> · **Since:** <version>

## Purpose

<One sentence: which interface problem this component solves.>

## When to use

- <situation>

## When NOT to use

- <situation> → use <alternative>

## Anatomy

| Part | Required | Token(s) |
|---|---|---|
| <container> | yes | `color.bg.surface`, `radius.card`, `space.inset-md` |
| <label> | yes | `color.text.primary`, typography `label` |
| <icon> | no | `color.text.secondary` |

## Variants

| Variant | Use | Do not combine with |
|---|---|---|
| <primary> | <main action of the region, 1 per region> | <another primary in the same region> |

## States

| State | Visual | Behavior | Implemented |
|---|---|---|---|
| Default | | | ✔/✘ |
| Hover | | | |
| Visible focus | 2px ring `color.border.focus`, ≥ 3:1 | | |
| Active / pressed | | | |
| Disabled | | explain the reason next to the control | |
| Loading | | blocks resubmission, keeps width | |
| Error | icon + text + color | `aria-invalid`, message via `aria-describedby` | |
| Empty | | | |
| Success | | | |

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| <variant> | `'primary' \| 'secondary' \| 'danger'` | `'secondary'` | |

## Accessibility

- Native element / ARIA role: <…>
- Keyboard: <keys and behavior>
- Accessible name: <where it comes from>
- Dynamic announcements: <role="status"/"alert" when…>
- Relevant WCAG criteria: <…>

## Content

- Label: <rule, e.g. verb + object, ≤ 3 words>
- Examples: "<good>" · ~~"<bad>"~~

## Related patterns

- `patterns/<category>/<id>.md`

## Changelog

| Version | Change | Migration |
|---|---|---|
| <x.y.z> | <…> | <…> |
