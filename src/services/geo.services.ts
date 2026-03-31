import { apiGet } from './api'
import type { CityResponse, StateResponse } from '../types/geo'

export function listStates() {
  return apiGet<StateResponse[]>('/api/geo/states')
}

export function listCities(stateCode: string) {
  return apiGet<CityResponse[]>(`/api/geo/cities?stateCode=${encodeURIComponent(stateCode)}`)
}
