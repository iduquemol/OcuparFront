import type { CajaSocialExtracto, CajaSocialRecord, ParseStatementInput } from "../types"

const COLUMN_COUNT = 10

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function emptyToNull(value: string | undefined): string | null {
  return value ? value : null
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

function parseLine(line: string): CajaSocialRecord {
  const fields = line.split(";")
  while (fields.length < COLUMN_COUNT) {
    fields.push("")
  }

  return {
    idRegistroExtracto: null,
    fechaSaldo: emptyToNull(fields[0]),
    fechaTransaccion: emptyToNull(fields[1]),
    descripcion: emptyToNull(fields[2]),
    valor: emptyToNull(fields[3]),
    saldo: emptyToNull(fields[4]),
    regionalOficina: emptyToNull(fields[5]),
    tipoTransaccion: emptyToNull(fields[6]),
    oficina: emptyToNull(fields[7]),
    refTitularCuenta: emptyToNull(fields[8]),
    detallesAdicionales: emptyToNull(fields[9]),
  }
}

export async function parseCajaSocialCsv(
  input: ParseStatementInput
): Promise<CajaSocialExtracto> {
  const buffer = await readFileAsArrayBuffer(input.file)
  const text = new TextDecoder("windows-1252").decode(buffer)

  const lines = text.split(/\r\n|\n/)
  const dataLines = lines.slice(2).filter((line) => line.trim() !== "")

  const cajaSocial = dataLines.map(parseLine)

  return {
    idExtracto: null,
    codigoBanco: input.bankCode,
    codigoCuenta: input.accountCode,
    fechaInicial: toIsoDate(input.startDate),
    fechaFinal: toIsoDate(input.endDate),
    cajaSocial,
  }
}
