---
id: auto-advancing-carousel
title: Why avoid an auto-advancing carousel?
category: content
components: [carousel, pause-control, position-indicator]
type: anti-pattern
impact: high
status: avoid
evidence: strong
wcag: ["2.2.2", "2.1.1", "2.4.7", "1.4.10"]
related: [carousel, main-navigation, keyboard-focus, tabs]
---

# Why avoid an auto-advancing carousel?

> **Rule:** Do not let the carousel rotate on its own; prefer manual control or a static section and, if rotation is unavoidable, provide a visible pause and stop on focus or interaction.

## Context

An auto-advancing carousel changes content without anyone operating a control. It looks like an effective way to show several messages, but it shortens reading time, disrupts decisions and pulls attention away from keyboard, touch, zoom and screen reader users.

Rotation causes an unrequested change of context: a click may land on another slide, text disappears before it is read and part of the content is never seen. E-commerce testing found usability problems in a significant share of the carousels evaluated and recommends avoiding auto-rotation on mobile.

In most cases, a static section or a manual carousel works better and is simpler to build.

## Decision

- **IF** the interface is mobile or touch-based **THEN** disable auto-rotation.
- **IF** the content is essential, an important offer or the only path to a task **THEN** use a static section, outside the slides.
- **IF** the slide requires careful reading **THEN** use manual control.
- **IF** there is a clear reason to rotate on desktop **THEN** provide a visible, keyboard-accessible pause and resume button.
- **IF** it rotates **THEN** stop on focus or hover and do not restart without an explicit action.
- **IF** rotation lasts more than 5 seconds and runs alongside other content **THEN** a pause, stop or hide mechanism is mandatory.
- **IF** the system signals reduced motion **THEN** do not start rotation.
- **ELSE** use a manual carousel with previous, next and a position indicator.

## When to use

- Auto-rotation only with a clear goal and secondary content.
- A visible, accessible pause control.
- Stopping on focus and interaction.
- Testing with keyboard, touch and screen reader.

## When to avoid

- Mobile or touch interfaces → **use instead:** static section or manual carousel.
- Text that requires careful reading → **use instead:** static blocks.
- Every slide matters → **use instead:** show them all in a grid.
- Carousel as the only route to a task → **use instead:** links in the navigation.
- No clear pause → **use instead:** manual control.

## Do

- Prioritize manual control.
- Keep the pause button visible and labeled.
- Repeat essential content outside the carousel.
- Allow enough reading time and respect reduced motion.

## Avoid

- Changing slides without any action from the person.
- Restarting rotation after focus or interaction.
- Relying on dots alone for navigation.
- Hiding essential content in a slide.
- Limiting reading time.

## Accessibility

- Criterion 2.2.2: a mechanism to pause, stop or hide motion that starts automatically, lasts more than 5 s and appears alongside other content.
- The pause button is keyboard-operable, clearly named and stays easy to find.
- APG pattern: stop rotation on focus or hover and do not resume without an explicit action.
- Communicate the current slide and position without moving focus unexpectedly.
- Do not use color, motion or dots alone as the indication; respect `prefers-reduced-motion`.

## Microcopy

| Situation | Example |
|---|---|
| Pause | "Pause slideshow" |
| Resume | "Resume slideshow" |
| Position | "Slide 2 of 5" |
| Navigate | "Previous slide" / "Next slide" |

## Verification checklist

- [ ] Auto-rotation is truly necessary.
- [ ] The content works without autoplay.
- [ ] There is a visible, keyboard-operable pause button.
- [ ] Rotation stops on focus and after interaction.
- [ ] There are previous and next controls.
- [ ] Essential content also appears outside the carousel.
- [ ] There is no auto-rotation on mobile.
- [ ] Reduced motion is respected.
- [ ] Screen reader and zoom were tested.

## Rationale

- WCAG 2.2, criterion 2.2.2 (Pause, Stop, Hide): the minimum requirement for automatic motion; it does not prove autoplay is a good choice.
- W3C WAI-ARIA APG (Carousel Pattern): stop on focus or hover, a stop control and announcement of the current slide.
- W3C WAI (carousels tutorial): motion must be controllable.
- Baymard Institute (homepage carousels and page controls): avoid auto-rotation on mobile, clear controls, a static section as the alternative; contextual e-commerce evidence.
- Nielsen Norman Group: pause rotation, allow direct slide choice and repeat important content outside the carousel.
