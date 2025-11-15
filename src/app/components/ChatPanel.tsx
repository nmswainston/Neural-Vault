"use client"

import { useState } from "react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || pending) return
    setPending(true)
    setMessages((m) => [...m, { role: "user", content: text }])
    setInput("")
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data?.error ?? "Error" },
        ])
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply as string },
        ])
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error" },
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
        {pending && (
          <div className="p-2 rounded-md bg-slate-700 text-slate-100">
            …
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Neural Vault…"
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-700 px-3 py-2 text-xs text-slate-50 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  )
}


