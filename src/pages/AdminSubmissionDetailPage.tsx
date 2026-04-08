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
import { calculateAgeFromBirthDate, formatCnpjInput } from '../utils/brazilian-validation'
import { cleanUiText as t } from '../utils/ui-text'

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
      { key: 'nextUpdateAvailableAt', label: 'Próxima atualização', kind: 'datetime' },
    ],
  },
  {
    title: 'Identificação',
    fields: [
      { key: 'fullName', label: 'Nome completo' },
      { key: 'cpf', label: 'CPF' },
      { key: 'email', label: 'E-mail' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'birthDate', label: 'Data de nascimento', kind: 'date' },
      { key: 'gender', label: 'Identidade de gênero', kind: 'enum' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
    ],
  },
  {
    title: 'Dança e participação',
    fields: [
      { key: 'danceModalities', label: 'Modalidades', kind: 'list' },
      { key: 'practiceTime', label: 'Tempo de prática', kind: 'enum' },
      { key: 'careerInterest', label: 'Pretende seguir carreira', kind: 'boolean' },
      { key: 'searchesContent', label: 'Busca conteúdo na internet', kind: 'boolean' },
      { key: 'consumedContent', label: 'Conteúdos consumidos', kind: 'list' },
    ],
  },
  {
    title: 'Renda e apoio',
    fields: [
      { key: 'whoPaysExpenses', label: 'Quem financia os custos', kind: 'enum' },
      { key: 'familyIncomeRange', label: 'Faixa de renda familiar', kind: 'enum' },
      { key: 'legalGuardianName', label: 'Responsável legal' },
      { key: 'legalGuardianRelationship', label: 'Vínculo com o jovem' },
      {
        key: 'legalGuardianAuthorizationConfirmed',
        label: 'Autorização do responsável legal',
        kind: 'boolean',
      },
      { key: 'consentAccepted', label: 'Consentimento aceito', kind: 'boolean' },
      { key: 'consentCode', label: 'Código do consentimento' },
    ],
  },
]

