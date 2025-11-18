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
      {/* Compact search input anchored near top-right */}
      <div className="pointer-events-none fixed top-3 right-[21rem] z-40">
        <form
          onSubmit={onSubmit}
          className="pointer-events-auto flex items-center gap-2 rounded-md border border-slate-300/80 bg-white/80 backdrop-blur-md px-2 py-1 text-xs shadow-md dark:border-slate-800/80 dark:bg-slate-950/80 dark:shadow-black/40 transition-all duration-150"
        >
          <input
            type="text"
            id="vault-question"
            name="vaultQuestion"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the Vault…"
            className="w-52 bg-transparent text-xs text-slate-900 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 transition-all duration-150 dark:text-slate-200"
          />
          <button
            type="submit"
            className="rounded-md bg-sky-600 hover:bg-sky-500 px-2 py-1 text-[11px] text-white transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Ask
          </button>
        </form>
      </div>

      {/* Result drawer */}
      <div
        className={`fixed inset-y-3 right-3 z-50 w-[360px] md:w-[400px] rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-black/60 ${
          open ? "translate-x-0" : "translate-x-[calc(100%+0.75rem)]"
        }`}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800/70">
          <div className="flex-1">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
              Ask the Vault
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Answers across all notes.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-900 hover:bg-slate-200 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 dark:border-slate-800/70 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/70"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <p className="text-xs text-slate-600 dark:text-slate-400">Thinking…</p>
          )}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          {!loading && !error && result && (
            <div className="space-y-4">
              <div className="prose prose-slate prose-invert max-w-none text-xs leading-relaxed dark:prose-invert">
                <div className="text-slate-700 dark:text-slate-200">{result.answer}</div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {result.sources.length === 0 && (
                    <span className="text-xs text-slate-500">No sources found.</span>
                  )}
                  {result.sources.map((slug) => {
                    const label = formatSourceLabel(slug)
                    return (
                      <Link
                        key={slug}
                        href={`/notes/${slug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-300/70 px-2 py-1 text-[11px] text-slate-700 hover:border-sky-500 hover:text-sky-600 transition-all duration-150 hover:translate-y-[0.5px] active:scale-[0.98] dark:border-slate-700/70 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300"
                        onClick={() => setOpen(false)}
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          {!loading && !error && !result && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ask a question about anything in your notes.
            </p>
          )}
        </div>
      </div>
    </>
  )
}


