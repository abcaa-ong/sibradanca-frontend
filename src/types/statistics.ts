export interface StatisticsOverviewResponse {
  totalYouth: number
  totalProfessionals: number
  totalInstitutions: number
  totalResponses: number
}

export interface ChartItem {
  name: string
  value: number
}

export interface StatisticsProfileResponse {
  ageDistribution: ChartItem[]
  genderDistribution: ChartItem[]
}

export interface StatisticsDetailsResponse {
  modalities: ChartItem[]
  incomeDistribution: ChartItem[]
  publicCallsParticipation: ChartItem[]
  financingDistribution: ChartItem[]
  courseCostDistribution: ChartItem[]
  monthlyFeeDistribution: ChartItem[]
  monthlyRevenueDistribution: ChartItem[]
  danceEducationDistribution: ChartItem[]
  costumesCostDistribution: ChartItem[]
  editalDifficultyDistribution: ChartItem[]
  educationIndicators: ChartItem[]
  institutionIndicators: ChartItem[]
}

export interface StatisticsDashboardResponse {
  overview: StatisticsOverviewResponse
  profile: StatisticsProfileResponse
  details: StatisticsDetailsResponse
}
