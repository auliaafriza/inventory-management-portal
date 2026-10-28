"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { SelectField, TextareaField, TextField } from "@/components/ui/fields"
import { useGetCategoriesQuery } from "../../services/productsApi"
import { ImageField } from "./ImageField"
import type { ProductWizardValues } from "../../schemas/productSchemas"

export function BasicInfoStep() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ProductWizardValues>()
  const image = useWatch({ control, name: "image" }) ?? ""
  const { data: categories = [], isLoading, isError } = useGetCategoriesQuery()

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <ImageField value={image} onChange={(value) => setValue("image", value, { shouldDirty: true })} />
      <TextField
        label="Product title"
        required
        fieldClassName="sm:col-span-2"
        placeholder="e.g. Wireless noise-cancelling headphones"
        error={errors.title?.message}
        {...register("title")}
      />
      <TextField label="Brand" required placeholder="e.g. Sonic" error={errors.brand?.message} {...register("brand")} />
      <SelectField
        label="Category"
        required
        disabled={isLoading}
        placeholder={isLoading ? "Loading categories…" : "Choose a category"}
        error={
          errors.category?.message ?? (isError ? "Categories could not be loaded. Refresh to try again." : undefined)
        }
        {...register("category")}
      >
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </SelectField>
      <TextareaField
        label="Description"
        required
        fieldClassName="sm:col-span-2"
        placeholder="Describe the product, key features and what's included"
        hint="At least 20 characters."
        error={errors.description?.message}
        {...register("description")}
      />
    </div>
  )
}
