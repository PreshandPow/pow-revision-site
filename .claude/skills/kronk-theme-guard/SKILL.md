---
name: kronk-theme-guard
description: Theme consistency enforcement. Use before any template, layout, or CSS change.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: design
---

# Theme Consistency Guard (Next.js)

## Rules - NON-NEGOTIABLE
1. All colors MUST come from CSS custom properties - NEVER hardcode hex/rgb
2. Typography MUST use the theme's font stack and size scale
3. Spacing MUST use the theme's spacing scale
4. Components MUST be reusable - no one-off styles for single pages
5. Layouts MUST be consistent: header, footer, nav identical across pages
6. Responsive breakpoints MUST be consistent project-wide

## Before Any Change
1. Read existing CSS custom properties / design tokens
2. Verify the change uses ONLY existing tokens
3. If a new token is needed, add it to the design system - not as a one-off

## NEVER
- Hardcode a color/font/spacing when a token exists
- Create a one-off style for a single page
- Introduce a new font or size outside the type scale

Chain: /kronk-theme-guard -> /kronk-code-quality -> /kronk-verify
