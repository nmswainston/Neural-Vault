import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"

const notesDirectory = path.join(process.cwd(), "content", "notes")

function slugToSegments(slug: string): string[] {
  return slug
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment && segment !== "." && segment !== "..")
}

function joinSegments(segments: string[]): string {
  return segments.join("/")
}

export type Note = {
  title: string
  slug: string
  tags: string[]
  createdAt: string | null
  updatedAt: string | null
  content: string
}

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8")
  } catch {
    return null
  }
}

async function readNoteFile(basePath: string): Promise<{ path: string; contents: string } | null> {
  const mdxPath = `${basePath}.mdx`
  const mdPath = `${basePath}.md`

  const mdxContents = await readFileIfExists(mdxPath)
  if (mdxContents !== null) {
    return { path: mdxPath, contents: mdxContents }
  }

  const mdContents = await readFileIfExists(mdPath)
  if (mdContents !== null) {
    return { path: mdPath, contents: mdContents }
  }

  return null
}

function formatNote(slug: string, data: Record<string, unknown>, content: string): Note {
  return {
    title: typeof data.title === "string" && data.title.length ? data.title : slug,
    slug,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    createdAt: typeof data.createdAt === "string" ? data.createdAt : null,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
    content,
  }
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  try {
    const segments = slugToSegments(slug)
    if (!segments.length) {
      return null
    }

    const normalizedSlug = joinSegments(segments)
    const basePath = path.join(notesDirectory, ...segments)
    const noteFile = await readNoteFile(basePath)

    if (!noteFile) {
      return null
    }

    const { data, content } = matter(noteFile.contents)

    return formatNote(normalizedSlug, data, content)
  } catch (error) {
    console.error(`Error reading note with slug "${slug}":`, error)
    return null
  }
}

export async function getAllNotes(): Promise<Note[]> {
  async function collectNotes(dir: string, slugParts: string[] = []): Promise<Note[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      const notes: Note[] = []

      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const childNotes = await collectNotes(path.join(dir, entry.name), [...slugParts, entry.name])
            notes.push(...childNotes)
          } catch (error) {
            console.error(`Error reading directory "${entry.name}":`, error)
            // Continue processing other entries
          }
          continue
        }

        if (!entry.isFile() || (!entry.name.endsWith(".mdx") && !entry.name.endsWith(".md"))) {
          continue
        }

        const slug = joinSegments([...slugParts, entry.name.replace(/\.mdx?$/, "")])
        const note = await getNoteBySlug(slug)
        if (note) {
          notes.push(note)
        }
      }

      return notes
    } catch (error) {
      console.error(`Error reading directory "${dir}":`, error)
      return []
    }
  }

  try {
    const stats = await fs.stat(notesDirectory).catch(() => null)
    if (!stats || !stats.isDirectory()) {
      return []
    }

    const notes = await collectNotes(notesDirectory)
    return notes.sort((a, b) => a.slug.localeCompare(b.slug))
  } catch {
    return []
  }
}

export async function createNote(input: {
  title: string
  slug: string
  content: string
  tags?: string[]
}): Promise<Note> {
  const { title, slug, content, tags = [] } = input
  const segments = slugToSegments(slug)

  if (!segments.length) {
    throw new Error("Invalid note slug provided")
  }

  const normalizedSlug = joinSegments(segments)
  const basePath = path.join(notesDirectory, ...segments)
  const fullPath = `${basePath}.mdx`

  await fs.mkdir(path.dirname(basePath), { recursive: true })

  const existing = await readNoteFile(basePath)
  if (existing) {
    throw new Error(`Note with slug "${normalizedSlug}" already exists`)
  }

  const now = new Date().toISOString()

  const fileContents = matter.stringify(content, {
    title,
    slug: normalizedSlug,
    tags,
    createdAt: now,
    updatedAt: now,
  })

  await fs.writeFile(fullPath, fileContents, "utf8")

  return {
    title,
    slug: normalizedSlug,
    tags,
    createdAt: now,
    updatedAt: now,
    content,
  }
}

export async function updateNote(input: {
  slug: string
  title: string
  content: string
  tags?: string[]
}): Promise<Note> {
  const { slug, title, content, tags = [] } = input
  const segments = slugToSegments(slug)
  if (!segments.length) {
    throw new Error("Invalid note slug provided")
  }
  const normalizedSlug = joinSegments(segments)
  const basePath = path.join(notesDirectory, ...segments)
  const existingFile = await readNoteFile(basePath)
  if (!existingFile) {
    throw new Error(`Note with slug "${normalizedSlug}" not found`)
  }

  const parsed = matter(existingFile.contents)

  const now = new Date().toISOString()

  const fileContents = matter.stringify(content, {
    ...parsed.data,
    title,
    slug: normalizedSlug,
    tags,
    updatedAt: now,
  })

  await fs.writeFile(existingFile.path, fileContents, "utf8")

  return {
    title,
    slug: normalizedSlug,
    tags,
    createdAt: typeof parsed.data.createdAt === "string" ? parsed.data.createdAt : now,
    updatedAt: now,
    content,
  }
}

export async function deleteNote(slug: string): Promise<void> {
  const segments = slugToSegments(slug)
  if (!segments.length) {
    throw new Error("Invalid note slug provided")
  }
  const basePath = path.join(notesDirectory, ...segments)
  const existingFile = await readNoteFile(basePath)

  if (!existingFile) {
    throw new Error(`Note with slug "${joinSegments(segments)}" not found`)
  }

  await fs.unlink(existingFile.path)
}

