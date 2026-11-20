---
name: kronk-verify
description: Mandatory verification gate. ALWAYS run before claiming any task complete.
metadata:
  author: Kronk CMS
  version: "1.4.0"
  category: verification
---

# Verification Gate (Next.js)

## The Evidence Rule
- **Show build output** THEN claim success - NEVER say "done" without running it
- **Show HTML output** THEN claim validity
- NEVER rely on a previous/cached build - run fresh
- NEVER skip because "it's a small change"

## Mandatory Steps
1. **Build** - Run `npm run build` - must exit zero, check warnings
2. **Content** (if changed) - Front matter valid, spelling checked, run `kronk audit`
3. **Templates** (if changed) - Check at 320px, 768px, 1024px, 1440px
4. **Styles** (if changed) - No regressions, uses design tokens, responsive intact
5. **SEO** (if page changed) - Title 30-60 chars, description 120-160 chars, OG tags present
6. **Images** (if added) - Alt text, srcset/sizes, file sizes within limits
7. **Theme** (if layout changed) - Consistent with other pages, uses tokens

## NEVER
- Claim "it should work" without building
- Trust cached build output
- Mark task complete without evidence

This is the final step. If verification passes, the task is complete.
If it fails, fix issues and run /kronk-verify again.
