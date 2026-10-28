import { Skeleton } from "@/components/ui/Skeleton"
import { PAGE_SIZE } from "../constants"
import type { ProductView } from "../types"

export function ProductsSkeleton({ view }: Readonly<{ view: ProductView }>) {
  const placeholders = Array.from({ length: PAGE_SIZE }, (_, index) => index)

  if (view === "cards") {
    return (
      <ul
        aria-busy="true"
        aria-label="Loading products"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      >
        {placeholders.map((key) => (
          <li key={key} className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
            <Skeleton className="h-44 rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div
      aria-busy="true"
      aria-label="Loading products"
      className="divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200"
    >
      {placeholders.map((key) => (
        <div key={key} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="size-11 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="hidden h-5 w-20 sm:block" />
        </div>
      ))}
    </div>
  )
}
