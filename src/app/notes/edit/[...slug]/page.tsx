import { notFound } from "next/navigation"
import { getNoteBySlug } from "@/lib/notes"
import EditNoteForm from "@/app/notes/_components/EditNoteForm"
import DeleteNoteButton from "@/app/notes/_components/DeleteNoteButton"

type PageProps = {
	params: Promise<{
		slug: string[]
	}>
}

export default async function EditNotePage({ params }: PageProps) {
	const { slug } = await params
	const combinedSlug = Array.isArray(slug) ? slug.join("/") : slug
	const note = await getNoteBySlug(combinedSlug)

	if (!note) {
		notFound()
	}

	return (
		<main className="mx-auto max-w-3xl p-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Edit note</h1>
				<DeleteNoteButton slug={note.slug} />
			</div>
			<EditNoteForm
				initial={{
					slug: note.slug,
					title: note.title,
					content: note.content,
					tags: note.tags,
				}}
			/>
		</main>
	)
}


