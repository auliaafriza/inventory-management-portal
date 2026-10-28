import { describe, expect, it } from "vitest"
import reducer, {
  initialOptimisticState,
  operationCommitted,
  operationDismissed,
  operationRolledBack,
  operationStarted,
} from "./optimisticSlice"

describe("optimisticSlice", () => {
  it("tracks a pending operation", () => {
    const state = reducer(initialOptimisticState, operationStarted({ productId: 7, kind: "delete" }))
    expect(state.operations[7]).toEqual({ kind: "delete", status: "pending" })
  })

  it("records a committed delete and clears the pending operation", () => {
    let state = reducer(initialOptimisticState, operationStarted({ productId: 7, kind: "delete" }))
    state = reducer(state, operationCommitted({ productId: 7, kind: "delete" }))
    expect(state.operations[7]).toBeUndefined()
    expect(state.deletedIds).toEqual([7])
  })

  it("does not duplicate deleted ids and drops stale edits", () => {
    let state = reducer(
      initialOptimisticState,
      operationCommitted({ productId: 3, kind: "update", patch: { price: 5 } }),
    )
    state = reducer(state, operationCommitted({ productId: 3, kind: "delete" }))
    state = reducer(state, operationCommitted({ productId: 3, kind: "delete" }))
    expect(state.deletedIds).toEqual([3])
    expect(state.edits[3]).toBeUndefined()
  })

  it("merges committed edits per product", () => {
    let state = reducer(
      initialOptimisticState,
      operationCommitted({ productId: 2, kind: "update", patch: { price: 10 } }),
    )
    state = reducer(state, operationCommitted({ productId: 2, kind: "update", patch: { stock: 4 } }))
    expect(state.edits[2]).toEqual({ price: 10, stock: 4 })
  })

  it("marks a rolled back operation as failed without committing it", () => {
    let state = reducer(initialOptimisticState, operationStarted({ productId: 9, kind: "update" }))
    state = reducer(state, operationRolledBack({ productId: 9, kind: "update" }))
    expect(state.operations[9]).toEqual({ kind: "update", status: "failed" })
    expect(state.deletedIds).toEqual([])
    expect(state.edits[9]).toBeUndefined()
  })

  it("lets a retry replace a failed operation with a pending one", () => {
    let state = reducer(initialOptimisticState, operationRolledBack({ productId: 9, kind: "delete" }))
    state = reducer(state, operationStarted({ productId: 9, kind: "delete" }))
    expect(state.operations[9]?.status).toBe("pending")
  })

  it("dismisses an operation", () => {
    let state = reducer(initialOptimisticState, operationRolledBack({ productId: 1, kind: "delete" }))
    state = reducer(state, operationDismissed(1))
    expect(state.operations).toEqual({})
  })
})
