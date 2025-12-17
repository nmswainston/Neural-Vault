import type { Note } from "@/data/types"
import { seedNotes } from "@/data/mock/notes"
import { normalizeSlug } from "@/lib/utils"

const STORAGE_KEY = "neural-vault-notes"

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function randomDelay() {
  return 200 + Math.floor(Math.random() * 101) // 200-300ms
}

function safeReadNotes(): Note[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed as Note[]
  } catch {
    return null
  }
}

function safeWriteNotes(notes: Note[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // ignore (storage full, private mode, private browsing, etc.)
  }
}

function ensureInitialized(): Note[] {
  const existing = safeReadNotes()
  if (existing && existing.length) return existing

  // First run: seed local storage with normalized slugs
  const normalizedSeedNotes = seedNotes.map((note) => ({
    ...note,
    slug: normalizeSlug(note.slug),
  }))
  safeWriteNotes(normalizedSeedNotes)
  return normalizedSeedNotes
}

export async function getAllNotes(): Promise<Note[]> {
  await delay(randomDelay())
  const notes = ensureInitialized()
  return [...notes].sort((a, b) => a.slug.localeCompare(b.slug))
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  await delay(randomDelay())
  const notes = ensureInitialized()
  const normalizedSlug = normalizeSlug(slug)
  return notes.find((n) => normalizeSlug(n.slug) === normalizedSlug) ?? null
}

export async function createNote(input: {
  title: string
  slug: string
  content: string
  tags?: string[]
}): Promise<Note> {
  await delay(randomDelay())
  const notes = ensureInitialized()

  const normalizedSlug = normalizeSlug(input.slug)
  if (!normalizedSlug) throw new Error("Invalid note slug provided")

  if (notes.some((n) => normalizeSlug(n.slug) === normalizedSlug)) {
    throw new Error(`Note with slug "${normalizedSlug}" already exists`)
  }

  const now = new Date().toISOString()
  const note: Note = {
    title: input.title.trim() || normalizedSlug,
    slug: normalizedSlug,
    tags: Array.isArray(input.tags) ? input.tags : [],
    createdAt: now,
    updatedAt: now,
    content: input.content ?? "",
  }

  const next = [note, ...notes]
  safeWriteNotes(next)
  return note
}

export async function updateNote(input: {
  slug: string
  title: string
  content: string
  tags?: string[]
}): Promise<Note> {
  await delay(randomDelay())
  const notes = ensureInitialized()

  const normalizedSlug = normalizeSlug(input.slug)
  const idx = notes.findIndex((n) => normalizeSlug(n.slug) === normalizedSlug)
  if (idx === -1) throw new Error(`Note with slug "${normalizedSlug}" not found`)

  const existing = notes[idx]
  const now = new Date().toISOString()

  const updated: Note = {
    ...existing,
    title: input.title.trim() || existing.title,
    content: typeof input.content === "string" ? input.content : existing.content,
    tags: Array.isArray(input.tags) ? input.tags : existing.tags,
    updatedAt: now,
  }

  const next = [...notes]
  next[idx] = updated
  safeWriteNotes(next)
  return updated
}

export async function deleteNote(slug: string): Promise<void> {
  await delay(randomDelay())
  const notes = ensureInitialized()

  const normalizedSlug = normalizeSlug(slug)
  const next = notes.filter((n) => normalizeSlug(n.slug) !== normalizedSlug)
  if (next.length === notes.length) {
    throw new Error(`Note with slug "${normalizedSlug}" not found`)
  }

  safeWriteNotes(next)
}

