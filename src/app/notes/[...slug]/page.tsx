import { notFound } from "next/navigation"
import { getNoteBySlug } from "@/lib/notes"
import { renderMarkdown } from "@/lib/simpleMarkdown"
import DeleteNoteButton from "@/app/notes/_components/DeleteNoteButton"

type PageProps = {
  params: {
    slug: string[]
  }
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = params
  const combinedSlug = Array.isArray(slug) ? slug.join("/") : slug
  const note = await getNoteBySlug(combinedSlug)

  if (!note) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{note.title}</h1>
        <div className="flex gap-2">
          <a
            href={`/notes/edit/${note.slug}`}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            Edit
          </a>
          <DeleteNoteButton slug={note.slug} />
        </div>
      </div>
      {(() => {
        const html = renderMarkdown(note.content)
        return (
          <div
            className="prose prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })()}
    </main>
  )
}


