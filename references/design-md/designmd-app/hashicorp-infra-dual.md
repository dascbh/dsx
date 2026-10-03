---
version: "alpha"
name: "HashiCorp Infra Dual"
description: "HashiCorp-inspired infrastructure landing page. Ideal for infraestrutura cloud, devops, automação de infraestrutura, plataformas multi-produto. AI-ready template."
colors:
  primary: "#000000"
  secondary: "#ffffff"
  tertiary: "#15181e"
  neutral: "#f1f2f3"
  surface: "#7b42bc"
  accent: "#ffcf25"
typography:
  h1:
    fontFamily: system-ui
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: system-ui
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: system-ui
    fontSize: 0.75rem
    fontWeight: 500
rounded:
  sm: 5px
  md: 10px
  lg: 15px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

HashiCorp-inspired infrastructure landing page. Ideal for infraestrutura cloud, devops, automação de infraestrutura, plataformas multi-produto. AI-ready template. HashiCorp didn't arrive at dual-mode theming through aesthetic preference — it was an operational necessity. When your users are staring at terminal output and infrastructure graphs for twelve-hour incident responses, the interface needs to disappear. Their design language evolved from the practical reality that DevOps engineers work across wildly different ambient conditions: bright office floors during planning, dark war rooms during outages, and everything between.

The infrastructure vertical has a specific relationship with light and dark modes that consumer apps never developed. Tools like Terraform, Vault, and Consul needed interfaces that could sit alongside terminal windows without creating jarring contrast shifts. HashiCorp's approach treats the two modes not as a toggle between inverted palettes, but as two complete tonal systems — each with its own contrast ratios, elevation cues, and information hierarchy. The dark mode isn't just 'flip the background'; the entire spatial language recalibrates.

This dual-system thinking influenced the broader infrastructure tooling space. Datadog, Grafana, and PagerDuty all eventually adopted similar philosophies, but HashiCorp's Helios design system codified the pattern earliest with genuine rigor around semantic color tokens that maintain meaning across both modes.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 4/10 — Subtle

- **Style:** Enterprise Infrastructure, Dual Light/Dark, Multi-Product Colors, Micro-Shadows, Uppercase Labels
- **Keywords:** hashicorp, infrastructure, dual mode, multi-product colors, micro-shadows, HashiCorp Sans, kern, terraform purple, vault yellow, tight headings
- **Era:** 2024-2026 Cloud Infrastructure
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- **Preto** (#000000) — Dark surface, primary background
- **Branco** (#ffffff) — Light surface, card backgrounds
- **Dark Charcoal** (#15181e) — Dark surface, primary background
- **Cinza Claro** (#f1f2f3) — Secondary text, borders, muted elements
- **Terraform Purple** (#7b42bc) — Accent color, emphasis elements
- **Vault Yellow** (#ffcf25) — Warning states, attention indicators
- **Waypoint Teal** (#14c6cb) — Secondary accent
- **Vagrant Blue** (#1868f2) — Secondary accent


## Typography

- **Display / Hero:** system-ui — Weight 700, tight tracking, used for headline impact
- **Body:** system-ui — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** system-ui — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

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

Dual-mode: seções brancas limpas + hero/produto em dark (#15181e). Font customizada com weight 600-700 e kern habilitado. Sistema de cores multi-produto (Terraform roxo, Vault amarelo, Waypoint teal, Vagrant azul). Micro-sombras dual-layer (rgba(97,104,117,0.05)). Labels uppercase 13px weight 600 com 1.3px letter-spacing. Border-radius tight (2-8px). Profundidade via layering de cor, não sombras. Body text relaxado (line-height 1.63-1.69).

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 5px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Rounded (5px) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Rounded (5px) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
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

- Do Dual-mode light/dark
- Do Multi-product colors
- Do Kern habilitado
- Do Micro-sombras
- Do Uppercase labels 1.3px
- Do Radius tight 2-8px
- Do Hero 82px weight 600
- Do Responsivo


## Use Case

Infraestrutura cloud, DevOps, Automação de infraestrutura, Platforms multi-produto

<!-- Source: https://designmd.app/library/hashicorp-infra-dual · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/hashicorp-infra-dual — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
