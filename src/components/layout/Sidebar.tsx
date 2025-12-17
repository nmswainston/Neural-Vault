
"use client"

import { useEffect, useState } from "react"
import SidebarClient from "./SidebarClient"
import type { Note } from "@/data/types"
import { getAllNotes } from "@/data/repo"

export default function Sidebar() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getAllNotes()
        if (active) setNotes(data)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <aside className="w-64 border-r border-slate-300 bg-slate-50 backdrop-blur-xl shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800 flex flex-col h-screen shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-300 dark:border-slate-800">
          <div className="flex-1">
            <div className="h-6 w-32 rounded bg-slate-200/80 dark:bg-slate-800/80" />
            <div className="mt-2 h-3 w-40 rounded bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="h-8 rounded bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-8 rounded bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-20 rounded bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
      </aside>
    )
  }

  return <SidebarClient notes={notes} />
}

