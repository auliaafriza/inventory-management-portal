"use client"

import { useRef, type ReactNode } from "react"
import { Provider } from "react-redux"
import { makeStore, type AppStore } from "@/store"

export function StoreProvider({ children }: Readonly<{ children: ReactNode }>) {
  const storeRef = useRef<AppStore | null>(null)
  storeRef.current ??= makeStore()

  return <Provider store={storeRef.current}>{children}</Provider>
}
