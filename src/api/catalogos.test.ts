import { afterEach, describe, expect, it, vi } from "vitest"
import { getCuentasContables, getSubTiposDocumento, getTerceros } from "./catalogos"
import { ApiError } from "./types"
import type { CatalogItem } from "./types"

function stubFetchSuccess(items: CatalogItem[]) {
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

describe("catalogos api", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("getTerceros returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "1000570208", nombre: "OCHOA TRUJILLO LUCAS" }]
    stubFetchSuccess(items)

    await expect(getTerceros()).resolves.toEqual(items)
  })

  it("getTerceros surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getTerceros()).rejects.toBeInstanceOf(ApiError)
  })

  it("getCuentasContables returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "00", nombre: "NO APLICA" }]
    stubFetchSuccess(items)

    await expect(getCuentasContables()).resolves.toEqual(items)
  })

  it("getCuentasContables surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getCuentasContables()).rejects.toBeInstanceOf(ApiError)
  })

  it("getSubTiposDocumento returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "040", nombre: "COMPROBANTE DE INGRESO CxC" }]
    stubFetchSuccess(items)

    await expect(getSubTiposDocumento()).resolves.toEqual(items)
  })

  it("getSubTiposDocumento surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getSubTiposDocumento()).rejects.toBeInstanceOf(ApiError)
  })
})
