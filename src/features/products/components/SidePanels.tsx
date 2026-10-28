import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils/cn"
import { formatRelativeTime } from "@/lib/utils/format"
import type { Activity, ActivityTone } from "../store/activitySlice"
import type { InventoryItem } from "../utils/inventoryStats"

function Panel({
  title,
  action,
  children,
}: Readonly<{ title: string; action?: React.ReactNode; children: React.ReactNode }>) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function LowStockPanel({ items, loading }: Readonly<{ items: InventoryItem[]; loading: boolean }>) {
  return (
    <Panel
      title="Low Stock Products"
      action={
        <Link
          href="/products?sort=stock_asc"
          className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          View all
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">Every product is well stocked.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <Image
                src={item.thumbnail}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-lg bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.id}`}
                  className="block truncate text-sm font-medium text-slate-900 hover:text-brand-700"
                >
                  {item.title}
                </Link>
                <p className="truncate text-xs text-slate-500">SKU: {item.sku}</p>
              </div>
              <span
                className={cn("shrink-0 text-sm font-medium", item.stock === 0 ? "text-rose-600" : "text-amber-600")}
              >
                {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

const DOT: Record<ActivityTone, string> = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  info: "bg-brand-500",
}

export function ActivityPanel({ items }: Readonly<{ items: Activity[] }>) {
  return (
    <Panel title="Recent Activities">
      {items.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">Nothing yet. Changes you make will appear here.</p>
      ) : (
        <ul className="space-y-4">
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT[item.tone])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="truncate text-xs text-slate-500">{item.detail}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatRelativeTime(item.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
