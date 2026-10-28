import type { ReactNode } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { ProductsToaster } from "@/features/products/components/ProductsToaster"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <ProductsToaster />
    </>
  )
}
