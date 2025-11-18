"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState } from "react"

type DeleteNoteButtonProps = {
	slug: string
	className?: string
}

export default function DeleteNoteButton({ slug, className }: DeleteNoteButtonProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	async function onDelete() {
		setError(null)
		const confirmed = window.confirm("Delete this note? This cannot be undone.")
		if (!confirmed) return

		const res = await fetch(`/api/notes/${slug}`, { method: "DELETE" })
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			setError(data.error || "Failed to delete note.")
			return
		}

		startTransition(() => {
			router.push("/")
		})
	}

	return (
		<div className={className}>
			<button
				type="button"
				onClick={onDelete}
				disabled={isPending}
				className="rounded-md border border-red-600 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
			>
				{isPending ? "Deleting..." : "Delete"}
			</button>
			{error ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
		</div>
	)
}


