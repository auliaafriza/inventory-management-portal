import { describe, expect, it } from "vitest"
import { fileToDataUrl, MAX_IMAGE_BYTES, validateImageFile } from "./image"

describe("validateImageFile", () => {
  it("accepts supported types within the size limit", () => {
    expect(validateImageFile({ type: "image/png", size: 1000 })).toBeNull()
    expect(validateImageFile({ type: "image/webp", size: MAX_IMAGE_BYTES })).toBeNull()
  })

  it("rejects unsupported types and oversized files", () => {
    expect(validateImageFile({ type: "application/pdf", size: 10 })).toMatch(/JPG, PNG or WebP/)
    expect(validateImageFile({ type: "image/jpeg", size: MAX_IMAGE_BYTES + 1 })).toMatch(/5 MB/)
  })
})

describe("fileToDataUrl", () => {
  it("reads a file as a data url", async () => {
    const file = new File(["abc"], "a.png", { type: "image/png" })
    await expect(fileToDataUrl(file)).resolves.toMatch(/^data:image\/png;base64,/)
  })
})
