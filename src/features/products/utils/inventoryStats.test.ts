import { describe, expect, it } from "vitest"
import {
  applyInventoryOverrides,
  computeInventoryStats,
  formatCategoryName,
  getLowStockItems,
  type InventoryItem,
} from "./inventoryStats"

const item = (overrides: Partial<InventoryItem>): InventoryItem => ({
  id: 1,
  title: "Item",
  sku: "SKU",
  category: "beauty",
  price: 10,
  stock: 20,
  discountPercentage: 0,
  thumbnail: "",
  ...overrides,
})

const items = [
  item({ id: 1, category: "beauty", price: 10, stock: 20 }),
  item({ id: 2, category: "beauty", price: 5, stock: 0 }),
  item({ id: 3, category: "home-decoration", price: 100, stock: 3, title: "B lamp" }),
  item({ id: 4, category: "home-decoration", price: 50, stock: 9, title: "A lamp" }),
  item({ id: 5, category: "laptops", price: 1000, stock: 10 }),
]

describe("computeInventoryStats", () => {
  it("counts products, units, value and stock buckets", () => {
    const stats = computeInventoryStats(items)
    expect(stats).toMatchObject({
      totalProducts: 5,
      totalStock: 42,
      inStock: 2,
      lowStock: 2,
      outOfStock: 1,
      totalValue: 10 * 20 + 100 * 3 + 50 * 9 + 1000 * 10,
    })
  })

  it("groups categories by units, largest first", () => {
    const { categories } = computeInventoryStats(items)
    expect(categories.map((entry) => entry.category)).toEqual(["beauty", "home-decoration", "laptops"])
    expect(categories[1]).toEqual({ category: "home-decoration", products: 2, units: 12 })
  })

  it("handles an empty inventory", () => {
    expect(computeInventoryStats([])).toMatchObject({ totalProducts: 0, totalStock: 0, totalValue: 0, categories: [] })
  })

  it("ignores negative stock when counting units", () => {
    const { categories, outOfStock } = computeInventoryStats([item({ stock: -4 })])
    expect(categories[0]?.units).toBe(0)
    expect(outOfStock).toBe(1)
  })
})

describe("getLowStockItems", () => {
  it("returns items below the threshold, lowest first, limited", () => {
    expect(getLowStockItems(items).map((entry) => entry.id)).toEqual([2, 3, 4])
    expect(getLowStockItems(items, 2).map((entry) => entry.id)).toEqual([2, 3])
  })

  it("breaks ties by title", () => {
    const tied = [item({ id: 1, stock: 2, title: "Zed" }), item({ id: 2, stock: 2, title: "Alpha" })]
    expect(getLowStockItems(tied).map((entry) => entry.title)).toEqual(["Alpha", "Zed"])
  })
})

describe("applyInventoryOverrides", () => {
  it("removes deleted items and merges edits", () => {
    const result = applyInventoryOverrides(items, { deletedIds: [1], edits: { 2: { stock: 50 } } })
    expect(result.map((entry) => entry.id)).toEqual([2, 3, 4, 5])
    expect(result[0]?.stock).toBe(50)
  })
})

describe("formatCategoryName", () => {
  it("title cases slugs", () => {
    expect(formatCategoryName("home-decoration")).toBe("Home Decoration")
    expect(formatCategoryName("beauty")).toBe("Beauty")
    expect(formatCategoryName("")).toBe("")
  })
})