const professionalSections: Array<SectionConfig<ProfessionalFormDetailResponse>> = [
  {
    title: 'Controle do cadastro',
    fields: [
      { key: 'protocol', label: 'Protocolo' },
      { key: 'submittedAt', label: 'Data do cadastro', kind: 'datetime' },
      { key: 'canUpdate', label: 'Pode atualizar', kind: 'boolean' },
      { key: 'nextUpdateAvailableAt', label: 'Próxima atualização', kind: 'datetime' },
    ],
  },
  {
    title: 'Identificação',
    fields: [
      { key: 'fullName', label: 'Nome completo' },
      { key: 'cpf', label: 'CPF' },
      { key: 'email', label: 'E-mail' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'birthDate', label: 'Data de nascimento', kind: 'date' },
      { key: 'gender', label: 'Identidade de gênero', kind: 'enum' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
    ],
  },
  {
    title: 'Atuação em dança',
    fields: [
      { key: 'danceModalities', label: 'Modalidades', kind: 'list' },
      { key: 'practiceTime', label: 'Tempo de prática', kind: 'enum' },
      { key: 'worksWithDance', label: 'Trabalha com dança', kind: 'boolean' },
      { key: 'currentlyWorks', label: 'Atua atualmente', kind: 'boolean' },
      { key: 'hasDrt', label: 'Possui DRT', kind: 'boolean' },
      { key: 'rolesPerformed', label: 'Funções exercidas' },
      { key: 'workType', label: 'Tipo de trabalho' },
    ],
  },
  {
    title: 'Renda e financiamento',
    fields: [
      { key: 'danceMainIncome', label: 'Dança é a renda principal', kind: 'boolean' },
      { key: 'hasOtherIncome', label: 'Possui outra fonte de renda', kind: 'boolean' },
      { key: 'totalIncome', label: 'Renda mensal total', kind: 'currency' },
      { key: 'danceIncome', label: 'Renda mensal com dança', kind: 'currency' },
      { key: 'householdIncomeRange', label: 'Faixa de renda familiar', kind: 'enum' },
      { key: 'costResponsibility', label: 'Quem financia os custos', kind: 'enum' },
    ],
  },
  {
    title: 'Formação e desenvolvimento',
    fields: [
      { key: 'consumedContent', label: 'Conteúdos consumidos', kind: 'list' },
      { key: 'coursesPerYear', label: 'Cursos presenciais por ano', kind: 'number' },
      { key: 'onlineCoursesPerYear', label: 'Cursos online por ano', kind: 'number' },
      { key: 'currentlyStudies', label: 'Estuda atualmente', kind: 'boolean' },
      { key: 'formalStudyType', label: 'Tipo de formação formal' },
      { key: 'wantsFormalStudy', label: 'Deseja formação formal', kind: 'boolean' },
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
      { key: 'appliedNotApproved', label: 'Inscrito sem aprovação', kind: 'boolean' },
      { key: 'editalDifficulty', label: 'Dificuldade com editais' },
      { key: 'consentAccepted', label: 'Consentimento aceito', kind: 'boolean' },
      { key: 'consentCode', label: 'Código do consentimento' },
    ],
  },
]

const institutionSections: Array<SectionConfig<InstitutionFormDetailResponse>> = [
  {
    title: 'Controle do cadastro',
    fields: [
      { key: 'protocol', label: 'Protocolo' },
      { key: 'submittedAt', label: 'Data do cadastro', kind: 'datetime' },
      { key: 'canUpdate', label: 'Pode atualizar', kind: 'boolean' },
      { key: 'nextUpdateAvailableAt', label: 'Próxima atualização', kind: 'datetime' },
    ],
  },
  {
    title: 'Identificação',
    fields: [
      { key: 'legalName', label: 'Razão social' },
      { key: 'tradeName', label: 'Nome fantasia' },
      { key: 'responsibleName', label: 'Responsável' },
      { key: 'cnpj', label: 'CNPJ' },
      { key: 'email', label: 'E-mail' },
      { key: 'phone', label: 'Telefone' },
      { key: 'socialMedia', label: 'Redes sociais' },
    ],
  },
  {
    title: 'Localização e perfil',
    fields: [
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
      { key: 'type', label: 'Tipo de instituição', kind: 'enum' },
      { key: 'nature', label: 'Natureza', kind: 'enum' },
      { key: 'locationType', label: 'Tipo de localização', kind: 'enum' },
      { key: 'foundationYear', label: 'Ano de fundação', kind: 'number' },
      { key: 'modalities', label: 'Modalidades', kind: 'list' },
    ],
  },
  {
    title: 'Estrutura e atendimento',
    fields: [
      { key: 'numberOfTeachers', label: 'Número de professores', kind: 'number' },
      { key: 'averageStudents', label: 'Média de alunos', kind: 'number' },
      { key: 'monthlyFee', label: 'Mensalidade', kind: 'currency' },
      { key: 'classesPerWeek', label: 'Aulas por semana', kind: 'number' },
      { key: 'numberOfRooms', label: 'Número de salas', kind: 'number' },
      { key: 'spaceType', label: 'Tipo de espaço', kind: 'enum' },
      { key: 'infrastructureItems', label: 'Infraestrutura disponível' },
      { key: 'hasCnpj', label: 'Possui CNPJ', kind: 'boolean' },
      { key: 'hasScholarShip', label: 'Oferece bolsa', kind: 'boolean' },
      { key: 'scholarshipCount', label: 'Quantidade de bolsas', kind: 'number' },
      { key: 'studentsPayMonthlyFee', label: 'Alunos pagam mensalidade', kind: 'boolean' },
    ],
  },
  {
    title: 'Equipe e operação',
    fields: [
      { key: 'cltEmployees', label: 'Funcionários CLT', kind: 'number' },
      { key: 'pjContracts', label: 'Contratos PJ', kind: 'number' },
      { key: 'numberOfStaff', label: 'Equipe total', kind: 'number' },
      { key: 'staffRoles', label: 'Funções da equipe' },
      { key: 'usesManagementSystem', label: 'Usa sistema de gestão', kind: 'boolean' },
      { key: 'mainChallenges', label: 'Principais desafios' },
      { key: 'eventCostResponsibility', label: 'Quem financia eventos', kind: 'enum' },
    ],
  },
  {
    title: 'Território, público e receita',
    fields: [
      { key: 'actsInPeriphery', label: 'Atua em periferia', kind: 'boolean' },
      { key: 'actsInRuralArea', label: 'Atua em área rural', kind: 'boolean' },
      { key: 'hasOwnHeadquarters', label: 'Possui sede própria', kind: 'boolean' },
      { key: 'rentedHeadquarters', label: 'Possui sede alugada', kind: 'boolean' },
      { key: 'usesPublicSpace', label: 'Utiliza espaço público', kind: 'boolean' },
      { key: 'averageAudienceCapacity', label: 'Capacidade média de público', kind: 'number' },
      { key: 'activeStudents', label: 'Alunos ativos', kind: 'number' },
      { key: 'monthlyAudience', label: 'Público mensal', kind: 'number' },
      { key: 'servesVulnerablePopulation', label: 'Atende população vulnerável', kind: 'boolean' },
      { key: 'monthlyRevenue', label: 'Receita mensal', kind: 'currency' },
      { key: 'mainIncomeSources', label: 'Principais fontes de renda' },
    ],
  },
  {
    title: 'Políticas públicas e comunicação',
    fields: [
      {
        key: 'receivedPublicFundingLast2Years',
        label: 'Recebeu recurso público nos últimos 2 anos',
        kind: 'boolean',
      },
      { key: 'registeredInPublicCalls', label: 'Inscrita em editais públicos', kind: 'boolean' },
      { key: 'approvedInPublicCalls', label: 'Aprovada em editais públicos', kind: 'boolean' },
      { key: 'editalDifficulties', label: 'Dificuldades com editais' },
      { key: 'annualBudgetRange', label: 'Faixa de orçamento anual', kind: 'enum' },
      {
        key: 'knowsMunicipalCulturePlan',
        label: 'Conhece o plano municipal de cultura',
        kind: 'boolean',
      },
      { key: 'participatesInCultureCouncil', label: 'Participa de conselho de cultura', kind: 'boolean' },
      {
        key: 'interestedInPublicPartnerships',
        label: 'Tem interesse em parcerias públicas',
        kind: 'boolean',
      },
      {
        key: 'knowsPublicPolicyAccessMechanisms',
        label: 'Conhece mecanismos de acesso a políticas públicas',
        kind: 'boolean',
      },
      { key: 'promotionChannels', label: 'Canais de divulgação' },
      {
        key: 'wouldUseFreePromotionPlatform',
        label: 'Usaria plataforma gratuita de divulgação',
        kind: 'boolean',
      },
      { key: 'consentAccepted', label: 'Consentimento aceito', kind: 'boolean' },
      { key: 'consentCode', label: 'Código do consentimento' },
    ],
  },
]

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
  return `${year}-${month}-${day}`
}

