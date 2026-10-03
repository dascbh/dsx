---
version: "alpha"
name: "Blue Professional"
description: "Blue Professional — Cream paper background with electric cobalt blue accents; clean modern professional. Space Grotesk typography. warm cream paper background with one electric cobalt blue accent. Best for B2B SaaS pitch, consulting deliverable, internal review. AI-ready design system."
colors:
  primary: "#FDFAE7"
  secondary: "#1E2BFA"
  tertiary: "#111111"
  neutral: "#6B6B6B"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Space Grotesk
    fontSize: 1rem
    fontWeight: 400
rounded:
  sm: 4px
  md: 8px
  lg: 12px
spacing:
  sm: 1.5rem
  md: 3.0rem
  lg: 6.0rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Blue Professional — Cream paper background with electric cobalt blue accents; clean modern professional. Space Grotesk typography. warm cream paper background with one electric cobalt blue accent. Best for B2B SaaS pitch, consulting deliverable, internal review. AI-ready design system. The pairing of cobalt blue with cream paper stock isn't arbitrary — it's a direct lineage from mid-century Swiss corporate identity. When Müller-Brockmann and his contemporaries were building visual systems for banks and insurance firms in the 1950s, they understood something fundamental: authority doesn't need to shout. The deep blue carried institutional weight while cream softened the Germanic rigidity that pure white imposed.

This combination survived the digital transition better than most because it solves a real problem. Pure white screens at 300+ nits are hostile. Cream backgrounds reduce perceived contrast without sacrificing legibility, and cobalt provides enough chromatic punch to establish hierarchy without the visual noise of a broader palette. It's the typographic equivalent of a well-tailored navy suit — nobody questions it, nobody remembers it specifically, but everyone trusts it.

The minimalist constraint here isn't aesthetic preference — it's strategic. Professional services sell expertise, not personality. Every decorative element you add is a potential objection, a reason for a conservative buyer to hesitate. The Swiss understood this: reduce until only the message remains.

- Density: 5/10 — Balanced
- Variance: 6/10 — Dynamic
- Motion: 4/10 — Subtle

- **Style:** Clean, Professional, Restrained, Modern
- **Keywords:** Clean professional, cobalt blue, cream paper, single accent, restrained, SaaS, modern sans, trustworthy
- **Era:** 2020s Corporate
- **Light/Dark:** ✓ Full / ✗ None

## Colors

- **Bg** (#FDFAE7) — Primary surface or dominant color
- **Primary** (#1E2BFA) — Accent highlight, links and focus states
- **Text** (#111111) — Secondary accent
- **Text Muted** (#6B6B6B) — Accent color, emphasis elements


## Typography

- **Display / Hero:** Space Grotesk — Weight 700, tight tracking, used for headline impact
- **Body:** Inter — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Inter — 0.875rem, weight 500, slight letter-spacing
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

display font Space Grotesk for hero headlines, smooth hover transitions (200-250ms), subtle lift shadows, electric cobalt on warm cream paper, restrained single-accent system

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 4px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** 4px border-radius. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** 4px corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
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

- Do Space Grotesk display font loaded via Google Fonts
- Do Color palette variables applied consistently
- Do Typography scale: hero clamp(2.5rem,5vw,4rem)
- Do H1 2.25rem
- Do body 1rem/1.6
- Do WCAG AA contrast ratio verified (4.5:1 body text)
- Do Mobile responsive layout (stack below 768px)


## Use Case

B2B SaaS pitch, consulting deliverable, internal review, advisory pitch, investor update

<!-- Source: https://designmd.app/library/blue-professional · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/blue-professional — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
