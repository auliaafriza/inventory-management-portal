"use client"

import { useDialogBehavior } from "@/hooks/useDialogBehavior"
import { cn } from "@/lib/utils/cn"
import { SidebarContent } from "./SidebarContent"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: Readonly<MobileSidebarProps>) {
  const panelRef = useDialogBehavior<HTMLDivElement>(open, onClose)

  return (
    <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={!open}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl transition-transform duration-300 ease-out focus:outline-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  )
}
