import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import type { OptimisticOperation } from "../store/optimisticSlice"
import type { Product } from "../types"
import { formatCategoryName } from "../utils/inventoryStats"
import { NewBadge, PriceTag, ProductActions, StockBadge, StockCount } from "./ProductBits"

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

function CategoryChip({ category }: Readonly<{ category: string }>) {
  return (
    <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      {formatCategoryName(category)}
    </span>
  )
}

const headClass = "px-3 py-3 font-medium sm:px-4"
const cellClass = "px-3 py-3 sm:px-4"

export function ProductTable({ products, operations, onEdit, onDelete }: Readonly<ProductListProps>) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th scope="col" className={headClass}>
                Product
              </th>
              <th scope="col" className={cn(headClass, "hidden xl:table-cell")}>
                SKU
              </th>
              <th scope="col" className={cn(headClass, "hidden md:table-cell")}>
                Category
              </th>
              <th scope="col" className={cn(headClass, "hidden sm:table-cell")}>
                Stock
              </th>
              <th scope="col" className={headClass}>
                Price
              </th>
              <th scope="col" className={cn(headClass, "hidden sm:table-cell")}>
                Status
              </th>
              <th scope="col" className={cn(headClass, "text-right")}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
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
                  <td className={cellClass}>
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.thumbnail}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 shrink-0 rounded-lg bg-slate-100 object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center">
                          <Link
                            href={`/products/${product.id}`}
                            className="block max-w-[9.5rem] truncate font-medium text-slate-900 hover:text-brand-700 sm:max-w-[14rem]"
                          >
                            {product.title}
                          </Link>
                          <NewBadge id={product.id} />
                        </div>
                        <p className="truncate text-xs text-slate-500">{product.brand ?? "No brand"}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500 sm:hidden">
                          <StockBadge stock={product.stock} />
                          <span className="whitespace-nowrap">{product.stock} units</span>
                        </p>
                        <RowStatus operation={operation} />
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 xl:table-cell">{product.sku}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <CategoryChip category={product.category} />
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <StockCount stock={product.stock} />
                  </td>
                  <td className={cellClass}>
                    <PriceTag price={product.price} discountPercentage={product.discountPercentage} />
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className={cellClass}>
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
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const operation = operations[product.id]
        return (
          <li
            key={product.id}
            className={cn(
              "flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 transition-shadow hover:shadow-md",
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
                className="h-40 w-full object-contain"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="min-w-0">
                <CategoryChip category={product.category} />
                <div className="mt-2 flex items-center">
                  <Link
                    href={`/products/${product.id}`}
                    className="block truncate font-medium text-slate-900 hover:text-brand-700"
                  >
                    {product.title}
                  </Link>
                  <NewBadge id={product.id} />
                </div>
                <RowStatus operation={operation} />
              </div>
              <div className="flex items-center justify-between">
                <PriceTag price={product.price} discountPercentage={product.discountPercentage} />
                <span className="text-sm text-slate-500">★ {product.rating.toFixed(1)}</span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <StockCount stock={product.stock} />
                  <StockBadge stock={product.stock} />
                </span>
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
