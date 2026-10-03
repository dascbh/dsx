---
version: "alpha"
name: "Claymorphism"
description: "Playful, toy-like interface with soft 3D, chunky elements, bubbly aesthetic, rounded edges (16-24px), thick borders (3-4px), double shadows (inner + outer), pastel colors, smooth animations. Ideal for apps infantis, creative tools, education, jogos interativos. AI-ready template."
colors:
  primary: "#FDBCB4"
  secondary: "#ADD8E6"
  tertiary: "#98FF98"
  neutral: "#E6E6FA"

typography:
  h1:
    fontFamily: -apple-system, sans-serif
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: -apple-system, sans-serif
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: -apple-system, sans-serif
    fontSize: 0.75rem
    fontWeight: 500
rounded:
  sm: 20px
  md: 40px
  lg: 60px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Playful, toy-like interface with soft 3D, chunky elements, bubbly aesthetic, rounded edges (16-24px), thick borders (3-4px), double shadows (inner + outer), pastel colors, smooth animations. Ideal for apps infantis, creative tools, education, jogos interativos. AI-ready template. Claymorphism emerged around 2021 as designers got bored with flat UI and started pulling visual language from 3D illustration tools. The Clay.io aesthetic, combined with the explosion of Blender and Cinema4D artists creating chunky, inflated characters for tech brands, gave UI designers permission to make interfaces feel tactile again. People were rendering soft, squishy objects and thinking: why can't buttons feel like this?

It's worth distinguishing this from neumorphism, which tried (and mostly failed) to simulate realistic depth through subtle light and shadow on monochrome surfaces. Claymorphism doesn't pretend to be realistic. It's deliberately toy-like, exaggerated, cartoonish. The shadows are colored. The shapes are puffy. Nothing here is trying to fool your eye into thinking it's a real object on your desk.

By 2026, claymorphism has settled into a comfortable niche. You see it in educational platforms, creative tools, and anywhere the brand voice skews young or playful. It never took over enterprise UI (thankfully), but it proved that depth and whimsy have a place in digital product design when the context is right.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 8/10 — Cinematic

- **Style:** Soft, Playful, Rounded, Colorful
- **Keywords:** Soft 3D, chunky, playful, toy-like, bubbly, thick borders (3-4px), double shadows, rounded (16-24px)
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ◐ Partial

## Colors

- **Soft Peach** (#FDBCB4) — Primary surface or dominant color
- **Baby Blue** (#ADD8E6) — Accent highlight, links and focus states
- **Mint** (#98FF98) — Supporting palette color
- **Lilac** (#E6E6FA) — Supporting palette color


## Typography

- **Display / Hero:** System UI stack (-apple-system, sans-serif) — Weight 700, tight tracking, used for headline impact
- **Body:** System UI stack (-apple-system, sans-serif) — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** System UI stack (-apple-system, sans-serif) — 0.875rem, weight 500, slight letter-spacing
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

Inner+outer shadows (subtle, no hard lines), soft press (200ms ease-out), fluffy elements, smooth transitions

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 540ms ease-out. Staggered cascades for lists: 120ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 20px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Generously rounded (1.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Generously rounded (1.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
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

- Do Border-radius 16-24px
- Do Thick borders 3-4px
- Do Double shadows (inner+outer)
- Do Pastel colors used
- Do Soft bounce animations
- Do Playful interactions


## Use Case

Kids apps, Creative tools, Education, Interactive games

<!-- Source: https://designmd.app/library/claymorphism · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/claymorphism — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
