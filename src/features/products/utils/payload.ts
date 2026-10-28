import type { CreateProductPayload } from "../types"
import type { ProductWizardValues } from "../schemas/productSchemas"

export function buildCreatePayload(values: ProductWizardValues): CreateProductPayload {
  return {
    title: values.title.trim(),
    brand: values.brand.trim(),
    category: values.category,
    description: values.description.trim(),
    price: values.price,
    stock: values.stock,
    discountPercentage: values.discountPercentage ?? 0,
    variations: values.variations.map((variation) => ({
      color: variation.color.trim(),
      size: variation.size.trim(),
      sku: variation.sku.trim().toUpperCase(),
      extraPrice: variation.extraPrice,
    })),
    weight: values.weight,
    dimensions: { width: values.width, height: values.height, depth: values.depth },
    requiresFragileHandling: values.requiresFragileHandling,
    hazardousDisclaimer: values.requiresFragileHandling ? values.hazardousDisclaimer : false,
    shippingNotes: values.requiresFragileHandling ? values.shippingNotes.trim() : "",
  }
}
