import { apiGet } from './api'
import type { ActiveConsentTermResponse, ReferenceItemResponse } from '../types/reference'

let modalitiesPromise: Promise<ReferenceItemResponse[]> | null = null
let contentsPromise: Promise<ReferenceItemResponse[]> | null = null
let activeConsentTermPromise: Promise<ActiveConsentTermResponse> | null = null

export function listModalities() {
  if (!modalitiesPromise) {
    modalitiesPromise = apiGet<ReferenceItemResponse[]>('/api/reference/modalities').catch((error) => {
      modalitiesPromise = null
      throw error
    })
  }

  return modalitiesPromise
}

export function listContents() {
  if (!contentsPromise) {
    contentsPromise = apiGet<ReferenceItemResponse[]>('/api/reference/contents').catch((error) => {
      contentsPromise = null
      throw error
    })
  }

  return contentsPromise
}

export function getActiveConsentTerm() {
  if (!activeConsentTermPromise) {
    activeConsentTermPromise = apiGet<ActiveConsentTermResponse>('/api/reference/consent-term').catch((error) => {
      activeConsentTermPromise = null
      throw error
    })
  }

  return activeConsentTermPromise
}
