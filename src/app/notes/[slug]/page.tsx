import { notFound } from "next/navigation"
import { getNoteBySlug, getAllNotes } from "@/data/notes"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params
  const note = getNoteBySlug(slug)

  if (!note) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">{note.title}</h1>
      <pre className="whitespace-pre-wrap text-sm text-slate-200">
        {note.content}
      </pre>
    </main>
  )
}

export function generateStaticParams() {
  const notes = getAllNotes()

  return notes.map((note) => ({
    slug: note.slug,
  }))
}
