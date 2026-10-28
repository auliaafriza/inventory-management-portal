import { describe, expect, it, vi } from "vitest"
import { makeProduct } from "@/test/fixtures"
import { buildProductsCsv, downloadCsv } from "./exportCsv"

describe("buildProductsCsv", () => {
  it("writes a header and one row per product", () => {
    const csv = buildProductsCsv([
      makeProduct({ id: 7, title: "Lamp", brand: "Lumen", price: 12.5, stock: 3, rating: 4.2, sku: "L-1" }),
    ])
    expect(csv.split("\n")).toEqual([
      "ID,Title,Brand,Category,SKU,Price,Stock,Rating",
      "7,Lamp,Lumen,beauty,L-1,12.5,3,4.2",
    ])
  })

  it("escapes commas, quotes and missing brands", () => {
    const csv = buildProductsCsv([makeProduct({ title: 'Lamp, "Pro"', brand: undefined })])
    expect(csv.split("\n")[1]).toContain('"Lamp, ""Pro"""')
    expect(csv.split("\n")[1]).toContain(",,beauty,")
  })

  it("returns only the header for an empty list", () => {
    expect(buildProductsCsv([])).toBe("ID,Title,Brand,Category,SKU,Price,Stock,Rating")
  })
})

describe("downloadCsv", () => {
  it("triggers a download with the given filename", () => {
    const createObjectURL = vi.fn(() => "blob:test")
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined)

    downloadCsv("products.csv", "a,b")

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test")
    click.mockRestore()
  })
})
