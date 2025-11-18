"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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
    <>
      {/* Mobile toggle button */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 z-50 md:hidden rounded-full bg-sky-600 hover:bg-sky-500 text-white p-3 shadow-lg shadow-sky-600/30 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:bg-sky-600 dark:hover:bg-sky-500"
          aria-label="Open chat"
        >
          💬
        </button>
      )}
      
      <section className={`w-80 flex h-full flex-col rounded-xl border border-slate-200/80 bg-slate-50/85 shadow-2xl shadow-black/20 backdrop-blur-xl overflow-hidden dark:border-slate-800/80 dark:bg-slate-950/85 dark:shadow-black/60 fixed md:relative inset-y-0 right-0 z-40 transition-transform duration-300 ${
        isMobile ? (isOpen ? "translate-x-0" : "translate-x-full") : ""
      }`}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex-1">
          <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            Neural Chat
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">
            Ask questions about this note.
          </p>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-900 hover:bg-slate-200 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/70"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 text-xs space-y-3">
        {messages.length === 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-500 px-4 pb-2">
            No conversation yet. Ask a question about this note to get started.
          </p>
        )}

        {messages.map((m, i) => {
          const isError = m.content.toLowerCase().includes("error") || m.content.toLowerCase().includes("did not return")
          return (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {isError ? (
                <div className="text-[11px] text-red-500 dark:text-red-400 px-4 pb-1">
                  {m.content}
                </div>
              ) : (
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-[11px] shadow-md ${
                    m.role === "user"
                      ? "border border-sky-600/60 bg-sky-900/40 text-sky-50 shadow-sky-900/40 dark:border-sky-600/60 dark:bg-sky-900/40 dark:text-sky-50 dark:shadow-sky-900/40"
                      : "border border-slate-300/80 bg-slate-100/80 text-slate-800 shadow-black/20 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-black/40"
                  }`}
                >
                  {m.content}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky input area */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50/90 px-3 py-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            id="chat-message"
            name="chatMessage"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Neural Vault about this note…"
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 px-3 py-2 text-[11px] font-medium text-white shadow-lg shadow-sky-600/30 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed dark:bg-sky-600 dark:hover:bg-sky-500 dark:shadow-sky-600/30"
          >
            {pending ? "..." : "Send"}
          </button>
        </form>
      </div>
      </section>
    </>
  )
}
