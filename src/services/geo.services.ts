import { apiGet } from './api'
import type { CityResponse, StateResponse } from '../types/geo'

let statesPromise: Promise<StateResponse[]> | null = null
const citiesByStatePromise = new Map<string, Promise<CityResponse[]>>()

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
  const normalizedStateCode = stateCode.trim().toUpperCase()

  if (!normalizedStateCode) {
    return Promise.resolve([])
  }

  const cachedPromise = citiesByStatePromise.get(normalizedStateCode)
  if (cachedPromise) {
    return cachedPromise
  }

  const promise = apiGet<CityResponse[]>(
    `/api/geo/cities?stateCode=${encodeURIComponent(normalizedStateCode)}`,
  ).catch((error) => {
    citiesByStatePromise.delete(normalizedStateCode)
    throw error
  })

  citiesByStatePromise.set(normalizedStateCode, promise)
  return promise
}
