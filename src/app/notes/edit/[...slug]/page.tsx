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
		<main className="max-w-3xl mx-auto h-full flex flex-col gap-4 p-6 overflow-y-auto">
			<div className="rounded-xl border border-slate-200/80 bg-white/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl space-y-6 dark:border-slate-800/80 dark:bg-slate-950/80 dark:shadow-black/60">
				{/* Header */}
				<div>
					<div className="text-[10px] uppercase tracking-[0.25em] text-sky-500/80 dark:text-sky-400/80">
						Edit entry
					</div>
					<h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
						Edit note
					</h1>
					<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
						Refine this entry in your Neural Vault.
					</p>
				</div>
				<EditNoteForm
					initial={{
						slug: note.slug,
						title: note.title,
						content: note.content,
						tags: note.tags,
					}}
					deleteButton={<DeleteNoteButton slug={note.slug} />}
				/>
			</div>
		</main>
	)
}


