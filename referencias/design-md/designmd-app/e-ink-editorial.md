---
version: "alpha"
name: "E-Ink Editorial"
description: "E-Ink Editorial visual system, translated from the Claude Artisan catalog for use in digital products. Near-monochrome charcoal on warm e-paper; Crisp hairlines, labels, and reading-first hierarchy"
colors:
  primary: "#22221f"
  background: "#e7e5dc"
  surface: "#f2f0e7"
  text: "#22221f"
  accent: "#59574f"
  on-primary: "#FFFFFF"
  on-surface: "#000000"
  on-accent: "#FFFFFF"
typography:
  h1:
    fontFamily: "Georgia, serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "16px"
  button-secondary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    padding: "16px"
---
## Overview

E-Ink Editorial visual system, translated from the Claude Artisan catalog for use in digital products. Near-monochrome charcoal on warm e-paper; Crisp hairlines, labels, and reading-first hierarchy

- **Category:** flat-platform
- **Era:** 2000s-present
- **Origin:** Reflective e-paper displays and newspaper design: a monochrome interface designed for durable reading, not luminous spectacle.
- **Reference:** E-reader interfaces, newsroom dashboards, and legible long-form editorial systems.
- **Structural base:** composição editorial com grade tipográfica

**Defining traits:**
- Near-monochrome charcoal on warm e-paper
- Crisp hairlines, labels, and reading-first hierarchy
- No decorative shadows, transparency, or color-dependent meaning

## Colors

- **bg** — #e7e5dc
- **surface** — #f2f0e7
- **surface-2** — #d5d3ca
- **text** — #22221f
- **text-muted** — #62615b
- **primary** — #22221f
- **accent** — #59574f
- **inverted** — #f2f0e7

## Typography

- Display: Georgia, serif
- Body: Arial, Helvetica, sans-serif
- Mono: 'Courier New', monospace

## Layout

- composição editorial com grade tipográfica
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Near-monochrome charcoal on warm e-paper; Crisp hairlines, labels, and reading-first hierarchy; No decorative shadows, transparency, or color-dependent meaning; sombras e elevação; transparência e blur

## Shapes

- Radius scale: 0, 0, 0.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/e-ink-editorial · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/e-ink-editorial — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
