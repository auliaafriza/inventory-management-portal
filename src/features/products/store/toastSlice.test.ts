import { describe, expect, it } from "vitest"
import reducer, { toastAdded, toastDismissed } from "./toastSlice"

describe("toastSlice", () => {
  it("adds toasts with generated ids", () => {
    const state = reducer(undefined, toastAdded({ kind: "success", message: "Saved" }))
    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({ kind: "success", message: "Saved" })
    expect(state.items[0]?.id).toBeTruthy()
  })

  it("keeps retry metadata serializable", () => {
    const state = reducer(
      undefined,
      toastAdded({ kind: "error", message: "Failed", retry: { type: "delete", productId: 1, title: "Phone" } }),
    )
    expect(state.items[0]?.retry).toEqual({ type: "delete", productId: 1, title: "Phone" })
  })

  it("dismisses a toast by id", () => {
    let state = reducer(undefined, toastAdded({ kind: "info", message: "A" }))
    state = reducer(state, toastAdded({ kind: "info", message: "B" }))
    const [first] = state.items
    state = reducer(state, toastDismissed(first?.id ?? ""))
    expect(state.items.map((toast) => toast.message)).toEqual(["B"])
  })

  it("caps the stack at four toasts", () => {
    let state = reducer(undefined, { type: "init" })
    for (let index = 0; index < 6; index += 1) {
      state = reducer(state, toastAdded({ kind: "info", message: `Toast ${index}` }))
    }
    expect(state.items).toHaveLength(4)
    expect(state.items[0]?.message).toBe("Toast 2")
  })
})
