import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "./components/Sidebar"
import ChatPanel from "./components/ChatPanel"
import GlobalVaultSearch from "../components/GlobalVaultSearch"

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
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-hidden">{children}</main>
          <ChatPanel />
        </div>
        <GlobalVaultSearch />
      </body>
    </html>
  )
}
