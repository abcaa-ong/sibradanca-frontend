import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ChartPanel } from '../components/ChartPanel'
import { MetricCard } from '../components/MetricCard'
import {
  getAdminDashboard,
  getAdminOverview,
  getAdminStateSummary,
} from '../services/admin.service'
import type {
  AdminBiStateSummaryResponse,
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
} from '../types/admin'
import type { ChartItem } from '../types/statistics'
import { formatBackendDateTime } from '../utils/backend-date'

const workAreas = [
  {
    title: 'Cadastros',
    audience: 'Cadastros da base',
    description: 'Protocolos, fichas completas e acompanhamento individual de cada envio.',
    route: '/painel-interno/cadastros',
    actionLabel: 'Abrir módulo',
    outputs: ['Protocolo', 'Ficha completa', 'Histórico'],
  },
  {
    title: 'Dados',
    audience: 'Leitura e relatórios',
    description: 'Números da base, arquivos para a equipe e visão geral do movimento nacional.',
    route: '/painel-interno/dados',
    actionLabel: 'Abrir módulo',
    outputs: ['Painel', 'PDF/XLSX/CSV', 'Respostas organizadas'],
  },
  {
    title: 'Acessos',
    audience: 'Contas da equipe',
    description: 'Contas internas, permissões de uso e histórico de acessos.',
    route: '/painel-interno/acessos',
    actionLabel: 'Abrir módulo',
    outputs: ['Contas', 'Permissões', 'Histórico'],
  },
] as const

type MetricCardItem = {
  label: string
  percent: string
  detail: string
}

