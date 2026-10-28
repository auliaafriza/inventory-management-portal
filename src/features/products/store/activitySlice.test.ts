import { describe, expect, it } from "vitest"
import reducer, { activityCleared, activityLogged, MAX_ACTIVITIES } from "./activitySlice"

describe("activitySlice", () => {
  it("logs the newest activity first with an id and timestamp", () => {
    let state = reducer(undefined, activityLogged({ tone: "success", title: "Product added", detail: "Lamp" }))
    state = reducer(state, activityLogged({ tone: "error", title: "Delete failed", detail: "Chair" }))

    expect(state.items.map((item) => item.title)).toEqual(["Delete failed", "Product added"])
    expect(state.items[0]).toMatchObject({ id: expect.any(String), at: expect.any(String) })
  })

  it("keeps only the most recent entries", () => {
    let state = reducer(undefined, { type: "init" })
    for (let index = 0; index < MAX_ACTIVITIES + 3; index += 1) {
      state = reducer(state, activityLogged({ tone: "info", title: `Event ${index}`, detail: "" }))
    }
    expect(state.items).toHaveLength(MAX_ACTIVITIES)
    expect(state.items[0]?.title).toBe(`Event ${MAX_ACTIVITIES + 2}`)
  })

  it("clears the log", () => {
    const state = reducer(
      reducer(undefined, activityLogged({ tone: "info", title: "x", detail: "y" })),
      activityCleared(),
    )
    expect(state.items).toEqual([])
  })
})
