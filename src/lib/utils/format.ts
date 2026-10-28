const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" })

export type StockStatus = "out" | "low" | "in"

export const LOW_STOCK_THRESHOLD = 10

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date)
}

export function getDiscountedPrice(price: number, discountPercentage: number): number {
  const discounted = price * (1 - discountPercentage / 100)
  return Math.round(discounted * 100) / 100
}

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out"
  if (stock < LOW_STOCK_THRESHOLD) return "low"
  return "in"
}
