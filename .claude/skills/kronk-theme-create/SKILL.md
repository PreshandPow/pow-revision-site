---
name: kronk-theme-create
description: Systematic theme creation. Use when building a new theme or major redesign.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: design
---

# Theme Creation (Next.js)

## Mandatory Order - DO NOT SKIP OR REORDER
1. **Design Tokens** - Define CSS custom properties FIRST: colors, typography scale, spacing scale, shadows, radii, breakpoints
2. **Base Layout** - Header, main, footer. Mobile-first, responsive
3. **Typography** - Style h1-h6, body, links, lists, blockquotes, code using ONLY tokens
4. **Components** - Card, Button, Forms, Hero, CTA, Nav. Each uses ONLY design tokens
5. **Page Templates** - Compose pages from components: home, blog list, blog post, page, 404
6. **Dark Mode** - All colors via custom properties; `prefers-color-scheme` + `data-theme` toggle

## NEVER
- Start with page layouts before tokens (Step 1 is mandatory first)
- Hardcode any value - everything through design tokens
- Build desktop-first - mobile-first always
- Skip the token definition step
- Create components that reference raw values instead of tokens

Chain: /kronk-theme-create -> /kronk-theme-guard -> /kronk-code-quality -> /kronk-verify
