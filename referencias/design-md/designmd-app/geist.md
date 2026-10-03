---
version: "alpha"
name: "Vercel Geist"
description: "Vercel Geist visual system, translated from the Claude Artisan catalog for use in digital products. High-contrast black/white, precise geometry; Geist Sans/Mono, tight grid"
colors:
  primary: "#fafafa"
  background: "#0a0a0a"
  surface: "#111111"
  text: "#fafafa"
  accent: "#0072f5"
  on-primary: "#000000"
  on-surface: "#FFFFFF"
  on-accent: "#000000"
typography:
  h1:
    fontFamily: "'Geist', system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "'Geist', 'Geist Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "'Geist', 'Geist Sans', system-ui, -apple-system, sans-serif"
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

Vercel Geist visual system, translated from the Claude Artisan catalog for use in digital products. High-contrast black/white, precise geometry; Geist Sans/Mono, tight grid

- **Category:** flat-platform
- **Era:** 2023–present
- **Origin:** Vercel Geist design system + Geist typeface.
- **Reference:** Vercel.com; Next.js docs.
- **Structural base:** grade modular responsiva

**Defining traits:**
- High-contrast black/white, precise geometry
- Geist Sans/Mono, tight grid
- Subtle gradients and grain accents
- Developer-premium minimalism

## Colors

- **bg** — #0a0a0a
- **surface** — #111111
- **surface-strong** — #191919
- **border** — #2a2a2a
- **text** — #fafafa
- **text-muted** — #a1a1a1
- **primary** — #fafafa
- **accent** — #0072f5

## Typography

- Display: 'Geist', system-ui, sans-serif
- Body: 'Geist', 'Geist Sans', system-ui, -apple-system, sans-serif
- Mono: 'Geist Mono', ui-monospace, monospace

## Layout

- grade modular responsiva
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- High-contrast black/white, precise geometry; Geist Sans/Mono, tight grid; Subtle gradients and grain accents; Developer-premium minimalism; sombras e elevação

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

<!-- Source: https://designmd.app/library/geist · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/geist — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
