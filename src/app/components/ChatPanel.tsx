"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)

	const pathname = usePathname() ?? ""

	let slug: string | null = null
	if (pathname.startsWith("/notes/")) {
		const rest = pathname.replace(/^\/notes\//, "")
		// Don’t run chat on /notes/new or /notes/edit/...
		if (rest && !rest.startsWith("new") && !rest.startsWith("edit")) {
			// strip any querystring just in case
			slug = rest.split("?")[0]
		}
	}

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !slug) return

    const userMessage = input.trim()
    setInput("")

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ]

    setMessages(newMessages)
    setPending(true)

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
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="w-80 border-l border-slate-200 bg-slate-100 backdrop-blur-xl flex flex-col shadow-lg rounded-l-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800/50 h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center gap-2 dark:bg-slate-900/90 dark:border-slate-800">
        <div className="flex-1">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
            Neural Chat
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Ask questions about this note.
          </p>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 text-xs space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-600 dark:text-slate-400">
            Ask a question about the current note and I&apos;ll use its
            content to answer.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`inline-block max-w-full px-3 py-2 rounded-lg border ${
              m.role === "user"
                ? "ml-auto text-right bg-sky-100 border-sky-300/60 text-sky-900 dark:bg-slate-800/70 dark:border-slate-700/60 dark:text-sky-300"
                : "mr-auto text-left border-slate-300/60 bg-slate-200/90 text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* Sticky input area */}
      <div className="sticky bottom-0 border-t border-slate-200 px-3 py-2 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            id="chat-message"
            name="chatMessage"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Neural Vault about this note…"
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3 py-2 rounded-md disabled:opacity-60 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            {pending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  )
}
