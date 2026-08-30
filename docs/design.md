---
name: CODEHALAAM
description: Gamified code hosting platform with GitHub Primer + Apple fluid motion
colors:
  canvas-default: "#0d1117"
  canvas-subtle: "#161b22"
  canvas-inset: "#010409"
  border-default: "#30363d"
  border-muted: "#21262d"
  fg-default: "#e6edf3"
  fg-muted: "#8b949e"
  fg-subtle: "#6e7681"
  accent-fg: "#58a6ff"
  accent-emphasis: "#1f6feb"
  success-fg: "#3fb950"
  success-emphasis: "#238636"
  danger-fg: "#f85149"
  danger-emphasis: "#da3633"
  attention-fg: "#d29922"
  done-fg: "#a371f7"
  text-primary: "#e6edf3"
  text-secondary: "#8b949e"
  text-tertiary: "#6e7681"
  interactive-default: "#21262d"
  interactive-hover: "#30363d"
  badge-verified: "#58a6ff"
  badge-admin: "#f85149"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "same"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "same"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "same"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "6px"
  lg: "12px"
  xl: "16px"
  full: "2em"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.success-emphasis}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "5px 16px"
  button-default:
    backgroundColor: "{colors.interactive-default}"
    textColor: "{colors.fg-default}"
    rounded: "{rounded.sm}"
    padding: "5px 16px"
  button-default-hover:
    backgroundColor: "{colors.interactive-hover}"
    textColor: "{colors.fg-default}"
  card:
    backgroundColor: "{colors.canvas-default}"
    textColor: "{colors.fg-default}"
    rounded: "{rounded.sm}"
    padding: "16px"
---

# Design System: CODEHALAAM

## Overview

**Creative North Star: "The Developer's Forge"**

CODEHALAAM's visual identity merges GitHub's battle-tested Primer design system with Apple's fluid interface philosophy. The result is a dark-first, high-contrast environment where every interaction feels precise and responsive. Content scrolls under translucent chrome, buttons compress on press, and depth is conveyed through subtle tonal layering rather than heavy shadows.

The palette is restrained: a deep canvas (`#0d1117`) anchors the space, with a single blue accent (`#58a6ff`) for links and interactive elements. Semantic colors — green for success, red for danger, purple for completed states — appear sparingly. The system earns its identity through motion and material treatment, not through color saturation.

**Key Characteristics:**
- Dark-first with full light theme support
- Apple fluid motion (Framer Motion springs, not CSS transitions)
- Translucent material toolbar with backdrop blur
- High-contrast text on dark backgrounds (WCAG AA compliant)
- GitHub Primer component vocabulary (Buttons, Labels, Boxes, UnderlineNav)

## Colors

The palette is GitHub's Primer dark theme, extended with adaptive contrast tokens for WCAG compliance. Every text color meets 4.5:1 contrast against its background.

### Primary
- **Accent Blue** (`#58a6ff`): Links, interactive elements, focus rings, active tab indicators. Used sparingly — it is the single accent in the system.
- **Accent Emphasis** (`#1f6feb`): Hover state for accent elements, button focus rings.

### Semantic
- **Success Green** (`#3fb950`): Positive states, XP bars, open quest indicators, green labels.
- **Danger Red** (`#f85149`): Errors, destructive actions, admin badges, red labels.
- **Attention Amber** (`#d29922`): Warnings, bounty XP indicators, yellow labels.
- **Done Purple** (`#a371f7`): Merged PRs, completed states, purple labels.

### Neutral
- **Canvas Default** (`#0d1117`): Main background, card surfaces.
- **Canvas Subtle** (`#161b22`): Secondary backgrounds, header, hover states.
- **Border Default** (`#30363d`): Standard borders, dividers, card edges.
- **Border Muted** (`#21262d`): Subtle borders, faint dividers.

### Adaptive Contrast Tokens
- **Text Primary** (`#e6edf3`): Body text, headings, primary content. Contrast: 13.5:1 on canvas.
- **Text Secondary** (`#8b949e`): Muted text, timestamps, secondary labels. Contrast: 4.6:1 on canvas.
- **Text Tertiary** (`#6e7681`): Placeholder text, disabled states. Contrast: 3.1:1 on canvas (large text only).
- **Interactive Default** (`#21262d`): Button backgrounds, input backgrounds.
- **Interactive Hover** (`#30363d`): Button hover, row hover, active states.

### Named Rules
**The Contrast Floor Rule.** Body text must meet WCAG AA (4.5:1). Large text must meet 3:1. No exception for aesthetic preference. If a color pairing fails the ratio, the color changes — not the standard.

**The Accent Rarity Rule.** The primary accent (`#58a6ff`) appears on ≤15% of any given screen. Its rarity is what makes it meaningful. Links, focus rings, and active indicators — not backgrounds, not decorative elements.

## Typography

