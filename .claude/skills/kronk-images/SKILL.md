---
name: kronk-images
description: Image optimization and responsive handling. Use when adding or modifying any images.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: quality
---

# Image Handling (Next.js)

## Required Attributes - ALL Images
- `width` + `height` - ALWAYS (prevents CLS)
- `alt` - ALWAYS (descriptive, contextual, max 125 chars; decorative: `alt=""`)
- `loading="lazy"` - below-fold; `loading="eager"` - above-fold hero/banner

## Size Limits
| Type | Max |
|------|-----|
| Hero | 200KB |
| Content | 100KB |
| Thumbnail | 50KB |

## Format & Responsive
- WebP/AVIF for delivery, JPEG/PNG fallback via `<picture>`
- Provide `srcset` + `sizes`: minimum 3 widths (400w, 800w, 1200w)

## Next.js-Specific
- Use `next/image` with required `width` and `height` props
- Configure `images.domains` for external images

## AI-Generated Images
- Match site's visual style and color palette from design tokens
- Specify dimensions, aspect ratio, format in prompt

## NEVER
- Images without alt text
- Unoptimized images (>500KB)
- Same image file at all viewports
- Omit width/height (causes CLS)
- Generic filenames (image1.jpg)

Chain: /kronk-images -> /kronk-seo -> /kronk-code-quality -> /kronk-verify
