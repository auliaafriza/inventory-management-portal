import { describe, expect, it } from "vitest"
import { areFiltersEqual, hasActiveFilters, parseFilters, serializeFilters } from "./filtersUrl"

describe("filtersUrl", () => {
  it("parses a full query string", () => {
    const params = new URLSearchParams("search=phone&category=smartphones&sort=price_desc&page=2")
    expect(parseFilters(params)).toEqual({ search: "phone", category: "smartphones", sort: "price_desc", page: 2 })
  })

  it("falls back to defaults for missing or invalid values", () => {
    expect(parseFilters(new URLSearchParams(""))).toEqual({ search: "", category: "", sort: "", page: 1 })
    expect(parseFilters(new URLSearchParams("sort=nope&page=-4"))).toMatchObject({ sort: "", page: 1 })
    expect(parseFilters(new URLSearchParams("page=abc"))).toMatchObject({ page: 1 })
    expect(parseFilters(new URLSearchParams("search=%20%20x%20"))).toMatchObject({ search: "x" })
  })

  it("serializes only non-default values in a stable order", () => {
    expect(serializeFilters({ search: "phone", category: "smartphones", sort: "price_desc", page: 2 })).toBe(
      "search=phone&category=smartphones&sort=price_desc&page=2",
    )
    expect(serializeFilters({ search: "", category: "", sort: "", page: 1 })).toBe("")
    expect(serializeFilters({ search: "a b&c", category: "", sort: "", page: 1 })).toBe("search=a+b%26c")
  })

  it("round-trips through the URL", () => {
    const filters = { search: "red lipstick", category: "beauty", sort: "title_asc" as const, page: 3 }
    expect(parseFilters(new URLSearchParams(serializeFilters(filters)))).toEqual(filters)
  })

  it("compares filters", () => {
    const base = { search: "a", category: "b", sort: "" as const, page: 1 }
    expect(areFiltersEqual(base, { ...base })).toBe(true)
    expect(areFiltersEqual(base, { ...base, page: 2 })).toBe(false)
    expect(areFiltersEqual(base, { ...base, search: "z" })).toBe(false)
  })

  it("detects active filters", () => {
    expect(hasActiveFilters({ search: "", category: "", sort: "", page: 4 })).toBe(false)
    expect(hasActiveFilters({ search: "", category: "x", sort: "", page: 1 })).toBe(true)
    expect(hasActiveFilters({ search: "", category: "", sort: "price_asc", page: 1 })).toBe(true)
  })
})
