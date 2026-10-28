import type { Product, ProductCategory, ProductsResponse } from "@/features/products/types"

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: "Essence Mascara Lash Princess",
    description: "A popular mascara known for its volumizing and lengthening effects.",
    category: "beauty",
    price: 9.99,
    discountPercentage: 7.17,
    rating: 4.94,
    stock: 5,
    tags: ["beauty", "mascara"],
    brand: "Essence",
    sku: "BEA-ESS-ESS-001",
    weight: 2,
    dimensions: { width: 23.17, height: 14.43, depth: 28.01 },
    warrantyInformation: "1 week warranty",
    shippingInformation: "Ships in 3-5 business days",
    availabilityStatus: "Low Stock",
    reviews: [],
    returnPolicy: "30 days return policy",
    minimumOrderQuantity: 24,
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
    images: [],
    ...overrides,
  }
}

export const PRODUCTS: Product[] = [
  makeProduct({ id: 1, title: "Essence Mascara", category: "beauty", price: 9.99, stock: 5 }),
  makeProduct({ id: 2, title: "iPhone 13 Pro", category: "smartphones", brand: "Apple", price: 1099, stock: 40 }),
  makeProduct({ id: 3, title: "Samsung Galaxy S8", category: "smartphones", brand: "Samsung", price: 799, stock: 0 }),
  makeProduct({ id: 4, title: "Red Lipstick", category: "beauty", price: 12.99, stock: 120 }),
]

export const CATEGORIES: ProductCategory[] = [
  { slug: "beauty", name: "Beauty", url: "https://dummyjson.com/products/category/beauty" },
  { slug: "smartphones", name: "Smartphones", url: "https://dummyjson.com/products/category/smartphones" },
  { slug: "laptops", name: "Laptops", url: "https://dummyjson.com/products/category/laptops" },
]

export function toResponse(products: Product[], skip = 0, limit = 10, total = products.length): ProductsResponse {
  return { products: products.slice(skip, skip + limit), total, skip, limit }
}
