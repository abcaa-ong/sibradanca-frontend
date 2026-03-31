import { apiGet, apiPost } from './api'
import type { CreateSubmissionRequest, SubmissionResponse } from '../types/submission'

export function createSubmission(payload: CreateSubmissionRequest) {
  return apiPost<SubmissionResponse, CreateSubmissionRequest>('/api/submissions', payload)
}

export function listSubmissions() {
  return apiGet<SubmissionResponse[]>('/api/submissions')
}