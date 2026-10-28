import { afterEach, describe, expect, it, vi } from "vitest"
import { cn } from "./cn"
import { DEFAULT_FAILURE_RATE, getFailureRate, shouldSimulateFailure, wait } from "./failure"
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  formatWholeCurrency,
  getDiscountedPrice,
  getStockStatus,
} from "./format"
import { getPageItems, getTotalPages } from "./pagination"
import { readStorage, removeStorage, writeStorage } from "./storage"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("cn", () => {
  it("merges conflicting tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4", false && "hidden", ["text-sm"])).toBe("py-1 px-4 text-sm")
  })
})

describe("format", () => {
  it("formats currency", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50")
  })

  it("applies discounts with cent rounding", () => {
    expect(getDiscountedPrice(100, 15)).toBe(85)
    expect(getDiscountedPrice(9.99, 7.17)).toBe(9.27)
    expect(getDiscountedPrice(50, 0)).toBe(50)
  })

  it("classifies stock levels", () => {
    expect(getStockStatus(0)).toBe("out")
    expect(getStockStatus(-2)).toBe("out")
    expect(getStockStatus(9)).toBe("low")
    expect(getStockStatus(10)).toBe("in")
  })

  it("formats valid dates and ignores invalid ones", () => {
    expect(formatDateTime("2026-10-28T01:00:00.000Z")).toMatch(/2026/)
    expect(formatDateTime("not a date")).toBe("")
  })
})

describe("relative time and number formats", () => {
  const now = new Date("2026-10-28T12:00:00.000Z")

  it.each([
    ["2026-10-28T11:59:40.000Z", "Just now"],
    ["2026-10-28T11:55:00.000Z", "5 min ago"],
    ["2026-10-28T11:00:00.000Z", "1 hour ago"],
    ["2026-10-28T07:00:00.000Z", "5 hours ago"],
    ["2026-10-27T12:00:00.000Z", "1 day ago"],
    ["2026-10-20T12:00:00.000Z", "8 days ago"],
    ["2026-10-29T12:00:00.000Z", "Just now"],
    ["nope", ""],
  ])("formats %s as %s", (iso, expected) => {
    expect(formatRelativeTime(iso, now)).toBe(expected)
  })

  it("formats numbers and whole-dollar values", () => {
    expect(formatNumber(24560)).toBe("24,560")
    expect(formatWholeCurrency(125430.4)).toBe("$125,430")
  })
})

describe("pagination", () => {
  it("calculates total pages", () => {
    expect(getTotalPages(0, 10)).toBe(1)
    expect(getTotalPages(10, 10)).toBe(1)
    expect(getTotalPages(11, 10)).toBe(2)
    expect(getTotalPages(194, 10)).toBe(20)
    expect(getTotalPages(50, 0)).toBe(1)
  })

  it("lists every page when there are few", () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it("collapses long ranges with ellipses", () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, "ellipsis-end", 20])
    expect(getPageItems(10, 20)).toEqual([1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20])
    expect(getPageItems(20, 20)).toEqual([1, "ellipsis-start", 19, 20])
  })
})

describe("failure simulation", () => {
  it("defaults to a 20% failure rate", () => {
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "")
    expect(getFailureRate()).toBe(DEFAULT_FAILURE_RATE)
  })

  it("reads and clamps the configured rate", () => {
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "0.5")
    expect(getFailureRate()).toBe(0.5)
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "7")
    expect(getFailureRate()).toBe(1)
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "-1")
    expect(getFailureRate()).toBe(0)
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "abc")
    expect(getFailureRate()).toBe(DEFAULT_FAILURE_RATE)
  })

  it("decides failure from the injected random source", () => {
    expect(shouldSimulateFailure(0.2, () => 0.19)).toBe(true)
    expect(shouldSimulateFailure(0.2, () => 0.2)).toBe(false)
    expect(shouldSimulateFailure(0, () => 0)).toBe(false)
    expect(shouldSimulateFailure(1, () => 0.999)).toBe(true)
  })

  it("waits for the given delay", async () => {
    vi.useFakeTimers()
    const done = vi.fn()
    void wait(500).then(done)
    await vi.advanceTimersByTimeAsync(499)
    expect(done).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(done).toHaveBeenCalled()
  })
})

describe("storage", () => {
  it("round-trips JSON values", () => {
    expect(writeStorage("k", { a: 1 })).toBe(true)
    expect(readStorage<{ a: number }>("k")).toEqual({ a: 1 })
    removeStorage("k")
    expect(readStorage("k")).toBeNull()
  })

  it("returns null for corrupt values", () => {
    window.localStorage.setItem("bad", "{")
    expect(readStorage("bad")).toBeNull()
  })

  it("swallows storage errors", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
      throw new Error("denied")
    })
    expect(writeStorage("k", 1)).toBe(false)
    expect(() => removeStorage("k")).not.toThrow()
  })
})
