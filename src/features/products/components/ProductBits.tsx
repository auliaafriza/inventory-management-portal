import { formatCurrency, getDiscountedPrice, getStockStatus } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"
import { iconButtonClass } from "@/components/ui/Button"
import { PencilIcon, TrashIcon } from "@/components/ui/icons"
import type { Product } from "../types"

export function StockBadge({ stock }: Readonly<{ stock: number }>) {
  const status = getStockStatus(stock)
  const styles = {
    out: "bg-red-50 text-red-700 ring-red-600/20",
    low: "bg-amber-50 text-amber-700 ring-amber-600/20",
    in: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  }
  const labels = { out: "Out of stock", low: `Low · ${stock}`, in: `${stock} in stock` }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  )
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
