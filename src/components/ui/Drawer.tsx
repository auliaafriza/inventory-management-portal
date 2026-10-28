"use client"

import type { ReactNode } from "react"
import { useDialogBehavior } from "@/hooks/useDialogBehavior"
import { cn } from "@/lib/utils/cn"
import { iconButtonClass } from "./Button"
import { CloseIcon } from "./icons"

interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, title, onClose, children, footer }: Readonly<DrawerProps>) {
  const panelRef = useDialogBehavior<HTMLDivElement>(open, onClose)

  return (
    <div className={cn("fixed inset-0 z-40 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
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
        aria-label={title}
        aria-hidden={!open}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
          "focus:outline-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className={iconButtonClass} aria-label="Close filters">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
