import { get } from "./http"
import type { CatalogItem } from "./types"

export function getTerceros(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/terceros")
}

export function getCuentasContables(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/cuentas-contables")
}

export function getSubTiposDocumento(): Promise<CatalogItem[]> {
  return get<CatalogItem[]>("/catalogos/subtipos-documento")
}
