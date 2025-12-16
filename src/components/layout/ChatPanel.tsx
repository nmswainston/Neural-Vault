"use client"

import React, { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { IconButton } from "@/components/ui/IconButton"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  error?: boolean
}

const MOBILE_BREAKPOINT = 768

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (!mobile) {
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

  const slug = useMemo(() => {
    if (!pathname.startsWith("/notes/")) return null
    const rest = pathname.replace(/^\/notes\//, "")
    // Don't run chat on /notes/new or /notes/edit/...
    if (rest && !rest.startsWith("new") && !rest.startsWith("edit")) {
      // strip any querystring just in case
      return rest.split("?")[0]
    }
    return null
  }, [pathname])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !slug || pending) return

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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to get response")
      }

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Neural Vault did not return a reply.",
        },
      ])
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Error contacting Neural Vault API.",
          error: true,
        },
      ])
    } finally {
      setPending(false)
    }
  }

  if (!slug) {
    return null
  }

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 md:hidden rounded-full bg-sky-600 hover:bg-sky-500 text-white p-3 shadow-lg shadow-sky-600/30 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:bg-sky-600 dark:hover:bg-sky-500"
          aria-label="Open chat"
        >
          <span className="sr-only">Open chat</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      <section
        className={`w-80 flex h-screen flex-col border-l border-slate-300 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950/80 fixed md:relative inset-y-0 right-0 z-0 md:z-0 transition-transform duration-300 shrink-0 ${
          isMobile ? (isOpen ? "translate-x-0" : "translate-x-full") : ""
        }`}
        aria-label="Chat panel"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-300 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex-1">
            <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Neural Chat
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Ask questions about this note.
            </p>
          </div>
          {isMobile && (
            <IconButton onClick={() => setIsOpen(false)} aria-label="Close chat">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </IconButton>
          )}
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 text-xs space-y-3">
          {messages.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-500 px-4 pb-2">
              No conversation yet. Ask a question about this note to get started.
            </p>
          )}

          {messages.map((m, i) => {
            return (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.error ? (
                  <div
                    className="text-xs text-red-500 dark:text-red-400 px-4 pb-1"
                    role="alert"
                  >
                    {m.content}
                  </div>
                ) : (
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-xs shadow-md ${
                      m.role === "user"
                        ? "border border-sky-600/60 bg-sky-900/40 text-sky-50 shadow-sky-900/40 dark:border-sky-600/60 dark:bg-sky-900/40 dark:text-sky-50 dark:shadow-sky-900/40"
                        : "border border-slate-300 bg-slate-100/80 text-slate-800 shadow-black/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-black/40"
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
        <div className="sticky bottom-0 border-t border-slate-300 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                id="chat-message"
                name="chatMessage"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Neural Vault about this note…"
                disabled={pending}
                aria-label="Chat message input"
                className="text-xs"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              isLoading={pending}
              disabled={!input.trim() || pending}
            >
              Send
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}

