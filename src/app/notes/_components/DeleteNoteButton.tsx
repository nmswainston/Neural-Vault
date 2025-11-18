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
				className="text-xs rounded-md border border-red-500/70 text-red-600 hover:bg-red-50 px-3 py-1.5 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-0 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
			>
				{isPending ? "Deleting..." : "Delete"}
			</button>
			{error ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
		</div>
	)
}


