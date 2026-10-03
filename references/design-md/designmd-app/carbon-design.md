---
version: "alpha"
name: "Carbon Design System"
description: "Carbon Design System visual system, translated from the Claude Artisan catalog for use in digital products. 2x grid, IBM Plex typeface; Restrained, enterprise, data-dense"
colors:
  primary: "#4589ff"
  background: "#161616"
  surface: "#262626"
  text: "#f4f4f4"
  accent: "#08bdba"
  on-primary: "#000000"
  on-surface: "#FFFFFF"
  on-accent: "#000000"
typography:
  h1:
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.06em"
rounded:
  sm: "0px"
  md: "0px"
  lg: "0px"
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

Carbon Design System visual system, translated from the Claude Artisan catalog for use in digital products. 2x grid, IBM Plex typeface; Restrained, enterprise, data-dense

- **Category:** flat-platform
- **Era:** 2017–present
- **Origin:** IBM.
- **Reference:** IBM Cloud; enterprise dashboards.
- **Structural base:** shell de aplicação com navegação e cartões

**Defining traits:**
- 2x grid, IBM Plex typeface
- Restrained, enterprise, data-dense
- Productive vs expressive themes
- Strong accessibility standards

## Colors

- **bg** — #161616
- **surface** — #262626
- **surface-strong** — #393939
- **border** — #525252
- **text** — #f4f4f4
- **text-muted** — #c6c6c6
- **primary** — #4589ff
- **accent** — #08bdba

## Typography

- Display: 'IBM Plex Sans', system-ui, sans-serif
- Body: 'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif
- Mono: 'IBM Plex Mono', ui-monospace, monospace

## Layout

- shell de aplicação com navegação e cartões
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- 2x grid, IBM Plex typeface; Restrained, enterprise, data-dense; Productive vs expressive themes; Strong accessibility standards; sombras e elevação

## Shapes

- Radius scale: 0px, 0px, 0px.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/carbon-design · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/carbon-design — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
