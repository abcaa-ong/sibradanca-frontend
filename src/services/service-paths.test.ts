import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listForms } from './forms.service'
import { listStates, listCities } from './geo.services'
import { exportStatisticsCsv, exportStatisticsPdf, getStatisticsDashboard, getStatisticsOverview } from './statistics.service'
import { createSubmission, listSubmissions } from './submission.service'

const apiGetMock = vi.fn()
const apiPostMock = vi.fn()
const apiDownloadMock = vi.fn()

vi.mock('./api', () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
  apiDownload: (...args: unknown[]) => apiDownloadMock(...args),
}))

describe('frontend service paths', () => {
  beforeEach(() => {
    apiGetMock.mockReset()
    apiPostMock.mockReset()
    apiDownloadMock.mockReset()
    apiGetMock.mockResolvedValue(undefined)
    apiPostMock.mockResolvedValue(undefined)
    apiDownloadMock.mockResolvedValue(undefined)
  })

  it('uses the forms endpoint when listing forms', async () => {
    await listForms()
    expect(apiGetMock).toHaveBeenCalledWith('/api/forms')
  })

  it('uses the geo endpoints when loading states and cities', async () => {
    await listStates()
    await listCities('SC')

    expect(apiGetMock).toHaveBeenNthCalledWith(1, '/api/geo/states')
    expect(apiGetMock).toHaveBeenNthCalledWith(2, '/api/geo/cities?stateCode=SC')
  })

  it('uses the statistics overview endpoint', async () => {
    await getStatisticsOverview()
    expect(apiGetMock).toHaveBeenCalledWith('/api/statistics/overview')
  })

  it('uses the statistics dashboard endpoint', async () => {
    await getStatisticsDashboard()
    expect(apiGetMock).toHaveBeenCalledWith('/api/statistics/dashboard')
  })

  it('uses the statistics export endpoints', async () => {
    await exportStatisticsCsv({ stateCode: 'SC' })
    await exportStatisticsPdf({ region: 'SOUTH' })

    expect(apiDownloadMock).toHaveBeenNthCalledWith(1, '/api/statistics/export.csv?stateCode=SC')
    expect(apiDownloadMock).toHaveBeenNthCalledWith(2, '/api/statistics/export.pdf?region=SOUTH')
  })

  it('uses the submission endpoints for create and list', async () => {
    const payload = { sector: 'YOUTH' as const }

    await createSubmission(payload)
    await listSubmissions()

    expect(apiPostMock).toHaveBeenCalledWith('/api/submissions', payload)
    expect(apiGetMock).toHaveBeenCalledWith('/api/submissions')
  })
})
