import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiGet, apiPost } from './api'

const originalFetch = globalThis.fetch

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

    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8080/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sector: 'YOUTH' }),
    })
  })
})
