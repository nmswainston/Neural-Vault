import { redirect } from "next/navigation"
import { getAllNotes } from "@/lib/notes"

export default async function HomePage() {
  const notes = await getAllNotes()

  if (!notes.length) {
    return (
      <div className="p-6">
        <p className="text-slate-400">No notes yet.</p>
      </div>
    )
  }

  redirect(`/notes/${notes[0].slug}`)
}