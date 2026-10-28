"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { InfoIcon } from "@/components/ui/icons"
import { LogoIcon } from "@/components/ui/Logo"
import { cn } from "@/lib/utils/cn"
import { NAV_ITEMS } from "./navigation"

export function SidebarContent({ onNavigate }: Readonly<{ onNavigate?: () => void }>) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-navy-900 px-3 py-5 text-slate-300">
      <Link href="/products" onClick={onNavigate} className="mb-8 flex items-center gap-3 px-3 text-white">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500 text-white">
          <LogoIcon className="size-6" />
        </span>
        <span className="text-lg font-semibold tracking-tight">IMS</span>
      </Link>

      <nav aria-label="Main" className="space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-navy-700 text-white" : "text-slate-300 hover:bg-navy-800 hover:text-white",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-navy-800 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <InfoIcon className="size-4" />
          Product & Inventory Management Portal
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          This web application is built using Next.js, React, Redux Toolkit, TypeScript, Tailwind CSS. It is a simple product and inventory management portal using dummyjson.
        </p>
      </div>
    </div>
  )
}
