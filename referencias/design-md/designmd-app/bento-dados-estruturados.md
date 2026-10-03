---
version: "alpha"
name: "Bento Dados Estruturados"
description: "Data-driven and organized Bento Style landing page for a data analysis dashboard. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#2C3E50"
  secondary: "#FFFFFF"
  tertiary: "#20B2AA"
  neutral: "#ECF0F1"
  surface: "#FF8C00"
  accent: "#8A2BE2"
typography:
  h1:
    fontFamily: Roboto Mono
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Roboto Mono
    fontSize: 1rem
    fontWeight: 400
rounded:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Data-driven and organized Bento Style landing page for a data analysis dashboard. Ideal for landing pages, modern websites. AI-ready template. The bento grid didn't start in data. It started in editorial — Japanese magazine layouts, compartmentalized lunch boxes, the quiet logic of things placed with intention. But data people noticed. Because when you're staring at seventeen metrics and four time series, the last thing you need is visual chaos.

Card-based layouts gave analysts something spreadsheets never could: hierarchy without rigidity. A KPI card breathes differently than a trend chart. A small status indicator doesn't compete with a full-width cohort table. The bento approach lets each data module claim exactly the space it deserves — no more, no less. Edward Tufte talked about data density. Bento grids operationalize it.

What makes this pattern stick in BI contexts is adaptability. A CEO dashboard and an engineer's monitoring panel use the same structural grammar but speak entirely different visual dialects. The grid accommodates both without breaking.

- Density: 8/10 — Dense
- Variance: 2/10 — Structured
- Motion: 4/10 — Subtle

- **Style:** Data-Driven, Organized, Clean
- **Keywords:** data analysis, dashboard, business intelligence, bento grid, organized, clean, intuitive, structured, precise, modern
- **Era:** 2026+ Insights Visuais
- **Light/Dark:** ✓ Full / ✗ No

## Colors

- **Azul Escuro** (#2C3E50) — Dark surface, primary background
- **Branco** (#FFFFFF) — Light surface, card backgrounds
- **Verde Água** (#20B2AA) — Supporting palette color
- **Cinza Claro** (#ECF0F1) — Secondary text, borders, muted elements
- **Laranja** (#FF8C00) — Warm accent, call-to-action secondary
- **Roxo** (#8A2BE2) — Accent color, emphasis elements
- **Amarelo** (#FFD700) — Warning states, attention indicators
- **Preto** (#000000) — Deep contrast surface


## Typography

- **Display / Hero:** Bento — Weight 700, tight tracking, used for headline impact
- **Accent:** Roboto Mono — Used for decorative or emphasis text
- **Body:** Bento — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Bento — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** Roboto Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Layouts de grid "Bento" para visualização de dados, cards com gráficos e métricas claras, tipografia sans-serif técnica, ícones de dados minimalistas, micro-interações de hover com detalhes de métricas, transições de dados suaves e funcionais, foco na organização e clareza.

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Rounded (8px) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Rounded (8px) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Layouts de grid "Bento" para dados
- Do Cards com gráficos/métricas
- Do Tipografia sans-serif técnica
- Do Ícones de dados minimalistas
- Do Micro-interações de detalhes de métricas
- Do Transições de dados suaves.


## Use Case

Landing pages, Modern websites

<!-- Source: https://designmd.app/library/bento-dados-estruturados · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/bento-dados-estruturados — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
