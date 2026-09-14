import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { useBankStatementImport } from "./useBankStatementImport"
import * as banksApi from "@/api/banks"
import * as statementsApi from "@/api/statements"

function makeCsvFile(name = "statement.csv") {
  return new File(["date,amount\n2024-01-01,100"], name, { type: "text/csv" })
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
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([{ id: "b1", name: "Bank One" }])
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([
      { id: "a1", bankId: "b1", name: "Checking", accountNumber: "1" },
    ])

    const { result } = renderHook(() => useBankStatementImport())
    await waitFor(() => expect(result.current.banksLoading).toBe(false))

    expect(result.current.isFormComplete).toBe(false)

    act(() => result.current.selectBank("b1"))
    await waitFor(() => expect(result.current.accountsLoading).toBe(false))
    act(() => result.current.selectAccount("a1"))
    act(() => {
      result.current.setStartDate(new Date("2024-01-01"))
      result.current.setEndDate(new Date("2024-01-31"))
      result.current.selectFile(makeCsvFile())
    })

    expect(result.current.isFormComplete).toBe(true)
  })

  it("submit sends the form data and stores the returned rows", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([{ id: "b1", name: "Bank One" }])
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([
      { id: "a1", bankId: "b1", name: "Checking", accountNumber: "1" },
    ])
    const rows = [
      { date: "2024-01-01", description: "Deposit", amount: 100, balance: 100 },
    ]
    const submitStatementMock = vi
      .spyOn(statementsApi, "submitStatement")
      .mockResolvedValue(rows)

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

    await act(async () => {
      await result.current.submit()
    })

    expect(submitStatementMock).toHaveBeenCalledWith(
      expect.objectContaining({ bankId: "b1", accountId: "a1" })
    )
    expect(result.current.rows).toEqual(rows)
    expect(result.current.submitError).toBeNull()
  })

  it("submit surfaces an error and leaves rows unset on failure", async () => {
    vi.spyOn(banksApi, "getBanks").mockResolvedValue([{ id: "b1", name: "Bank One" }])
    vi.spyOn(banksApi, "getAccountsByBank").mockResolvedValue([
      { id: "a1", bankId: "b1", name: "Checking", accountNumber: "1" },
    ])
    vi.spyOn(statementsApi, "submitStatement").mockRejectedValue(
      new Error("processing failed")
    )

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

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.submitError).toBe("processing failed")
    expect(result.current.rows).toBeNull()
  })
})
