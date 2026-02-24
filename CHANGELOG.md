# Changelog

All notable changes to Beijer.ink will be documented in this file.

This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`
- **MAJOR** — Breaking changes (API, database schema)
- **MINOR** — New features, non-breaking enhancements
- **PATCH** — Bug fixes, small improvements

Current Version: **0.4.0**

---

## [0.4.0] — 2026-02-24

### Added
- Drag-and-drop notebooks into other notebooks to create nested folder hierarchies
- Drag notebooks to root drop zone to un-nest them back to top level
- Drag notes from the note list onto sidebar notebooks to move between notebooks
- Full keyboard navigation for notebook tree (Arrow keys to move, Left/Right to collapse/expand, Home/End to jump, Enter to select)
- Full keyboard navigation for note list (Arrow keys to move, Home/End to jump, Enter to select)
- Touch drag support for Android (press-and-hold 200ms to start dragging)
- Drag overlay preview showing notebook/note name while dragging
- Circular reparenting prevention (can't drop a notebook into its own descendant)

### Fixed
- Auto-save stale closure: editor body edits no longer overwrite the title back to its initial value
- Content now reliably persists when switching between notes (pending saves are flushed on note switch)
- `setContent` during note loading no longer triggers spurious auto-saves to the wrong note
- Title changes in the editor now update the note list instantly (optimistic cache update)
- Title-only changes are no longer silently dropped by the debounce dedup logic
- New note creation appears instantly via optimistic update (no page refresh needed)
- Stuck browser focus ring no longer appears on notebooks and notes after clicking

### Changed
- Sidebar notebook tree refactored from recursive rendering to flat list for dnd-kit hook compatibility
- Keyboard arrow navigation immediately selects the focused item (no separate focus vs selection)

---

## [0.3.0] — 2026-02-24

### Added
- Scratchpad: instant-access plain textarea shown on app load when no note is selected
- Auto-saves scratchpad content with 1-second debounce, persisted in PostgreSQL
- New API endpoints: `GET /api/scratchpad` and `PUT /api/scratchpad`
- Mobile bottom nav shows "Scratchpad" tab label when no note is open

### Changed
- Mobile default view now opens to scratchpad instead of notebook sidebar
- Editor tab in mobile nav is always enabled (shows scratchpad or note editor)

---

## [0.2.1] — 2026-02-24

### Changed
- Consolidated Railway deployment: app and PostgreSQL database now in a single project
- Database connection uses Railway private networking for lower latency and zero egress costs

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
