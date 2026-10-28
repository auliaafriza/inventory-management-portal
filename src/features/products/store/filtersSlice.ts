import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { DEFAULT_FILTERS } from "../constants"
import type { ProductFilters, ProductView, SortKey } from "../types"

export interface FiltersState extends ProductFilters {
  view: ProductView
}

export const initialFiltersState: FiltersState = { ...DEFAULT_FILTERS, view: "table" }

const filtersSlice = createSlice({
  name: "filters",
  initialState: initialFiltersState,
  reducers: {
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload.trim()
      state.page = 1
    },
    categoryChanged(state, action: PayloadAction<string>) {
      state.category = action.payload
      state.page = 1
    },
    sortChanged(state, action: PayloadAction<SortKey>) {
      state.sort = action.payload
      state.page = 1
    },
    pageChanged(state, action: PayloadAction<number>) {
      state.page = Math.max(1, Math.floor(action.payload) || 1)
    },
    viewChanged(state, action: PayloadAction<ProductView>) {
      state.view = action.payload
    },
    filtersReset(state) {
      Object.assign(state, DEFAULT_FILTERS)
    },
    filtersHydrated(state, action: PayloadAction<ProductFilters>) {
      Object.assign(state, action.payload)
    },
  },
})

export const { searchChanged, categoryChanged, sortChanged, pageChanged, viewChanged, filtersReset, filtersHydrated } =
  filtersSlice.actions

export const selectFiltersState = (state: { filters: FiltersState }): FiltersState => state.filters

type FiltersRoot = { filters: FiltersState }

export const selectProductFilters = createSelector(
  [
    (state: FiltersRoot) => state.filters.search,
    (state: FiltersRoot) => state.filters.category,
    (state: FiltersRoot) => state.filters.sort,
    (state: FiltersRoot) => state.filters.page,
  ],
  (search, category, sort, page): ProductFilters => ({ search, category, sort, page }),
)

export default filtersSlice.reducer
