import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { useBankStatementImport } from "./useBankStatementImport"
import * as banksApi from "@/api/banks"
import * as extractosApi from "@/api/extractos"
import * as registry from "@/statement-parsing/registry"
import type { CajaSocialExtracto } from "@/statement-parsing/types"

function makeCsvFile(name = "statement.csv") {
  return new File(["date,amount\n2024-01-01,100"], name, { type: "text/csv" })
}

function makeExtracto(): CajaSocialExtracto {
  return {
    idExtracto: null,
    codigoBanco: "32",
    codigoCuenta: "a1",
    fechaInicial: "2024-01-01",
    fechaFinal: "2024-01-31",
    cajaSocial: [],
  }
}

describe("useBankStatementImport", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("loads banks on mount", async () => {
    const banks = [{ id: "b1", name: "Bank One" }]
    vi.spyOn(banksApi, "getBanks").mockResolvedValue(banks)
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([])

    const { result } = renderHook(() => useBankStatementImport())

    expect(result.current.banksLoading).toBe(true)
    await waitFor(() => expect(result.current.banksLoading).toBe(false))
    expect(result.current.banks).toEqual(banks)
  })

  it("loads accounts filtered by the selected bank and resets on bank change", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([
      { id: "b1", name: "Bank One" },
      { id: "b2", name: "Bank Two" },
    ])
    const getAccountsByBank = vi
      .spyOn(banksApi, "getAccountsByBank")
      .mockImplementation((bankId) =>
        Promise.resolve([
          { id: `${bankId}-a1`, bankId, name: "Checking", accountNumber: "1" },
        ])
      )

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    act(() => result.current.selectBank("b1"))
    await waitFor(() => expect(result.current.accountsLoading).toBe(false))
    expect(getAccountsByBank).toHaveBeenCalledWith("b1")
    expect(result.current.accounts).toEqual([
      { id: "b1-a1", bankId: "b1", name: "Checking", accountNumber: "1" },
    ])

    act(() => result.current.selectAccount("b1-a1"))
    expect(result.current.form.accountId).toBe("b1-a1")

    act(() => result.current.selectBank("b2"))
    expect(result.current.form.accountId).toBeNull()
    await waitFor(() => expect(getAccountsByBank).toHaveBeenCalledWith("b2"))
  })

  it("rejects a non-csv file and blocks submission", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([])

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    act(() =>
      result.current.selectFile(new File(["x"], "statement.txt"))
    )

    expect(result.current.fileError).toBe("Solo se aceptan archivos .csv")
    expect(result.current.form.file).toBeNull()
    expect(result.current.isFormComplete).toBe(false)
  })

  it("flags an end date before the start date and blocks submission", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([])

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    act(() => {
      result.current.setStartDate(new Date("2024-02-01"))
      result.current.setEndDate(new Date("2024-01-01"))
    })

    expect(result.current.dateRangeError).toBe(
      "La fecha final no puede ser anterior a la fecha inicial"
    )
    expect(result.current.isFormComplete).toBe(false)
  })

  it("enables submission only once bank, account, dates and file are all valid", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([{ id: "32", name: "Caja Social" }])
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([
      { id: "a1", bankId: "32", name: "Checking", accountNumber: "1" },
    ])

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    expect(result.current.isFormComplete).toBe(false)

    act(() => result.current.selectBank("32"))
    await waitFor(() => expect(result.current.accountsLoading).toBe(false))
    act(() => result.current.selectAccount("a1"))
    act(() => {
      result.current.setStartDate(new Date("2024-01-01"))
      result.current.setEndDate(new Date("2024-01-31"))
      result.current.selectFile(makeCsvFile())
    })

    expect(result.current.isFormComplete).toBe(true)
  })

  it("blocks submission when the selected bank has no registered parser", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([{ id: "b1", name: "Bank One" }])
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([
      { id: "a1", bankId: "b1", name: "Checking", accountNumber: "1" },
    ])

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    act(() => result.current.selectBank("b1"))
    await waitFor(() => expect(result.current.accountsLoading).toBe(false))
    act(() => {
      result.current.selectAccount("a1")
      result.current.setStartDate(new Date("2024-01-01"))
      result.current.setEndDate(new Date("2024-01-31"))
      result.current.selectFile(makeCsvFile())
    })

    expect(result.current.bankUnsupported).toBe(true)
    expect(result.current.isFormComplete).toBe(false)

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.idExtracto).toBeNull()
  })

  it("submit parses the CSV, sends the extracto, and stores the returned idExtracto", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([{ id: "32", name: "Caja Social" }])
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([
      { id: "a1", bankId: "32", name: "Checking", accountNumber: "1" },
    ])
    const extracto = makeExtracto()
    const parseStatementCsvMock = vi
      .spyOn(registry, "parseStatementCsv")
      .mockResolvedValue(extracto)
    const submitMock = vi
      .spyOn(extractosApi, "submitCajaSocialExtracto")
      .mockResolvedValue({ idExtracto: 56 })

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    act(() => result.current.selectBank("32"))
    await waitFor(() => expect(result.current.accountsLoading).toBe(false))
    const file = makeCsvFile()
    act(() => {
      result.current.selectAccount("a1")
      result.current.setStartDate(new Date("2024-01-01"))
      result.current.setEndDate(new Date("2024-01-31"))
      result.current.selectFile(file)
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(parseStatementCsvMock).toHaveBeenCalledWith(
      expect.objectContaining({ bankCode: "32", accountCode: "a1", file })
    )
    expect(submitMock).toHaveBeenCalledWith(extracto)
    expect(result.current.idExtracto).toBe(56)
    expect(result.current.submitError).toBeNull()
  })

  it("submit surfaces an error and leaves idExtracto unset on failure", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([{ id: "32", name: "Caja Social" }])
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([
      { id: "a1", bankId: "32", name: "Checking", accountNumber: "1" },
    ])
    vi.spyOn(registry, "parseStatementCsv").mockResolvedValue(makeExtracto())
    vi.spyOn(extractosApi, "submitCajaSocialExtracto").mockRejectedValue(
      new Error("processing failed")
    )

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    act(() => result.current.selectBank("32"))
    await waitFor(() => expect(result.current.accountsLoading).toBe(false))
    act(() => {
      result.current.selectAccount("a1")
      result.current.setStartDate(new Date("2024-01-01"))
      result.current.setEndDate(new Date("2024-01-31"))
      result.current.selectFile(makeCsvFile())
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.submitError).toBe("processing failed")
    expect(result.current.idExtracto).toBeNull()
  })
})
