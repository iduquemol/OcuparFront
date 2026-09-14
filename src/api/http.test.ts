import { afterEach, describe, expect, it, vi } from "vitest"
import { get, postForm } from "./http"
import { ApiError } from "./types"

describe("http", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("get returns parsed JSON on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await get<{ ok: boolean }>("/banks")

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/banks"),
      undefined
    )
  })

  it("get throws an ApiError on a non-success status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Bank not found" }), {
        status: 404,
        statusText: "Not Found",
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(get("/banks/missing")).rejects.toMatchObject({
      message: "Bank not found",
      status: 404,
    })
    await expect(get("/banks/missing")).rejects.toBeInstanceOf(ApiError)
  })

  it("postForm sends a POST request with the given FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ rows: [] }), { status: 200 })
    )
    vi.stubGlobal("fetch", fetchMock)

    const formData = new FormData()
    formData.append("bankId", "b1")

    await postForm("/statements", formData)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/statements"),
      expect.objectContaining({ method: "POST", body: formData })
    )
  })

  it("throws an ApiError when the network request itself fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"))
    vi.stubGlobal("fetch", fetchMock)

    await expect(get("/banks")).rejects.toMatchObject({
      message: "No se pudo conectar con el servidor",
      status: 0,
    })
  })
})
