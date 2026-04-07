import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { Badge } from './Badge'
import { TurnstileWidget } from './TurnstileWidget'
import { useCleanUiTextTree } from '../hooks/useCleanUiTextTree'
import { ApiRequestError } from '../services/api'
import { listCities, listStates } from '../services/geo.services'
import { submitInstitutionForm, submitProfessionalForm, submitYouthForm } from '../services/forms.service'
import { getActiveConsentTerm, listContents, listModalities } from '../services/reference.service'
import { setPublicFormGuardMetadata } from '../services/api'
import type { CityResponse, StateResponse } from '../types/geo'
import type { ApiFieldError } from '../types/api'
import type { ActiveConsentTermResponse, ReferenceItemResponse } from '../types/reference'
import type {
  InstitutionFormResponse,
  ProfessionalFormResponse,
  YouthFormResponse,
} from '../types/forms'
import {
  calculateAgeFromBirthDate,
  formatBrazilianPhoneInput,
  formatCnpjInput,
  formatCpfInput,
  getCurrentBrazilDateInputValue,
  isAgeCompatibleWithBirthDate,
  isValidBrazilianPhone,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  normalizeDigits,
  shiftDateInputValue,
} from '../utils/brazilian-validation'
import { cleanUiText as t } from '../utils/ui-text'

type AccessFloatingMenuProps = {
  open: boolean
  onClose: () => void
  onSelect?: (value: string) => void
  initialView?: FlowMode
}

type FlowMode = 'menu' | 'minor-flow' | 'adult-flow' | 'institution-flow'
type ActiveFlow = Exclude<FlowMode, 'menu'>

type MinorFormData = {
  fullName: string
  cpf: string
  email: string
  whatsapp: string
  region: string
  ageRange: string
  state: string
  city: string
  age: string
  birthDate: string
  gender: string
  practiceTime: string
  danceModalities: string[]
  familyIncome: string
  schoolFee: string
  courses: string
  costumes: string
  festivals: string
  travel: string
  otherCosts: string
  monthlyFee: string
  whoPays: string[]
  careerInterest: string
  searchesContent: string
  consumedContents: string[]
  consentStats: boolean
  consentContact: boolean
}

type AdultFormData = {
  fullName: string
  cpf: string
  email: string
  whatsapp: string
  region: string
  ageRange: string
  state: string
  city: string
  age: string
  birthDate: string
  gender: string
  practiceTime: string
  danceModalities: string[]
  consumedContents: string[]
  searchesContent: string
  familyIncome: string
  careerInterest: string
  worksProfessionally: string
  hasDrt: string
  currentlyWorks: string
  danceMainIncomeChoice: string
  hasOtherIncomeChoice: string
  danceRoles: string[]
  workTypeChoice: string
  monthlyIncomeTotal: string
  danceIncome: string
  danceMonthlySpending: string
  schoolFee: string
  courses: string
  costumes: string
  festivals: string
  travel: string
  otherCosts: string
  whoPays: string[]
  academicEducation: string
  danceEducationLevel: string
  studiesDanceNow: string
  wantsFormalDanceStudy: string
  presentialCoursesPerYear: string
  onlineCoursesPerYear: string
  participatedPublicCalls: string
  wasSelected: string
  appliedNotSelected: string
  editalDifficulty: string
  consentStats: boolean
  consentContact: boolean
}

type InstitutionFormData = {
  responsibleName: string
  email: string
  whatsapp: string
  institutionName: string
  tradeName: string
  institutionType: string
  legalNature: string
  institutionNature: string
  foundationPeriod: string
  foundationYearExact: string
  hasCnpj: string
  cnpj: string
  region: string
  state: string
  city: string
  socialMedia: string
  locationType: string
  actsInPeriphery: string
  actsInRuralArea: string
  hasOwnHeadquarters: string
  rentedHeadquarters: string
  usesPublicSpace: string
  numberOfRooms: string
  classesPerWeek: string
  danceModalities: string[]
  spaceType: string
  averageAudienceCapacity: string
  activeStudents: string
  averageStudents: string
  numberOfTeachers: string
  numberOfStaff: string
  cltEmployees: string
  pjContracts: string
  monthlyAudience: string
  monthlyFee: string
  monthlyRevenue: string
  hasScholarShip: string
  usesManagementSystem: string
  mainChallenges: string
  servesVulnerablePopulation: string
  mainIncomeSources: string[]
  infrastructureItems: string[]
  scholarshipCount: string
  studentsPayMonthlyFee: string
  eventCostResponsibility: string
  staffRoles: string[]
  receivedPublicFundingLast2Years: string
  registeredInPublicCalls: string
  approvedInPublicCalls: string
  editalDifficulties: string[]
  annualBudgetRange: string
  knowsMunicipalCulturePlan: string
  participatesInCultureCouncil: string
  interestedInPublicPartnerships: string
  knowsPublicPolicyAccessMechanisms: string
  promotionChannels: string[]
  wouldUseFreePromotionPlatform: string
  consentStats: boolean
  consentContact: boolean
}

type OptionItem = { value: string; label: string }

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim()
const MAX_CURRENCY_INTEGER_DIGITS = 9
const MAX_CURRENCY_DECIMAL_DIGITS = 2
const MAX_CURRENCY_VALUE = 999_999_999.99
const MAX_GENERIC_INTEGER_DIGITS = 9

const minorCurrencyFields = new Set<keyof MinorFormData>([
  'monthlyFee',
  'schoolFee',
  'courses',
  'costumes',
  'festivals',
  'travel',
  'otherCosts',
])

const adultCurrencyFields = new Set<keyof AdultFormData>([
  'monthlyIncomeTotal',
  'danceIncome',
  'danceMonthlySpending',
  'schoolFee',
  'courses',
  'costumes',
  'festivals',
  'travel',
  'otherCosts',
])

const institutionCurrencyFields = new Set<keyof InstitutionFormData>(['monthlyFee', 'monthlyRevenue'])

const minorIntegerFieldDigits: Partial<Record<keyof MinorFormData, number>> = {
  age: 2,
}

const adultIntegerFieldDigits: Partial<Record<keyof AdultFormData, number>> = {
  age: 2,
  presentialCoursesPerYear: 4,
  onlineCoursesPerYear: 4,
}

const institutionIntegerFieldDigits: Partial<Record<keyof InstitutionFormData, number>> = {
  foundationYearExact: 4,
  numberOfRooms: 3,
  classesPerWeek: 3,
  numberOfTeachers: 4,
  averageStudents: 6,
  activeStudents: 6,
  averageAudienceCapacity: 6,
  scholarshipCount: 6,
  cltEmployees: 5,
  pjContracts: 5,
  numberOfStaff: 5,
  monthlyAudience: 6,
}

const accessOptions = [
  {
    label: 'Sou menor de 18 anos',
    description: 'Cadastro para participantes menores de 18 anos.',
    accentClass: 'is-yellow',
  },
  {
    label: 'Sou maior de 18 anos',
    description: 'Cadastro para pessoas adultas ligadas à dança.',
    accentClass: 'is-blue',
  },
  {
    label: 'Escola / Grupo / Companhia',
    description: 'Cadastro para escolas, grupos, companhias e projetos.',
    accentClass: 'is-pink',
  },
] as const

const FLOW_META: Record<ActiveFlow, { sector: string; title: string; totalSteps: number; selectLabel: string }> = {
  'minor-flow': {
    sector: 'Cadastro para Jovens da Dança',
    title: 'Menor de 18 anos • Tempo estimado: 4 minutos',
    totalSteps: 6,
    selectLabel: 'Sou menor de 18 anos',
  },
  'adult-flow': {
    sector: 'Cadastro para Profissionais da Dança',
    title: 'Maior de 18 anos • Tempo estimado: 5–6 minutos',
    totalSteps: 9,
    selectLabel: 'Sou maior de 18 anos',
  },
  'institution-flow': {
    sector: 'Cadastro para Instituições da Dança',
    title: 'Escolas, Grupos, Companhias e Projetos • Tempo estimado: 5–6 minutos',
    totalSteps: 8,
    selectLabel: 'Escola / Grupo / Companhia',
  },
}

const regionOptions: OptionItem[] = [
  { value: 'Norte', label: 'Norte' },
  { value: 'Nordeste', label: 'Nordeste' },
  { value: 'Centro-Oeste', label: 'Centro-Oeste' },
  { value: 'Sudeste', label: 'Sudeste' },
  { value: 'Sul', label: 'Sul' },
]

const stateOptions: OptionItem[] = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

const youthWhoPaysOptions = ['Família', 'Escola', 'Patrocínios', 'Outros']

const adultWhoPaysOptions = ['Você', 'Família', 'Escola', 'Edital', 'Outros']

const genderIdentityOptions: OptionItem[] = [
  { value: 'Mulher cis', label: 'Mulher cis' },
  { value: 'Mulher trans', label: 'Mulher trans' },
  { value: 'Homem cis', label: 'Homem cis' },
  { value: 'Homem trans', label: 'Homem trans' },
  { value: 'Travesti', label: 'Travesti' },
  { value: 'Pessoa não binária', label: 'Pessoa não binária' },
  { value: 'Outra identidade de gênero', label: 'Outra identidade de gênero' },
  { value: 'Prefiro não informar', label: 'Prefiro não informar' },
]

const householdIncomeOptions: OptionItem[] = [
  { value: '1 salário mínimo', label: '1 salário mínimo' },
  { value: '2 salários mínimos', label: '2 salários mínimos' },
  { value: '3 salários mínimos', label: '3 salários mínimos' },
  { value: '4 salários mínimos', label: '4 salários mínimos' },
  { value: '5 ou mais salários mínimos', label: '5 ou mais salários mínimos' },
]

const adultRolesOptions = [
  'Bailarino(a)',
  'Professor(a)',
  'Coreógrafo(a)',
  'Ensaiador(a)',
  'Diretor(a) artístico(a)',
  'Coordenador(a)',
  'Produtor(a) cultural',
  'Gestor(a)',
  'Preparador(a) corporal',
  'Outra',
]

const institutionTypeOptions: OptionItem[] = [
  { value: 'escola', label: 'Escola' },
  { value: 'grupo', label: 'Grupo' },
  { value: 'companhia', label: 'Companhia' },
  { value: 'projeto_social', label: 'Projeto social' },
]

const institutionLegalNatureOptions: OptionItem[] = [
  { value: 'MEI', label: 'MEI' },
  { value: 'ME', label: 'ME' },
  { value: 'EPP', label: 'EPP' },
  { value: 'Associação', label: 'Associação' },
  { value: 'Coletivo informal', label: 'Coletivo informal' },
]

const institutionNatureOptions: OptionItem[] = [
  { value: 'particular', label: 'Particular' },
  { value: 'projeto_social', label: 'Projeto social' },
  { value: 'espaco_publico', label: 'Espaço público' },
  { value: 'espaco_multiplas_artes', label: 'Espaço de múltiplas artes' },
]

const institutionLocationTypeOptions: OptionItem[] = [
  { value: 'central', label: 'Central' },
  { value: 'periférica', label: 'Periférica' },
  { value: 'rural', label: 'Rural' },
]

const institutionSpaceTypeOptions: OptionItem[] = [
  { value: 'alugado', label: 'Alugado' },
  { value: 'proprio', label: 'Próprio' },
  { value: 'cedido', label: 'Cedido' },
  { value: 'publico', label: 'Espaço público' },
]

const institutionIncomeSourcesOptions = [
  'Mensalidades de alunos',
  'Editais públicos',
  'Patrocínio privado',
  'Leis de incentivo',
  'Doações',
  'Recursos próprios',
  'Venda de ingressos',
  'Outra',
]

const institutionEditalDifficultiesOptions = [
  'Não sei fazer projetos',
  'Não tem informações',
  'Muito burocrático',
  'Falta de divulgação',
  'Falta conhecimento técnico',
  'Muitas regras',
]

const adultWorkTypeOptions: OptionItem[] = [
  { value: 'Autônoma', label: 'Autônoma' },
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'Voluntária', label: 'Voluntária' },
  { value: 'Outra', label: 'Outra' },
]

const institutionInfrastructureOptions = [
  'Espelhos',
  'Linóleo',
  'Piso de madeira',
  'Piso frio',
  'Tatame',
  'Ventiladores',
  'Ar-condicionado',
  'Bebedouro',
  'Recepção',
]

const institutionStaffRoleOptions = [
  'Direção',
  'Coordenação',
  'Professores',
  'Produção cultural',
  'Administrativo/financeiro',
  'Comunicação/marketing',
  'Técnico de som/luz',
  'Eu faço tudo sozinho(a)',
]

const institutionPromotionChannelOptions = [
  'Redes sociais',
  'Tráfego pago',
  'Rádio',
  'TV',
  'Jornal impresso',
  'Blog e portais',
  'Influenciadores',
  'Grupos de WhatsApp',
]

const institutionEventCostOptions: OptionItem[] = [
  { value: 'Instituição', label: 'Instituição' },
  { value: 'Estudantes', label: 'Estudantes' },
  { value: 'Famílias', label: 'Famílias' },
  { value: 'Edital', label: 'Edital' },
  { value: 'Patrocínio', label: 'Patrocínio' },
  { value: 'Compartilhado', label: 'Compartilhado' },
]

const initialMinorForm: MinorFormData = {
  fullName: '',
  cpf: '',
  email: '',
  whatsapp: '',
  region: '',
  ageRange: '',
  state: '',
  city: '',
  age: '',
  birthDate: '',
  gender: '',
  practiceTime: '',
  danceModalities: [],
  familyIncome: '',
  schoolFee: '',
  courses: '',
  costumes: '',
  festivals: '',
  travel: '',
  otherCosts: '',
  monthlyFee: '',
  whoPays: [],
  careerInterest: '',
  searchesContent: '',
  consumedContents: [],
  consentStats: false,
  consentContact: false,
}

