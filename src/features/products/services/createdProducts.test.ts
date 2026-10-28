import { describe, expect, it } from "vitest"
import { makeStore } from "@/store"
import { productCreated } from "../store/optimisticSlice"
import { buildCreatedProduct, CREATED_ID_START, nextCreatedId } from "../utils/createdProduct"
import { buildCreatePayload } from "../utils/payload"
import { productMutations } from "./productMutations"
import { productsApi } from "./productsApi"

const filters = { search: "", category: "", sort: "" as const, page: 1 }

const payload = buildCreatePayload({
  image: "",
  title: "Desk Lamp",
  brand: "Lumen",
  category: "beauty",
  description: "A bright and adjustable desk lamp.",
  price: 49.9,
  stock: 12,
  discountPercentage: 10,
  variations: [{ color: "Black", size: "M", sku: "SKU-BLK-1001", extraPrice: 0 }],
  weight: 1.2,
  width: 20,
  height: 40,
  depth: 20,
  requiresFragileHandling: false,
  hazardousDisclaimer: false,
  shippingNotes: "",
})

describe("created products", () => {
  it("assigns ids after the demo range", () => {
    expect(nextCreatedId([])).toBe(CREATED_ID_START)
    expect(nextCreatedId([buildCreatedProduct(payload, 1001)])).toBe(1002)
  })

  it("shows a created product first, flags the list as stale, and refetches after creation", async () => {
    const store = makeStore()
    await store.dispatch(productsApi.endpoints.getProducts.initiate(filters))
    await store.dispatch(productMutations.endpoints.createProduct.initiate(payload))

    const { optimistic } = store.getState()
    expect(optimistic.created).toHaveLength(1)
    expect(optimistic.listStale).toBe(true)

    const refreshed = await store.dispatch(productsApi.endpoints.getProducts.initiate(filters))
    expect(refreshed.data?.products[0]).toMatchObject({ title: "Desk Lamp", id: CREATED_ID_START })
    expect(refreshed.data?.total).toBe(5)
    expect(store.getState().optimistic.listStale).toBe(false)
  })

  it("filters created products by category and search", async () => {
    const store = makeStore()
    store.dispatch(productCreated(buildCreatedProduct(payload, 1001)))

    const other = await store.dispatch(productsApi.endpoints.getProducts.initiate({ ...filters, category: "laptops" }))
    expect(other.data?.products.some((product) => product.id === 1001)).toBe(false)

    const matching = await store.dispatch(
      productsApi.endpoints.getProducts.initiate({ ...filters, category: "beauty", search: "lamp" }),
    )
    expect(matching.data?.products.map((product) => product.id)).toEqual([1001])
  })

  it("serves a created product by id and includes it in the summary", async () => {
    const store = makeStore()
    store.dispatch(productCreated(buildCreatedProduct(payload, 1001)))

    const detail = await store.dispatch(productsApi.endpoints.getProductById.initiate(1001))
    expect(detail.data?.title).toBe("Desk Lamp")

    const summary = await store.dispatch(productsApi.endpoints.getInventorySummary.initiate())
    expect(summary.data?.[0]).toMatchObject({ id: 1001, stock: 12 })
    expect(store.getState().optimistic.summaryStale).toBe(false)
  })

  it("reports a missing created product", async () => {
    const store = makeStore()
    const detail = await store.dispatch(productsApi.endpoints.getProductById.initiate(1500))
    expect(detail.isError).toBe(true)
  })
})
