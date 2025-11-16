"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Note } from "@/lib/notes"

type SidebarClientProps = {
  notes: Note[]
}

export default function SidebarClient({ notes }: SidebarClientProps) {
  const pathname = usePathname() ?? ""

  const grouped = notes.reduce<Record<string, Note[]>>((acc, note) => {
    const [project] = note.slug.split("/")
    const key = project || note.slug
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(note)
    return acc
  }, {})

  const projects = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

  projects.forEach((project) => {
    grouped[project] = grouped[project].sort((a, b) => a.slug.localeCompare(b.slug))
  })

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4">
      <h1 className="mb-1 text-lg font-semibold tracking-tight">Neural Vault</h1>
      <p className="mb-4 text-xs text-slate-400">Your private AI-ready notes hub.</p>

      {/* New note button */}
      <div className="mb-4">
        <Link
          href="/notes/new"
          className="inline-block rounded-md bg-slate-200 px-3 py-2 text-xs font-medium text-slate-900 hover:bg-white"
        >
          + New note
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const projectNotes = grouped[project]
          return (
            <div key={project}>
              <div className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{project}</div>
              <div className="mt-1 space-y-1">
                {projectNotes.map((note) => {
                  const href = `/notes/${note.slug}`
                  const isActive = pathname === href || pathname.startsWith(`${href}/`)

                  return (
                    <Link
                      key={note.slug}
                      href={href}
                      className={`block w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-800 ${
                        isActive ? "bg-slate-800" : ""
                      }`}
                    >
                      {note.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

