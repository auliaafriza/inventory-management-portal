import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ProductPatch } from "../types"

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
}

export const initialOptimisticState: OptimisticState = {
  operations: {},
  deletedIds: [],
  edits: {},
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
    operationDismissed(state, action: PayloadAction<number>) {
      delete state.operations[action.payload]
    },
  },
})

export const { operationStarted, operationCommitted, operationRolledBack, operationDismissed } = optimisticSlice.actions

export const selectOperations = (state: { optimistic: OptimisticState }): Record<number, OptimisticOperation> =>
  state.optimistic.operations

export default optimisticSlice.reducer
