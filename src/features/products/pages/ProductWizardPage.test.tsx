import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders } from "@/test/renderWithProviders"
import { server } from "@/test/server"
import { DRAFT_STORAGE_KEY } from "../constants"
import { ProductWizardPage } from "./ProductWizardPage"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

window.scrollTo = vi.fn()

async function fillBasicInfo(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/product title/i), "Desk Lamp")
  await user.type(screen.getByLabelText(/^brand/i), "Lumen")
  await waitFor(() => expect(screen.getByRole("option", { name: "Beauty" })).toBeInTheDocument())
  await user.selectOptions(screen.getByLabelText(/^category/i), "beauty")
  await user.type(screen.getByLabelText(/^description/i), "A bright and adjustable desk lamp.")
}

describe("ProductWizardPage", () => {
  it("blocks progress until the current step is valid", async () => {
    const user = userEvent.setup({ delay: null })
    renderWithProviders(<ProductWizardPage />)

    await user.click(await screen.findByRole("button", { name: "Continue" }))

    expect(await screen.findByText("Product title is required")).toBeInTheDocument()
    expect(screen.getByText("Brand is required")).toBeInTheDocument()
    expect(screen.getByText("Select a category")).toBeInTheDocument()
    expect(screen.getByText("Description is required")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Basic info", level: 2 })).toBeInTheDocument()
  })

  it("submits the complete wizard to the add endpoint", async () => {
    const user = userEvent.setup({ delay: null })
    let posted: Record<string, unknown> | null = null
    server.use(
      http.post("https://dummyjson.com/products/add", async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 195, ...posted }, { status: 201 })
      }),
    )
    const { store } = renderWithProviders(<ProductWizardPage />)

    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await user.type(await screen.findByLabelText(/base price/i), "49.9")
    await user.type(screen.getByLabelText(/stock quantity/i), "12")
    await user.type(screen.getByLabelText(/discount/i), "10")
    await user.click(screen.getByRole("button", { name: /add variation/i }))
    await user.type(screen.getByLabelText("Color"), "Black")
    await user.type(screen.getByLabelText("Size"), "M")
    await user.type(screen.getByLabelText("SKU code"), "SKU-BLK-1001")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await user.type(await screen.findByLabelText(/weight/i), "1.2")
    await user.type(screen.getByLabelText(/width/i), "20")
    await user.type(screen.getByLabelText(/height/i), "40")
    await user.type(screen.getByLabelText(/depth/i), "20")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    expect(await screen.findByRole("heading", { name: "Review", level: 2 })).toBeInTheDocument()
    const preview = screen.getByRole("region", { name: "Product preview" })
    expect(within(preview).getByText("Desk Lamp")).toBeInTheDocument()
    expect(screen.getByText("SKU-BLK-1001")).toBeInTheDocument()

    expect(screen.getByRole("button", { name: "Create product" })).toBeDisabled()
    expect(posted).toBeNull()

    await user.click(screen.getByRole("checkbox", { name: /reviewed the preview/i }))
    await user.click(screen.getByRole("button", { name: "Create product" }))

    expect(await screen.findByText("Product created")).toBeInTheDocument()
    expect(posted).toMatchObject({
      title: "Desk Lamp",
      brand: "Lumen",
      category: "beauty",
      price: 49.9,
      stock: 12,
      discountPercentage: 10,
      weight: 1.2,
      dimensions: { width: 20, height: 40, depth: 20 },
      requiresFragileHandling: false,
      variations: [{ color: "Black", size: "M", sku: "SKU-BLK-1001", extraPrice: 0 }],
    })
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
    expect(store.getState().wizard.values).toEqual({})
  })

  it("rejects malformed and duplicate SKU codes", async () => {
    const user = userEvent.setup({ delay: null })
    renderWithProviders(<ProductWizardPage />)

    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.type(await screen.findByLabelText(/base price/i), "10")
    await user.type(screen.getByLabelText(/stock quantity/i), "1")

    const add = screen.getByRole("button", { name: /add variation/i })
    await user.click(add)
    await user.click(add)
    const [first, second] = screen.getAllByLabelText("SKU code")
    await user.type(first as HTMLElement, "sku-bad")
    await user.type(second as HTMLElement, "SKU-RED-1001")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    expect(await screen.findByText(/Use the format SKU-ABC-1234/, undefined, { timeout: 10000 })).toBeInTheDocument()

    await user.clear(first as HTMLElement)
    await user.type(first as HTMLElement, "SKU-RED-1001")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() => expect(screen.getAllByText("Duplicate SKU code")).toHaveLength(2), { timeout: 10000 })
  }, 40000)

  it("requires disclosures only when fragile handling is selected", async () => {
    const user = userEvent.setup({ delay: null })
    renderWithProviders(<ProductWizardPage />)

    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.type(await screen.findByLabelText(/base price/i), "10")
    await user.type(screen.getByLabelText(/stock quantity/i), "1")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await user.type(await screen.findByLabelText(/weight/i), "1")
    await user.type(screen.getByLabelText(/width/i), "1")
    await user.type(screen.getByLabelText(/height/i), "1")
    await user.type(screen.getByLabelText(/depth/i), "1")
    expect(screen.queryByLabelText(/special shipping notes/i)).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/requires special fragile handling/i))
    expect(await screen.findByLabelText(/special shipping notes/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(await screen.findByText(/Accept the hazardous material disclaimer/)).toBeInTheDocument()
    expect(screen.getAllByText(/shipping notes/i).length).toBeGreaterThan(0)

    await user.click(screen.getByLabelText(/hazardous material disclaimer/i))
    await user.type(screen.getByLabelText(/special shipping notes/i), "Keep upright, use foam")
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(await screen.findByRole("heading", { name: "Review", level: 2 })).toBeInTheDocument()
  })

  it("keeps data when jumping back from the review step", async () => {
    const user = userEvent.setup({ delay: null })
    renderWithProviders(<ProductWizardPage />)

    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.type(await screen.findByLabelText(/base price/i), "10")
    await user.type(screen.getByLabelText(/stock quantity/i), "1")
    await user.click(screen.getByRole("button", { name: "Continue" }))
    for (const label of [/weight/i, /width/i, /height/i, /depth/i]) {
      await user.type(await screen.findByLabelText(label), "2")
    }
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await user.click(await screen.findByRole("button", { name: "Edit Basic information" }))
    expect(await screen.findByLabelText(/product title/i)).toHaveValue("Desk Lamp")
    expect(screen.getByLabelText(/^brand/i)).toHaveValue("Lumen")
  })

  it("autosaves progress and offers to resume it after a reload", async () => {
    const user = userEvent.setup({ delay: null })
    const first = renderWithProviders(<ProductWizardPage />)

    await user.type(await screen.findByLabelText(/product title/i), "Half done")
    await waitFor(() => expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toContain("Half done"), {
      timeout: 2000,
    })
    first.unmount()

    renderWithProviders(<ProductWizardPage />)
    const dialog = await screen.findByRole("dialog", { name: "Resume saved product draft?" })
    await user.click(within(dialog).getByRole("button", { name: "Resume draft" }))

    expect(await screen.findByLabelText(/product title/i)).toHaveValue("Half done")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("lets the user discard a saved draft", async () => {
    const user = userEvent.setup({ delay: null })
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ values: { title: "Old draft" }, step: 0, savedAt: new Date().toISOString() }),
    )
    renderWithProviders(<ProductWizardPage />)

    await user.click(await screen.findByRole("button", { name: "Start over" }))

    expect(await screen.findByLabelText(/product title/i)).toHaveValue("")
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
  })

  it("shows an error toast state when creation fails", async () => {
    const user = userEvent.setup({ delay: null })
    server.use(http.post("https://dummyjson.com/products/add", () => HttpResponse.json({}, { status: 500 })))
    const { store } = renderWithProviders(<ProductWizardPage />)

    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.type(await screen.findByLabelText(/base price/i), "10")
    await user.type(screen.getByLabelText(/stock quantity/i), "1")
    await user.click(screen.getByRole("button", { name: "Continue" }))
    for (const label of [/weight/i, /width/i, /height/i, /depth/i]) {
      await user.type(await screen.findByLabelText(label), "2")
    }
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.click(await screen.findByRole("checkbox", { name: /reviewed the preview/i }))
    await user.click(screen.getByRole("button", { name: "Create product" }))

    await waitFor(() => expect(store.getState().toasts.items[0]).toMatchObject({ kind: "error" }))
    expect(screen.queryByText("Product created")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create product" })).toBeInTheDocument()
  })

  it("lets the user upload a product image and shows it in the preview", async () => {
    const user = userEvent.setup({ delay: null })
    renderWithProviders(<ProductWizardPage />)

    await user.upload(
      await screen.findByLabelText("Product image"),
      new File(["img"], "lamp.png", { type: "image/png" }),
    )
    expect(await screen.findByAltText("Selected product")).toBeInTheDocument()

    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.type(await screen.findByLabelText(/base price/i), "10")
    await user.type(screen.getByLabelText(/stock quantity/i), "1")
    await user.click(screen.getByRole("button", { name: "Continue" }))
    for (const label of [/weight/i, /width/i, /height/i, /depth/i]) {
      await user.type(await screen.findByLabelText(label), "2")
    }
    await user.click(screen.getByRole("button", { name: "Continue" }))

    const preview = await screen.findByRole("region", { name: "Product preview" })
    expect(preview.querySelector("img")?.getAttribute("src")).toContain("data:image/png")
  })

  it("rejects unsupported image files", async () => {
    const user = userEvent.setup({ delay: null, applyAccept: false })
    renderWithProviders(<ProductWizardPage />)

    await user.upload(
      await screen.findByLabelText("Product image"),
      new File(["x"], "a.pdf", { type: "application/pdf" }),
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(/JPG, PNG or WebP/)
  })

  it("does not submit when Continue is double-clicked into the review step", async () => {
    const user = userEvent.setup({ delay: null })
    let submissions = 0
    server.use(
      http.post("https://dummyjson.com/products/add", () => {
        submissions += 1
        return HttpResponse.json({ id: 101 })
      }),
    )
    renderWithProviders(<ProductWizardPage />)

    await fillBasicInfo(user)
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.type(await screen.findByLabelText(/base price/i), "10")
    await user.type(screen.getByLabelText(/stock quantity/i), "1")
    await user.click(screen.getByRole("button", { name: "Continue" }))
    for (const label of [/weight/i, /width/i, /height/i, /depth/i]) {
      await user.type(await screen.findByLabelText(label), "2")
    }
    await user.dblClick(screen.getByRole("button", { name: "Continue" }))

    expect(await screen.findByRole("region", { name: "Product preview" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create product" })).toBeDisabled()
    expect(submissions).toBe(0)
  })
})
