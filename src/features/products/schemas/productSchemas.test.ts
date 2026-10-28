import { describe, expect, it } from "vitest"
import { ValidationError } from "yup"
import {
  basicInfoSchema,
  getStepForField,
  pricingSchema,
  productEditSchema,
  productWizardSchema,
  shippingSchema,
  SKU_PATTERN,
  variationSchema,
} from "./productSchemas"

async function errorsOf(
  schema: { validate: (value: unknown, options: { abortEarly: false }) => Promise<unknown> },
  value: unknown,
) {
  try {
    await schema.validate(value, { abortEarly: false })
    return {} as Record<string, string>
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error
    const messages: Record<string, string> = {}
    error.inner.forEach((item) => {
      const path = item.path ?? ""
      if (!(path in messages)) messages[path] = item.message
    })
    return messages
  }
}

const validVariation = { color: "Red", size: "M", sku: "SKU-RED-1001", extraPrice: 0 }

const validShipping = {
  weight: 1.5,
  width: 10,
  height: 20,
  depth: 5,
  requiresFragileHandling: false,
  hazardousDisclaimer: false,
  shippingNotes: "",
}

describe("basicInfoSchema", () => {
  const valid = {
    title: "Wireless Mouse",
    brand: "Logi",
    category: "mice",
    description: "A comfortable wireless mouse.",
  }

  it("accepts valid data", async () => {
    await expect(basicInfoSchema.isValid(valid)).resolves.toBe(true)
  })

  it("enforces title length boundaries", async () => {
    expect((await errorsOf(basicInfoSchema, { ...valid, title: "ab" })).title).toMatch(/at least 3/)
    expect((await errorsOf(basicInfoSchema, { ...valid, title: "a".repeat(101) })).title).toMatch(/at most 100/)
    await expect(basicInfoSchema.isValid({ ...valid, title: "abc" })).resolves.toBe(true)
    await expect(basicInfoSchema.isValid({ ...valid, title: "a".repeat(100) })).resolves.toBe(true)
  })

  it("requires brand and category and a 20 character description", async () => {
    const errors = await errorsOf(basicInfoSchema, {
      title: "Valid",
      brand: " ",
      category: "",
      description: "too short",
    })
    expect(errors.brand).toBe("Brand is required")
    expect(errors.category).toBe("Select a category")
    expect(errors.description).toMatch(/at least 20/)
  })
})

describe("variationSchema", () => {
  it.each(["SKU-RED-1001", "SKU-ABC-0000"])("accepts %s", async (sku) => {
    await expect(variationSchema.isValid({ ...validVariation, sku })).resolves.toBe(true)
  })

  it.each(["sku-red-1001", "SKU-RE-1001", "SKU-REDD-1001", "SKU-RED-100", "SKU-RED-10011", "RED-1001", "SKU-R3D-1001"])(
    "rejects %s",
    async (sku) => {
      expect(SKU_PATTERN.test(sku)).toBe(false)
      const errors = await errorsOf(variationSchema, { ...validVariation, sku })
      expect(errors.sku).toMatch(/SKU-ABC-1234/)
    },
  )

  it("rejects negative extra price", async () => {
    expect((await errorsOf(variationSchema, { ...validVariation, extraPrice: -1 })).extraPrice).toMatch(/negative/)
  })
})

