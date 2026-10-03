---
version: "alpha"
name: "Adobe Spectrum"
description: "Adobe Spectrum visual system, translated from the Claude Artisan catalog for use in digital products. Creative-tool oriented, neutral canvas-friendly; Adobe Clean typeface"
colors:
  primary: "#1473e6"
  background: "#ffffff"
  surface: "#f8f8f8"
  text: "#1f1f1f"
  accent: "#9256d9"
  on-primary: "#000000"
  on-surface: "#000000"
  on-accent: "#FFFFFF"
typography:
  h1:
    fontFamily: "'Adobe Clean', 'Source Sans Pro', system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "'Adobe Clean', 'Source Sans Pro', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "'Adobe Clean', 'Source Sans Pro', system-ui, sans-serif"
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

Adobe Spectrum visual system, translated from the Claude Artisan catalog for use in digital products. Creative-tool oriented, neutral canvas-friendly; Adobe Clean typeface

- **Category:** flat-platform
- **Era:** 2019–present
- **Origin:** Adobe.
- **Reference:** Adobe Creative Cloud web apps.
- **Structural base:** shell de aplicação com navegação e cartões

**Defining traits:**
- Creative-tool oriented, neutral canvas-friendly
- Adobe Clean typeface
- Careful density scales (medium/large)
- Strong theming + accessibility

## Colors

- **bg** — #ffffff
- **surface** — #f8f8f8
- **surface-strong** — #eaeaea
- **border** — #d5d5d5
- **text** — #1f1f1f
- **text-muted** — #5a5a5a
- **primary** — #1473e6
- **accent** — #9256d9
- **negative** — #e34850

## Typography

- Display: 'Adobe Clean', 'Source Sans Pro', system-ui, sans-serif
- Body: 'Adobe Clean', 'Source Sans Pro', system-ui, sans-serif
- Mono: 'Source Code Pro', ui-monospace, monospace

## Layout

- shell de aplicação com navegação e cartões
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Creative-tool oriented, neutral canvas-friendly; Adobe Clean typeface; Careful density scales (medium/large); Strong theming + accessibility; sombras e elevação

## Shapes

- Radius scale: 4px, 8px, 16px.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/spectrum · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/spectrum — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
