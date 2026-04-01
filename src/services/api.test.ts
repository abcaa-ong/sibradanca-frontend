import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiDownload, apiGet, apiPost } from './api'

const originalFetch = globalThis.fetch
const expectedApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

describe('api service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = originalFetch
  })

  it('returns the data payload on successful GET responses', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'ok',
        data: { totalResponses: 10 },
      }),
    }) as typeof fetch

    await expect(apiGet<{ totalResponses: number }>('/api/statistics/overview')).resolves.toEqual({
      totalResponses: 10,
    })
  })

  it('throws the API message on failed GET responses', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Falha ao carregar dados.',
        data: null,
      }),
    }) as typeof fetch

    await expect(apiGet('/api/statistics/overview')).rejects.toThrow('Falha ao carregar dados.')
  })

  it('translates connection failures into a user-facing message', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as typeof fetch

    await expect(apiGet('/api/statistics/overview')).rejects.toThrow(
      'Não foi possível conectar ao sistema no momento. Tente novamente em instantes.',
    )
  })

  it('sends json body and returns payload on successful POST responses', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'created',
        data: { protocolCode: 'SIB-12345678' },
      }),
    }) as typeof fetch

    await expect(
      apiPost<{ protocolCode: string }, { sector: string }>('/api/submissions', { sector: 'YOUTH' }),
    ).resolves.toEqual({ protocolCode: 'SIB-12345678' })

    expect(globalThis.fetch).toHaveBeenCalledWith(`${expectedApiBaseUrl}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sector: 'YOUTH' }),
    })
  })

  it('downloads files and reads the filename from the response headers', async () => {
    const headers = new Headers({
      'content-disposition': 'attachment; filename="sibradanca-estatisticas.csv"',
    })
    const blob = new Blob(['csv'], { type: 'text/csv' })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers,
      blob: async () => blob,
    }) as typeof fetch

    await expect(apiDownload('/api/statistics/export.csv')).resolves.toEqual({
      blob,
      filename: 'sibradanca-estatisticas.csv',
    })
  })
})
