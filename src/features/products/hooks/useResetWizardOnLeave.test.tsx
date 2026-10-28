import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DRAFT_STORAGE_KEY } from "../constants"
import { draftSaved } from "../store/wizardSlice"
import { makeStore } from "@/store"
import { Provider } from "react-redux"
import type { ReactNode } from "react"
import { useResetWizardOnLeave } from "./useResetWizardOnLeave"

function setup(initialPath: string) {
  const store = makeStore()
  store.dispatch(draftSaved({ title: "Lamp" }, 2))
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
  const hook = renderHook(({ path }) => useResetWizardOnLeave(path), { wrapper, initialProps: { path: initialPath } })
  return { store, ...hook }
}

describe("useResetWizardOnLeave", () => {
  it("clears the draft and step when leaving the wizard", () => {
    const { store, rerender } = setup("/products/new")
    expect(store.getState().wizard.step).toBe(2)

    rerender({ path: "/testing" })

    expect(store.getState().wizard.step).toBe(0)
    expect(store.getState().wizard.values).toEqual({})
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
  })

  it("keeps the draft while staying on the wizard or visiting other pages", () => {
    const { store, rerender } = setup("/products")
    rerender({ path: "/testing" })
    expect(store.getState().wizard.step).toBe(2)
  })
})
