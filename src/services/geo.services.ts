import { apiGet } from './api'
import type { CityResponse, StateResponse } from '../types/geo'

let statesPromise: Promise<StateResponse[]> | null = null

export function listStates() {
  if (!statesPromise) {
    statesPromise = apiGet<StateResponse[]>('/api/geo/states').catch((error) => {
      statesPromise = null
      throw error
    })
  }

  return statesPromise
}

export function listCities(stateCode: string) {
  return apiGet<CityResponse[]>(`/api/geo/cities?stateCode=${encodeURIComponent(stateCode)}`)
}
