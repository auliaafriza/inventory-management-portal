"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon } from "@/components/ui/icons"
import { formatRelativeTime } from "@/lib/utils/format"
import { useAppSelector } from "@/store/hooks"
import { iconButtonClass } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"

const USER = { name: "Aulia Afriza", role: "Admin", initials: "AA" }

function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activities = useAppSelector((state) => state.activity.items)

  useEffect(() => {
    if (!open) return

    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handlePointer)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handlePointer)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  const hasFailures = activities.some((activity) => activity.tone === "error")

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(iconButtonClass, "size-10")}
      >
        <BellIcon />
        {hasFailures ? (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-40 w-80 animate-pop-in rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          {activities.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">You&apos;re all caught up.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <li key={activity.id} className="text-sm">
                  <p className="font-medium text-slate-800">{activity.title}</p>
                  <p className="truncate text-slate-500">{activity.detail}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(activity.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function TopBar({ onOpenMenu }: Readonly<{ onOpenMenu: () => void }>) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const term = query.trim()
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : "/products")
    setQuery("")
    inputRef.current?.blur()
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className={cn(iconButtonClass, "size-10 lg:hidden")}
      >
        <MenuIcon />
      </button>

      <form onSubmit={handleSubmit} role="search" className="relative max-w-xl flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products, orders, or anything…"
          aria-label="Global search"
          className="block h-10 w-full rounded-lg border-0 bg-slate-100 pl-10 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-600 [&::-webkit-search-cancel-button]:appearance-none"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded bg-white px-1.5 py-0.5 text-xs text-slate-400 ring-1 ring-slate-200 sm:block">
          ⌘ K
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <NotificationsMenu />
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
          >
            {USER.initials}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900">{USER.name}</p>
            <p className="text-xs text-slate-500">{USER.role}</p>
          </div>
          <ChevronDownIcon className="hidden size-4 text-slate-400 sm:block" />
        </div>
      </div>
    </header>
  )
}
