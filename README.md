## Neural Vault

Neural Vault is a Next.js app that combines an AI chat interface with a file-backed Markdown notes system.

- **AI chat**: Chat with an LLM via the `/api/chat` route and the `ChatPanel` UI.
- **Notes vault**: Create, view, edit, and delete Markdown/MDX notes stored under the `content/notes` directory.
- **Rich note display**: Notes support frontmatter metadata (title, tags, timestamps) and are rendered as HTML with basic Markdown formatting.
- **File-based storage**: Notes are backed by the filesystem via the utilities in `src/lib/notes.ts`.

The app’s home page loads your notes and redirects to the first available note. Individual note pages support editing and deletion, and there are dedicated routes for creating and editing notes.

## Features

- **Notes**
  - Browse and read notes from `content/notes` (supports nested folders).
  - Create new notes with title, slug, content, and optional tags.
  - Update and delete existing notes via UI and corresponding API routes.
  - Store metadata (frontmatter) such as `title`, `slug`, `tags`, `createdAt`, and `updatedAt`.
- **Chat**
  - Chat UI component for interacting with an AI model.
  - Server-side chat route (`src/app/api/chat/route.ts`) for handling chat requests.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (via `globals.css`)
- **Markdown + frontmatter**: `gray-matter` + custom renderer (`src/lib/simpleMarkdown.ts`)

## Project Structure (high level)

- `src/app/page.tsx`: Loads notes and redirects to the first note.
- `src/app/notes/[...slug]/page.tsx`: Displays an individual note with actions to edit/delete.
- `src/app/notes/new/page.tsx`: New note creation page.
- `src/app/notes/edit/[...slug]/page.tsx`: Edit note page.
- `src/app/api/notes/`: REST-style API routes for CRUD operations on notes.
- `src/app/api/chat/route.ts`: API route for AI chat.
- `src/app/components/ChatPanel.tsx`: Main chat UI component.
- `src/app/components/Sidebar.tsx` / `SidebarClient.tsx`: Navigation/sidebar components for notes.
- `src/lib/notes.ts`: File-based notes utilities (get, list, create, update, delete).
- `src/lib/simpleMarkdown.ts`: Simple Markdown-to-HTML renderer for note content.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes Storage

Notes live under the `content/notes` directory and are stored as `.mdx` or `.md` files with frontmatter. Example:

```md
---
title: "My first note"
slug: "my-first-note"
tags:
  - example
  - demo
createdAt: "2025-01-01T00:00:00.000Z"
updatedAt: "2025-01-01T00:00:00.000Z"
---

This is the **content** of the note.
```

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the production bundle.
- `npm run start`: Start the production server.
- `npm run lint`: Run lint checks.
