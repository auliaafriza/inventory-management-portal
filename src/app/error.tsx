"use client"

import { Button } from "@/components/ui/Button"

export default function Error({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="text-slate-500">An unexpected error occurred while rendering this page.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
