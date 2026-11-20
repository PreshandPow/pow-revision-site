---
name: kronk-seo
description: SEO enforcement. Use when creating or editing any page, post, or template.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: quality
---

# SEO Enforcement (Next.js)

## Every Page MUST Have
- Title tag: 30-60 chars, keyword-rich, unique per page
- Meta description: 120-160 chars, compelling, unique per page
- Canonical URL (`<link rel="canonical">`)
- OG tags: `og:title`, `og:description`, `og:image`, `og:type`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- JSON-LD structured data (Article, BreadcrumbList, Organization as appropriate)
- Descriptive alt text on every image (contextual, not "image of...")
- Internal links to related content
- Clean URL slugs: lowercase, hyphens, no special chars
- Heading hierarchy for structure, not styling

## Robots & Sitemap
- `robots.txt` must allow crawling; `sitemap.xml` must include all published pages
- No accidental `noindex` on pages that should be indexed

## NEVER
- Duplicate title/description across pages
- Generic alt text ("image", "photo", "screenshot")
- Skip OG/Twitter tags
- Stuff keywords unnaturally
- Use heading tags for styling

Chain: /kronk-seo -> /kronk-verify
