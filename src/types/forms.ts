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
  region?: string | null
  age?: number | null
  birthDate: string
  gender?: string | null
  cityId: number
  modalityIds: number[]
  practiceTime: string
  careerInterest: boolean | null
  whoPaysExpenses: string
  familyIncomeRange: string
  monthlyFee?: string | null
  monthlyCostSchool?: string | null
  monthlyCostCourses?: string | null
  monthlyCostCostumes?: string | null
  monthlyCostFestivals?: string | null
  monthlyCostTravel?: string | null
  monthlyCostOthers?: string | null
  searchesContent: boolean | null
  contentIds: number[]
  consentCode: string
  consentAccepted: boolean
  consentContact?: boolean | null
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
  region?: string | null
  age?: number | null
  ageRange?: string | null
  birthDate: string
  gender?: string | null
  cityId: number
  modalityIds: number[]
  contentIds: number[]
  practiceTime: string
  worksWithDance: boolean | null
  hasDrt: boolean | null
  currentlyWorks: boolean | null
  danceMainIncome: boolean | null
  hasOtherIncome: boolean | null
  totalIncome: number | null
  danceIncome: number | null
  careerInterest?: boolean | null
  householdIncomeRange?: string | null
  rolesPerformed?: string | null
  workType: string
  coursesPerYear: number | null
  onlineCoursesPerYear: number | null
  currentlyStudies: boolean | null
  academicEducation?: string | null
  formalStudyType?: string | null
  wantsFormalStudy: boolean | null
  monthlyCostCourses: number | null
  monthlyCostCostumes: number | null
  monthlyCostEvents: number | null
  monthlyCostTravel: number | null
  monthlyCostSchool: number | null
  monthlyCostOthers: number | null
  costResponsibility: string
  participatedInEdital: boolean | null
  approvedInEdital: boolean | null
  appliedNotApproved: boolean | null
  participatedInEditalStatus?: string | null
  approvedInEditalStatus?: string | null
  appliedNotApprovedStatus?: string | null
  editalDifficulty?: string | null
  searchesContent?: boolean | null
  consentCode: string
  consentAccepted: boolean
  consentContact?: boolean | null
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
  region?: string | null
  cityId: number
  email: string
  phone: string
  socialMedia?: string | null
  type: string
  legalNature?: string | null
  nature: string
  locationType: string
  foundationYear: number | null
  modalityIds: number[]
  numberOfTeachers: number | null
  averageStudents: number | null
  monthlyFee: number | null
  classesPerWeek: number | null
  numberOfRooms: number | null
  spaceType: string
  infrastructureItems?: string | null
  hasCnpj: boolean | null
  hasScholarShip: boolean | null
  scholarshipCount?: number | null
  studentsPayMonthlyFee?: boolean | null
  cltEmployees: number | null
  pjContracts: number | null
  monthlyRevenue: number | null
  usesManagementSystem: boolean | null
  mainChallenges: string
  eventCostResponsibility?: string | null
  staffRoles?: string | null
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
  mainIncomeSources?: string | null
  receivedPublicFundingLast2Years: boolean | null
  registeredInPublicCalls?: boolean | null
  approvedInPublicCalls?: boolean | null
  editalDifficulties?: string | null
  annualBudgetRange: string
  knowsMunicipalCulturePlan: boolean | null
  participatesInCultureCouncil: boolean | null
  interestedInPublicPartnerships: boolean | null
  knowsPublicPolicyAccessMechanisms?: boolean | null
  promotionChannels?: string | null
  wouldUseFreePromotionPlatform?: boolean | null
  consentCode: string
  consentAccepted: boolean
  consentContact?: boolean | null
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
  legalNature: string | null
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
