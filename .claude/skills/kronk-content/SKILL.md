---
name: kronk-content
description: Create SSG content with guardrails. Use when creating blog posts, pages, or any content files.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: cms
---

# Create Content

Framework: **Next.js** | Content dir: `src/app/`

## Workflow
1. Run /kronk-writing-style to match existing voice
2. Create content with proper front matter
3. Run /kronk-seo to verify
4. Run /kronk-verify to validate build

## Front Matter
```yaml
---
title: "30-60 chars"
date: 2026-11-19
description: "120-160 chars for SEO"
draft: false
---
```

## Checklist
- [ ] Title 30-60 chars, description 120-160 chars
- [ ] Single h1, sequential h2-h6
- [ ] All images have alt text
- [ ] Links have descriptive text
- [ ] Writing style matches existing content

Chain: /kronk-writing-style -> /kronk-seo -> /kronk-verify

$ARGUMENTS
