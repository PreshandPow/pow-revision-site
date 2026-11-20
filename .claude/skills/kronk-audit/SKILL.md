---
name: kronk-audit
description: Quality audit for SSG content. Use when reviewing content quality or before releases.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: cms
---

# Quality Audit

Audit all content in `src/app/` against these skills:
- **SEO** (/kronk-seo): meta tags, headings, structured data, alt text
- **Code** (/kronk-code-quality): semantic HTML, CSS quality, JS performance
- **Theme** (/kronk-theme-guard): design tokens, consistent layouts

Report issues by severity: Critical > Warning > Info.
Provide specific fix for each issue.

$ARGUMENTS
