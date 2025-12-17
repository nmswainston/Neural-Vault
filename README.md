## Neural Vault

Neural Vault is a Next.js app that combines an AI chat interface with a Markdown notes experience designed for small, AI-ready knowledge bases.

- **AI chat**: Chat with an LLM via the `/api/chat` route and the `ChatPanel` UI.
- **Notes vault**: Create, view, edit, and delete notes from the browser.
- **Rich note display**: Notes support frontmatter-style metadata (title, tags, timestamps) and are rendered as HTML with basic Markdown formatting.
- **File-backed APIs**: Server-side routes use `src/lib/notes.ts` to read and write `.mdx` / `.md` files under `content/notes`.

The home page loads your notes (via the file-backed API) and redirects to the first available entry. The client-facing UI uses an in-browser demo store (`localStorage`) seeded from `src/data/mock/notes.ts`, so you can experiment without writing to disk; the server APIs read/write real files.

## Features

- **Notes**
  - Browse and read notes from the sidebar, grouped by project (first path segment in the slug).
  - Create new notes with title, project + slug, content, and optional tags.
  - Update and delete existing notes via the edit form and corresponding API routes.
  - Store metadata such as `title`, `slug`, `tags`, `createdAt`, and `updatedAt`.
- **Chat**
  - Chat UI component for interacting with an AI model alongside the current note.
  - Server-side chat route (`src/app/api/chat/route.ts`) that loads the active note and calls OpenAI.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (via `globals.css` + `@theme` tokens)
- **Markdown + frontmatter**: `gray-matter` + custom renderer (`src/lib/simpleMarkdown.ts`)

## Project Structure (high level)

- `src/app/page.tsx`: Loads notes from `src/lib/notes.ts` and redirects to the first note.
- `src/app/notes/[...slug]/page.tsx`: Client-side note viewer powered by `src/data/repo.ts`.
- `src/app/notes/new/page.tsx`: New note creation page (writes via `/api/notes`).
- `src/app/notes/edit/[...slug]/page.tsx`: Edit note page (updates/deletes via `/api/notes/[...slug]`).
- `src/app/api/notes/`: REST-style API routes for file-backed CRUD operations on notes.
- `src/app/api/chat/route.ts`: API route for AI chat using the current note content.
- `src/components/layout/ChatPanel.tsx`: Main chat UI component.
- `src/components/layout/Sidebar.tsx` / `SidebarClient.tsx`: Navigation/sidebar components backed by `src/data/repo.ts`.
- `src/lib/notes.ts`: File-based notes utilities (get, list, create, update, delete).
- `src/lib/simpleMarkdown.ts`: Simple Markdown-to-HTML renderer with custom commit-list formatting.
- `scripts/import-commits.js`: Utility to import recent git commits into `content/notes/neural-vault/` as daily `.mdx` notes.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Environment variables

The chat API uses OpenAI’s Chat Completions API via the official SDK:

- **`OPENAI_API_KEY`** – required for `/api/chat` to return real model responses.

When `OPENAI_API_KEY` is missing, the chat route will respond with a 500 error and a clear JSON message.

## Notes storage

Server-side APIs read and write notes under the `content/notes` directory as `.mdx` or `.md` files with frontmatter. Example:

```md
---
title: "My first note"
slug: "my-project/my-first-note"
tags:
  - example
  - demo
createdAt: "2025-01-01T00:00:00.000Z"
updatedAt: "2025-01-01T00:00:00.000Z"
---

This is the **content** of the note.
```

The browser UI uses a small local demo store (`localStorage`) seeded from `src/data/mock/notes.ts`. This keeps the first-run experience fast without requiring disk writes, while still exercising the same API shapes as the file-backed implementation.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the production bundle.
- `npm run start`: Start the production server.
- `npm run lint`: Run lint checks.
- `npm run import:commits`: Generate daily commit notes from your local git history into `content/notes/neural-vault/`.