const initialAdultForm: AdultFormData = {
  fullName: '',
  cpf: '',
  email: '',
  whatsapp: '',
  region: '',
  ageRange: '',
  state: '',
  city: '',
  age: '',
  birthDate: '',
  gender: '',
  practiceTime: '',
  danceModalities: [],
  consumedContents: [],
  searchesContent: '',
  familyIncome: '',
  careerInterest: '',
  worksProfessionally: '',
  hasDrt: '',
  currentlyWorks: '',
  danceMainIncomeChoice: '',
  hasOtherIncomeChoice: '',
  danceRoles: [],
  workTypeChoice: '',
  monthlyIncomeTotal: '',
  danceIncome: '',
  danceMonthlySpending: '',
  schoolFee: '',
  courses: '',
  costumes: '',
  festivals: '',
  travel: '',
  otherCosts: '',
  whoPays: [],
  academicEducation: '',
  danceEducationLevel: '',
  studiesDanceNow: '',
  wantsFormalDanceStudy: '',
  presentialCoursesPerYear: '0',
  onlineCoursesPerYear: '0',
  participatedPublicCalls: '',
  wasSelected: 'nao',
  appliedNotSelected: 'sim',
  editalDifficulty: '',
  consentStats: false,
  consentContact: false,
}

const initialInstitutionForm: InstitutionFormData = {
  responsibleName: '',
  email: '',
  whatsapp: '',
  institutionName: '',
  tradeName: '',
  institutionType: '',
  legalNature: '',
  institutionNature: '',
  foundationPeriod: '',
  foundationYearExact: '',
  hasCnpj: '',
  cnpj: '',
  region: '',
  state: '',
  city: '',
  socialMedia: '',
  locationType: '',
  actsInPeriphery: '',
  actsInRuralArea: '',
  hasOwnHeadquarters: '',
  rentedHeadquarters: '',
  usesPublicSpace: '',
  numberOfRooms: '',
  classesPerWeek: '',
  danceModalities: [],
  spaceType: '',
  averageAudienceCapacity: '',
  activeStudents: '',
  averageStudents: '',
  numberOfTeachers: '',
  numberOfStaff: '',
  cltEmployees: '',
  pjContracts: '',
  monthlyAudience: '',
  monthlyFee: '',
  monthlyRevenue: '',
  hasScholarShip: '',
  usesManagementSystem: '',
  mainChallenges: '',
  servesVulnerablePopulation: '',
  mainIncomeSources: [],
  infrastructureItems: [],
  scholarshipCount: '',
  studentsPayMonthlyFee: '',
  eventCostResponsibility: '',
  staffRoles: [],
  receivedPublicFundingLast2Years: '',
  registeredInPublicCalls: '',
  approvedInPublicCalls: '',
  editalDifficulties: [],
  annualBudgetRange: '',
  knowsMunicipalCulturePlan: '',
  participatesInCultureCouncil: '',
  interestedInPublicPartnerships: '',
  knowsPublicPolicyAccessMechanisms: '',
  promotionChannels: [],
  wouldUseFreePromotionPlatform: '',
  consentStats: false,
  consentContact: false,
}

const minorPracticeTimeOptions: OptionItem[] = [
  { value: 'MENOS_DE_1_ANO', label: 'Menos de 1 ano' },
  { value: 'ENTRE_1_E_3_ANOS', label: 'Entre 1 e 3 anos' },
  { value: 'ENTRE_4_E_6_ANOS', label: 'Entre 4 e 6 anos' },
  { value: 'MAIS_DE_6_ANOS', label: 'Mais de 6 anos' },
]

function parseBooleanChoice(value: string) {
  return value === 'sim'
}

function sanitizeIntegerInput(value: string, maxDigits = MAX_GENERIC_INTEGER_DIGITS) {
  const cleanedValue = value.replace(/[^\d,.-]/g, '')
  const integerDigits = cleanedValue.split(/[.,-]/)[0]?.replace(/\D/g, '') ?? ''
  return integerDigits.slice(0, maxDigits)
}

function sanitizeCurrencyInput(
  value: string,
  maxIntegerDigits = MAX_CURRENCY_INTEGER_DIGITS,
  maxDecimalDigits = MAX_CURRENCY_DECIMAL_DIGITS,
) {
  const cleanedValue = value.replace(/[^\d,.-]/g, '')

  if (!cleanedValue) {
    return ''
  }

  const separatorIndex = Math.max(cleanedValue.lastIndexOf(','), cleanedValue.lastIndexOf('.'))

  if (separatorIndex < 0) {
    return cleanedValue.replace(/\D/g, '').slice(0, maxIntegerDigits)
  }

  const integerDigits = cleanedValue.slice(0, separatorIndex).replace(/\D/g, '').slice(0, maxIntegerDigits)
  const fractionDigits = cleanedValue
    .slice(separatorIndex + 1)
    .replace(/\D/g, '')
    .slice(0, maxDecimalDigits)

  const normalizedIntegerDigits = integerDigits || (fractionDigits ? '0' : '')

  if (!normalizedIntegerDigits && !fractionDigits) {
    return ''
  }

  if (cleanedValue.endsWith(',') || cleanedValue.endsWith('.')) {
    return `${normalizedIntegerDigits},`
  }

  return fractionDigits ? `${normalizedIntegerDigits},${fractionDigits}` : normalizedIntegerDigits
}

function parseStrictCurrencyValue(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  const sanitizedValue = sanitizeCurrencyInput(normalizedValue)
  if (!sanitizedValue) {
    return null
  }

  const parsedValue = Number(sanitizedValue.replace(',', '.'))

  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > MAX_CURRENCY_VALUE) {
    return null
  }

  return parsedValue
}

function parseStrictIntegerValue(value: string, maxValue = Number.MAX_SAFE_INTEGER) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return null
  }

  const parsedValue = Number(normalizedValue)

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 0 || parsedValue > maxValue) {
    return null
  }

  return parsedValue
}

function validateCurrencyFields(fields: Array<{ label: string; value: string; required?: boolean }>) {
  for (const field of fields) {
    const normalizedValue = field.value.trim()

    if (!normalizedValue) {
      if (field.required) {
        return `Preencha ${field.label.toLowerCase()}.`
      }

      continue
    }

    if (parseStrictCurrencyValue(normalizedValue) === null) {
      return `${field.label} deve ter um valor válido, com até 9 dígitos e 2 casas decimais.`
    }
  }

  return null
}

function validateIntegerFields(
  fields: Array<{ label: string; value: string; maxValue: number; required?: boolean }>
) {
  for (const field of fields) {
    const normalizedValue = field.value.trim()

    if (!normalizedValue) {
      if (field.required) {
        return `Preencha ${field.label.toLowerCase()}.`
      }

      continue
    }

    if (parseStrictIntegerValue(normalizedValue, field.maxValue) === null) {
      return `${field.label} deve usar um número inteiro válido dentro do limite permitido.`
    }
  }

  return null
}

function mapFlowValidationError(
  flow: ActiveFlow,
  errors: ApiFieldError[],
  fallbackStep: number,
): { step: number; message: string } | null {
  const groups: Array<{ step: number; fields: string[]; message: string }> =
    flow === 'adult-flow'
      ? [
          {
            step: 2,
            fields: ['age'],
            message: 'Revise a idade informada. O cadastro profissional é para maiores de 18 anos.',
          },
          {
            step: 4,
            fields: ['totalIncome', 'danceIncome'],
            message: 'Revise os valores de renda. Use números válidos, sem letras, e até 9 dígitos.',
          },
          {
            step: 5,
            fields: [
              'monthlyCostCourses',
              'monthlyCostCostumes',
              'monthlyCostEvents',
              'monthlyCostTravel',
              'monthlyCostSchool',
              'monthlyCostOthers',
            ],
            message:
              'Revise os valores de gastos mensais com dança. Use números válidos, sem letras, e até 9 dígitos.',
          },
          {
            step: 6,
            fields: ['coursesPerYear', 'onlineCoursesPerYear'],
            message: 'Revise a quantidade de cursos por ano. Use números válidos e menores.',
          },
        ]
      : flow === 'institution-flow'
        ? [
          {
            step: 4,
            fields: ['monthlyFee'],
            message: 'Revise a mensalidade média. Use um valor válido e dentro do limite permitido.',
            },
            {
              step: 5,
              fields: ['monthlyRevenue'],
              message:
                'Revise o faturamento mensal. Use um valor válido, sem letras, e dentro do limite permitido.',
            },
          ]
        : [
            {
              step: 2,
              fields: ['age'],
              message: 'Revise a idade informada. O cadastro de jovens aceita idades até 17 anos.',
            },
            {
              step: 3,
              fields: [
                'monthlyFee',
                'monthlyCostSchool',
                'monthlyCostCourses',
                'monthlyCostCostumes',
                'monthlyCostFestivals',
                'monthlyCostTravel',
                'monthlyCostOthers',
              ],
              message:
                'Revise os valores de gastos com dança. Use números válidos, sem letras, e dentro do limite permitido.',
            },
          ]

  for (const group of groups) {
    if (errors.some((error) => group.fields.includes(error.field))) {
      return { step: group.step, message: group.message }
    }
  }

  const firstError = errors[0]
  if (!firstError) {
    return null
  }

  return {
    step: fallbackStep,
    message: firstError.message,
  }
}

function resolveSubmissionError(flow: ActiveFlow, error: unknown, fallbackStep: number) {
  if (error instanceof ApiRequestError && Array.isArray(error.errors) && error.errors.length > 0) {
    return mapFlowValidationError(flow, error.errors, fallbackStep)
  }

  if (error instanceof Error) {
    return { step: fallbackStep, message: formatMinorSubmissionError(error.message) }
  }

  return null
}

function formatMinorSubmissionError(message: string) {
  const normalizedMessage = t(message)

  if (
    normalizedMessage.includes('seguranca') ||
    normalizedMessage.includes('segurança') ||
    normalizedMessage.includes('captcha')
  ) {
    return 'Confirme a verificação de segurança e tente novamente.'
  }

  if (normalizedMessage.includes('Aguarde alguns segundos')) {
    return 'Aguarde alguns segundos antes de enviar o formulário.'
  }

  if (normalizedMessage.includes('Cidade')) {
    return 'Selecione uma cidade válida na lista.'
  }

  if (normalizedMessage.includes('modalidade')) {
    return 'Selecione pelo menos uma modalidade válida.'
  }

  if (normalizedMessage.includes('consentimento')) {
    return 'Não foi possível validar o termo de consentimento ativo. Tente novamente.'
  }

  if (normalizedMessage.includes('Tempo de pratica') || normalizedMessage.includes('Tempo de prática')) {
    return 'Informe os anos de prática da dança com um número válido.'
  }

  return normalizedMessage
}

function parseNumericSelection(value: string, fallback = 0) {
  const parsedValue = parseStrictCurrencyValue(value)
  return parsedValue ?? fallback
}

function normalizeTextValue(value: string) {
  return value.trim()
}

function normalizeOptionalTextValue(value: string) {
  const normalized = normalizeTextValue(value)
  return normalized || null
}

function normalizeOptionalDigitsValue(value: string) {
  const normalized = normalizeDigits(value)
  return normalized || null
}

function normalizeTextList(values: string[]) {
  return values.map((value) => normalizeTextValue(value)).filter(Boolean)
}

function renderSelectOptions(options: OptionItem[]) {
  return options.map((item) => (
    <option key={item.value} value={item.value}>
      {t(item.label)}
    </option>
  ))
}

function renderRegionOptions() {
  return regionOptions.map((item) => (
    <option key={item.value} value={item.value}>
      {t(item.label)}
    </option>
  ))
}

