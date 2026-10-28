import { Suspense } from "react"
import type { Metadata } from "next"
import { ProductsSkeleton } from "@/features/products/components/ProductsSkeleton"
import { ProductsPage } from "@/features/products/pages/ProductsPage"

export const metadata: Metadata = { title: "Products" }

export default function Page() {
  return (
    <Suspense fallback={<ProductsSkeleton view="table" />}>
      <ProductsPage />
    </Suspense>
  )
}
