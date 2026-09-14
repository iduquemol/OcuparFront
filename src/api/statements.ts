import { postForm } from "./http"
import type { StatementRow } from "./types"

export interface SubmitStatementInput {
  bankId: string
  accountId: string
  startDate: Date
  endDate: Date
  file: File
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function submitStatement(
  input: SubmitStatementInput
): Promise<StatementRow[]> {
  const formData = new FormData()
  formData.append("bankId", input.bankId)
  formData.append("accountId", input.accountId)
  formData.append("startDate", toIsoDate(input.startDate))
  formData.append("endDate", toIsoDate(input.endDate))
  formData.append("file", input.file)

  return postForm<StatementRow[]>("/statements", formData)
}
