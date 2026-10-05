---
id: carousel
title: When should you use a carousel?
category: content
components: [carousel, gallery, navigation-controls]
type: contextual-decision
impact: medium
status: recommended
evidence: strong
wcag: ["2.2.2", "1.4.10", "2.1.1", "2.3.3", "2.4.7", "4.1.2"]
related: [auto-advancing-carousel, tabs, touch-target, filter-structure]
---

# When should you use a carousel?

> **Rule:** Use a carousel only for related items meant for optional browsing, with manual control and without hiding essential content.

## Context

A carousel shows only part of a collection and lets the person move forward, back or swipe. It saves space, but it hides content and can bring motion, hard-to-find controls and reading problems.

Start from the task, not the component. If each item is important, independent or needed for the decision, a static layout is clearer. Hidden content can go unnoticed, and research found usability problems in a significant share of homepage carousels.

That does not make carousels always wrong: they work for related collections with optional sequential browsing, provided the team can build and test the semantics, controls and motion control.

## Decision

- **IF** the items are related and sequential browsing adds value **THEN** a carousel is acceptable.
- **IF** the items are independent messages or any of them may be essential **THEN** use a static section.
- **IF** it is the only route to an important call to action, product or action **THEN** do not use a carousel.
- **IF** there are many items **THEN** reduce the collection or use a grid, list or pagination.
- **IF** the carousel relies on swipe only **THEN** add previous and next buttons.
- **IF** it is an image gallery **THEN** use thumbnails or useful labels instead of dots alone.
- **IF** auto-rotation is truly necessary **THEN** provide pause and stop, use a comfortable interval and stop on focus or interaction.
- **ELSE** manual navigation by default, with no rotation.

## When to use

- Galleries of related images.
- Browsing similar items.
- The order of items makes sense and browsing is optional.
- Clear controls fit in the layout.
- There is time to test accessibility.

## When to avoid

- Critical messages or the only main call to action → **use instead:** static section.
- Independent, essential content → **use instead:** visible blocks.
- Many items → **use instead:** grid or pagination.
- Reliance on swipe alone → **use instead:** buttons and swipe.
- Distracting rotation → **use instead:** manual control.

## Do

- Define the component's goal.
- Show previous and next controls with accessible names.
- Indicate the current position and total ("2 of 6").
- Use real, resizable HTML text.
- Pause on focus or interaction.
- Test keyboard, touch and zoom.

## Avoid

- Hiding essential information.
- Using dots as the only navigation.
- Requiring swipe only.
- Changing slides quickly.
- Resetting the position for no reason.
- Overlaying controls on text.
- Using images with embedded text.

## Accessibility

- Use a semantic region with an accessible name, previous and next controls and identification of the current slide (4.1.2).
- Every control works by keyboard and touch, with visible focus and enough touch area (2.1.1, 2.4.7).
- With auto-rotation, provide pause, stop or hide (2.2.2); stop when the keyboard enters or there is interaction; respect prefers-reduced-motion (2.3.3).
- Communicate slide changes without moving focus unexpectedly.
- Do not rely on dots, color, position or gesture alone.
- Each slide must stay readable in a narrow viewport and with zoom (1.4.10).

## Microcopy

| Situation | Example |
|---|---|
| Previous button | "Previous slide" |
| Next button | "Next slide" |
| Position | "Slide 2 of 6" |
| Pause | "Pause rotation" |
| Resume | "Resume rotation" |
| Region name | "Product photos" |

## Verification checklist

- [ ] The items are related.
- [ ] Essential content is also available outside the carousel.
- [ ] Previous and next are visible and have accessible names.
- [ ] Current position and total are indicated.
- [ ] It works by keyboard and does not rely on swipe alone.
- [ ] No auto-rotation, or pause and stop are available.
- [ ] Rotation stops on focus or interaction.
- [ ] The text is real, resizable HTML.
- [ ] It works at 400% zoom without horizontal page scrolling.
- [ ] It respects reduced motion.

## Rationale

- W3C WAI carousels tutorial and the WAI-ARIA APG carousel pattern: semantics, navigation, change announcements, pause and focus.
- WCAG 2.2, criteria 2.2.2 (pause, stop, hide) and 1.4.10 (reflow).
- Baymard Institute, UX requirements for homepage carousels: prominent controls, initial slide, not the only route, pause, readable text, static alternative.
- Baymard Institute, page controls: informative thumbnails instead of dots alone.
- Material Design 3, carousel: variants and collection navigation.
