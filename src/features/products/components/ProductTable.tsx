import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import type { OptimisticOperation } from "../store/optimisticSlice"
import type { Product } from "../types"
import { PriceTag, ProductActions, StockBadge } from "./ProductBits"

interface ProductListProps {
  products: Product[]
  operations: Record<number, OptimisticOperation>
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function RowStatus({ operation }: Readonly<{ operation?: OptimisticOperation }>) {
  if (operation?.status === "pending") return <span className="text-xs text-brand-600">Saving…</span>
  if (operation?.status === "failed") return <span className="text-xs text-red-600">Failed, changes reverted</span>
  return null
}

export function ProductTable({ products, operations, onEdit, onDelete }: Readonly<ProductListProps>) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                Product
              </th>
              <th scope="col" className="hidden px-4 py-3 md:table-cell">
                Category
              </th>
              <th scope="col" className="px-4 py-3">
                Price
              </th>
              <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                Stock
              </th>
              <th scope="col" className="hidden px-4 py-3 lg:table-cell">
                Rating
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const operation = operations[product.id]
              return (
                <tr
                  key={product.id}
                  className={cn(
                    "transition-colors hover:bg-slate-50",
                    operation?.status === "pending" && "opacity-60",
                    operation?.status === "failed" && "bg-red-50/60",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.thumbnail}
                        alt=""
                        width={44}
                        height={44}
                        className="size-11 shrink-0 rounded-lg bg-slate-100 object-cover"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/products/${product.id}`}
                          className="block truncate font-medium text-slate-900 hover:text-brand-600"
                        >
                          {product.title}
                        </Link>
                        <p className="truncate text-xs text-slate-500">{product.brand ?? product.sku}</p>
                        <RowStatus operation={operation} />
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 capitalize text-slate-600 md:table-cell">
                    {product.category.replace(/-/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <PriceTag price={product.price} discountPercentage={product.discountPercentage} />
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">★ {product.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ProductActions
                        product={product}
                        disabled={operation?.status === "pending"}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ProductCards({ products, operations, onEdit, onDelete }: Readonly<ProductListProps>) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => {
        const operation = operations[product.id]
        return (
          <li
            key={product.id}
            className={cn(
              "flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md",
              operation?.status === "pending" && "opacity-60",
              operation?.status === "failed" && "ring-red-300",
            )}
          >
            <Link href={`/products/${product.id}`} className="block bg-slate-100">
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={320}
                height={240}
                className="h-44 w-full object-contain"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="min-w-0">
                <p className="text-xs capitalize text-slate-500">{product.category.replace(/-/g, " ")}</p>
                <Link
                  href={`/products/${product.id}`}
                  className="mt-0.5 block truncate font-medium text-slate-900 hover:text-brand-600"
                >
                  {product.title}
                </Link>
                <RowStatus operation={operation} />
              </div>
              <div className="flex items-center justify-between">
                <PriceTag price={product.price} discountPercentage={product.discountPercentage} />
                <span className="text-sm text-slate-500">★ {product.rating.toFixed(1)}</span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <StockBadge stock={product.stock} />
                <ProductActions
                  product={product}
                  disabled={operation?.status === "pending"}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
