import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { Badge } from './Badge'
import { listCities, listStates } from '../services/geo.services'
import { submitInstitutionForm, submitProfessionalForm, submitYouthForm } from '../services/forms.service'
import { getActiveConsentTerm, listContents, listModalities } from '../services/reference.service'
import type { CityResponse, StateResponse } from '../types/geo'
import type { ActiveConsentTermResponse, ReferenceItemResponse } from '../types/reference'
import type {
  InstitutionFormResponse,
  ProfessionalFormResponse,
  YouthFormResponse,
} from '../types/forms'

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
  email: string
  whatsapp: string
  region: string
  state: string
  city: string
  ageRange: string
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
  email: string
  whatsapp: string
  region: string
  state: string
  city: string
  ageRange: string
  birthDate: string
  gender: string
  practiceTime: string
  danceModalities: string[]
  consumedContents: string[]
  worksProfessionally: string
  hasDrt: string
  currentlyWorks: string
  danceMainIncomeChoice: string
  hasOtherIncomeChoice: string
  danceRoles: string[]
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
  receivedPublicFundingLast2Years: string
  editalDifficulties: string[]
  annualBudgetRange: string
  knowsMunicipalCulturePlan: string
  participatesInCultureCouncil: string
  interestedInPublicPartnerships: string
  consentStats: boolean
  consentContact: boolean
}

type OptionItem = { value: string; label: string }

const accessOptions = [
  {
    label: 'Sou menor de 18 anos',
    description: 'Acesso para público jovem e participação orientada.',
    accentClass: 'is-yellow',
  },
  {
    label: 'Sou maior de 18 anos',
    description: 'Acesso individual para pessoas adultas.',
    accentClass: 'is-blue',
  },
  {
    label: 'Escola / Grupo / Companhia',
    description: 'Cadastro institucional e participação coletiva.',
    accentClass: 'is-pink',
  },
  {
    label: 'Estatísticas Nacionais',
    description: 'Visualização de dados e evidências do setor.',
    accentClass: 'is-green',
  },
] as const

const FLOW_META: Record<ActiveFlow, { sector: string; title: string; totalSteps: number; selectLabel: string }> = {
  'minor-flow': {
    sector: 'Setor 01 – Jovens da Dança',
    title: 'Menor de 18 anos • Tempo estimado: 4 minutos',
    totalSteps: 6,
    selectLabel: 'Sou menor de 18 anos',
  },
  'adult-flow': {
    sector: 'Setor 02 – Profissionais da Dança',
    title: 'Maior de 18 anos • Tempo estimado: 5–6 minutos',
    totalSteps: 9,
    selectLabel: 'Sou maior de 18 anos',
  },
  'institution-flow': {
    sector: 'Setor 03 – Instituições da Dança',
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

const danceModalitiesOptions = [
  'Ballet Clássico',
  'Dança Contemporânea',
  'Jazz',
  'Hip Hop / Street Dance',
  'Dança de Salão',
  'Danças Populares / Folclóricas',
  'Sapateado',
  'Flamenco',
  'Dança do Ventre',
  'Dança Afro',
  'Dança Urbana',
  'Improvisação',
  'Outra',
]

const whoPaysOptions = ['Você', 'Família', 'Escola', 'Edital', 'Patrocínio', 'Outros']

const adultRolesOptions = [
  'Bailarino(a)',
  'Professor(a)',
  'Coreógrafo(a)',
  'Diretor(a) artístico(a)',
  'Produtor(a)',
  'Pesquisador(a)',
  'Figurinista',
  'Iluminador(a)',
  'Sonoplasta / DJ',
  'Gestor(a) cultural',
  'Crítico(a) de dança',
  'Terapeuta corporal',
  'Outra',
]

const institutionTypeOptions: OptionItem[] = [
  { value: 'escola', label: 'Escola' },
  { value: 'companhia', label: 'Companhia' },
  { value: 'grupo', label: 'Grupo' },
  { value: 'projeto_social', label: 'Projeto social' },
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'espaco_cultural', label: 'Espaço cultural' },
  { value: 'outro', label: 'Outro' },
]

const institutionNatureOptions: OptionItem[] = [
  { value: 'particular', label: 'Particular' },
  { value: 'projeto_social', label: 'Projeto social' },
  { value: 'espaco_publico', label: 'Espaço público' },
  { value: 'espaco_multiplas_artes', label: 'Espaço de múltiplas artes' },
]

const institutionLocationTypeOptions: OptionItem[] = [
  { value: 'urbana', label: 'Urbana' },
  { value: 'periferia', label: 'Periferia urbana' },
  { value: 'rural', label: 'Zona rural' },
  { value: 'mista', label: 'Mista' },
]

const institutionSpaceTypeOptions: OptionItem[] = [
  { value: 'proprio', label: 'Espaço próprio' },
  { value: 'alugado', label: 'Espaço alugado' },
  { value: 'publico', label: 'Espaço público' },
  { value: 'compartilhado', label: 'Espaço compartilhado' },
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
  'Falta de informação sobre editais',
  'Dificuldade na escrita do projeto',
  'Documentação exigida',
  'Prazos curtos',
  'Falta de CNPJ / formalização',
  'Critérios excludentes',
  'Burocracia na prestação de contas',
  'Falta de apoio técnico',
  'Falta de contrapartida financeira',
  'Outra',
]

const totalIncomeOptions: OptionItem[] = [
  { value: 'ate_1sm', label: 'Até 1 salário mínimo' },
  { value: '1_2sm', label: 'De 1 a 2 salários mínimos' },
  { value: '2_3sm', label: 'De 2 a 3 salários mínimos' },
  { value: '3_5sm', label: 'De 3 a 5 salários mínimos' },
  { value: '5_10sm', label: 'De 5 a 10 salários mínimos' },
  { value: 'mais_10sm', label: 'Mais de 10 salários mínimos' },
]

const danceIncomeOptions: OptionItem[] = [
  { value: 'sem_renda', label: 'Não obtenho renda com dança' },
  { value: 'ate_1sm', label: 'Até 1 salário mínimo' },
  { value: '1_2sm', label: 'De 1 a 2 salários mínimos' },
  { value: '2_3sm', label: 'De 2 a 3 salários mínimos' },
  { value: '3_5sm', label: 'De 3 a 5 salários mínimos' },
  { value: 'mais_5sm', label: 'Mais de 5 salários mínimos' },
]

const danceSpendingOptions: OptionItem[] = [
  { value: 'ate_100', label: 'Até R$ 100' },
  { value: '101_300', label: 'De R$ 101 a R$ 300' },
  { value: '301_600', label: 'De R$ 301 a R$ 600' },
  { value: '601_1000', label: 'De R$ 601 a R$ 1.000' },
  { value: 'mais_1000', label: 'Mais de R$ 1.000' },
]

const initialMinorForm: MinorFormData = {
  fullName: '',
  email: '',
  whatsapp: '',
  region: '',
  state: '',
  city: '',
  ageRange: '',
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
  email: '',
  whatsapp: '',
  region: '',
  state: '',
  city: '',
  ageRange: '',
  birthDate: '',
  gender: '',
  practiceTime: '',
  danceModalities: [],
  consumedContents: [],
  worksProfessionally: '',
  hasDrt: '',
  currentlyWorks: '',
  danceMainIncomeChoice: '',
  hasOtherIncomeChoice: '',
  danceRoles: [],
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
  receivedPublicFundingLast2Years: '',
  editalDifficulties: [],
  annualBudgetRange: '',
  knowsMunicipalCulturePlan: '',
  participatesInCultureCouncil: '',
  interestedInPublicPartnerships: '',
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

function formatMinorSubmissionError(message: string) {
  if (message.includes('Cidade')) {
    return 'Selecione uma cidade valida na lista.'
  }

  if (message.includes('modalidade')) {
    return 'Selecione pelo menos uma modalidade valida.'
  }

  if (message.includes('consentimento')) {
    return 'Nao foi possivel validar o termo de consentimento ativo. Tente novamente.'
  }

  return message
}

function estimateBirthDateFromAdultRange(ageRange: string) {
  const now = new Date()
  const year = now.getFullYear()

  switch (ageRange) {
    case '18 a 24 anos':
      return `${year - 21}-01-01`
    case '25 a 34 anos':
      return `${year - 29}-01-01`
    case '35 a 44 anos':
      return `${year - 39}-01-01`
    case '45 a 59 anos':
      return `${year - 52}-01-01`
    case '60+':
      return `${year - 65}-01-01`
    default:
      return ''
  }
}

function mapIncomeRangeToAmount(value: string) {
  switch (value) {
    case 'sem_renda':
      return 0
    case 'ate_1sm':
      return 1200
    case '1_2sm':
      return 2400
    case '2_3sm':
      return 3600
    case '3_5sm':
      return 6000
    case '5_10sm':
      return 12000
    case 'mais_10sm':
      return 18000
    case 'mais_5sm':
      return 9000
    default:
      return 0
  }
}

function mapSpendingRangeToAmount(value: string) {
  switch (value) {
    case 'ate_100':
      return 100
    case '101_300':
      return 300
    case '301_600':
      return 600
    case '601_1000':
      return 1000
    case 'mais_1000':
      return 1500
    default:
      return 0
  }
}

function parseNumericSelection(value: string, fallback = 0) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return fallback
  }

  const directNumber = Number(normalizedValue.replace(',', '.'))

  if (!Number.isNaN(directNumber)) {
    return directNumber
  }

  const matches = normalizedValue.match(/\d+/g)

  if (!matches?.length) {
    return fallback
  }

  return Number(matches[matches.length - 1] ?? fallback)
}

