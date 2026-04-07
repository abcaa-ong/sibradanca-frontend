import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminZeroState } from '../components/AdminZeroState'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { getAdminOverview, getAdminSubmissions } from '../services/admin.service'
import type {
  AdminInsightsOverviewResponse,
  AdminSubmissionSummaryResponse,
} from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'
import { cleanUiText as t } from '../utils/ui-text'

function formatSector(value: string) {
  if (value === 'YOUTH') return 'Jovens'
  if (value === 'PROFESSIONAL') return 'Profissionais'
  if (value === 'INSTITUTION') return 'Instituições'
  return value
}

export default function AdminSubmissionsPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [submissions, setSubmissions] = useState<AdminSubmissionSummaryResponse[]>([])
  const [protocolFilter, setProtocolFilter] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function loadData(nextProtocol = protocolFilter, nextSector = sectorFilter) {
    setError('')
    setIsLoading(true)

    try {
      const [overviewData, submissionsData] = await Promise.all([
        getAdminOverview(),
        getAdminSubmissions({
          limit: 30,
          protocol: nextProtocol || undefined,
          sector: nextSector || undefined,
        }),
      ])

      setOverview(overviewData)
      setSubmissions(submissionsData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os cadastros.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void loadData()
  }

  function handleClear() {
    setProtocolFilter('')
    setSectorFilter('')
    void loadData('', '')
  }

  const hasAnySubmission = submissions.length > 0
  const hasActiveFilters = Boolean(protocolFilter || sectorFilter)

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">{t('Cadastros')}</p>
          <h2>{t('Registros da base')}</h2>
          <p className="admin-page-subtitle">{t('Busca, consulta e abertura de ficha.')}</p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{t(error)}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Jovens')}</span>
          <strong>{overview?.totalYouth ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Profissionais')}</span>
          <strong>{overview?.totalProfessionals ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Instituições')}</span>
          <strong>{overview?.totalInstitutions ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Total')}</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Busca')}</p>
              <h2>{t('Buscar cadastros')}</h2>
            </div>
          </div>

          <form className="admin-filter-bar" onSubmit={handleSearch}>
            <label className="admin-filter-field">
              <span>{t('Protocolo')}</span>
              <input
                value={protocolFilter}
                onChange={(event) => setProtocolFilter(event.target.value)}
                placeholder="Ex.: SIB-ABC12345"
              />
            </label>

            <label className="admin-filter-field">
              <span>{t('Perfil')}</span>
              <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
                <option value="">{t('Todos')}</option>
                <option value="YOUTH">{t('Jovens')}</option>
                <option value="PROFESSIONAL">{t('Profissionais')}</option>
                <option value="INSTITUTION">{t('Instituições')}</option>
              </select>
            </label>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('Carregando...') : t('Buscar')}
            </Button>

            <Button type="button" variant="outline" onClick={handleClear}>
              {t('Limpar')}
            </Button>
          </form>

          {hasAnySubmission ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('Protocolo')}</th>
                    <th>{t('Perfil')}</th>
                    <th>{t('Nome')}</th>
                    <th>{t('E-mail')}</th>
                    <th>{t('Telefone')}</th>
                    <th>{t('Cidade')}</th>
                    <th>{t('UF')}</th>
                    <th>{t('Data')}</th>
                    <th>{t('Ações')}</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((item) => (
                    <tr key={item.protocol}>
                      <td>{item.protocol}</td>
                      <td>{t(formatSector(item.sector))}</td>
                      <td>{t(item.subjectName)}</td>
                      <td>{t(item.email || '-')}</td>
                      <td>{t(item.phone || '-')}</td>
                      <td>{t(item.city || '-')}</td>
                      <td>{t(item.state || '-')}</td>
                      <td>{formatBackendDateTime(item.submittedAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/painel-interno/cadastros/${item.protocol}`)}
                          >
                            {t('Ver ficha')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!hasAnySubmission && !isLoading && !hasActiveFilters ? (
            <AdminZeroState
              eyebrow="Cadastros"
              title="Nenhum protocolo entrou nesta base ainda"
              description="Assim que os formulários começarem a ser enviados, os protocolos aparecem aqui para consulta individual, conferência e abertura de ficha."
              items={[
                'Jovens, profissionais e instituições entram nesta mesma base.',
                'Cada envio gera protocolo, ficha completa e data de recebimento.',
                'Os filtros passam a funcionar conforme os primeiros registros entram.',
              ]}
            />
          ) : null}

          {!hasAnySubmission && !isLoading && hasActiveFilters ? (
            <p className="admin-empty-state">{t('Nenhum cadastro encontrado para os filtros informados.')}</p>
          ) : null}
        </Card>
      </section>
    </div>
  )
}
