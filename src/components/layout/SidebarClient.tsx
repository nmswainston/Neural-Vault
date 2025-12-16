"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Note } from "@/lib/notes"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import ThemeToggle from "./ThemeToggle"

type SidebarClientProps = {
  notes: Note[]
}

export default function SidebarClient({ notes }: SidebarClientProps) {
  const pathname = usePathname() ?? ""
  const [search, setSearch] = useState("")

  const { grouped, projects } = useMemo(() => {
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

    return { grouped, projects }
  }, [notes, search])

  return (
    <aside className="w-64 border-r border-slate-300 bg-slate-50 backdrop-blur-xl shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800 flex flex-col h-screen shrink-0">
      {/* Header / Brand area */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-300 dark:border-slate-800">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent dark:from-sky-400 dark:via-cyan-300 dark:to-emerald-300">
            Neural Vault
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Your private AI-ready notes hub.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <Input
            id="sidebar-filter"
            name="sidebarFilter"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter notes by title…"
            aria-label="Filter notes"
            className="text-xs backdrop-blur-sm"
          />
        </div>

        {/* New note button */}
        <div>
          <Link href="/notes/new" className="block">
            <Button variant="primary" size="sm" className="w-full">
              + New note
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 px-3">
              {search ? "No notes found" : "No notes yet"}
            </p>
          ) : (
            projects.map((project) => {
              const projectNotes = grouped[project]
              return (
                <div key={project}>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500/80 dark:text-slate-500/80 px-3 mt-3 mb-1">
                    {project}
                  </div>
                  <nav className="space-y-0.5" aria-label={`Notes in ${project}`}>
                    {projectNotes.map((note) => {
                      const href = `/notes/${note.slug}`
                      const isActive = pathname === href || pathname.startsWith(`${href}/`)

                      return (
                        <Link
                          key={note.slug}
                          href={href}
                          className={`block px-3 py-1.5 rounded-md text-xs transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 ${
                            isActive
                              ? "bg-sky-100 text-sky-900 border border-sky-500/40 dark:bg-sky-600/20 dark:text-sky-100 dark:border-sky-500/40"
                              : "text-slate-700 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-50"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {note.title}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}

