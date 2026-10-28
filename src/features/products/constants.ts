import type { ProductFilters, SortKey } from "./types"

export const PAGE_SIZE = 10
export const SEARCH_DEBOUNCE_MS = 300
export const MAX_VARIATIONS = 20

export const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  category: "",
  sort: "",
  page: 1,
}

interface SortOption {
  value: SortKey
  label: string
  sortBy?: string
  order?: "asc" | "desc"
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: low to high", sortBy: "price", order: "asc" },
  { value: "price_desc", label: "Price: high to low", sortBy: "price", order: "desc" },
  { value: "title_asc", label: "Title: A to Z", sortBy: "title", order: "asc" },
  { value: "title_desc", label: "Title: Z to A", sortBy: "title", order: "desc" },
  { value: "rating_desc", label: "Top rated", sortBy: "rating", order: "desc" },
  { value: "stock_asc", label: "Lowest stock", sortBy: "stock", order: "asc" },
]

export const SORT_KEYS: SortKey[] = SORT_OPTIONS.map((option) => option.value)

export const WIZARD_STEPS = [
  { title: "Basic info", description: "Name and category" },
  { title: "Pricing & stock", description: "Price and SKU variations" },
  { title: "Shipping", description: "Dimensions and handling" },
  { title: "Review", description: "Confirm and submit" },
] as const

export const REVIEW_STEP_INDEX = WIZARD_STEPS.length - 1
export const DRAFT_STORAGE_KEY = "inventory-portal:product-draft"


export const StatusOperations = {
   pending: "pending",
   failed: "failed"
}