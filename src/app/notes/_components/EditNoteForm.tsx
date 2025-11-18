"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type EditNoteFormProps = {
	initial: {
		slug: string
		title: string
		content: string
		tags: string[]
	}
	deleteButton?: React.ReactNode
}

export default function EditNoteForm({ initial, deleteButton }: EditNoteFormProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const [title, setTitle] = useState(initial.title)
	const [tags, setTags] = useState(initial.tags.join(", "))
	const [content, setContent] = useState(initial.content)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		const tagsArray = tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean)

		const res = await fetch(`/api/notes/${initial.slug}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, content, tags: tagsArray }),
		})

		if (!res.ok) {
		 const data = await res.json().catch(() => ({}))
		 setError(data.error || "Failed to update note.")
		 return
		}

		startTransition(() => {
			router.push(`/notes/${initial.slug}`)
		})
	}

	return (
		<form onSubmit={onSubmit} className="space-y-6">
			<div className="space-y-1">
				<label className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
					Title
				</label>
				<input
					type="text"
					className="w-full rounded-md border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			<div className="space-y-1">
				<label className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
					Tags (comma separated)
				</label>
				<p className="text-[11px] text-slate-500 dark:text-slate-500">
					Separate multiple tags with commas
				</p>
				<input
					type="text"
					className="w-full rounded-md border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
					value={tags}
					onChange={(e) => setTags(e.target.value)}
				/>
			</div>

			<div className="space-y-1">
				<label className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
					Content
				</label>
				<textarea
					className="min-h-[220px] w-full rounded-md border border-slate-300/80 bg-white/80 px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
				/>
			</div>

			{error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

			{/* Footer with buttons */}
			<div className="flex items-center justify-between pt-2 border-t border-slate-300/70 dark:border-slate-800/70 mt-2">
				<div>
					{deleteButton}
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => router.push(`/notes/${initial.slug}`)}
						className="rounded-md border border-slate-300/80 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors active:scale-[0.97] dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800/80"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isPending}
						className="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-sky-600/30 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{isPending ? "Saving..." : "Save changes"}
					</button>
				</div>
			</div>
		</form>
	)
}


