"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { notes, type Note } from "@/data/notes"

export default function Sidebar() {
  const pathname = usePathname()

  const [messages, setMessages] = React.useState<
    { role: "user" | "assistant"; content: string }[]
  >([])

  const [input, setInput] = React.useState("")

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setInput("")

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No reply" },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error contacting Neural Vault API." },
      ])
    }
  }

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4">
      <h1 className="mb-1 text-lg font-semibold tracking-tight">Neural Vault</h1>
      <p className="mb-4 text-xs text-slate-400">Your private AI-ready notes hub.</p>

      <div className="space-y-2">
        {notes.map((note: Note) => {
          const href = `/notes/${note.slug}`
          const isActive = pathname === href

          return (
            <Link
              key={note.id}
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


