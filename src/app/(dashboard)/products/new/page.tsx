import type { Metadata } from "next"
import { ProductWizardPage } from "@/features/products/pages/ProductWizardPage"

export const metadata: Metadata = { title: "New product" }

export default function Page() {
  return <ProductWizardPage />
}
