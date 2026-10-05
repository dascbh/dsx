---
version: alpha
name: <Product name>
description: <Product type, audience, density. E.g. "Mobile finance app for sole traders, low density, used on the go.">
owner: <responsible team or person>
updated: <YYYY-MM-DD>
# Colors by ROLE, never by appearance ("primary", not "blue").
# For every background color used with text, declare the "on-<role>" pair: the linter checks the contrast.
colors:
  canvas: "<#hex>"
  surface: "<#hex>"
  text-primary: "<#hex>"
  text-secondary: "<#hex>"
  border: "<#hex>"
  border-strong: "<#hex>"
  focus: "<#hex>"
  primary: "<#hex>"
  on-primary: "<#hex>"
  danger: "<#hex>"
  on-danger: "<#hex>"
typography:
  h1:
    fontFamily: <family>
    fontSize: <px>
    fontWeight: <weight>
    lineHeight: <number>
  body:
    fontFamily: <family>
    fontSize: <px>
    fontWeight: <weight>
    lineHeight: <number>
  label:
    fontFamily: <family>
    fontSize: <px>
    fontWeight: <weight>
    lineHeight: <number>
spacing:
  "1": 4px
  "2": 8px
  "4": 16px
  "6": 24px
  "8": 32px
rounded:
  sm: <px>
  md: <px>
components:
  # Components reference tokens with {group.key}; do not repeat raw values.
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
---

# <Product name>

<!-- Say where the values come from (tokens, code, Figma) and which source wins in a conflict. -->

## Overview

<!-- Visual direction in OBSERVABLE criteria, not adjectives. Replace "modern and clean" with
"at most one accent color per viewport; hierarchy through typography and space; no shadows on cards".
Include: type of use (task vs. showcase), density, personality, what the interface NEVER does. -->

## Colors

<!-- Table: Role | Token | Where it appears | Where it NEVER appears.
Contrast rules (≥ 4.5:1 text, ≥ 3:1 non-text UI), the "color is never the only signal" rule,
dark theme behavior. -->

## Typography

<!-- HIERARCHY rules (h1 is the page's only title…), not just a list of sizes.
Scale and ratio, minimum size, allowed weights, maximum line length. -->

## Layout

<!-- Spacing grid, vertical rhythm (between label/field, fields, groups, sections), containers,
breakpoints, mobile behavior, position of primary actions. -->

## Elevation & Depth

<!-- How layers are communicated (surface, border, shadow) and the stacking limit. -->

## Shapes

<!-- Radii per element type, icon language. -->

## Components

<!-- For each core component: when to use, variants, ALL states
(default, hover, focus, active, disabled, loading, error, empty, success), contraindications. -->

## Do's and Don'ts

<!-- Derive from REAL mistakes seen in earlier generations, not platitudes. At least 3 of each. -->

**Do**

- <rule>

**Don't**

- <rule>

## Accessibility

<!-- WCAG target, focus, touch target, reduced motion, zoom/reflow, alternative text. All verifiable. -->

## Agent Instructions

<!-- WHEN to consult this file, WHAT to preserve, HOW to validate (commands, checklist). -->
