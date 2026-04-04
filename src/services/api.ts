import type { ApiErrorResponse, ApiResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export type ApiDownloadResponse = {
  blob: Blob
  filename: string | null
}

export type ApiRequestOptions = {
  headers?: HeadersInit
}

type PublicFormGuardMetadata = {
  captchaToken?: string
  formStartedAt?: string
  honeypot?: string
}

let publicFormGuardMetadata: PublicFormGuardMetadata | null = null

export class ApiRequestError extends Error {
  errors: ApiErrorResponse['errors']

  constructor(message: string, errors: ApiErrorResponse['errors'] = []) {
    super(message)
    this.name = 'ApiRequestError'
    this.errors = errors
  }
}

async function performRequest(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error('Não foi possível conectar ao sistema no momento. Tente novamente em instantes.')
  }
}

async function parseApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  let json: ApiResponse<T> | ApiErrorResponse | null = null

  try {
    json = (await response.json()) as ApiResponse<T> | ApiErrorResponse
  } catch {
    json = null
  }

  if (!response.ok || !json?.success) {
    const errors =
      json && 'errors' in json && Array.isArray(json.errors)
        ? json.errors
        : []

    throw new ApiRequestError(json?.message || fallbackMessage, errors)
  }

  return (json as ApiResponse<T>).data
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

function isPublicFormWrite(path: string) {
  return path.startsWith('/api/forms/') || path === '/api/protocol-recovery'
}

function buildGuardHeaders(path: string) {
  if (!isPublicFormWrite(path) || !publicFormGuardMetadata) {
    return {}
  }

  const headers: Record<string, string> = {}

  if (publicFormGuardMetadata.formStartedAt) {
    headers['X-Form-Started-At'] = publicFormGuardMetadata.formStartedAt
  }

  if (publicFormGuardMetadata.captchaToken) {
    headers['X-Captcha-Token'] = publicFormGuardMetadata.captchaToken
  }

  if (publicFormGuardMetadata.honeypot?.trim()) {
    headers['X-Form-Honeypot'] = publicFormGuardMetadata.honeypot.trim()
  }

  return headers
}

function getFilenameFromDisposition(headerValue: string | null) {
  if (!headerValue) {
    return null
  }

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const fallbackMatch = headerValue.match(/filename="?([^\";]+)"?/i)
  return fallbackMatch?.[1] ?? null
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await performRequest(buildUrl(path))
  return parseApiResponse<T>(response, 'Erro ao buscar dados.')
}

export function setPublicFormGuardMetadata(metadata: PublicFormGuardMetadata | null) {
  publicFormGuardMetadata = metadata
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await performRequest(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildGuardHeaders(path),
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(body),
  })

  return parseApiResponse<TResponse>(response, 'Erro ao enviar dados.')
}

export async function apiPut<TResponse, TBody>(
  path: string,
  body: TBody,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await performRequest(buildUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...buildGuardHeaders(path),
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(body),
  })

  return parseApiResponse<TResponse>(response, 'Erro ao atualizar dados.')
}

export async function apiDownload(path: string): Promise<ApiDownloadResponse> {
  const response = await performRequest(buildUrl(path))

  if (!response.ok) {
    throw new Error('Não foi possível gerar o arquivo solicitado.')
  }

  return {
    blob: await response.blob(),
    filename: getFilenameFromDisposition(response.headers.get('content-disposition')),
  }
}
