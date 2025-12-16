"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { parseTags } from "@/lib/utils"

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
		const tagsArray = parseTags(tags)

		try {
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
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred.")
		}
	}

	return (
		<main className="max-w-3xl mx-auto h-full flex flex-col gap-4 p-6 overflow-y-auto">
			<Card variant="elevated" className="p-6 space-y-6">
				{/* Header */}
				<div>
					<div className="text-xs uppercase tracking-[0.25em] text-sky-500/80 dark:text-sky-400/80">
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
					<Input
						label="Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						error={error && !title ? "Title is required" : undefined}
					/>

					<Input
						label="Project"
						value={project}
						onChange={(e) => setProject(e.target.value)}
						placeholder="e.g. research-lab"
						required
						error={error && error.includes("Project") ? error : undefined}
					/>

					<Input
						label="Note slug"
						helperText="Defaults to slugified title if empty"
						value={noteSlug}
						onChange={(e) => setNoteSlug(e.target.value)}
						placeholder="defaults to slugified title if empty"
						error={error && error.includes("slug") ? error : undefined}
					/>

					<Input
						label="Tags"
						helperText="Separate multiple tags with commas"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						placeholder="e.g. ai, research, draft"
					/>

					<Textarea
						label="Content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
						error={error && !content ? "Content is required" : undefined}
					/>

					{error && !error.includes("required") && !error.includes("Project") && !error.includes("slug") && (
						<p className="text-sm text-red-600 dark:text-red-400" role="alert">
							{error}
						</p>
					)}

					{/* Footer with button */}
					<div className="flex items-center justify-between pt-2 border-t border-slate-300 dark:border-slate-800 mt-2">
						<div></div>
						<Button type="submit" size="md" isLoading={isPending}>
							+ Create note
						</Button>
					</div>
				</form>
			</Card>
		</main>
	)
}