describe("pricingSchema", () => {
  const valid = { price: 10, stock: 5, discountPercentage: 10, variations: [validVariation] }

  it("accepts valid data", async () => {
    await expect(pricingSchema.isValid(valid)).resolves.toBe(true)
  })

  it("requires price greater than zero", async () => {
    expect((await errorsOf(pricingSchema, { ...valid, price: 0 })).price).toMatch(/greater than 0/)
    expect((await errorsOf(pricingSchema, { ...valid, price: -5 })).price).toMatch(/greater than 0/)
    await expect(pricingSchema.isValid({ ...valid, price: 0.01 })).resolves.toBe(true)
  })

  it("treats empty or NaN numeric input as missing", async () => {
    expect((await errorsOf(pricingSchema, { ...valid, price: "" })).price).toBe("Base price is required")
    expect((await errorsOf(pricingSchema, { ...valid, price: Number.NaN })).price).toBe("Base price is required")
    expect((await errorsOf(pricingSchema, { ...valid, stock: null })).stock).toBe("Stock quantity is required")
  })

  it("requires whole, non-negative stock", async () => {
    expect((await errorsOf(pricingSchema, { ...valid, stock: 1.5 })).stock).toMatch(/whole number/)
    expect((await errorsOf(pricingSchema, { ...valid, stock: -1 })).stock).toMatch(/negative/)
    await expect(pricingSchema.isValid({ ...valid, stock: 0 })).resolves.toBe(true)
  })

  it("keeps discount optional but bounded between 0 and 99", async () => {
    await expect(pricingSchema.isValid({ ...valid, discountPercentage: undefined })).resolves.toBe(true)
    await expect(pricingSchema.isValid({ ...valid, discountPercentage: "" })).resolves.toBe(true)
    await expect(pricingSchema.isValid({ ...valid, discountPercentage: 0 })).resolves.toBe(true)
    await expect(pricingSchema.isValid({ ...valid, discountPercentage: 99 })).resolves.toBe(true)
    expect((await errorsOf(pricingSchema, { ...valid, discountPercentage: 100 })).discountPercentage).toMatch(
      /0 and 99/,
    )
    expect((await errorsOf(pricingSchema, { ...valid, discountPercentage: -1 })).discountPercentage).toMatch(/0 and 99/)
  })

  it("flags every duplicate SKU on the matching row", async () => {
    const variations = [
      validVariation,
      { ...validVariation, color: "Blue", sku: "SKU-BLU-2002" },
      { ...validVariation, color: "Green", size: "L", sku: "SKU-RED-1001" },
    ]
    const errors = await errorsOf(pricingSchema, { ...valid, variations })
    expect(errors["variations[0].sku"]).toBe("Duplicate SKU code")
    expect(errors["variations[2].sku"]).toBe("Duplicate SKU code")
    expect(errors["variations[1].sku"]).toBeUndefined()
  })

  it("allows an empty variations list", async () => {
    await expect(pricingSchema.isValid({ ...valid, variations: [] })).resolves.toBe(true)
  })
})

describe("shippingSchema", () => {
  it("accepts non-fragile items without disclosures", async () => {
    await expect(shippingSchema.isValid(validShipping)).resolves.toBe(true)
  })

  it("requires positive weight and dimensions", async () => {
    const errors = await errorsOf(shippingSchema, { ...validShipping, weight: 0, width: -1, height: "", depth: 0 })
    expect(errors.weight).toMatch(/greater than 0/)
    expect(errors.width).toMatch(/greater than 0/)
    expect(errors.height).toBe("Height is required")
    expect(errors.depth).toMatch(/greater than 0/)
  })

  it("requires the disclaimer and notes when fragile handling is checked", async () => {
    const errors = await errorsOf(shippingSchema, { ...validShipping, requiresFragileHandling: true })
    expect(errors.hazardousDisclaimer).toMatch(/Accept the hazardous/)
    expect(errors.shippingNotes).toMatch(/required for fragile/)
  })

  it("enforces the 10 character minimum for shipping notes when fragile", async () => {
    const fragile = { ...validShipping, requiresFragileHandling: true, hazardousDisclaimer: true }
    expect((await errorsOf(shippingSchema, { ...fragile, shippingNotes: "short" })).shippingNotes).toMatch(
      /at least 10/,
    )
    await expect(shippingSchema.isValid({ ...fragile, shippingNotes: "Handle with care" })).resolves.toBe(true)
  })

  it("ignores disclosures when fragile handling is not checked", async () => {
    await expect(
      shippingSchema.isValid({ ...validShipping, shippingNotes: "x", hazardousDisclaimer: false }),
    ).resolves.toBe(true)
  })
})

describe("productWizardSchema", () => {
  it("validates the combined payload", async () => {
    const value = {
      title: "Wireless Mouse",
      brand: "Logi",
      category: "mice",
      description: "A comfortable wireless mouse.",
      price: "19.5",
      stock: "10",
      variations: [validVariation],
      ...validShipping,
    }
    await expect(productWizardSchema.isValid(value)).resolves.toBe(true)
    expect(productWizardSchema.cast(value)).toMatchObject({ price: 19.5, stock: 10 })
  })
})

describe("productEditSchema", () => {
  it("validates quick edit values", async () => {
    await expect(productEditSchema.isValid({ title: "Mouse", price: 5, stock: 1 })).resolves.toBe(true)
    expect((await errorsOf(productEditSchema, { title: "Mouse", price: 0, stock: 1 })).price).toMatch(/greater than 0/)
  })
})

describe("getStepForField", () => {
  it.each([
    ["title", 0],
    ["category", 0],
    ["price", 1],
    ["variations", 1],
    ["variations.2.sku", 1],
    ["variations[0].sku", 1],
    ["weight", 2],
    ["shippingNotes", 2],
    ["unknown", 0],
  ])("maps %s to step %i", (field, step) => {
    expect(getStepForField(field)).toBe(step)
  })
})
