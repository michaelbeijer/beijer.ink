# Beijer.ink

A personal note-taking web app with rich WYSIWYG editing, full-text search, and a clean responsive UI. Built as a single-user app, accessible as a PWA on mobile.

<img width="1424" height="1113" alt="image" src="https://github.com/user-attachments/assets/f3d0ce56-4111-455b-9a12-3840455f45bd" />


## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TipTap, Tailwind CSS 4, React Query |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Search | PostgreSQL full-text search (tsvector + GIN index) |
| Image Storage | Cloudflare R2 (S3-compatible) |
| Auth | Single password with bcrypt + JWT |
| Deployment | Docker on Railway |

## Features

- **Rich text editor** — TipTap-based with bold, italic, underline, headings, links, colors, highlights, code blocks, task lists, and typography corrections
- **Tables** — Full table support with add/remove rows and columns, header rows, and merge cells
- **Image support** — Paste or upload images with drag-to-resize handles
- **Global search** — Weighted PostgreSQL FTS across all notes (title boosted over content), with highlighted result snippets
- **In-document search** — Ctrl+F find-and-replace within the current note
- **Notebooks** — Organize notes in a tree of notebooks with drag-and-drop
- **Tags** — Color-coded tags with autocomplete picker
- **Scratchpad** — Instant-access textarea on app load for quick jotting; auto-saved and always available
- **Auto-save** — 1-second debounce, saves in the background
- **Responsive layout** — 3-column desktop, 2-column tablet, single-column mobile with bottom navigation
- **Light/Dark mode** — Toggle between light and dark themes, preference saved across sessions
- **PWA** — Installable on Android via "Add to Home Screen"

## Project Structure

```
beijer.ink/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── api/          # Axios API wrappers
│   │   ├── components/   # UI components (layout, editor, notes, search, tags, auth)
│   │   ├── hooks/        # React hooks (useAuth, useNotes, useAutoSave, useSearch)
│   │   └── types/        # TypeScript type definitions
│   └── public/           # PWA manifest, icons, service worker
├── server/               # Express API backend
│   ├── src/
│   │   ├── routes/       # Express route definitions
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic + database queries
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── validators/   # Zod schemas
│   │   └── lib/          # Prisma client, R2 client, utilities
│   └── prisma/           # Schema + migrations
├── scripts/              # Seed password script
└── Dockerfile            # Multi-stage production build
```

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database (local or hosted)

### Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/michaelbeijer/beijer.ink.git
   cd beijer.ink
   npm install
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your `DATABASE_URL`, `JWT_SECRET` (64-char hex string), and `ADMIN_PASSWORD`.

3. Copy `.env` to the server directory (Prisma requires it there):
   ```bash
   cp .env server/.env
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the admin password:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   The client runs on `http://localhost:5173` and the API on `http://localhost:3000`.

### Production Build

Build and start in production mode:
```bash
npm run build
npm start
```

Or use Docker:
```bash
docker build -f server/Dockerfile -t beijer-ink .
docker run -p 3000:3000 --env-file .env beijer-ink
```

## API Endpoints

All endpoints under `/api`, JWT-protected except login.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Authenticate with password |
| `GET` | `/api/auth/verify` | Verify JWT token |
| `GET` | `/api/notebooks` | List all notebooks |
| `POST` | `/api/notebooks` | Create notebook |
| `PATCH` | `/api/notebooks/:id` | Update notebook |
| `DELETE` | `/api/notebooks/:id` | Delete notebook |
| `GET` | `/api/notes/notebook/:notebookId` | List notes in notebook |
| `GET` | `/api/notes/:id` | Get single note |
| `POST` | `/api/notes` | Create note |
| `PATCH` | `/api/notes/:id` | Update note (auto-save) |
| `DELETE` | `/api/notes/:id` | Delete note |
| `PATCH` | `/api/notes/:id/move` | Move note to another notebook |
| `PUT` | `/api/notes/:id/tags` | Set tags on a note |
| `GET` | `/api/tags` | List all tags |
| `POST` | `/api/tags` | Create tag |
| `PATCH` | `/api/tags/:id` | Update tag |
| `DELETE` | `/api/tags/:id` | Delete tag |
| `GET` | `/api/scratchpad` | Get scratchpad content |
| `PUT` | `/api/scratchpad` | Update scratchpad content |
| `GET` | `/api/search?q=...` | Full-text search with highlighted snippets |
| `POST` | `/api/images/upload` | Upload image to R2 |
| `DELETE` | `/api/images/:id` | Delete image |

## Deployment (Railway)

1. Create a new Railway project with a PostgreSQL add-on
2. Add a web service pointing to this repo
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, `NODE_ENV=production`
4. Railway will build using the Dockerfile and run migrations on startup
5. Configure your custom domain in Railway settings

## License

This project is for personal use. All rights reserved.
