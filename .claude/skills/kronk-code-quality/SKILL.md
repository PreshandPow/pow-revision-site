---
name: kronk-code-quality
description: Code quality enforcement. Use when writing or modifying any HTML, CSS, or JS.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: quality
---

# Code Quality Guard (Next.js)

## Rules
- No `!important` unless refactoring proves impossible (max 2 per file)
- NEVER nest CSS more than 3 levels deep
- CSS custom properties for ALL theming values - no hardcoded colors/spacing
- Mobile-first media queries (`min-width`) only
- Relative units (`rem`/`em`/`%`) for text and spacing, not `px`
- `loading="lazy"` on all below-fold images; `width`/`height` on ALL media (CLS prevention)
- Max 3 external stylesheets; critical CSS inlined above-fold
- No render-blocking scripts - use `defer` or `async`
- No JS frameworks for simple interactions - vanilla JS or CSS

## Accessibility
- Visible `:focus-visible` indicators on all interactive elements
- Skip-to-content link as first focusable element
- Color contrast: 4.5:1 normal text, 3:1 large text
- Full keyboard navigation support
- ARIA only where semantic HTML is insufficient

## NEVER
- Inline styles for layout (only for truly dynamic values)
- JS frameworks for simple interactions
- Ignore console warnings

Chain: /kronk-code-quality -> /kronk-verify
