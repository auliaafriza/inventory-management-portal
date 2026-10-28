import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit"
import type { ProductPatch } from "../types"

export type ToastKind = "success" | "error" | "info"

export type ToastRetry =
  | { type: "delete"; productId: number; title: string }
  | { type: "update"; productId: number; title: string; patch: ProductPatch }

export interface Toast {
  id: string
  kind: ToastKind
  message: string
  retry?: ToastRetry
}

export interface ToastState {
  items: Toast[]
}

const MAX_TOASTS = 4

const toastSlice = createSlice({
  name: "toasts",
  initialState: { items: [] } as ToastState,
  reducers: {
    toastAdded: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload)
        if (state.items.length > MAX_TOASTS) state.items.splice(0, state.items.length - MAX_TOASTS)
      },
      prepare(toast: Omit<Toast, "id">) {
        return { payload: { id: nanoid(), ...toast } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { toastAdded, toastDismissed } = toastSlice.actions
export default toastSlice.reducer
