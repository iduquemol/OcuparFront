import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CurrencyMaskInput } from "./currency-mask-input"
import { formatCurrency } from "@/lib/currency"

function ControlledCurrencyMaskInput({
  onValueChange,
}: {
  onValueChange: (value: number) => void
}) {
  const [value, setValue] = useState(0)
  return (
    <CurrencyMaskInput
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange(next)
      }}
    />
  )
}

describe("CurrencyMaskInput", () => {
  it("formats the initial value as currency", () => {
    render(<CurrencyMaskInput value={130} onValueChange={vi.fn()} />)

    expect(screen.getByRole("textbox")).toHaveValue(formatCurrency(130))
  })

  it("builds the value from the right as the user types digits", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<ControlledCurrencyMaskInput onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox")

    await user.type(input, "1300")

    expect(input).toHaveValue(formatCurrency(13))
    expect(onValueChange).toHaveBeenLastCalledWith(13)
  })

  it("resets to $ 0,00 when the input is cleared", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<CurrencyMaskInput value={130} onValueChange={onValueChange} />)

    await user.clear(screen.getByRole("textbox"))

    expect(onValueChange).toHaveBeenCalledWith(0)
  })

  it("reports the numeric value, not the formatted string, via onValueChange", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<CurrencyMaskInput value={0} onValueChange={onValueChange} />)

    await user.type(screen.getByRole("textbox"), "5")

    expect(onValueChange).toHaveBeenLastCalledWith(0.05)
  })
})
