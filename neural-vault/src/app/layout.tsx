"use client"

import "./globals.css"
import type { ReactNode } from "react"
import React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "./components/Sidebar"

export default function NotesLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  const [messages, setMessages] = React.useState<
    { role: "user" | "assistant"; content: string }[]
  >([])

  const [input, setInput] = React.useState("")

  const slug =
    pathname && pathname.startsWith("/notes/")
      ? pathname.split("/")[2]
      : null

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !slug) return

    const userMessage = input.trim()
    setInput("")

    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ]
    setMessages(newMessages)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          noteSlug: slug,
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Neural Vault did not return a reply.",
        },
      ])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error contacting Neural Vault API.",
        },
      ])
    }
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex w-full">
          <Sidebar />

          {/* Main area: note viewer + chat */}
          <main className="flex-1 p-6 overflow-hidden flex gap-4">
            {/* Note viewer (child page content) */}
            <section className="flex-1 overflow-y-auto">{children}</section>

            <section className="w-80 border-l border-slate-800 bg-slate-900/60 p-4 flex flex-col">
              <h2 className="mb-2 text-sm font-semibold tracking-tight">
                Neural Chat
              </h2>

              <div className="flex-1 rounded-md border border-slate-800 bg-slate-950/60 p-2 text-xs text-slate-200 overflow-y-auto space-y-2">
                {messages.length === 0 && (
                  <p className="text-slate-500">
                    Ask a question about the current note and I will answer using its content.
                  </p>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-md ${
                      m.role === "user"
                        ? "bg-slate-800 text-sky-300"
                        : "bg-slate-700 text-slate-100"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Neural Vault about this note…"
                  className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="rounded-md bg-slate-700 px-3 py-2 text-xs text-slate-50"
                >
                  Send
                </button>
              </form>
            </section>
          </main>
        </div>
      </body>
    </html>
  )
}
