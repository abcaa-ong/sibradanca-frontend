import type { ApiErrorResponse, ApiResponse } from '../types/api'
import type {
  AdminAuditLogResponse,
  AdminBiSectorSummaryResponse,
  AdminBiStateSummaryResponse,
  AdminBiSubmissionRowResponse,
  AdminInsightsBootstrapResponse,
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
  AdminSubmissionDetailResponse,
  AdminSubmissionSummaryResponse,
  BackendHealthStatusResponse,
} from '../types/admin'
import { clearAdminCredentials, getAdminAuthHeader } from './admin-auth.service'
import { cleanUiText } from '../utils/ui-text'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').trim()
const ADMIN_CACHE_TTL_MS = 30_000

type AdminFilters = {
  sector?: string
  stateCode?: string
  city?: string
  protocol?: string
  limit?: number
}

type CacheEntry<T> = {
  expiresAt: number
  promise: Promise<T>
}

export type AdminDownloadResponse = {
  blob: Blob
  filename: string | null
}

const adminResponseCache = new Map<string, CacheEntry<unknown>>()

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

function buildQuery(filters: AdminFilters = {}) {
  const params = new URLSearchParams()

  if (filters.sector) params.set('sector', filters.sector)
  if (filters.stateCode) params.set('stateCode', filters.stateCode)
  if (filters.city) params.set('city', filters.city)
  if (filters.protocol) params.set('protocol', filters.protocol)
  if (typeof filters.limit === 'number') params.set('limit', String(filters.limit))

  const query = params.toString()
  return query ? `?${query}` : ''
}

function getCacheKey(path: string, varyByAuth = true) {
  const authKey = varyByAuth ? getAdminAuthHeader() ?? 'anonymous' : 'public'
  return `${authKey}:${path}`
}

async function performAdminRequest(input: RequestInfo | URL, init?: RequestInit) {
  const authorization = getAdminAuthHeader()

  if (!authorization) {
    throw new Error(cleanUiText('Faça login no painel interno para continuar.'))
  }

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: authorization,
      },
    })

    if (response.status === 401 || response.status === 403) {
      clearAdminCredentials()
      throw new Error(cleanUiText('Sua sessão interna expirou ou não possui permissão.'))
    }

    return response
  } catch (error) {
    if (error instanceof Error && error.message !== 'Failed to fetch') {
      throw new Error(cleanUiText(error.message))
    }

    throw new Error(cleanUiText('Não foi possível conectar ao painel interno no momento.'))
  }
}

async function parseAdminResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  let json: ApiResponse<T> | ApiErrorResponse | null = null

  try {
    json = (await response.json()) as ApiResponse<T> | ApiErrorResponse
  } catch {
    json = null
  }

  if (!response.ok || !json?.success) {
    throw new Error(cleanUiText(json?.message || fallbackMessage))
  }

  return (json as ApiResponse<T>).data
}

async function adminGet<T>(path: string, fallbackMessage: string) {
  const response = await performAdminRequest(buildUrl(path))
  return parseAdminResponse<T>(response, fallbackMessage)
}

function cachedAdminGet<T>(path: string, fallbackMessage: string, ttlMs = ADMIN_CACHE_TTL_MS) {
  const cacheKey = getCacheKey(path)
  const cachedEntry = adminResponseCache.get(cacheKey)

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.promise as Promise<T>
  }

  const promise = adminGet<T>(path, fallbackMessage).catch((error) => {
    adminResponseCache.delete(cacheKey)
    throw error
  })

  adminResponseCache.set(cacheKey, {
    expiresAt: Date.now() + ttlMs,
    promise,
  })

  return promise
}

