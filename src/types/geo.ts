export interface StateResponse {
  code: string
  name: string
  region?: string
}

export interface CityResponse {
  id: number
  name: string
  stateCode: string
}
