import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ExtractoMovementsTable } from "./ExtractoMovementsTable"
import type { ExtractoMovement } from "@/api/types"
import * as catalogosApi from "@/api/catalogos"

const sampleMovement: ExtractoMovement = {
  idRegistroExtracto: 444,
  idExtracto: 72,
  fechaMovimiento: "2026-08-03",
  descripcionMovimiento: "COMPRA INTERNET",
  detalleMovimiento: null,
  debito: 25240200,
  credito: 0,
  nitTercero: "0",
  nombreTercero: null,
  tipoMovimiento: "N227",
  subTipoDocumento: null,
  cuentaContable: null,
}

function mockCatalogos() {
  vi.spyOn(catalogosApi, "getTerceros").mockResolvedValue([
    { codigo: "800186061", nombre: "MOVISTAR" },
  ])
  vi.spyOn(catalogosApi, "getCuentasContables").mockResolvedValue([
    { codigo: "00", nombre: "NO APLICA", tipo: "" },
  ])
  vi.spyOn(catalogosApi, "getSubTiposDocumento").mockResolvedValue([
    { codigo: "040", nombre: "COMPROBANTE DE INGRESO CxC" },
  ])
}

describe("ExtractoMovementsTable", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders all 7 data columns plus the actions column for a movement", async () => {
    mockCatalogos()

    render(
      <ExtractoMovementsTable movements={[sampleMovement]} loading={false} error={null} />
    )

    expect(screen.getByText("2026-08-03")).toBeInTheDocument()
    expect(screen.getByText("COMPRA INTERNET")).toBeInTheDocument()
    // debito/credito render as formatted currency
    expect(screen.getByText("$ 25.240.200,00")).toBeInTheDocument()
    expect(screen.getByText("$ 0,00")).toBeInTheDocument()
    expect(screen.queryByText("N227")).not.toBeInTheDocument() // tipoMovimiento column removed
    // nitTercero (no catalog match for "0") renders the raw value in its combobox trigger,
    // once the (mocked) catalog finishes loading
    expect(await screen.findByRole("button", { name: "0" })).toBeInTheDocument()
    // nombreTercero renders as plain "-"
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByRole("button", { name: "Seleccionar Facturas" })
    ).toBeInTheDocument()
  })

  it("renders Seleccionar Facturas between Nombre Tercero and Subtipo Documento, in document order", async () => {
    mockCatalogos()

    render(
      <ExtractoMovementsTable movements={[sampleMovement]} loading={false} error={null} />
    )

    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent)
    expect(headers).toEqual([
      "Fecha",
      "Descripción",
      "Débito",
      "Crédito",
      "NIT Tercero",
      "Nombre Tercero",
      "",
      "Subtipo Documento",
      "Cuenta Contable",
    ])
  })

  it("enables Seleccionar Facturas only when the row has a nitTercero", async () => {
    mockCatalogos()

    render(
      <ExtractoMovementsTable
        movements={[sampleMovement, { ...sampleMovement, idRegistroExtracto: 445, nitTercero: null }]}
        loading={false}
        error={null}
      />
    )

    const buttons = await screen.findAllByRole("button", { name: "Seleccionar Facturas" })
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toBeEnabled()
    expect(buttons[1]).toBeDisabled()
  })

  it("shows a placeholder when there are no movements", async () => {
    mockCatalogos()
    render(<ExtractoMovementsTable movements={[]} loading={false} error={null} />)

    expect(
      await screen.findByText("No hay movimientos para este extracto.")
    ).toBeInTheDocument()
  })

  it("shows a loading message while movements are being fetched", async () => {
    mockCatalogos()
    render(<ExtractoMovementsTable movements={null} loading={true} error={null} />)

    expect(await screen.findByText("Cargando movimientos...")).toBeInTheDocument()
  })

  it("shows an error message when the fetch fails", async () => {
    mockCatalogos()
    render(
      <ExtractoMovementsTable movements={null} loading={false} error="No se pudo cargar" />
    )

    expect(await screen.findByText("No se pudo cargar")).toBeInTheDocument()
  })

  it("selecting a tercero updates both nitTercero and nombreTercero", async () => {
    mockCatalogos()
    const user = userEvent.setup()

    render(
      <ExtractoMovementsTable movements={[sampleMovement]} loading={false} error={null} />
    )

    const nitButton = await screen.findByRole("button", { name: "0" })
    await user.click(nitButton)
    await user.click(await screen.findByText(/MOVISTAR/))

    // nitTercero's trigger shows only the code, not the name
    expect(await screen.findByRole("button", { name: "800186061" })).toBeInTheDocument()
    expect(screen.getByText("MOVISTAR")).toBeInTheDocument()
  })

  it("selecting a cuenta contable updates only that cell", async () => {
    mockCatalogos()
    const user = userEvent.setup()

    render(
      <ExtractoMovementsTable movements={[sampleMovement]} loading={false} error={null} />
    )

    const cuentaButton = await screen.findByRole("button", { name: "Buscar cuenta..." })
    await user.click(cuentaButton)
    await user.click(await screen.findByText(/NO APLICA/))

    expect(
      await screen.findByRole("button", { name: "00 — NO APLICA" })
    ).toBeInTheDocument()
    // nitTercero is unaffected
    expect(screen.getByRole("button", { name: "0" })).toBeInTheDocument()
  })

  it("resets local edits when a fresh movements prop is passed", async () => {
    mockCatalogos()
    const user = userEvent.setup()

    const { rerender } = render(
      <ExtractoMovementsTable movements={[sampleMovement]} loading={false} error={null} />
    )

    const nitButton = await screen.findByRole("button", { name: "0" })
    await user.click(nitButton)
    await user.click(await screen.findByText(/MOVISTAR/))
    expect(await screen.findByRole("button", { name: "800186061" })).toBeInTheDocument()

    rerender(
      <ExtractoMovementsTable movements={[{ ...sampleMovement }]} loading={false} error={null} />
    )

    expect(screen.getByRole("button", { name: "0" })).toBeInTheDocument()
  })
})
