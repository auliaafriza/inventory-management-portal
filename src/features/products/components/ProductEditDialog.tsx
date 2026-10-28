"use client"

import { useEffect } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/Button"
import { TextField } from "@/components/ui/fields"
import { Modal } from "@/components/ui/Modal"
import { productEditSchema, type ProductEditValues } from "../schemas/productSchemas"
import type { Product, ProductPatch } from "../types"

interface ProductEditDialogProps {
  product: Product | null
  onClose: () => void
  onSubmit: (product: Product, patch: ProductPatch) => void
}

function toFormValues(product: Product): ProductEditValues {
  return {
    title: product.title,
    price: product.price,
    stock: product.stock,
    discountPercentage: product.discountPercentage,
  }
}

export function buildPatch(product: Product, values: ProductEditValues): ProductPatch {
  const patch: ProductPatch = {}
  if (values.title !== product.title) patch.title = values.title
  if (values.price !== product.price) patch.price = values.price
  if (values.stock !== product.stock) patch.stock = values.stock
  const discount = values.discountPercentage ?? 0
  if (discount !== product.discountPercentage) patch.discountPercentage = discount
  return patch
}

export function ProductEditDialog({ product, onClose, onSubmit }: Readonly<ProductEditDialogProps>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductEditValues>({
    resolver: yupResolver(productEditSchema),
    mode: "onChange",
  })

  useEffect(() => {
    if (product) reset(toFormValues(product))
  }, [product, reset])

  const submit = handleSubmit((values) => {
    if (!product) return
    onSubmit(product, buildPatch(product, values))
    onClose()
  })

  return (
    <Modal
      open={product !== null}
      title="Edit product"
      description="Changes appear instantly and sync in the background."
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField label="Title" required error={errors.title?.message} {...register("title")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Price (USD)"
            type="number"
            step="0.01"
            required
            error={errors.price?.message}
            {...register("price", { valueAsNumber: true })}
          />
          <TextField
            label="Stock"
            type="number"
            step="1"
            min="0"
            required
            error={errors.stock?.message}
            {...register("stock", { valueAsNumber: true })}
          />
        </div>
        <TextField
          label="Discount (%)"
          type="number"
          step="0.01"
          error={errors.discountPercentage?.message}
          {...register("discountPercentage", { valueAsNumber: true })}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
