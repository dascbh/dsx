---
version: "alpha"
name: "Ant Design"
description: "Ant Design visual system, translated from the Claude Artisan catalog for use in digital products. Dense, component-rich enterprise UI; Blue primary, subtle shadows, 6px radius default"
colors:
  primary: "#1677ff"
  background: "#f5f5f5"
  surface: "#ffffff"
  text: "#1f1f1f"
  accent: "#13c2c2"
  on-primary: "#000000"
  on-surface: "#000000"
  on-accent: "#000000"
typography:
  h1:
    fontFamily: "-apple-system, 'Segoe UI', sans-serif"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
  body-md:
    fontFamily: "-apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label-caps:
    fontFamily: "-apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "0.75rem"
    fontWeight: "600"
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
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

Ant Design visual system, translated from the Claude Artisan catalog for use in digital products. Dense, component-rich enterprise UI; Blue primary, subtle shadows, 6px radius default

- **Category:** flat-platform
- **Era:** 2015–present
- **Origin:** Ant Group / Alibaba (Chinese enterprise ecosystem).
- **Reference:** Alibaba enterprise consoles; many admin panels.
- **Structural base:** hero, superfície, conteúdo e grade responsiva

**Defining traits:**
- Dense, component-rich enterprise UI
- Blue primary, subtle shadows, 6px radius default
- Comprehensive form/table components
- Pragmatic, information-heavy

## Colors

- **bg** — #f5f5f5
- **surface** — #ffffff
- **surface-strong** — #fafafa
- **border** — #d9d9d9
- **text** — #1f1f1f
- **text-muted** — #595959
- **primary** — #1677ff
- **accent** — #13c2c2

## Typography

- Display: -apple-system, 'Segoe UI', sans-serif
- Body: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif
- Mono: 'SFMono-Regular', Consolas, monospace

## Layout

- hero, superfície, conteúdo e grade responsiva
- Use a responsive grid and preserve content hierarchy.
- Collapse columns below 768px without horizontal overflow.

## Elevation & Depth

- Dense, component-rich enterprise UI; Blue primary, subtle shadows, 6px radius default; Comprehensive form/table components; Pragmatic, information-heavy; sombras e elevação

## Shapes

- Radius scale: 4px, 6px, 8px.

## Components

- Buttons keep visible focus and predictable hover/pressed states.
- Cards use the surface and radius scale from the tokens.
- Forms expose persistent labels, textual errors, and keyboard focus.

## Do's and Don'ts

- Do: follow the tokens and the structural composition.
- Do: maintain WCAG AA contrast and `prefers-reduced-motion`.
- Avoid: using the style as decoration without functional hierarchy.

<!-- Source: https://designmd.app/library/ant-design · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/ant-design — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
