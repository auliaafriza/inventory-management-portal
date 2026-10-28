export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_DIMENSION = 640

export function validateImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG or WebP image."
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller."
  return null
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read the image."))
    reader.readAsDataURL(blob)
  })
}

async function downscale(file: File): Promise<string | null> {
  if (typeof createImageBitmap !== "function") return null

  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * ratio)
  canvas.height = Math.round(bitmap.height * ratio)
  const context = canvas.getContext("2d")
  if (!context) return null

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL("image/webp", 0.85)
}

export async function fileToDataUrl(file: File): Promise<string> {
  try {
    const resized = await downscale(file)
    if (resized) return resized
  } catch {
    return readAsDataUrl(file)
  }
  return readAsDataUrl(file)
}
