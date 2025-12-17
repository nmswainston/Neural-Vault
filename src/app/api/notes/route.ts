import { NextResponse } from "next/server"
import { createNote, getAllNotes } from "@/lib/notes"

function slugify(input: string): string {
	// Basic slugify: lowercase, remove non-word, replace spaces/hyphens with single hyphen
	return input
		.toLowerCase()
		.trim()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
}

// GET /api/notes
// Returns all notes
export async function GET() {
	try {
		const notes = await getAllNotes()
		return NextResponse.json(notes)
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error"
		return NextResponse.json({ error: message }, { status: 500 })
	}
}

// POST /api/notes
// Creates a new note from { title, slug?, content, tags? }
export async function POST(request: Request) {
	try {
		const body = await request.json()
		const title = typeof body.title === "string" ? body.title.trim() : ""
		const content = typeof body.content === "string" ? body.content : ""
		const providedSlug = typeof body.slug === "string" ? body.slug.trim() : ""
		const tags = Array.isArray(body.tags)
			? (body.tags as unknown[]).filter((t) => typeof t === "string").map((t) => (t as string).trim())
			: []

		if (!title || !content) {
			return NextResponse.json({ error: "title and content are required" }, { status: 400 })
		}

		const slug = providedSlug || slugify(title)
		if (!slug) {
			return NextResponse.json({ error: "Unable to derive a valid slug" }, { status: 400 })
		}

		const note = await createNote({ title, slug, content, tags })
		return NextResponse.json(note, { status: 201 })
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error"
		const status = message.includes("already exists") ? 409 : 500
		return NextResponse.json({ error: message }, { status })
	}
}


