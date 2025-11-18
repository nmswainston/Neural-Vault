import { notFound } from "next/navigation"
import { getNoteBySlug } from "@/lib/notes"
import EditNoteForm from "@/app/notes/_components/EditNoteForm"
import DeleteNoteButton from "@/app/notes/_components/DeleteNoteButton"

type PageProps = {
	params: {
		slug: string[]
	}
}

export default async function EditNotePage({ params }: PageProps) {
	const { slug } = params
	const combinedSlug = Array.isArray(slug) ? slug.join("/") : slug
	const note = await getNoteBySlug(combinedSlug)

	if (!note) {
		notFound()
	}

	return (
		<main className="mx-auto max-w-3xl p-6">
			<div className="rounded-xl border border-slate-200 bg-slate-50 backdrop-blur-xl p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800/50">
				<div className="mb-6 flex items-start justify-between">
					<div>
						<h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Edit note</h1>
						<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Refine this entry in your Neural Vault.</p>
					</div>
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
			</div>
		</main>
	)
}


