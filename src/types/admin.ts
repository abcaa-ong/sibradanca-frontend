import type { StatisticsDashboardResponse, StatisticsOverviewResponse } from './statistics'

export interface AdminSubmissionSummaryResponse {
  protocol: string
  sector: string
  subjectName: string
  email: string
  phone: string
  city: string
  state: string
  submittedAt: string | null
  updatedAt: string | null
}

export interface AdminDetailFieldResponse {
  key: string
  label: string
  value: string
}

export interface AdminDetailSectionResponse {
  title: string
  fields: AdminDetailFieldResponse[]
}

export interface YouthFormDetailResponse {
  respondentId: number
  protocol: string
  fullName: string
  email: string
  whatsapp: string
  birthDate: string | null
  gender: string
  city: string
  state: string
  danceModalities: string[]
  practiceTime: string
  careerInterest: boolean | null
  whoPaysExpenses: string | null
  familyIncomeRange: string | null
  searchesContent: boolean | null
  consumedContent: string[]
  legalGuardianName: string | null
  legalGuardianRelationship: string | null
  legalGuardianAuthorizationConfirmed: boolean | null
  consentAccepted: boolean | null
  consentCode: string | null
  submittedAt: string | null
  cpf: string | null
  canUpdate: boolean | null
  nextUpdateAvailableAt: string | null
}

export interface ProfessionalFormDetailResponse {
  respondentId: number
  protocol: string
  fullName: string
  email: string
  whatsapp: string
  birthDate: string | null
  gender: string
  city: string
  state: string
  danceModalities: string[]
  consumedContent: string[]
  practiceTime: string
  worksWithDance: boolean | null
  hasDrt: boolean | null
  currentlyWorks: boolean | null
  danceMainIncome: boolean | null
  hasOtherIncome: boolean | null
  totalIncome: number | null
  danceIncome: number | null
  careerInterest: boolean | null
  householdIncomeRange: string | null
  rolesPerformed: string | null
  workType: string | null
  coursesPerYear: number | null
  onlineCoursesPerYear: number | null
  currentlyStudies: boolean | null
  formalStudyType: string | null
  wantsFormalStudy: boolean | null
  monthlyCostCourses: number | null
  monthlyCostCostumes: number | null
  monthlyCostEvents: number | null
  monthlyCostTravel: number | null
  monthlyCostSchool: number | null
  monthlyCostOthers: number | null
  costResponsibility: string | null
  participatedInEdital: boolean | null
  approvedInEdital: boolean | null
  appliedNotApproved: boolean | null
  editalDifficulty: string | null
  consentAccepted: boolean | null
  consentCode: string | null
  submittedAt: string | null
  cpf: string | null
  canUpdate: boolean | null
  nextUpdateAvailableAt: string | null
}

export interface InstitutionFormDetailResponse {
  institutionId: number
  protocol: string
  legalName: string
  tradeName: string | null
  cnpj: string | null
  email: string | null
  phone: string | null
  socialMedia: string | null
  city: string
  state: string
  type: string | null
  legalNature: string | null
  nature: string | null
  locationType: string | null
  foundationYear: number | null
  modalities: string[]
  numberOfTeachers: number | null
  averageStudents: number | null
  monthlyFee: number | null
  classesPerWeek: number | null
  numberOfRooms: number | null
  spaceType: string | null
  infrastructureItems: string | null
  hasCnpj: boolean | null
  hasScholarShip: boolean | null
  scholarshipCount: number | null
  studentsPayMonthlyFee: boolean | null
  cltEmployees: number | null
  pjContracts: number | null
  monthlyRevenue: number | null
  usesManagementSystem: boolean | null
  mainChallenges: string | null
  eventCostResponsibility: string | null
  staffRoles: string | null
  consentAccepted: boolean | null
  consentCode: string | null
  submittedAt: string | null
  responsibleName: string | null
  actsInPeriphery: boolean | null
  actsInRuralArea: boolean | null
  hasOwnHeadquarters: boolean | null
  rentedHeadquarters: boolean | null
  usesPublicSpace: boolean | null
  averageAudienceCapacity: number | null
  activeStudents: number | null
  numberOfStaff: number | null
  monthlyAudience: number | null
  servesVulnerablePopulation: boolean | null
  mainIncomeSources: string | null
  receivedPublicFundingLast2Years: boolean | null
  registeredInPublicCalls: boolean | null
  approvedInPublicCalls: boolean | null
  editalDifficulties: string | null
  annualBudgetRange: string | null
  knowsMunicipalCulturePlan: boolean | null
  participatesInCultureCouncil: boolean | null
  interestedInPublicPartnerships: boolean | null
  knowsPublicPolicyAccessMechanisms: boolean | null
  promotionChannels: string | null
  wouldUseFreePromotionPlatform: boolean | null
  canUpdate: boolean | null
  nextUpdateAvailableAt: string | null
}

export interface AdminSubmissionDetailResponse {
  summary: AdminSubmissionSummaryResponse
  youthForm: YouthFormDetailResponse | null
  professionalForm: ProfessionalFormDetailResponse | null
  institutionForm: InstitutionFormDetailResponse | null
  sections: AdminDetailSectionResponse[]
}

export interface AdminAuditLogResponse {
  action: string
  actor: string
  targetType: string
  targetKey: string
  details: string
  createdAt: string | null
}

export interface AdminBiSectorSummaryResponse {
  sector: string
  sectorLabel: string
  totalSubmissions: number
  totalStates: number
  firstSubmissionAt: string | null
  lastSubmissionAt: string | null
}

export interface AdminBiStateSummaryResponse {
  stateCode: string
  stateName: string
  totalSubmissions: number
  totalYouth: number
  totalProfessionals: number
  totalInstitutions: number
  lastSubmissionAt: string | null
}

export interface AdminBiSubmissionRowResponse {
  submissionId: string | null
  protocolCode: string
  sector: string
  sectorLabel: string
  subjectType: string
  subjectName: string
  displayName: string | null
  responsibleName: string | null
  email: string | null
  phone: string | null
  stateCode: string | null
  stateName: string | null
  cityName: string | null
  gender: string | null
  birthDate: string | null
  danceExperienceYears: number | null
  incomeRange: string | null
  worksWithDance: boolean | null
  hasDrt: boolean | null
  currentlyWorks: boolean | null
  totalIncome: number | null
  danceIncome: number | null
  institutionType: string | null
  institutionNature: string | null
  numberOfTeachers: number | null
  averageStudents: number | null
  monthlyFee: number | null
  monthlyRevenue: number | null
  submittedAt: string | null
  updatedAt: string | null
}

export interface BackendHealthStatusResponse {
  status: string
}

export type AdminInsightsOverviewResponse = StatisticsOverviewResponse
export type AdminInsightsDashboardResponse = StatisticsDashboardResponse

export interface AdminInsightsBootstrapResponse {
  overview: AdminInsightsOverviewResponse
  dashboard: AdminInsightsDashboardResponse
  sectorSummary: AdminBiSectorSummaryResponse[]
  stateSummary: AdminBiStateSummaryResponse[]
}
