"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils/cn"
import { AlertIcon, CheckIcon, CloseIcon } from "./icons"

export type ToastTone = "success" | "error" | "info"

export interface ToastItem {
  id: string
  kind: ToastTone
  message: string
  actionLabel?: string
}

interface ToasterProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
  onAction: (id: string) => void
}

const AUTO_DISMISS_MS = 6000
const AUTO_DISMISS_WITH_ACTION_MS = 10000

const tones: Record<ToastTone, string> = {
  success: "text-emerald-600",
  error: "text-red-600",
  info: "text-brand-600",
}

function ToastCard({ toast, onDismiss, onAction }: Readonly<{ toast: ToastItem } & Omit<ToasterProps, "toasts">>) {
  useEffect(() => {
    const timer = setTimeout(
      () => onDismiss(toast.id),
      toast.actionLabel ? AUTO_DISMISS_WITH_ACTION_MS : AUTO_DISMISS_MS,
    )
    return () => clearTimeout(timer)
  }, [toast.id, toast.actionLabel, onDismiss])

  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200"
    >
      <span className={cn("mt-0.5 shrink-0", tones[toast.kind])}>
        {toast.kind === "error" ? <AlertIcon /> : <CheckIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-800">{toast.message}</p>
        {toast.actionLabel ? (
          <button
            type="button"
            onClick={() => onAction(toast.id)}
            className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {toast.actionLabel}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-slate-400 hover:text-slate-600"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  )
}

export function Toaster({ toasts, onDismiss, onAction }: Readonly<ToasterProps>) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-3 p-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} onAction={onAction} />
      ))}
    </div>
  )
}
