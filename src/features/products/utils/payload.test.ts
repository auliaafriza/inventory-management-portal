import { describe, expect, it } from "vitest"
import type { ProductWizardValues } from "../schemas/productSchemas"
import { buildCreatePayload } from "./payload"

const values: ProductWizardValues = {
  image: "",
  title: "  Desk Lamp ",
  brand: " Lumen ",
  category: "home-decoration",
  description: " A bright and adjustable desk lamp. ",
  price: 49.9,
  stock: 12,
  discountPercentage: undefined,
  variations: [{ color: " Black ", size: "M", sku: "sku-blk-1001 ", extraPrice: 2 }],
  weight: 1.2,
  width: 20,
  height: 40,
  depth: 20,
  requiresFragileHandling: false,
  hazardousDisclaimer: true,
  shippingNotes: "left over",
}

describe("buildCreatePayload", () => {
  it("normalizes text, defaults the discount and nests dimensions", () => {
    expect(buildCreatePayload(values)).toEqual({
      image: "",
      title: "Desk Lamp",
      brand: "Lumen",
      category: "home-decoration",
      description: "A bright and adjustable desk lamp.",
      price: 49.9,
      stock: 12,
      discountPercentage: 0,
      variations: [{ color: "Black", size: "M", sku: "SKU-BLK-1001", extraPrice: 2 }],
      weight: 1.2,
      dimensions: { width: 20, height: 40, depth: 20 },
      requiresFragileHandling: false,
      hazardousDisclaimer: false,
      shippingNotes: "",
    })
  })

  it("keeps fragile disclosures when handling is required", () => {
    const payload = buildCreatePayload({ ...values, requiresFragileHandling: true, shippingNotes: " Pack in foam " })
    expect(payload).toMatchObject({
      requiresFragileHandling: true,
      hazardousDisclaimer: true,
      shippingNotes: "Pack in foam",
    })
  })
})
