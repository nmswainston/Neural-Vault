import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getAllNotes, type Note } from "@/data/notes"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message: string | undefined = body?.message
    const messages: { role: "user" | "assistant"; content: string }[] | undefined =
      body?.messages
    const noteSlug: string | undefined = body?.noteSlug

    if ((!message || message.trim().length === 0) && !messages?.length) {
      return NextResponse.json(
        { error: "Missing message(s)" },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY")
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      )
    }

    // Simple retrieval: rank notes by keyword overlap with the user message
    const notes = getAllNotes()

    let relevantNotes: Note[] = []
    if (noteSlug) {
      const matched = notes.find((n) => n.slug === noteSlug)
      if (matched) relevantNotes = [matched]
    }
    if (relevantNotes.length === 0) {
      const q = messages?.length
        ? messages[messages.length - 1]?.content ?? ""
        : message ?? ""
      relevantNotes = rankNotesByQuery(q, notes)
    }

    const contextBlock =
      relevantNotes.length > 0
        ? relevantNotes
            .map((n) => {
              return [
                `Title: ${n.title}`,
                `Slug: /notes/${n.slug}`,
                `Content:`,
                truncate(n.content, 1200),
              ].join("\n")
            })
            .join("\n\n---\n\n")
        : "No directly relevant notes were found."

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // good, cheap ChatGPT-style model
      messages: [
        {
          role: "system",
          content:
            "You are Neural Vault, a helpful assistant. Answer concisely and practically. Use the provided CONTEXT when relevant. If the answer is not in the context, say so briefly and then answer from general knowledge.",
        },
        {
          role: "system",
          content: `CONTEXT:\n${contextBlock}`,
        },
        ...(messages && messages.length
          ? messages
          : [
              {
                role: "user" as const,
                content: message ?? "",
              },
            ]),
      ],
    })

    const reply =
      completion.choices[0]?.message?.content ??
      "Neural Vault had trouble forming a reply."

    return NextResponse.json({ reply })
  } catch (err) {
    console.error("Chat error:", err)
    return NextResponse.json(
      { error: "Error talking to OpenAI" },
      { status: 500 }
    )
  }
}

function rankNotesByQuery(query: string, notes: Note[]): Note[] {
  const normalizedQuery = query.toLowerCase()
  const terms = Array.from(
    new Set(normalizedQuery.split(/\W+/).filter(Boolean))
  )

  const scored = notes
    .map((note) => {
      const haystack = `${note.title}\n${note.content}`.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (!term) continue
        const hits = haystack.split(term).length - 1
        if (hits > 0) {
          // Cap per-term contribution to avoid long repeated words dominating
          score += Math.min(hits, 5)
        }
      }
      return { note, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map((s) => s.note)
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + "…"
}
