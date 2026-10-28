export type PageItem = number | "ellipsis-start" | "ellipsis-end"

export function getTotalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}

export function getPageItems(current: number, totalPages: number, siblings = 1): PageItem[] {
  const maxVisible = siblings * 2 + 5
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const left = Math.max(current - siblings, 2)
  const right = Math.min(current + siblings, totalPages - 1)
  const items: PageItem[] = [1]

  if (left > 2) items.push("ellipsis-start")
  for (let page = left; page <= right; page += 1) items.push(page)
  if (right < totalPages - 1) items.push("ellipsis-end")
  items.push(totalPages)

  return items
}