**System Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`

**Character:** Clean, professional, familiar. The system stack ensures native rendering on every platform. No decorative display faces — the hierarchy is built from weight and size alone.

### Hierarchy
- **Display** (600 weight, `clamp(2rem, 5vw, 3rem)`, line-height 1.1, tracking -0.02em): Page titles, hero headings. Tight tracking prevents large text from feeling loose.
- **Headline** (600 weight, 1.5rem, line-height 1.2, tracking -0.015em): Section headings, card titles.
- **Title** (600 weight, 1.25rem, line-height 1.25, tracking -0.01em): Subsection headings.
- **Body** (400 weight, 1rem, line-height 1.5): Default text, descriptions, content.
- **Label** (500 weight, 0.875rem, tracking +0.01em): Buttons, tabs, form labels, navigation. Slightly positive tracking improves legibility at small sizes.

### Named Rules
**The Optical Sizing Rule.** Tracking is size-specific: tightened for display text (-0.02em), relaxed for small text (+0.01em). Never apply a single tracking value across all sizes.

## Layout

The layout follows GitHub's Primer grid: a max-width container (`1280px`) with responsive padding (16px mobile, 32px desktop). Content is organized in a two-column layout on desktop (sidebar + main) that collapses to single-column on mobile.

The sticky toolbar (`48px`) uses translucent material treatment with `backdrop-filter: blur(24px) saturate(180%)`. Content scrolls under it. `scroll-padding-top: 50px` accounts for the fixed header.

### Responsive Breakpoints
- **sm** (640px): Mobile landscape
- **md** (768px): Tablet, single-column layout
- **lg** (1024px): Desktop, two-column layout
- **xl** (1280px): Large desktop

## Elevation & Depth

CODEHALAAM uses **tonal layering** rather than heavy shadows. Depth is conveyed through background color progression: canvas inset (`#010409`) → canvas default (`#0d1117`) → canvas subtle (`#161b22`). Shadows are minimal and structural, not decorative.

### Shadow Vocabulary
- **None at rest**: Cards and surfaces are flat by default.
- **Subtle lift** (`0 1px 0 rgba(31,35,40,0.04)`): Card edges, subtle separation.
- **Medium elevation** (`0 3px 6px rgba(140,149,159,0.15)`): Dropdown menus, popovers.
- **Large elevation** (`0 8px 24px rgba(140,149,159,0.2)`): Modals, overlays.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus). A card that shadows at rest is a card that has nowhere to go.

## Shapes

Corner radii follow a tight scale: `6px` for buttons, inputs, cards, and labels; `12px` for larger containers; `16px` for modals and overlays. The `2em` radius is reserved for pill-shaped counters and badges. No sharp corners anywhere — the minimum radius is `6px`.

## Components

### Buttons
- **Shape:** 6px radius, 5px 16px padding (default), 3px 12px (small)
- **Primary:** Green background (`#238636`), white text, green border. Used for positive actions (create, save, submit).
- **Default:** Dark background (`#21262d`), light text (`#c9d1d9`), subtle border. Used for secondary actions.
- **Outline:** Transparent background, blue text, gray border. Used for tertiary actions.
- **Danger:** Red background (`#da3633`), white text. Used for destructive actions.
- **Active feedback:** `scale(0.97)` on press (Apple Principle 1: Response).
- **Focus:** 2px blue outline with -2px offset.

### Labels (Chips)
- **Style:** Pill-shaped (`2em` radius), 12px font, 500 weight, 1px border.
- **Variants:** Green (success), Blue (info), Purple (done), Yellow (warning), Red (danger), Muted (neutral).
- **Border:** 40% opacity version of the label color.

### Cards (Box)
- **Corner Style:** 6px radius
- **Background:** Canvas default
- **Border:** 1px solid border-default
- **Shadow:** None at rest; subtle lift on hover
- **Internal Padding:** 16px

### Navigation (UnderlineNav)
- **Style:** Horizontal tab bar with 2px bottom border
- **Default:** Full-opacity text, transparent border
- **Hover:** Full-opacity text, muted border
- **Active:** Full-opacity text, 600 weight, accent blue border
- **Background:** Solid canvas default (no transparency — prevents cover gradient bleed)

### Form Controls
- **Style:** 6px radius, 1px border, canvas default background
- **Focus:** Blue border + 3px blue muted glow
- **Placeholder:** Text tertiary color

## Do's and Don'ts

### Do:
- **Do** use `var(--color-text-primary)` for all body text — never hardcode hex values in components.
- **Do** use `scale(0.97)` on button press for instant tactile feedback.
- **Do** use translucent material treatment only on the toolbar — nowhere else.
- **Do** use the `UnderlineNav` component for tab navigation — never invent custom tab styles.
- **Do** ensure every text color meets WCAG AA contrast (4.5:1 for body, 3:1 for large text).

### Don't:
- **Don't** use gradient text — emphasis comes from weight or size.
- **Don't** use heavy drop shadows on cards — tonal layering is the depth system.
- **Don't** place text over cover images without a solid background — the gradient bleed kills readability.
- **Don't** use `var(--color-fg-subtle)` for body text — it fails contrast on dark backgrounds.
- **Don't** add decorative borders above 1px on cards, list items, or alerts.
