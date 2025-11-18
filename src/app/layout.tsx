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
      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <div className="flex min-h-screen">
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
