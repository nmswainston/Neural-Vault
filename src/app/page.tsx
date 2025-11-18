import { redirect } from "next/navigation"
import { getAllNotes } from "@/lib/notes"

export default async function HomePage() {
  const notes = await getAllNotes()

  if (!notes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 backdrop-blur-xl p-8 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800/50">
          <p className="text-slate-600 dark:text-slate-400">No notes yet. Create your first note to get started.</p>
        </div>
      </div>
    )
  }

  redirect(`/notes/${notes[0].slug}`)
}