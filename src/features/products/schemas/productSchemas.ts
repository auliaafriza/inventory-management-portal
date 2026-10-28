import * as yup from "yup"

export const SKU_PATTERN = /^SKU-[A-Z]{3}-[0-9]{4}$/

const emptyToUndefined = (value: unknown, original: unknown): unknown =>
  original === "" || original === null || original === undefined || Number.isNaN(value) ? undefined : value

const numberField = (label: string) => yup.number().transform(emptyToUndefined).typeError(`${label} must be a number`)

const requiredNumber = (label: string) => numberField(label).required(`${label} is required`)

export const variationSchema = yup.object({
  color: yup.string().trim().required("Color is required"),
  size: yup.string().trim().required("Size is required"),
  sku: yup
    .string()
    .trim()
    .required("SKU code is required")
    .matches(SKU_PATTERN, "Use the format SKU-ABC-1234 (3 capital letters, 4 digits)"),
  extraPrice: requiredNumber("Extra price").min(0, "Extra price cannot be negative"),
})

const titleField = yup
  .string()
  .trim()
  .required("Product title is required")
  .min(3, "Title must be at least 3 characters")
  .max(100, "Title must be at most 100 characters")

const priceField = requiredNumber("Base price").moreThan(0, "Base price must be greater than 0")

const stockField = requiredNumber("Stock quantity")
  .integer("Stock quantity must be a whole number")
  .min(0, "Stock quantity cannot be negative")

const discountField = numberField("Discount")
  .min(0, "Discount must be between 0 and 99")
  .max(99, "Discount must be between 0 and 99")
  .optional()

export const basicInfoSchema = yup.object({
  title: titleField,
  brand: yup.string().trim().required("Brand is required"),
  category: yup.string().required("Select a category"),
  description: yup
    .string()
    .trim()
    .required("Description is required")
    .min(20, "Description must be at least 20 characters"),
})

export const pricingSchema = yup.object({
  price: priceField,
  stock: stockField,
  discountPercentage: discountField,
  variations: yup
    .array()
    .of(variationSchema)
    .default([])
    .test("unique-sku", "SKU codes must be unique", function (items) {
      if (!items) return true

      const positions = new Map<string, number[]>()
      items.forEach((item, index) => {
        const key = (item?.sku ?? "").trim().toUpperCase()
        if (key) positions.set(key, [...(positions.get(key) ?? []), index])
      })

      const errors = [...positions.values()]
        .filter((indexes) => indexes.length > 1)
        .flatMap((indexes) =>
          indexes.map((index) =>
            this.createError({ path: `${this.path}[${index}].sku`, message: "Duplicate SKU code" }),
          ),
        )

      return errors.length > 0 ? new yup.ValidationError(errors) : true
    }),
})

export const shippingSchema = yup.object({
  weight: requiredNumber("Weight").moreThan(0, "Weight must be greater than 0"),
  width: requiredNumber("Width").moreThan(0, "Width must be greater than 0"),
  height: requiredNumber("Height").moreThan(0, "Height must be greater than 0"),
  depth: requiredNumber("Depth").moreThan(0, "Depth must be greater than 0"),
  requiresFragileHandling: yup.boolean().default(false),
  hazardousDisclaimer: yup
    .boolean()
    .default(false)
    .when("requiresFragileHandling", {
      is: true,
      then: (schema) => schema.isTrue("Accept the hazardous material disclaimer to continue"),
    }),
  shippingNotes: yup
    .string()
    .trim()
    .default("")
    .when("requiresFragileHandling", {
      is: true,
      then: (schema) =>
        schema
          .required("Special shipping notes are required for fragile items")
          .min(10, "Shipping notes must be at least 10 characters"),
    }),
})

export const productWizardSchema = basicInfoSchema.concat(pricingSchema).concat(shippingSchema)

export type ProductWizardValues = yup.InferType<typeof productWizardSchema>
export type VariationValues = yup.InferType<typeof variationSchema>
export type WizardFieldName = keyof ProductWizardValues

export const STEP_FIELDS: WizardFieldName[][] = [
  ["title", "brand", "category", "description"],
  ["price", "stock", "discountPercentage", "variations"],
  ["weight", "width", "height", "depth", "requiresFragileHandling", "hazardousDisclaimer", "shippingNotes"],
]

export function getStepForField(field: string): number {
  const root = field.split(/[.[]/)[0]
  const index = STEP_FIELDS.findIndex((fields) => (fields as string[]).includes(root))
  return index === -1 ? 0 : index
}

export const productEditSchema = yup.object({
  title: titleField,
  price: priceField,
  stock: stockField,
  discountPercentage: discountField,
})

export type ProductEditValues = yup.InferType<typeof productEditSchema>

export const EMPTY_VARIATION: VariationValues = { color: "", size: "", sku: "", extraPrice: 0 }
