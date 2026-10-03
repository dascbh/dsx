---
version: "alpha"
name: "Primer"
description: "Primer visual system, translated from the Claude Artisan catalog for use in digital products. Developer-tool clarity, dense but calm; Mona Sans / system fonts, octicon iconography"
colors:
  primary: "#1f883d"
  background: "#f6f8fa"
  surface: "#ffffff"
  text: "#1f2328"
  accent: "#0969da"
  on-primary: "#000000"
  on-surface: "#000000"
  on-accent: "#FFFFFF"
typography:
  h1:
    fontFamily: "-apple-system, 'Segoe UI', sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "-apple-system, 'Segoe UI', 'Noto Sans', 'Helvetica Neue', sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "-apple-system, 'Segoe UI', 'Noto Sans', 'Helvetica Neue', sans-serif"
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "6px"
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

Primer visual system, translated from the Claude Artisan catalog for use in digital products. Developer-tool clarity, dense but calm; Mona Sans / system fonts, octicon iconography

- **Category:** flat-platform
- **Era:** 2017–present
- **Origin:** GitHub.
- **Reference:** GitHub.com.
- **Structural base:** hero, superfície, conteúdo e grade responsiva

**Defining traits:**
- Developer-tool clarity, dense but calm
- Mona Sans / system fonts, octicon iconography
- Robust light/dark theming
- Content-first, code-friendly

## Colors

- **bg** — #f6f8fa
- **surface** — #ffffff
- **surface-strong** — #f6f8fa
- **border** — #d0d7de
- **text** — #1f2328
- **text-muted** — #59636e
- **primary** — #1f883d
- **accent** — #0969da
- **danger** — #cf222e

## Typography

- Display: -apple-system, 'Segoe UI', sans-serif
- Body: -apple-system, 'Segoe UI', 'Noto Sans', 'Helvetica Neue', sans-serif
- Mono: ui-monospace, 'SFMono-Regular', 'Consolas', monospace

## Layout

- hero, superfície, conteúdo e grade responsiva
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Developer-tool clarity, dense but calm; Mona Sans / system fonts, octicon iconography; Robust light/dark theming; Content-first, code-friendly; sombras e elevação

## Shapes

- Radius scale: 6px, 6px, 12px.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/primer · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/primer — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
