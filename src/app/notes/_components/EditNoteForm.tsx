"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { parseTags } from "@/lib/utils"

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

		const tagsArray = parseTags(tags)

		try {
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
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred.")
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-6">
			<Input
				label="Title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				required
				error={error && !title ? "Title is required" : undefined}
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

			{error && !error.includes("required") && (
				<p className="text-sm text-red-600 dark:text-red-400" role="alert">
					{error}
				</p>
			)}

			{/* Footer with buttons */}
			<div className="flex items-center justify-between pt-2 border-t border-slate-300 dark:border-slate-800 mt-2">
				<div>{deleteButton}</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="secondary"
						size="md"
						onClick={() => router.push(`/notes/${initial.slug}`)}
					>
						Cancel
					</Button>
					<Button type="submit" size="md" isLoading={isPending}>
						Save changes
					</Button>
				</div>
			</div>
		</form>
	)
}


