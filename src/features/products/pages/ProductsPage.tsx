"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Pagination } from "@/components/ui/Pagination"
import { FilterIcon, PlusIcon } from "@/components/ui/icons"
import { getTotalPages } from "@/lib/utils/pagination"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { FilterControls } from "../components/FilterControls"
import { FilterDrawer } from "../components/FilterDrawer"
import { ProductEditDialog } from "../components/ProductEditDialog"
import { ProductCards, ProductTable } from "../components/ProductTable"
import { EmptyState, ErrorState } from "../components/ProductsStates"
import { ProductsSkeleton } from "../components/ProductsSkeleton"
import { SearchInput } from "../components/SearchInput"
import { ViewToggle } from "../components/ViewToggle"
import { PAGE_SIZE } from "../constants"
import { useProductFilters } from "../hooks/useProductFilters"
import { useDeleteProductMutation, useUpdateProductMutation } from "../services/productMutations"
import { useGetCategoriesQuery, useGetProductsQuery } from "../services/productsApi"
import { viewChanged } from "../store/filtersSlice"
import { selectOperations } from "../store/optimisticSlice"
import type { Product, ProductCategory, ProductPatch } from "../types"
import { hasActiveFilters } from "../utils/filtersUrl"

const NO_CATEGORIES: ProductCategory[] = []

export function ProductsPage() {
  const dispatch = useAppDispatch()
  const { filters, ready, setSearch, setCategory, setSort, setPage, reset } = useProductFilters()
  const view = useAppSelector((state) => state.filters.view)
  const operations = useAppSelector(selectOperations)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const { data: categories = NO_CATEGORIES, isLoading: categoriesLoading } = useGetCategoriesQuery()
  const { currentData, isError, refetch } = useGetProductsQuery(filters, { skip: !ready })
  const [deleteProduct] = useDeleteProductMutation()
  const [updateProduct] = useUpdateProductMutation()

  const handleDelete = useCallback(
    (product: Product) => {
      void deleteProduct({ id: product.id, title: product.title })
    },
    [deleteProduct],
  )

  const handleUpdate = useCallback(
    (product: Product, patch: ProductPatch) => {
      void updateProduct({ id: product.id, title: patch.title ?? product.title, patch })
    },
    [updateProduct],
  )

  const total = currentData?.total ?? 0
  const totalPages = getTotalPages(total, PAGE_SIZE)
  const from = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1
  const to = Math.min(filters.page * PAGE_SIZE, total)
  const activeFilterCount = Number(Boolean(filters.category)) + Number(Boolean(filters.sort))
  const isFiltered = hasActiveFilters(filters)

  const renderResults = () => {
    if (isError && !currentData) {
      return (
        <ErrorState
          title="Couldn't load products"
          description="Something went wrong while contacting the server."
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      )
    }

    if (!currentData) return <ProductsSkeleton view={view} />

    if (currentData.products.length === 0) {
      if (total > 0) {
        return (
          <EmptyState
            title="This page is empty"
            description="There are no products on this page anymore."
            actionLabel="Go to first page"
            onAction={() => setPage(1)}
          />
        )
      }
      return (
        <EmptyState
          title={isFiltered ? "No products found" : "No products yet"}
          description={
            isFiltered
              ? "Nothing matches your search and filters. Try a different keyword or clear the filters."
              : "Products you add will show up here."
          }
          actionLabel={isFiltered ? "Clear search and filters" : undefined}
          onAction={isFiltered ? reset : undefined}
        />
      )
    }

    const ListComponent = view === "table" ? ProductTable : ProductCards
    return (
      <div className="space-y-6">
        <ListComponent
          products={currentData.products}
          operations={operations}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
        <Pagination page={filters.page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500" aria-live="polite">
            {currentData && total > 0 ? `Showing ${from}–${to} of ${total} products` : "Manage your inventory"}
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <PlusIcon className="size-4" />
          New product
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <SearchInput value={filters.search} onChange={setSearch} />
        </div>
        <Button variant="secondary" className="lg:hidden" onClick={() => setDrawerOpen(true)}>
          <FilterIcon className="size-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeFilterCount}</span>
          ) : null}
        </Button>
        <ViewToggle view={view} onChange={(next) => dispatch(viewChanged(next))} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 space-y-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <FilterControls
              filters={filters}
              categories={categories}
              categoriesLoading={categoriesLoading}
              onCategoryChange={setCategory}
              onSortChange={setSort}
            />
            <Button variant="ghost" size="sm" className="w-full" onClick={reset} disabled={!isFiltered}>
              Reset filters
            </Button>
          </div>
        </aside>
        <section aria-label="Product results">{renderResults()}</section>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onCategoryChange={setCategory}
        onSortChange={setSort}
        onReset={reset}
      />
      <ProductEditDialog product={editing} onClose={() => setEditing(null)} onSubmit={handleUpdate} />
    </div>
  )
}
