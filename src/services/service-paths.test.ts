import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listForms } from './forms.service'
import { listStates, listCities } from './geo.services'
import { getStatisticsOverview } from './statistics.service'
import { createSubmission, listSubmissions } from './submission.service'

const apiGetMock = vi.fn()
const apiPostMock = vi.fn()

vi.mock('./api', () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
}))

describe('frontend service paths', () => {
  beforeEach(() => {
    apiGetMock.mockReset()
    apiPostMock.mockReset()
    apiGetMock.mockResolvedValue(undefined)
    apiPostMock.mockResolvedValue(undefined)
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

  it('uses the submission endpoints for create and list', async () => {
    const payload = { sector: 'YOUTH' as const }

    await createSubmission(payload)
    await listSubmissions()

    expect(apiPostMock).toHaveBeenCalledWith('/api/submissions', payload)
    expect(apiGetMock).toHaveBeenCalledWith('/api/submissions')
  })
})
