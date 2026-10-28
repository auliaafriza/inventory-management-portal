"use client"

import type { ReactNode } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/Button"
import { CheckboxField } from "@/components/ui/fields"
import { formatCurrency } from "@/lib/utils/format"
import { productWizardSchema, type ProductWizardValues } from "../../schemas/productSchemas"
import { useGetCategoriesQuery } from "../../services/productsApi"
import { ProductPreview } from "./ProductPreview"

interface ReviewSectionProps {
  title: string
  onEdit: () => void
  children: ReactNode
}

function ReviewSection({ title, onEdit, children }: Readonly<ReviewSectionProps>) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${title}`}>
          Edit
        </Button>
      </div>
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">{children}</dl>
    </section>
  )
}

function Row({ label, children, wide }: Readonly<{ label: string; children: ReactNode; wide?: boolean }>) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-slate-900">{children}</dd>
    </div>
  )
}

const money = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? formatCurrency(value) : "—"
const plain = (value: number | undefined, unit = "") =>
  typeof value === "number" && Number.isFinite(value) ? `${value}${unit}` : "—"

interface ReviewStepProps {
  onEdit: (step: number) => void
  confirmed: boolean
  onConfirmChange: (confirmed: boolean) => void
}

export function ReviewStep({ onEdit, confirmed, onConfirmChange }: Readonly<ReviewStepProps>) {
  const { getValues } = useFormContext<ProductWizardValues>()
  const { data: categories = [] } = useGetCategoriesQuery()
  const values = productWizardSchema.cast(getValues(), { assert: false }) as ProductWizardValues
  const categoryName = categories.find((category) => category.slug === values.category)?.name ?? values.category

  return (
    <div className="space-y-4">
      <ProductPreview
        image={values.image ?? ""}
        title={values.title}
        brand={values.brand}
        category={values.category}
        description={values.description}
        price={values.price}
        discountPercentage={values.discountPercentage ?? 0}
        stock={values.stock}
        variationCount={values.variations.length}
      />

      <ReviewSection title="Basic information" onEdit={() => onEdit(0)}>
        <Row label="Image">{values.image ? "Uploaded" : "Placeholder"}</Row>
        <Row label="Title">{values.title || "—"}</Row>
        <Row label="Brand">{values.brand || "—"}</Row>
        <Row label="Category">{categoryName || "—"}</Row>
        <Row label="Description" wide>
          {values.description || "—"}
        </Row>
      </ReviewSection>

      <ReviewSection title="Pricing & stock" onEdit={() => onEdit(1)}>
        <Row label="Base price">{money(values.price)}</Row>
        <Row label="Stock">{plain(values.stock, " units")}</Row>
        <Row label="Discount">{plain(values.discountPercentage ?? 0, "%")}</Row>
        <Row label="Variations" wide>
          {values.variations.length === 0 ? (
            "None"
          ) : (
            <ul className="mt-1 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
              {values.variations.map((variation, index) => (
                <li
                  key={`${variation.sku}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                >
                  <span>
                    {variation.color || "—"} / {variation.size || "—"}
                  </span>
                  <span className="font-mono text-xs text-slate-600">{variation.sku || "—"}</span>
                  <span>+{money(variation.extraPrice)}</span>
                </li>
              ))}
            </ul>
          )}
        </Row>
      </ReviewSection>

      <ReviewSection title="Shipping" onEdit={() => onEdit(2)}>
        <Row label="Weight">{plain(values.weight, " kg")}</Row>
        <Row label="Dimensions (W × H × D)">
          {plain(values.width)} × {plain(values.height)} × {plain(values.depth)} cm
        </Row>
        <Row label="Fragile handling">{values.requiresFragileHandling ? "Required" : "Not required"}</Row>
        {values.requiresFragileHandling ? (
          <>
            <Row label="Hazardous disclaimer">{values.hazardousDisclaimer ? "Accepted" : "Not accepted"}</Row>
            <Row label="Shipping notes" wide>
              {values.shippingNotes || "—"}
            </Row>
          </>
        ) : null}
      </ReviewSection>

      <div className="rounded-xl bg-brand-50/60 p-4 ring-1 ring-brand-100">
        <CheckboxField
          label="I have reviewed the preview and the details are correct"
          description="Nothing is created until you press Create product."
          checked={confirmed}
          onChange={(event) => onConfirmChange(event.target.checked)}
        />
      </div>
    </div>
  )
}
