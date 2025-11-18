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
			<div className="rounded-xl border border-slate-200 bg-slate-50 backdrop-blur-xl p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800/50">
				<div className="mb-6">
					<h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">New note</h1>
					<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Capture a new memory in your Neural Vault.</p>
				</div>

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
					<label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Project</label>
					<input
						type="text"
						className="w-full rounded-md bg-white border border-slate-300 text-sm px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:bg-slate-950/60 dark:border-slate-700/70 dark:text-slate-200"
						value={project}
						onChange={(e) => setProject(e.target.value)}
						placeholder="e.g. research-lab"
						required
					/>
				</div>

				<div>
					<label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Note slug (optional)</label>
					<input
						type="text"
						className="w-full rounded-md bg-white border border-slate-300 text-sm px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:bg-slate-950/60 dark:border-slate-700/70 dark:text-slate-200"
						value={noteSlug}
						onChange={(e) => setNoteSlug(e.target.value)}
						placeholder="defaults to slugified title if empty"
					/>
				</div>

				<div>
					<label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">Tags (comma separated)</label>
					<input
						type="text"
						className="w-full rounded-md bg-white border border-slate-300 text-sm px-3 py-2 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:bg-slate-950/60 dark:border-slate-700/70 dark:text-slate-200"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						placeholder="e.g. ai, research, draft"
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

				<button
					type="submit"
					disabled={isPending}
					className="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white px-3 py-2 shadow-lg shadow-sky-600/30 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500 dark:shadow-sky-600/30"
				>
					{isPending ? "Creating..." : "+ Create note"}
				</button>
			</form>
			</div>
		</main>
	)
}


