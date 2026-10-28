"use client"

import { useCallback, useMemo } from "react"
import { Toaster, type ToastItem } from "@/components/ui/Toaster"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { useDeleteProductMutation, useUpdateProductMutation } from "../services/productMutations"
import { toastDismissed } from "../store/toastSlice"

export function ProductsToaster() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector((state) => state.toasts.items)
  const [deleteProduct] = useDeleteProductMutation()
  const [updateProduct] = useUpdateProductMutation()

  const items = useMemo<ToastItem[]>(
    () =>
      toasts.map((toast) => ({
        id: toast.id,
        kind: toast.kind,
        message: toast.message,
        actionLabel: toast.retry ? "Retry" : undefined,
      })),
    [toasts],
  )

  const handleDismiss = useCallback((id: string) => dispatch(toastDismissed(id)), [dispatch])

  const handleAction = useCallback(
    (id: string) => {
      const toast = toasts.find((item) => item.id === id)
      dispatch(toastDismissed(id))
      if (!toast?.retry) return

      if (toast.retry.type === "delete") {
        void deleteProduct({ id: toast.retry.productId, title: toast.retry.title })
      } else {
        void updateProduct({ id: toast.retry.productId, title: toast.retry.title, patch: toast.retry.patch })
      }
    },
    [toasts, dispatch, deleteProduct, updateProduct],
  )

  return <Toaster toasts={items} onDismiss={handleDismiss} onAction={handleAction} />
}
