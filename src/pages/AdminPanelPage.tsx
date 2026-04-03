import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import {
  getAdminDashboard,
  getAdminOverview,
  getAdminSectorSummary,
  getAdminStateSummary,
} from '../services/admin.service'
import type {
  AdminBiSectorSummaryResponse,
  AdminBiStateSummaryResponse,
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
} from '../types/admin'

function formatDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('pt-BR')
}

export default function AdminPanelPage() {
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [dashboard, setDashboard] = useState<AdminInsightsDashboardResponse | null>(null)
  const [sectorSummary, setSectorSummary] = useState<AdminBiSectorSummaryResponse[]>([])
  const [stateSummary, setStateSummary] = useState<AdminBiStateSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const stateTopList = useMemo(() => stateSummary.slice(0, 8), [stateSummary])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError('')

      try {
        const [overviewData, dashboardData, sectorData, stateData] = await Promise.all([
          getAdminOverview(),
          getAdminDashboard(),
          getAdminSectorSummary(),
          getAdminStateSummary(),
        ])

        setOverview(overviewData)
        setDashboard(dashboardData)
        setSectorSummary(sectorData)
        setStateSummary(stateData)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o dashboard.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Gestao</p>
          <h2>Visao geral da base</h2>
          <p className="admin-page-subtitle">Indicadores centrais para a equipe gestora.</p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-summary-strip">
        <Card className="admin-summary-card admin-summary-card-highlight">
          <p className="eyebrow">Painel executivo</p>
          <h2>Acompanhamento central</h2>
          <p className="card-text">Totais, distribuicao por perfil e leitura territorial.</p>
        </Card>

        <Card className="admin-summary-card">
          <p className="eyebrow">Atualizacao</p>
          <strong>{isLoading ? 'Carregando' : 'Sincronizado'}</strong>
          <p className="card-text">Conectado ao banco principal do projeto.</p>
        </Card>

          <Card className="admin-summary-card">
            <p className="eyebrow">Abrangencia</p>
            <strong>{stateSummary.length}</strong>
            <p className="card-text">Estados com registros visiveis para acompanhamento.</p>
          </Card>
        </section>

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Total geral</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
          <p className="card-text">Cadastros registrados na base interna.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{overview?.totalYouth ?? '-'}</strong>
          <p className="card-text">Participantes menores de 18 anos.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{overview?.totalProfessionals ?? '-'}</strong>
          <p className="card-text">Pessoas adultas ligadas a danca.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Instituicoes</span>
          <strong>{overview?.totalInstitutions ?? '-'}</strong>
          <p className="card-text">Escolas, grupos, companhias e projetos.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Distribuicao por perfil</p>
              <h2>Resumo por setor</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Setor</th>
                  <th>Total</th>
                  <th>Estados</th>
                  <th>Ultimo registro</th>
                </tr>
              </thead>
              <tbody>
                {sectorSummary.map((item) => (
                  <tr key={item.sector}>
                    <td>{item.sectorLabel}</td>
                    <td>{item.totalSubmissions}</td>
                    <td>{item.totalStates}</td>
                    <td>{formatDateTime(item.lastSubmissionAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Leitura territorial</p>
              <h2>Distribuicao por estado</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>UF</th>
                  <th>Total</th>
                  <th>Jovens</th>
                  <th>Profissionais</th>
                  <th>Instituicoes</th>
                </tr>
              </thead>
              <tbody>
                {stateTopList.map((item) => (
                  <tr key={item.stateCode}>
                    <td>{item.stateCode}</td>
                    <td>{item.totalSubmissions}</td>
                    <td>{item.totalYouth}</td>
                    <td>{item.totalProfessionals}</td>
                    <td>{item.totalInstitutions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {dashboard && !isLoading ? (
        <Card className="admin-panel-card admin-dashboard-note">
          <p className="eyebrow">Panorama atual</p>
          <p className="card-text">
            Neste momento, a base interna registra {dashboard.overview.totalResponses} cadastros, distribuidos entre{' '}
            {dashboard.overview.totalYouth} jovens, {dashboard.overview.totalProfessionals} profissionais e{' '}
            {dashboard.overview.totalInstitutions} instituicoes.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
