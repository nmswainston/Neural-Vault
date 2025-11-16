import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getNoteBySlug } from "@/lib/notes"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages, noteSlug } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0 || !noteSlug) {
      return NextResponse.json(
        { error: "Missing messages array or noteSlug" },
        { status: 400 },
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or misconfigured" },
        { status: 500 },
      )
    }
    const openai = new OpenAI({ apiKey })
    const note = await getNoteBySlug(noteSlug)
    const noteContent = note?.content ?? ""

    const limitedMessages: ChatMessage[] = messages.slice(-10)

    const openAiMessages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are Neural Vault, an AI assistant that answers based on the current note content and the ongoing conversation. Be concise and practical.",
      },
    ]

    if (noteContent) {
      openAiMessages.push({
        role: "system",
        content:
          "Here is the content of the current note. Use this as your main source of truth when answering:\n\n" +
          noteContent,
      })
    }

    for (const m of limitedMessages) {
      openAiMessages.push({
        role: m.role,
        content: m.content,
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAiMessages,
    })

    const reply =
      completion.choices[0]?.message?.content ??
      "Neural Vault had trouble forming a reply."

    return NextResponse.json({ reply })
  } catch (err) {
    console.error("Chat error:", err)
    return NextResponse.json(
      { error: "Error talking to Neural Vault API" },
      { status: 500 },
    )
  }
}
