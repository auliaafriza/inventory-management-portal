import { describe, expect, it } from "vitest"
import reducer, {
  categoryChanged,
  filtersHydrated,
  filtersReset,
  initialFiltersState,
  pageChanged,
  searchChanged,
  selectProductFilters,
  sortChanged,
  viewChanged,
} from "./filtersSlice"

describe("filtersSlice", () => {
  it("starts with default filters and table view", () => {
    expect(reducer(undefined, { type: "init" })).toEqual({ search: "", category: "", sort: "", page: 1, view: "table" })
  })

  it("trims search input and resets to page 1", () => {
    const state = reducer({ ...initialFiltersState, page: 4 }, searchChanged("  phone "))
    expect(state.search).toBe("phone")
    expect(state.page).toBe(1)
  })

  it("resets the page when category or sort changes", () => {
    const base = { ...initialFiltersState, page: 3 }
    expect(reducer(base, categoryChanged("beauty"))).toMatchObject({ category: "beauty", page: 1 })
    expect(reducer(base, sortChanged("price_desc"))).toMatchObject({ sort: "price_desc", page: 1 })
  })

  it("clamps invalid page numbers", () => {
    expect(reducer(initialFiltersState, pageChanged(5)).page).toBe(5)
    expect(reducer(initialFiltersState, pageChanged(0)).page).toBe(1)
    expect(reducer(initialFiltersState, pageChanged(-3)).page).toBe(1)
    expect(reducer(initialFiltersState, pageChanged(Number.NaN)).page).toBe(1)
    expect(reducer(initialFiltersState, pageChanged(2.9)).page).toBe(2)
  })

  it("switches the view without touching filters", () => {
    const state = reducer({ ...initialFiltersState, search: "a" }, viewChanged("cards"))
    expect(state).toMatchObject({ view: "cards", search: "a" })
  })

  it("hydrates from URL values and keeps the view", () => {
    const state = reducer(
      { ...initialFiltersState, view: "cards" },
      filtersHydrated({ search: "phone", category: "smartphones", sort: "price_desc", page: 2 }),
    )
    expect(state).toEqual({ search: "phone", category: "smartphones", sort: "price_desc", page: 2, view: "cards" })
  })

  it("resets filters but keeps the view", () => {
    const state = reducer({ search: "x", category: "y", sort: "price_asc", page: 3, view: "cards" }, filtersReset())
    expect(state).toEqual({ search: "", category: "", sort: "", page: 1, view: "cards" })
  })

  it("selects a memoized filters object without the view", () => {
    const root = { filters: { ...initialFiltersState, view: "cards" as const } }
    const first = selectProductFilters(root)
    expect(first).toEqual({ search: "", category: "", sort: "", page: 1 })
    expect(selectProductFilters({ filters: { ...root.filters, view: "table" } })).toBe(first)
  })
})
