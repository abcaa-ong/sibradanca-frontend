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

const workAreas = [
  {
    title: 'Cadastros',
    audience: 'Base',
    description: 'Protocolos, fichas e registros.',
    route: '/painel-interno/cadastros',
    actionLabel: 'Abrir',
  },
  {
    title: 'Dados',
    audience: 'Indicadores',
    description: 'Dashboard, relatórios e exportações.',
    route: '/painel-interno/dados',
    actionLabel: 'Abrir',
  },
  {
    title: 'Acessos',
    audience: 'Segurança',
    description: 'Contas internas, permissões e auditoria.',
    route: '/painel-interno/acessos',
    actionLabel: 'Abrir',
  },
] as const

type MetricCardItem = {
  label: string
  percent: string
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
      stateSummary
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

  return (
    <div className="admin-page-content">
      <header className="admin-page-header admin-page-header-compact">
        <div>
          <p className="eyebrow">Central da ONG</p>
          <h2>Painel interno</h2>
          <p className="admin-page-subtitle">
            Acompanhamento da base, dos cadastros, das exportações e da leitura nacional dos dados.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Base total</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
          <p className="card-text">Cadastros consolidados no banco principal.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{overview?.totalYouth ?? '-'}</strong>
          <p className="card-text">Participantes com recorte jovem na base.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{overview?.totalProfessionals ?? '-'}</strong>
          <p className="card-text">Pessoas adultas ligadas ao trabalho em dança.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Instituições</span>
          <strong>{overview?.totalInstitutions ?? '-'}</strong>
          <p className="card-text">Escolas, grupos, companhias e projetos.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Navegação</p>
              <h2>Módulos da operação</h2>
            </div>
          </div>

          <div className="admin-module-grid">
            {workAreas.map((area) => (
              <div key={area.title} className="admin-module-card">
                <p className="admin-module-audience">{area.audience}</p>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
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
      ) : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Leitura rápida</p>
              <h2>Encaminhamento operacional</h2>
            </div>
          </div>

          <div className="admin-quick-actions">
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
