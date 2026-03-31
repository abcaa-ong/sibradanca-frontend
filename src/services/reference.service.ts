import { apiGet } from './api'
import type { ActiveConsentTermResponse, ReferenceItemResponse } from '../types/reference'

export function listModalities() {
  return apiGet<ReferenceItemResponse[]>('/api/reference/modalities')
}

export function listContents() {
  return apiGet<ReferenceItemResponse[]>('/api/reference/contents')
}

export function getActiveConsentTerm() {
  return apiGet<ActiveConsentTermResponse>('/api/reference/consent-term')
}
