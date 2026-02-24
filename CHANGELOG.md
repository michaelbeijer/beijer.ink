# Changelog

All notable changes to Beijer.ink will be documented in this file.

This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`
- **MAJOR** — Breaking changes (API, database schema)
- **MINOR** — New features, non-breaking enhancements
- **PATCH** — Bug fixes, small improvements

Current Version: **0.2.0**

---

## [0.2.0] — 2026-02-24

### Added
- Light mode theme with clean white/slate color palette
- Theme toggle button in sidebar footer (Sun/Moon icon) to switch between light and dark mode
- Theme preference persisted to localStorage across sessions
- Tailwind CSS 4 `dark:` variant support via custom selector strategy

### Changed
- All 11 UI components updated with dual light/dark theme classes
- Custom CSS (code blocks, tables, blockquotes, links, scrollbars) now adapts to active theme
- Editor prose styling switches between `prose` (light) and `prose-invert` (dark) automatically
- Default theme remains dark mode for existing users

---

## [0.1.0] — 2026-02-23

Initial release with core note-taking functionality.

### Added
- Single-user authentication with bcrypt password hashing and JWT tokens (30-day expiry)
- Rate-limited login endpoint (5 attempts per minute)
- Notebook CRUD with hierarchical tree structure (parent/child notebooks)
- Note CRUD with rich HTML content storage
- TipTap WYSIWYG editor with 20+ extensions:
  - Text formatting (bold, italic, underline, strikethrough, highlight, colors)
  - Block types (headings, blockquotes, code blocks, horizontal rules)
  - Lists (bullet, ordered, task lists with checkboxes)
  - Tables with row/column management and header support
  - Links, subscript, superscript, text alignment
  - Image insertion with resizable drag handles
  - Typography auto-corrections
  - Character count
- In-document search and replace (Ctrl+F)
- Auto-save with 1-second debounce
- PostgreSQL full-text search with weighted tsvector (title=A, content=B) and GIN index
- Global search with `ts_rank` ordering and `ts_headline` highlighted snippets
- Tag system with colors and many-to-many note associations
- Tag picker with autocomplete and inline tag creation
- Image upload via paste/toolbar with Cloudflare R2 storage
- Responsive 3-column layout (sidebar, note list, editor)
- Mobile-optimized single-column view with bottom tab navigation
- PWA manifest and service worker for Android "Add to Home Screen"
- Docker multi-stage build for Railway deployment
- Prisma ORM with PostgreSQL migrations
- Zod request validation on all mutation endpoints
- Async error handling middleware for Express
- Helmet security headers and CORS configuration
