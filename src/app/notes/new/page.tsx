"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
}

export default function NewNotePage() {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const [title, setTitle] = useState("")
	const [project, setProject] = useState("")
	const [noteSlug, setNoteSlug] = useState("")
	const [tags, setTags] = useState("")
	const [content, setContent] = useState("")
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		const projectSlug = slugify(project)
		if (!projectSlug) {
			setError("Project is required to build a note path.")
			return
		}

		const noteSlugPart = slugify(noteSlug || title)
		if (!noteSlugPart) {
			setError("Enter a note slug or title to build a valid slug.")
			return
		}

		const combinedSlug = `${projectSlug}/${noteSlugPart}`

		const tagsArray = tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean)

		const res = await fetch("/api/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, slug: combinedSlug, content, tags: tagsArray }),
		})

		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			setError(data.error || "Failed to create note.")
			return
		}

		const created = await res.json()
		startTransition(() => {
			router.push(`/notes/${created.slug}`)
		})
	}

	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">New note</h1>

			<form onSubmit={onSubmit} className="space-y-4">
				<div>
					<label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Title</label>
					<input
						type="text"
						className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-slate-700"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>

				<div>
					<label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Project</label>
					<input
						type="text"
						className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-slate-700"
						value={project}
						onChange={(e) => setProject(e.target.value)}
						placeholder="e.g. research-lab"
						required
					/>
				</div>

				<div>
					<label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Note slug (optional)</label>
					<input
						type="text"
						className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-slate-700"
						value={noteSlug}
						onChange={(e) => setNoteSlug(e.target.value)}
						placeholder="defaults to slugified title if empty"
					/>
				</div>

				<div>
					<label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
					<input
						type="text"
						className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-slate-700"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						placeholder="e.g. ai, research, draft"
					/>
				</div>

				<div>
					<label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Content</label>
					<textarea
						className="min-h-[240px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-slate-700"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
					/>
				</div>

				{error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

				<button
					type="submit"
					disabled={isPending}
					className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
				>
					{isPending ? "Creating..." : "+ Create note"}
				</button>
			</form>
		</main>
	)
}


