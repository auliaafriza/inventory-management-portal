import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { CheckIcon } from "@/components/ui/icons"
import type { CreatedProduct } from "../../types"

interface SubmittedPanelProps {
  product: CreatedProduct
  onCreateAnother: () => void
}

export function SubmittedPanel({ product, onCreateAnother }: Readonly<SubmittedPanelProps>) {
  return (
    <div
      role="status"
      className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckIcon className="size-7" />
      </span>
      <h2 className="mt-5 text-xl font-semibold text-slate-900">Product created</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        &ldquo;{product.title}&rdquo; was submitted successfully with reference ID <strong>#{product.id}</strong>. The
        demo API does not store new records permanently.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={onCreateAnother}>
          Add another product
        </Button>
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          Back to products
        </Link>
      </div>
    </div>
  )
}
