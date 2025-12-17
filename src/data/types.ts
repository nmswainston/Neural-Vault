export type Note = {
  title: string
  slug: string
  tags: string[]
  createdAt: string | null
  updatedAt: string | null
  content: string
}

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
  error?: boolean
}


