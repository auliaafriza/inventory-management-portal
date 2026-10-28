import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQuery } from "@/api/baseQuery"
import { wait } from "@/lib/utils/failure"
import { listRefreshed, summaryRefreshed, type OptimisticState } from "../store/optimisticSlice"
import type { Product, ProductCategory, ProductFilters, ProductsResponse } from "../types"
import { applyInventoryOverrides, type InventoryItem } from "../utils/inventoryStats"
import { PAGE_SIZE } from "../constants"
import {
  createdToInventoryItems,
  isCreatedId,
  planCreatedPaging,
  selectCreatedForFilters,
} from "../utils/createdProduct"
import { paginateLocally, resolveProductsRequest } from "../utils/productsRequest"

const REFETCH_DELAY_MS = 900
export const INVENTORY_TAG = "Inventory"

interface OverridesState {
  optimistic: OptimisticState
}

export function applyOverrides(response: ProductsResponse, overrides: OptimisticState): ProductsResponse {
  const deleted = new Set(overrides.deletedIds)
  const kept = response.products.filter((product) => !deleted.has(product.id))
  const removed = response.products.length - kept.length

  return {
    ...response,
    products: kept.map((product) => {
      const edit = overrides.edits[product.id]
      return edit ? { ...product, ...edit } : product
    }),
    total: Math.max(0, response.total - removed),
  }
}

const SUMMARY_FIELDS = "title,sku,category,price,stock,discountPercentage,thumbnail"

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery,
  tagTypes: [INVENTORY_TAG],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductFilters>({
      async queryFn(filters, api, _extraOptions, fetchWithBQ) {
        const { optimistic } = api.getState() as OverridesState
        const created = selectCreatedForFilters(optimistic.created, optimistic, filters)
        const bothFilters = Boolean(filters.category && filters.search)
        const plan = planCreatedPaging(created, filters.page, PAGE_SIZE)
        const paging = bothFilters ? undefined : { skip: plan.skip, limit: Math.max(1, plan.limit) }
        const request = resolveProductsRequest(filters, paging)

        if (optimistic.listStale) {
          await wait(REFETCH_DELAY_MS)
          api.dispatch(listRefreshed())
        }

        const result = await fetchWithBQ(request.path)
        if (result.error) return { error: result.error }

        let data = result.data as ProductsResponse
        if (request.clientSearch) {
          data = paginateLocally(data, request.clientSearch, filters.page, PAGE_SIZE, created)
        } else {
          data = {
            ...data,
            products: [...plan.fromCreated, ...(plan.limit > 0 ? data.products : [])],
            total: data.total + created.length,
          }
        }

        const latest = api.getState() as OverridesState
        return { data: applyOverrides(data, latest.optimistic) }
      },
      providesTags: [INVENTORY_TAG],
    }),
    getInventorySummary: builder.query<InventoryItem[], void>({
      async queryFn(_arg, api, _extraOptions, fetchWithBQ) {
        const { optimistic } = api.getState() as OverridesState
        if (optimistic.summaryStale) {
          await wait(REFETCH_DELAY_MS)
          api.dispatch(summaryRefreshed())
        }

        const result = await fetchWithBQ(`/products?limit=0&select=${SUMMARY_FIELDS}`)
        if (result.error) return { error: result.error }

        const latest = (api.getState() as OverridesState).optimistic
        const { products } = result.data as { products: InventoryItem[] }
        return { data: applyInventoryOverrides([...createdToInventoryItems(latest.created), ...products], latest) }
      },
      providesTags: [INVENTORY_TAG],
      keepUnusedDataFor: 300,
    }),
    getCategories: builder.query<ProductCategory[], void>({
      query: () => "/products/categories",
      keepUnusedDataFor: 3600,
    }),
    getProductById: builder.query<Product, number>({
      async queryFn(id, api, _extraOptions, fetchWithBQ) {
        const { optimistic } = api.getState() as OverridesState
        const local = optimistic.created.find((product) => product.id === id)
        if (local) return { data: { ...local, ...optimistic.edits[id] } }
        if (isCreatedId(id)) return { error: { status: 404, data: { message: "Product not found" } } }

        const result = await fetchWithBQ(`/products/${id}`)
        if (result.error) return { error: result.error }

        const product = result.data as Product
        return { data: { ...product, ...optimistic.edits[product.id] } }
      },
    }),
  }),
})

export const { useGetProductsQuery, useGetCategoriesQuery, useGetProductByIdQuery, useGetInventorySummaryQuery } =
  productsApi
