---
name: kronk
description: Kronk CMS orchestrator for Next.js projects. Project context, skill reference, and quality chains. Hooks auto-apply skills on Write/Edit.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: cms
---

# Kronk CMS — Next.js

| Property | Value |
|----------|-------|
| Config | `next.config.mjs` |
| Content | `src/app/` |
| Output | `.next/` |

## Guardrails
- SEO: meta tags, headings, structured data
- Accessibility: WCAG compliance, alt text, ARIA labels
- Performance: image optimization, lazy loading
- Security: sanitized inputs, secure links

## Skills
**CMS:** /kronk-content, /kronk-audit, /kronk-theme
**Quality:** /kronk-code-quality, /kronk-seo, /kronk-theme-guard, /kronk-theme-create, /kronk-design-adapt, /kronk-writing-style, /kronk-images, /kronk-usability, /kronk-verify

## Chains
- Content: content -> writing-style -> seo -> verify
- Theme: theme-create -> theme-guard -> code-quality -> verify
- Design: design-adapt -> theme-guard -> code-quality -> verify
- Images: images -> seo -> code-quality -> verify

Hooks auto-inject the correct chain on every Write/Edit. Follow the injected skill instructions.
In plan mode, include the chain as explicit steps. NEVER skip /kronk-verify.
