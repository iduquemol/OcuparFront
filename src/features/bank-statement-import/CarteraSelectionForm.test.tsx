import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CarteraSelectionForm } from "./CarteraSelectionForm"
import * as carteraApi from "@/api/cartera"
import * as catalogosApi from "@/api/catalogos"
import type { CarteraDocumento } from "@/api/types"
import { formatCurrency } from "@/lib/currency"

function mockCarteraCatalogos() {
  vi.spyOn(catalogosApi, "getClasificador3").mockResolvedValue([
    { codigo: "0", nombre: "NO APLICA" },
  ])
  vi.spyOn(catalogosApi, "getCuentasContables").mockResolvedValue([
    { codigo: "236540", nombre: "RETEFUENTE SERVICIOS", tipo: "RteFte" },
    { codigo: "236801", nombre: "RETEICA", tipo: "ReteIca" },
    { codigo: "240810", nombre: "RETEIVA", tipo: "ReteIva" },
    { codigo: "130505", nombre: "OTRA CUENTA", tipo: "Otro" },
  ])
}

function makeDocumento(overrides: Partial<CarteraDocumento> = {}): CarteraDocumento {
  return {
    codigoCliente: "79217534",
    nitCliente: "79217534",
    anoDocumento: "2026",
    periodoDocumento: "10",
    tipoDocumento: "010",
    subTipoDocumento: "010",
    numeroDocumento: "FES12870",
    registroDocumento: 1,
    detalleDocumento: "ARRENDAMIENTO",
    fechaVencimiento: "2026-10-06",
    codigoSucursal: "04",
    codigoCentroCosto: "010000",
    codigoClasificador1: "00",
    codigoClasificador2: "04",
    codigoClasificador3: "0",
    indicadorConciliacion: "0  ",
    saldoDocumento: 100,
    valorRetencion: 10,
    valorIca: 5,
    retencionIva: 2,
    mayorValor: 1,
    menorValor: 1,
    valorPago: 50,
    codigoCuentaContable: "130505",
    tipoMoneda: "00",
    codigoPais: "057",
    codigoDepartamento: "25",
    codigoCiudad: "25000",
    ...overrides,
  }
}

function summaryCheckboxFor(numeroDocumento: string) {
  // The summary table is always the first table in the DOM, so its cell for
  // this document (if any) is always the first match.
  const row = screen.getAllByText(numeroDocumento)[0].closest("tr")
  if (!row) throw new Error(`No row found for ${numeroDocumento}`)
  return within(row).getByRole("checkbox")
}

