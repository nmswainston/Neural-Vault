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
    <main className="mx-auto max-w-3xl p-6 h-full flex flex-col">
      <div className="rounded-xl border border-slate-200 bg-slate-50 backdrop-blur-xl p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800/50 flex flex-col gap-4">
        {/* Note header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {note.title}
            </h1>
            <div className="mt-1 space-y-0.5">
              {note.createdAt && (
                <p className="text-[11px] text-slate-500 dark:text-slate-500">
                  Created {new Date(note.createdAt).toLocaleDateString()}
                </p>
              )}
              {note.updatedAt && (
                <p className="text-[11px] text-slate-500 dark:text-slate-500">
                  Last updated {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`/notes/edit/${note.slug}`}
              className="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white px-3 py-2 shadow-lg shadow-sky-600/30 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:bg-sky-600 dark:hover:bg-sky-500 dark:shadow-sky-600/30"
            >
              Edit
            </a>
            <DeleteNoteButton slug={note.slug} />
          </div>
        </div>

        {/* Note content */}
        {(() => {
          const html = renderMarkdown(note.content)
          return (
            <div
              className="prose prose-slate max-w-none text-sm leading-relaxed prose-headings:text-slate-900 prose-headings:font-semibold prose-p:text-slate-700 prose-a:text-sky-600 prose-strong:text-slate-900 prose-code:text-emerald-700 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-100 prose-pre:border prose-pre:border-slate-300 dark:prose-invert dark:prose-headings:text-slate-100 dark:prose-p:text-slate-200 dark:prose-a:text-sky-400 dark:prose-strong:text-sky-100 dark:prose-code:text-emerald-300 dark:prose-code:bg-slate-950/80 dark:prose-pre:bg-slate-950/80 dark:prose-pre:border-slate-800"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        })()}
      </div>
    </main>
  )
}


