# CODEHALAAM Design System

## Philosophy

CODEHALAAM follows GitHub's Primer design system principles:
- **Constraint-based**: Every design decision serves a purpose
- **Accessible**: WCAG 2.1 AA compliant by default
- **Consistent**: Unified patterns across all interfaces
- **Performant**: Minimal CSS, optimized rendering

## Color Palette

### Dark Theme (Default)
```css
--color-canvas-default: #0d1117    /* Main background */
--color-canvas-subtle: #161b22     /* Secondary background */
--color-canvas-inset: #010409      /* Deep inset */
--color-border-default: #30363d    /* Standard borders */
--color-border-muted: #21262d      /* Subtle borders */
--color-fg-default: #e6edf3        /* Primary text */
--color-fg-muted: #8b949e          /* Secondary text */
--color-fg-subtle: #6e7681         /* Tertiary text */
--color-accent-fg: #58a6ff         /* Links, interactive */
--color-success-fg: #3fb950        /* Positive states */
--color-danger-fg: #f85149         /* Errors, destructive */
--color-attention-fg: #d29922      /* Warnings */
--color-done-fg: #a371f7           /* Merged, completed */
```

### Light Theme
```css
--color-canvas-default: #ffffff
--color-canvas-subtle: #f6f8fa
--color-border-default: #d0d7de
--color-fg-default: #1f2328
--color-accent-fg: #0969da
```

## Typography

### Font Stack
```css
--fontStack-system: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif
--fontStack-monospace: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace
```

### Scale
| Size | Value | Use Case |
|------|-------|----------|
| xs | 0.75rem | Labels, captions |
| sm | 0.875rem | Body text, form inputs |
| base | 1rem | Default body |
| lg | 1.125rem | Subheadings |
| xl | 1.25rem | Section titles |
| 2xl | 1.5rem | Page titles |
| 3xl | 2rem | Hero headings |

## Spacing

Base unit: 4px

| Token | Value | Use Case |
|-------|-------|----------|
| 0 | 0 | Reset |
| 1 | 4px | Tight spacing |
| 2 | 8px | Default gap |
| 3 | 12px | Card padding |
| 4 | 16px | Standard padding |
| 5 | 20px | Section spacing |
| 6 | 24px | Large gaps |
| 8 | 32px | Page margins |

## Components

### Buttons
```tsx
<button className="btn-primary">Primary Action</button>
<button className="btn-default">Secondary</button>
<button className="btn-outline">Outline</button>
<button className="btn-link">Link Style</button>
<button className="btn-danger">Destructive</button>
```

### Forms
```tsx
<input className="form-control" />
<textarea className="form-control resize-none" />
<select className="form-control">...</select>
```

### Cards
```tsx
<div className="border border-border rounded-md">
  <div className="px-4 py-3 border-b border-border">Header</div>
  <div className="p-4">Content</div>
</div>
```

### Labels
```tsx
<span className="Label Label-green">Success</span>
<span className="Label Label-blue">Info</span>
<span className="Label Label-purple">Done</span>
<span className="Label Label-yellow">Warning</span>
<span className="Label Label-red">Error</span>
```

## Icons

We use Lucide React for icons:
```tsx
import { Star, GitBranch, Plus } from 'lucide-react'

<Star className="w-4 h-4" />
<GitBranch className="w-4 h-4 text-success" />
<Plus className="w-4 h-4" />
```

## Animations

Minimal, purposeful animations using Framer Motion:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

## Responsive Breakpoints

| Name | Width | Use Case |
|------|-------|----------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

## Accessibility

- All interactive elements have visible focus states
- Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- Keyboard navigation for all components
- Screen reader labels for icons
- Reduced motion support via `prefers-reduced-motion`
