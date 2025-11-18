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
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{note.title}</h1>
          {note.updatedAt && (
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-500">
              Last updated {new Date(note.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={`/notes/edit/${note.slug}`}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
            className="prose prose-slate max-w-none text-sm dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })()}
    </main>
  )
}


