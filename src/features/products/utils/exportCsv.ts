import type { Product } from "../types"

const HEADERS = ["ID", "Title", "Brand", "Category", "SKU", "Price", "Stock", "Rating"]

function escapeCell(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function buildProductsCsv(products: Product[]): string {
  const rows = products.map((product) =>
    [
      product.id,
      product.title,
      product.brand ?? "",
      product.category,
      product.sku,
      product.price,
      product.stock,
      product.rating,
    ]
      .map(escapeCell)
      .join(","),
  )
  return [HEADERS.join(","), ...rows].join("\n")
}

export function downloadCsv(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
