import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format date range text for notes
 */
export function formatDateRange(
  updatedAt: Date | string | null | undefined,
  createdAt: Date | string | null | undefined
): string {
  const updated = updatedAt ? formatDate(updatedAt) : null
  const created = createdAt ? formatDate(createdAt) : null

  if (updated && created) {
    return `Updated ${updated} • Created ${created}`
  } else if (updated) {
    return `Updated ${updated}`
  } else if (created) {
    return `Created ${created}`
  }
  return ""
}

/**
 * Parse comma-separated tags string into array
 */
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

