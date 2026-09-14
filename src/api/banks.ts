import { get } from "./http"
import type { Bank, BankAccount } from "./types"

export function getBanks(): Promise<Bank[]> {
  return get<Bank[]>("/banks")
}

export function getAccountsByBank(bankId: string): Promise<BankAccount[]> {
  return get<BankAccount[]>(
    `/banks/${encodeURIComponent(bankId)}/accounts`
  )
}
