import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getNoteBySlug } from "@/data/notes"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages, noteSlug } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing messages array" },
        { status: 400 },
      )
    }

    if (!noteSlug || typeof noteSlug !== "string") {
      return NextResponse.json(
        { error: "Missing noteSlug" },
        { status: 400 },
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY")
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 },
      )
    }
    const openai = new OpenAI({ apiKey })
    const note = getNoteBySlug(noteSlug)
    const noteContent = note?.content ?? ""

    const limitedMessages: ChatMessage[] = messages.slice(-10)

    const openAiMessages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are Neural Vault, an AI assistant that answers based primarily on the user's note content and the ongoing conversation. Be concise and practical.",
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
      { error: "Error talking to OpenAI" },
      { status: 500 },
    )
  }
}
