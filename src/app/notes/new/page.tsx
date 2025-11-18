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
		<main className="max-w-3xl mx-auto h-full flex flex-col gap-4 p-6 overflow-y-auto">
			<div className="rounded-xl border border-slate-200/80 bg-white/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl space-y-6 dark:border-slate-800/80 dark:bg-slate-950/80 dark:shadow-black/60">
				{/* Header */}
				<div>
					<div className="text-[10px] uppercase tracking-[0.25em] text-sky-500/80 dark:text-sky-400/80">
						New entry
					</div>
					<h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
						New note
					</h1>
					<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
						Capture something new in your Neural Vault.
					</p>
				</div>

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
							Project
						</label>
						<input
							type="text"
							className="w-full rounded-md border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
							value={project}
							onChange={(e) => setProject(e.target.value)}
							placeholder="e.g. research-lab"
							required
						/>
					</div>

					<div className="space-y-1">
						<label className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
							Note slug (optional)
						</label>
						<p className="text-[11px] text-slate-500 dark:text-slate-500">
							Defaults to slugified title if empty
						</p>
						<input
							type="text"
							className="w-full rounded-md border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
							value={noteSlug}
							onChange={(e) => setNoteSlug(e.target.value)}
							placeholder="defaults to slugified title if empty"
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
							placeholder="e.g. ai, research, draft"
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

					{/* Footer with button */}
					<div className="flex items-center justify-between pt-2 border-t border-slate-300/70 dark:border-slate-800/70 mt-2">
						<div></div>
						<button
							type="submit"
							disabled={isPending}
							className="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-sky-600/30 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isPending ? "Creating..." : "+ Create note"}
						</button>
					</div>
				</form>
			</div>
		</main>
	)
}


