import type { ApiErrorResponse, ApiResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function parseApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  let json: ApiResponse<T> | ApiErrorResponse | null = null

  try {
    json = (await response.json()) as ApiResponse<T> | ApiErrorResponse
  } catch {
    json = null
  }

  if (!response.ok || !json?.success) {
    const details =
      json && 'errors' in json && Array.isArray(json.errors)
        ? json.errors.map((item) => `${item.field}: ${item.message}`).join(' | ')
        : ''

    throw new Error(details || json?.message || fallbackMessage)
  }

  return (json as ApiResponse<T>).data
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path))
  return parseApiResponse<T>(response, 'Erro ao buscar dados.')
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return parseApiResponse<TResponse>(response, 'Erro ao enviar dados.')
}

export async function apiPut<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return parseApiResponse<TResponse>(response, 'Erro ao atualizar dados.')
}
