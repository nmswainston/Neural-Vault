// scripts/import-commits.js

// Simple local git → Neural Vault importer

//

// Usage: node scripts/import-commits.js [days]

// Default: last 7 days of commits

import { execSync } from "child_process"
import fs from "fs"
import path from "path"

// How many days back to look by default
const DEFAULT_DAYS = 7

function runGitLog(days) {
  const since = `${days} days ago`
  // Use a machine readable format
  const format = "%H%x1f%an%x1f%ad%x1f%s%x1e" // \x1f = field sep, \x1e = record sep

  const cmd = `git log --since="${since}" --date=iso-strict --pretty=format:'${format}'`
  try {
    const output = execSync(cmd, { encoding: "utf8" })
    return output
  } catch (err) {
    console.error("Error running git log. Are you in a git repo?")
    console.error(err.message)
    process.exit(1)
  }
}

function parseGitLog(raw) {
  if (!raw.trim()) return []

  const records = raw.split("\x1e").filter(Boolean)
  const commits = records
    .map((rec) => {
      const parts = rec.split("\x1f")
      if (parts.length < 4) {
        // Skip malformed records
        return null
      }
      const [hash, author, date, subject] = parts
      if (!hash || !author || !date || !subject) {
        return null
      }
      return {
        hash: hash.trim().replace(/['"\n\r]/g, ""), // Remove quotes and newlines
        author: author.trim().replace(/['"\n\r]/g, ""),
        date: date.trim().replace(/['"\n\r]/g, ""), // full ISO date
        subject: subject.trim().replace(/['"\n\r]/g, ""),
      }
    })
    .filter(Boolean) // Remove null entries

  return commits
}

function groupCommitsByDate(commits) {
  const grouped = {}

  for (const c of commits) {
    // Date part YYYY-MM-DD from ISO string
    const day = c.date.split("T")[0]
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(c)
  }

  return grouped
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function buildMarkdownForDay(dateStr, commits) {
  // dateStr is YYYY-MM-DD
  const title = `Neural Vault commits – ${dateStr}`
  const slug = `neural-vault/commits-${dateStr}`
  const createdAt = `${dateStr}T00:00:00.000Z`
  const updatedAt = new Date().toISOString()

  const header = [
    "---",
    `title: "${title}"`,
    `slug: "${slug}"`,
    `tags: ["commits", "git", "neural-vault"]`,
    `createdAt: "${createdAt}"`,
    `updatedAt: "${updatedAt}"`,
    "---",
    "",
    "## Commits",
    "",
  ]

  const bodyLines = commits.map((c) => {
    return [
      `- \`${c.subject}\``,
      `  - Hash: \`${c.hash}\``,
      `  - Author: ${c.author}`,
      `  - Time: ${c.date}`,
      "",
    ].join("\n")
  })

  return header.join("\n") + bodyLines.join("\n")
}

function writeDailyNotes(groupedCommits) {
  const notesDir = path.join(process.cwd(), "content", "notes", "neural-vault")
  ensureDir(notesDir)

  const dates = Object.keys(groupedCommits).sort()

  if (dates.length === 0) {
    console.log("No commits found in the selected range.")
    return
  }

  for (const dateStr of dates) {
    const commits = groupedCommits[dateStr]
    const fileName = `commits-${dateStr}.mdx`
    const filePath = path.join(notesDir, fileName)

    const markdown = buildMarkdownForDay(dateStr, commits)

    fs.writeFileSync(filePath, markdown, "utf8")
    console.log(`Wrote ${commits.length} commit(s) to ${filePath}`)
  }
}

function main() {
  const daysArg = process.argv[2]
  const days = daysArg ? Number(daysArg) : DEFAULT_DAYS

  if (Number.isNaN(days) || days <= 0) {
    console.error("Please provide a valid positive number of days.")
    process.exit(1)
  }

  console.log(`Importing commits from the last ${days} day(s)...`)

  const raw = runGitLog(days)
  const commits = parseGitLog(raw)

  if (!commits.length) {
    console.log("No commits found in the specified range.")
    return
  }

  const grouped = groupCommitsByDate(commits)
  writeDailyNotes(grouped)

  console.log("Done. Commit notes are now available in Neural Vault.")
}

main()

