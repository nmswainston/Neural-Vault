"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Note } from "@/lib/notes"
import ThemeToggle from "./ThemeToggle"

type SidebarClientProps = {
  notes: Note[]
}

export default function SidebarClient({ notes }: SidebarClientProps) {
  const pathname = usePathname() ?? ""
  const [search, setSearch] = useState("")

  const searchLower = search.trim().toLowerCase()
  const filteredNotes = searchLower
    ? notes.filter((note) => note.title.toLowerCase().includes(searchLower))
    : notes

  const grouped = filteredNotes.reduce<Record<string, Note[]>>((acc, note) => {
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
    <aside className="w-64 border-r border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-lg font-semibold tracking-tight">Neural Vault</h1>
          <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">Your private AI-ready notes hub.</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-3">
        <input
          id="sidebar-filter"
          name="sidebarFilter"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter notes by title…"
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 placeholder:text-slate-500 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-sky-400"
        />
      </div>

      {/* New note button */}
      <div className="mb-4">
        <Link
          href="/notes/new"
          className="inline-block rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
        >
          + New note
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const projectNotes = grouped[project]
          return (
            <div key={project}>
              <div className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-500">
                {project}
              </div>
              <div className="mt-1 space-y-1">
                {projectNotes.map((note) => {
                  const href = `/notes/${note.slug}`
                  const isActive = pathname === href || pathname.startsWith(`${href}/`)

                  return (
                    <Link
                      key={note.slug}
                      href={href}
                      className={`block w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-200 dark:hover:bg-slate-800 ${
                        isActive
                          ? "bg-slate-200 dark:bg-slate-800"
                          : ""
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

