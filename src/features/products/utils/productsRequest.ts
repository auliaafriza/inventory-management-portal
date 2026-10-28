import { PAGE_SIZE, SORT_OPTIONS } from "../constants"
import type { Product, ProductFilters, ProductsResponse } from "../types"

export interface ProductsRequest {
  path: string
  clientSearch: string | null
}

function buildQuery(entries: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value))
  })
  return params.toString()
}

export function resolveProductsRequest(filters: ProductFilters, pageSize: number = PAGE_SIZE): ProductsRequest {
  const sortOption = SORT_OPTIONS.find((option) => option.value === filters.sort)
  const sorting = { sortBy: sortOption?.sortBy, order: sortOption?.order }
  const skip = (filters.page - 1) * pageSize

  if (filters.category && filters.search) {
    const query = buildQuery({ limit: 0, ...sorting })
    return { path: `/products/category/${encodeURIComponent(filters.category)}?${query}`, clientSearch: filters.search }
  }

  if (filters.category) {
    const query = buildQuery({ limit: pageSize, skip, ...sorting })
    return { path: `/products/category/${encodeURIComponent(filters.category)}?${query}`, clientSearch: null }
  }

  if (filters.search) {
    const query = buildQuery({ q: filters.search, limit: pageSize, skip, ...sorting })
    return { path: `/products/search?${query}`, clientSearch: null }
  }

  const query = buildQuery({ limit: pageSize, skip, ...sorting })
  return { path: `/products?${query}`, clientSearch: null }
}

function matchesSearch(product: Product, term: string): boolean {
  const haystack = [product.title, product.brand ?? "", product.description, product.sku, ...product.tags]
  return haystack.some((value) => value.toLowerCase().includes(term))
}

export function paginateLocally(
  response: ProductsResponse,
  search: string,
  page: number,
  pageSize: number = PAGE_SIZE,
): ProductsResponse {
  const term = search.trim().toLowerCase()
  const matches = response.products.filter((product) => matchesSearch(product, term))
  const skip = (page - 1) * pageSize

  return {
    products: matches.slice(skip, skip + pageSize),
    total: matches.length,
    skip,
    limit: pageSize,
  }
}
