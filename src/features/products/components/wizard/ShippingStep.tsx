"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { CheckboxField, TextareaField, TextField } from "@/components/ui/fields"
import type { ProductWizardValues } from "../../schemas/productSchemas"

export function ShippingStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProductWizardValues>()
  const isFragile = useWatch({ control, name: "requiresFragileHandling" })

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Weight (kg)"
          type="number"
          step="0.01"
          min="0"
          required
          error={errors.weight?.message}
          {...register("weight", { valueAsNumber: true })}
        />
        <TextField
          label="Width (cm)"
          type="number"
          step="0.1"
          min="0"
          required
          error={errors.width?.message}
          {...register("width", { valueAsNumber: true })}
        />
        <TextField
          label="Height (cm)"
          type="number"
          step="0.1"
          min="0"
          required
          error={errors.height?.message}
          {...register("height", { valueAsNumber: true })}
        />
        <TextField
          label="Depth (cm)"
          type="number"
          step="0.1"
          min="0"
          required
          error={errors.depth?.message}
          {...register("depth", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-5 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <CheckboxField
          label="Requires special fragile handling"
          description="Enables mandatory shipping disclosures."
          {...register("requiresFragileHandling", { deps: ["hazardousDisclaimer", "shippingNotes"] })}
        />
        {isFragile ? (
          <div className="space-y-5 border-t border-slate-200 pt-5">
            <CheckboxField
              label="I confirm the hazardous material disclaimer"
              description="This product has been declared and packaged according to hazardous material shipping rules."
              error={errors.hazardousDisclaimer?.message}
              {...register("hazardousDisclaimer")}
            />
            <TextareaField
              label="Special shipping notes"
              required
              placeholder="Packaging, carrier or handling instructions"
              hint="At least 10 characters."
              error={errors.shippingNotes?.message}
              {...register("shippingNotes")}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