function getFilenameFromDisposition(headerValue: string | null) {
  if (!headerValue) {
    return null
  }

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const fallbackMatch = headerValue.match(/filename=\"?([^\";]+)\"?/i)
  return fallbackMatch?.[1] ?? null
}

async function adminDownload(path: string) {
  const response = await performAdminRequest(buildUrl(path))

  if (!response.ok) {
    throw new Error(cleanUiText('Não foi possível gerar o arquivo solicitado.'))
  }

  return {
    blob: await response.blob(),
    filename: getFilenameFromDisposition(response.headers.get('content-disposition')),
  } satisfies AdminDownloadResponse
}

export function getAdminBootstrap() {
  return cachedAdminGet<AdminInsightsBootstrapResponse>(
    '/api/admin/insights/bootstrap',
    'Não foi possível carregar o painel interno.',
  )
}

export function getAdminOverview() {
  return cachedAdminGet<AdminInsightsOverviewResponse>(
    '/api/admin/insights/overview',
    'Não foi possível carregar a visão geral do painel.',
  )
}

export function getAdminDashboard() {
  return cachedAdminGet<AdminInsightsDashboardResponse>(
    '/api/admin/insights/dashboard',
    'Não foi possível carregar o painel interno.',
  )
}

export function getAdminSubmissions(filters?: AdminFilters) {
  return adminGet<AdminSubmissionSummaryResponse[]>(
    `/api/admin/submissions${buildQuery(filters)}`,
    'Não foi possível carregar os cadastros.',
  )
}

export function getAdminSubmissionDetail(protocol: string) {
  return adminGet<AdminSubmissionDetailResponse>(
    `/api/admin/submissions/${encodeURIComponent(protocol)}/detail`,
    'Não foi possível carregar a ficha do cadastro.',
  )
}

export function getAdminAudit(protocol?: string) {
  const query = protocol ? `?protocol=${encodeURIComponent(protocol)}` : ''

  return cachedAdminGet<AdminAuditLogResponse[]>(
    `/api/admin/submissions/audit${query}`,
    'Não foi possível carregar a auditoria.',
  )
}

export function getAdminSectorSummary() {
  return cachedAdminGet<AdminBiSectorSummaryResponse[]>(
    '/api/admin/bi/sector-summary',
    'Não foi possível carregar o resumo por setor.',
  )
}

export function getAdminStateSummary() {
  return cachedAdminGet<AdminBiStateSummaryResponse[]>(
    '/api/admin/bi/state-summary',
    'Não foi possível carregar o resumo por estado.',
  )
}

export function getAdminSubmissionDataset(filters?: AdminFilters) {
  return adminGet<AdminBiSubmissionRowResponse[]>(
    `/api/admin/bi/submissions${buildQuery(filters)}`,
    'Não foi possível carregar a base interna.',
  )
}

export function downloadAdminStatisticsCsv() {
  return adminDownload('/api/admin/exports/statistics.csv')
}

export function downloadAdminStatisticsXlsx() {
  return adminDownload('/api/admin/exports/statistics.xlsx')
}

export function downloadAdminStatisticsPdf() {
  return adminDownload('/api/admin/exports/statistics.pdf')
}

export function downloadAdminSubmissionsCsv() {
  return adminDownload('/api/admin/exports/submissions.csv')
}

export function downloadAdminSubmissionsXlsx() {
  return adminDownload('/api/admin/exports/submissions.xlsx')
}

export function downloadAdminSubmissionsDetailedXlsx() {
  return adminDownload('/api/admin/exports/submissions-detailed.xlsx')
}

export function downloadAdminSubmissionsDetailedCsv() {
  return adminDownload('/api/admin/exports/submissions-detailed.csv')
}

export function downloadAdminSubmissionsDetailedPdf() {
  return adminDownload('/api/admin/exports/submissions-detailed.pdf')
}

export function getBackendHealthStatus() {
  const path = '/actuator/health'
  const cacheKey = getCacheKey(path, false)
  const cachedEntry = adminResponseCache.get(cacheKey)

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.promise as Promise<BackendHealthStatusResponse>
  }

  const promise = (async () => {
    try {
      const response = await fetch(buildUrl(path))
      let payload: BackendHealthStatusResponse | null = null

      try {
        payload = (await response.json()) as BackendHealthStatusResponse
      } catch {
        payload = null
      }

      if (!payload?.status) {
        throw new Error(cleanUiText('Não foi possível carregar a saúde do ambiente interno.'))
      }

      return payload
    } catch {
      throw new Error(cleanUiText('Não foi possível consultar o ambiente interno.'))
    }
  })().catch((error) => {
    adminResponseCache.delete(cacheKey)
    throw error
  })

  adminResponseCache.set(cacheKey, {
    expiresAt: Date.now() + ADMIN_CACHE_TTL_MS,
    promise,
  })

  return promise
}
