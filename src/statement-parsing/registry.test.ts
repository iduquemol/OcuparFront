import { describe, expect, it } from "vitest"
import { parseStatementCsv } from "./registry"

function makeCsvFile(content: string) {
  return new File([content], "statement.csv", { type: "text/csv" })
}

describe("parseStatementCsv", () => {
  it("routes bank code 32 to the Caja Social parser", async () => {
    const csv =
      "Consulta de Saldos y Movimientos;;;;;;;;;\n" +
      "Fecha Saldo;Fecha Transaccion;Descripcion;Valor;Saldo;Regional / Oficina;Tipo Transaccion;Oficina;Ref. Titular Cuenta;Detalles Adicionales\n" +
      "1/08/2026;;SALDO INICIAL;0.00;100.00;;;;;\n"

    const result = await parseStatementCsv({
      bankCode: "32",
      accountCode: "01",
      startDate: new Date("2026-08-01T00:00:00Z"),
      endDate: new Date("2026-08-31T00:00:00Z"),
      file: makeCsvFile(csv),
    })

    expect(result.cajaSocial).toHaveLength(1)
    expect(result.cajaSocial[0].descripcion).toBe("SALDO INICIAL")
  })

  it("throws a clear error for an unregistered bank code", async () => {
    await expect(
      parseStatementCsv({
        bankCode: "99",
        accountCode: "01",
        startDate: new Date("2026-08-01T00:00:00Z"),
        endDate: new Date("2026-08-31T00:00:00Z"),
        file: makeCsvFile(""),
      })
    ).rejects.toThrow('No CSV parser registered for bank code "99"')
  })
})
