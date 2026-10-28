import type { CreateProductPayload, Product, ProductFilters, ProductPatch } from "../types"
import { matchesSearch } from "./productsRequest"
import type { InventoryItem } from "./inventoryStats"

export const CREATED_ID_START = 1001
export const PLACEHOLDER_THUMBNAIL = "/product-placeholder.svg"

export function nextCreatedId(created: Product[]): number {
  return Math.max(CREATED_ID_START - 1, ...created.map((product) => product.id)) + 1
}

export function buildCreatedProduct(payload: CreateProductPayload, id: number): Product {
  return {
    id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    price: payload.price,
    discountPercentage: payload.discountPercentage,
    rating: 0,
    stock: payload.stock,
    tags: [],
    brand: payload.brand,
    sku: payload.variations[0]?.sku ?? `SKU-NEW-${String(id).padStart(4, "0")}`,
    weight: payload.weight,
    dimensions: payload.dimensions,
    warrantyInformation: "Not specified",
    shippingInformation: payload.requiresFragileHandling ? payload.shippingNotes : "Standard shipping",
    availabilityStatus: payload.stock > 0 ? "In Stock" : "Out of Stock",
    reviews: [],
    returnPolicy: "Not specified",
    minimumOrderQuantity: 1,
    thumbnail: payload.image || PLACEHOLDER_THUMBNAIL,
    images: [payload.image || PLACEHOLDER_THUMBNAIL],
  }
}

export function isCreatedId(id: number): boolean {
  return id >= CREATED_ID_START
}

export function selectCreatedForFilters(
  created: Product[],
  overrides: { deletedIds: number[]; edits: Record<number, ProductPatch> },
  filters: Pick<ProductFilters, "search" | "category">,
): Product[] {
  const deleted = new Set(overrides.deletedIds)
  const term = filters.search.trim().toLowerCase()

  return created
    .filter((product) => !deleted.has(product.id))
    .map((product) => ({ ...product, ...overrides.edits[product.id] }))
    .filter(
      (product) =>
        (!filters.category || product.category === filters.category) && (!term || matchesSearch(product, term)),
    )
}

export interface CreatedPagePlan {
  fromCreated: Product[]
  skip: number
  limit: number
}

export function planCreatedPaging(createdMatches: Product[], page: number, pageSize: number): CreatedPagePlan {
  const pageStart = (page - 1) * pageSize
  const fromCreated = createdMatches.slice(pageStart, pageStart + pageSize)

  return {
    fromCreated,
    skip: Math.max(0, pageStart - createdMatches.length),
    limit: pageSize - fromCreated.length,
  }
}

export function createdToInventoryItems(created: Product[]): InventoryItem[] {
  return created.map((product) => ({
    id: product.id,
    title: product.title,
    sku: product.sku,
    category: product.category,
    price: product.price,
    stock: product.stock,
    discountPercentage: product.discountPercentage,
    thumbnail: product.thumbnail,
  }))
}
