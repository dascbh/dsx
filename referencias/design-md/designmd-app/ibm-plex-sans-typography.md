---
version: "alpha"
name: "IBM Plex Sans Typography"
description: "Render a 2D isolated text on a solid background. Ideal for enterprise products, design systems, documentation, and tech brands.. AI-ready template."
colors:
  primary: "#FFFFFF"
  secondary: "#09524F"
typography:
  h1:
    fontFamily: IBM Plex Sans
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 1rem
    fontWeight: 400
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    padding: 12px
---

## Overview

Render a 2D isolated text on a solid background. Ideal for enterprise products, design systems, documentation, and tech brands.. AI-ready template. IBM Plex Sans arrived in 2017 as the replacement for Helvetica Neue across IBM's entire ecosystem — a move that signaled something bigger than a rebrand. For decades, IBM licensed Helvetica, paying millions annually for a typeface that said nothing about who they actually were. Plex was IBM's declaration of typographic independence: engineered in-house with Mike Abbink and Bold Monday, released under the Open Font License, and built to carry the weight of one of computing's oldest institutions without borrowing someone else's voice.

The design itself is a fascinating negotiation between warmth and precision. Plex takes the grotesque skeleton — that rational, engineered DNA — and introduces subtle humanist details: the slightly angled terminals, the open apertures, the gentle curve on the lowercase 'l' that prevents confusion with the numeral '1'. These aren't decorative choices. They're functional decisions made by people who understood that IBM's typography would live on terminal screens, in documentation, on conference stages, and in code editors simultaneously.

What makes Plex genuinely interesting in the type landscape is its philosophical position. It's corporate typography that refuses to be generic. It's engineered but not cold. It's open-source from a company that once epitomized proprietary everything. That tension — between institutional authority and open collaboration — is baked into every glyph.

- Density: 7/10 — Compact
- Variance: 2/10 — Structured
- Motion: 4/10 — Subtle

- **Style:** Corporate, engineered humanist sans
- **Keywords:** IBM Plex Sans, corporate, engineered, tech brands, technical precision
- **Era:** Contemporary Web
- **Light/Dark:** ✗ No / ✓ Full

## Colors

- **#FFFFFF** (#FFFFFF) — Primary surface or dominant color
- **#09524F** (#09524F) — Extended palette, decorative use


## Typography

- **Display / Hero:** IBM Plex Sans — Weight 700, tight tracking, used for headline impact
- **Body:** IBM Plex Sans — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** IBM Plex Sans — 0.875rem, weight 500, slight letter-spacing
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

Tight tracking (-3%), 90% leading

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Subtly rounded (0.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Subtly rounded (0.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
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

- Do IBM Plex Sans Font
- Do Color: #FFFFFF
- Do Tracking -3%
- Do Background #09524F


## Use Case

Enterprise products, design systems, documentation, and tech brands.

<!-- Source: https://designmd.app/library/ibm-plex-sans-typography · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/ibm-plex-sans-typography — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
