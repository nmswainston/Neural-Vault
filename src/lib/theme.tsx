"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"

type Theme = "light" | "dark"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem("theme") as Theme | null
  if (stored === "light" || stored === "dark") {
    return stored
  }
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light"
  }
  return "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage if available (client-side), otherwise default to "dark" for SSR
    if (typeof window !== "undefined") {
      return getInitialTheme()
    }
    return "dark"
  })
  const mountedRef = useRef(false)

  // Initialize DOM on mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      // Sync initial theme to DOM on mount
      const root = document.documentElement
      const initialTheme = getInitialTheme()
      if (initialTheme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }, [])

  // Handle theme changes (user toggles)
  useEffect(() => {
    if (!mountedRef.current) return

    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

