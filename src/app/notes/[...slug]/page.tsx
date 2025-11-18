import { getNoteBySlug } from "@/lib/notes"
import { renderMarkdown } from "@/lib/simpleMarkdown"
import Link from "next/link"

type PageProps = {
  params: Promise<{
    slug: string[]
  }>
}

export default async function NotePage({ params }: PageProps) {
  const { slug: slugArray } = await params
  const slug = slugArray.join("/")
  const note = await getNoteBySlug(slug)

  if (!note) {
    return (
      <main className="flex h-full items-center justify-center p-6">
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50 backdrop-blur-xl">
          <p className="mb-2 font-medium">Note not found</p>
          <p className="text-xs text-slate-400">
            The requested entry could not be located in the vault.
          </p>
          <Link
            href="/notes"
            className="mt-3 inline-block text-xs text-sky-400 hover:text-sky-300 underline"
          >
            Return to notes
          </Link>
        </div>
      </main>
    )
  }

  const createdAt = note.createdAt ? new Date(note.createdAt) : null
  const updatedAt = note.updatedAt ? new Date(note.updatedAt) : null

  let whenText = ""
  if (updatedAt && createdAt) {
    whenText = `Updated ${updatedAt.toLocaleDateString()} • Created ${createdAt.toLocaleDateString()}`
  } else if (updatedAt) {
    whenText = `Updated ${updatedAt.toLocaleDateString()}`
  } else if (createdAt) {
    whenText = `Created ${createdAt.toLocaleDateString()}`
  }

  const html = renderMarkdown(note.content)

  return (
    <main className="mx-auto max-w-3xl h-full flex flex-col gap-4 p-6 pr-6 md:pr-6 overflow-y-auto">
      {/* Header section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          {/* Left side */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-sky-400/80">
              Vault entry
            </div>
            <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-50">
              {note.title}
            </h1>
            {/* Metadata row */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              {whenText && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                  <span>{whenText}</span>
                </div>
              )}
              {note.tags && note.tags.length > 0 && (
                <>
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-slate-700/80 bg-slate-950/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit button - moved below header */}
        <div className="flex justify-start">
          <Link
            href={`/notes/edit/${slug}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-sm shadow-black/40 transition-all duration-150 hover:border-sky-500/70 hover:text-sky-100 hover:shadow-sky-500/25 active:scale-[0.97]"
          >
            <span>✎</span>
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Note content card */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div
          className="
            prose prose-invert max-w-none text-sm leading-relaxed
            prose-headings:text-slate-100
            prose-p:text-slate-200
            prose-strong:text-sky-100
            prose-a:text-sky-400 hover:prose-a:text-sky-300
            prose-code:text-emerald-300
            prose-pre:bg-slate-950/90 prose-pre:border prose-pre:border-slate-800/80
            prose-li:marker:text-slate-400
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  )
}


