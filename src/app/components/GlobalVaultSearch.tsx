"use client"

import React, { useState } from "react"
import Link from "next/link"

type VaultResponse = {
  answer: string
  sources: string[]
}

function formatSourceLabel(slug: string): string {
  const parts = slug.split("/")
  const last = parts[parts.length - 1] || slug
  return last.replace(/-/g, " ")
}

export default function GlobalVaultSearch() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VaultResponse | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setOpen(true)
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/vault-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Request failed")
      }
      setResult(data)
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Minimal search input anchored near top-right, just left of the chat panel */}
      <div className="pointer-events-none fixed top-3 right-[21rem] z-40">
        <form
          onSubmit={onSubmit}
          className="pointer-events-auto flex items-center gap-2 rounded-md border border-slate-300 bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90"
        >
          <input
            type="text"
            id="vault-question"
            name="vaultQuestion"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the Vault…"
            className="w-52 bg-transparent text-xs text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-200"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-700 px-2 py-1 text-[11px] text-white hover:bg-slate-600 transition dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            Ask
          </button>
        </form>
      </div>

      {/* Result drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full transform transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "380px" }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col border-l border-slate-200 bg-white/95 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold tracking-tight">Ask the Vault</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-900 hover:bg-slate-200 transition dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading && (
              <p className="text-xs text-slate-600 dark:text-slate-400">Thinking…</p>
            )}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            {!loading && !error && result && (
              <div className="space-y-4">
                <div className="prose prose-slate max-w-none text-sm dark:prose-invert">
                  <div>{result.answer}</div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Sources</p>
                  <ul className="space-y-1">
                    {result.sources.length === 0 && (
                      <li className="text-xs text-slate-500">No sources found.</li>
                    )}
                    {result.sources.map((slug) => {
                      const label = formatSourceLabel(slug)
                      return (
                        <li key={slug}>
                          <Link
                            href={`/notes/${slug}`}
                            className="text-xs text-sky-600 hover:underline dark:text-sky-400"
                            onClick={() => setOpen(false)}
                          >
                            {label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}
            {!loading && !error && !result && (
              <p className="text-xs text-slate-500">
                Ask a question about anything in your notes.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}


