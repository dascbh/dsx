---
version: "alpha"
name: "Linear Style"
description: "Linear Style visual system, translated from the Claude Artisan catalog for use in digital products. Dark UI with subtle purple/blue gradients; Crisp small type, hairline borders"
colors:
  primary: "#5e6ad2"
  background: "#08090a"
  surface: "#101113"
  text: "#f7f8f8"
  accent: "#4ea7fc"
  on-primary: "#FFFFFF"
  on-surface: "#FFFFFF"
  on-accent: "#000000"
typography:
  h1:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
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

Linear Style visual system, translated from the Claude Artisan catalog for use in digital products. Dark UI with subtle purple/blue gradients; Crisp small type, hairline borders

- **Category:** flat-platform
- **Era:** 2020–present
- **Origin:** Linear (issue tracker) product aesthetic.
- **Reference:** Linear.app; many 2020s dev-tool sites.
- **Structural base:** shell de aplicação com navegação e cartões

**Defining traits:**
- Dark UI with subtle purple/blue gradients
- Crisp small type, hairline borders
- Glow accents, fast micro-interactions
- Refined, fast, premium SaaS

## Colors

- **bg** — #08090a
- **surface** — #101113
- **surface-strong** — #17181b
- **border** — rgba(255,255,255,0.09)
- **text** — #f7f8f8
- **text-muted** — #8a8f98
- **primary** — #5e6ad2
- **accent** — #4ea7fc
- **glow** — rgba(94,106,210,0.5)

## Typography

- Display: 'Inter', system-ui, sans-serif
- Body: 'Inter', system-ui, -apple-system, sans-serif
- Mono: 'Berkeley Mono', ui-monospace, monospace

## Layout

- shell de aplicação com navegação e cartões
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Dark UI with subtle purple/blue gradients; Crisp small type, hairline borders; Glow accents, fast micro-interactions; Refined, fast, premium SaaS; sombras e elevação

## Shapes

- Radius scale: 6px, 8px, 12px.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/linear-dark · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/linear-dark — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
