import { afterEach, describe, expect, it, vi } from "vitest"
import { getExtractoMovements, submitCajaSocialExtracto } from "./extractos"
import { ApiError } from "./types"
import type { ExtractoMovement } from "./types"
import type { CajaSocialExtracto } from "@/statement-parsing/types"

function makeExtracto(): CajaSocialExtracto {
  return {
    idExtracto: null,
    codigoBanco: "32",
    codigoCuenta: "01",
    fechaInicial: "2026-08-01",
    fechaFinal: "2026-08-09",
    cajaSocial: [
      {
        idRegistroExtracto: null,
        fechaSaldo: "1/08/2026",
        fechaTransaccion: null,
        descripcion: "SALDO INICIAL",
        valor: "0.00",
        saldo: "29686186.74",
        regionalOficina: null,
        tipoTransaccion: null,
        oficina: null,
        refTitularCuenta: null,
        detallesAdicionales: null,
      },
    ],
  }
}

describe("submitCajaSocialExtracto", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("posts the extracto as JSON and returns the generated idExtracto", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ idExtracto: 56 }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const extracto = makeExtracto()
    const result = await submitCajaSocialExtracto(extracto)

    expect(result).toEqual({ idExtracto: 56 })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain("/extractos/caja-social")
    expect(init.method).toBe("POST")
    expect(init.headers).toEqual({ "Content-Type": "application/json" })
    expect(JSON.parse(init.body as string)).toEqual(extracto)
  })

  it("surfaces an ApiError when the load fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "invalid extracto" }), {
          status: 422,
        })
      )
    )

    await expect(submitCajaSocialExtracto(makeExtracto())).rejects.toBeInstanceOf(ApiError)
  })
})

describe("getExtractoMovements", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches and returns the movements for the given idExtracto", async () => {
    const movements: ExtractoMovement[] = [
      {
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
      },
    ]
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(movements), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const result = await getExtractoMovements(72)

    expect(result).toEqual(movements)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/extractos/72"),
      undefined
    )
  })

  it("surfaces an ApiError when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "not found" }), { status: 404 })
      )
    )

    await expect(getExtractoMovements(999)).rejects.toBeInstanceOf(ApiError)
  })
})
