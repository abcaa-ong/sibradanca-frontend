import { apiPost } from './api'
import type { ProtocolRecoveryRequest, ProtocolRecoveryResponse } from '../types/recovery'

export function requestProtocolRecovery(payload: ProtocolRecoveryRequest) {
  return apiPost<ProtocolRecoveryResponse, ProtocolRecoveryRequest>('/api/protocol-recovery', payload)
}
