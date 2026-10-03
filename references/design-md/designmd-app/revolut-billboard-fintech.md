---
version: "alpha"
name: "Revolut Billboard Fintech"
description: "Revolut-inspired billboard fintech landing page. Ideal for banking digital, fintechs, plataformas financeiras, neobanks. AI-ready template."
colors:
  primary: "#191c1f"
  secondary: "#ffffff"
  tertiary: "#f4f4f4"
  neutral: "#494fdf"
  surface: "#e23b4a"
  accent: "#00a87e"
typography:
  h1:
    fontFamily: system-ui for display
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: system-ui for display
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: system-ui for display
    fontSize: 0.75rem
    fontWeight: 500
rounded:
  sm: 9999px
  md: 19998px
  lg: 29997px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Revolut-inspired billboard fintech landing page. Ideal for banking digital, fintechs, plataformas financeiras, neobanks. AI-ready template. Revolut's billboard campaigns represent a deliberate rejection of the friendly, illustration-heavy aesthetic that dominated fintech marketing through the late 2010s. Where competitors leaned into soft gradients and cartoon characters to appear approachable, Revolut went the opposite direction — massive type, stark contrast, zero decoration. The message was clear: we're not your quirky startup bank, we're infrastructure.

The approach borrows heavily from Swiss International Style but strips it further. Josef Müller-Brockmann's grid discipline meets the raw confidence of 1960s Helvetica posters, scaled to urban billboards where you have exactly two seconds of attention. There's no illustration to hide behind. The typography IS the design.

What makes this work in fintech specifically is the trust signal embedded in restraint. When you're asking people to move their money, visual noise reads as uncertainty. Revolut's billboards communicate institutional confidence through typographic scale alone — the kind of authority that used to belong exclusively to legacy banks with marble lobbies.

- Density: 3/10 — Airy
- Variance: 2/10 — Structured
- Motion: 4/10 — Subtle

- **Style:** Billboard Typography, Aeonik Pro 500, Universal Pill Buttons, Zero Shadows, Binary Dark/White
- **Keywords:** revolut, billboard, fintech, Aeonik Pro, weight 500, 136px display, pill buttons, zero shadows, Inter positive tracking, semantic tokens
- **Era:** 2024-2026 Digital Banking
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- **Revolut Dark** (#191c1f) — Dark surface, primary background
- **Branco** (#ffffff) — Light surface, card backgrounds
- **Light Surface** (#f4f4f4) — Supporting palette color
- **Azul** (#494fdf) — Accent highlight, links and focus states
- **Danger Red** (#e23b4a) — Error states, destructive actions
- **Teal** (#00a87e) — Secondary accent
- **Warning Orange** (#ec7e00) — Warning states, attention indicators
- **Cinza** (#8d969e) — Secondary text, borders, muted elements


## Typography

- **Display / Hero:** system-ui for display — Weight 700, tight tracking, used for headline impact
- **Body:** system-ui for display — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** system-ui for display — 0.875rem, weight 500, slight letter-spacing
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

Tipografia billboard: Aeonik Pro 136px weight 500 com tracking -2.72px — escala de estádio. Near-black (#191c1f) e branco como paleta binária para marketing. Botões pill universais (9999px) com padding generoso (14px 32px). Zero sombras — profundidade apenas via contraste de cor. Inter para body com tracking positivo (+0.16px a +0.24px). Sistema de cores semânticas rico (--rui-*) reservado para produto. Hover com opacity 0.85. Seções alternando dark/white.

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 9999px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Pill-shaped (9999px) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Pill-shaped (9999px) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
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

- Do Display 136px weight 500
- Do Tracking -2.72px billboard
- Do Pill buttons 9999px universais
- Do Zero sombras
- Do Binary dark/white
- Do Inter tracking positivo
- Do Hover opacity 0.85
- Do Responsivo


## Use Case

Banking digital, Fintechs, Platforms financeiras, Neobanks

<!-- Source: https://designmd.app/library/revolut-billboard-fintech · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/revolut-billboard-fintech — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
