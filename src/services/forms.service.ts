import { apiGet, apiPost, apiPut } from './api'
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

export function submitYouthForm(payload: YouthFormRequest) {
  return apiPost<YouthFormResponse, YouthFormRequest>('/api/forms/youth', payload)
}

export function getYouthForm(protocol: string) {
  return apiGet<YouthFormResponse>(`/api/forms/youth/${encodeURIComponent(protocol)}`)
}

export function updateYouthForm(protocol: string, payload: YouthFormRequest) {
  return apiPut<YouthFormResponse, YouthFormRequest>(`/api/forms/youth/${encodeURIComponent(protocol)}`, payload)
}

export function submitProfessionalForm(payload: ProfessionalFormRequest) {
  return apiPost<ProfessionalFormResponse, ProfessionalFormRequest>('/api/forms/professional', payload)
}

export function getProfessionalForm(protocol: string) {
  return apiGet<ProfessionalFormResponse>(`/api/forms/professional/${encodeURIComponent(protocol)}`)
}

export function updateProfessionalForm(protocol: string, payload: ProfessionalFormRequest) {
  return apiPut<ProfessionalFormResponse, ProfessionalFormRequest>(`/api/forms/professional/${encodeURIComponent(protocol)}`, payload)
}

export function submitInstitutionForm(payload: InstitutionFormRequest) {
  return apiPost<InstitutionFormResponse, InstitutionFormRequest>('/api/forms/institution', payload)
}

export function getInstitutionForm(protocol: string) {
  return apiGet<InstitutionFormResponse>(`/api/forms/institution/${encodeURIComponent(protocol)}`)
}

export function updateInstitutionForm(protocol: string, payload: InstitutionFormRequest) {
  return apiPut<InstitutionFormResponse, InstitutionFormRequest>(`/api/forms/institution/${encodeURIComponent(protocol)}`, payload)
}
