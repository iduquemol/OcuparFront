import { ApiError } from "./types"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function buildUrl(path: string): string {
  return `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (typeof data?.message === "string") return data.message
  } catch {
    // response body was not JSON; fall back to statusText below
  }
  return response.statusText || `La solicitud falló con estado ${response.status}`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildUrl(path), init)
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0)
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function postForm<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: formData,
  })
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
