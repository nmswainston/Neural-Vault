import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme"
import Sidebar from "./components/Sidebar"
import ChatPanel from "./components/ChatPanel"
import GlobalVaultSearch from "./components/GlobalVaultSearch"

export const metadata: Metadata = {
  title: "Neural Vault",
  description: "Your private AI-powered knowledge vault",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 dark:bg-linear-to-b dark:from-slate-950 dark:via-slate-950 dark:to-black dark:text-slate-100">
        <ThemeProvider>
          {/* Vignette overlay for dark mode */}
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#0f172a_0,_transparent_55%)] opacity-0 dark:opacity-60 transition-opacity" />
          
          <div className="flex min-h-screen relative">
            <Sidebar />
            <main className="flex-1 overflow-hidden">{children}</main>
            <ChatPanel />
          </div>
          <GlobalVaultSearch />
        </ThemeProvider>
      </body>
    </html>
  )
}
