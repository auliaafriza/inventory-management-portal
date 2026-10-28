import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { makeStore } from "@/store"
import { server } from "@/test/server"
import { initialOptimisticState } from "../store/optimisticSlice"
import { makeProduct } from "@/test/fixtures"
import { applyOverrides, productsApi } from "./productsApi"

const filters = { search: "", category: "", sort: "" as const, page: 1 }

describe("productsApi", () => {
  it("fetches a page of products", async () => {
    const store = makeStore()
    const result = await store.dispatch(productsApi.endpoints.getProducts.initiate(filters))
    expect(result.data?.products).toHaveLength(4)
    expect(result.data?.total).toBe(4)
  })

  it("uses the search endpoint", async () => {
    const store = makeStore()
    const result = await store.dispatch(productsApi.endpoints.getProducts.initiate({ ...filters, search: "iphone" }))
    expect(result.data?.products.map((product) => product.title)).toEqual(["iPhone 13 Pro"])
  })

  it("combines category and search client side", async () => {
    const store = makeStore()
    const result = await store.dispatch(
      productsApi.endpoints.getProducts.initiate({ ...filters, category: "beauty", search: "lipstick" }),
    )
    expect(result.data?.products.map((product) => product.id)).toEqual([4])
    expect(result.data?.total).toBe(1)
  })

  it("caches results per argument set", async () => {
    const store = makeStore()
    let calls = 0
    server.use(
      http.get("https://dummyjson.com/products", () => {
        calls += 1
        return HttpResponse.json({ products: [], total: 0, skip: 0, limit: 10 })
      }),
    )
    await store.dispatch(productsApi.endpoints.getProducts.initiate(filters))
    await store.dispatch(productsApi.endpoints.getProducts.initiate({ ...filters }))
    expect(calls).toBe(1)
  })

  it("surfaces server errors", async () => {
    const store = makeStore()
    server.use(http.get("https://dummyjson.com/products", () => HttpResponse.json({}, { status: 500 })))
    const result = await store.dispatch(productsApi.endpoints.getProducts.initiate(filters))
    expect(result.isError).toBe(true)
  })

  it("loads categories and a single product", async () => {
    const store = makeStore()
    const categories = await store.dispatch(productsApi.endpoints.getCategories.initiate())
    expect(categories.data).toHaveLength(3)

    const product = await store.dispatch(productsApi.endpoints.getProductById.initiate(2))
    expect(product.data?.title).toBe("iPhone 13 Pro")

    const missing = await store.dispatch(productsApi.endpoints.getProductById.initiate(999))
    expect(missing.isError).toBe(true)
  })
})

describe("applyOverrides", () => {
  it("drops deleted products and merges edits", () => {
    const response = {
      products: [makeProduct({ id: 1 }), makeProduct({ id: 2 }), makeProduct({ id: 3 })],
      total: 3,
      skip: 0,
      limit: 10,
    }
    const result = applyOverrides(response, {
      ...initialOptimisticState,
      deletedIds: [2],
      edits: { 3: { price: 1 } },
    })
    expect(result.products.map((product) => product.id)).toEqual([1, 3])
    expect(result.products[1]?.price).toBe(1)
    expect(result.total).toBe(2)
  })
})
