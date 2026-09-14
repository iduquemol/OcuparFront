import { afterEach, describe, expect, it, vi } from "vitest"
import { submitStatement } from "./statements"
import { ApiError } from "./types"

function makeCsvFile() {
  return new File(["date,amount\n2024-01-01,100"], "statement.csv", {
    type: "text/csv",
  })
}

describe("submitStatement", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("posts bank, account, dates and file, and returns processed rows", async () => {
    const rows = [
      { date: "2024-01-01", description: "Deposit", amount: 100, balance: 100 },
    ]
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(rows), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const result = await submitStatement({
      bankId: "b1",
      accountId: "a1",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      file: makeCsvFile(),
    })

    expect(result).toEqual(rows)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain("/statements")
    expect(init.method).toBe("POST")
    const body = init.body as FormData
    expect(body.get("bankId")).toBe("b1")
    expect(body.get("accountId")).toBe("a1")
    expect(body.get("startDate")).toBe("2024-01-01")
    expect(body.get("endDate")).toBe("2024-01-31")
    expect(body.get("file")).toBeInstanceOf(File)
  })

  it("surfaces an ApiError when processing fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "invalid file" }), {
          status: 422,
        })
      )
    )

    await expect(
      submitStatement({
        bankId: "b1",
        accountId: "a1",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        file: makeCsvFile(),
      })
    ).rejects.toBeInstanceOf(ApiError)
  })
})
