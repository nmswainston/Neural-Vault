"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState } from "react"
import { Button } from "@/components/ui/Button"

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

		try {
			const res = await fetch(`/api/notes/${slug}`, { method: "DELETE" })
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				setError(data.error || "Failed to delete note.")
				return
			}

			startTransition(() => {
				router.push("/")
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred.")
		}
	}

	return (
		<div className={className}>
			<Button
				type="button"
				variant="danger"
				size="md"
				onClick={onDelete}
				isLoading={isPending}
			>
				Delete
			</Button>
			{error && (
				<p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
					{error}
				</p>
			)}
		</div>
	)
}


