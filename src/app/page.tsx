import { redirect } from "next/navigation"
import { getAllNotes } from "@/data/notes"

export default function HomePage() {
  const notes = getAllNotes()

  if (!notes.length) {
    return (
      <div className="p-6">
        <p className="text-slate-400">No notes yet.</p>
      </div>
    )
  }

  redirect(`/notes/${notes[0].slug}`)
}