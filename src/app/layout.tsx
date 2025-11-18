import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme"
import Sidebar from "./components/Sidebar"
import ChatPanel from "./components/ChatPanel"
import GlobalVaultSearch from "./components/GlobalVaultSearch"

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
      <body className={`${inter.className} min-h-screen bg-white text-slate-900 dark:bg-linear-to-b dark:from-slate-950 dark:via-slate-950 dark:to-black dark:text-slate-100`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  const stored = localStorage.getItem('theme');
                  if (stored === 'light' || stored === 'dark') {
                    return stored;
                  }
                  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    return 'light';
                  }
                  return 'dark';
                }
                const theme = getInitialTheme();
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          {/* Vignette overlay for dark mode */}
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#0f172a_0,transparent_55%)] opacity-0 dark:opacity-60 transition-opacity" />
          
          <div className="flex h-screen relative overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden min-w-0 relative z-10">{children}</main>
            <ChatPanel />
          </div>
          <GlobalVaultSearch />
        </ThemeProvider>
      </body>
    </html>
  )
}
