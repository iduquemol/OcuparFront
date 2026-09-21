import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseCajaSocialCsv } from "./cajaSocialParser"

const fixtureDir = path.dirname(fileURLToPath(import.meta.url))
const fixtureBytes = readFileSync(
  path.join(fixtureDir, "__fixtures__", "caja-social-sample.csv")
)

function fixtureFile() {
  return new File([fixtureBytes], "caja-social-sample.csv", {
    type: "text/csv",
  })
}

function toWindows1252Bytes(text: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(text.length))
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i)
  }
  return bytes
}

const baseInput = {
  bankCode: "32",
  accountCode: "01",
  startDate: new Date("2026-08-01T00:00:00Z"),
  endDate: new Date("2026-08-31T00:00:00Z"),
}

describe("parseCajaSocialCsv", () => {
  it("excludes the title and header lines from the parsed records", async () => {
    const result = await parseCajaSocialCsv({ ...baseInput, file: fixtureFile() })

    expect(result.cajaSocial).toHaveLength(26)
    expect(
      result.cajaSocial.some((r) => r.fechaSaldo === "Consulta de Saldos y Movimientos")
    ).toBe(false)
    expect(result.cajaSocial.some((r) => r.fechaSaldo === "Fecha Saldo")).toBe(false)
  })

  it("maps a data row's columns positionally, with no reordering", async () => {
    const result = await parseCajaSocialCsv({ ...baseInput, file: fixtureFile() })

    const compra = result.cajaSocial.find((r) => r.descripcion === "COMPRA INTERNET")

    expect(compra).toEqual({
      idRegistroExtracto: null,
      fechaSaldo: null,
      fechaTransaccion: "3/08/2026",
      descripcion: "COMPRA INTERNET",
      valor: "-25240200.00",
      saldo: null,
      regionalOficina: "321102",
      tipoTransaccion: "N227",
      oficina: "(BCS) Internet",
      refTitularCuenta: "536192014",
      detallesAdicionales: null,
    })
  })

  it("maps empty CSV cells to null, not empty strings", async () => {
    const result = await parseCajaSocialCsv({ ...baseInput, file: fixtureFile() })

    const saldoInicial = result.cajaSocial.find(
      (r) => r.fechaSaldo === "1/08/2026" && r.descripcion === "SALDO INICIAL"
    )

    expect(saldoInicial?.fechaTransaccion).toBeNull()
    expect(saldoInicial?.regionalOficina).toBeNull()
    expect(saldoInicial?.detallesAdicionales).toBeNull()
  })

  it("does not produce a record for the trailing blank line", async () => {
    const result = await parseCajaSocialCsv({ ...baseInput, file: fixtureFile() })

    expect(result.cajaSocial.every((r) => r.fechaSaldo !== null || r.fechaTransaccion !== null)).toBe(
      true
    )
  })

  it("decodes Windows-1252 accented characters correctly", async () => {
    const csvText =
      "Consulta de Saldos y Movimientos;;;;;;;;;\n" +
      "Fecha Saldo;Fecha Transacción;Descripción;Valor;Saldo;Regional / Oficina;Tipo Transacción;Oficina;Ref. Titular Cuenta;Detalles Adicionales\n" +
      "10/08/2026;;PAGÓ NÓMINA;-500.00;1000.00;;;;;\n"

    const file = new File([toWindows1252Bytes(csvText)], "accented.csv", {
      type: "text/csv",
    })

    const result = await parseCajaSocialCsv({ ...baseInput, file })

    expect(result.cajaSocial).toEqual([
      {
        idRegistroExtracto: null,
        fechaSaldo: "10/08/2026",
        fechaTransaccion: null,
        descripcion: "PAGÓ NÓMINA",
        valor: "-500.00",
        saldo: "1000.00",
        regionalOficina: null,
        tipoTransaccion: null,
        oficina: null,
        refTitularCuenta: null,
        detallesAdicionales: null,
      },
    ])
  })

  it("populates the envelope fields from the input", async () => {
    const result = await parseCajaSocialCsv({
      bankCode: "32",
      accountCode: "01",
      startDate: new Date("2026-08-01T00:00:00Z"),
      endDate: new Date("2026-08-31T00:00:00Z"),
      file: fixtureFile(),
    })

    expect(result.idExtracto).toBeNull()
    expect(result.codigoBanco).toBe("32")
    expect(result.codigoCuenta).toBe("01")
    expect(result.fechaInicial).toBe("2026-08-01")
    expect(result.fechaFinal).toBe("2026-08-31")
  })
})
