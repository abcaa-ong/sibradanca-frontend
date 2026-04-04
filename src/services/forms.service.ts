import { apiGet, apiPost, apiPut } from './api'
import type { ApiRequestOptions } from './api'
import type {
  FormInfoResponse,
  InstitutionFormRequest,
  InstitutionFormResponse,
  ProfessionalFormRequest,
  ProfessionalFormResponse,
  YouthFormRequest,
  YouthFormResponse,
} from '../types/forms'

export function listForms() {
  return apiGet<FormInfoResponse[]>('/api/forms')
}

export type FormRequestOptions = ApiRequestOptions

export function submitYouthForm(payload: YouthFormRequest, options?: FormRequestOptions) {
  return apiPost<YouthFormResponse, YouthFormRequest>('/api/forms/youth', payload, options)
}

export function getYouthForm(protocol: string) {
  return apiGet<YouthFormResponse>(`/api/forms/youth/${encodeURIComponent(protocol)}`)
}

export function updateYouthForm(protocol: string, payload: YouthFormRequest, options?: FormRequestOptions) {
  return apiPut<YouthFormResponse, YouthFormRequest>(
    `/api/forms/youth/${encodeURIComponent(protocol)}`,
    payload,
    options,
  )
}

export function submitProfessionalForm(payload: ProfessionalFormRequest, options?: FormRequestOptions) {
  return apiPost<ProfessionalFormResponse, ProfessionalFormRequest>(
    '/api/forms/professional',
    payload,
    options,
  )
}

export function getProfessionalForm(protocol: string) {
  return apiGet<ProfessionalFormResponse>(`/api/forms/professional/${encodeURIComponent(protocol)}`)
}

export function updateProfessionalForm(
  protocol: string,
  payload: ProfessionalFormRequest,
  options?: FormRequestOptions,
) {
  return apiPut<ProfessionalFormResponse, ProfessionalFormRequest>(
    `/api/forms/professional/${encodeURIComponent(protocol)}`,
    payload,
    options,
  )
}

export function submitInstitutionForm(payload: InstitutionFormRequest, options?: FormRequestOptions) {
  return apiPost<InstitutionFormResponse, InstitutionFormRequest>(
    '/api/forms/institution',
    payload,
    options,
  )
}

export function getInstitutionForm(protocol: string) {
  return apiGet<InstitutionFormResponse>(`/api/forms/institution/${encodeURIComponent(protocol)}`)
}

export function updateInstitutionForm(
  protocol: string,
  payload: InstitutionFormRequest,
  options?: FormRequestOptions,
) {
  return apiPut<InstitutionFormResponse, InstitutionFormRequest>(
    `/api/forms/institution/${encodeURIComponent(protocol)}`,
    payload,
    options,
  )
}
