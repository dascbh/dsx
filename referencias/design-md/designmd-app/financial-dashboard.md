---
version: "alpha"
name: "Financial Dashboard"
description: "Financial dashboard. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#22C55E"
  secondary: "#EF4444"
  tertiary: "#003366"
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
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    padding: 12px
---

## Overview

Financial dashboard. Ideal for landing pages, modern websites. AI-ready template. Financial dashboards owe everything to the Bloomberg Terminal. That green-on-black density, the unapologetic information overload — it worked because traders needed everything at once. No progressive disclosure. No friendly onboarding. Just raw data, fast. For decades, financial visualization meant exactly this: professional tools built for professionals who already knew what they were looking at.

Then fintech broke the door open. Robinhood, Stripe Dashboard, Mercury — suddenly people who weren't finance majors needed to read P&L statements and cash flow charts. The design challenge shifted from 'how much can we show' to 'how much can someone actually absorb.' Hierarchy became everything. Color stopped being decorative and started carrying semantic weight: green up, red down, and please don't make me think about which is which.

The 2020s financial dashboard lives in this tension. It respects the density that power users demand while acknowledging that most people checking their revenue metrics at 7am haven't had coffee yet. The best ones feel calm until you need them not to be.

- Density: 8/10 — Dense
- Variance: 4/10 — Moderate
- Motion: 6/10 — Expressive

- **Style:** BI/Analytics
- **Keywords:** Revenue metrics, profit/loss visualization, budget tracking, financial ratios, portfolio performance, cash flow, audit trail
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- **green** (#22C55E) — Primary surface or dominant color
- **red** (#EF4444) — Error states, destructive actions
- **dark blue** (#003366) — Dark surface, primary background


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

Number animations (count-up), trend direction indicators, percentage change animations, profit/loss color transitions

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
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Currency formatted
- Do Decimals consistent
- Do P&L clear
- Do Budget variance shown
- Do Audit trail complete
- Do Export to Excel


## Use Case

Landing pages, Modern websites

<!-- Source: https://designmd.app/library/financial-dashboard · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/financial-dashboard — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
