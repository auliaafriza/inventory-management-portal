"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks"
import {
  categoryChanged,
  filtersHydrated,
  filtersReset,
  pageChanged,
  searchChanged,
  selectProductFilters,
  sortChanged,
} from "../store/filtersSlice"
import type { ProductFilters, SortKey } from "../types"
import { areFiltersEqual, parseFilters, serializeFilters } from "../utils/filtersUrl"

export function useProductFilters() {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = useAppSelector(selectProductFilters)
  const [ready, setReady] = useState(false)

  const searchParamsRef = useRef(searchParams)
  const previousRef = useRef<ProductFilters | null>(null)
  const pendingUrlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    searchParamsRef.current = searchParams
    const parsed = parseFilters(searchParams)
    const query = serializeFilters(parsed)

    if (pendingUrlsRef.current.delete(query)) return

    if (!areFiltersEqual(parsed, selectProductFilters(store.getState()))) {
      dispatch(filtersHydrated(parsed))
    }
    setReady(true)
  }, [searchParams, dispatch, store])

  useEffect(() => {
    if (!ready) return

    const query = serializeFilters(filters)
    const currentQuery = serializeFilters(parseFilters(searchParamsRef.current))
    const previous = previousRef.current
    previousRef.current = filters

    if (query === currentQuery) return

    const onlySearchChanged =
      previous !== null &&
      previous.category === filters.category &&
      previous.sort === filters.sort &&
      previous.page === filters.page

    pendingUrlsRef.current.add(query)
    const url = query ? `${pathname}?${query}` : pathname
    if (onlySearchChanged) {
      window.history.replaceState(null, "", url)
    } else {
      window.history.pushState(null, "", url)
    }
  }, [filters, ready, pathname])

  const setSearch = useCallback((value: string) => dispatch(searchChanged(value)), [dispatch])
  const setCategory = useCallback((value: string) => dispatch(categoryChanged(value)), [dispatch])
  const setSort = useCallback((value: SortKey) => dispatch(sortChanged(value)), [dispatch])
  const setPage = useCallback((value: number) => dispatch(pageChanged(value)), [dispatch])
  const reset = useCallback(() => dispatch(filtersReset()), [dispatch])

  return { filters, ready, setSearch, setCategory, setSort, setPage, reset }
}