function parseOptionalChoice(value: string, fallback = false) {
  if (!value) {
    return fallback
  }

  return parseBooleanChoice(value)
}

function inferAnnualBudgetRange(monthlyRevenue: number) {
  const annualRevenue = monthlyRevenue * 12

  if (annualRevenue <= 50000) return 'Até R$ 50 mil'
  if (annualRevenue <= 100000) return 'R$ 50 mil a R$ 100 mil'
  if (annualRevenue <= 300000) return 'R$ 100 mil a R$ 300 mil'
  if (annualRevenue <= 1000000) return 'R$ 300 mil a R$ 1 milhão'
  return 'Mais de R$ 1 milhão'
}

function renderSelectOptions(options: OptionItem[]) {
  return options.map((item) => (
    <option key={item.value} value={item.value}>
      {item.label}
    </option>
  ))
}

function renderRegionOptions() {
  return regionOptions.map((item) => (
    <option key={item.value} value={item.value}>
      {item.label}
    </option>
  ))
}

export function AccessFloatingMenu({ open, onClose, onSelect, initialView = 'menu' }: AccessFloatingMenuProps) {
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
  const [isMinorSubmitting, setIsMinorSubmitting] = useState(false)
  const [minorSubmission, setMinorSubmission] = useState<YouthFormResponse | null>(null)
  const [isAdultSubmitting, setIsAdultSubmitting] = useState(false)
  const [adultSubmission, setAdultSubmission] = useState<ProfessionalFormResponse | null>(null)
  const [isInstitutionSubmitting, setIsInstitutionSubmitting] = useState(false)
  const [institutionSubmission, setInstitutionSubmission] = useState<InstitutionFormResponse | null>(null)

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
        {item.label}
      </option>
    ))
  }

  useEffect(() => {
    if (!open) return

    setView(initialView)
    setCurrentStep(0)
    setStepError('')
    setMinorSubmission(null)
    setAdultSubmission(null)
    setInstitutionSubmission(null)
  }, [initialView, open])

  useEffect(() => {
    if (!open || !['minor-flow', 'adult-flow', 'institution-flow'].includes(view)) {
      return
    }

    let isMounted = true

    async function loadMinorReferences() {
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
      } catch (error) {
        if (!isMounted) {
          return
        }

        setStepError(
          error instanceof Error
            ? formatMinorSubmissionError(error.message)
            : 'Nao foi possivel carregar os dados de apoio do formulario.'
        )
      } finally {
        if (isMounted) {
          setIsMinorLoadingReferences(false)
        }
      }
    }

    loadMinorReferences()

    return () => {
      isMounted = false
    }
  }, [open, view])

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
            : 'Nao foi possivel carregar as cidades do estado selecionado.'
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
            : 'Nao foi possivel carregar as cidades do estado selecionado.'
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
            : 'Nao foi possivel carregar as cidades do estado selecionado.'
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

  const resetAll = () => {
    setView('menu')
    setCurrentStep(0)
    setStepError('')
    setMinorForm(initialMinorForm)
    setAdultForm(initialAdultForm)
    setInstitutionForm(initialInstitutionForm)
    setMinorCityOptions([])
    setAdultCityOptions([])
    setInstitutionCityOptions([])
    setMinorModalities([])
    setMinorContents([])
    setActiveConsentTerm(null)
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

  const updateMinorField = <K extends keyof MinorFormData>(field: K, value: MinorFormData[K]) => {
    setMinorForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateAdultField = <K extends keyof AdultFormData>(field: K, value: AdultFormData[K]) => {
    setAdultForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateInstitutionField = <K extends keyof InstitutionFormData>(
    field: K,
    value: InstitutionFormData[K]
  ) => {
    setInstitutionForm((prev) => ({ ...prev, [field]: value }))
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
    field: 'danceModalities' | 'mainIncomeSources' | 'editalDifficulties',
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
      setView('minor-flow')
      setCurrentStep(0)
      return
    }

    if (label === 'Sou maior de 18 anos') {
      setView('adult-flow')
      setCurrentStep(0)
      return
    }

    if (label === 'Escola / Grupo / Companhia') {
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
      setView('menu')
      return
    }

    setCurrentStep((prev) => prev - 1)
  }

  const handleTopBack = handlePrevious

  const validateMinorStep = () => {
    if (currentStep === 0 && (!minorForm.fullName || !minorForm.email || !minorForm.whatsapp)) {
      setStepError('Preencha nome completo, email e WhatsApp.')
      return false
    }

    if (currentStep === 1 && (!minorForm.region || !minorForm.state || !minorForm.city)) {
      setStepError('Preencha região, estado e cidade.')
      return false
    }

    if (
      currentStep === 2 &&
      (!minorForm.birthDate ||
        !minorForm.gender ||
        !minorForm.practiceTime ||
        minorForm.danceModalities.length === 0)
    ) {
      setStepError(
        'Preencha data de nascimento, gênero, tempo de prática e ao menos uma modalidade.'
      )
      return false
    }

    if (currentStep === 3 && !minorForm.familyIncome) {
      setStepError('Selecione a faixa de renda familiar.')
      return false
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
      setStepError('É necessário autorizar o uso estatístico.')
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

    if (currentStep === 1 && (!adultForm.region || !adultForm.state || !adultForm.city)) {
      setStepError('Preencha região, estado e cidade.')
      return false
    }

    if (
      currentStep === 2 &&
      (!adultForm.ageRange ||
        !adultForm.gender ||
        !adultForm.practiceTime ||
        adultForm.danceModalities.length === 0)
    ) {
      setStepError(
        'Preencha faixa etária, gênero, tempo de prática e ao menos uma modalidade.'
      )
      return false
    }

    if (currentStep === 3 && (!adultForm.worksProfessionally || adultForm.danceRoles.length === 0)) {
      setStepError(
        'Informe se atua profissionalmente com dança e selecione ao menos uma função.'
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
        !adultForm.monthlyIncomeTotal ||
        !adultForm.danceIncome ||
        !adultForm.danceMonthlySpending ||
        !adultForm.danceMainIncomeChoice ||
        !adultForm.hasOtherIncomeChoice
      )
    ) {
      setStepError(
        'Selecione renda total, renda com dança, gasto com dança, renda principal e outra renda.'
      )
      return false
    }

    if (currentStep === 6 && !adultForm.academicEducation) {
      setStepError('Selecione a formação acadêmica.')
      return false
    }

    if (currentStep === 7 && !adultForm.participatedPublicCalls) {
      setStepError('Informe se já participou de editais públicos.')
      return false
    }

    if (currentStep === 8 && !adultForm.consentStats) {
      setStepError('É necessário autorizar o uso estatístico.')
      return false
    }

    if (currentStep === 8 && !adultForm.consentContact) {
      setStepError('É necessário autorizar o contato.')
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
        'Preencha nome da instituição, tipo, período de fundação e se possui CNPJ.'
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
      setStepError('É necessário autorizar o uso estatístico.')
      return false
    }

    if (currentStep === 7 && !institutionForm.consentContact) {
      setStepError('É necessário autorizar o contato.')
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

    if (
      currentStep === 1 &&
      (!institutionForm.institutionName ||
        !institutionForm.tradeName ||
        !institutionForm.institutionType ||
        !institutionForm.institutionNature ||
        !institutionForm.foundationYearExact ||
        !institutionForm.hasCnpj)
    ) {
      setStepError('Preencha nome, nome fantasia, tipo, natureza, ano de fundação e informe se possui CNPJ.')
      return false
    }

    if (currentStep === 1 && institutionForm.hasCnpj === 'sim' && !institutionForm.cnpj) {
      setStepError('Preencha o CNPJ da instituição.')
      return false
    }

    if (currentStep === 2 && (!institutionForm.state || !institutionForm.city || !institutionForm.locationType)) {
      setStepError('Preencha estado, cidade e tipo de localização da instituição.')
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
      currentStep === 4 &&
      (!institutionForm.averageStudents ||
        !institutionForm.numberOfTeachers ||
        !institutionForm.monthlyFee ||
        !institutionForm.hasScholarShip)
    ) {
      setStepError('Preencha média de alunos, número de professores, mensalidade média e política de bolsas.')
      return false
    }

    if (
      currentStep === 5 &&
      (!institutionForm.cltEmployees ||
        !institutionForm.pjContracts ||
        !institutionForm.monthlyRevenue ||
        !institutionForm.usesManagementSystem)
    ) {
      setStepError('Preencha equipe CLT, contratos PJ, faturamento mensal e uso de sistema de gestão.')
      return false
    }

    if (currentStep === 6 && !institutionForm.mainChallenges.trim()) {
      setStepError('Descreva o principal desafio institucional.')
      return false
    }

    if (currentStep === 7 && !institutionForm.consentStats) {
      setStepError('É necessário autorizar o uso estatístico.')
      return false
    }

    setStepError('')
    return true
  }

  const validateCurrentStep = () => {
    if (view === 'minor-flow') return validateMinorStep()
    if (view === 'adult-flow') return validateAdultStep()
    if (view === 'institution-flow') return validateInstitutionRealStep()
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
      const response = await submitYouthForm({
        fullName: minorForm.fullName.trim(),
        email: minorForm.email.trim(),
        whatsapp: minorForm.whatsapp.trim(),
        birthDate: minorForm.birthDate,
        gender: minorForm.gender,
        cityId: selectedCity.id,
        modalityIds,
        practiceTime: minorForm.practiceTime,
        careerInterest: parseBooleanChoice(minorForm.careerInterest),
        whoPaysExpenses: minorForm.whoPays.join(', '),
        familyIncomeRange: minorForm.familyIncome,
        searchesContent: parseBooleanChoice(minorForm.searchesContent),
        contentIds,
        consentCode: activeConsentTerm.code,
        consentAccepted: minorForm.consentStats,
      })

      setMinorSubmission(response)
    } catch (error) {
      setStepError(
        error instanceof Error
          ? formatMinorSubmissionError(error.message)
          : 'Não foi possível enviar o formulário de jovens.'
      )
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
        fullName: adultForm.fullName.trim(),
        cpf: null,
        email: adultForm.email.trim(),
        whatsapp: adultForm.whatsapp.trim(),
        birthDate: adultForm.birthDate || estimateBirthDateFromAdultRange(adultForm.ageRange),
        gender: adultForm.gender,
        cityId: selectedCity.id,
        modalityIds,
        contentIds,
        practiceTime: adultForm.practiceTime,
        worksWithDance,
        hasDrt: parseBooleanChoice(adultForm.hasDrt),
        currentlyWorks: parseBooleanChoice(adultForm.currentlyWorks),
        danceMainIncome: parseBooleanChoice(adultForm.danceMainIncomeChoice),
        hasOtherIncome: parseBooleanChoice(adultForm.hasOtherIncomeChoice),
        totalIncome: mapIncomeRangeToAmount(adultForm.monthlyIncomeTotal),
        danceIncome: mapIncomeRangeToAmount(adultForm.danceIncome),
        careerInterest: worksWithDance || parseOptionalChoice(adultForm.wantsFormalDanceStudy),
        householdIncomeRange: adultForm.monthlyIncomeTotal || null,
        rolesPerformed: adultForm.danceRoles.join(', ') || null,
        workType: worksWithDance ? 'Profissional' : 'Nao profissional',
        coursesPerYear: Number(adultForm.presentialCoursesPerYear || 0),
        onlineCoursesPerYear: Number(adultForm.onlineCoursesPerYear || 0),
        currentlyStudies: parseOptionalChoice(adultForm.studiesDanceNow),
        formalStudyType: adultForm.danceEducationLevel || adultForm.academicEducation || null,
        wantsFormalStudy: parseOptionalChoice(adultForm.wantsFormalDanceStudy),
        monthlyCostCourses: mapSpendingRangeToAmount(adultForm.courses),
        monthlyCostCostumes: mapSpendingRangeToAmount(adultForm.costumes),
        monthlyCostEvents: mapSpendingRangeToAmount(adultForm.festivals),
        monthlyCostTravel: mapSpendingRangeToAmount(adultForm.travel),
        monthlyCostSchool: mapSpendingRangeToAmount(adultForm.schoolFee),
        monthlyCostOthers: mapSpendingRangeToAmount(adultForm.otherCosts),
        costResponsibility: adultForm.whoPays.join(', ') || 'Nao informado',
        participatedInEdital: parseBooleanChoice(adultForm.participatedPublicCalls),
        approvedInEdital: parseOptionalChoice(adultForm.wasSelected),
        appliedNotApproved: parseOptionalChoice(adultForm.appliedNotSelected),
        editalDifficulty: null,
        consentCode: activeConsentTerm.code,
        consentAccepted: adultForm.consentStats,
      })

      setAdultSubmission(response)
    } catch (error) {
      setStepError(
        error instanceof Error
          ? formatMinorSubmissionError(error.message)
          : 'Não foi possível enviar o formulário profissional.'
      )
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
      const numberOfStaff =
        parseNumericSelection(institutionForm.numberOfStaff, cltEmployees + pjContracts) ||
        cltEmployees + pjContracts
      const activeStudents =
        parseNumericSelection(institutionForm.activeStudents, averageStudents) || averageStudents
      const monthlyAudience =
        parseNumericSelection(institutionForm.monthlyAudience, averageStudents) || averageStudents
      const averageAudienceCapacity =
        parseNumericSelection(institutionForm.averageAudienceCapacity, numberOfRooms * 30) ||
        numberOfRooms * 30
      const hasOwnHeadquarters =
        institutionForm.spaceType === 'proprio' || parseOptionalChoice(institutionForm.hasOwnHeadquarters)
      const rentedHeadquarters =
        institutionForm.spaceType === 'alugado' || parseOptionalChoice(institutionForm.rentedHeadquarters)
      const usesPublicSpace =
        institutionForm.spaceType === 'publico' || parseOptionalChoice(institutionForm.usesPublicSpace)
      const actsInPeriphery =
        institutionForm.locationType === 'periferia' || parseOptionalChoice(institutionForm.actsInPeriphery)
      const actsInRuralArea =
        institutionForm.locationType === 'rural' || parseOptionalChoice(institutionForm.actsInRuralArea)

      const response = await submitInstitutionForm({
        responsibleName: institutionForm.responsibleName.trim(),
        legalName: institutionForm.institutionName.trim(),
        tradeName: institutionForm.tradeName.trim(),
        cnpj: institutionForm.hasCnpj === 'sim' ? institutionForm.cnpj.trim() : null,
        cityId: selectedCity.id,
        email: institutionForm.email.trim(),
        phone: institutionForm.whatsapp.trim(),
        socialMedia: institutionForm.socialMedia.trim() || null,
        type: institutionForm.institutionType,
        nature: institutionForm.institutionNature,
        locationType: institutionForm.locationType,
        foundationYear: Number(institutionForm.foundationYearExact),
        modalityIds,
        numberOfTeachers,
        averageStudents,
        monthlyFee,
        classesPerWeek,
        numberOfRooms,
        spaceType: institutionForm.spaceType,
        infrastructureItems: institutionForm.spaceType ? `Espaço ${institutionForm.spaceType}` : null,
        hasCnpj: parseBooleanChoice(institutionForm.hasCnpj),
        hasScholarShip: parseBooleanChoice(institutionForm.hasScholarShip),
        scholarshipCount: parseNumericSelection(
          institutionForm.hasScholarShip === 'sim' ? '1' : '0',
          0,
        ),
        studentsPayMonthlyFee: monthlyFee > 0,
        cltEmployees,
        pjContracts,
        monthlyRevenue,
        usesManagementSystem: parseBooleanChoice(institutionForm.usesManagementSystem),
        mainChallenges: institutionForm.mainChallenges.trim(),
        eventCostResponsibility: monthlyFee > 0 ? 'Instituicao e estudantes' : 'Instituicao',
        staffRoles: `CLT: ${cltEmployees}; PJ: ${pjContracts}`,
        actsInPeriphery,
        actsInRuralArea,
        hasOwnHeadquarters,
        rentedHeadquarters,
        usesPublicSpace,
        averageAudienceCapacity,
        activeStudents,
        numberOfStaff,
        monthlyAudience,
        servesVulnerablePopulation: parseOptionalChoice(institutionForm.servesVulnerablePopulation),
        mainIncomeSources:
          institutionForm.mainIncomeSources.join(', ') ||
          (monthlyFee > 0 ? 'Mensalidades de alunos' : 'Nao informado'),
        receivedPublicFundingLast2Years: parseOptionalChoice(
          institutionForm.receivedPublicFundingLast2Years,
        ),
        registeredInPublicCalls: parseOptionalChoice(institutionForm.receivedPublicFundingLast2Years),
        approvedInPublicCalls: false,
        editalDifficulties: institutionForm.editalDifficulties.join(', ') || null,
        annualBudgetRange:
          institutionForm.annualBudgetRange || inferAnnualBudgetRange(monthlyRevenue),
        knowsMunicipalCulturePlan: parseOptionalChoice(institutionForm.knowsMunicipalCulturePlan),
        participatesInCultureCouncil: parseOptionalChoice(institutionForm.participatesInCultureCouncil),
        interestedInPublicPartnerships: parseOptionalChoice(
          institutionForm.interestedInPublicPartnerships,
          true,
        ),
        knowsPublicPolicyAccessMechanisms: parseOptionalChoice(
          institutionForm.knowsMunicipalCulturePlan,
        ),
        promotionChannels: institutionForm.socialMedia.trim() || null,
        wouldUseFreePromotionPlatform: true,
        consentCode: activeConsentTerm.code,
        consentAccepted: institutionForm.consentStats,
      })

      setInstitutionSubmission(response)
    } catch (error) {
      setStepError(
        error instanceof Error
          ? formatMinorSubmissionError(error.message)
          : 'Não foi possível enviar o formulário institucional.'
      )
    } finally {
      setIsInstitutionSubmitting(false)
    }
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) return

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
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
        {value === 'sim' ? 'Sim' : value === 'nao' ? 'Não' : value}
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
              <span>Regiao *</span>
              <select value={minorForm.region} onChange={(e) => updateMinorField('region', e.target.value)}>
                <option value="">Selecione a regiao</option>
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
                onChange={(e) => updateMinorField('birthDate', e.target.value)}
              />
            </label>

            <label className="access-field">
              <span>Genero *</span>
              <select value={minorForm.gender} onChange={(e) => updateMinorField('gender', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Nao binario">Nao binario</option>
                <option value="Prefiro nao informar">Prefiro nao informar</option>
                <option value="Outro">Outro</option>
              </select>
            </label>

            <label className="access-field">
              <span>Tempo de pratica de danca *</span>
              <select
                value={minorForm.practiceTime}
                onChange={(e) => updateMinorField('practiceTime', e.target.value)}
              >
                <option value="">Selecione</option>
                {renderSelectOptions(minorPracticeTimeOptions)}
              </select>
            </label>

            <div className="access-field access-field-full">
              <span>Modalidades de danca *</span>
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
                <option value="Ate 1 salario minimo">Ate 1 salario minimo</option>
                <option value="De 1 a 2 salarios minimos">De 1 a 2 salarios minimos</option>
                <option value="De 2 a 5 salarios minimos">De 2 a 5 salarios minimos</option>
                <option value="Acima de 5 salarios minimos">Acima de 5 salarios minimos</option>
                <option value="Prefiro nao informar">Prefiro nao informar</option>
              </select>
            </label>
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <div className="access-field">
              <span>Tem interesse em seguir carreira na danca? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', minorForm.careerInterest, (value) => updateMinorField('careerInterest', value))}
                {renderChoiceCard('nao', minorForm.careerInterest, (value) => updateMinorField('careerInterest', value))}
              </div>
            </div>

            <div className="access-field">
              <span>Pesquisa conteudos sobre danca na internet? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', minorForm.searchesContent, (value) => updateMinorField('searchesContent', value))}
                {renderChoiceCard('nao', minorForm.searchesContent, (value) => updateMinorField('searchesContent', value))}
              </div>
            </div>

            <div className="access-field access-field-full">
              <span>Quem banca os custos da danca? *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {whoPaysOptions.map((item) => (
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
              {activeConsentTerm ? (
                <small>{activeConsentTerm.title} ({activeConsentTerm.version})</small>
              ) : null}
            </div>

            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>
                  Autorizo o uso estatistico e anonimizado dos dados fornecidos para fins de pesquisa, politicas publicas e desenvolvimento do setor da danca.
                </strong>
                <small>E necessario autorizar o uso estatistico</small>
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
                  Autorizo o contato por email e WhatsApp para informacoes sobre o SIBRADANCA e oportunidades no setor da danca.
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

  const renderMinorStep = () => {
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
              <input
                type="text"
                placeholder="Nome da cidade"
                value={minorForm.city}
                onChange={(e) => updateMinorField('city', e.target.value)}
              />
            </label>
          </div>
        )
      case 2:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Faixa etária *</span>
              <select value={minorForm.ageRange} onChange={(e) => updateMinorField('ageRange', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Até 10 anos">Até 10 anos</option>
                <option value="11 a 13 anos">11 a 13 anos</option>
                <option value="14 a 15 anos">14 a 15 anos</option>
                <option value="16 a 17 anos">16 a 17 anos</option>
              </select>
            </label>

            <label className="access-field">
              <span>Gênero *</span>
              <select value={minorForm.gender} onChange={(e) => updateMinorField('gender', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Não binário">Não binário</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
                <option value="Outro">Outro</option>
              </select>
            </label>

            <label className="access-field">
              <span>Tempo de prática de dança *</span>
              <select
                value={minorForm.practiceTime}
                onChange={(e) => updateMinorField('practiceTime', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="Menos de 1 ano">Menos de 1 ano</option>
                <option value="1 a 2 anos">1 a 2 anos</option>
                <option value="3 a 5 anos">3 a 5 anos</option>
                <option value="Mais de 5 anos">Mais de 5 anos</option>
              </select>
            </label>

            <div className="access-field access-field-full">
              <span>Modalidades de dança *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid">
                {danceModalitiesOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input
                      type="checkbox"
                      checked={minorForm.danceModalities.includes(item)}
                      onChange={() => toggleMinorArrayValue('danceModalities', item)}
                    />
                    <span>{item}</span>
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
                <option value="Até 1 salário mínimo">Até 1 salário mínimo</option>
                <option value="De 1 a 2 salários mínimos">De 1 a 2 salários mínimos</option>
                <option value="De 2 a 5 salários mínimos">De 2 a 5 salários mínimos</option>
                <option value="Acima de 5 salários mínimos">Acima de 5 salários mínimos</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </label>
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Custos com dança</span>
              <small>Informe quanto você gasta mensalmente em cada categoria (opcional)</small>
            </div>

            <label className="access-field">
              <span>Mensalidade da escola/academia</span>
              <input type="text" placeholder="Não se aplica" value={minorForm.schoolFee} onChange={(e) => updateMinorField('schoolFee', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Cursos e formações</span>
              <input type="text" placeholder="Não se aplica" value={minorForm.courses} onChange={(e) => updateMinorField('courses', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Figurinos e roupas de dança</span>
              <input type="text" placeholder="Não se aplica" value={minorForm.costumes} onChange={(e) => updateMinorField('costumes', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Festivais e competições</span>
              <input type="text" placeholder="Não se aplica" value={minorForm.festivals} onChange={(e) => updateMinorField('festivals', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Viagens para dança</span>
              <input type="text" placeholder="Não se aplica" value={minorForm.travel} onChange={(e) => updateMinorField('travel', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Outros gastos com dança</span>
              <input type="text" placeholder="Não se aplica" value={minorForm.otherCosts} onChange={(e) => updateMinorField('otherCosts', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Valor da mensalidade</span>
              <input type="text" placeholder="Não se aplica" value={minorForm.monthlyFee} onChange={(e) => updateMinorField('monthlyFee', e.target.value)} />
            </label>

            <div className="access-field access-field-full">
              <span>Quem banca os custos da dança?</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {whoPaysOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={minorForm.whoPays.includes(item)} onChange={() => toggleMinorArrayValue('whoPays', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Consentimento LGPD</span>
            </div>

            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>
                  Autorizo o uso estatístico e anonimizado dos dados fornecidos para fins de pesquisa, políticas públicas e desenvolvimento do setor da dança.
                </strong>
                <small>É necessário autorizar o uso estatístico</small>
              </div>
              <input type="checkbox" checked={minorForm.consentStats} onChange={(e) => updateMinorField('consentStats', e.target.checked)} />
            </label>

            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>
                  Autorizo o contato por email e WhatsApp para informações sobre o SIBRADANÇA e oportunidades no setor da dança.
                </strong>
                <small>É necessário autorizar o contato</small>
              </div>
              <input type="checkbox" checked={minorForm.consentContact} onChange={(e) => updateMinorField('consentContact', e.target.checked)} />
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
              <span>Regiao *</span>
              <select value={adultForm.region} onChange={(e) => updateAdultField('region', e.target.value)}>
                <option value="">Selecione a regiao</option>
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
              <span>Faixa etaria *</span>
              <select value={adultForm.ageRange} onChange={(e) => updateAdultField('ageRange', e.target.value)}>
                <option value="">Selecione</option>
                <option value="18 a 24 anos">18 a 24 anos</option>
                <option value="25 a 34 anos">25 a 34 anos</option>
                <option value="35 a 44 anos">35 a 44 anos</option>
                <option value="45 a 59 anos">45 a 59 anos</option>
                <option value="60+">60+</option>
              </select>
            </label>
            <label className="access-field">
              <span>Genero *</span>
              <select value={adultForm.gender} onChange={(e) => updateAdultField('gender', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Nao binario">Nao binario</option>
                <option value="Prefiro nao informar">Prefiro nao informar</option>
                <option value="Outro">Outro</option>
              </select>
            </label>
            <label className="access-field">
              <span>Tempo de pratica de danca *</span>
              <select value={adultForm.practiceTime} onChange={(e) => updateAdultField('practiceTime', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(minorPracticeTimeOptions)}
              </select>
            </label>
            <div className="access-field access-field-full">
              <span>Modalidades de danca *</span>
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
              <span>Atua profissionalmente com danca? *</span>
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
              <span>Atua atualmente na danca? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.currentlyWorks, (value) => updateAdultField('currentlyWorks', value))}
                {renderChoiceCard('nao', adultForm.currentlyWorks, (value) => updateAdultField('currentlyWorks', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Funcoes na danca *</span>
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
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Faixa de renda mensal total *</span>
              <select value={adultForm.monthlyIncomeTotal} onChange={(e) => updateAdultField('monthlyIncomeTotal', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(totalIncomeOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Renda obtida com danca *</span>
              <select value={adultForm.danceIncome} onChange={(e) => updateAdultField('danceIncome', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(danceIncomeOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Gasto mensal total com danca *</span>
              <select value={adultForm.danceMonthlySpending} onChange={(e) => updateAdultField('danceMonthlySpending', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(danceSpendingOptions)}
              </select>
            </label>
            <div className="access-field">
              <span>A danca e sua renda principal? *</span>
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
              <span>Custos detalhados com danca</span>
              <small>Campos vazios serao enviados como zero.</small>
            </div>
            <label className="access-field"><span>Mensalidade da escola/academia</span><select value={adultForm.schoolFee} onChange={(e) => updateAdultField('schoolFee', e.target.value)}><option value="">Selecione</option>{renderSelectOptions(danceSpendingOptions)}</select></label>
            <label className="access-field"><span>Cursos e formacoes</span><select value={adultForm.courses} onChange={(e) => updateAdultField('courses', e.target.value)}><option value="">Selecione</option>{renderSelectOptions(danceSpendingOptions)}</select></label>
            <label className="access-field"><span>Figurinos e roupas de danca</span><select value={adultForm.costumes} onChange={(e) => updateAdultField('costumes', e.target.value)}><option value="">Selecione</option>{renderSelectOptions(danceSpendingOptions)}</select></label>
            <label className="access-field"><span>Festivais e competicoes</span><select value={adultForm.festivals} onChange={(e) => updateAdultField('festivals', e.target.value)}><option value="">Selecione</option>{renderSelectOptions(danceSpendingOptions)}</select></label>
            <label className="access-field"><span>Viagens para danca</span><select value={adultForm.travel} onChange={(e) => updateAdultField('travel', e.target.value)}><option value="">Selecione</option>{renderSelectOptions(danceSpendingOptions)}</select></label>
            <label className="access-field"><span>Outros gastos com danca</span><select value={adultForm.otherCosts} onChange={(e) => updateAdultField('otherCosts', e.target.value)}><option value="">Selecione</option>{renderSelectOptions(danceSpendingOptions)}</select></label>
            <div className="access-field access-field-full">
              <span>Quem banca os custos da danca?</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {whoPaysOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={adultForm.whoPays.includes(item)} onChange={() => toggleAdultArrayValue('whoPays', item)} />
                    <span>{item}</span>
                  </label>
                ))}
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
              <span>Nivel de formacao em danca</span>
              <select value={adultForm.danceEducationLevel} onChange={(e) => updateAdultField('danceEducationLevel', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Livre">Livre</option>
                <option value="Tecnica">Tecnica</option>
                <option value="Graduacao">Graduacao</option>
                <option value="Pos-graduacao">Pos-graduacao</option>
                <option value="Autodidata">Autodidata</option>
              </select>
            </label>
            <div className="access-field">
              <span>Estuda danca atualmente?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.studiesDanceNow, (value) => updateAdultField('studiesDanceNow', value))}
                {renderChoiceCard('nao', adultForm.studiesDanceNow, (value) => updateAdultField('studiesDanceNow', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Pretende estudar danca formalmente?</span>
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
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Foi contemplado(a)?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.wasSelected, (value) => updateAdultField('wasSelected', value))}
                {renderChoiceCard('nao', adultForm.wasSelected, (value) => updateAdultField('wasSelected', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Se inscreveu e nao foi contemplado(a)?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.appliedNotSelected, (value) => updateAdultField('appliedNotSelected', value))}
                {renderChoiceCard('nao', adultForm.appliedNotSelected, (value) => updateAdultField('appliedNotSelected', value))}
              </div>
            </div>
          </div>
        )
      case 8:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Consentimento LGPD</span>
              {activeConsentTerm ? (
                <small>{activeConsentTerm.title} ({activeConsentTerm.version})</small>
              ) : null}
            </div>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o uso estatistico e anonimizado dos dados fornecidos para fins de pesquisa, politicas publicas e desenvolvimento do setor da danca.</strong>
                <small>E necessario autorizar o uso estatistico</small>
              </div>
              <input type="checkbox" checked={adultForm.consentStats} onChange={(e) => updateAdultField('consentStats', e.target.checked)} />
            </label>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o contato por email e WhatsApp para informacoes sobre o SIBRADANCA e oportunidades no setor da danca.</strong>
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

  const renderAdultStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Nome completo *</span>
              <input type="text" placeholder="Seu nome completo" value={adultForm.fullName} onChange={(e) => updateAdultField('fullName', e.target.value)} />
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
              <input type="text" placeholder="Nome da cidade" value={adultForm.city} onChange={(e) => updateAdultField('city', e.target.value)} />
            </label>
          </div>
        )
      case 2:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Faixa etária *</span>
              <select value={adultForm.ageRange} onChange={(e) => updateAdultField('ageRange', e.target.value)}>
                <option value="">Selecione</option>
                <option value="18 a 24 anos">18 a 24 anos</option>
                <option value="25 a 34 anos">25 a 34 anos</option>
                <option value="35 a 44 anos">35 a 44 anos</option>
                <option value="45 a 59 anos">45 a 59 anos</option>
                <option value="60+">60+</option>
              </select>
            </label>
            <label className="access-field">
              <span>Gênero *</span>
              <select value={adultForm.gender} onChange={(e) => updateAdultField('gender', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Não binário">Não binário</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
                <option value="Outro">Outro</option>
              </select>
            </label>
            <label className="access-field">
              <span>Tempo de prática de dança *</span>
              <select value={adultForm.practiceTime} onChange={(e) => updateAdultField('practiceTime', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Menos de 1 ano">Menos de 1 ano</option>
                <option value="1 a 2 anos">1 a 2 anos</option>
                <option value="3 a 5 anos">3 a 5 anos</option>
                <option value="Mais de 5 anos">Mais de 5 anos</option>
              </select>
            </label>
            <div className="access-field access-field-full">
              <span>Modalidades de dança *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid">
                {danceModalitiesOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={adultForm.danceModalities.includes(item)} onChange={() => toggleAdultArrayValue('danceModalities', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Atua profissionalmente com dança? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.worksProfessionally, (value) => updateAdultField('worksProfessionally', value))}
                {renderChoiceCard('nao', adultForm.worksProfessionally, (value) => updateAdultField('worksProfessionally', value))}
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
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Faixa de renda mensal total *</span>
              <select value={adultForm.monthlyIncomeTotal} onChange={(e) => updateAdultField('monthlyIncomeTotal', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(totalIncomeOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Renda obtida com dança</span>
              <select value={adultForm.danceIncome} onChange={(e) => updateAdultField('danceIncome', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(danceIncomeOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Gasto mensal total com dança</span>
              <select value={adultForm.danceMonthlySpending} onChange={(e) => updateAdultField('danceMonthlySpending', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(danceSpendingOptions)}
              </select>
            </label>
          </div>
        )
      case 5:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Custos detalhados com dança</span>
              <small>Informe quanto você gasta mensalmente em cada categoria (opcional)</small>
            </div>
            <label className="access-field"><span>Mensalidade da escola/academia</span><input type="text" placeholder="Não se aplica" value={adultForm.schoolFee} onChange={(e) => updateAdultField('schoolFee', e.target.value)} /></label>
            <label className="access-field"><span>Cursos e formações</span><input type="text" placeholder="Não se aplica" value={adultForm.courses} onChange={(e) => updateAdultField('courses', e.target.value)} /></label>
            <label className="access-field"><span>Figurinos e roupas de dança</span><input type="text" placeholder="Não se aplica" value={adultForm.costumes} onChange={(e) => updateAdultField('costumes', e.target.value)} /></label>
            <label className="access-field"><span>Festivais e competições</span><input type="text" placeholder="Não se aplica" value={adultForm.festivals} onChange={(e) => updateAdultField('festivals', e.target.value)} /></label>
            <label className="access-field"><span>Viagens para dança</span><input type="text" placeholder="Não se aplica" value={adultForm.travel} onChange={(e) => updateAdultField('travel', e.target.value)} /></label>
            <label className="access-field"><span>Outros gastos com dança</span><input type="text" placeholder="Não se aplica" value={adultForm.otherCosts} onChange={(e) => updateAdultField('otherCosts', e.target.value)} /></label>
            <div className="access-field access-field-full">
              <span>Quem banca os custos da dança?</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid access-checkbox-grid-compact">
                {whoPaysOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={adultForm.whoPays.includes(item)} onChange={() => toggleAdultArrayValue('whoPays', item)} />
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
              <span>Formação acadêmica *</span>
              <select value={adultForm.academicEducation} onChange={(e) => updateAdultField('academicEducation', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Ensino fundamental incompleto">Ensino fundamental incompleto</option>
                <option value="Ensino fundamental completo">Ensino fundamental completo</option>
                <option value="Ensino médio incompleto">Ensino médio incompleto</option>
                <option value="Ensino médio completo">Ensino médio completo</option>
                <option value="Ensino superior incompleto">Ensino superior incompleto</option>
                <option value="Ensino superior completo">Ensino superior completo</option>
                <option value="Pós-graduação">Pós-graduação</option>
                <option value="Mestrado">Mestrado</option>
                <option value="Doutorado">Doutorado</option>
              </select>
            </label>
            <label className="access-field">
              <span>Nível de formação em dança</span>
              <select value={adultForm.danceEducationLevel} onChange={(e) => updateAdultField('danceEducationLevel', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Livre">Livre</option>
                <option value="Técnica">Técnica</option>
                <option value="Graduação">Graduação</option>
                <option value="Pós-graduação">Pós-graduação</option>
                <option value="Autodidata">Autodidata</option>
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
              <span>Já participou de editais públicos? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.participatedPublicCalls, (value) => updateAdultField('participatedPublicCalls', value))}
                {renderChoiceCard('nao', adultForm.participatedPublicCalls, (value) => updateAdultField('participatedPublicCalls', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Foi contemplado(a)?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.wasSelected, (value) => updateAdultField('wasSelected', value))}
                {renderChoiceCard('nao', adultForm.wasSelected, (value) => updateAdultField('wasSelected', value))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Se inscreveu e não foi contemplado(a)?</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', adultForm.appliedNotSelected, (value) => updateAdultField('appliedNotSelected', value))}
                {renderChoiceCard('nao', adultForm.appliedNotSelected, (value) => updateAdultField('appliedNotSelected', value))}
              </div>
            </div>
          </div>
        )
      case 8:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full"><span>Consentimento LGPD</span></div>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o uso estatístico e anonimizado dos dados fornecidos para fins de pesquisa, políticas públicas e desenvolvimento do setor da dança.</strong>
                <small>É necessário autorizar o uso estatístico</small>
              </div>
              <input type="checkbox" checked={adultForm.consentStats} onChange={(e) => updateAdultField('consentStats', e.target.checked)} />
            </label>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o contato por email e WhatsApp para informações sobre o SIBRADANÇA e oportunidades no setor da dança.</strong>
                <small>É necessário autorizar o contato</small>
              </div>
              <input type="checkbox" checked={adultForm.consentContact} onChange={(e) => updateAdultField('consentContact', e.target.checked)} />
            </label>
          </div>
        )
      default:
        return null
    }
  }

  const renderInstitutionStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Nome completo do responsável *</span>
              <input type="text" placeholder="Seu nome completo" value={institutionForm.responsibleName} onChange={(e) => updateInstitutionField('responsibleName', e.target.value)} />
            </label>
            <label className="access-field">
              <span>Email *</span>
              <input type="email" placeholder="email@instituicao.com" value={institutionForm.email} onChange={(e) => updateInstitutionField('email', e.target.value)} />
            </label>
            <label className="access-field">
              <span>WhatsApp *</span>
              <input type="text" placeholder="(11) 99999-9999" value={institutionForm.whatsapp} onChange={(e) => updateInstitutionField('whatsapp', e.target.value)} />
            </label>
          </div>
        )
      case 1:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Nome da instituição *</span>
              <input type="text" placeholder="Nome da escola, grupo ou companhia" value={institutionForm.institutionName} onChange={(e) => updateInstitutionField('institutionName', e.target.value)} />
              {!institutionForm.institutionName && <small>Nome da instituição obrigatório</small>}
            </label>
            <label className="access-field">
              <span>Tipo de instituição *</span>
              <select value={institutionForm.institutionType} onChange={(e) => updateInstitutionField('institutionType', e.target.value)}>
                <option value="">Selecione</option>
                {renderSelectOptions(institutionTypeOptions)}
              </select>
            </label>
            <label className="access-field">
              <span>Período de fundação *</span>
              <select value={institutionForm.foundationPeriod} onChange={(e) => updateInstitutionField('foundationPeriod', e.target.value)}>
                <option value="">Selecione</option>
                <option value="Antes de 1990">Antes de 1990</option>
                <option value="1990 a 1999">1990 a 1999</option>
                <option value="2000 a 2009">2000 a 2009</option>
                <option value="2010 a 2019">2010 a 2019</option>
                <option value="2020 em diante">2020 em diante</option>
              </select>
              <small>Selecione o período de fundação</small>
            </label>
            <div className="access-field">
              <span>Possui CNPJ? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.hasCnpj, (value) => updateInstitutionField('hasCnpj', value))}
                {renderChoiceCard('nao', institutionForm.hasCnpj, (value) => updateInstitutionField('hasCnpj', value))}
              </div>
            </div>
            <label className="access-field">
              <span>CNPJ</span>
              <input type="text" placeholder="00.000.000/0000-00" value={institutionForm.cnpj} onChange={(e) => updateInstitutionField('cnpj', e.target.value)} />
            </label>
          </div>
        )
      case 2:
        return (
          <div className="access-form-grid">
            <label className="access-field">
              <span>Região *</span>
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
              <input type="text" placeholder="Nome da cidade" value={institutionForm.city} onChange={(e) => updateInstitutionField('city', e.target.value)} />
            </label>
            <div className="access-field">
              <span>Atua em periferia? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.actsInPeriphery, (value) => updateInstitutionField('actsInPeriphery', value))}
                {renderChoiceCard('nao', institutionForm.actsInPeriphery, (value) => updateInstitutionField('actsInPeriphery', value))}
              </div>
            </div>
            <div className="access-field">
              <span>Atua em zona rural? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.actsInRuralArea, (value) => updateInstitutionField('actsInRuralArea', value))}
                {renderChoiceCard('nao', institutionForm.actsInRuralArea, (value) => updateInstitutionField('actsInRuralArea', value))}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="access-form-grid">
            <div className="access-field"><span>Possui sede própria? *</span><div className="access-choice-grid">{renderChoiceCard('sim', institutionForm.hasOwnHeadquarters, (value) => updateInstitutionField('hasOwnHeadquarters', value))}{renderChoiceCard('nao', institutionForm.hasOwnHeadquarters, (value) => updateInstitutionField('hasOwnHeadquarters', value))}</div></div>
            <div className="access-field"><span>Sede alugada? *</span><div className="access-choice-grid">{renderChoiceCard('sim', institutionForm.rentedHeadquarters, (value) => updateInstitutionField('rentedHeadquarters', value))}{renderChoiceCard('nao', institutionForm.rentedHeadquarters, (value) => updateInstitutionField('rentedHeadquarters', value))}</div></div>
            <div className="access-field"><span>Utiliza espaço público? *</span><div className="access-choice-grid">{renderChoiceCard('sim', institutionForm.usesPublicSpace, (value) => updateInstitutionField('usesPublicSpace', value))}{renderChoiceCard('nao', institutionForm.usesPublicSpace, (value) => updateInstitutionField('usesPublicSpace', value))}</div></div>
            <label className="access-field"><span>Número de salas *</span><select value={institutionForm.numberOfRooms} onChange={(e) => updateInstitutionField('numberOfRooms', e.target.value)}><option value="">Selecione</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5+">5+</option></select></label>
            <label className="access-field"><span>Capacidade média de público *</span><select value={institutionForm.averageAudienceCapacity} onChange={(e) => updateInstitutionField('averageAudienceCapacity', e.target.value)}><option value="">Selecione</option><option value="Até 30 pessoas">Até 30 pessoas</option><option value="31 a 60 pessoas">31 a 60 pessoas</option><option value="61 a 100 pessoas">61 a 100 pessoas</option><option value="101 a 200 pessoas">101 a 200 pessoas</option><option value="Mais de 200 pessoas">Mais de 200 pessoas</option></select></label>
          </div>
        )
      case 4:
        return (
          <div className="access-form-grid">
            <label className="access-field"><span>Número de alunos ativos *</span><select value={institutionForm.activeStudents} onChange={(e) => updateInstitutionField('activeStudents', e.target.value)}><option value="">Selecione</option><option value="Até 20">Até 20</option><option value="21 a 50">21 a 50</option><option value="51 a 100">51 a 100</option><option value="101 a 300">101 a 300</option><option value="Mais de 300">Mais de 300</option></select></label>
            <label className="access-field"><span>Número de professores *</span><select value={institutionForm.numberOfTeachers} onChange={(e) => updateInstitutionField('numberOfTeachers', e.target.value)}><option value="">Selecione</option><option value="1 a 2">1 a 2</option><option value="3 a 5">3 a 5</option><option value="6 a 10">6 a 10</option><option value="11 a 20">11 a 20</option><option value="Mais de 20">Mais de 20</option></select></label>
            <label className="access-field"><span>Número de funcionários *</span><select value={institutionForm.numberOfStaff} onChange={(e) => updateInstitutionField('numberOfStaff', e.target.value)}><option value="">Selecione</option><option value="0">0</option><option value="1 a 2">1 a 2</option><option value="3 a 5">3 a 5</option><option value="6 a 10">6 a 10</option><option value="Mais de 10">Mais de 10</option></select></label>
            <label className="access-field"><span>Público atendido mensalmente *</span><select value={institutionForm.monthlyAudience} onChange={(e) => updateInstitutionField('monthlyAudience', e.target.value)}><option value="">Selecione</option><option value="Até 50">Até 50</option><option value="51 a 100">51 a 100</option><option value="101 a 300">101 a 300</option><option value="301 a 500">301 a 500</option><option value="Mais de 500">Mais de 500</option></select></label>
            <div className="access-field"><span>Atende população em situação de vulnerabilidade? *</span><div className="access-choice-grid">{renderChoiceCard('sim', institutionForm.servesVulnerablePopulation, (value) => updateInstitutionField('servesVulnerablePopulation', value))}{renderChoiceCard('nao', institutionForm.servesVulnerablePopulation, (value) => updateInstitutionField('servesVulnerablePopulation', value))}</div></div>
          </div>
        )
      case 5:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full">
              <span>Principais fontes de renda *</span>
              <small>Selecione todas que se aplicam</small>
              <div className="access-checkbox-grid">
                {institutionIncomeSourcesOptions.map((item) => (
                  <label key={item} className="access-check-card">
                    <input type="checkbox" checked={institutionForm.mainIncomeSources.includes(item)} onChange={() => toggleInstitutionArrayValue('mainIncomeSources', item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="access-field access-field-full">
              <span>Recebeu recurso de edital público nos últimos 2 anos? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.receivedPublicFundingLast2Years, (value) => updateInstitutionField('receivedPublicFundingLast2Years', value))}
                {renderChoiceCard('nao', institutionForm.receivedPublicFundingLast2Years, (value) => updateInstitutionField('receivedPublicFundingLast2Years', value))}
              </div>
            </div>
            {institutionForm.receivedPublicFundingLast2Years === 'nao' && (
              <div className="access-field access-field-full">
                <span>Dificuldades de acesso a editais (se não)</span>
                <small>Selecione as que se aplicam</small>
                <div className="access-checkbox-grid">
                  {institutionEditalDifficultiesOptions.map((item) => (
                    <label key={item} className="access-check-card">
                      <input type="checkbox" checked={institutionForm.editalDifficulties.includes(item)} onChange={() => toggleInstitutionArrayValue('editalDifficulties', item)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <label className="access-field"><span>Faixa de orçamento anual *</span><select value={institutionForm.annualBudgetRange} onChange={(e) => updateInstitutionField('annualBudgetRange', e.target.value)}><option value="">Selecione</option><option value="Até R$ 50 mil">Até R$ 50 mil</option><option value="R$ 50 mil a R$ 100 mil">R$ 50 mil a R$ 100 mil</option><option value="R$ 100 mil a R$ 300 mil">R$ 100 mil a R$ 300 mil</option><option value="R$ 300 mil a R$ 1 milhão">R$ 300 mil a R$ 1 milhão</option><option value="Mais de R$ 1 milhão">Mais de R$ 1 milhão</option></select></label>
          </div>
        )
      case 6:
        return (
          <div className="access-form-grid">
            <div className="access-field"><span>Conhece o Plano Municipal de Cultura da sua cidade? *</span><div className="access-choice-grid">{renderChoiceCard('sim', institutionForm.knowsMunicipalCulturePlan, (value) => updateInstitutionField('knowsMunicipalCulturePlan', value))}{renderChoiceCard('nao', institutionForm.knowsMunicipalCulturePlan, (value) => updateInstitutionField('knowsMunicipalCulturePlan', value))}</div></div>
            <div className="access-field"><span>Participa de algum conselho de cultura? *</span><div className="access-choice-grid">{renderChoiceCard('sim', institutionForm.participatesInCultureCouncil, (value) => updateInstitutionField('participatesInCultureCouncil', value))}{renderChoiceCard('nao', institutionForm.participatesInCultureCouncil, (value) => updateInstitutionField('participatesInCultureCouncil', value))}</div></div>
            <div className="access-field"><span>Tem interesse em parcerias com o poder público? *</span><div className="access-choice-grid">{renderChoiceCard('sim', institutionForm.interestedInPublicPartnerships, (value) => updateInstitutionField('interestedInPublicPartnerships', value))}{renderChoiceCard('nao', institutionForm.interestedInPublicPartnerships, (value) => updateInstitutionField('interestedInPublicPartnerships', value))}</div></div>
          </div>
        )
      case 7:
        return (
          <div className="access-form-grid">
            <div className="access-field access-field-full"><span>Consentimento LGPD</span></div>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o uso estatístico e anonimizado dos dados institucionais fornecidos para fins de pesquisa, políticas públicas e desenvolvimento do setor da dança.</strong>
                <small>É necessário autorizar o uso estatístico</small>
              </div>
              <input type="checkbox" checked={institutionForm.consentStats} onChange={(e) => updateInstitutionField('consentStats', e.target.checked)} />
            </label>
            <label className="access-consent-card">
              <div className="access-consent-copy">
                <strong>Autorizo o contato institucional por email e WhatsApp para informações sobre o SIBRADANÇA e oportunidades no setor da dança.</strong>
                <small>É necessário autorizar o contato</small>
              </div>
              <input type="checkbox" checked={institutionForm.consentContact} onChange={(e) => updateInstitutionField('consentContact', e.target.checked)} />
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
              <span>Mensalidade média (R$) *</span>
              <input type="number" min="0" step="0.01" placeholder="Ex: 250" value={institutionForm.monthlyFee} onChange={(e) => updateInstitutionField('monthlyFee', e.target.value)} />
            </label>
            <div className="access-field">
              <span>Possui bolsas? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.hasScholarShip, (value) => updateInstitutionField('hasScholarShip', value))}
                {renderChoiceCard('nao', institutionForm.hasScholarShip, (value) => updateInstitutionField('hasScholarShip', value))}
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
              <input type="number" min="0" step="0.01" placeholder="Ex: 15000" value={institutionForm.monthlyRevenue} onChange={(e) => updateInstitutionField('monthlyRevenue', e.target.value)} />
            </label>
            <div className="access-field">
              <span>Usa sistema de gestão? *</span>
              <div className="access-choice-grid">
                {renderChoiceCard('sim', institutionForm.usesManagementSystem, (value) => updateInstitutionField('usesManagementSystem', value))}
                {renderChoiceCard('nao', institutionForm.usesManagementSystem, (value) => updateInstitutionField('usesManagementSystem', value))}
              </div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="access-form-grid">
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
                <strong>
                  {activeConsentTerm
                    ? `${activeConsentTerm.title} (${activeConsentTerm.version})`
                    : 'Autorizo o uso estatístico e anonimizado dos dados institucionais fornecidos.'}
                </strong>
                <small>É necessário autorizar o uso estatístico</small>
              </div>
              <input type="checkbox" checked={institutionForm.consentStats} onChange={(e) => updateInstitutionField('consentStats', e.target.checked)} />
            </label>
          </div>
        )
      default:
        return null
    }
  }

  const renderCurrentStep = () => {
    if (view === 'minor-flow') {
      void renderMinorStep
      return renderMinorRealStep()
    }
    if (view === 'adult-flow') {
      void renderAdultStep
      return renderAdultRealStep()
    }
    if (view === 'institution-flow') {
      void renderInstitutionStep
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
          onClick={handleClose}
        >
          <motion.div
            className={`access-floating-panel ${view !== 'menu' ? 'is-form-mode' : ''}`}
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
                    <h3 className="access-panel-title">Escolha como deseja entrar</h3>
                    <p className="access-panel-text">
                      Selecione uma opção para continuar no ecossistema do SIBRADANÇA.
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
                      <strong>Protocolo: {minorSubmission?.protocol ?? adultSubmission?.protocol ?? institutionSubmission?.protocol}</strong>
                      <small>Guarde esse protocolo para acompanhar ou atualizar seus dados futuramente.</small>
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
                          ((view === 'minor-flow' || view === 'adult-flow' || view === 'institution-flow') && isMinorLoadingReferences)
                        }
                      >
                        {isMinorSubmitting || isAdultSubmitting || isInstitutionSubmitting
                          ? 'Enviando...'
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
