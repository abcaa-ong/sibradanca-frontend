import { apiGet } from './api'
import type {
  ActiveConsentTermResponse,
  PublicPrivacyConfigResponse,
  PublicFormRuntimeConfigResponse,
  ReferenceItemResponse,
} from '../types/reference'

let modalitiesPromise: Promise<ReferenceItemResponse[]> | null = null
let contentsPromise: Promise<ReferenceItemResponse[]> | null = null
let activeConsentTermPromise: Promise<ActiveConsentTermResponse> | null = null
let publicFormRuntimeConfigPromise: Promise<PublicFormRuntimeConfigResponse> | null = null
let publicPrivacyConfigPromise: Promise<PublicPrivacyConfigResponse> | null = null

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

export function getPublicFormRuntimeConfig() {
  if (!publicFormRuntimeConfigPromise) {
    publicFormRuntimeConfigPromise = apiGet<PublicFormRuntimeConfigResponse>(
      '/api/reference/public-form-config',
    ).catch((error) => {
      publicFormRuntimeConfigPromise = null
      throw error
    })
  }

  return publicFormRuntimeConfigPromise
}

export function getPublicPrivacyConfig() {
  if (!publicPrivacyConfigPromise) {
    publicPrivacyConfigPromise = apiGet<PublicPrivacyConfigResponse>(
      '/api/reference/privacy-config',
    ).catch((error) => {
      publicPrivacyConfigPromise = null
      throw error
    })
  }

  return publicPrivacyConfigPromise
}
