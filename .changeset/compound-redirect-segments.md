---
'@astrojs/underscore-redirects': patch
---

Fixes `_redirects` rules for routes with compound dynamic segments such as `post-[id]` or `[category]-[slug]`, which previously dropped everything after the first part of the segment
