import { DEFAULT_FILTERS, SORT_KEYS } from "../constants"
import type { ProductFilters, SortKey } from "../types"

interface ParamsReader {
  get(name: string): string | null
}

function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as string[]).includes(value)
}

export function parseFilters(params: ParamsReader): ProductFilters {
  const sort = params.get("sort") ?? ""
  const page = Number.parseInt(params.get("page") ?? "", 10)

  return {
    search: (params.get("search") ?? "").trim(),
    category: params.get("category") ?? "",
    sort: isSortKey(sort) ? sort : DEFAULT_FILTERS.sort,
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_FILTERS.page,
  }
}

export function serializeFilters(filters: ProductFilters): string {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.category) params.set("category", filters.category)
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.page > 1) params.set("page", String(filters.page))
  return params.toString()
}

export function areFiltersEqual(a: ProductFilters, b: ProductFilters): boolean {
  return a.search === b.search && a.category === b.category && a.sort === b.sort && a.page === b.page
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return Boolean(filters.search || filters.category || filters.sort)
}
