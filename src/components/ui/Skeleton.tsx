import { cn } from "@/lib/utils/cn"

export function Skeleton({ className }: Readonly<{ className?: string }>) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-slate-200", className)} />
}
