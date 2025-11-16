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
				<label className="mb-1 block text-sm text-slate-300">Title</label>
				<input
					type="text"
					className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-700"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			<div>
				<label className="mb-1 block text-sm text-slate-300">Tags (comma separated)</label>
				<input
					type="text"
					className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-700"
					value={tags}
					onChange={(e) => setTags(e.target.value)}
				/>
			</div>

			<div>
				<label className="mb-1 block text-sm text-slate-300">Content</label>
				<textarea
					className="min-h-[240px] w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-700"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
				/>
			</div>

			{error ? <p className="text-sm text-red-400">{error}</p> : null}

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={isPending}
					className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white disabled:opacity-50"
				>
					{isPending ? "Saving..." : "Save changes"}
				</button>
				<button
					type="button"
					onClick={() => router.push(`/notes/${initial.slug}`)}
					className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
				>
					Cancel
				</button>
			</div>
		</form>
	)
}


