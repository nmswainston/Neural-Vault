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
}

export default function EditNoteForm({ initial }: EditNoteFormProps) {
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
		<form onSubmit={onSubmit} className="space-y-4">
			<div>
				<label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Title</label>
				<input
					type="text"
					className="w-full rounded-md bg-white border border-slate-300 text-sm px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:bg-slate-950/60 dark:border-slate-700/70 dark:text-slate-200"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			<div>
				<label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Tags (comma separated)</label>
				<input
					type="text"
					className="w-full rounded-md bg-white border border-slate-300 text-sm px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:bg-slate-950/60 dark:border-slate-700/70 dark:text-slate-200"
					value={tags}
					onChange={(e) => setTags(e.target.value)}
				/>
			</div>

			<div>
				<label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Content</label>
				<textarea
					className="min-h-[260px] w-full rounded-md bg-white border border-slate-300 font-mono text-sm px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:bg-slate-950/70 dark:border-slate-700/70 dark:text-slate-200"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
				/>
			</div>

			{error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={isPending}
					className="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white px-3 py-2 shadow-lg shadow-sky-600/30 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500 dark:shadow-sky-600/30"
				>
					{isPending ? "Saving..." : "Save changes"}
				</button>
				<button
					type="button"
					onClick={() => router.push(`/notes/${initial.slug}`)}
					className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 transition-all duration-150 hover:bg-slate-50 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/70"
				>
					Cancel
				</button>
			</div>
		</form>
	)
}


