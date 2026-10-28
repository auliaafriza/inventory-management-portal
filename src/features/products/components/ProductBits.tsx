import { formatCurrency, getDiscountedPrice, getStockStatus } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import { iconButtonClass } from "@/components/ui/Button"
import { PencilIcon, TrashIcon } from "@/components/ui/icons"
import type { Product } from "../types"

const STATUS_STYLES = {
  out: { label: "Out of Stock", className: "bg-rose-50 text-rose-700" },
  low: { label: "Low Stock", className: "bg-amber-50 text-amber-700" },
  in: { label: "In Stock", className: "bg-emerald-50 text-emerald-700" },
}

export function StockBadge({ stock }: Readonly<{ stock: number }>) {
  const { label, className } = STATUS_STYLES[getStockStatus(stock)]

  return (
    <span
      className={cn("inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium", className)}
    >
      {label}
    </span>
  )
}

export function StockCount({ stock }: Readonly<{ stock: number }>) {
  const status = getStockStatus(stock)
  const color = { out: "text-rose-600", low: "text-amber-600", in: "text-emerald-600" }[status]

  return <span className={cn("font-medium tabular-nums", color)}>{stock}</span>
}

export function PriceTag({ price, discountPercentage }: Readonly<{ price: number; discountPercentage: number }>) {
  const hasDiscount = discountPercentage > 0

  return (
    <div className="leading-tight">
      <span className="font-semibold text-slate-900">
        {formatCurrency(hasDiscount ? getDiscountedPrice(price, discountPercentage) : price)}
      </span>
      {hasDiscount ? <span className="ml-1.5 text-xs text-slate-400 line-through">{formatCurrency(price)}</span> : null}
    </div>
  )
}

interface ProductActionsProps {
  product: Product
  disabled?: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductActions({ product, disabled, onEdit, onDelete }: Readonly<ProductActionsProps>) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={iconButtonClass}
        disabled={disabled}
        onClick={() => onEdit(product)}
        aria-label={`Edit ${product.title}`}
      >
        <PencilIcon className="size-4" />
      </button>
      <button
        type="button"
        className={cn(iconButtonClass, "hover:bg-red-50 hover:text-red-600")}
        disabled={disabled}
        onClick={() => onDelete(product)}
        aria-label={`Delete ${product.title}`}
      >
        <TrashIcon className="size-4" />
      </button>
    </div>
  )
}
