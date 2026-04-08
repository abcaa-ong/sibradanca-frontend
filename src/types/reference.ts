export interface ReferenceItemResponse {
  id: number
  name: string
}

export interface ActiveConsentTermResponse {
  id: number
  code: string
  title: string
}

export interface PublicFormRuntimeConfigResponse {
  antiBotEnabled: boolean
  minFillSeconds: number
  tokenHeaderName: string
}

export interface PublicPrivacyConfigResponse {
  controllerName: string
  contactEmail: string
}
