import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { shouldSimulateFailure, wait } from "@/lib/utils/failure"
import {
  operationCommitted,
  operationRolledBack,
  operationStarted,
  type OptimisticKind,
} from "../store/optimisticSlice"
import { activityLogged } from "../store/activitySlice"
import { toastAdded } from "../store/toastSlice"
import type {
  CreatedProduct,
  CreateProductPayload,
  DeletedProduct,
  Product,
  ProductPatch,
  ProductsResponse,
} from "../types"
import type { InventoryItem } from "../utils/inventoryStats"
import { productsApi } from "./productsApi"

const SIMULATED_ERROR: FetchBaseQueryError = { status: "FETCH_ERROR", error: "Simulated network failure" }
const MIN_LATENCY_MS = 400
const MAX_LATENCY_MS = 900

type ListCacheState = Parameters<typeof productsApi.util.selectCachedArgsForQuery>[0]
type ListRecipe = (draft: ProductsResponse) => void
type SummaryRecipe = (draft: InventoryItem[]) => void
type CacheDispatch = ThunkDispatch<ListCacheState, unknown, UnknownAction>

function simulatedLatency(): number {
  return MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS)
}

export const productMutations = productsApi.injectEndpoints({
  endpoints: (builder) => {
    const patchCachedLists = (
      dispatch: CacheDispatch,
      getState: () => unknown,
      recipe: ListRecipe,
      summaryRecipe: SummaryRecipe,
    ): (() => void) => {
      const state = getState() as ListCacheState
      const patches = productsApi.util
        .selectCachedArgsForQuery(state, "getProducts")
        .map((args) => dispatch(productsApi.util.updateQueryData("getProducts", args, recipe)))
      patches.push(dispatch(productsApi.util.updateQueryData("getInventorySummary", undefined, summaryRecipe)))

      return () => patches.forEach((patch) => patch.undo())
    }

    return {
      createProduct: builder.mutation<CreatedProduct, CreateProductPayload>({
        query: (body) => ({ url: "/products/add", method: "POST", body }),
      }),
      updateProduct: builder.mutation<Product, { id: number; title: string; patch: ProductPatch }>({
        async queryFn({ id, patch }, _api, _extraOptions, fetchWithBQ) {
          await wait(simulatedLatency())
          if (shouldSimulateFailure()) return { error: SIMULATED_ERROR }

          const result = await fetchWithBQ({ url: `/products/${id}`, method: "PUT", body: patch })
          return result.error ? { error: result.error } : { data: result.data as Product }
        },
        async onQueryStarted({ id, title, patch }, { dispatch, getState, queryFulfilled }) {
          const kind: OptimisticKind = "update"
          dispatch(operationStarted({ productId: id, kind }))
          const undo = patchCachedLists(
            dispatch,
            getState,
            (draft) => {
              const target = draft.products.find((product) => product.id === id)
              if (target) Object.assign(target, patch)
            },
            (draft) => {
              const target = draft.find((item) => item.id === id)
              if (target) Object.assign(target, patch)
            },
          )

          try {
            await queryFulfilled
            dispatch(operationCommitted({ productId: id, kind, patch }))
            dispatch(toastAdded({ kind: "success", message: `"${title}" updated` }))
            dispatch(activityLogged({ tone: "success", title: "Product updated", detail: title }))
          } catch {
            undo()
            dispatch(operationRolledBack({ productId: id, kind }))
            dispatch(activityLogged({ tone: "error", title: "Update failed", detail: `${title} was reverted` }))
            dispatch(
              toastAdded({
                kind: "error",
                message: `Could not update "${title}". Changes were reverted.`,
                retry: { type: "update", productId: id, title, patch },
              }),
            )
          }
        },
      }),
      deleteProduct: builder.mutation<DeletedProduct, { id: number; title: string }>({
        async queryFn({ id }, _api, _extraOptions, fetchWithBQ) {
          await wait(simulatedLatency())
          if (shouldSimulateFailure()) return { error: SIMULATED_ERROR }

          const result = await fetchWithBQ({ url: `/products/${id}`, method: "DELETE" })
          return result.error ? { error: result.error } : { data: result.data as DeletedProduct }
        },
        async onQueryStarted({ id, title }, { dispatch, getState, queryFulfilled }) {
          const kind: OptimisticKind = "delete"
          dispatch(operationStarted({ productId: id, kind }))
          const undo = patchCachedLists(
            dispatch,
            getState,
            (draft) => {
              const before = draft.products.length
              draft.products = draft.products.filter((product) => product.id !== id)
              if (draft.products.length < before) draft.total = Math.max(0, draft.total - 1)
            },
            (draft) => {
              const index = draft.findIndex((item) => item.id === id)
              if (index >= 0) draft.splice(index, 1)
            },
          )

          try {
            await queryFulfilled
            dispatch(operationCommitted({ productId: id, kind }))
            dispatch(toastAdded({ kind: "success", message: `"${title}" deleted` }))
            dispatch(activityLogged({ tone: "success", title: "Product deleted", detail: title }))
          } catch {
            undo()
            dispatch(operationRolledBack({ productId: id, kind }))
            dispatch(activityLogged({ tone: "error", title: "Delete failed", detail: `${title} was restored` }))
            dispatch(
              toastAdded({
                kind: "error",
                message: `Could not delete "${title}". It has been restored.`,
                retry: { type: "delete", productId: id, title },
              }),
            )
          }
        },
      }),
    }
  },
})

export const { useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } = productMutations
