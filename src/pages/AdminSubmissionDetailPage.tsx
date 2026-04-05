import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { getAdminSubmissionDetail } from '../services/admin.service'
import type {
  AdminDetailSectionResponse,
  AdminSubmissionDetailResponse,
  InstitutionFormDetailResponse,
  ProfessionalFormDetailResponse,
  YouthFormDetailResponse,
} from '../types/admin'
import { formatBackendDate, formatBackendDateTime } from '../utils/backend-date'

type FieldKind = 'text' | 'enum' | 'boolean' | 'date' | 'datetime' | 'currency' | 'list' | 'number'

type FieldConfig<T> = {
  key: keyof T
  label: string
  kind?: FieldKind
}

type SectionConfig<T> = {
  title: string
  fields: Array<FieldConfig<T>>
}

const youthSections: Array<SectionConfig<YouthFormDetailResponse>> = [
  {
    title: 'Controle do cadastro',
    fields: [
      { key: 'protocol', label: 'Protocolo' },
      { key: 'submittedAt', label: 'Data do cadastro', kind: 'datetime' },
      { key: 'canUpdate', label: 'Pode atualizar', kind: 'boolean' },
      { key: 'nextUpdateAvailableAt', label: 'Pr\u00f3xima atualiza\u00e7\u00e3o', kind: 'datetime' },
    ],
  },
  {
    title: 'Identifica\u00e7\u00e3o',
    fields: [
      { key: 'fullName', label: 'Nome completo' },
      { key: 'cpf', label: 'CPF' },
      { key: 'email', label: 'E-mail' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'birthDate', label: 'Data de nascimento', kind: 'date' },
      { key: 'gender', label: 'G\u00eanero', kind: 'enum' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
    ],
  },
  {
    title: 'Dan\u00e7a e participa\u00e7\u00e3o',
    fields: [
      { key: 'danceModalities', label: 'Modalidades', kind: 'list' },
      { key: 'practiceTime', label: 'Tempo de pr\u00e1tica', kind: 'enum' },
      { key: 'careerInterest', label: 'Pretende seguir carreira', kind: 'boolean' },
      { key: 'searchesContent', label: 'Busca conte\u00fado na internet', kind: 'boolean' },
      { key: 'consumedContent', label: 'Conte\u00fados consumidos', kind: 'list' },
    ],
  },
  {
    title: 'Renda e apoio',
    fields: [
      { key: 'whoPaysExpenses', label: 'Quem financia os custos', kind: 'enum' },
      { key: 'familyIncomeRange', label: 'Faixa de renda familiar', kind: 'enum' },
      { key: 'consentAccepted', label: 'Consentimento aceito', kind: 'boolean' },
      { key: 'consentCode', label: 'C\u00f3digo do consentimento' },
    ],
  },
] as const

const professionalSections: Array<SectionConfig<ProfessionalFormDetailResponse>> = [
  {
    title: 'Controle do cadastro',
    fields: [
      { key: 'protocol', label: 'Protocolo' },
      { key: 'submittedAt', label: 'Data do cadastro', kind: 'datetime' },
      { key: 'canUpdate', label: 'Pode atualizar', kind: 'boolean' },
      { key: 'nextUpdateAvailableAt', label: 'Pr\u00f3xima atualiza\u00e7\u00e3o', kind: 'datetime' },
    ],
  },
  {
    title: 'Identifica\u00e7\u00e3o',
    fields: [
      { key: 'fullName', label: 'Nome completo' },
      { key: 'cpf', label: 'CPF' },
      { key: 'email', label: 'E-mail' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'birthDate', label: 'Data de nascimento', kind: 'date' },
      { key: 'gender', label: 'G\u00eanero', kind: 'enum' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
    ],
  },
  {
    title: 'Atua\u00e7\u00e3o em dan\u00e7a',
    fields: [
      { key: 'danceModalities', label: 'Modalidades', kind: 'list' },
      { key: 'practiceTime', label: 'Tempo de pr\u00e1tica', kind: 'enum' },
      { key: 'worksWithDance', label: 'Trabalha com dan\u00e7a', kind: 'boolean' },
      { key: 'currentlyWorks', label: 'Atua atualmente', kind: 'boolean' },
      { key: 'hasDrt', label: 'Possui DRT', kind: 'boolean' },
      { key: 'rolesPerformed', label: 'Fun\u00e7\u00f5es exercidas' },
      { key: 'workType', label: 'Tipo de trabalho' },
    ],
  },
  {
    title: 'Renda e financiamento',
    fields: [
      { key: 'danceMainIncome', label: 'Dan\u00e7a \u00e9 a renda principal', kind: 'boolean' },
      { key: 'hasOtherIncome', label: 'Possui outra fonte de renda', kind: 'boolean' },
      { key: 'totalIncome', label: 'Renda mensal total', kind: 'currency' },
      { key: 'danceIncome', label: 'Renda mensal com dan\u00e7a', kind: 'currency' },
      { key: 'householdIncomeRange', label: 'Faixa de renda familiar', kind: 'enum' },
      { key: 'costResponsibility', label: 'Quem financia os custos', kind: 'enum' },
    ],
  },
  {
    title: 'Forma\u00e7\u00e3o e desenvolvimento',
    fields: [
      { key: 'consumedContent', label: 'Conte\u00fados consumidos', kind: 'list' },
      { key: 'coursesPerYear', label: 'Cursos presenciais por ano', kind: 'number' },
      { key: 'onlineCoursesPerYear', label: 'Cursos online por ano', kind: 'number' },
      { key: 'currentlyStudies', label: 'Estuda atualmente', kind: 'boolean' },
      { key: 'formalStudyType', label: 'Tipo de forma\u00e7\u00e3o formal' },
      { key: 'wantsFormalStudy', label: 'Deseja forma\u00e7\u00e3o formal', kind: 'boolean' },
      { key: 'careerInterest', label: 'Deseja crescer na carreira', kind: 'boolean' },
    ],
  },
  {
    title: 'Custos e editais',
    fields: [
      { key: 'monthlyCostCourses', label: 'Custo mensal com cursos', kind: 'currency' },
      { key: 'monthlyCostCostumes', label: 'Custo mensal com figurino', kind: 'currency' },
      { key: 'monthlyCostEvents', label: 'Custo mensal com eventos', kind: 'currency' },
      { key: 'monthlyCostTravel', label: 'Custo mensal com deslocamento', kind: 'currency' },
      { key: 'monthlyCostSchool', label: 'Custo mensal com escola', kind: 'currency' },
      { key: 'monthlyCostOthers', label: 'Outros custos mensais', kind: 'currency' },
      { key: 'participatedInEdital', label: 'Participou de edital', kind: 'boolean' },
      { key: 'approvedInEdital', label: 'Foi aprovado em edital', kind: 'boolean' },
      { key: 'appliedNotApproved', label: 'Inscrito sem aprova\u00e7\u00e3o', kind: 'boolean' },
      { key: 'editalDifficulty', label: 'Dificuldade com editais' },
      { key: 'consentAccepted', label: 'Consentimento aceito', kind: 'boolean' },
      { key: 'consentCode', label: 'C\u00f3digo do consentimento' },
    ],
  },
] as const

const institutionSections: Array<SectionConfig<InstitutionFormDetailResponse>> = [
  {
    title: 'Controle do cadastro',
    fields: [
      { key: 'protocol', label: 'Protocolo' },
      { key: 'submittedAt', label: 'Data do cadastro', kind: 'datetime' },
      { key: 'canUpdate', label: 'Pode atualizar', kind: 'boolean' },
      { key: 'nextUpdateAvailableAt', label: 'Pr\u00f3xima atualiza\u00e7\u00e3o', kind: 'datetime' },
    ],
  },
  {
    title: 'Identifica\u00e7\u00e3o',
    fields: [
      { key: 'legalName', label: 'Raz\u00e3o social' },
      { key: 'tradeName', label: 'Nome fantasia' },
      { key: 'responsibleName', label: 'Respons\u00e1vel' },
      { key: 'cnpj', label: 'CNPJ' },
      { key: 'email', label: 'E-mail' },
      { key: 'phone', label: 'Telefone' },
      { key: 'socialMedia', label: 'Redes sociais' },
    ],
  },
  {
    title: 'Localiza\u00e7\u00e3o e perfil',
    fields: [
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
      { key: 'type', label: 'Tipo de institui\u00e7\u00e3o', kind: 'enum' },
      { key: 'nature', label: 'Natureza', kind: 'enum' },
      { key: 'locationType', label: 'Tipo de localiza\u00e7\u00e3o', kind: 'enum' },
      { key: 'foundationYear', label: 'Ano de funda\u00e7\u00e3o', kind: 'number' },
      { key: 'modalities', label: 'Modalidades', kind: 'list' },
    ],
  },
  {
    title: 'Estrutura e atendimento',
    fields: [
      { key: 'numberOfTeachers', label: 'N\u00famero de professores', kind: 'number' },
      { key: 'averageStudents', label: 'M\u00e9dia de alunos', kind: 'number' },
      { key: 'monthlyFee', label: 'Mensalidade', kind: 'currency' },
      { key: 'classesPerWeek', label: 'Aulas por semana', kind: 'number' },
      { key: 'numberOfRooms', label: 'N\u00famero de salas', kind: 'number' },
      { key: 'spaceType', label: 'Tipo de espa\u00e7o', kind: 'enum' },
      { key: 'infrastructureItems', label: 'Infraestrutura dispon\u00edvel' },
      { key: 'hasCnpj', label: 'Possui CNPJ', kind: 'boolean' },
      { key: 'hasScholarShip', label: 'Oferece bolsa', kind: 'boolean' },
      { key: 'scholarshipCount', label: 'Quantidade de bolsas', kind: 'number' },
      { key: 'studentsPayMonthlyFee', label: 'Alunos pagam mensalidade', kind: 'boolean' },
    ],
  },
  {
    title: 'Equipe e opera\u00e7\u00e3o',
    fields: [
      { key: 'cltEmployees', label: 'Funcion\u00e1rios CLT', kind: 'number' },
      { key: 'pjContracts', label: 'Contratos PJ', kind: 'number' },
      { key: 'numberOfStaff', label: 'Equipe total', kind: 'number' },
      { key: 'staffRoles', label: 'Fun\u00e7\u00f5es da equipe' },
      { key: 'usesManagementSystem', label: 'Usa sistema de gest\u00e3o', kind: 'boolean' },
      { key: 'mainChallenges', label: 'Principais desafios' },
      { key: 'eventCostResponsibility', label: 'Quem financia eventos', kind: 'enum' },
    ],
  },
  {
    title: 'Territ\u00f3rio, p\u00fablico e receita',
    fields: [
      { key: 'actsInPeriphery', label: 'Atua em periferia', kind: 'boolean' },
      { key: 'actsInRuralArea', label: 'Atua em \u00e1rea rural', kind: 'boolean' },
      { key: 'hasOwnHeadquarters', label: 'Possui sede pr\u00f3pria', kind: 'boolean' },
      { key: 'rentedHeadquarters', label: 'Possui sede alugada', kind: 'boolean' },
      { key: 'usesPublicSpace', label: 'Utiliza espa\u00e7o p\u00fablico', kind: 'boolean' },
      { key: 'averageAudienceCapacity', label: 'Capacidade m\u00e9dia de p\u00fablico', kind: 'number' },
      { key: 'activeStudents', label: 'Alunos ativos', kind: 'number' },
      { key: 'monthlyAudience', label: 'P\u00fablico mensal', kind: 'number' },
      { key: 'servesVulnerablePopulation', label: 'Atende popula\u00e7\u00e3o vulner\u00e1vel', kind: 'boolean' },
      { key: 'monthlyRevenue', label: 'Receita mensal', kind: 'currency' },
      { key: 'mainIncomeSources', label: 'Principais fontes de renda' },
    ],
  },
  {
    title: 'Pol\u00edticas p\u00fablicas e comunica\u00e7\u00e3o',
    fields: [
      {
        key: 'receivedPublicFundingLast2Years',
        label: 'Recebeu recurso p\u00fablico nos \u00faltimos 2 anos',
        kind: 'boolean',
      },
      { key: 'registeredInPublicCalls', label: 'Inscrita em editais p\u00fablicos', kind: 'boolean' },
      { key: 'approvedInPublicCalls', label: 'Aprovada em editais p\u00fablicos', kind: 'boolean' },
      { key: 'editalDifficulties', label: 'Dificuldades com editais' },
      { key: 'annualBudgetRange', label: 'Faixa de or\u00e7amento anual', kind: 'enum' },
      {
        key: 'knowsMunicipalCulturePlan',
        label: 'Conhece o plano municipal de cultura',
        kind: 'boolean',
      },
      { key: 'participatesInCultureCouncil', label: 'Participa de conselho de cultura', kind: 'boolean' },
      {
        key: 'interestedInPublicPartnerships',
        label: 'Tem interesse em parcerias p\u00fablicas',
        kind: 'boolean',
      },
      {
        key: 'knowsPublicPolicyAccessMechanisms',
        label: 'Conhece mecanismos de acesso a pol\u00edticas p\u00fablicas',
        kind: 'boolean',
      },
      { key: 'promotionChannels', label: 'Canais de divulga\u00e7\u00e3o' },
      {
        key: 'wouldUseFreePromotionPlatform',
        label: 'Usaria plataforma gratuita de divulga\u00e7\u00e3o',
        kind: 'boolean',
      },
      { key: 'consentAccepted', label: 'Consentimento aceito', kind: 'boolean' },
      { key: 'consentCode', label: 'C\u00f3digo do consentimento' },
    ],
  },
] as const

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function parseBirthDateFromSection(value: string) {
  const normalizedValue = value.trim()
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalizedValue)

  if (!match) {
    return null
  }

  const [, day, month, year] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function calculateAge(birthDate: Date) {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

function resolveAgeRangeForSector(sector: string, age: number) {
  if (sector === 'YOUTH') {
    if (age <= 10) return 'At\u00e9 10 anos'
    if (age <= 13) return '11 a 13 anos'
    if (age <= 15) return '14 a 15 anos'
    if (age <= 17) return '16 a 17 anos'
    return '18 anos ou mais'
  }

  if (age <= 24) return '18 a 24 anos'
  if (age <= 34) return '25 a 34 anos'
  if (age <= 44) return '35 a 44 anos'
  if (age <= 59) return '45 a 59 anos'
  return '60+'
}

function humanizeEnum(value: string | null) {
  if (!value) {
    return '-'
  }

  if (/^[A-Z]{2}$/.test(value)) {
    return value
  }

  const mappedValues: Record<string, string> = {
    MENOS_DE_1_ANO: 'Menos de 1 ano',
    ENTRE_1_E_3_ANOS: 'Entre 1 e 3 anos',
    ENTRE_4_E_6_ANOS: 'Entre 4 e 6 anos',
    MAIS_DE_6_ANOS: 'Mais de 6 anos',
    PREFIRO_NAO_INFORMAR: 'Prefiro n\u00e3o informar',
    ATE_1_SM: 'At\u00e9 1 sal\u00e1rio m\u00ednimo',
    ATE_1_SALARIO_MINIMO: 'At\u00e9 1 sal\u00e1rio m\u00ednimo',
    DE_1_A_2_SALARIOS_MINIMOS: 'De 1 a 2 sal\u00e1rios m\u00ednimos',
    DE_2_A_5_SALARIOS_MINIMOS: 'De 2 a 5 sal\u00e1rios m\u00ednimos',
    ACIMA_DE_5_SALARIOS_MINIMOS: 'Acima de 5 sal\u00e1rios m\u00ednimos',
  }

  if (mappedValues[value]) {
    return mappedValues[value]
  }

  if (value === 'YOUTH') return 'Jovens'
  if (value === 'PROFESSIONAL') return 'Profissionais'
  if (value === 'INSTITUTION') return 'Institui\u00e7\u00f5es'

  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (match: string) => match.toUpperCase())
}

function formatValue(value: unknown, kind: FieldKind = 'text') {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (kind === 'list' && Array.isArray(value)) {
    return value.length ? value.join(', ') : '-'
  }

  if (kind === 'boolean' && typeof value === 'boolean') {
    return value ? 'Sim' : 'N\u00e3o'
  }

  if (kind === 'date' && typeof value === 'string') {
    return formatBackendDate(value)
  }

  if (kind === 'datetime' && typeof value === 'string') {
    return formatBackendDateTime(value)
  }

  if (kind === 'currency' && typeof value === 'number') {
    return formatCurrency(value)
  }

  if (kind === 'enum' && typeof value === 'string') {
    return humanizeEnum(value)
  }

  return String(value)
}

function renderSections<T extends object>(sections: Array<SectionConfig<T>>, values: T) {
  return sections.map((section) => (
    <Card key={section.title} className="admin-panel-card">
      <div className="admin-panel-header">
        <div>
          <h2>{section.title}</h2>
        </div>
      </div>

      <div className="admin-detail-grid">
        {section.fields.map((field) => (
          <div key={String(field.key)} className="admin-detail-item">
            <span className="admin-detail-label">{field.label}</span>
            <strong className="admin-detail-value">{formatValue(values[field.key], field.kind)}</strong>
          </div>
        ))}
      </div>
    </Card>
  ))
}

function normalizeStructuredSections(sections: AdminDetailSectionResponse[], sector: string) {
  return sections.map((section) => {
    const birthDateField = section.fields.find((field) => field.key === 'birthDate')
    const parsedBirthDate = birthDateField ? parseBirthDateFromSection(birthDateField.value) : null
    const calculatedAge = parsedBirthDate ? calculateAge(parsedBirthDate) : null

    return {
      ...section,
      fields: section.fields.map((field) => {
        let nextValue = field.value

        if (calculatedAge !== null && field.key === 'age') {
          nextValue = String(calculatedAge)
        }

        if (calculatedAge !== null && field.key === 'ageRange') {
          nextValue = resolveAgeRangeForSector(sector, calculatedAge)
        }

        return {
          ...field,
          value: nextValue,
        }
      }),
    }
  })
}

function renderStructuredSections(sections: AdminDetailSectionResponse[]) {
  return sections.map((section) => (
    <Card key={section.title} className="admin-panel-card">
      <div className="admin-panel-header">
        <div>
          <h2>{section.title}</h2>
        </div>
      </div>

      <div className="admin-detail-grid">
        {section.fields.map((field) => (
          <div key={`${section.title}-${field.key}`} className="admin-detail-item">
            <span className="admin-detail-label">{field.label}</span>
            <strong className="admin-detail-value">{field.value || '-'}</strong>
          </div>
        ))}
      </div>
    </Card>
  ))
}

export default function AdminSubmissionDetailPage() {
  const navigate = useNavigate()
  const { protocol = '' } = useParams()
  const [detail, setDetail] = useState<AdminSubmissionDetailResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDetail() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getAdminSubmissionDetail(protocol)
        setDetail(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'N\u00e3o foi poss\u00edvel carregar a ficha do cadastro.')
      } finally {
        setIsLoading(false)
      }
    }

    if (protocol) {
      void loadDetail()
    }
  }, [protocol])

  const activeSections = useMemo(() => {
    if (!detail) {
      return null
    }

    if (detail.sections?.length) {
      return renderStructuredSections(normalizeStructuredSections(detail.sections, detail.summary.sector))
    }

    if (detail.youthForm) {
      return renderSections(youthSections, detail.youthForm)
    }

    if (detail.professionalForm) {
      return renderSections(professionalSections, detail.professionalForm)
    }

    if (detail.institutionForm) {
      return renderSections(institutionSections, detail.institutionForm)
    }

    return null
  }, [detail])

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Cadastros</p>
          <h2>Ficha do cadastro</h2>
          <p className="admin-page-subtitle">Dados completos do protocolo selecionado.</p>
        </div>

        <Button type="button" variant="outline" onClick={() => navigate('/painel-interno/cadastros')}>
          Voltar para cadastros
        </Button>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      {isLoading ? <Card className="admin-panel-card">Carregando ficha do cadastro...</Card> : null}

      {detail ? (
        <>
          <section className="admin-grid">
            <Card className="admin-metric-card">
              <span className="eyebrow">Protocolo</span>
              <strong>{detail.summary.protocol}</strong>
            </Card>

            <Card className="admin-metric-card">
              <span className="eyebrow">Perfil</span>
              <strong>{humanizeEnum(detail.summary.sector)}</strong>
            </Card>

            <Card className="admin-metric-card">
              <span className="eyebrow">Nome</span>
              <strong>{detail.summary.subjectName}</strong>
            </Card>

            <Card className="admin-metric-card">
              <span className="eyebrow">Localidade</span>
              <strong>{[detail.summary.city, detail.summary.state].filter(Boolean).join(' / ') || '-'}</strong>
            </Card>
          </section>

          <section className="admin-section-grid">{activeSections}</section>
        </>
      ) : null}
    </div>
  )
}
