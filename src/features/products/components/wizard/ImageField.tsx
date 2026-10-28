"use client"

import Image from "next/image"
import { useId, useRef, useState } from "react"
import { Button } from "@/components/ui/Button"
import { ACCEPTED_IMAGE_TYPES, fileToDataUrl, validateImageFile } from "../../utils/image"

interface ImageFieldProps {
  value: string
  onChange: (value: string) => void
}

export function ImageField({ value, onChange }: Readonly<ImageFieldProps>) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const problem = validateImageFile(file)
    setError(problem ?? undefined)
    if (problem) return

    try {
      onChange(await fileToDataUrl(file))
    } catch {
      setError("Could not read the image.")
    }
  }

  const clear = () => {
    onChange("")
    setError(undefined)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        Product image
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
          {value ? (
            <Image src={value} alt="Selected product" width={96} height={96} className="size-24 object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-slate-400">No image</span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              {value ? "Change image" : "Upload image"}
            </Button>
            {value ? (
              <Button variant="ghost" size="sm" onClick={clear}>
                Remove
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB. Optional.</p>
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
