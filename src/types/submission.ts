import type { SectorType } from './forms'

export interface CreateSubmissionRequest {
  sector: SectorType
}

export interface SubmissionResponse {
  id: string
  protocolCode: string
  sector: SectorType
  submittedAt: string
}
