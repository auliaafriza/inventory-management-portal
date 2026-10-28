"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { MobileSidebar } from "./MobileSidebar"
import { SidebarContent } from "./SidebarContent"
import { TopBar } from "./TopBar"

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent />
      </aside>
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-w-0 lg:pl-64">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
