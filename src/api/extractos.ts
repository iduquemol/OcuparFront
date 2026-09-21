import { postJson } from "./http"
import type { CajaSocialExtracto } from "@/statement-parsing/types"

export interface LoadExtractoResult {
  idExtracto: number
}

export function submitCajaSocialExtracto(
  extracto: CajaSocialExtracto
): Promise<LoadExtractoResult> {
  return postJson<LoadExtractoResult>("/extractos/caja-social", extracto)
}
