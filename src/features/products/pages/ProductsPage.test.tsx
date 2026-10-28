import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders } from "@/test/renderWithProviders"
import { PRODUCTS, toResponse } from "@/test/fixtures"
import { server } from "@/test/server"
import { ProductsToaster } from "../components/ProductsToaster"
import { ProductsPage } from "./ProductsPage"

const navigation = vi.hoisted(() => ({ params: new URLSearchParams() }))

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useSearchParams: () => navigation.params,
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

function renderPage() {
  return renderWithProviders(
    <>
      <ProductsPage />
      <ProductsToaster />
    </>,
  )
}

const results = () => screen.getByRole("region", { name: "Product results" })

beforeEach(() => {
  navigation.params = new URLSearchParams()
  window.history.replaceState(null, "", "/products")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("ProductsPage", () => {
  it("shows a skeleton and then the product table", async () => {
    renderPage()

    expect(screen.getByLabelText("Loading products")).toBeInTheDocument()
    const table = await screen.findByRole("table")
    expect(within(table).getByText("iPhone 13 Pro")).toBeInTheDocument()
    expect(within(table).getAllByRole("row")).toHaveLength(PRODUCTS.length + 1)
    expect(screen.getByText("Showing 1–4 of 4 products")).toBeInTheDocument()
  })

  it("summarises inventory from the API", async () => {
    renderPage()
    const summary = await screen.findByLabelText("Inventory summary")

    await waitFor(() => expect(within(summary).getByText("4")).toBeInTheDocument())
    expect(within(summary).getByText("$45,569")).toBeInTheDocument()
    expect(within(summary).getByText("Total Products")).toBeInTheDocument()
    expect(within(summary).getByText("1 out of stock")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "In Stock: 2, Low Stock: 1, Out of Stock: 1" })).toBeInTheDocument()
  })

  it("lists low stock products and recent activity", async () => {
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "0")
    const user = userEvent.setup({ delay: null })
    renderPage()
    const insights = await screen.findByRole("complementary", { name: "Insights" })

    expect(await within(insights).findByText("Samsung Galaxy S8")).toBeInTheDocument()
    expect(within(insights).getByText("Out of stock")).toBeInTheDocument()
    expect(within(insights).getByText(/Nothing yet/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete Red Lipstick" }))
    expect(await within(insights).findByText("Product deleted", undefined, { timeout: 3000 })).toBeInTheDocument()
  })

  it("updates the summary as soon as a product is deleted", async () => {
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "0")
    const user = userEvent.setup({ delay: null })
    renderPage()
    const summary = await screen.findByLabelText("Inventory summary")
    await waitFor(() => expect(within(summary).getByText("4")).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: "Delete Red Lipstick" }))

    expect(within(summary).getByText("3")).toBeInTheDocument()
  })

  it("toggles to the card layout", async () => {
    const user = userEvent.setup({ delay: null })
    renderPage()
    await screen.findByRole("table")

    await user.click(screen.getByRole("button", { name: "Card view" }))

    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    expect(within(results()).getAllByRole("listitem")).toHaveLength(PRODUCTS.length)
  })

  it("restores the view from URL query parameters", async () => {
    navigation.params = new URLSearchParams("search=iphone&category=smartphones&sort=price_desc&page=1")
    let requested = ""
    server.use(
      http.get("https://dummyjson.com/products/category/:slug", ({ request }) => {
        requested = request.url
        return HttpResponse.json(toResponse([PRODUCTS[1]!]))
      }),
    )
    const { store } = renderPage()

    const table = await screen.findByRole("table")
    expect(within(table).getAllByRole("row")).toHaveLength(2)
    expect(screen.getByRole("searchbox", { name: "Search products" })).toHaveValue("iphone")
    expect(store.getState().filters).toMatchObject({
      search: "iphone",
      category: "smartphones",
      sort: "price_desc",
      page: 1,
    })
    expect(requested).toContain("sortBy=price")
    expect(requested).toContain("order=desc")
  })

  it("debounces search by 300ms and writes the query to the URL", async () => {
    const user = userEvent.setup({ delay: null })
    const queries: string[] = []
    server.use(
      http.get("https://dummyjson.com/products/search", ({ request }) => {
        queries.push(new URL(request.url).searchParams.get("q") ?? "")
        return HttpResponse.json(toResponse([PRODUCTS[1]!]))
      }),
    )
    const { store } = renderPage()
    await screen.findByRole("table")

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "iphone")
    expect(queries).toEqual([])

    await waitFor(() => expect(queries).toEqual(["iphone"]), { timeout: 2000 })
    await waitFor(() => expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2))
    expect(store.getState().filters.search).toBe("iphone")
    expect(window.location.search).toBe("?search=iphone")
  })

  it("shows an empty state when nothing matches and clears the filters", async () => {
    const user = userEvent.setup({ delay: null })
    server.use(
      http.get("https://dummyjson.com/products/search", () =>
        HttpResponse.json({ products: [], total: 0, skip: 0, limit: 10 }),
      ),
    )
    renderPage()
    await screen.findByRole("table")

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "zzzz")

    expect(await screen.findByText("No products found", undefined, { timeout: 2000 })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear search and filters" }))

    expect(await screen.findByRole("table")).toBeInTheDocument()
    expect(screen.getByRole("searchbox", { name: "Search products" })).toHaveValue("")
  })

  it("filters by category and resets back to page one", async () => {
    const user = userEvent.setup({ delay: null })
    const { store } = renderPage()
    await screen.findByRole("table")

    const filtersGroup = screen.getByRole("group", { name: "Product filters" })
    await waitFor(() => expect(within(filtersGroup).getByRole("option", { name: "Beauty" })).toBeInTheDocument())
    await user.selectOptions(within(filtersGroup).getByLabelText("Category"), "beauty")

    await waitFor(() => expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(3))
    expect(store.getState().filters.category).toBe("beauty")
    expect(window.location.search).toBe("?category=beauty")
  })

  it("shows an error state with a working retry", async () => {
    const user = userEvent.setup({ delay: null })
    let fail = true
    server.use(
      http.get("https://dummyjson.com/products", () =>
        fail ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(toResponse(PRODUCTS)),
      ),
    )
    renderPage()

    expect(await screen.findByText("Couldn't load products")).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(await screen.findByRole("table")).toBeInTheDocument()
  })

  it("removes a product instantly and confirms with a toast", async () => {
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "0")
    const user = userEvent.setup({ delay: null })
    renderPage()
    await screen.findByRole("table")

    await user.click(screen.getByRole("button", { name: "Delete iPhone 13 Pro" }))

    expect(within(screen.getByRole("table")).queryByText("iPhone 13 Pro")).not.toBeInTheDocument()
    expect(await screen.findByText('"iPhone 13 Pro" deleted', undefined, { timeout: 3000 })).toBeInTheDocument()
  })

  it("restores the product and offers a retry when the delete fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "1")
    const user = userEvent.setup({ delay: null })
    renderPage()
    await screen.findByRole("table")

    await user.click(screen.getByRole("button", { name: "Delete iPhone 13 Pro" }))
    expect(within(screen.getByRole("table")).queryByText("iPhone 13 Pro")).not.toBeInTheDocument()

    const alert = await screen.findByRole("alert", undefined, { timeout: 3000 })
    expect(alert).toHaveTextContent('Could not delete "iPhone 13 Pro"')
    expect(within(screen.getByRole("table")).getByText("iPhone 13 Pro")).toBeInTheDocument()

    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "0")
    await user.click(within(alert).getByRole("button", { name: "Retry" }))

    await waitFor(() => expect(within(screen.getByRole("table")).queryByText("iPhone 13 Pro")).not.toBeInTheDocument())
    expect(await screen.findByText('"iPhone 13 Pro" deleted', undefined, { timeout: 3000 })).toBeInTheDocument()
  })

  it("edits a product optimistically through the dialog", async () => {
    vi.stubEnv("NEXT_PUBLIC_FAILURE_RATE", "0")
    const user = userEvent.setup({ delay: null })
    renderPage()
    await screen.findByRole("table")

    await user.click(screen.getByRole("button", { name: "Edit Essence Mascara" }))
    const dialog = await screen.findByRole("dialog", { name: "Edit product" })
    const price = within(dialog).getByLabelText(/price/i)
    await user.clear(price)
    await user.type(price, "0")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))
    expect(await within(dialog).findByText("Base price must be greater than 0")).toBeInTheDocument()

    await user.clear(price)
    await user.type(price, "25")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(within(screen.getByRole("table")).getByText("$25.00")).toBeInTheDocument()
    expect(await screen.findByText('"Essence Mascara" updated', undefined, { timeout: 3000 })).toBeInTheDocument()
  })

  it("tells the user when an edit has no changes", async () => {
    const user = userEvent.setup({ delay: null })
    const { store } = renderPage()
    await screen.findByRole("table")

    await user.click(screen.getByRole("button", { name: "Edit Essence Mascara" }))
    const dialog = await screen.findByRole("dialog", { name: "Edit product" })
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(store.getState().toasts.items[0]).toMatchObject({
      kind: "info",
      message: 'No changes to save for "Essence Mascara"',
    })
  })
})
