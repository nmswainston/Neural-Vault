"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/lib/theme"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render consistently on server and client to avoid hydration mismatch
  // Default to dark mode appearance until mounted
  const displayTheme = mounted ? theme : "dark"

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-md border border-slate-300 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs text-slate-900 transition-all duration-150 hover:bg-slate-50 hover:translate-y-[0.5px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-700/70 dark:shadow-[0_0_12px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_16px_rgba(59,130,246,0.3)]"
      aria-label={`Switch to ${displayTheme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${displayTheme === "dark" ? "light" : "dark"} mode`}
    >
      {displayTheme === "dark" ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
          Light
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          Dark
        </>
      )}
    </button>
  )
}

