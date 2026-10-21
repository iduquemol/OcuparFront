import { get, postJson } from "./http"
import type { CajaSocialExtracto } from "@/statement-parsing/types"
import type { ExtractoMovement } from "./types"

export interface LoadExtractoResult {
  idExtracto: number
}

export function submitCajaSocialExtracto(
  extracto: CajaSocialExtracto
): Promise<LoadExtractoResult> {
  return postJson<LoadExtractoResult>("/extractos/caja-social", extracto)
}

export function getExtractoMovements(
  idExtracto: number
): Promise<ExtractoMovement[]> {
  return get<ExtractoMovement[]>(`/extractos/${idExtracto}`)
}
