---
version: "alpha"
name: "Analytics Metric Flow"
description: "Design uma landing page analytics SaaS em scroll contínuo: hero fullscreen com headline 'Every number that matters. Ideal for saas analytics, dashboards de métricas, plataformas de dados, ferramentas de integração. AI-ready template."
colors:
  primary: "#14532D"
  secondary: "#16A34A"
  tertiary: "#F7F8F3"
  neutral: "#111827"
  surface: "#E5E7EB"
  accent: "#DCFCE7"
typography:
  h1:
    fontFamily: SF Pro Text
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: SF Pro Text
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: SF Pro Text
    fontSize: 0.75rem
    fontWeight: 500
rounded:
  sm: 14px
  md: 28px
  lg: 42px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Design uma landing page analytics SaaS em scroll contínuo: hero fullscreen com headline 'Every number that matters. Ideal for saas analytics, dashboards de métricas, plataformas de dados, ferramentas de integração. AI-ready template. The analytics landing page has always been a confidence game. You're selling abstraction — the promise that messy, overwhelming data becomes legible the moment it hits your platform. Early SaaS analytics pages leaned on static screenshots, maybe a cropped dashboard floating in a browser mockup. It worked, barely. The real shift came when teams like Mixpanel and Amplitude started treating the hero section as a live proof point — not showing the product, but performing it. Large metrics cascading down the viewport, animated data points connecting in real time, the page itself becoming the dashboard.

Continuous scroll changed the economics of attention here. Instead of cramming every insight above the fold, the best analytics pages now unfold like a narrative — one metric leads to the next, each section building on the last. The hero doesn't need to say everything. It needs to say one number, impossibly large, rendered with enough confidence that you believe the rest. Data visualization in the hero isn't decoration. It's the entire sales pitch compressed into three seconds of scroll.

- Density: 8/10 — Dense
- Variance: 2/10 — Structured
- Motion: 4/10 — Subtle

- **Style:** General
- **Keywords:** analytics SaaS scroll contínuo, hero com ilustração de dados em pontos, métricas grandes, cards funcionais, integrações em grid, tabela de transações, fluxo vertical limpo
- **Era:** 2020s Minimal Analytics Flow
- **Light/Dark:** ✓ Full / ◐ Partial

## Colors

- **Verde escuro** (#14532D) — Dark surface, primary background
- **Verde CTA** (#16A34A) — Primary accent, CTAs and interactive elements
- **Branco quente** (#F7F8F3) — Light surface, card backgrounds
- **Cinza texto** (#111827) — Primary text color
- **Cinza suave** (#E5E7EB) — Secondary text, borders, muted elements
- **Verde claro** (#DCFCE7) — Success states, positive indicators
- **Cinza tabela** (#F3F4F6) — Secondary text, borders, muted elements


## Typography

- **Display / Hero:** SF Pro Text — Weight 700, tight tracking, used for headline impact
- **Accent:** Segoe UI — Used for decorative or emphasis text
- **Body:** SF Pro Text — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** SF Pro Text — 0.875rem, weight 500, slight letter-spacing
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

Background off-white contínuo, ilustração de nuvem de pontos verdes escalável, cards com borda 1px sutil e sombra mínima, CTAs sólidos em verde com texto branco, tabela com linhas alternadas

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 14px. See rounded tokens in front matter for the full scale.


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

- Do Hero fullscreen com headline grande + subheadline + badges + CTA verde + ilustração de pontos verdes escalável
- Do Seção imediata de 3 métricas grandes em linha (números em verde
- Do labels abaixo)
- Do Seção 'Connects with every tool' com grid 4x2 de ícones de integrações em cards com borda arredondada
- Do Seção tabela transações recentes com 5–6 linhas alternadas cinza/branco
- Do CTA final em bloco com headline curta + botão verde
- Do Fundo off-white contínuo sem quebras abruptas
- Do Navegação fixa superior simples (logo + 4 links + CTA)


## Use Case

SaaS Analytics, Dashboards de métricas, Platforms de dados, Tools de integração

<!-- Source: https://designmd.app/library/analytics-metric-flow · designmd.app -->

---

> Referência de terceiros, copiada sem alterações de https://designmd.app/library/analytics-metric-flow — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill `escolher-ds`.
