import { LOW_STOCK_THRESHOLD } from "@/lib/utils/format"
import type { OptimisticState } from "../store/optimisticSlice"

export interface InventoryItem {
  id: number
  title: string
  sku: string
  category: string
  price: number
  stock: number
  discountPercentage: number
  thumbnail: string
}

export interface CategoryStock {
  category: string
  products: number
  units: number
}

export interface InventoryStats {
  totalProducts: number
  totalStock: number
  inStock: number
  lowStock: number
  outOfStock: number
  totalValue: number
  categories: CategoryStock[]
}

export function applyInventoryOverrides(
  items: InventoryItem[],
  overrides: Pick<OptimisticState, "deletedIds" | "edits">,
): InventoryItem[] {
  const deleted = new Set(overrides.deletedIds)
  return items
    .filter((item) => !deleted.has(item.id))
    .map((item) => {
      const edit = overrides.edits[item.id]
      return edit ? { ...item, ...edit } : item
    })
}

export function computeInventoryStats(items: InventoryItem[]): InventoryStats {
  const categories = new Map<string, CategoryStock>()
  const stats: InventoryStats = {
    totalProducts: items.length,
    totalStock: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    categories: [],
  }

  items.forEach((item) => {
    stats.totalStock += item.stock
    stats.totalValue += item.price * item.stock

    if (item.stock <= 0) stats.outOfStock += 1
    else if (item.stock < LOW_STOCK_THRESHOLD) stats.lowStock += 1
    else stats.inStock += 1

    const entry = categories.get(item.category) ?? { category: item.category, products: 0, units: 0 }
    entry.products += 1
    entry.units += Math.max(0, item.stock)
    categories.set(item.category, entry)
  })

  stats.categories = [...categories.values()].sort((a, b) => b.units - a.units)
  return stats
}

export function getLowStockItems(items: InventoryItem[], limit = 5): InventoryItem[] {
  return items
    .filter((item) => item.stock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ")
}
