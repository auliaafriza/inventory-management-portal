import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQuery } from "@/api/baseQuery"
import type { OptimisticState } from "../store/optimisticSlice"
import type { Product, ProductCategory, ProductFilters, ProductsResponse } from "../types"
import { paginateLocally, resolveProductsRequest } from "../utils/productsRequest"

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

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery,
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductFilters>({
      async queryFn(filters, api, _extraOptions, fetchWithBQ) {
        const request = resolveProductsRequest(filters)
        const result = await fetchWithBQ(request.path)
        if (result.error) return { error: result.error }

        let data = result.data as ProductsResponse
        if (request.clientSearch) data = paginateLocally(data, request.clientSearch, filters.page)

        const { optimistic } = api.getState() as OverridesState
        return { data: applyOverrides(data, optimistic) }
      },
    }),
    getCategories: builder.query<ProductCategory[], void>({
      query: () => "/products/categories",
      keepUnusedDataFor: 3600,
    }),
    getProductById: builder.query<Product, number>({
      async queryFn(id, api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ(`/products/${id}`)
        if (result.error) return { error: result.error }

        const { optimistic } = api.getState() as OverridesState
        const product = result.data as Product
        return { data: { ...product, ...optimistic.edits[product.id] } }
      },
    }),
  }),
})

export const { useGetProductsQuery, useGetCategoriesQuery, useGetProductByIdQuery } = productsApi
