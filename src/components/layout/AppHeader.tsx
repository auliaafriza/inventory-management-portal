"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BoxIcon, PlusIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils/cn"

const NAV_ITEMS = [
  {
    href: "/products",
    label: "Products",
    match: (path: string) => path === "/products" || /^\/products\/\d+/.test(path),
  },
  { href: "/products/new", label: "New product", match: (path: string) => path.startsWith("/products/new") },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/products" className="flex items-center gap-2.5 text-slate-900">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <BoxIcon />
          </span>
          <span className="text-base font-semibold tracking-tight">Stockroom</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {item.href.endsWith("/new") ? <PlusIcon className="size-4" /> : null}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