export function AccessFloatingMenu({ open, onClose, onSelect, initialView = 'menu' }: AccessFloatingMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [view, setView] = useState<FlowMode>(initialView)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepError, setStepError] = useState('')
  const [minorForm, setMinorForm] = useState<MinorFormData>(initialMinorForm)
  const [adultForm, setAdultForm] = useState<AdultFormData>(initialAdultForm)
  const [institutionForm, setInstitutionForm] = useState<InstitutionFormData>(initialInstitutionForm)
  const [availableStates, setAvailableStates] = useState<StateResponse[]>([])
  const [minorCityOptions, setMinorCityOptions] = useState<CityResponse[]>([])
  const [adultCityOptions, setAdultCityOptions] = useState<CityResponse[]>([])
  const [institutionCityOptions, setInstitutionCityOptions] = useState<CityResponse[]>([])
  const [minorModalities, setMinorModalities] = useState<ReferenceItemResponse[]>([])
  const [minorContents, setMinorContents] = useState<ReferenceItemResponse[]>([])
  const [activeConsentTerm, setActiveConsentTerm] = useState<ActiveConsentTermResponse | null>(null)
  const [isMinorLoadingReferences, setIsMinorLoadingReferences] = useState(false)
  const [hasLoadedReferences, setHasLoadedReferences] = useState(false)
  const [isMinorSubmitting, setIsMinorSubmitting] = useState(false)
  const [minorSubmission, setMinorSubmission] = useState<YouthFormResponse | null>(null)
  const [isAdultSubmitting, setIsAdultSubmitting] = useState(false)
  const [adultSubmission, setAdultSubmission] = useState<ProfessionalFormResponse | null>(null)
  const [isInstitutionSubmitting, setIsInstitutionSubmitting] = useState(false)
  const [institutionSubmission, setInstitutionSubmission] = useState<InstitutionFormResponse | null>(null)
  const [isStepTransitionPending, startStepTransition] = useTransition()
  const [formStartedAt, setFormStartedAt] = useState(() => new Date().toISOString())
  const [honeypotValue, setHoneypotValue] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaRenderKey, setCaptchaRenderKey] = useState(0)
  const previousOpenRef = useRef(open)
  const previousInitialViewRef = useRef(initialView)
  const antiBotEnabled = Boolean(TURNSTILE_SITE_KEY)

  useCleanUiTextTree(panelRef)

  const earliestBirthDate = '1900-01-01'
  const todayInBrazilDateInput = useMemo(() => getCurrentBrazilDateInputValue(), [])
  const adultBirthDateMax = useMemo(() => shiftDateInputValue(todayInBrazilDateInput, { years: -18 }), [todayInBrazilDateInput])
  const youthBirthDateMax = useMemo(
    () => shiftDateInputValue(todayInBrazilDateInput, { years: -18, days: 1 }),
    [todayInBrazilDateInput],
  )

  const currentMeta = useMemo(() => {
    if (view === 'menu') return null
    return FLOW_META[view]
  }, [view])

  const renderBrazilStateOptions = () => {
    const statesToRender =
      availableStates.length > 0
        ? availableStates.map((item) => ({ value: item.code, label: item.name }))
        : stateOptions

    return statesToRender.map((item) => (
      <option key={item.value} value={item.value}>
        {t(item.label)}
      </option>
    ))
  }

  useEffect(() => {
    const reopened = open && !previousOpenRef.current
    const initialViewChanged = previousInitialViewRef.current !== initialView

    previousOpenRef.current = open
    previousInitialViewRef.current = initialView

    if (!open) {
      return
    }

    if (!reopened && !initialViewChanged) {
      return
    }

    setView(initialView)
    setCurrentStep(0)
    setStepError('')
    setMinorSubmission(null)
    setAdultSubmission(null)
    setInstitutionSubmission(null)
    resetAntiBotState()
  }, [initialView, open])

  useEffect(() => {
    if (!open || view === 'menu') {
      setPublicFormGuardMetadata(null)
      return
    }

    setPublicFormGuardMetadata({
      captchaToken,
      formStartedAt,
      honeypot: honeypotValue,
    })

    return () => {
      setPublicFormGuardMetadata(null)
    }
  }, [captchaToken, formStartedAt, honeypotValue, open, view])

  useEffect(() => {
    if (!open) {
      return
    }

    if (hasLoadedReferences) {
      return
    }

    let isMounted = true

    async function loadReferenceData() {
      try {
        setIsMinorLoadingReferences(true)
        const [states, modalities, contents, consentTerm] = await Promise.all([
          listStates().catch(() => [] as StateResponse[]),
          listModalities(),
          listContents(),
          getActiveConsentTerm(),
        ])

        if (!isMounted) {
          return
        }

        setAvailableStates(states)
        setMinorModalities(modalities)
        setMinorContents(contents)
        setActiveConsentTerm(consentTerm)
        setHasLoadedReferences(true)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setStepError(
          error instanceof Error
            ? formatMinorSubmissionError(error.message)
            : 'Não foi possível carregar os dados de apoio do formulário.'
        )
      } finally {
        if (isMounted) {
          setIsMinorLoadingReferences(false)
        }
      }
    }

    loadReferenceData()

    return () => {
      isMounted = false
    }
  }, [hasLoadedReferences, open])

  useEffect(() => {
    if (view !== 'minor-flow' || !minorForm.state) {
      setMinorCityOptions([])
      if (minorForm.city) {
        updateMinorField('city', '')
      }
      return
    }

    let isMounted = true

    async function loadMinorCities() {
      try {
        const cities = await listCities(minorForm.state)

        if (!isMounted) {
          return
        }

        setMinorCityOptions(cities)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setMinorCityOptions([])
        setStepError(
          error instanceof Error
            ? formatMinorSubmissionError(error.message)
            : 'Não foi possível carregar as cidades do estado selecionado.'
        )
      }
    }

    loadMinorCities()

    return () => {
      isMounted = false
    }
  }, [minorForm.state, view])

  useEffect(() => {
    if (view !== 'adult-flow' || !adultForm.state) {
      setAdultCityOptions([])
      if (adultForm.city) {
        updateAdultField('city', '')
      }
      return
    }

    let isMounted = true

    async function loadAdultCities() {
      try {
        const cities = await listCities(adultForm.state)

        if (!isMounted) {
          return
        }

        setAdultCityOptions(cities)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setAdultCityOptions([])
        setStepError(
          error instanceof Error
            ? formatMinorSubmissionError(error.message)
            : 'Não foi possível carregar as cidades do estado selecionado.'
        )
      }
    }

    loadAdultCities()

    return () => {
      isMounted = false
    }
  }, [adultForm.state, view])

  useEffect(() => {
    if (view !== 'institution-flow' || !institutionForm.state) {
      setInstitutionCityOptions([])
      if (institutionForm.city) {
        updateInstitutionField('city', '')
      }
      return
    }

    let isMounted = true

    async function loadInstitutionCities() {
      try {
        const cities = await listCities(institutionForm.state)

        if (!isMounted) {
          return
        }

        setInstitutionCityOptions(cities)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setInstitutionCityOptions([])
        setStepError(
          error instanceof Error
            ? formatMinorSubmissionError(error.message)
            : 'Não foi possível carregar as cidades do estado selecionado.'
        )
      }
    }

    loadInstitutionCities()

    return () => {
      isMounted = false
    }
  }, [institutionForm.state, view])

  const totalSteps = currentMeta?.totalSteps ?? 0

  const progress = useMemo(() => {
    if (totalSteps === 0) return 0
    return ((currentStep + 1) / totalSteps) * 100
  }, [currentStep, totalSteps])

  const resetAntiBotState = () => {
    setFormStartedAt(new Date().toISOString())
    setHoneypotValue('')
    setCaptchaToken('')
    setCaptchaRenderKey((prev) => prev + 1)
  }

  const getAntiBotHeaders = () => {
    const headers: Record<string, string> = {
      'X-Form-Started-At': formStartedAt,
    }

    if (honeypotValue.trim()) {
      headers['X-Form-Honeypot'] = honeypotValue.trim()
    }

    if (captchaToken) {
      headers['X-Captcha-Token'] = captchaToken
    }

    return headers
  }

  const resetAll = () => {
    setView('menu')
    setCurrentStep(0)
    setStepError('')
    resetAntiBotState()
    setMinorForm(initialMinorForm)
    setAdultForm(initialAdultForm)
    setInstitutionForm(initialInstitutionForm)
    setMinorCityOptions([])
    setAdultCityOptions([])
    setInstitutionCityOptions([])
    setIsMinorLoadingReferences(false)
    setIsMinorSubmitting(false)
    setMinorSubmission(null)
    setIsAdultSubmitting(false)
    setAdultSubmission(null)
    setIsInstitutionSubmitting(false)
    setInstitutionSubmission(null)
  }

  const handleClose = () => {
    resetAll()
    onClose()
  }

  const handleOverlayClick = () => {
    if (view !== 'menu') {
      return
    }

    handleClose()
  }

  const updateMinorField = <K extends keyof MinorFormData>(field: K, value: MinorFormData[K]) => {
    const nextValue =
      typeof value === 'string'
        ? (
            field === 'cpf'
              ? formatCpfInput(value)
              : field === 'whatsapp'
                ? formatBrazilianPhoneInput(value)
                : minorCurrencyFields.has(field)
              ? sanitizeCurrencyInput(value)
              : minorIntegerFieldDigits[field]
                ? sanitizeIntegerInput(value, minorIntegerFieldDigits[field])
                : value
          )
        : value

    setMinorForm((prev) => {
      const nextForm = { ...prev, [field]: nextValue as MinorFormData[K] }

      if (field === 'birthDate' && typeof nextValue === 'string') {
        const calculatedAge = calculateAgeFromBirthDate(nextValue)
        nextForm.age = calculatedAge === null ? '' : String(Math.max(calculatedAge, 0))
      }

      return nextForm
    })
  }

  const updateAdultField = <K extends keyof AdultFormData>(field: K, value: AdultFormData[K]) => {
    const nextValue =
      typeof value === 'string'
        ? (
            field === 'cpf'
              ? formatCpfInput(value)
              : field === 'whatsapp'
                ? formatBrazilianPhoneInput(value)
                : adultCurrencyFields.has(field)
              ? sanitizeCurrencyInput(value)
              : adultIntegerFieldDigits[field]
                ? sanitizeIntegerInput(value, adultIntegerFieldDigits[field])
                : value
          )
        : value

    setAdultForm((prev) => {
      const nextForm = { ...prev, [field]: nextValue as AdultFormData[K] }

      if (field === 'birthDate' && typeof nextValue === 'string') {
        const calculatedAge = calculateAgeFromBirthDate(nextValue)
        nextForm.age = calculatedAge === null ? '' : String(Math.max(calculatedAge, 0))
        nextForm.ageRange = calculatedAge === null ? '' : `${Math.max(calculatedAge, 0)} anos`
      }

      return nextForm
    })
  }

  const updateInstitutionField = <K extends keyof InstitutionFormData>(
    field: K,
    value: InstitutionFormData[K]
  ) => {
    const nextValue =
      typeof value === 'string'
        ? (
            field === 'cnpj'
              ? formatCnpjInput(value)
              : field === 'whatsapp'
                ? formatBrazilianPhoneInput(value)
                : institutionCurrencyFields.has(field)
              ? sanitizeCurrencyInput(value)
              : institutionIntegerFieldDigits[field]
                ? sanitizeIntegerInput(value, institutionIntegerFieldDigits[field])
                : value
          )
        : value

    setInstitutionForm((prev) => ({ ...prev, [field]: nextValue as InstitutionFormData[K] }))
  }

  const toggleMinorArrayValue = (
    field: 'danceModalities' | 'whoPays' | 'consumedContents',
    value: string
  ) => {
    setMinorForm((prev) => {
      const exists = prev[field].includes(value)
      return {
        ...prev,
        [field]: exists ? prev[field].filter((item) => item !== value) : [...prev[field], value],
      }
    })
  }

  const toggleAdultArrayValue = (
    field: 'danceModalities' | 'whoPays' | 'danceRoles' | 'consumedContents',
    value: string
  ) => {
    setAdultForm((prev) => {
      const exists = prev[field].includes(value)
      return {
        ...prev,
        [field]: exists ? prev[field].filter((item) => item !== value) : [...prev[field], value],
      }
    })
  }

  const toggleInstitutionArrayValue = (
    field:
      | 'danceModalities'
      | 'mainIncomeSources'
      | 'editalDifficulties'
      | 'infrastructureItems'
      | 'staffRoles'
      | 'promotionChannels',
    value: string
  ) => {
    setInstitutionForm((prev) => {
      const exists = prev[field].includes(value)
      return {
        ...prev,
        [field]: exists ? prev[field].filter((item) => item !== value) : [...prev[field], value],
      }
    })
  }

  const handleOptionSelect = (label: string) => {
    setStepError('')

    if (label === 'Sou menor de 18 anos') {
      resetAntiBotState()
      setView('minor-flow')
      setCurrentStep(0)
      return
    }

    if (label === 'Sou maior de 18 anos') {
      resetAntiBotState()
      setView('adult-flow')
      setCurrentStep(0)
      return
    }

    if (label === 'Escola / Grupo / Companhia') {
      resetAntiBotState()
      setView('institution-flow')
      setCurrentStep(0)
      return
    }

    onSelect?.(label)
    handleClose()
  }

  const handlePrevious = () => {
    setStepError('')

    if (currentStep === 0) {
      resetAntiBotState()
      setView('menu')
      return
    }

    startStepTransition(() => {
      setCurrentStep((prev) => prev - 1)
    })
  }

  const handleTopBack = handlePrevious

  const validateMinorStep = () => {
    if (currentStep === 0 && (!minorForm.fullName || !minorForm.email || !minorForm.whatsapp)) {
      setStepError('Preencha nome completo, email e WhatsApp.')
      return false
    }

    if (currentStep === 0 && !isValidEmail(minorForm.email)) {
      setStepError('Informe um e-mail válido para o cadastro.')
      return false
    }

    if (currentStep === 0 && !isValidBrazilianPhone(minorForm.whatsapp)) {
      setStepError('Informe um WhatsApp válido com DDD.')
      return false
    }

    if (currentStep === 0 && minorForm.cpf && !isValidCpf(minorForm.cpf)) {
      setStepError('Confira o CPF informado antes de continuar.')
      return false
    }

    if (currentStep === 1 && (!minorForm.region || !minorForm.state || !minorForm.city)) {
      setStepError('Preencha região, estado e cidade.')
      return false
    }

    if (
      currentStep === 2 &&
      (!minorForm.birthDate ||
        !minorForm.age ||
        !minorForm.practiceTime ||
        minorForm.danceModalities.length === 0)
    ) {
      setStepError(
        'Preencha data de nascimento, idade, tempo de prática e ao menos uma modalidade.'
      )
      return false
    }

    if (currentStep === 2 && Number(minorForm.age) > 17) {
      setStepError('O cadastro de jovens aceita idades até 17 anos.')
      return false
    }

    if (currentStep === 2 && !isAgeCompatibleWithBirthDate(minorForm.age, minorForm.birthDate)) {
      setStepError('A idade precisa corresponder à data de nascimento informada.')
      return false
    }

    if (currentStep === 2) {
      const integerError = validateIntegerFields([
        { label: 'a idade', value: minorForm.age, maxValue: 17, required: true },
      ])

      if (integerError) {
        setStepError(integerError)
        return false
      }
    }

    if (currentStep === 3 && !minorForm.familyIncome) {
      setStepError('Selecione a faixa de renda familiar.')
      return false
    }

    if (currentStep === 3) {
      const currencyError = validateCurrencyFields([
        { label: 'a mensalidade', value: minorForm.monthlyFee },
        { label: 'o gasto com escola ou academia', value: minorForm.schoolFee },
        { label: 'o gasto com cursos e formações', value: minorForm.courses },
        { label: 'o gasto com figurinos e acessórios', value: minorForm.costumes },
        { label: 'o gasto com festivais e competições', value: minorForm.festivals },
        { label: 'o gasto com viagens e deslocamentos', value: minorForm.travel },
        { label: 'outros gastos com dança', value: minorForm.otherCosts },
      ])

      if (currencyError) {
        setStepError(currencyError)
        return false
      }
    }

    if (
      currentStep === 4 &&
      (!minorForm.careerInterest || minorForm.whoPays.length === 0 || !minorForm.searchesContent)
    ) {
      setStepError(
        'Informe interesse em carreira, quem banca os custos e se pesquisa conteúdos sobre dança.'
      )
      return false
    }

    if (currentStep === 5 && !minorForm.consentStats) {
      setStepError('É necessário autorizar o uso estatístico dos dados.')
      return false
    }

    setStepError('')
    return true
  }

  const validateAdultStep = () => {
    if (currentStep === 0 && (!adultForm.fullName || !adultForm.email || !adultForm.whatsapp)) {
      setStepError('Preencha nome completo, email e WhatsApp.')
      return false
    }

    if (currentStep === 0 && !isValidEmail(adultForm.email)) {
      setStepError('Informe um e-mail válido para o cadastro.')
      return false
    }

    if (currentStep === 0 && !isValidBrazilianPhone(adultForm.whatsapp)) {
      setStepError('Informe um WhatsApp válido com DDD.')
      return false
    }

    if (currentStep === 0 && adultForm.cpf && !isValidCpf(adultForm.cpf)) {
      setStepError('Confira o CPF informado antes de continuar.')
      return false
    }

    if (currentStep === 1 && (!adultForm.region || !adultForm.state || !adultForm.city)) {
      setStepError('Preencha região, estado e cidade.')
      return false
    }

    if (
      currentStep === 2 &&
      (!adultForm.birthDate ||
        !adultForm.age ||
        !adultForm.practiceTime ||
        adultForm.danceModalities.length === 0)
    ) {
      setStepError(
        'Preencha data de nascimento, idade, tempo de prática e ao menos uma modalidade.'
      )
      return false
    }

    if (currentStep === 3 && (!adultForm.worksProfessionally || !adultForm.careerInterest || adultForm.danceRoles.length === 0 || !adultForm.workTypeChoice)) {
      setStepError(
        'Informe se atua profissionalmente com dança, se pretende seguir carreira, o tipo de atuação e selecione ao menos uma função.'
      )
      return false
    }

    if (currentStep === 3 && (!adultForm.hasDrt || !adultForm.currentlyWorks)) {
      setStepError('Informe se possui DRT e se atua atualmente na dança.')
      return false
    }

    if (
      currentStep === 4 &&
      (
        !adultForm.familyIncome ||
        !adultForm.monthlyIncomeTotal ||
        !adultForm.danceIncome ||
        !adultForm.danceMainIncomeChoice ||
        !adultForm.hasOtherIncomeChoice
      )
    ) {
      setStepError(
        'Preencha renda da casa, renda total, renda com dança, renda principal e outra renda.'
      )
      return false
    }

    if (currentStep === 2 && Number(adultForm.age) < 18) {
      setStepError('O cadastro profissional é destinado a maiores de 18 anos.')
      return false
    }

    if (currentStep === 2 && !isAgeCompatibleWithBirthDate(adultForm.age, adultForm.birthDate)) {
      setStepError('A idade precisa corresponder à data de nascimento informada.')
      return false
    }

    if (currentStep === 2) {
      const integerError = validateIntegerFields([
        { label: 'a idade', value: adultForm.age, maxValue: 99, required: true },
      ])

      if (integerError) {
        setStepError(integerError)
        return false
      }
    }

    if (currentStep === 4) {
      const currencyError = validateCurrencyFields([
        { label: 'a renda mensal total', value: adultForm.monthlyIncomeTotal, required: true },
        { label: 'a renda mensal com dança', value: adultForm.danceIncome, required: true },
      ])

      if (currencyError) {
        setStepError(currencyError)
        return false
      }
    }

    if (
      currentStep === 5 &&
      (!adultForm.schoolFee ||
        !adultForm.courses ||
        !adultForm.costumes ||
        !adultForm.festivals ||
        !adultForm.travel ||
        !adultForm.otherCosts ||
        adultForm.whoPays.length === 0 ||
        !adultForm.searchesContent)
    ) {
      setStepError('Preencha os gastos mensais com dança, quem banca esses custos e a busca de conteúdos.')
      return false
    }

    if (currentStep === 5) {
      const currencyError = validateCurrencyFields([
        { label: 'a mensalidade de escola ou grupo', value: adultForm.schoolFee, required: true },
        { label: 'o gasto com cursos e formações', value: adultForm.courses },
        { label: 'o gasto com figurinos e acessórios', value: adultForm.costumes },
        { label: 'o gasto com festivais e competições', value: adultForm.festivals },
        { label: 'o gasto com viagens e deslocamentos', value: adultForm.travel },
        { label: 'outros gastos', value: adultForm.otherCosts, required: true },
      ])

      if (currencyError) {
        setStepError(currencyError)
        return false
      }
    }

    if (
      currentStep === 6 &&
      (!adultForm.academicEducation ||
        !adultForm.studiesDanceNow ||
        !adultForm.wantsFormalDanceStudy ||
        !adultForm.presentialCoursesPerYear ||
        !adultForm.onlineCoursesPerYear)
    ) {
      setStepError('Preencha formação acadêmica, estudos em dança e a quantidade de cursos presenciais e online por ano.')
      return false
    }

    if (currentStep === 6) {
      const integerError = validateIntegerFields([
        { label: 'a quantidade de cursos presenciais por ano', value: adultForm.presentialCoursesPerYear, maxValue: 9999, required: true },
        { label: 'a quantidade de cursos online por ano', value: adultForm.onlineCoursesPerYear, maxValue: 9999, required: true },
      ])

      if (integerError) {
        setStepError(integerError)
        return false
      }
    }

    if (currentStep === 6 && !adultForm.academicEducation) {
      setStepError('Selecione a formação acadêmica.')
      return false
    }

    if (
      currentStep === 7 &&
      (!adultForm.participatedPublicCalls || !adultForm.wasSelected || !adultForm.appliedNotSelected)
    ) {
      setStepError('Informe a participação em editais, seleção, aprovação e inscrições não contempladas.')
      return false
    }

    if (currentStep === 7 && !adultForm.participatedPublicCalls) {
      setStepError('Informe se já participou de editais públicos.')
      return false
    }

    if (currentStep === 8 && !adultForm.consentStats) {
      setStepError('É necessário autorizar o uso estatístico dos dados.')
      return false
    }

    setStepError('')
    return true
  }

  const validateInstitutionStep = () => {
    if (
      currentStep === 0 &&
      (!institutionForm.responsibleName || !institutionForm.email || !institutionForm.whatsapp)
    ) {
      setStepError('Preencha nome completo do responsável, email e WhatsApp.')
      return false
    }

    if (
      currentStep === 1 &&
      (!institutionForm.institutionName ||
        !institutionForm.institutionType ||
        !institutionForm.foundationPeriod ||
        !institutionForm.hasCnpj)
    ) {
      setStepError(
        'Preencha nome da instituição, tipo, período de fundação e informe se possui CNPJ.'
      )
      return false
    }

    if (currentStep === 1 && institutionForm.hasCnpj === 'sim' && !institutionForm.cnpj) {
      setStepError('Preencha o CNPJ da instituição.')
      return false
    }

    if (
      currentStep === 2 &&
      (!institutionForm.region ||
        !institutionForm.state ||
        !institutionForm.city ||
        !institutionForm.actsInPeriphery ||
        !institutionForm.actsInRuralArea)
    ) {
      setStepError(
        'Preencha região, estado, cidade e informe atuação em periferia e zona rural.'
      )
      return false
    }

    if (
      currentStep === 3 &&
      (!institutionForm.hasOwnHeadquarters ||
        !institutionForm.rentedHeadquarters ||
        !institutionForm.usesPublicSpace ||
        !institutionForm.numberOfRooms ||
        !institutionForm.averageAudienceCapacity)
    ) {
      setStepError(
        'Preencha sede própria, sede alugada, uso de espaço público, número de salas e capacidade média de público.'
      )
      return false
    }

    if (
      currentStep === 4 &&
      (!institutionForm.activeStudents ||
        !institutionForm.numberOfTeachers ||
        !institutionForm.numberOfStaff ||
        !institutionForm.monthlyAudience ||
        !institutionForm.servesVulnerablePopulation)
    ) {
      setStepError(
        'Preencha número de alunos ativos, professores, funcionários, público mensal e vulnerabilidade.'
      )
      return false
    }

    if (
      currentStep === 5 &&
      (institutionForm.mainIncomeSources.length === 0 ||
        !institutionForm.receivedPublicFundingLast2Years ||
        !institutionForm.annualBudgetRange)
    ) {
      setStepError(
        'Selecione fontes de renda, informe sobre recurso público e a faixa de orçamento anual.'
      )
      return false
    }

    if (
      currentStep === 6 &&
      (!institutionForm.knowsMunicipalCulturePlan ||
        !institutionForm.participatesInCultureCouncil ||
        !institutionForm.interestedInPublicPartnerships)
    ) {
      setStepError(
        'Preencha plano municipal, conselho de cultura e interesse em parcerias públicas.'
      )
      return false
    }

    if (currentStep === 7 && !institutionForm.consentStats) {
      setStepError('É necessário autorizar o uso estatístico dos dados.')
      return false
    }

    if (currentStep === 7 && !institutionForm.consentContact) {
      setStepError('É necessário autorizar o contato institucional.')
      return false
    }

    setStepError('')
    return true
  }

  const validateInstitutionRealStep = () => {
    void validateInstitutionStep

    if (
      currentStep === 0 &&
      (!institutionForm.responsibleName || !institutionForm.email || !institutionForm.whatsapp)
    ) {
      setStepError('Preencha nome completo do responsável, email e WhatsApp.')
      return false
    }

    if (currentStep === 0 && !isValidEmail(institutionForm.email)) {
      setStepError('Informe um e-mail institucional válido.')
      return false
    }

    if (currentStep === 0 && !isValidBrazilianPhone(institutionForm.whatsapp)) {
      setStepError('Informe um telefone ou WhatsApp válido com DDD.')
      return false
    }

    if (
      currentStep === 1 &&
      (!institutionForm.institutionName ||
        !institutionForm.tradeName ||
        !institutionForm.institutionType ||
        !institutionForm.legalNature ||
        !institutionForm.institutionNature ||
        !institutionForm.foundationYearExact ||
        !institutionForm.hasCnpj)
    ) {
      setStepError('Preencha razão social, nome fantasia, tipo de atuação, natureza jurídica, perfil da instituição, ano de fundação e informe se possui CNPJ.')
      return false
    }

    if (currentStep === 1 && institutionForm.hasCnpj === 'sim' && !institutionForm.cnpj) {
      setStepError('Preencha o CNPJ da instituição.')
      return false
    }

    if (currentStep === 1 && institutionForm.hasCnpj === 'sim' && !isValidCnpj(institutionForm.cnpj)) {
      setStepError('Confira o CNPJ informado antes de continuar.')
      return false
    }

    if (
      currentStep === 1 &&
      institutionForm.foundationYearExact &&
      (Number(institutionForm.foundationYearExact) < 1900 || Number(institutionForm.foundationYearExact) > 2100)
    ) {
      setStepError('Informe um ano de fundação válido entre 1900 e 2100.')
      return false
    }

    if (currentStep === 1) {
      const integerError = validateIntegerFields([
        { label: 'o ano de fundação', value: institutionForm.foundationYearExact, maxValue: 2100, required: true },
      ])

      if (integerError) {
        setStepError(integerError)
        return false
      }
    }

    if (currentStep === 2 && (!institutionForm.state || !institutionForm.city || !institutionForm.locationType)) {
      setStepError('Preencha estado, cidade e tipo de localização da instituição.')
      return false
    }

    if (
      currentStep === 2 &&
      (!institutionForm.region ||
        !institutionForm.actsInPeriphery ||
        !institutionForm.actsInRuralArea)
    ) {
      setStepError('Preencha região e informe a atuação em periferia e área rural.')
      return false
    }

    if (
      currentStep === 3 &&
      (!institutionForm.spaceType ||
        !institutionForm.numberOfRooms ||
        !institutionForm.classesPerWeek ||
        institutionForm.danceModalities.length === 0)
    ) {
      setStepError('Preencha modalidades, número de salas, aulas por semana e tipo de espaço.')
      return false
    }

    if (
      currentStep === 3 &&
      (!institutionForm.hasOwnHeadquarters ||
        !institutionForm.rentedHeadquarters ||
        !institutionForm.usesPublicSpace ||
        !institutionForm.averageAudienceCapacity)
    ) {
      setStepError('Preencha uso da sede e capacidade média de público.')
      return false
    }

    if (currentStep === 3) {
      const integerError = validateIntegerFields([
        { label: 'o número de salas', value: institutionForm.numberOfRooms, maxValue: 999, required: true },
        { label: 'as aulas por semana', value: institutionForm.classesPerWeek, maxValue: 999, required: true },
        { label: 'a capacidade média de público', value: institutionForm.averageAudienceCapacity, maxValue: 999999, required: true },
      ])

      if (integerError) {
        setStepError(integerError)
        return false
      }
    }

    if (
      currentStep === 4 &&
      (!institutionForm.averageStudents ||
        !institutionForm.numberOfTeachers ||
        !institutionForm.monthlyFee ||
        !institutionForm.hasScholarShip ||
        !institutionForm.activeStudents ||
        !institutionForm.servesVulnerablePopulation ||
        !institutionForm.studentsPayMonthlyFee)
    ) {
      setStepError('Preencha alunos, professores, mensalidade, bolsas, pagamento de mensalidade e público atendido.')
      return false
    }

    if (currentStep === 4) {
      const currencyError = validateCurrencyFields([
        { label: 'a mensalidade média', value: institutionForm.monthlyFee, required: true },
      ])

      if (currencyError) {
        setStepError(currencyError)
        return false
      }
    }

    if (currentStep === 4 && institutionForm.hasScholarShip === 'sim' && !institutionForm.scholarshipCount) {
      setStepError('Informe a quantidade de bolsistas atendidos pela instituição.')
      return false
    }

    if (currentStep === 4) {
      const integerError = validateIntegerFields([
        { label: 'o número de professores', value: institutionForm.numberOfTeachers, maxValue: 9999, required: true },
        { label: 'a média de alunos ativos', value: institutionForm.averageStudents, maxValue: 999999, required: true },
        { label: 'os alunos ativos no momento', value: institutionForm.activeStudents, maxValue: 999999, required: true },
        { label: 'a quantidade de bolsistas', value: institutionForm.scholarshipCount, maxValue: 999999, required: institutionForm.hasScholarShip === 'sim' },
      ])

      if (integerError) {
        setStepError(integerError)
        return false
      }
    }

    if (
      currentStep === 5 &&
      (!institutionForm.cltEmployees ||
        !institutionForm.pjContracts ||
        !institutionForm.monthlyRevenue ||
        !institutionForm.usesManagementSystem ||
        institutionForm.mainIncomeSources.length === 0 ||
        !institutionForm.receivedPublicFundingLast2Years ||
        !institutionForm.annualBudgetRange)
    ) {
      setStepError('Preencha equipe, faturamento, sistema de gestão, fontes de renda, recurso público e orçamento anual.')
      return false
    }

    if (currentStep === 5) {
      const currencyError = validateCurrencyFields([
        { label: 'o faturamento mensal médio', value: institutionForm.monthlyRevenue, required: true },
      ])

      if (currencyError) {
        setStepError(currencyError)
        return false
      }
    }

    if (currentStep === 5 && (!institutionForm.numberOfStaff || !institutionForm.monthlyAudience)) {
      setStepError('Preencha o tamanho da equipe e o público mensal da instituição.')
      return false
    }

    if (currentStep === 5) {
      const integerError = validateIntegerFields([
        { label: 'os funcionários CLT', value: institutionForm.cltEmployees, maxValue: 99999, required: true },
        { label: 'os contratos PJ', value: institutionForm.pjContracts, maxValue: 99999, required: true },
        { label: 'o número total de pessoas na equipe', value: institutionForm.numberOfStaff, maxValue: 99999, required: true },
        { label: 'o público mensal', value: institutionForm.monthlyAudience, maxValue: 999999, required: true },
      ])

      if (integerError) {
        setStepError(integerError)
        return false
      }
    }

    if (
      currentStep === 6 &&
      (
        !institutionForm.mainChallenges.trim() ||
        !institutionForm.eventCostResponsibility ||
        institutionForm.staffRoles.length === 0 ||
        !institutionForm.registeredInPublicCalls ||
        !institutionForm.approvedInPublicCalls ||
        !institutionForm.knowsPublicPolicyAccessMechanisms ||
        !institutionForm.knowsMunicipalCulturePlan ||
        !institutionForm.participatesInCultureCouncil ||
        !institutionForm.interestedInPublicPartnerships ||
        institutionForm.promotionChannels.length === 0 ||
        !institutionForm.wouldUseFreePromotionPlatform
      )
    ) {
      setStepError('Preencha custos de eventos, equipe, editais, políticas públicas, divulgação e o principal desafio.')
      return false
    }

    if (currentStep === 7 && !institutionForm.consentStats) {
      setStepError('É necessário autorizar o uso estatístico dos dados.')
      return false
    }

    setStepError('')
    return true
  }

  const validateCurrentStep = () => {
    const isStepValid =
      view === 'minor-flow'
        ? validateMinorStep()
        : view === 'adult-flow'
          ? validateAdultStep()
          : view === 'institution-flow'
            ? validateInstitutionRealStep()
            : true

    if (!isStepValid) {
      return false
    }

    if (currentStep === totalSteps - 1 && antiBotEnabled && !captchaToken) {
      setStepError('Conclua a verificação de segurança antes de enviar o cadastro.')
      return false
    }

    return true
  }

  const submitMinorFlow = async () => {
    const selectedCity = minorCityOptions.find((item) => item.name === minorForm.city)
    const modalityIds = minorModalities
      .filter((item) => minorForm.danceModalities.includes(item.name))
      .map((item) => item.id)
    const contentIds = minorContents
      .filter((item) => minorForm.consumedContents.includes(item.name))
      .map((item) => item.id)

    if (!selectedCity) {
      setStepError('Selecione uma cidade válida na lista.')
      return
    }

    if (!activeConsentTerm) {
      setStepError('Nenhum termo de consentimento ativo foi encontrado.')
      return
    }

    setIsMinorSubmitting(true)
    setStepError('')

    try {
      const response = await submitYouthForm(
        {
          fullName: normalizeTextValue(minorForm.fullName),
          cpf: normalizeOptionalDigitsValue(minorForm.cpf),
          email: normalizeTextValue(minorForm.email),
          whatsapp: normalizeDigits(minorForm.whatsapp),
          region: normalizeOptionalTextValue(minorForm.region),
          age: Number(minorForm.age || 0) || null,
          birthDate: minorForm.birthDate,
          gender: normalizeOptionalTextValue(minorForm.gender),
          cityId: selectedCity.id,
          modalityIds,
          practiceTime: normalizeTextValue(minorForm.practiceTime),
          careerInterest: parseBooleanChoice(minorForm.careerInterest),
          whoPaysExpenses: normalizeTextList(minorForm.whoPays).join(', '),
          familyIncomeRange: normalizeTextValue(minorForm.familyIncome),
          monthlyFee: normalizeOptionalTextValue(minorForm.monthlyFee),
          monthlyCostSchool: normalizeOptionalTextValue(minorForm.schoolFee),
          monthlyCostCourses: normalizeOptionalTextValue(minorForm.courses),
          monthlyCostCostumes: normalizeOptionalTextValue(minorForm.costumes),
          monthlyCostFestivals: normalizeOptionalTextValue(minorForm.festivals),
          monthlyCostTravel: normalizeOptionalTextValue(minorForm.travel),
          monthlyCostOthers: normalizeOptionalTextValue(minorForm.otherCosts),
          searchesContent: parseBooleanChoice(minorForm.searchesContent),
          contentIds,
          consentCode: activeConsentTerm.code,
          consentAccepted: minorForm.consentStats,
          consentContact: minorForm.consentContact,
        },
        {
          headers: getAntiBotHeaders(),
        },
      )

      setMinorSubmission(response)
    } catch (error) {
      const resolvedError = resolveSubmissionError('minor-flow', error, currentStep)
      if (resolvedError) {
        setCurrentStep(resolvedError.step)
        setStepError(resolvedError.message)
      } else {
        setStepError('Não foi possível enviar o formulário de jovens.')
      }
    } finally {
      setIsMinorSubmitting(false)
    }
  }

  const submitAdultFlow = async () => {
    const selectedCity = adultCityOptions.find((item) => item.name === adultForm.city)
    const modalityIds = minorModalities
      .filter((item) => adultForm.danceModalities.includes(item.name))
      .map((item) => item.id)
    const contentIds = minorContents
      .filter((item) => adultForm.consumedContents.includes(item.name))
      .map((item) => item.id)

    if (!selectedCity) {
      setStepError('Selecione uma cidade válida na lista.')
      return
    }

    if (!activeConsentTerm) {
      setStepError('Nenhum termo de consentimento ativo foi encontrado.')
      return
    }

    setIsAdultSubmitting(true)
    setStepError('')

    try {
      const worksWithDance = parseBooleanChoice(adultForm.worksProfessionally)
      const response = await submitProfessionalForm({
        fullName: normalizeTextValue(adultForm.fullName),
        cpf: normalizeOptionalDigitsValue(adultForm.cpf),
        email: normalizeTextValue(adultForm.email),
        whatsapp: normalizeDigits(adultForm.whatsapp),
        region: normalizeOptionalTextValue(adultForm.region),
        age: Number(adultForm.age || 0) || null,
        ageRange: adultForm.age ? `${adultForm.age} anos` : null,
        birthDate: adultForm.birthDate,
        gender: normalizeOptionalTextValue(adultForm.gender),
        cityId: selectedCity.id,
        modalityIds,
        contentIds,
        practiceTime: normalizeTextValue(adultForm.practiceTime),
        worksWithDance,
        hasDrt: parseBooleanChoice(adultForm.hasDrt),
        currentlyWorks: parseBooleanChoice(adultForm.currentlyWorks),
        danceMainIncome: parseBooleanChoice(adultForm.danceMainIncomeChoice),
        hasOtherIncome: parseBooleanChoice(adultForm.hasOtherIncomeChoice),
        totalIncome: parseNumericSelection(adultForm.monthlyIncomeTotal),
        danceIncome: parseNumericSelection(adultForm.danceIncome),
        careerInterest: parseBooleanChoice(adultForm.careerInterest),
        householdIncomeRange: normalizeOptionalTextValue(adultForm.familyIncome),
        rolesPerformed: normalizeTextList(adultForm.danceRoles).join(', ') || null,
        workType: normalizeTextValue(adultForm.workTypeChoice),
        coursesPerYear: Number(adultForm.presentialCoursesPerYear || 0),
        onlineCoursesPerYear: Number(adultForm.onlineCoursesPerYear || 0),
        currentlyStudies: parseBooleanChoice(adultForm.studiesDanceNow),
        academicEducation: normalizeOptionalTextValue(adultForm.academicEducation),
        formalStudyType: normalizeOptionalTextValue(adultForm.danceEducationLevel),
        wantsFormalStudy: parseBooleanChoice(adultForm.wantsFormalDanceStudy),
        monthlyCostCourses: parseNumericSelection(adultForm.courses),
        monthlyCostCostumes: parseNumericSelection(adultForm.costumes),
        monthlyCostEvents: parseNumericSelection(adultForm.festivals),
        monthlyCostTravel: parseNumericSelection(adultForm.travel),
        monthlyCostSchool: parseNumericSelection(adultForm.schoolFee),
        monthlyCostOthers: parseNumericSelection(adultForm.otherCosts),
        costResponsibility: normalizeTextList(adultForm.whoPays).join(', '),
        participatedInEdital: parseBooleanChoice(adultForm.participatedPublicCalls),
        approvedInEdital: parseBooleanChoice(adultForm.wasSelected),
        appliedNotApproved: parseBooleanChoice(adultForm.appliedNotSelected),
        participatedInEditalStatus: normalizeOptionalTextValue(adultForm.participatedPublicCalls),
        approvedInEditalStatus: normalizeOptionalTextValue(adultForm.wasSelected),
        appliedNotApprovedStatus: normalizeOptionalTextValue(adultForm.appliedNotSelected),
        editalDifficulty: normalizeOptionalTextValue(adultForm.editalDifficulty),
        searchesContent: parseBooleanChoice(adultForm.searchesContent),
        consentCode: activeConsentTerm.code,
        consentAccepted: adultForm.consentStats,
        consentContact: adultForm.consentContact,
      })

      setAdultSubmission(response)
    } catch (error) {
      const resolvedError = resolveSubmissionError('adult-flow', error, currentStep)
      if (resolvedError) {
        setCurrentStep(resolvedError.step)
        setStepError(resolvedError.message)
      } else {
        setStepError('Não foi possível enviar o formulário profissional.')
      }
    } finally {
      setIsAdultSubmitting(false)
    }
  }

  const submitInstitutionFlow = async () => {
    const selectedCity = institutionCityOptions.find((item) => item.name === institutionForm.city)
    const modalityIds = minorModalities
      .filter((item) => institutionForm.danceModalities.includes(item.name))
      .map((item) => item.id)

    if (!selectedCity) {
      setStepError('Selecione uma cidade válida na lista.')
      return
    }

    if (!activeConsentTerm) {
      setStepError('Nenhum termo de consentimento ativo foi encontrado.')
      return
    }

    setIsInstitutionSubmitting(true)
    setStepError('')

    try {
      const numberOfRooms = parseNumericSelection(institutionForm.numberOfRooms)
      const averageStudents = parseNumericSelection(institutionForm.averageStudents)
      const numberOfTeachers = parseNumericSelection(institutionForm.numberOfTeachers)
      const classesPerWeek = parseNumericSelection(institutionForm.classesPerWeek)
      const monthlyFee = parseNumericSelection(institutionForm.monthlyFee)
      const cltEmployees = parseNumericSelection(institutionForm.cltEmployees)
      const pjContracts = parseNumericSelection(institutionForm.pjContracts)
      const monthlyRevenue = parseNumericSelection(institutionForm.monthlyRevenue)
      const numberOfStaff = parseNumericSelection(institutionForm.numberOfStaff)
      const activeStudents = parseNumericSelection(institutionForm.activeStudents)
      const monthlyAudience = parseNumericSelection(institutionForm.monthlyAudience)
      const averageAudienceCapacity = parseNumericSelection(institutionForm.averageAudienceCapacity)
      const hasOwnHeadquarters = parseBooleanChoice(institutionForm.hasOwnHeadquarters)
      const rentedHeadquarters = parseBooleanChoice(institutionForm.rentedHeadquarters)
      const usesPublicSpace = parseBooleanChoice(institutionForm.usesPublicSpace)
      const actsInPeriphery = parseBooleanChoice(institutionForm.actsInPeriphery)
      const actsInRuralArea = parseBooleanChoice(institutionForm.actsInRuralArea)

      const response = await submitInstitutionForm({
        responsibleName: normalizeTextValue(institutionForm.responsibleName),
        legalName: normalizeTextValue(institutionForm.institutionName),
        tradeName: normalizeTextValue(institutionForm.tradeName),
        cnpj: institutionForm.hasCnpj === 'sim' ? normalizeOptionalDigitsValue(institutionForm.cnpj) : null,
        region: normalizeOptionalTextValue(institutionForm.region),
        cityId: selectedCity.id,
        email: normalizeTextValue(institutionForm.email),
        phone: normalizeDigits(institutionForm.whatsapp),
        socialMedia: normalizeOptionalTextValue(institutionForm.socialMedia),
        type: normalizeTextValue(institutionForm.institutionType),
        legalNature: normalizeOptionalTextValue(institutionForm.legalNature),
        nature: normalizeTextValue(institutionForm.institutionNature),
        locationType: normalizeTextValue(institutionForm.locationType),
        foundationYear: Number(institutionForm.foundationYearExact),
        modalityIds,
        numberOfTeachers,
        averageStudents,
        monthlyFee,
        classesPerWeek,
        numberOfRooms,
        spaceType: normalizeTextValue(institutionForm.spaceType),
        infrastructureItems: normalizeTextList(institutionForm.infrastructureItems).join(', ') || null,
        hasCnpj: parseBooleanChoice(institutionForm.hasCnpj),
        hasScholarShip: parseBooleanChoice(institutionForm.hasScholarShip),
        scholarshipCount:
          institutionForm.hasScholarShip === 'sim'
            ? parseNumericSelection(institutionForm.scholarshipCount)
            : null,
        studentsPayMonthlyFee: parseBooleanChoice(institutionForm.studentsPayMonthlyFee),
        cltEmployees,
        pjContracts,
        monthlyRevenue,
        usesManagementSystem: parseBooleanChoice(institutionForm.usesManagementSystem),
        mainChallenges: normalizeTextValue(institutionForm.mainChallenges),
        eventCostResponsibility: normalizeOptionalTextValue(institutionForm.eventCostResponsibility),
        staffRoles: normalizeTextList(institutionForm.staffRoles).join(', ') || null,
        actsInPeriphery,
        actsInRuralArea,
        hasOwnHeadquarters,
        rentedHeadquarters,
        usesPublicSpace,
        averageAudienceCapacity,
        activeStudents,
        numberOfStaff,
        monthlyAudience,
        servesVulnerablePopulation: parseBooleanChoice(institutionForm.servesVulnerablePopulation),
        mainIncomeSources: normalizeTextList(institutionForm.mainIncomeSources).join(', '),
        receivedPublicFundingLast2Years: parseBooleanChoice(
          institutionForm.receivedPublicFundingLast2Years,
        ),
        registeredInPublicCalls: parseBooleanChoice(institutionForm.registeredInPublicCalls),
        approvedInPublicCalls: parseBooleanChoice(institutionForm.approvedInPublicCalls),
        editalDifficulties: normalizeTextList(institutionForm.editalDifficulties).join(', ') || null,
        annualBudgetRange: normalizeTextValue(institutionForm.annualBudgetRange),
        knowsMunicipalCulturePlan: parseBooleanChoice(institutionForm.knowsMunicipalCulturePlan),
        participatesInCultureCouncil: parseBooleanChoice(institutionForm.participatesInCultureCouncil),
        interestedInPublicPartnerships: parseBooleanChoice(
          institutionForm.interestedInPublicPartnerships,
        ),
        knowsPublicPolicyAccessMechanisms: parseBooleanChoice(
          institutionForm.knowsPublicPolicyAccessMechanisms,
        ),
        promotionChannels: normalizeTextList(institutionForm.promotionChannels).join(', '),
        wouldUseFreePromotionPlatform: parseBooleanChoice(
          institutionForm.wouldUseFreePromotionPlatform,
        ),
        consentCode: activeConsentTerm.code,
        consentAccepted: institutionForm.consentStats,
        consentContact: institutionForm.consentContact,
      })

      setInstitutionSubmission(response)
    } catch (error) {
      const resolvedError = resolveSubmissionError('institution-flow', error, currentStep)
      if (resolvedError) {
        setCurrentStep(resolvedError.step)
        setStepError(resolvedError.message)
      } else {
        setStepError('Não foi possível enviar o formulário institucional.')
      }
    } finally {
      setIsInstitutionSubmitting(false)
    }
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) return

    if (currentStep < totalSteps - 1) {
      startStepTransition(() => {
        setCurrentStep((prev) => prev + 1)
      })
      return
    }

    if (view === 'minor-flow') {
      await submitMinorFlow()
      return
    }

    if (view === 'adult-flow') {
      await submitAdultFlow()
      return
    }

    if (view === 'institution-flow') {
      await submitInstitutionFlow()
      return
    }

    if (currentMeta) {
      onSelect?.(currentMeta.selectLabel)
    }

    handleClose()
  }

  const renderChoiceCard = (
    value: string,
    currentValue: string,
    onClick: (value: string) => void
  ) => {
    const selected = currentValue === value

    return (
      <button
        type="button"
        className={`access-choice-card ${selected ? 'is-selected' : ''}`}
        onClick={() => onClick(value)}
      >
        {value === 'sim'
          ? 'Sim'
          : value === 'nao'
            ? 'Não'
            : value === 'nao_sei_como_faz'
              ? 'Não sei como faz'
              : value === 'nao_sei_o_que_e'
                ? 'Não sei o que é'
                : t(value)}
      </button>
    )
  }

  const renderMinorRealStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Nome completo *</span>
              <input
                type="text"
                placeholder="Nome completo do(a) jovem"
                value={minorForm.fullName}
                onChange={(e) => updateMinorField('fullName', e.target.value)}
              />
            </label>

            <label className="access-field">
              <span>CPF (opcional)</span>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={minorForm.cpf}
                onChange={(e) => updateMinorField('cpf', e.target.value)}
              />
            </label>

            <label className="access-field">
              <span>Email *</span>
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={minorForm.email}
                onChange={(e) => updateMinorField('email', e.target.value)}
              />
            </label>

            <label className="access-field">
              <span>WhatsApp *</span>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={minorForm.whatsapp}
                onChange={(e) => updateMinorField('whatsapp', e.target.value)}
              />
            </label>
          </div>
        )
      case 1:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Região *</span>
              <select value={minorForm.region} onChange={(e) => updateMinorField('region', e.target.value)}>
                <option value="">Selecione a região</option>
                {renderRegionOptions()}
              </select>
            </label>

            <label className="access-field">
              <span>Estado *</span>
              <select value={minorForm.state} onChange={(e) => updateMinorField('state', e.target.value)}>
                <option value="">Selecione o estado</option>
                {renderBrazilStateOptions()}
              </select>
            </label>

            <label className="access-field">
              <span>Cidade *</span>
              <select
                value={minorForm.city}
                onChange={(e) => updateMinorField('city', e.target.value)}
                disabled={!minorForm.state}
              >
                <option value="">{minorForm.state ? 'Selecione a cidade' : 'Selecione um estado primeiro'}</option>
                {minorCityOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )
      case 2:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Data de nascimento *</span>
              <input
                type="date"
                value={minorForm.birthDate}
                min={earliestBirthDate}
                max={youthBirthDateMax}
                onChange={(e) => updateMinorField('birthDate', e.target.value)}
              />
            </label>

            <label className="access-field">
              <span>Idade *</span>
              <input
                type="number"
                min="0"
                max="17"
                value={minorForm.age}
                onChange={(e) => updateMinorField('age', e.target.value)}
              />
            </label>

            <label className="access-field">
              <span>Identidade de gênero (opcional)</span>
              <select value={minorForm.gender} onChange={(e) => updateMinorField('gender', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(genderIdentityOptions)}
              </select>
            </label>

            <label className="access-field">
              <span>Tempo de prática na dança *</span>
              <select value={minorForm.practiceTime} onChange={(e) => updateMinorField('practiceTime', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(minorPracticeTimeOptions)}
              </select>
            </label>

            <div className="access-field access-field-full">
              <span>Modalidades de dança *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid">
                {minorModalities.map((item) => (
                  <label key={item.id} className="access-check-card">
                    <input
                      type="checkbox"
                      checked={minorForm.danceModalities.includes(item.name)}
                      onChange={() => toggleMinorArrayValue('danceModalities', item.name)}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Faixa de renda familiar *</span>
              <select
                value={minorForm.familyIncome}
                onChange={(e) => updateMinorField('familyIncome', e.target.value)}
              >
                <option value="">Selecione</option>
                {renderSelectOptions(householdIncomeOptions)}
              </select>
            </label>
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Economia da dança</span>
              <small>Preencha os custos que ajudam a entender a prática da dança.</small>
            </div>

            <label className="access-field">
              <span>Mensalidade</span>
              <input type="text" inputMode="decimal" placeholder="Ex: R$ 180,00" value={minorForm.monthlyFee} onChange={(e) => updateMinorField('monthlyFee', e.target.value)} />
            </label>

            <label className="access-field">
              <span>Gasto com escola ou academia</span>
              <input type="text" inputMode="decimal" placeholder="Ex: R$ 120,00" value={minorForm.schoolFee} onChange={(e) => updateMinorField('schoolFee', e.target.value)} />
            </label>

            <label className="access-field">
              <span>Gasto com cursos e formações</span>
              <input type="text" inputMode="decimal" placeholder="Ex: R$ 80,00" value={minorForm.courses} onChange={(e) => updateMinorField('courses', e.target.value)} />
            </label>

            <label className="access-field">
              <span>Gasto com figurinos e acessórios</span>
              <input type="text" inputMode="decimal" placeholder="Ex: R$ 60,00" value={minorForm.costumes} onChange={(e) => updateMinorField('costumes', e.target.value)} />
            </label>

            <label className="access-field">
              <span>Gasto com festivais e competições</span>
              <input type="text" inputMode="decimal" placeholder="Ex: R$ 90,00" value={minorForm.festivals} onChange={(e) => updateMinorField('festivals', e.target.value)} />
            </label>

            <label className="access-field">
              <span>Gasto com viagens e deslocamentos</span>
              <input type="text" inputMode="decimal" placeholder="Ex: R$ 70,00" value={minorForm.travel} onChange={(e) => updateMinorField('travel', e.target.value)} />
            </label>

            <label className="access-field">
              <span>Outros gastos com dança</span>
              <input type="text" placeholder="Ex: R$ 50" value={minorForm.otherCosts} onChange={(e) => updateMinorField('otherCosts', e.target.value)} />
            </label>

            <div className="access-field">
              <span>Tem interesse em seguir carreira na dança? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', minorForm.careerInterest, (value) => updateMinorField('careerInterest', value))}
                {renderChoiceCard('nao', minorForm.careerInterest, (value) => updateMinorField('careerInterest', value))}
              </div>
            </div>

            <div className="access-field">
              <span>Pesquisa conteúdos sobre dança na internet? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', minorForm.searchesContent, (value) => updateMinorField('searchesContent', value))}
                {renderChoiceCard('nao', minorForm.searchesContent, (value) => updateMinorField('searchesContent', value))}
              </div>
            </div>

            <div className="access-field access-field-full">
              <span>Quem banca os custos da dança? *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {youthWhoPaysOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input
                      type="checkbox"
                      checked={minorForm.whoPays.includes(item)}
                      onChange={() => toggleMinorArrayValue('whoPays', item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {minorForm.searchesContent === 'sim' ? (
              <div className="access-field access-field-full">
                <span>Quais conteudos costuma consumir?</span>
                <small>Selecione todas as opcoes que se aplicam</small>
                <div className="access-checkbox-grid access-checkbox-grid-compact">
                  {minorContents.map((item) => (
                    <label key={item.id} className="access-check-card">
                      <input
                        type="checkbox"
                        checked={minorForm.consumedContents.includes(item.name)}
                        onChange={() => toggleMinorArrayValue('consumedContents', item.name)}
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      case 5:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Consentimento LGPD</span>
              {activeConsentTerm ? <small>{activeConsentTerm.title}</small> : null}
            </div>

            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>
                  Autorizo o uso estatístico e anonimizado dos dados fornecidos para fins de pesquisa, políticas públicas e desenvolvimento do setor da dança.
                </strong>
                <small>É necessário autorizar o uso estatístico.</small>
              </div>
              <input
                type="checkbox"
                checked={minorForm.consentStats}
                onChange={(e) => updateMinorField('consentStats', e.target.checked)}
              />
            </label>

            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>
                  Autorizo o contato por email e WhatsApp para informações sobre o SIBRADANÇA e oportunidades no setor da dança.
                </strong>
                <small>Opcional</small>
              </div>
              <input
                type="checkbox"
                checked={minorForm.consentContact}
                onChange={(e) => updateMinorField('consentContact', e.target.checked)}
              />
            </label>
          </div>
        )
      default:
        return null
    }
  }

  const renderAdultRealStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Nome completo *</span>
              <input type="text" placeholder="Seu nome completo" value={adultForm.fullName} onChange={(e) => updateAdultField('fullName', e.target.value)} />
            </label>
            <label className="access-field">
              <span>CPF (opcional)</span>
              <input type="text" placeholder="000.000.000-00" value={adultForm.cpf} onChange={(e) => updateAdultField('cpf', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Email *</span>
              <input type="email" placeholder="email@exemplo.com" value={adultForm.email} onChange={(e) => updateAdultField('email', e.target.value)} />
            </label>
            <label className="access-field">
              <span>WhatsApp *</span>
              <input type="text" placeholder="(11) 99999-9999" value={adultForm.whatsapp} onChange={(e) => updateAdultField('whatsapp', e.target.value)} />
            </label>
          </div>
        )
      case 1:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Região *</span>
              <select value={adultForm.region} onChange={(e) => updateAdultField('region', e.target.value)}>
                <option value="">Selecione a região</option>
                {renderRegionOptions()}
              </select>
            </label>
            <label className="access-field">
              <span>Estado *</span>
              <select value={adultForm.state} onChange={(e) => updateAdultField('state', e.target.value)}>
                <option value="">Selecione o estado</option>
                {renderBrazilStateOptions()}
              </select>
            </label>
            <label className="access-field">
              <span>Cidade *</span>
              <select
                value={adultForm.city}
                onChange={(e) => updateAdultField('city', e.target.value)}
                disabled={!adultForm.state}
              >
                <option value="">{adultForm.state ? 'Selecione a cidade' : 'Selecione um estado primeiro'}</option>
                {adultCityOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )
      case 2:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Data de nascimento *</span>
              <input
                type="date"
                value={adultForm.birthDate}
                min={earliestBirthDate}
                max={adultBirthDateMax}
                onChange={(e) => updateAdultField('birthDate', e.target.value)}
              />
            </label>
            <label className="access-field">
              <span>Idade *</span>
              <input type="number" min="18" max="99" value={adultForm.age} onChange={(e) => updateAdultField('age', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Identidade de gênero (opcional)</span>
              <select value={adultForm.gender} onChange={(e) => updateAdultField('gender', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(genderIdentityOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Tempo de prática na dança *</span>
              <select value={adultForm.practiceTime} onChange={(e) => updateAdultField('practiceTime', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(minorPracticeTimeOptions)}
              </select>
            </label>
            <div className="access-field access-field-full">
              <span>Modalidades de dança *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid">
                {minorModalities.map((item) => (
                  <label key={item.id} className="access-check-card">
                    <input type="checkbox" checked={adultForm.danceModalities.includes(item.name)} onChange={() => toggleAdultArrayValue('danceModalities', item.name)} />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="access-form-grid">
            <div className="access-field">
              <span>Atua profissionalmente com dança? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.worksProfessionally, (value) => updateAdultField('worksProfessionally', value))}
                {renderChoiceCard('nao', adultForm.worksProfessionally, (value) => updateAdultField('worksProfessionally', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Possui DRT? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.hasDrt, (value) => updateAdultField('hasDrt', value))}
                {renderChoiceCard('nao', adultForm.hasDrt, (value) => updateAdultField('hasDrt', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Atua atualmente na dança? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.currentlyWorks, (value) => updateAdultField('currentlyWorks', value))}
                {renderChoiceCard('nao', adultForm.currentlyWorks, (value) => updateAdultField('currentlyWorks', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Pretende seguir carreira na dança? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.careerInterest, (value) => updateAdultField('careerInterest', value))}
                {renderChoiceCard('nao', adultForm.careerInterest, (value) => updateAdultField('careerInterest', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Funções na dança *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid">
                {adultRolesOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={adultForm.danceRoles.includes(item)} onChange={() => toggleAdultArrayValue('danceRoles', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="access-field">
              <span>Tipo de atuação *</span>
              <select value={adultForm.workTypeChoice} onChange={(e) => updateAdultField('workTypeChoice', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(adultWorkTypeOptions)}
              </select>
            </label>
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Renda média salarial da sua casa *</span>
              <select value={adultForm.familyIncome} onChange={(e) => updateAdultField('familyIncome', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(householdIncomeOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Renda média mensal total (R$) *</span>
              <input type="text" inputMode="decimal" placeholder="Ex: 2500,00" value={adultForm.monthlyIncomeTotal} onChange={(e) => updateAdultField('monthlyIncomeTotal', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Renda mensal média exclusivamente com a dança (R$) *</span>
              <input type="text" inputMode="decimal" placeholder="Ex: 1200,00" value={adultForm.danceIncome} onChange={(e) => updateAdultField('danceIncome', e.target.value)} />
            </label>
            <div className="access-field">
              <span>A dança é sua renda principal? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.danceMainIncomeChoice, (value) => updateAdultField('danceMainIncomeChoice', value))}
                {renderChoiceCard('nao', adultForm.danceMainIncomeChoice, (value) => updateAdultField('danceMainIncomeChoice', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Possui outra fonte de renda? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.hasOtherIncomeChoice, (value) => updateAdultField('hasOtherIncomeChoice', value))}
                {renderChoiceCard('nao', adultForm.hasOtherIncomeChoice, (value) => updateAdultField('hasOtherIncomeChoice', value))}
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Gastos médios mensais com dança (estimativa em R$)</span>
              <small>Preencha os valores mensais de cada categoria.</small>
            </div>
            <label className="access-field"><span>Mensalidade de escola ou grupo</span><input type="text" inputMode="decimal" placeholder="Ex: 180,00" value={adultForm.schoolFee} onChange={(e) => updateAdultField('schoolFee', e.target.value)} /></label>
            <label className="access-field"><span>Cursos e formações</span><input type="text" inputMode="decimal" placeholder="Ex: 120,00" value={adultForm.courses} onChange={(e) => updateAdultField('courses', e.target.value)} /></label>
            <label className="access-field"><span>Figurinos e acessórios</span><input type="text" inputMode="decimal" placeholder="Ex: 90,00" value={adultForm.costumes} onChange={(e) => updateAdultField('costumes', e.target.value)} /></label>
            <label className="access-field"><span>Festivais e competições</span><input type="text" inputMode="decimal" placeholder="Ex: 140,00" value={adultForm.festivals} onChange={(e) => updateAdultField('festivals', e.target.value)} /></label>
            <label className="access-field"><span>Viagens e deslocamentos</span><input type="text" inputMode="decimal" placeholder="Ex: 110,00" value={adultForm.travel} onChange={(e) => updateAdultField('travel', e.target.value)} /></label>
            <label className="access-field"><span>Outros</span><input type="text" inputMode="decimal" placeholder="Ex: 60,00" value={adultForm.otherCosts} onChange={(e) => updateAdultField('otherCosts', e.target.value)} /></label>
            <div className="access-field access-field-full">
              <span>Quem banca os custos da dança?</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {adultWhoPaysOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={adultForm.whoPays.includes(item)} onChange={() => toggleAdultArrayValue('whoPays', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Você pesquisa conteúdos sobre dança na internet?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.searchesContent, (value) => updateAdultField('searchesContent', value))}
                {renderChoiceCard('nao', adultForm.searchesContent, (value) => updateAdultField('searchesContent', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Conteudos que costuma consumir</span>
              <small>Selecione todas as opcoes que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {minorContents.map((item) => (
                  <label key={item.id} className="access-check-card">
                    <input type="checkbox" checked={adultForm.consumedContents.includes(item.name)} onChange={() => toggleAdultArrayValue('consumedContents', item.name)} />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Formacao academica *</span>
              <select value={adultForm.academicEducation} onChange={(e) => updateAdultField('academicEducation', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Ensino fundamental incompleto">Ensino fundamental incompleto</option>
                <option value="Ensino fundamental completo">Ensino fundamental completo</option>
                <option value="Ensino medio incompleto">Ensino medio incompleto</option>
                <option value="Ensino medio completo">Ensino medio completo</option>
                <option value="Ensino superior incompleto">Ensino superior incompleto</option>
                <option value="Ensino superior completo">Ensino superior completo</option>
                <option value="Pos-graduacao">Pos-graduacao</option>
                <option value="Mestrado">Mestrado</option>
                <option value="Doutorado">Doutorado</option>
              </select>
            </label>
            <label className="access-field">
              <span>Já estudou ou estuda dança formalmente?</span>
              <select value={adultForm.danceEducationLevel} onChange={(e) => updateAdultField('danceEducationLevel', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Curso livre">Curso livre</option>
                <option value="Técnico">Técnico</option>
                <option value="Graduação">Graduação</option>
                <option value="Pós-graduação">Pós-graduação</option>
                <option value="Ainda não">Ainda não</option>
              </select>
            </label>
            <div className="access-field">
              <span>Estuda dança atualmente?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.studiesDanceNow, (value) => updateAdultField('studiesDanceNow', value))}
                {renderChoiceCard('nao', adultForm.studiesDanceNow, (value) => updateAdultField('studiesDanceNow', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Pretende estudar dança formalmente?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.wantsFormalDanceStudy, (value) => updateAdultField('wantsFormalDanceStudy', value))}
                {renderChoiceCard('nao', adultForm.wantsFormalDanceStudy, (value) => updateAdultField('wantsFormalDanceStudy', value))}
              </div>
            </div>
            <label className="access-field"><span>Cursos presenciais por ano</span><input type="number" min="0" value={adultForm.presentialCoursesPerYear} onChange={(e) => updateAdultField('presentialCoursesPerYear', e.target.value)} /></label>
            <label className="access-field"><span>Cursos online por ano</span><input type="number" min="0" value={adultForm.onlineCoursesPerYear} onChange={(e) => updateAdultField('onlineCoursesPerYear', e.target.value)} /></label>
          </div>
        )
      case 7:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Ja participou de editais publicos? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.participatedPublicCalls, (value) => updateAdultField('participatedPublicCalls', value))}
                {renderChoiceCard('nao', adultForm.participatedPublicCalls, (value) => updateAdultField('participatedPublicCalls', value))}
                {renderChoiceCard('nao_sei_como_faz', adultForm.participatedPublicCalls, (value) => updateAdultField('participatedPublicCalls', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Foi contemplado(a)?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.wasSelected, (value) => updateAdultField('wasSelected', value))}
                {renderChoiceCard('nao', adultForm.wasSelected, (value) => updateAdultField('wasSelected', value))}
                {renderChoiceCard('nao_sei_o_que_e', adultForm.wasSelected, (value) => updateAdultField('wasSelected', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Se inscreveu e não foi contemplado(a)?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.appliedNotSelected, (value) => updateAdultField('appliedNotSelected', value))}
                {renderChoiceCard('nao', adultForm.appliedNotSelected, (value) => updateAdultField('appliedNotSelected', value))}
                {renderChoiceCard('nao_sei_o_que_e', adultForm.appliedNotSelected, (value) => updateAdultField('appliedNotSelected', value))}
              </div>
            </div>
            <label className="access-field access-field-full">
              <span>Quais dificuldades você encontra para participar de editais?</span>
              <textarea rows={4} placeholder="Descreva as principais dificuldades encontradas." value={adultForm.editalDifficulty} onChange={(e) => updateAdultField('editalDifficulty', e.target.value)} />
            </label>
          </div>
        )
      case 8:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Consentimento LGPD</span>
              {activeConsentTerm ? <small>{activeConsentTerm.title}</small> : null}
            </div>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o uso estatístico e anonimizado dos dados fornecidos para fins de pesquisa, políticas públicas e desenvolvimento do setor da dança.</strong>
                <small>É necessário autorizar o uso estatístico.</small>
              </div>
              <input type="checkbox" checked={adultForm.consentStats} onChange={(e) => updateAdultField('consentStats', e.target.checked)} />
            </label>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o contato por email e WhatsApp para informações sobre o SIBRADANÇA e oportunidades no setor da dança.</strong>
                <small>Opcional</small>
              </div>
              <input type="checkbox" checked={adultForm.consentContact} onChange={(e) => updateAdultField('consentContact', e.target.checked)} />
            </label>
          </div>
        )
      default:
        return null
    }
  }

  const renderInstitutionRealStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Nome completo do responsável *</span>
              <input type="text" placeholder="Seu nome completo" value={institutionForm.responsibleName} onChange={(e) => updateInstitutionField('responsibleName', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Email institucional *</span>
              <input type="email" placeholder="email@instituicao.com" value={institutionForm.email} onChange={(e) => updateInstitutionField('email', e.target.value)} />
            </label>
            <label className="access-field">
              <span>WhatsApp institucional *</span>
              <input type="text" placeholder="(11) 99999-9999" value={institutionForm.whatsapp} onChange={(e) => updateInstitutionField('whatsapp', e.target.value)} />
            </label>
          </div>
        )
      case 1:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Razão social *</span>
              <input type="text" placeholder="Nome jurídico da instituição" value={institutionForm.institutionName} onChange={(e) => updateInstitutionField('institutionName', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Nome fantasia *</span>
              <input type="text" placeholder="Nome público da escola, grupo ou companhia" value={institutionForm.tradeName} onChange={(e) => updateInstitutionField('tradeName', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Tipo de atuação *</span>
              <select value={institutionForm.institutionType} onChange={(e) => updateInstitutionField('institutionType', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(institutionTypeOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Natureza jurídica *</span>
              <select value={institutionForm.legalNature} onChange={(e) => updateInstitutionField('legalNature', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(institutionLegalNatureOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>A instituição é *</span>
              <select value={institutionForm.institutionNature} onChange={(e) => updateInstitutionField('institutionNature', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(institutionNatureOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Ano de fundação *</span>
              <input type="number" min="1900" max="2100" placeholder="Ex: 2014" value={institutionForm.foundationYearExact} onChange={(e) => updateInstitutionField('foundationYearExact', e.target.value)} />
            </label>
            <div className="access-field">
              <span>Possui CNPJ? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.hasCnpj, (value) => updateInstitutionField('hasCnpj', value))}
                {renderChoiceCard('nao', institutionForm.hasCnpj, (value) => updateInstitutionField('hasCnpj', value))}
              </div>
            </div>
            {institutionForm.hasCnpj === 'sim' && (
              <label className="access-field">
                <span>CNPJ *</span>
                <input type="text" placeholder="00.000.000/0000-00" value={institutionForm.cnpj} onChange={(e) => updateInstitutionField('cnpj', e.target.value)} />
              </label>
            )}
          </div>
        )
      case 2:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Região</span>
              <select value={institutionForm.region} onChange={(e) => updateInstitutionField('region', e.target.value)}>
                <option value="">Selecione a região</option>
                {renderRegionOptions()}
              </select>
            </label>
            <label className="access-field">
              <span>Estado *</span>
              <select value={institutionForm.state} onChange={(e) => updateInstitutionField('state', e.target.value)}>
                <option value="">Selecione o estado</option>
                {renderBrazilStateOptions()}
              </select>
            </label>
            <label className="access-field">
              <span>Cidade *</span>
              <select value={institutionForm.city} onChange={(e) => updateInstitutionField('city', e.target.value)} disabled={!institutionForm.state}>
                <option value="">{institutionForm.state ? 'Selecione a cidade' : 'Selecione o estado antes'}</option>
                {institutionCityOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="access-field">
              <span>Rede social / divulgação</span>
              <input type="text" placeholder="@perfil ou principal canal de divulgação" value={institutionForm.socialMedia} onChange={(e) => updateInstitutionField('socialMedia', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Tipo de localização *</span>
              <select value={institutionForm.locationType} onChange={(e) => updateInstitutionField('locationType', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(institutionLocationTypeOptions)}
              </select>
            </label>
          </div>
        )
      case 3:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Modalidades oferecidas *</span>
              <small>Selecione pelo menos uma</small>
              <div className="access-checkbox-grid">
                {minorModalities.map((item) => (
                  <label key={item.id} className="access-check-card">
                    <input type="checkbox" checked={institutionForm.danceModalities.includes(item.name)} onChange={() => toggleInstitutionArrayValue('danceModalities', item.name)} />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="access-field">
              <span>Número de salas *</span>
              <input type="number" min="0" placeholder="Ex: 3" value={institutionForm.numberOfRooms} onChange={(e) => updateInstitutionField('numberOfRooms', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Aulas por semana *</span>
              <input type="number" min="0" placeholder="Ex: 12" value={institutionForm.classesPerWeek} onChange={(e) => updateInstitutionField('classesPerWeek', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Tipo de espaço *</span>
              <select value={institutionForm.spaceType} onChange={(e) => updateInstitutionField('spaceType', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(institutionSpaceTypeOptions)}
              </select>
            </label>
            <div className="access-field access-field-full">
              <span>Infraestrutura disponível</span>
              <small>Selecione os itens presentes no espaço.</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {institutionInfrastructureOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={institutionForm.infrastructureItems.includes(item)} onChange={() => toggleInstitutionArrayValue('infrastructureItems', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Número de professores *</span>
              <input type="number" min="0" placeholder="Ex: 8" value={institutionForm.numberOfTeachers} onChange={(e) => updateInstitutionField('numberOfTeachers', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Média de alunos ativos *</span>
              <input type="number" min="0" placeholder="Ex: 120" value={institutionForm.averageStudents} onChange={(e) => updateInstitutionField('averageStudents', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Alunos ativos no momento</span>
              <input type="number" min="0" placeholder="Ex: 98" value={institutionForm.activeStudents} onChange={(e) => updateInstitutionField('activeStudents', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Mensalidade média (R$) *</span>
              <input type="text" inputMode="decimal" placeholder="Ex: 250,00" value={institutionForm.monthlyFee} onChange={(e) => updateInstitutionField('monthlyFee', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Capacidade média de público</span>
              <input type="number" min="0" placeholder="Ex: 80" value={institutionForm.averageAudienceCapacity} onChange={(e) => updateInstitutionField('averageAudienceCapacity', e.target.value)} />
            </label>
            <div className="access-field">
              <span>Possui bolsas? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.hasScholarShip, (value) => updateInstitutionField('hasScholarShip', value))}
                {renderChoiceCard('nao', institutionForm.hasScholarShip, (value) => updateInstitutionField('hasScholarShip', value))}
              </div>
            </div>
            {institutionForm.hasScholarShip === 'sim' ? (
              <label className="access-field">
                <span>Quantidade de bolsistas</span>
                <input type="number" min="0" placeholder="Ex: 12" value={institutionForm.scholarshipCount} onChange={(e) => updateInstitutionField('scholarshipCount', e.target.value)} />
              </label>
            ) : null}
            <div className="access-field">
              <span>Os alunos pagam mensalidade?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.studentsPayMonthlyFee, (value) => updateInstitutionField('studentsPayMonthlyFee', value))}
                {renderChoiceCard('nao', institutionForm.studentsPayMonthlyFee, (value) => updateInstitutionField('studentsPayMonthlyFee', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Atende população em situação de vulnerabilidade?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.servesVulnerablePopulation, (value) => updateInstitutionField('servesVulnerablePopulation', value))}
                {renderChoiceCard('nao', institutionForm.servesVulnerablePopulation, (value) => updateInstitutionField('servesVulnerablePopulation', value))}
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Funcionários CLT *</span>
              <input type="number" min="0" placeholder="Ex: 4" value={institutionForm.cltEmployees} onChange={(e) => updateInstitutionField('cltEmployees', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Contratos PJ *</span>
              <input type="number" min="0" placeholder="Ex: 3" value={institutionForm.pjContracts} onChange={(e) => updateInstitutionField('pjContracts', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Faturamento mensal médio (R$) *</span>
              <input type="text" inputMode="decimal" placeholder="Ex: 15000,00" value={institutionForm.monthlyRevenue} onChange={(e) => updateInstitutionField('monthlyRevenue', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Número total de pessoas na equipe</span>
              <input type="number" min="0" placeholder="Ex: 10" value={institutionForm.numberOfStaff} onChange={(e) => updateInstitutionField('numberOfStaff', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Público mensal</span>
              <input type="number" min="0" placeholder="Ex: 350" value={institutionForm.monthlyAudience} onChange={(e) => updateInstitutionField('monthlyAudience', e.target.value)} />
            </label>
            <div className="access-field">
              <span>Usa sistema de gestão? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.usesManagementSystem, (value) => updateInstitutionField('usesManagementSystem', value))}
                {renderChoiceCard('nao', institutionForm.usesManagementSystem, (value) => updateInstitutionField('usesManagementSystem', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Recebeu recurso público nos últimos 2 anos?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.receivedPublicFundingLast2Years, (value) => updateInstitutionField('receivedPublicFundingLast2Years', value))}
                {renderChoiceCard('nao', institutionForm.receivedPublicFundingLast2Years, (value) => updateInstitutionField('receivedPublicFundingLast2Years', value))}
              </div>
            </div>
            <label className="access-field">
              <span>Faixa de orçamento anual</span>
              <select value={institutionForm.annualBudgetRange} onChange={(e) => updateInstitutionField('annualBudgetRange', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Até R$ 50 mil">Até R$ 50 mil</option>
                <option value="R$ 50 mil a R$ 100 mil">R$ 50 mil a R$ 100 mil</option>
                <option value="R$ 100 mil a R$ 300 mil">R$ 100 mil a R$ 300 mil</option>
                <option value="R$ 300 mil a R$ 1 milhão">R$ 300 mil a R$ 1 milhão</option>
                <option value="Mais de R$ 1 milhão">Mais de R$ 1 milhão</option>
              </select>
            </label>
            <div className="access-field access-field-full">
              <span>Principais fontes de renda</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {institutionIncomeSourcesOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={institutionForm.mainIncomeSources.includes(item)} onChange={() => toggleInstitutionArrayValue('mainIncomeSources', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Quem arca com os custos dos eventos?</span>
              <select value={institutionForm.eventCostResponsibility} onChange={(e) => updateInstitutionField('eventCostResponsibility', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(institutionEventCostOptions)}
              </select>
            </label>
            <div className="access-field access-field-full">
              <span>Profissionais da estrutura</span>
              <small>Selecione todos que fazem parte da instituição.</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {institutionStaffRoleOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={institutionForm.staffRoles.includes(item)} onChange={() => toggleInstitutionArrayValue('staffRoles', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="access-field">
              <span>Já se cadastrou em editais públicos?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.registeredInPublicCalls, (value) => updateInstitutionField('registeredInPublicCalls', value))}
                {renderChoiceCard('nao', institutionForm.registeredInPublicCalls, (value) => updateInstitutionField('registeredInPublicCalls', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Já foi contemplada em edital?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.approvedInPublicCalls, (value) => updateInstitutionField('approvedInPublicCalls', value))}
                {renderChoiceCard('nao', institutionForm.approvedInPublicCalls, (value) => updateInstitutionField('approvedInPublicCalls', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Conhece os mecanismos de acesso a políticas públicas?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.knowsPublicPolicyAccessMechanisms, (value) => updateInstitutionField('knowsPublicPolicyAccessMechanisms', value))}
                {renderChoiceCard('nao', institutionForm.knowsPublicPolicyAccessMechanisms, (value) => updateInstitutionField('knowsPublicPolicyAccessMechanisms', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Usaria plataforma gratuita para divulgar aulas e eventos?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.wouldUseFreePromotionPlatform, (value) => updateInstitutionField('wouldUseFreePromotionPlatform', value))}
                {renderChoiceCard('nao', institutionForm.wouldUseFreePromotionPlatform, (value) => updateInstitutionField('wouldUseFreePromotionPlatform', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Conhece o plano municipal de cultura?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.knowsMunicipalCulturePlan, (value) => updateInstitutionField('knowsMunicipalCulturePlan', value))}
                {renderChoiceCard('nao', institutionForm.knowsMunicipalCulturePlan, (value) => updateInstitutionField('knowsMunicipalCulturePlan', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Participa de conselho de cultura?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.participatesInCultureCouncil, (value) => updateInstitutionField('participatesInCultureCouncil', value))}
                {renderChoiceCard('nao', institutionForm.participatesInCultureCouncil, (value) => updateInstitutionField('participatesInCultureCouncil', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Tem interesse em parcerias públicas?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.interestedInPublicPartnerships, (value) => updateInstitutionField('interestedInPublicPartnerships', value))}
                {renderChoiceCard('nao', institutionForm.interestedInPublicPartnerships, (value) => updateInstitutionField('interestedInPublicPartnerships', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Dificuldades com editais</span>
              <small>Selecione todas as dificuldades encontradas.</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {institutionEditalDifficultiesOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={institutionForm.editalDifficulties.includes(item)} onChange={() => toggleInstitutionArrayValue('editalDifficulties', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Canais de divulgação</span>
              <small>Selecione os canais utilizados pela instituição.</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {institutionPromotionChannelOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={institutionForm.promotionChannels.includes(item)} onChange={() => toggleInstitutionArrayValue('promotionChannels', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="access-field access-field-full">
              <span>Principal desafio da instituição *</span>
              <textarea rows={5} placeholder="Ex: captação de alunos, sustentabilidade financeira, estrutura, equipe, gestão..." value={institutionForm.mainChallenges} onChange={(e) => updateInstitutionField('mainChallenges', e.target.value)} />
            </label>
          </div>
        )
      case 7:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full"><span>Consentimento LGPD</span></div>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o uso estatístico e anonimizado dos dados institucionais fornecidos.</strong>
                <small>
                  {activeConsentTerm
                    ? activeConsentTerm.title
                    : 'É necessário autorizar o uso estatístico.'}
                </small>
              </div>
              <input type="checkbox" checked={institutionForm.consentStats} onChange={(e) => updateInstitutionField('consentStats', e.target.checked)} />
            </label>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o contato institucional por email e WhatsApp para informações sobre o SIBRADANÇA.</strong>
                <small>Opcional</small>
              </div>
              <input type="checkbox" checked={institutionForm.consentContact} onChange={(e) => updateInstitutionField('consentContact', e.target.checked)} />
            </label>
          </div>
        )
      default:
        return null
    }
  }

  const renderCurrentStep = () => {
    if (view === 'minor-flow') {
      return renderMinorRealStep()
    }
    if (view === 'adult-flow') {
      return renderAdultRealStep()
    }
    if (view === 'institution-flow') {
      return renderInstitutionRealStep()
    }
    return null
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="access-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className={`access-floating-panel ${view !== 'menu' ? 'is-form-mode' : ''}`}
            ref={panelRef}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="access-panel-top">
              <div className="access-panel-heading">
                {view === 'menu' ? (
                  <>
                    <Badge dark>Acesso</Badge>
                    <h3 className="access-panel-title">Escolha seu perfil</h3>
                    <p className="access-panel-text">
                      Selecione a opção que melhor representa você para abrir o formulário certo.
                    </p>
                  </>
                ) : (
                  <>
                    <button type="button" className="access-back-link" onClick={handleTopBack}>
                      Voltar
                    </button>
                    <p className="access-panel-sector">{currentMeta?.sector}</p>
                    <h3 className="access-panel-title">{currentMeta?.title}</h3>
                    <div className="access-progress-wrap">
                      <div className="access-progress-bar">
                        <div className="access-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="access-progress-label">Etapa {currentStep + 1} de {totalSteps}</span>
                    </div>
                  </>
                )}
              </div>

              <button type="button" className="access-close-btn" onClick={handleClose} aria-label="Fechar menu de acesso">
                <X size={18} />
              </button>
            </div>

            {view === 'menu' ? (
              <div className="access-options-grid">
                {accessOptions.map((item) => (
                  <button key={item.label} type="button" className={`access-option-card ${item.accentClass}`} onClick={() => handleOptionSelect(item.label)}>
                    <div className="access-option-accent" />
                    <div className="access-option-content">
                      <strong>{item.label}</strong>
                      <p>{item.description}</p>
                    </div>
                    <span className="access-option-icon">
                      <ChevronRight size={18} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="access-form-shell">
                {(minorSubmission && view === 'minor-flow') ||
                (adultSubmission && view === 'adult-flow') ||
                (institutionSubmission && view === 'institution-flow') ? (
                  <div className="access-form-grid">
                    <div className="access-field access-field-full">
                      <span>Cadastro enviado com sucesso</span>
                      <strong>Os dados foram recebidos com sucesso.</strong>
                      <small>Obrigado por contribuir com o mapeamento nacional da dança.</small>
                    </div>
                    <div className="access-form-actions">
                      <button type="button" className="access-action-btn is-primary" onClick={handleClose}>
                        Fechar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {renderCurrentStep()}
                    <label className="access-honeypot" aria-hidden="true">
                      <span>Campo de verificação</span>
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypotValue}
                        onChange={(event) => setHoneypotValue(event.target.value)}
                      />
                    </label>
                    {currentStep === totalSteps - 1 && antiBotEnabled ? (
                      <div className="access-security-card">
                        <span className="access-security-label">Confirmação de segurança</span>
                        <TurnstileWidget
                          key={captchaRenderKey}
                          siteKey={TURNSTILE_SITE_KEY}
                          onTokenChange={setCaptchaToken}
                        />
                        <small>Conclua a verificação para liberar o envio do cadastro.</small>
                      </div>
                    ) : null}
                    {stepError && <p className="access-step-error">{stepError}</p>}
                    <div className="access-form-actions">
                      <button type="button" className="access-action-btn is-secondary" onClick={handlePrevious}>
                        Anterior
                      </button>
                      <button
                        type="button"
                        className="access-action-btn is-primary"
                        onClick={handleNext}
                        disabled={
                          isMinorSubmitting ||
                          isAdultSubmitting ||
                          isInstitutionSubmitting ||
                          ((view === 'minor-flow' || view === 'adult-flow' || view === 'institution-flow') &&
                            isMinorLoadingReferences) ||
                          (currentStep === totalSteps - 1 && antiBotEnabled && !captchaToken) ||
                          isStepTransitionPending
                        }
                      >
                        {isMinorSubmitting || isAdultSubmitting || isInstitutionSubmitting
                          ? 'Enviando...'
                          : isStepTransitionPending
                            ? 'Abrindo...'
                          : currentStep === totalSteps - 1
                            ? 'Finalizar Cadastro'
                            : 'Próximo'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

