import { notFound } from "next/navigation"
import { ProductDetailPage } from "@/features/products/pages/ProductDetailPage"

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId <= 0) notFound()

  return <ProductDetailPage id={productId} />
}
