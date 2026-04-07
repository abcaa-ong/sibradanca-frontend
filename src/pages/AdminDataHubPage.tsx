import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { cleanUiText as t } from '../utils/ui-text'

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function getTopItem(items: Array<{ name: string; value: number }> | undefined) {
  if (!items?.length) {
    return { label: 'Sem leitura', value: '-' }
  }

  const [topItem] = [...items].sort((left, right) => right.value - left.value)
  return {
    label: t(topItem.name),
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
          <p className="eyebrow">{t('Dados e análises')}</p>
          <h2>{t('Leitura da base nacional')}</h2>
          <p className="admin-page-subtitle">
            {t('Totais, setores e recortes principais da base em um só lugar.')}
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{t(error)}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Base total')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalResponses) : '-'}</strong>
          <p className="card-text">{t('Cadastros válidos na base.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Jovens')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalYouth) : '-'}</strong>
          <p className="card-text">{t('Registros do setor jovem.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Profissionais')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalProfessionals) : '-'}</strong>
          <p className="card-text">{t('Registros profissionais.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Instituições')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalInstitutions) : '-'}</strong>
          <p className="card-text">{t('Escolas, grupos e projetos.')}</p>
        </Card>
      </section>

      {isLoading ? <p className="admin-inline-note">{t('Atualizando a leitura da base...')}</p> : null}

      {!isLoading && !error && !hasBaseData ? (
        <p className="admin-inline-note">
          {t('A área de dados começa a preencher assim que os primeiros cadastros entrarem na base.')}
        </p>
      ) : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Resumo operacional')}</p>
              <h2>{t('Estado atual da base')}</h2>
            </div>
          </div>

          <div className="admin-system-list">
            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">{t('Último envio')}</span>
                <p className="admin-system-detail">{t('Cadastro mais recente processado pela base.')}</p>
              </div>
              <strong className="admin-system-value">
                {isLoading ? '...' : latestRecordAt ? formatBackendDateTime(latestRecordAt) : t('Sem registro')}
              </strong>
            </div>

            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">{t('UFs com presença')}</span>
                <p className="admin-system-detail">{t('Estados e Distrito Federal com registros.')}</p>
              </div>
              <strong className="admin-system-value">{isLoading ? '...' : formatNumber(activeStates)}</strong>
            </div>

            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">{t('Setores ativos')}</span>
                <p className="admin-system-detail">{t('Frentes com registros efetivos na base.')}</p>
              </div>
              <strong className="admin-system-value">{isLoading ? '...' : `${activeSectors}/3`}</strong>
            </div>

            <div className="admin-system-row">
              <div>
                <span className="admin-system-label">{t('Próxima ação da equipe')}</span>
                <p className="admin-system-detail">
                  {t('Abrir cadastros, exportações ou dashboard institucional.')}
                </p>
              </div>
              <strong className="admin-system-value">{t('Operação')}</strong>
            </div>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Destaques')}</p>
              <h2>{t('Recortes mais fortes da leitura')}</h2>
            </div>
          </div>

          <div className="admin-kpi-grid admin-kpi-grid-wide">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">{t('Modalidade em destaque')}</span>
              <strong>{topModality.label}</strong>
              <span className="admin-kpi-value">{topModality.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">{t('Faixa etária em destaque')}</span>
              <strong>{topAgeRange.label}</strong>
              <span className="admin-kpi-value">{topAgeRange.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">{t('Gênero em destaque')}</span>
              <strong>{topGender.label}</strong>
              <span className="admin-kpi-value">{topGender.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">{t('Editais e políticas')}</span>
              <strong>{topPublicCall.label}</strong>
              <span className="admin-kpi-value">{topPublicCall.value}</span>
            </div>
          </div>
        </Card>
      </section>

      {!isLoading && hasBaseData ? (
        <section className="admin-section-grid">
          <Card className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">{t('Setores')}</p>
                <h2>{t('Distribuição por frente')}</h2>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('Setor')}</th>
                    <th>{t('Total')}</th>
                    <th>{t('UFs')}</th>
                    <th>{t('Último registro')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorSummary.map((item) => (
                    <tr key={item.sector}>
                      <td>{t(item.sectorLabel)}</td>
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
                <p className="eyebrow">{t('Território')}</p>
                <h2>{t('Estados com maior presença')}</h2>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('UF')}</th>
                    <th>{t('Total')}</th>
                    <th>{t('Jovens')}</th>
                    <th>{t('Profissionais')}</th>
                    <th>{t('Instituições')}</th>
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
      ) : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Acesso rápido')}</p>
              <h2>{t('Próximos módulos da equipe')}</h2>
            </div>
          </div>

          <div className="admin-quick-actions admin-quick-actions-inline">
            <Button onClick={() => navigate('/painel-interno/dashboard')}>{t('Abrir dashboard')}</Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/cadastros')}>
              {t('Abrir cadastros')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/exportacoes')}>
              {t('Abrir exportações')}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
