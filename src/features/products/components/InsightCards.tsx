import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils/cn"
import { formatNumber } from "@/lib/utils/format"
import { formatCategoryName, type InventoryStats } from "../utils/inventoryStats"

const MAX_CATEGORIES = 7

function Card({ title, children, className }: Readonly<{ title: string; children: ReactNode; className?: string }>) {
  return (
    <section className={cn("rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200", className)}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function CategoryStockCard({
  stats,
  loading,
  className,
}: Readonly<{ stats: InventoryStats; loading: boolean; className?: string }>) {
  const categories = stats.categories.slice(0, MAX_CATEGORIES)
  const max = Math.max(1, ...categories.map((item) => item.units))

  return (
    <Card title="Stock by Category" className={className}>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No stock data available.</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((item) => (
            <li key={item.category} className="grid grid-cols-[7.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm">
              <span className="truncate text-slate-600">{formatCategoryName(item.category)}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.max(2, (item.units / max) * 100)}%` }}
                />
              </span>
              <span className="text-right font-medium tabular-nums text-slate-900">{formatNumber(item.units)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

interface Segment {
  label: string
  value: number
  stroke: string
  dot: string
}

export function StockStatusCard({ stats, loading }: Readonly<{ stats: InventoryStats; loading: boolean }>) {
  const segments: Segment[] = [
    { label: "In Stock", value: stats.inStock, stroke: "stroke-emerald-500", dot: "bg-emerald-500" },
    { label: "Low Stock", value: stats.lowStock, stroke: "stroke-amber-400", dot: "bg-amber-400" },
    { label: "Out of Stock", value: stats.outOfStock, stroke: "stroke-rose-500", dot: "bg-rose-500" },
  ]
  const total = stats.totalProducts
  let offset = 0

  return (
    <Card title="Stock Status">
      {loading ? (
        <Skeleton className="mx-auto size-36 rounded-full" />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div
            role="img"
            aria-label={segments.map((segment) => `${segment.label}: ${segment.value}`).join(", ")}
            className="relative size-36 shrink-0"
          >
            <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4" className="stroke-slate-100" />
              {total > 0
                ? segments.map((segment) => {
                    const length = (segment.value / total) * 100
                    const circle = (
                      <circle
                        key={segment.label}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        strokeWidth="4"
                        pathLength={100}
                        strokeDasharray={`${length} ${100 - length}`}
                        strokeDashoffset={-offset}
                        className={segment.stroke}
                      />
                    )
                    offset += length
                    return segment.value > 0 ? circle : null
                  })
                : null}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-slate-900">{formatNumber(total)}</span>
              <span className="text-xs text-slate-500">Products</span>
            </div>
          </div>
          <ul className="min-w-[11rem] flex-1 space-y-3 text-sm">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full", segment.dot)} />
                <span className="flex-1 whitespace-nowrap text-slate-600">{segment.label}</span>
                <span className="font-medium tabular-nums text-slate-900">{formatNumber(segment.value)}</span>
                <span className="w-14 text-right tabular-nums text-slate-400">
                  ({total > 0 ? ((segment.value / total) * 100).toFixed(1) : "0.0"}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