describe("CarteraSelectionForm", () => {
  beforeEach(() => {
    mockCarteraCatalogos()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it("shows a loading state while the cartera is being fetched", async () => {
    vi.spyOn(carteraApi, "getCartera").mockReturnValue(new Promise(() => {}))

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(await screen.findByText("Cargando cartera...")).toBeInTheDocument()
  })

  it("shows an error message when the cartera request fails", async () => {
    vi.spyOn(carteraApi, "getCartera").mockRejectedValue(new Error("No se pudo cargar"))

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(await screen.findByText("No se pudo cargar")).toBeInTheDocument()
  })

  it("Saldo Actual totals the full response regardless of selection", async () => {
    const documentos = [
      makeDocumento({ numeroDocumento: "A", saldoDocumento: 100 }),
      makeDocumento({ numeroDocumento: "B", saldoDocumento: 30 }),
    ]
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue(documentos)

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    const saldoActualCard = (await screen.findByText("Saldo Actual")).closest(
      '[data-slot="card"]'
    ) as HTMLElement

    expect(within(saldoActualCard).getByText("2")).toBeInTheDocument() // Cantidad Facturas
    expect(within(saldoActualCard).getByText("$ 130,00")).toBeInTheDocument() // Saldo Total = 100+30
  })

  it("Facturas Abonadas starts at zero and updates as rows are checked and unchecked", async () => {
    const documentos = [
      makeDocumento({ numeroDocumento: "A", valorPago: 50, valorRetencion: 10, valorIca: 5, retencionIva: 2, mayorValor: 1, menorValor: 1 }),
      makeDocumento({ numeroDocumento: "B", valorPago: 30, valorRetencion: 4, valorIca: 3, retencionIva: 1, mayorValor: 0, menorValor: 2 }),
    ]
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue(documentos)
    const user = userEvent.setup()

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    const facturasCard = (await screen.findByText("Facturas Abonadas")).closest(
      '[data-slot="card"]'
    ) as HTMLElement

    expect(within(facturasCard).getByText("Cantidad").nextSibling).toHaveTextContent("0")

    await user.click(summaryCheckboxFor("A"))
    expect(within(facturasCard).getByText("Cantidad").nextSibling).toHaveTextContent("1")
    expect(within(facturasCard).getByText("RteFte").nextSibling).toHaveTextContent("10")

    await user.click(summaryCheckboxFor("B"))
    expect(within(facturasCard).getByText("Cantidad").nextSibling).toHaveTextContent("2")
    expect(within(facturasCard).getByText("RteFte").nextSibling).toHaveTextContent("14")

    await user.click(summaryCheckboxFor("A"))
    expect(within(facturasCard).getByText("Cantidad").nextSibling).toHaveTextContent("1")
    expect(within(facturasCard).getByText("RteFte").nextSibling).toHaveTextContent("4")
  })

  it("shows zeroed totals for an empty cartera response", async () => {
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue([])

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={0}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(await screen.findByText("No hay documentos en la cartera.")).toBeInTheDocument()
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(8)
    // Saldo Total and Valor Banco both show the formatted zero
    expect(screen.getAllByText("$ 0,00").length).toBeGreaterThanOrEqual(2)
  })

  it("Valor Banco shows the originating movement's credito, formatted as currency", async () => {
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue([])

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await screen.findByText("No hay documentos en la cartera.")
    expect(screen.getByText("$ 25.240.200,00")).toBeInTheDocument()
  })

  it("checking summary rows accumulates them in the detail table; unchecking removes them", async () => {
    const documentos = [
      makeDocumento({ numeroDocumento: "A" }),
      makeDocumento({ numeroDocumento: "B" }),
    ]
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue(documentos)
    const user = userEvent.setup()

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText("Seleccione uno o varios documentos en la tabla superior.")
    ).toBeInTheDocument()

    await user.click(summaryCheckboxFor("A"))
    expect(
      screen.queryByText("Seleccione uno o varios documentos en la tabla superior.")
    ).not.toBeInTheDocument()
    expect(screen.getAllByText("A")).toHaveLength(2) // summary row + detail row

    await user.click(summaryCheckboxFor("B"))
    expect(screen.getAllByText("A")).toHaveLength(2)
    expect(screen.getAllByText("B")).toHaveLength(2)

    await user.click(summaryCheckboxFor("A"))
    expect(screen.getAllByText("A")).toHaveLength(1) // only in the summary table now
    expect(screen.getAllByText("B")).toHaveLength(2)
  })

  it("renders a right-aligned Procesar button and no checkboxes in the detail table", async () => {
    const documento = makeDocumento({ numeroDocumento: "A" })
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue([documento])
    const user = userEvent.setup()

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await screen.findByText("A")

    const procesarButton = screen.getByRole("button", { name: "Procesar" })
    expect(procesarButton).toBeInTheDocument()
    expect(procesarButton.parentElement).toHaveClass("justify-end")

    // Before selecting anything, the only checkbox is the summary table's one row
    expect(screen.getAllByRole("checkbox")).toHaveLength(1)

    await user.click(summaryCheckboxFor("A"))

    // After selection, the document also appears in the detail table, but the
    // detail table itself adds no new checkbox
    expect(screen.getAllByText("A")).toHaveLength(2)
    expect(screen.getAllByRole("checkbox")).toHaveLength(1)
  })

  it("selecting a catalog option in the detail table updates the field locally without changing totals", async () => {
    const documento = makeDocumento({ numeroDocumento: "A", codigoClasificador3: "9" })
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue([documento])
    const user = userEvent.setup()

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await screen.findByText("A")
    await user.click(summaryCheckboxFor("A"))

    const facturasCard = screen.getByText("Facturas Abonadas").closest(
      '[data-slot="card"]'
    ) as HTMLElement
    expect(within(facturasCard).getByText("Cantidad").nextSibling).toHaveTextContent("1")

    // Select a Clasificador3 option in the detail table (second table in the DOM)
    const clasificador3Button = screen.getByRole("button", { name: "9" })
    await user.click(clasificador3Button)
    await user.click(await screen.findByText(/NO APLICA/))

    expect(await screen.findByRole("button", { name: "0 — NO APLICA" })).toBeInTheDocument()
    // Totals are unaffected by this field, which they don't depend on
    expect(within(facturasCard).getByText("Cantidad").nextSibling).toHaveTextContent("1")
  })

  it("enables the retention-account comboboxes only when their retention value is greater than 0, and filters by tipo", async () => {
    const documento = makeDocumento({
      numeroDocumento: "A",
      valorRetencion: 10,
      valorIca: 0,
      retencionIva: 2,
    })
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue([documento])
    const user = userEvent.setup()

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await screen.findByText("A")
    await user.click(summaryCheckboxFor("A"))

    const [reteFuenteCombo, reteIcaCombo, reteIvaCombo] = screen.getAllByRole("button", {
      name: "Buscar cuenta...",
    })
    expect(reteFuenteCombo).toBeEnabled()
    expect(reteIcaCombo).toBeDisabled()
    expect(reteIvaCombo).toBeEnabled()

    await user.click(reteFuenteCombo)
    expect(screen.getByText(/RETEFUENTE SERVICIOS/)).toBeInTheDocument()
    expect(screen.queryByText(/RETEICA/)).not.toBeInTheDocument()
    expect(screen.queryByText(/RETEIVA/)).not.toBeInTheDocument()
    await user.click(screen.getByText(/RETEFUENTE SERVICIOS/))

    expect(
      await screen.findByRole("button", { name: "236540 — RETEFUENTE SERVICIOS" })
    ).toBeInTheDocument()
  })

  it("editing a retention amount updates the Facturas Abonadas totals for selected rows", async () => {
    const documento = makeDocumento({ numeroDocumento: "A", valorRetencion: 10 })
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue([documento])
    const user = userEvent.setup()

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await screen.findByText("A")
    await user.click(summaryCheckboxFor("A"))

    const facturasCard = screen.getByText("Facturas Abonadas").closest(
      '[data-slot="card"]'
    ) as HTMLElement
    expect(within(facturasCard).getByText("RteFte").nextSibling).toHaveTextContent("10")

    const [reteFuenteInput] = screen.getAllByRole("textbox")
    await user.clear(reteFuenteInput)
    await user.type(reteFuenteInput, "2500")

    expect(reteFuenteInput).toHaveValue(formatCurrency(25))
    expect(within(facturasCard).getByText("RteFte").nextSibling).toHaveTextContent("25")
  })

  it("editing a retention amount from 0 enables, and back to 0 disables, its account combobox", async () => {
    const documento = makeDocumento({ numeroDocumento: "A", valorIca: 0 })
    vi.spyOn(carteraApi, "getCartera").mockResolvedValue([documento])
    const user = userEvent.setup()

    render(
      <CarteraSelectionForm
        nitTercero="79217534"
        nombreTercero="OCHOA TRUJILLO LUCAS"
        creditoMovimiento={25240200}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await screen.findByText("A")
    await user.click(summaryCheckboxFor("A"))

    const [, reteIcaInput] = screen.getAllByRole("textbox")
    const [, reteIcaCombo] = screen.getAllByRole("button", { name: "Buscar cuenta..." })
    expect(reteIcaCombo).toBeDisabled()

    await user.type(reteIcaInput, "500")
    expect(reteIcaInput).toHaveValue(formatCurrency(5))
    expect(reteIcaCombo).toBeEnabled()

    await user.clear(reteIcaInput)
    expect(reteIcaInput).toHaveValue(formatCurrency(0))
    expect(reteIcaCombo).toBeDisabled()
  })
})
