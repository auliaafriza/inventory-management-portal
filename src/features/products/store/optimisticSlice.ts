import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Product, ProductPatch } from "../types"

export type OptimisticKind = "delete" | "update"
export type OptimisticStatus = "pending" | "failed"

export interface OptimisticOperation {
  kind: OptimisticKind
  status: OptimisticStatus
}

export interface OptimisticState {
  operations: Record<number, OptimisticOperation>
  deletedIds: number[]
  edits: Record<number, ProductPatch>
  created: Product[]
  listStale: boolean
  summaryStale: boolean
}

export const initialOptimisticState: OptimisticState = {
  operations: {},
  deletedIds: [],
  edits: {},
  created: [],
  listStale: false,
  summaryStale: false,
}

const optimisticSlice = createSlice({
  name: "optimistic",
  initialState: initialOptimisticState,
  reducers: {
    operationStarted(state, action: PayloadAction<{ productId: number; kind: OptimisticKind }>) {
      const { productId, kind } = action.payload
      state.operations[productId] = { kind, status: "pending" }
    },
    operationCommitted(
      state,
      action: PayloadAction<{ productId: number; kind: OptimisticKind; patch?: ProductPatch }>,
    ) {
      const { productId, kind, patch } = action.payload
      delete state.operations[productId]

      if (kind === "delete") {
        if (!state.deletedIds.includes(productId)) state.deletedIds.push(productId)
        delete state.edits[productId]
        return
      }

      state.edits[productId] = { ...state.edits[productId], ...patch }
    },
    operationRolledBack(state, action: PayloadAction<{ productId: number; kind: OptimisticKind }>) {
      const { productId, kind } = action.payload
      state.operations[productId] = { kind, status: "failed" }
    },
    productCreated(state, action: PayloadAction<Product>) {
      state.created.unshift(action.payload)
      state.listStale = true
      state.summaryStale = true
    },
    listRefreshed(state) {
      state.listStale = false
    },
    summaryRefreshed(state) {
      state.summaryStale = false
    },
    operationDismissed(state, action: PayloadAction<number>) {
      delete state.operations[action.payload]
    },
  },
})

export const {
  operationStarted,
  operationCommitted,
  operationRolledBack,
  operationDismissed,
  productCreated,
  listRefreshed,
  summaryRefreshed,
} = optimisticSlice.actions

export const selectOperations = (state: { optimistic: OptimisticState }): Record<number, OptimisticOperation> =>
  state.optimistic.operations

export default optimisticSlice.reducer
