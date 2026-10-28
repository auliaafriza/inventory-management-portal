"use client"

import type { ReactNode } from "react"
import { useDialogBehavior } from "@/hooks/useDialogBehavior"
import { cn } from "@/lib/utils/cn"
import { CloseIcon } from "./icons"
import { iconButtonClass } from "./Button"

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  dismissible?: boolean
  children: ReactNode
  className?: string
}

export function Modal({
  open,
  title,
  description,
  onClose,
  dismissible = true,
  children,
  className,
}: Readonly<ModalProps>) {
  const panelRef = useDialogBehavior<HTMLDivElement>(open, dismissible ? onClose : () => undefined)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/50"
        onClick={dismissible ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative max-h-[90vh] w-full max-w-lg animate-pop-in overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl",
          "focus:outline-none sm:rounded-2xl",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {dismissible ? (
            <button type="button" onClick={onClose} className={iconButtonClass} aria-label="Close dialog">
              <CloseIcon />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}
