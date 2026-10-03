---
version: "alpha"
name: "Data-Dense Dashboard"
description: "Data-dense dashboard. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#F5F5F5"
  secondary: "#333333"
  tertiary: "#22C55E"
  neutral: "#F59E0B"
  surface: "#EF4444"
typography:
  h1:
    fontFamily: System UI stack
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: System UI stack
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: System UI stack
    fontSize: 0.75rem
    fontWeight: 500
spacing:
  sm: 8.0px
  md: 16.0px
  lg: 32.0px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Data-dense dashboard. Ideal for landing pages, modern websites. AI-ready template. Dashboards didn't start pretty. They started as literal instrument panels — cockpit gauges, factory readouts, walls of blinking lights. The digital version inherited that DNA: cram everything into one screen so the operator never has to click away. Edward Tufte gave us the vocabulary to talk about why some of those screens worked and others were garbage. Data-ink ratio. Chartjunk. The idea that every pixel should earn its place. His influence is still the gravitational center of dashboard design, whether people have read him or not.

The 2010s brought a wave of democratized tooling — Grafana, Metabase, Looker — that made it trivially easy to throw twelve charts on a page and call it a dashboard. Which meant most dashboards became noise. The real craft isn't adding widgets. It's knowing which ones to kill.

Modern data-dense dashboards walk a razor's edge: show enough to eliminate tab-switching, but structure it so the eye knows where to land first. The best ones feel calm despite containing enormous amounts of information. That's the trick. Density without chaos.

- Density: 8/10 — Dense
- Variance: 2/10 — Structured
- Motion: 6/10 — Expressive

- **Style:** BI/Analytics
- **Keywords:** Multiple charts/widgets, data tables, KPI cards, minimal padding, grid layout, space-efficient, maximum data visibility
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- **light grey/white** (#F5F5F5) — Light surface, card backgrounds
- **dark text** (#333333) — Dark surface, primary background
- **green** (#22C55E) — Success states, positive indicators
- **amber** (#F59E0B) — Warning states, attention indicators
- **red** (#EF4444) — Error states, destructive actions


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

Hover tooltips, chart zoom on click, row highlighting on hover, smooth filter animations, data loading spinners

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 480ms ease-out. Staggered cascades for lists: 100ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
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
- No decorative gradients — flat color only
- No shadows heavier than 0 2px 8px rgba(0,0,0,0.08)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Grid layout 12 columns
- Do KPI cards responsive
- Do Tables sortable
- Do Filters functional
- Do Loading states for data
- Do Export functionality


## Use Case

Landing pages, Modern websites

<!-- Source: https://designmd.app/library/data-dense-dashboard · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/data-dense-dashboard — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
