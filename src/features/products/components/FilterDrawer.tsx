"use client"

import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { FilterControls } from "./FilterControls"
import type { ProductCategory, ProductFilters, SortKey } from "../types"

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  filters: ProductFilters
  categories: ProductCategory[]
  categoriesLoading: boolean
  onCategoryChange: (category: string) => void
  onSortChange: (sort: SortKey) => void
  onReset: () => void
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  categories,
  categoriesLoading,
  onCategoryChange,
  onSortChange,
  onReset,
}: Readonly<FilterDrawerProps>) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onReset}>
            Reset
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Show results
          </Button>
        </div>
      }
    >
      <FilterControls
        filters={filters}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onCategoryChange={onCategoryChange}
        onSortChange={onSortChange}
      />
    </Drawer>
  )
}
