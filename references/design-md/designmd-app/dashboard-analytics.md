---
version: "alpha"
name: "Analytics Dashboard"
description: "Analytics Dashboard visual system, translated from the Claude Artisan catalog for use in digital products. Card grids, KPI tiles, charts, tables; Neutral surfaces, one or two accent colors"
colors:
  primary: "#4f46e5"
  background: "#f5f6f8"
  surface: "#ffffff"
  text: "#1b2130"
  accent: "#16a34a"
  on-primary: "#FFFFFF"
  on-surface: "#000000"
  on-accent: "#000000"
typography:
  h1:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "'Inter', 'Helvetica Neue', system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "'Inter', 'Helvetica Neue', system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
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

Analytics Dashboard visual system, translated from the Claude Artisan catalog for use in digital products. Card grids, KPI tiles, charts, tables; Neutral surfaces, one or two accent colors

- **Category:** flat-platform
- **Era:** Ongoing
- **Origin:** Conventional data-product UI patterns.
- **Reference:** Stripe Dashboard; Vercel Analytics; admin panels.
- **Structural base:** shell de aplicação com navegação e cartões

**Defining traits:**
- Card grids, KPI tiles, charts, tables
- Neutral surfaces, one or two accent colors
- Dense but scannable, clear hierarchy
- Function-first legibility

## Colors

- **bg** — #f5f6f8
- **surface** — #ffffff
- **surface-strong** — #eef0f4
- **border** — #e2e5eb
- **text** — #1b2130
- **text-muted** — #5b6274
- **primary** — #4f46e5
- **accent** — #16a34a
- **negative** — #dc2626

## Typography

- Display: 'Inter', system-ui, sans-serif
- Body: 'Inter', 'Helvetica Neue', system-ui, -apple-system, sans-serif
- Mono: 'IBM Plex Mono', ui-monospace, monospace

## Layout

- shell de aplicação com navegação e cartões
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Card grids, KPI tiles, charts, tables; Neutral surfaces, one or two accent colors; Dense but scannable, clear hierarchy; Function-first legibility; sombras e elevação

## Shapes

- Radius scale: 6px, 10px, 14px.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/dashboard-analytics · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/dashboard-analytics — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
