export interface ProductDimensions {
  width: number
  height: number
  depth: number
}

export interface ProductReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand?: string
  sku: string
  weight: number
  dimensions: ProductDimensions
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: ProductReview[]
  returnPolicy: string
  minimumOrderQuantity: number
  thumbnail: string
  images: string[]
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export interface ProductCategory {
  slug: string
  name: string
  url: string
}

export type SortKey = "" | "price_asc" | "price_desc" | "title_asc" | "title_desc" | "rating_desc" | "stock_asc"

export type ProductView = "table" | "cards"

export interface ProductFilters {
  search: string
  category: string
  sort: SortKey
  page: number
}

export type ProductPatch = Partial<Pick<Product, "title" | "price" | "stock" | "discountPercentage">>

export interface DeletedProduct extends Product {
  isDeleted: boolean
  deletedOn: string
}

export interface CreatedProduct {
  id: number
  title: string
  [key: string]: unknown
}

export interface CreateProductPayload {
  title: string
  brand: string
  category: string
  description: string
  price: number
  stock: number
  discountPercentage: number
  variations: { color: string; size: string; sku: string; extraPrice: number }[]
  weight: number
  dimensions: ProductDimensions
  requiresFragileHandling: boolean
  hazardousDisclaimer: boolean
  shippingNotes: string
}
