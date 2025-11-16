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
    <section className="w-80 border-l border-slate-800 bg-slate-900/60 p-4 flex flex-col">
      <h2 className="mb-2 text-sm font-semibold tracking-tight">
        Neural Chat
      </h2>

      <div className="flex-1 rounded-md border border-slate-800 bg-slate-950/60 p-2 text-xs text-slate-200 overflow-y-auto space-y-2">
        {messages.length === 0 && (
          <p className="text-slate-500">
            Ask a question about the current note and I&apos;ll use its
            content to answer.
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
          id="chat-message"
          name="chatMessage"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Neural Vault about this note…"
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-700 px-3 py-2 text-xs text-slate-50 disabled:opacity-60"
        >
          {pending ? "..." : "Send"}
        </button>
      </form>
    </section>
  )
}
