---
name: Lendly
description: Online costume rental platform for discovery, booking, payment, chat, and rental management.
colors:
  shop-page-bg-top: "#f8f4ff"
  shop-page-bg-mid: "#fbf8ff"
  shop-page-bg-bottom: "#f5efff"
  shop-ink: "#2f2440"
  shop-heading: "#3f2563"
  shop-title: "#44276b"
  shop-muted: "#6d5a8b"
  shop-soft-muted: "#7d6a99"
  shop-label: "#40304f"
  shop-purple: "#7a52ae"
  shop-focus: "#8a60c6"
  shop-border: "#ded1f4"
  shop-chip-bg: "#fff5fb"
  primary-purple: "#7d4dff"
  primary-indigo: "#4f57b8"
  admin-indigo: "#5a67d8"
  admin-purple: "#6b46c1"
  admin-purple-deep: "#553c9a"
  primary-indigo-deep: "#3b467d"
  lavender-surface: "#ede3f3"
  soft-lavender: "#ddd6fe"
  pale-lilac: "#f3e8ff"
  admin-success: "#48bb78"
  admin-success-deep: "#38a169"
  admin-danger: "#e53e3e"
  admin-danger-deep: "#c53030"
  border-light: "#dddddd"
  border-cool: "#cbd5e0"
  admin-border: "#e2e8f0"
  ink: "#222222"
  admin-ink: "#2d3748"
  admin-muted: "#4a5568"
  admin-empty: "#718096"
  text-muted: "#465b52"
  product-ink: "#1d2433"
  field-text: "#1e2437"
  field-muted: "#8590a8"
  surface: "#ffffff"
  admin-surface: "#f9f9ff"
  admin-row-alt: "#f8fafc"
  admin-row-hover: "#edf2f7"
  page-neutral: "#f4f4f4"
  error: "#c23d43"
typography:
  display:
    fontFamily: "Noto Serif Thai, Noto Serif, Spartan, IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Noto Serif Thai, Noto Serif, Spartan, IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Prompt, IBM Plex Sans Thai, Spartan, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  xs: "6px"
  sm-admin: "8px"
  sm: "10px"
  md: "12px"
  form: "14px"
  lg: "18px"
  form-lg: "20px"
  soft-panel: "22px"
  section: "24px"
  xl: "30px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary-indigo}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    height: "56px"
    padding: "0 24px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.field-text}"
    rounded: "{rounded.lg}"
    height: "58px"
    padding: "14px 48px"
  shop-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.shop-ink}"
    rounded: "{rounded.form}"
    padding: "13px 16px"
  admin-button:
    backgroundColor: "{colors.admin-purple}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm-admin}"
    padding: "8px 18px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
---

# Design System: Lendly

## 1. Overview

**Creative North Star: "The Rental Dressing Room"**

Lendly should feel like a calm, well-lit fitting room attached to a practical rental desk: stylish at the moment of discovery, clear and procedural at the moment of booking, payment, chat, and return management. The current visual identity leans soft lavender and indigo, with rounded forms, approachable spacing, and friendly Thai-first interface language.

The system should preserve that softness while tightening consistency. Customer pages can carry more atmosphere through product imagery and gentle lavender surfaces; forms, admin views, and rental management screens should favor high readability, predictable controls, and strong state clarity.

**Key Characteristics:**
- Soft purple/indigo identity anchored by neutral white surfaces and dark readable text.
- Rounded controls with clear focus rings and compact product-friendly density.
- One shared vocabulary for navigation, cards, inputs, buttons, validation, and status.
- Motion is allowed when it communicates affordance or atmosphere, with reduced-motion fallbacks.

## 2. Colors

The palette is a restrained lavender marketplace palette: purple signals brand and action; white and pale neutrals carry most task surfaces.

### Primary
- **Action Purple** (`#7d4dff`): Used for active navigation, links, selection, and customer-facing accents.
- **Operational Indigo** (`#4f57b8`): Used for primary form actions, focus treatments, and authenticated workflow emphasis.
- **Deep Indigo** (`#3b467d`): Used where the primary action needs more authority, especially registration and account flows.

### Secondary
- **Lavender Surface** (`#ede3f3`): Used for the main header and soft structural areas.
- **Pale Lilac** (`#f3e8ff`) and **Soft Lavender** (`#ddd6fe`): Used for atmospheric backgrounds and hero treatments.

### Neutral
- **Ink** (`#222222`): Main headings, navigation, and high-emphasis copy.
- **Product Ink** (`#1d2433`): Body text on newer product/account surfaces.
- **Muted Text** (`#465b52`, `#8590a8`): Secondary copy and placeholders; verify contrast before use on tinted backgrounds.
- **Surface** (`#ffffff`): Cards, forms, modals, content panels.
- **Page Neutral** (`#f4f4f4`): Simple auth/page background.
- **Error Red** (`#c23d43`): Form errors and destructive/error states.

### Named Rules

**The Purple Earns Attention Rule.** Purple and indigo should identify active state, primary action, or brand atmosphere; avoid scattering them as decoration across every card.

