import { afterEach, describe, expect, it, vi } from "vitest"
import { getCartera } from "./cartera"
import { ApiError } from "./types"
import type { CarteraDocumento } from "./types"

function stubFetchSuccess(items: CarteraDocumento[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(items), { status: 200 }))
  )
}

function stubFetchFailure() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "boom" }), { status: 500 })
    )
  )
}

describe("cartera api", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("getCartera returns the cartera documents", async () => {
    const items: CarteraDocumento[] = [
      {
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
        saldoDocumento: 5408462,
        valorRetencion: 0,
        valorIca: 0,
        retencionIva: 0,
        mayorValor: 0,
        menorValor: 0,
        valorPago: 0,
        codigoCuentaContable: "130505",
        tipoMoneda: "00",
        codigoPais: "057",
        codigoDepartamento: "25",
        codigoCiudad: "25000",
      },
    ]
    stubFetchSuccess(items)

    await expect(getCartera("79217534")).resolves.toEqual(items)
  })

  it("getCartera surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getCartera("79217534")).rejects.toBeInstanceOf(ApiError)
  })
})
