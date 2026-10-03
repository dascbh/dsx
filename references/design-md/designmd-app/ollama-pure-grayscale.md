---
version: "alpha"
name: "Ollama Pure Grayscale"
description: "Radically minimal Ollama-inspired landing page. Ideal for ferramentas cli, open-source, plataformas developer minimalistas, modelos de ia local. AI-ready template."
colors:
  primary: "#000000"
  secondary: "#ffffff"
  tertiary: "#e5e5e5"
  neutral: "#fafafa"
  surface: "#262626"
  accent: "#737373"
typography:
  h1:
    fontFamily: SF Pro Rounded
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: SF Pro Rounded
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: SF Pro Rounded
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

Radically minimal Ollama-inspired landing page. Ideal for ferramentas cli, open-source, plataformas developer minimalistas, modelos de ia local. AI-ready template. The Swiss International Style never needed color to command authority. When Müller-Brockmann set Akzidenz-Grotesk against a white field in the 1950s, he proved that typographic hierarchy alone could carry an entire communication system. Ollama's pure grayscale approach isn't retro nostalgia — it's a direct continuation of that lineage, filtered through the terminal aesthetic that developers already inhabit daily.

Stripping color entirely is a radical act in 2024's interface landscape. While every SaaS product drowns in gradient blobs and purple-to-blue CTAs, a grayscale system declares that the content is the interface. There's no decoration to hide behind. Every pixel of spacing, every weight choice, every contrast ratio becomes load-bearing structure. This is design for people who read man pages voluntarily.

The Ollama model — local-first, open-source, no-account-required — demands a visual language equally free of corporate polish. Grayscale communicates honesty. It says: we spent our time on the model weights, not the marketing site. That alignment between product philosophy and visual identity is where real design systems earn trust.

- Density: 3/10 — Airy
- Variance: 2/10 — Structured
- Motion: 4/10 — Subtle

- **Style:** Radical Minimalism, Pure Grayscale, Pill Geometry, Zero Shadows, SF Pro Rounded
- **Keywords:** ollama, grayscale, radical minimalism, pill geometry, zero shadows, SF Pro Rounded, binary radius, developer CLI, monochrome
- **Era:** 2024-2026 Radical CLI Minimalism
- **Light/Dark:** ✓ Full / ✗ Not Recommended

## Colors

- **Preto** (#000000) — Dark surface, primary background
- **Branco** (#ffffff) — Light surface, card backgrounds
- **Cinza Claro** (#e5e5e5) — Secondary text, borders, muted elements
- **Snow** (#fafafa) — Light surface, card backgrounds
- **Quase Preto** (#262626) — Deep contrast surface
- **Stone** (#737373) — Extended palette, decorative use
- **Silver** (#a3a3a3) — Extended palette, decorative use
- **Escuro** (#090909) — Deep contrast surface


## Typography

- **Display / Hero:** SF Pro Rounded — Weight 700, tight tracking, used for headline impact
- **Body:** SF Pro Rounded — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** SF Pro Rounded — 0.875rem, weight 500, slight letter-spacing
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

Zero cor cromática — paleta 100% grayscale. Zero sombras em qualquer elemento. Geometria pill (9999px) em TUDO interativo — botões, tabs, inputs, tags. Containers com 12px radius — o único radius não-pill. SF Pro Rounded para headlines criando suavidade distintiva. Profundidade apenas via mudanças de cor de fundo e bordas 1px. Conteúdo extremamente restrito — cada seção apresenta uma ideia clara.

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
- No decorative gradients — flat color only
- No shadows heavier than 0 2px 8px rgba(0,0,0,0.08)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Paleta 100% grayscale
- Do Zero sombras
- Do Pill 9999px em tudo interativo
- Do 12px em containers
- Do SF Pro Rounded headlines
- Do Profundidade via cor/bordas
- Do Conteúdo restrito
- Do Responsivo


## Use Case

CLI tools, Open-source, Platforms developer minimalist, Modelos de IA local

<!-- Source: https://designmd.app/library/ollama-pure-grayscale · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/ollama-pure-grayscale — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