function resolveAgeRangeForSector(sector: string, age: number) {
  if (sector === 'YOUTH') {
    if (age <= 10) return 'Até 10 anos'
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
    PREFIRO_NAO_INFORMAR: 'Prefiro não informar',
    ATE_1_SM: 'Até 1 salário mínimo',
    ATE_1_SALARIO_MINIMO: 'Até 1 salário mínimo',
    DE_1_A_2_SALARIOS_MINIMOS: 'De 1 a 2 salários mínimos',
    DE_2_A_5_SALARIOS_MINIMOS: 'De 2 a 5 salários mínimos',
    ACIMA_DE_5_SALARIOS_MINIMOS: 'Acima de 5 salários mínimos',
  }

  if (mappedValues[value]) {
    return mappedValues[value]
  }

  if (value === 'YOUTH') return 'Jovens'
  if (value === 'PROFESSIONAL') return 'Profissionais'
  if (value === 'INSTITUTION') return 'Instituições'
  if (
    value === 'Mulher' ||
    value === 'Homem' ||
    value === 'Mulher cis' ||
    value === 'Mulher cisgênero' ||
    value === 'Mulher trans' ||
    value === 'Homem cis' ||
    value === 'Homem cisgênero' ||
    value === 'Homem trans'
  ) {
    return value
  }
  if (value === 'Travesti') return value
  if (value === 'Pessoa não binária') return value
  if (value === 'Outra identidade de gênero') return value
  if (value === 'Prefiro não informar') return value

  return t(
    value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (match: string) => match.toUpperCase()),
  )
}

