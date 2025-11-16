import { NextResponse } from "next/server"
import { deleteNote, getNoteBySlug, updateNote } from "@/lib/notes"

// PUT /api/notes/[...slug]
export async function PUT(
	request: Request,
	{ params }: { params: { slug: string[] } },
) {
	try {
		const { slug } = params
		const combinedSlug = Array.isArray(slug) ? slug.join("/") : ""
		if (!combinedSlug) {
			return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
		}

		const existing = await getNoteBySlug(combinedSlug)
		if (!existing) {
			return NextResponse.json({ error: "Note not found" }, { status: 404 })
		}

		const body = await request.json()
		const title =
			typeof body.title === "string" && body.title.trim().length ? (body.title as string).trim() : existing.title
		const content = typeof body.content === "string" ? (body.content as string) : existing.content
		const tags = Array.isArray(body.tags)
			? (body.tags as unknown[]).filter((t) => typeof t === "string").map((t) => (t as string).trim())
			: existing.tags

		const updated = await updateNote({ slug: combinedSlug, title, content, tags })
		return NextResponse.json(updated)
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error"
		return NextResponse.json({ error: message }, { status: 500 })
	}
}

// DELETE /api/notes/[...slug]
export async function DELETE(
	_request: Request,
	{ params }: { params: { slug: string[] } },
) {
	try {
		const { slug } = params
		const combinedSlug = Array.isArray(slug) ? slug.join("/") : ""
		if (!combinedSlug) {
			return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
		}

		const existing = await getNoteBySlug(combinedSlug)
		if (!existing) {
			return NextResponse.json({ error: "Note not found" }, { status: 404 })
		}

		await deleteNote(combinedSlug)
		return NextResponse.json({ ok: true })
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error"
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