type SystemRow = {
  label: string
  value: string
  detail: string
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function formatPercent(numerator: number, denominator: number) {
  if (!denominator) {
    return '0%'
  }

  return `${Math.round((numerator / denominator) * 100)}%`
}

function findChartValue(items: ChartItem[] | undefined, label: string) {
  return items?.find((item) => item.name === label)?.value ?? 0
}

function sumChartValues(items: ChartItem[] | undefined) {
  return (items ?? []).reduce((total, item) => total + item.value, 0)
}

function buildMetricCard(label: string, value: number, total: number, subject: string): MetricCardItem {
  return {
    label,
    percent: formatPercent(value, total),
    detail: `${formatNumber(value)} de ${formatNumber(total)} ${subject}.`,
  }
}

function getTopChartItem(items: ChartItem[] | undefined) {
  if (!items?.length) {
    return null
  }

  return [...items].sort((left, right) => right.value - left.value)[0]
}

export default function AdminWorkspacePage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [dashboard, setDashboard] = useState<AdminInsightsDashboardResponse | null>(null)
  const [stateSummary, setStateSummary] = useState<AdminBiStateSummaryResponse[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setError('')
      setIsLoading(true)

      try {
        const [overviewData, dashboardData, stateData] = await Promise.all([
          getAdminOverview(),
          getAdminDashboard(),
          getAdminStateSummary(),
        ])

        setOverview(overviewData)
        setDashboard(dashboardData)
        setStateSummary(stateData)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar o painel interno.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  const sectorDistribution = useMemo<ChartItem[]>(
    () => [
      { name: 'Jovens', value: overview?.totalYouth ?? 0 },
      { name: 'Profissionais', value: overview?.totalProfessionals ?? 0 },
      { name: 'Instituições', value: overview?.totalInstitutions ?? 0 },
    ],
    [overview],
  )

  const topStates = useMemo<ChartItem[]>(
    () =>
      [...stateSummary]
        .sort((left, right) => right.totalSubmissions - left.totalSubmissions)
        .slice(0, 6)
        .map((item) => ({
          name: item.stateCode,
          value: item.totalSubmissions,
        })),
    [stateSummary],
  )

  const strategicMetrics = useMemo<MetricCardItem[]>(() => {
    const details = dashboard?.details
    const currentOverview = overview

    if (!details || !currentOverview) {
      return []
    }

    const professionals = currentOverview.totalProfessionals
    const institutions = currentOverview.totalInstitutions
    const familyFinanced = findChartValue(details.financingDistribution, 'Família')
    const publicCallParticipants = findChartValue(details.publicCallsParticipation, 'Já participou')
    const institutionsWithCnpj = findChartValue(details.institutionIndicators, 'Com CNPJ')
    const aboveOneMinimumWage =
      sumChartValues(details.incomeDistribution) - findChartValue(details.incomeDistribution, 'Até 1 SM')

    return [
      buildMetricCard('Renda acima de 1 SM', aboveOneMinimumWage, professionals, 'profissionais'),
      buildMetricCard('Custeados pela família', familyFinanced, professionals, 'profissionais'),
      buildMetricCard('Instituições com CNPJ', institutionsWithCnpj, institutions, 'instituições'),
      buildMetricCard('Participação em editais', publicCallParticipants, professionals, 'profissionais'),
    ]
  }, [dashboard, overview])

  const operationalRows = useMemo<SystemRow[]>(() => {
    const totalResponses = overview?.totalResponses ?? 0
    const activeStates = stateSummary.filter((item) => item.totalSubmissions > 0)
    const topState = [...activeStates].sort((left, right) => right.totalSubmissions - left.totalSubmissions)[0]
    const latestSubmission = [...activeStates]
      .map((item) => item.lastSubmissionAt)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]

    return [
      {
        label: 'Estados com registros',
        value: `${formatNumber(activeStates.length)} UFs`,
        detail: `${formatPercent(activeStates.length, 27)} da presença possível entre estados e DF.`,
      },
      {
        label: 'Perfis com registros',
        value: `${sectorDistribution.filter((item) => item.value > 0).length}/3`,
        detail: 'Jovens, profissionais e instituições acompanhados pela equipe.',
      },
      {
        label: 'Último cadastro',
        value: latestSubmission ? formatBackendDateTime(latestSubmission) : 'Sem registro',
        detail: 'Horário mais recente encontrado entre os registros da base.',
      },
      {
        label: 'Estado com mais registros',
        value: topState ? `${topState.stateCode} (${formatNumber(topState.totalSubmissions)})` : 'Sem registro',
        detail: `${formatNumber(totalResponses)} cadastros acumulados no banco nacional até o momento.`,
      },
    ]
  }, [overview, sectorDistribution, stateSummary])

  const executiveRows = useMemo<SystemRow[]>(() => {
    const ageLeader = getTopChartItem(dashboard?.profile.ageDistribution)
    const genderLeader = getTopChartItem(dashboard?.profile.genderDistribution)
    const modalityLeader = getTopChartItem(dashboard?.details.modalities)
    const callLeader = getTopChartItem(dashboard?.details.publicCallsParticipation)

    return [
      {
        label: 'Faixa etária mais frequente',
        value: ageLeader ? `${ageLeader.name} (${formatNumber(ageLeader.value)})` : 'Sem leitura',
        detail: 'Faixa etária que mais aparece entre os registros atuais.',
      },
      {
        label: 'Gênero mais frequente',
        value: genderLeader ? `${genderLeader.name} (${formatNumber(genderLeader.value)})` : 'Sem leitura',
        detail: 'Identificação que mais aparece entre os perfis ativos.',
      },
      {
        label: 'Modalidade mais citada',
        value: modalityLeader ? `${modalityLeader.name} (${formatNumber(modalityLeader.value)})` : 'Sem leitura',
        detail: 'Prática de dança mais citada no recorte atual.',
      },
      {
        label: 'Tema ligado a editais',
        value: callLeader ? `${callLeader.name} (${formatNumber(callLeader.value)})` : 'Sem leitura',
        detail: 'Leitura mais forte sobre participação em editais e chamadas.',
      },
    ]
  }, [dashboard])

  return (
    <div className="admin-page-content">
      <header className="admin-page-header admin-page-header-compact">
        <div>
          <p className="eyebrow">Central da ONG</p>
          <h2>Painel interno</h2>
          <p className="admin-page-subtitle">
            Acompanhamento da base nacional, dos cadastros e dos principais números da plataforma.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Base total</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
          <p className="card-text">Cadastros reunidos na base nacional.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{overview?.totalYouth ?? '-'}</strong>
          <p className="card-text">Participações da frente jovem da dança.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{overview?.totalProfessionals ?? '-'}</strong>
          <p className="card-text">Pessoas ligadas ao trabalho e à atuação em dança.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Instituições</span>
          <strong>{overview?.totalInstitutions ?? '-'}</strong>
          <p className="card-text">Escolas, grupos, companhias, projetos e coletivos.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Operação</p>
              <h2>Resumo da base nacional</h2>
            </div>
          </div>

          <div className="admin-system-list">
            {operationalRows.map((item) => (
              <div key={item.label} className="admin-system-row">
                <div>
                  <span className="admin-system-label">{item.label}</span>
                  <p className="admin-system-detail">{item.detail}</p>
                </div>
                <strong className="admin-system-value">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Destaques</p>
              <h2>Leitura rápida da base</h2>
            </div>
          </div>

          <div className="admin-system-list">
            {executiveRows.map((item) => (
              <div key={item.label} className="admin-system-row">
                <div>
                  <span className="admin-system-label">{item.label}</span>
                  <p className="admin-system-detail">{item.detail}</p>
                </div>
                <strong className="admin-system-value">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Módulos</p>
              <h2>Áreas de trabalho da equipe</h2>
            </div>
          </div>

          <div className="admin-module-grid">
            {workAreas.map((area) => (
              <div key={area.title} className="admin-module-card admin-module-card-system">
                <div className="admin-module-head">
                <p className="admin-module-audience">{area.audience}</p>
                <span className="admin-status-chip">Ativo</span>
                </div>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <div className="admin-pill-list">
                  {area.outputs.map((item) => (
                    <span key={`${area.title}-${item}`} className="admin-pill">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="admin-card-action">
                  <Button onClick={() => navigate(area.route)}>{area.actionLabel}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="statistics-chart-grid two-columns">
        <ChartPanel
          title="Cadastros por perfil"
          data={sectorDistribution}
          isLoading={isLoading}
          emptyMessage="Carregando distribuição dos perfis..."
        />

        <ChartPanel
          title="Participação por perfil"
          data={sectorDistribution}
          type="pie"
          isLoading={isLoading}
          emptyMessage="Carregando participação dos perfis..."
        />

        <ChartPanel
          title="Faixa etária"
          data={dashboard?.profile.ageDistribution ?? []}
          type="pie"
          isLoading={isLoading}
          emptyMessage="Carregando faixa etária..."
        />

        <ChartPanel
          title="Gênero"
          data={dashboard?.profile.genderDistribution ?? []}
          type="pie"
          isLoading={isLoading}
          emptyMessage="Carregando gênero..."
        />
      </section>

      <section className="statistics-chart-grid two-columns">
        <ChartPanel
          title="Modalidades mais praticadas"
          data={dashboard?.details.modalities ?? []}
          isLoading={isLoading}
          emptyMessage="Carregando modalidades..."
        />

        <ChartPanel
          title="Estados com mais registros"
          data={topStates}
          isLoading={isLoading}
          emptyMessage="Carregando recorte territorial..."
        />
      </section>

      {strategicMetrics.length ? (
        <section className="admin-section-grid">
          <Card className="admin-panel-card admin-panel-card-full">
            <div className="admin-panel-header">
              <div>
              <p className="eyebrow">Indicadores</p>
              <h2>Destaques para a equipe</h2>
              </div>
            </div>

            <section className="statistics-metric-grid">
              {strategicMetrics.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  percent={item.percent}
                  detail={item.detail}
                />
              ))}
            </section>
          </Card>
        </section>
      ) : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Atalhos</p>
              <h2>Acesso rápido da equipe</h2>
            </div>
          </div>

          <div className="admin-quick-actions admin-quick-actions-inline">
            <Button onClick={() => navigate('/painel-interno/cadastros')}>Abrir cadastros</Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/dados')}>
              Abrir dados
            </Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/acessos')}>
              Abrir acessos
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
