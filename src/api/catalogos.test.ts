import { afterEach, describe, expect, it, vi } from "vitest"
import {
  getCentrosCosto,
  getClasificador1,
  getClasificador2,
  getClasificador3,
  getCuentasContables,
  getSubTiposDocumento,
  getSucursales,
  getTerceros,
} from "./catalogos"
import { ApiError } from "./types"
import type { CatalogItem, CuentaContableItem } from "./types"

function stubFetchSuccess(items: CatalogItem[] | CuentaContableItem[]) {
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
    const items: CuentaContableItem[] = [{ codigo: "00", nombre: "NO APLICA", tipo: "RteFte" }]
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

  it("getSucursales returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "01", nombre: "CALI" }]
    stubFetchSuccess(items)

    await expect(getSucursales()).resolves.toEqual(items)
  })

  it("getSucursales surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getSucursales()).rejects.toBeInstanceOf(ApiError)
  })

  it("getCentrosCosto returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "0", nombre: "NO APLICA" }]
    stubFetchSuccess(items)

    await expect(getCentrosCosto()).resolves.toEqual(items)
  })

  it("getCentrosCosto surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getCentrosCosto()).rejects.toBeInstanceOf(ApiError)
  })

  it("getClasificador1 returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "0", nombre: "NO APLICA" }]
    stubFetchSuccess(items)

    await expect(getClasificador1()).resolves.toEqual(items)
  })

  it("getClasificador1 surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getClasificador1()).rejects.toBeInstanceOf(ApiError)
  })

  it("getClasificador2 returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "0", nombre: "NO APLICA" }]
    stubFetchSuccess(items)

    await expect(getClasificador2()).resolves.toEqual(items)
  })

  it("getClasificador2 surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getClasificador2()).rejects.toBeInstanceOf(ApiError)
  })

  it("getClasificador3 returns the catalog", async () => {
    const items: CatalogItem[] = [{ codigo: "0", nombre: "NO APLICA" }]
    stubFetchSuccess(items)

    await expect(getClasificador3()).resolves.toEqual(items)
  })

  it("getClasificador3 surfaces an ApiError on failure", async () => {
    stubFetchFailure()

    await expect(getClasificador3()).rejects.toBeInstanceOf(ApiError)
  })
})
