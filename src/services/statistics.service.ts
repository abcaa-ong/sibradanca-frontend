import { apiDownload, apiGet } from './api'
import type {
  StatisticsDashboardResponse,
  StatisticsDetailsResponse,
  StatisticsOverviewResponse,
  StatisticsProfileResponse,
} from '../types/statistics'

type StatisticsFilters = {
  stateCode?: string
  region?: string
  sector?: string
}

function buildQuery(filters: StatisticsFilters = {}) {
  const params = new URLSearchParams()

  if (filters.stateCode) {
    params.set('stateCode', filters.stateCode)
  }

  if (filters.region) {
    params.set('region', filters.region)
  }

  if (filters.sector) {
    params.set('sector', filters.sector)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getStatisticsOverview(filters?: StatisticsFilters) {
  return apiGet<StatisticsOverviewResponse>(`/api/statistics/overview${buildQuery(filters)}`)
}

export function getStatisticsProfile(filters?: StatisticsFilters) {
  return apiGet<StatisticsProfileResponse>(`/api/statistics/profile${buildQuery(filters)}`)
}

export function getStatisticsDetails(filters?: StatisticsFilters) {
  return apiGet<StatisticsDetailsResponse>(`/api/statistics/details${buildQuery(filters)}`)
}

export function getStatisticsDashboard(filters?: StatisticsFilters) {
  return apiGet<StatisticsDashboardResponse>(`/api/statistics/dashboard${buildQuery(filters)}`)
}

export function exportStatisticsCsv(filters?: StatisticsFilters) {
  return apiDownload(`/api/statistics/export.csv${buildQuery(filters)}`)
}

export function exportStatisticsPdf(filters?: StatisticsFilters) {
  return apiDownload(`/api/statistics/export.pdf${buildQuery(filters)}`)
}
