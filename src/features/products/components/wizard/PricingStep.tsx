"use client"

import { useFormContext } from "react-hook-form"
import { TextField } from "@/components/ui/fields"
import type { ProductWizardValues } from "../../schemas/productSchemas"
import { VariationsField } from "./VariationsField"

export function PricingStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductWizardValues>()

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          label="Base price (USD)"
          type="number"
          step="0.01"
          min="0"
          required
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
        <TextField
          label="Stock quantity"
          type="number"
          step="1"
          min="0"
          required
          error={errors.stock?.message}
          {...register("stock", { valueAsNumber: true })}
        />
        <TextField
          label="Discount (%)"
          type="number"
          step="0.01"
          min="0"
          max="99"
          hint="Optional, 0 to 99."
          error={errors.discountPercentage?.message}
          {...register("discountPercentage", { valueAsNumber: true })}
        />
      </div>
      <VariationsField />
    </div>
  )
}
