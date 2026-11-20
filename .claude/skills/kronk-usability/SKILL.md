---
name: kronk-usability
description: Usability audit. Use when checking WCAG compliance, accessibility, or before deploying.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: quality
---

# Usability Audit (Next.js)

## Workflow
1. Run `kronk usability --fix`
2. Prioritize: **Critical** (WCAG A/AA violations) > **Warning** (best practices) > **Info** (tech debt) > **Opportunities**
3. Fix issues (see rules below)
4. Verify: `kronk usability --min-score 70`

## Rules
- Semantic landmarks required: `<header>`, `<nav aria-label="...">`, `<main id="main-content">`, `<footer>`
- Skip-to-content link as first focusable element
- `:focus-visible` indicators on ALL interactive elements - never `outline: none` without replacement
- Every form input needs an accessible `<label>`
- Color contrast: 4.5:1 normal text, 3:1 large text (use design tokens)
- Wrap animations in `@media (prefers-reduced-motion: no-preference)`
- All images need `width`/`height` to prevent CLS

## NEVER
- Remove focus indicators
- Ship with WCAG A/AA violations
- Use color alone to convey information
- Disable zoom/scaling

Chain: /kronk-usability -> /kronk-code-quality -> /kronk-verify
