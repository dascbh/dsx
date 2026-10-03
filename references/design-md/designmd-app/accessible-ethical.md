---
version: "alpha"
name: "Accessible & Ethical"
description: "Design with WCAG AAA compliance. Ideal for government, healthcare, education, qualquer site inclusivo. AI-ready template."
colors:
  primary: "#000000"
  secondary: "#333333"
  tertiary: "#0000FF"
  neutral: "#FFFFFF"

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
---

## Overview

Design with WCAG AAA compliance. Ideal for government, healthcare, education, qualquer site inclusivo. AI-ready template. Accessibility on the web started as a whisper. Section 508 in 1998 forced US federal agencies to make their digital stuff usable by people with disabilities, but the private sector mostly shrugged. Then WCAG 1.0 dropped in 1999 — a noble attempt, honestly kind of unreadable, and largely ignored by anyone shipping product. For years, accessibility lived in a sad little checkbox at the bottom of a QA spreadsheet. Nobody designed for it. They retrofitted for it, badly, at the last minute.

Everything changed when the lawsuits started. Domino's Pizza. Beyoncé's website. Target. Suddenly 'we'll fix it later' became 'our legal team says fix it now.' The ADA, written decades before the web existed, got interpreted to cover digital experiences. Companies started paying six-figure settlements over missing alt text and inaccessible forms. That woke people up fast.

Now we're somewhere more interesting. The best teams don't treat accessibility as compliance — they treat it as a design constraint that makes everything better. Like responsive design before it, accessibility is shifting from 'extra work' to 'this is just how we build things.' WCAG 2.2 and the push toward AAA aren't aspirational anymore. They're the baseline smart teams aim for.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 6/10 — Expressive

- **Style:** Inclusive, High-Contrast, Semantic, Keyboard-Friendly
- **Keywords:** High contrast, large text (16px+), keyboard navigation, screen reader friendly, WCAG compliant, focus state, semantic
- **Era:** Universal
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- Palette derived from style keywords and era context


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

Clear focus rings (3-4px), ARIA labels, skip links, responsive design, reduced motion, 44x44px touch targets

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 480ms ease-out. Staggered cascades for lists: 100ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.




## Shapes

Base corner radius: 4px. See rounded tokens in front matter for the full scale.

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

- Do WCAG AAA verified
- Do 7:1+ contrast checked
- Do Keyboard navigation tested
- Do Screen reader tested
- Do Focus visible 3-4px
- Do Semantic HTML used
- Do Touch targets 44x44px


## Use Case

Government, Healthcare, Education, Qualquer site inclusivo

<!-- Source: https://designmd.app/library/accessible-ethical · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/accessible-ethical — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
