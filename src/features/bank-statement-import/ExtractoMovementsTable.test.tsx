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
    { codigo: "00", nombre: "NO APLICA" },
  ])
  vi.spyOn(catalogosApi, "getSubTiposDocumento").mockResolvedValue([
    { codigo: "040", nombre: "COMPROBANTE DE INGRESO CxC" },
  ])
}

describe("ExtractoMovementsTable", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders all 10 columns for a movement", async () => {
    mockCatalogos()

    render(
      <ExtractoMovementsTable movements={[sampleMovement]} loading={false} error={null} />
    )

    expect(screen.getByText("2026-08-03")).toBeInTheDocument()
    expect(screen.getByText("COMPRA INTERNET")).toBeInTheDocument()
    expect(screen.getByText("25240200")).toBeInTheDocument()
    expect(screen.getByText("N227")).toBeInTheDocument()
    // nitTercero (no catalog match for "0") renders the raw value in its combobox trigger,
    // once the (mocked) catalog finishes loading
    expect(await screen.findByRole("button", { name: "0" })).toBeInTheDocument()
    // nombreTercero and detalleMovimiento render as plain "-"
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(2)
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

    expect(
      await screen.findByRole("button", { name: "800186061 — MOVISTAR" })
    ).toBeInTheDocument()
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
    expect(
      await screen.findByRole("button", { name: "800186061 — MOVISTAR" })
    ).toBeInTheDocument()

    rerender(
      <ExtractoMovementsTable movements={[{ ...sampleMovement }]} loading={false} error={null} />
    )

    expect(screen.getByRole("button", { name: "0" })).toBeInTheDocument()
  })
})
