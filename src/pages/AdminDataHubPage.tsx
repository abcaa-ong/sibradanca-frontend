import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminZeroState } from '../components/AdminZeroState'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { getAdminBootstrap } from '../services/admin.service'
import type {
  AdminBiSectorSummaryResponse,
  AdminBiStateSummaryResponse,
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
} from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function getTopItem(items: Array<{ name: string; value: number }> | undefined) {
  if (!items?.length) {
    return { label: 'Sem leitura', value: '-' }
  }

  const [topItem] = [...items].sort((left, right) => right.value - left.value)
  return {
    label: topItem.name,
    value: formatNumber(topItem.value),
  }
}

export default function AdminDataHubPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [dashboard, setDashboard] = useState<AdminInsightsDashboardResponse | null>(null)
  const [sectorSummary, setSectorSummary] = useState<AdminBiSectorSummaryResponse[]>([])
  const [stateSummary, setStateSummary] = useState<AdminBiStateSummaryResponse[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setError('')
      setIsLoading(true)

      try {
        const bootstrap = await getAdminBootstrap()
        setOverview(bootstrap.overview)
        setDashboard(bootstrap.dashboard)
        setSectorSummary(bootstrap.sectorSummary)
        setStateSummary(bootstrap.stateSummary)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar a área de dados.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  const stateTopList = useMemo(
    () => [...stateSummary].sort((left, right) => right.totalSubmissions - left.totalSubmissions).slice(0, 8),
    [stateSummary],
  )

  const latestRecordAt = useMemo(
    () =>
      [...stateSummary]
        .map((item) => item.lastSubmissionAt)
        .filter((value): value is string => Boolean(value))
        .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null,
    [stateSummary],
  )

  const activeStates = useMemo(
    () => stateSummary.filter((item) => item.totalSubmissions > 0).length,
    [stateSummary],
  )

  const activeSectors = useMemo(
    () => sectorSummary.filter((item) => item.totalSubmissions > 0).length,
    [sectorSummary],
  )

  const topModality = getTopItem(dashboard?.details.modalities)
  const topAgeRange = getTopItem(dashboard?.profile.ageDistribution)
  const topGender = getTopItem(dashboard?.profile.genderDistribution)
  const topPublicCall = getTopItem(dashboard?.details.publicCallsParticipation)
  const hasBaseData = (overview?.totalResponses ?? 0) > 0

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Dados e análises</p>
          <h2>Leitura da base nacional</h2>
          <p className="admin-page-subtitle">
            A equipe acompanha aqui os totais da base, os setores ativos, a distribuição por estado
            e os principais recortes que entram pelos formulários.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Base total</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalResponses) : '-'}</strong>
          <p className="card-text">Cadastros válidos na base.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalYouth) : '-'}</strong>
          <p className="card-text">Registros do setor jovem.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalProfessionals) : '-'}</strong>
          <p className="card-text">Registros profissionais.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Instituições</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalInstitutions) : '-'}</strong>
          <p className="card-text">Escolas, grupos e projetos.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Resumo operacional</p>
              <h2>Estado atual da base</h2>
            </div>
          </div>

          <div className="admin-system-list">
            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">Último envio</span>
                <p className="admin-system-detail">Cadastro mais recente processado pela base.</p>
              </div>
              <strong className="admin-system-value">
                {isLoading ? '...' : latestRecordAt ? formatBackendDateTime(latestRecordAt) : 'Sem registro'}
              </strong>
            </div>

            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">UFs com presença</span>
                <p className="admin-system-detail">Estados e Distrito Federal com registros.</p>
              </div>
              <strong className="admin-system-value">{isLoading ? '...' : formatNumber(activeStates)}</strong>
            </div>

            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">Setores ativos</span>
                <p className="admin-system-detail">Frentes com registros efetivos na base.</p>
              </div>
              <strong className="admin-system-value">{isLoading ? '...' : `${activeSectors}/3`}</strong>
            </div>

            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">Próxima ação da equipe</span>
                <p className="admin-system-detail">Abrir cadastros, exportações ou dashboard institucional.</p>
              </div>
              <strong className="admin-system-value">Operação</strong>
            </div>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Destaques</p>
              <h2>Recortes mais fortes da leitura</h2>
            </div>
          </div>

          <div className="admin-kpi-grid admin-kpi-grid-wide">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Modalidade em destaque</span>
              <strong>{topModality.label}</strong>
              <span className="admin-kpi-value">{topModality.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Faixa etária em destaque</span>
              <strong>{topAgeRange.label}</strong>
              <span className="admin-kpi-value">{topAgeRange.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Gênero em destaque</span>
              <strong>{topGender.label}</strong>
              <span className="admin-kpi-value">{topGender.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Editais e políticas</span>
              <strong>{topPublicCall.label}</strong>
              <span className="admin-kpi-value">{topPublicCall.value}</span>
            </div>
          </div>
        </Card>
      </section>

      {isLoading ? (
        <section className="admin-section-grid">
          <AdminZeroState
            className="admin-panel-card-full"
            eyebrow="Carregando a base"
            title="A leitura nacional está sendo preparada"
            description="O sistema está reunindo totais, setores e território para abrir esta área com a visão atual da base."
            items={[
              'A primeira abertura pode demorar mais quando o backend sai de repouso no Render.',
              'Assim que a resposta chega, as tabelas e os recortes aparecem nesta tela.',
            ]}
          />
        </section>
      ) : null}

      {!isLoading && !hasBaseData ? (
        <section className="admin-section-grid">
          <AdminZeroState
            className="admin-panel-card-full"
            eyebrow="Base vazia"
            title="A nova base ainda não recebeu cadastros"
            description="Quando os formulários começarem a entrar, esta área passa a mostrar totais, território e recortes dos três setores."
            items={[
              'Os protocolos entram pelo frontend, passam pelo backend e aparecem aqui.',
              'As exportações e o BI passam a refletir exatamente o que chegou na base.',
            ]}
          />
        </section>
      ) : null}

      {!isLoading && hasBaseData ? (
        <>
          <section className="admin-section-grid">
            <Card className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <p className="eyebrow">Setores</p>
                  <h2>Distribuição por frente</h2>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Setor</th>
                      <th>Total</th>
                      <th>UFs</th>
                      <th>Último registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorSummary.map((item) => (
                      <tr key={item.sector}>
                        <td>{item.sectorLabel}</td>
                        <td>{formatNumber(item.totalSubmissions)}</td>
                        <td>{formatNumber(item.totalStates)}</td>
                        <td>{formatBackendDateTime(item.lastSubmissionAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <p className="eyebrow">Território</p>
                  <h2>Estados com maior presença</h2>
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
                      <th>Instituições</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateTopList.map((item) => (
                      <tr key={item.stateCode}>
                        <td>{item.stateCode}</td>
                        <td>{formatNumber(item.totalSubmissions)}</td>
                        <td>{formatNumber(item.totalYouth)}</td>
                        <td>{formatNumber(item.totalProfessionals)}</td>
                        <td>{formatNumber(item.totalInstitutions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </>
      ) : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Acesso rápido</p>
              <h2>Próximos módulos da equipe</h2>
            </div>
          </div>

          <div className="admin-quick-actions admin-quick-actions-inline">
            <Button onClick={() => navigate('/painel-interno/dashboard')}>Abrir dashboard</Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/cadastros')}>
              Abrir cadastros
            </Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/exportacoes')}>
              Abrir exportações
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
