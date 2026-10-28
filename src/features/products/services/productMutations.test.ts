import { http, HttpResponse } from "msw"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { makeStore } from "@/store"
import { PRODUCTS } from "@/test/fixtures"
import { server } from "@/test/server"
import { productMutations } from "./productMutations"
import { productsApi } from "./productsApi"

const failureControl = vi.hoisted(() => ({ fail: false }))

vi.mock("@/lib/utils/failure", () => ({
  shouldSimulateFailure: () => failureControl.fail,
  wait: () => Promise.resolve(),
}))

const filters = { search: "", category: "", sort: "" as const, page: 1 }

async function setup() {
  const store = makeStore()
  await store.dispatch(productsApi.endpoints.getProducts.initiate(filters))
  const titles = () =>
    productsApi.endpoints.getProducts
      .select(filters)(store.getState())
      .data?.products.map((product) => product.title)
  return { store, titles }
}

beforeEach(() => {
  failureControl.fail = false
})

describe("deleteProduct", () => {
  it("removes the product from the cache before the request finishes", async () => {
    const { store, titles } = await setup()
    expect(titles()).toHaveLength(PRODUCTS.length)

    const request = store.dispatch(productMutations.endpoints.deleteProduct.initiate({ id: 2, title: "iPhone 13 Pro" }))
    expect(titles()).not.toContain("iPhone 13 Pro")
    expect(store.getState().optimistic.operations[2]).toEqual({ kind: "delete", status: "pending" })

    await request
    expect(store.getState().optimistic.deletedIds).toEqual([2])
    expect(store.getState().optimistic.operations[2]).toBeUndefined()
    expect(store.getState().toasts.items[0]).toMatchObject({ kind: "success" })
  })

  it("decrements the cached total only once", async () => {
    const { store } = await setup()
    await store.dispatch(productMutations.endpoints.deleteProduct.initiate({ id: 2, title: "iPhone 13 Pro" }))
    const data = productsApi.endpoints.getProducts.select(filters)(store.getState()).data
    expect(data?.total).toBe(PRODUCTS.length - 1)
  })

  it("rolls the list back and offers a retry when the simulated request fails", async () => {
    const { store, titles } = await setup()
    failureControl.fail = true

    const request = store.dispatch(productMutations.endpoints.deleteProduct.initiate({ id: 2, title: "iPhone 13 Pro" }))
    expect(titles()).not.toContain("iPhone 13 Pro")
    await request

    expect(titles()).toContain("iPhone 13 Pro")
    expect(productsApi.endpoints.getProducts.select(filters)(store.getState()).data?.total).toBe(PRODUCTS.length)
    expect(store.getState().optimistic.operations[2]).toEqual({ kind: "delete", status: "failed" })
    expect(store.getState().optimistic.deletedIds).toEqual([])
    expect(store.getState().toasts.items[0]).toMatchObject({
      kind: "error",
      retry: { type: "delete", productId: 2, title: "iPhone 13 Pro" },
    })
  })

  it("rolls back when the server responds with an error", async () => {
    const { store, titles } = await setup()
    server.use(http.delete("https://dummyjson.com/products/:id", () => HttpResponse.json({}, { status: 500 })))

    await store.dispatch(productMutations.endpoints.deleteProduct.initiate({ id: 3, title: "Samsung Galaxy S8" }))
    expect(titles()).toContain("Samsung Galaxy S8")
    expect(store.getState().optimistic.operations[3]?.status).toBe("failed")
  })

  it("succeeds on retry after a failure", async () => {
    const { store, titles } = await setup()
    failureControl.fail = true
    await store.dispatch(productMutations.endpoints.deleteProduct.initiate({ id: 2, title: "iPhone 13 Pro" }))
    failureControl.fail = false
    await store.dispatch(productMutations.endpoints.deleteProduct.initiate({ id: 2, title: "iPhone 13 Pro" }))

    expect(titles()).not.toContain("iPhone 13 Pro")
    expect(store.getState().optimistic.deletedIds).toEqual([2])
    expect(store.getState().optimistic.operations[2]).toBeUndefined()
  })
})

describe("updateProduct", () => {
  it("applies the patch instantly and keeps it after success", async () => {
    const { store } = await setup()
    const read = () =>
      productsApi.endpoints.getProducts
        .select(filters)(store.getState())
        .data?.products.find((product) => product.id === 1)

    const request = store.dispatch(
      productMutations.endpoints.updateProduct.initiate({
        id: 1,
        title: "Essence Mascara",
        patch: { price: 20, stock: 99 },
      }),
    )
    expect(read()).toMatchObject({ price: 20, stock: 99 })
    await request

    expect(read()).toMatchObject({ price: 20, stock: 99 })
    expect(store.getState().optimistic.edits[1]).toEqual({ price: 20, stock: 99 })
  })

  it("restores the previous values when the request fails", async () => {
    const { store } = await setup()
    failureControl.fail = true
    const read = () =>
      productsApi.endpoints.getProducts
        .select(filters)(store.getState())
        .data?.products.find((product) => product.id === 1)
    const original = read()

    await store.dispatch(
      productMutations.endpoints.updateProduct.initiate({ id: 1, title: "Essence Mascara", patch: { price: 20 } }),
    )

    expect(read()).toEqual(original)
    expect(store.getState().optimistic.edits[1]).toBeUndefined()
    expect(store.getState().toasts.items[0]?.retry).toMatchObject({ type: "update", patch: { price: 20 } })
  })

  it("re-applies committed edits and deletions when a list is fetched again", async () => {
    const { store } = await setup()
    await store.dispatch(
      productMutations.endpoints.updateProduct.initiate({ id: 1, title: "Mascara", patch: { stock: 1 } }),
    )
    await store.dispatch(productMutations.endpoints.deleteProduct.initiate({ id: 4, title: "Red Lipstick" }))

    const fresh = await store.dispatch(
      productsApi.endpoints.getProducts.initiate({ ...filters, search: "e" }, { forceRefetch: true }),
    )
    const ids = fresh.data?.products.map((product) => product.id)
    expect(ids).not.toContain(4)
    expect(fresh.data?.products.find((product) => product.id === 1)?.stock).toBe(1)
  })
})

describe("createProduct", () => {
  it("posts the payload to the add endpoint", async () => {
    const store = makeStore()
    const result = await store.dispatch(
      productMutations.endpoints.createProduct.initiate({
        image: "",
        title: "Desk Lamp",
        brand: "Lumen",
        category: "lighting",
        description: "A bright lamp for the desk.",
        price: 10,
        stock: 1,
        discountPercentage: 0,
        variations: [],
        weight: 1,
        dimensions: { width: 1, height: 1, depth: 1 },
        requiresFragileHandling: false,
        hazardousDisclaimer: false,
        shippingNotes: "",
      }),
    )
    expect(result).toMatchObject({ data: { id: 195, title: "Desk Lamp" } })
  })
})
