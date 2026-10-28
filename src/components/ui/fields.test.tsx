import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { TextField } from "./fields"

describe("TextField numeric input", () => {
  it("rejects exponent and sign characters", async () => {
    const user = userEvent.setup({ delay: null })
    render(<TextField label="Price" type="number" step="0.01" />)
    const input = screen.getByLabelText("Price")

    await user.type(input, "1e+-5.5")

    expect(input).toHaveValue(15.5)
  })

  it("rejects decimal separators for whole number fields", async () => {
    const user = userEvent.setup({ delay: null })
    render(<TextField label="Stock" type="number" step="1" />)
    const input = screen.getByLabelText("Stock")

    await user.type(input, "1.2,3")

    expect(input).toHaveValue(123)
  })

  it("blocks pasting non numeric text but allows plain numbers", async () => {
    const user = userEvent.setup({ delay: null })
    render(<TextField label="Price" type="number" step="0.01" />)
    const input = screen.getByLabelText("Price")

    await user.click(input)
    await user.paste("1e5")
    expect(input).toHaveValue(null)

    await user.paste("42.5")
    expect(input).toHaveValue(42.5)
  })

  it("leaves text inputs untouched", async () => {
    const user = userEvent.setup({ delay: null })
    render(<TextField label="Name" />)
    const input = screen.getByLabelText("Name")

    await user.type(input, "e+-1")

    expect(input).toHaveValue("e+-1")
  })
})
