import Image from "next/image"
import { PLACEHOLDER_THUMBNAIL } from "../../utils/createdProduct"
import { formatCategoryName } from "../../utils/inventoryStats"
import { PriceTag, StockBadge } from "../ProductBits"

interface ProductPreviewProps {
  image: string
  title: string
  brand: string
  category: string
  description: string
  price: number | undefined
  discountPercentage: number
  stock: number | undefined
  variationCount: number
}

export function ProductPreview(props: Readonly<ProductPreviewProps>) {
  const { image, title, brand, category, description, price, discountPercentage, stock, variationCount } = props

  return (
    <section aria-label="Product preview" className="overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <h3 className="text-base font-semibold text-slate-900">Product preview</h3>
        <span className="text-xs text-slate-500">How it will appear in your inventory</span>
      </div>
      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        <Image
          src={image || PLACEHOLDER_THUMBNAIL}
          alt=""
          width={160}
          height={120}
          className="h-32 w-full shrink-0 rounded-lg bg-slate-100 object-cover sm:w-40"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {category ? formatCategoryName(category) : "No category"}
            </span>
            <span className="text-xs text-slate-500">{brand || "No brand"}</span>
          </div>
          <p className="break-words text-lg font-semibold text-slate-900">{title || "Untitled product"}</p>
          <p className="line-clamp-2 text-sm text-slate-600">{description || "No description"}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            {typeof price === "number" ? <PriceTag price={price} discountPercentage={discountPercentage} /> : null}
            {typeof stock === "number" ? (
              <span className="flex items-center gap-2 text-sm text-slate-600">
                {stock} units <StockBadge stock={stock} />
              </span>
            ) : null}
            <span className="text-sm text-slate-500">
              {variationCount} {variationCount === 1 ? "variation" : "variations"}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
