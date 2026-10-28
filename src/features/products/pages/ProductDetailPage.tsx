"use client"

import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/Skeleton"
import { formatCurrency, getDiscountedPrice } from "@/lib/utils/format"
import { EmptyState } from "../components/ProductsStates"
import { StockBadge } from "../components/ProductBits"
import { useGetProductByIdQuery } from "../services/productsApi"

export function ProductDetailPage({ id }: Readonly<{ id: number }>) {
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id)

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2" aria-busy="true">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return <EmptyState title="Product not found" description="This product doesn't exist or was removed." />
  }

  const finalPrice = getDiscountedPrice(product.price, product.discountPercentage)

  return (
    <div className="space-y-6">
      <Link href="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Back to products
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Image
            src={product.images[0] ?? product.thumbnail}
            alt={product.title}
            width={640}
            height={640}
            priority
            className="mx-auto aspect-square w-full object-contain"
          />
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-sm capitalize text-slate-500">{product.category.replace(/-/g, " ")}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{product.title}</h1>
            {product.brand ? <p className="mt-1 text-slate-500">by {product.brand}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-slate-900">{formatCurrency(finalPrice)}</span>
            {product.discountPercentage > 0 ? (
              <>
                <span className="text-slate-400 line-through">{formatCurrency(product.price)}</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  -{product.discountPercentage}%
                </span>
              </>
            ) : null}
            <StockBadge stock={product.stock} />
          </div>
          <p className="text-slate-600">{product.description}</p>
          <dl className="grid grid-cols-2 gap-4 rounded-xl bg-white p-5 text-sm shadow-sm ring-1 ring-slate-200">
            <div>
              <dt className="text-slate-500">SKU</dt>
              <dd className="font-medium text-slate-900">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Rating</dt>
              <dd className="font-medium text-slate-900">★ {product.rating.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Weight</dt>
              <dd className="font-medium text-slate-900">{product.weight} kg</dd>
            </div>
            <div>
              <dt className="text-slate-500">Dimensions</dt>
              <dd className="font-medium text-slate-900">
                {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Shipping</dt>
              <dd className="font-medium text-slate-900">{product.shippingInformation}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Warranty</dt>
              <dd className="font-medium text-slate-900">{product.warrantyInformation}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
