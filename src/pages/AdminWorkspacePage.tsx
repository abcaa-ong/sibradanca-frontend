import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { getAdminDashboard, getAdminOverview } from '../services/admin.service'
import type {
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
} from '../types/admin'

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

function getTopItem(
  items: Array<{ name: string; value: number }> | undefined,
  fallbackLabel: string,
) {
  if (!items?.length) {
    return { label: fallbackLabel, value: '-' }
  }

  const [topItem] = [...items].sort((left, right) => right.value - left.value)
  return {
    label: topItem.name,
    value: String(topItem.value),
  }
}

export default function AdminWorkspacePage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [dashboard, setDashboard] = useState<AdminInsightsDashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      setError('')

      try {
        const [overviewData, dashboardData] = await Promise.all([
          getAdminOverview(),
          getAdminDashboard(),
        ])

        setOverview(overviewData)
        setDashboard(dashboardData)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar o painel interno.',
        )
      }
    }

    void loadData()
  }, [])

  const topModality = getTopItem(dashboard?.details.modalities, 'Sem registros')
  const topAgeRange = getTopItem(dashboard?.profile.ageDistribution, 'Sem registros')
  const topGender = getTopItem(dashboard?.profile.genderDistribution, 'Sem registros')

  return (
    <div className="admin-page-content">
      <header className="admin-page-header admin-page-header-compact">
        <div>
          <p className="eyebrow">Central da ONG</p>
          <h2>Painel interno</h2>
          <p className="admin-page-subtitle">
            Acompanhamento da base, dos cadastros e dos acessos.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Base total</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{overview?.totalYouth ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{overview?.totalProfessionals ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Instituições</span>
          <strong>{overview?.totalInstitutions ?? '-'}</strong>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Navegação</p>
              <h2>Módulos</h2>
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

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Leitura rápida</p>
              <h2>Indicadores atuais</h2>
            </div>
          </div>

          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Modalidade</span>
              <strong>{topModality.label}</strong>
              <span className="admin-kpi-value">{topModality.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Faixa etária</span>
              <strong>{topAgeRange.label}</strong>
              <span className="admin-kpi-value">{topAgeRange.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Gênero</span>
              <strong>{topGender.label}</strong>
              <span className="admin-kpi-value">{topGender.value}</span>
            </div>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Ações</p>
              <h2>Acesso rápido</h2>
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
