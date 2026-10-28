"use client"

import { SelectChevron } from "@/components/ui/fields"
import { cn } from "@/lib/utils/cn"
import { SORT_OPTIONS } from "../constants"
import type { ProductCategory, ProductFilters, SortKey } from "../types"

interface InlineFiltersProps {
  filters: ProductFilters
  categories: ProductCategory[]
  categoriesLoading: boolean
  onCategoryChange: (category: string) => void
  onSortChange: (sort: SortKey) => void
  className?: string
}

const selectClass =
  "h-10 appearance-none rounded-lg border-0 bg-white py-0 pl-3 pr-10 text-sm text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 focus:outline-none disabled:bg-slate-50"

export function InlineFilters({
  filters,
  categories,
  categoriesLoading,
  onCategoryChange,
  onSortChange,
  className,
}: Readonly<InlineFiltersProps>) {
  return (
    <div className={cn("items-center gap-3", className)}>
      <SelectChevron>
        <select
          aria-label="Category"
          value={filters.category}
          disabled={categoriesLoading}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={selectClass}
        >
          <option value="">{categoriesLoading ? "Loading categories…" : "All categories"}</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </SelectChevron>
      <SelectChevron>
        <select
          aria-label="Sort by"
          value={filters.sort}
          onChange={(event) => onSortChange(event.target.value as SortKey)}
          className={selectClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SelectChevron>
    </div>
  )
}
