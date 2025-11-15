"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getAllNotes } from "@/data/notes"

const notes = getAllNotes()

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4">
      <h1 className="mb-1 text-lg font-semibold tracking-tight">
        Neural Vault
      </h1>
      <p className="mb-4 text-xs text-slate-400">
        Your private AI-ready notes hub.
      </p>

      <div className="space-y-2">
        {notes.map((note) => {
          const href = `/notes/${note.slug}`
          const isActive = pathname === href

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
    </aside>
  )
}
