import { describe, expect, it } from "vitest"
import { DRAFT_STORAGE_KEY } from "../constants"
import { makeStore } from "@/store"
import reducer, {
  draftCleared,
  draftDiscarded,
  draftResumed,
  draftSaved,
  hasDraftContent,
  initialWizardState,
  loadDraft,
  stepChanged,
  type SavedDraft,
} from "./wizardSlice"

const savedDraft: SavedDraft = {
  values: { title: "Lamp", brand: "Lumen" },
  step: 1,
  savedAt: "2026-10-28T01:00:00.000Z",
}

describe("hasDraftContent", () => {
  it.each([
    [{}, false],
    [{ title: "", variations: [] }, false],
    [{ title: "   " }, false],
    [{ price: Number.NaN }, false],
    [{ requiresFragileHandling: false }, false],
    [{ title: "Lamp" }, true],
    [{ price: 0 }, true],
    [{ requiresFragileHandling: true }, true],
    [{ variations: [{ color: "Red" }] }, true],
  ])("evaluates %j as %s", (value, expected) => {
    expect(hasDraftContent(value)).toBe(expected)
  })
})

describe("wizardSlice", () => {
  it("saves draft values and the current step", () => {
    const state = reducer(initialWizardState, draftSaved({ title: "Lamp" }, 2))
    expect(state.values).toEqual({ title: "Lamp" })
    expect(state.step).toBe(2)
    expect(state.lastSavedAt).toEqual(expect.any(String))
  })

  it("changes steps", () => {
    expect(reducer(initialWizardState, stepChanged(3)).step).toBe(3)
  })

  it("prompts when a saved draft is found", () => {
    const state = reducer(initialWizardState, loadDraft.fulfilled(savedDraft, "req"))
    expect(state.status).toBe("prompt")
    expect(state.savedDraft).toEqual(savedDraft)
  })

  it("goes straight to active when there is no draft or loading fails", () => {
    expect(reducer(initialWizardState, loadDraft.fulfilled(null, "req")).status).toBe("active")
    expect(reducer(initialWizardState, loadDraft.rejected(new Error("x"), "req")).status).toBe("active")
    expect(reducer({ ...initialWizardState, status: "active" }, loadDraft.pending("req")).status).toBe("loading")
  })

  it("resumes the saved draft", () => {
    const prompted = reducer(initialWizardState, loadDraft.fulfilled(savedDraft, "req"))
    const state = reducer(prompted, draftResumed())
    expect(state).toMatchObject({ status: "active", step: 1, values: savedDraft.values, savedDraft: null })
  })

  it("ignores resume when there is no saved draft", () => {
    expect(reducer(initialWizardState, draftResumed())).toEqual(initialWizardState)
  })

  it("discards and clears back to a blank active wizard", () => {
    const prompted = reducer(initialWizardState, loadDraft.fulfilled(savedDraft, "req"))
    for (const action of [draftDiscarded(), draftCleared()]) {
      expect(reducer(prompted, action)).toMatchObject({ status: "active", step: 0, values: {}, savedDraft: null })
    }
  })
})

describe("draft persistence", () => {
  it("writes saved drafts to localStorage and removes them when cleared", () => {
    const store = makeStore()
    store.dispatch(draftSaved({ title: "Lamp" }, 1))
    expect(JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "null")).toMatchObject({
      values: { title: "Lamp" },
      step: 1,
    })

    store.dispatch(draftCleared())
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
  })

  it("does not persist empty drafts", () => {
    const store = makeStore()
    store.dispatch(draftSaved({ title: "Lamp" }, 0))
    store.dispatch(draftSaved({ title: "" }, 0))
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
  })

  it("loads a stored draft through the async thunk", async () => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(savedDraft))
    const store = makeStore()
    await store.dispatch(loadDraft())
    expect(store.getState().wizard.status).toBe("prompt")
    expect(store.getState().wizard.savedDraft).toEqual(savedDraft)
  })

  it("ignores corrupt or empty stored drafts", async () => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, "{broken")
    const corrupt = makeStore()
    await corrupt.dispatch(loadDraft())
    expect(corrupt.getState().wizard.status).toBe("active")

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...savedDraft, values: { title: "" } }))
    const empty = makeStore()
    await empty.dispatch(loadDraft())
    expect(empty.getState().wizard.savedDraft).toBeNull()
  })
})
