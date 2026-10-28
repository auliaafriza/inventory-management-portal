import type { ReactNode } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { ProductsToaster } from "@/features/products/components/ProductsToaster"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShell>
      {children}
      <ProductsToaster />
    </AppShell>
  )
}
