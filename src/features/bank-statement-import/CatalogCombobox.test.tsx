import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CatalogCombobox } from "./CatalogCombobox"
import type { CatalogItem } from "@/api/types"

const items: CatalogItem[] = [
  { codigo: "1000570208", nombre: "OCHOA TRUJILLO LUCAS" },
  { codigo: "800186061", nombre: "MOVISTAR" },
]

describe("CatalogCombobox", () => {
  it("shows the label for the current value when it matches a catalog item", () => {
    render(
      <CatalogCombobox items={items} loading={false} value="800186061" onSelect={vi.fn()} />
    )

    expect(screen.getByText("800186061 — MOVISTAR")).toBeInTheDocument()
  })

  it("filters options by name or code as the user types", async () => {
    const user = userEvent.setup()
    render(<CatalogCombobox items={items} loading={false} value={null} onSelect={vi.fn()} />)

    await user.click(screen.getByRole("button"))
    const search = screen.getByPlaceholderText("Buscar por código o nombre...")

    await user.type(search, "MOVISTAR")
    expect(screen.getByText(/MOVISTAR/)).toBeInTheDocument()
    expect(screen.queryByText(/OCHOA TRUJILLO/)).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, "1000570208")
    expect(screen.getByText(/OCHOA TRUJILLO/)).toBeInTheDocument()
    expect(screen.queryByText(/MOVISTAR/)).not.toBeInTheDocument()
  })

  it("calls onSelect with the chosen item", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CatalogCombobox items={items} loading={false} value={null} onSelect={onSelect} />)

    await user.click(screen.getByRole("button"))
    await user.click(screen.getByText(/MOVISTAR/))

    expect(onSelect).toHaveBeenCalledWith(items[1])
  })
})
