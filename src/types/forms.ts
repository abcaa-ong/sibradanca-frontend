export type SectorType = 'YOUTH' | 'PROFESSIONAL' | 'INSTITUTION'

export interface FormInfoResponse {
  sector: SectorType
  title: string
  version: string
}

export interface YouthFormRequest {
  fullName: string
  cpf?: string | null
  email: string
  whatsapp: string
  birthDate: string
  gender: string
  cityId: number
  modalityIds: number[]
  practiceTime: string
  careerInterest: boolean
  whoPaysExpenses: string
  familyIncomeRange: string
  searchesContent: boolean
  contentIds: number[]
  consentCode: string
  consentAccepted: boolean
}

export interface YouthFormResponse {
  respondentId: number
  protocol: string
  fullName: string
  email: string
  whatsapp: string
  birthDate: string
  gender: string
  city: string
  state: string
  danceModalities: string[]
  practiceTime: string
  careerInterest: boolean
  whoPaysExpenses: string
  familyIncomeRange: string
  searchesContent: boolean
  consumedContent: string[]
  consentAccepted: boolean
  consentCode: string | null
  submittedAt: string
  cpf: string | null
  canUpdate: boolean
  nextUpdateAvailableAt: string | null
}

export interface ProfessionalFormRequest {
  fullName: string
  cpf?: string | null
  email: string
  whatsapp: string
  birthDate: string
  gender: string
  cityId: number
  modalityIds: number[]
  contentIds: number[]
  practiceTime: string
  worksWithDance: boolean
  hasDrt: boolean
  currentlyWorks: boolean
  danceMainIncome: boolean
  hasOtherIncome: boolean
  totalIncome: number
  danceIncome: number
  careerInterest?: boolean | null
  householdIncomeRange?: string | null
  rolesPerformed?: string | null
  workType: string
  coursesPerYear: number
  onlineCoursesPerYear: number
  currentlyStudies: boolean
  formalStudyType?: string | null
  wantsFormalStudy: boolean
  monthlyCostCourses: number
  monthlyCostCostumes: number
  monthlyCostEvents: number
  monthlyCostTravel: number
  monthlyCostSchool: number
  monthlyCostOthers: number
  costResponsibility: string
  participatedInEdital: boolean
  approvedInEdital: boolean
  appliedNotApproved: boolean
  editalDifficulty?: string | null
  consentCode: string
  consentAccepted: boolean
}

export interface ProfessionalFormResponse {
  respondentId: number
  protocol: string
  fullName: string
  email: string
  whatsapp: string
  birthDate: string
  gender: string
  city: string
  state: string
  danceModalities: string[]
  consumedContent: string[]
  practiceTime: string
  worksWithDance: boolean
  hasDrt: boolean
  currentlyWorks: boolean
  danceMainIncome: boolean
  hasOtherIncome: boolean
  totalIncome: number
  danceIncome: number
  careerInterest: boolean | null
  householdIncomeRange: string | null
  rolesPerformed: string | null
  workType: string
  coursesPerYear: number
  onlineCoursesPerYear: number
  currentlyStudies: boolean
  formalStudyType: string | null
  wantsFormalStudy: boolean
  monthlyCostCourses: number
  monthlyCostCostumes: number
  monthlyCostEvents: number
  monthlyCostTravel: number
  monthlyCostSchool: number
  monthlyCostOthers: number
  costResponsibility: string
  participatedInEdital: boolean
  approvedInEdital: boolean
  appliedNotApproved: boolean
  editalDifficulty: string | null
  consentAccepted: boolean
  consentCode: string | null
  submittedAt: string
  cpf: string | null
  canUpdate: boolean
  nextUpdateAvailableAt: string | null
}

export interface InstitutionFormRequest {
  responsibleName: string
  legalName: string
  tradeName: string
  cnpj?: string | null
  cityId: number
  email: string
  phone: string
  socialMedia?: string | null
  type: string
  nature: string
  locationType: string
  foundationYear: number
  modalityIds: number[]
  numberOfTeachers: number
  averageStudents: number
  monthlyFee: number
  classesPerWeek: number
  numberOfRooms: number
  spaceType: string
  infrastructureItems?: string | null
  hasCnpj: boolean
  hasScholarShip: boolean
  scholarshipCount?: number | null
  studentsPayMonthlyFee?: boolean | null
  cltEmployees: number
  pjContracts: number
  monthlyRevenue: number
  usesManagementSystem: boolean
  mainChallenges: string
  eventCostResponsibility?: string | null
  staffRoles?: string | null
  actsInPeriphery: boolean
  actsInRuralArea: boolean
  hasOwnHeadquarters: boolean
  rentedHeadquarters: boolean
  usesPublicSpace: boolean
  averageAudienceCapacity: number
  activeStudents: number
  numberOfStaff: number
  monthlyAudience: number
  servesVulnerablePopulation: boolean
  mainIncomeSources?: string | null
  receivedPublicFundingLast2Years: boolean
  registeredInPublicCalls?: boolean | null
  approvedInPublicCalls?: boolean | null
  editalDifficulties?: string | null
  annualBudgetRange: string
  knowsMunicipalCulturePlan: boolean
  participatesInCultureCouncil: boolean
  interestedInPublicPartnerships: boolean
  knowsPublicPolicyAccessMechanisms?: boolean | null
  promotionChannels?: string | null
  wouldUseFreePromotionPlatform?: boolean | null
  consentCode: string
  consentAccepted: boolean
}

export interface InstitutionFormResponse {
  institutionId: number
  protocol: string
  legalName: string
  tradeName: string
  cnpj: string | null
  email: string
  phone: string
  socialMedia: string | null
  city: string
  state: string
  type: string
  nature: string
  locationType: string
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
  consentAccepted: boolean
  consentCode: string | null
  submittedAt: string
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
  canUpdate: boolean
  nextUpdateAvailableAt: string | null
}
