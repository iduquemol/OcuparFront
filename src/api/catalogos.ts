import { get } from "./http"
import type { CatalogItem, CuentaContableItem } from "./types"

export function getTerceros(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/terceros")
}

export function getCuentasContables(): Promise<CuentaContableItem[]> {
  return get<CuentaContableItem[]>("/catalogos/cuentas-contables")
}

export function getSubTiposDocumento(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/subtipos-documento")
}

export function getSucursales(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/sucursales")
}

export function getCentrosCosto(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/centros-costo")
}

export function getClasificador1(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/clasificador1")
}

export function getClasificador2(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/clasificador2")
}

export function getClasificador3(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/clasificador3")
}
