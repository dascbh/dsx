---
version: "alpha"
name: "Shopify Polaris"
description: "Shopify Polaris visual system, translated from the Claude Artisan catalog for use in digital products. Merchant-admin focused, calm and legible; Card-based layouts, clear affordances"
colors:
  primary: "#008060"
  background: "#f1f2f4"
  surface: "#ffffff"
  text: "#1a1c1d"
  accent: "#2c6ecb"
  on-primary: "#FFFFFF"
  on-surface: "#000000"
  on-accent: "#FFFFFF"
typography:
  h1:
    fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', system-ui, sans-serif"
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

Shopify Polaris visual system, translated from the Claude Artisan catalog for use in digital products. Merchant-admin focused, calm and legible; Card-based layouts, clear affordances

- **Category:** flat-platform
- **Era:** 2017–present
- **Origin:** Shopify.
- **Reference:** Shopify admin.
- **Structural base:** hero, superfície, conteúdo e grade responsiva

**Defining traits:**
- Merchant-admin focused, calm and legible
- Card-based layouts, clear affordances
- Accessible, restrained color
- Content guidelines baked in

## Colors

- **bg** — #f1f2f4
- **surface** — #ffffff
- **surface-strong** — #f6f6f7
- **border** — #d2d5d9
- **text** — #1a1c1d
- **text-muted** — #5c5f62
- **primary** — #008060
- **accent** — #2c6ecb
- **critical** — #d82c0d

## Typography

- Display: -apple-system, 'Segoe UI', system-ui, sans-serif
- Body: -apple-system, 'Segoe UI', 'Helvetica Neue', system-ui, sans-serif
- Mono: ui-monospace, 'SFMono-Regular', monospace

## Layout

- hero, superfície, conteúdo e grade responsiva
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Merchant-admin focused, calm and legible; Card-based layouts, clear affordances; Accessible, restrained color; Content guidelines baked in; sombras e elevação

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

<!-- Source: https://designmd.app/library/polaris · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/polaris — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
