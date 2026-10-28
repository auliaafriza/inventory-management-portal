import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { productsApi } from "@/features/products/services/productsApi"
import activityReducer from "@/features/products/store/activitySlice"
import { draftListener } from "@/features/products/store/draftListener"
import filtersReducer from "@/features/products/store/filtersSlice"
import optimisticReducer from "@/features/products/store/optimisticSlice"
import toastReducer from "@/features/products/store/toastSlice"
import wizardReducer from "@/features/products/store/wizardSlice"

const rootReducer = combineReducers({
  [productsApi.reducerPath]: productsApi.reducer,
  activity: activityReducer,
  filters: filtersReducer,
  optimistic: optimisticReducer,
  toasts: toastReducer,
  wizard: wizardReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(draftListener.middleware).concat(productsApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore["dispatch"]