function formatValue(value: unknown, kind: FieldKind = 'text') {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (kind === 'list' && Array.isArray(value)) {
    return value.length ? t(value.join(', ')) : '-'
  }

  if (kind === 'boolean' && typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (kind === 'date' && typeof value === 'string') {
    return t(formatBackendDate(value))
  }

  if (kind === 'datetime' && typeof value === 'string') {
    return t(formatBackendDateTime(value))
  }

  if (kind === 'currency' && typeof value === 'number') {
    return formatCurrency(value)
  }

  if (kind === 'enum' && typeof value === 'string') {
    return humanizeEnum(value)
  }

  return t(String(value))
}

function formatFieldValue(fieldKey: string, value: unknown, kind: FieldKind = 'text') {
  if (fieldKey === 'cnpj' && typeof value === 'string' && value.trim()) {
    return formatCnpjInput(value)
  }

  return formatValue(value, kind)
}

function renderSections<T extends object>(sections: Array<SectionConfig<T>>, values: T) {
  return sections.map((section) => (
    <Card key={section.title} className="admin-panel-card">
      <div className="admin-panel-header">
        <div>
          <h2>{t(section.title)}</h2>
        </div>
      </div>

      <div className="admin-detail-grid">
        {section.fields.map((field) => (
          <div key={String(field.key)} className="admin-detail-item">
            <span className="admin-detail-label">{t(field.label)}</span>
            <strong className="admin-detail-value">{formatFieldValue(String(field.key), values[field.key], field.kind)}</strong>
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
    const calculatedAge = parsedBirthDate ? calculateAgeFromBirthDate(parsedBirthDate) : null

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
          <h2>{t(section.title)}</h2>
        </div>
      </div>

      <div className="admin-detail-grid">
        {section.fields.map((field) => (
          <div key={`${section.title}-${field.key}`} className="admin-detail-item">
            <span className="admin-detail-label">{t(field.label)}</span>
            <strong className="admin-detail-value">{formatFieldValue(field.key, t(field.value || '-'))}</strong>
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
        setError(
          loadError instanceof Error
            ? t(loadError.message)
            : t('Não foi possível carregar a ficha do cadastro.'),
        )
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
          <p className="eyebrow">{t('Cadastros')}</p>
          <h2>{t('Ficha do cadastro')}</h2>
          <p className="admin-page-subtitle">{t('Dados completos do protocolo selecionado.')}</p>
        </div>

        <Button type="button" variant="outline" onClick={() => navigate('/painel-interno/cadastros')}>
          {t('Voltar para cadastros')}
        </Button>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      {isLoading ? <Card className="admin-panel-card">{t('Carregando ficha do cadastro...')}</Card> : null}

      {detail ? (
        <>
          <section className="admin-grid">
            <Card className="admin-metric-card">
              <span className="eyebrow">{t('Protocolo')}</span>
              <strong>{t(detail.summary.protocol)}</strong>
            </Card>

            <Card className="admin-metric-card">
              <span className="eyebrow">{t('Perfil')}</span>
              <strong>{humanizeEnum(detail.summary.sector)}</strong>
            </Card>

            <Card className="admin-metric-card">
              <span className="eyebrow">{t('Nome')}</span>
              <strong>{t(detail.summary.subjectName)}</strong>
            </Card>

            <Card className="admin-metric-card">
              <span className="eyebrow">{t('Localidade')}</span>
              <strong>{t([detail.summary.city, detail.summary.state].filter(Boolean).join(' / ') || '-')}</strong>
            </Card>
          </section>

          <section className="admin-section-grid">{activeSections}</section>
        </>
      ) : null}
    </div>
  )
}
