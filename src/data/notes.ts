export type Note = {
  id: string
  title: string
  slug: string
  content: string
}

export const notes: Note[] = [
  {
    id: "1",
    title: "AmpMatch – Initial Ideas",
    slug: "ampmatch-initial-ideas",
    content: `
# AmpMatch – Initial Ideas

Early thoughts for the AmpMatch app:

- Metric units only
- Support RC crawlers first, EDF later
- Telemetry support for all motor / ESC / battery combos
- Keep notifications minimal and meaningful
`,
  },
  {
    id: "2",
    title: "Dwellpath – Brand Notes",
    slug: "dwellpath-brand-notes",
    content: `
# Dwellpath – Brand Notes

Dark mode palette:

- Money green: \`#0C3D31\`
- Emerald accent: \`#17B890\`
- Cream text: \`#F5F3E7\`

Light mode uses a navy-based palette.

Internal link to [AmpMatch ideas](/notes/ampmatch-initial-ideas).
`,
  },
  {
    id: "3",
    title: "Flight Training – First Steps",
    slug: "flight-training-first-steps",
    content: `
# Flight Training – First Steps

- Consistent sim time (X-Plane / VR)
- Review patterns, checklists, and radio calls
- Log key lessons after every session
- Consider Neural Vault as a flight study notebook
`,
  },
]

export function getAllNotes(): Note[] {
  return notes
}

export function getNoteBySlug(slug: string): Note | undefined {
  return notes.find((note) => note.slug === slug)
}
