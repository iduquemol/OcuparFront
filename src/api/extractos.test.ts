import { afterEach, describe, expect, it, vi } from "vitest"
import { submitCajaSocialExtracto } from "./extractos"
import { ApiError } from "./types"
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
