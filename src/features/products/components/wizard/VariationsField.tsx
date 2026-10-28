"use client"

import { memo } from "react"
import { useFieldArray, useFormContext, useFormState, type Control, type UseFormRegister } from "react-hook-form"
import { Button, iconButtonClass } from "@/components/ui/Button"
import { TextField } from "@/components/ui/fields"
import { PlusIcon, TrashIcon } from "@/components/ui/icons"
import { MAX_VARIATIONS } from "../../constants"
import { EMPTY_VARIATION, type ProductWizardValues } from "../../schemas/productSchemas"

interface VariationRowProps {
  index: number
  control: Control<ProductWizardValues>
  register: UseFormRegister<ProductWizardValues>
  onRemove: (index: number) => void
}

const VariationRow = memo(function VariationRow({ index, control, register, onRemove }: Readonly<VariationRowProps>) {
  const { errors } = useFormState({ control, name: `variations.${index}` })
  const rowErrors = errors.variations?.[index]

  return (
    <li className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Variation {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className={iconButtonClass}
          aria-label={`Remove variation ${index + 1}`}
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Color"
          placeholder="Red"
          error={rowErrors?.color?.message}
          {...register(`variations.${index}.color`)}
        />
        <TextField
          label="Size"
          placeholder="M"
          error={rowErrors?.size?.message}
          {...register(`variations.${index}.size`)}
        />
        <TextField
          label="SKU code"
          placeholder="SKU-RED-1001"
          autoCapitalize="characters"
          error={rowErrors?.sku?.message}
          {...register(`variations.${index}.sku`)}
        />
        <TextField
          label="Extra price (USD)"
          type="number"
          step="0.01"
          min="0"
          error={rowErrors?.extraPrice?.message}
          {...register(`variations.${index}.extraPrice`, { valueAsNumber: true })}
        />
      </div>
    </li>
  )
})

export function VariationsField() {
  const { control, register } = useFormContext<ProductWizardValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "variations" })
  const { errors } = useFormState({ control, name: "variations" })
  const rootMessage = errors.variations?.root?.message ?? errors.variations?.message

  return (
    <section aria-labelledby="variations-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 id="variations-heading" className="text-base font-semibold text-slate-900">
            SKU variations
          </h3>
          <p className="text-sm text-slate-500">Optional. Add colors, sizes and unique SKU codes.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={fields.length >= MAX_VARIATIONS}
          onClick={() => append(EMPTY_VARIATION, { shouldFocus: true })}
        >
          <PlusIcon className="size-4" />
          Add variation
        </Button>
      </div>

      {rootMessage ? (
        <p role="alert" className="text-sm text-red-600">
          {rootMessage}
        </p>
      ) : null}

      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          No variations yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <VariationRow key={field.id} index={index} control={control} register={register} onRemove={remove} />
          ))}
        </ul>
      )}
    </section>
  )
}
