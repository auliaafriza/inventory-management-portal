"use client"

import { SelectField } from "@/components/ui/fields"
import { SORT_OPTIONS } from "../constants"
import type { ProductCategory, ProductFilters, SortKey } from "../types"

interface FilterControlsProps {
  filters: ProductFilters
  categories: ProductCategory[]
  categoriesLoading: boolean
  onCategoryChange: (category: string) => void
  onSortChange: (sort: SortKey) => void
}

export function FilterControls({
  filters,
  categories,
  categoriesLoading,
  onCategoryChange,
  onSortChange,
}: Readonly<FilterControlsProps>) {
  return (
    <div className="space-y-5">
      <SelectField
        label="Category"
        value={filters.category}
        disabled={categoriesLoading}
        placeholder={categoriesLoading ? "Loading categories…" : "All categories"}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Sort by"
        value={filters.sort}
        onChange={(event) => onSortChange(event.target.value as SortKey)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
    </div>
  )
}
