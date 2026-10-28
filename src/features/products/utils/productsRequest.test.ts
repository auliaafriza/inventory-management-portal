import { describe, expect, it } from "vitest"
import { makeProduct } from "@/test/fixtures"
import { paginateLocally, resolveProductsRequest } from "./productsRequest"

const base = { search: "", category: "", sort: "" as const, page: 1 }

describe("resolveProductsRequest", () => {
  it("builds the plain list request with paging", () => {
    expect(resolveProductsRequest(base)).toEqual({ path: "/products?limit=10&skip=0", clientSearch: null })
    expect(resolveProductsRequest({ ...base, page: 3 }).path).toBe("/products?limit=10&skip=20")
  })

  it("adds sorting", () => {
    expect(resolveProductsRequest({ ...base, sort: "price_desc" }).path).toBe(
      "/products?limit=10&skip=0&sortBy=price&order=desc",
    )
  })

  it("uses the search endpoint", () => {
    expect(resolveProductsRequest({ ...base, search: "phone case", page: 2 }).path).toBe(
      "/products/search?q=phone+case&limit=10&skip=10",
    )
  })

  it("uses the category endpoint", () => {
    expect(resolveProductsRequest({ ...base, category: "smartphones" }).path).toBe(
      "/products/category/smartphones?limit=10&skip=0",
    )
  })

  it("loads the whole category and searches client side when both are set", () => {
    expect(resolveProductsRequest({ ...base, category: "beauty", search: "lip", sort: "title_asc" })).toEqual({
      path: "/products/category/beauty?limit=0&sortBy=title&order=asc",
      clientSearch: "lip",
    })
  })
})

describe("paginateLocally", () => {
  const products = Array.from({ length: 25 }, (_, index) =>
    makeProduct({ id: index + 1, title: index % 2 === 0 ? `Lip balm ${index}` : `Mascara ${index}`, tags: [] }),
  )
  const response = { products, total: 25, skip: 0, limit: 0 }

  it("filters by search term and recalculates the total", () => {
    const result = paginateLocally(response, "LIP", 1)
    expect(result.total).toBe(13)
    expect(result.products).toHaveLength(10)
    expect(result.products.every((product) => product.title.startsWith("Lip"))).toBe(true)
  })

  it("returns the requested page", () => {
    const result = paginateLocally(response, "lip", 2)
    expect(result.products).toHaveLength(3)
    expect(result.skip).toBe(10)
  })

  it("matches brand, sku and tags and returns an empty list when nothing matches", () => {
    const tagged = { ...response, products: [makeProduct({ id: 1, title: "A", brand: "Zeta", tags: ["glossy"] })] }
    expect(paginateLocally(tagged, "zeta", 1).total).toBe(1)
    expect(paginateLocally(tagged, "glossy", 1).total).toBe(1)
    expect(paginateLocally(tagged, "bea-ess", 1).total).toBe(1)
    expect(paginateLocally(tagged, "nothing", 1)).toMatchObject({ products: [], total: 0 })
  })
})
