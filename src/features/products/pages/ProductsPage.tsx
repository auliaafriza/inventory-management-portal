"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import { Button, primaryLinkClass } from "@/components/ui/Button"
import { Pagination } from "@/components/ui/Pagination"
import { DownloadIcon, FilterIcon, PlusIcon } from "@/components/ui/icons"
import { getTotalPages } from "@/lib/utils/pagination"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { FilterDrawer } from "../components/FilterDrawer"
import { InlineFilters } from "../components/InlineFilters"
import { CategoryStockCard, StockStatusCard } from "../components/InsightCards"
import { ActivityPanel, LowStockPanel } from "../components/SidePanels"
import { StatCards } from "../components/StatCards"
import { ProductEditDialog } from "../components/ProductEditDialog"
import { ProductCards, ProductTable } from "../components/ProductTable"
import { EmptyState, ErrorState } from "../components/ProductsStates"
import { ProductsSkeleton } from "../components/ProductsSkeleton"
import { SearchInput } from "../components/SearchInput"
import { ViewToggle } from "../components/ViewToggle"
import { PAGE_SIZE } from "../constants"
import { useInventorySummary } from "../hooks/useInventorySummary"
import { useProductFilters } from "../hooks/useProductFilters"
import { useDeleteProductMutation, useUpdateProductMutation } from "../services/productMutations"
import { useGetCategoriesQuery, useGetProductsQuery } from "../services/productsApi"
import { viewChanged } from "../store/filtersSlice"
import { selectOperations } from "../store/optimisticSlice"
import { toastAdded } from "../store/toastSlice"
import type { Product, ProductCategory, ProductPatch } from "../types"
import { buildProductsCsv, downloadCsv } from "../utils/exportCsv"
import { hasActiveFilters } from "../utils/filtersUrl"

const NO_CATEGORIES: ProductCategory[] = []

export function ProductsPage() {
  const dispatch = useAppDispatch()
  const { filters, ready, setSearch, setCategory, setSort, setPage, reset } = useProductFilters()
  const view = useAppSelector((state) => state.filters.view)
  const operations = useAppSelector(selectOperations)
  const activity = useAppSelector((state) => state.activity.items)
  const summary = useInventorySummary()
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
      if (Object.keys(patch).length === 0) {
        dispatch(toastAdded({ kind: "info", message: `No changes to save for "${product.title}"` }))
        return
      }
      void updateProduct({ id: product.id, title: patch.title ?? product.title, patch })
    },
    [dispatch, updateProduct],
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

  const handleExport = () => {
    if (currentData) downloadCsv(`products-page-${filters.page}.csv`, buildProductsCsv(currentData.products))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Product &amp; Inventory Management Portal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your products and track inventory.
        </p>
      </div>

      <StatCards stats={summary.stats} loading={summary.isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CategoryStockCard stats={summary.stats} loading={summary.isLoading} className="lg:col-span-2" />
        <StockStatusCard stats={summary.stats} loading={summary.isLoading} />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Product list" className="min-w-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 p-4 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Product List</h2>
              <p className="text-sm text-slate-500" aria-live="polite">
                {currentData && total > 0 ? `Showing ${from}–${to} of ${total} products` : "Browse and manage products"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="flex-1 sm:flex-none lg:hidden" onClick={() => setDrawerOpen(true)}>
                <FilterIcon className="size-4" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-brand-700 px-1.5 text-xs text-white">{activeFilterCount}</span>
                ) : null}
              </Button>
              <Button
                variant="secondary"
                onClick={handleExport}
                disabled={!currentData || currentData.products.length === 0}
                aria-label="Export"
              >
                <DownloadIcon className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Link href="/products/new" className={cn(primaryLinkClass, "flex-1 whitespace-nowrap sm:flex-none")}>
                <PlusIcon className="size-4" />
                Add Product
              </Link>
            </div>
          </div>

          <div
            role="group"
            aria-label="Product filters"
            className="flex flex-wrap items-center gap-3 px-4 pb-4 sm:px-5"
          >
            <div className="min-w-0 flex-1 basis-48">
              <SearchInput value={filters.search} onChange={setSearch} />
            </div>
            <InlineFilters
              className="hidden lg:flex"
              filters={filters}
              categories={categories}
              categoriesLoading={categoriesLoading}
              onCategoryChange={setCategory}
              onSortChange={setSort}
            />
            <ViewToggle view={view} onChange={(next) => dispatch(viewChanged(next))} />
          </div>

          <section aria-label="Product results" className="px-4 pb-5 sm:px-5">
            {renderResults()}
          </section>
        </section>

        <aside aria-label="Insights" className="grid gap-6 md:grid-cols-2 2xl:grid-cols-1">
          <LowStockPanel items={summary.lowStockItems} loading={summary.isLoading} />
          <ActivityPanel items={activity} />
        </aside>
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
