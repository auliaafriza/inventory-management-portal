import type { ReactNode } from "react"
import { CartIcon, LayersIcon, BoxIcon, ReceiptIcon } from "@/components/ui/icons"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils/cn"
import { formatNumber, formatWholeCurrency } from "@/lib/utils/format"
import type { InventoryStats } from "../utils/inventoryStats"

type Tone = "blue" | "green" | "amber" | "rose"

const TONES: Record<Tone, { card: string; icon: string }> = {
  blue: { card: "bg-blue-50 ring-blue-100", icon: "bg-blue-100 text-blue-600" },
  green: { card: "bg-emerald-50 ring-emerald-100", icon: "bg-emerald-100 text-emerald-600" },
  amber: { card: "bg-amber-50 ring-amber-100", icon: "bg-amber-100 text-amber-600" },
  rose: { card: "bg-rose-50 ring-rose-100", icon: "bg-rose-100 text-rose-600" },
}

interface StatCardProps {
  label: string
  value: string
  hint: string
  tone: Tone
  icon: ReactNode
  loading: boolean
}

function StatCard({ label, value, hint, tone, icon, loading }: Readonly<StatCardProps>) {
  const styles = TONES[tone]

  return (
    <div className={cn("flex items-center gap-4 rounded-xl p-4 ring-1 sm:p-5", styles.card)}>
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full sm:size-14 [&_svg]:size-6 sm:[&_svg]:size-7",
          styles.icon,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-600">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-24 bg-white/70" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        )}
        <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>
      </div>
    </div>
  )
}

export function StatCards({ stats, loading }: Readonly<{ stats: InventoryStats; loading: boolean }>) {
  return (
    <div aria-label="Inventory summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Products"
        value={formatNumber(stats.totalProducts)}
        hint={`Across ${stats.categories.length} categories`}
        tone="blue"
        icon={<BoxIcon />}
        loading={loading}
      />
      <StatCard
        label="Total Stock"
        value={formatNumber(stats.totalStock)}
        hint="Units on hand"
        tone="green"
        icon={<LayersIcon />}
        loading={loading}
      />
      <StatCard
        label="Low Stock Items"
        value={formatNumber(stats.lowStock)}
        hint={`${formatNumber(stats.outOfStock)} out of stock`}
        tone="amber"
        icon={<CartIcon />}
        loading={loading}
      />
      <StatCard
        label="Total Value"
        value={formatWholeCurrency(stats.totalValue)}
        hint="Stock at list price"
        tone="rose"
        icon={<ReceiptIcon />}
        loading={loading}
      />
    </div>
  )
}
