import { useMemo } from "react"
import { useGetInventorySummaryQuery } from "../services/productsApi"
import { computeInventoryStats, getLowStockItems } from "../utils/inventoryStats"

export function useInventorySummary() {
  const { data, isLoading } = useGetInventorySummaryQuery()

  return useMemo(() => {
    const items = data ?? []
    return { stats: computeInventoryStats(items), lowStockItems: getLowStockItems(items), isLoading }
  }, [data, isLoading])
}
