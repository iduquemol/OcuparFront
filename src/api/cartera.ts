import { get } from "./http"
import type { CarteraDocumento } from "./types"

export function getCartera(nitCli: string): Promise<CarteraDocumento[]> {
  return get<CarteraDocumento[]>(`/cartera/${nitCli}`)
}
