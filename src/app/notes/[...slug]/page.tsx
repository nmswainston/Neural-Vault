import { getNoteBySlug } from "@/lib/notes"
import { renderMarkdown } from "@/lib/simpleMarkdown"
import { formatDateRange } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
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
        <Card variant="outlined" className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
          <p className="mb-2 font-medium">Note not found</p>
          <p className="text-xs text-slate-400 dark:text-slate-400">
            The requested entry could not be located in the vault.
          </p>
          <Link href="/notes" className="mt-3 inline-block">
            <Button variant="secondary" size="sm">
              Return to notes
            </Button>
          </Link>
        </Card>
      </main>
    )
  }

  const dateText = formatDateRange(note.updatedAt, note.createdAt)
  const html = renderMarkdown(note.content)

  return (
    <main className="mx-auto max-w-3xl h-full flex flex-col gap-4 p-6 overflow-y-auto">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* Left side */}
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-sky-400/80 dark:text-sky-400/80">
              Vault entry
            </div>
            <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {note.title}
            </h1>
            {/* Metadata row */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {dateText && (
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--color-emerald-400-90)]"
                    aria-hidden="true"
                  />
                  <time dateTime={note.updatedAt || note.createdAt || undefined}>
                    {dateText}
                  </time>
                </div>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Tags">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-slate-300 bg-slate-100/80 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-300"
                      role="listitem"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit button */}
        <div className="flex justify-start">
          <Link href={`/notes/edit/${slug}`}>
            <Button variant="secondary" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Note content card */}
      <Card variant="elevated" className="flex-1 overflow-y-auto p-6">
        <article
          className="
            prose prose-slate max-w-none text-sm leading-relaxed
            prose-headings:text-slate-900 dark:prose-headings:text-slate-100
            prose-p:text-slate-700 dark:prose-p:text-slate-200
            prose-strong:text-slate-900 dark:prose-strong:text-sky-100
            prose-a:text-sky-600 hover:prose-a:text-sky-500 dark:prose-a:text-sky-400 dark:hover:prose-a:text-sky-300
            prose-code:text-emerald-700 dark:prose-code:text-emerald-300
            prose-pre:bg-slate-100 dark:prose-pre:bg-slate-950/80 prose-pre:border prose-pre:border-slate-300 dark:prose-pre:border-slate-800
            prose-li:marker:text-slate-500 dark:prose-li:marker:text-slate-400
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>
    </main>
  )
}


