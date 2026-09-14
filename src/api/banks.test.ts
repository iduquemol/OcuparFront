import { afterEach, describe, expect, it, vi } from "vitest"
import { getAccountsByBank, getBanks } from "./banks"
import { ApiError } from "./types"

describe("banks api", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("getBanks returns the list of banks", async () => {
    const banks = [{ id: "b1", name: "Bank One" }]
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(banks), { status: 200 }))
    )

    await expect(getBanks()).resolves.toEqual(banks)
  })

  it("getBanks surfaces an ApiError on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "boom" }), { status: 500 })
      )
    )

    await expect(getBanks()).rejects.toBeInstanceOf(ApiError)
  })

  it("getAccountsByBank filters by the given bank id", async () => {
    const accounts = [
      { id: "a1", bankId: "b1", name: "Checking", accountNumber: "001" },
    ]
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(accounts), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(getAccountsByBank("b1")).resolves.toEqual(accounts)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/banks/b1/accounts"),
      undefined
    )
  })

  it("getAccountsByBank surfaces an ApiError on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "boom" }), { status: 500 })
      )
    )

    await expect(getAccountsByBank("b1")).rejects.toBeInstanceOf(ApiError)
  })
})
