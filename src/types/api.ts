export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: boolean
  message: string
  errors?: ApiFieldError[]
  timestamp?: string
}