**The Pastel Contrast Rule.** Any muted text on lavender, cream, or translucent surfaces must be checked for contrast; if uncertain, darken toward Product Ink.

## 3. Typography

**Display Font:** Noto Serif Thai / Noto Serif / Spartan / IBM Plex Sans Thai / system-ui fallback  
**Body Font:** IBM Plex Sans Thai / Spartan / system-ui fallback  
**Label Font:** IBM Plex Sans Thai / system-ui fallback

**Character:** The type should feel friendly and functional. Customer discovery pages can use larger confident headings; product and admin UI should keep a compact, familiar sans hierarchy.

### Hierarchy
- **Display** (700, 40px, 1.2): Short customer-facing hero or page identity moments.
- **Headline** (700, 28px, 1.25): Section titles, page headings, form headings.
- **Title** (600, 1rem, 1.4): Navigation, cards, labels with clear emphasis.
- **Body** (400, 16px, 1.7): Explanatory copy, form help, product descriptions; cap long prose around 65–75ch.
- **Label** (700, 0.82rem, 0.08em): Use sparingly for badges or compact metadata, not as an eyebrow on every section.

### Named Rules

**The Interface First Rule.** Product pages, admin pages, and forms should prioritize legibility over display styling; avoid decorative fonts for labels, buttons, tables, or rental status.

## 4. Elevation

Lendly uses a hybrid of tonal layering and soft shadows. Shadows should separate key surfaces such as auth cards, dropdowns, and hoverable product containers, but most product UI should remain calm and stable at rest.

### Shadow Vocabulary
- **Header Ambient** (`0 5px 15px rgba(0, 0, 0, 0.06)`): Sticky navigation separation.
- **Card Soft** (`0 4px 12px rgba(0, 0, 0, .08)`): Simple card/form wrapper elevation.
- **Account Surface** (`0 24px 60px rgba(37, 45, 76, 0.12)`): Large account or onboarding panels.
- **Primary Button Lift** (`0 16px 28px rgba(79, 87, 184, 0.24)`): Use only for high-value primary actions, not every button.

### Named Rules

**The No Ghost-Card Rule.** Avoid pairing a 1px border with a very large soft shadow on ordinary cards; choose either a subtle border or purposeful elevation.

## 5. Components

### Buttons
- **Shape:** Rounded, usually 10–18px. Avoid 30px+ radii except full pills or very large account panels.
- **Primary:** Indigo or purple fill with white text, 45–56px height depending on density.
- **Hover / Focus:** Slightly darker background, visible focus ring, and fast 150–200ms transition.
- **Disabled:** Muted neutral fill with non-interactive cursor; do not rely on opacity alone.

### Cards / Containers
- **Corner Style:** 12px for compact cards, 18px for form groups, 24–30px only for large account/onboarding compositions.
- **Background:** White or near-white on customer/product surfaces; tinted lavender or deep indigo reserved for expressive panels.
- **Shadow Strategy:** Soft separation for forms and major surfaces; product grids should not become nested card stacks.
- **Internal Padding:** 16–24px for ordinary cards, 30–40px for account/auth panels.

### Inputs / Fields
- **Style:** Rounded rectangular fields with 1–2px border, left icon space where used, and clear placeholder contrast.
- **Focus:** Indigo/purple border plus a translucent focus ring.
- **Error / Disabled:** Red border/text for errors; disabled fields should show reduced affordance while keeping readable content.

### Navigation
- **Header:** Sticky top navigation with lavender surface, logo, search, primary links, favorites/cart/user actions.
- **Active State:** Purple text and underline. Keep active indication consistent and avoid marking multiple unrelated nav items active.
- **Dropdowns:** Ensure menus are not clipped by parent overflow and remain keyboard accessible.

### Product Cards
- **Role:** Fast scanning of costume image, name, price/status, and action. Imagery should carry the product emotion; controls should stay consistent.
- **State:** Include hover, favorite, unavailable, loading, and empty states.

### Admin Surfaces
- **Role:** Dense operational work: rentals, customers, return, tracking, chat. Use product UI restraint: readable tables, clear status badges, predictable actions.
- **State:** Every destructive or irreversible action needs explicit confirmation and clear success/error feedback.

## 6. Do's and Don'ts

**Do**
- Keep customer discovery warm and visual while keeping rental actions explicit.
- Reuse button, input, card, status, and nav patterns across all pages.
- Use skeletons or inline loading states for content-heavy pages.
- Write helpful empty states such as “ยังไม่มีสินค้าในระบบ” with next actions where possible.
- Test responsive nav, product grids, forms, and admin tables at mobile widths.

**Don't**
- Do not use low-contrast gray text on pale lavender surfaces.
- Do not add decorative gradients or motion where a task state would be clearer.
- Do not create new button shapes or input styles for each page.
- Do not use modal dialogs as the first solution when inline editing or progressive disclosure works.
- Do not let long Thai labels or product names overflow cards, buttons, or mobile layouts.
