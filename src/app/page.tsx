import { redirect } from "next/navigation"
import { getAllNotes } from "@/lib/notes"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default async function HomePage() {
  const notes = await getAllNotes()

  if (!notes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card variant="outlined" className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No notes yet. Create your first note to get started.
          </p>
          <Link href="/notes/new">
            <Button variant="primary" size="md">
              + Create your first note
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  redirect(`/notes/${notes[0].slug}`)
}