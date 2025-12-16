import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme"
import { ThemeScript } from "@/components/ThemeScript"
import Sidebar from "@/components/layout/Sidebar"
import ChatPanel from "@/components/layout/ChatPanel"
import Footer from "@/components/layout/Footer"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

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
      <body className={`${inter.className} min-h-screen bg-background text-slate-900 dark:bg-linear-to-b dark:from-slate-950 dark:via-slate-950 dark:to-black dark:text-slate-100`}>
        <ThemeScript />
        <ThemeProvider>
          {/* Vignette overlay for dark mode */}
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,var(--color-slate-900)_0,transparent_55%)] opacity-0 dark:opacity-60 transition-opacity" />
          
          <div className="flex h-screen relative overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
              <div className="flex-1 overflow-y-auto flex flex-col min-h-full">
                <div className="flex-1">{children}</div>
                <Footer />
              </div>
            </main>
            <ChatPanel />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
