---
name: kronk-design-adapt
description: Design extraction and recreation. Use when copying or adapting another website's design.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: design
---

# Design Adaptation (Next.js)

## Mandatory Workflow - DO NOT SKIP
1. **Analyze source** - Read ALL source HTML/CSS/JS completely. Extract exact: color palette, typography (families, sizes, weights, line-heights), layout patterns (grid/flexbox, spacing, breakpoints), animations, external dependencies. Document findings BEFORE writing code.
2. **Choose approach** (ask user if unclear): Full copy | Adapt to existing theme tokens | Inspiration only
3. **Implement** - Per-component recreation. Verify each against source.
4. **Verify** - Side-by-side comparison at 320px, 768px, 1024px, 1440px

## FORBIDDEN
- Creating "simplified" or "cleaner" versions when full copy requested
- Swapping fonts for "similar" alternatives
- Changing colors even slightly
- Removing animations as "unnecessary"
- Using generic starter templates
- Making "improvements" to the source design

Chain: /kronk-design-adapt -> /kronk-theme-guard -> /kronk-code-quality -> /kronk-verify
