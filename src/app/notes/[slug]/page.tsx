import { notFound } from "next/navigation"
import { notes } from "@/data/notes"

import ReactMarkdown from "react-markdown"

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = notes.find((n) => n.slug === slug)
  if (!note) return notFound()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <article className="prose prose-invert max-w-none">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </article>
    </main>
  )
}

export async function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }))
}


