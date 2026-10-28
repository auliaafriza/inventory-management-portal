"use client"

import { useEffect, useRef, useState } from "react"
import { SearchIcon, CloseIcon } from "@/components/ui/icons"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { SEARCH_DEBOUNCE_MS } from "../constants"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: Readonly<SearchInputProps>) {
  const [input, setInput] = useState(value)
  const debounced = useDebouncedValue(input, SEARCH_DEBOUNCE_MS)
  const lastEmitted = useRef(value)

  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      setInput(value)
    }
  }, [value])

  useEffect(() => {
    const next = debounced.trim()
    if (next !== lastEmitted.current) {
      lastEmitted.current = next
      onChange(next)
    }
  }, [debounced, onChange])

  const handleClear = () => {
    lastEmitted.current = ""
    setInput("")
    onChange("")
  }

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Search products by name, brand or tag"
        aria-label="Search products"
        className="block h-10 w-full rounded-lg border-0 bg-white pl-10 pr-9 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-600 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {input ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
        >
          <CloseIcon className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
