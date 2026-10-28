import { getPageItems } from "@/lib/utils/pagination"
import { cn } from "@/lib/utils/cn"
import { ChevronLeftIcon, ChevronRightIcon } from "./icons"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const baseClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"

export function Pagination({ page, totalPages, onPageChange }: Readonly<PaginationProps>) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={cn(baseClass, "text-slate-600 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40")}
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      {getPageItems(page, totalPages).map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={cn(baseClass, item === page ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100")}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="px-1 text-slate-400" aria-hidden>
            …
          </span>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={cn(baseClass, "text-slate-600 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40")}
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </nav>
  )
}
