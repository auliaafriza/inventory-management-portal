const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const numberFormatter = new Intl.NumberFormat("en-US")
const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
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

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ""

  const minutes = Math.floor(Math.max(0, now.getTime() - time) / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatWholeCurrency(value: number): string {
  return wholeCurrencyFormatter.format(value)
}
