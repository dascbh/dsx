---
version: "alpha"
name: "Salesforce Lightning"
description: "Salesforce Lightning visual system, translated from the Claude Artisan catalog for use in digital products. Enterprise CRM density and consistency; Token-driven theming (SLDS)"
colors:
  primary: "#0176d3"
  background: "#f3f3f3"
  surface: "#ffffff"
  text: "#181818"
  accent: "#04844b"
  on-primary: "#FFFFFF"
  on-surface: "#000000"
  on-accent: "#FFFFFF"
typography:
  h1:
    fontFamily: "'Salesforce Sans', 'Inter', system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "'Salesforce Sans', 'Inter', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "'Salesforce Sans', 'Inter', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "4px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "28px"
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
    padding: "20px"
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    padding: "16px"
---
## Overview

Salesforce Lightning visual system, translated from the Claude Artisan catalog for use in digital products. Enterprise CRM density and consistency; Token-driven theming (SLDS)

- **Category:** flat-platform
- **Era:** 2015–present
- **Origin:** Salesforce.
- **Reference:** Salesforce Lightning Experience.
- **Structural base:** shell de aplicação com navegação e cartões

**Defining traits:**
- Enterprise CRM density and consistency
- Token-driven theming (SLDS)
- Data tables, utility icons
- Neutral, professional palette

## Colors

- **bg** — #f3f3f3
- **surface** — #ffffff
- **surface-strong** — #f4f6f9
- **border** — #dddbda
- **text** — #181818
- **text-muted** — #706e6b
- **primary** — #0176d3
- **accent** — #04844b
- **danger** — #ba0517

## Typography

- Display: 'Salesforce Sans', 'Inter', system-ui, sans-serif
- Body: 'Salesforce Sans', 'Inter', system-ui, sans-serif
- Mono: ui-monospace, 'SFMono-Regular', monospace

## Layout

- shell de aplicação com navegação e cartões
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Enterprise CRM density and consistency; Token-driven theming (SLDS); Data tables, utility icons; Neutral, professional palette; sombras e elevação

## Shapes

- Radius scale: 4px, 4px, 8px.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/lightning-design · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/lightning-design — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
