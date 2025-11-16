import { getAllNotes } from "@/lib/notes"
import SidebarClient from "./SidebarClient"

export default async function Sidebar() {
  const notes = await getAllNotes()

  return <SidebarClient notes={notes} />
}
