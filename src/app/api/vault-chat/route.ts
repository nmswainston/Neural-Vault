import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getAllNotes, type Note } from "@/lib/notes"

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function scoreNote(note: Note, question: string): number {
  const qTokens = new Set(tokenize(question))
  const titleTokens = new Set(tokenize(note.title))
  const slugTokens = new Set(tokenize(note.slug))
  const contentTokens = new Set(tokenize(note.content.slice(0, 4000)))

  let score = 0

  // Title match: heavier weight
  for (const t of qTokens) {
    if (titleTokens.has(t)) score += 3
  }

  // Slug overlap: medium weight
  for (const t of qTokens) {
    if (slugTokens.has(t)) score += 2
  }

  // Keyword overlap in content: lighter weight
  let overlapCount = 0
  for (const t of qTokens) {
    if (contentTokens.has(t)) overlapCount += 1
  }
  score += Math.min(overlapCount, 25) * 1

  return score
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json()
    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or misconfigured" },
        { status: 500 },
      )
    }

    const allNotes = await getAllNotes()

    // Score and pick top 5
    const ranked = allNotes
      .map((n) => ({ note: n, score: scoreNote(n, question) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => r.note)

    const sources = ranked.map((n) => n.slug)

    const notesContext = ranked
      .map((n) => {
        const snippet = n.content.slice(0, 1500)
        return `[${n.slug}]:
Title: ${n.title}
Content:
"""
${snippet}
"""`
      })
      .join("\n\n")

    const openai = new OpenAI({ apiKey })

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are Neural Vault. Answer the user’s question based only on the provided notes. If a detail is not found in the notes, say you cannot find it. Cite the notes you used.",
      },
      {
        role: "system",
        content:
          "Here are the top relevant notes:\n\n" + (notesContext || "(No relevant notes found)"),
      },
      {
        role: "user",
        content: question,
      },
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    })

    const answer =
      completion.choices[0]?.message?.content ??
      "I couldn't generate an answer at this time."

    return NextResponse.json({
      answer,
      sources,
    })
  } catch (err) {
    console.error("Vault chat error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


