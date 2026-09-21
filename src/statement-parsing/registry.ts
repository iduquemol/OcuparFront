import { parseCajaSocialCsv } from "./parsers/cajaSocialParser"
import type { CajaSocialExtracto, ParseStatementInput } from "./types"

type Parser = (input: ParseStatementInput) => Promise<CajaSocialExtracto>

const parsers: Record<string, Parser> = {
  "32": parseCajaSocialCsv,
}

export function hasParser(bankCode: string): boolean {
  return bankCode in parsers
}

export async function parseStatementCsv(
  input: ParseStatementInput
): Promise<CajaSocialExtracto> {
  const parser = parsers[input.bankCode]
  if (!parser) {
    throw new Error(`No CSV parser registered for bank code "${input.bankCode}"`)
  }

  return parser(input)
}
