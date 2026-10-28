import type { ReactElement } from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import { makeStore, type AppStore, type RootState } from "@/store"

interface RenderOptions {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store = makeStore(preloadedState) }: RenderOptions = {},
) {
  return { store, ...render(<Provider store={store}>{ui}</Provider>) }
}
